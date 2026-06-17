"use client";

import { motion, useReducedMotion } from "framer-motion";
import CandidateBar from "./CandidateBar";
import type { GenerationStep } from "@/lib/types";

type CandidateListProps = {
  step: GenerationStep | null;
  isThinking: boolean;
};

function ThinkingLoader() {
  const prefersReducedMotion = useReducedMotion();
  return (
    <div
      role="status"
      aria-label="Computing next token candidates"
      className="flex h-40 items-center justify-center gap-2"
    >
      {[0, 1, 2].map((dot) => (
        <motion.span
          key={dot}
          className="h-2.5 w-2.5 rounded-full bg-slate-500"
          animate={prefersReducedMotion ? { opacity: 0.6 } : { opacity: [0.3, 1, 0.3] }}
          transition={
            prefersReducedMotion
              ? undefined
              : { duration: 0.9, repeat: Infinity, delay: dot * 0.15, ease: "easeInOut" }
          }
        />
      ))}
    </div>
  );
}

export default function CandidateList({ step, isThinking }: CandidateListProps) {
  if (isThinking || !step) {
    return (
      <div className="rounded-xl bg-slate-800 p-6 shadow-lg shadow-black/20 sm:p-8">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-slate-400">
          Candidate tokens
        </h2>
        <ThinkingLoader />
      </div>
    );
  }

  const sorted = [...step.candidates]
    .map((candidate, originalIndex) => ({ candidate, originalIndex }))
    .sort((a, b) => b.candidate.probability - a.candidate.probability);

  return (
    <div className="rounded-xl bg-slate-800 p-6 shadow-lg shadow-black/20 sm:p-8">
      <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-slate-400">
        Candidate tokens
      </h2>
      <ul role="list" className="flex flex-col gap-2">
        {sorted.map(({ candidate, originalIndex }, displayIndex) => (
          <CandidateBar
            key={`${originalIndex}-${candidate.token}`}
            candidate={candidate}
            isChosen={originalIndex === step.chosenIndex}
            isRevealed={true}
            delay={displayIndex * 0.08}
          />
        ))}
      </ul>
    </div>
  );
}
