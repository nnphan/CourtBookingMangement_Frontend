import React from 'react';

export const CustomerCourtStatusSkeleton: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col p-4 space-y-3 animate-pulse bg-white">
      <div className="h-8 bg-slate-200 rounded-md w-full" />
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-2 h-10">
            <div className="w-20 bg-slate-200 rounded-md shrink-0" />
            <div className="flex-1 bg-slate-100 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
};
