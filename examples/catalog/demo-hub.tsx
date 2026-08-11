"use client";

import {
  type ComponentType,
  type LazyExoticComponent,
  lazy,
  Suspense,
  useEffect,
  useState,
} from "react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/registry/base-nova/protoform/components/alert";
import { Badge } from "@/registry/base-nova/protoform/components/badge";
import {
  Field,
  FieldLabel,
} from "@/registry/base-nova/protoform/components/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/base-nova/protoform/components/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/base-nova/protoform/components/tabs";

import { ExampleLoading } from "../shared/example-loading";
import type { DemoCatalogEntry } from "./demo-catalog";
import { type DemoHubCategory, demosForHub, getDemoHub } from "./demo-docs";

interface DemoModule {
  default: ComponentType;
}

const demoModules = import.meta.glob<DemoModule>(
  "../../registry/base-nova/protoform/demo/catalog/*.tsx"
);
const demoSourceModules = import.meta.glob<string>(
  "../../registry/base-nova/protoform/demo/catalog/*.tsx",
  { import: "default", query: "?raw" }
);
const demoComponents = new Map<string, LazyExoticComponent<ComponentType>>();
const demoSourceComponents = new Map<
  string,
  LazyExoticComponent<ComponentType>
>();

for (const [path, load] of Object.entries(demoModules)) {
  demoComponents.set(path, lazy(load));
}

for (const [path, load] of Object.entries(demoSourceModules)) {
  demoSourceComponents.set(
    path,
    lazy(async () => {
      const source = await load();
      return {
        default() {
          return (
            <pre className="max-h-[48rem] overflow-auto rounded-lg bg-muted p-4 text-sm">
              <code>{source}</code>
            </pre>
          );
        },
      };
    })
  );
}

function modulePathFor(demo: DemoCatalogEntry): string {
  return `../../registry/base-nova/protoform/demo/catalog/${demo.slug}.tsx`;
}

function initialDemoSlug(demos: readonly DemoCatalogEntry[]): string {
  const linkedSlug =
    typeof window === "undefined" ? "" : window.location.hash.slice(1);
  return (
    demos.find((demo) => demo.slug === linkedSlug)?.slug ?? demos[0]?.slug ?? ""
  );
}

export function DemoHub({ category }: { category: DemoHubCategory }) {
  const demos = demosForHub(category);
  const hub = getDemoHub(category);
  const [selectedSlug, setSelectedSlug] = useState(() =>
    initialDemoSlug(demos)
  );
  const selectedDemo =
    demos.find((demo) => demo.slug === selectedSlug) ?? demos[0];

  useEffect(
    function synchronizeDemoFromHash() {
      function handleHashChange() {
        const linkedSlug = window.location.hash.slice(1);
        if (demos.some((demo) => demo.slug === linkedSlug)) {
          setSelectedSlug(linkedSlug);
        }
      }

      window.addEventListener("hashchange", handleHashChange);
      return () => window.removeEventListener("hashchange", handleHashChange);
    },
    [demos]
  );

  if (!selectedDemo) {
    return (
      <Alert variant="destructive">
        <AlertTitle>No demos found</AlertTitle>
        <AlertDescription>
          This documentation hub has no registered demos.
        </AlertDescription>
      </Alert>
    );
  }

  const DemoComponent = demoComponents.get(modulePathFor(selectedDemo));
  const DemoSource = demoSourceComponents.get(modulePathFor(selectedDemo));

  function handleDemoChange(value: string | null) {
    if (!(value && demos.some((demo) => demo.slug === value))) {
      return;
    }
    setSelectedSlug(value);
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}#${value}`
    );
  }

  return (
    <div className="not-prose space-y-8 text-foreground">
      <Field>
        <FieldLabel htmlFor={`${category}-demo`}>Choose a demo</FieldLabel>
        <Select onValueChange={handleDemoChange} value={selectedDemo.slug}>
          <SelectTrigger
            aria-label="Choose a demo"
            className="w-full"
            id={`${category}-demo`}
            size="lg"
          >
            <SelectValue>{selectedDemo.title}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {demos.map((demo) => (
              <SelectItem key={demo.id} value={demo.slug}>
                {demo.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <section aria-labelledby={`${category}-demo-title`} className="space-y-6">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{hub.title}</Badge>
            <Badge variant="secondary">{selectedDemo.engine}</Badge>
          </div>
          <h2
            className="font-semibold text-2xl tracking-tight"
            id={`${category}-demo-title`}
          >
            {selectedDemo.title}
          </h2>
          <p className="text-muted-foreground">{selectedDemo.description}</p>
          <p className="text-sm">{selectedDemo.tryIt}</p>
        </div>

        <Tabs defaultValue="preview" key={selectedDemo.slug}>
          <TabsList variant="underline">
            <TabsTrigger value="preview" variant="underline">
              Preview
            </TabsTrigger>
            <TabsTrigger value="code" variant="underline">
              Code
            </TabsTrigger>
          </TabsList>
          <TabsContent value="preview">
            <div className="border-border/60 border-y py-8">
              {DemoComponent ? (
                <Suspense
                  fallback={<ExampleLoading label="Loading selected demo" />}
                >
                  <DemoComponent />
                </Suspense>
              ) : (
                <Alert variant="destructive">
                  <AlertTitle>Demo unavailable</AlertTitle>
                  <AlertDescription>
                    The selected demo could not be loaded.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>
          <TabsContent value="code">
            {DemoSource ? (
              <Suspense
                fallback={<ExampleLoading label="Loading selected source" />}
              >
                <DemoSource />
              </Suspense>
            ) : (
              <Alert variant="destructive">
                <AlertTitle>Source unavailable</AlertTitle>
                <AlertDescription>
                  The selected demo source could not be loaded.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>

        <div className="space-y-2">
          <h3 className="font-medium text-base">Install this example</h3>
          <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
            <code>
              bunx shadcn@latest add @protoform/{selectedDemo.registryName}
            </code>
          </pre>
        </div>
      </section>
    </div>
  );
}
