import { existsSync, readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { demoCatalog } from "../examples/catalog/demo-catalog.js";
import { demoRedirects } from "../examples/catalog/demo-docs.js";
import {
  getReadinessSummary,
  readinessRequirements,
} from "../readiness/profile.js";

const docsDirectory = new URL("../content/docs/", import.meta.url);
const repositoryDirectory = new URL("../", import.meta.url);
const frontmatterTitlePattern = /^---\n[\s\S]*?^title:\s*(.+)\n[\s\S]*?^---$/m;
const mermaidStartPattern = /```mermaid\n([^\n]+)/g;
const protoFencePattern = /```proto\n([\s\S]*?)\n```/g;
const fencedBlockPattern = /```([^\n]*)\n([\s\S]*?)\n```/g;
const standaloneCelPattern = /^(?:!?this\.|has\()/;
const remoteFontProviderPattern =
  /provider: "(?:google|fontsource|bunny|fontshare)"/u;
const GENERAL_AIP_NUMBERS = [
  1, 2, 3, 8, 9, 100, 111, 121, 122, 123, 124, 126, 127, 128, 129, 130, 131,
  132, 133, 134, 135, 136, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149,
  151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165,
  180, 181, 182, 185, 190, 191, 192, 193, 194, 200, 202, 203, 205, 210, 211,
  213, 214, 215, 216, 217, 231, 233, 234, 235, 236,
] as const;
const localizedDocsDirectories = new Set(["pl", "zh", "zh-TW"]);
const unscopedProtoDeclarationPattern =
  /^(?:option\s|(?:(?:optional|repeated)\s+)?(?:bool|bytes|double|fixed32|fixed64|float|int32|int64|sfixed32|sfixed64|sint32|sint64|string|uint32|uint64|[A-Z]\w*(?:\.\w+)*)\s+\w+\s*=)/;

function findFiles(directory: URL, extension: string): URL[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryUrl = new URL(entry.name, directory);

    if (entry.isDirectory()) {
      return findFiles(new URL(`${entry.name}/`, directory), extension);
    }

    return entry.name.endsWith(extension) ? [entryUrl] : [];
  });
}

function findEnglishDocsFiles(extension: string): URL[] {
  return findFiles(docsDirectory, extension).filter((file) => {
    const relativePath = file.pathname.slice(docsDirectory.pathname.length);
    const [topLevelDirectory = ""] = relativePath.split("/");

    return !localizedDocsDirectories.has(topLevelDirectory);
  });
}

function readDocs(): Array<{ content: string; file: string }> {
  return findEnglishDocsFiles(".mdx").map((file) => ({
    content: readFileSync(file, "utf8"),
    file: file.pathname.slice(docsDirectory.pathname.length),
  }));
}

function readDoc(fileName: string): string {
  const matches = findEnglishDocsFiles(".mdx").filter(
    (file) => file.pathname.split("/").at(-1) === fileName
  );

  if (matches.length !== 1) {
    throw new Error(`Expected one docs file named ${fileName}`);
  }

  return readFileSync(matches[0], "utf8");
}

function readNavigation(): string {
  return findEnglishDocsFiles("meta.ts")
    .map((file) => readFileSync(file, "utf8"))
    .join("\n");
}

function getFrontmatterTitle(content: string): string | undefined {
  return content.match(frontmatterTitlePattern)?.[1];
}

function getMarkdownHeadings(content: string): string[] {
  const headings: string[] = [];
  let inFence = false;

  for (const line of content.split("\n")) {
    if (line.startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (!inFence && line.startsWith("# ")) {
      headings.push(line.slice(2).trim());
    }
  }

  return headings;
}

describe("docs content policy", () => {
  it("publishes the supported preset lab as a dedicated docs destination", () => {
    const navigation = readFileSync(
      new URL("content/docs/meta.ts", repositoryDirectory),
      "utf8"
    );
    const content = readDoc("presets.mdx");

    expect(navigation).toContain('"presets"');
    expect(content).toContain("<PresetLab />");
    expect(content).toContain("Base UI + Nova");
    expect(content).toContain("not simulated");
  });

  it("orders focused examples from a bare-bones form to the kitchen sink", () => {
    const navigation = readFileSync(
      new URL("content/docs/(examples)/meta.ts", repositoryDirectory),
      "utf8"
    );
    const expectedPages = [
      "bare-bones-form",
      "two-step-form",
      "deeply-nested",
      "cel-re2-form",
      "oneof-form",
      "server-error-form",
      "aip-resource-form",
      "kitchen-sink",
    ];

    const positions = expectedPages.map((page) =>
      navigation.indexOf(`"${page}"`)
    );

    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual(
      [...positions].toSorted((left, right) => left - right)
    );
    expect(navigation).not.toContain('"complex-example"');
  });

  it("gives every learning-path example one level, prerequisite, and live demo", () => {
    const examples = [
      ["bare-bones-form.mdx", "Level 1 of 8", "BareBonesFormExample"],
      ["two-step-form.mdx", "Level 2 of 8", "TwoStepFormExample"],
      ["deeply-nested.mdx", "Level 3 of 8", "DeeplyNestedFormExample"],
      ["cel-re2-form.mdx", "Level 4 of 8", "CelRe2FormExample"],
      ["oneof-form.mdx", "Level 5 of 8", "OneofFormExample"],
      ["server-error-form.mdx", "Level 6 of 8", "ServerErrorFormExample"],
      ["aip-resource-form.mdx", "Level 7 of 8", "AipResourceFormExample"],
      ["kitchen-sink.mdx", "Level 8 of 8", "KitchenSinkExample"],
    ] as const;

    for (const [file, level, island] of examples) {
      const content = readDoc(file);
      expect(content, file).toContain(`**${level}**`);
      expect(content, file).toContain("**Prerequisite:**");
      expect(content, file).toContain("## What this adds");
      expect(content, file).toContain(`<${island} />`);
    }
  });

  it("maps native shadcn semantic colors into the Blume theme", () => {
    const theme = readFileSync(
      new URL("theme.css", repositoryDirectory),
      "utf8"
    );

    for (const token of [
      "--color-primary:",
      "--color-primary-foreground:",
      "--color-card:",
      "--color-input:",
      "--color-ring:",
      "--color-destructive:",
    ]) {
      expect(theme).toContain(token);
    }
    expect(theme).toContain("--background: var(--blume-background);");
    expect(theme).toContain("--foreground: var(--blume-foreground);");
    expect(theme).toContain("--color-background: var(--background);");
    expect(theme).toContain("--color-primary: var(--primary);");
  });

  it("presents interactive examples as open product surfaces instead of nested cards", () => {
    const exampleFiles = [
      "aip-resource-form.mdx",
      "bare-bones-form.mdx",
      "cel-re2-form.mdx",
      "deeply-nested.mdx",
      "kitchen-sink.mdx",
      "oneof-form.mdx",
      "server-error-form.mdx",
      "two-step-form.mdx",
    ];

    for (const file of exampleFiles) {
      const content = readDoc(file);
      expect(content).toContain(
        'className="my-8 border-y border-border/60 py-8"'
      );
      expect(content).not.toContain("rounded-2xl border p-6");
    }
  });

  it("keeps the documented readiness counts synchronized with the profile", () => {
    const content = readDoc("production-readiness.mdx");
    const normalizedContent = content.replace(/\s+/g, " ");
    const summary = getReadinessSummary(readinessRequirements);

    expect(normalizedContent).toContain(
      `${summary.verified} of ${summary.applicable} applicable checks verified`
    );
    expect(normalizedContent).toContain(
      `${summary.excluded} excluded checks stay visible without affecting the percentage`
    );
  });

  it("uses Blume as the only docs runtime", () => {
    const manifest = JSON.parse(
      readFileSync(new URL("package.json", repositoryDirectory), "utf8")
    ) as {
      dependencies?: Record<string, string>;
      scripts?: Record<string, string>;
    };
    const legacyFiles = ["app", "source.config.ts", "vite.config.ts"];
    const legacyDependencies = [
      "@tanstack/react-start",
      "beautiful-mermaid",
      "fumadocs-core",
      "fumadocs-mdx",
      "fumadocs-ui",
    ];

    expect(manifest.scripts?.dev).toBe("blume dev --port 55011");
    expect(manifest.scripts?.build).toContain("blume build --strict");
    expect(manifest.scripts?.start).toBe(
      "blume preview --host 0.0.0.0 --port 8080"
    );
    expect(manifest.scripts?.["docs:blume:audit"]).toBe(
      "blume audit --fail-on info --skip url_style"
    );
    expect(manifest.scripts?.["docs:blume:check"]).toBe(
      "blume check --strict --isolated"
    );
    expect(manifest.scripts?.["docs:blume:eval"]).toBe(
      "blume eval --agent codex --threshold 1 --timeout 45"
    );
    expect(manifest.scripts?.typecheck).toContain("bun run docs:blume:check");
    expect(manifest.scripts?.["quality:gate"]).toContain(
      "bun run build && bun run docs:blume:audit"
    );
    expect(manifest.dependencies?.blume).toBe("1.4.2");
    expect(
      manifest.dependencies?.["@modelcontextprotocol/sdk"]
    ).toBeUndefined();
    expect(manifest.dependencies?.["@orama/orama"]).toBe("^3.1.18");
    expect(manifest.scripts?.["docs:blume:e2e"]).toContain(
      "astro preview --root .blume-verify"
    );
    expect(
      legacyFiles.filter((file) =>
        existsSync(new URL(file, repositoryDirectory))
      )
    ).toEqual([]);
    expect(
      legacyDependencies.filter((name) => manifest.dependencies?.[name])
    ).toEqual([]);
  });

  it("tests six critical documentation promises with Blume eval", () => {
    const evals = readFileSync(
      new URL("evals.yaml", repositoryDirectory),
      "utf8"
    );
    const questionIds = [...evals.matchAll(/^ {2}- id: ([a-z0-9-]+)$/gmu)].map(
      (match) => match[1]
    );

    expect(questionIds).toEqual([
      "install-protoform",
      "choose-form-engine",
      "migrate-protobuf-v1",
      "submit-auto-form-update",
      "switch-oneof-branch",
      "handle-server-errors",
    ]);
    expect(evals.match(/^ {4}expected:$/gmu)).toHaveLength(6);
    expect(evals.match(/^ {4}routes:$/gmu)).toHaveLength(6);
  });

  it("uses Blume's complete static and example surface", () => {
    const config = readFileSync(
      new URL("blume.config.ts", repositoryDirectory),
      "utf8"
    );
    const workflow = readFileSync(
      new URL(".github/workflows/quality.yml", repositoryDirectory),
      "utf8"
    );
    const migrationPlaybook = readDoc("llm-migration-playbook.mdx");

    expect(config).toContain('site: "https://protoform.pages.dev"');
    expect(config).not.toContain('adapter: "');
    expect(config).not.toContain('output: "server"');
    expect(config).not.toContain("mcp:");
    expect(config).toContain("openapi:");
    expect(config).toContain('renderer: "blume"');
    expect(config).toContain('route: "/reference"');
    expect(config).toContain('spec: "./openapi.yaml"');
    expect(config).toContain(
      "registry/base-nova/protoform/demo/catalog/!(*.test).tsx"
    );
    expect(config).toContain('css: "theme.css"');
    expect(migrationPlaybook).toContain("```ts twoslash");
    expect(workflow).toContain("bun run quality:gate");
    expect(readFileSync("package.json", "utf8")).toContain(
      "bun run docs:blume:audit"
    );
  });

  it("keeps documentation builds independent of remote font hosts", () => {
    const config = readFileSync(
      new URL("blume.config.ts", repositoryDirectory),
      "utf8"
    );
    const packageJson = readFileSync(
      new URL("package.json", repositoryDirectory),
      "utf8"
    );

    expect(config).toContain(
      "node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2"
    );
    expect(config).toContain(
      "node_modules/@fontsource-variable/inter-tight/files/inter-tight-latin-wght-normal.woff2"
    );
    expect(config).toContain(
      "node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2"
    );
    expect(config).not.toMatch(remoteFontProviderPattern);
    expect(packageJson).toContain('"@fontsource-variable/inter": "5.3.0"');
    expect(packageJson).toContain(
      '"@fontsource-variable/inter-tight": "5.3.0"'
    );
    expect(packageJson).toContain('"@fontsource/ibm-plex-mono": "5.3.0"');
  });

  it("publishes the real CreateBook RPC through OpenAPI and a Component demo", () => {
    const config = readFileSync(
      new URL("blume.config.ts", repositoryDirectory),
      "utf8"
    );
    const spec = readFileSync(
      new URL("openapi.yaml", repositoryDirectory),
      "utf8"
    );
    const proto = readFileSync(
      new URL(
        "conformance/proto/protoform/conformance/v1/aip.proto",
        repositoryDirectory
      ),
      "utf8"
    );
    const page = readDoc("protobuf-examples.mdx");
    const demo = demoCatalog.find(
      (candidate) => candidate.slug === "bufbuild-descriptors"
    );
    const component = readFileSync(
      new URL(
        "registry/base-nova/protoform/demo/catalog/bufbuild-descriptors.tsx",
        repositoryDirectory
      ),
      "utf8"
    );

    expect(config).toContain(
      "registry/base-nova/protoform/demo/catalog/!(*.test).tsx"
    );
    expect(page).toContain('<DemoHub category="protobuf" />');
    expect(demo).toMatchObject({
      category: "protobuf",
      schemaKey: "create-book",
    });
    expect(demoRedirects).toContainEqual({
      from: "/example-bufbuild-descriptors",
      status: 308,
      to: "/protobuf-examples#bufbuild-descriptors",
    });
    expect(proto).toContain("service LibraryService");
    expect(proto).toContain("rpc CreateBook(CreateBookRequest) returns (Book)");
    expect(component).toContain("LibraryService.method.createBook");
    expect(component).toContain("const schema = method.input");
    expect(component).toContain("<AutoForm");
    expect(component).not.toContain("RegistryCapabilityDemo");
    expect(spec).toContain(
      "/protoform.conformance.v1.LibraryService/CreateBook:"
    );
    expect(spec).toContain(
      "operationId: protoform.conformance.v1.LibraryService.CreateBook"
    );
  });

  it("does not repeat a frontmatter title as a body heading", () => {
    const duplicates = readDocs().flatMap(({ content, file }) => {
      const title = getFrontmatterTitle(content);
      return getMarkdownHeadings(content).includes(title ?? "") ? [file] : [];
    });

    expect(duplicates).toEqual([]);
  });

  it("uses readable top-down Mermaid flowcharts", () => {
    const unreadableDiagrams = readDocs().flatMap(({ content, file }) => {
      const diagrams = [...content.matchAll(mermaidStartPattern)];
      return diagrams.some((diagram) => diagram[1] !== "flowchart TD")
        ? [file]
        : [];
    });

    expect(unreadableDiagrams).toEqual([]);
  });

  it("keeps diagram implementation guidance off the landing page", () => {
    const content = readDoc("index.mdx");

    expect(content).not.toContain("## Inspect diagrams");
    expect(content).not.toContain("data-architecture-diagram");
  });

  it("scopes protobuf snippets so the highlighter can tokenize declarations", () => {
    const unscopedSnippets = readDocs().flatMap(({ content, file }) =>
      [...content.matchAll(protoFencePattern)].some((match) =>
        unscopedProtoDeclarationPattern.test(match[1]?.trimStart() ?? "")
      )
        ? [file]
        : []
    );

    expect(unscopedSnippets).toEqual([]);
  });

  it("syntax-highlights standalone CEL expressions", () => {
    const unhighlightedExpressions = readDocs().flatMap(({ content, file }) => {
      const hasUnhighlightedExpression = [
        ...content.matchAll(fencedBlockPattern),
      ].some((match) => {
        const info = match[1]?.trim() ?? "";
        const source = match[2]?.trimStart() ?? "";
        return standaloneCelPattern.test(source) && info !== "js CEL";
      });

      return hasUnhighlightedExpression ? [file] : [];
    });

    expect(unhighlightedExpressions).toEqual([]);
  });

  it("documents the complete CEL capability profile and its gaps", () => {
    const content = readDoc("cel-expressions.mdx");
    const requiredTerms = [
      "Syntax, literals, and types",
      "all",
      "exists",
      "exists_one",
      "filter",
      "map",
      "Protobuf messages",
      "enums",
      "presence",
      "timestamps",
      "durations",
      "Parse → check → evaluate",
      "compile cache",
      "UI expression profile",
      "cost limit",
      "unsupported",
    ];

    expect(
      requiredTerms.filter((term) => !content.includes(term)),
      "Missing CEL capability guidance"
    ).toEqual([]);
  });

  it("uses product-neutral oneof and server-error examples", () => {
    const oneofContent = readDoc("oneof-edge-cases.mdx");
    const serverErrorContent = readDoc("server-errors.mdx");

    expect(oneofContent).toContain(
      'form.setOneofValue("delivery", "webhook", {'
    );
    expect(oneofContent).toContain("delivery.webhook.signing_secret_ref");
    expect(serverErrorContent).toContain(
      "notification.delivery.webhook.signing_secret_ref"
    );
    expect(serverErrorContent).toContain("delivery.value.signingSecretRef");
  });

  it("documents the AIP resource and standard-method invariants", () => {
    const content = readDoc("aip-protobuf.mdx");
    const requiredTerms = [
      "IDENTIFIER",
      "connector_id",
      "parent",
      "update_mask",
      "page_token",
      "filter",
      "order_by",
      "etag",
      "long-running operation",
      "createUpdateMask",
      "context.updateMask",
      "createFieldMask",
      "native React Hook Form or TanStack Form dirty state",
      "repeated fields collapse",
      "Read masks are explicit",
    ];

    expect(
      requiredTerms.filter((term) => !content.includes(term)),
      "Missing AIP invariants"
    ).toEqual([]);
  });

  it("documents the complete General AIP catalog without scoring backend or documentation claims", () => {
    const content = readDoc("aip-protobuf.mdx");
    const requiredTerms = [
      "complete General AIP catalog",
      "Executable conformance",
      "Static schema check",
      "Deferred",
      "External",
      "Documentation-only does not count",
      "resource revisions",
      "soft delete",
      "partial responses",
      "sensitive fields",
      "request IDs",
      "validate_only",
      "batch methods",
    ];

    expect(
      requiredTerms.filter((term) => !content.includes(term)),
      "Missing full-catalog AIP guidance"
    ).toEqual([]);
    expect(
      GENERAL_AIP_NUMBERS.filter(
        (number) =>
          !content.includes(`[AIP-${number}](https://google.aip.dev/${number})`)
      ),
      "Missing linked General AIP catalog entries"
    ).toEqual([]);
  });

  it("documents the Standard Schema interoperability seam", () => {
    const content = readDoc("protovalidate.mdx");
    const requiredTerms = [
      "Standard Schema",
      "createProtoFormSchema",
      "standardSchemaResolver",
      "protobuf-specific error mapping",
    ];

    expect(
      requiredTerms.filter((term) => !content.includes(term)),
      "Missing Standard Schema guidance"
    ).toEqual([]);
  });

  it("documents complete Standard Schema v1 support on a dedicated page", () => {
    const content = readDoc("standard-schema.mdx");
    const navigation = readNavigation();
    const requiredTerms = [
      "Capability matrix",
      "Architecture boundary",
      "Object implementations",
      "Callable implementations",
      "Synchronous validation",
      "Asynchronous validation",
      "Nested issues",
      "Root issues",
      "Typed output",
      "libraryOptions",
      "Zod 4",
      "Zod Mini",
      "SchemaProvider",
      "createFormikValidator",
      "createFinalFormValidator",
      "flowchart TD",
    ];

    expect(navigation).toContain('"standard-schema"');
    expect(
      requiredTerms.filter((term) => !content.includes(term)),
      "Missing dedicated Standard Schema guidance"
    ).toEqual([]);
  });

  it("documents the native TanStack Form hook and AutoForm path", () => {
    const content = readDoc("tanstack-form.mdx");
    const conformanceConfig = readFileSync(
      new URL("vitest.conformance.config.ts", repositoryDirectory),
      "utf8"
    );
    const requiredTerms = [
      "@protoform/use-proto-form-tanstack",
      "@protoform/auto-form-tanstack",
      "useProtoForm",
      "native `Field`, `Subscribe`, store",
      "createMessage",
      "createUpdateMask",
      "setServerErrors",
      "formOptions",
      "validationMode",
      "createProtoFormSchema",
      "validators",
      "onSubmit",
      "React Hook Form",
    ];

    expect(
      requiredTerms.filter((term) => !content.includes(term)),
      "Missing TanStack Form guidance"
    ).toEqual([]);
    expect(conformanceConfig).toContain(
      "examples/tanstack/tanstack-form.test.tsx"
    );
  });

  it("documents the separate experimental TanStack Form v2 path", () => {
    const content = readDoc("tanstack-form.mdx");
    const requiredTerms = [
      "@protoform/use-proto-form-tanstack-v2",
      "@protoform/auto-form-tanstack-v2",
      "2.0.0-alpha.0",
      "form.atom",
      "field.value",
      "field.errors",
      "validators: [",
      "ArrayField",
      "createValidationError",
      "schemaOutputs",
      "unmounted",
      "[]",
    ];

    expect(
      requiredTerms.filter((term) => !content.includes(term)),
      "Missing experimental TanStack Form v2 guidance"
    ).toEqual([]);
  });

  it("documents the canonical Connect Query mutation path", () => {
    const content = readDoc("server-error-form.mdx");
    const requiredTerms = [
      "TransportProvider",
      "QueryClientProvider",
      "useMutation",
      "FormExamplesService.method.submitBasicForm",
      "mutateAsync",
      "isPending",
      "applyServerFieldErrors",
      "formExamplesService",
      "createClient",
    ];

    expect(
      requiredTerms.filter((term) => !content.includes(term)),
      "Missing canonical Connect Query mutation guidance"
    ).toEqual([]);
  });

  it("documents production-shaped API recipes without inventing another form RPC", () => {
    const content = readDoc("api-recipes.mdx");
    const navigation = readNavigation();
    const requiredTerms = [
      "FormExamplesService.method.submitBasicForm",
      "TransportProvider",
      "QueryClientProvider",
      "interceptors",
      "Authorization",
      "X-Request-ID",
      "useMutation",
      "isPending",
      "mutation.error",
      "callUnaryMethod",
      "AbortController",
      "createRouterTransport",
      "createQueryOptions",
      "createConnectQueryKey",
      "invalidateQueries",
      "createUpdateMask",
      "Code.InvalidArgument",
      "BadRequestSchema",
      "no automatic retry",
      "No second dummy mutation",
    ];

    expect(navigation).toContain('"api-recipes"');
    expect(
      requiredTerms.filter((term) => !content.includes(term)),
      "Missing production-shaped API recipes"
    ).toEqual([]);
  });

  it("documents Protobuf-ES v1 as an isolated migration bridge", () => {
    const content = readDoc("protobuf-v2-migration.mdx");
    const requiredTerms = [
      "@protoform/protobuf-v1-bridge",
      "createProtobufV1Provider",
      "temporary migration bridge",
      "proto2 and proto3",
      "does not provide Protovalidate or CEL parity",
      "remove the bridge",
    ];

    expect(
      requiredTerms.filter((term) => !content.includes(term)),
      "Missing Protobuf-ES v1 bridge guidance"
    ).toEqual([]);
  });

  it.each([
    [
      "formik.mdx",
      [
        "createFormikValidator",
        "Standard Schema",
        "typed protobuf message",
        "structured server errors",
      ],
    ],
    [
      "final-form.mdx",
      [
        "createFinalFormValidator",
        "Standard Schema",
        "FORM_ERROR",
        "typed protobuf message",
        "structured server errors",
      ],
    ],
  ] as const)("documents the %s adapter", (file, requiredTerms) => {
    const content = readDoc(file);

    expect(
      requiredTerms.filter((term) => !content.includes(term)),
      `Missing form-library adapter guidance in ${file}`
    ).toEqual([]);
  });

  it("documents semantic migration from Yup", () => {
    const content = readDoc("yup-migration.mdx");
    const requiredTerms = [
      "yup.object",
      "buf.validate",
      "required()",
      "nullable()",
      "optional",
      "transform()",
      "when()",
      "test()",
      "abortEarly",
      "RE2",
      "CEL",
      "oneof",
      "defaultValues",
      "setServerErrors",
      "buf lint",
      "buf breaking",
      "parity fixtures",
    ];

    expect(
      requiredTerms.filter((term) => !content.includes(term)),
      "Missing Yup migration guidance"
    ).toEqual([]);
  });

  it("documents migration from Protobuf-ES v1 to v2", () => {
    const content = readDoc("protobuf-v2-migration.mdx");
    const navigation = readNavigation();
    const requiredTerms = [
      "Protobuf-ES",
      "not a proto2-to-proto3 migration",
      "@bufbuild/protobuf",
      "@bufbuild/protoc-gen-es",
      "create(",
      "Schema",
      "toBinary",
      "fromBinary",
      "toJson",
      "fromJson",
      "buf config migrate --diff",
      "configuration files only",
      "include_imports",
      "import_extension=js",
      "ts_nocheck=true",
      "codegenv1",
      "no official call-site codemod",
      "bun run proto:generate",
      "parallel",
    ];

    expect(navigation).toContain('"protobuf-v2-migration"');
    expect(
      requiredTerms.filter((term) => !content.includes(term)),
      "Missing Protobuf-ES v2 migration guidance"
    ).toEqual([]);
  });

  it("keeps the Protoform conformance suite first-class", () => {
    const content = readDoc("conformance.mdx");
    const manifest = JSON.parse(
      readFileSync(new URL("package.json", repositoryDirectory), "utf8")
    ) as { scripts?: Record<string, string> };
    const requiredTerms = [
      "bun run test:conformance",
      "required",
      "recommended",
      "Standard Schema",
      "form-shaped paths",
      "round-trip",
      "CI",
    ];

    expect(manifest.scripts?.["test:conformance"]).toBeDefined();
    expect(manifest.scripts?.["quality:gate"]).toContain("test:conformance");
    expect(
      requiredTerms.filter((term) => !content.includes(term)),
      "Missing conformance-suite guidance"
    ).toEqual([]);
  });

  it("documents one real-stack Protoform integration test", () => {
    const content = readDoc("testing-forms.mdx");
    const exampleTest = readFileSync(
      new URL("examples/basic/basic-form.test.tsx", repositoryDirectory),
      "utf8"
    );
    const navigation = readFileSync(
      new URL("content/docs/(production)/meta.ts", repositoryDirectory),
      "utf8"
    );
    const requiredTerms = [
      "Vitest",
      "@testing-library/react",
      "userEvent.setup()",
      "buildExampleServer",
      "port: 0",
      "findByRole",
      "aria-invalid",
      "real-stack integration",
    ];

    expect(navigation.indexOf('"testing-forms"')).toBeGreaterThanOrEqual(0);
    expect(navigation.indexOf('"testing-forms"')).toBeLessThan(
      navigation.indexOf('"conformance"')
    );
    expect(
      requiredTerms.filter((term) => !content.includes(term)),
      "Missing consumer testing guidance"
    ).toEqual([]);
    expect(content).not.toContain("createRouterTransport");
    expect(content).not.toContain("@connectrpc/connect-playwright");
    expect(exampleTest).toContain("buildExampleServer()");
    expect(exampleTest).toContain("port: 0");
    expect(exampleTest).toContain('screen.findByRole("status")');
    expect(exampleTest).toContain('"aria-invalid"');
  });

  it("publishes a machine-readable production-readiness profile", () => {
    const content = readDoc("production-readiness.mdx");
    const navigation = readNavigation();
    const manifest = JSON.parse(
      readFileSync(new URL("package.json", repositoryDirectory), "utf8")
    ) as { scripts?: Record<string, string> };
    const requiredTerms = [
      "Production Readiness Profile v2",
      "readiness:report",
      "readiness:gate",
      "applicable",
      "optional",
      "out of target",
      "unsupported",
      "external",
      "required profile",
      "automated evidence",
      "Protobuf",
      "Protovalidate",
      "CEL",
      "AIP",
    ];

    expect(navigation).toContain('"production-readiness"');
    expect(manifest.scripts?.["readiness:report"]).toBeDefined();
    expect(manifest.scripts?.["readiness:gate"]).toBeDefined();
    expect(
      requiredTerms.filter((term) => !content.includes(term)),
      "Missing production-readiness guidance"
    ).toEqual([]);
  });

  it("documents the complete server-error lifecycle", () => {
    const content = readDoc("server-errors.mdx");
    const requiredTerms = [
      "serverPathPrefix",
      "clearServerErrorContext",
      "serverErrorContext",
      "unmapped",
      "LocalizedMessage",
      "ErrorInfo",
      "RequestInfo",
      "RetryInfo",
      "PreconditionFailure",
      "QuotaFailure",
      "DebugInfo",
      "AIP-193",
      "AIP-194",
      "aria-live",
      "URL.canParse",
      "idempotent",
      "Never branch on error message text",
      "Bracket-indexed repeated and map paths",
    ];

    expect(
      requiredTerms.filter((term) => !content.includes(term)),
      "Missing server-error guidance"
    ).toEqual([]);
  });

  it("showcases the kitchen sink and advanced CEL contract", () => {
    const content = readDoc("kitchen-sink.mdx");
    const celContent = readDoc("cel-expressions.mdx");
    const navigation = readNavigation();
    const requiredTerms = [
      "KitchenSinkExample",
      "kitchen_sink.graph.integrity",
      "kitchen_sink.production.policy",
      "kitchen_sink.rollout.sequence",
      ".all(",
      ".exists(",
      ".filter(",
      "has(",
      "duration(",
      "string-returning",
      "no external stepper dependency",
      "ordered list",
    ];
    const requiredCelTerms = [
      "Boolean-returning rules",
      "string-returning rules",
      "stable IDs",
      "bounded",
      "No I/O",
      "/docs/kitchen-sink",
    ];

    expect(navigation).toContain('"kitchen-sink"');
    expect(
      existsSync(new URL("islands/KitchenSinkExample.tsx", repositoryDirectory))
    ).toBe(true);
    expect(
      requiredTerms.filter((term) => !content.includes(term)),
      "Missing kitchen-sink guidance"
    ).toEqual([]);
    expect(
      requiredCelTerms.filter((term) => !celContent.includes(term)),
      "Missing advanced CEL guidance"
    ).toEqual([]);
  });

  it("shows an extremely nested contract rendered by one AutoForm", () => {
    const content = readDoc("deeply-nested.mdx");
    const navigation = readNavigation();
    const requiredTerms = [
      "DeeplyNestedFormExample",
      "SubmitDeeplyNestedFormRequestSchema",
      "defaultValues",
      "six levels",
      "repeated messages",
      "nested oneofs",
      "maps",
      "one AutoForm",
      "architecture.networks[0].subnets[0].routes[0].metadata",
    ];

    expect(navigation).toContain('"deeply-nested"');
    expect(
      existsSync(
        new URL("islands/DeeplyNestedFormExample.tsx", repositoryDirectory)
      )
    ).toBe(true);
    expect(
      requiredTerms.filter((term) => !content.includes(term)),
      "Missing deeply nested form guidance"
    ).toEqual([]);
  });
});
