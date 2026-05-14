import React from 'react';

export const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg ${className}`}></div>
);

export const DashboardSkeleton = () => (
  <div className="flex-1 flex flex-col gap-6 p-6">
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-10 w-32 rounded-xl" />
    </div>
    
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <Skeleton key={i} className="h-24 rounded-3xl" />
      ))}
    </div>

    <div className="flex-1 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
      <Skeleton className="h-8 w-full max-w-sm" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  </div>
);

export const StatusSkeleton = () => (
  <div className="w-full max-w-lg space-y-8">
    <div className="rounded-[40px] overflow-hidden shadow-xl border border-gray-100 dark:border-gray-800">
      <div className="h-40 bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
      <div className="p-8 space-y-6">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-16 w-32" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3 mx-auto" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-28 rounded-3xl" />
          <Skeleton className="h-28 rounded-3xl" />
        </div>
      </div>
    </div>
  </div>
);
