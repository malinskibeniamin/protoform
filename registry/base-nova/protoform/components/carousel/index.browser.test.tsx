import './browser-fixture.css';

import { page } from '@rstest/browser';
import { afterEach, expect, test } from '@rstest/core';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { createCarouselController } from '@ui-sdk/core/carousel';
import { createRef } from 'react';

import { Input } from '@/components/ui/input/index';
import { Carousel, CarouselContent, CarouselItem, CarouselViewport } from '.';

afterEach(cleanup);

test('does not consume editing arrow keys inside a carousel slide', async () => {
  const carousel = createCarouselController();
  const ref = createRef<HTMLDivElement>();
  render(
    <Carousel className="w-75" controller={carousel} ref={ref}>
      <CarouselViewport>
        <CarouselContent className="flex">
          <CarouselItem className="basis-full">
            <Input aria-label="Slide note" defaultValue="Editable" />
          </CarouselItem>
          <CarouselItem className="basis-full">Another slide</CarouselItem>
        </CarouselContent>
      </CarouselViewport>
    </Carousel>
  );
  await waitFor(() => expect(carousel.getPage()).toBe(1));
  expect(ref.current).toBeInstanceOf(HTMLDivElement);
  const editor = page.getByRole('textbox', { name: 'Slide note' });
  await editor.click();
  await editor.press('Home');
  await editor.press('ArrowRight');
  expect(screen.getByRole<HTMLInputElement>('textbox', { name: 'Slide note' }).selectionStart).toBe(1);
  expect(carousel.getPage()).toBe(1);
});
