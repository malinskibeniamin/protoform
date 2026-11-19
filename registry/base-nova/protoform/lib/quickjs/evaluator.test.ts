import { create } from '@bufbuild/protobuf';
import { PresenceMatrixSchema } from '../../../../../conformance/gen/protoform/conformance/v1/conformance_pb';
import { captureRejection } from '../core/rejection.test-utils';
import { evaluateQuickJs } from './evaluator';

declare const { expect, jest, test }: typeof import('bun:test');

const quickJs = await import('quickjs-emscripten');

test('each evaluation has independent WASM memory that cannot grow past 32 MiB', async () => {
  const createModule = jest.spyOn(quickJs, 'newQuickJSWASMModule');

  try {
    const results = await Promise.all(
      Array.from({ length: 2 }, () => evaluateQuickJs({ fields: [], source: '() => ({fields:{}})', values: {} }))
    );
    expect(results).toEqual([{}, {}]);
    const memories = await Promise.all(
      createModule.mock.results.map(async ({ type, value }) => {
        if (type !== 'return' || !(value instanceof Promise)) {
          throw new TypeError('Expected the WASM factory to return a promise.');
        }
        const module: unknown = await value;
        if (!(module instanceof quickJs.QuickJSWASMModule)) {
          throw new TypeError('Expected the promise to resolve to a QuickJS module.');
        }
        return module.getWasmMemory();
      })
    );
    expect(new Set(memories).size).toBe(2);
    for (const memory of memories) {
      const pagesPastCap = 513 - memory.buffer.byteLength / 65_536;
      expect(() => memory.grow(pagesPastCap)).toThrow(RangeError);
    }
  } finally {
    createModule.mockRestore();
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
  expect(
    await captureRejection(evaluateQuickJs({ fields: ['company', 'kind'], source, values: { kind: 'business' } }))
  ).toBeInstanceOf(Error);
});

test.each([Number.POSITIVE_INFINITY, new Date(), new Uint8Array([1]), 1n].map((kind) => ({ kind })))(
  'rejects non-JSON inputs',
  async ({ kind }) => {
    expect(
      await captureRejection(evaluateQuickJs({ fields: ['kind'], source: '() => ({fields:{}})', values: { kind } }))
    ).toBeInstanceOf(Error);
  }
);

test.each([
  'form => {form.kind[0].name = "mutated"; return {fields:{}}}',
  'form => {form.kind.push({name:"new"}); return {fields:{}}}',
])('nested guest snapshots cannot be mutated: %s', async (source) => {
  expect(
    await captureRejection(evaluateQuickJs({ fields: ['kind'], source, values: { kind: [{ name: 'original' }] } }))
  ).toBeInstanceOf(Error);
});

test('field metadata is frozen in the guest', async () => {
  expect(
    await captureRejection(
      evaluateQuickJs({
        fields: ['kind'],
        fieldInfo: { kind: { type: 'string', required: false } },
        source: '(form, fields) => {fields.kind.required = true; return {fields:{}}}',
        values: {},
      })
    )
  ).toBeInstanceOf(Error);
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
      expect(
        await captureRejection(evaluateQuickJs({ fields: ['kind'], source: '() => ({fields:{}})', values: { kind } }))
      ).toBeInstanceOf(Error);
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
  expect(await captureRejection(evaluateQuickJs({ ...request, source: '() => ({fields:{}})' }))).toBeInstanceOf(Error);
});

test('a guest runtime cannot leave globals for the next evaluation', async () => {
  await evaluateQuickJs({ fields: [], source: '() => {globalThis.leaked = true;return {fields:{}}}', values: {} });
  expect(
    await evaluateQuickJs({
      fields: [],
      source: '() => {if(typeof leaked !== "undefined") throw Error("leak"); return {fields:{}}}',
      values: {},
    })
  ).toEqual({});
});

test.each(
  [
    { unknown: undefined },
    { kind: { type: 'string', required: true, extra: undefined } },
    { kind: { type: 'invalid type', required: true } },
    { kind: { type: 'string', required: 'yes' } },
  ].map((fieldInfo) => ({ fieldInfo }))
)('rejects unknown or malformed field metadata %j', async ({ fieldInfo }) => {
  expect(
    await captureRejection(evaluateQuickJs({ fields: ['kind'], source: '() => ({fields:{}})', values: {}, fieldInfo }))
  ).toBeInstanceOf(Error);
});
