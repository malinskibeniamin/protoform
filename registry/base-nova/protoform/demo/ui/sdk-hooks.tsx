import { usePreference } from '@ui-sdk/react/preferences';
import { useShortcut, useShortcutHint } from '@ui-sdk/react/shortcuts';
import { useId, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { ComboboxOption } from '@/components/ui/combobox';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Kbd } from '@/components/ui/kbd';
import { AsyncOptionCombobox } from '@/components/ui/sdk/async-option-combobox';
import { createNumberTextStepper } from '@/components/ui/sdk/number-text';
import { createLocalStorage, createPreference, PreferenceSelect, Preferences } from '@/components/ui/sdk/preferences';
import { Textarea } from '@/components/ui/textarea';
import { definedProps } from '@/registry/base-nova/protoform/lib/sdk-props';

export const client = 'only';
const stepGermanNumber = createNumberTextStepper('de-DE');
const projects = ['Apollo', 'Atlas', 'Aurora', 'Beacon', 'Coast', 'Drift'];
async function loadProjects(query: string, { signal, page }: { signal: AbortSignal; page: number }) {
  await Promise.resolve();
  signal.throwIfAborted();
  if (query.trim().toLowerCase() === 'error') {
    throw new Error('Local failure example');
  }
  const matches = projects.filter((label) => label.toLowerCase().includes(query.toLowerCase()));
  return {
    items: matches.slice(page * 2, page * 2 + 2).map((label): ComboboxOption => ({ label, value: label })),
    hasMore: matches.length > page * 2 + 2,
  };
}
function SavedPreferences() {
  const density = useMemo(
    () =>
      createPreference({
        values: ['comfortable', 'compact'],
        defaultValue: 'comfortable',
        attribute: 'data-demo-density',
        storage: createLocalStorage('protoform.sdk-hooks.density'),
      }),
    []
  );
  const state = usePreference(density);
  return (
    <Preferences preferences={[definedProps(density)]}>
      <div className={state.value === 'compact' ? 'space-y-2' : 'space-y-4'}>
        <PreferenceSelect label="Example density" preference={density} />
        <output aria-label="Saved density">{state.value}</output>
        <p>
          This example alone remembers its density. It does not change the application theme. Stopping hides these
          controls but keeps the saved choice.
        </p>
      </div>
    </Preferences>
  );
}
export default function SDKHooksExample() {
  const [project, setProject] = useState('');
  const [preferencesEnabled, setPreferencesEnabled] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const fieldId = useId();
  const hint = useShortcutHint('mod+shift+k');
  useShortcut('mod+shift+k', () => titleRef.current?.focus(), { description: 'Focus project title' });
  return (
    <div className="w-full max-w-xl space-y-6" data-testid="sdk-hooks-example">
      <h1 className="text-2xl font-semibold">SDK hooks in real controls</h1>
      <Field data-invalid={invalid}>
        <FieldLabel htmlFor={`${fieldId}-title`}>Project title</FieldLabel>
        <FieldDescription id={`${fieldId}-description`}>
          Base UI owns field behavior; SDK adds loading, shortcuts, and preferences.
        </FieldDescription>
        <Input
          aria-describedby={invalid === true ? `${fieldId}-error ${fieldId}-description` : `${fieldId}-description`}
          aria-invalid={invalid}
          id={`${fieldId}-title`}
          name="project"
          placeholder="Name your project"
          ref={titleRef}
          required
        />
        {invalid === true ? (
          <FieldError id={`${fieldId}-error`} role="alert">
            Choose a longer project title.
          </FieldError>
        ) : null}
      </Field>
      <Button onClick={() => setInvalid(invalid !== true)} type="button" variant="outline">
        Toggle field error
      </Button>
      <Field>
        <FieldLabel htmlFor={`${fieldId}-notes`}>Project notes</FieldLabel>
        <Textarea id={`${fieldId}-notes`} placeholder="Describe the project" />
      </Field>
      <p>
        Focus project title: <Kbd aria-keyshortcuts={hint.ariaKeyshortcuts}>{hint.text}</Kbd>
      </p>
      <section className="space-y-3">
        <h2 className="font-semibold">Async project options</h2>
        <p>Local paged data; type “error” to try failure recovery.</p>
        <AsyncOptionCombobox
          aria-label="Search projects"
          immediate
          load={loadProjects}
          onChange={setProject}
          value={project}
        />
        <output aria-label="Selected project">{project === '' ? 'None' : <span>{project}</span>}</output>
      </section>
      <section className="space-y-3">
        <h2 className="font-semibold">Localized number stepping</h2>
        <Input
          aria-label="Amount (German number format)"
          defaultValue="1.234,5"
          showStepControls
          step={0.1}
          stepNumberText={stepGermanNumber}
          type="number"
        />
      </section>
      <section className="space-y-3">
        <h2 className="font-semibold">Opt-in saved preferences</h2>
        {preferencesEnabled === true ? (
          <>
            <SavedPreferences />
            <Button onClick={() => setPreferencesEnabled(false)} type="button" variant="outline">
              Stop preferences
            </Button>
          </>
        ) : (
          <Button onClick={() => setPreferencesEnabled(true)} type="button" variant="outline">
            Enable saved preferences
          </Button>
        )}
      </section>
    </div>
  );
}
