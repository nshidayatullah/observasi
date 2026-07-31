import { cn } from '@/lib/utils';

export type FormStep = {
  label: string;
};

type FormStepperProps = {
  steps: FormStep[];
  currentStep: number;
};

export function FormStepper({ steps, currentStep }: FormStepperProps) {
  return (
    <nav aria-label="Langkah formulir" className="flex flex-col gap-1">
      <div className="flex gap-1.5" aria-hidden>
        {steps.map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-2 flex-1 rounded-sm border-2 border-ink-900',
              i <= currentStep ? 'bg-primary-500' : 'bg-ink-200',
            )}
          />
        ))}
      </div>
      <p className="text-label font-medium text-ink-700">
        Langkah {currentStep + 1} dari {steps.length}:{' '}
        <span className="text-ink-900">{steps[currentStep]?.label}</span>
      </p>
    </nav>
  );
}
