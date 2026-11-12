import { CheckIcon, FileTextIcon } from 'lucide-react';
import { useState } from 'react';
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from '@/components/ui/attachment/index';
import { Avatar, AvatarFallback } from '@/components/ui/avatar/index';
import { Bubble, BubbleContent, BubbleGroup } from '@/components/ui/bubble/index';
import { Button } from '@/components/ui/button/index';
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
} from '@/components/ui/message/index';
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerViewport,
} from '@/components/ui/message-scroller/index';
import { Questionnaire } from '@/components/ui/questionnaire/index';
import { ParitySection } from './parity-shared';

const questions = [
  {
    name: 'format',
    required: true,
    prompt: 'Which format should the sample use?',
    choices: [
      { value: 'json', label: 'JSON' },
      { value: 'protobuf', label: 'Protobuf' },
    ],
  },
  {
    name: 'validation',
    required: false,
    prompt: 'Include sample validation?',
    choices: [
      { value: 'yes', label: 'Include validation' },
      { value: 'no', label: 'Skip validation' },
    ],
  },
];
const initialMessages = Array.from({ length: 8 }, (_, index) => ({
  id: `event-${index}`,
  text: `Sample event ${index + 1}: request validated.`,
}));

export default function MessageExamples() {
  const [failed, setFailed] = useState(true);
  const [messages, setMessages] = useState(initialMessages);
  const [answer, setAnswer] = useState('');
  const submitAnswers = (values: Record<string, string>) => setAnswer(`Sample saved: ${values['format']}.`);
  return (
    <div className="grid min-w-0 gap-6 md:grid-cols-2" data-testid="parity-messages">
      <ParitySection title="Attachment">
        <p className="text-sm text-muted-foreground">Local presentation state, not an actual upload.</p>
        <Attachment state={failed === true ? 'error' : 'done'}>
          <AttachmentMedia variant="icon">{failed === true ? <FileTextIcon /> : <CheckIcon />}</AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>request.json</AttachmentTitle>
            <AttachmentDescription>
              {failed === true ? 'Example upload error' : 'Example uploaded state'}
            </AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction aria-label="Toggle attachment sample state" onClick={() => setFailed(failed !== true)}>
              <CheckIcon />
            </AttachmentAction>
          </AttachmentActions>
        </Attachment>
      </ParitySection>
      <ParitySection title="Bubble">
        <BubbleGroup>
          <Bubble>
            <BubbleContent>Check the schema before submitting.</BubbleContent>
          </Bubble>
          <Bubble>
            <BubbleContent>The local example is ready.</BubbleContent>
          </Bubble>
        </BubbleGroup>
      </ParitySection>
      <ParitySection title="Message">
        <MessageGroup>
          <Message>
            <MessageAvatar>
              <Avatar>
                <AvatarFallback>PF</AvatarFallback>
              </Avatar>
            </MessageAvatar>
            <MessageContent>
              <MessageHeader>Sample reviewer</MessageHeader>
              <p>The schema passed its sample validation.</p>
              <MessageFooter>Local example</MessageFooter>
            </MessageContent>
          </Message>
        </MessageGroup>
      </ParitySection>
      <ParitySection title="Message scroller">
        <MessageScroller className="h-56">
          <MessageScrollerViewport aria-label="Sample event messages">
            <MessageScrollerContent>
              {messages.map((message) => (
                <MessageScrollerItem data-message-id={message.id} key={message.id}>
                  <p className="text-sm">{message.text}</p>
                </MessageScrollerItem>
              ))}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>

        <Button
          onClick={() =>
            setMessages([
              ...messages,
              { id: `event-${messages.length}`, text: `Sample event ${messages.length + 1}: request validated.` },
            ])
          }
          type="button"
          variant="outline"
        >
          Append sample event
        </Button>
      </ParitySection>
      <div className="min-w-0 md:col-span-2">
        <ParitySection title="Questionnaire">
          <p className="text-sm text-muted-foreground">
            Questionnaire composed from UI SDK controls. Protoform’s existing form adapters are unchanged.
          </p>
          <Questionnaire items={questions} onSubmit={submitAnswers} submitLabel="Save sample answers" />
          <p role="status">{answer}</p>
        </ParitySection>
      </div>
    </div>
  );
}
