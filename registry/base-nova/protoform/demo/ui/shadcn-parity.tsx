import { lazy, Suspense, useId } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FoundationExamples } from './parity-foundations';
import { OverlayExamples } from './parity-overlays';

export const client = 'only';
const LayoutExamples = lazy(() => import('./parity-layout'));
const MessageExamples = lazy(() => import('./parity-messages'));
const RecipeExamples = lazy(() => import('./parity-recipes'));

export default function ShadcnParityExample() {
  const parityHeadingId = useId();

  return (
    <div
      className="mx-auto w-full max-w-[min(64rem,calc(100vw-3rem))] min-w-0 space-y-6 p-4"
      data-testid="shadcn-parity-example"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold" id={parityHeadingId}>
          Shadcn component catalog
        </h2>
        <p className="text-sm text-muted-foreground">
          Bundled Base UI components and composition examples. Samples are local and do not submit to a backend.
          Protoform’s existing form APIs are unchanged.
        </p>
      </div>
      <Tabs defaultValue="basics">
        <TabsList aria-label="Component categories" className="h-auto w-full grid-cols-2 sm:grid-cols-5" layout="equal">
          <TabsTrigger className="min-h-11" value="basics">
            Basics
          </TabsTrigger>
          <TabsTrigger className="min-h-11" value="overlays">
            Overlays
          </TabsTrigger>
          <TabsTrigger className="min-h-11" value="layout">
            Layout
          </TabsTrigger>
          <TabsTrigger className="min-h-11" value="messages">
            Messages
          </TabsTrigger>
          <TabsTrigger className="min-h-11" value="recipes">
            Recipes
          </TabsTrigger>
        </TabsList>
        <TabsContent value="basics">
          <FoundationExamples headingId={parityHeadingId} />
        </TabsContent>
        <TabsContent value="overlays">
          <OverlayExamples />
        </TabsContent>
        <TabsContent value="layout">
          <Suspense fallback={<p role="status">Loading layout components…</p>}>
            <LayoutExamples />
          </Suspense>
        </TabsContent>
        <TabsContent value="messages">
          <Suspense fallback={<p role="status">Loading message components…</p>}>
            <MessageExamples />
          </Suspense>
        </TabsContent>
        <TabsContent value="recipes">
          <Suspense fallback={<p role="status">Loading composition examples…</p>}>
            <RecipeExamples />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
