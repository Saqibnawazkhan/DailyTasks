export function SkeletonTask() {
  return (
    <div className="flex items-start gap-3 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 animate-pulse">
      <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0 mt-0.5" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4" />
        <div className="h-3 bg-gray-100 dark:bg-gray-750 rounded-lg w-1/2" />
        <div className="flex gap-1.5 mt-1">
          <div className="h-5 w-14 bg-gray-100 dark:bg-gray-700 rounded-full" />
          <div className="h-5 w-10 bg-gray-100 dark:bg-gray-700 rounded-full" />
        </div>
      </div>
      <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-700" />
    </div>
  );
}

export function SkeletonTaskList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonTask key={i} />
      ))}
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="p-5 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse">
      <div className="w-8 h-8 rounded-xl bg-gray-200 dark:bg-gray-700 mb-3" />
      <div className="h-8 w-14 bg-gray-200 dark:bg-gray-700 rounded-lg mb-1" />
      <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  );
}
