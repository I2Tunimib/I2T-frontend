import { test, expect } from '@playwright/test';
import { getOrCreateTable, login, openDataset } from "../utils/setup.utils";
import { getComponents } from "../utils/components.utils";

test.beforeEach(async ({ page }) => {
  const urlLocal = '/';
  const username = 'test';
  const password = 'test';
  await login(page, urlLocal, username, password);
});

test('Create dataset & Upload table', async ({ page }) => {
  test.setTimeout(120000);
  const timestamp = new Date().getTime();
  const datasetName = `Test_${timestamp}`;
  const tableName = 'table_sample';
  const ui = getComponents(page);

  //Create dataset
  await ui.datasetBtn.click();
  await expect(page.getByRole('heading', { name: 'Add dataset' })).toBeVisible();
  await page.getByLabel('Dataset name').fill(datasetName);
  await ui.confirmBtn.click();

  //Open dataset
  await openDataset(page, datasetName);
  console.log('Dataset created.');

  //Upload table
  await ui.tableBtn.click();
  await expect(page.getByRole('heading', { name: 'Add table' })).toBeVisible();

  //File path
  const fileChooserPromise = page.waitForEvent('filechooser');
  await ui.fileBtn.click();
  const fileChooser = await fileChooserPromise;
  // Please provide your local base directory path below
  const baseDirectory = 'FILE_PATH';
  const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_sample.csv`;
  await fileChooser.setFiles(filePath);
  await expect(ui.confirmBtn).toBeVisible();
  await ui.confirmBtn.click();

  //Open table
  await getOrCreateTable(page, tableName, filePath);
  const tableNameInput = page.getByLabel('Table name');
  await expect(tableNameInput).toBeVisible();
  await expect(tableNameInput).toHaveValue(tableName);
  console.log('Table uploaded and verified.');
});

test('Create dataset with same name (Auto-rename check)', async ({ page }) => {
  test.setTimeout(120000);
  const baseName = 'DatasetTest';
  const expectedRename = 'DatasetTest_1';
  const ui = getComponents(page);

  //Create first dataset
  await ui.datasetBtn.click();
  await expect(page.getByRole('heading', { name: 'Add dataset' })).toBeVisible();
  await page.getByLabel('Dataset name').fill(baseName);
  await ui.confirmBtn.click();
  await expect(page.getByText(baseName)).toBeVisible();

  //Create second dataset with same name
  await ui.datasetBtn.click();
  await page.getByLabel('Dataset name').fill(baseName);
  await ui.confirmBtn.click();

  //Auto-rename dataset
  await expect(page.getByText(expectedRename)).toBeVisible();
  console.log(`Success: Dataset ${baseName} was correctly renamed to ${expectedRename}`);
});

test('Upload table with same name (Auto-rename check)', async ({ page }) => {
  test.setTimeout(120000);
  const datasetName = 'DatasetTest';
  const baseName = 'table_sample';
  const expectedRename = 'table_sample_1';
  // Please provide your local base directory path below
  const baseDirectory = '/Users/cyreneabjelina/Library/CloudStorage/GoogleDrive-c.abjelina@campus.unimib.it';
  const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_sample.csv`;
  const ui = getComponents(page);

  //Dataset opened
  await page.getByRole('link', { name: datasetName, exact: true }).click();
  console.log('Dataset opened.');

  //Upload first table
  await ui.tableBtn.click();
  await expect(page.getByRole('heading', { name: 'Add table' })).toBeVisible();
  const fileChooserPromise = page.waitForEvent('filechooser');
  await ui.fileBtn.click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(filePath);
  await ui.confirmBtn.click();
  await expect(page.getByText(baseName)).toBeVisible();

  //Upload second table with same name
  await ui.tableBtn.click();
  await expect(page.getByRole('heading', { name: 'Add table' })).toBeVisible();
  await ui.fileBtn.click();
  await fileChooser.setFiles(filePath);
  await ui.confirmBtn.click();

  //Auto-rename table
  await expect(page.getByText(expectedRename)).toBeVisible();
  console.log(`Success: Table ${baseName} was correctly renamed to ${expectedRename}`);
});
