import { createAgent, type ObservedChange } from '@ui-sdk/react/agent';
import { createHistory, type HistoryOptions } from '@ui-sdk/react/history';

type AgentOptions = NonNullable<Parameters<typeof createAgent>[0]>;
type AgentPolicy = NonNullable<AgentOptions['allow']>;
export interface AgentSessionOptions {
  allow: AgentPolicy;
  confirm?: AgentPolicy;
  history?: HistoryOptions;
  onChange?: (change: ObservedChange) => void;
  timeout?: number;
}

export function createAgentSession(options: AgentSessionOptions) {
  const lifetime = new AbortController();
  const agent = createAgent({
    ...(options.timeout === undefined ? {} : { timeout: options.timeout }),
    allow: async (step, context) => {
      const signal = AbortSignal.any([context.signal, lifetime.signal]);
      if (signal.aborted || !(await options.allow(step, { signal }))) {
        return false;
      }
      if (signal.aborted) {
        return false;
      }
      if (step.confirm !== undefined) {
        const { confirm } = options;
        if (confirm === undefined) {
          return false;
        }
        const approved = await Promise.resolve(confirm(step, { signal }));
        if (approved !== true) {
          return false;
        }
      }
      return !signal.aborted;
    },
  });
  const history = createHistory(agent, options.history);
  const stop = options.onChange === undefined ? undefined : agent.subscribe(options.onChange);
  return {
    agent,
    history,
    signal: lifetime.signal,
    dispose() {
      lifetime.abort();
      stop?.();
      history.destroy();
    },
  };
}
