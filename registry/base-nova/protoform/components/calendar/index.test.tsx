import { expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { fr } from 'react-day-picker/locale';
import { Calendar } from '.';

test('uses the requested locale for dropdown months and day metadata', () => {
  const date = new Date(2026, 0, 5);
  const { container } = render(<Calendar captionLayout="dropdown" defaultMonth={date} locale={fr} mode="single" />);
  expect(screen.getByRole('option', { name: 'janv.' })).toBeInTheDocument();
  expect(container.querySelector(`[data-day="${date.toLocaleDateString('fr')}"]`)).not.toBeNull();
});
