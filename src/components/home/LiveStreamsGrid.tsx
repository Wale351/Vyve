import { motion } from 'framer-motion';
import { Play, Radio, Zap, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import StreamCard from '@/components/StreamCard';
import type { StreamWithProfile } from '@/hooks/useStreams';

interface LiveStreamsGridProps {
  streams: StreamWithProfile[];
  isLoading: boolean;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 }
  }
};

export default function LiveStreamsGrid({ streams, isLoading }: LiveStreamsGridProps) {
  return (
    <div className="flex-1 min-w-0">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="flex items-center gap-2.5 mb-4 md:mb-6"
      >
        <div className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-gradient-to-br from-secondary/20 to-primary/20 border border-secondary/20">
          <Zap className="h-4 w-4 md:h-5 md:w-5 text-secondary" />
        </div>
        <div>
          <h2 className="font-display text-xl md:text-2xl font-bold">Live Streams</h2>
          <p className="text-[11px] md:text-sm text-muted-foreground">Discover content from creators</p>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 md:py-20">
          <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin text-primary" />
          <p className="mt-2 text-xs md:text-sm text-muted-foreground">Loading streams...</p>
        </div>
      ) : streams.length > 0 ? (
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4"
        >
          {streams.map((stream) => (
            <motion.div key={stream.id} variants={fadeInUp}>
              <StreamCard stream={stream} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12 md:py-16 bg-gradient-to-b from-card/80 to-card/40 rounded-xl md:rounded-2xl border border-border/30 mx-auto max-w-sm md:max-w-md"
        >
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4 md:mb-5">
            <Play className="h-5 w-5 md:h-7 md:w-7 text-muted-foreground" />
          </div>
          <h3 className="font-display text-lg md:text-xl font-bold mb-1.5 md:mb-2">No Live Streams</h3>
          <p className="text-xs md:text-sm text-muted-foreground mb-5 md:mb-6 px-4">
            Be the first to go live and start streaming!
          </p>
          <Link to="/go-live">
            <Button variant="premium" size="default" className="gap-2">
              <Radio className="h-4 w-4" />
              Start Streaming
            </Button>
          </Link>
        </motion.div>
      )}
    </div>
  );
}
