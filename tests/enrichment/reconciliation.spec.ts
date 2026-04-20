import { test, expect } from '@playwright/test';
import { login, getOrCreateDataset, getOrCreateTable } from '../utils/setup.utils';

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
    // Please provide your local base directory path below
    const baseDirectory = 'FILE_PATH';
    const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_sample.csv`;
    const tableName = 'table_reconcile';
    await getOrCreateTable(page, tableName, filePath);
    const tableNameInput = page.getByLabel('Table name');
    await expect(tableNameInput).toBeVisible();
    await expect(tableNameInput).toHaveValue(tableName);
    console.log('Table opened.');

    const columnCountry = page.getByRole('columnheader', { name: 'Match Country' });
    const reconcileBtn = page.getByRole('button', { name: 'Reconcile', exact: true });
    const selectService = page.getByText('Choose a reconciliation service...');

    await columnCountry.click();
    console.log('Column "Match Country" selected.');

    await expect(reconcileBtn).toBeEnabled();
    await reconcileBtn.click();

    await page.getByText('Choose a service group...').click();
    await page.getByRole('option', { name: 'Wikidata', exact: true }).click();
    await expect(selectService).toBeEnabled();
    await selectService.click();
    await page.getByRole('option', { name: 'Linking: Wikidata (Alligator)', exact: true }).click();
    await expect(page.getByText('A general purpose reconciliation service using Alligator')).toBeVisible();
    console.log('Linking: Wikidata (Alligator) selected.');

    await page.getByRole('dialog').getByRole('button', { name: 'Confirm' }).click();
    console.log('Reconciliation in process.');

    await expect(page.getByText('Learn more about annotation')).toBeVisible({ timeout: 10000000 });
    await expect(page.getByText('wikidataAlligator')).toBeVisible();
    console.log('Column "Match Location" reconciled.');

    await page.getByRole('button', { name: 'expand-cell' }).click();
    await expect(page.getByRole('link', { name: 'wd:Q183 (Germany)' }).first()).toBeVisible();
  });

  test('Reconcile Linking: Wikidata (OpenRefine)', async ({ page }) => {
    test.setTimeout(120000);
    // Please provide your local base directory path below
    const baseDirectory = 'FILE_PATH';
    const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_sample.csv`;
    const tableName = 'table_reconcile';
    await getOrCreateTable(page, tableName, filePath);
    const tableNameInput = page.getByLabel('Table name');
    await expect(tableNameInput).toBeVisible();
    await expect(tableNameInput).toHaveValue(tableName);
    console.log('Table opened.');

    const columnCountry = page.getByRole('columnheader', { name: 'Match Country' });
    const reconcileBtn = page.getByRole('button', { name: 'Reconcile', exact: true });
    const selectService = page.getByText('Choose a reconciliation service...');

    await columnCountry.click();
    console.log('Column "Match Country" selected.');

    await expect(reconcileBtn).toBeEnabled();
    await reconcileBtn.click();

    await page.getByText('Choose a service group...').click();
    await page.getByRole('option', { name: 'Wikidata', exact: true }).click();
    await expect(selectService).toBeEnabled();
    await selectService.click();
    await page.getByRole('option', { name: 'Linking: Wikidata (OpenRefine)', exact: true }).click();
    await expect(page.getByText('A general purpose reconciliation service using the OpenRefine service')).toBeVisible();
    console.log('Linking: Wikidata (OpenRefine) selected.');

    await page.getByRole('dialog').getByRole('button', { name: 'Confirm' }).click();
    console.log('Reconciliation in process.');

    await expect(page.getByText('Learn more about annotation')).toBeVisible({ timeout: 10000000 });
    console.log('Column "Match Location" reconciled.');

    await page.getByRole('button', { name: 'expand-cell' }).click();
    await expect(page.getByRole('link', { name: 'wd:Q183 (Germany)' }).first()).toBeVisible();
  });

  test('Reconcile Geocoding: Geo Coordinates (GeoNames)', async ({ page }) => {
    test.setTimeout(120000);
    // Please provide your local base directory path below
    const baseDirectory = 'FILE_PATH';
    const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_sample.csv`;
    const tableName = 'table_reconcile';
    await getOrCreateTable(page, tableName, filePath);
    const tableNameInput = page.getByLabel('Table name');
    await expect(tableNameInput).toBeVisible();
    await expect(tableNameInput).toHaveValue(tableName);
    console.log('Table opened.');

    const columnMatchLoc = page.getByRole('columnheader', { name: 'Match Location' });
    const reconcileBtn = page.getByRole('button', { name: 'Reconcile', exact: true });
    const selectService = page.getByText('Choose a reconciliation service...');

    await columnMatchLoc.click();
    console.log('Column "Match Location" selected.');

    await expect(reconcileBtn).toBeEnabled();
    await reconcileBtn.click();

    await page.getByText('Choose a service group...').click();
    await page.getByRole('option', { name: 'Geo Coordinates', exact: true }).click();
    await expect(selectService).toBeEnabled();
    await selectService.click();
    await page.getByRole('option', { name: 'Geocoding: Geo Coordinates (GeoNames)', exact: true }).click();
    await expect(page.getByText('A geographic reconciliation')).toBeVisible();
    console.log('Geocoding: Geo Coordinates (GeoNames) selected.');

    const contextSelect = page.locator('#mui-component-select-additionalColumns');
    await contextSelect.click();
    await page.getByRole('option', { name: 'Match Country', exact: true }).click();
    await page.getByRole('listbox').getByRole('button', { name: 'Confirm' }).click();
    console.log('Column "Match Country" selected as additional column.');

    await expect(page.getByRole('combobox', { name: 'Match Country' })).toBeVisible();
    await page.getByRole('dialog').getByRole('button', { name: 'Confirm' }).click();
    console.log('Reconciliation in process.');

    await expect(page.getByText('Learn more about annotation')).toBeVisible({ timeout: 10000000 });
    await expect(page.getByText('geocodingGeonames')).toBeVisible();
    console.log('Column "Match Location" reconciled.');

    await page.getByRole('button', { name: 'expand-cell' }).click();
    await expect(page.getByRole('link', { name: 'geoCoord:48.64683,9.45378' })).toBeVisible();
  });

  test('Reconcile Linking: GeoNames (GeoNames)', async ({ page }) => {
    test.setTimeout(120000);
    // Please provide your local base directory path below
    const baseDirectory = 'FILE_PATH';
    const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_sample.csv`;
    const tableName = 'table_reconcile';
    await getOrCreateTable(page, tableName, filePath);
    const tableNameInput = page.getByLabel('Table name');
    await expect(tableNameInput).toBeVisible();
    await expect(tableNameInput).toHaveValue(tableName);
    console.log('Table opened.');

    const columnMatchLoc = page.getByRole('columnheader', { name: 'Match Location' });
    const reconcileBtn = page.getByRole('button', { name: 'Reconcile', exact: true });
    const selectService = page.getByText('Choose a reconciliation service...');

    await columnMatchLoc.click();
    console.log('Column "Match Location" selected.');

    await expect(reconcileBtn).toBeEnabled();
    await reconcileBtn.click();

    await page.getByText('Choose a service group...').click();
    await page.getByRole('option', { name: 'GeoNames', exact: true }).click();
    await expect(selectService).toBeEnabled();
    await selectService.click();
    await page.getByRole('option', { name: 'Linking: GeoNames (GeoNames)', exact: true }).click();
    await expect(page.getByText('A geographic reconciliation')).toBeVisible();
    console.log('Linking: GeoNames (GeoNames) selected.');

    const contextSelect = page.locator('#mui-component-select-additionalColumns');
    await contextSelect.click();
    await page.getByRole('option', { name: 'Match Country', exact: true }).click();
    await page.getByRole('listbox').getByRole('button', { name: 'Confirm' }).click();
    console.log('Column "Match Country" selected as additional column.');

    await expect(page.getByRole('combobox', { name: 'Match Country' })).toBeVisible();
    await page.getByRole('dialog').getByRole('button', { name: 'Confirm' }).click();
    console.log('Reconciliation in process.');

    await expect(page.getByText('Learn more about annotation')).toBeVisible({ timeout: 10000000 });
    await expect(page.getByText('geonames')).toBeVisible();
    console.log('Column "Match Location" reconciled.');

    await page.getByRole('button', { name: 'expand-cell' }).click();
    await expect(page.getByRole('link', { name: 'geo:2890473 (Kirchheim unter' })).toBeVisible();
  });

  test('Reconcile Linking: In-Table Linking (Wikidata)', async ({ page }) => {
    test.setTimeout(120000);
    // Please provide your local base directory path below
    const baseDirectory = 'FILE_PATH';
    const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_inTableLinking.json`;
    const tableName = 'table_inTableLinking';
    await getOrCreateTable(page, tableName, filePath);
    const tableNameInput = page.getByLabel('Table name');
    await expect(tableNameInput).toBeVisible();
    await expect(tableNameInput).toHaveValue(tableName);
    console.log('Table opened.');

    const columnCountry = page.getByRole('columnheader', { name: 'country' });
    const reconcileBtn = page.getByRole('button', { name: 'Reconcile', exact: true });
    const selectService = page.getByText('Choose a reconciliation service...');

    await columnCountry.click();
    console.log('Column "country" selected.');

    await expect(reconcileBtn).toBeEnabled();
    await reconcileBtn.click();

    await page.getByText('Choose a service group...').click();
    await page.getByRole('option', { name: 'In-Table Linking', exact: true }).click();
    await expect(selectService).toBeEnabled();
    await selectService.click();
    await page.getByRole('option', { name: 'Linking: In-Table Linking', exact: true }).click();
    await expect(page.getByText('A local reconciliation service that links values')).toBeVisible();
    console.log('Linking: In-Table Linking selected.');

    await page.locator('#mui-component-select-prefix').click();
    await page.getByRole('option', { name: 'wd (Wikidata)', exact: true }).click();
    await expect(page.getByRole('combobox', { name: 'wd (Wikidata)' })).toBeVisible();
    console.log('"wd" selected as prefix.');

    await page.locator('#mui-component-select-columnToReconcile').click();
    await page.getByRole('option', { name: 'wikidataId', exact: true }).click();
    await expect(page.getByRole('combobox', { name: 'wikidataId' })).toBeVisible();
    console.log('Column "wikidataId" selected as refence column.');

    await page.getByRole('dialog').getByRole('button', { name: 'Confirm' }).click();
    console.log('Reconciliation in process.');

    await expect(page.getByText('Learn more about annotation')).toBeVisible({ timeout: 10000000 });
    await expect(page.getByText('inTableLinker')).toBeVisible();
    console.log('Column "country" reconciled.');

    await page.getByRole('button', { name: 'expand-cell' }).click();
    await expect(page.getByRole('link', { name: 'wd:Q2807 (Madrid)' }).first()).toBeVisible();
  });

  test('Reconcile Linking: In-Table Linking (GeoNames)', async ({ page }) => {
    test.setTimeout(120000);
    // Please provide your local base directory path below
    const baseDirectory = 'FILE_PATH';
    const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_inTableLinking.json`;
    const tableName = 'table_inTableLinking';
    await getOrCreateTable(page, tableName, filePath);
    const tableNameInput = page.getByLabel('Table name');
    await expect(tableNameInput).toBeVisible();
    await expect(tableNameInput).toHaveValue(tableName);
    console.log('Table opened.');

    const columnCountry = page.getByRole('columnheader', { name: 'country' });
    const reconcileBtn = page.getByRole('button', { name: 'Reconcile', exact: true });
    const selectService = page.getByText('Choose a reconciliation service...');

    await columnCountry.click();
    console.log('Column "country" selected.');

    await expect(reconcileBtn).toBeEnabled();
    await reconcileBtn.click();

    await page.getByText('Choose a service group...').click();
    await page.getByRole('option', { name: 'In-Table Linking', exact: true }).click();
    await expect(selectService).toBeEnabled();
    await selectService.click();
    await page.getByRole('option', { name: 'Linking: In-Table Linking', exact: true }).click();
    await expect(page.getByText('A local reconciliation service that links values')).toBeVisible();
    console.log('Linking: In-Table Linking selected.');

    await page.locator('#mui-component-select-prefix').click();
    await page.getByRole('option', { name: 'geo (GeoNames)', exact: true }).click();
    await expect(page.getByRole('combobox', { name: 'geo (GeoNames)' })).toBeVisible();
    console.log('"geo" selected as prefix.');

    await page.locator('#mui-component-select-columnToReconcile').click();
    await page.getByRole('option', { name: 'geonamesId', exact: true }).click();
    await expect(page.getByRole('combobox', { name: 'geonamesId' })).toBeVisible();
    console.log('Column "geonamesId" selected as refence column.');

    await page.getByRole('dialog').getByRole('button', { name: 'Confirm' }).click();
    console.log('Reconciliation in process.');

    await expect(page.getByText('Learn more about annotation')).toBeVisible({ timeout: 10000000 });
    await expect(page.getByText('inTableLinker')).toBeVisible();
    console.log('Column "country" reconciled.');

    await page.getByRole('button', { name: 'expand-cell' }).click();
    await expect(page.getByRole('link', { name: 'geo:3117735 (Madrid)' }).first()).toBeVisible();
  });

  test('Reconcile Linking: In-Table Linking (Geocoding GeoNames)', async ({ page }) => {
    test.setTimeout(120000);
    // Please provide your local base directory path below
    const baseDirectory = 'FILE_PATH';
    const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_inTableLinking.json`;
    const tableName = 'table_inTableLinking';
    await getOrCreateTable(page, tableName, filePath);
    const tableNameInput = page.getByLabel('Table name');
    await expect(tableNameInput).toBeVisible();
    await expect(tableNameInput).toHaveValue(tableName);
    console.log('Table opened.');

    const columnCountry = page.getByRole('columnheader', { name: 'country' });
    const reconcileBtn = page.getByRole('button', { name: 'Reconcile', exact: true });
    const selectService = page.getByText('Choose a reconciliation service...');

    await columnCountry.click();
    console.log('Column "country" selected.');

    await expect(reconcileBtn).toBeEnabled();
    await reconcileBtn.click();

    await page.getByText('Choose a service group...').click();
    await page.getByRole('option', { name: 'In-Table Linking', exact: true }).click();
    await expect(selectService).toBeEnabled();
    await selectService.click();
    await page.getByRole('option', { name: 'Linking: In-Table Linking', exact: true }).click();
    await expect(page.getByText('A local reconciliation service that links values')).toBeVisible();
    console.log('Linking: In-Table Linking selected.');

    await page.locator('#mui-component-select-prefix').click();
    await page.getByRole('option', { name: 'geoCoord (geoCoding)', exact: true }).click();
    await expect(page.getByRole('combobox', { name: 'geoCoord (geoCoding)' })).toBeVisible();
    console.log('"geoCoord" selected as prefix.');
    await page.locator('#mui-component-select-columnToReconcile').click();
    await page.getByRole('option', { name: 'coordinates', exact: true }).click();
    await expect(page.getByRole('combobox', { name: 'coordinates' })).toBeVisible();
    console.log('Column "coordinates" selected as refence column.');

    await page.getByRole('dialog').getByRole('button', { name: 'Confirm' }).click();
    console.log('Reconciliation in process.');

    await expect(page.getByText('Learn more about annotation')).toBeVisible({ timeout: 10000000 });
    await expect(page.getByText('inTableLinker')).toBeVisible();
    console.log('Column "country" reconciled.');

    await page.getByRole('button', { name: 'expand-cell' }).click();
    await expect(page.getByRole('link', { name: 'geoCoord:40.41694444444445,-3.703333333333333 (Madrid)' }).first()).toBeVisible();
  });

  test('Reconcile Linking: In-Table Linking (Geocoding HERE)', async ({ page }) => {
    test.setTimeout(120000);
    // Please provide your local base directory path below
    const baseDirectory = 'FILE_PATH';
    const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_inTableLinking.json`;
    const tableName = 'table_inTableLinking';
    await getOrCreateTable(page, tableName, filePath);
    const tableNameInput = page.getByLabel('Table name');
    await expect(tableNameInput).toBeVisible();
    await expect(tableNameInput).toHaveValue(tableName);
    console.log('Table opened.');

    const columnCountry = page.getByRole('columnheader', { name: 'country' });
    const reconcileBtn = page.getByRole('button', { name: 'Reconcile', exact: true });
    const selectService = page.getByText('Choose a reconciliation service...');

    await columnCountry.click();
    console.log('Column "country" selected.');

    await expect(reconcileBtn).toBeEnabled();
    await reconcileBtn.click();

    await page.getByText('Choose a service group...').click();
    await page.getByRole('option', { name: 'In-Table Linking', exact: true }).click();
    await expect(selectService).toBeEnabled();
    await selectService.click();
    await page.getByRole('option', { name: 'Linking: In-Table Linking', exact: true }).click();
    await expect(page.getByText('A local reconciliation service that links values')).toBeVisible();
    console.log('Linking: In-Table Linking selected.');

    await page.locator('#mui-component-select-prefix').click();
    await page.getByRole('option', { name: 'georss (geoCoding)', exact: true }).click();
    await expect(page.getByRole('combobox', { name: 'georss (geoCoding)' })).toBeVisible();
    console.log('"georss" selected as prefix.');
    await page.locator('#mui-component-select-columnToReconcile').click();
    await page.getByRole('option', { name: 'coordinates', exact: true }).click();
    await expect(page.getByRole('combobox', { name: 'coordinates' })).toBeVisible();
    console.log('Column "coordinates" selected as refence column.');

    await page.getByRole('dialog').getByRole('button', { name: 'Confirm' }).click();
    console.log('Reconciliation in process.');

    await expect(page.getByText('Learn more about annotation')).toBeVisible({ timeout: 10000000 });
    await expect(page.getByText('inTableLinker')).toBeVisible();
    console.log('Column "country" reconciled.');

    await page.getByRole('button', { name: 'expand-cell' }).click();
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

  const columnMatchLoc = page.getByRole('columnheader', { name: 'Match Location' });
  const reconcileBtn = page.getByRole('button', { name: 'Reconcile', exact: true });
  const selectService = page.getByLabel('Reconciliation', { exact: true }).getByText('Choose a reconciliation service...');

  await columnMatchLoc.click();
  console.log('Column "Match Location" selected.');

  await expect(reconcileBtn).toBeEnabled();
  await reconcileBtn.click();

  await page.getByText('Choose a service group...').click();
  await page.getByRole('option', { name: 'Geo Coordinates', exact: true }).click();
  await expect(selectService).toBeEnabled();
  await selectService.click();
  await page.getByRole('option', { name: 'Geocoding: Geo Coordinates (HERE)', exact: true }).click();
  await expect(page.getByText('A geographic reconciliation')).toBeVisible();
  console.log('Geocoding: Geo Coordinates (HERE) selected.');

  const contextSelect = page.locator('#mui-component-select-additionalColumns');
  await contextSelect.click();
  await page.getByRole('option', { name: 'Match Country', exact: true }).click();
  await page.getByRole('listbox').getByRole('button', { name: 'Confirm' }).click();
  console.log('Column "Match Country" selected as additional column.');

  await expect(page.getByRole('combobox', { name: 'Match Country' })).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'Confirm' }).click();
  console.log('Reconciliation in process.');

  await expect(page.getByText('Learn more about annotation')).toBeVisible({ timeout: 10000000 });
  await expect(page.getByText('geocodingHere')).toBeVisible();
  console.log('Column "Match Location" reconciled.');

  await page.locator('div:nth-child(2) > div:nth-child(3) > .MuiButtonBase-root').click();
  await expect(page.getByRole('link', { name: 'georss:48.64607,9.45235' })).toBeVisible();
});
