// Mock data for streams - in production this would come from a database
export interface Stream {
  id: string;
  title: string;
  streamerName: string;
  streamerAddress: string;
  thumbnailUrl: string;
  viewerCount: number;
  isLive: boolean;
  game: string;
  startedAt: Date;
  playbackId?: string;
  streamKey?: string;
}

export interface ChatMessage {
  id: string;
  senderAddress: string;
  senderName: string;
  message: string;
  timestamp: Date;
  isTip?: boolean;
  tipAmount?: string;
}

export interface StreamerProfile {
  address: string;
  name: string;
  bio: string;
  avatarUrl: string;
  totalTipsReceived: string;
  followerCount: number;
  pastStreams: Stream[];
  isStreamer: boolean;
}

// Mock live streams data
export const mockStreams: Stream[] = [
  {
    id: '1',
    title: 'Epic Ranked Grind - Road to Diamond!',
    streamerName: 'CryptoGamer',
    streamerAddress: '0x1234...5678',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80',
    viewerCount: 1247,
    isLive: true,
    game: 'League of Legends',
    startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: '2',
    title: 'First Look at New Update 🔥',
    streamerName: 'BaseBuilder',
    streamerAddress: '0xabcd...efgh',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80',
    viewerCount: 892,
    isLive: true,
    game: 'Valorant',
    startedAt: new Date(Date.now() - 45 * 60 * 1000),
  },
  {
    id: '3',
    title: 'Chill Vibes & Boss Fights',
    streamerName: 'NeonNinja',
    streamerAddress: '0x9876...4321',
    thumbnailUrl: 'https://images.unsplash.com/photo-1493711662062-fa541f7f0cf9?w=800&q=80',
    viewerCount: 456,
    isLive: true,
    game: 'Elden Ring',
    startedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },
  {
    id: '4',
    title: 'Speedrun Attempts - Sub 2 Hours?!',
    streamerName: 'SpeedDemon',
    streamerAddress: '0xdef0...1234',
    thumbnailUrl: 'https://images.unsplash.com/photo-1552820728-8b83bb6b2b94?w=800&q=80',
    viewerCount: 2103,
    isLive: true,
    game: 'Dark Souls III',
    startedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
  {
    id: '5',
    title: 'Building in Creative Mode',
    streamerName: 'PixelMaster',
    streamerAddress: '0x5555...6666',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&q=80',
    viewerCount: 334,
    isLive: true,
    game: 'Minecraft',
    startedAt: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: '6',
    title: 'Competitive 5-Stack with Viewers',
    streamerName: 'TeamCaptain',
    streamerAddress: '0x7777...8888',
    thumbnailUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80',
    viewerCount: 678,
    isLive: true,
    game: 'Counter-Strike 2',
    startedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
];

// Mock chat messages
export const mockChatMessages: ChatMessage[] = [
  {
    id: '1',
    senderAddress: '0x1111...2222',
    senderName: 'Viewer1',
    message: 'Great play!',
    timestamp: new Date(Date.now() - 5000),
  },
  {
    id: '2',
    senderAddress: '0x3333...4444',
    senderName: 'CryptoFan',
    message: 'Tipped 0.01 ETH! 🎉',
    timestamp: new Date(Date.now() - 3000),
    isTip: true,
    tipAmount: '0.01',
  },
  {
    id: '3',
    senderAddress: '0x5555...6666',
    senderName: 'GamerPro',
    message: 'What build are you using?',
    timestamp: new Date(Date.now() - 1000),
  },
];

// Mock streamer profile
export const mockStreamerProfile: StreamerProfile = {
  address: '0x1234567890abcdef1234567890abcdef12345678',
  name: 'CryptoGamer',
  bio: 'Professional gamer streaming on Base. Diamond rank player, NFT collector, and crypto enthusiast. Join the community!',
  avatarUrl: 'https://images.unsplash.com/photo-1566577134770-3d85bb3a9cc4?w=400&q=80',
  totalTipsReceived: '12.5',
  followerCount: 15420,
  pastStreams: mockStreams.slice(0, 3),
  isStreamer: true,
};

// Helper to format wallet address
export const formatAddress = (address: string): string => {
  if (!address) return '';
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Helper to format viewer count
export const formatViewerCount = (count: number): string => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

// Helper to format stream duration
export const formatDuration = (startedAt: Date): string => {
  const diff = Date.now() - startedAt.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};
