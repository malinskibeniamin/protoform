import { expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';

import { Progress, ProgressLabel, ProgressValue } from './index';

test('associates its progress label through Base UI context', () => {
  render(
    <Progress value={25}>
      <ProgressLabel>Export data</ProgressLabel>
      <ProgressValue />
    </Progress>
  );

  expect(screen.getByRole('progressbar', { name: 'Export data' })).toHaveAttribute('aria-valuenow', '25');
});
