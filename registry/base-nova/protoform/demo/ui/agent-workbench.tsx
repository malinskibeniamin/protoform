import { agentTools } from '@ui-sdk/react/agent';
import { stageChanges } from '@ui-sdk/react/history';
import { elementOf, observe } from '@ui-sdk/react/observe';
import type { ComponentProps } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Rating, RatingStar } from '@/components/ui/sdk/rating';
import { createAgentSession } from '@/registry/base-nova/protoform/lib/ui-sdk/session';

export const client = 'only';
type Session = ReturnType<typeof createAgentSession>;
type Preview = Awaited<ReturnType<typeof stageChanges>>;
interface Confirmation {
  finish: (approved: boolean) => void;
  message: string;
}
type ScoreProps = Pick<ComponentProps<typeof Rating>, 'value' | 'defaultValue' | 'onValueChange'> & {
  label: string;
  confirmation?: string;
  secret?: boolean;
};
function Score({ label, value, defaultValue, onValueChange, confirmation, secret }: ScoreProps) {
  return (
    <div className="space-y-2">
      <p>{label}</p>
      <Rating
        aria-label={label}
        data-agent-confirm={confirmation}
        data-agent-secret={secret}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        value={value}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <RatingStar aria-label={`${star} of 5 stars`} key={star} value={String(star)}>
            ★
          </RatingStar>
        ))}
      </Rating>
    </div>
  );
}
function Settings() {
  const [confidence, setConfidence] = useState(2);
  const [approval, setApproval] = useState(0);
  const [saved, setSaved] = useState('Not saved');
  return (
    <div className="space-y-4">
      <label className="block space-y-2">
        Human project name
        <Input aria-label="Human project name" defaultValue="Apollo" />
      </label>
      <p>Base UI owns ordinary controls. Only the additional SDK ratings below expose declared agent actions.</p>
      <Score
        label="Review confidence"
        onValueChange={(value, details) => {
          if (details.source === 'agent' && value === 5) {
            details.cancel();
            return;
          }
          setConfidence(value);
        }}
        value={confidence}
      />
      <Score
        confirmation="Changes the local approval level; no save or network request"
        label="Approval level"
        onValueChange={setApproval}
        value={approval}
      />
      <Score defaultValue={1} label="Secret score" secret />
      <section data-agent-hidden>
        <Score defaultValue={2} label="Private score" />
      </section>
      <Button onClick={() => setSaved(JSON.stringify({ confidence, approval }))} type="button">
        Save local record
      </Button>
      <output aria-label="Saved local record" className="block break-all">
        {saved}
      </output>
    </div>
  );
}

export default function AgentWorkbench() {
  const panelRef = useRef<HTMLDivElement>(null);
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
      { within: () => panelRef.current }
    );
    return () => {
      stopObserve();
      stopHistory();
      session.dispose();
    };
  }, [session]);
  function enable() {
    const next = createAgentSession({
      allow: (step) => panelRef.current?.contains(elementOf(step.ref)) === true && step.action === 'setValue',
      history: { within: () => panelRef.current },
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
        explicitly; disabling resets the example. Base UI controls are never exposed as SDK agent targets.
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
      <div ref={panelRef}>{session === null ? <p>Enable the bridge to mount the local example.</p> : <Settings />}</div>
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
  const unavailable = !enabled || busy;
  return (
    <section aria-label="Agent controls" className="flex flex-wrap gap-2" data-agent-hidden>
      <Button disabled={enabled} onClick={enable}>
        Enable local agent
      </Button>
      <Button disabled={!enabled} onClick={disable} variant="outline">
        Disable agent
      </Button>
      <Button disabled={unavailable} onClick={() => run((current) => current.agent.snapshot())} variant="outline">
        Inspect UI
      </Button>
      <Button disabled={unavailable} onClick={() => run(() => agentTools)} variant="outline">
        Inspect tool schemas
      </Button>
      <Button
        disabled={unavailable}
        onClick={() => run((current) => current.agent.query({ within: 'Review confidence' }))}
        variant="outline"
      >
        Find ratings
      </Button>
      <Button
        disabled={unavailable}
        onClick={() =>
          run((current) => current.agent.act({ steps: [{ ref: 'Review confidence', action: 'setValue', args: [4] }] }))
        }
      >
        Fill sample
      </Button>
      <Button
        disabled={unavailable}
        onClick={() =>
          run((current) => current.agent.act({ steps: [{ ref: 'Review confidence', action: 'setValue', args: [5] }] }))
        }
        variant="outline"
      >
        Try refused value
      </Button>
      <Button
        disabled={unavailable}
        onClick={() =>
          run((current) =>
            current.agent.act({ steps: [{ ref: 'Human project name', action: 'setValue', args: ['Agent edit'] }] })
          )
        }
        variant="outline"
      >
        Try Base UI edit
      </Button>
      <Button
        disabled={unavailable}
        onClick={() =>
          run((current) => current.agent.act({ steps: [{ ref: 'Secret score', action: 'setValue', args: [3] }] }))
        }
        variant="outline"
      >
        Fill secret
      </Button>
      <Button
        disabled={unavailable}
        onClick={() =>
          run((current) => current.agent.act({ steps: [{ ref: 'Approval level', action: 'setValue', args: [3] }] }))
        }
      >
        Ask agent to approve
      </Button>
      <Button
        disabled={unavailable || preview !== null}
        onClick={() =>
          run(async (current) => {
            const staged = await stageChanges(current.agent, [{ ref: 'Review confidence', value: 3 }]);
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
      <Button disabled={unavailable} onClick={() => run((current) => current.history.seek(0))} variant="outline">
        Seek to start
      </Button>
      <Button
        disabled={unavailable}
        onClick={() => run((current) => current.history.seek(current.history.entries().length))}
        variant="outline"
      >
        Replay history
      </Button>
      <Button
        disabled={unavailable}
        onClick={() => run((current) => current.history.undoSource('agent'))}
        variant="outline"
      >
        Undo agent edits
      </Button>
    </section>
  );
}
