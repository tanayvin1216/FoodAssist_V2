export default function OrganizationsLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-44 bg-shoreline/50 rounded animate-pulse" />
          <div className="h-4 w-64 bg-shoreline/30 rounded animate-pulse" />
        </div>
        <div className="h-10 w-40 bg-shoreline/40 rounded animate-pulse" />
      </div>

      {/* Search skeleton */}
      <div className="h-10 max-w-md bg-shoreline/30 rounded animate-pulse" />

      {/* Table skeleton */}
      <div className="bg-shell rounded-lg border border-shoreline overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-6 gap-4 px-4 py-3 border-b border-shoreline">
          {['Organization', 'Town', 'Phone', 'Status', 'Last Updated', ''].map((col) => (
            <div
              key={col}
              className="h-4 bg-shoreline/40 rounded animate-pulse"
              style={{ width: col ? '75%' : '24px' }}
            />
          ))}
        </div>

        {/* Body rows */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-6 gap-4 px-4 py-4 border-b border-shoreline last:border-0"
          >
            <div className="space-y-1.5">
              <div className="h-4 w-3/4 bg-shoreline/40 rounded animate-pulse" />
              <div className="h-3 w-full bg-shoreline/25 rounded animate-pulse" />
            </div>
            <div className="h-4 w-2/3 bg-shoreline/30 rounded animate-pulse self-center" />
            <div className="h-4 w-3/4 bg-shoreline/30 rounded animate-pulse self-center" />
            <div className="h-5 w-16 bg-seafoam/60 rounded animate-pulse self-center" />
            <div className="h-4 w-2/3 bg-shoreline/30 rounded animate-pulse self-center" />
            <div className="h-8 w-8 bg-shoreline/25 rounded animate-pulse self-center" />
          </div>
        ))}
      </div>
    </div>
  );
}
