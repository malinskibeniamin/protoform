import { create, type MessageShape } from '@bufbuild/protobuf';
import { timestampFromDate } from '@bufbuild/protobuf/wkt';
import { page } from '@rstest/browser';
import { render } from '@rstest/browser-react';
import { expect, test } from '@rstest/core';
import { type ComponentProps, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AutoFormExampleSchema } from '../../lib/protobuf-provider/gen/auto-form-example_pb.js';
import { useProtoForm as useProtoFormV8 } from '../use-proto-form-v8/index.js';
import { useProtoForm } from './index.js';

const timestamp = timestampFromDate(new Date('2026-10-03T12:00:37.123Z'));
timestamp.nanos = 123_456_789;
const defaults = create(AutoFormExampleSchema, { createdAt: timestamp });

function NativeDefaultControls({
  inputProps: { name, onBlur: handleBlur, onChange: handleChange, ref },
  createMessage,
}: {
  inputProps: ComponentProps<typeof Input>;
  createMessage: () => MessageShape<typeof AutoFormExampleSchema>;
}) {
  const [nanos, setNanos] = useState<number>();
  return (
    <main>
      <Input
        aria-label="Created at"
        name={name}
        onBlur={handleBlur}
        onChange={handleChange}
        ref={ref}
        step="0.001"
        type="datetime-local"
      />
      <Button onClick={() => setNanos(createMessage().createdAt?.nanos)} type="button">
        Inspect timestamp
      </Button>
      <output aria-label="Timestamp nanos">{nanos}</output>
    </main>
  );
}

function NativeDefaults() {
  const form = useProtoForm(AutoFormExampleSchema, { defaultValues: defaults });
  return <NativeDefaultControls createMessage={form.createMessage} inputProps={form.register('createdAt')} />;
}
function NativeDefaultsV8() {
  const form = useProtoFormV8(AutoFormExampleSchema, { defaultValues: defaults });
  return <NativeDefaultControls createMessage={form.createMessage} inputProps={form.register('createdAt')} />;
}

for (const [version, Component] of [
  ['v7', NativeDefaults],
  ['v8', NativeDefaultsV8],
] as const) {
  test(`${version} renders native timestamp defaults and preserves untouched nanoseconds`, async () => {
    await render(<Component />);
    const input = page.getByLabel('Created at');
    await expect.element(input).toHaveValue(/T\d{2}:00:37\.123$/u);
    await page.getByRole('button', { name: 'Inspect timestamp' }).click();
    await expect.element(page.getByLabel('Timestamp nanos')).toHaveText('123456789');
    await input.fill('2026-10-03T12:01:37.123');
    await page.getByRole('button', { name: 'Inspect timestamp' }).click();
    await expect.element(page.getByLabel('Timestamp nanos')).toHaveText('123000000');
  });
}
