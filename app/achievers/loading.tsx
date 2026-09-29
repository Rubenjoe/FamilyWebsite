export default function AchieversLoading() {
  return (
    <div className="min-h-screen bg-[#fbf9f4] text-[#1b3622]" aria-label="Loading heritage registry">
      <div className="bg-[#1b3622] px-6 py-20 md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl space-y-5 animate-pulse">
          <div className="h-3 w-40 bg-white/20" />
          <div className="h-12 w-2/3 bg-white/20" />
          <div className="h-4 max-w-xl bg-white/20" />
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4 md:px-12 lg:px-20">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="aspect-[3/4] animate-pulse bg-white" />
        ))}
      </div>
    </div>
  );
}
