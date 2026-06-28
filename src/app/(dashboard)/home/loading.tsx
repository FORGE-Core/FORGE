export default function Loading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-32 rounded-3xl bg-black/6" />
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-black/5" />
        ))}
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="h-52 rounded-2xl bg-black/5" />
        <div className="h-52 rounded-2xl bg-black/5" />
      </div>
    </div>
  );
}
