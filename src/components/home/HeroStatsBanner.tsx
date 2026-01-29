import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

interface HeroStatsBannerProps {
  liveCount: number;
  viewerCount: number;
}

export default function HeroStatsBanner({ liveCount, viewerCount }: HeroStatsBannerProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="border-b border-border/10 glass-subtle"
    >
      <div className="container px-4 py-3 md:py-4">
        <div className="flex items-center justify-center gap-6 md:gap-8 text-xs md:text-sm">
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
            </span>
            <span className="font-semibold text-foreground">{liveCount}</span>
            <span className="text-muted-foreground hidden sm:inline">Live Now</span>
            <span className="text-muted-foreground sm:hidden">Live</span>
          </motion.div>
          <div className="h-4 w-px bg-border/50" />
          <motion.div 
            className="flex items-center gap-1.5 text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Users className="h-3.5 w-3.5" />
            <span className="font-medium text-foreground">{viewerCount.toLocaleString()}</span>
            <span className="hidden sm:inline">watching</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
