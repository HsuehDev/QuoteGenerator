import { test, expect } from '@playwright/test';

test('DOM inspection — capture page structure', async ({ page }) => {
  await page.goto('http://localhost:8080');

  // Wait for app to fully load
  await page.waitForFunction(() => {
    const loading = document.querySelector('p');
    return !loading || loading.textContent !== '載入中...';
  }, { timeout: 15000 });

  await page.waitForTimeout(2000);

  // Take a screenshot
  await page.screenshot({ path: 'e2e/screenshots/app-loaded.png', fullPage: false });

  // Get all input IDs on the page
  const inputIds = await page.evaluate(() => {
    const inputs = document.querySelectorAll('input');
    return Array.from(inputs).map(i => ({
      id: i.id,
      placeholder: i.placeholder,
      type: i.type,
      value: i.value.substring(0, 30),
    }));
  });
  console.log('INPUTS:', JSON.stringify(inputIds, null, 2));

  // Check if the title input exists at all
  const titleCount = await page.locator('#title').count();
  console.log('Title input count:', titleCount);

  // Check the page structure
  const h1Text = await page.locator('h1').allTextContents();
  console.log('H1 texts:', h1Text);

  // Get first section's rendered HTML
  const html = await page.locator('.container').innerHTML();
  console.log('Container HTML (first 2000 chars):', html.substring(0, 2000));
});
