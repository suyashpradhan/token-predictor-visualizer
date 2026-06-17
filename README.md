# Token Predictor Visualizer

A Next.js + TypeScript + Tailwind CSS app that visualizes how an LLM generates
text autoregressively, one token at a time, using a hardcoded fake probability
model. No API keys or external AI calls required.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## How it works

- `lib/fakeModel.ts` holds hand-authored token candidate sequences for three
  preset prompts, plus a seeded pseudo-random sampler (`generateFakeSequence`).
  Each "Replay" uses a new random seed, which can occasionally cause the
  sampler to pick a lower-probability candidate instead of the top one,
  demonstrating sampling vs. greedy decoding.
- `app/page.tsx` owns all state (selected prompt, precomputed steps, current
  step index, status) and drives the step-by-step reveal with `setTimeout`.
- Components in `components/` are presentational and receive derived state as
  props: `PromptInput`, `SentenceBuilder`, `CandidateList`, `CandidateBar`,
  `StepIndicator`, `Controls`.

## Accessibility

- `aria-live="polite"` on the sentence container announces new tokens.
- All interactive elements are keyboard-navigable with visible focus rings.
- Animations respect `prefers-reduced-motion` via Framer Motion's
  `useReducedMotion` hook.

## Build

```bash
npm run build
```
