import { create } from '@bufbuild/protobuf';
import { PresenceMatrixSchema } from '../../../../../conformance/gen/protoform/conformance/v1/conformance_pb';
import { evaluateQuickJs } from './evaluator';

declare const { expect, jest, test }: typeof import('bun:test');

const quickJs = await import('quickjs-emscripten');

test('context startup does not consume the guest execution budget', async () => {
  const QuickJS = await quickJs.newQuickJSWASMModule(quickJs.RELEASE_SYNC);
  const runtime = QuickJS.newRuntime();
  const createContext = runtime.newContext.bind(runtime);
  let elapsed = 0;
  const clock = jest.spyOn(performance, 'now').mockImplementation(() => elapsed);
  const createModule = jest.spyOn(quickJs, 'newQuickJSWASMModule').mockResolvedValue(QuickJS);
  const createRuntime = jest.spyOn(QuickJS, 'newRuntime').mockReturnValue(runtime);
  const contextStartup = jest.spyOn(runtime, 'newContext').mockImplementation((...args) => {
    const context = createContext(...args);
    elapsed = 100;
    return context;
  });
  try {
    await Promise.resolve(
      expect(evaluateQuickJs({ fields: [], source: '() => ({fields:{}})', values: {} })).resolves.toEqual({})
    );
  } finally {
    contextStartup.mockRestore();
    createRuntime.mockRestore();
    createModule.mockRestore();
    clock.mockRestore();
  }
});

test('each evaluation has independent WASM memory that cannot grow past 32 MiB', async () => {
  const instantiate = quickJs.newQuickJSWASMModule;
  const memories: WebAssembly.Memory[] = [];
  const createModule = jest.spyOn(quickJs, 'newQuickJSWASMModule').mockImplementation(async (...args) => {
    const module = await instantiate(...args);
    memories.push(module.getWasmMemory());
    return module;
  });
  try {
    const results = await Promise.all(
      Array.from({ length: 2 }, () => evaluateQuickJs({ fields: [], source: '() => ({fields:{}})', values: {} }))
    );
    expect(results).toEqual([{}, {}]);
    expect(new Set(memories).size).toBe(2);
    for (const memory of memories) {
      const pagesPastCap = 513 - memory.buffer.byteLength / 65_536;
      expect(() => memory.grow(pagesPastCap)).toThrow(RangeError);
    }
  } finally {
    createModule.mockRestore();
  }
});

test('disposes the runtime if guest context creation fails', async () => {
  const module = await quickJs.newQuickJSWASMModule(quickJs.RELEASE_SYNC);
  const runtime = module.newRuntime();
  const createModule = jest.spyOn(quickJs, 'newQuickJSWASMModule').mockResolvedValue(module);
  const createRuntime = jest.spyOn(module, 'newRuntime').mockReturnValue(runtime);
  const createContext = jest.spyOn(runtime, 'newContext').mockImplementation(() => {
    throw new Error('Context allocation failed');
  });
  try {
    await Promise.resolve(
      expect(evaluateQuickJs({ fields: [], source: '() => ({fields:{}})', values: {} })).rejects.toThrow(
        'Context allocation failed'
      )
    );
    expect(runtime.alive).toBe(false);
  } finally {
    createContext.mockRestore();
    createRuntime.mockRestore();
    createModule.mockRestore();
    if (runtime.alive) {
      runtime.dispose();
    }
  }
});

test('evaluates explicit schema fields, including fields without current values', async () => {
  expect(
    await evaluateQuickJs({
      fields: ['kind', 'company'],
      source: 'form => ({fields:{company:{visible: form.kind === "business"}}})',
      values: { kind: 'business' },
    })
  ).toEqual({ company: { visible: true } });
});

test.each([
  '() => ({fields:{invented:{visible:true}}})',
  '() => ({fields:{company:{value:"changed"}}})',
  '() => ({fields:{company:{disabled:"yes"}}})',
  '() => {while(true){}}',
  '() => {const a=[]; while(true) a.push(new Array(100000).fill(1))}',
  '() => {fetch("https://example.com"); return {fields:{}}}',
  '(form) => {form.kind="personal"; return {fields:{}}}',
  '(form) => ({',
  'async () => ({fields:{}})',
])('rejects unsafe or invalid rule %s', async (source) => {
  await Promise.resolve(
    expect(evaluateQuickJs({ fields: ['company', 'kind'], source, values: { kind: 'business' } })).rejects.toThrow()
  );
});

test.each([Number.POSITIVE_INFINITY, new Date(), new Uint8Array([1]), 1n].map((kind) => ({ kind })))(
  'rejects non-JSON inputs',
  async ({ kind }) => {
    await Promise.resolve(
      expect(evaluateQuickJs({ fields: ['kind'], source: '() => ({fields:{}})', values: { kind } })).rejects.toThrow()
    );
  }
);

test.each([
  'form => {form.kind[0].name = "mutated"; return {fields:{}}}',
  'form => {form.kind.push({name:"new"}); return {fields:{}}}',
])('nested guest snapshots cannot be mutated: %s', async (source) => {
  await Promise.resolve(
    expect(evaluateQuickJs({ fields: ['kind'], source, values: { kind: [{ name: 'original' }] } })).rejects.toThrow()
  );
});

test('field metadata is frozen in the guest', async () => {
  await Promise.resolve(
    expect(
      evaluateQuickJs({
        fields: ['kind'],
        fieldInfo: { kind: { type: 'string', required: false } },
        source: '(form, fields) => {fields.kind.required = true; return {fields:{}}}',
        values: {},
      })
    ).rejects.toThrow()
  );
});

test('nested snapshot limits reject live objects, unsafe properties, cycles, and oversized trees', async () => {
  const unsafeKeys: unknown = JSON.parse('{"__proto__":{"polluted":true}}');
  const circular: Record<string, unknown> = {};
  circular['self'] = circular;
  let deep: unknown = 'leaf';
  for (let index = 0; index < 20; index += 1) {
    deep = { child: deep };
  }
  await Promise.all(
    [
      { child: new Date() },
      { child: Number.NaN },
      create(PresenceMatrixSchema),
      unsafeKeys,
      circular,
      deep,
      Array.from({ length: 2001 }, () => null),
      ['x'.repeat(17_000)],
      [undefined],
    ].map(async (kind) => {
      await Promise.resolve(
        expect(evaluateQuickJs({ fields: ['kind'], source: '() => ({fields:{}})', values: { kind } })).rejects.toThrow()
      );
    })
  );
  expect(
    await evaluateQuickJs({
      fields: ['kind'],
      source: 'form => ({fields:{kind:{visible: form.kind.nil === null && !("unset" in form.kind)}}})',
      values: { kind: { nil: null, unset: undefined, empty: [], nested: {} } },
    })
  ).toEqual({ kind: { visible: true } });
});

test.each([
  { fields: ['company', 'company'], values: {} },
  { fields: ['__proto__'], values: {} },
  { fields: ['company'], values: { unknown: 'value' } },
  { fields: ['company'], values: { company: 'x'.repeat(17_000) } },
])('rejects invalid host contracts', async (request) => {
  await Promise.resolve(expect(evaluateQuickJs({ ...request, source: '() => ({fields:{}})' })).rejects.toThrow());
});

test('a guest runtime cannot leave globals for the next evaluation', async () => {
  await evaluateQuickJs({ fields: [], source: '() => {globalThis.leaked = true;return {fields:{}}}', values: {} });
  await Promise.resolve(
    expect(
      evaluateQuickJs({
        fields: [],
        source: '() => {if(typeof leaked !== "undefined") throw Error("leak"); return {fields:{}}}',
        values: {},
      })
    ).resolves.toEqual({})
  );
});

test.each(
  [
    { unknown: undefined },
    { kind: { type: 'string', required: true, extra: undefined } },
    { kind: { type: 'invalid type', required: true } },
    { kind: { type: 'string', required: 'yes' } },
  ].map((fieldInfo) => ({ fieldInfo }))
)('rejects unknown or malformed field metadata %j', async ({ fieldInfo }) => {
  await Promise.resolve(
    expect(
      evaluateQuickJs({ fields: ['kind'], source: '() => ({fields:{}})', values: {}, fieldInfo })
    ).rejects.toThrow()
  );
});
