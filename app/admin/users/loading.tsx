// Inline skeleton — no external skeleton component required

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-[#E8E3DE] ${className ?? ''}`}
      aria-hidden="true"
    />
  );
}

export default function UsersLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading users">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <SkeletonBar className="h-7 w-48" />
          <SkeletonBar className="h-4 w-72" />
        </div>
        <SkeletonBar className="h-10 w-32" />
      </div>

      {/* Stats skeleton */}
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-lg border border-[#C4B8AD] bg-white p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <SkeletonBar className="h-4 w-24" />
                <SkeletonBar className="h-8 w-12" />
              </div>
              <SkeletonBar className="h-8 w-8 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="rounded-lg border border-[#C4B8AD] bg-white">
        <div className="px-6 py-4 border-b border-[#C4B8AD]">
          <SkeletonBar className="h-5 w-24" />
        </div>
        <div className="p-6 space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <SkeletonBar className="h-4 w-32" />
              <SkeletonBar className="h-4 w-48" />
              <SkeletonBar className="h-6 w-24 rounded" />
              <SkeletonBar className="h-4 w-40" />
              <SkeletonBar className="h-4 w-24" />
              <SkeletonBar className="h-8 w-16 ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
