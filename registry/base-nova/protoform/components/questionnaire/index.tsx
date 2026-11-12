'use client';
import { useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/button/index';
import { Field, FieldError, FieldLabel } from '@/components/ui/field/index';
import { Radio, RadioGroup } from '@/components/ui/radio-group/index';
export interface Question {
  choices: { value: string; label: string }[];
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
    } finally {
      setPending(false);
    }
  }
  if (!question) {
    return null;
  }
  return (
    <form action={() => advance()} aria-label="Questionnaire" className="flex flex-col gap-4">
      <p aria-live="polite">
        Question {step + 1} of {items.length}
      </p>
      <h2 id={id} ref={heading} tabIndex={-1}>
        {question.prompt}
      </h2>
      <RadioGroup
        aria-labelledby={id}
        onValueChange={(value) => {
          if (value !== null) {
            setValues({ ...values, [question.name]: value });
          }
          setError('');
        }}
        value={values[question.name] ?? null}
      >
        {question.choices.map((choice) => (
          <Field key={choice.value} orientation="horizontal">
            <Radio id={`${id}-${choice.value}`} value={choice.value} />
            <FieldLabel htmlFor={`${id}-${choice.value}`}>{choice.label}</FieldLabel>
          </Field>
        ))}
      </RadioGroup>
      {error === '' ? null : <FieldError role="alert">{error}</FieldError>}
      <div className="flex gap-2">
        <Button disabled={step === 0 || pending} onClick={() => move(step - 1)} variant="outline">
          Previous
        </Button>
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
