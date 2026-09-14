import { expect, test } from "vitest";
import { FormSession } from "./session";

test("failed evaluation retains last accepted presentation and user input, blocks submission, and recovers", async () => {
  const session = new FormSession({ companyName: "Acme" });
  await session.run("() => ({fields:{companyName:{disabled:true}}})");
  const accepted = session.snapshot.presentation;
  await session.run(
    "() => ({fields:{companyName:{disabled:false},hallucinated:{visible:true}}})",
  );
  expect(session.snapshot.presentation).toEqual(accepted);
  expect(session.snapshot.values).toEqual({ companyName: "Acme" });
  expect(session.snapshot.error).toContain("Unknown field");
  expect(session.snapshot.canSubmit).toBe(false);
  await session.run("() => ({fields:{companyName:{disabled:false}}})");
  expect(session.snapshot.canSubmit).toBe(true);
  expect(session.snapshot.error).toBeNull();
});

test("streaming fragments do not execute and stale results cannot overwrite a newer edit", async () => {
  const session = new FormSession({ companyName: "Acme" });
  await session.run("() => ({fields:{companyName:{disabled:true}}})");
  const accepted = session.snapshot.presentation;
  await session.run("() => { while(true) {}", false);
  expect(session.snapshot.presentation).toEqual(accepted);
  expect(session.snapshot.pending).toBe(true);
  expect(session.snapshot.canSubmit).toBe(false);
  const old = session.run("() => ({fields:{companyName:{disabled:true}}})");
  session.edit("companyName", "New name");
  const current = session.run(
    "() => ({fields:{companyName:{disabled:false}}})",
  );
  await Promise.all([old, current]);
  expect(session.snapshot.values.companyName).toBe("New name");
  expect(session.snapshot.presentation.companyName?.disabled).toBe(false);
  expect(session.snapshot.canSubmit).toBe(true);
});

test("an edit invalidates an in-flight result even without a replacement evaluation", async () => {
  const session = new FormSession({ companyName: "Acme" });
  await session.run("() => ({fields:{companyName:{disabled:false}}})");
  const pending = session.run("() => ({fields:{companyName:{disabled:true}}})");
  session.edit("companyName", "User edit");
  await pending;
  expect(session.snapshot.presentation.companyName?.disabled).toBe(false);
  expect(session.snapshot.values.companyName).toBe("User edit");
  expect(session.snapshot.canSubmit).toBe(false);
});
