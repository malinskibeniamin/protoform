import { afterEach, expect, test } from '@rstest/core';
import { cleanup, render, screen } from '@testing-library/react';
import { type ComponentPropsWithRef, createRef } from 'react';

import { Heading, Link, Text } from '.';

function CustomLink({ destination, ...props }: ComponentPropsWithRef<'a'> & { destination: string }) {
  return <a {...props} href={destination} />;
}

afterEach(cleanup);

test('renders neutral typography and a native link without changing markup or styling', () => {
  render(
    <>
      <Heading level={2}>Overview</Heading>
      <Text as="p" variant="bodySmall">
        Description
      </Text>
      <Link className="mt-2" href="/guide" testId="guide">
        Guide
      </Link>
    </>
  );
  expect(screen.getByRole('heading', { level: 2 })).toHaveClass('font-display', 'text-xl');
  expect(screen.getByText('Description').tagName).toBe('P');
  expect(screen.getByTestId('guide')).toHaveAttribute('href', '/guide');
  expect(screen.getByTestId('guide')).toHaveClass('font-medium', 'text-primary', 'underline', 'mt-2');
});

test('delegates rendering and forwards refs and props to the supplied link component', () => {
  const ref = createRef<HTMLAnchorElement>();
  render(
    <Link as={CustomLink} destination="/details" ref={ref} testId="details">
      Details
    </Link>
  );
  const link = screen.getByRole('link', { name: 'Details' });
  expect(link).toHaveAttribute('href', '/details');
  expect(link).toHaveAttribute('data-testid', 'details');
  expect(link).not.toHaveAttribute('as');
  expect(link).toHaveClass('font-medium', 'text-primary', 'underline');
  expect(ref.current).toBe(link);
});
