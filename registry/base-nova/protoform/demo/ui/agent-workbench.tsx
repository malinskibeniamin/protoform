import { agentTools } from '@ui-sdk/react/agent';
import { stageChanges } from '@ui-sdk/react/history';
import { createInputController } from '@ui-sdk/react/input';
import { elementOf, observe, withSource } from '@ui-sdk/react/observe';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogBackdrop, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Rating, RatingStar } from '@/components/ui/rating';
import { Select, SelectContent, SelectItem, SelectList, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AutoForm, AutoFormSlot } from '@/registry/base-nova/protoform/components/auto-form';
import type { SchemaProvider } from '@/registry/base-nova/protoform/components/auto-form/core-types';
import { createAgentSession } from '@/registry/base-nova/protoform/lib/ui-sdk/session';

export const client = 'only';
type Session = ReturnType<typeof createAgentSession>;
type Preview = Awaited<ReturnType<typeof stageChanges>>;
interface Confirmation {
  finish: (approved: boolean) => void;
  message: string;
}
const regions = [
  { value: 'eu', label: 'Europe' },
  { value: 'us', label: 'North America' },
];
const schema: SchemaProvider = {
  getDefaultValues: () => ({ title: 'Example record' }),
  parseSchema: () => ({
    fields: [{ key: 'title', type: 'string', required: true, fieldConfig: { label: 'Record title' } }],
  }),
  validateSchema: (values) =>
    typeof values['title'] === 'string' && values['title'].trim().length >= 3
      ? { success: true, data: values }
      : { success: false, errors: [{ path: ['title'], message: 'Use at least three characters' }] },
};
function Settings() {
  const [name, setName] = useState('Apollo');
  const [region, setRegion] = useState<string | null>('eu');
  const [digest, setDigest] = useState(false);
  const fieldId = useId();
  const [confidence, setConfidence] = useState(2);
  const [saved, setSaved] = useState('Not saved');
  const status = useMemo(() => createInputController(), []);
  return (
    <div className="space-y-4">
      <Field className="gap-2">
        <FieldLabel htmlFor={`${fieldId}-name`}>Project name</FieldLabel>
        <Input
          aria-label="Project name"
          id={`${fieldId}-name`}
          onValueChange={(value, details) => {
            if (details.source === 'agent' && value === 'Restricted') {
              details.cancel();
              return;
            }
            setName(value);
          }}
          value={name}
        />
      </Field>
      <Field className="gap-2">
        <FieldLabel htmlFor={`${fieldId}-region`}>Region</FieldLabel>
        <Select items={regions} onValueChange={setRegion} value={region}>
          <SelectTrigger aria-label="Region" id={`${fieldId}-region`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectList>
              {regions.map((entry) => (
                <SelectItem key={entry.value} value={entry.value}>
                  {entry.label}
                </SelectItem>
              ))}
            </SelectList>
          </SelectContent>
        </Select>
      </Field>
      <Field orientation="horizontal">
        <Switch aria-label="Weekly digest" checked={digest} id={`${fieldId}-digest`} onCheckedChange={setDigest} />
        <FieldLabel htmlFor={`${fieldId}-digest`}>Weekly digest</FieldLabel>
      </Field>
      <div className="space-y-2">
        <p>Review confidence</p>
        <Rating aria-label="Review confidence" onValueChange={setConfidence} value={confidence}>
          {[1, 2, 3, 4, 5].map((value) => (
            <RatingStar aria-label={`${value} of 5 stars`} key={value} value={String(value)}>
              ★
            </RatingStar>
          ))}
        </Rating>
      </div>
      <Field className="gap-2">
        <FieldLabel htmlFor={`${fieldId}-secret`}>Access token (synthetic)</FieldLabel>
        <Input aria-label="Access token" data-agent-secret defaultValue="demo-secret" id={`${fieldId}-secret`} />
      </Field>
      <section data-agent-hidden>
        <Field className="gap-2">
          <FieldLabel htmlFor={`${fieldId}-private`}>Private note</FieldLabel>
          <Input aria-label="Private note" defaultValue="human-only-note" id={`${fieldId}-private`} />
        </Field>
      </section>
      <AutoForm
        modes={['advanced']}
        onSubmit={(values) => setSaved(JSON.stringify(values))}
        schema={schema}
        showSummary={false}
      >
        <AutoFormSlot after="title">
          <Button data-agent-confirm="Saves this example record locally; no network request" type="submit">
            Save local form
          </Button>
        </AutoFormSlot>
      </AutoForm>
      <output aria-label="Saved local record" className="block break-all">
        {saved}
      </output>
      <Field className="gap-2">
        <FieldLabel htmlFor={`${fieldId}-status`}>Async status</FieldLabel>
        <Input aria-label="Async status" controller={status} defaultValue="Ready" id={`${fieldId}-status`} />
      </Field>
      <Button
        onClick={async (_event, { source }) => {
          await Promise.resolve();
          withSource(source, () => status.setValue('Refreshed'));
        }}
        variant="outline"
      >
        Refresh local status
      </Button>
    </div>
  );
}

export default function AgentWorkbench() {
  const panel = useRef<HTMLDivElement>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [result, setResult] = useState('Agent access is off.');
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState('[]');
  const [activity, setActivity] = useState('[]');
  const idleStatus = session === null ? 'Agent access is off.' : 'Agent ready.';
  const agentStatus = busy === true ? 'Agent command running. Wait before editing.' : idleStatus;
  useEffect(() => {
    if (session === null) {
      return;
    }
    const stopHistory = session.history.subscribe(() => setHistory(JSON.stringify(session.history.entries(), null, 2)));
    const stopObserve = observe(
      (change) => setActivity(JSON.stringify({ component: change.component, key: change.key, source: change.source })),
      { within: () => panel.current }
    );
    return () => {
      stopObserve();
      stopHistory();
      session.dispose();
    };
  }, [session]);
  function enable() {
    const next = createAgentSession({
      allow: (step) =>
        panel.current?.contains(elementOf(step.ref)) === true &&
        ['setValue', 'setChecked', 'press'].includes(step.action),
      history: { within: () => panel.current },
      confirm: (step, { signal }) =>
        new Promise<boolean>((resolve) => {
          function finish(approved: boolean) {
            signal.removeEventListener('abort', cancel);
            setConfirmation(null);
            resolve(approved);
          }
          function cancel() {
            finish(false);
          }
          if (signal.aborted) {
            resolve(false);
            return;
          }
          signal.addEventListener('abort', cancel, { once: true });
          setConfirmation({ message: step.confirm ?? 'Approve this action?', finish });
        }),
    });
    setHistory('[]');
    setActivity('[]');
    setResult('Agent access enabled for this local example.');
    setSession(next);
  }
  async function run(action: (current: Session) => unknown) {
    if (session === null) {
      return;
    }
    const current = session;
    setBusy(true);
    try {
      const output = await action(current);
      if (!current.signal.aborted) {
        setResult(JSON.stringify(output, null, 2));
      }
    } catch (error) {
      if (!current.signal.aborted) {
        setResult(error instanceof Error ? error.message : String(error));
      }
    }
    if (!current.signal.aborted) {
      setBusy(false);
    }
  }
  function disable() {
    session?.dispose();
    setSession(null);
    setPreview(null);
    setBusy(false);
    setResult('Agent access is off.');
  }
  return (
    <main
      aria-busy={busy}
      className="mx-auto w-full max-w-[min(48rem,calc(100vw-3rem))] min-w-0 space-y-6 p-6"
      data-testid="agent-workbench"
    >
      <h1 className="text-2xl font-semibold">UI SDK agent workbench</h1>
      <p>
        This local tool runner uses the real bridge, not an LLM or a backend. Nothing registers WebMCP tools. Enable
        explicitly; disabling resets the example.
      </p>
      <AgentCommands
        busy={busy}
        disable={disable}
        enable={enable}
        enabled={session !== null}
        onPreview={setPreview}
        preview={preview}
        run={run}
      />
      <p>
        History restores UI values only, never a save or a network request. Reverting a preview restores captured
        values, including later edits. Use Undo agent edits to preserve later human changes.
      </p>
      <p aria-label="Agent status" role="status">
        {agentStatus}
      </p>
      <div ref={panel}>{session === null ? <p>Enable the bridge to mount the local example.</p> : <Settings />}</div>
      <section aria-label="Agent diagnostics" className="space-y-4" data-agent-hidden>
        <section aria-label="Tool result" className="space-y-2">
          <h2 className="text-sm font-medium">Tool result</h2>
          <pre className="max-h-80 overflow-auto rounded-lg border p-3 text-xs">{result}</pre>
        </section>
        <section aria-label="Change history" className="space-y-2">
          <h2 className="text-sm font-medium">Change history</h2>
          <pre className="max-h-80 overflow-auto rounded-lg border p-3 text-xs">{history}</pre>
        </section>
        <section aria-label="Observed activity" className="space-y-2">
          <h2 className="text-sm font-medium">Observed activity</h2>
          <pre className="overflow-auto rounded-lg border p-3 text-xs">{activity}</pre>
        </section>
      </section>
      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            confirmation?.finish(false);
          }
        }}
        open={confirmation !== null}
      >
        <DialogBackdrop />
        <DialogContent data-agent-hidden>
          <div className="space-y-4 p-4">
            <DialogTitle>Approve agent action</DialogTitle>
            <p>{confirmation?.message}</p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={disable} variant="outline">
                Stop agent
              </Button>
              <Button onClick={() => confirmation?.finish(false)} variant="outline">
                Reject action
              </Button>
              <Button onClick={() => confirmation?.finish(true)}>Approve action</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}

interface AgentCommandsProps {
  busy: boolean;
  disable: () => void;
  enable: () => void;
  enabled: boolean;
  onPreview: (preview: Preview | null) => void;
  preview: Preview | null;
  run: (action: (session: Session) => unknown) => Promise<void>;
}
function AgentCommands({ busy, enabled, enable, disable, run, preview, onPreview }: AgentCommandsProps) {
  return (
    <section aria-label="Agent controls" className="flex flex-wrap gap-2" data-agent-hidden>
      <Button disabled={enabled} onClick={enable}>
        Enable local agent
      </Button>
      <Button disabled={!enabled} onClick={disable} variant="outline">
        Disable agent
      </Button>
      <Button disabled={!enabled || busy} onClick={() => run((current) => current.agent.snapshot())} variant="outline">
        Inspect UI
      </Button>
      <Button disabled={!enabled || busy} onClick={() => run(() => agentTools)} variant="outline">
        Inspect tool schemas
      </Button>
      <Button
        disabled={!enabled || busy}
        onClick={() => run((current) => current.agent.query({ within: 'Region' }))}
        variant="outline"
      >
        Find regions
      </Button>
      <Button
        disabled={!enabled || busy}
        onClick={() =>
          run((current) =>
            current.agent.act({
              steps: [
                { ref: 'Project name', action: 'setValue', args: ['Atlas'] },
                { ref: 'Region', action: 'setValue', args: ['us'] },
                { ref: 'Weekly digest', action: 'setChecked', args: [true] },
                { ref: 'Review confidence', action: 'setValue', args: [4] },
                { ref: 'Record title', action: 'setValue', args: ['Agent draft'] },
              ],
            })
          )
        }
      >
        Fill sample
      </Button>
      <Button
        disabled={!enabled || busy}
        onClick={() =>
          run((current) =>
            current.agent.act({ steps: [{ ref: 'Project name', action: 'setValue', args: ['Restricted'] }] })
          )
        }
        variant="outline"
      >
        Try refused value
      </Button>
      <Button
        disabled={!enabled || busy}
        onClick={() =>
          run((current) =>
            current.agent.act({ steps: [{ ref: 'Access token', action: 'setValue', args: ['replacement-token'] }] })
          )
        }
        variant="outline"
      >
        Fill secret
      </Button>
      <Button
        disabled={!enabled || busy}
        onClick={() => run((current) => current.agent.act({ steps: [{ ref: 'Save local form', action: 'press' }] }))}
      >
        Ask agent to save
      </Button>
      <Button
        disabled={!enabled || busy}
        onClick={() =>
          run((current) => current.agent.act({ steps: [{ ref: 'Refresh local status', action: 'press' }] }))
        }
        variant="outline"
      >
        Run async action
      </Button>
      <Button
        disabled={!enabled || preview !== null || busy}
        onClick={() =>
          run(async (current) => {
            const staged = await stageChanges(current.agent, [{ ref: 'Project name', value: 'Preview name' }]);
            if (!current.signal.aborted) {
              onPreview(staged);
            }
            return staged.applied;
          })
        }
        variant="outline"
      >
        Preview suggestion
      </Button>
      <Button
        disabled={preview === null || busy}
        onClick={() =>
          run(async (current) => {
            const skipped = await preview?.revert();
            if (!current.signal.aborted) {
              onPreview(null);
            }
            return skipped;
          })
        }
        variant="outline"
      >
        Revert preview
      </Button>
      <Button disabled={!enabled || busy} onClick={() => run((current) => current.history.seek(0))} variant="outline">
        Seek to start
      </Button>
      <Button
        disabled={!enabled || busy}
        onClick={() => run((current) => current.history.seek(current.history.entries().length))}
        variant="outline"
      >
        Replay history
      </Button>
      <Button
        disabled={!enabled || busy}
        onClick={() => run((current) => current.history.undoSource('agent'))}
        variant="outline"
      >
        Undo agent edits
      </Button>
    </section>
  );
}
