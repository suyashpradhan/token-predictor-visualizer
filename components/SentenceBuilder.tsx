"use client";

import { motion, useReducedMotion, AnimatePresence } from "framer-motion";

type SentenceBuilderProps = {
  prompt: string;
  tokens: string[];
};

export default function SentenceBuilder({ prompt, tokens }: SentenceBuilderProps) {
  const prefersReducedMotion = useReducedMotion();
  const lastIndex = tokens.length - 1;

  return (
    <div className="rounded-xl bg-slate-800 p-6 shadow-lg shadow-black/20 sm:p-8">
      <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-slate-400">
        Generated sentence
      </h2>
      <p
        aria-live="polite"
        className="font-mono text-xl leading-relaxed text-slate-100 sm:text-2xl md:text-3xl"
      >
        <span className="text-slate-400">{prompt}</span>
        <AnimatePresence initial={false}>
          {tokens.map((token, index) => {
            const isNewest = index === lastIndex;
            return (
              <motion.span
                key={`${index}-${token}`}
                layout={!prefersReducedMotion}
                initial={
                  isNewest
                    ? { backgroundColor: "rgba(251, 191, 36, 0.45)", opacity: prefersReducedMotion ? 0 : 1 }
                    : { opacity: 1 }
                }
                animate={{ backgroundColor: "rgba(251, 191, 36, 0)", opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="rounded px-0.5"
              >
                {token}
              </motion.span>
            );
          })}
        </AnimatePresence>
        <motion.span
          aria-hidden="true"
          className="ml-0.5 inline-block h-6 w-[2px] translate-y-1 bg-amber-400 sm:h-7 md:h-8"
          animate={prefersReducedMotion ? { opacity: 1 } : { opacity: [1, 1, 0, 0] }}
          transition={prefersReducedMotion ? undefined : { duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </p>
    </div>
  );
}
