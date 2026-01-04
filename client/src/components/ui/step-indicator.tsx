import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export function StepIndicator({
  currentStep,
  totalSteps,
  className,
}: StepIndicatorProps) {
  return (
    <div className={cn("flex justify-center w-full mt-4", className)}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "w-3 h-3 rounded-full mx-1",
            index < currentStep
              ? "bg-white"
              : "bg-white/40"
          )}
        />
      ))}
    </div>
  );
}
