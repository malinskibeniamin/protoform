'use client';

import { Badge } from '@/components/ui/sdk/badge';
import { Button } from '@/components/ui/sdk/button';
import { OptionCombobox as Combobox } from '@/components/ui/sdk/combobox';
import { Input } from '@/components/ui/sdk/input';
import { Label } from '@/components/ui/sdk/label';
import { Textarea } from '@/components/ui/sdk/textarea';
import { toast } from '@/components/ui/sdk/toast';
import type { JSONFieldControls } from '@/components/ui/shared/json-controls';
import { type JSONFieldProps, JSONField as JSONFieldRenderer } from '@/components/ui/shared/json-field';

const controls = { Badge, Button, Combobox, Input, Label, Textarea, notify: toast } satisfies JSONFieldControls;

export function JSONField(props: JSONFieldProps) {
  return <JSONFieldRenderer {...props} controls={controls} />;
}

export type {
  CustomFieldConfig,
  JSONObject,
  JSONSchemaConst,
  JSONSchemaType,
  JSONValue,
} from '@/components/ui/shared/json-field';
