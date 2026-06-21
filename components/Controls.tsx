"use client";

type Props = {
  status: "idle" | "predicting" | "committing" | "done";
  speed: number;
  onGenerate: () => void;
  onStep: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
};

const SPEED_STEPS = [
  { label: "Fast",   value: 400 },
  { label: "Normal", value: 900 },
  { label: "Slow",  value: 1600 },
];

export default function Controls({
  status,
  speed,
  onGenerate,
  onStep,
  onReset,
  onSpeedChange,
}: Props) {
  const isRunning = status === "predicting" || status === "committing";
  const isDone = status === "done";

  return (
    <div className="flex flex-col gap-4">
      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onGenerate}
          disabled={isRunning}
          aria-label="Generate tokens automatically"
          className="
            px-4 py-2 rounded-lg text-sm font-medium font-mono
            bg-indigo-600 hover:bg-indigo-500 text-white
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-colors duration-150
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400
            focus-visible:ring-offset-1 focus-visible:ring-offset-slate-950
          "
        >
          {isRunning ? "Running…" : isDone ? "Generate again" : "Generate"}
        </button>

        <button
          onClick={onStep}
          disabled={isRunning || isDone}
          aria-label="Advance one token step"
          className="
            px-4 py-2 rounded-lg text-sm font-medium font-mono
            bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-colors duration-150
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400
            focus-visible:ring-offset-1 focus-visible:ring-offset-slate-950
          "
        >
          Step →
        </button>

        <button
          onClick={onReset}
          disabled={isRunning}
          aria-label="Reset to starting phrase"
          className="
            px-4 py-2 rounded-lg text-sm font-medium font-mono
            bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-colors duration-150
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500
            focus-visible:ring-offset-1 focus-visible:ring-offset-slate-950
          "
        >
          Reset
        </button>
      </div>

      {/* Speed control */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
          Speed
        </span>
        <div className="flex gap-1.5">
          {SPEED_STEPS.map((s) => (
            <button
              key={s.value}
              onClick={() => onSpeedChange(s.value)}
              aria-pressed={speed === s.value}
              className={`
                px-2.5 py-1 rounded text-xs font-mono transition-colors duration-150
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                focus-visible:ring-offset-1 focus-visible:ring-offset-slate-950
                ${speed === s.value
                  ? "bg-slate-700 text-slate-200 border border-slate-600"
                  : "bg-slate-900 text-slate-500 border border-slate-800 hover:text-slate-300"
                }
              `}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
