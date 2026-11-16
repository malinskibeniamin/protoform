'use client';

import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const SAMPLE_MONTH = new Date(2026, 9, 1);
const DATE_FORMAT = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' });

export default function DatePickerExample() {
  const [selected, setSelected] = useState<Date | undefined>();
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-3">
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger
          render={
            <Button type="button" variant="outline">
              <CalendarIcon />
              {selected === undefined ? 'Choose sample date' : DATE_FORMAT.format(selected)}
            </Button>
          }
        />
        <PopoverContent className="w-auto p-0">
          <Calendar
            defaultMonth={SAMPLE_MONTH}
            mode="single"
            onSelect={(date) => {
              setSelected(date);
              if (date !== undefined) {
                setOpen(false);
              }
            }}
            selected={selected}
          />
        </PopoverContent>
      </Popover>
      <output aria-label="Selected sample date" className="block text-sm">
        {selected === undefined ? 'No date selected.' : `Selected: ${DATE_FORMAT.format(selected)}`}
      </output>
    </div>
  );
}
