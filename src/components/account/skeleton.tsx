// Skeleton component that matches the form layout exactly
export function AccountSettingsSkeleton() {
  return (
    <div className={"flex flex-col flex-1 max-w-lg"}>
      <div className="flex flex-col gap-6">
        <div className="grid gap-2">
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          <div className="h-10 w-10 bg-muted animate-pulse rounded-full" />
        </div>

        <div className="flex gap-4">
          <div className="grid gap-1 w-full">
            <div className="h-4 w-20 bg-muted animate-pulse rounded" />
            <div className="h-10 bg-muted animate-pulse rounded" />
          </div>
          <div className="grid gap-1 w-full">
            <div className="h-4 w-20 bg-muted animate-pulse rounded" />
            <div className="h-10 bg-muted animate-pulse rounded" />
          </div>
        </div>

        <div className="grid gap-2">
          <div className="h-4 w-28 bg-muted animate-pulse rounded" />
          <div className="h-10 bg-muted animate-pulse rounded" />
        </div>

        <div className="flex gap-2">
          <div className="grid gap-2 flex-1">
            <div className="h-4 w-16 bg-muted animate-pulse rounded" />
            <div className="h-10 bg-muted animate-pulse rounded" />
          </div>
          <div className="grid gap-2 flex-1">
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
            <div className="h-10 bg-muted animate-pulse rounded" />
          </div>
        </div>

        <div className="grid gap-2">
          <div className="h-4 w-48 bg-muted animate-pulse rounded" />
          <div className="h-10 bg-muted animate-pulse rounded" />
        </div>

        <div className="grid gap-2">
          <div className="h-10 bg-muted animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
}
