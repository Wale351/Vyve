import Header from "@/components/Header";
import ProfileGate from "@/components/ProfileGate";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import { useUserRole } from "@/hooks/useProfile";
import { useStreamerAnalytics } from "@/hooks/useStreamerAnalytics";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, BarChart3, Coins, Users, Timer } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { formatAddress, formatDuration } from "@/lib/formatters";

function formatEth(n: number) {
  if (!Number.isFinite(n)) return "0";
  if (n === 0) return "0";
  if (n < 0.0001) return "<0.0001";
  return n.toFixed(4);
}

function computeDurationLabel(startedAt: string | null, endedAt: string | null, isLive: boolean | null) {
  if (!startedAt) return "—";
  const start = new Date(startedAt);
  if (endedAt) {
    const end = new Date(endedAt);
    const diffMs = end.getTime() - start.getTime();
    const minutes = Math.max(0, Math.floor(diffMs / 60000));
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }
  if (isLive) return formatDuration(start);
  return "—";
}

export default function Analytics() {
  const { user } = useWalletAuth();
  const { data: role } = useUserRole(user?.id);
  const isStreamer = role === "streamer" || role === "admin";

  usePageMeta({
    title: "Streamer Analytics Dashboard | Vyve",
    description: "View viewer stats, tip history, and stream performance for your Vyve streams.",
    canonicalPath: "/analytics",
  });

  const analytics = useStreamerAnalytics(user?.id, { days: 14 });

  return (
    <div className="min-h-screen bg-background page-enter">
      <Header />
      
      {/* Spacer for fixed header */}
      <div className="h-14 md:h-16" />

      <main className="container px-4 py-6 md:py-10">
        <ProfileGate fallbackMessage="Connect your wallet and complete your profile to access analytics.">
          <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between mb-6">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                Streamer analytics
              </h1>
              <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
                Viewer stats are based on current stream viewer counts; tips are tracked historically.
              </p>
            </div>
          </header>

          {!isStreamer && (
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Analytics is for streamers</CardTitle>
                <CardDescription>
                  Become a streamer to unlock analytics, go live, and start earning tips.
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {isStreamer && (
            <section className="space-y-6">
              {analytics.isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {/* KPI cards */}
                  <section className="grid gap-4 md:grid-cols-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-display flex items-center gap-2">
                          <Coins className="h-4 w-4 text-primary" />
                          Total tips
                        </CardTitle>
                        <CardDescription>All time</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-display font-bold">{formatEth(analytics.data?.totalTipsEth ?? 0)} ETH</div>
                        <div className="text-xs text-muted-foreground mt-1">{analytics.data?.tipCount ?? 0} tips received</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-display flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary" />
                          Live viewers
                        </CardTitle>
                        <CardDescription>Right now</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-display font-bold">{analytics.data?.liveViewerTotal ?? 0}</div>
                        <div className="text-xs text-muted-foreground mt-1">Across all your live streams</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-display flex items-center gap-2">
                          <Timer className="h-4 w-4 text-primary" />
                          Streams
                        </CardTitle>
                        <CardDescription>Total created</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-display font-bold">{analytics.data?.streams.length ?? 0}</div>
                        <div className="text-xs text-muted-foreground mt-1">Including ended streams</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-display flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-primary" />
                          Tips (14d)
                        </CardTitle>
                        <CardDescription>Rolling window</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-display font-bold">
                          {formatEth((analytics.data?.tipsSeries ?? []).reduce((s, p) => s + p.totalEth, 0))} ETH
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Last 14 days</div>
                      </CardContent>
                    </Card>
                  </section>

                  {/* Tips chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-display">Tip history</CardTitle>
                      <CardDescription>ETH tipped to you over the last 14 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={{
                          totalEth: {
                            label: "Tips (ETH)",
                            color: "hsl(var(--primary))",
                          },
                        }}
                        className="w-full"
                      >
                        <ResponsiveContainer>
                          <AreaChart data={analytics.data?.tipsSeries ?? []} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
                            <defs>
                              <linearGradient id="fillTips" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-totalEth)" stopOpacity={0.35} />
                                <stop offset="95%" stopColor="var(--color-totalEth)" stopOpacity={0.02} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" tickMargin={8} />
                            <YAxis tickMargin={8} width={50} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Area
                              type="monotone"
                              dataKey="totalEth"
                              stroke="var(--color-totalEth)"
                              fill="url(#fillTips)"
                              strokeWidth={2}
                              dot={false}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Stream performance */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-display">Stream performance</CardTitle>
                      <CardDescription>Tips and viewer counts by stream</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-lg border border-border/50 overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Stream</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Viewers</TableHead>
                              <TableHead className="text-right">Tips</TableHead>
                              <TableHead className="text-right">Duration</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(analytics.data?.streams ?? []).map((s) => (
                              <TableRow key={s.id}>
                                <TableCell className="font-medium">
                                  <div className="line-clamp-1">{s.title}</div>
                                  <div className="text-xs text-muted-foreground">{s.id.slice(0, 8)}…</div>
                                </TableCell>
                                <TableCell className="capitalize">
                                  {s.ended_at ? "ended" : s.is_live ? "live" : "offline"}
                                </TableCell>
                                <TableCell className="text-right">{Number(s.viewer_count ?? 0)}</TableCell>
                                <TableCell className="text-right">{formatEth(s.totalTipsEth)} ETH</TableCell>
                                <TableCell className="text-right">
                                  {computeDurationLabel(s.started_at, s.ended_at, s.is_live)}
                                </TableCell>
                              </TableRow>
                            ))}
                            {(analytics.data?.streams ?? []).length === 0 && (
                              <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                                  No streams yet.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent tips */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-display">Recent tips</CardTitle>
                      <CardDescription>Most recent 25 tips you received</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-lg border border-border/50 overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>From</TableHead>
                              <TableHead>Stream</TableHead>
                              <TableHead className="text-right">Amount</TableHead>
                              <TableHead className="text-right">Time</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(analytics.data?.recentTips ?? []).map((t) => (
                              <TableRow key={t.id}>
                                <TableCell className="font-medium">
                                  {t.sender?.username || (t.from_wallet ? formatAddress(t.from_wallet) : "Anonymous")}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {t.stream?.title || "—"}
                                </TableCell>
                                <TableCell className="text-right">{formatEth(t.amount_eth)} ETH</TableCell>
                                <TableCell className="text-right text-muted-foreground">
                                  {new Date(t.created_at).toLocaleString()}
                                </TableCell>
                              </TableRow>
                            ))}
                            {(analytics.data?.recentTips ?? []).length === 0 && (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                                  No tips yet.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </section>
          )}
        </ProfileGate>
      </main>
    </div>
  );
}
