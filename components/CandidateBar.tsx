"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Candidate } from "@/lib/types";

type CandidateBarProps = {
  candidate: Candidate;
  isChosen: boolean;
  isRevealed: boolean;
  delay: number;
};

export default function CandidateBar({ candidate, isChosen, isRevealed, delay }: CandidateBarProps) {
  const prefersReducedMotion = useReducedMotion();
  const widthPercent = Math.round(candidate.probability * 100);

  return (
    <motion.li
      role="listitem"
      initial={{ opacity: 0, width: prefersReducedMotion ? "100%" : "0%" }}
      animate={
        isRevealed
          ? {
              opacity: 1,
              width: "100%",
              scale: isChosen && !prefersReducedMotion ? [1, 1.08, 1] : 1,
            }
          : { opacity: 0 }
      }
      transition={{
        opacity: { duration: 0.3, delay },
        width: { duration: 0.3, delay },
        scale: { duration: 0.4, delay: delay + 0.3, ease: "easeInOut" },
      }}
      className="list-none"
    >
      <div
        className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors duration-300 sm:gap-4 ${
          isChosen && isRevealed
            ? "border-amber-400/70 bg-amber-400/10"
            : "border-slate-700 bg-slate-900/40"
        }`}
      >
        <span
          className={`w-20 flex-shrink-0 truncate font-mono text-sm sm:w-28 sm:text-base ${
            isChosen && isRevealed ? "text-amber-200" : "text-slate-200"
          }`}
          title={candidate.token}
        >
          {candidate.token.trim() === "" ? "·" : candidate.token}
        </span>

        <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-slate-700/60">
          <motion.div
            initial={{ width: "0%" }}
            animate={isRevealed ? { width: `${widthPercent}%` } : { width: "0%" }}
            transition={{ duration: 0.3, delay }}
            className={`h-full rounded-full ${
              isChosen && isRevealed ? "bg-amber-400" : "bg-slate-500"
            }`}
          />
        </div>

        <span
          className={`w-12 flex-shrink-0 text-right font-mono text-xs sm:text-sm ${
            isChosen && isRevealed ? "text-amber-200" : "text-slate-400"
          }`}
        >
          {widthPercent}%
        </span>
      </div>
    </motion.li>
  );
}
