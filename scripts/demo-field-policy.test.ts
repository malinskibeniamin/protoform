import { readdirSync, readFileSync } from "node:fs";
import { relative } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const repositoryDirectory = new URL("../", import.meta.url);
const docsDirectory = new URL("../content/docs/", import.meta.url);
const demoDirectories = [
  new URL("../examples/", import.meta.url),
  new URL("../islands/", import.meta.url),
  new URL("../registry/base-nova/protoform/demo/", import.meta.url),
] as const;
const controlNames = new Set([
  "Checkbox",
  "Combobox",
  "DatePicker",
  "Input",
  "RadioGroup",
  "Select",
  "Slider",
  "Switch",
  "Textarea",
  "ToggleGroup",
]);
const tsxFencePattern = /```tsx[^\n]*\n([\s\S]*?)\n```/gu;

function findFiles(directory: URL, extension: string): URL[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryUrl = new URL(entry.name, directory);

    if (entry.isDirectory()) {
      return findFiles(new URL(`${entry.name}/`, directory), extension);
    }

    return entry.name.endsWith(extension) && !entry.name.includes(".test.")
      ? [entryUrl]
      : [];
  });
}

function isHiddenInput(
  node: ts.JsxOpeningLikeElement,
  sourceFile: ts.SourceFile
): boolean {
  if (node.tagName.getText(sourceFile) !== "Input") {
    return false;
  }

  return node.attributes.properties.some(
    (attribute) =>
      ts.isJsxAttribute(attribute) &&
      attribute.name.getText(sourceFile) === "type" &&
      attribute.initializer !== undefined &&
      ts.isStringLiteral(attribute.initializer) &&
      attribute.initializer.text === "hidden"
  );
}

function hasFieldAncestor(node: ts.Node, sourceFile: ts.SourceFile): boolean {
  let ancestor = node.parent;

  while (ancestor) {
    if (
      ts.isJsxElement(ancestor) &&
      ancestor.openingElement.tagName.getText(sourceFile) === "Field"
    ) {
      return true;
    }
    ancestor = ancestor.parent;
  }

  return false;
}

function findUnwrappedControls(file: URL): string[] {
  const source = readFileSync(file, "utf8");
  const fileName = relative(repositoryDirectory.pathname, file.pathname);

  return findUnwrappedControlsInSource(source, fileName);
}

function findUnwrappedControlsInSource(
  source: string,
  fileName: string
): string[] {
  const sourceFile = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const violations: string[] = [];

  function visit(node: ts.Node) {
    if (
      (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
      controlNames.has(node.tagName.getText(sourceFile)) &&
      !isHiddenInput(node, sourceFile) &&
      !hasFieldAncestor(node, sourceFile)
    ) {
      const position = sourceFile.getLineAndCharacterOfPosition(
        node.getStart()
      );
      violations.push(
        `${fileName}:${position.line + 1} <${node.tagName.getText(sourceFile)}>`
      );
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return violations;
}

describe("demo Field policy", () => {
  it("wraps every visible shadcn control in Field", () => {
    const violations = demoDirectories.flatMap((directory) =>
      findFiles(directory, ".tsx").flatMap(findUnwrappedControls)
    );

    expect(violations).toEqual([]);
  });

  it("wraps every visible shadcn control in docs examples in Field", () => {
    const violations = findFiles(docsDirectory, ".mdx").flatMap((file) => {
      const content = readFileSync(file, "utf8");
      const fileName = relative(repositoryDirectory.pathname, file.pathname);

      return [...content.matchAll(tsxFencePattern)].flatMap((match, index) =>
        findUnwrappedControlsInSource(
          match[1] ?? "",
          `${fileName}#tsx-${index + 1}`
        )
      );
    });

    expect(violations).toEqual([]);
  });
});
