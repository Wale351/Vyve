import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import StreamCard from '@/components/StreamCard';
import type { StreamWithProfile } from '@/hooks/useStreams';

interface PopularStreamsSectionProps {
  streams: StreamWithProfile[];
}

const fadeInUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

export default function PopularStreamsSection({ streams }: PopularStreamsSectionProps) {
  if (streams.length === 0) return null;

  return (
    <section className="py-5 md:py-8">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
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
      
      {/* Mobile: Horizontal scroll */}
      <div className="md:hidden -mx-4 px-4">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {streams.map((stream) => (
            <motion.div 
              key={stream.id} 
              variants={fadeInUp}
              className="flex-shrink-0 w-[280px]"
            >
              <StreamCard stream={stream} />
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Desktop: Grid */}
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {streams.map((stream) => (
          <motion.div key={stream.id} variants={fadeInUp}>
            <StreamCard stream={stream} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
