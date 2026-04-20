import { test, expect } from '@playwright/test';
import { login } from "../utils/setup.utils";

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
  const confirmBtn = page.getByRole('button', { name: 'Confirm' });

  //Create dataset
  await page.getByRole('button', { name: 'New dataset' }).click();
  await expect(page.getByRole('heading', { name: 'Add dataset' })).toBeVisible();
  await page.getByLabel('Dataset name').fill(datasetName);
  await confirmBtn.click();

  //Open dataset
  await page.getByRole('link', { name: datasetName, exact: true }).click();
  await expect(page.getByRole('heading', { name: datasetName })).toBeVisible();
  console.log('Dataset created.');

  //Upload table
  await page.getByRole('button', { name: 'New table' }).click();
  await expect(page.getByRole('heading', { name: 'Add table' })).toBeVisible();

  //File path
  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Select file (.csv or .json)' }).click();
  const fileChooser = await fileChooserPromise;
  // Please provide your local base directory path below
  const baseDirectory = 'FILE_PATH';
  const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_sample.csv`;
  await fileChooser.setFiles(filePath);
  await confirmBtn.click();

  //Open table
  await page.getByRole('link', { name: tableName, exact: true }).click();
  const tableNameInput = page.getByLabel('Table name');
  await expect(tableNameInput).toBeVisible();
  await expect(tableNameInput).toHaveValue(tableName);
  console.log('Table uploaded and verified.');
});

test('Create dataset with same name (Auto-rename check)', async ({ page }) => {
  test.setTimeout(120000);
  const baseName = 'DatasetTest';
  const expectedRename = 'DatasetTest_1';
  const confirmBtn = page.getByRole('button', { name: 'Confirm' });

  //Create first dataset
  await page.getByRole('button', { name: 'New dataset' }).click();
  await expect(page.getByRole('heading', { name: 'Add dataset' })).toBeVisible();
  await page.getByLabel('Dataset name').fill(baseName);
  await confirmBtn.click();
  await expect(page.getByText(baseName)).toBeVisible();

  //Create second dataset with same name
  await page.getByRole('button', { name: 'New dataset' }).click();
  await page.getByLabel('Dataset name').fill(baseName);
  await confirmBtn.click();

  //Auto-rename dataset
  await expect(page.getByText(expectedRename)).toBeVisible();
  console.log(`Success: Dataset ${baseName} was correctly renamed to ${expectedRename}`);
});

test('Upload table with same name (Auto-rename check)', async ({ page }) => {
  test.setTimeout(120000);
  const baseName = 'table_sample';
  const expectedRename = 'table_sample_1';
  // Please provide your local base directory path below
  const baseDirectory = 'FILE_PATH';
  const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_sample.csv`;
  const confirmBtn = page.getByRole('button', { name: 'Confirm' });

  //Dataset opened
  await page.getByRole('link', { name: 'Dataset_test', exact: true }).click();
  console.log('Dataset "Dataset_test" opened.');

  //Upload first table
  await page.getByRole('button', { name: 'New table' }).click();
  await expect(page.getByRole('heading', { name: 'Add table' })).toBeVisible();
  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Select file (.csv or .json)' }).click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(filePath);
  await confirmBtn.click();
  await expect(page.getByText(baseName)).toBeVisible();

  //Upload second table with same name
  await page.getByRole('button', { name: 'New table' }).click();
  await expect(page.getByRole('heading', { name: 'Add table' })).toBeVisible();
  await page.getByRole('button', { name: 'Select file (.csv or .json)' }).click();
  await fileChooser.setFiles(filePath);
  await confirmBtn.click();

  //Auto-rename table
  await expect(page.getByText(expectedRename)).toBeVisible();
  console.log(`Success: Table ${baseName} was correctly renamed to ${expectedRename}`);
});

test('Help Link', async ({ page }) => {
  test.setTimeout(120000);
  const nextBtn = page.getByRole('button', { name: 'Next' });
  const doneBtn = page.getByRole('button', { name: 'Done' });
  const helpBtn = page.getByRole('button', { name: 'help' });
  const helpDatasetBtn = page.getByRole('button', { name: 'help-dataset' });

  await test.step('General Help from Dashboard', async () => {
    await helpBtn.click();
    await expect(page.getByRole('heading', { name: 'Upload a dataset' })).toBeVisible();
    await nextBtn.click();
    await expect(page.getByRole('heading', { name: 'Upload a table' })).toBeVisible();
    await doneBtn.click();

    //Back to Dashboard
    await expect(page.getByRole('heading', { name: 'Datasets' })).toBeVisible();
    console.log('General Help from Dashboard checked.');
  });

  await test.step('Contextual Help inside Add Dataset Dialog', async () => {
    //Open Add dataset dialog
    await page.getByRole('button', { name: 'New Dataset' }).click();
    await expect(page.getByRole('heading', { name: 'Add dataset' })).toBeVisible();

    //Open contextual help
    await helpDatasetBtn.click();
    await expect(page.getByRole('heading', { name: 'Upload a dataset' })).toBeVisible();
    await nextBtn.click();
    await expect(page.getByRole('heading', { name: 'Upload a table' })).toBeVisible();
    await doneBtn.click();

    //Back to Add dataset dialog
    await expect(page.getByRole('heading', { name: 'Add dataset' })).toBeVisible();

    //Back to Dashboard
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('heading', { name: 'Datasets' })).toBeVisible();
    console.log('Contextual Help inside Add Dataset Dialog checked.');
  });
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
  const userMenu = page.getByRole('button', { name: 'user-menu' });
  await userMenu.click();
  await page.getByText('Logout').click();

  //Back to Landing page
  await expect(page).toHaveURL('/');
  console.log('Logout successful: User redirected to landing page.');
});
