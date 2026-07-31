import { test } from '@playwright/test';
const TOUR_KEY = 'quote-generator-tour-completed';

test('debug: tax inputs in excluded mode', async ({ page }) => {
  await page.addInitScript((key) => localStorage.setItem(key, 'true'), TOUR_KEY);
  await page.goto('http://localhost:8080');
  await page.waitForTimeout(3000);

  // Switch to excluded mode
  const selectTrigger = page.locator('button[role="combobox"]');
  await selectTrigger.click();
  await page.getByRole('option', { name: '外加稅（加在未稅上）' }).click();
  await page.waitForTimeout(500);

  const inputs = await page.evaluate(() => {
    const allInputs = document.querySelectorAll('input');
    return Array.from(allInputs).map((i, idx) => ({
      idx,
      id: i.id,
      type: i.type,
      value: i.value,
      placeholder: i.placeholder,
      className: i.className.substring(0, 100),
    }));
  });

  console.log('TAX-MODE INPUTS:', JSON.stringify(inputs, null, 2));

  // Check for the tax name value
  const taxNameInputs = inputs.filter(i => i.value === '營業稅');
  console.log('TAX NAME INPUTS:', JSON.stringify(taxNameInputs, null, 2));
});
