import { expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { Calendar, CalendarMonthSelect } from '.';

test('uses ISO dates and requested locale for month options', () => {
  render(
    <Calendar defaultMonth="2026-01" locale="fr" mode="single">
      <CalendarMonthSelect aria-label="Month" />
    </Calendar>
  );
  expect(screen.getByRole('option', { name: 'janvier' })).toBeInTheDocument();
});
