import { barY, defineChart } from '@tanstack/charts';
import { scaleBand } from '@tanstack/charts/scales/band';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { tooltip } from '@tanstack/charts/tooltip';
import { lazy, Suspense, useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { TanStackChart } from '@/components/ui/chart-tanstack';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ParitySection } from './parity-shared';

const requests = [
  { day: 'Mon', total: 12 },
  { day: 'Tue', total: 18 },
  { day: 'Wed', total: 9 },
];
const RechartsFallback = lazy(() => import('./recharts-fallback'));
const requestsChart = defineChart({
  marks: [barY(requests, { x: 'day', y: 'total', fill: 'var(--primary)' })],
  scales: {
    x: { scale: () => scaleBand().padding(0.2) },
    y: { scale: scaleLinear, zero: true, nice: true, grid: true, axis: { label: 'Requests' } },
  },
  tooltip,
});
const logEntries = Array.from({ length: 20 }, (_, index) => `Event ${index + 1}: sample request validated`);

export default function LayoutExamples() {
  const chartBackendId = useId();

  const [destination, setDestination] = useState('Profiles');
  const [backend, setBackend] = useState<'tanstack' | 'recharts'>('tanstack');
  return (
    <div className="grid min-w-0 gap-6 md:grid-cols-2" data-testid="parity-layout">
      <ParitySection title="Sidebar">
        <SidebarProvider className="relative h-64 min-h-0 overflow-hidden">
          <Sidebar className="absolute" collapsible="icon">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Sample schemas</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {['Profiles', 'Addresses'].map((name) => (
                      <SidebarMenuItem key={name}>
                        <SidebarMenuButton
                          isActive={destination === name}
                          onClick={() => setDestination(name)}
                          tooltip={name}
                        >
                          {name}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <SidebarInset className="min-w-0" render={<div />}>
            <div className="space-y-4 p-3">
              <SidebarTrigger />
              <p className="text-sm wrap-break-word" role="status">
                Selected: {destination}
              </p>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </ParitySection>
      <ParitySection title="Resizable">
        <ResizablePanelGroup className="min-h-48" orientation="horizontal">
          <ResizablePanel defaultSize="50%" minSize="20%">
            <div className="flex h-full items-center justify-center p-3 text-sm">Form</div>
          </ResizablePanel>
          <ResizableHandle aria-label="Resize form and preview" withHandle />
          <ResizablePanel defaultSize="50%" minSize="20%">
            <div className="flex h-full items-center justify-center p-3 text-sm">Preview</div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ParitySection>
      <ParitySection title="Scroll area">
        <ScrollArea aria-label="Sample request log" className="h-48">
          <div className="space-y-3 p-3">
            {logEntries.map((entry) => (
              <p className="text-sm" key={entry}>
                {entry}
              </p>
            ))}
          </div>
        </ScrollArea>
      </ParitySection>
      <ParitySection title="Table">
        <Table>
          <TableCaption>Local sample field definitions.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>display_name</TableCell>
              <TableCell>string</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>enabled</TableCell>
              <TableCell>boolean</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </ParitySection>
      <ParitySection title="Carousel">
        <Carousel aria-label="Schema previews" className="mx-8 min-w-0">
          <CarouselContent>
            <CarouselItem>
              <div className="space-y-3 p-3">
                <p className="text-sm">Profile schema</p>
                <Field>
                  <Input aria-label="Slide note" defaultValue="Editable note" />
                </Field>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="flex min-h-24 items-center justify-center p-3 text-sm">Address schema</div>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </ParitySection>
      <ParitySection title="Chart">
        <Field>
          <FieldLabel htmlFor={chartBackendId}>Chart backend</FieldLabel>
          <Select
            items={[
              { value: 'tanstack', label: 'TanStack Charts (recommended)' },
              { value: 'recharts', label: 'Recharts fallback' },
            ]}
            onValueChange={(value) => {
              if (value === 'tanstack' || value === 'recharts') {
                setBackend(value);
              }
            }}
            value={backend}
          >
            <SelectTrigger aria-label="Chart backend" id={chartBackendId}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tanstack">TanStack Charts (recommended)</SelectItem>
              <SelectItem value="recharts">Recharts fallback</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        {backend === 'tanstack' ? (
          <TanStackChart ariaLabel="Sample requests by day" definition={requestsChart} height={220} />
        ) : (
          <Suspense fallback={<p role="status">Loading Recharts fallback…</p>}>
            <RechartsFallback data={requests} />
          </Suspense>
        )}
        <p className="text-sm text-muted-foreground">Static sample: 12, 18 and 9 requests.</p>
      </ParitySection>
      <div className="md:col-span-2">
        <Button onClick={() => setDestination('Profiles')} type="button" variant="outline">
          Reset selected schema
        </Button>
      </div>
    </div>
  );
}
