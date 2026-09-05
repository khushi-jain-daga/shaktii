interface ComingSoonPageProps {
  title: string;
  description: string;
}

export default function ComingSoonPage({ title, description }: ComingSoonPageProps) {
  return (
    <section className="max-w-5xl">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.22em] text-emerald-400">SHAKTII Module</p>
        <h1 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm md:text-base leading-6 text-white/55">{description}</p>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/[0.025] p-6">
        <p className="text-sm text-white/65">
          This route is now part of the real application shell. Backend data integration for this module is being moved into the Node.js API layer.
        </p>
      </div>
    </section>
  );
}
