import { getQuickJS } from "quickjs-emscripten";

export type Values = Record<string, string | boolean | number | null>;
export type Presentation = Record<
  string,
  { visible: boolean; disabled: boolean }
>;
const MAX_TEXT = 16_384;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Prototype: complete synchronous function expression; flat scalar input; no streaming fragments.
export async function evaluatePresentation(
  source: string,
  values: Values,
): Promise<Presentation> {
  const input = JSON.stringify(values);
  if (source.length > MAX_TEXT || input.length > MAX_TEXT)
    throw new Error("Input too large");
  const QuickJS = await getQuickJS();
  const runtime = QuickJS.newRuntime();
  runtime.setMemoryLimit(8 * 1024 * 1024);
  runtime.setMaxStackSize(256 * 1024);
  const deadline = performance.now() + 50;
  runtime.setInterruptHandler(() => performance.now() >= deadline);
  const context = runtime.newContext();
  try {
    // No host functions or module loader. Capture serialization before running untrusted code.
    const result = context.evalCode(
      `"use strict"; (() => {
      const stringify = JSON.stringify.bind(JSON);
      const form = Object.freeze(JSON.parse(${JSON.stringify(input)}));
      const evaluate = (${source}\n);
      return stringify(evaluate(form));
    })()`,
      "form-rule.js",
    );
    if (result.error) {
      result.error.dispose();
      throw new Error("Script failed, exceeded resources, or is incomplete");
    }
    let text: string;
    try {
      if (context.typeof(result.value) !== "string")
        throw new Error("Expected JSON output");
      text = context.getString(result.value);
    } finally {
      result.value.dispose();
    }
    if (text.length > MAX_TEXT) throw new Error("Output too large");
    const output: unknown = JSON.parse(text);
    if (
      !isRecord(output) ||
      Object.keys(output).length !== 1 ||
      !isRecord(output.fields)
    ) {
      throw new Error("Expected only a fields object");
    }
    const presentation: Presentation = Object.fromEntries(
      Object.keys(values).map((key) => [
        key,
        { visible: true, disabled: false },
      ]),
    );
    for (const [field, config] of Object.entries(output.fields)) {
      if (!Object.hasOwn(values, field))
        throw new Error(`Unknown field: ${field}`);
      if (!isRecord(config)) throw new Error(`Invalid presentation: ${field}`);
      for (const [key, value] of Object.entries(config)) {
        if (
          (key !== "visible" && key !== "disabled") ||
          typeof value !== "boolean"
        ) {
          throw new Error(`Unsupported presentation property: ${field}.${key}`);
        }
      }
      presentation[field] = {
        visible: config.visible !== false,
        disabled: config.disabled === true,
      };
    }
    return presentation;
  } finally {
    context.dispose();
    runtime.dispose();
  }
}
