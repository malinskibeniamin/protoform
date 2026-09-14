import { expect, test } from "@rstest/core";
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

test.each([Number.POSITIVE_INFINITY, {}, undefined, ["business"]].map((kind) => ({ kind })))(
  "rejects non-scalar inputs",
  async ({ kind }) => {
    await expect(
      evaluateQuickJs({ fields: ["kind"], source: "() => ({fields:{}})", values: { kind } })
    ).rejects.toThrow();
  }
);

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
