import { CheckIcon, FileTextIcon } from 'lucide-react';
import { type SubmitEvent, useState } from 'react';
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from '@/components/ui/attachment';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bubble, BubbleContent, BubbleGroup } from '@/components/ui/bubble';
import { Button } from '@/components/ui/button';
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
} from '@/components/ui/message';
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from '@/components/ui/message-scroller';
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from '@/components/ui/questionnaire';
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
  const submitAnswers = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setAnswer(`Sample saved: ${String(form.get('format'))}.`);
  };
  return (
    <div className="grid min-w-0 gap-6 md:grid-cols-2" data-testid="parity-messages">
      <ParitySection title="Attachment">
        <p className="text-muted-foreground text-sm">Local presentation state, not an actual upload.</p>
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
        <MessageScrollerProvider defaultScrollPosition="start">
          <MessageScroller className="h-56">
            <MessageScrollerViewport aria-label="Sample event messages">
              <MessageScrollerContent>
                {messages.map((message) => (
                  <MessageScrollerItem key={message.id} messageId={message.id}>
                    <p className="text-sm">{message.text}</p>
                  </MessageScrollerItem>
                ))}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton />
          </MessageScroller>
        </MessageScrollerProvider>
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
          <p className="text-muted-foreground text-sm">
            Standalone shadcn questionnaire. Protoform’s existing form adapters are unchanged.
          </p>
          <Questionnaire items={questions} onSubmit={submitAnswers}>
            <QuestionnaireProgress />
            {questions.map((question) => (
              <QuestionnaireItem key={question.name} name={question.name} required={question.required}>
                <QuestionnaireTitle>{question.prompt}</QuestionnaireTitle>
                <QuestionnaireDescription>Choose an option for this local sample.</QuestionnaireDescription>
                <QuestionnaireChoices>
                  {question.choices.map((choice) => (
                    <QuestionnaireChoice key={choice.value} value={choice.value}>
                      {choice.label}
                    </QuestionnaireChoice>
                  ))}
                </QuestionnaireChoices>
                <QuestionnaireError />
              </QuestionnaireItem>
            ))}
            <QuestionnaireActions>
              <QuestionnairePrevious />
              <QuestionnaireSkip />
              <QuestionnaireNext />
              <QuestionnaireSubmit>Save sample answers</QuestionnaireSubmit>
            </QuestionnaireActions>
          </Questionnaire>
          <p role="status">{answer}</p>
        </ParitySection>
      </div>
    </div>
  );
}
