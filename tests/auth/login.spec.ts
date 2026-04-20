import { test, expect } from '@playwright/test';

test('Authentication Local', async ({ page }) => {
  const username = 'test';
  const password = 'test';

  //Landing page
  await page.goto('/');
  await page.getByRole('link', { name: 'Get started' }).click();

  //Sign in with credentials
  const usernameField = page.locator('input[name="username"]');
  const passwordField = page.locator('input[name="password"]');
  const confirmBtn = page.getByRole('button', { name: 'Confirm' });

  await usernameField.fill(username);
  await passwordField.fill(password);
  await confirmBtn.click();
  //Dashboard
  await expect(page).toHaveURL(/datasets/, { timeout: 10000 });
  console.log('Login successful.');

  const dashboardHeader = page.getByRole('heading', { name: 'Datasets' });
  await expect(dashboardHeader).toBeVisible();
});

test('Authentication Chronos', async ({ page }) => {
  //Please provide your username and password
  const username = 'USERNAME';
  const password = 'PASSWORD';

  //Landing page
  await page.goto('http://vm.chronos.disco.unimib.it:3001/');
  await page.getByRole('link', { name: 'Get started' }).click();

  //Sign in with credentials
  const usernameField = page.locator('input[name="username"]');
  const passwordField = page.locator('input[name="password"]');
  const confirmBtn = page.getByRole('button', { name: 'Confirm' });

  await usernameField.fill(username);
  await passwordField.fill(password);
  await confirmBtn.click();
  //Dashboard
  await expect(page).toHaveURL(/datasets/, { timeout: 10000 });
  console.log('Login successful.');

  const dashboardHeader = page.getByRole('heading', { name: 'Datasets' });
  await expect(dashboardHeader).toBeVisible();
});
