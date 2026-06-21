"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import type { Candidate } from "@/lib/toyModel";
import type { Mode, Status } from "@/lib/generatorMachine";

type Props = {
  candidates: Candidate[];
  status: Status;
  mode: Mode;
  pendingToken: string | null;
};

export default function CandidateBars({ candidates, status, mode, pendingToken }: Props) {
  const reduceMotion = useReducedMotion();

  // Sampling scan: briefly highlight each bar in sequence before landing.
  // This conveys "the model is rolling the dice" rather than "always picking #1".
  const [scanIndex, setScanIndex] = useState<number | null>(null);

  useEffect(() => {
    if (mode !== "sampling" || status !== "predicting" || reduceMotion) {
      setScanIndex(null);
      return;
    }
    // Sweep through candidates 0→N→0, faster each cycle
    let i = 0;
    let direction = 1;
    let delay = 80;
    let steps = 0;
    const maxSteps = 12;

    const tick = () => {
      setScanIndex(i);
      i += direction;
      if (i >= candidates.length || i < 0) {
        direction *= -1;
        i += direction;
        delay = Math.max(40, delay - 8);
      }
      steps++;
      if (steps < maxSteps) {
        timer = setTimeout(tick, delay);
      } else {
        setScanIndex(null);
      }
    };

    let timer = setTimeout(tick, 100);
    return () => clearTimeout(timer);
  }, [status, mode, candidates.length, reduceMotion]);

  const isActive = status === "predicting" || status === "committing";
  const maxProb = Math.max(...candidates.map((c) => c.prob));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Candidates
        </span>
        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
          mode === "greedy"
            ? "bg-violet-950/60 text-violet-400 border border-violet-800/40"
            : "bg-amber-950/60 text-amber-400 border border-amber-800/40"
        }`}>
          {mode}
        </span>
      </div>

      <div className="flex flex-col gap-1.5" role="list" aria-label="Candidate tokens and probabilities">
        <AnimatePresence mode="popLayout">
          {candidates.slice(0, 5).map((c, idx) => {
            const isSelected = pendingToken === c.token;
            const isScanning = scanIndex === idx;
            const isTop = c.prob === maxProb;
            const widthPct = Math.round(c.prob * 100);

            return (
              <motion.div
                key={c.token}
                role="listitem"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: idx * 0.04, type: "spring", stiffness: 300, damping: 28 }}
                className={`
                  relative flex items-center gap-2 px-2 py-1.5 rounded-lg border transition-colors duration-150
                  ${isSelected
                    ? "border-indigo-500/70 bg-indigo-950/80"
                    : isScanning
                    ? "border-amber-500/60 bg-amber-950/40"
                    : mode === "greedy" && isTop && isActive
                    ? "border-violet-600/50 bg-violet-950/50"
                    : "border-slate-800 bg-slate-900/40"
                  }
                `}
              >
                {/* Token label */}
                <span className={`
                  w-24 shrink-0 font-mono text-xs truncate
                  ${isSelected ? "text-indigo-200" : isScanning ? "text-amber-300" : "text-slate-300"}
                `}>
                  {c.token}
                </span>

                {/* Probability bar track */}
                <div className="relative flex-1 h-5 bg-slate-800/60 rounded overflow-hidden">
                  <motion.div
                    className={`
                      absolute inset-y-0 left-0 rounded
                      ${isSelected
                        ? "bg-indigo-500/70"
                        : isScanning
                        ? "bg-amber-500/50"
                        : mode === "greedy" && isTop
                        ? "bg-violet-600/50"
                        : "bg-slate-600/50"
                      }
                    `}
                    initial={{ width: 0 }}
                    animate={isActive ? { width: `${widthPct}%` } : { width: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 180,
                      damping: 22,
                      delay: idx * 0.05,
                    }}
                  />
                  {/* Pulse glow on selected */}
                  {isSelected && !reduceMotion && (
                    <motion.div
                      className="absolute inset-0 bg-indigo-400/20 rounded"
                      animate={{ opacity: [0.4, 0, 0.4] }}
                      transition={{ duration: 0.5, repeat: 2 }}
                    />
                  )}
                </div>

                {/* Probability label */}
                <span className={`
                  w-8 text-right font-mono text-[11px] shrink-0
                  ${isSelected ? "text-indigo-300" : "text-slate-500"}
                `}>
                  {widthPct}%
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {!isActive && status !== "done" && (
        <p className="text-xs text-slate-600 mt-1 font-mono">
          — press Generate or Step to begin —
        </p>
      )}
    </div>
  );
}
