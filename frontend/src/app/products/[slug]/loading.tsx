export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-8">
      <div className="mb-6 h-4 w-48 rounded bg-neutral-200" />
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="aspect-square rounded-2xl bg-neutral-200" />
        <div className="space-y-4">
          <div className="h-8 w-3/4 rounded bg-neutral-200" />
          <div className="h-4 w-full rounded bg-neutral-200" />
          <div className="h-4 w-2/3 rounded bg-neutral-200" />
          <div className="h-12 w-40 rounded-xl bg-neutral-200" />
        </div>
      </div>
    </div>
  );
}
