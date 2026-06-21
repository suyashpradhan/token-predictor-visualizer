// toyModel.ts
// A hard-coded "toy language model": a lookup table mapping the last committed token
// to an array of candidate next-tokens, each with a probability weight.
// Probabilities per entry sum to 1.0 (or very close — floating-point aside).
// This mirrors exactly what a real LLM does: given the full context, output a
// probability distribution over the vocabulary, then sample or argmax from it.

export type Candidate = {
  token: string;
  prob: number;
};

export type SeedPhrase = {
  label: string;       // display name in the picker
  tokens: string[];    // pre-seeded starting tokens (already "committed")
};

// The lookup table. Key = last token in the sequence.
// Special token "<end>" signals the model wants to stop.
const MODEL: Record<string, Candidate[]> = {
  // ── Seed: "The cat" ──────────────────────────────────────────────
  "cat": [
    { token: "sat",    prob: 0.42 },
    { token: "slept",  prob: 0.28 },
    { token: "ran",    prob: 0.18 },
    { token: "ate",    prob: 0.08 },
    { token: "meowed", prob: 0.04 },
  ],
  "sat": [
    { token: "on",      prob: 0.55 },
    { token: "quietly", prob: 0.22 },
    { token: "still",   prob: 0.13 },
    { token: "down",    prob: 0.07 },
    { token: "here",    prob: 0.03 },
  ],
  "on": [
    { token: "the",    prob: 0.68 },
    { token: "a",      prob: 0.18 },
    { token: "every",  prob: 0.08 },
    { token: "top",    prob: 0.04 },
    { token: "its",    prob: 0.02 },
  ],
  "the": [
    { token: "mat",   prob: 0.38 },
    { token: "floor", prob: 0.27 },
    { token: "chair", prob: 0.18 },
    { token: "roof",  prob: 0.11 },
    { token: "sky",   prob: 0.06 },
  ],
  "mat": [
    { token: ".",      prob: 0.52 },
    { token: "gently", prob: 0.24 },
    { token: "softly", prob: 0.14 },
    { token: "all",    prob: 0.06 },
    { token: "<end>",  prob: 0.04 },
  ],

  // ── Seed: "The sky" ──────────────────────────────────────────────
  "sky": [
    { token: "is",     prob: 0.48 },
    { token: "was",    prob: 0.28 },
    { token: "turned", prob: 0.13 },
    { token: "looks",  prob: 0.07 },
    { token: "glows",  prob: 0.04 },
  ],
  "is": [
    { token: "blue",    prob: 0.38 },
    { token: "clear",   prob: 0.26 },
    { token: "dark",    prob: 0.19 },
    { token: "bright",  prob: 0.11 },
    { token: "endless", prob: 0.06 },
  ],
  "blue": [
    { token: "and",     prob: 0.44 },
    { token: "today",   prob: 0.28 },
    { token: "above",   prob: 0.16 },
    { token: ".",       prob: 0.08 },
    { token: "<end>",   prob: 0.04 },
  ],
  "and": [
    { token: "calm",      prob: 0.37 },
    { token: "clear",     prob: 0.28 },
    { token: "beautiful", prob: 0.19 },
    { token: "still",     prob: 0.11 },
    { token: "cold",      prob: 0.05 },
  ],
  "calm": [
    { token: ".",      prob: 0.55 },
    { token: "today",  prob: 0.22 },
    { token: "always", prob: 0.12 },
    { token: "now",    prob: 0.07 },
    { token: "<end>",  prob: 0.04 },
  ],

  // ── Seed: "Neural networks" ──────────────────────────────────────
  "networks": [
    { token: "learn",     prob: 0.41 },
    { token: "process",   prob: 0.26 },
    { token: "transform", prob: 0.17 },
    { token: "predict",   prob: 0.10 },
    { token: "encode",    prob: 0.06 },
  ],
  "learn": [
    { token: "by",       prob: 0.48 },
    { token: "from",     prob: 0.31 },
    { token: "patterns", prob: 0.12 },
    { token: "quickly",  prob: 0.06 },
    { token: "well",     prob: 0.03 },
  ],
  "by": [
    { token: "example",    prob: 0.44 },
    { token: "adjusting",  prob: 0.27 },
    { token: "processing", prob: 0.16 },
    { token: "iterating",  prob: 0.09 },
    { token: "gradient",   prob: 0.04 },
  ],
  "example": [
    { token: ".",          prob: 0.48 },
    { token: "and",        prob: 0.24 },
    { token: "using",      prob: 0.14 },
    { token: "through",    prob: 0.09 },
    { token: "<end>",      prob: 0.05 },
  ],

  // ── Seed: "Once upon" ───────────────────────────────────────────
  "upon": [
    { token: "a",     prob: 0.79 },
    { token: "the",   prob: 0.11 },
    { token: "every", prob: 0.06 },
    { token: "each",  prob: 0.03 },
    { token: "some",  prob: 0.01 },
  ],
  "a": [
    { token: "time",    prob: 0.54 },
    { token: "land",    prob: 0.22 },
    { token: "kingdom", prob: 0.14 },
    { token: "forest",  prob: 0.07 },
    { token: "river",   prob: 0.03 },
  ],
  "time": [
    { token: ",",       prob: 0.42 },
    { token: "long",    prob: 0.28 },
    { token: "ago",     prob: 0.18 },
    { token: "passed",  prob: 0.08 },
    { token: "<end>",   prob: 0.04 },
  ],
  ",": [
    { token: "in",       prob: 0.38 },
    { token: "there",    prob: 0.33 },
    { token: "a",        prob: 0.16 },
    { token: "not",      prob: 0.09 },
    { token: "far",      prob: 0.04 },
  ],
  "in": [
    { token: "a",       prob: 0.46 },
    { token: "the",     prob: 0.34 },
    { token: "every",   prob: 0.10 },
    { token: "some",    prob: 0.06 },
    { token: "each",    prob: 0.04 },
  ],

  // ── Generic fallback tokens ──────────────────────────────────────
  ".": [
    { token: "<end>",   prob: 0.72 },
    { token: "The",     prob: 0.14 },
    { token: "And",     prob: 0.09 },
    { token: "It",      prob: 0.05 },
  ],
  "floor": [
    { token: ".",      prob: 0.54 },
    { token: "gently", prob: 0.24 },
    { token: "below",  prob: 0.13 },
    { token: "softly", prob: 0.06 },
    { token: "<end>",  prob: 0.03 },
  ],
  "today": [
    { token: ".",      prob: 0.58 },
    { token: "and",    prob: 0.22 },
    { token: "here",   prob: 0.12 },
    { token: "still",  prob: 0.05 },
    { token: "<end>",  prob: 0.03 },
  ],
};

// Fallback distribution when the last token isn't in the model —
// the model just... trails off (this happens in real LLMs too).
const FALLBACK: Candidate[] = [
  { token: "<end>",   prob: 0.55 },
  { token: ".",       prob: 0.25 },
  { token: "and",     prob: 0.12 },
  { token: "the",     prob: 0.05 },
  { token: "is",      prob: 0.03 },
];

// Given the last token in the current sequence, return the candidate distribution.
// This is the "forward pass" — in a real LLM, this would run the transformer.
export function getCandidates(lastToken: string): Candidate[] {
  return MODEL[lastToken] ?? FALLBACK;
}

export const SEEDS: SeedPhrase[] = [
  { label: "The cat…",         tokens: ["The", "cat"] },
  { label: "The sky…",         tokens: ["The", "sky"] },
  { label: "Neural networks…", tokens: ["Neural", "networks"] },
  { label: "Once upon…",       tokens: ["Once", "upon"] },
];

export const STOP_TOKEN = "<end>";
export const MAX_TOKENS = 20;
