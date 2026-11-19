import { expectTypeOf } from 'expect-type';
import type React from 'react';
import type * as kbdLocal from '../base-nova/protoform/components/kbd';
import type * as labelLocal from '../base-nova/protoform/components/label';
import type * as markerLocal from '../base-nova/protoform/components/marker';
import type * as menubarLocal from '../base-nova/protoform/components/menubar';
import type * as messageLocal from '../base-nova/protoform/components/message';
import type * as messageScrollerLocal from '../base-nova/protoform/components/message-scroller';
import type * as nativeSelectLocal from '../base-nova/protoform/components/native-select';
import type * as navigationMenuLocal from '../base-nova/protoform/components/navigation-menu';
import type * as paginationLocal from '../base-nova/protoform/components/pagination';
import type * as popoverLocal from '../base-nova/protoform/components/popover';
import type * as progressLocal from '../base-nova/protoform/components/progress';
import type * as questionnaireLocal from '../base-nova/protoform/components/questionnaire';
import type * as radioGroupLocal from '../base-nova/protoform/components/radio-group';
import type * as resizableLocal from '../base-nova/protoform/components/resizable';
import type * as scrollAreaLocal from '../base-nova/protoform/components/scroll-area';
import type * as selectLocal from '../base-nova/protoform/components/select';
import type * as kbdOfficial from './kbd';
import type * as labelOfficial from './label';
import type * as markerOfficial from './marker';
import type * as menubarOfficial from './menubar';
import type * as messageOfficial from './message';
import type * as messageScrollerOfficial from './message-scroller';
import type * as nativeSelectOfficial from './native-select';
import type * as navigationMenuOfficial from './navigation-menu';
import type * as paginationOfficial from './pagination';
import type * as popoverOfficial from './popover';
import type * as progressOfficial from './progress';
import type * as questionnaireOfficial from './questionnaire';
import type * as radioGroupOfficial from './radio-group';
import type * as resizableOfficial from './resizable';
import type * as scrollAreaOfficial from './scroll-area';
import type * as selectOfficial from './select';

expectTypeOf<React.ComponentProps<typeof kbdOfficial.Kbd>>().toExtend<React.ComponentProps<typeof kbdLocal.Kbd>>();
expectTypeOf<React.ComponentProps<typeof kbdOfficial.KbdGroup>>().toExtend<
  React.ComponentProps<typeof kbdLocal.KbdGroup>
>();

expectTypeOf<React.ComponentProps<typeof labelOfficial.Label>>().toExtend<
  React.ComponentProps<typeof labelLocal.Label>
>();

expectTypeOf<React.ComponentProps<typeof markerOfficial.Marker>>().toExtend<
  React.ComponentProps<typeof markerLocal.Marker>
>();
expectTypeOf<React.ComponentProps<typeof markerOfficial.MarkerContent>>().toExtend<
  React.ComponentProps<typeof markerLocal.MarkerContent>
>();
expectTypeOf<React.ComponentProps<typeof markerOfficial.MarkerIcon>>().toExtend<
  React.ComponentProps<typeof markerLocal.MarkerIcon>
>();
expectTypeOf<typeof markerLocal.markerVariants>().toExtend<typeof markerOfficial.markerVariants>();

expectTypeOf<React.ComponentProps<typeof menubarOfficial.Menubar>>().toExtend<
  React.ComponentProps<typeof menubarLocal.Menubar>
>();
expectTypeOf<React.ComponentProps<typeof menubarOfficial.MenubarCheckboxItem>>().toExtend<
  React.ComponentProps<typeof menubarLocal.MenubarCheckboxItem>
>();
expectTypeOf<React.ComponentProps<typeof menubarOfficial.MenubarContent>>().toExtend<
  React.ComponentProps<typeof menubarLocal.MenubarContent>
>();
expectTypeOf<React.ComponentProps<typeof menubarOfficial.MenubarGroup>>().toExtend<
  React.ComponentProps<typeof menubarLocal.MenubarGroup>
>();
expectTypeOf<React.ComponentProps<typeof menubarOfficial.MenubarItem>>().toExtend<
  React.ComponentProps<typeof menubarLocal.MenubarItem>
>();
expectTypeOf<React.ComponentProps<typeof menubarOfficial.MenubarLabel>>().toExtend<
  React.ComponentProps<typeof menubarLocal.MenubarLabel>
>();
expectTypeOf<React.ComponentProps<typeof menubarOfficial.MenubarMenu>>().toExtend<
  React.ComponentProps<typeof menubarLocal.MenubarMenu>
>();
expectTypeOf<React.ComponentProps<typeof menubarOfficial.MenubarPortal>>().toExtend<
  React.ComponentProps<typeof menubarLocal.MenubarPortal>
>();
expectTypeOf<React.ComponentProps<typeof menubarOfficial.MenubarRadioGroup>>().toExtend<
  React.ComponentProps<typeof menubarLocal.MenubarRadioGroup>
>();
expectTypeOf<React.ComponentProps<typeof menubarOfficial.MenubarRadioItem>>().toExtend<
  React.ComponentProps<typeof menubarLocal.MenubarRadioItem>
>();
expectTypeOf<React.ComponentProps<typeof menubarOfficial.MenubarSeparator>>().toExtend<
  React.ComponentProps<typeof menubarLocal.MenubarSeparator>
>();
expectTypeOf<React.ComponentProps<typeof menubarOfficial.MenubarShortcut>>().toExtend<
  React.ComponentProps<typeof menubarLocal.MenubarShortcut>
>();
expectTypeOf<React.ComponentProps<typeof menubarOfficial.MenubarSub>>().toExtend<
  React.ComponentProps<typeof menubarLocal.MenubarSub>
>();
expectTypeOf<React.ComponentProps<typeof menubarOfficial.MenubarSubContent>>().toExtend<
  React.ComponentProps<typeof menubarLocal.MenubarSubContent>
>();
expectTypeOf<React.ComponentProps<typeof menubarOfficial.MenubarSubTrigger>>().toExtend<
  React.ComponentProps<typeof menubarLocal.MenubarSubTrigger>
>();
expectTypeOf<React.ComponentProps<typeof menubarOfficial.MenubarTrigger>>().toExtend<
  React.ComponentProps<typeof menubarLocal.MenubarTrigger>
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
expectTypeOf<React.ComponentProps<typeof messageOfficial.MessageGroup>>().toExtend<
  React.ComponentProps<typeof messageLocal.MessageGroup>
>();
expectTypeOf<React.ComponentProps<typeof messageOfficial.MessageHeader>>().toExtend<
  React.ComponentProps<typeof messageLocal.MessageHeader>
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
expectTypeOf<React.ComponentProps<typeof messageScrollerOfficial.MessageScroller>>().toExtend<
  React.ComponentProps<typeof messageScrollerLocal.MessageScroller>
>();
expectTypeOf<React.ComponentProps<typeof messageScrollerOfficial.MessageScrollerButton>>().toExtend<
  React.ComponentProps<typeof messageScrollerLocal.MessageScrollerButton>
>();
expectTypeOf<React.ComponentProps<typeof messageScrollerOfficial.MessageScrollerContent>>().toExtend<
  React.ComponentProps<typeof messageScrollerLocal.MessageScrollerContent>
>();
expectTypeOf<React.ComponentProps<typeof messageScrollerOfficial.MessageScrollerItem>>().toExtend<
  React.ComponentProps<typeof messageScrollerLocal.MessageScrollerItem>
>();
expectTypeOf<React.ComponentProps<typeof messageScrollerOfficial.MessageScrollerProvider>>().toExtend<
  React.ComponentProps<typeof messageScrollerLocal.MessageScrollerProvider>
>();
expectTypeOf<React.ComponentProps<typeof messageScrollerOfficial.MessageScrollerViewport>>().toExtend<
  React.ComponentProps<typeof messageScrollerLocal.MessageScrollerViewport>
>();

expectTypeOf<React.ComponentProps<typeof nativeSelectOfficial.NativeSelect>>().toExtend<
  React.ComponentProps<typeof nativeSelectLocal.NativeSelect>
>();
expectTypeOf<React.ComponentProps<typeof nativeSelectOfficial.NativeSelectOptGroup>>().toExtend<
  React.ComponentProps<typeof nativeSelectLocal.NativeSelectOptGroup>
>();
expectTypeOf<React.ComponentProps<typeof nativeSelectOfficial.NativeSelectOption>>().toExtend<
  React.ComponentProps<typeof nativeSelectLocal.NativeSelectOption>
>();

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
expectTypeOf<React.ComponentProps<typeof navigationMenuOfficial.NavigationMenuPositioner>>().toExtend<
  React.ComponentProps<typeof navigationMenuLocal.NavigationMenuPositioner>
>();
expectTypeOf<React.ComponentProps<typeof navigationMenuOfficial.NavigationMenuTrigger>>().toExtend<
  React.ComponentProps<typeof navigationMenuLocal.NavigationMenuTrigger>
>();
expectTypeOf<typeof navigationMenuLocal.navigationMenuTriggerStyle>().toExtend<
  typeof navigationMenuOfficial.navigationMenuTriggerStyle
>();

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

expectTypeOf<React.ComponentProps<typeof progressOfficial.Progress>>().toExtend<
  React.ComponentProps<typeof progressLocal.Progress>
>();
expectTypeOf<React.ComponentProps<typeof progressOfficial.ProgressIndicator>>().toExtend<
  React.ComponentProps<typeof progressLocal.ProgressIndicator>
>();
expectTypeOf<React.ComponentProps<typeof progressOfficial.ProgressLabel>>().toExtend<
  React.ComponentProps<typeof progressLocal.ProgressLabel>
>();
expectTypeOf<React.ComponentProps<typeof progressOfficial.ProgressTrack>>().toExtend<
  React.ComponentProps<typeof progressLocal.ProgressTrack>
>();
expectTypeOf<React.ComponentProps<typeof progressOfficial.ProgressValue>>().toExtend<
  React.ComponentProps<typeof progressLocal.ProgressValue>
>();

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

expectTypeOf<React.ComponentProps<typeof radioGroupOfficial.RadioGroup>>().toExtend<
  React.ComponentProps<typeof radioGroupLocal.RadioGroup>
>();
expectTypeOf<React.ComponentProps<typeof radioGroupOfficial.RadioGroupItem>>().toExtend<
  React.ComponentProps<typeof radioGroupLocal.RadioGroupItem>
>();

expectTypeOf<React.ComponentProps<typeof resizableOfficial.ResizableHandle>>().toExtend<
  React.ComponentProps<typeof resizableLocal.ResizableHandle>
>();
expectTypeOf<React.ComponentProps<typeof resizableOfficial.ResizablePanel>>().toExtend<
  React.ComponentProps<typeof resizableLocal.ResizablePanel>
>();
expectTypeOf<React.ComponentProps<typeof resizableOfficial.ResizablePanelGroup>>().toExtend<
  React.ComponentProps<typeof resizableLocal.ResizablePanelGroup>
>();

expectTypeOf<React.ComponentProps<typeof scrollAreaOfficial.ScrollArea>>().toExtend<
  React.ComponentProps<typeof scrollAreaLocal.ScrollArea>
>();
expectTypeOf<React.ComponentProps<typeof scrollAreaOfficial.ScrollBar>>().toExtend<
  React.ComponentProps<typeof scrollAreaLocal.ScrollBar>
>();

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
