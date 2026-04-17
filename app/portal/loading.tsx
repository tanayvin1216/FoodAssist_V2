export default function PortalLoading() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div>
        <div
          className="h-7 w-64 rounded animate-pulse"
          style={{ backgroundColor: '#C4B8AD' }}
        />
        <div
          className="h-4 w-80 rounded mt-2 animate-pulse"
          style={{ backgroundColor: '#E8F4F3' }}
        />
      </div>

      {/* Stat cards — 3-column */}
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border p-6"
            style={{ backgroundColor: '#FFFFFF', borderColor: '#C4B8AD' }}
          >
            <div
              className="h-3 w-28 rounded animate-pulse mb-2"
              style={{ backgroundColor: '#E8F4F3' }}
            />
            <div
              className="h-6 w-16 rounded animate-pulse"
              style={{ backgroundColor: '#C4B8AD' }}
            />
            <div
              className="h-8 w-8 rounded animate-pulse mt-3"
              style={{ backgroundColor: '#E8F4F3' }}
            />
          </div>
        ))}
      </div>

      {/* Two-column cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border p-6 space-y-4"
            style={{ backgroundColor: '#FFFFFF', borderColor: '#C4B8AD' }}
          >
            <div
              className="h-5 w-40 rounded animate-pulse"
              style={{ backgroundColor: '#C4B8AD' }}
            />
            <div className="space-y-2">
              <div
                className="h-3 w-full rounded animate-pulse"
                style={{ backgroundColor: '#E8F4F3' }}
              />
              <div
                className="h-3 w-3/4 rounded animate-pulse"
                style={{ backgroundColor: '#E8F4F3' }}
              />
            </div>
            <div
              className="h-9 w-32 rounded animate-pulse"
              style={{ backgroundColor: '#E8F4F3' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
