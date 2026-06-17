import type { Candidate, GenerationStep, PresetPrompt } from "./types";

/**
 * Deterministic pseudo-random number generator (mulberry32).
 * Same seed always produces the same sequence, so we can reproduce
 * a generation run, but different seeds can land on different
 * (lower-probability) candidates -- that's what "Replay" demonstrates.
 */
function createRng(seed: number) {
  let state = seed >>> 0;
  return function next(): number {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Given a list of candidates with probabilities that sum to ~1,
 * sample one using the rng. Higher probability candidates are
 * proportionally more likely to be picked, mirroring how a real
 * model samples from its output distribution rather than always
 * taking the argmax.
 */
function sampleIndex(candidates: Candidate[], rng: () => number): number {
  const roll = rng();
  let cumulative = 0;
  for (let i = 0; i < candidates.length; i++) {
    cumulative += candidates[i].probability;
    if (roll <= cumulative) return i;
  }
  return candidates.length - 1;
}

// Each preset is a hand-authored chain of steps. Every step lists the
// candidates the "model" considered for that position, in descending
// probability order, summing to ~1. The token actually used to build
// the next step's context is whichever index gets sampled at runtime.
const PRESET_CHAINS: Record<string, GenerationStep[]> = {
  weather: [
    {
      candidates: [
        { token: " sunny", probability: 0.42 },
        { token: " cloudy", probability: 0.27 },
        { token: " perfect", probability: 0.15 },
        { token: " warm", probability: 0.1 },
        { token: " cold", probability: 0.06 },
      ],
      chosenIndex: 0,
    },
    {
      candidates: [
        { token: " and", probability: 0.48 },
        { token: ",", probability: 0.22 },
        { token: " with", probability: 0.16 },
        { token: " but", probability: 0.09 },
        { token: " for", probability: 0.05 },
      ],
      chosenIndex: 0,
    },
    {
      candidates: [
        { token: " warm", probability: 0.39 },
        { token: " breezy", probability: 0.24 },
        { token: " mild", probability: 0.18 },
        { token: " calm", probability: 0.12 },
        { token: " bright", probability: 0.07 },
      ],
      chosenIndex: 0,
    },
    {
      candidates: [
        { token: ",", probability: 0.51 },
        { token: " all", probability: 0.2 },
        { token: " in", probability: 0.15 },
        { token: " through", probability: 0.09 },
        { token: " out", probability: 0.05 },
      ],
      chosenIndex: 0,
    },
    {
      candidates: [
        { token: " perfect", probability: 0.36 },
        { token: " great", probability: 0.28 },
        { token: " ideal", probability: 0.17 },
        { token: " nice", probability: 0.12 },
        { token: " good", probability: 0.07 },
      ],
      chosenIndex: 0,
    },
    {
      candidates: [
        { token: " for", probability: 0.58 },
        { token: " weather", probability: 0.19 },
        { token: " conditions", probability: 0.13 },
        { token: " timing", probability: 0.06 },
        { token: " skies", probability: 0.04 },
      ],
      chosenIndex: 0,
    },
    {
      candidates: [
        { token: " a", probability: 0.44 },
        { token: " an", probability: 0.21 },
        { token: " the", probability: 0.18 },
        { token: " your", probability: 0.1 },
        { token: " any", probability: 0.07 },
      ],
      chosenIndex: 0,
    },
    {
      candidates: [
        { token: " walk", probability: 0.31 },
        { token: " run", probability: 0.27 },
        { token: " picnic", probability: 0.19 },
        { token: " hike", probability: 0.14 },
        { token: " drive", probability: 0.09 },
      ],
      chosenIndex: 0,
    },
    {
      candidates: [
        { token: " outside", probability: 0.46 },
        { token: " today", probability: 0.25 },
        { token: " later", probability: 0.15 },
        { token: " this", probability: 0.09 },
        { token: " soon", probability: 0.05 },
      ],
      chosenIndex: 0,
    },
    {
      candidates: [
        { token: ".", probability: 0.71 },
        { token: " afternoon", probability: 0.13 },
        { token: " park", probability: 0.09 },
        { token: " evening", probability: 0.05 },
        { token: " trail", probability: 0.02 },
      ],
      chosenIndex: 0,
    },
  ],
  recipe: [
    {
      candidates: [
        { token: " best", probability: 0.4 },
        { token: " secret", probability: 0.24 },
        { token: " quickest", probability: 0.17 },
        { token: " easiest", probability: 0.12 },
        { token: " classic", probability: 0.07 },
      ],
      chosenIndex: 0,
    },
    {
      candidates: [
        { token: " way", probability: 0.45 },
        { token: " trick", probability: 0.23 },
        { token: " method", probability: 0.16 },
        { token: " recipe", probability: 0.1 },
        { token: " step", probability: 0.06 },
      ],
      chosenIndex: 0,
    },
    {
      candidates: [
        { token: " to", probability: 0.62 },
        { token: " for", probability: 0.21 },
        { token: " I", probability: 0.09 },
        { token: " involves", probability: 0.05 },
        { token: " is", probability: 0.03 },
      ],
      chosenIndex: 0,
    },
    {
      candidates: [
        { token: " make", probability: 0.4 },
        { token: " cook", probability: 0.26 },
        { token: " prepare", probability: 0.18 },
        { token: " bake", probability: 0.1 },
        { token: " season", probability: 0.06 },
      ],
      chosenIndex: 0,
    },
    {
      candidates: [
        { token: " pasta", probability: 0.33 },
        { token: " rice", probability: 0.26 },
        { token: " eggs", probability: 0.21 },
        { token: " soup", probability: 0.13 },
        { token: " bread", probability: 0.07 },
      ],
      chosenIndex: 0,
    },
    {
      candidates: [
        { token: " is", probability: 0.5 },
        { token: " starts", probability: 0.22 },
        { token: " involves", probability: 0.16 },
        { token: " needs", probability: 0.07 },
        { token: " requires", probability: 0.05 },
      ],
      chosenIndex: 0,
    },
    {
      candidates: [
        { token: " to", probability: 0.47 },
        { token: " salting", probability: 0.21 },
        { token: " using", probability: 0.17 },
        { token: " always", probability: 0.09 },
        { token: " simple", probability: 0.06 },
      ],
      chosenIndex: 0,
    },
    {
      candidates: [
        { token: " salt", probability: 0.38 },
        { token: " taste", probability: 0.25 },
        { token: " stir", probability: 0.18 },
        { token: " wait", probability: 0.12 },
        { token: " rest", probability: 0.07 },
      ],
      chosenIndex: 0,
    },
    {
      candidates: [
        { token: " the", probability: 0.49 },
        { token: " it", probability: 0.24 },
        { token: " generously", probability: 0.15 },
        { token: " early", probability: 0.08 },
        { token: " often", probability: 0.04 },
      ],
      chosenIndex: 0,
    },
    {
      candidates: [
        { token: " water", probability: 0.55 },
        { token: " dish", probability: 0.2 },
        { token: " pot", probability: 0.13 },
        { token: " mixture", probability: 0.08 },
        { token: " pan", probability: 0.04 },
      ],
      chosenIndex: 0,
    },
    {
      candidates: [
        { token: ".", probability: 0.74 },
        { token: " first", probability: 0.12 },
        { token: " well", probability: 0.08 },
        { token: " thoroughly", probability: 0.04 },
        { token: " properly", probability: 0.02 },
      ],
      chosenIndex: 0,
    },
  ],
  space: [
    {
      candidates: [
        { token: " closest", probability: 0.37 },
        { token: " nearest", probability: 0.26 },
        { token: " brightest", probability: 0.18 },
        { token: " largest", probability: 0.12 },
        { token: " coldest", probability: 0.07 },
      ],
      chosenIndex: 0,
    },
    {
      candidates: [
        { token: " star", probability: 0.44 },
        { token: " planet", probability: 0.26 },
        { token: " galaxy", probability: 0.16 },
        { token: " moon", probability: 0.09 },
        { token: " comet", probability: 0.05 },
      ],
      chosenIndex: 0,
    },
    {
      candidates: [
        { token: " to", probability: 0.58 },
        { token: " in", probability: 0.21 },
        { token: " besides", probability: 0.11 },
        { token: " near", probability: 0.06 },
        { token: " beyond", probability: 0.04 },
      ],
      chosenIndex: 0,
    },
    {
      candidates: [
        { token: " Earth", probability: 0.66 },
        { token: " us", probability: 0.17 },
        { token: " the", probability: 0.1 },
        { token: " our", probability: 0.05 },
        { token: " home", probability: 0.02 },
      ],
      chosenIndex: 0,
    },
    {
      candidates: [
        { token: " is", probability: 0.61 },
        { token: " sits", probability: 0.16 },
        { token: " lies", probability: 0.12 },
        { token: " burns", probability: 0.07 },
        { token: " shines", probability: 0.04 },
      ],
      chosenIndex: 0,
    },
    {
      candidates: [
        { token: " the", probability: 0.52 },
        { token: " a", probability: 0.24 },
        { token: " roughly", probability: 0.13 },
        { token: " about", probability: 0.07 },
        { token: " nearly", probability: 0.04 },
      ],
      chosenIndex: 0,
    },
    {
      candidates: [
        { token: " Sun", probability: 0.6 },
        { token: " Proxima", probability: 0.2 },
        { token: " sun", probability: 0.11 },
        { token: " Moon", probability: 0.06 },
        { token: " star", probability: 0.03 },
      ],
      chosenIndex: 0,
    },
    {
      candidates: [
        { token: ",", probability: 0.43 },
        { token: " itself", probability: 0.25 },
        { token: " at", probability: 0.17 },
        { token: " which", probability: 0.1 },
        { token: " burning", probability: 0.05 },
      ],
      chosenIndex: 0,
    },
    {
      candidates: [
        { token: " about", probability: 0.39 },
        { token: " roughly", probability: 0.27 },
        { token: " nearly", probability: 0.18 },
        { token: " just", probability: 0.1 },
        { token: " over", probability: 0.06 },
      ],
      chosenIndex: 0,
    },
    {
      candidates: [
        { token: " 150", probability: 0.34 },
        { token: " eight", probability: 0.29 },
        { token: " 93", probability: 0.2 },
        { token: " four", probability: 0.11 },
        { token: " ten", probability: 0.06 },
      ],
      chosenIndex: 0,
    },
    {
      candidates: [
        { token: " million", probability: 0.55 },
        { token: " light", probability: 0.23 },
        { token: " minutes", probability: 0.13 },
        { token: " thousand", probability: 0.06 },
        { token: " AU", probability: 0.03 },
      ],
      chosenIndex: 0,
    },
    {
      candidates: [
        { token: " kilometers", probability: 0.48 },
        { token: " miles", probability: 0.31 },
        { token: " away", probability: 0.13 },
        { token: " years", probability: 0.05 },
        { token: " km", probability: 0.03 },
      ],
      chosenIndex: 0,
    },
    {
      candidates: [
        { token: " away", probability: 0.69 },
        { token: ".", probability: 0.16 },
        { token: " distant", probability: 0.08 },
        { token: " out", probability: 0.04 },
        { token: " off", probability: 0.03 },
      ],
      chosenIndex: 0,
    },
    {
      candidates: [
        { token: ".", probability: 0.81 },
        { token: " from", probability: 0.09 },
        { token: " in", probability: 0.05 },
        { token: " on", probability: 0.03 },
        { token: " near", probability: 0.02 },
      ],
      chosenIndex: 0,
    },
  ],
};

export const PRESET_PROMPTS: PresetPrompt[] = [
  { id: "weather", label: "The weather today is", prompt: "The weather today is" },
  { id: "recipe", label: "The best way to", prompt: "The best way to" },
  { id: "space", label: "The closest star to", prompt: "The closest star to" },
];

/**
 * Generates a full fake autoregressive sequence for a given prompt.
 * Steps are pre-authored to stay grammatically coherent, but which
 * candidate gets marked as "chosen" at each step depends on the seed --
 * this is what lets Replay produce a slightly different sentence.
 */
export function generateFakeSequence(prompt: string, seed: number = 1): GenerationStep[] {
  const preset = PRESET_PROMPTS.find((p) => p.prompt === prompt);
  const chainKey = preset?.id ?? "weather";
  const baseChain = PRESET_CHAINS[chainKey] ?? PRESET_CHAINS.weather;
  const rng = createRng(seed);

  return baseChain.map((step) => ({
    candidates: step.candidates,
    chosenIndex: sampleIndex(step.candidates, rng),
  }));
}

export function getDefaultSeed(): number {
  return 1;
}

export function getRandomSeed(): number {
  return Math.floor(Math.random() * 1_000_000) + 1;
}
