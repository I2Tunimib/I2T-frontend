import { test, expect } from '@playwright/test';
import { checkOrAddService } from "../../utils/setup.utils";

test.beforeEach(async ({ page }) => {
  test.setTimeout(1000000);
  await page.goto('http://127.0.0.1:3333/#create-project');
  // Please provide your local base directory path below
  const baseDirectory = 'FILE_PATH';
  const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_user_task.csv`;
  await page.getByRole('button', { name: 'Choose File' }).click();
  await page.getByRole('button', { name: 'Choose File' }).setInputFiles(filePath);
  await page.getByRole('button', { name: 'Next »' }).click();
  await page.getByRole('textbox', { name: 'Project name' }).click();
  await page.getByRole('textbox', { name: 'Project name' }).fill('Football Clubs');
  await expect(page.getByRole('textbox', { name: 'Project name' })).toBeVisible();
  await page.getByRole('button', { name: 'Create project »' }).click();
  await page.getByRole('link', { name: '25' }).click();
});

test('Extension: Annotation Properties', async ({ page }) => {
  const geonamesService = "GeoNames Reconciliation";
  const geonamesURL = "http://fornpunkt.se/apis/reconciliation/geonames";
  //Reconciliation
  await page.locator('th:nth-child(8) > .column-header-title > .column-header-menu').click();
  await page.getByRole('link', { name: 'Reconcile' }).click();
  await page.getByRole('link', { name: 'Start reconciling…' }).click();
  await expect(page.getByText('Reconcile column Match Country')).toBeVisible();
  await checkOrAddService(page, geonamesService, geonamesURL);
  await page.getByRole('button', { name: 'Next »' }).click();
  await expect(page.locator('td').filter({ hasText: /^Concept$/ })).toBeVisible();
  await page.getByRole('button', { name: 'Start reconciling...' }).click();
  await expect(page.locator('#notification').getByText('Reconcile cells in column')).toBeVisible({ timeout: 100000 });
  await expect(page.getByText('includenone15')).toBeVisible({ timeout: 100000 });
  await expect(page.getByText('Match Country: best candidate')).toBeVisible();
  await page.locator('#facet-1').getByRole('link', { name: 'Remove this facet' }).click();
  await page.getByText('Germany').nth(1).hover();
  await page.getByRole('button', { name: 'Match all identical cells' }).click();
  await expect(page.locator('#notification').getByText('Match item Germany (2921044)')).toBeVisible();

  await page.locator('th:nth-child(8) > .column-header-title > .column-header-menu').click();
  await page.getByRole('link', { name: 'Reconcile' }).click();
  await page.getByRole('link', { name: 'Add entity identifiers' }).click();
  await page.getByRole('textbox', { name: 'New column name' }).click();
  await page.getByRole('textbox', { name: 'New column name' }).fill('Match Country ID');
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(page.locator('#notification').getByText('Create new column Match')).toBeVisible();
  await expect(page.getByText('Match Country ID', { exact: true })).toBeVisible();

  await page.locator('th:nth-child(8) > .column-header-title > .column-header-menu').click();
  await page.getByRole('link', { name: 'Edit column' }).click();
  await page.getByRole('link', { name: 'Add column based on this' }).click();
  await expect(page.getByText('Add column based on column')).toBeVisible();
  await page.getByRole('textbox', { name: 'Expression' }).click();
  await page.getByRole('textbox', { name: 'Expression' }).press('ControlOrMeta+a');
  await page.getByRole('textbox', { name: 'Expression' }).fill('cell.recon.match.name');
  await page.getByRole('textbox', { name: 'New column name' }).click();
  await page.getByRole('textbox', { name: 'New column name' }).fill('Match Country Name');
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(page.locator('#notification').getByText('Create new column Match')).toBeVisible();
  await expect(page.getByText('Match Country Name', { exact: true })).toBeVisible();
});

test('Extension: Annotation Properties (Wikidata)', async ({ page }) => {
  const wikidataService = "Wikidata reconciliation (en)";
  const wikidataURL = "https://wikidata-reconciliation.wmcloud.org/en/api";
  //Reconciliation
  await page.locator('th:nth-child(8) > .column-header-title > .column-header-menu').click();
  await page.getByRole('link', { name: 'Reconcile' }).click();
  await page.getByRole('link', { name: 'Start reconciling…' }).click();
  await expect(page.getByText('Reconcile column Match Country')).toBeVisible();
  await checkOrAddService(page, wikidataService, wikidataURL);
  await page.getByRole('button', { name: 'Next »' }).click();
  await page.getByRole('radio', { name: 'sovereign state Q3624078' }).check();
  await page.getByRole('button', { name: 'Start reconciling...' }).click();
  await expect(page.getByText('Reconcile cells in column')).toBeVisible();
  await expect(page.getByText('includenone15')).toBeVisible({ timeout: 100000 });
  await page.getByText('Germany').nth(1).hover();
  await page.getByRole('button', { name: 'Match all identical cells' }).click();
  await expect(page.locator('#notification').getByText('Match item Germany (Q183) for')).toBeVisible();
  await expect(page.getByText('includematched15')).toBeVisible();

  await page.locator('th:nth-child(8) > .column-header-title > .column-header-menu').click();
  await page.getByRole('link', { name: 'Reconcile' }).click();
  await page.getByRole('link', { name: 'Add entity identifiers' }).click();
  await page.getByRole('textbox', { name: 'New column name' }).click();
  await page.getByRole('textbox', { name: 'New column name' }).fill('Match Country ID');
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(page.locator('#notification').getByText('Create new column Match')).toBeVisible();
  await expect(page.getByText('Match Country ID', { exact: true })).toBeVisible();

  await page.locator('th:nth-child(8) > .column-header-title > .column-header-menu').click();
  await page.getByRole('link', { name: 'Edit column' }).click();
  await page.getByRole('link', { name: 'Add column based on this' }).click();
  await expect(page.getByText('Add column based on column')).toBeVisible();
  await page.getByRole('textbox', { name: 'Expression' }).click();
  await page.getByRole('textbox', { name: 'Expression' }).press('ControlOrMeta+a');
  await page.getByRole('textbox', { name: 'Expression' }).fill('cell.recon.match.name');
  await page.getByRole('textbox', { name: 'New column name' }).click();
  await page.getByRole('textbox', { name: 'New column name' }).fill('Match Country Name');
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(page.locator('#notification').getByText('Create new column Match')).toBeVisible();
  await expect(page.getByText('Match Country Name', { exact: true })).toBeVisible();

  await page.locator('th:nth-child(8) > .column-header-title > .column-header-menu').click();
  await page.getByRole('link', { name: 'Reconcile' }).click();
  await page.getByRole('link', { name: 'Add column with URLs' }).click();
  await page.getByRole('textbox', { name: 'New column name' }).click();
  await page.getByRole('textbox', { name: 'New column name' }).fill('Match Country URL');
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(page.locator('#notification').getByText('Create new column Match')).toBeVisible();
  await expect(page.getByText('Match Country URL', { exact: true })).toBeVisible();
});

test('Extension: Geo Properties (Wikidata)', async ({ page }) => {
  const wikidataService = "Wikidata reconciliation (en)";
  const wikidataURL = "https://wikidata-reconciliation.wmcloud.org/en/api";
  //Reconciliation
  await page.locator('th:nth-child(7) > .column-header-title > .column-header-menu').click();
  await page.getByRole('link', { name: 'Reconcile' }).click();
  await page.getByRole('link', { name: 'Start reconciling…' }).click();
  await expect(page.getByText('Reconcile column Match Location')).toBeVisible();
  await checkOrAddService(page, wikidataService, wikidataURL);
  await page.getByRole('button', { name: 'Next »' }).click();
  await expect(page.getByRole('radio', { name: 'urban municipality in Germany Q42744322' })).toBeChecked();
  await page.getByRole('row', { name: 'Match Country', exact: true }).getByRole('textbox').click();
  await page.getByRole('row', { name: 'Match Country', exact: true }).getByRole('textbox').fill('country');
  await page.getByRole('listitem').filter({ hasText: 'P17countrysovereign state' }).getByRole('strong').click();
  await expect(page.getByText('country(P17)edit')).toBeVisible();
  await page.getByRole('button', { name: 'Start reconciling...' }).click();
  await expect(page.getByText('Reconcile cells in column')).toBeVisible();
  await expect(page.getByText('includematched14')).toBeVisible({ timeout: 100000 });
  await expect(page.getByText('includenone1')).toBeVisible({ timeout: 100000 });

  //Entity Matching Reviison for Ubstadt-Weiher and Manual Reconciliation
  await page.getByText('Create new item').click();
  await page.getByRole('link', { name: 'Search for match' }).click();
  await expect(page.getByRole('dialog').getByText('Search for match')).toBeVisible();
  await page.getByRole('textbox', { name: 'Item to match' }).click();
  await page.getByText('Q520414Ubstadt-').click();
  await expect(page.locator('#notification').getByText('Match item Ubstadt-Weiher')).toBeVisible({ timeout: 100000 });
  await expect(page.getByText('includematched15')).toBeVisible();

  await page.locator('th:nth-child(7) > .column-header-title > .column-header-menu').click();
  await page.getByRole('link', { name: 'Edit column' }).click();
  await page.getByRole('link', { name: 'Add columns from reconciled' }).click();
  await expect(page.getByText('Add columns from reconciled')).toBeVisible();
  await page.getByRole('textbox', { name: 'Add property' }).click();
  await page.getByRole('textbox', { name: 'Add property' }).fill('coordinates');
  await page.getByRole('list').getByText('coordinate location').click();
  await expect(page.getByRole('dialog').getByText('coordinate location')).toBeVisible();
  await page.getByRole('textbox', { name: 'Add property' }).click();
  await page.getByRole('textbox', { name: 'Add property' }).fill('time zone');
  await page.getByText('located in time zone').click();
  await expect(page.getByRole('dialog').getByText('located in time zone')).toBeVisible();
  await page.getByRole('textbox', { name: 'Add property' }).click();
  await page.getByRole('textbox', { name: 'Add property' }).fill('postal code');
  await page.getByText('postal code').click();
  await expect(page.getByRole('dialog').getByText('postal code')).toBeVisible();
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(page.getByText('coordinate location')).toBeVisible();
  await expect(page.getByText('located in time zone')).toBeVisible();
  await expect(page.getByText('postal code')).toBeVisible();
  await expect(page.getByRole('cell', { name: '48.648333333333,9.' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'UTC+01:00' }).first()).toBeVisible();
  await expect(page.getByRole('cell', { name: '73230' })).toBeVisible();
});

test('Extension: Meteo Properties (OpenMeteo) - Daily', async ({ page }) => {
  const wikidataService = "Wikidata reconciliation (en)";
  const wikidataURL = "https://wikidata-reconciliation.wmcloud.org/en/api";
  //Modification Match Date
  await page.locator('th:nth-child(6) > .column-header-title > .column-header-menu').click();
  await page.getByRole('link', { name: 'Edit column' }).click();
  await page.getByRole('link', { name: 'Add column based on this' }).click();
  await expect(page.getByText('Add column based on column')).toBeVisible();
  await page.getByRole('textbox', { name: 'Expression' }).click();
  await page.getByRole('textbox', { name: 'Expression' }).press('ControlOrMeta+a');
  await page.getByRole('textbox', { name: 'Expression' }).fill('value.substring(0,4) + "-" + value.substring(4,6) + "-" + value.substring(6,8)');
  await expect(page.getByRole('cell', { name: 'value.substring(0,4) + "-" + v' })).toBeVisible();
  await page.getByRole('textbox', { name: 'New column name' }).click();
  await page.getByRole('textbox', { name: 'New column name' }).fill('Match Date iso');
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(page.locator('#notification').getByText('Create new column Match Date')).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Match Date iso' })).toBeVisible();

  //Reconciliation Match Location Wikidata providing Match Country column as context
  await page.locator('th:nth-child(8) > .column-header-title > .column-header-menu').click();
  await page.getByRole('link', { name: 'Reconcile' }).click();
  await page.getByRole('link', { name: 'Start reconciling…' }).click();
  await checkOrAddService(page, wikidataService, wikidataURL);
  await page.getByRole('button', { name: 'Next »' }).click();
  await expect(page.getByText('Reconcile column Match Location')).toBeVisible();
  await expect(page.getByRole('radio', { name: 'urban municipality in Germany Q42744322' })).toBeChecked({ timeout: 100000 });
  await page.locator('tr:nth-child(8) > td:nth-child(2) > input').click();
  await page.locator('tr:nth-child(8) > td:nth-child(2) > input').fill('country');
  await page.getByRole('listitem').filter({ hasText: 'P17countrysovereign state' }).getByRole('strong').click();
  await expect(page.getByText('country(P17)edit')).toBeVisible();
  await expect(page.locator('td').filter({ hasText: /^urban municipality in GermanyQ42744322$/ })).toBeVisible({ timeout: 100000 });
  await page.getByRole('button', { name: 'Start reconciling...' }).click();
  await expect(page.getByText('Reconcile cells in column Match Location to type Q42744322')).toBeVisible();
  await expect(page.getByText('includematched14')).toBeVisible({ timeout: 100000 });
  await expect(page.getByText('includenone1')).toBeVisible({ timeout: 100000 });

  //Entity Matching Reviison for Ubstadt-Weiher and Manual Reconciliation
  await page.getByText('Create new item').click();
  await page.getByRole('link', { name: 'Search for match' }).click();
  await expect(page.getByRole('dialog').getByText('Search for match')).toBeVisible();
  await page.getByRole('textbox', { name: 'Item to match' }).click();
  await page.getByText('Q520414Ubstadt-').click();
  await expect(page.locator('#notification').getByText('Match item Ubstadt-Weiher')).toBeVisible({ timeout: 100000 });
  await expect(page.getByText('includematched15')).toBeVisible();

  //Extract coordinates from Match Location
  await page.locator('th:nth-child(8) > .column-header-title > .column-header-menu').click();
  await page.getByRole('link', { name: 'Edit column' }).click();
  await page.getByRole('link', { name: 'Add columns from reconciled' }).click();
  await expect(page.getByText('Add columns from reconciled')).toBeVisible();
  await page.getByRole('textbox', { name: 'Add property' }).click();
  await page.getByRole('textbox', { name: 'Add property' }).fill('coordinates');
  await page.getByText('P625coordinate').click();
  await expect(page.locator('#notification').getByText('Match item')).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'coordinate location' })).toBeVisible({ timeout: 100000 });
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(page.getByRole('columnheader', { name: 'coordinate location' })).toBeVisible({ timeout: 100000 });

  //Split coordinates in lat and lon
  await page.locator('th:nth-child(9) > .column-header-title > .column-header-menu').click();
  await page.getByRole('link', { name: 'Edit column' }).click();
  await page.getByRole('link', { name: 'Split into several columns…' }).click();
  await expect(page.getByText('Split column "coordinate')).toBeVisible();
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(page.locator('#view-panel').getByText('coordinate location 1')).toBeVisible({ timeout: 100000 });
  await expect(page.locator('#view-panel').getByText('coordinate location 2')).toBeVisible({ timeout: 100000 });

  await page.locator('th:nth-child(9) > .column-header-title > .column-header-menu').click();
  await page.getByRole('link', { name: 'Edit column' }).click();
  await page.getByRole('link', { name: 'Rename this column' }).click();
  await page.getByRole('textbox', { name: 'New column name' }).fill('lat');
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(page.locator('#notification').getByText('Rename column coordinate')).toBeVisible({ timeout: 100000 });
  await expect(page.getByText('lat', { exact: true })).toBeVisible();

  await page.locator('th:nth-child(10) > .column-header-title > .column-header-menu').click();
  await page.getByRole('link', { name: 'Edit column' }).click();
  await page.getByRole('link', { name: 'Rename this column' }).click();
  await page.getByRole('textbox', { name: 'New column name' }).fill('lon');
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(page.locator('#notification').getByText('Rename column coordinate')).toBeVisible({ timeout: 100000 });
  await expect(page.getByText('lon', { exact: true })).toBeVisible();

  //Extension Meteo Properties
  await page.locator('th:nth-child(9) > .column-header-title > .column-header-menu').click();
  await page.getByRole('link', { name: 'Edit column' }).click();
  await page.getByRole('link', { name: 'Add column by fetching URLs…' }).click();
  await page.getByRole('textbox', { name: 'New column name' }).click();
  await page.getByRole('textbox', { name: 'New column name' }).fill('weather_json');
  await page.getByRole('textbox', { name: 'Expression' }).click();
  await page.getByRole('textbox', { name: 'Expression' }).press('ControlOrMeta+a');
  await page.getByRole('textbox', { name: 'Expression' }).fill('"https://archive-api.open-meteo.com/v1/archive?"\n    ' +
    '+ "latitude=" + cells["lat"].value\n    ' +
    '+ "&longitude=" + cells["lon"].value\n    ' +
    '+ "&daily=temperature_2m_min,temperature_2m_max,daylight_duration,sunrise,sunset,precipitation_sum,rain_sum"\n    ' +
    '+ "&timezone=UTC"\n    ' +
    '+ "&start_date=" + cells["Match Date iso"].value\n    ' +
    '+ "&end_date=" + cells["Match Date iso"].value');
  await page.getByRole('link', { name: 'Preview' }).click();
  await expect(page.getByRole('cell', { name: '"https://archive-api.open-mete' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'https://archive-api.open-meteo.com/v1/archive?latitude=48.648333333333&' })).toBeVisible();
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(page.getByText('Create column weather_json at')).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'weather_json' })).toBeVisible({ timeout: 10000000 });

  await page.locator('th:nth-child(10) > .column-header-title > .column-header-menu').click();
  await page.getByRole('link', { name: 'Edit column' }).click();
  await page.getByRole('link', { name: 'Add column based on this' }).click();
  await page.getByRole('textbox', { name: 'New column name' }).click();
  await page.getByRole('textbox', { name: 'New column name' }).fill('max temp');
  await page.getByRole('textbox', { name: 'Expression' }).click();
  await page.getByRole('textbox', { name: 'Expression' }).press('ControlOrMeta+a');
  await page.getByRole('textbox', { name: 'Expression' }).fill('parseJson(value).daily.temperature_2m_max[0]');
  await expect(page.getByRole('cell', { name: '6', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(page.locator('#notification').getByText('Create new column max temp')).toBeVisible();
  await expect(page.getByText('max temp', { exact: true })).toBeVisible({ timeout: 100000 });

  await page.locator('th:nth-child(10) > .column-header-title > .column-header-menu').click();
  await page.getByRole('link', { name: 'Edit column' }).click();
  await page.getByRole('link', { name: 'Add column based on this' }).click();
  await page.getByRole('textbox', { name: 'New column name' }).click();
  await page.getByRole('textbox', { name: 'New column name' }).fill('min temp');
  await page.getByRole('textbox', { name: 'Expression' }).click();
  await page.getByRole('textbox', { name: 'Expression' }).press('ControlOrMeta+a');
  await page.getByRole('textbox', { name: 'Expression' }).fill('parseJson(value).daily.temperature_2m_min[0]');
  await expect(page.getByRole('cell', { name: '-1.5', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(page.locator('#notification').getByText('Create new column min temp')).toBeVisible();
  await expect(page.getByText('min temp', { exact: true })).toBeVisible({ timeout: 100000 });

  await page.locator('th:nth-child(10) > .column-header-title > .column-header-menu').click();
  await page.getByRole('link', { name: 'Edit column' }).click();
  await page.getByRole('link', { name: 'Add column based on this' }).click();
  await page.getByRole('textbox', { name: 'New column name' }).click();
  await page.getByRole('textbox', { name: 'New column name' }).fill('daylight duration');
  await page.getByRole('textbox', { name: 'Expression' }).click();
  await page.getByRole('textbox', { name: 'Expression' }).press('ControlOrMeta+a');
  await page.getByRole('textbox', { name: 'Expression' }).fill('parseJson(value).daily.daylight_duration[0]');
  await expect(page.getByRole('cell', { name: '30010.15', exact: true })).toBeVisible({ timeout: 100000 });
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(page.locator('#notification').getByText('Create new column daylight duration')).toBeVisible();
  await expect(page.getByText('daylight duration', { exact: true })).toBeVisible({ timeout: 100000 });

  await page.locator('th:nth-child(10) > .column-header-title > .column-header-menu').click();
  await page.getByRole('link', { name: 'Edit column' }).click();
  await page.getByRole('link', { name: 'Add column based on this' }).click();
  await page.getByRole('textbox', { name: 'New column name' }).click();
  await page.getByRole('textbox', { name: 'New column name' }).fill('sunrise');
  await page.getByRole('textbox', { name: 'Expression' }).click();
  await page.getByRole('textbox', { name: 'Expression' }).press('ControlOrMeta+a');
  await page.getByRole('textbox', { name: 'Expression' }).fill('parseJson(value).daily.sunrise[0]');
  await expect(page.getByRole('cell', { name: '2017-12-12T07:06', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(page.locator('#notification').getByText('Create new column sunrise')).toBeVisible();
  await expect(page.getByText('sunrise', { exact: true })).toBeVisible({ timeout: 100000 });

  await page.locator('th:nth-child(10) > .column-header-title > .column-header-menu').click();
  await page.getByRole('link', { name: 'Edit column' }).click();
  await page.getByRole('link', { name: 'Add column based on this' }).click();
  await page.getByRole('textbox', { name: 'New column name' }).click();
  await page.getByRole('textbox', { name: 'New column name' }).fill('sunset');
  await page.getByRole('textbox', { name: 'Expression' }).click();
  await page.getByRole('textbox', { name: 'Expression' }).press('ControlOrMeta+a');
  await page.getByRole('textbox', { name: 'Expression' }).fill('parseJson(value).daily.sunset[0]');
  await expect(page.getByRole('cell', { name: '2017-12-12T15:26', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(page.getByText('sunset', { exact: true })).toBeVisible({ timeout: 100000 });

  await page.locator('th:nth-child(10) > .column-header-title > .column-header-menu').click();
  await page.getByRole('link', { name: 'Edit column' }).click();
  await page.getByRole('link', { name: 'Add column based on this' }).click();
  await page.getByRole('textbox', { name: 'New column name' }).click();
  await page.getByRole('textbox', { name: 'New column name' }).fill('precipitation sum');
  await page.getByRole('textbox', { name: 'Expression' }).click();
  await page.getByRole('textbox', { name: 'Expression' }).press('ControlOrMeta+a');
  await page.getByRole('textbox', { name: 'Expression' }).fill('parseJson(value).daily.precipitation_sum[0]');
  await expect(page.getByRole('cell', { name: '0', exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(page.locator('#notification').getByText('Create new column precipitation sum')).toBeVisible();
  await expect(page.getByText('precipitation sum', { exact: true })).toBeVisible({ timeout: 100000 });

  await page.locator('th:nth-child(10) > .column-header-title > .column-header-menu').click();
  await page.getByRole('link', { name: 'Edit column' }).click();
  await page.getByRole('link', { name: 'Add column based on this' }).click();
  await page.getByRole('textbox', { name: 'New column name' }).click();
  await page.getByRole('textbox', { name: 'New column name' }).fill('rain sum');
  await page.getByRole('textbox', { name: 'Expression' }).click();
  await page.getByRole('textbox', { name: 'Expression' }).press('ControlOrMeta+a');
  await page.getByRole('textbox', { name: 'Expression' }).fill('parseJson(value).daily.rain_sum[0]');
  await expect(page.getByRole('cell', { name: '0', exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(page.locator('#notification').getByText('Create new column rain sum')).toBeVisible();
  await expect(page.getByText('rain sum', { exact: true })).toBeVisible({ timeout: 100000 });
});

test('Extension: Meteo Properties (OpenMeteo) - Hourly', async ({ page }) => {
  const wikidataService = "Wikidata reconciliation (en)";
  const wikidataURL = "https://wikidata-reconciliation.wmcloud.org/en/api";
  //Modification Match Date
  await page.locator('th:nth-child(6) > .column-header-title > .column-header-menu').click();
  await page.getByRole('link', { name: 'Edit column' }).click();
  await page.getByRole('link', { name: 'Add column based on this' }).click();
  await expect(page.getByText('Add column based on column')).toBeVisible();
  await page.getByRole('textbox', { name: 'Expression' }).click();
  await page.getByRole('textbox', { name: 'Expression' }).press('ControlOrMeta+a');
  await page.getByRole('textbox', { name: 'Expression' }).fill('value.substring(0,4) + "-" + value.substring(4,6) + "-" + value.substring(6,8)');
  await expect(page.getByRole('cell', { name: 'value.substring(0,4) + "-" + v' })).toBeVisible();
  await page.getByRole('textbox', { name: 'New column name' }).click();
  await page.getByRole('textbox', { name: 'New column name' }).fill('Match Date iso');
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(page.locator('#notification').getByText('Create new column Match Date')).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Match Date iso' })).toBeVisible();

  //Reconciliation Match Location Wikidata providing Match Country column as context
  await page.locator('th:nth-child(8) > .column-header-title > .column-header-menu').click();
  await page.getByRole('link', { name: 'Reconcile' }).click();
  await page.getByRole('link', { name: 'Start reconciling…' }).click();
  await checkOrAddService(page, wikidataService, wikidataURL);
  await page.getByRole('button', { name: 'Next »' }).click();
  await expect(page.getByText('Reconcile column Match Location')).toBeVisible();
  await expect(page.getByRole('radio', { name: 'urban municipality in Germany Q42744322' })).toBeChecked({ timeout: 100000 });
  await page.locator('tr:nth-child(8) > td:nth-child(2) > input').click();
  await page.locator('tr:nth-child(8) > td:nth-child(2) > input').fill('country');
  await page.getByRole('listitem').filter({ hasText: 'P17countrysovereign state' }).getByRole('strong').click();
  await expect(page.getByText('country(P17)edit')).toBeVisible();
  await expect(page.locator('td').filter({ hasText: /^urban municipality in GermanyQ42744322$/ })).toBeVisible({ timeout: 100000 });
  await page.getByRole('button', { name: 'Start reconciling...' }).click();
  await expect(page.getByText('Reconcile cells in column Match Location to type Q42744322')).toBeVisible();
  await expect(page.getByText('includematched14')).toBeVisible({ timeout: 100000 });
  await expect(page.getByText('includenone1')).toBeVisible({ timeout: 100000 });

  //Entity Matching Reviison for Ubstadt-Weiher and Manual Reconciliation
  await page.getByText('Create new item').click();
  await page.getByRole('link', { name: 'Search for match' }).click();
  await expect(page.getByRole('dialog').getByText('Search for match')).toBeVisible();
  await page.getByRole('textbox', { name: 'Item to match' }).click();
  await page.getByText('Q520414Ubstadt-').click();
  await expect(page.locator('#notification').getByText('Match item Ubstadt-Weiher')).toBeVisible({ timeout: 100000 });
  await expect(page.getByText('includematched15')).toBeVisible();

  //Extract coordinates from Match Location
  await page.locator('th:nth-child(8) > .column-header-title > .column-header-menu').click();
  await page.getByRole('link', { name: 'Edit column' }).click();
  await page.getByRole('link', { name: 'Add columns from reconciled' }).click();
  await expect(page.getByText('Add columns from reconciled')).toBeVisible();
  await page.getByRole('textbox', { name: 'Add property' }).click();
  await page.getByRole('textbox', { name: 'Add property' }).fill('coordinates');
  await page.getByText('P625coordinate').click();
  await expect(page.locator('#notification').getByText('Match item')).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'coordinate location' })).toBeVisible({ timeout: 100000 });
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(page.getByRole('columnheader', { name: 'coordinate location' })).toBeVisible({ timeout: 100000 });

  //Split coordinates in lat and lon
  await page.locator('th:nth-child(9) > .column-header-title > .column-header-menu').click();
  await page.getByRole('link', { name: 'Edit column' }).click();
  await page.getByRole('link', { name: 'Split into several columns…' }).click();
  await expect(page.getByText('Split column "coordinate')).toBeVisible();
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(page.locator('#view-panel').getByText('coordinate location 1')).toBeVisible({ timeout: 100000 });
  await expect(page.locator('#view-panel').getByText('coordinate location 2')).toBeVisible({ timeout: 100000 });

  await page.locator('th:nth-child(9) > .column-header-title > .column-header-menu').click();
  await page.getByRole('link', { name: 'Edit column' }).click();
  await page.getByRole('link', { name: 'Rename this column' }).click();
  await page.getByRole('textbox', { name: 'New column name' }).fill('lat');
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(page.locator('#notification').getByText('Rename column coordinate')).toBeVisible({ timeout: 100000 });
  await expect(page.getByText('lat', { exact: true })).toBeVisible();

  await page.locator('th:nth-child(10) > .column-header-title > .column-header-menu').click();
  await page.getByRole('link', { name: 'Edit column' }).click();
  await page.getByRole('link', { name: 'Rename this column' }).click();
  await page.getByRole('textbox', { name: 'New column name' }).fill('lon');
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(page.locator('#notification').getByText('Rename column coordinate')).toBeVisible({ timeout: 100000 });
  await expect(page.getByText('lon', { exact: true })).toBeVisible();

  //Extension Meteo Properties
  await page.locator('th:nth-child(9) > .column-header-title > .column-header-menu').click();
  await page.getByRole('link', { name: 'Edit column' }).click();
  await page.getByRole('link', { name: 'Add column by fetching URLs…' }).click();
  await page.getByRole('textbox', { name: 'New column name' }).click();
  await page.getByRole('textbox', { name: 'New column name' }).fill('weather_json');
  await page.getByRole('textbox', { name: 'Expression' }).click();
  await page.getByRole('textbox', { name: 'Expression' }).press('ControlOrMeta+a');
  await page.getByRole('textbox', { name: 'Expression' }).fill('"https://archive-api.open-meteo.com/v1/archive?"\n    ' +
    '+ "latitude=" + cells["lat"].value\n    ' +
    '+ "&longitude=" + cells["lon"].value\n    ' +
    '+ "&hourly=temperature_2m,relative_humidity_2m,precipitation"\n    ' +
    '+ "&timezone=UTC"\n    ' +
    '+ "&start_date=" + cells["Match Date iso"].value\n    ' +
    '+ "&end_date=" + cells["Match Date iso"].value');
  await page.getByRole('link', { name: 'Preview' }).click();
  await expect(page.getByRole('cell', { name: '"https://archive-api.open-mete' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'https://archive-api.open-meteo.com/v1/archive?latitude=48.648333333333&' })).toBeVisible();
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(page.getByText('Create column weather_json at')).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'weather_json' })).toBeVisible({ timeout: 10000000 });

  await page.locator('th:nth-child(10) > .column-header-title > .column-header-menu').click();
  await page.getByRole('link', { name: 'Edit column' }).click();
  await page.getByRole('link', { name: 'Add column based on this' }).click();
  await page.getByRole('textbox', { name: 'New column name' }).click();
  await page.getByRole('textbox', { name: 'New column name' }).fill('hourly temp');
  await page.getByRole('textbox', { name: 'Expression' }).click();
  await page.getByRole('textbox', { name: 'Expression' }).press('ControlOrMeta+a');
  await page.getByRole('textbox', { name: 'Expression' }).fill('parseJson(value).hourly.temperature_2m[0]');
  await expect(page.getByRole('cell', { name: '5.9', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(page.locator('#notification').getByText('Create new column hourly temp')).toBeVisible();
  await expect(page.getByText('hourly temp', { exact: true })).toBeVisible({ timeout: 100000 });

  await page.locator('th:nth-child(10) > .column-header-title > .column-header-menu').click();
  await page.getByRole('link', { name: 'Edit column' }).click();
  await page.getByRole('link', { name: 'Add column based on this' }).click();
  await page.getByRole('textbox', { name: 'New column name' }).click();
  await page.getByRole('textbox', { name: 'New column name' }).fill('relative humidity');
  await page.getByRole('textbox', { name: 'Expression' }).click();
  await page.getByRole('textbox', { name: 'Expression' }).press('ControlOrMeta+a');
  await page.getByRole('textbox', { name: 'Expression' }).fill('parseJson(value).hourly.relative_humidity_2m[0]');
  await expect(page.getByRole('cell', { name: '78', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(page.locator('#notification').getByText('Create new column relative humidity')).toBeVisible();
  await expect(page.getByText('relative humidity', { exact: true })).toBeVisible({ timeout: 100000 });

  await page.locator('th:nth-child(10) > .column-header-title > .column-header-menu').click();
  await page.getByRole('link', { name: 'Edit column' }).click();
  await page.getByRole('link', { name: 'Add column based on this' }).click();
  await page.getByRole('textbox', { name: 'New column name' }).click();
  await page.getByRole('textbox', { name: 'New column name' }).fill('precipitation');
  await page.getByRole('textbox', { name: 'Expression' }).click();
  await page.getByRole('textbox', { name: 'Expression' }).press('ControlOrMeta+a');
  await page.getByRole('textbox', { name: 'Expression' }).fill('parseJson(value).hourly.precipitation[0]');
  await expect(page.getByRole('cell', { name: '0', exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(page.locator('#notification').getByText('Create new column precipitation')).toBeVisible();
  await expect(page.getByText('precipitation', { exact: true })).toBeVisible({ timeout: 100000 });
});

test('Extension: SPARQL (Wikidata)', async ({ page }) => {
  test.setTimeout(120000);
  const wikidataService = "Wikidata reconciliation (en)";
  const wikidataURL = "https://wikidata-reconciliation.wmcloud.org/en/api";
  //Reconciliation Match Location Wikidata providing Match Country column as context
  await page.locator('th:nth-child(3) > .column-header-title > .column-header-menu').click();
  await page.getByRole('link', { name: 'Reconcile' }).click();
  await page.getByRole('link', { name: 'Start reconciling…' }).click();
  await checkOrAddService(page, wikidataService, wikidataURL);
  await page.getByRole('button', { name: 'Next »' }).click();
  await expect(page.getByText('Reconcile column Manager')).toBeVisible();
  await expect(page.getByRole('radio', { name: 'human Q5' })).toBeChecked({ timeout: 100000 });
  await page.getByRole('button', { name: 'Start reconciling...' }).click();
  await expect(page.getByText('Reconcile cells in column Manager to type Q5')).toBeVisible();
  await expect(page.getByText('includematched7')).toBeVisible({ timeout: 100000 });
  await expect(page.getByText('includenone8')).toBeVisible({ timeout: 100000 });

  await page.getByRole('link', { name: 'Steve Bruce' }).first().hover();
  await page.getByRole('button', { name: 'Match this cell' }).click();
  await expect(page.locator('#notification').getByText('Match Steve Bruce (Q331904)')).toBeVisible();
  await page.getByRole('link', { name: 'Eddie Howe', exact: true }).hover();
  await page.getByRole('button', { name: 'Match this cell' }).click();
  await expect(page.locator('#notification').getByText('Match Eddie Howe (Q5336135)')).toBeVisible();
  await page.getByRole('link', { name: 'Antonio Conte' }).first().hover();
  await page.getByRole('button', { name: 'Match this cell' }).click();
  await expect(page.locator('#notification').getByText('Match Antonio Conte (Q26580)')).toBeVisible();
  await page.getByRole('link', { name: 'Frank de Boer' }).first().hover();
  await page.getByRole('button', { name: 'Match this cell' }).click();
  await expect(page.locator('#notification').getByText('Match Frank de Boer (Q219657')).toBeVisible();
  await page.getByRole('link', { name: 'Ronald Koeman', exact: true }).hover();
  await page.getByRole('button', { name: 'Match this cell' }).click();
  await expect(page.locator('#notification').getByText('Match Ronald Koeman (Q192635')).toBeVisible();
  await page.getByRole('link', { name: 'David Wagner' }).first().hover();
  await page.getByRole('button', { name: 'Match this cell' }).click();
  await expect(page.locator('#notification').getByText('Match David Wagner (Q871069)')).toBeVisible();
  await page.getByRole('link', { name: 'Mark Hughes' }).first().hover();
  await page.getByRole('button', { name: 'Match this cell' }).click();
  await expect(page.locator('#notification').getByText('Match Mark Hughes (Q214513)')).toBeVisible();
  await page.getByRole('link', { name: 'Paul Clement' }).nth(1).hover();
  await page.getByRole('button', { name: 'Match this cell' }).click();
  await expect(page.locator('#notification').getByText('Match Paul Clement (Q15708728')).toBeVisible();

  await page.getByRole('columnheader', { name: 'Manager' }).getByRole('button').click();
  await page.getByRole('link', { name: 'Edit column' }).click();
  await page.getByRole('link', { name: 'Add column by fetching URLs…' }).click();
  await expect(page.getByText('Add column by fetching URLs')).toBeVisible();
  await page.getByRole('textbox', { name: 'Expression' }).click();
  await page.getByRole('textbox', { name: 'Expression' }).press('ControlOrMeta+a');
  await page.getByRole('textbox', { name: 'Expression' }).fill('"https://query.wikidata.org/sparql?query=" ' +
    '+ \nescape(\n  "SELECT ?valLabel WHERE { " +\n  "  wd:" + cell.recon.match.id + " wdt:P413 ?val. " ' +
    '+\n  "  SERVICE wikibase:label { bd:serviceParam wikibase:language \'en\'. } " +\n  "}", \n  "url"\n) ' +
    '+ "&format=json"');
  await expect(page.getByRole('cell', { name: '"https://query.wikidata.org/sp' })).toBeVisible();
  await page.getByRole('textbox', { name: 'New column name' }).click();
  await page.getByRole('textbox', { name: 'New column name' }).fill('sparql_response');
  await expect(page.getByRole('textbox', { name: 'New column name' })).toBeVisible();
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(page.getByText('Create column sparql_response at')).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'sparql_response' })).toBeVisible({ timeout: 100000 });

  await page.getByRole('columnheader', { name: 'sparql_response' }).getByRole('button').click();
  await page.getByRole('link', { name: 'Edit column' }).click();
  await page.getByRole('link', { name: 'Add column based on this' }).click();
  await page.getByRole('textbox', { name: 'Expression' }).fill('value.parseJson().results.bindings[0].valLabel.value');
  await page.getByRole('textbox', { name: 'New column name' }).click();
  await page.getByRole('textbox', { name: 'New column name' }).fill('position');
  await expect(page.getByRole('cell', { name: 'defender', exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(page.locator('#notification').getByText('Create new column position')).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'position', exact: true })).toBeVisible();
});

test('Extension: Wikidata Properties', async ({ page }) => {
  test.setTimeout(120000);
  const wikidataService = "Wikidata reconciliation (en)";
  const wikidataURL = "https://wikidata-reconciliation.wmcloud.org/en/api";
  //Reconciliation Match Location Wikidata providing Match Country column as context
  await page.locator('th:nth-child(3) > .column-header-title > .column-header-menu').click();
  await page.getByRole('link', { name: 'Reconcile' }).click();
  await page.getByRole('link', { name: 'Start reconciling…' }).click();
  await checkOrAddService(page, wikidataService, wikidataURL);
  await page.getByRole('button', { name: 'Next »' }).click();
  await expect(page.getByText('Reconcile column Manager')).toBeVisible();
  await expect(page.getByRole('radio', { name: 'human Q5' })).toBeChecked({ timeout: 100000 });
  await page.getByRole('button', { name: 'Start reconciling...' }).click();
  await expect(page.getByText('Reconcile cells in column Manager to type Q5')).toBeVisible();
  await expect(page.getByText('includematched7')).toBeVisible({ timeout: 100000 });
  await expect(page.getByText('includenone8')).toBeVisible({ timeout: 100000 });

  await page.getByRole('link', { name: 'Steve Bruce' }).first().hover();
  await page.getByRole('button', { name: 'Match this cell' }).click();
  await expect(page.locator('#notification').getByText('Match Steve Bruce (Q331904)')).toBeVisible();
  await page.getByRole('link', { name: 'Eddie Howe', exact: true }).hover();
  await page.getByRole('button', { name: 'Match this cell' }).click();
  await expect(page.locator('#notification').getByText('Match Eddie Howe (Q5336135)')).toBeVisible();
  await page.getByRole('link', { name: 'Antonio Conte' }).first().hover();
  await page.getByRole('button', { name: 'Match this cell' }).click();
  await expect(page.locator('#notification').getByText('Match Antonio Conte (Q26580)')).toBeVisible();
  await page.getByRole('link', { name: 'Frank de Boer' }).first().hover();
  await page.getByRole('button', { name: 'Match this cell' }).click();
  await expect(page.locator('#notification').getByText('Match Frank de Boer (Q219657')).toBeVisible();
  await page.getByRole('link', { name: 'Ronald Koeman', exact: true }).hover();
  await page.getByRole('button', { name: 'Match this cell' }).click();
  await expect(page.locator('#notification').getByText('Match Ronald Koeman (Q192635')).toBeVisible();
  await page.getByRole('link', { name: 'David Wagner' }).first().hover();
  await page.getByRole('button', { name: 'Match this cell' }).click();
  await expect(page.locator('#notification').getByText('Match David Wagner (Q871069)')).toBeVisible();
  await page.getByRole('link', { name: 'Mark Hughes' }).first().hover();
  await page.getByRole('button', { name: 'Match this cell' }).click();
  await expect(page.locator('#notification').getByText('Match Mark Hughes (Q214513)')).toBeVisible();
  await page.getByRole('link', { name: 'Paul Clement' }).nth(1).hover();
  await page.getByRole('button', { name: 'Match this cell' }).click();
  await expect(page.locator('#notification').getByText('Match Paul Clement (Q15708728')).toBeVisible();

  await page.getByRole('columnheader', { name: 'Manager' }).getByRole('button').click();
  await page.getByRole('link', { name: 'Edit column' }).click();
  await page.getByRole('link', { name: 'Add columns from reconciled' }).click();
  await expect(page.getByText('Add columns from reconciled')).toBeVisible();
  await page.getByRole('textbox', { name: 'Add property' }).click();
  await page.getByRole('textbox', { name: 'Add property' }).fill('position');
  await page.getByText('position played on team /').click();
  await expect(page.getByRole('columnheader', { name: 'position played on team /' })).toBeVisible();
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(page.getByText('Extend data at index 2 based')).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'position played on team /' })).toBeVisible();
});
