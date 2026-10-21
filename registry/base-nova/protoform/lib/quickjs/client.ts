import {
  isRecord,
  parseQuickJsPresentation,
  parseQuickJsRequest,
  type QuickJsPresentation,
  type QuickJsRequest,
} from './contract';

export interface QuickJsOptions {
  createWorker?: () => Worker;
  signal?: AbortSignal;
  timeoutMs?: number;
}

export function evaluateQuickJsInWorker(
  request: QuickJsRequest,
  options: QuickJsOptions = {}
): Promise<QuickJsPresentation> {
  return new Promise((resolve, reject) => {
    const snapshot = parseQuickJsRequest(request);
    const timeout = options.timeoutMs ?? 5000;
    if (!Number.isFinite(timeout) || timeout < 1 || timeout > 10_000) {
      throw new Error('Invalid worker timeout');
    }
    if (options.signal?.aborted) {
      throw new Error('QuickJS evaluation cancelled');
    }
    const worker = options.createWorker?.() ?? new Worker(new URL('worker.ts', import.meta.url), { type: 'module' });
    let settled = false;
    const finish = (error?: Error, result?: QuickJsPresentation) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);
      options.signal?.removeEventListener('abort', abort);
      worker.removeEventListener('message', handleMessage);
      worker.removeEventListener('error', handleError);
      worker.removeEventListener('messageerror', handleMessageError);
      worker.terminate();
      if (error) {
        reject(error);
      } else {
        resolve(result ?? {});
      }
    };
    const abort = () => finish(new Error('QuickJS evaluation cancelled'));
    const timer = setTimeout(() => finish(new Error('QuickJS worker timed out')), timeout);
    const handleError = () => finish(new Error('QuickJS worker failed to load or execute'));
    const handleMessageError = () => finish(new Error('Invalid QuickJS worker message'));
    const handleMessage = (event: MessageEvent<unknown>) => {
      try {
        const response = event.data;
        if (!isRecord(response) || response['ok'] !== true) {
          throw new Error('QuickJS rule failed or returned invalid output');
        }
        finish(undefined, parseQuickJsPresentation(response['presentation'], snapshot.fields));
      } catch (error) {
        finish(error instanceof Error ? error : new Error('Invalid QuickJS output'));
      }
    };
    options.signal?.addEventListener('abort', abort, { once: true });
    if (options.signal?.aborted) {
      abort();
      return;
    }
    worker.addEventListener('error', handleError);
    worker.addEventListener('messageerror', handleMessageError);
    worker.addEventListener('message', handleMessage);
    try {
      worker.postMessage(snapshot, { transfer: [] });
    } catch (error) {
      finish(error instanceof Error ? error : new Error('Could not send QuickJS input'));
    }
  });
}
