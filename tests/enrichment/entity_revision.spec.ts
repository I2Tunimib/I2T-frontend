import { test, expect } from '@playwright/test';
import { login, getOrCreateDataset, getOrCreateTable } from '../utils/setup.utils';
import { addMetadata, confirmPropagate, metadataDialog, selectMetadata } from "../utils/reconciliation.utils";

test.beforeEach(async ({ page }) => {
  test.setTimeout(120000);
  const urlLocal = '/';
  // Please provide your local base directory path below
  const baseDirectory = 'FILE_PATH';
  const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_entityRevision.json`;
  const datasetName = 'Dataset_test';
  const tableName = 'table_entityRevision';
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

test('Entity Matching Revision - Selection', async ({ page }) => {
  await metadataDialog(page, 'Liverpool');
  console.log('Manage Metadata for "Liverpool" Cell opened.');

  await selectMetadata(page, 'Liverpool', ['association football club'], 'wd', 'Q1130849', 'association football club in Liverpool, England');
  await confirmPropagate(page, 'Liverpool');
  console.log('"Liverpool" cell rconciled.');
});

test('Entity Matching Revision - Search', async ({ page }) => {
  await metadataDialog(page, 'Arsenal');
  console.log('Manage Metadata for "Arsenal" Cell opened.');

  await addMetadata(page, 'Arsenal', 'wd (Wikidata)', 'Q9617', 'Arsenal F.C.', 'association football club in London, England');
  console.log('Correct metadata added.');

  await confirmPropagate(page, 'Arsenal');
  console.log('"Arsenal" cell reconciled.');
});
