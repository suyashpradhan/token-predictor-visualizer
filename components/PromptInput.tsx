"use client";

import { PRESET_PROMPTS } from "@/lib/fakeModel";

type PromptInputProps = {
  selectedPromptId: string | null;
  disabled: boolean;
  onSelect: (presetId: string) => void;
};

export default function PromptInput({ selectedPromptId, disabled, onSelect }: PromptInputProps) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xs font-medium uppercase tracking-wider text-slate-400">
        Choose a starting prompt
      </h2>
      <div className="flex flex-wrap gap-2">
        {PRESET_PROMPTS.map((preset) => {
          const isSelected = preset.id === selectedPromptId;
          return (
            <button
              key={preset.id}
              type="button"
              disabled={disabled}
              aria-label={`Select prompt: ${preset.label}`}
              aria-pressed={isSelected}
              onClick={() => onSelect(preset.id)}
              className={`rounded-lg border px-4 py-2 font-mono text-sm transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-40 ${
                isSelected
                  ? "border-amber-400/60 bg-amber-400/10 text-amber-200"
                  : "border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-700/60"
              }`}
            >
              &ldquo;{preset.label}&rdquo;
            </button>
          );
        })}
      </div>
    </div>
  );
}
