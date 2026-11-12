import { CheckIcon, FileTextIcon, FolderIcon } from 'lucide-react';
import { useId, useState } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio/index';
import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount } from '@/components/ui/avatar/index';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb/index';
import { Button } from '@/components/ui/button/index';
import { ButtonGroup } from '@/components/ui/button-group/index';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty/index';
import { OTPInput, OTPInputGroup, OTPInputSeparator, OTPInputSlot } from '@/components/ui/input-otp/index';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item/index';
import { Kbd, KbdGroup } from '@/components/ui/kbd/index';
import { Label } from '@/components/ui/label/index';
import { Marker, MarkerContent, MarkerIcon } from '@/components/ui/marker/index';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select/index';
import {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from '@/components/ui/progress/index';
import { Skeleton } from '@/components/ui/skeleton/index';
import { ParitySection } from './parity-shared';

export function FoundationExamples({ headingId }: { headingId: string }) {
  const parityFormatId = useId();
  const parityCodeId = useId();

  const [created, setCreated] = useState(false);
  const [progress, setProgress] = useState(25);
  const [format, setFormat] = useState('json');
  const [code, setCode] = useState('');
  const [revision, setRevision] = useState(0);
  const [schema, setSchema] = useState('None');
  return (
    <div className="grid min-w-0 gap-6 md:grid-cols-2" data-testid="parity-foundations">
      <ParitySection title="Empty">
        {created === true ? (
          <>
            <p role="status">A sample field was added.</p>
            <Button onClick={() => setCreated(false)} type="button" variant="outline">
              Reset empty state
            </Button>
          </>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FolderIcon />
              </EmptyMedia>
              <EmptyTitle>No fields yet</EmptyTitle>
              <EmptyDescription>Add a sample field to replace this empty state.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={() => setCreated(true)} type="button">
                Create sample field
              </Button>
            </EmptyContent>
          </Empty>
        )}
      </ParitySection>
      <ParitySection title="Skeleton">
        <p className="text-sm text-muted-foreground">Placeholder preview, not an active request.</p>
        <div aria-hidden="true" className="space-y-3">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </ParitySection>
      <ParitySection title="Progress">
        <Progress value={progress}>
          <ProgressLabel>Sample completion</ProgressLabel>
          <ProgressValue />
          <ProgressTrack>
            <ProgressIndicator />
          </ProgressTrack>
        </Progress>
        <Button
          disabled={progress === 100}
          onClick={() => setProgress(Math.min(100, progress + 25))}
          type="button"
          variant="outline"
        >
          Advance progress
        </Button>
        <Button onClick={() => setProgress(25)} type="button" variant="ghost">
          Reset progress
        </Button>
      </ParitySection>
      <ParitySection title="Native select">
        <Label htmlFor={parityFormatId}>Serialization format</Label>
        <NativeSelect id={parityFormatId} onChange={(event) => setFormat(event.currentTarget.value)} value={format}>
          <NativeSelectOption value="json">JSON</NativeSelectOption>
          <NativeSelectOption value="protobuf">Protobuf</NativeSelectOption>
        </NativeSelect>
        <output aria-label="Selected format">Selected: {format}</output>
        <NativeSelect aria-label="Disabled format" disabled>
          <NativeSelectOption>Disabled example</NativeSelectOption>
        </NativeSelect>
      </ParitySection>
      <ParitySection title="Input OTP">
        <Label htmlFor={parityCodeId}>Verification code</Label>
        <OTPInput id={parityCodeId} maxLength={6} onValueChange={setCode} pattern="digits" value={code}>
          <OTPInputGroup>
            <OTPInputSlot index={0} />
            <OTPInputSlot index={1} />
            <OTPInputSlot index={2} />
          </OTPInputGroup>
          <OTPInputSeparator />
          <OTPInputGroup>
            <OTPInputSlot index={3} />
            <OTPInputSlot index={4} />
            <OTPInputSlot index={5} />
          </OTPInputGroup>
        </OTPInput>
        <output aria-label="Entered code">{code.length === 0 ? 'Enter six digits.' : `Entered: ${code}`}</output>
      </ParitySection>
      <ParitySection title="Button group and keyboard hints">
        <ButtonGroup aria-label="Sample history" className="min-w-0">
          <Button
            disabled={revision === 0}
            onClick={() => setRevision(Math.max(0, revision - 1))}
            type="button"
            variant="outline"
          >
            Undo
          </Button>
          <Button onClick={() => setRevision(revision + 1)} type="button" variant="outline">
            Redo
          </Button>
        </ButtonGroup>
        <output aria-label="Sample revision">Revision {revision}</output>
        <p className="flex items-center gap-2 text-sm">
          Shortcut preview{' '}
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </p>
      </ParitySection>
      <ParitySection title="Item">
        <ItemGroup>
          <Item variant="outline">
            <ItemMedia variant="icon">
              <FileTextIcon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Profile schema</ItemTitle>
              <ItemDescription>A source-copy form definition.</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button onClick={() => setSchema('Profile')} type="button" variant="outline">
                Select schema
              </Button>
            </ItemActions>
          </Item>
          <Item size="sm">
            <ItemContent>
              <ItemTitle>Address schema</ItemTitle>
              <ItemDescription>Nested fields and validation.</ItemDescription>
            </ItemContent>
          </Item>
        </ItemGroup>
        <output aria-label="Selected schema">Selected: {schema}</output>
      </ParitySection>
      <ParitySection title="Avatar and aspect ratio">
        <AvatarGroup>
          <Avatar>
            <AvatarFallback>PF</AvatarFallback>
            <AvatarBadge>
              <CheckIcon />
            </AvatarBadge>
          </Avatar>
          <Avatar>
            <AvatarFallback>UI</AvatarFallback>
          </Avatar>
          <AvatarGroupCount>+2</AvatarGroupCount>
        </AvatarGroup>
        <AspectRatio ratio={16 / 9}>
          <div className="flex size-full items-center justify-center rounded-md bg-muted text-sm">16:9 preview</div>
        </AspectRatio>
      </ParitySection>
      <ParitySection title="Breadcrumb">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`#${headingId}`}>Components</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Catalog</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </ParitySection>
      <ParitySection title="Marker and direction">
        <Marker variant="separator">
          <MarkerIcon>
            <CheckIcon />
          </MarkerIcon>
          <MarkerContent>Revision 2</MarkerContent>
        </Marker>

        <div className="rounded-md border p-3 text-sm" dir="rtl">
          مرحبا — Protoform
        </div>
      </ParitySection>
    </div>
  );
}
