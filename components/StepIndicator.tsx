"use client";

type StepIndicatorProps = {
  currentStep: number;
  totalSteps: number;
};

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  const clampedStep = Math.max(0, Math.min(currentStep, totalSteps));
  const percent = totalSteps === 0 ? 0 : Math.round((clampedStep / totalSteps) * 100);

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={totalSteps}
      aria-valuenow={clampedStep}
      aria-label="Generation progress"
      className="flex flex-col gap-1.5"
    >
      <span className="font-mono text-xs text-slate-400 sm:text-sm">
        Step {clampedStep} of {totalSteps}
      </span>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
        <div
          className="h-full rounded-full bg-amber-400 transition-all duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
