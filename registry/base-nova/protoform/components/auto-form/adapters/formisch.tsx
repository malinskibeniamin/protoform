'use client';

import {
  getDeepErrorEntries,
  getInput,
  handleSubmit,
  type RequiredPath,
  reset,
  setErrors,
  setInput,
  useForm,
} from '@formisch/react';
import React from 'react';
import { dirtyFieldsFromValues } from '@/registry/base-nova/protoform/lib/protobuf-provider/field-mask';
import { PROTO_FORM_ROOT_ERROR_KEY } from '@/registry/base-nova/protoform/lib/protobuf-provider/hook-runtime';
import type { SchemaValidationError } from '../core-types';
import {
  type AutoFormArrayController,
  type AutoFormEngine,
  AutoFormEngineProvider,
  type AutoFormFieldController,
  useAutoFormEngine,
  useDirtyStateNotification,
} from '../engine';
import { getPathInObject } from '../field-utils';
import { getFieldErrorMessage } from '../helpers';
import {
  clearFieldError,
  errorTree,
  type FormischAutoFormApi,
  insertGeneratedItem,
  objectSchema,
  type objectStorage,
  removeGeneratedItem,
  setGeneratedValue,
  storagePath,
  useGeneratedArrayKeys,
} from './formisch-storage';

type Values = Record<string, unknown>;
interface FieldProps {
  children: (controller: AutoFormFieldController) => React.ReactNode;
  name: string;
}
interface ArrayProps {
  children: (controller: AutoFormArrayController) => React.ReactNode;
  name: string;
}

const FormischContext = React.createContext<{
  form: FormischAutoFormApi;
  storage: ReturnType<typeof objectStorage>;
  registerRef: (path: string, element: HTMLElement | null) => void;
} | null>(null);

function useFormischContext() {
  const context = React.useContext(FormischContext);
  if (context === null) {
    throw new Error('Formisch controls must be rendered inside the Formisch engine.');
  }
  return context;
}

function FormischFieldController({ children, name }: FieldProps) {
  const engine = useAutoFormEngine();
  const { registerRef } = useFormischContext();
  const path = name.split('.');
  const error = getFieldErrorMessage(engine.errors, path);
  return children({
    errors: error?.split('\n') ?? [],
    name,
    onBlur: () => undefined,
    onChange: (value, options) => engine.setValue(name, value, options),
    ref: (element) => registerRef(name, element),
    value: getPathInObject(engine.values, path),
  });
}

function NativeArrayController({ children, name, path }: ArrayProps & { path: RequiredPath }) {
  'use no memo';
  const { form } = useFormischContext();
  const engine = useAutoFormEngine();
  const keys = useGeneratedArrayKeys(form, path);
  const input = getPathInObject(engine.values, name.split('.'));
  const values: unknown[] = Array.isArray(input) ? input : [];
  return children({
    append: (value) => {
      engine.clearErrors([name]);
      insertGeneratedItem(form, path, value);
    },
    items: keys.map((key, index) => ({ key, value: values[index] })),
    remove: (index) => {
      engine.clearErrors([name]);
      removeGeneratedItem(form, path, index);
    },
  });
}

function AtomicArrayController({ children, name }: ArrayProps) {
  const engine = useAutoFormEngine();
  const input = getPathInObject(engine.values, name.split('.'));
  const values: unknown[] = Array.isArray(input) ? input : [];
  const [keyState, setKeyState] = React.useState(() => ({
    keys: values.map((_, index) => index),
    next: values.length,
  }));
  const nextKeys = keyState.keys.slice(0, values.length);
  let nextId = keyState.next;
  if (keyState.keys.length !== values.length) {
    while (nextKeys.length < values.length) {
      nextKeys.push(nextId);
      nextId += 1;
    }
    setKeyState({ keys: nextKeys, next: nextId });
  }
  return children({
    append: (value) => {
      setKeyState({ keys: [...nextKeys, nextId], next: nextId + 1 });
      engine.setValue(name, [...values, value]);
    },
    items: nextKeys.map((key, index) => ({ key: String(key), value: values[index] })),
    remove: (index) => {
      setKeyState({ keys: nextKeys.filter((_, itemIndex) => index !== itemIndex), next: nextId });
      engine.setValue(
        name,
        values.filter((_, itemIndex) => index !== itemIndex)
      );
    },
  });
}

function FormischArrayController(props: ArrayProps) {
  const { storage } = useFormischContext();
  const path = storagePath(storage, props.name);
  return path?.storage.kind === 'array' && path.remaining.length === 0 ? (
    <NativeArrayController {...props} path={path.field} />
  ) : (
    <AtomicArrayController {...props} />
  );
}

function includesPath(name: string, paths: string[]) {
  return paths.some((path) => path === name || name.startsWith(`${path}.`));
}

function includesRoot(paths: string[]) {
  return paths.includes('root') || paths.includes(PROTO_FORM_ROOT_ERROR_KEY);
}

function useFieldFocus() {
  const fieldMapRef = React.useRef(new Map<string, HTMLElement>());
  const focus = React.useCallback((path: string) => fieldMapRef.current.get(path)?.focus(), []);
  const registerRef = React.useCallback((path: string, element: HTMLElement | null) => {
    if (element) {
      fieldMapRef.current.set(path, element);
    } else {
      fieldMapRef.current.delete(path);
    }
  }, []);
  return { focus, registerRef };
}

interface FormischEngineProps {
  children: (engine: AutoFormEngine) => React.ReactNode;
  defaultValues: Values;
  onDirtyChange?: ((isDirty: boolean) => void) | undefined;
  storage: ReturnType<typeof objectStorage>;
  values?: Values | undefined;
}

export function FormischEngine({ children, defaultValues, onDirtyChange, storage, values }: FormischEngineProps) {
  'use no memo';

  const schema = React.useMemo(() => objectSchema(storage), [storage]);
  const form = useForm({ initialInput: values ?? defaultValues, revalidate: 'submit', schema });
  const input = getInput(form);
  const [cleanValues, setCleanValues] = React.useState(input);
  const [snapshot, setSnapshot] = React.useState(input);
  const [providerErrors, setProviderErrors] = React.useState<SchemaValidationError[]>([]);
  const [seenValues, setSeenValues] = React.useState(values);
  const { focus, registerRef } = useFieldFocus();
  if (values !== seenValues) {
    setSeenValues(values);
    if (values) {
      setCleanValues(values);
      setProviderErrors([]);
    }
  }
  const hasNewInput = Object.keys(dirtyFieldsFromValues(input, snapshot)).length > 0;
  if (hasNewInput) {
    setSnapshot(input);
  }
  const currentValues = hasNewInput ? input : snapshot;

  const dirtyFields = dirtyFieldsFromValues(currentValues, cleanValues);
  const isDirty = Object.keys(dirtyFields).length > 0;
  const notifyDirty = useDirtyStateNotification(isDirty, onDirtyChange);
  const nativeErrors = getDeepErrorEntries(form);
  const issues = [
    ...providerErrors,
    ...nativeErrors.flatMap(({ path, errors: messages }) => messages.map((message) => ({ message, path: [...path] }))),
  ];
  const errors = new Map<string, string[]>();
  for (const issue of issues) {
    const name = issue.path.join('.');
    const previous = errors.get(name) ?? [];
    if (!previous.includes(issue.message)) {
      errors.set(name, [...previous, issue.message]);
    }
  }

  React.useEffect(() => {
    if (values) {
      reset(form, { initialInput: values });
    }
  }, [form, values]);

  const clearErrors = (paths?: string[]) => {
    if (!paths || includesRoot(paths)) {
      setErrors(form, { errors: null });
    }
    for (const { path } of getDeepErrorEntries(form)) {
      const [first, ...rest] = path;
      if (first !== undefined && (!paths || includesPath(path.join('.'), paths))) {
        clearFieldError(form, [first, ...rest]);
      }
    }
    setProviderErrors((current) =>
      paths
        ? current.filter(({ path }) =>
            path.length === 0 ? !includesRoot(paths) : !includesPath(path.join('.'), paths)
          )
        : []
    );
  };

  const engine: AutoFormEngine = {
    ArrayController: FormischArrayController,
    clearErrors,
    defaultValues: cleanValues,
    dirtyFields,
    errors: errorTree(issues),
    FieldController: FormischFieldController,
    focus,
    getFieldInvalid: (path) => [...errors.keys()].some((name) => includesPath(name, [path])),
    getValues: () => getInput(form),
    handleSubmit: (onValid) => (event) => {
      event.preventDefault();
      if (form.isSubmitting) {
        return;
      }
      handleSubmit(form, onValid)().catch((error: unknown) => {
        setErrors(form, { errors: [error instanceof Error ? error.message : 'Submission failed.'] });
      });
    },
    isDirty,
    isSubmitting: form.isSubmitting,
    markClean: () => {
      reset(form, { initialInput: getInput(form) });
      setCleanValues(getInput(form));
      setProviderErrors([]);
      notifyDirty(false);
    },
    nativeForm: form,
    reset: (nextValues, options) => {
      if (options?.keepDefaultValues) {
        reset(form);
        setInput(form, { input: nextValues });
      } else {
        reset(form, { initialInput: nextValues });
        setCleanValues(getInput(form));
      }
      setProviderErrors([]);
    },
    rootError: errors.get('')?.join('\n'),
    setRootError: (message) => setErrors(form, { errors: [message] }),
    setValidationErrors: setProviderErrors,
    setValue: (path, value) => {
      clearErrors([path]);
      setGeneratedValue(form, storage, path, value);
    },
    trigger: (paths) =>
      Promise.resolve(
        getDeepErrorEntries(form).every(({ path }) => paths !== undefined && !includesPath(path.join('.'), paths))
      ),
    validatesSchema: false,
    values: currentValues,
  };

  const context = React.useMemo(() => ({ form, registerRef, storage }), [form, registerRef, storage]);
  return (
    <FormischContext.Provider value={context}>
      <AutoFormEngineProvider engine={engine}>{children(engine)}</AutoFormEngineProvider>
    </FormischContext.Provider>
  );
}
