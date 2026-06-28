export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl space-y-5 animate-pulse">
      <div className="h-28 rounded-3xl bg-black/10" />
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-black/5" />
        ))}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="h-48 rounded-2xl bg-black/5" />
        <div className="h-48 rounded-2xl bg-black/5" />
      </div>
    </div>
  );
}
