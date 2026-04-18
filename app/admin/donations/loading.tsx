import { Card, CardContent, CardHeader } from '@/components/ui/card';

function Bone({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-[#C4B8AD]/40 ${className ?? ''}`}
    />
  );
}

export default function DonationsLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Bone className="h-8 w-48" />
          <Bone className="h-4 w-72" />
        </div>
        <Bone className="h-11 w-36" />
      </div>

      {/* Summary card skeletons */}
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Card key={i} style={{ borderColor: '#C4B8AD' }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Bone className="h-4 w-28" />
                  <Bone className="h-7 w-20" />
                </div>
                <Bone className="h-8 w-8" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table skeleton */}
      <Card style={{ borderColor: '#C4B8AD' }}>
        <CardHeader>
          <Bone className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <Bone key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
