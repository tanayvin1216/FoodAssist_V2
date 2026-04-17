import { Skeleton } from '@/components/ui/skeleton';

export default function VolunteersLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-11 w-36" />
      </div>

      {/* Filter row skeleton */}
      <div className="flex gap-4">
        <Skeleton className="h-10 w-56" />
      </div>

      {/* Table skeleton */}
      <div
        className="rounded-lg border overflow-hidden"
        style={{ borderColor: '#C4B8AD' }}
      >
        {/* Table header */}
        <div
          className="grid grid-cols-6 gap-4 px-4 py-3 border-b"
          style={{ borderColor: '#C4B8AD', backgroundColor: '#F5F0EB' }}
        >
          {['Title', 'Organization', 'Posted', 'Active', 'Needed By', 'Actions'].map(
            (col) => (
              <Skeleton key={col} className="h-4 w-full max-w-[100px]" />
            )
          )}
        </div>

        {/* Table rows */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-6 gap-4 px-4 py-4 border-b last:border-b-0"
            style={{ borderColor: '#C4B8AD' }}
          >
            <Skeleton className="h-4 w-full max-w-[140px]" />
            <Skeleton className="h-4 w-full max-w-[120px]" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-12 rounded" />
            <Skeleton className="h-4 w-24" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
