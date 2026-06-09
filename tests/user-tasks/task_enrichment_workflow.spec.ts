import { test, expect } from '@playwright/test';
import { login, getOrCreateDataset, getOrCreateTable } from '../utils/setup.utils';
import { dateFormatterConfig, modificationDialog } from "../utils/modification.utils";
import { reconciliationDialog, reconcilerConfig } from "../utils/reconciliation.utils";
import { extensionDialog, meteoPropsConfig } from "../utils/extension.utils";
import { saveTable, exportTable } from "../utils/global_actions.utils";

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

test('Enrichment Workflow', async ({ page }) => {
  await test.step('Modify Match Date Column', async () => {
    test.setTimeout(120000);
    await modificationDialog(page, 'Match Date', 'Date Formatter');
    await dateFormatterConfig(
      page,
      'Match Date',
      'ISO',
      'Date only (yyyy-MM-dd)',
      false,
      undefined,
      false,
      undefined
    );
    console.log('Column "Match Date" modified.');
  });

  await test.step('Reconcile Match Location Column', async () => {
    test.setTimeout(120000);
    await reconciliationDialog(page, 'Match Location', 'Geo Coordinates', 'Geocoding: Geo Coordinates (GeoNames)');
    await reconcilerConfig(page, ['Match Country']);
    await expect(page.getByText('Learn more about annotation')).toBeVisible({ timeout: 100000 });
    console.log('Column "Match Location" reconciled.');
  });

  await test.step('Extend Match Location Column', async () => {
    test.setTimeout(120000);
    await extensionDialog(page, 'Match Location', 'Meteo Properties (OpenMeteo)');
    await meteoPropsConfig(page, 'Match Date', 'Daily, returns values', ['Number of hours with rain'], false);
    console.log('Column "Match Location" extended.');
  });

  await test.step('Save and Export', async () => {
    test.setTimeout(120000);

    await saveTable(page);
    console.log('Table saved.');

    await exportTable(page, 'CSV');
    console.log('Table exported.');
  });
});
