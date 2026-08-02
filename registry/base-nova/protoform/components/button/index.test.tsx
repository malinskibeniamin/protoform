import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Button } from './index';

describe('Button', () => {
  it('uses Nova density and geometry by default', () => {
    render(<Button onClick={() => undefined}>Save</Button>);

    expect(screen.getByRole('button', { name: 'Save' })).toHaveClass('h-8', 'rounded-lg');
  });
});
