export default function AdminDashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div>
        <div
          className="h-8 w-56 rounded animate-pulse"
          style={{ backgroundColor: '#C4B8AD' }}
        />
        <div
          className="h-4 w-80 rounded mt-2 animate-pulse"
          style={{ backgroundColor: '#E8F4F3' }}
        />
      </div>

      {/* Stat cards — matches 4-column grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border p-6"
            style={{ backgroundColor: '#FFFFFF', borderColor: '#C4B8AD' }}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div
                  className="h-3 w-28 rounded animate-pulse"
                  style={{ backgroundColor: '#E8F4F3' }}
                />
                <div
                  className="h-9 w-16 rounded animate-pulse"
                  style={{ backgroundColor: '#C4B8AD' }}
                />
                <div
                  className="h-3 w-20 rounded animate-pulse"
                  style={{ backgroundColor: '#E8F4F3' }}
                />
              </div>
              <div
                className="h-12 w-12 rounded flex-shrink-0 animate-pulse"
                style={{ backgroundColor: '#E8F4F3' }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Two-column section — matches Services + Recently Updated */}
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border p-6"
            style={{ backgroundColor: '#FFFFFF', borderColor: '#C4B8AD' }}
          >
            <div
              className="h-5 w-36 rounded mb-6 animate-pulse"
              style={{ backgroundColor: '#C4B8AD' }}
            />
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="flex items-center justify-between">
                  <div
                    className="h-3 w-32 rounded animate-pulse"
                    style={{ backgroundColor: '#E8F4F3' }}
                  />
                  <div
                    className="h-3 w-20 rounded animate-pulse"
                    style={{ backgroundColor: '#E8F4F3' }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions card */}
      <div
        className="rounded-lg border p-6"
        style={{ backgroundColor: '#FFFFFF', borderColor: '#C4B8AD' }}
      >
        <div
          className="h-5 w-32 rounded mb-4 animate-pulse"
          style={{ backgroundColor: '#C4B8AD' }}
        />
        <div className="flex flex-wrap gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-10 w-48 rounded animate-pulse"
              style={{ backgroundColor: '#E8F4F3' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
