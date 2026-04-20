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

test('Edit right-click', async ({ page }) => {
  const arsenalCell = page.getByRole('gridcell', { name: 'Arsenal' });
  const editCell = page.getByRole('gridcell', { name: 'test' });

  await arsenalCell.click({ button: 'right' });
  await page.getByText('Edit').click();

  await page.getByLabel('edit-cell').fill('test');
  await page.keyboard.press('Enter');
  await expect(arsenalCell).not.toBeVisible();
  await expect(editCell).toBeVisible();
});

test('Reconcile row right-click', async ({ page }) => {
  const arsenalCell = page.getByRole('gridcell', { name: 'Arsenal' });

  await arsenalCell.click({ button: 'right' });
  await page.getByText('Reconciliate cell').click();
  await expect(page.getByRole('heading', { name: 'Reconciliation' })).toBeVisible();
});

test('Manage Metadat row  right-click', async ({ page }) => {
  const arsenalCell = page.getByRole('gridcell', { name: 'Arsenal' });

  await arsenalCell.click({ button: 'right' });
  await page.getByText('Manage metadata').click();
  await expect(page.getByRole('heading', { name: 'Arsenal' })).toBeVisible();
});

test('Delete row right-click', async ({ page }) => {
  const arsenalCell = page.getByRole('gridcell', { name: 'Arsenal' });

  await arsenalCell.click({ button: 'right' });
  await page.getByText('Delete row').click();
  await expect(arsenalCell).not.toBeVisible();
});

test('Delete column right-click', async ({ page }) => {
  const arsenalCell = page.getByRole('gridcell', { name: 'Arsenal' });
  const columnFootball = page.getByRole('columnheader', { name: 'Football Club' });
  const visibilityBtn = page.getByRole('button', { name: 'visibility-column' });

  await arsenalCell.click({ button: 'right' });
  await page.getByText('Delete column').click();
  await expect(columnFootball).not.toBeVisible();
  console.log('Column deleted.');

  await visibilityBtn.click();
  await expect(page.getByRole('menu')).toBeVisible();
  await expect(columnFootball).not.toBeVisible();
});
