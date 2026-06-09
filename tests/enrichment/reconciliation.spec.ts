import { test, expect } from '@playwright/test';
import { login, getOrCreateDataset, getOrCreateTable } from '../utils/setup.utils';
import { getComponents } from "../utils/components.utils";
import { reconcilerConfig, reconciliationDialog, reconcilerInTableConfig } from "../utils/reconciliation.utils";

test.describe('Test in local', () => {
  test.beforeEach(async ({ page }) => {
    const urlLocal = '/';
    const datasetName = 'Dataset_test';
    const username = 'test';
    const password = 'test';

    await login(page, urlLocal, username, password);
    await getOrCreateDataset(page, datasetName);
    await expect(page.getByRole('heading', { name: datasetName })).toBeVisible();
    console.log('Dataset "Dataset_test" opened.');
  });

  test('Reconcile Linking: Wikidata (Alligator)', async ({ page }) => {
    test.setTimeout(120000);
    const ui = getComponents(page);
    // Please provide your local base directory path below
    const baseDirectory = 'FILE_PATH';
    const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_sample.csv`;
    const tableName = 'table_reconcile';
    await getOrCreateTable(page, tableName, filePath);
    const tableNameInput = page.getByLabel('Table name');
    await expect(tableNameInput).toBeVisible();
    await expect(tableNameInput).toHaveValue(tableName);
    console.log('Table opened.');

    /**
     * Open Reconciliation Dialog of a specific column and select a group service, and then a reconciler
     * * @param {import('@playwright/test').Page} page
     * @param {string} columnName
     * @param {string} groupService
     * @param {string} service
     */
    await reconciliationDialog(page, 'Match Country', 'Wikidata', 'Linking: Wikidata (Alligator)');
    /**
     * Configuration of the reconciler
     * * @param {import('@playwright/test').Page} page
     * @param {string[]} additionalColumns
     */
    await reconcilerConfig(page, []);
    await ui.comfirmComponentBtn('dialog').click();
    await expect(page.getByText('Learn more about annotation')).toBeVisible({ timeout: 10000000 });
    console.log('Column "Match Location" reconciled.');

    await ui.expandCellBtn.click();
    await expect(page.getByRole('link', { name: 'wd:Q183 (Germany)' }).first()).toBeVisible();
  });

  test('Reconcile Linking: Wikidata (OpenRefine)', async ({ page }) => {
    test.setTimeout(120000);
    const ui = getComponents(page);
    // Please provide your local base directory path below
    const baseDirectory = 'FILE_PATH';
    const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_sample.csv`;
    const tableName = 'table_reconcile';
    await getOrCreateTable(page, tableName, filePath);
    const tableNameInput = page.getByLabel('Table name');
    await expect(tableNameInput).toBeVisible();
    await expect(tableNameInput).toHaveValue(tableName);
    console.log('Table opened.');

    await reconciliationDialog(page, 'Match Country', 'Wikidata', 'Linking: Wikidata (OpenRefine)');
    await reconcilerConfig(page, undefined);
    await expect(page.getByText('Learn more about annotation')).toBeVisible({ timeout: 10000000 });
    console.log('Column "Match Location" reconciled.');

    await ui.expandCellBtn.click();
    await expect(page.getByRole('link', { name: 'wd:Q183 (Germany)' }).first()).toBeVisible();
  });

  test('Reconcile Geocoding: Geo Coordinates (GeoNames)', async ({ page }) => {
    test.setTimeout(120000);
    const ui = getComponents(page);
    // Please provide your local base directory path below
    const baseDirectory = 'FILE_PATH';
    const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_sample.csv`;
    const tableName = 'table_reconcile';
    await getOrCreateTable(page, tableName, filePath);
    const tableNameInput = page.getByLabel('Table name');
    await expect(tableNameInput).toBeVisible();
    await expect(tableNameInput).toHaveValue(tableName);
    console.log('Table opened.');

    await reconciliationDialog(page, 'Match Location', 'Geo Coordinates', 'Geocoding: Geo Coordinates (GeoNames)');
    await reconcilerConfig(page, ['Match Country']);
    await expect(page.getByText('Learn more about annotation')).toBeVisible({ timeout: 10000000 });
    await expect(page.getByText('geocodingGeonames')).toBeVisible();
    console.log('Column "Match Location" reconciled.');

    await ui.expandCellBtn.click();
    await expect(page.getByRole('link', { name: 'geoCoord:48.64683,9.45378' })).toBeVisible();
  });

  test('Reconcile Linking: GeoNames (GeoNames)', async ({ page }) => {
    test.setTimeout(120000);
    const ui = getComponents(page);
    // Please provide your local base directory path below
    const baseDirectory = 'FILE_PATH';
    const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_sample.csv`;
    const tableName = 'table_reconcile';
    await getOrCreateTable(page, tableName, filePath);
    const tableNameInput = page.getByLabel('Table name');
    await expect(tableNameInput).toBeVisible();
    await expect(tableNameInput).toHaveValue(tableName);
    console.log('Table opened.');

    await reconciliationDialog(page, 'Match Location', 'GeoNames', 'Linking: GeoNames (GeoNames)');
    await reconcilerConfig(page, ['Match Country']);
    await expect(page.getByText('Learn more about annotation')).toBeVisible({ timeout: 10000000 });
    await expect(page.getByText('geonames')).toBeVisible();
    console.log('Column "Match Location" reconciled.');

    await ui.expandCellBtn.click();
    await expect(page.getByRole('link', { name: 'geo:2890473 (Kirchheim unter' })).toBeVisible();
  });

  test('Reconcile Linking: In-Table Linking (Wikidata)', async ({ page }) => {
    test.setTimeout(120000);
    const ui = getComponents(page);
    // Please provide your local base directory path below
    const baseDirectory = 'FILE_PATH';
    const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_inTableLinking.json`;
    const tableName = 'table_inTableLinking';
    await getOrCreateTable(page, tableName, filePath);
    const tableNameInput = page.getByLabel('Table name');
    await expect(tableNameInput).toBeVisible();
    await expect(tableNameInput).toHaveValue(tableName);
    console.log('Table opened.');

    await reconciliationDialog(page, 'country', 'In-Table Linking', 'Linking: In-Table Linking');
    /**
     * Configuration of the In-Table reconciler
     * * @param {import('@playwright/test').Page} page
     * @param {string} prefix
     * @param {string} columnName
     */
    await reconcilerInTableConfig(page, 'wd (Wikidata)', 'wikidataId');
    await expect(page.getByText('Learn more about annotation')).toBeVisible({ timeout: 10000000 });
    await expect(page.getByText('inTableLinker')).toBeVisible();
    console.log('Column "country" reconciled.');

    await ui.expandCellBtn.click();
    await expect(page.getByRole('link', { name: 'wd:Q2807 (Madrid)' }).first()).toBeVisible();
  });

  test('Reconcile Linking: In-Table Linking (GeoNames)', async ({ page }) => {
    test.setTimeout(120000);
    const ui = getComponents(page);
    // Please provide your local base directory path below
    const baseDirectory = 'FILE_PATH';
    const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_inTableLinking.json`;
    const tableName = 'table_inTableLinking';
    await getOrCreateTable(page, tableName, filePath);
    const tableNameInput = page.getByLabel('Table name');
    await expect(tableNameInput).toBeVisible();
    await expect(tableNameInput).toHaveValue(tableName);
    console.log('Table opened.');

    await reconciliationDialog(page, 'country', 'In-Table Linking', 'Linking: In-Table Linking');
    await reconcilerInTableConfig(page, 'geo (GeoNames)', 'geonamesId');
    await expect(page.getByText('Learn more about annotation')).toBeVisible({ timeout: 10000000 });
    await expect(page.getByText('inTableLinker')).toBeVisible();
    console.log('Column "country" reconciled.');

    await ui.expandCellBtn.click();
    await expect(page.getByRole('link', { name: 'geo:3117735 (Madrid)' }).first()).toBeVisible();
  });

  test('Reconcile Linking: In-Table Linking (Geocoding GeoNames)', async ({ page }) => {
    test.setTimeout(120000);
    const ui = getComponents(page);
    // Please provide your local base directory path below
    const baseDirectory = 'FILE_PATH';
    const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_inTableLinking.json`;
    const tableName = 'table_inTableLinking';
    await getOrCreateTable(page, tableName, filePath);
    const tableNameInput = page.getByLabel('Table name');
    await expect(tableNameInput).toBeVisible();
    await expect(tableNameInput).toHaveValue(tableName);
    console.log('Table opened.');

    await reconciliationDialog(page, 'country', 'In-Table Linking', 'Linking: In-Table Linking');
    await reconcilerInTableConfig(page, 'geoCoord (geoCoding)', 'coordinates');
    await expect(page.getByText('Learn more about annotation')).toBeVisible({ timeout: 10000000 });
    await expect(page.getByText('inTableLinker')).toBeVisible();
    console.log('Column "country" reconciled.');

    await ui.expandCellBtn.click();
    await expect(page.getByRole('link', { name: 'geoCoord:40.41694444444445,-3.703333333333333 (Madrid)' }).first()).toBeVisible();
  });

  test('Reconcile Linking: In-Table Linking (Geocoding HERE)', async ({ page }) => {
    test.setTimeout(120000);
    const ui = getComponents(page);
    // Please provide your local base directory path below
    const baseDirectory = 'FILE_PATH';
    const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_inTableLinking.json`;
    const tableName = 'table_inTableLinking';
    await getOrCreateTable(page, tableName, filePath);
    const tableNameInput = page.getByLabel('Table name');
    await expect(tableNameInput).toBeVisible();
    await expect(tableNameInput).toHaveValue(tableName);
    console.log('Table opened.');

    await reconciliationDialog(page, 'country', 'In-Table Linking', 'Linking: In-Table Linking');
    await reconcilerInTableConfig(page, 'georss (geoCoding)', 'coordinates');
    await expect(page.getByText('Learn more about annotation')).toBeVisible({ timeout: 10000000 });
    await expect(page.getByText('inTableLinker')).toBeVisible();
    console.log('Column "country" reconciled.');

    await ui.expandCellBtn.click();
    await expect(page.getByRole('link', { name: 'georss:40.41694444444445,-3.703333333333333 (Madrid)' }).first()).toBeVisible();
  });
});

test('Reconcile Geocoding: Geo Coordinates (HERE)', async ({ page }) => {
  test.setTimeout(120000);
  const urlChronos = 'http://vm.chronos.disco.unimib.it:3001/';
  const datasetName = 'Evaluation';
  const tableName = 'table_sample';
  // Please provide your local base directory path below
  const baseDirectory = 'FILE_PATH';
  const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_sample.csv`;
  //Please provide your username and password
  const username = 'USERNAME';
  const password = 'PASSWORD';

  await login(page, urlChronos, username, password);
  await getOrCreateDataset(page, datasetName);
  await expect(page.getByRole('heading', { name: datasetName })).toBeVisible();
  console.log('Dataset "Dataset_test" opened.');

  await getOrCreateTable(page, tableName, filePath);
  await expect(page.getByRole('textbox').first()).toBeVisible();
  console.log('Table opened.');

  await reconciliationDialog(page, 'Match Location', 'Geo Coordinates', 'Geocoding: Geo Coordinates (HERE)');
  await reconcilerConfig(page, ['Match Country']);
  await expect(page.getByText('Learn more about annotation')).toBeVisible({ timeout: 10000000 });
  await expect(page.getByText('geocodingHere')).toBeVisible();
  console.log('Column "Match Location" reconciled.');

  await page.locator('div:nth-child(2) > div:nth-child(3) > .MuiButtonBase-root').click();
  await expect(page.getByRole('link', { name: 'georss:48.64607,9.45235' })).toBeVisible();
});
