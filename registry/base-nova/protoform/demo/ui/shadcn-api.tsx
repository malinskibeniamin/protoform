'use client';

import { RotateCcwIcon } from 'lucide-react';
import { useState } from 'react';

import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChartStyle } from '@/components/ui/chart';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '@/components/ui/combobox';
import { Field, FieldLabel } from '@/components/ui/field';
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export const client = 'only';

const fruits = ['Apricot', 'Pear', 'Plum'];
const numericItems = [
  { label: 'One', value: 1 },
  { label: 'Two', value: 2 },
  { label: 'Three', value: 3 },
];

function ShadcnApiExample() {
  const [fruit, setFruit] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [number, setNumber] = useState<number | null>(1);
  const [cancelChanges, setCancelChanges] = useState(false);
  const [event, setEvent] = useState('No selection yet');
  const [format, setFormat] = useState<string[]>([]);
  const [alignment, setAlignment] = useState('left');
  const [volume, setVolume] = useState(30);
  const [range, setRange] = useState([20, 80]);
  const [actions, setActions] = useState(0);
  const [green, setGreen] = useState(false);
  const anchor = useComboboxAnchor();

  return (
    <div className="w-full max-w-[min(64rem,calc(100vw-3rem))] space-y-8" data-testid="shadcn-api-example">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Shadcn APIs, Protoform extensions</h1>
        <p className="text-sm text-muted-foreground">
          Official Base UI composition and typed callbacks, alongside the existing convenience APIs. All actions stay in
          this demo.
        </p>
      </header>
      <section aria-label="Button APIs" className="space-y-3">
        <h2 className="font-semibold">Render and variant APIs</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            nativeButton={false}
            onClick={() => setActions(actions + 1)}
            render={<span />}
            size="default"
            variant="default"
          >
            Rendered action
          </Button>
          <Button onClick={() => setActions(actions + 1)} size="md" variant="accent">
            Protoform action
          </Button>
          <Badge render={<span />} variant="default">
            {actions} actions
          </Badge>
        </div>
      </section>
      <section aria-label="Selection APIs" className="grid min-w-0 gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel>Compositional combobox</FieldLabel>
          <Combobox items={fruits} onValueChange={setFruit} value={fruit}>
            <ComboboxInput aria-label="Fruit" showClear />
            <ComboboxContent>
              <ComboboxEmpty>No fruit found</ComboboxEmpty>
              <ComboboxList>
                {(item: string) => (
                  <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </Field>
        <Field>
          <FieldLabel>Multiple values and chips</FieldLabel>
          <Combobox items={fruits} multiple onValueChange={setTags} value={tags}>
            <ComboboxChips ref={anchor}>
              <ComboboxValue>
                {(values) =>
                  Array.isArray(values)
                    ? values.map((value: unknown) =>
                        typeof value === 'string' ? <ComboboxChip key={value}>{value}</ComboboxChip> : null
                      )
                    : null
                }
              </ComboboxValue>
              <ComboboxChipsInput aria-label="Fruit tags" />
            </ComboboxChips>
            <ComboboxContent anchor={anchor}>
              <ComboboxEmpty>No fruit found</ComboboxEmpty>
              <ComboboxList>
                {(item: string) => (
                  <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </Field>
        <Field>
          <FieldLabel>Protoform convenience combobox</FieldLabel>
          <Combobox
            aria-label="Legacy fruit"
            onChange={(value) => setFruit(value)}
            options={fruits.map((value) => ({ label: value, value }))}
            value={fruit ?? ''}
          />
        </Field>
        <Field>
          <FieldLabel>Numeric select</FieldLabel>
          <Select
            items={numericItems}
            onValueChange={(value, details) => {
              setEvent(`${details.reason}: ${String(value)}`);
              if (cancelChanges === true) {
                details.cancel();
              } else {
                setNumber(value);
              }
            }}
            value={number}
          >
            <SelectTrigger aria-label="Number">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {numericItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field orientation="horizontal">
          <Checkbox checked={cancelChanges} id="cancel-api-changes" onCheckedChange={setCancelChanges} />
          <FieldLabel htmlFor="cancel-api-changes">Cancel selection and disclosure changes</FieldLabel>
        </Field>
        <p aria-live="polite" className="text-sm text-muted-foreground">
          Event: {event}. Number: {String(number)}.
        </p>
      </section>
      <section aria-label="Toggle and slider APIs" className="grid gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel>Shadcn array selection</FieldLabel>
          <ToggleGroup aria-label="Formatting" multiple onValueChange={setFormat} spacing={2} value={format}>
            <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
            <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
          </ToggleGroup>
          <p>Formatting: {format.join(', ') || 'none'}</p>
        </Field>
        <Field>
          <FieldLabel>Protoform single selection</FieldLabel>
          <ToggleGroup aria-label="Alignment" onValueChange={setAlignment} type="single" value={alignment}>
            <ToggleGroupItem value="left">Left</ToggleGroupItem>
            <ToggleGroupItem value="right">Right</ToggleGroupItem>
          </ToggleGroup>
          <p>Alignment: {alignment}</p>
        </Field>
        <Field>
          <FieldLabel>Numeric slider</FieldLabel>
          <Slider aria-label="Volume" onValueChange={setVolume} value={volume} />
          <p>Volume: {volume}</p>
        </Field>
        <Field>
          <FieldLabel>Array slider</FieldLabel>
          <Slider aria-label="Range" onValueChange={setRange} value={range} />
          <p>Range: {range.join('–')}</p>
        </Field>
      </section>
      <section aria-label="Composition APIs" className="space-y-3">
        <Tabs defaultValue={1}>
          <TabsList aria-label="API sections" variant="line">
            <TabsTrigger value={1}>Disclosure</TabsTrigger>
            <TabsTrigger value={2}>Chart colors</TabsTrigger>
          </TabsList>
          <TabsContent value={1}>
            <Collapsible
              onOpenChange={(open, details) => {
                setEvent(`${details.reason}: ${String(open)}`);
                if (cancelChanges === true) {
                  details.cancel();
                }
              }}
            >
              <CollapsibleTrigger render={<Button type="button" variant="outline" />}>Show details</CollapsibleTrigger>
              <CollapsibleContent>
                <p className="pt-3">Cancelable Base UI events are preserved.</p>
              </CollapsibleContent>
            </Collapsible>
            <Popover>
              <PopoverTrigger render={<Button type="button" variant="outline" />}>Open API information</PopoverTrigger>
              <PopoverContent>
                <PopoverHeader>
                  <PopoverTitle>Composable sections</PopoverTitle>
                  <PopoverDescription>
                    Title and description are linked to this popup for assistive technology.
                  </PopoverDescription>
                </PopoverHeader>
              </PopoverContent>
            </Popover>
          </TabsContent>
          <TabsContent value={2}>
            <div className="space-y-3" data-chart="api-colors">
              <ChartStyle config={{ example: { color: green === true ? '#15803d' : '#7c3aed' } }} id="api-colors" />
              <p className="font-semibold text-(--color-example)">Scoped ChartStyle color</p>
              <Button onClick={() => setGreen(green !== true)} variant="outline">
                Change chart color
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        <Alert variant="default">
          <AlertTitle>Both API styles are available</AlertTitle>
          <AlertDescription>Use official composition or keep Protoform convenience props.</AlertDescription>
          <AlertAction>
            <Button
              aria-label="Reset event"
              onClick={() => setEvent('No selection yet')}
              size="icon-xs"
              variant="ghost"
            >
              <RotateCcwIcon />
            </Button>
          </AlertAction>
        </Alert>
      </section>
    </div>
  );
}

export default ShadcnApiExample;
