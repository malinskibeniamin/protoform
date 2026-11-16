import { expect, test } from '@rstest/core';
import type { Primitive } from '@ui-sdk/core';
import { combobox } from '@ui-sdk/core/combobox';
import { menu } from '@ui-sdk/core/menu';
import { menubar } from '@ui-sdk/core/menubar';
import { type NavigationMenuOptions, navigationMenu } from '@ui-sdk/core/navigation-menu';
import { select } from '@ui-sdk/core/select';
import { tooltip } from '@ui-sdk/core/tooltip';
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList } from '@ui-sdk/react/combobox';
import { Menu, MenuContent, MenuItem, MenuTrigger } from '@ui-sdk/react/menu';
import { Menubar } from '@ui-sdk/react/menubar';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@ui-sdk/react/navigation-menu';
import { createParts } from '@ui-sdk/react/primitive';
import { Select, SelectContent, SelectItem, SelectList, SelectTrigger, SelectValue } from '@ui-sdk/react/select';
import { expectTypeOf } from 'expect-type';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { withOptionSchema } from './base-nova/protoform/lib/ui-sdk/adapters/primitive-schema';

const selection = createParts(withOptionSchema(select), { content: 'div', 'select-all': 'div' });
const completion = createParts(withOptionSchema(combobox), { content: 'div', chip: 'div' });
const actions = createParts(withOptionSchema(menu), { content: 'div', 'checkbox-item': 'div' });
const bar = createParts(withOptionSchema(menubar), { root: 'div' });
const navigation = createParts(withOptionSchema(navigationMenu), { root: 'nav', item: 'li' });
function roles(html: string, role: string) {
  return html.split(`role="${role}"`).length - 1;
}
test('beta.5 public roots lack composed pre-mount label learning and native form projection', () => {
  const children = createElement(
    Fragment,
    null,
    createElement(SelectTrigger, null, createElement(SelectValue, null)),
    createElement(
      SelectContent,
      {
        container: null,
      },
      createElement(
        SelectList,
        null,
        createElement(
          SelectItem,
          {
            value: 'b',
          },
          'Rich Beta label'
        )
      )
    )
  );
  const native = renderToStaticMarkup(
    createElement(
      Select,
      {
        container: null,
        defaultValue: 'b',
        name: 'choice',
      },
      children
    )
  );
  const raw = renderToStaticMarkup(
    createElement(
      selection.Root,
      {
        defaultValue: 'b',
        name: 'choice',
      },
      children
    )
  );
  expect(native).toContain('Rich Beta label');
  expect(native).toContain('data-slot="select-form-input"');
  expect(raw).not.toContain('Rich Beta label');
  expect(raw).not.toContain('data-slot="select-form-input"');
  const comboChildren = createElement(
    Fragment,
    null,
    createElement(ComboboxInput, null),
    createElement(
      ComboboxContent,
      {
        container: null,
      },
      createElement(
        ComboboxList,
        null,
        createElement(
          ComboboxItem,
          {
            value: 'b',
          },
          'Rich Beta label'
        )
      )
    )
  );
  expect(
    renderToStaticMarkup(
      createElement(
        Combobox,
        {
          container: null,
          defaultValue: 'b',
          name: 'choice',
        },
        comboChildren
      )
    )
  ).toContain('value="Rich Beta label"');
  expect(
    renderToStaticMarkup(
      createElement(
        completion.Root,
        {
          defaultValue: 'b',
          name: 'choice',
        },
        comboChildren
      )
    )
  ).toContain('value="b"');
});
test('beta.5 public content does not register SDK default data placement', () => {
  const menuData = [{ value: 'new', label: 'New file' }];
  const native = renderToStaticMarkup(
    createElement(Menu, {
      container: null,
      defaultOpen: true,
      items: menuData,
    })
  );
  const rawRoot = renderToStaticMarkup(
    createElement(actions.Root, {
      defaultOpen: true,
      items: menuData,
    })
  );
  const rawContent = renderToStaticMarkup(
    createElement(
      Menu,
      {
        container: null,
        defaultOpen: true,
        items: menuData,
      },
      createElement(actions.Content, null)
    )
  );
  expect(native).toContain('New file');
  expect(rawRoot).not.toContain('New file');
  expect(roles(rawContent, 'menu')).toBeGreaterThan(roles(native, 'menu'));
  const nativeSelect = renderToStaticMarkup(
    createElement(
      Select,
      {
        container: null,
        defaultOpen: true,
        items: ['Alpha'],
      },
      createElement(
        SelectContent,
        {
          container: null,
        },
        createElement(SelectList, null)
      )
    )
  );
  const rawSelect = renderToStaticMarkup(
    createElement(
      Select,
      {
        container: null,
        defaultOpen: true,
        items: ['Alpha'],
      },
      createElement(selection.Content, null, createElement(SelectList, null))
    )
  );
  expect(roles(rawSelect, 'listbox')).toBeGreaterThan(roles(nativeSelect, 'listbox'));
  const nativeCombo = renderToStaticMarkup(
    createElement(
      Combobox,
      {
        container: null,
        defaultOpen: true,
        items: ['Alpha'],
      },
      createElement(ComboboxInput, null),
      createElement(
        ComboboxContent,
        {
          container: null,
        },
        createElement(ComboboxList, null)
      )
    )
  );
  const rawCombo = renderToStaticMarkup(
    createElement(
      Combobox,
      {
        container: null,
        defaultOpen: true,
        items: ['Alpha'],
      },
      createElement(ComboboxInput, null),
      createElement(completion.Content, null, createElement(ComboboxList, null))
    )
  );
  expect(roles(rawCombo, 'listbox')).toBeGreaterThan(roles(nativeCombo, 'listbox'));
});
test('beta.5 renderer features are declared in types but absent from bare core instances', () => {
  expect(() =>
    renderToStaticMarkup(
      createElement(
        Menu,
        {
          container: null,
          defaultOpen: true,
        },
        createElement(
          MenuContent,
          {
            container: null,
          },
          createElement(
            actions.CheckboxItem,
            {
              value: 'metadata',
            },
            'Metadata'
          )
        )
      )
    )
  ).toThrow(TypeError);
  expect(() =>
    renderToStaticMarkup(
      createElement(
        Select,
        {
          container: null,
          defaultOpen: true,
          multiple: true,
        },
        createElement(
          SelectContent,
          {
            container: null,
          },
          createElement(selection.SelectAll, null, 'All')
        )
      )
    )
  ).toThrow(TypeError);
  expect(() =>
    renderToStaticMarkup(
      createElement(
        Combobox,
        {
          container: null,
          defaultValue: ['Alpha'],
          multiple: true,
        },
        createElement(
          completion.Chip,
          {
            value: 'Alpha',
          },
          'Alpha'
        )
      )
    )
  ).toThrow(TypeError);
});
test('beta.5 public menubar root does not connect SDK menu roots to its renderer context', () => {
  const children = createElement(
    Fragment,
    null,
    createElement(
      Menu,
      {
        container: null,
      },
      createElement(MenuTrigger, null, 'File'),
      createElement(
        MenuContent,
        {
          container: null,
        },
        createElement(MenuItem, null, 'New')
      )
    ),
    createElement(
      Menu,
      {
        container: null,
      },
      createElement(MenuTrigger, null, 'Edit'),
      createElement(
        MenuContent,
        {
          container: null,
        },
        createElement(MenuItem, null, 'Copy')
      )
    )
  );
  expect(roles(renderToStaticMarkup(createElement(Menubar, null, children)), 'menuitem')).toBe(2);
  expect(roles(renderToStaticMarkup(createElement(bar.Root, null, children)), 'menuitem')).toBe(0);
});
test('beta.5 navigation renderer owns item context and nested landmark selection', () => {
  expect(() =>
    renderToStaticMarkup(
      createElement(
        NavigationMenu,
        {
          container: null,
          defaultValue: 'a',
        },
        createElement(
          NavigationMenuList,
          null,
          createElement(
            navigation.Item,
            {
              value: 'a',
            },
            createElement(NavigationMenuTrigger, null, 'A'),
            createElement(
              NavigationMenuContent,
              {
                container: null,
              },
              'Alpha'
            )
          )
        )
      )
    )
  ).toThrow('must be used inside');
  const native = renderToStaticMarkup(
    createElement(
      NavigationMenu,
      {
        container: null,
        defaultValue: 'a',
      },
      createElement(
        NavigationMenuItem,
        {
          value: 'a',
        },
        createElement(
          NavigationMenuContent,
          {
            container: null,
          },
          createElement(NavigationMenu, {
            container: null,
          })
        )
      )
    )
  );
  const raw = renderToStaticMarkup(
    createElement(
      NavigationMenu,
      {
        container: null,
        defaultValue: 'a',
      },
      createElement(
        NavigationMenuItem,
        {
          value: 'a',
        },
        createElement(
          NavigationMenuContent,
          {
            container: null,
          },
          createElement(navigation.Root, null)
        )
      )
    )
  );
  expect(native.split('<nav').length - 1).toBe(1);
  expect(raw.split('<nav').length - 1).toBe(2);
});
test('beta.5 public hook types block tooltip composition and narrowed navigation callbacks', () => {
  const normalizedTooltip = withOptionSchema(tooltip);
  expectTypeOf<typeof normalizedTooltip>().not.toExtend<Primitive>();
  expectTypeOf<NavigationMenuOptions<'guides' | 'examples'>>().not.toExtend<
    ReturnType<typeof navigationMenu>['types']['options']
  >();
});
