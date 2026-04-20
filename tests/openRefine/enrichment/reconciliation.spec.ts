import { test, expect } from '@playwright/test';
import { checkOrAddService } from '../../utils/setup.utils';

test.beforeEach(async ({ page }) => {
  test.setTimeout(120000);
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

test('Reconcile Linking: Wikidata (Alligator)', async ({ page }) => {
  const wikidataAlligatorService = "Alligator EMD Reconciliation Service";
  const wikidataAlligatorURL = "http://vm.chronos.disco.unimib.it:3004/alligator/reconcile";

  await page.locator('th:nth-child(8) > .column-header-title > .column-header-menu').click();
  await page.getByRole('link', { name: 'Reconcile' }).click();
  await page.getByRole('link', { name: 'Start reconciling…' }).click();
  await checkOrAddService(page, wikidataAlligatorService, wikidataAlligatorURL);
  await page.getByRole('button', { name: 'Next »' }).click();
  await expect(page.getByText('Reconcile column Match Country')).toBeVisible();
  await page.getByRole('textbox', { name: 'Type' }).click();
  await page.getByRole('textbox', { name: 'Type' }).fill('sovereign state');
  await page.getByText('sovereign state').first().click();
  await page.getByRole('spinbutton', { name: 'Maximum number of candidates' }).click();
  await page.getByRole('spinbutton', { name: 'Maximum number of candidates' }).fill('20');
  await page.getByRole('button', { name: 'Start reconciling...' }).click();
  await expect(page.getByText('includematched15')).toBeVisible({ timeout: 100000 });

  await page.getByRole('link', { name: 'Germany' }).first().click();
  const pageWikidataPromise = page.waitForEvent('popup');
  const pageWikidata = await pageWikidataPromise;
  await expect(pageWikidata.getByText('article scientifique')).toBeVisible();
  await page.getByRole('link', { name: 'Choose new match' }).nth(1).click();
  await page.getByText('OpenRefine Football Clubs').click();
  await page.getByRole('link', { name: 'See more' }).first().click();
  await page.evaluate(() => {
    document.body.style.zoom = "0.6";
  });
  await page.locator('div:nth-child(12) > span > .data-table-recon-topic').first().hover();
  await page.getByRole('button', { name: 'Match all identical cells' }).click();
  await expect(page.locator('#notification').getByText('Match item')).toBeVisible({ timeout: 100000 });
  await expect(page.getByText('includematched15')).toBeVisible({ timeout: 100000 });
});

test('Reconcile Linking: Wikidata (OpenRefine)', async ({ page }) => {
  const wikidataService = "Wikidata reconciliation (en)";
  const wikidataURL = "https://wikidata-reconciliation.wmcloud.org/en/api";

  await page.locator('th:nth-child(8) > .column-header-title > .column-header-menu').click();
  await page.getByRole('link', { name: 'Reconcile' }).click();
  await page.getByRole('link', { name: 'Start reconciling…' }).click();
  await checkOrAddService(page, wikidataService, wikidataURL);
  await page.getByRole('button', { name: 'Next »' }).click();
  await expect(page.getByText('Reconcile column Match Country')).toBeVisible();
  await expect(page.getByRole('radio', { name: 'historical country Q3024240' })).toBeChecked({ timeout: 100000 });
  await page.getByRole('radio', { name: 'sovereign state Q3624078' }).check();
  await expect(page.getByRole('radio', { name: 'sovereign state Q3624078' })).toBeChecked({ timeout: 100000 });
  await page.getByRole('button', { name: 'Start reconciling...' }).click();
  await expect(page.getByText('includenone15')).toBeVisible({ timeout: 100000 });

  await page.getByText('Germany').nth(1).hover();
  await page.getByRole('button', { name: 'Match all identical cells' }).click();
  await expect(page.locator('#notification').getByText('Match item')).toBeVisible({ timeout: 100000 });
  await expect(page.getByText('includematched15')).toBeVisible({ timeout: 100000 });
});

/*
test('Reconcile Match Location Geo Coordinates GeoNames', async ({ page, context }) => {
  const wikidataService = "Wikidata reconciliation (en)";
  const wikidataURL = "https://wikidata-reconciliation.wmcloud.org/en/api";
  //Reconciliation Match Location Wikidata providing Match Country column as context
  await page.locator('th:nth-child(7) > .column-header-title > .column-header-menu').click();
  await page.getByRole('link', { name: 'Reconcile' }).click();
  await page.getByRole('link', { name: 'Start reconciling…' }).click();
  await checkOrAddService(page, wikidataService, wikidataURL);
  await page.getByRole('button', { name: 'Next »' }).click();
  await expect(page.getByText('Reconcile column Match Location')).toBeVisible();
  await expect(page.getByRole('radio', { name: 'urban municipality in Germany Q42744322' })).toBeChecked({ timeout: 100000 });
  await page.getByRole('row', { name: 'Match Country', exact: true }).getByRole('textbox').click();
  await page.getByRole('row', { name: 'Match Country', exact: true }).getByRole('textbox').fill('country');
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
  await page.locator('th:nth-child(7) > .column-header-title > .column-header-menu').click();
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
 */

test('Reconcile Match Location GeoNames', async ({ page }) => {
  const geonamesService = "GeoNames Reconciliation";
  const geonamesURL = "http://fornpunkt.se/apis/reconciliation/geonames";

  await page.locator('th:nth-child(7) > .column-header-title > .column-header-menu').click();
  await page.getByRole('link', { name: 'Reconcile' }).click();
  await page.getByRole('link', { name: 'Start reconciling…' }).click();
  await checkOrAddService(page, geonamesService, geonamesURL);
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByText('Reconcile column Match')).toBeVisible();
  await expect(page.locator('td').filter({ hasText: /^Concept$/ })).toBeVisible();
  await page.getByRole('button', { name: 'Start reconciling...' }).click();
  await expect(page.locator('#notification').getByText('Reconcile cells in column')).toBeVisible({ timeout: 100000 });
  await expect(page.getByText('includenone15')).toBeVisible({ timeout: 100000 });

  //Entity Matching Revision and Manual Reconciliation for all cells
  await page.getByText('Kirchheim unter Teck').nth(1).hover();
  await page.getByRole('link', { name: 'Match this item to this and' }).first().click();
  await expect(page.locator('#notification').getByText('Match item')).toBeVisible({ timeout: 100000 });

  await page.getByText('Herrenberg').nth(1).hover();
  await page.getByRole('link', { name: 'Match this item to this and' }).first().click();
  await expect(page.locator('#notification').getByText('Match item')).toBeVisible({ timeout: 100000 });

  await page.getByText('Baden-Baden').nth(1).hover();
  await page.getByRole('link', { name: 'Match this item to this and' }).first().click();
  await expect(page.locator('#notification').getByText('Match item')).toBeVisible({ timeout: 100000 });

  await page.getByText('Aalen ').nth(1).hover();
  await page.getByRole('link', { name: 'Match this item to this and' }).first().click();
  await expect(page.locator('#notification').getByText('Match item')).toBeVisible({ timeout: 100000 });

  await page.getByText('Hockenheim').nth(1).hover();
  await page.getByRole('link', { name: 'Match this item to this and' }).first().click();
  await expect(page.locator('#notification').getByText('Match item')).toBeVisible({ timeout: 100000 });

  await page.getByText('Stuttgart').nth(1).hover();
  await page.getByRole('link', { name: 'Match this item to this and' }).first().click();
  await expect(page.locator('#notification').getByText('Match item')).toBeVisible({ timeout: 100000 });

  await page.getByText('Ludwigsburg').nth(1).hover();
  await page.getByRole('link', { name: 'Match this item to this and' }).first().click();
  await expect(page.locator('#notification').getByText('Match item')).toBeVisible({ timeout: 100000 });

  await page.getByText('Pforzheim').nth(1).hover();
  await page.getByRole('link', { name: 'Match this item to this and' }).first().click();
  await expect(page.locator('#notification').getByText('Match item')).toBeVisible({ timeout: 100000 });

  await page.getByText('Ubstadt-Weiher').nth(1).hover();
  await page.getByRole('link', { name: 'Match this item to this and' }).first().click();
  await expect(page.locator('#notification').getByText('Match item')).toBeVisible({ timeout: 100000 });

  await page.getByText('Lahr').nth(1).hover();
  await page.getByRole('link', { name: 'Match this item to this and' }).first().click();
  await expect(page.locator('#notification').getByText('Match item')).toBeVisible({ timeout: 100000 });

  await page.getByText('Oberkirch').nth(1).hover();
  await page.getByRole('link', { name: 'Match this item to this and' }).first().click();
  await expect(page.locator('#notification').getByText('Match item')).toBeVisible({ timeout: 100000 });

  await page.getByText('Friedrichshafen').nth(1).hover();
  await page.getByRole('link', { name: 'Match this item to this and' }).first().click();
  await expect(page.locator('#notification').getByText('Match item')).toBeVisible({ timeout: 100000 });

  await page.getByText('Leonberg').nth(1).hover();
  await page.getByRole('link', { name: 'Match this item to this and' }).first().click();
  await expect(page.locator('#notification').getByText('Match item')).toBeVisible({ timeout: 100000 });

  await page.getByText('Waldshut-Tiengen').nth(1).hover();
  await page.getByRole('link', { name: 'Match this item to this and' }).first().click();
  await expect(page.locator('#notification').getByText('Match item')).toBeVisible({ timeout: 100000 });

  //Check GeoNames ID
  await page.locator('th:nth-child(7) > .column-header-title > .column-header-menu').click();
  await page.getByRole('link', { name: 'Reconcile' }).click();
  await page.getByRole('link', { name: 'Add entity identifiers column…' }).click();
  await expect(page.getByText('Add column containing entity')).toBeVisible();
  await page.getByRole('textbox', { name: 'New column name' }).click();
  await page.getByRole('textbox', { name: 'New column name' }).fill('Match Location ID');
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(page.locator('#notification').getByText('Create new column')).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Match Location ID' })).toBeVisible({ timeout: 100000 });
});
