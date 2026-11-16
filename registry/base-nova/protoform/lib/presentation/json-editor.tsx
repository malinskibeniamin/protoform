'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { JSONEditorLayout } from '@/components/ui/shared/control-layouts';
import { Text } from '@/components/ui/shared/typography';
import type { JSONFieldControls } from './json-controls';
import type { JSONValue } from './json-model';
import { parseJson } from './json-model';

const JSONCodeEditor = React.lazy(() =>
  import('./json-code-editor').then((module) => ({ default: module.JSONCodeEditor }))
);

const editorLoading = (
  <div className="min-h-25 p-2.5">
    <Text role="status" variant="small">
      Loading JSON editor…
    </Text>
  </div>
);

interface JSONEditorProps {
  controls: JSONFieldControls;
  error?: string | undefined;
  id?: string | undefined;
  label: string;
  onChange: (value: JSONValue) => void;
  onDraftChange?: (value: string) => void;
  value: string;
}

const JSONEditor = ({ controls, value, onChange, error: externalError, label, onDraftChange, id }: JSONEditorProps) => {
  'use no memo';

  const { Textarea } = controls;

  const [editorContent, setEditorContent] = useState(value);
  const [internalError, setInternalError] = useState<string | undefined>(undefined);
  const generatedId = React.useId();
  const editorId = id ?? generatedId;
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPublishedText = useRef<string | undefined>(undefined);
  const previousValue = useRef(value);

  useEffect(
    function synchronizeEditor() {
      if (previousValue.current === value) {
        return;
      }
      previousValue.current = value;
      if (value !== lastPublishedText.current && value !== editorContent) {
        setEditorContent(value);
        setInternalError(undefined);
      }
      lastPublishedText.current = undefined;
    },
    [value, editorContent]
  );

  const handleEditorChange = (newContent: string) => {
    setEditorContent(newContent);
    onDraftChange?.(newContent);
    let parsed: JSONValue;
    try {
      parsed = parseJson(newContent);
    } catch (error) {
      setInternalError(`Invalid JSON. ${error instanceof Error ? error.message : 'Check the syntax.'}`);
      return;
    }
    lastPublishedText.current = JSON.stringify(parsed, null, 2);
    setInternalError(undefined);
    onChange(parsed);
  };

  const displayError = internalError ?? externalError;
  const errorId = `${editorId}-error`;
  const focusEditor = () => containerRef.current?.querySelector<HTMLElement>('[role="textbox"]')?.focus();

  useLayoutEffect(
    function synchronizeTextareaValidity() {
      const textarea = containerRef.current?.querySelector('textarea');
      if (!textarea) {
        return;
      }
      textarea.setCustomValidity(displayError ?? '');
      if (displayError !== undefined && displayError !== '') {
        textarea.setAttribute('aria-invalid', 'true');
        textarea.setAttribute('aria-describedby', errorId);
      } else {
        textarea.removeAttribute('aria-invalid');
        textarea.removeAttribute('aria-describedby');
      }
    },
    [displayError, errorId]
  );

  const input = (
    <Textarea
      aria-hidden="true"
      className="sr-only"
      id={editorId}
      onChange={(event) => handleEditorChange(event.currentTarget.value)}
      onFocus={focusEditor}
      onInvalid={(event) => {
        event.preventDefault();
        focusEditor();
      }}
      tabIndex={-1}
      value={editorContent}
    />
  );

  const editor = (
    <JSONCodeEditor
      error={displayError}
      errorId={errorId}
      id={editorId}
      label={label}
      onChange={handleEditorChange}
      value={editorContent}
    />
  );
  const feedback =
    displayError !== undefined && displayError !== '' ? (
      <Text className="mt-1 text-destructive" id={errorId} role="alert" variant="small">
        {displayError}
      </Text>
    ) : null;
  return (
    <JSONEditorLayout
      containerRef={containerRef}
      editor={editor}
      editorId={editorId}
      error={displayError}
      feedback={feedback}
      input={input}
      label={label}
      loading={editorLoading}
    />
  );
};

export { JSONEditor };
