import { renderElement } from '@ui-sdk/react/primitive';
import { type ComponentProps, type CSSProperties, type MouseEvent, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AlertDialog, AlertDialogClose, AlertDialogContent, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Resizable, ResizableHandle, ResizablePanel } from '@/components/ui/resizable';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Slider, SliderControl, SliderIndicator, SliderThumb, SliderTrack } from '@/components/ui/slider';
import { Toggle } from '@/components/ui/toggle';
import { AutoForm } from '@/registry/base-nova/protoform/components/auto-form';
import type { SchemaProvider } from '@/registry/base-nova/protoform/components/auto-form/core-types';

const schema: SchemaProvider = {
  getDefaultValues: () => ({ enabled: false, delivery: 'email' }),
  parseSchema: () => ({
    fields: [
      { key: 'enabled', type: 'boolean', required: false, fieldConfig: { customData: { control: 'toggle' } } },
      {
        key: 'delivery',
        type: 'select',
        required: false,
        fieldConfig: { customData: { ui: { control: 'toggleGroup' } } },
        options: [
          ['email', 'Email'],
          ['sms', 'SMS'],
        ],
      },
    ],
  }),
  validateSchema: (values) => ({ success: true, data: values }),
};

const sidebarTheme: CSSProperties & { '--sidebar': string; '--sidebar-foreground': string } = {
  '--sidebar': 'var(--regression-sidebar)',
  '--sidebar-foreground': 'var(--regression-sidebar-foreground)',
};

function RouterLink({ href, onClick, onNavigate, ...props }: ComponentProps<'a'> & { onNavigate: () => void }) {
  return renderElement('a', {
    ...props,
    href,
    onClick(event: MouseEvent<HTMLAnchorElement>) {
      onClick?.(event);
      if (!event.defaultPrevented) {
        onNavigate();
      }
      event.preventDefault();
    },
  });
}

function App() {
  const [navigations, setNavigations] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [submitted, setSubmitted] = useState('');
  const finishAction = useRef<() => void>(() => undefined);
  const navigate = () => setNavigations((count) => count + 1);
  return (
    <main className="mx-auto max-w-xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">UI upgrade regression checks</h1>
      <section aria-label="Toggle presentation" className="space-y-3">
        <Toggle size="sm" variant="outline">
          Small toggle
        </Toggle>
        <Toggle size="lg" variant="outline">
          Large toggle
        </Toggle>
        <AutoForm
          modes={['advanced']}
          onSubmit={(values) => setSubmitted(JSON.stringify(values))}
          schema={schema}
          showSummary={false}
          withSubmit
        />
        <output aria-label="Toggle form values">{submitted}</output>
      </section>
      <section aria-label="Sliders" className="flex h-52 gap-12">
        <Slider aria-label="Vertical level" defaultValue={25} orientation="vertical" />
        <Slider aria-label="Vertical range" defaultValue={[25, 75]} orientation="vertical" />
        <div className="w-40 self-center">
          <Slider aria-label="Composed level" defaultValue={40}>
            <SliderControl>
              <SliderTrack>
                <SliderIndicator />
                <SliderThumb aria-label="Composed level" index={0} />
              </SliderTrack>
            </SliderControl>
          </Slider>
        </div>
      </section>
      <section aria-label="Vertical panels">
        <Resizable className="h-52" orientation="vertical">
          <ResizablePanel defaultSize={50} minSize={20}>
            Top panel
          </ResizablePanel>
          <ResizableHandle aria-label="Resize panels" />
          <ResizablePanel defaultSize={50} minSize={20}>
            Bottom panel
          </ResizablePanel>
        </Resizable>
      </section>
      <section aria-label="Router buttons" className="flex flex-wrap gap-2">
        <Button render={<RouterLink href="/enabled" onNavigate={navigate} />}>Enabled route</Button>
        <Button disabled render={<RouterLink href="/disabled" onNavigate={navigate} />}>
          Disabled route
        </Button>
        <Button
          onClick={() =>
            new Promise<void>((resolve) => {
              finishAction.current = resolve;
            })
          }
          render={<RouterLink href="/pending" onNavigate={navigate} />}
        >
          Pending route
        </Button>
        <Button onClick={() => finishAction.current()}>Finish action</Button>
        <output aria-label="Route navigations">{navigations}</output>
      </section>
      <Dialog>
        <DialogTrigger>Open editor</DialogTrigger>
        <DialogContent>
          <div className="space-y-4 p-4">
            <DialogTitle>Edit record</DialogTitle>
            <Button onClick={() => setConfirmOpen(true)}>Request confirmation</Button>
            <output aria-label="Confirmation result">{confirmed === true ? 'Confirmed' : 'Not confirmed'}</output>
            <DialogClose>Close editor</DialogClose>
          </div>
        </DialogContent>
      </Dialog>
      <AlertDialog onOpenChange={setConfirmOpen} open={confirmOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Confirm changes</AlertDialogTitle>
          <AlertDialogClose action={() => setConfirmed(true)}>Confirm record</AlertDialogClose>
        </AlertDialogContent>
      </AlertDialog>
      <Sheet>
        <SheetTrigger>Open sidebar</SheetTrigger>
        <SheetContent style={sidebarTheme} variant="sidebar">
          <SheetTitle>Workspace navigation</SheetTitle>
        </SheetContent>
      </Sheet>
    </main>
  );
}

const root = document.querySelector('#root');
if (!root) {
  throw new Error('Missing fixture root');
}
createRoot(root).render(<App />);
