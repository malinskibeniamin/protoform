'use client';

import type { Diagnostic } from '@codemirror/lint';
import type { EditorView as CodeMirrorView } from '@codemirror/view';

interface JSONCodeEditorProps {
  error: string | undefined;
  errorId: string;
  id: string;
  label: string;
  onChange: (value: string) => void;
  value: string;
}

const [
  { default: CodeMirror },
  { json, jsonParseLinter },
  { HighlightStyle, syntaxHighlighting, syntaxTree },
  { linter, lintGutter },
  { EditorView },
  { tags },
] = await Promise.all([
  import('@uiw/react-codemirror'),
  import('@codemirror/lang-json'),
  import('@codemirror/language'),
  import('@codemirror/lint'),
  import('@codemirror/view'),
  import('@lezer/highlight'),
]);
const parseJSON = jsonParseLinter();

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

function contentAttributes({ error, errorId, id, label }: JSONCodeEditorProps) {
  const hasError = error !== undefined && error !== '';
  return EditorView.contentAttributes.of({
    id: `${id}-editor`,
    'aria-label': label,
    'aria-invalid': hasError ? 'true' : 'false',
    ...(hasError ? { 'aria-describedby': errorId } : {}),
  });
}

const jsonExtensions = [
  json(),
  jsonHighlighting,
  EditorView.lineWrapping,
  lintGutter(),
  linter(jsonDiagnostics, { delay: 150 }),
];

export function JSONCodeEditor(props: JSONCodeEditorProps) {
  return (
    <CodeMirror
      className="min-w-0 rounded-md"
      extensions={[...jsonExtensions, contentAttributes(props)]}
      indentWithTab={false}
      onChange={props.onChange}
      theme={editorTheme}
      value={props.value}
    />
  );
}
