import { afterAll, beforeAll, expect, test } from '@rstest/core';
import { checkDirection, checkPattern, checkServer, mount } from '@ui-sdk/core/testing';
import { withSource } from '@ui-sdk/react/observe';
import { rating } from './primitive';

const markup =
  '<root aria-label="Review confidence"><star value="1">1 star</star><star value="2">2 stars</star><star value="3">3 stars</star><star value="4">4 stars</star><star value="5">5 stars</star></root>';
const previousStrict: unknown = Reflect.get(globalThis, '__UI_SDK_STRICT__');
beforeAll(() => {
  Reflect.set(globalThis, '__UI_SDK_STRICT__', true);
});
afterAll(() => {
  Reflect.set(globalThis, '__UI_SDK_STRICT__', previousStrict);
});

test('composes one tab stop, selection-following arrows, wraparound and announcements', async () => {
  const view = mount(rating, {}, markup);
  try {
    expect(view.root.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
    await view.keys('Tab', 'ArrowRight');
    expect(view.state.value).toBe(2);
    expect(view.part('star', '2')).toBe(document.activeElement);
    expect(view.changes.at(-1)).toMatchObject({ source: 'keyboard', reason: 'list-navigation', value: 2 });
    await view.keys('ArrowLeft');
    expect(view.state.value).toBe(1);
    await view.keys('ArrowLeft');
    expect(view.state.value).toBe(5);
    await view.keys('Home', 'End');
    expect(view.state.value).toBe(5);
    const first = view.part('star', '1');
    if (!first) {
      throw new Error('Missing first star');
    }
    await view.click(first);
    await view.keys('Space', 'Enter');
    expect(view.state.value).toBe(1);
    await view.settle();
    expect(view.announced).toContain('1 of 5 stars');
    await checkPattern(view.root, 'radio-group');
  } finally {
    view.unmount();
  }
});

test('passes SDK server and direction checks and rejects invalid API values', async () => {
  const html = checkServer(rating, { defaultValue: 3 }, markup);
  expect(html).toContain('role="radiogroup"');
  expect(html.match(/tabindex="0"/gu)).toHaveLength(1);
  await checkDirection(rating, {}, markup);
  const view = mount(rating, {}, markup);
  try {
    expect(() => view.api.setValue(6)).toThrow(RangeError);
    expect(() => view.api.setValue(Number.NaN)).toThrow(RangeError);
    view.api.setValue(3);
    expect(view.state.value).toBe(3);
    expect(view.root.querySelectorAll('[data-filled]')).toHaveLength(3);
    view.api.setValue(0);
    expect(view.state.value).toBe(0);
  } finally {
    view.unmount();
  }
});

test('lets the owner cancel an agent-originated change', () => {
  const sources: string[] = [];
  const view = mount(
    rating,
    {
      defaultValue: 2,
      onValueChange: (_, details) => {
        sources.push(details.source);
        details.cancel();
      },
    },
    markup
  );
  try {
    withSource('agent', () => view.api.setValue(4));
    expect(sources).toEqual(['agent']);
    expect(view.state.value).toBe(2);
    expect(view.changes).toHaveLength(0);
  } finally {
    view.unmount();
  }
});
