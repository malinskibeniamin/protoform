'use client';

import { CircleCheckIcon, CircleXIcon, ClockIcon, FileCodeIcon, TerminalIcon, WrapTextIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
} from '@/components/ui/code-block';
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from '@/components/ui/trace';

export const client = 'only';

const request = JSON.stringify(
  {
    parent: 'publishers/example',
    book: {
      title: 'A guide to reliable forms',
      description: 'A long description that stays inside the code block, even when the surrounding form is narrow.',
    },
  },
  null,
  2
);
const changes = {
  removed: '"title": ""',
  added: '"title": "A guide to reliable forms"',
  highlighted: '"allowMissing": false',
};
const failure =
  'INVALID_ARGUMENT: title is required.\n    at CreateBook (library.ts:27:9)\n    at submitRequest (request.ts:12:3)';

function CodeAndTraceExample() {
  const [wrap, setWrap] = useState(false);

  return (
    <div className="w-full min-w-0 max-w-[calc(100dvw-3rem)] space-y-8" data-testid="bundled-ui-example">
      <div className="space-y-2">
        <h1 className="font-semibold text-2xl">Code blocks and traces</h1>
        <p className="text-muted-foreground text-sm">
          Read-only UI samples included in the Protoform shadcn bundle. These traces do not send requests.
        </p>
      </div>
      <section aria-label="Request source" className="min-w-0 space-y-3">
        <CodeBlock>
          <CodeBlockHeader>
            <CodeBlockTitle>
              <FileCodeIcon />
              request.json
            </CodeBlockTitle>
            <CodeBlockActions>
              <Button
                aria-label="Wrap lines"
                aria-pressed={wrap}
                onClick={() => setWrap(wrap !== true)}
                size="icon-xs"
                type="button"
                variant="ghost"
              >
                <WrapTextIcon />
              </Button>
              <CodeBlockCopyButton value={request} />
            </CodeBlockActions>
          </CodeBlockHeader>
          <CodeBlockContent aria-label="Request JSON" lineNumbers wrap={wrap}>
            {request}
          </CodeBlockContent>
        </CodeBlock>
      </section>
      <section aria-label="Request changes" className="min-w-0 space-y-3">
        <h2 className="font-medium">Changes</h2>
        <CodeBlock>
          <CodeBlockContent aria-label="Request diff" lineNumbers startLine={12} wrap>
            <CodeBlockLine variant="removed">{changes.removed}</CodeBlockLine>
            <CodeBlockLine variant="added">{changes.added}</CodeBlockLine>
            <CodeBlockLine />
            <CodeBlockLine variant="highlighted">{changes.highlighted}</CodeBlockLine>
          </CodeBlockContent>
        </CodeBlock>
      </section>
      <section aria-label="Request trace" className="min-w-0 space-y-3">
        <h2 className="font-medium">Trace</h2>
        <Trace>
          <TraceLine>
            <TraceIcon>
              <CircleCheckIcon />
            </TraceIcon>
            <TraceTitle>Request serialized</TraceTitle>
            <TraceDescription>12 ms</TraceDescription>
          </TraceLine>
          <TraceCollapsible>
            <TraceCollapsibleTrigger>
              <TraceLine status="error">
                <TraceIcon>
                  <CircleXIcon />
                </TraceIcon>
                <TraceTitle>CreateBook failed</TraceTitle>
              </TraceLine>
            </TraceCollapsibleTrigger>
            <TraceCollapsibleContent>
              <CodeBlock size="sm" variant="destructive">
                <CodeBlockHeader>
                  <CodeBlockTitle>
                    <TerminalIcon />
                    Response details
                  </CodeBlockTitle>
                </CodeBlockHeader>
                <CodeBlockContent aria-label="Failure details" wrap>
                  {failure}
                </CodeBlockContent>
              </CodeBlock>
            </TraceCollapsibleContent>
          </TraceCollapsible>
          <TraceLine status="pending">
            <TraceIcon>
              <ClockIcon />
            </TraceIcon>
            <TraceTitle>Waiting for a corrected request</TraceTitle>
          </TraceLine>
        </Trace>
      </section>
    </div>
  );
}

export default CodeAndTraceExample;
