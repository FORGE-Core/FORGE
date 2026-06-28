export default function Loading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-10 w-40 rounded-xl bg-black/6" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-black/5" />
        ))}
      </div>
      <div className="h-64 rounded-2xl bg-black/5" />
    </div>
  );
}
