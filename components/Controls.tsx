"use client";

type ControlsProps = {
  canGenerate: boolean;
  isGenerating: boolean;
  isFinished: boolean;
  onGenerate: () => void;
  onReplay: () => void;
};

export default function Controls({
  canGenerate,
  isGenerating,
  isFinished,
  onGenerate,
  onReplay,
}: ControlsProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <button
        type="button"
        onClick={onGenerate}
        disabled={!canGenerate || isGenerating}
        aria-label="Generate sentence from the selected prompt"
        className="w-full rounded-lg bg-amber-400 px-5 py-2.5 font-medium text-slate-900 transition-colors duration-150 hover:bg-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 sm:w-auto"
      >
        {isGenerating ? "Generating…" : "Generate"}
      </button>
      <button
        type="button"
        onClick={onReplay}
        disabled={!isFinished}
        aria-label="Replay generation with a new random seed"
        className="w-full rounded-lg border border-slate-600 bg-slate-800 px-5 py-2.5 font-medium text-slate-200 transition-colors duration-150 hover:border-slate-500 hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
      >
        Replay
      </button>
    </div>
  );
}
