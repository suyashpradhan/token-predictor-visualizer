"use client";

import { useEffect, useState, useCallback } from "react";
import PromptInput from "@/components/PromptInput";
import SentenceBuilder from "@/components/SentenceBuilder";
import CandidateList from "@/components/CandidateList";
import StepIndicator from "@/components/StepIndicator";
import Controls from "@/components/Controls";
import { generateFakeSequence, getDefaultSeed, getRandomSeed, PRESET_PROMPTS } from "@/lib/fakeModel";
import type { GenerationStep, GenerationStatus } from "@/lib/types";

const STEP_INTERVAL_MS = 900;
const THINKING_DURATION_MS = 300;

export default function Home() {
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(PRESET_PROMPTS[0].id);
  const [steps, setSteps] = useState<GenerationStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [isThinking, setIsThinking] = useState(false);

  const selectedPreset = PRESET_PROMPTS.find((p) => p.id === selectedPromptId) ?? PRESET_PROMPTS[0];

  const loadPrompt = useCallback((presetId: string) => {
    const preset = PRESET_PROMPTS.find((p) => p.id === presetId);
    if (!preset) return;
    setSelectedPromptId(presetId);
    setSteps(generateFakeSequence(preset.prompt, getDefaultSeed()));
    setCurrentStepIndex(-1);
    setStatus("idle");
    setIsThinking(false);
  }, []);

  // Initialize the first preset's steps on mount.
  useEffect(() => {
    setSteps(generateFakeSequence(selectedPreset.prompt, getDefaultSeed()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerate = useCallback(() => {
    if (steps.length === 0) return;
    setCurrentStepIndex(-1);
    setStatus("generating");
  }, [steps.length]);

  const handleReplay = useCallback(() => {
    setSteps(generateFakeSequence(selectedPreset.prompt, getRandomSeed()));
    setCurrentStepIndex(-1);
    setStatus("generating");
  }, [selectedPreset.prompt]);

  // Advance through steps while generating: a brief "thinking" pause,
  // then reveal candidates for the next step.
  useEffect(() => {
    if (status !== "generating") return;

    if (currentStepIndex >= steps.length - 1) {
      setStatus("finished");
      setIsThinking(false);
      return;
    }

    setIsThinking(true);
    const thinkingTimer = setTimeout(() => {
      setIsThinking(false);
      setCurrentStepIndex((prev) => prev + 1);
    }, THINKING_DURATION_MS);

    return () => clearTimeout(thinkingTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, currentStepIndex, steps.length]);

  // Hold each revealed step on screen for STEP_INTERVAL_MS before
  // moving on to the next "thinking" phase.
  useEffect(() => {
    if (status !== "generating" || isThinking || currentStepIndex < 0) return;
    if (currentStepIndex >= steps.length - 1) return;

    const holdTimer = setTimeout(() => {
      setIsThinking(true);
    }, STEP_INTERVAL_MS - THINKING_DURATION_MS);

    return () => clearTimeout(holdTimer);
  }, [status, isThinking, currentStepIndex, steps.length]);

  // When the last step has just been revealed, finish after holding it.
  useEffect(() => {
    if (status !== "generating" || isThinking) return;
    if (currentStepIndex !== steps.length - 1 || steps.length === 0) return;

    const finishTimer = setTimeout(() => {
      setStatus("finished");
    }, STEP_INTERVAL_MS);

    return () => clearTimeout(finishTimer);
  }, [status, isThinking, currentStepIndex, steps.length]);

  const chosenTokens = steps
    .slice(0, currentStepIndex + 1)
    .map((step) => step.candidates[step.chosenIndex].token);

  const activeStep = currentStepIndex >= 0 && currentStepIndex < steps.length ? steps[currentStepIndex] : null;
  const showCandidatePanel = status !== "idle";

  return (
    <div className="min-h-screen bg-slate-900 px-4 py-8 sm:px-6 sm:py-12 md:py-16">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-slate-100 sm:text-3xl">Token Predictor Visualizer</h1>
          <p className="text-sm text-slate-400 sm:text-base">
            Watch a language model build a sentence one token at a time. Each step shows the candidate
            tokens it considered and the probability assigned to each.
          </p>
        </header>

        <PromptInput
          selectedPromptId={selectedPromptId}
          disabled={status === "generating"}
          onSelect={loadPrompt}
        />

        <SentenceBuilder prompt={selectedPreset.prompt} tokens={chosenTokens} />

        {showCandidatePanel && (
          <>
            <StepIndicator currentStep={Math.max(currentStepIndex + 1, 0)} totalSteps={steps.length} />
            <CandidateList step={activeStep} isThinking={isThinking} />
          </>
        )}

        <Controls
          canGenerate={steps.length > 0 && status !== "generating"}
          isGenerating={status === "generating"}
          isFinished={status === "finished"}
          onGenerate={handleGenerate}
          onReplay={handleReplay}
        />
      </div>
    </div>
  );
}
