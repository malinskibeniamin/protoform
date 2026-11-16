import { elementOf } from '@ui-sdk/react/observe';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Rating, RatingStar } from '@/components/ui/sdk/rating';
import { AutoForm } from '@/registry/base-nova/protoform/components/auto-form';
import type { SchemaProvider } from '@/registry/base-nova/protoform/components/auto-form/core-types';
import { createAgentSession } from '@/registry/base-nova/protoform/lib/ui-sdk/session';

export const client = 'only';
type Session = ReturnType<typeof createAgentSession>;
const scores = [1, 2, 3, 4, 5];
const schema: SchemaProvider = {
  getDefaultValues: () => ({ title: 'Base UI project', region: 'eu' }),
  parseSchema: () => ({
    fields: [
      { key: 'title', type: 'string', required: true },
      {
        key: 'region',
        type: 'select',
        required: true,
        options: [
          ['eu', 'Europe'],
          ['us', 'North America'],
          ['apac', 'Asia Pacific'],
          ['latam', 'Latin America'],
        ],
      },
    ],
  }),
  validateSchema: (values) =>
    typeof values['title'] === 'string' && values['title'].trim() !== ''
      ? { success: true, data: values }
      : { success: false, errors: [{ path: ['title'], message: 'Enter a title' }] },
};
export default function UIFoundationsExample() {
  const [saved, setSaved] = useState('Not saved');
  const [score, setScore] = useState(0);
  const [session, setSession] = useState<Session>();
  const [status, setStatus] = useState('SDK disabled');
  const [snapshot, setSnapshot] = useState('');
  const resource = useRef<Session>(undefined);
  const enhancement = useRef<HTMLDivElement>(null);
  useEffect(() => () => resource.current?.dispose(), []);
  function enable() {
    if (resource.current !== undefined) {
      return;
    }
    const next = createAgentSession({
      allow: (step) =>
        enhancement.current?.contains(elementOf(step.ref)) === true &&
        step.action === 'setValue' &&
        step.confirm === undefined,
      history: { within: () => enhancement.current },
    });
    resource.current = next;
    setSession(next);
    setStatus('SDK enabled');
  }
  function stop() {
    resource.current?.dispose();
    resource.current = undefined;
    setSession(undefined);
    setSnapshot('');
    setStatus('SDK stopped');
  }
  async function change(ref: string, value: number | string) {
    if (session === undefined) {
      return;
    }
    const result = await session.agent.act({ steps: [{ ref, action: 'setValue', args: [value] }] });
    if (!session.signal.aborted) {
      setStatus(result.ok ? 'SDK action completed' : 'SDK refused');
    }
  }
  return (
    <div className="w-full max-w-xl space-y-6" data-testid="ui-foundations-example">
      <h1 className="text-2xl font-semibold">Base UI defaults, optional SDK enhancements</h1>
      <section aria-label="Base UI form" className="space-y-4 rounded-lg border border-border p-4">
        <h2 className="font-semibold">Base UI form</h2>
        <AutoForm
          modes={['simple']}
          onSubmit={(values) => setSaved(JSON.stringify(values))}
          schema={schema}
          showSummary={false}
          withSubmit
        />
        <output aria-label="Saved Base UI values">{saved}</output>
      </section>
      <section aria-label="SDK enhancement" className="space-y-4 rounded-lg border border-border p-4">
        <h2 className="font-semibold">Opt-in SDK rating and agent access</h2>
        <p>
          The SDK owns this rating, not the Base UI form. Its agent policy only permits rating changes in this region.
        </p>
        {session === undefined ? (
          <Button onClick={enable} type="button">
            Enable SDK enhancement
          </Button>
        ) : (
          <Button onClick={stop} type="button" variant="outline">
            Stop SDK enhancement
          </Button>
        )}
        <div ref={enhancement}>
          {session === undefined ? null : (
            <Rating aria-label="SDK rating" onValueChange={setScore} value={score}>
              {scores.map((value) => (
                <RatingStar aria-label={`${value} stars`} key={value} value={String(value)}>
                  ★
                </RatingStar>
              ))}
            </Rating>
          )}
        </div>
        <output aria-label="SDK score">{score}</output>
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={session === undefined}
            onClick={() => change('SDK rating', 4)}
            type="button"
            variant="outline"
          >
            Set SDK rating through agent
          </Button>
          <Button
            disabled={session === undefined}
            onClick={() => change('Title', 'Agent edit')}
            type="button"
            variant="outline"
          >
            Try agent edit on Base UI
          </Button>
          <Button
            disabled={session === undefined}
            onClick={() => setSnapshot(JSON.stringify(session?.agent.snapshot()))}
            type="button"
            variant="outline"
          >
            Inspect SDK snapshot
          </Button>
        </div>
        <Button
          disabled={session === undefined}
          onClick={async () => {
            if (session === undefined) {
              return;
            }
            const skipped = await session.history.undoSource('agent');
            if (!session.signal.aborted) {
              setStatus(skipped.length === 0 ? 'SDK undone' : 'SDK undo incomplete');
            }
          }}
          type="button"
          variant="outline"
        >
          Undo SDK agent changes
        </Button>
        <output aria-label="SDK status">{status}</output>
        <output
          aria-label="SDK snapshot"
          className="block max-w-full overflow-x-auto text-xs break-all whitespace-pre-wrap"
        >
          {snapshot}
        </output>
      </section>
    </div>
  );
}
