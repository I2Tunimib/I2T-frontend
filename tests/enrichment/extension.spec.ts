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

  test('Extension: Annotation Properties', async ({ page }) => {
    test.setTimeout(120000);
    // Please provide your local base directory path below
    const baseDirectory = 'FILE_PATH';
    const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_extension.json`;
    const tableName = 'table_extension';
    await getOrCreateTable(page, tableName, filePath);
    const tableNameInput = page.getByLabel('Table name');
    await expect(tableNameInput).toBeVisible();
    await expect(tableNameInput).toHaveValue(tableName);
    console.log('Table opened.');

    const columnMatchCountry = page.getByRole('columnheader', { name: 'Match Country' });
    const extendBtn = page.getByRole('button', { name: 'Extend', exact: true });
    const selectService = page.getByText('Choose an extension service...');

    await columnMatchCountry.click();
    console.log('Column "Match Country" selected.');

    await expect(extendBtn).toBeEnabled();
    await extendBtn.click();

    await selectService.click();
    await page.getByRole('option', { name: 'Annotation properties', exact: true }).click();
    await expect(page.getByText('An extender that consolidates existing linking annotations')).toBeVisible();
    console.log('Annotation properties selected.');

    await page.getByRole('checkbox', { name: 'ID of entities' }).check();
    await page.getByRole('checkbox', { name: 'Name of entities' }).check();
    await page.getByRole('dialog').getByRole('button', { name: 'Confirm' }).click();
    console.log('Extension in process.');

    await expect(page.getByText('columns added')).toBeVisible();
    console.log('Extension successfully.');
  });

  test('Extension: Annotation Properties (Wikidata)', async ({ page }) => {
    test.setTimeout(120000);
    // Please provide your local base directory path below
    const baseDirectory = 'FILE_PATH';
    const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_extension.json`;
    const tableName = 'table_extension';
    await getOrCreateTable(page, tableName, filePath);
    const tableNameInput = page.getByLabel('Table name');
    await expect(tableNameInput).toBeVisible();
    await expect(tableNameInput).toHaveValue(tableName);
    console.log('Table opened.');

    const columnFootballClub = page.getByRole('columnheader', { name: 'Football Club' });
    const extendBtn = page.getByRole('button', { name: 'Extend', exact: true });
    const selectService = page.getByText('Choose an extension service...');

    await columnFootballClub.click();
    console.log('Column "Football Club" selected.');

    await expect(extendBtn).toBeEnabled();
    await extendBtn.click();
    await selectService.click();
    await page.getByRole('option', { name: 'Annotation properties (Wikidata)', exact: true }).click();
    await expect(page.getByText('An extender that extracts Wikidata metadata')).toBeVisible();
    console.log('Annotation properties (Wikidata) selected.');

    await page.getByRole('checkbox', { name: 'ID of entities' }).check();
    await page.getByRole('checkbox', { name: 'URL of entities' }).check();
    await page.getByRole('checkbox', { name: 'Name of entities' }).check();
    await page.getByRole('checkbox', { name: 'Description of entities' }).check();
    await page.getByRole('dialog').getByRole('button', { name: 'Confirm' }).click();
    console.log('Extension in process.');

    await expect(page.getByText('columns added')).toBeVisible();
    console.log('Extension successfully.');
  });

  test('Extension: Geo Properties (Wikidata)', async ({ page }) => {
    test.setTimeout(120000);
    // Please provide your local base directory path below
    const baseDirectory = 'FILE_PATH';
    const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_extension.json`;
    const tableName = 'table_extension';
    await getOrCreateTable(page, tableName, filePath);
    const tableNameInput = page.getByLabel('Table name');
    await expect(tableNameInput).toBeVisible();
    await expect(tableNameInput).toHaveValue(tableName);
    console.log('Table opened.');

    const columnMatchLocation = page.getByRole('columnheader', { name: 'Match Location' });
    const reconcileBtn = page.getByRole('button', { name: 'Reconcile', exact: true });
    const extendBtn = page.getByRole('button', { name: 'Extend', exact: true });
    const selectServiceRec = page.getByText('Choose a reconciliation service...');
    const selectServiceExt = page.getByText('Choose an extension service...');

    await columnMatchLocation.click();
    console.log('Column "Match Location" selected.');

    await reconcileBtn.click();
    await page.getByText('Choose a service group...').click();
    await page.getByRole('option', { name: 'Wikidata', exact: true }).click();
    await expect(selectServiceRec).toBeEnabled();
    await selectServiceRec.click();
    await page.getByRole('option', { name: 'Linking: Wikidata (Alligator)', exact: true }).click();
    await expect(page.getByText('A general purpose reconciliation service using Alligator')).toBeVisible();
    console.log('Linking: Wikidata (Alligator) selected.');

    const contextSelect = page.locator('#mui-component-select-additionalColumns');
    await contextSelect.click();
    await page.getByRole('option', { name: 'Match Country', exact: true }).click();
    await page.getByRole('listbox').getByRole('button', { name: 'Confirm' }).click();
    console.log('Column "Match Country" selected as additional column.');

    await expect(page.getByRole('combobox', { name: 'Match Country' })).toBeVisible();
    await page.getByRole('dialog').getByRole('button', { name: 'Confirm' }).click();
    console.log('Reconciliation in process.');

    await expect(page.getByText('Learn more about annotation')).toBeVisible({ timeout: 100000 });
    console.log('Column "Match Location" reconciled.');

    await page.locator('tr:nth-child(9) > .css-1lvn3g6 > ._Container_1mibn_1 > ._CellLabel_1mibn_7 > .MuiButtonBase-root').click();
    await page.locator('.css-kpopnj > div > .MuiButtonBase-root > .PrivateSwitchBase-input').first().check();
    await page.getByRole('button', { name: 'Confirm and Propagate' }).click();
    await page.getByRole('button', { name: 'Confirm' }).click();

    await columnMatchLocation.click();
    await expect(extendBtn).toBeEnabled();
    await extendBtn.click();
    await selectServiceExt.click();
    await page.getByRole('option', { name: 'Geo Properties (Wikidata)', exact: true }).click();
    await expect(page.getByText('An extender that retrieves geographic properties from Wikidata')).toBeVisible();
    console.log('Geo Properties (Wikidata) selected.');

    await page.getByRole('checkbox', { name: 'Coordinate' }).check();
    await page.getByRole('checkbox', { name: 'Time zone' }).check();
    await page.getByRole('checkbox', { name: 'Postal code' }).check();
    await page.getByRole('dialog').getByRole('button', { name: 'Confirm' }).click();
    console.log('Extension in process.');

    await expect(page.getByText('columns added')).toBeVisible({ timeout: 100000 });
    await expect(page.locator('div').filter({ hasText: '48.648333333333,9.' }).nth(5)).toBeVisible();
    await expect(page.locator('div').filter({ hasText: 'null' }).nth(5)).not.toBeVisible();
    await expect(page.locator('div').filter({ hasText: 'null' }).nth(4)).not.toBeVisible();
    console.log('Extension successfully.');
  });

  test('Extension: Meteo Properties (OpenMeteo) - Daily', async ({ page }) => {
    test.setTimeout(120000);
    // Please provide your local base directory path below
    const baseDirectory = 'FILE_PATH';
    const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_extension.json`;
    const tableName = 'table_extension';
    await getOrCreateTable(page, tableName, filePath);
    const tableNameInput = page.getByLabel('Table name');
    await expect(tableNameInput).toBeVisible();
    await expect(tableNameInput).toHaveValue(tableName);
    console.log('Table opened.');

    const columnMatchLoc = page.getByRole('columnheader', { name: 'Match Location' });
    const extendBtn = page.getByRole('button', { name: 'Extend', exact: true });
    const selectService = page.getByText('Choose an extension service...');

    await columnMatchLoc.click();
    console.log('Column "Match Location" selected.');

    await expect(extendBtn).toBeEnabled();
    await extendBtn.click();
    await selectService.click();
    await page.getByRole('option', { name: 'Meteo Properties (OpenMeteo)', exact: true }).click();
    await expect(page.getByText('An extender that adds weather properties for the geographic points')).toBeVisible();
    console.log('Meteo Properties (OpenMeteo) selected.');

    const selectDate = page.locator('#mui-component-select-dates');
    await selectDate.click();
    await page.getByRole('option', { name: 'Match Date', exact: true }).click();
    console.log('Column "Match Date" selected as dates column.');

    await expect(page.getByRole('combobox', { name: 'Match Date' })).toBeVisible();

    await page.getByRole('radio', { name: 'Daily' }).check();
    await page.getByRole('checkbox', { name: 'Number of seconds of daylight' }).check();
    await page.getByRole('checkbox', { name: 'Sun rise and set times UTC' }).check();
    await page.getByRole('checkbox', { name: 'Maximum daily temperature' }).check();
    await page.getByRole('checkbox', { name: 'Minimum daily temperature' }).check();
    await page.getByRole('checkbox', { name: 'Sum of daily precipitation' }).check();
    await page.getByRole('checkbox', { name: 'Number of hours with rain' }).check();
    await page.getByRole('checkbox', { name: 'Use comma as decimal' }).check();

    await page.getByRole('dialog').getByRole('button', { name: 'Confirm' }).click();
    console.log('Extension in process.');

    await expect(page.getByText('columns added')).toBeVisible({ timeout: 100000 });
    console.log('Extension successfully.');
  });

  test('Extension: Meteo Properties (OpenMeteo) - Hourly, Error', async ({ page }) => {
    test.setTimeout(120000);
    // Please provide your local base directory path below
    const baseDirectory = 'FILE_PATH';
    const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_extension.json`;
    const tableName = 'table_extension';
    await getOrCreateTable(page, tableName, filePath);
    const tableNameInput = page.getByLabel('Table name');
    await expect(tableNameInput).toBeVisible();
    await expect(tableNameInput).toHaveValue(tableName);
    console.log('Table opened.');

    const columnMatchLoc = page.getByRole('columnheader', { name: 'Match Location' });
    const extendBtn = page.getByRole('button', { name: 'Extend', exact: true });
    const selectService = page.getByText('Choose an extension service...');

    await columnMatchLoc.click();
    console.log('Column "Match Location" selected.');

    await expect(extendBtn).toBeEnabled();
    await extendBtn.click();
    await selectService.click();
    await page.getByRole('option', { name: 'Meteo Properties (OpenMeteo)', exact: true }).click();
    await expect(page.getByText('An extender that adds weather properties for the geographic points')).toBeVisible();
    console.log('Meteo Properties (OpenMeteo) selected.');

    const selectDate = page.locator('#mui-component-select-dates');
    await selectDate.click();
    await page.getByRole('option', { name: 'Match Date', exact: true }).click();
    console.log('Column "Match Date" selected as dates column.');

    await expect(page.getByRole('combobox', { name: 'Match Date' })).toBeVisible();

    await page.getByRole('radio', { name: 'Hourly' }).check();
    await page.getByRole('checkbox', { name: 'Temperature' }).check();
    await page.getByRole('checkbox', { name: 'Relative humidity' }).check();
    await page.getByRole('checkbox', { name: 'Precipitation' }).check();

    await page.getByRole('dialog').getByRole('button', { name: 'Confirm' }).click();
    console.log('Extension in process.');

    await expect(page.getByText('Invalid column for hourly params')).toBeVisible({ timeout: 100000 });
    console.log('Extension successfully.');
  });

  test('Extension: Meteo Properties (OpenMeteo) - Hourly', async ({ page }) => {
    test.setTimeout(120000);
    // Please provide your local base directory path below
    const baseDirectory = 'FILE_PATH';
    const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_extension.json`;
    const tableName = 'table_extension';
    await getOrCreateTable(page, tableName, filePath);
    const tableNameInput = page.getByLabel('Table name');
    await expect(tableNameInput).toBeVisible();
    await expect(tableNameInput).toHaveValue(tableName);
    console.log('Table opened.');

    const columnMatchLoc = page.getByRole('columnheader', { name: 'Match Location' });
    const columnMatchDate = page.getByRole('columnheader', { name: 'Match Date' });
    const confirmBtn = page.getByRole('button', { name: 'Confirm', exact: true });
    const extendBtn = page.getByRole('button', { name: 'Extend', exact: true });
    const modifyBtn = page.getByRole('button', { name: 'Modify', exact: true });
    const selectServiceExt = page.getByText('Choose an extension service...');
    const selectServiceMod = page.getByText('Choose a modification service...');

    await columnMatchDate.click();
    console.log('Column "Match Date" selected.');

    await expect(modifyBtn).toBeEnabled();
    await modifyBtn.click();
    await selectServiceMod.click();
    await page.getByRole('option', { name: 'Date Formatter', exact: true }).click();
    await expect(page.getByText('A transformation function that converts date-like values in the selected')).toBeVisible();
    await page.getByRole('radio', { name: 'ISO' }).check();

    await page.locator('#mui-component-select-columnToJoin').click();
    await page.getByRole('option', { name: 'Match Time' }).click();
    console.log('Column "Match Time" selected to join.');

    await page.locator('#mui-component-select-detailLevel').click();
    await page.getByRole('option', { name: 'Hour and minutes (yyyy-MM-dd\'T\'HH:mm)' }).click();
    console.log('"Hour and minutes (yyyy-MM-dd\'T\'HH:mm)" selected as level of detail.');

    await page.getByRole('radio', { name: 'Create a new column' }).check();
    await confirmBtn.click();
    await expect(page.getByText('column added')).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Match Date_Match Time' })).toBeVisible();
    console.log('Date Formatter successfully.');

    await columnMatchLoc.click();
    console.log('Column "Match Location" selected.');

    await expect(extendBtn).toBeEnabled();
    await extendBtn.click();
    await selectServiceExt.click();
    await page.getByRole('option', { name: 'Meteo Properties (OpenMeteo)', exact: true }).click();
    await expect(page.getByText('An extender that adds weather properties for the geographic points')).toBeVisible();
    console.log('Meteo Properties (OpenMeteo) selected.');

    await page.locator('#mui-component-select-dates').click();
    await page.getByRole('option', { name: 'Match Date_Match Time', exact: true }).click();
    console.log('Column "Match Date_Match Time" selected as dates column.');

    await expect(page.getByRole('combobox', { name: 'Match Date_Match Time' })).toBeVisible();

    await page.getByRole('radio', { name: 'Hourly' }).check();
    await page.getByRole('checkbox', { name: 'Temperature' }).check();
    await page.getByRole('checkbox', { name: 'Relative humidity' }).check();
    await page.getByRole('checkbox', { name: 'Precipitation' }).check();

    await page.getByRole('dialog').getByRole('button', { name: 'Confirm' }).click();
    console.log('Extension in process.');

    await expect(page.getByText('columns added')).toBeVisible({ timeout: 100000 });
    console.log('Extension successfully.');
  });

  test('Extension: SPARQL (Wikidata)', async ({ page }) => {
    test.setTimeout(120000);
    // Please provide your local base directory path below
    const baseDirectory = 'FILE_PATH';
    const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_extension.json`;
    const tableName = 'table_extension';
    await getOrCreateTable(page, tableName, filePath);
    const tableNameInput = page.getByLabel('Table name');
    await expect(tableNameInput).toBeVisible();
    await expect(tableNameInput).toHaveValue(tableName);
    console.log('Table opened.');

    const columnManager = page.getByRole('columnheader', { name: 'Manager' });
    const extendBtn = page.getByRole('button', { name: 'Extend', exact: true });
    const selectService = page.getByText('Choose an extension service...');

    await columnManager.click();
    console.log('Column "Manager" selected.');

    await expect(extendBtn).toBeEnabled();
    await extendBtn.click();
    await selectService.click();
    await page.getByRole('option', { name: 'SPARQL (Wikidata)', exact: true }).click();
    await expect(page.getByText('An extender that executes SPARQL queries on Wikidata')).toBeVisible();
    console.log('SPARQL (Wikidata) selected.');

    await page.getByRole('textbox', { name: '*variables* for the query' }).click();
    await page.getByRole('textbox', { name: '*variables* for the query' }).fill('?positionLabel');
    await page.getByRole('textbox', { name: '*body* of the query:' }).click();
    await page.getByRole('textbox', { name: '*body* of the query:' }).fill('?item wdt:P413 ?position .\n' +
      'SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }');
    await page.getByRole('dialog').getByRole('button', { name: 'Confirm' }).click();
    console.log('Extension in process.');

    await expect(page.getByText('column added')).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'positionLabel' })).toBeVisible();
    console.log('Extension successfully.');
  });

  test('Extension: Wikidata Properties', async ({ page }) => {
    test.setTimeout(120000);
    // Please provide your local base directory path below
    const baseDirectory = 'FILE_PATH';
    const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_extension.json`;
    const tableName = 'table_extension';
    await getOrCreateTable(page, tableName, filePath);
    const tableNameInput = page.getByLabel('Table name');
    await expect(tableNameInput).toBeVisible();
    await expect(tableNameInput).toHaveValue(tableName);
    console.log('Table opened.');

    const columnManager = page.getByRole('columnheader', { name: 'Manager' });
    const extendBtn = page.getByRole('button', { name: 'Extend', exact: true });
    const selectService = page.getByText('Choose an extension service...');

    await columnManager.click();
    console.log('Column "Manager" selected.');

    await expect(extendBtn).toBeEnabled();
    await extendBtn.click();
    await selectService.click();
    await page.getByRole('option', { name: 'Wikidata properties', exact: true }).click();
    await expect(page.getByText('An extender that adds Wikidata properties')).toBeVisible();
    console.log('Wikidata properties selected.');

    await page.getByRole('textbox', { name: '*properties* e.g.: P625 P2044' }).click();
    await page.getByRole('textbox', { name: '*properties* e.g.: P625 P2044' }).fill('P413');
    await page.getByRole('dialog').getByRole('button', { name: 'Confirm' }).click();
    console.log('Extension in process.');

    await expect(page.getByText('column added')).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'position played on team' })).toBeVisible();
    console.log('Extension successfully.');
  });
});

test('Extension: Geo Route (HERE)', async ({ page }) => {
  test.setTimeout(120000);
  const urlChronos = 'http://vm.chronos.disco.unimib.it:3001/';
  const datasetName = 'Evaluation';
  const tableName = 'table_extension';
  // Please provide your local base directory path below
  const baseDirectory = 'FILE_PATH';
  const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_extension.json`;
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
  const extendBtn = page.getByRole('button', { name: 'Extend', exact: true });
  const selectService = page.getByLabel('Extension', { exact: true }).getByText('Choose a service...');

  await columnMatchLoc.click();
  console.log('Column "Match Location" selected.');

  await expect(extendBtn).toBeEnabled();
  await extendBtn.click();
  await selectService.click();
  await page.getByRole('option', { name: 'Geo Route (HERE)', exact: true }).click();
  await expect(page.getByText('An extender that computes the route between the geographic points')).toBeVisible();
  console.log('Geo Route (HERE) selected.');

  await page.locator('#mui-component-select-end').click();
  await page.getByRole('option', { name: 'Football City', exact: true }).click();
  console.log('Column "Football City" selected as dates column.');

  await expect(page.getByRole('combobox', { name: 'Football City' })).toBeVisible();

  await page.getByRole('checkbox', { name: 'Route duration in minutes' }).check();
  await page.getByRole('checkbox', { name: 'Route length in km' }).check();
  await page.getByRole('checkbox', { name: 'Route path' }).check();

  await page.getByRole('dialog').getByRole('button', { name: 'Confirm' }).click();
  console.log('Extension in process.');

  await expect(page.getByText('columns added')).toBeVisible({ timeout: 100000 });
  await expect(page.getByRole('gridcell', { name: 'null' }).nth(5)).not.toBeVisible();
  await expect(page.getByRole('gridcell', { name: 'null' }).nth(4)).not.toBeVisible();
  await expect(page.getByRole('gridcell', { name: 'null' }).nth(3)).not.toBeVisible();
  console.log('Extension successfully.');
});
