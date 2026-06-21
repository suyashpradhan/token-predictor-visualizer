"use client";

import { motion } from "framer-motion";
import type { Mode } from "@/lib/generatorMachine";

type Props = {
  mode: Mode;
  onChange: (mode: Mode) => void;
  disabled?: boolean;
};

export default function ModeToggle({ mode, onChange, disabled }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
        Selection mode
      </span>
      <div className="relative flex bg-slate-900 border border-slate-800 rounded-lg p-0.5 w-fit">
        {(["greedy", "sampling"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => onChange(m)}
            disabled={disabled}
            aria-pressed={mode === m}
            className={`
              relative z-10 px-3 py-1.5 rounded-md text-xs font-mono font-medium
              transition-colors duration-150 focus-visible:outline-none
              focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1
              focus-visible:ring-offset-slate-950 disabled:opacity-40 disabled:cursor-not-allowed
              ${mode === m ? "text-slate-100" : "text-slate-500 hover:text-slate-300"}
            `}
          >
            {/* Sliding pill behind active option */}
            {mode === m && (
              <motion.span
                layoutId="mode-pill"
                className={`
                  absolute inset-0 rounded-md
                  ${m === "greedy" ? "bg-violet-800/70" : "bg-amber-800/60"}
                `}
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
              />
            )}
            <span className="relative">{m}</span>
          </button>
        ))}
      </div>
      <p className="text-[10px] text-slate-600 max-w-[200px] leading-relaxed">
        {mode === "greedy"
          ? "Always picks the top candidate. Deterministic."
          : "Weighted-random draw. Same input, different output each time."}
      </p>
    </div>
  );
}
