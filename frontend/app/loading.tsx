export default function Loading() {
  return (
    <div className="space-y-5">
      <div className="border-b border-slate-200 pb-4">
        <div className="h-7 w-48 rounded bg-slate-200" />
        <div className="mt-3 h-4 w-full max-w-xl rounded bg-slate-200" />
      </div>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div
            className="rounded-md border border-slate-200 bg-white p-4"
            key={item}
          >
            <div className="h-3 w-24 rounded bg-slate-200" />
            <div className="mt-3 h-7 w-16 rounded bg-slate-200" />
            <div className="mt-3 h-4 w-28 rounded bg-slate-200" />
          </div>
        ))}
      </section>

      <div className="rounded-md border border-slate-200 bg-white">
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <div className="border-b border-slate-100 px-4 py-4" key={item}>
            <div className="h-4 w-2/3 rounded bg-slate-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
