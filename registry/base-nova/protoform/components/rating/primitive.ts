import {
  announce,
  type ChangeDetails,
  createChange,
  createRovingFocus,
  definePrimitive,
  type PropSchema,
} from '@ui-sdk/core';

export interface RatingOptions {
  defaultValue?: number;
  onValueChange?: (value: number, details: ChangeDetails<'item-press' | 'list-navigation' | 'imperative'>) => void;
  value?: number;
}

function checkedRating(value: number) {
  if (!Number.isInteger(value) || value < 0 || value > 5) {
    throw new RangeError('Rating must be an integer from 0 to 5.');
  }
  return value;
}

const optionSchema = {
  value: 'number',
  defaultValue: 'number',
  onValueChange: 'callback',
} satisfies PropSchema<RatingOptions>;

const definition = definePrimitive({
  name: 'protoform-rating',
  options: optionSchema,
  controlled: ['value'],
  state: (options: RatingOptions): { value: number; focused: string | null } => ({
    value: checkedRating(options.value ?? options.defaultValue ?? 0),
    focused: null,
  }),
  sync: (options) => (options.value === undefined ? {} : { value: checkedRating(options.value) }),
  api: (context) => {
    const change = createChange(context);
    const roving = createRovingFocus(context, {
      slot: 'star',
      key: 'focused',
      remember: false,
      preferred: (star) => Number(star.key) === context.store.get().value,
      claims: (state, star) => (state.value === 0 ? star.key === '1' : Number(star.key) === state.value),
      orientation: () => 'both',
      loop: () => true,
    });
    const setRating = (value: number, reason: 'item-press' | 'list-navigation' | 'imperative', event?: Event) => {
      change('value', checkedRating(value), { reason, ...(event === undefined ? {} : { event }) });
      if (context.store.get().value === value) {
        announce(value === 0 ? 'Rating cleared' : `${value} of 5 stars`);
      }
    };
    return {
      roving,
      setValue: (value: number) => setRating(value, 'imperative'),
      pick: (value: number, event?: Event) => setRating(value, 'item-press', event),
      keydown(event: KeyboardEvent, el: HTMLElement) {
        const moved = roving.keydown(event, el);
        if (moved) {
          setRating(Number(moved.key), 'list-navigation', event);
        }
      },
    };
  },
  slots: (slot) => ({
    root: slot({ role: 'radiogroup', keys: { none: 'The star parts handle radio-group navigation.' } }),
    star: slot<{ value: string }>({
      props: { value: 'string' },
      role: 'radio',
      focus: 'roving',
      keys: ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'],
      attrs: (state, part) => ({
        type: 'button',
        'aria-checked': String(Number(part.key) === state.value),
        tabindex: part.api.roving.tabIndex(state, part),
        'data-filled': Number(part.key) <= state.value ? '' : undefined,
      }),
      press: ({ api, key }, event) => api.pick(Number(key), event),
      on: {
        keydown: (event, { el, api }) => {
          if (el) {
            api.keydown(event, el);
          }
        },
      },
      bind: (el, part) => part.api.roving.bind(el, part),
    }),
  }),
  agent: { actions: ['setValue'] },
});

export const rating = Object.assign(definition, { options: optionSchema });
