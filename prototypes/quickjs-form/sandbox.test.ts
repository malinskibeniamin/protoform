import { expect, test } from "vitest";
import { evaluatePresentation } from "./sandbox";

const source = `(form) => ({fields: {
  companyName: {visible: form.accountType === "business"},
  personalName: {visible: form.accountType === "personal"},
  taxId: {visible: form.accountType === "business", disabled: !form.companyName}
}})`;
const values = {
  accountType: "business",
  companyName: "",
  personalName: "",
  taxId: "",
};

test("real QuickJS evaluation reveals business fields and disables tax ID until company name exists", async () => {
  expect(await evaluatePresentation(source, values)).toEqual({
    accountType: { visible: true, disabled: false },
    companyName: { visible: true, disabled: false },
    personalName: { visible: false, disabled: false },
    taxId: { visible: true, disabled: true },
  });
  expect(
    (await evaluatePresentation(source, { ...values, companyName: "Acme" }))
      .taxId,
  ).toEqual({ visible: true, disabled: false });
});

test.each([
  ["unknown field", "() => ({fields:{invented:{visible:true}}})"],
  ["wrong boolean", '() => ({fields:{companyName:{visible:"yes"}}})'],
  ["value mutation output", '() => ({fields:{companyName:{value:"changed"}}})'],
  ["incomplete code", "(form) => ({fields:"],
  ["thrown exception", '() => {throw new Error("oops")}'],
  ["infinite loop", "() => {while(true){}}"],
  [
    "memory exhaustion",
    "() => {const a=[]; while(true) a.push(new Array(100000).fill(1))}",
  ],
  [
    "oversized output",
    '() => ({fields:{companyName:{visible:"x".repeat(20000)}}})',
  ],
  ["promise output", "async () => ({fields:{}})"],
  [
    "snapshot mutation",
    '(form) => {form.companyName="changed"; return {fields:{}}}',
  ],
  ["network", '() => {fetch("https://example.com"); return {fields:{}}}'],
  ["DOM", '() => {document.body.textContent="changed"; return {fields:{}}}'],
  ["filesystem", '() => {require("fs"); return {fields:{}}}'],
])("rejects %s without mutating host values", async (_name, code) => {
  const before = structuredClone(values);
  await expect(evaluatePresentation(code, values)).rejects.toThrow();
  expect(values).toEqual(before);
});

test("fresh runtime prevents state leaking between evaluations", async () => {
  await evaluatePresentation(
    "() => {globalThis.leaked=true; return {fields:{}}}",
    values,
  );
  await expect(
    evaluatePresentation(
      '() => {if(typeof leaked !== "undefined") throw Error("leak"); return {fields:{}}}',
      values,
    ),
  ).resolves.toBeDefined();
});
