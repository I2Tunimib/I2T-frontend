import { test, expect } from '@playwright/test';
import { login, getOrCreateDataset, getOrCreateTable } from '../utils/setup.utils';

test.beforeEach(async ({ page }) => {
  const urlLocal = '/';
  // Please provide your local base directory path below
  const baseDirectory = 'FILE_PATH';
  const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_fullTableAnnotation.json`;
  const datasetName = 'Dataset_test';
  const tableName = 'table_columnHeader';
  const username = 'test';
  const password = 'test';

  await login(page, urlLocal, username, password);
  await getOrCreateDataset(page, datasetName);
  await expect(page.getByRole('heading', { name: datasetName })).toBeVisible();
  console.log('Dataset "Dataset_test" opened.');
  await getOrCreateTable(page, tableName, filePath);
  const tableNameInput = page.getByLabel('Table name');
  await expect(tableNameInput).toBeVisible();
  await expect(tableNameInput).toHaveValue(tableName);
  console.log('Table opened.');
});

test('Pin Column', async ({ page }) => {
  const columnManager = page.getByRole('columnheader', { name: 'Manager' });

  await columnManager.hover();
  await columnManager.getByLabel('pin-column').click();
  await columnManager.hover();
  await expect(columnManager.getByLabel('unpin-column')).toBeVisible();
  await expect(page.getByRole('columnheader').nth(1)).toContainText('Manager');
  console.log('Column pinned.');

  await columnManager.hover();
  await columnManager.getByLabel('unpin-column').click();
  await columnManager.hover();
  await expect(columnManager.getByLabel('pin-column')).toBeVisible();
  await expect(page.getByRole('columnheader').nth(1)).toContainText('Football Club');
  console.log('Column unpinned.');
});

test('Sort Alphabetical', async ({ page }) => {
  const columnSupplier = page.getByRole('columnheader', { name: 'Supplier' });
  const sortBtn = columnSupplier.getByLabel('sort-alphabetical');
  const pumaCell = page.getByRole('gridcell', { name: 'Puma' }).first();
  const adidasCell = page.getByRole('gridcell', { name: 'Adidas' }).first();
  const underArmourCell = page.getByRole('gridcell', { name: 'Under Armour' }).first();

  await columnSupplier.hover();
  await sortBtn.hover();
  await expect(page.getByRole('tooltip', { name: 'Sort A → Z' })).toBeVisible();
  await sortBtn.click();
  await sortBtn.hover();
  await expect(page.getByRole('tooltip', { name: 'Sort Z → A' })).toBeVisible();
  await expect(adidasCell).toBeVisible();
  console.log('Values sorted A->Z.');

  await columnSupplier.hover();
  await sortBtn.click();
  await sortBtn.hover();
  await expect(page.getByRole('tooltip', { name: 'Reset order' })).toBeVisible();
  await expect(underArmourCell).toBeVisible();
  console.log('Values sorted Z->A.');

  await columnSupplier.hover();
  await sortBtn.click();
  await sortBtn.hover();
  await expect(page.getByRole('tooltip', { name: 'Sort A → Z' })).toBeVisible();
  await expect(pumaCell).toBeVisible();
  console.log('Sort resetted.');
});

test('Sort Reconciliation Score', async ({ page }) => {
  const columnSupplier = page.getByRole('columnheader', { name: 'Supplier' });
  const sortBtn = columnSupplier.getByLabel('sort-score');
  const pumaCell = page.getByRole('gridcell', { name: 'Puma' }).first();
  const macronCell = page.getByRole('gridcell', { name: 'Macron' }).first();
  const adidasCell = page.getByRole('gridcell', { name: 'Adidas' }).first();

  await columnSupplier.hover();
  await sortBtn.hover();
  await expect(page.getByRole('tooltip', { name: 'Sort by score: Low → High' })).toBeVisible();
  await sortBtn.click();
  await sortBtn.hover();
  await expect(page.getByRole('tooltip', { name: 'Sort by score: High → Low' })).toBeVisible();
  await expect(macronCell).toBeVisible();
  console.log('Values sorted green->red.');

  await columnSupplier.hover();
  await sortBtn.click();
  await sortBtn.hover();
  await expect(page.getByText('Reset order').nth(1)).toBeVisible();
  await expect(adidasCell).toBeVisible();
  console.log('Values sorted red->green.');

  await columnSupplier.hover();
  await sortBtn.click();
  await sortBtn.hover();
  await expect(page.getByRole('tooltip', { name: 'Sort by score: Low → High' })).toBeVisible();
  await expect(pumaCell).toBeVisible();
  console.log('Sort resetted.');
});

test('Modify Column right-click', async ({ page }) => {
  const columnSupplier = page.getByRole('columnheader', { name: 'Supplier' });

  await columnSupplier.click({ button: 'right' });
  await page.getByText('Modify column').click();
  await expect(page.getByRole('heading', { name: 'Modification' })).toBeVisible();
});

test('Reconcile Column right-click', async ({ page }) => {
  const columnSupplier = page.getByRole('columnheader', { name: 'Supplier' });

  await columnSupplier.click({ button: 'right' });
  await page.getByText('Reconcile column').click();
  await expect(page.getByRole('heading', { name: 'Reconciliation' })).toBeVisible();
});

test('Extend Column right-click', async ({ page }) => {
  const columnSupplier = page.getByRole('columnheader', { name: 'Supplier' });

  await columnSupplier.click({ button: 'right' });
  await page.getByText('Extend column').click();
  await expect(page.getByRole('heading', { name: 'Extension' })).toBeVisible();
});

test('Pin Column right-click', async ({ page }) => {
  const columnSupplier = page.getByRole('columnheader', { name: 'Supplier' });

  await columnSupplier.click({ button: 'right' });
  await page.getByText('Pin column').click();
  await expect(page.getByRole('columnheader').nth(1)).toContainText('Supplier');
  console.log('Column pinned.');

  await columnSupplier.click({ button: 'right' });
  await page.getByText('Unpin column').click();
  await expect(page.getByRole('columnheader').nth(1)).toContainText('Football Club');
  console.log('Column unpinned.');
});

test('Hide Column right-click', async ({ page }) => {
  const columnSupplier = page.getByRole('columnheader', { name: 'Supplier' });

  await columnSupplier.click({ button: 'right' });
  await page.getByText('Hide column').click();
  await expect(columnSupplier).not.toBeVisible();
  console.log('Column hidden.');
});

test('Delete Column right-click', async ({ page }) => {
  const columnSupplier = page.getByRole('columnheader', { name: 'Supplier' });
  const visibilityBtn = page.getByRole('button', { name: 'visibility-column' });

  await columnSupplier.click({ button: 'right' });
  await page.getByText('Delete column').click();
  await expect(columnSupplier).not.toBeVisible();
  console.log('Column deleted.');

  await visibilityBtn.click();
  await expect(page.getByRole('menu')).toBeVisible();
  await expect(columnSupplier).not.toBeVisible();
});
