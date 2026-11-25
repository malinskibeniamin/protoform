'use client';

import type { Diagnostic } from '@codemirror/lint';
import type { EditorView as CodeMirrorView } from '@codemirror/view';
import React from 'react';

interface JSONCodeEditorProps {
  error: string | undefined;
  errorId: string;
  id: string;
  label: string;
  onChange: (value: string) => void;
  value: string;
}

const [
  { closeBrackets, closeBracketsKeymap },
  { defaultKeymap, history, historyKeymap },
  { json, jsonParseLinter },
  { bracketMatching, foldGutter, foldKeymap, HighlightStyle, indentOnInput, syntaxHighlighting, syntaxTree },
  { linter, lintGutter, lintKeymap },
  { highlightSelectionMatches, searchKeymap },
  { Annotation, Compartment, EditorState },
  {
    crosshairCursor,
    drawSelection,
    dropCursor,
    EditorView,
    highlightActiveLine,
    highlightActiveLineGutter,
    highlightSpecialChars,
    keymap,
    lineNumbers,
    rectangularSelection,
  },
  { tags },
] = await Promise.all([
  import('@codemirror/autocomplete').then((module) => ({
    closeBrackets: module.closeBrackets,
    closeBracketsKeymap: module.closeBracketsKeymap,
  })),
  import('@codemirror/commands').then((module) => ({
    defaultKeymap: module.defaultKeymap,
    history: module.history,
    historyKeymap: module.historyKeymap,
  })),
  import('@codemirror/lang-json').then((module) => ({ json: module.json, jsonParseLinter: module.jsonParseLinter })),
  import('@codemirror/language').then((module) => ({
    bracketMatching: module.bracketMatching,
    foldGutter: module.foldGutter,
    foldKeymap: module.foldKeymap,
    HighlightStyle: module.HighlightStyle,
    indentOnInput: module.indentOnInput,
    syntaxHighlighting: module.syntaxHighlighting,
    syntaxTree: module.syntaxTree,
  })),
  import('@codemirror/lint').then((module) => ({
    linter: module.linter,
    lintGutter: module.lintGutter,
    lintKeymap: module.lintKeymap,
  })),
  import('@codemirror/search').then((module) => ({
    highlightSelectionMatches: module.highlightSelectionMatches,
    searchKeymap: module.searchKeymap,
  })),
  import('@codemirror/state').then((module) => ({
    Annotation: module.Annotation,
    Compartment: module.Compartment,
    EditorState: module.EditorState,
  })),
  import('@codemirror/view').then((module) => ({
    crosshairCursor: module.crosshairCursor,
    drawSelection: module.drawSelection,
    dropCursor: module.dropCursor,
    EditorView: module.EditorView,
    highlightActiveLine: module.highlightActiveLine,
    highlightActiveLineGutter: module.highlightActiveLineGutter,
    highlightSpecialChars: module.highlightSpecialChars,
    keymap: module.keymap,
    lineNumbers: module.lineNumbers,
    rectangularSelection: module.rectangularSelection,
  })),
  import('@lezer/highlight').then((module) => ({ tags: module.tags })),
]);
const parseJSON = jsonParseLinter();
const externalSyncAnnotation = Annotation.define<boolean>();

function jsonDiagnostics(view: CodeMirrorView): Diagnostic[] {
  const diagnostics = parseJSON(view);
  const syntaxErrors: { from: number; to: number }[] = [];
  if (diagnostics.length > 0) {
    syntaxTree(view.state).iterate({
      enter(node) {
        if (node.type.isError) {
          syntaxErrors.push({ from: node.from, to: node.to });
        }
      },
    });
  }
  return diagnostics.map((diagnostic) => {
    const range =
      syntaxErrors.find((candidate) => candidate.from <= diagnostic.from && candidate.to >= diagnostic.from) ??
      syntaxErrors.at(0) ??
      diagnostic;
    const from = Math.min(range.from, Math.max(0, view.state.doc.length - 1));
    return { ...diagnostic, from, to: Math.min(view.state.doc.length, Math.max(from + 1, range.to)) };
  });
}

const editorTheme = EditorView.theme({
  '&': {
    backgroundColor: 'var(--background)',
    color: 'var(--foreground)',
    fontSize: '0.875rem',
    borderRadius: 'var(--radius-md)',
  },
  '.cm-scroller': { fontFamily: 'var(--font-mono, monospace)', overflow: 'auto', borderRadius: 'inherit' },
  '.cm-content': { minHeight: '6.25rem', padding: '0.625rem 0', caretColor: 'var(--foreground)' },
  '.cm-line': { padding: '0 0.625rem' },
  '.cm-gutters': { backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--muted-foreground)' },
  '.cm-activeLine, .cm-activeLineGutter': { backgroundColor: 'var(--muted)' },
  '.cm-cursor': { borderLeftColor: 'var(--foreground)' },
  '.cm-tooltip, .cm-panels': {
    backgroundColor: 'var(--popover)',
    color: 'var(--popover-foreground)',
    borderColor: 'var(--border)',
  },
  '.cm-tooltip-lint': { maxWidth: 'min(24rem, calc(100vw - 2rem))', whiteSpace: 'normal', overflowWrap: 'anywhere' },
  '.cm-lintRange-error': {
    backgroundImage: 'none',
    textDecoration: 'underline wavy var(--destructive)',
    textUnderlineOffset: '3px',
  },
  '.cm-diagnostic-error': { borderLeftColor: 'var(--destructive)' },
});

const jsonHighlighting = syntaxHighlighting(
  HighlightStyle.define([
    { tag: tags.propertyName, color: 'var(--foreground)', fontWeight: '600' },
    { tag: tags.string, color: 'var(--muted-foreground)' },
    { tag: [tags.number, tags.bool, tags.null], color: 'var(--primary)', fontWeight: '600' },
  ])
);

function contentAttributes({
  error,
  errorId,
  id,
  label,
}: Pick<JSONCodeEditorProps, 'error' | 'errorId' | 'id' | 'label'>) {
  const hasError = error !== undefined && error !== '';
  return EditorView.contentAttributes.of({
    id: `${id}-editor`,
    'aria-label': label,
    'aria-invalid': hasError ? 'true' : 'false',
    ...(hasError ? { 'aria-describedby': errorId } : {}),
  });
}

const basicSetupEditingExtensions = [
  lineNumbers(),
  highlightActiveLineGutter(),
  highlightSpecialChars(),
  history(),
  foldGutter(),
  drawSelection(),
  dropCursor(),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  bracketMatching(),
  closeBrackets(),
  rectangularSelection(),
  crosshairCursor(),
  highlightActiveLine(),
  highlightSelectionMatches(),
  keymap.of([
    ...closeBracketsKeymap,
    ...defaultKeymap,
    ...searchKeymap,
    ...historyKeymap,
    ...foldKeymap,
    ...lintKeymap,
  ]),
];

const jsonExtensions = [
  ...basicSetupEditingExtensions,
  json(),
  jsonHighlighting,
  EditorView.lineWrapping,
  lintGutter(),
  linter(jsonDiagnostics, { delay: 150 }),
  editorTheme,
];

export function JSONCodeEditor({ error, errorId, id, label, onChange, value }: JSONCodeEditorProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const viewRef = React.useRef<CodeMirrorView | null>(null);
  const attributesCompartmentRef = React.useRef<InstanceType<typeof Compartment> | null>(null);
  const getInitialConfig = React.useEffectEvent(() => ({
    attributes: contentAttributes({ error, errorId, id, label }),
    doc: value,
  }));
  const onChangeEvent = React.useEffectEvent(onChange);

  React.useEffect(function mountEditorView() {
    const parent = containerRef.current;
    if (parent === null) {
      return;
    }

    const attributesCompartment = new Compartment();
    attributesCompartmentRef.current = attributesCompartment;
    const { attributes, doc } = getInitialConfig();
    const state = EditorState.create({
      doc,
      extensions: [
        ...jsonExtensions,
        attributesCompartment.of(attributes),
        EditorView.updateListener.of((update) => {
          if (
            update.docChanged &&
            update.transactions.every((transaction) => transaction.annotation(externalSyncAnnotation) !== true)
          ) {
            onChangeEvent(update.state.doc.toString());
          }
        }),
      ],
    });
    const view = new EditorView({ parent, state });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
      attributesCompartmentRef.current = null;
    };
  }, []);

  React.useEffect(
    function synchronizeEditorDocument() {
      const view = viewRef.current;
      if (view === null) {
        return;
      }
      const current = view.state.doc.toString();
      if (current === value) {
        return;
      }
      view.dispatch({
        annotations: externalSyncAnnotation.of(true),
        changes: { from: 0, insert: value, to: current.length },
      });
    },
    [value]
  );

  React.useEffect(
    function synchronizeEditorAttributes() {
      const view = viewRef.current;
      const attributesCompartment = attributesCompartmentRef.current;
      if (view === null || attributesCompartment === null) {
        return;
      }
      view.dispatch({
        effects: attributesCompartment.reconfigure(contentAttributes({ error, errorId, id, label })),
      });
    },
    [error, errorId, id, label]
  );

  return <div className="min-w-0 rounded-md" ref={containerRef} />;
}
