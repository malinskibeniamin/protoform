import { expectTypeOf } from 'expect-type';
import type React from 'react';
import type * as accordionLocal from '../base-nova/protoform/components/accordion';
import type * as alertLocal from '../base-nova/protoform/components/alert';
import type * as alertDialogLocal from '../base-nova/protoform/components/alert-dialog';
import type * as aspectRatioLocal from '../base-nova/protoform/components/aspect-ratio';
import type * as attachmentLocal from '../base-nova/protoform/components/attachment';
import type * as avatarLocal from '../base-nova/protoform/components/avatar';
import type * as badgeLocal from '../base-nova/protoform/components/badge';
import type * as breadcrumbLocal from '../base-nova/protoform/components/breadcrumb';
import type * as bubbleLocal from '../base-nova/protoform/components/bubble';
import type * as buttonLocal from '../base-nova/protoform/components/button';
import type * as buttonGroupLocal from '../base-nova/protoform/components/button-group';
import type * as calendarLocal from '../base-nova/protoform/components/calendar';
import type * as cardLocal from '../base-nova/protoform/components/card';
import type * as carouselLocal from '../base-nova/protoform/components/carousel';
import type * as chartLocal from '../base-nova/protoform/components/chart';
import type * as checkboxLocal from '../base-nova/protoform/components/checkbox';
import type * as accordionOfficial from './accordion';
import type * as alertOfficial from './alert';
import type * as alertDialogOfficial from './alert-dialog';
import type * as aspectRatioOfficial from './aspect-ratio';
import type * as attachmentOfficial from './attachment';
import type * as avatarOfficial from './avatar';
import type * as badgeOfficial from './badge';
import type * as breadcrumbOfficial from './breadcrumb';
import type * as bubbleOfficial from './bubble';
import type * as buttonOfficial from './button';
import type * as buttonGroupOfficial from './button-group';
import type * as calendarOfficial from './calendar';
import type * as cardOfficial from './card';
import type * as carouselOfficial from './carousel';
import type * as chartOfficial from './chart';
import type * as checkboxOfficial from './checkbox';

expectTypeOf<React.ComponentProps<typeof accordionOfficial.Accordion>>().toExtend<
  React.ComponentProps<typeof accordionLocal.Accordion>
>();
expectTypeOf<React.ComponentProps<typeof accordionOfficial.AccordionContent>>().toExtend<
  React.ComponentProps<typeof accordionLocal.AccordionContent>
>();
expectTypeOf<React.ComponentProps<typeof accordionOfficial.AccordionItem>>().toExtend<
  React.ComponentProps<typeof accordionLocal.AccordionItem>
>();
expectTypeOf<React.ComponentProps<typeof accordionOfficial.AccordionTrigger>>().toExtend<
  React.ComponentProps<typeof accordionLocal.AccordionTrigger>
>();

expectTypeOf<React.ComponentProps<typeof alertOfficial.Alert>>().toExtend<
  React.ComponentProps<typeof alertLocal.Alert>
>();
expectTypeOf<React.ComponentProps<typeof alertOfficial.AlertAction>>().toExtend<
  React.ComponentProps<typeof alertLocal.AlertAction>
>();
expectTypeOf<React.ComponentProps<typeof alertOfficial.AlertDescription>>().toExtend<
  React.ComponentProps<typeof alertLocal.AlertDescription>
>();
expectTypeOf<React.ComponentProps<typeof alertOfficial.AlertTitle>>().toExtend<
  React.ComponentProps<typeof alertLocal.AlertTitle>
>();

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

expectTypeOf<React.ComponentProps<typeof aspectRatioOfficial.AspectRatio>>().toExtend<
  React.ComponentProps<typeof aspectRatioLocal.AspectRatio>
>();

expectTypeOf<React.ComponentProps<typeof attachmentOfficial.Attachment>>().toExtend<
  React.ComponentProps<typeof attachmentLocal.Attachment>
>();
expectTypeOf<React.ComponentProps<typeof attachmentOfficial.AttachmentAction>>().toExtend<
  React.ComponentProps<typeof attachmentLocal.AttachmentAction>
>();
expectTypeOf<React.ComponentProps<typeof attachmentOfficial.AttachmentActions>>().toExtend<
  React.ComponentProps<typeof attachmentLocal.AttachmentActions>
>();
expectTypeOf<React.ComponentProps<typeof attachmentOfficial.AttachmentContent>>().toExtend<
  React.ComponentProps<typeof attachmentLocal.AttachmentContent>
>();
expectTypeOf<React.ComponentProps<typeof attachmentOfficial.AttachmentDescription>>().toExtend<
  React.ComponentProps<typeof attachmentLocal.AttachmentDescription>
>();
expectTypeOf<React.ComponentProps<typeof attachmentOfficial.AttachmentGroup>>().toExtend<
  React.ComponentProps<typeof attachmentLocal.AttachmentGroup>
>();
expectTypeOf<React.ComponentProps<typeof attachmentOfficial.AttachmentMedia>>().toExtend<
  React.ComponentProps<typeof attachmentLocal.AttachmentMedia>
>();
expectTypeOf<React.ComponentProps<typeof attachmentOfficial.AttachmentTitle>>().toExtend<
  React.ComponentProps<typeof attachmentLocal.AttachmentTitle>
>();
expectTypeOf<React.ComponentProps<typeof attachmentOfficial.AttachmentTrigger>>().toExtend<
  React.ComponentProps<typeof attachmentLocal.AttachmentTrigger>
>();

expectTypeOf<React.ComponentProps<typeof avatarOfficial.Avatar>>().toExtend<
  React.ComponentProps<typeof avatarLocal.Avatar>
>();
expectTypeOf<React.ComponentProps<typeof avatarOfficial.AvatarBadge>>().toExtend<
  React.ComponentProps<typeof avatarLocal.AvatarBadge>
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
expectTypeOf<React.ComponentProps<typeof avatarOfficial.AvatarImage>>().toExtend<
  React.ComponentProps<typeof avatarLocal.AvatarImage>
>();

expectTypeOf<React.ComponentProps<typeof badgeOfficial.Badge>>().toExtend<
  React.ComponentProps<typeof badgeLocal.Badge>
>();
expectTypeOf<typeof badgeLocal.badgeVariants>().toExtend<typeof badgeOfficial.badgeVariants>();

expectTypeOf<React.ComponentProps<typeof breadcrumbOfficial.Breadcrumb>>().toExtend<
  React.ComponentProps<typeof breadcrumbLocal.Breadcrumb>
>();
expectTypeOf<React.ComponentProps<typeof breadcrumbOfficial.BreadcrumbEllipsis>>().toExtend<
  React.ComponentProps<typeof breadcrumbLocal.BreadcrumbEllipsis>
>();
expectTypeOf<React.ComponentProps<typeof breadcrumbOfficial.BreadcrumbItem>>().toExtend<
  React.ComponentProps<typeof breadcrumbLocal.BreadcrumbItem>
>();
expectTypeOf<React.ComponentProps<typeof breadcrumbOfficial.BreadcrumbLink>>().toExtend<
  React.ComponentProps<typeof breadcrumbLocal.BreadcrumbLink>
>();
expectTypeOf<React.ComponentProps<typeof breadcrumbOfficial.BreadcrumbList>>().toExtend<
  React.ComponentProps<typeof breadcrumbLocal.BreadcrumbList>
>();
expectTypeOf<React.ComponentProps<typeof breadcrumbOfficial.BreadcrumbPage>>().toExtend<
  React.ComponentProps<typeof breadcrumbLocal.BreadcrumbPage>
>();
expectTypeOf<React.ComponentProps<typeof breadcrumbOfficial.BreadcrumbSeparator>>().toExtend<
  React.ComponentProps<typeof breadcrumbLocal.BreadcrumbSeparator>
>();

expectTypeOf<React.ComponentProps<typeof bubbleOfficial.Bubble>>().toExtend<
  React.ComponentProps<typeof bubbleLocal.Bubble>
>();
expectTypeOf<React.ComponentProps<typeof bubbleOfficial.BubbleContent>>().toExtend<
  React.ComponentProps<typeof bubbleLocal.BubbleContent>
>();
expectTypeOf<React.ComponentProps<typeof bubbleOfficial.BubbleGroup>>().toExtend<
  React.ComponentProps<typeof bubbleLocal.BubbleGroup>
>();
expectTypeOf<React.ComponentProps<typeof bubbleOfficial.BubbleReactions>>().toExtend<
  React.ComponentProps<typeof bubbleLocal.BubbleReactions>
>();

expectTypeOf<React.ComponentProps<typeof buttonOfficial.Button>>().toExtend<
  React.ComponentProps<typeof buttonLocal.Button>
>();
expectTypeOf<typeof buttonLocal.buttonVariants>().toExtend<typeof buttonOfficial.buttonVariants>();

expectTypeOf<React.ComponentProps<typeof buttonGroupOfficial.ButtonGroup>>().toExtend<
  React.ComponentProps<typeof buttonGroupLocal.ButtonGroup>
>();
expectTypeOf<React.ComponentProps<typeof buttonGroupOfficial.ButtonGroupSeparator>>().toExtend<
  React.ComponentProps<typeof buttonGroupLocal.ButtonGroupSeparator>
>();
expectTypeOf<React.ComponentProps<typeof buttonGroupOfficial.ButtonGroupText>>().toExtend<
  React.ComponentProps<typeof buttonGroupLocal.ButtonGroupText>
>();
expectTypeOf<typeof buttonGroupLocal.buttonGroupVariants>().toExtend<typeof buttonGroupOfficial.buttonGroupVariants>();

expectTypeOf<React.ComponentProps<typeof calendarOfficial.Calendar>>().toExtend<
  React.ComponentProps<typeof calendarLocal.Calendar>
>();
expectTypeOf<React.ComponentProps<typeof calendarOfficial.CalendarDayButton>>().toExtend<
  React.ComponentProps<typeof calendarLocal.CalendarDayButton>
>();

expectTypeOf<React.ComponentProps<typeof cardOfficial.Card>>().toExtend<React.ComponentProps<typeof cardLocal.Card>>();
expectTypeOf<React.ComponentProps<typeof cardOfficial.CardAction>>().toExtend<
  React.ComponentProps<typeof cardLocal.CardAction>
>();
expectTypeOf<React.ComponentProps<typeof cardOfficial.CardContent>>().toExtend<
  React.ComponentProps<typeof cardLocal.CardContent>
>();
expectTypeOf<React.ComponentProps<typeof cardOfficial.CardDescription>>().toExtend<
  React.ComponentProps<typeof cardLocal.CardDescription>
>();
expectTypeOf<React.ComponentProps<typeof cardOfficial.CardFooter>>().toExtend<
  React.ComponentProps<typeof cardLocal.CardFooter>
>();
expectTypeOf<React.ComponentProps<typeof cardOfficial.CardHeader>>().toExtend<
  React.ComponentProps<typeof cardLocal.CardHeader>
>();
expectTypeOf<React.ComponentProps<typeof cardOfficial.CardTitle>>().toExtend<
  React.ComponentProps<typeof cardLocal.CardTitle>
>();

expectTypeOf<React.ComponentProps<typeof carouselOfficial.Carousel>>().toExtend<
  React.ComponentProps<typeof carouselLocal.Carousel>
>();
expectTypeOf<carouselOfficial.CarouselApi>().toEqualTypeOf<carouselLocal.CarouselApi>();
expectTypeOf<React.ComponentProps<typeof carouselOfficial.CarouselContent>>().toExtend<
  React.ComponentProps<typeof carouselLocal.CarouselContent>
>();
expectTypeOf<React.ComponentProps<typeof carouselOfficial.CarouselItem>>().toExtend<
  React.ComponentProps<typeof carouselLocal.CarouselItem>
>();
expectTypeOf<React.ComponentProps<typeof carouselOfficial.CarouselNext>>().toExtend<
  React.ComponentProps<typeof carouselLocal.CarouselNext>
>();
expectTypeOf<React.ComponentProps<typeof carouselOfficial.CarouselPrevious>>().toExtend<
  React.ComponentProps<typeof carouselLocal.CarouselPrevious>
>();
expectTypeOf<typeof carouselLocal.useCarousel>().toExtend<typeof carouselOfficial.useCarousel>();

expectTypeOf<chartOfficial.ChartConfig>().toEqualTypeOf<chartLocal.ChartConfig>();
expectTypeOf<React.ComponentProps<typeof chartOfficial.ChartContainer>>().toExtend<
  React.ComponentProps<typeof chartLocal.ChartContainer>
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
expectTypeOf<React.ComponentProps<typeof chartOfficial.ChartTooltip>>().toExtend<
  React.ComponentProps<typeof chartLocal.ChartTooltip>
>();
expectTypeOf<React.ComponentProps<typeof chartOfficial.ChartTooltipContent>>().toExtend<
  React.ComponentProps<typeof chartLocal.ChartTooltipContent>
>();

expectTypeOf<React.ComponentProps<typeof checkboxOfficial.Checkbox>>().toExtend<
  React.ComponentProps<typeof checkboxLocal.Checkbox>
>();
