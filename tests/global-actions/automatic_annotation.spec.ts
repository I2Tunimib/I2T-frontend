import { test, expect } from '@playwright/test';
import { login, getOrCreateDataset, getOrCreateTable } from '../utils/setup.utils';
import { getComponents } from "../utils/components.utils";

test.beforeEach(async ({ page }) => {
  const urlLocal = '/';
  const username = 'test';
  const password = 'test';

  await login(page, urlLocal, username, password);
});

test('Schema Annotation with LLM Column Classifier', async ({ page }) => {
  test.setTimeout(120000);
  const ui = getComponents(page);
  // Please provide your local base directory path below
  const baseDirectory = 'FILE_PATH';
  const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_sample.csv`;
  const datasetName = 'Dataset_test';
  const tableName = 'table_schemaAnnotation_LLM';
  await getOrCreateDataset(page, datasetName);
  await expect(page.getByRole('heading', { name: datasetName })).toBeVisible();
  console.log('Dataset "Dataset_test" opened.');
  await getOrCreateTable(page, tableName, filePath);
  const tableNameInput = page.getByLabel('Table name');
  await expect(tableNameInput).toBeVisible();
  await expect(tableNameInput).toHaveValue(tableName);
  console.log('Table opened.');

  //Open Automatic Annotation Dialog
  await expect(ui.autoAnnotationBtn).toBeVisible();
  await ui.autoAnnotationBtn.click();
  await page.getByRole('combobox', { name: 'Annotation target' }).click();
  await page.getByRole('option', { name: 'Schema' }).click();
  await expect(page.getByRole('combobox', { name: 'Annotation method' })).toBeEnabled();
  await page.getByRole('combobox', { name: 'Annotation method' }).click();
  await page.getByRole('option', { name: 'LLM Column Classifier' }).click();
  await expect(ui.startAnnotationBtn).toBeEnabled();
  await ui.startAnnotationBtn.click();

  //Automatic Annotation Completed
  await expect(page.getByText('Annotation schema for table')).toBeVisible({ timeout: 100000 });
  const footballClubBadge = page
    .getByRole('columnheader', { name: /Football Club/i })
    .getByLabel('kind-entity');
  const managerBadge = page
    .getByRole('columnheader', { name: /Manager/i })
    .getByLabel('kind-entity');
  const teamCaptainBadge = page
    .getByRole('columnheader', { name: /Team Captain/i })
    .getByLabel('kind-entity');
  const supplierBadge = page
    .getByRole('columnheader', { name: /Supplier/i })
    .getByLabel('kind-entity');
  const matchDateBadge = page
    .getByRole('columnheader', { name: /Match Date/i })
    .getByLabel('kind-literal');
  const matchLocationBadge = page
    .getByRole('columnheader', { name: /Match Location/i })
    .getByLabel('kind-entity');
  const matchCountryBadge = page
    .getByRole('columnheader', { name: /Match Country/i })
    .getByLabel('kind-entity');

  await expect(footballClubBadge).toBeVisible();
  await expect(managerBadge).toBeVisible();
  await expect(teamCaptainBadge).toBeVisible();
  await expect(supplierBadge).toBeVisible();
  await expect(matchDateBadge).toBeVisible();
  await expect(matchLocationBadge).toBeVisible();
  await expect(matchCountryBadge).toBeVisible();

  console.log('Schema annotated correctly with LLM Column Classifier.');
});

test('Full Table Annotation', async ({ page }) => {
  test.setTimeout(120000);
  const ui = getComponents(page);
  // Please provide your local base directory path below
  const baseDirectory = 'FILE_PATH';
  const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_sample.csv`;
  const datasetName = 'Dataset_test';
  const tableName = 'table_fullTableAnnotation';
  await getOrCreateDataset(page, datasetName);
  await expect(page.getByRole('heading', { name: datasetName })).toBeVisible();
  console.log('Dataset "Dataset_test" opened.');
  await getOrCreateTable(page, tableName, filePath);
  const tableNameInput = page.getByLabel('Table name');
  await expect(tableNameInput).toBeVisible();
  await expect(tableNameInput).toHaveValue(tableName);
  console.log('Table opened.');

  //Open Automatic Annotation
  await expect(ui.autoAnnotationBtn).toBeVisible();
  await ui.autoAnnotationBtn.click();
  await page.getByRole('combobox', { name: 'Annotation target' }).click();
  await page.getByRole('option', { name: 'Full table' }).click();
  await expect(page.getByRole('combobox', { name: 'Annotation method' })).toBeEnabled();
  await page.getByRole('combobox', { name: 'Annotation method' }).click();
  await page.getByRole('option', { name: 'Semantic Table Annotation (Alligator)' }).click();
  await expect(ui.startAnnotationBtn).toBeEnabled();
  await ui.startAnnotationBtn.click();

  //Annotation Completed
  await expect(page.getByText('Annotation for table')).toBeVisible({ timeout: 120000 });
  console.log('Table annotated.');

  const footballClubStatus = page
    .getByRole('columnheader', { name: /Football Club/i })
    .getByLabel('status-match-reconciliator');
  const managerStatus = page
    .getByRole('columnheader', { name: /Manager/i })
    .getByLabel('status-match-reconciliator');
  const teamCaptainStatus = page
    .getByRole('columnheader', { name: /Team Captain/i })
    .getByLabel('status-match-reconciliator');
  const supplierStatus = page
    .getByRole('columnheader', { name: /Supplier/i })
    .getByLabel('status-warn');
  const matchLocationStatus = page
    .getByRole('columnheader', { name: /Match Location/i })
    .getByLabel('status-warn');
  const matchCountryStatus = page
    .getByRole('columnheader', { name: /Match Country/i })
    .getByLabel('status-match-reconciliator');

  await expect(footballClubStatus).toBeVisible();
  await expect(managerStatus).toBeVisible();
  await expect(teamCaptainStatus).toBeVisible();
  await expect(supplierStatus).toBeVisible();
  await expect(matchLocationStatus).toBeVisible();
  await expect(matchCountryStatus).toBeVisible();
  console.log('Table annotated correctly.');
});
