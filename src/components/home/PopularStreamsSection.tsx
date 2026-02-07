import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import StreamCard from '@/components/StreamCard';
import type { StreamWithProfile } from '@/hooks/useStreams';

interface PopularStreamsSectionProps {
  streams: StreamWithProfile[];
}

export default function PopularStreamsSection({ streams }: PopularStreamsSectionProps) {
  if (streams.length === 0) return null;

  return (
    <section className="py-5 md:py-8">
      <motion.div 
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-2.5 mb-4"
      >
        <div className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-gradient-to-br from-destructive/20 to-warning/20 border border-destructive/20">
          <Flame className="h-4 w-4 md:h-5 md:w-5 text-destructive" />
        </div>
        <div>
          <h2 className="font-display text-lg md:text-xl font-semibold">Popular Now</h2>
          <p className="text-[11px] md:text-xs text-muted-foreground">Most watched streams</p>
        </div>
      </motion.div>
      
      {/* Mobile: Horizontal scroll — no stagger, just fade in */}
      <div className="md:hidden -mx-4 px-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
        >
          {streams.map((stream) => (
            <div 
              key={stream.id} 
              className="flex-shrink-0 w-[280px] snap-start"
            >
              <StreamCard stream={stream} />
            </div>
          ))}
        </motion.div>
      </div>
      
      {/* Desktop: Grid with stagger */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {streams.map((stream) => (
          <div key={stream.id}>
            <StreamCard stream={stream} />
          </div>
        ))}
      </motion.div>
    </section>
  );
}
