import GeneratorCanvas from "@/components/GeneratorCanvas";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 px-4 py-4">
        <div className="max-w-5xl mx-auto flex flex-col gap-0.5">
          <h1 className="text-base font-semibold font-mono tracking-tight text-slate-100">
            Token-by-Token Generator
          </h1>
          <p className="text-xs text-slate-500">
            Watch a language model predict one token at a time — the autoregressive loop made visible.
          </p>
        </div>
      </header>

      {/* Canvas */}
      <GeneratorCanvas />
    </main>
  );
}
