import { Skeleton } from '@/components/ui/skeleton';

const ProfileSkeleton = () => (
  <div className="glass-card p-4 md:p-8 mb-6 md:mb-8">
    <div className="flex flex-col items-center text-center md:flex-row md:items-start md:text-left gap-4 md:gap-8">
      {/* Avatar skeleton */}
      <Skeleton className="w-24 h-24 md:w-32 md:h-32 rounded-full" />
      
      {/* Info skeleton */}
      <div className="flex-1 w-full space-y-4">
        <div className="flex items-center gap-2 justify-center md:justify-start">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-20" />
        </div>
        
        <Skeleton className="h-4 w-32 mx-auto md:mx-0" />
        
        <Skeleton className="h-4 w-24 mx-auto md:mx-0" />
        
        <Skeleton className="h-16 w-full max-w-2xl" />
        
        {/* Stats skeleton */}
        <div className="flex gap-4 md:gap-6 mt-4 md:mt-6 justify-center md:justify-start">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div>
                <Skeleton className="h-4 w-8 mb-1" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default ProfileSkeleton;
