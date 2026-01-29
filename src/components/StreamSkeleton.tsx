import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

const StreamSkeleton = () => (
  <motion.div 
    className="stream-card"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    <div className="relative aspect-video overflow-hidden rounded-t-xl md:rounded-t-2xl">
      <Skeleton className="w-full h-full" />
    </div>
    <div className="p-3 md:p-4">
      <div className="flex items-start gap-2.5 md:gap-3">
        <Skeleton className="w-8 h-8 md:w-10 md:h-10 rounded-full flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  </motion.div>
);

export const StreamSkeletonGrid = ({ count = 4 }: { count?: number }) => (
  <div className="flex flex-col gap-4 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.05, duration: 0.3 }}
      >
        <StreamSkeleton />
      </motion.div>
    ))}
  </div>
);

export default StreamSkeleton;
