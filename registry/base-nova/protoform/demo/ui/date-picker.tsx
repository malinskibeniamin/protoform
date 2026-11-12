'use client';

import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button/index';
import { Calendar } from '@/components/ui/calendar/index';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover/index';

const SAMPLE_MONTH = '2026-10';
function formatDate(value: string) {
  return DATE_FORMAT.format(new Date(`${value}T12:00:00`));
}
const DATE_FORMAT = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' });

export default function DatePickerExample() {
  const [selected, setSelected] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-3">
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger
          render={
            <Button type="button" variant="outline">
              <CalendarIcon />
              {selected === null ? 'Choose sample date' : formatDate(selected)}
            </Button>
          }
        />
        <PopoverContent className="w-auto p-0">
          <Calendar
            defaultMonth={SAMPLE_MONTH}
            mode="single"
            onValueChange={(date) => {
              setSelected(typeof date === 'string' ? date : null);
              if (typeof date === 'string') {
                setOpen(false);
              }
            }}
            value={selected}
          />
        </PopoverContent>
      </Popover>
      <output aria-label="Selected sample date" className="block text-sm">
        {selected === null ? 'No date selected.' : `Selected: ${formatDate(selected)}`}
      </output>
    </div>
  );
}
