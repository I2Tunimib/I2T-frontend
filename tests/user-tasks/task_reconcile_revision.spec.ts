import { test, expect } from '@playwright/test';
import { login, getOrCreateDataset, getOrCreateTable } from '../utils/setup.utils';
import {
  reconcilerConfig,
  reconciliationDialog,
  metadataDialog,
  addMetadata,
  selectMetadata,
  confirmPropagate
} from "../utils/reconciliation.utils";

test.beforeEach(async ({ page }) => {
  const urlLocal = '/';
  // Please provide your local base directory path below
  const baseDirectory = 'FILE_PATH';
  const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_sample.csv`;
  const datasetName = 'Dataset_test';
  const tableName = 'table_task_1';
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

test('Reconcile and Revision', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);

  await test.step('Reconcile Football Club Column', async () => {
    test.setTimeout(120000);

    await reconciliationDialog(page, 'Football Club', 'Wikidata', 'Linking: Wikidata (Alligator)');
    await reconcilerConfig(page, ['Manager', 'Team Captain']);
    await expect(page.getByText('Learn more about annotation')).toBeVisible({ timeout: 100000 });
    console.log('Column "Football Club" reconciled.');
  });

  await test.step('Manual Reconciliation Arsenal Cell', async () => {
    await metadataDialog(page, 'Arsenal');
    console.log('Manage Metadata for "Arsenal" Cell opened.');

    await addMetadata(page, 'Arsenal', 'wd (Wikidata)', 'Q9617', 'Arsenal F.C.', 'association football club in London, England');
    console.log('Correct metadata added.');

    await confirmPropagate(page, 'Arsenal');
    console.log('"Arsenal" cell reconciled.');
  });

  await test.step('Manual Reconciliation Chelsea Cell', async () => {
    await metadataDialog(page, 'Chelsea');
    console.log('Manage Metadata for "Chelsea" Cell opened.');

    await addMetadata(page, 'Chelsea', 'wd (Wikidata)', 'Q9616', 'Chelsea F.C.', 'association football club in London, England');
    console.log('Correct metadata added.');

    await confirmPropagate(page, 'Chelsea');
    console.log('"Chelsea" cell reconciled.');
  });

  await test.step('Manual Reconciliation Liverpool Cell', async () => {
    await metadataDialog(page, 'Liverpool');
    console.log('Manage Metadata for "Liverpool" Cell opened.');

    await selectMetadata(page, 'Liverpool', ['association football club'], 'wd', 'Q1130849', 'association football club in Liverpool, England');
    await confirmPropagate(page, 'Liverpool');
    console.log('"Liverpool" cell reconciled.');
  });
});
