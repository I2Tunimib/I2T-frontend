import { test, expect } from '@playwright/test';
import { login } from "../utils/setup.utils";
import { getComponents } from "../utils/components.utils";

test.beforeEach(async ({ page }) => {
  const urlLocal = '/';
  const username = 'test';
  const password = 'test';
  await login(page, urlLocal, username, password);
});

test('General Help', async ({ page }) => {
  test.setTimeout(120000);
  const ui = getComponents(page);

  await ui.helpBtn.click();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await ui.startTutorialBtn.click();
  await expect(page.getByRole('heading', { name: 'Tutorial Contents' })).toBeVisible();
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Uploading a Table' })).toBeVisible();
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Searching for an Element' })).toBeVisible();
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Managing Permissions' })).toBeVisible();
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Advanced Viewing Modes' })).toBeVisible();
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Reviewing Tables' })).toBeVisible();
  await ui.doneBtn.click();

  //Back to Dashboard
  await expect(page.getByRole('heading', { name: 'Datasets' })).toBeVisible();
  console.log('General Help from Dashboard checked.');
});

test('Dataset Help', async ({ page }) => {
  const ui = getComponents(page);

  //Open Add dataset dialog
  await ui.datasetBtn.click();
  await expect(page.getByRole('heading', { name: 'Add dataset' })).toBeVisible();

  //Open contextual help
  await ui.helpDatasetBtn.click();
  await expect(page.getByRole('heading', { name: 'Uploading or Creating a Dataset' })).toBeVisible();

  //Back to Dashboard
  await page.getByRole('dialog').press('Escape');
  await expect(page.getByRole('heading', { name: 'Add dataset' })).toBeVisible();
  console.log('Contextual Help inside Add Dataset Dialog checked.');
});

test('Table Help', async ({ page }) => {
  const ui = getComponents(page);
  const baseName = 'DatasetTest';
  test.setTimeout(120000);

  //Table opened
  await page.getByRole('link', { name: baseName, exact: true }).click();
  console.log('Dataset opened.');

  //Open Add table dialog
  await ui.tableBtn.click();
  await expect(page.getByRole('heading', { name: 'Add table' })).toBeVisible();

  //Open contextual help
  await ui.helpTableBtn.click();
  await expect(page.getByRole('heading', { name: 'Uploading a Table' })).toBeVisible();

  //Back to Dashboard
  await page.getByRole('dialog').press('Escape');
  await expect(page.getByRole('heading', { name: 'Add table' })).toBeVisible();
  console.log('Contextual Help inside Add Table Dialog checked.');
});

test('Search Table', async ({ page }) => {
  test.setTimeout(120000);
  const searchInput = page.getByPlaceholder('Search for a table name');
  const tableName = 'table_sample';
  const resultLink = page.getByRole('link').filter({ hasText: 'table_sample' }).first();
  const tableNameHeading = page.getByLabel('Table name');

  //Search table name
  await searchInput.click();
  await searchInput.fill(tableName);

  //Table found
  await expect(resultLink).toBeVisible();

  //Open table
  await resultLink.click();
  await expect(tableNameHeading).toBeVisible();
  await expect(tableNameHeading).toHaveValue(tableName);
  console.log('Table found and opened.');
});

test('Logout', async ({ page }) => {
  const ui = getComponents(page);
  await ui.userMenuBtn.click();
  await ui.logoutBtn.click();

  //Back to Landing page
  await expect(page).toHaveURL('/');
  console.log('Logout successful: User redirected to landing page.');
});
