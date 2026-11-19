import { beforeEach, describe, expect } from '@rstest/core';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PresetLab } from './preset-lab';
import { buildPresetCode, defaultPreset, defaultRadius, presetDefinitions } from './preset-lab-presets';

const workEmailPattern = /work email/iu;
const submitPattern = /submit/iu;

describe('presetLab', () => {
  beforeEach(() => {
    globalThis.window.history.replaceState({}, '', '/docs/presets');
    document.documentElement.dataset['theme'] = 'light';
    localStorage.setItem('blume-theme', 'light');
  });

  test('applies preview mode changes to the Blume docs theme', async () => {
    const user = userEvent.setup();

    render(<PresetLab />);

    await user.click(screen.getByRole('button', { name: 'Dark preview' }));

    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(localStorage.getItem('blume-theme')).toBe('dark');
  });

  test('tracks Blume docs theme changes without a reload', async () => {
    render(<PresetLab />);

    document.documentElement.dataset['theme'] = 'dark';
    localStorage.setItem('blume-theme', 'dark');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Dark preview' })).toHaveAttribute('aria-pressed', 'true');
    });
    expect(screen.getByTestId('preset-preview')).toHaveClass('dark');
    expect(new URL(globalThis.window.location.href).searchParams.get('mode')).toBe('dark');
  });

  test('starts from the current Blume docs theme when mode is not shared', () => {
    document.documentElement.dataset['theme'] = 'dark';
    localStorage.setItem('blume-theme', 'dark');

    render(<PresetLab />);

    expect(screen.getByRole('button', { name: 'Dark preview' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('preset-preview')).toHaveClass('dark');
  });

  test('keeps every preset close while rendering one focused live form', async () => {
    const user = userEvent.setup();

    render(<PresetLab />);

    expect(screen.getByTestId('preset-lab')).toHaveClass('not-prose');
    expect(
      screen.getByText('Base UI + Nova', {
        selector: "[data-slot='preset-compatibility']",
      })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Light preview' })).toHaveTextContent('Light');
    expect(screen.getByRole('button', { name: 'Dark preview' })).toHaveTextContent('Dark');
    const workspace = screen.getByTestId('preset-workspace');
    for (const preset of presetDefinitions) {
      expect(
        within(workspace).getByRole('button', {
          name: `Choose ${preset.name} preset`,
        })
      ).toBeInTheDocument();
    }
    const workEmailInput = within(workspace).getByRole('textbox', {
      name: workEmailPattern,
    });
    expect(within(workspace).getAllByRole('button', { name: submitPattern })).toHaveLength(1);
    expect(within(workspace).getByRole('combobox', { name: 'Review template' })).toBeInTheDocument();
    expect(
      within(workspace).getByRole('slider', {
        name: 'Coverage target slider',
      })
    ).toBeInTheDocument();
    expect(within(workspace).getByRole('textbox', { name: 'Review notes' })).toBeInTheDocument();
    expect(
      within(workspace).getByRole('button', {
        name: 'Open calendar for Due date',
      })
    ).toBeInTheDocument();
    expect(
      within(workspace).getByRole('checkbox', {
        name: 'Require final approval',
      })
    ).toBeInTheDocument();
    expect(screen.getByTestId('preset-preview')).toHaveAttribute('data-preset-id', 'neutral');
    expect(screen.getByTestId('preset-preview')).toHaveStyle('--background: oklch(1 0 0)');

    await user.clear(workEmailInput);
    await user.paste('owner@protoform.dev');
    await user.click(screen.getByRole('button', { name: 'Choose Ocean preset' }));

    expect(workEmailInput).toHaveValue('owner@protoform.dev');
    expect(screen.getByTestId('preset-preview')).toHaveAttribute('data-preset-id', 'ocean');
    expect(screen.getByTestId('preset-preview')).toHaveStyle(
      '--selected: oklch(0.488 0.243 264.376); --selection: oklch(0.488 0.243 264.376)'
    );
    await waitFor(() => {
      expect(new URL(globalThis.window.location.href).searchParams.get('preset')).toBeTruthy();
    });
    const sharedPreset = new URL(globalThis.window.location.href).searchParams.get('preset');
    expect(sharedPreset).toBe('b1YmqvjO4');
    expect(screen.getByRole('link', { name: 'Open in shadcn/create' })).toHaveAttribute(
      'href',
      `https://ui.shadcn.com/create?base=base&preset=${sharedPreset}`
    );
    expect(screen.getByText(`bunx shadcn@latest create --base base --preset ${sharedPreset}`)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy Bun command' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Large' }));

    expect(screen.getByTestId('preset-preview')).toHaveStyle('--radius: 0.75rem; --radius-lg: 0.75rem');

    await user.click(screen.getByRole('button', { name: 'Dark preview' }));

    expect(screen.getByTestId('preset-preview')).toHaveClass('dark');
    expect(screen.getByTestId('preset-preview')).toHaveStyle('--background: oklch(0.145 0 0)');
    expect(new URL(globalThis.window.location.href).searchParams.get('mode')).toBe('dark');

    const ids = [...document.querySelectorAll('[id]')].map((element) => element.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('falls back to an accessible full-viewport mode without a native fullscreen API', async () => {
    const user = userEvent.setup();
    render(
      <>
        <div data-testid="page-background">Page background</div>
        <PresetLab />
      </>
    );
    const workspace = screen.getByTestId('preset-workspace');

    await user.click(screen.getByRole('button', { name: 'Enter full screen' }));

    expect(workspace).toHaveAttribute('data-fullscreen', 'true');
    expect(workspace).toHaveAttribute('data-fullscreen-mode', 'fallback');
    expect(workspace).toHaveAttribute('role', 'dialog');
    expect(workspace).toHaveAttribute('aria-modal', 'true');
    expect(workspace.parentElement?.parentElement).toBe(document.body);
    const background = screen.getByTestId('page-background').parentElement;
    expect(background?.inert).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');

    await user.keyboard('{Escape}');

    expect(workspace).toHaveAttribute('data-fullscreen', 'false');
    expect(background?.inert).not.toBe(true);
    expect(document.body.style.overflow).not.toBe('hidden');
    expect(screen.getByRole('status')).toHaveTextContent('Full screen closed');
  });

  test('reports an invalid shared preset', () => {
    const supportedCode = buildPresetCode(defaultPreset, defaultRadius);
    const noncanonicalCode = `${supportedCode[0]}0${supportedCode.slice(1)}`;
    globalThis.window.history.replaceState({}, '', `/docs/presets?preset=${noncanonicalCode}&mode=night`);

    render(<PresetLab />);

    expect(screen.getByRole('status')).toHaveTextContent('Showing the default Base UI + Nova preset');
  });

  test('preserves a supported preset when only the shared mode is invalid', () => {
    const presetCode = buildPresetCode(defaultPreset, defaultRadius);
    globalThis.window.history.replaceState({}, '', `/docs/presets?preset=${presetCode}&mode=night`);

    render(<PresetLab />);

    expect(screen.getByTestId('preset-preview')).toHaveAttribute('data-preset-id', 'neutral');
    expect(screen.getByRole('status')).toHaveTextContent('Showing the light preview');
    expect(screen.getByRole('status')).not.toHaveTextContent('Showing the default');
  });
});
