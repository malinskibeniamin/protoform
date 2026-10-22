import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
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
const chartConfig = { total: { label: 'Requests', color: 'var(--primary)' } };
const logEntries = Array.from({ length: 20 }, (_, index) => `Event ${index + 1}: sample request validated`);

export default function LayoutExamples() {
  const [destination, setDestination] = useState('Profiles');
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
        <ChartContainer aria-label="Sample requests by day" className="min-h-48 w-full" config={chartConfig} role="img">
          <BarChart accessibilityLayer data={requests}>
            <CartesianGrid vertical={false} />
            <XAxis axisLine={false} dataKey="day" tickLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
            <Bar dataKey="total" fill="var(--color-total)" isAnimationActive={false} radius={4} />
          </BarChart>
        </ChartContainer>
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
