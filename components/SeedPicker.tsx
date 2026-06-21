"use client";

import { SEEDS } from "@/lib/toyModel";

type Props = {
  seedIndex: number;
  onChange: (index: number) => void;
  disabled?: boolean;
};

export default function SeedPicker({ seedIndex, onChange, disabled }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
        Starting phrase
      </span>
      <div className="flex flex-wrap gap-1.5">
        {SEEDS.map((seed, i) => (
          <button
            key={seed.label}
            onClick={() => onChange(i)}
            disabled={disabled}
            aria-pressed={seedIndex === i}
            className={`
              px-2.5 py-1 rounded-md font-mono text-xs transition-colors duration-150
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
              focus-visible:ring-offset-1 focus-visible:ring-offset-slate-950
              disabled:opacity-40 disabled:cursor-not-allowed
              ${seedIndex === i
                ? "bg-slate-700 text-slate-200 border border-slate-600"
                : "bg-slate-900 text-slate-500 border border-slate-800 hover:text-slate-300 hover:border-slate-700"
              }
            `}
          >
            {seed.label}
          </button>
        ))}
      </div>
    </div>
  );
}
