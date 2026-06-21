"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { STOP_TOKEN } from "@/lib/toyModel";

type Props = {
  sequence: string[];
  pendingToken: string | null;
  status: "idle" | "predicting" | "committing" | "done";
};

export default function OutputStream({ sequence, pendingToken, status }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Sequence
        </span>
        <span className="text-xs text-slate-600">
          {sequence.length} token{sequence.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div
        className="min-h-[80px] flex flex-wrap gap-2 items-start content-start"
        aria-label="Generated token sequence"
        aria-live="polite"
      >
        <AnimatePresence initial={false}>
          {sequence.map((token, i) => {
            const isStop = token === STOP_TOKEN;
            const isSeed = i < sequence.length - (status === "done" ? 0 : 1);
            const isNewest = i === sequence.length - 1;

            return (
              <motion.span
                key={`${i}-${token}`}
                layoutId={isNewest && status === "committing" ? `pending-${token}` : undefined}
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: reduceMotion ? 0 : -8, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={`
                  inline-block px-2.5 py-1 rounded font-mono text-sm font-medium select-none
                  ${isStop
                    ? "bg-rose-950/60 text-rose-400 border border-rose-800/50"
                    : isSeed && i < STOP_TOKEN.length
                    ? "bg-slate-800 text-slate-400 border border-slate-700/50"
                    : "bg-indigo-950/70 text-indigo-200 border border-indigo-700/40"
                  }
                `}
              >
                {token}
              </motion.span>
            );
          })}
        </AnimatePresence>

        {/* Ghost of the pending token flying in from the candidate panel */}
        {status === "committing" && pendingToken && (
          <motion.span
            layoutId={`pending-${pendingToken}`}
            className="inline-block px-2.5 py-1 rounded font-mono text-sm font-medium bg-indigo-600/30 text-indigo-200 border border-indigo-500/50"
          />
        )}

        {/* Blinking cursor while predicting */}
        {(status === "predicting" || status === "idle") && (
          <motion.span
            animate={reduceMotion ? {} : { opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
            className="inline-block w-2 h-5 bg-indigo-500 rounded-sm self-center"
            aria-hidden
          />
        )}

        {status === "done" && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-slate-600 self-center ml-1 font-mono"
          >
            ← complete
          </motion.span>
        )}
      </div>
    </div>
  );
}
