export function CartSkeleton() {
  return (
    <div className="animate-pulse space-y-4 px-4 py-4" aria-hidden>
      <div className="h-24 rounded-2xl bg-black/5" />
      <div className="h-14 rounded-2xl bg-black/5" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-28 rounded-2xl bg-black/5" />
      ))}
      <div className="h-40 rounded-2xl bg-black/5" />
    </div>
  );
}
