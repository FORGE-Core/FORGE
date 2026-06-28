export default function Loading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 w-44 rounded-xl bg-black/6" />
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-36 rounded-2xl bg-black/5" />
        ))}
      </div>
    </div>
  );
}
