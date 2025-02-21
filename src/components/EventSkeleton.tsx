import React from 'react';

export const EventSkeleton = React.memo(() => {
  return (
    <div className="rounded-[24px] overflow-hidden bg-white dark:bg-gray-800 shadow-lg animate-pulse">
      <div className="relative">
        <div className="w-full h-40 bg-gray-200 dark:bg-gray-700" />
        <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
      </div>
      <div className="p-3">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
        <div className="flex items-center mb-2">
          <div className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-700 mr-1" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-700 mr-1" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        </div>
      </div>
    </div>
  );
});

EventSkeleton.displayName = 'EventSkeleton';

export const FeaturedEventSkeleton = React.memo(() => {
  return (
    <div className="relative flex-shrink-0 w-80 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-lg animate-pulse">
      <div className="w-full h-48 bg-gray-200 dark:bg-gray-700" />
      <div className="absolute top-3 right-3">
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
      </div>
      <div className="p-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
        <div className="flex items-center mb-3">
          <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 mr-2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 mr-2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        </div>
      </div>
    </div>
  );
});

FeaturedEventSkeleton.displayName = 'FeaturedEventSkeleton';
