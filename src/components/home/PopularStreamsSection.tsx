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
    <section className="py-4 md:py-6">
      <div className="flex items-center gap-2 mb-3">
        <Flame className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-medium">Popular Now</h2>
      </div>
      
      {/* Mobile: Horizontal scroll */}
      <div className="md:hidden -mx-4 px-4">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
          {streams.map((stream) => (
            <div key={stream.id} className="flex-shrink-0 w-[280px] snap-start">
              <StreamCard stream={stream} />
            </div>
          ))}
        </div>
      </div>
      
      {/* Desktop: Grid */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-3">
        {streams.map((stream) => (
          <div key={stream.id}>
            <StreamCard stream={stream} />
          </div>
        ))}
      </div>
    </section>
  );
}
