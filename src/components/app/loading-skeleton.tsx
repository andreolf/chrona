import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-slate-900/50 border-slate-800">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Skeleton className="h-4 w-24 bg-slate-800" />
                <Skeleton className="h-8 w-20 bg-slate-800" />
                <Skeleton className="h-3 w-32 bg-slate-800" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <Skeleton className="h-6 w-40 bg-slate-800" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full bg-slate-800" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48 bg-slate-800" />
                  <Skeleton className="h-3 w-32 bg-slate-800" />
                </div>
                <Skeleton className="h-6 w-20 bg-slate-800" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-slate-900/30 rounded-lg">
          <Skeleton className="h-10 w-10 rounded-full bg-slate-800" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48 bg-slate-800" />
            <Skeleton className="h-3 w-32 bg-slate-800" />
          </div>
          <Skeleton className="h-6 w-20 bg-slate-800" />
        </div>
      ))}
    </div>
  );
}
