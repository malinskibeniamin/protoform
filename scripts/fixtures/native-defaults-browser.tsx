import { create, createFileRegistry, type Message, type MessageShape } from '@bufbuild/protobuf';
import { messageDesc } from '@bufbuild/protobuf/codegenv2';
import {
  FieldDescriptorProto_Type,
  FileDescriptorProtoSchema,
  TimestampSchema,
  timestampFromDate,
} from '@bufbuild/protobuf/wkt';
import { type ComponentProps, StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProtoForm } from '@/registry/base-nova/protoform/hooks/use-proto-form';
import { useProtoForm as useProtoFormV8 } from '@/registry/base-nova/protoform/hooks/use-proto-form-v8';

const file = create(FileDescriptorProtoSchema, {
  name: 'native_defaults.proto',
  package: 'fixture',
  syntax: 'proto3',
  dependency: ['google/protobuf/timestamp.proto'],
  messageType: [
    {
      name: 'Record',
      field: [
        {
          name: 'created_at',
          number: 1,
          type: FieldDescriptorProto_Type.MESSAGE,
          typeName: '.google.protobuf.Timestamp',
        },
      ],
    },
  ],
});
const descriptor = createFileRegistry(file, () => TimestampSchema.file).getMessage('fixture.Record');
if (!descriptor) {
  throw new Error('Missing native defaults fixture schema');
}
const schema = messageDesc<Message<'fixture.Record'> & { createdAt?: MessageShape<typeof TimestampSchema> }>(
  descriptor.file,
  0
);
const timestamp = timestampFromDate(new Date('2026-10-03T12:00:37.123Z'));
timestamp.nanos = 123_456_789;
const defaults = create(schema, { createdAt: timestamp });
const resetDefaults = create(schema, { createdAt: { seconds: timestamp.seconds + 120n, nanos: 456_789_123 } });

function Controls({
  version,
  inputProps: { name, onBlur: handleBlur, onChange: handleChange, ref },
  createMessage,
  reset,
}: {
  version: string;
  inputProps: ComponentProps<typeof Input>;
  createMessage: () => MessageShape<typeof schema>;
  reset: () => void;
}) {
  const [output, setOutput] = useState('');
  return (
    <section aria-label={`${version} timestamp`} className="space-y-4 rounded-lg border p-4">
      <h2 className="font-semibold">{version} native defaults</h2>
      <label className="block space-y-2" htmlFor={`timestamp-${version}`}>
        Created at
        <Input
          id={`timestamp-${version}`}
          name={name}
          onBlur={handleBlur}
          onChange={handleChange}
          ref={ref}
          step="0.001"
          type="datetime-local"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() =>
            setOutput(
              JSON.stringify(createMessage(), (_key, value) => (typeof value === 'bigint' ? value.toString() : value))
            )
          }
          type="button"
        >
          Inspect timestamp
        </Button>
        <Button onClick={reset} type="button">
          Reset record
        </Button>
      </div>
      <output aria-label="Timestamp payload" className="block break-all text-sm">
        {output}
      </output>
    </section>
  );
}
function V7() {
  const form = useProtoForm(schema, { defaultValues: defaults });
  return (
    <Controls
      createMessage={form.createMessage}
      inputProps={form.register('createdAt')}
      reset={() => form.reset(resetDefaults)}
      version="v7"
    />
  );
}
function V8() {
  const form = useProtoFormV8(schema, { defaultValues: defaults });
  return (
    <Controls
      createMessage={form.createMessage}
      inputProps={form.register('createdAt')}
      reset={() => form.reset(resetDefaults)}
      version="v8"
    />
  );
}
const root = document.querySelector('#root');
if (!root) {
  throw new Error('Missing native defaults fixture root');
}
createRoot(root).render(
  <StrictMode>
    <main className="mx-auto max-w-xl space-y-4 p-6">
      <h1 className="font-semibold text-2xl">Native timestamp defaults</h1>
      <p>Editable milliseconds. Preserve untouched nanoseconds.</p>
      <V7 />
      <V8 />
    </main>
  </StrictMode>
);
