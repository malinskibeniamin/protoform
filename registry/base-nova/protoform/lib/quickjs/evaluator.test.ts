import { create } from "@bufbuild/protobuf";
import { expect, test } from "@rstest/core";
import { PresenceMatrixSchema } from "../../../../../conformance/gen/protoform/conformance/v1/conformance_pb";
import { evaluateQuickJs } from "./evaluator";

test("evaluates explicit schema fields, including fields without current values", async () => {
  expect(
    await evaluateQuickJs({
      fields: ["kind", "company"],
      source: 'form => ({fields:{company:{visible: form.kind === "business"}}})',
      values: { kind: "business" },
    })
  ).toEqual({ company: { visible: true } });
});

test.each([
  "() => ({fields:{invented:{visible:true}}})",
  '() => ({fields:{company:{value:"changed"}}})',
  '() => ({fields:{company:{disabled:"yes"}}})',
  "() => {while(true){}}",
  "() => {const a=[]; while(true) a.push(new Array(100000).fill(1))}",
  '() => {fetch("https://example.com"); return {fields:{}}}',
  '(form) => {form.kind="personal"; return {fields:{}}}',
  "(form) => ({",
  "async () => ({fields:{}})",
])("rejects unsafe or invalid rule %s", async (source) => {
  await expect(
    evaluateQuickJs({ fields: ["company", "kind"], source, values: { kind: "business" } })
  ).rejects.toThrow();
});

test.each([Number.POSITIVE_INFINITY, new Date(), new Uint8Array([1]), 1n].map((kind) => ({ kind })))(
  "rejects non-JSON inputs",
  async ({ kind }) => {
    await expect(
      evaluateQuickJs({ fields: ["kind"], source: "() => ({fields:{}})", values: { kind } })
    ).rejects.toThrow();
  }
);

test.each([
  'form => {form.kind[0].name = "mutated"; return {fields:{}}}',
  'form => {form.kind.push({name:"new"}); return {fields:{}}}',
])("nested guest snapshots cannot be mutated: %s", async (source) => {
  await expect(
    evaluateQuickJs({ fields: ["kind"], source, values: { kind: [{ name: "original" }] } })
  ).rejects.toThrow();
});

test("field metadata is frozen in the guest", async () => {
  await expect(
    evaluateQuickJs({
      fields: ["kind"],
      fieldInfo: { kind: { type: "string", required: false } },
      source: "(form, fields) => {fields.kind.required = true; return {fields:{}}}",
      values: {},
    })
  ).rejects.toThrow();
});

test("nested snapshot limits reject live objects, unsafe properties, cycles, and oversized trees", async () => {
  const circular: Record<string, unknown> = {};
  circular["self"] = circular;
  let deep: unknown = "leaf";
  for (let index = 0; index < 20; index += 1) {
    deep = { child: deep };
  }
  await Promise.all(
    [
      { child: new Date() },
      { child: Number.NaN },
      create(PresenceMatrixSchema),
      JSON.parse('{"__proto__":{"polluted":true}}'),
      circular,
      deep,
      Array.from({ length: 2001 }, () => null),
      ["x".repeat(17_000)],
      [undefined],
    ].map(async (kind) => {
      await expect(
        evaluateQuickJs({ fields: ["kind"], source: "() => ({fields:{}})", values: { kind } })
      ).rejects.toThrow();
    })
  );
  expect(
    await evaluateQuickJs({
      fields: ["kind"],
      source: 'form => ({fields:{kind:{visible: form.kind.nil === null && !("unset" in form.kind)}}})',
      values: { kind: { nil: null, unset: undefined, empty: [], nested: {} } },
    })
  ).toEqual({ kind: { visible: true } });
});

test.each([
  { fields: ["company", "company"], values: {} },
  { fields: ["__proto__"], values: {} },
  { fields: ["company"], values: { unknown: "value" } },
  { fields: ["company"], values: { company: "x".repeat(17_000) } },
])("rejects invalid host contracts", async (request) => {
  await expect(evaluateQuickJs({ ...request, source: "() => ({fields:{}})" })).rejects.toThrow();
});

test("a guest runtime cannot leave globals for the next evaluation", async () => {
  await evaluateQuickJs({ fields: [], source: "() => {globalThis.leaked = true;return {fields:{}}}", values: {} });
  await expect(
    evaluateQuickJs({
      fields: [],
      source: '() => {if(typeof leaked !== "undefined") throw Error("leak"); return {fields:{}}}',
      values: {},
    })
  ).resolves.toEqual({});
});

test.each(
  [
    { unknown: undefined },
    { kind: { type: "string", required: true, extra: undefined } },
    { kind: { type: "invalid type", required: true } },
    { kind: { type: "string", required: "yes" } },
  ].map((fieldInfo) => ({ fieldInfo }))
)("rejects unknown or malformed field metadata %j", async ({ fieldInfo }) => {
  await expect(
    evaluateQuickJs({ fields: ["kind"], source: "() => ({fields:{}})", values: {}, fieldInfo })
  ).rejects.toThrow();
});
