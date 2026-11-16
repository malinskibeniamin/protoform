'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { JSONFieldControls } from '@/components/ui/shared/json-controls';
import { type JSONFieldProps, JSONField as JSONFieldRenderer } from '@/components/ui/shared/json-field';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/toast';

const controls = {
  Badge,
  Button,
  Combobox,
  Input,
  Label,
  Textarea,
  notify: (options) => toast.add(options),
} satisfies JSONFieldControls;

export function JSONField(props: JSONFieldProps) {
  return <JSONFieldRenderer {...props} controls={controls} deferJSONMode />;
}

export type {
  CustomFieldConfig,
  JSONObject,
  JSONSchemaConst,
  JSONSchemaType,
  JSONValue,
} from '@/components/ui/shared/json-field';
