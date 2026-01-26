import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

interface HeroStatsBannerProps {
  liveCount: number;
  viewerCount: number;
}

export default function HeroStatsBanner({ liveCount, viewerCount }: HeroStatsBannerProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border-b border-border/10 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5"
    >
      <div className="container px-4 py-3 md:py-4">
        <div className="flex items-center justify-center gap-6 md:gap-8 text-xs md:text-sm">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
            </span>
            <span className="font-semibold text-foreground">{liveCount}</span>
            <span className="text-muted-foreground hidden sm:inline">Live Now</span>
            <span className="text-muted-foreground sm:hidden">Live</span>
          </div>
          <div className="h-4 w-px bg-border/50" />
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span className="font-medium text-foreground">{viewerCount.toLocaleString()}</span>
            <span className="hidden sm:inline">watching</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
