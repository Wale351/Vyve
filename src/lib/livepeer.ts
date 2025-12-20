// Livepeer v4 uses composable primitives - no global client needed
// Player and Broadcast components are imported directly from subpaths
// API calls should be made from backend (edge functions) to protect API keys

export const LIVEPEER_STUDIO_URL = 'https://livepeer.studio/api';

// Helper to construct playback URLs
export const getPlaybackUrl = (playbackId: string): string => {
  return `https://livepeercdn.studio/hls/${playbackId}/index.m3u8`;
};

// Helper to construct RTMP ingest URL
export const getRtmpIngestUrl = (streamKey: string): string => {
  return `rtmp://rtmp.livepeer.studio/live/${streamKey}`;
};
