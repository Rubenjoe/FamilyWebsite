export default function ObituaryLoading() {
  return (
    <div className="min-h-screen bg-[#fbf9f4] px-6 py-20" aria-label="Loading remembrance directory">
      <div className="mx-auto max-w-4xl space-y-5 text-center animate-pulse">
        <div className="mx-auto h-4 w-48 bg-gray-200" />
        <div className="mx-auto h-12 max-w-xl bg-gray-200" />
        <div className="mx-auto h-4 max-w-lg bg-gray-200" />
      </div>
      <div className="mx-auto mt-16 grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="aspect-[3/4] animate-pulse bg-white" />
        ))}
      </div>
    </div>
  );
}
