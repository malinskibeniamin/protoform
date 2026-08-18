import { type DemoCatalogEntry, type DemoCategory, demoCatalog } from "./demo-catalog";

export const demoHubCategories = ["aip", "protobuf", "protovalidate", "cel", "production"] as const;

export type DemoHubCategory = (typeof demoHubCategories)[number];

export interface DemoHubDefinition {
  category: DemoHubCategory;
  description: string;
  slug: string;
  title: string;
}

export const demoHubs = [
  {
    category: "aip",
    description: "Focused live examples for every form-applicable Google API Improvement Proposal.",
    slug: "aip-example-catalog",
    title: "AIP examples",
  },
  {
    category: "protobuf",
    description: "Live examples for protobuf fields, presence, collections, maps, oneofs, and well-known types.",
    slug: "protobuf-examples",
    title: "Protobuf examples",
  },
  {
    category: "protovalidate",
    description: "Live examples for Protovalidate rules, formats, collections, and complete violation reporting.",
    slug: "protovalidate-examples",
    title: "Protovalidate examples",
  },
  {
    category: "cel",
    description: "Live examples for CEL expressions, protobuf values, evaluation safety, and UI rules.",
    slug: "cel-examples",
    title: "CEL examples",
  },
  {
    category: "production",
    description: "Live examples for form-library interoperability, accessibility, resilience, and production behavior.",
    slug: "production-examples",
    title: "Production examples",
  },
] as const satisfies readonly DemoHubDefinition[];

export function demoHubCategoryFor(category: DemoCategory): DemoHubCategory {
  switch (category) {
    case "aip":
    case "cel":
    case "protobuf":
    case "protovalidate":
      return category;
    case "interop":
    case "production":
      return "production";
    default: {
      const unsupportedCategory: never = category;
      throw new Error(`Unsupported demo category: ${String(unsupportedCategory)}`);
    }
  }
}

const demosByHub = new Map(
  demoHubCategories.map((category) => [
    category,
    demoCatalog.filter((demo) => demoHubCategoryFor(demo.category) === category),
  ])
);

export function demosForHub(category: DemoHubCategory): readonly DemoCatalogEntry[] {
  return demosByHub.get(category) ?? [];
}

export function getDemoHub(category: DemoHubCategory): DemoHubDefinition {
  const hub = demoHubs.find((candidate) => candidate.category === category);
  if (!hub) {
    throw new Error(`Missing demo hub definition for ${category}.`);
  }
  return hub;
}

export interface DemoRedirect {
  from: string;
  status: 308;
  to: string;
}

export const demoRedirects = [
  {
    from: "/feature-example-catalog",
    status: 308,
    to: "/protobuf-examples",
  },
  ...demoCatalog.map((demo): DemoRedirect => {
    const hub = getDemoHub(demoHubCategoryFor(demo.category));
    return {
      from: demo.category === "aip" ? `/${demo.slug}` : `/example-${demo.slug}`,
      status: 308,
      to: `/${hub.slug}#${demo.slug}`,
    };
  }),
] satisfies readonly DemoRedirect[];
