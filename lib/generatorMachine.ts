// generatorMachine.ts
// useReducer-based state machine modeling the autoregressive loop.
// The `sequence` array IS the model's context — every new token appended
// here is exactly what gets "fed back in" to generate the next token.

import { Candidate, getCandidates, SEEDS, STOP_TOKEN, MAX_TOKENS } from "./toyModel";

export type Status = "idle" | "predicting" | "committing" | "done";
export type Mode = "greedy" | "sampling";

export type State = {
  status: Status;
  mode: Mode;
  sequence: string[];          // committed tokens so far — the growing context
  candidates: Candidate[];     // distribution for the CURRENT step
  pendingToken: string | null; // token selected but not yet appended (committing phase)
  speed: number;               // ms per step (lower = faster)
  seedIndex: number;
};

export type Action =
  | { type: "SELECT_SEED"; index: number }
  | { type: "SET_MODE"; mode: Mode }
  | { type: "SET_SPEED"; speed: number }
  | { type: "START_PREDICT" }           // begin showing candidates for next step
  | { type: "SELECT_TOKEN"; token: string } // pick a token, enter committing phase
  | { type: "COMMIT_TOKEN" }            // append pending token to sequence
  | { type: "DONE" }
  | { type: "RESET" };

function buildInitialSequence(seedIndex: number): string[] {
  return [...SEEDS[seedIndex].tokens];
}

export function buildInitialState(seedIndex = 0): State {
  const sequence = buildInitialSequence(seedIndex);
  return {
    status: "idle",
    mode: "greedy",
    sequence,
    candidates: getCandidates(sequence[sequence.length - 1]),
    pendingToken: null,
    speed: 900,
    seedIndex,
  };
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SELECT_SEED": {
      const sequence = buildInitialSequence(action.index);
      return {
        ...buildInitialState(action.index),
        mode: state.mode,
        speed: state.speed,
        seedIndex: action.index,
        sequence,
        candidates: getCandidates(sequence[sequence.length - 1]),
      };
    }

    case "SET_MODE":
      return { ...state, mode: action.mode };

    case "SET_SPEED":
      return { ...state, speed: action.speed };

    case "START_PREDICT": {
      // Re-read the full sequence context, look up next-token distribution.
      // In a real LLM: run the entire sequence through the transformer to get logits.
      const lastToken = state.sequence[state.sequence.length - 1];
      const candidates = getCandidates(lastToken);
      return { ...state, status: "predicting", candidates, pendingToken: null };
    }

    case "SELECT_TOKEN":
      return { ...state, status: "committing", pendingToken: action.token };

    case "COMMIT_TOKEN": {
      if (!state.pendingToken) return state;
      const newSequence = [...state.sequence, state.pendingToken];
      const isDone =
        state.pendingToken === STOP_TOKEN || newSequence.length >= MAX_TOKENS;
      return {
        ...state,
        status: isDone ? "done" : "idle",
        sequence: newSequence,
        pendingToken: null,
        // Pre-load candidates for the next step (so the panel isn't empty after commit)
        candidates: isDone
          ? state.candidates
          : getCandidates(state.pendingToken),
      };
    }

    case "DONE":
      return { ...state, status: "done" };

    case "RESET":
      return {
        ...buildInitialState(state.seedIndex),
        mode: state.mode,
        speed: state.speed,
      };

    default:
      return state;
  }
}

// ── Sampling helpers ────────────────────────────────────────────────────────

// Greedy: argmax — always pick the highest probability token.
export function pickGreedy(candidates: Candidate[]): string {
  return candidates.reduce((best, c) => (c.prob > best.prob ? c : best)).token;
}

// Weighted-random sampling: draw from the distribution.
// This is temperature=1 sampling — identical to what real LLMs do by default.
export function pickSampling(candidates: Candidate[]): string {
  const roll = Math.random();
  let cumulative = 0;
  for (const c of candidates) {
    cumulative += c.prob;
    if (roll < cumulative) return c.token;
  }
  return candidates[candidates.length - 1].token;
}
