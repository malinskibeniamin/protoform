import { Questionnaire as QuestionnairePrimitive } from '@shadcn/react/questionnaire';
import type * as React from 'react';
import type { Button } from './button';

declare function Questionnaire({
  className,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Root>): React.JSX.Element;
declare function QuestionnaireProgress({
  className,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Progress>): React.JSX.Element;
declare function QuestionnaireItem({
  className,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Item>): React.JSX.Element;
declare function QuestionnaireTitle({
  className,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Title>): React.JSX.Element;
declare function QuestionnaireDescription({
  className,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Description>): React.JSX.Element;
declare function QuestionnaireChoices({
  className,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Choices>): React.JSX.Element;
declare function QuestionnaireChoice({
  children,
  className,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Choice>): React.JSX.Element;
declare function QuestionnaireChoiceDescription({
  className,
  ...props
}: React.ComponentProps<'span'>): React.JSX.Element;
declare function QuestionnaireInput({
  className,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Input>): React.JSX.Element;
declare function QuestionnaireError({
  className,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Error>): React.JSX.Element;
declare function QuestionnaireActions({ className, ...props }: React.ComponentProps<'div'>): React.JSX.Element;
declare function QuestionnairePrevious({
  children,
  className,
  size,
  variant,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Previous> &
  Pick<React.ComponentProps<typeof Button>, 'size' | 'variant'>): React.JSX.Element;
declare function QuestionnaireSkip({
  children,
  className,
  size,
  variant,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Skip> &
  Pick<React.ComponentProps<typeof Button>, 'size' | 'variant'>): React.JSX.Element;
declare function QuestionnaireNext({
  children,
  className,
  size,
  variant,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Next> &
  Pick<React.ComponentProps<typeof Button>, 'size' | 'variant'>): React.JSX.Element;
declare function QuestionnaireSubmit({
  children,
  className,
  size,
  variant,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Submit> &
  Pick<React.ComponentProps<typeof Button>, 'size' | 'variant'>): React.JSX.Element;

export {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
};
