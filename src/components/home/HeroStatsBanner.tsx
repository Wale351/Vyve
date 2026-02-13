import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

interface HeroStatsBannerProps {
  liveCount: number;
  viewerCount: number;
}

export default function HeroStatsBanner({ liveCount, viewerCount }: HeroStatsBannerProps) {
  return (
    <div className="border-b border-border/50">
      <div className="container px-4 py-2.5">
        <div className="flex items-center justify-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-destructive"></span>
            </span>
            <span className="font-medium">{liveCount}</span>
            <span className="text-muted-foreground">Live</span>
          </div>
          <div className="h-3 w-px bg-border" />
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="h-3 w-3" />
            <span className="font-medium text-foreground">{viewerCount.toLocaleString()}</span>
            <span className="hidden sm:inline">watching</span>
          </div>
        </div>
      </div>
    </div>
  );
}
