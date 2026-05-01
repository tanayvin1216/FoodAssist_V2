import { BarChart3, Eye, Users, TrendingUp, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import { getAnalyticsSummary } from '@/lib/supabase/queries';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatDayLabel(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  return DAY_LABELS[d.getUTCDay()];
}

function formatShortDate(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
}

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();
  const summary = await getAnalyticsSummary(supabase);

  const peakDailyViews = Math.max(1, ...summary.dailyViews.map((d) => d.views));

  return (
    <div className="space-y-8">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "'DM Serif Display', serif", color: '#1B2D3A' }}
        >
          Page Analytics
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#8C7E72' }}>
          First-party traffic for the public directory. Tracks navigation across
          public pages only — admin and portal areas are excluded.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card style={{ backgroundColor: '#FFFFFF', borderColor: '#C4B8AD' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8C7E72' }}>
                  Page Views (30d)
                </p>
                <p className="text-3xl font-bold mt-1" style={{ color: '#1B2D3A' }}>
                  {summary.totalViewsLast30d.toLocaleString()}
                </p>
                <p className="text-xs mt-1" style={{ color: '#8C7E72' }}>
                  {summary.totalViewsLast7d.toLocaleString()} in last 7 days
                </p>
              </div>
              <div
                className="h-12 w-12 rounded flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#E8F4F3' }}
              >
                <Eye className="h-6 w-6" style={{ color: '#0D7C8F' }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: '#FFFFFF', borderColor: '#C4B8AD' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8C7E72' }}>
                  Visitors (30d)
                </p>
                <p className="text-3xl font-bold mt-1" style={{ color: '#1B2D3A' }}>
                  {summary.uniqueSessionsLast30d.toLocaleString()}
                </p>
                <p className="text-xs mt-1" style={{ color: '#8C7E72' }}>
                  {summary.uniqueSessionsLast7d.toLocaleString()} in last 7 days
                </p>
              </div>
              <div
                className="h-12 w-12 rounded flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#E8F4F3' }}
              >
                <Users className="h-6 w-6" style={{ color: '#0D7C8F' }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: '#FFFFFF', borderColor: '#C4B8AD' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8C7E72' }}>
                  Views per Visitor
                </p>
                <p className="text-3xl font-bold mt-1" style={{ color: '#1B2D3A' }}>
                  {summary.uniqueSessionsLast30d > 0
                    ? (summary.totalViewsLast30d / summary.uniqueSessionsLast30d).toFixed(1)
                    : '0.0'}
                </p>
                <p className="text-xs mt-1" style={{ color: '#8C7E72' }}>
                  avg pages per session
                </p>
              </div>
              <div
                className="h-12 w-12 rounded flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#E8F4F3' }}
              >
                <TrendingUp className="h-6 w-6" style={{ color: '#0D7C8F' }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: '#FFFFFF', borderColor: '#C4B8AD' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-3">
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8C7E72' }}>
                  Top Page (30d)
                </p>
                <p
                  className="text-base font-bold mt-1 truncate"
                  style={{ color: '#1B2D3A' }}
                  title={summary.topPages[0]?.path ?? ''}
                >
                  {summary.topPages[0]?.path ?? '—'}
                </p>
                <p className="text-xs mt-1" style={{ color: '#8C7E72' }}>
                  {summary.topPages[0]?.views.toLocaleString() ?? 0} views
                </p>
              </div>
              <div
                className="h-12 w-12 rounded flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#E8F4F3' }}
              >
                <BarChart3 className="h-6 w-6" style={{ color: '#0D7C8F' }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily chart */}
      <Card style={{ backgroundColor: '#FFFFFF', borderColor: '#C4B8AD' }}>
        <CardHeader>
          <CardTitle style={{ color: '#1B2D3A' }}>Last 14 Days</CardTitle>
        </CardHeader>
        <CardContent>
          {summary.dailyViews.every((d) => d.views === 0) ? (
            <p className="text-sm py-8 text-center" style={{ color: '#8C7E72' }}>
              No traffic recorded yet. Once visitors hit the public site, daily
              counts will appear here.
            </p>
          ) : (
            <div className="flex items-end gap-2 h-48">
              {summary.dailyViews.map((day) => {
                const heightPercent = (day.views / peakDailyViews) * 100;
                return (
                  <div
                    key={day.date}
                    className="flex-1 flex flex-col items-center justify-end gap-2 min-w-0"
                    title={`${day.date}: ${day.views} views, ${day.sessions} visitors`}
                  >
                    <span className="text-xs font-mono" style={{ color: '#1B2D3A' }}>
                      {day.views}
                    </span>
                    <div
                      className="w-full rounded-t"
                      style={{
                        height: `${Math.max(heightPercent, 2)}%`,
                        backgroundColor: '#0D7C8F',
                        opacity: day.views === 0 ? 0.15 : 1,
                      }}
                    />
                    <div className="flex flex-col items-center">
                      <span className="text-xs" style={{ color: '#8C7E72' }}>
                        {formatDayLabel(day.date)}
                      </span>
                      <span className="text-[10px]" style={{ color: '#C4B8AD' }}>
                        {formatShortDate(day.date)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top pages */}
        <Card style={{ backgroundColor: '#FFFFFF', borderColor: '#C4B8AD' }}>
          <CardHeader>
            <CardTitle style={{ color: '#1B2D3A' }}>Top Pages (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.topPages.length === 0 ? (
              <p className="text-sm py-4 text-center" style={{ color: '#8C7E72' }}>
                No page views recorded yet.
              </p>
            ) : (
              <ul className="divide-y" style={{ borderColor: '#C4B8AD' }}>
                {summary.topPages.map((page) => {
                  const widthPercent =
                    summary.topPages[0].views > 0
                      ? (page.views / summary.topPages[0].views) * 100
                      : 0;
                  return (
                    <li key={page.path} className="py-3">
                      <div className="flex items-center justify-between gap-4">
                        <span
                          className="text-sm truncate font-mono"
                          style={{ color: '#1B2D3A' }}
                          title={page.path}
                        >
                          {page.path}
                        </span>
                        <span
                          className="text-sm font-medium flex-shrink-0"
                          style={{ color: '#1B2D3A' }}
                        >
                          {page.views.toLocaleString()}
                        </span>
                      </div>
                      <div
                        className="w-full h-1.5 rounded-full overflow-hidden mt-2"
                        style={{ backgroundColor: '#E8F4F3' }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${widthPercent}%`,
                            backgroundColor: '#0D7C8F',
                          }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Referrers */}
        <Card style={{ backgroundColor: '#FFFFFF', borderColor: '#C4B8AD' }}>
          <CardHeader>
            <CardTitle style={{ color: '#1B2D3A' }}>Top Referrers (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.recentReferrers.length === 0 ? (
              <p className="text-sm py-4 text-center" style={{ color: '#8C7E72' }}>
                No referral traffic yet. Direct visits and untrackable sources
                won&apos;t appear here.
              </p>
            ) : (
              <ul className="divide-y" style={{ borderColor: '#C4B8AD' }}>
                {summary.recentReferrers.map((row) => (
                  <li
                    key={row.referrer}
                    className="py-3 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <ExternalLink
                        className="h-3.5 w-3.5 flex-shrink-0"
                        style={{ color: '#8C7E72' }}
                      />
                      <span
                        className="text-sm truncate"
                        style={{ color: '#1B2D3A' }}
                        title={row.referrer}
                      >
                        {row.referrer}
                      </span>
                    </div>
                    <span
                      className="text-sm font-medium flex-shrink-0"
                      style={{ color: '#1B2D3A' }}
                    >
                      {row.views.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <p className="text-xs" style={{ color: '#8C7E72' }}>
        Sessions reset when a visitor closes their browser tab. Bot traffic is
        filtered server-side. Authenticated areas (admin, portal) are never
        recorded.
      </p>
    </div>
  );
}
