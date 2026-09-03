import type { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Button } from "@/components/ui/button";
import type { Calendar } from "@/components/ui/calendar";
import type { Checkbox } from "@/components/ui/checkbox";
import type {
  Choicebox,
  ChoiceboxItem,
  ChoiceboxItemContent,
  ChoiceboxItemHeader,
  ChoiceboxItemIndicator,
  ChoiceboxItemTitle,
} from "@/components/ui/choicebox";
import type { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { Combobox } from "@/components/ui/combobox";
import type { CopyButton } from "@/components/ui/copy-button";
import type { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import type { Input } from "@/components/ui/input";
import type {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import type { JSONField } from "@/components/ui/json-field";
import type { KeyValueField } from "@/components/ui/key-value-field";
import type { SimpleMultiSelect } from "@/components/ui/multi-select";
import type { Popover, PopoverContent, PopoverTrigger, PopoverTriggerProps } from "@/components/ui/popover";
import type { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Slider } from "@/components/ui/slider";
import type { Switch } from "@/components/ui/switch";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Textarea } from "@/components/ui/textarea";
import type { Toggle } from "@/components/ui/toggle";
import type { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Heading, Text } from "@/components/ui/typography";

type RequiredValueExports = [
  typeof Alert,
  typeof AlertDescription,
  typeof AlertTitle,
  typeof Button,
  typeof Calendar,
  typeof Checkbox,
  typeof Choicebox,
  typeof ChoiceboxItem,
  typeof ChoiceboxItemContent,
  typeof ChoiceboxItemHeader,
  typeof ChoiceboxItemIndicator,
  typeof ChoiceboxItemTitle,
  typeof Collapsible,
  typeof CollapsibleContent,
  typeof CollapsibleTrigger,
  typeof Combobox,
  typeof CopyButton,
  typeof Field,
  typeof FieldContent,
  typeof FieldDescription,
  typeof FieldError,
  typeof FieldLabel,
  typeof Input,
  typeof InputGroup,
  typeof InputGroupAddon,
  typeof InputGroupButton,
  typeof InputGroupInput,
  typeof InputGroupText,
  typeof JSONField,
  typeof KeyValueField,
  typeof SimpleMultiSelect,
  typeof Popover,
  typeof PopoverContent,
  typeof PopoverTrigger,
  typeof RadioGroup,
  typeof RadioGroupItem,
  typeof Select,
  typeof SelectContent,
  typeof SelectGroup,
  typeof SelectItem,
  typeof SelectLabel,
  typeof SelectTrigger,
  typeof SelectValue,
  typeof Slider,
  typeof Switch,
  typeof Tabs,
  typeof TabsContent,
  typeof TabsList,
  typeof TabsTrigger,
  typeof Textarea,
  typeof Toggle,
  typeof ToggleGroup,
  typeof ToggleGroupItem,
  typeof Tooltip,
  typeof TooltipContent,
  typeof TooltipProvider,
  typeof TooltipTrigger,
  typeof Heading,
  typeof Text,
];

export interface ProtoformUIAdapterContract {
  exports: RequiredValueExports;
  PopoverTriggerProps: PopoverTriggerProps;
}
