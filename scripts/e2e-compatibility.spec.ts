import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect } from '@rstest/playwright';
import { PNG } from 'pngjs';
import { matchScreenshot } from './e2e-screenshots';
import { test } from './e2e-test';

test('retains trusted keyboard chords, drag, live DOM access and runtime viewport changes', async ({ page }) => {
  await page.setContent('<button id="drag" draggable="true">Drag</button><button id="drop">Drop</button>');
  await page.evaluate(() => {
    document.querySelector<HTMLButtonElement>('#drop')?.addEventListener('click', (event) => {
      if (event.isTrusted && event.altKey) {
        document.body.dataset['trusted'] = 'yes';
      }
    });
    document.querySelector<HTMLButtonElement>('#drop')?.addEventListener('dragover', (event) => event.preventDefault());
    document.querySelector<HTMLButtonElement>('#drop')?.addEventListener('drop', (event) => {
      document.body.dataset['dropped'] = String(event.isTrusted);
    });
  });
  await page.keyboard.down('Alt');
  await page.getByRole('button', { name: 'Drop', exact: true }).click();
  await page.keyboard.up('Alt');
  await expect(page.locator('body')).toHaveAttribute('data-trusted', 'yes');
  await page
    .getByRole('button', { name: 'Drag', exact: true })
    .dragTo(page.getByRole('button', { name: 'Drop', exact: true }));
  await expect(page.locator('body')).toHaveAttribute('data-dropped', 'true');
  async function verifyViewport(width: number) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => innerWidth)).toBe(width);
    expect(
      await page.getByRole('button').evaluateAll((elements) => elements.map((element) => element.textContent))
    ).toEqual(['Drag', 'Drop']);
  }
  await verifyViewport(390);
  await verifyViewport(1440);
});

test('computes all accessible descriptions using the actual browser DOM', async ({ page }) => {
  await page.setContent(
    '<input aria-label="Title" aria-describedby="first second"><p id="first">Enter a title</p><p id="second">Use at least three characters</p>'
  );
  await expect(page.getByRole('textbox', { name: 'Title' })).toHaveAccessibleDescription(
    'Enter a title Use at least three characters'
  );
});

test('compares original PNG pixels, fails missing references and mismatches, and updates only explicitly', async ({
  page,
}) => {
  const directory = await mkdtemp(join(tmpdir(), 'protoform-screenshots-'));
  const reference = join(directory, 'reference.png');
  try {
    await page.setContent('<div style="width:8px;height:8px;background:rgb(255,255,255)"></div>');
    const target = page.locator('div');
    await expect(matchScreenshot(target, reference)).rejects.toThrow('Missing screenshot reference');
    const png = new PNG({ width: 8, height: 8 });
    png.data.fill(255);
    const original = PNG.sync.write(png);
    await writeFile(reference, original);
    await matchScreenshot(target, reference);
    await target.evaluate((element) => {
      element.style.background = 'black';
    });
    await expect(matchScreenshot(target, reference, { timeout: 1000 })).rejects.toThrow('64 pixels differ');
    expect(await readFile(reference)).toEqual(original);
    await matchScreenshot(target, reference, { update: true });
    await matchScreenshot(target, reference);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
