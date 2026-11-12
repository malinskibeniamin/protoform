import { describe, expect } from '@rstest/core';
import { render, screen } from '@testing-library/react';

import { Button } from '@/components/ui/button/index';
import { Checkbox } from '@/components/ui/checkbox/index';
import { Input } from '@/components/ui/input/index';
import { Radio, RadioGroup } from '@/components/ui/radio-group/index';
import { Select, SelectTrigger, SelectValue } from '@/components/ui/select/index';
import { Slider } from '@/components/ui/slider/index';
import { Switch } from '@/components/ui/switch/index';
import { Textarea } from '@/components/ui/textarea/index';

describe('base Nova form controls', () => {
  test('use Nova density and geometry by default', () => {
    const { container } = render(
      <>
        <Button onClick={() => undefined}>Save</Button>
        <Input aria-label="Name" />
        <Textarea aria-label="Description" />
        <Select>
          <SelectTrigger aria-label="Status">
            <SelectValue placeholder="Choose status" />
          </SelectTrigger>
        </Select>
        <Checkbox aria-label="Accept terms" />
        <RadioGroup>
          <Radio aria-label="First option" value="first" />
        </RadioGroup>
        <Switch aria-label="Enable notifications" />
        <Slider aria-label="Volume" defaultValue={[50]} />
      </>
    );

    expect(screen.getByRole('button', { name: 'Save' })).toHaveClass('h-8', 'rounded-lg');
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveClass('h-8', 'rounded-lg');
    expect(screen.getByRole('textbox', { name: 'Description' })).toHaveClass('min-h-16', 'rounded-lg', 'px-2.5');
    const trigger = screen.getByRole('combobox', { name: 'Status' });
    expect(trigger).toHaveAttribute('data-size', 'default');
    expect(trigger).toHaveClass('h-8', 'rounded-lg');
    expect(screen.getByRole('checkbox', { name: 'Accept terms' })).toHaveClass('size-4', 'rounded-sm');
    expect(screen.getByRole('radio', { name: 'First option' })).toHaveClass('size-4', 'rounded-full');
    const control = screen.getByRole('switch', { name: 'Enable notifications' });
    expect(control).toHaveAttribute('data-size', 'default');
    expect(control).toHaveClass('h-5', 'w-9');
    expect(screen.getByRole('slider', { name: 'Volume' })).toBeEnabled();
    expect(container.querySelector('[data-slot="slider-thumb"]')).toHaveClass('size-4');
  });
});
