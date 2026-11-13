'use client';
import { RadioGroup } from '@ui-sdk/react/radio';
import { useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/button/index';
import { FieldError } from '@/components/ui/field/index';
import { Radio, RadioIndicator } from '@/components/ui/radio-group/index';
export interface Question {
  choices: { value: string; label: string }[];
  description?: string;
  name: string;
  prompt: string;
  required?: boolean;
}
export function Questionnaire({
  items,
  onSubmit,
  submitLabel = 'Submit answers',
}: {
  items: Question[];
  onSubmit: (values: Record<string, string>) => void | Promise<void>;
  submitLabel?: string;
}) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const id = useId();
  const question = items[step];
  function move(next: number) {
    setStep(next);
    setError('');
    requestAnimationFrame(() => heading.current?.focus());
  }
  async function advance(skip = false) {
    if (question === undefined || pending === true) {
      return;
    }
    if (!skip && question.required === true && (values[question.name] ?? '') === '') {
      setError('Choose an option to continue.');
      return;
    }
    if (step < items.length - 1) {
      move(step + 1);
      return;
    }
    setPending(true);
    try {
      await onSubmit(values);
      setError('');
    } catch {
      setError('Could not save answers. Try again.');
    }
    setPending(false);
  }
  if (!question) {
    return null;
  }
  return (
    <form action={() => advance()} aria-label="Questionnaire" className="flex flex-col gap-4">
      <p aria-live="polite" className="text-xs font-medium text-muted-foreground tabular-nums">
        Question {step + 1} of {items.length}
      </p>
      <h2 className="text-base font-medium outline-none" id={id} ref={heading} tabIndex={-1}>
        {question.prompt}
      </h2>
      {question.description ? <p className="text-sm text-muted-foreground">{question.description}</p> : null}
      <RadioGroup
        aria-labelledby={id}
        className="grid gap-2"
        onValueChange={(value, details) => {
          if (value === null) {
            details.cancel();
            return;
          }
          setValues({ ...values, [question.name]: value });
          setError('');
        }}
        value={values[question.name] ?? null}
      >
        {question.choices.map((choice) => (
          <Radio key={choice.value} value={choice.value} variant="choice">
            <span
              aria-hidden="true"
              className="flex size-4 shrink-0 items-center justify-center rounded-full border border-input"
            >
              <RadioIndicator />
            </span>
            <span>{choice.label}</span>
          </Radio>
        ))}
      </RadioGroup>
      {error === '' ? null : <FieldError role="alert">{error}</FieldError>}
      <div className="flex justify-end gap-2">
        {step > 0 ? (
          <Button className="mr-auto" disabled={pending} onClick={() => move(step - 1)} variant="outline">
            Previous
          </Button>
        ) : null}
        {question.required !== true && step < items.length - 1 ? (
          <Button disabled={pending} onClick={() => advance(true)} variant="outline">
            Skip
          </Button>
        ) : null}
        <Button isLoading={pending} type="submit">
          {step === items.length - 1 ? submitLabel : 'Next'}
        </Button>
      </div>
    </form>
  );
}
