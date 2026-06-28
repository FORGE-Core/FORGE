export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 animate-pulse">
      <div className="h-10 w-36 rounded-xl bg-black/6" />
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-black/5" />
        ))}
      </div>
      <div className="h-40 rounded-2xl bg-black/5" />
      <div className="h-40 rounded-2xl bg-black/5" />
    </div>
  );
}
