"use client";

// GeneratorCanvas: owns the autoregressive state machine and the timed loop.
// The loop: idle → predicting (show candidates) → committing (animate chip)
//         → idle (append token, repeat) → done (stop token or max length reached)

import { useReducer, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { reducer, buildInitialState, pickGreedy, pickSampling } from "@/lib/generatorMachine";
import OutputStream from "./OutputStream";
import CandidateBars from "./CandidateBars";
import ModeToggle from "./ModeToggle";
import SeedPicker from "./SeedPicker";
import Controls from "./Controls";

const PREDICT_DWELL = 600;  // ms to show candidates before selecting

export default function GeneratorCanvas() {
  const [state, dispatch] = useReducer(reducer, buildInitialState(0));
  const loopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAutoRunRef = useRef(false);   // true during Generate (vs manual Step)

  const clearLoop = () => {
    if (loopRef.current) clearTimeout(loopRef.current);
  };

  // ── Core step: pick a token and schedule the commit ──────────────────────
  const doSelectToken = useCallback(() => {
    const token =
      state.mode === "greedy"
        ? pickGreedy(state.candidates)
        : pickSampling(state.candidates);
    dispatch({ type: "SELECT_TOKEN", token });
  }, [state.mode, state.candidates]);

  // ── State-machine transitions driven by status changes ───────────────────
  useEffect(() => {
    clearLoop();

    if (state.status === "predicting") {
      // Dwell on the candidate panel long enough for the user to read it,
      // then pick the winning token.
      loopRef.current = setTimeout(doSelectToken, PREDICT_DWELL);
    }

    if (state.status === "committing") {
      // Brief pause while the chip animates from panel → sequence, then commit.
      loopRef.current = setTimeout(() => {
        dispatch({ type: "COMMIT_TOKEN" });
      }, 350);
    }

    if (state.status === "idle" && isAutoRunRef.current) {
      // Auto-mode: immediately start the next prediction step.
      loopRef.current = setTimeout(() => {
        dispatch({ type: "START_PREDICT" });
      }, state.speed - PREDICT_DWELL - 350);
    }

    if (state.status === "done") {
      isAutoRunRef.current = false;
    }

    return clearLoop;
  }, [state.status, state.speed, doSelectToken]);

  // ── Control handlers ─────────────────────────────────────────────────────
  const handleGenerate = useCallback(() => {
    isAutoRunRef.current = true;
    dispatch({ type: "RESET" });
    // After reset the status is 'idle', which triggers the auto-loop above.
    // We need one extra tick so the reset state settles before the loop fires.
    loopRef.current = setTimeout(() => dispatch({ type: "START_PREDICT" }), 60);
  }, []);

  const handleStep = useCallback(() => {
    // Manual single step: no auto-loop.
    isAutoRunRef.current = false;
    if (state.status === "idle") {
      dispatch({ type: "START_PREDICT" });
    }
  }, [state.status]);

  const handleReset = useCallback(() => {
    isAutoRunRef.current = false;
    clearLoop();
    dispatch({ type: "RESET" });
  }, []);

  const isRunning = state.status === "predicting" || state.status === "committing";

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 flex flex-col gap-6">

      {/* ── Top controls bar ──────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-x-6 gap-y-4 items-start justify-between border-b border-slate-800 pb-5">
        <SeedPicker
          seedIndex={state.seedIndex}
          onChange={(i) => {
            isAutoRunRef.current = false;
            clearLoop();
            dispatch({ type: "SELECT_SEED", index: i });
          }}
          disabled={isRunning}
        />
        <ModeToggle
          mode={state.mode}
          onChange={(m) => dispatch({ type: "SET_MODE", mode: m })}
          disabled={isRunning}
        />
      </div>

      {/* ── Main canvas: output (left) + candidates (right) ───────────── */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6">

        {/* Left: growing sequence */}
        <div className="flex flex-col gap-4">
          <OutputStream
            sequence={state.sequence}
            pendingToken={state.pendingToken}
            status={state.status}
          />

          {/* Step-by-step explainer — updates with each phase */}
          <motion.div
            key={state.status}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800"
          >
            <PhaseExplainer status={state.status} sequenceLength={state.sequence.length} />
          </motion.div>
        </div>

        {/* Right: candidate distribution */}
        <div className="flex flex-col gap-4">
          <CandidateBars
            candidates={state.candidates}
            status={state.status}
            mode={state.mode}
            pendingToken={state.pendingToken}
          />
        </div>
      </div>

      {/* ── Bottom controls ────────────────────────────────────────────── */}
      <div className="border-t border-slate-800 pt-5">
        <Controls
          status={state.status}
          speed={state.speed}
          onGenerate={handleGenerate}
          onStep={handleStep}
          onReset={handleReset}
          onSpeedChange={(s) => dispatch({ type: "SET_SPEED", speed: s })}
        />
      </div>
    </div>
  );
}

// ── Inline phase explainer ───────────────────────────────────────────────────
// Teaches the autoregressive loop step-by-step as it runs.
type PhaseProps = { status: string; sequenceLength: number };

function PhaseExplainer({ status, sequenceLength }: PhaseProps) {
  const msgs: Record<string, { label: string; text: string }> = {
    idle:       { label: "ready",      text: "The model has read the full sequence so far and is ready to predict the next token." },
    predicting: { label: "predicting", text: `The model scores every token in its vocabulary. Shown here: the top 5 candidates with their probability weights. (Step ${sequenceLength + 1})` },
    committing: { label: "committing", text: "One token is selected and appended. The entire sequence — including this new token — will be the context for the next prediction." },
    done:       { label: "done",       text: "A stop token was reached or the maximum sequence length was hit. This is how generation ends in a real LLM." },
  };

  const m = msgs[status] ?? msgs.idle;

  return (
    <div className="flex gap-2 items-start">
      <span className={`
        mt-0.5 shrink-0 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider
        ${status === "predicting" ? "bg-amber-950 text-amber-400 border border-amber-800/50" :
          status === "committing" ? "bg-indigo-950 text-indigo-400 border border-indigo-800/50" :
          status === "done"       ? "bg-rose-950 text-rose-400 border border-rose-800/50" :
                                   "bg-slate-800 text-slate-500 border border-slate-700"}
      `}>
        {m.label}
      </span>
      <p className="text-xs text-slate-500 leading-relaxed">{m.text}</p>
    </div>
  );
}
