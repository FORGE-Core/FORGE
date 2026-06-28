export default function Loading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-9 w-40 rounded-xl bg-black/6" />
        <div className="h-9 w-32 rounded-xl bg-black/6" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 rounded-2xl bg-black/5" />
        ))}
      </div>
    </div>
  );
}
