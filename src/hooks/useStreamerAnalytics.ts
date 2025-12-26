import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type TipsSeriesPoint = { day: string; totalEth: number };

export type StreamAnalyticsRow = {
  id: string;
  title: string;
  is_live: boolean | null;
  viewer_count: number | null;
  started_at: string | null;
  ended_at: string | null;
  totalTipsEth: number;
  tipCount: number;
};

export type StreamerAnalytics = {
  totalTipsEth: number;
  tipCount: number;
  tipsSeries: TipsSeriesPoint[];
  liveViewerTotal: number;
  streams: StreamAnalyticsRow[];
  recentTips: Array<{
    id: string;
    created_at: string;
    amount_eth: number;
    tx_hash: string;
    from_wallet: string | null;
    stream: { id: string; title: string } | null;
    sender: { id: string; username: string; avatar_url: string | null } | null;
  }>;
};

function toDayKey(d: Date) {
  // YYYY-MM-DD (UTC)
  const year = d.getUTCFullYear();
  const month = `${d.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${d.getUTCDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function useStreamerAnalytics(userId: string | undefined, options?: { days?: number }) {
  const days = options?.days ?? 14;

  return useQuery({
    queryKey: ["analytics", "streamer", userId, days],
    enabled: !!userId,
    queryFn: async (): Promise<StreamerAnalytics> => {
      if (!userId) {
        return {
          totalTipsEth: 0,
          tipCount: 0,
          tipsSeries: [],
          liveViewerTotal: 0,
          streams: [],
          recentTips: [],
        };
      }

      const since = new Date();
      since.setUTCDate(since.getUTCDate() - (days - 1));
      since.setUTCHours(0, 0, 0, 0);

      const [streamsRes, tipsRes] = await Promise.all([
        supabase
          .from("streams")
          .select("id,title,is_live,viewer_count,started_at,ended_at")
          .eq("streamer_id", userId)
          .order("started_at", { ascending: false }),
        supabase
          .from("tips")
          .select(
            `id, created_at, amount_eth, tx_hash, from_wallet, stream_id, sender_id,
             streams!tips_stream_id_fkey ( id, title ),
             profiles!tips_sender_id_fkey ( id, username, avatar_url )`
          )
          .eq("receiver_id", userId)
          .order("created_at", { ascending: false }),
      ]);

      if (streamsRes.error) throw streamsRes.error;
      if (tipsRes.error) throw tipsRes.error;

      const streams = (streamsRes.data ?? []) as Array<{
        id: string;
        title: string;
        is_live: boolean | null;
        viewer_count: number | null;
        started_at: string | null;
        ended_at: string | null;
      }>;

      const tips = (tipsRes.data ?? []) as Array<{
        id: string;
        created_at: string;
        amount_eth: any;
        tx_hash: string;
        from_wallet: string | null;
        streams: { id: string; title: string } | null;
        profiles: { id: string; username: string; avatar_url: string | null } | null;
      }>;

      const totalTipsEth = tips.reduce((sum, t) => sum + Number(t.amount_eth || 0), 0);
      const tipCount = tips.length;

      const liveViewerTotal = streams
        .filter((s) => s.is_live)
        .reduce((sum, s) => sum + Number(s.viewer_count || 0), 0);

      // Build per-stream tip totals
      const tipsByStreamId = new Map<string, { totalEth: number; count: number }>();
      for (const t of tips) {
        const streamId = t.streams?.id;
        if (!streamId) continue;
        const prev = tipsByStreamId.get(streamId) ?? { totalEth: 0, count: 0 };
        prev.totalEth += Number(t.amount_eth || 0);
        prev.count += 1;
        tipsByStreamId.set(streamId, prev);
      }

      const streamRows: StreamAnalyticsRow[] = streams.map((s) => {
        const tipAgg = tipsByStreamId.get(s.id) ?? { totalEth: 0, count: 0 };
        return {
          ...s,
          totalTipsEth: tipAgg.totalEth,
          tipCount: tipAgg.count,
        };
      });

      // Tips series (last N days)
      const dayBuckets = new Map<string, number>();
      for (let i = 0; i < days; i++) {
        const d = new Date(since);
        d.setUTCDate(since.getUTCDate() + i);
        dayBuckets.set(toDayKey(d), 0);
      }

      for (const t of tips) {
        const created = new Date(t.created_at);
        if (created < since) continue;
        const key = toDayKey(created);
        if (!dayBuckets.has(key)) continue;
        dayBuckets.set(key, (dayBuckets.get(key) ?? 0) + Number(t.amount_eth || 0));
      }

      const tipsSeries: TipsSeriesPoint[] = Array.from(dayBuckets.entries()).map(([day, totalEth]) => ({
        day,
        totalEth: Number(totalEth.toFixed(6)),
      }));

      const recentTips = tips.slice(0, 25).map((t) => ({
        id: t.id,
        created_at: t.created_at,
        amount_eth: Number(t.amount_eth || 0),
        tx_hash: t.tx_hash,
        from_wallet: t.from_wallet,
        stream: t.streams,
        sender: t.profiles,
      }));

      return {
        totalTipsEth,
        tipCount,
        tipsSeries,
        liveViewerTotal,
        streams: streamRows,
        recentTips,
      };
    },
  });
}
