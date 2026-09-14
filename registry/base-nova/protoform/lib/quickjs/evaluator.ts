import { getQuickJS } from "quickjs-emscripten";

import {
  isRecord,
  parseQuickJsPresentation,
  parseQuickJsRequest,
  QUICKJS_TEXT_LIMIT,
  type QuickJsPresentation,
} from "./contract";

/** Worker implementation. Use the worker client from a browser UI, not this function. */
export async function evaluateQuickJs(request: unknown): Promise<QuickJsPresentation> {
  const { source, values, fields } = parseQuickJsRequest(request);
  const input = JSON.stringify(values);
  if (source.length > QUICKJS_TEXT_LIMIT || input.length > QUICKJS_TEXT_LIMIT) {
    throw new Error("Input too large");
  }
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
      "form-rule.js"
    );
    if (result.error) {
      result.error.dispose();
      throw new Error("Script failed, exceeded resources, or is incomplete");
    }
    let text: string;
    try {
      if (context.typeof(result.value) !== "string") {
        throw new Error("Expected JSON output");
      }
      text = context.getString(result.value);
    } finally {
      result.value.dispose();
    }
    if (text.length > QUICKJS_TEXT_LIMIT) {
      throw new Error("Output too large");
    }
    const output: unknown = JSON.parse(text);
    if (!isRecord(output) || Object.keys(output).length !== 1 || !isRecord(output["fields"])) {
      throw new Error("Expected only a fields object");
    }
    return parseQuickJsPresentation(output["fields"], fields);
  } finally {
    context.dispose();
    runtime.dispose();
  }
}
