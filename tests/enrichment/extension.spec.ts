import { test, expect } from '@playwright/test';
import { login, getOrCreateDataset, getOrCreateTable } from '../utils/setup.utils';
import {
  extensionDialogChronos,
  extensionDialog,
  meteoPropsConfig,
  propertiesConfig,
  sparqlConfig,
  wikiPropsConfig,
  geoRouteConfig,
} from "../utils/extension.utils";
import { reconcilerConfig, reconciliationDialog, confirmPropagate } from "../utils/reconciliation.utils";
import { dateFormatterConfig, modificationDialog } from "../utils/modification.utils";

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

    /**
     * Open Extension Dialog of a specific column and select a extender service
     * * @param {import('@playwright/test').Page} page
     * @param {string} columnName
     * @param {string} service
     */
    await extensionDialog(page, 'Match Country', 'Annotation properties');
    /**
     * Configuration of the Annotation Properties extender
     * * @param {import('@playwright/test').Page} page
     * @param {string[]} params
     */
    await propertiesConfig(page, ['ID of entities', 'Name of entities']);
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

    await extensionDialog(page, 'Football Club', 'Annotation properties (Wikidata)');
    /**
     * Configuration of the Annotation Properties (Wikidata) extender
     * * @param {import('@playwright/test').Page} page
     * @param {string[]} params
     */
    await propertiesConfig(page, ['ID of entities', 'URL of entities', 'Name of entities', 'Description of entities']);
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

    await reconciliationDialog(page, 'Match Location', 'Wikidata', 'Linking: Wikidata (Alligator)');
    await reconcilerConfig(page, ['Match Country']);
    await expect(page.getByText('Learn more about annotation')).toBeVisible({ timeout: 100000 });
    console.log('Column "Match Location" reconciled.');

    await page.locator('tr:nth-child(9) > .css-1lvn3g6 > ._Container_1mibn_1 > ._CellLabel_1mibn_7 > .MuiButtonBase-root').click();
    await page.locator('.css-kpopnj > div > .MuiButtonBase-root > .PrivateSwitchBase-input').first().check();
    await confirmPropagate.click();

    await extensionDialog(page, 'Match Location', 'Geo Properties (Wikidata)');
    /**
     * Configuration of the Geo Properties (Wikidata) extender
     * * @param {import('@playwright/test').Page} page
     * @param {string[]} params
     */
    await propertiesConfig(page, ['Coordinate', 'Time zone', 'Postal code']);

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

    await extensionDialog(page, 'Match Location', 'Meteo Properties (OpenMeteo)');
    /**
     * Configuration of the Meteo Properties extender
     * * @param {import('@playwright/test').Page} page
     * @param {string} columnDate
     * @param {string} granularity
     * @param {string[]} meteoParams
     * @param {boolean} comma
     */
    await meteoPropsConfig(
      page,
      'Match Date',
      'Daily',
      [
        'Number of seconds of daylight',
        'Sun rise and set times UTC',
        'Maximum daily temperature',
        'Minimum daily temperature',
        'Sum of daily precipitation',
        'Number of hours with rain'
      ],
      true,
    );
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

    await extensionDialog(page, 'Match Location', 'Meteo Properties (OpenMeteo)');
    await meteoPropsConfig(
      page,
      'Match Date',
      'Hourly',
      [
        'Temperature',
        'Relative humidity',
        'Precipitation',
      ],
      false,
    );
    console.log('Error detected: Invalid column.');
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

    await modificationDialog(page, 'Match Date', 'Date Formatter');
    await dateFormatterConfig(
      page,
      'Match Date',
      'ISO',
      'Hour and minutes (yyyy-MM-dd\'T\'HH:mm)',
      false,
      undefined,
      true,
      undefined
    );
    console.log('Date Formatter successfully.');

    await extensionDialog(page, 'Match Location', 'Meteo Properties (OpenMeteo)');
    await meteoPropsConfig(
      page,
      'Match Date_Match Time',
      'Hourly',
      [
        'Temperature',
        'Relative humidity',
        'Precipitation',
      ],
      false,
    );
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

    await extensionDialog(page, 'Manager', 'SPARQL (Wikidata)');
    /**
     * Configuration of the Wikidata Properties extender
     * * @param {import('@playwright/test').Page} page
     * @param {string[]} variables
     * @param {string} body
     * @param {string} order
     * @param {string} limit
     */
    await sparqlConfig(page, ['?positionLabel'], '?item wdt:P413 ?position .\n' +
      'SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }', undefined, undefined);
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

    await extensionDialog(page, 'Manager', 'Wikidata properties');
    /**
     * Configuration of the Wikidata Properties extender
     * * @param {import('@playwright/test').Page} page
     * @param {string[]} properties
     */
    await wikiPropsConfig(page, ['P413']);
    console.log('Extension successfully.');
    await expect(page.getByRole('columnheader', { name: 'position played on team' })).toBeVisible();
    console.log('Extension successfully.');
  });

  test('Extension: Geo Route (OSRM) - Car', async ({ page }) => {
    test.setTimeout(120000);
    // Please provide your local base directory path below
    const baseDirectory = 'FILE_PATH';
    const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_extensionGen.json`;
    const tableName = 'table_extensionGeoRoute';
    await getOrCreateTable(page, tableName, filePath);
    const tableNameInput = page.getByLabel('Table name');
    await expect(tableNameInput).toBeVisible();
    await expect(tableNameInput).toHaveValue(tableName);
    console.log('Table opened.');

    await reconciliationDialog(page, 'Football City', 'Geo Coordinates', 'GeoCoding: Geo Coordinates (GeoNames)');
    await reconcilerConfig(page, undefined);

    await extensionDialog(page, 'Football City', 'Annotation properties');
    await propertiesConfig(page, ['ID of entities']);

    await extensionDialog(page, 'Match Location', 'Geo Route (OSRM)');
    /**
     * Configuration of the Geo Route (OSRM) extender
     * * @param {import('@playwright/test').Page} page
     * @param {string} end
     * @param {string} mode
     * @param {boolean} poi
     * @param {string[]} routeParams
     */
    await geoRouteConfig(
      page,
      'id_Football City',
      'By car',
      false,
      [
        'Route duration in minutes',
        'Route length in km',
        'Route path'
      ],
    );
    console.log('Extension successfully.');
  });

  test('Extension: Geo Route (OSRM) - Foot', async ({ page }) => {
    test.setTimeout(120000);
    // Please provide your local base directory path below
    const baseDirectory = 'FILE_PATH';
    const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_extensionGen.json`;
    const tableName = 'table_extensionGeoRoute';
    await getOrCreateTable(page, tableName, filePath);
    const tableNameInput = page.getByLabel('Table name');
    await expect(tableNameInput).toBeVisible();
    await expect(tableNameInput).toHaveValue(tableName);
    console.log('Table opened.');

    await reconciliationDialog(page, 'Football City', 'Geo Coordinates', 'GeoCoding: Geo Coordinates (GeoNames)');
    await reconcilerConfig(page, undefined);

    await extensionDialog(page, 'Football City', 'Annotation properties');
    await propertiesConfig(page, ['ID of entities']);

    await extensionDialog(page, 'Match Location', 'Geo Route (OSRM)');
    await geoRouteConfig(
      page,
      'id_Football City',
      'By foot',
      false,
      [
        'Route duration in minutes',
        'Route length in km',
        'Route path'
      ],
    );
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

  await extensionDialogChronos(page, 'Match Location', 'Geo Route (HERE)');
  /**
   * Configuration of the Geo Route (HERE) extender
   * * @param {import('@playwright/test').Page} page
   * @param {string} end
   * @param {string} mode
   * @param {boolean} poi
   * @param {string[]} routeParams
   */
  await geoRouteConfig(
    page,
    'Football City',
    undefined,
    true,
    [
      'Route duration in minutes',
      'Route length in km',
      'Route path'
    ],
  );

  await expect(page.getByRole('gridcell', { name: 'null' }).nth(5)).not.toBeVisible();
  await expect(page.getByRole('gridcell', { name: 'null' }).nth(4)).not.toBeVisible();
  await expect(page.getByRole('gridcell', { name: 'null' }).nth(3)).not.toBeVisible();
  console.log('Extension successfully.');
});
