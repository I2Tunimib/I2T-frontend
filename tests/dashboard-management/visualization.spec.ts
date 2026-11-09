import { test, expect } from '@playwright/test';
import { getOrCreateDataset, getOrCreateTable, login } from "../utils/setup.utils";
import { getComponents } from "../utils/components.utils";

test.beforeEach(async ({ page }) => {
  const urlLocal = '/';
  // Please provide your local base directory path below
  const baseDirectory = 'FILE_PATH';
  const filePath = `${baseDirectory}/Shared drives/SemT project (shared)/Test_Tables/Test interface/table_fullTableAnnotation.json`;
  const datasetName = 'Dataset_test';
  const tableName = 'table_sample';
  const username = 'test';
  const password = 'test';

  await login(page, urlLocal, username, password);
  await getOrCreateDataset(page, datasetName);
  await expect(page.getByRole('heading', { name: datasetName })).toBeVisible();
  console.log('Dataset opened.');
  await getOrCreateTable(page, tableName, filePath);
  const tableNameInput = page.getByLabel('Table name');
  await expect(tableNameInput).toBeVisible();
  await expect(tableNameInput).toHaveValue(tableName);
  console.log('Table opened.');
  await page.getByRole('link').filter({ hasText: /^$/ }).click();
  await page.locator('ol').getByRole('button').click();
});

test('Raw/List view all/selected datasets', async ({ page }) => {
  test.setTimeout(120000);
  const datasetName = 'Dataset_test';
  const ui = getComponents(page);

  await ui.rawViewBtn.click();
  const element = page.getByText(`name: "${datasetName}"`).first();
  await element.scrollIntoViewIfNeeded();
  await expect(element).toBeVisible();
  await ui.listViewBtn.click();
  await expect(page.getByText(datasetName, { exact: true })).toBeVisible();

  await ui.selectDatasetBtn(datasetName).click();
  await ui.rawViewBtn.click();
  await expect(element).toBeVisible();
});

test('Raw/Grid/List view all/selected tables', async ({ page }) => {
  test.setTimeout(120000);
  const datasetName = 'Dataset_test';
  const baseName = 'table_sample';
  const ui = getComponents(page);

  await page.getByRole('link', { name: datasetName, exact: true }).click();
  await ui.rawViewBtn.click();
  const element = page.getByText(`name: "${baseName}"`).first();
  await element.scrollIntoViewIfNeeded();
  await expect(element).toBeVisible();
  await ui.gridViewBtn.click();
  await expect(page.getByRole('link', { name: new RegExp(`^${baseName}\\b`) })).toBeVisible();
  await ui.listViewBtn.click();
  await expect(page.getByText(baseName, { exact: true })).toBeVisible();

  await ui.selectTableBtn(baseName).click();
  await ui.rawViewBtn.click();
  await expect(element).toBeVisible();
  await ui.gridViewBtn.click();
  await expect(page.getByRole('link', { name: new RegExp(`^${baseName}\\b`) })).toBeVisible();
});

test('Renaming dataset', async ({ page }) => {
  test.setTimeout(120000);
  const baseName = 'DatasetTest';
  const newName = 'DatasetTest_renamed';

  const dataset = page.getByRole('link', { name: baseName, exact: true }).first();
  await dataset.scrollIntoViewIfNeeded();
  await expect(dataset).toBeVisible();

  await page.getByRole('link', { name: baseName, exact: true }).click({ button: 'right' });
  await page.getByRole('menuitem', { name: 'Rename' }).click();
  await page.getByLabel('Dataset name').click();
  await page.getByLabel('Dataset name').fill(newName);
  await page.getByRole('textbox', { name: 'Dataset name', exact: true }).press('Enter');
  await expect(page.getByRole('link', { name: new RegExp(`^${newName}\\b`) })).toBeVisible();
});

test('Renaming table', async ({ page }) => {
  test.setTimeout(120000);
  const datasetName = 'DatasetTest_renamed';
  const baseName = 'table_sample';
  const newName = 'table_renamed';

  const dataset = page.getByRole('link', { name: datasetName, exact: true }).first();
  await dataset.scrollIntoViewIfNeeded();
  await expect(dataset).toBeVisible();
  await page.getByRole('link', { name: datasetName, exact: true }).click();

  const table = page.getByRole('link', { name: baseName, exact: true }).first();
  await table.scrollIntoViewIfNeeded();
  await expect(table).toBeVisible();
  await page.getByRole('link', { name: baseName, exact: true }).click({ button: 'right' });
  await page.getByRole('menuitem', { name: 'Rename' }).click();
  await page.getByLabel('Table name').click();
  await page.getByLabel('Table name').fill(newName);
  await page.getByRole('textbox', { name: 'Table name', exact: true }).press('Enter');
  await expect(page.getByRole('link', { name: new RegExp(`^${newName}\\b`) })).toBeVisible();
});
