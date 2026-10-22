import DataTableExample from './data-table';
import DatePickerExample from './date-picker';
import { ParitySection } from './parity-shared';

export default function RecipeExamples() {
  return (
    <div className="min-w-0 space-y-6" data-testid="parity-recipes">
      <p className="text-sm text-muted-foreground">
        These are compositions, matching shadcn’s guides rather than invented primitive APIs.
      </p>
      <ParitySection title="Date picker">
        <DatePickerExample />
      </ParitySection>
      <ParitySection title="Data table">
        <DataTableExample />
      </ParitySection>
    </div>
  );
}
