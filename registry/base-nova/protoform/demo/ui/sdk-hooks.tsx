import { usePreference } from '@ui-sdk/react/preferences';
import { useMemo, useState } from 'react';
import { AsyncOptionCombobox } from '@/components/ui/async-option-combobox';
import { Button } from '@/components/ui/button';
import type { ComboboxOption } from '@/components/ui/combobox';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { createLocalStorage, createPreference, PreferenceSelect, Preferences } from '@/components/ui/preferences';
import { Textarea } from '@/components/ui/textarea';
import { definedProps } from '@/registry/base-nova/protoform/lib/sdk-props';

export const client = 'only';
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
  return (
    <div className="w-full max-w-xl space-y-6" data-testid="sdk-hooks-example">
      <h1 className="text-2xl font-semibold">SDK hooks in real controls</h1>
      <Field invalid={invalid} name="project" validation="native">
        <FieldLabel>Project title</FieldLabel>
        <FieldDescription>Labels, descriptions, and errors connect through SDK Field.</FieldDescription>
        <Input placeholder="Name your project" required />
        <FieldError>{invalid === true ? 'Choose a longer project title.' : null}</FieldError>
      </Field>
      <Button onClick={() => setInvalid(invalid !== true)} type="button" variant="outline">
        Toggle field error
      </Button>
      <Field name="notes" validation="native">
        <FieldLabel>Project notes</FieldLabel>
        <Textarea placeholder="Describe the project" />
      </Field>
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
