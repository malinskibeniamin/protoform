import { expectTypeOf } from 'expect-type';
import type React from 'react';
import type * as accordionLocal from './base-nova/protoform/components/accordion';
import type * as alertLocal from './base-nova/protoform/components/alert';
import type * as alertDialogLocal from './base-nova/protoform/components/alert-dialog';
import type * as aspectRatioLocal from './base-nova/protoform/components/aspect-ratio';
import type * as attachmentLocal from './base-nova/protoform/components/attachment';
import type * as avatarLocal from './base-nova/protoform/components/avatar';
import type * as badgeLocal from './base-nova/protoform/components/badge';
import type * as breadcrumbLocal from './base-nova/protoform/components/breadcrumb';
import type * as bubbleLocal from './base-nova/protoform/components/bubble';
import type * as buttonLocal from './base-nova/protoform/components/button';
import type * as buttonGroupLocal from './base-nova/protoform/components/button-group';
import type * as calendarLocal from './base-nova/protoform/components/calendar';
import type * as cardLocal from './base-nova/protoform/components/card';
import type * as carouselLocal from './base-nova/protoform/components/carousel';
import type * as chartLocal from './base-nova/protoform/components/chart';
import type * as checkboxLocal from './base-nova/protoform/components/checkbox';
import type * as codeBlockLocal from './base-nova/protoform/components/code-block';
import type * as collapsibleLocal from './base-nova/protoform/components/collapsible';
import type * as comboboxLocal from './base-nova/protoform/components/combobox';
import type * as commandLocal from './base-nova/protoform/components/command';
import type * as contextMenuLocal from './base-nova/protoform/components/context-menu';
import type * as dialogLocal from './base-nova/protoform/components/dialog';
import type * as directionLocal from './base-nova/protoform/components/direction';
import type * as drawerLocal from './base-nova/protoform/components/drawer';
import type * as dropdownMenuLocal from './base-nova/protoform/components/dropdown-menu';
import type * as emptyLocal from './base-nova/protoform/components/empty';
import type * as fieldLocal from './base-nova/protoform/components/field';
import type * as hoverCardLocal from './base-nova/protoform/components/hover-card';
import type * as inputLocal from './base-nova/protoform/components/input';
import type * as inputGroupLocal from './base-nova/protoform/components/input-group';
import type * as inputOtpLocal from './base-nova/protoform/components/input-otp';
import type * as itemLocal from './base-nova/protoform/components/item';
import type * as kbdLocal from './base-nova/protoform/components/kbd';
import type * as labelLocal from './base-nova/protoform/components/label';
import type * as markerLocal from './base-nova/protoform/components/marker';
import type * as menubarLocal from './base-nova/protoform/components/menubar';
import type * as messageLocal from './base-nova/protoform/components/message';
import type * as messageScrollerLocal from './base-nova/protoform/components/message-scroller';
import type * as nativeSelectLocal from './base-nova/protoform/components/native-select';
import type * as navigationMenuLocal from './base-nova/protoform/components/navigation-menu';
import type * as paginationLocal from './base-nova/protoform/components/pagination';
import type * as popoverLocal from './base-nova/protoform/components/popover';
import type * as progressLocal from './base-nova/protoform/components/progress';
import type * as questionnaireLocal from './base-nova/protoform/components/questionnaire';
import type * as radioGroupLocal from './base-nova/protoform/components/radio-group';
import type * as resizableLocal from './base-nova/protoform/components/resizable';
import type * as scrollAreaLocal from './base-nova/protoform/components/scroll-area';
import type * as selectLocal from './base-nova/protoform/components/select';
import type * as separatorLocal from './base-nova/protoform/components/separator';
import type * as sheetLocal from './base-nova/protoform/components/sheet';
import type * as sidebarLocal from './base-nova/protoform/components/sidebar';
import type * as skeletonLocal from './base-nova/protoform/components/skeleton';
import type * as sliderLocal from './base-nova/protoform/components/slider';
import type * as spinnerLocal from './base-nova/protoform/components/spinner';
import type * as switchLocal from './base-nova/protoform/components/switch';
import type * as tableLocal from './base-nova/protoform/components/table';
import type * as tabsLocal from './base-nova/protoform/components/tabs';
import type * as textareaLocal from './base-nova/protoform/components/textarea';
import type * as toastLocal from './base-nova/protoform/components/toast';
import type * as toggleLocal from './base-nova/protoform/components/toggle';
import type * as toggleGroupLocal from './base-nova/protoform/components/toggle-group';
import type * as tooltipLocal from './base-nova/protoform/components/tooltip';
import type * as traceLocal from './base-nova/protoform/components/trace';
import type * as accordionOfficial from './shadcn-api-contracts/accordion';
import type * as alertOfficial from './shadcn-api-contracts/alert';
import type * as alertDialogOfficial from './shadcn-api-contracts/alert-dialog';
import type * as aspectRatioOfficial from './shadcn-api-contracts/aspect-ratio';
import type * as attachmentOfficial from './shadcn-api-contracts/attachment';
import type * as avatarOfficial from './shadcn-api-contracts/avatar';
import type * as badgeOfficial from './shadcn-api-contracts/badge';
import type * as breadcrumbOfficial from './shadcn-api-contracts/breadcrumb';
import type * as bubbleOfficial from './shadcn-api-contracts/bubble';
import type * as buttonOfficial from './shadcn-api-contracts/button';
import type * as buttonGroupOfficial from './shadcn-api-contracts/button-group';
import type * as calendarOfficial from './shadcn-api-contracts/calendar';
import type * as cardOfficial from './shadcn-api-contracts/card';
import type * as carouselOfficial from './shadcn-api-contracts/carousel';
import type * as chartOfficial from './shadcn-api-contracts/chart';
import type * as checkboxOfficial from './shadcn-api-contracts/checkbox';
import type * as codeBlockOfficial from './shadcn-api-contracts/code-block';
import type * as collapsibleOfficial from './shadcn-api-contracts/collapsible';
import type * as comboboxOfficial from './shadcn-api-contracts/combobox';
import type * as commandOfficial from './shadcn-api-contracts/command';
import type * as contextMenuOfficial from './shadcn-api-contracts/context-menu';
import type * as dialogOfficial from './shadcn-api-contracts/dialog';
import type * as directionOfficial from './shadcn-api-contracts/direction';
import type * as drawerOfficial from './shadcn-api-contracts/drawer';
import type * as dropdownMenuOfficial from './shadcn-api-contracts/dropdown-menu';
import type * as emptyOfficial from './shadcn-api-contracts/empty';
import type * as fieldOfficial from './shadcn-api-contracts/field';
import type * as hoverCardOfficial from './shadcn-api-contracts/hover-card';
import type * as inputOfficial from './shadcn-api-contracts/input';
import type * as inputGroupOfficial from './shadcn-api-contracts/input-group';
import type * as inputOtpOfficial from './shadcn-api-contracts/input-otp';
import type * as itemOfficial from './shadcn-api-contracts/item';
import type * as kbdOfficial from './shadcn-api-contracts/kbd';
import type * as labelOfficial from './shadcn-api-contracts/label';
import type * as markerOfficial from './shadcn-api-contracts/marker';
import type * as menubarOfficial from './shadcn-api-contracts/menubar';
import type * as messageOfficial from './shadcn-api-contracts/message';
import type * as messageScrollerOfficial from './shadcn-api-contracts/message-scroller';
import type * as nativeSelectOfficial from './shadcn-api-contracts/native-select';
import type * as navigationMenuOfficial from './shadcn-api-contracts/navigation-menu';
import type * as paginationOfficial from './shadcn-api-contracts/pagination';
import type * as popoverOfficial from './shadcn-api-contracts/popover';
import type * as progressOfficial from './shadcn-api-contracts/progress';
import type * as questionnaireOfficial from './shadcn-api-contracts/questionnaire';
import type * as radioGroupOfficial from './shadcn-api-contracts/radio-group';
import type * as resizableOfficial from './shadcn-api-contracts/resizable';
import type * as scrollAreaOfficial from './shadcn-api-contracts/scroll-area';
import type * as selectOfficial from './shadcn-api-contracts/select';
import type * as separatorOfficial from './shadcn-api-contracts/separator';
import type * as sheetOfficial from './shadcn-api-contracts/sheet';
import type * as sidebarOfficial from './shadcn-api-contracts/sidebar';
import type * as skeletonOfficial from './shadcn-api-contracts/skeleton';
import type * as sliderOfficial from './shadcn-api-contracts/slider';
import type * as spinnerOfficial from './shadcn-api-contracts/spinner';
import type * as switchOfficial from './shadcn-api-contracts/switch';
import type * as tableOfficial from './shadcn-api-contracts/table';
import type * as tabsOfficial from './shadcn-api-contracts/tabs';
import type * as textareaOfficial from './shadcn-api-contracts/textarea';
import type * as toastOfficial from './shadcn-api-contracts/toast';
import type * as toggleOfficial from './shadcn-api-contracts/toggle';
import type * as toggleGroupOfficial from './shadcn-api-contracts/toggle-group';
import type * as tooltipOfficial from './shadcn-api-contracts/tooltip';
import type * as traceOfficial from './shadcn-api-contracts/trace';

declare const { test }: typeof import('bun:test');

test('accordion accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof accordionOfficial.Accordion>>().toExtend<
    React.ComponentProps<typeof accordionLocal.Accordion>
  >();
  expectTypeOf<React.ComponentProps<typeof accordionOfficial.AccordionItem>>().toExtend<
    React.ComponentProps<typeof accordionLocal.AccordionItem>
  >();
  expectTypeOf<React.ComponentProps<typeof accordionOfficial.AccordionTrigger>>().toExtend<
    React.ComponentProps<typeof accordionLocal.AccordionTrigger>
  >();
  expectTypeOf<React.ComponentProps<typeof accordionOfficial.AccordionContent>>().toExtend<
    React.ComponentProps<typeof accordionLocal.AccordionContent>
  >();
});

test('alert accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof alertOfficial.Alert>>().toExtend<
    React.ComponentProps<typeof alertLocal.Alert>
  >();
  expectTypeOf<React.ComponentProps<typeof alertOfficial.AlertTitle>>().toExtend<
    React.ComponentProps<typeof alertLocal.AlertTitle>
  >();
  expectTypeOf<React.ComponentProps<typeof alertOfficial.AlertDescription>>().toExtend<
    React.ComponentProps<typeof alertLocal.AlertDescription>
  >();
  expectTypeOf<React.ComponentProps<typeof alertOfficial.AlertAction>>().toExtend<
    React.ComponentProps<typeof alertLocal.AlertAction>
  >();
});

test('alert-dialog accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof alertDialogOfficial.AlertDialog>>().toExtend<
    React.ComponentProps<typeof alertDialogLocal.AlertDialog>
  >();
  expectTypeOf<React.ComponentProps<typeof alertDialogOfficial.AlertDialogAction>>().toExtend<
    React.ComponentProps<typeof alertDialogLocal.AlertDialogAction>
  >();
  expectTypeOf<React.ComponentProps<typeof alertDialogOfficial.AlertDialogCancel>>().toExtend<
    React.ComponentProps<typeof alertDialogLocal.AlertDialogCancel>
  >();
  expectTypeOf<React.ComponentProps<typeof alertDialogOfficial.AlertDialogContent>>().toExtend<
    React.ComponentProps<typeof alertDialogLocal.AlertDialogContent>
  >();
  expectTypeOf<React.ComponentProps<typeof alertDialogOfficial.AlertDialogDescription>>().toExtend<
    React.ComponentProps<typeof alertDialogLocal.AlertDialogDescription>
  >();
  expectTypeOf<React.ComponentProps<typeof alertDialogOfficial.AlertDialogFooter>>().toExtend<
    React.ComponentProps<typeof alertDialogLocal.AlertDialogFooter>
  >();
  expectTypeOf<React.ComponentProps<typeof alertDialogOfficial.AlertDialogHeader>>().toExtend<
    React.ComponentProps<typeof alertDialogLocal.AlertDialogHeader>
  >();
  expectTypeOf<React.ComponentProps<typeof alertDialogOfficial.AlertDialogMedia>>().toExtend<
    React.ComponentProps<typeof alertDialogLocal.AlertDialogMedia>
  >();
  expectTypeOf<React.ComponentProps<typeof alertDialogOfficial.AlertDialogOverlay>>().toExtend<
    React.ComponentProps<typeof alertDialogLocal.AlertDialogOverlay>
  >();
  expectTypeOf<React.ComponentProps<typeof alertDialogOfficial.AlertDialogPortal>>().toExtend<
    React.ComponentProps<typeof alertDialogLocal.AlertDialogPortal>
  >();
  expectTypeOf<React.ComponentProps<typeof alertDialogOfficial.AlertDialogTitle>>().toExtend<
    React.ComponentProps<typeof alertDialogLocal.AlertDialogTitle>
  >();
  expectTypeOf<React.ComponentProps<typeof alertDialogOfficial.AlertDialogTrigger>>().toExtend<
    React.ComponentProps<typeof alertDialogLocal.AlertDialogTrigger>
  >();
});

test('aspect-ratio accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof aspectRatioOfficial.AspectRatio>>().toExtend<
    React.ComponentProps<typeof aspectRatioLocal.AspectRatio>
  >();
});

test('attachment accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof attachmentOfficial.Attachment>>().toExtend<
    React.ComponentProps<typeof attachmentLocal.Attachment>
  >();
  expectTypeOf<React.ComponentProps<typeof attachmentOfficial.AttachmentGroup>>().toExtend<
    React.ComponentProps<typeof attachmentLocal.AttachmentGroup>
  >();
  expectTypeOf<React.ComponentProps<typeof attachmentOfficial.AttachmentMedia>>().toExtend<
    React.ComponentProps<typeof attachmentLocal.AttachmentMedia>
  >();
  expectTypeOf<React.ComponentProps<typeof attachmentOfficial.AttachmentContent>>().toExtend<
    React.ComponentProps<typeof attachmentLocal.AttachmentContent>
  >();
  expectTypeOf<React.ComponentProps<typeof attachmentOfficial.AttachmentTitle>>().toExtend<
    React.ComponentProps<typeof attachmentLocal.AttachmentTitle>
  >();
  expectTypeOf<React.ComponentProps<typeof attachmentOfficial.AttachmentDescription>>().toExtend<
    React.ComponentProps<typeof attachmentLocal.AttachmentDescription>
  >();
  expectTypeOf<React.ComponentProps<typeof attachmentOfficial.AttachmentActions>>().toExtend<
    React.ComponentProps<typeof attachmentLocal.AttachmentActions>
  >();
  expectTypeOf<React.ComponentProps<typeof attachmentOfficial.AttachmentAction>>().toExtend<
    React.ComponentProps<typeof attachmentLocal.AttachmentAction>
  >();
  expectTypeOf<React.ComponentProps<typeof attachmentOfficial.AttachmentTrigger>>().toExtend<
    React.ComponentProps<typeof attachmentLocal.AttachmentTrigger>
  >();
});

test('avatar accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof avatarOfficial.Avatar>>().toExtend<
    React.ComponentProps<typeof avatarLocal.Avatar>
  >();
  expectTypeOf<React.ComponentProps<typeof avatarOfficial.AvatarImage>>().toExtend<
    React.ComponentProps<typeof avatarLocal.AvatarImage>
  >();
  expectTypeOf<React.ComponentProps<typeof avatarOfficial.AvatarFallback>>().toExtend<
    React.ComponentProps<typeof avatarLocal.AvatarFallback>
  >();
  expectTypeOf<React.ComponentProps<typeof avatarOfficial.AvatarGroup>>().toExtend<
    React.ComponentProps<typeof avatarLocal.AvatarGroup>
  >();
  expectTypeOf<React.ComponentProps<typeof avatarOfficial.AvatarGroupCount>>().toExtend<
    React.ComponentProps<typeof avatarLocal.AvatarGroupCount>
  >();
  expectTypeOf<React.ComponentProps<typeof avatarOfficial.AvatarBadge>>().toExtend<
    React.ComponentProps<typeof avatarLocal.AvatarBadge>
  >();
});

test('badge accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof badgeOfficial.Badge>>().toExtend<
    React.ComponentProps<typeof badgeLocal.Badge>
  >();
  expectTypeOf<typeof badgeLocal.badgeVariants>().toExtend<typeof badgeOfficial.badgeVariants>();
});

test('breadcrumb accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof breadcrumbOfficial.Breadcrumb>>().toExtend<
    React.ComponentProps<typeof breadcrumbLocal.Breadcrumb>
  >();
  expectTypeOf<React.ComponentProps<typeof breadcrumbOfficial.BreadcrumbList>>().toExtend<
    React.ComponentProps<typeof breadcrumbLocal.BreadcrumbList>
  >();
  expectTypeOf<React.ComponentProps<typeof breadcrumbOfficial.BreadcrumbItem>>().toExtend<
    React.ComponentProps<typeof breadcrumbLocal.BreadcrumbItem>
  >();
  expectTypeOf<React.ComponentProps<typeof breadcrumbOfficial.BreadcrumbLink>>().toExtend<
    React.ComponentProps<typeof breadcrumbLocal.BreadcrumbLink>
  >();
  expectTypeOf<React.ComponentProps<typeof breadcrumbOfficial.BreadcrumbPage>>().toExtend<
    React.ComponentProps<typeof breadcrumbLocal.BreadcrumbPage>
  >();
  expectTypeOf<React.ComponentProps<typeof breadcrumbOfficial.BreadcrumbSeparator>>().toExtend<
    React.ComponentProps<typeof breadcrumbLocal.BreadcrumbSeparator>
  >();
  expectTypeOf<React.ComponentProps<typeof breadcrumbOfficial.BreadcrumbEllipsis>>().toExtend<
    React.ComponentProps<typeof breadcrumbLocal.BreadcrumbEllipsis>
  >();
});

test('bubble accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof bubbleOfficial.BubbleGroup>>().toExtend<
    React.ComponentProps<typeof bubbleLocal.BubbleGroup>
  >();
  expectTypeOf<React.ComponentProps<typeof bubbleOfficial.Bubble>>().toExtend<
    React.ComponentProps<typeof bubbleLocal.Bubble>
  >();
  expectTypeOf<React.ComponentProps<typeof bubbleOfficial.BubbleContent>>().toExtend<
    React.ComponentProps<typeof bubbleLocal.BubbleContent>
  >();
  expectTypeOf<React.ComponentProps<typeof bubbleOfficial.BubbleReactions>>().toExtend<
    React.ComponentProps<typeof bubbleLocal.BubbleReactions>
  >();
});

test('button accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof buttonOfficial.Button>>().toExtend<
    React.ComponentProps<typeof buttonLocal.Button>
  >();
  expectTypeOf<typeof buttonLocal.buttonVariants>().toExtend<typeof buttonOfficial.buttonVariants>();
});

test('button-group accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof buttonGroupOfficial.ButtonGroup>>().toExtend<
    React.ComponentProps<typeof buttonGroupLocal.ButtonGroup>
  >();
  expectTypeOf<React.ComponentProps<typeof buttonGroupOfficial.ButtonGroupSeparator>>().toExtend<
    React.ComponentProps<typeof buttonGroupLocal.ButtonGroupSeparator>
  >();
  expectTypeOf<React.ComponentProps<typeof buttonGroupOfficial.ButtonGroupText>>().toExtend<
    React.ComponentProps<typeof buttonGroupLocal.ButtonGroupText>
  >();
  expectTypeOf<typeof buttonGroupLocal.buttonGroupVariants>().toExtend<
    typeof buttonGroupOfficial.buttonGroupVariants
  >();
});

test('calendar accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof calendarOfficial.Calendar>>().toExtend<
    React.ComponentProps<typeof calendarLocal.Calendar>
  >();
  expectTypeOf<React.ComponentProps<typeof calendarOfficial.CalendarDayButton>>().toExtend<
    React.ComponentProps<typeof calendarLocal.CalendarDayButton>
  >();
});

test('card accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof cardOfficial.Card>>().toExtend<
    React.ComponentProps<typeof cardLocal.Card>
  >();
  expectTypeOf<React.ComponentProps<typeof cardOfficial.CardHeader>>().toExtend<
    React.ComponentProps<typeof cardLocal.CardHeader>
  >();
  expectTypeOf<React.ComponentProps<typeof cardOfficial.CardFooter>>().toExtend<
    React.ComponentProps<typeof cardLocal.CardFooter>
  >();
  expectTypeOf<React.ComponentProps<typeof cardOfficial.CardTitle>>().toExtend<
    React.ComponentProps<typeof cardLocal.CardTitle>
  >();
  expectTypeOf<React.ComponentProps<typeof cardOfficial.CardAction>>().toExtend<
    React.ComponentProps<typeof cardLocal.CardAction>
  >();
  expectTypeOf<React.ComponentProps<typeof cardOfficial.CardDescription>>().toExtend<
    React.ComponentProps<typeof cardLocal.CardDescription>
  >();
  expectTypeOf<React.ComponentProps<typeof cardOfficial.CardContent>>().toExtend<
    React.ComponentProps<typeof cardLocal.CardContent>
  >();
});

test('carousel accepts the pinned shadcn public props', () => {
  expectTypeOf<carouselOfficial.CarouselApi>().toEqualTypeOf<carouselLocal.CarouselApi>();
  expectTypeOf<React.ComponentProps<typeof carouselOfficial.Carousel>>().toExtend<
    React.ComponentProps<typeof carouselLocal.Carousel>
  >();
  expectTypeOf<React.ComponentProps<typeof carouselOfficial.CarouselContent>>().toExtend<
    React.ComponentProps<typeof carouselLocal.CarouselContent>
  >();
  expectTypeOf<React.ComponentProps<typeof carouselOfficial.CarouselItem>>().toExtend<
    React.ComponentProps<typeof carouselLocal.CarouselItem>
  >();
  expectTypeOf<React.ComponentProps<typeof carouselOfficial.CarouselPrevious>>().toExtend<
    React.ComponentProps<typeof carouselLocal.CarouselPrevious>
  >();
  expectTypeOf<React.ComponentProps<typeof carouselOfficial.CarouselNext>>().toExtend<
    React.ComponentProps<typeof carouselLocal.CarouselNext>
  >();
  expectTypeOf<typeof carouselLocal.useCarousel>().toExtend<typeof carouselOfficial.useCarousel>();
});

test('chart accepts the pinned shadcn public props', () => {
  expectTypeOf<chartOfficial.ChartConfig>().toEqualTypeOf<chartLocal.ChartConfig>();
  expectTypeOf<React.ComponentProps<typeof chartOfficial.ChartContainer>>().toExtend<
    React.ComponentProps<typeof chartLocal.ChartContainer>
  >();
  expectTypeOf<React.ComponentProps<typeof chartOfficial.ChartTooltip>>().toExtend<
    React.ComponentProps<typeof chartLocal.ChartTooltip>
  >();
  expectTypeOf<React.ComponentProps<typeof chartOfficial.ChartTooltipContent>>().toExtend<
    React.ComponentProps<typeof chartLocal.ChartTooltipContent>
  >();
  expectTypeOf<React.ComponentProps<typeof chartOfficial.ChartLegend>>().toExtend<
    React.ComponentProps<typeof chartLocal.ChartLegend>
  >();
  expectTypeOf<React.ComponentProps<typeof chartOfficial.ChartLegendContent>>().toExtend<
    React.ComponentProps<typeof chartLocal.ChartLegendContent>
  >();
  expectTypeOf<React.ComponentProps<typeof chartOfficial.ChartStyle>>().toExtend<
    React.ComponentProps<typeof chartLocal.ChartStyle>
  >();
});

test('checkbox accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof checkboxOfficial.Checkbox>>().toExtend<
    React.ComponentProps<typeof checkboxLocal.Checkbox>
  >();
});

test('code-block accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof codeBlockOfficial.CodeBlock>>().toExtend<
    React.ComponentProps<typeof codeBlockLocal.CodeBlock>
  >();
  expectTypeOf<React.ComponentProps<typeof codeBlockOfficial.CodeBlockHeader>>().toExtend<
    React.ComponentProps<typeof codeBlockLocal.CodeBlockHeader>
  >();
  expectTypeOf<React.ComponentProps<typeof codeBlockOfficial.CodeBlockTitle>>().toExtend<
    React.ComponentProps<typeof codeBlockLocal.CodeBlockTitle>
  >();
  expectTypeOf<React.ComponentProps<typeof codeBlockOfficial.CodeBlockActions>>().toExtend<
    React.ComponentProps<typeof codeBlockLocal.CodeBlockActions>
  >();
  expectTypeOf<React.ComponentProps<typeof codeBlockOfficial.CodeBlockCopyButton>>().toExtend<
    React.ComponentProps<typeof codeBlockLocal.CodeBlockCopyButton>
  >();
  expectTypeOf<React.ComponentProps<typeof codeBlockOfficial.CodeBlockContent>>().toExtend<
    React.ComponentProps<typeof codeBlockLocal.CodeBlockContent>
  >();
  expectTypeOf<React.ComponentProps<typeof codeBlockOfficial.CodeBlockLine>>().toExtend<
    React.ComponentProps<typeof codeBlockLocal.CodeBlockLine>
  >();
  expectTypeOf<React.ComponentProps<typeof codeBlockOfficial.CodeBlockFooter>>().toExtend<
    React.ComponentProps<typeof codeBlockLocal.CodeBlockFooter>
  >();
});

test('collapsible accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof collapsibleOfficial.Collapsible>>().toExtend<
    React.ComponentProps<typeof collapsibleLocal.Collapsible>
  >();
  expectTypeOf<React.ComponentProps<typeof collapsibleOfficial.CollapsibleTrigger>>().toExtend<
    React.ComponentProps<typeof collapsibleLocal.CollapsibleTrigger>
  >();
  expectTypeOf<React.ComponentProps<typeof collapsibleOfficial.CollapsibleContent>>().toExtend<
    React.ComponentProps<typeof collapsibleLocal.CollapsibleContent>
  >();
});

test('combobox accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof comboboxOfficial.Combobox>>().toExtend<
    React.ComponentProps<typeof comboboxLocal.Combobox>
  >();
  expectTypeOf<React.ComponentProps<typeof comboboxOfficial.ComboboxInput>>().toExtend<
    React.ComponentProps<typeof comboboxLocal.ComboboxInput>
  >();
  expectTypeOf<React.ComponentProps<typeof comboboxOfficial.ComboboxContent>>().toExtend<
    React.ComponentProps<typeof comboboxLocal.ComboboxContent>
  >();
  expectTypeOf<React.ComponentProps<typeof comboboxOfficial.ComboboxList>>().toExtend<
    React.ComponentProps<typeof comboboxLocal.ComboboxList>
  >();
  expectTypeOf<React.ComponentProps<typeof comboboxOfficial.ComboboxItem>>().toExtend<
    React.ComponentProps<typeof comboboxLocal.ComboboxItem>
  >();
  expectTypeOf<React.ComponentProps<typeof comboboxOfficial.ComboboxGroup>>().toExtend<
    React.ComponentProps<typeof comboboxLocal.ComboboxGroup>
  >();
  expectTypeOf<React.ComponentProps<typeof comboboxOfficial.ComboboxLabel>>().toExtend<
    React.ComponentProps<typeof comboboxLocal.ComboboxLabel>
  >();
  expectTypeOf<React.ComponentProps<typeof comboboxOfficial.ComboboxCollection>>().toExtend<
    React.ComponentProps<typeof comboboxLocal.ComboboxCollection>
  >();
  expectTypeOf<React.ComponentProps<typeof comboboxOfficial.ComboboxEmpty>>().toExtend<
    React.ComponentProps<typeof comboboxLocal.ComboboxEmpty>
  >();
  expectTypeOf<React.ComponentProps<typeof comboboxOfficial.ComboboxSeparator>>().toExtend<
    React.ComponentProps<typeof comboboxLocal.ComboboxSeparator>
  >();
  expectTypeOf<React.ComponentProps<typeof comboboxOfficial.ComboboxChips>>().toExtend<
    React.ComponentProps<typeof comboboxLocal.ComboboxChips>
  >();
  expectTypeOf<React.ComponentProps<typeof comboboxOfficial.ComboboxChip>>().toExtend<
    React.ComponentProps<typeof comboboxLocal.ComboboxChip>
  >();
  expectTypeOf<React.ComponentProps<typeof comboboxOfficial.ComboboxChipsInput>>().toExtend<
    React.ComponentProps<typeof comboboxLocal.ComboboxChipsInput>
  >();
  expectTypeOf<React.ComponentProps<typeof comboboxOfficial.ComboboxTrigger>>().toExtend<
    React.ComponentProps<typeof comboboxLocal.ComboboxTrigger>
  >();
  expectTypeOf<React.ComponentProps<typeof comboboxOfficial.ComboboxValue>>().toExtend<
    React.ComponentProps<typeof comboboxLocal.ComboboxValue>
  >();
  expectTypeOf<typeof comboboxLocal.useComboboxAnchor>().toExtend<typeof comboboxOfficial.useComboboxAnchor>();
});

test('command accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof commandOfficial.Command>>().toExtend<
    React.ComponentProps<typeof commandLocal.Command>
  >();
  expectTypeOf<React.ComponentProps<typeof commandOfficial.CommandDialog>>().toExtend<
    React.ComponentProps<typeof commandLocal.CommandDialog>
  >();
  expectTypeOf<React.ComponentProps<typeof commandOfficial.CommandInput>>().toExtend<
    React.ComponentProps<typeof commandLocal.CommandInput>
  >();
  expectTypeOf<React.ComponentProps<typeof commandOfficial.CommandList>>().toExtend<
    React.ComponentProps<typeof commandLocal.CommandList>
  >();
  expectTypeOf<React.ComponentProps<typeof commandOfficial.CommandEmpty>>().toExtend<
    React.ComponentProps<typeof commandLocal.CommandEmpty>
  >();
  expectTypeOf<React.ComponentProps<typeof commandOfficial.CommandGroup>>().toExtend<
    React.ComponentProps<typeof commandLocal.CommandGroup>
  >();
  expectTypeOf<React.ComponentProps<typeof commandOfficial.CommandItem>>().toExtend<
    React.ComponentProps<typeof commandLocal.CommandItem>
  >();
  expectTypeOf<React.ComponentProps<typeof commandOfficial.CommandShortcut>>().toExtend<
    React.ComponentProps<typeof commandLocal.CommandShortcut>
  >();
  expectTypeOf<React.ComponentProps<typeof commandOfficial.CommandSeparator>>().toExtend<
    React.ComponentProps<typeof commandLocal.CommandSeparator>
  >();
});

test('context-menu accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof contextMenuOfficial.ContextMenu>>().toExtend<
    React.ComponentProps<typeof contextMenuLocal.ContextMenu>
  >();
  expectTypeOf<React.ComponentProps<typeof contextMenuOfficial.ContextMenuTrigger>>().toExtend<
    React.ComponentProps<typeof contextMenuLocal.ContextMenuTrigger>
  >();
  expectTypeOf<React.ComponentProps<typeof contextMenuOfficial.ContextMenuContent>>().toExtend<
    React.ComponentProps<typeof contextMenuLocal.ContextMenuContent>
  >();
  expectTypeOf<React.ComponentProps<typeof contextMenuOfficial.ContextMenuItem>>().toExtend<
    React.ComponentProps<typeof contextMenuLocal.ContextMenuItem>
  >();
  expectTypeOf<React.ComponentProps<typeof contextMenuOfficial.ContextMenuCheckboxItem>>().toExtend<
    React.ComponentProps<typeof contextMenuLocal.ContextMenuCheckboxItem>
  >();
  expectTypeOf<React.ComponentProps<typeof contextMenuOfficial.ContextMenuRadioItem>>().toExtend<
    React.ComponentProps<typeof contextMenuLocal.ContextMenuRadioItem>
  >();
  expectTypeOf<React.ComponentProps<typeof contextMenuOfficial.ContextMenuLabel>>().toExtend<
    React.ComponentProps<typeof contextMenuLocal.ContextMenuLabel>
  >();
  expectTypeOf<React.ComponentProps<typeof contextMenuOfficial.ContextMenuSeparator>>().toExtend<
    React.ComponentProps<typeof contextMenuLocal.ContextMenuSeparator>
  >();
  expectTypeOf<React.ComponentProps<typeof contextMenuOfficial.ContextMenuShortcut>>().toExtend<
    React.ComponentProps<typeof contextMenuLocal.ContextMenuShortcut>
  >();
  expectTypeOf<React.ComponentProps<typeof contextMenuOfficial.ContextMenuGroup>>().toExtend<
    React.ComponentProps<typeof contextMenuLocal.ContextMenuGroup>
  >();
  expectTypeOf<React.ComponentProps<typeof contextMenuOfficial.ContextMenuPortal>>().toExtend<
    React.ComponentProps<typeof contextMenuLocal.ContextMenuPortal>
  >();
  expectTypeOf<React.ComponentProps<typeof contextMenuOfficial.ContextMenuSub>>().toExtend<
    React.ComponentProps<typeof contextMenuLocal.ContextMenuSub>
  >();
  expectTypeOf<React.ComponentProps<typeof contextMenuOfficial.ContextMenuSubContent>>().toExtend<
    React.ComponentProps<typeof contextMenuLocal.ContextMenuSubContent>
  >();
  expectTypeOf<React.ComponentProps<typeof contextMenuOfficial.ContextMenuSubTrigger>>().toExtend<
    React.ComponentProps<typeof contextMenuLocal.ContextMenuSubTrigger>
  >();
  expectTypeOf<React.ComponentProps<typeof contextMenuOfficial.ContextMenuRadioGroup>>().toExtend<
    React.ComponentProps<typeof contextMenuLocal.ContextMenuRadioGroup>
  >();
});

test('dialog accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof dialogOfficial.Dialog>>().toExtend<
    React.ComponentProps<typeof dialogLocal.Dialog>
  >();
  expectTypeOf<React.ComponentProps<typeof dialogOfficial.DialogClose>>().toExtend<
    React.ComponentProps<typeof dialogLocal.DialogClose>
  >();
  expectTypeOf<React.ComponentProps<typeof dialogOfficial.DialogContent>>().toExtend<
    React.ComponentProps<typeof dialogLocal.DialogContent>
  >();
  expectTypeOf<React.ComponentProps<typeof dialogOfficial.DialogDescription>>().toExtend<
    React.ComponentProps<typeof dialogLocal.DialogDescription>
  >();
  expectTypeOf<React.ComponentProps<typeof dialogOfficial.DialogFooter>>().toExtend<
    React.ComponentProps<typeof dialogLocal.DialogFooter>
  >();
  expectTypeOf<React.ComponentProps<typeof dialogOfficial.DialogHeader>>().toExtend<
    React.ComponentProps<typeof dialogLocal.DialogHeader>
  >();
  expectTypeOf<React.ComponentProps<typeof dialogOfficial.DialogOverlay>>().toExtend<
    React.ComponentProps<typeof dialogLocal.DialogOverlay>
  >();
  expectTypeOf<React.ComponentProps<typeof dialogOfficial.DialogPortal>>().toExtend<
    React.ComponentProps<typeof dialogLocal.DialogPortal>
  >();
  expectTypeOf<React.ComponentProps<typeof dialogOfficial.DialogTitle>>().toExtend<
    React.ComponentProps<typeof dialogLocal.DialogTitle>
  >();
  expectTypeOf<React.ComponentProps<typeof dialogOfficial.DialogTrigger>>().toExtend<
    React.ComponentProps<typeof dialogLocal.DialogTrigger>
  >();
});

test('direction accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof directionOfficial.DirectionProvider>>().toExtend<
    React.ComponentProps<typeof directionLocal.DirectionProvider>
  >();
  expectTypeOf<typeof directionLocal.useDirection>().toExtend<typeof directionOfficial.useDirection>();
});

test('drawer accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof drawerOfficial.Drawer>>().toExtend<
    React.ComponentProps<typeof drawerLocal.Drawer>
  >();
  expectTypeOf<React.ComponentProps<typeof drawerOfficial.DrawerPortal>>().toExtend<
    React.ComponentProps<typeof drawerLocal.DrawerPortal>
  >();
  expectTypeOf<React.ComponentProps<typeof drawerOfficial.DrawerOverlay>>().toExtend<
    React.ComponentProps<typeof drawerLocal.DrawerOverlay>
  >();
  expectTypeOf<React.ComponentProps<typeof drawerOfficial.DrawerSwipeHandle>>().toExtend<
    React.ComponentProps<typeof drawerLocal.DrawerSwipeHandle>
  >();
  expectTypeOf<React.ComponentProps<typeof drawerOfficial.DrawerTrigger>>().toExtend<
    React.ComponentProps<typeof drawerLocal.DrawerTrigger>
  >();
  expectTypeOf<React.ComponentProps<typeof drawerOfficial.DrawerClose>>().toExtend<
    React.ComponentProps<typeof drawerLocal.DrawerClose>
  >();
  expectTypeOf<React.ComponentProps<typeof drawerOfficial.DrawerContent>>().toExtend<
    React.ComponentProps<typeof drawerLocal.DrawerContent>
  >();
  expectTypeOf<React.ComponentProps<typeof drawerOfficial.DrawerHeader>>().toExtend<
    React.ComponentProps<typeof drawerLocal.DrawerHeader>
  >();
  expectTypeOf<React.ComponentProps<typeof drawerOfficial.DrawerFooter>>().toExtend<
    React.ComponentProps<typeof drawerLocal.DrawerFooter>
  >();
  expectTypeOf<React.ComponentProps<typeof drawerOfficial.DrawerTitle>>().toExtend<
    React.ComponentProps<typeof drawerLocal.DrawerTitle>
  >();
  expectTypeOf<React.ComponentProps<typeof drawerOfficial.DrawerDescription>>().toExtend<
    React.ComponentProps<typeof drawerLocal.DrawerDescription>
  >();
});

test('dropdown-menu accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof dropdownMenuOfficial.DropdownMenu>>().toExtend<
    React.ComponentProps<typeof dropdownMenuLocal.DropdownMenu>
  >();
  expectTypeOf<React.ComponentProps<typeof dropdownMenuOfficial.DropdownMenuPortal>>().toExtend<
    React.ComponentProps<typeof dropdownMenuLocal.DropdownMenuPortal>
  >();
  expectTypeOf<React.ComponentProps<typeof dropdownMenuOfficial.DropdownMenuTrigger>>().toExtend<
    React.ComponentProps<typeof dropdownMenuLocal.DropdownMenuTrigger>
  >();
  expectTypeOf<React.ComponentProps<typeof dropdownMenuOfficial.DropdownMenuContent>>().toExtend<
    React.ComponentProps<typeof dropdownMenuLocal.DropdownMenuContent>
  >();
  expectTypeOf<React.ComponentProps<typeof dropdownMenuOfficial.DropdownMenuGroup>>().toExtend<
    React.ComponentProps<typeof dropdownMenuLocal.DropdownMenuGroup>
  >();
  expectTypeOf<React.ComponentProps<typeof dropdownMenuOfficial.DropdownMenuLabel>>().toExtend<
    React.ComponentProps<typeof dropdownMenuLocal.DropdownMenuLabel>
  >();
  expectTypeOf<React.ComponentProps<typeof dropdownMenuOfficial.DropdownMenuItem>>().toExtend<
    React.ComponentProps<typeof dropdownMenuLocal.DropdownMenuItem>
  >();
  expectTypeOf<React.ComponentProps<typeof dropdownMenuOfficial.DropdownMenuCheckboxItem>>().toExtend<
    React.ComponentProps<typeof dropdownMenuLocal.DropdownMenuCheckboxItem>
  >();
  expectTypeOf<React.ComponentProps<typeof dropdownMenuOfficial.DropdownMenuRadioGroup>>().toExtend<
    React.ComponentProps<typeof dropdownMenuLocal.DropdownMenuRadioGroup>
  >();
  expectTypeOf<React.ComponentProps<typeof dropdownMenuOfficial.DropdownMenuRadioItem>>().toExtend<
    React.ComponentProps<typeof dropdownMenuLocal.DropdownMenuRadioItem>
  >();
  expectTypeOf<React.ComponentProps<typeof dropdownMenuOfficial.DropdownMenuSeparator>>().toExtend<
    React.ComponentProps<typeof dropdownMenuLocal.DropdownMenuSeparator>
  >();
  expectTypeOf<React.ComponentProps<typeof dropdownMenuOfficial.DropdownMenuShortcut>>().toExtend<
    React.ComponentProps<typeof dropdownMenuLocal.DropdownMenuShortcut>
  >();
  expectTypeOf<React.ComponentProps<typeof dropdownMenuOfficial.DropdownMenuSub>>().toExtend<
    React.ComponentProps<typeof dropdownMenuLocal.DropdownMenuSub>
  >();
  expectTypeOf<React.ComponentProps<typeof dropdownMenuOfficial.DropdownMenuSubTrigger>>().toExtend<
    React.ComponentProps<typeof dropdownMenuLocal.DropdownMenuSubTrigger>
  >();
  expectTypeOf<React.ComponentProps<typeof dropdownMenuOfficial.DropdownMenuSubContent>>().toExtend<
    React.ComponentProps<typeof dropdownMenuLocal.DropdownMenuSubContent>
  >();
});

test('empty accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof emptyOfficial.Empty>>().toExtend<
    React.ComponentProps<typeof emptyLocal.Empty>
  >();
  expectTypeOf<React.ComponentProps<typeof emptyOfficial.EmptyHeader>>().toExtend<
    React.ComponentProps<typeof emptyLocal.EmptyHeader>
  >();
  expectTypeOf<React.ComponentProps<typeof emptyOfficial.EmptyTitle>>().toExtend<
    React.ComponentProps<typeof emptyLocal.EmptyTitle>
  >();
  expectTypeOf<React.ComponentProps<typeof emptyOfficial.EmptyDescription>>().toExtend<
    React.ComponentProps<typeof emptyLocal.EmptyDescription>
  >();
  expectTypeOf<React.ComponentProps<typeof emptyOfficial.EmptyContent>>().toExtend<
    React.ComponentProps<typeof emptyLocal.EmptyContent>
  >();
  expectTypeOf<React.ComponentProps<typeof emptyOfficial.EmptyMedia>>().toExtend<
    React.ComponentProps<typeof emptyLocal.EmptyMedia>
  >();
});

test('field accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof fieldOfficial.Field>>().toExtend<
    React.ComponentProps<typeof fieldLocal.Field>
  >();
  expectTypeOf<React.ComponentProps<typeof fieldOfficial.FieldLabel>>().toExtend<
    React.ComponentProps<typeof fieldLocal.FieldLabel>
  >();
  expectTypeOf<React.ComponentProps<typeof fieldOfficial.FieldDescription>>().toExtend<
    React.ComponentProps<typeof fieldLocal.FieldDescription>
  >();
  expectTypeOf<React.ComponentProps<typeof fieldOfficial.FieldError>>().toExtend<
    React.ComponentProps<typeof fieldLocal.FieldError>
  >();
  expectTypeOf<React.ComponentProps<typeof fieldOfficial.FieldGroup>>().toExtend<
    React.ComponentProps<typeof fieldLocal.FieldGroup>
  >();
  expectTypeOf<React.ComponentProps<typeof fieldOfficial.FieldLegend>>().toExtend<
    React.ComponentProps<typeof fieldLocal.FieldLegend>
  >();
  expectTypeOf<React.ComponentProps<typeof fieldOfficial.FieldSeparator>>().toExtend<
    React.ComponentProps<typeof fieldLocal.FieldSeparator>
  >();
  expectTypeOf<React.ComponentProps<typeof fieldOfficial.FieldSet>>().toExtend<
    React.ComponentProps<typeof fieldLocal.FieldSet>
  >();
  expectTypeOf<React.ComponentProps<typeof fieldOfficial.FieldContent>>().toExtend<
    React.ComponentProps<typeof fieldLocal.FieldContent>
  >();
  expectTypeOf<React.ComponentProps<typeof fieldOfficial.FieldTitle>>().toExtend<
    React.ComponentProps<typeof fieldLocal.FieldTitle>
  >();
});

test('hover-card accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof hoverCardOfficial.HoverCard>>().toExtend<
    React.ComponentProps<typeof hoverCardLocal.HoverCard>
  >();
  expectTypeOf<React.ComponentProps<typeof hoverCardOfficial.HoverCardTrigger>>().toExtend<
    React.ComponentProps<typeof hoverCardLocal.HoverCardTrigger>
  >();
  expectTypeOf<React.ComponentProps<typeof hoverCardOfficial.HoverCardContent>>().toExtend<
    React.ComponentProps<typeof hoverCardLocal.HoverCardContent>
  >();
});

test('input accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof inputOfficial.Input>>().toExtend<
    React.ComponentProps<typeof inputLocal.Input>
  >();
});

test('input-group accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof inputGroupOfficial.InputGroup>>().toExtend<
    React.ComponentProps<typeof inputGroupLocal.InputGroup>
  >();
  expectTypeOf<React.ComponentProps<typeof inputGroupOfficial.InputGroupAddon>>().toExtend<
    React.ComponentProps<typeof inputGroupLocal.InputGroupAddon>
  >();
  expectTypeOf<React.ComponentProps<typeof inputGroupOfficial.InputGroupButton>>().toExtend<
    React.ComponentProps<typeof inputGroupLocal.InputGroupButton>
  >();
  expectTypeOf<React.ComponentProps<typeof inputGroupOfficial.InputGroupText>>().toExtend<
    React.ComponentProps<typeof inputGroupLocal.InputGroupText>
  >();
  expectTypeOf<React.ComponentProps<typeof inputGroupOfficial.InputGroupInput>>().toExtend<
    React.ComponentProps<typeof inputGroupLocal.InputGroupInput>
  >();
  expectTypeOf<React.ComponentProps<typeof inputGroupOfficial.InputGroupTextarea>>().toExtend<
    React.ComponentProps<typeof inputGroupLocal.InputGroupTextarea>
  >();
});

test('input-otp accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof inputOtpOfficial.InputOTP>>().toExtend<
    React.ComponentProps<typeof inputOtpLocal.InputOTP>
  >();
  expectTypeOf<React.ComponentProps<typeof inputOtpOfficial.InputOTPGroup>>().toExtend<
    React.ComponentProps<typeof inputOtpLocal.InputOTPGroup>
  >();
  expectTypeOf<React.ComponentProps<typeof inputOtpOfficial.InputOTPSlot>>().toExtend<
    React.ComponentProps<typeof inputOtpLocal.InputOTPSlot>
  >();
  expectTypeOf<React.ComponentProps<typeof inputOtpOfficial.InputOTPSeparator>>().toExtend<
    React.ComponentProps<typeof inputOtpLocal.InputOTPSeparator>
  >();
});

test('item accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof itemOfficial.Item>>().toExtend<
    React.ComponentProps<typeof itemLocal.Item>
  >();
  expectTypeOf<React.ComponentProps<typeof itemOfficial.ItemMedia>>().toExtend<
    React.ComponentProps<typeof itemLocal.ItemMedia>
  >();
  expectTypeOf<React.ComponentProps<typeof itemOfficial.ItemContent>>().toExtend<
    React.ComponentProps<typeof itemLocal.ItemContent>
  >();
  expectTypeOf<React.ComponentProps<typeof itemOfficial.ItemActions>>().toExtend<
    React.ComponentProps<typeof itemLocal.ItemActions>
  >();
  expectTypeOf<React.ComponentProps<typeof itemOfficial.ItemGroup>>().toExtend<
    React.ComponentProps<typeof itemLocal.ItemGroup>
  >();
  expectTypeOf<React.ComponentProps<typeof itemOfficial.ItemSeparator>>().toExtend<
    React.ComponentProps<typeof itemLocal.ItemSeparator>
  >();
  expectTypeOf<React.ComponentProps<typeof itemOfficial.ItemTitle>>().toExtend<
    React.ComponentProps<typeof itemLocal.ItemTitle>
  >();
  expectTypeOf<React.ComponentProps<typeof itemOfficial.ItemDescription>>().toExtend<
    React.ComponentProps<typeof itemLocal.ItemDescription>
  >();
  expectTypeOf<React.ComponentProps<typeof itemOfficial.ItemHeader>>().toExtend<
    React.ComponentProps<typeof itemLocal.ItemHeader>
  >();
  expectTypeOf<React.ComponentProps<typeof itemOfficial.ItemFooter>>().toExtend<
    React.ComponentProps<typeof itemLocal.ItemFooter>
  >();
});

test('kbd accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof kbdOfficial.Kbd>>().toExtend<React.ComponentProps<typeof kbdLocal.Kbd>>();
  expectTypeOf<React.ComponentProps<typeof kbdOfficial.KbdGroup>>().toExtend<
    React.ComponentProps<typeof kbdLocal.KbdGroup>
  >();
});

test('label accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof labelOfficial.Label>>().toExtend<
    React.ComponentProps<typeof labelLocal.Label>
  >();
});

test('marker accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof markerOfficial.Marker>>().toExtend<
    React.ComponentProps<typeof markerLocal.Marker>
  >();
  expectTypeOf<React.ComponentProps<typeof markerOfficial.MarkerIcon>>().toExtend<
    React.ComponentProps<typeof markerLocal.MarkerIcon>
  >();
  expectTypeOf<React.ComponentProps<typeof markerOfficial.MarkerContent>>().toExtend<
    React.ComponentProps<typeof markerLocal.MarkerContent>
  >();
  expectTypeOf<typeof markerLocal.markerVariants>().toExtend<typeof markerOfficial.markerVariants>();
});

test('menubar accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof menubarOfficial.Menubar>>().toExtend<
    React.ComponentProps<typeof menubarLocal.Menubar>
  >();
  expectTypeOf<React.ComponentProps<typeof menubarOfficial.MenubarPortal>>().toExtend<
    React.ComponentProps<typeof menubarLocal.MenubarPortal>
  >();
  expectTypeOf<React.ComponentProps<typeof menubarOfficial.MenubarMenu>>().toExtend<
    React.ComponentProps<typeof menubarLocal.MenubarMenu>
  >();
  expectTypeOf<React.ComponentProps<typeof menubarOfficial.MenubarTrigger>>().toExtend<
    React.ComponentProps<typeof menubarLocal.MenubarTrigger>
  >();
  expectTypeOf<React.ComponentProps<typeof menubarOfficial.MenubarContent>>().toExtend<
    React.ComponentProps<typeof menubarLocal.MenubarContent>
  >();
  expectTypeOf<React.ComponentProps<typeof menubarOfficial.MenubarGroup>>().toExtend<
    React.ComponentProps<typeof menubarLocal.MenubarGroup>
  >();
  expectTypeOf<React.ComponentProps<typeof menubarOfficial.MenubarSeparator>>().toExtend<
    React.ComponentProps<typeof menubarLocal.MenubarSeparator>
  >();
  expectTypeOf<React.ComponentProps<typeof menubarOfficial.MenubarLabel>>().toExtend<
    React.ComponentProps<typeof menubarLocal.MenubarLabel>
  >();
  expectTypeOf<React.ComponentProps<typeof menubarOfficial.MenubarItem>>().toExtend<
    React.ComponentProps<typeof menubarLocal.MenubarItem>
  >();
  expectTypeOf<React.ComponentProps<typeof menubarOfficial.MenubarShortcut>>().toExtend<
    React.ComponentProps<typeof menubarLocal.MenubarShortcut>
  >();
  expectTypeOf<React.ComponentProps<typeof menubarOfficial.MenubarCheckboxItem>>().toExtend<
    React.ComponentProps<typeof menubarLocal.MenubarCheckboxItem>
  >();
  expectTypeOf<React.ComponentProps<typeof menubarOfficial.MenubarRadioGroup>>().toExtend<
    React.ComponentProps<typeof menubarLocal.MenubarRadioGroup>
  >();
  expectTypeOf<React.ComponentProps<typeof menubarOfficial.MenubarRadioItem>>().toExtend<
    React.ComponentProps<typeof menubarLocal.MenubarRadioItem>
  >();
  expectTypeOf<React.ComponentProps<typeof menubarOfficial.MenubarSub>>().toExtend<
    React.ComponentProps<typeof menubarLocal.MenubarSub>
  >();
  expectTypeOf<React.ComponentProps<typeof menubarOfficial.MenubarSubTrigger>>().toExtend<
    React.ComponentProps<typeof menubarLocal.MenubarSubTrigger>
  >();
  expectTypeOf<React.ComponentProps<typeof menubarOfficial.MenubarSubContent>>().toExtend<
    React.ComponentProps<typeof menubarLocal.MenubarSubContent>
  >();
});

test('message accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof messageOfficial.MessageGroup>>().toExtend<
    React.ComponentProps<typeof messageLocal.MessageGroup>
  >();
  expectTypeOf<React.ComponentProps<typeof messageOfficial.Message>>().toExtend<
    React.ComponentProps<typeof messageLocal.Message>
  >();
  expectTypeOf<React.ComponentProps<typeof messageOfficial.MessageAvatar>>().toExtend<
    React.ComponentProps<typeof messageLocal.MessageAvatar>
  >();
  expectTypeOf<React.ComponentProps<typeof messageOfficial.MessageContent>>().toExtend<
    React.ComponentProps<typeof messageLocal.MessageContent>
  >();
  expectTypeOf<React.ComponentProps<typeof messageOfficial.MessageFooter>>().toExtend<
    React.ComponentProps<typeof messageLocal.MessageFooter>
  >();
  expectTypeOf<React.ComponentProps<typeof messageOfficial.MessageHeader>>().toExtend<
    React.ComponentProps<typeof messageLocal.MessageHeader>
  >();
});

test('message-scroller accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof messageScrollerOfficial.MessageScrollerProvider>>().toExtend<
    React.ComponentProps<typeof messageScrollerLocal.MessageScrollerProvider>
  >();
  expectTypeOf<React.ComponentProps<typeof messageScrollerOfficial.MessageScroller>>().toExtend<
    React.ComponentProps<typeof messageScrollerLocal.MessageScroller>
  >();
  expectTypeOf<React.ComponentProps<typeof messageScrollerOfficial.MessageScrollerViewport>>().toExtend<
    React.ComponentProps<typeof messageScrollerLocal.MessageScrollerViewport>
  >();
  expectTypeOf<React.ComponentProps<typeof messageScrollerOfficial.MessageScrollerContent>>().toExtend<
    React.ComponentProps<typeof messageScrollerLocal.MessageScrollerContent>
  >();
  expectTypeOf<React.ComponentProps<typeof messageScrollerOfficial.MessageScrollerItem>>().toExtend<
    React.ComponentProps<typeof messageScrollerLocal.MessageScrollerItem>
  >();
  expectTypeOf<React.ComponentProps<typeof messageScrollerOfficial.MessageScrollerButton>>().toExtend<
    React.ComponentProps<typeof messageScrollerLocal.MessageScrollerButton>
  >();
  expectTypeOf<typeof messageScrollerLocal.useMessageScroller>().toExtend<
    typeof messageScrollerOfficial.useMessageScroller
  >();
  expectTypeOf<typeof messageScrollerLocal.useMessageScrollerScrollable>().toExtend<
    typeof messageScrollerOfficial.useMessageScrollerScrollable
  >();
  expectTypeOf<typeof messageScrollerLocal.useMessageScrollerVisibility>().toExtend<
    typeof messageScrollerOfficial.useMessageScrollerVisibility
  >();
});

test('native-select accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof nativeSelectOfficial.NativeSelect>>().toExtend<
    React.ComponentProps<typeof nativeSelectLocal.NativeSelect>
  >();
  expectTypeOf<React.ComponentProps<typeof nativeSelectOfficial.NativeSelectOptGroup>>().toExtend<
    React.ComponentProps<typeof nativeSelectLocal.NativeSelectOptGroup>
  >();
  expectTypeOf<React.ComponentProps<typeof nativeSelectOfficial.NativeSelectOption>>().toExtend<
    React.ComponentProps<typeof nativeSelectLocal.NativeSelectOption>
  >();
});

test('navigation-menu accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof navigationMenuOfficial.NavigationMenu>>().toExtend<
    React.ComponentProps<typeof navigationMenuLocal.NavigationMenu>
  >();
  expectTypeOf<React.ComponentProps<typeof navigationMenuOfficial.NavigationMenuContent>>().toExtend<
    React.ComponentProps<typeof navigationMenuLocal.NavigationMenuContent>
  >();
  expectTypeOf<React.ComponentProps<typeof navigationMenuOfficial.NavigationMenuIndicator>>().toExtend<
    React.ComponentProps<typeof navigationMenuLocal.NavigationMenuIndicator>
  >();
  expectTypeOf<React.ComponentProps<typeof navigationMenuOfficial.NavigationMenuItem>>().toExtend<
    React.ComponentProps<typeof navigationMenuLocal.NavigationMenuItem>
  >();
  expectTypeOf<React.ComponentProps<typeof navigationMenuOfficial.NavigationMenuLink>>().toExtend<
    React.ComponentProps<typeof navigationMenuLocal.NavigationMenuLink>
  >();
  expectTypeOf<React.ComponentProps<typeof navigationMenuOfficial.NavigationMenuList>>().toExtend<
    React.ComponentProps<typeof navigationMenuLocal.NavigationMenuList>
  >();
  expectTypeOf<React.ComponentProps<typeof navigationMenuOfficial.NavigationMenuTrigger>>().toExtend<
    React.ComponentProps<typeof navigationMenuLocal.NavigationMenuTrigger>
  >();
  expectTypeOf<typeof navigationMenuLocal.navigationMenuTriggerStyle>().toExtend<
    typeof navigationMenuOfficial.navigationMenuTriggerStyle
  >();
  expectTypeOf<React.ComponentProps<typeof navigationMenuOfficial.NavigationMenuPositioner>>().toExtend<
    React.ComponentProps<typeof navigationMenuLocal.NavigationMenuPositioner>
  >();
});

test('pagination accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof paginationOfficial.Pagination>>().toExtend<
    React.ComponentProps<typeof paginationLocal.Pagination>
  >();
  expectTypeOf<React.ComponentProps<typeof paginationOfficial.PaginationContent>>().toExtend<
    React.ComponentProps<typeof paginationLocal.PaginationContent>
  >();
  expectTypeOf<React.ComponentProps<typeof paginationOfficial.PaginationEllipsis>>().toExtend<
    React.ComponentProps<typeof paginationLocal.PaginationEllipsis>
  >();
  expectTypeOf<React.ComponentProps<typeof paginationOfficial.PaginationItem>>().toExtend<
    React.ComponentProps<typeof paginationLocal.PaginationItem>
  >();
  expectTypeOf<React.ComponentProps<typeof paginationOfficial.PaginationLink>>().toExtend<
    React.ComponentProps<typeof paginationLocal.PaginationLink>
  >();
  expectTypeOf<React.ComponentProps<typeof paginationOfficial.PaginationNext>>().toExtend<
    React.ComponentProps<typeof paginationLocal.PaginationNext>
  >();
  expectTypeOf<React.ComponentProps<typeof paginationOfficial.PaginationPrevious>>().toExtend<
    React.ComponentProps<typeof paginationLocal.PaginationPrevious>
  >();
});

test('popover accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof popoverOfficial.Popover>>().toExtend<
    React.ComponentProps<typeof popoverLocal.Popover>
  >();
  expectTypeOf<React.ComponentProps<typeof popoverOfficial.PopoverContent>>().toExtend<
    React.ComponentProps<typeof popoverLocal.PopoverContent>
  >();
  expectTypeOf<React.ComponentProps<typeof popoverOfficial.PopoverDescription>>().toExtend<
    React.ComponentProps<typeof popoverLocal.PopoverDescription>
  >();
  expectTypeOf<React.ComponentProps<typeof popoverOfficial.PopoverHeader>>().toExtend<
    React.ComponentProps<typeof popoverLocal.PopoverHeader>
  >();
  expectTypeOf<React.ComponentProps<typeof popoverOfficial.PopoverTitle>>().toExtend<
    React.ComponentProps<typeof popoverLocal.PopoverTitle>
  >();
  expectTypeOf<React.ComponentProps<typeof popoverOfficial.PopoverTrigger>>().toExtend<
    React.ComponentProps<typeof popoverLocal.PopoverTrigger>
  >();
});

test('progress accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof progressOfficial.Progress>>().toExtend<
    React.ComponentProps<typeof progressLocal.Progress>
  >();
  expectTypeOf<React.ComponentProps<typeof progressOfficial.ProgressTrack>>().toExtend<
    React.ComponentProps<typeof progressLocal.ProgressTrack>
  >();
  expectTypeOf<React.ComponentProps<typeof progressOfficial.ProgressIndicator>>().toExtend<
    React.ComponentProps<typeof progressLocal.ProgressIndicator>
  >();
  expectTypeOf<React.ComponentProps<typeof progressOfficial.ProgressLabel>>().toExtend<
    React.ComponentProps<typeof progressLocal.ProgressLabel>
  >();
  expectTypeOf<React.ComponentProps<typeof progressOfficial.ProgressValue>>().toExtend<
    React.ComponentProps<typeof progressLocal.ProgressValue>
  >();
});

test('questionnaire accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof questionnaireOfficial.Questionnaire>>().toExtend<
    React.ComponentProps<typeof questionnaireLocal.Questionnaire>
  >();
  expectTypeOf<React.ComponentProps<typeof questionnaireOfficial.QuestionnaireActions>>().toExtend<
    React.ComponentProps<typeof questionnaireLocal.QuestionnaireActions>
  >();
  expectTypeOf<React.ComponentProps<typeof questionnaireOfficial.QuestionnaireChoice>>().toExtend<
    React.ComponentProps<typeof questionnaireLocal.QuestionnaireChoice>
  >();
  expectTypeOf<React.ComponentProps<typeof questionnaireOfficial.QuestionnaireChoiceDescription>>().toExtend<
    React.ComponentProps<typeof questionnaireLocal.QuestionnaireChoiceDescription>
  >();
  expectTypeOf<React.ComponentProps<typeof questionnaireOfficial.QuestionnaireChoices>>().toExtend<
    React.ComponentProps<typeof questionnaireLocal.QuestionnaireChoices>
  >();
  expectTypeOf<React.ComponentProps<typeof questionnaireOfficial.QuestionnaireDescription>>().toExtend<
    React.ComponentProps<typeof questionnaireLocal.QuestionnaireDescription>
  >();
  expectTypeOf<React.ComponentProps<typeof questionnaireOfficial.QuestionnaireError>>().toExtend<
    React.ComponentProps<typeof questionnaireLocal.QuestionnaireError>
  >();
  expectTypeOf<React.ComponentProps<typeof questionnaireOfficial.QuestionnaireInput>>().toExtend<
    React.ComponentProps<typeof questionnaireLocal.QuestionnaireInput>
  >();
  expectTypeOf<React.ComponentProps<typeof questionnaireOfficial.QuestionnaireItem>>().toExtend<
    React.ComponentProps<typeof questionnaireLocal.QuestionnaireItem>
  >();
  expectTypeOf<React.ComponentProps<typeof questionnaireOfficial.QuestionnaireNext>>().toExtend<
    React.ComponentProps<typeof questionnaireLocal.QuestionnaireNext>
  >();
  expectTypeOf<React.ComponentProps<typeof questionnaireOfficial.QuestionnairePrevious>>().toExtend<
    React.ComponentProps<typeof questionnaireLocal.QuestionnairePrevious>
  >();
  expectTypeOf<React.ComponentProps<typeof questionnaireOfficial.QuestionnaireProgress>>().toExtend<
    React.ComponentProps<typeof questionnaireLocal.QuestionnaireProgress>
  >();
  expectTypeOf<React.ComponentProps<typeof questionnaireOfficial.QuestionnaireSkip>>().toExtend<
    React.ComponentProps<typeof questionnaireLocal.QuestionnaireSkip>
  >();
  expectTypeOf<React.ComponentProps<typeof questionnaireOfficial.QuestionnaireSubmit>>().toExtend<
    React.ComponentProps<typeof questionnaireLocal.QuestionnaireSubmit>
  >();
  expectTypeOf<React.ComponentProps<typeof questionnaireOfficial.QuestionnaireTitle>>().toExtend<
    React.ComponentProps<typeof questionnaireLocal.QuestionnaireTitle>
  >();
});

test('radio-group accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof radioGroupOfficial.RadioGroup>>().toExtend<
    React.ComponentProps<typeof radioGroupLocal.RadioGroup>
  >();
  expectTypeOf<React.ComponentProps<typeof radioGroupOfficial.RadioGroupItem>>().toExtend<
    React.ComponentProps<typeof radioGroupLocal.RadioGroupItem>
  >();
});

test('resizable accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof resizableOfficial.ResizableHandle>>().toExtend<
    React.ComponentProps<typeof resizableLocal.ResizableHandle>
  >();
  expectTypeOf<React.ComponentProps<typeof resizableOfficial.ResizablePanel>>().toExtend<
    React.ComponentProps<typeof resizableLocal.ResizablePanel>
  >();
  expectTypeOf<React.ComponentProps<typeof resizableOfficial.ResizablePanelGroup>>().toExtend<
    React.ComponentProps<typeof resizableLocal.ResizablePanelGroup>
  >();
});

test('scroll-area accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof scrollAreaOfficial.ScrollArea>>().toExtend<
    React.ComponentProps<typeof scrollAreaLocal.ScrollArea>
  >();
  expectTypeOf<React.ComponentProps<typeof scrollAreaOfficial.ScrollBar>>().toExtend<
    React.ComponentProps<typeof scrollAreaLocal.ScrollBar>
  >();
});

test('select accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof selectOfficial.Select>>().toExtend<
    React.ComponentProps<typeof selectLocal.Select>
  >();
  expectTypeOf<React.ComponentProps<typeof selectOfficial.SelectContent>>().toExtend<
    React.ComponentProps<typeof selectLocal.SelectContent>
  >();
  expectTypeOf<React.ComponentProps<typeof selectOfficial.SelectGroup>>().toExtend<
    React.ComponentProps<typeof selectLocal.SelectGroup>
  >();
  expectTypeOf<React.ComponentProps<typeof selectOfficial.SelectItem>>().toExtend<
    React.ComponentProps<typeof selectLocal.SelectItem>
  >();
  expectTypeOf<React.ComponentProps<typeof selectOfficial.SelectLabel>>().toExtend<
    React.ComponentProps<typeof selectLocal.SelectLabel>
  >();
  expectTypeOf<React.ComponentProps<typeof selectOfficial.SelectScrollDownButton>>().toExtend<
    React.ComponentProps<typeof selectLocal.SelectScrollDownButton>
  >();
  expectTypeOf<React.ComponentProps<typeof selectOfficial.SelectScrollUpButton>>().toExtend<
    React.ComponentProps<typeof selectLocal.SelectScrollUpButton>
  >();
  expectTypeOf<React.ComponentProps<typeof selectOfficial.SelectSeparator>>().toExtend<
    React.ComponentProps<typeof selectLocal.SelectSeparator>
  >();
  expectTypeOf<React.ComponentProps<typeof selectOfficial.SelectTrigger>>().toExtend<
    React.ComponentProps<typeof selectLocal.SelectTrigger>
  >();
  expectTypeOf<React.ComponentProps<typeof selectOfficial.SelectValue>>().toExtend<
    React.ComponentProps<typeof selectLocal.SelectValue>
  >();
});

test('separator accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof separatorOfficial.Separator>>().toExtend<
    React.ComponentProps<typeof separatorLocal.Separator>
  >();
});

test('sheet accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof sheetOfficial.Sheet>>().toExtend<
    React.ComponentProps<typeof sheetLocal.Sheet>
  >();
  expectTypeOf<React.ComponentProps<typeof sheetOfficial.SheetTrigger>>().toExtend<
    React.ComponentProps<typeof sheetLocal.SheetTrigger>
  >();
  expectTypeOf<React.ComponentProps<typeof sheetOfficial.SheetClose>>().toExtend<
    React.ComponentProps<typeof sheetLocal.SheetClose>
  >();
  expectTypeOf<React.ComponentProps<typeof sheetOfficial.SheetContent>>().toExtend<
    React.ComponentProps<typeof sheetLocal.SheetContent>
  >();
  expectTypeOf<React.ComponentProps<typeof sheetOfficial.SheetHeader>>().toExtend<
    React.ComponentProps<typeof sheetLocal.SheetHeader>
  >();
  expectTypeOf<React.ComponentProps<typeof sheetOfficial.SheetFooter>>().toExtend<
    React.ComponentProps<typeof sheetLocal.SheetFooter>
  >();
  expectTypeOf<React.ComponentProps<typeof sheetOfficial.SheetTitle>>().toExtend<
    React.ComponentProps<typeof sheetLocal.SheetTitle>
  >();
  expectTypeOf<React.ComponentProps<typeof sheetOfficial.SheetDescription>>().toExtend<
    React.ComponentProps<typeof sheetLocal.SheetDescription>
  >();
});

test('sidebar accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof sidebarOfficial.Sidebar>>().toExtend<
    React.ComponentProps<typeof sidebarLocal.Sidebar>
  >();
  expectTypeOf<React.ComponentProps<typeof sidebarOfficial.SidebarContent>>().toExtend<
    React.ComponentProps<typeof sidebarLocal.SidebarContent>
  >();
  expectTypeOf<React.ComponentProps<typeof sidebarOfficial.SidebarFooter>>().toExtend<
    React.ComponentProps<typeof sidebarLocal.SidebarFooter>
  >();
  expectTypeOf<React.ComponentProps<typeof sidebarOfficial.SidebarGroup>>().toExtend<
    React.ComponentProps<typeof sidebarLocal.SidebarGroup>
  >();
  expectTypeOf<React.ComponentProps<typeof sidebarOfficial.SidebarGroupAction>>().toExtend<
    React.ComponentProps<typeof sidebarLocal.SidebarGroupAction>
  >();
  expectTypeOf<React.ComponentProps<typeof sidebarOfficial.SidebarGroupContent>>().toExtend<
    React.ComponentProps<typeof sidebarLocal.SidebarGroupContent>
  >();
  expectTypeOf<React.ComponentProps<typeof sidebarOfficial.SidebarGroupLabel>>().toExtend<
    React.ComponentProps<typeof sidebarLocal.SidebarGroupLabel>
  >();
  expectTypeOf<React.ComponentProps<typeof sidebarOfficial.SidebarHeader>>().toExtend<
    React.ComponentProps<typeof sidebarLocal.SidebarHeader>
  >();
  expectTypeOf<React.ComponentProps<typeof sidebarOfficial.SidebarInput>>().toExtend<
    React.ComponentProps<typeof sidebarLocal.SidebarInput>
  >();
  expectTypeOf<React.ComponentProps<typeof sidebarOfficial.SidebarInset>>().toExtend<
    React.ComponentProps<typeof sidebarLocal.SidebarInset>
  >();
  expectTypeOf<React.ComponentProps<typeof sidebarOfficial.SidebarMenu>>().toExtend<
    React.ComponentProps<typeof sidebarLocal.SidebarMenu>
  >();
  expectTypeOf<React.ComponentProps<typeof sidebarOfficial.SidebarMenuAction>>().toExtend<
    React.ComponentProps<typeof sidebarLocal.SidebarMenuAction>
  >();
  expectTypeOf<React.ComponentProps<typeof sidebarOfficial.SidebarMenuBadge>>().toExtend<
    React.ComponentProps<typeof sidebarLocal.SidebarMenuBadge>
  >();
  expectTypeOf<React.ComponentProps<typeof sidebarOfficial.SidebarMenuButton>>().toExtend<
    React.ComponentProps<typeof sidebarLocal.SidebarMenuButton>
  >();
  expectTypeOf<React.ComponentProps<typeof sidebarOfficial.SidebarMenuItem>>().toExtend<
    React.ComponentProps<typeof sidebarLocal.SidebarMenuItem>
  >();
  expectTypeOf<React.ComponentProps<typeof sidebarOfficial.SidebarMenuSkeleton>>().toExtend<
    React.ComponentProps<typeof sidebarLocal.SidebarMenuSkeleton>
  >();
  expectTypeOf<React.ComponentProps<typeof sidebarOfficial.SidebarMenuSub>>().toExtend<
    React.ComponentProps<typeof sidebarLocal.SidebarMenuSub>
  >();
  expectTypeOf<React.ComponentProps<typeof sidebarOfficial.SidebarMenuSubButton>>().toExtend<
    React.ComponentProps<typeof sidebarLocal.SidebarMenuSubButton>
  >();
  expectTypeOf<React.ComponentProps<typeof sidebarOfficial.SidebarMenuSubItem>>().toExtend<
    React.ComponentProps<typeof sidebarLocal.SidebarMenuSubItem>
  >();
  expectTypeOf<React.ComponentProps<typeof sidebarOfficial.SidebarProvider>>().toExtend<
    React.ComponentProps<typeof sidebarLocal.SidebarProvider>
  >();
  expectTypeOf<React.ComponentProps<typeof sidebarOfficial.SidebarRail>>().toExtend<
    React.ComponentProps<typeof sidebarLocal.SidebarRail>
  >();
  expectTypeOf<React.ComponentProps<typeof sidebarOfficial.SidebarSeparator>>().toExtend<
    React.ComponentProps<typeof sidebarLocal.SidebarSeparator>
  >();
  expectTypeOf<React.ComponentProps<typeof sidebarOfficial.SidebarTrigger>>().toExtend<
    React.ComponentProps<typeof sidebarLocal.SidebarTrigger>
  >();
  expectTypeOf<typeof sidebarLocal.useSidebar>().toExtend<typeof sidebarOfficial.useSidebar>();
});

test('skeleton accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof skeletonOfficial.Skeleton>>().toExtend<
    React.ComponentProps<typeof skeletonLocal.Skeleton>
  >();
});

test('slider accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof sliderOfficial.Slider>>().toExtend<
    React.ComponentProps<typeof sliderLocal.Slider>
  >();
});

test('spinner accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof spinnerOfficial.Spinner>>().toExtend<
    React.ComponentProps<typeof spinnerLocal.Spinner>
  >();
});

test('switch accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof switchOfficial.Switch>>().toExtend<
    React.ComponentProps<typeof switchLocal.Switch>
  >();
});

test('table accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof tableOfficial.Table>>().toExtend<
    React.ComponentProps<typeof tableLocal.Table>
  >();
  expectTypeOf<React.ComponentProps<typeof tableOfficial.TableHeader>>().toExtend<
    React.ComponentProps<typeof tableLocal.TableHeader>
  >();
  expectTypeOf<React.ComponentProps<typeof tableOfficial.TableBody>>().toExtend<
    React.ComponentProps<typeof tableLocal.TableBody>
  >();
  expectTypeOf<React.ComponentProps<typeof tableOfficial.TableFooter>>().toExtend<
    React.ComponentProps<typeof tableLocal.TableFooter>
  >();
  expectTypeOf<React.ComponentProps<typeof tableOfficial.TableHead>>().toExtend<
    React.ComponentProps<typeof tableLocal.TableHead>
  >();
  expectTypeOf<React.ComponentProps<typeof tableOfficial.TableRow>>().toExtend<
    React.ComponentProps<typeof tableLocal.TableRow>
  >();
  expectTypeOf<React.ComponentProps<typeof tableOfficial.TableCell>>().toExtend<
    React.ComponentProps<typeof tableLocal.TableCell>
  >();
  expectTypeOf<React.ComponentProps<typeof tableOfficial.TableCaption>>().toExtend<
    React.ComponentProps<typeof tableLocal.TableCaption>
  >();
});

test('tabs accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof tabsOfficial.Tabs>>().toExtend<
    React.ComponentProps<typeof tabsLocal.Tabs>
  >();
  expectTypeOf<React.ComponentProps<typeof tabsOfficial.TabsList>>().toExtend<
    React.ComponentProps<typeof tabsLocal.TabsList>
  >();
  expectTypeOf<React.ComponentProps<typeof tabsOfficial.TabsTrigger>>().toExtend<
    React.ComponentProps<typeof tabsLocal.TabsTrigger>
  >();
  expectTypeOf<React.ComponentProps<typeof tabsOfficial.TabsContent>>().toExtend<
    React.ComponentProps<typeof tabsLocal.TabsContent>
  >();
  expectTypeOf<typeof tabsLocal.tabsListVariants>().toExtend<typeof tabsOfficial.tabsListVariants>();
});

test('textarea accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof textareaOfficial.Textarea>>().toExtend<
    React.ComponentProps<typeof textareaLocal.Textarea>
  >();
});

test('toast accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof toastOfficial.Toaster>>().toExtend<
    React.ComponentProps<typeof toastLocal.Toaster>
  >();
  expectTypeOf<React.ComponentProps<typeof toastOfficial.Toast>>().toExtend<
    React.ComponentProps<typeof toastLocal.Toast>
  >();
  expectTypeOf<React.ComponentProps<typeof toastOfficial.ToastAction>>().toExtend<
    React.ComponentProps<typeof toastLocal.ToastAction>
  >();
  expectTypeOf<React.ComponentProps<typeof toastOfficial.ToastClose>>().toExtend<
    React.ComponentProps<typeof toastLocal.ToastClose>
  >();
  expectTypeOf<React.ComponentProps<typeof toastOfficial.ToastContent>>().toExtend<
    React.ComponentProps<typeof toastLocal.ToastContent>
  >();
  expectTypeOf<React.ComponentProps<typeof toastOfficial.ToastDescription>>().toExtend<
    React.ComponentProps<typeof toastLocal.ToastDescription>
  >();
  expectTypeOf<React.ComponentProps<typeof toastOfficial.ToastPortal>>().toExtend<
    React.ComponentProps<typeof toastLocal.ToastPortal>
  >();
  expectTypeOf<React.ComponentProps<typeof toastOfficial.ToastProvider>>().toExtend<
    React.ComponentProps<typeof toastLocal.ToastProvider>
  >();
  expectTypeOf<React.ComponentProps<typeof toastOfficial.ToastTitle>>().toExtend<
    React.ComponentProps<typeof toastLocal.ToastTitle>
  >();
  expectTypeOf<React.ComponentProps<typeof toastOfficial.ToastViewport>>().toExtend<
    React.ComponentProps<typeof toastLocal.ToastViewport>
  >();
  expectTypeOf<typeof toastLocal.createToastManager>().toExtend<typeof toastOfficial.createToastManager>();
  expectTypeOf<typeof toastLocal.toast>().toExtend<typeof toastOfficial.toast>();
  expectTypeOf<typeof toastLocal.useToastManager>().toExtend<typeof toastOfficial.useToastManager>();
});

test('toggle accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof toggleOfficial.Toggle>>().toExtend<
    React.ComponentProps<typeof toggleLocal.Toggle>
  >();
  expectTypeOf<typeof toggleLocal.toggleVariants>().toExtend<typeof toggleOfficial.toggleVariants>();
});

test('toggle-group accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof toggleGroupOfficial.ToggleGroup>>().toExtend<
    React.ComponentProps<typeof toggleGroupLocal.ToggleGroup>
  >();
  expectTypeOf<React.ComponentProps<typeof toggleGroupOfficial.ToggleGroupItem>>().toExtend<
    React.ComponentProps<typeof toggleGroupLocal.ToggleGroupItem>
  >();
});

test('tooltip accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof tooltipOfficial.Tooltip>>().toExtend<
    React.ComponentProps<typeof tooltipLocal.Tooltip>
  >();
  expectTypeOf<React.ComponentProps<typeof tooltipOfficial.TooltipTrigger>>().toExtend<
    React.ComponentProps<typeof tooltipLocal.TooltipTrigger>
  >();
  expectTypeOf<React.ComponentProps<typeof tooltipOfficial.TooltipContent>>().toExtend<
    React.ComponentProps<typeof tooltipLocal.TooltipContent>
  >();
  expectTypeOf<React.ComponentProps<typeof tooltipOfficial.TooltipProvider>>().toExtend<
    React.ComponentProps<typeof tooltipLocal.TooltipProvider>
  >();
});

test('trace accepts the pinned shadcn public props', () => {
  expectTypeOf<React.ComponentProps<typeof traceOfficial.Trace>>().toExtend<
    React.ComponentProps<typeof traceLocal.Trace>
  >();
  expectTypeOf<React.ComponentProps<typeof traceOfficial.TraceLine>>().toExtend<
    React.ComponentProps<typeof traceLocal.TraceLine>
  >();
  expectTypeOf<React.ComponentProps<typeof traceOfficial.TraceIcon>>().toExtend<
    React.ComponentProps<typeof traceLocal.TraceIcon>
  >();
  expectTypeOf<React.ComponentProps<typeof traceOfficial.TraceTitle>>().toExtend<
    React.ComponentProps<typeof traceLocal.TraceTitle>
  >();
  expectTypeOf<React.ComponentProps<typeof traceOfficial.TraceDescription>>().toExtend<
    React.ComponentProps<typeof traceLocal.TraceDescription>
  >();
  expectTypeOf<React.ComponentProps<typeof traceOfficial.TraceCollapsible>>().toExtend<
    React.ComponentProps<typeof traceLocal.TraceCollapsible>
  >();
  expectTypeOf<React.ComponentProps<typeof traceOfficial.TraceCollapsibleTrigger>>().toExtend<
    React.ComponentProps<typeof traceLocal.TraceCollapsibleTrigger>
  >();
  expectTypeOf<React.ComponentProps<typeof traceOfficial.TraceCollapsibleContent>>().toExtend<
    React.ComponentProps<typeof traceLocal.TraceCollapsibleContent>
  >();
});
