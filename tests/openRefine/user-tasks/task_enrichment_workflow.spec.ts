import { test, expect } from '@playwright/test';
import { checkOrAddService } from "../../utils/setup.utils";

test('Full Workflow', async ({ page }) => {
  test.setTimeout(1000000);
  await page.goto('http://127.0.0.1:3333/#create-project');

  //Upload file
  await test.step('Upload file', async () => {
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

  //Modification Match Date
  await test.step('Modification Match Date', async () => {
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
  });

  //Reconciliation Match Location Wikidata providing Match Country column as context
  await test.step('Reconciliation Match Location Wikidata', async () => {
    const wikidataService = "Wikidata reconciliation (en)";
    const wikidataURL = "https://wikidata-reconciliation.wmcloud.org/en/api";

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
  });

  //Entity Matching Reviison for Ubstadt-Weiher and Manual Reconciliation
  await test.step('Entity Matching Reviison', async () => {
    await page.getByText('Create new item').click();
    await page.getByRole('link', { name: 'Search for match' }).click();
    await expect(page.getByRole('dialog').getByText('Search for match')).toBeVisible();
    await page.getByRole('textbox', { name: 'Item to match' }).click();
    await page.getByText('Q520414Ubstadt-').click();
    await expect(page.locator('#notification').getByText('Match item Ubstadt-Weiher')).toBeVisible({ timeout: 100000 });
    await expect(page.getByText('includematched15')).toBeVisible();
  });

  //Extract coordinates from Match Location
  await test.step('Extract coordinates', async () => {
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
  });

  //Extension Meteo Properties max temperature and minimum temperature
  await test.step('Extension Meteo Properties', async () => {
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

    await page.locator('th:nth-child(9) > .column-header-title > .column-header-menu').click();
    await page.getByRole('link', { name: 'Edit column' }).click();
    await page.getByRole('link', { name: 'Add column by fetching URLs…' }).click();
    await page.getByRole('textbox', { name: 'New column name' }).click();
    await page.getByRole('textbox', { name: 'New column name' }).fill('weather_json');
    await page.getByRole('textbox', { name: 'Expression' }).click();
    await page.getByRole('textbox', { name: 'Expression' }).press('ControlOrMeta+a');
    await page.getByRole('textbox', { name: 'Expression' }).fill('"https://archive-api.open-meteo.com/v1/archive?"\n    + "latitude=" + cells["lat"].value\n    + "&longitude=" + cells["lon"].value\n    + "&daily=temperature_2m_min,temperature_2m_max"\n    + "&timezone=UTC"\n    + "&start_date=" + cells["Match Date iso"].value\n    + "&end_date=" + cells["Match Date iso"].value');
    await page.getByRole('link', { name: 'Preview' }).click();
    await expect(page.getByRole('cell', { name: '"https://archive-api.open-mete' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'https://archive-api.open-meteo.com/v1/archive?latitude=48.648333333333&' })).toBeVisible();
    await page.getByRole('button', { name: 'OK' }).click();
    await expect(page.getByText('Create column weather_json at')).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'weather_json' })).toBeVisible({ timeout: 150000 });

    await page.locator('th:nth-child(10) > .column-header-title > .column-header-menu').click();
    await page.getByRole('link', { name: 'Edit column' }).click();
    await page.getByRole('link', { name: 'Add column based on this' }).click();
    await page.getByRole('textbox', { name: 'New column name' }).click();
    await page.getByRole('textbox', { name: 'New column name' }).fill('max temp');
    await page.getByRole('textbox', { name: 'Expression' }).click();
    await page.getByRole('textbox', { name: 'Expression' }).press('ControlOrMeta+a');
    await page.getByRole('textbox', { name: 'Expression' }).fill('parseJson(value).daily.temperature_2m_max[0]');
    await expect(page.getByRole('cell', { name: 'parseJson(value).daily.tempera' })).toBeVisible({ timeout: 100000 });
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
    await expect(page.getByRole('cell', { name: 'parseJson(value).daily.tempera' })).toBeVisible({ timeout: 100000 });
    await expect(page.getByRole('cell', { name: '-1.5', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'OK' }).click();
    await expect(page.locator('#notification').getByText('Create new column min temp')).toBeVisible();
    await expect(page.getByText('min temp', { exact: true })).toBeVisible({ timeout: 100000 });

    await page.locator('th:nth-child(10) > .column-header-title > .column-header-menu').click();
    await page.getByRole('link', { name: 'Edit column' }).click();
    await page.getByRole('link', { name: 'Remove this column' }).click();
    await expect(page.locator('#notification')).toBeVisible();
  });

  //Export
  await test.step('Export', async () => {
    await page.getByRole('link', { name: 'Export' }).click();
    await page.getByRole('link', { name: 'Comma-separated value' }).click();
  });
});
