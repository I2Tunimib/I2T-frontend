import { test, expect } from '@playwright/test';
import { login, getOrCreateDataset, getOrCreateTable } from '../utils/setup.utils';

test.beforeEach(async ({ page }) => {
  const urlLocal = '/';
  // Please provide your local base directory path below
  const baseDirectory = 'FILE_PATH';
  const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_sample.csv`;
  const datasetName = 'Dataset_test';
  const tableName = 'table_task_2';
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

test('Full Workflow', async ({ page }) => {
  const confirmBtn = page.getByRole('button', { name: 'Confirm' });
  const modifyBtn = page.getByRole('button', { name: 'Modify', exact: true });
  const reconcileBtn = page.getByRole('button', { name: 'Reconcile', exact: true });
  const extendBtn = page.getByRole('button', { name: 'Extend', exact: true });
  const saveBtn = page.getByRole('button', { name: 'Save', exact: true });
  const exportBtn = page.getByRole('button', { name: 'Export', exact: true });

  await test.step('Modify Match Date Column', async () => {
    test.setTimeout(120000);
    const columnMatchDate = page.getByRole('columnheader', { name: 'Match Date' });
    const selectService = page.getByText('Choose a modification service...');

    await columnMatchDate.click();
    console.log('Column "Match Date" selected.');

    await expect(modifyBtn).toBeEnabled();
    await modifyBtn.click();
    await expect(page.getByRole('heading', { name: 'Modification' })).toBeVisible();
    await selectService.click();
    await page.getByRole('option', { name: 'Date Formatter' }).click();
    await expect(page.getByText('A transformation function that converts date-like values in the selected')).toBeVisible();

    await page.getByRole('radio', { name: 'ISO' }).check();
    await page.locator('#mui-component-select-detailLevel').click();
    await page.getByRole('option', { name: 'Date only (yyyy-MM-dd)', exact: true }).click();
    console.log('"Date only (yyyy-MM-dd)" selected as level of detail.');

    await confirmBtn.click();
    await expect(page.getByText('column updated')).toBeVisible();
    const matchDateKind = page
      .getByRole('columnheader', { name: /Match Date/i })
      .getByLabel('kind-literal');
    await expect(matchDateKind).toBeVisible();
    console.log('Column "Match Date" modified.');
  });

  await test.step('Reconcile Match Location Column', async () => {
    test.setTimeout(120000);
    const columnMatchLoc = page.getByRole('columnheader', { name: 'Match Location' });
    const selectService = page.getByText('Choose a reconciliation service...');

    await columnMatchLoc.click();
    console.log('Column "Match Location" selected.');

    await expect(reconcileBtn).toBeEnabled();
    await reconcileBtn.click();
    await expect(page.getByRole('heading', { name: 'Reconciliation' })).toBeVisible();
    await page.getByText('Choose a service group...').click();
    await page.getByRole('option', { name: 'Geo Coordinates', exact: true }).click();
    await expect(selectService).toBeEnabled();
    await selectService.click();
    await page.getByRole('option', { name: 'Geocoding: Geo Coordinates (GeoNames)', exact: true }).click();
    await expect(page.getByText('A geographic reconciliation service that links location mentions to GeoNames entries')).toBeVisible();
    console.log('Geocoding: Geo Coordinates (GeoNames) selected.');

    const contextSelect = page.locator('#mui-component-select-additionalColumns');
    await contextSelect.click();
    await page.getByRole('option', { name: 'Match Country', exact: true }).click();
    await page.getByRole('listbox').getByRole('button', { name: 'Confirm' }).click();
    console.log('Column "Match Country" selected as additional column.');

    await expect(page.getByRole('combobox', { name: 'Match Country' })).toBeVisible({ timeout: 100000 });
    await page.getByRole('dialog').getByRole('button', { name: 'Confirm' }).click();
    console.log('Reconciliation in process.');

    await expect(page.getByText('Learn more about annotation')).toBeVisible({ timeout: 100000 });
    console.log('Column "Match Location" reconciled.');
  });

  await test.step('Extend Match Location Column', async () => {
    test.setTimeout(120000);
    await expect(extendBtn).toBeEnabled();
    await extendBtn.click();

    const selectService = page.getByText('Choose an extension service...');
    await expect(selectService).toBeEnabled();
    await selectService.click();
    await page.getByRole('option', { name: 'Meteo Properties (OpenMeteo)', exact: true }).click();
    await expect(page.getByText('An extender that adds weather properties for the geographic points')).toBeVisible();
    console.log('Meteo Properties (OpenMeteo) selected.');

    const dateSelect = page.locator('#mui-component-select-dates');
    await dateSelect.click();
    await page.getByRole('option', { name: 'Match Date', exact: true }).click();
    console.log('Column "Match Date" selected as column date.');
    await expect(page.getByRole('combobox', { name: 'Match Date' })).toBeVisible();
    await page.getByRole('dialog').getByRole('button', { name: 'Confirm' }).click();

    await page.getByRole('radio', { name: 'Daily, returns values' }).check();
    await page.getByRole('checkbox', { name: 'Number of hours with rain' }).check();
    await confirmBtn.click();
    console.log('Extension in process.');

    await expect(page.getByText('column added')).toBeVisible({ timeout: 100000 });
    console.log('Column "Match Location" extended.');
  });

  await test.step('Save and Export', async () => {
    test.setTimeout(120000);
    await expect(saveBtn).toBeEnabled();
    await saveBtn.click();
    console.log('Table saved.');

    await exportBtn.click();
    await page.getByRole('combobox', { name: 'Export type' }).click();
    await page.getByRole('option', { name: 'Table' }).click();
    await expect(page.getByRole('combobox', { name: 'Export format' })).toBeEnabled();
    await page.getByRole('combobox', { name: 'Export format' }).click();
    await page.getByRole('option', { name: 'CSV' }).click();
    await expect(confirmBtn).toBeEnabled();
    await confirmBtn.click();
    console.log('Table exported.');
  });
});
