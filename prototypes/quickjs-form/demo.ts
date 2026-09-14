import { FormSession } from "./session";

const rule = `(form) => ({fields: {
  companyName: {visible: form.accountType === "business"},
  personalName: {visible: form.accountType === "personal"},
  taxId: {visible: form.accountType === "business", disabled: !form.companyName}
}})`;
const form = new FormSession({
  accountType: "personal",
  companyName: "",
  personalName: "Sam",
  taxId: "",
});
function show(label: string) {
  const state = form.snapshot;
  console.log(`\n${label}`);
  for (const [field, presentation] of Object.entries(state.presentation)) {
    console.log(
      `  ${field}: ${presentation.visible ? (presentation.disabled ? "disabled" : "editable") : "hidden"}`,
    );
  }
  console.log(
    `  status: ${state.pending ? "waiting for complete script" : (state.error ?? "ready")}`,
  );
  console.log(
    `  can submit: ${state.canSubmit}; company name retained: ${JSON.stringify(state.values.companyName)}`,
  );
}
await form.run(rule);
show("1. Personal account");
form.edit("accountType", "business");
await form.run(rule);
show("2. Business account → company appears; tax ID disabled");
form.edit("companyName", "Acme");
await form.run(rule);
show("3. Company entered → tax ID enabled");
await form.run("(form) => ({", false);
show(
  "4. Streaming fragment → previous presentation retained; submission blocked",
);
await form.run(
  "() => ({fields:{companyName:{visible:false},invented:{visible:true}}})",
);
show("5. Hallucinated field → entire proposal rejected, not partially applied");
const start = performance.now();
await form.run("() => {while(true){}}");
show(`6. Infinite loop rejected (${Math.round(performance.now() - start)} ms)`);
form.edit("accountType", "personal");
await form.run(rule);
show("7. Recovery → personal fields restored; hidden company value retained");
