import { test, expect } from '@playwright/test';
import { login, getOrCreateDataset, getOrCreateTable } from '../utils/setup.utils';

test.beforeEach(async ({ page }) => {
  const urlLocal = '/';
  // Please provide your local base directory path below
  const baseDirectory = 'FILE_PATH';
  const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_fullTableAnnotation.json`;
  const datasetName = 'Dataset_test';
  const tableName = 'table_columnRevision';
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

test('Column Revision - Kind/Role', async ({ page }) => {
  test.setTimeout(120000);
  const columnFootball = page.getByRole('columnheader', { name: 'Football Club' });
  const confirmBtn = page.getByRole('button', { name: 'Confirm' });

  await columnFootball.click();
  console.log('Football Club" selected.');

  await page.getByRole('button', { name: 'open-metadata-dialog-subtoolbar' }).click();
  await expect(page.getByRole('heading', { name: 'Football Club' })).toBeVisible();
  await page.getByRole('combobox', { name: 'Column Kind:' }).click();
  await page.getByRole('option', { name: 'Named Entity' }).click();
  await page.getByRole('combobox', { name: 'Column Role:' }).click();
  await page.getByRole('option', { name: 'Subject' }).click();
  await page.getByRole('button', { name: 'Confirm and Close' }).click();
  await expect(confirmBtn).toBeEnabled();
  await confirmBtn.click();
  const footballClubKind = page
    .getByRole('columnheader', { name: /Football Club/i })
    .getByLabel('kind-entity');
  const footballClubRole = page
    .getByRole('columnheader', { name: /Football Club/i })
    .getByLabel('role-subject');
  await expect(footballClubKind).toBeVisible();
  await expect(footballClubRole).toBeVisible();
  console.log('Football Club" named entity and subject.');
});

test('Column Revision - Type', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);

  test.setTimeout(120000);
  const columnSupplier = page.getByRole('columnheader', { name: 'Supplier' });
  const searchBtn = page.getByRole('button', { name: 'Search' });
  const confirmBtn = page.getByRole('button', { name: 'Confirm' });

  await columnSupplier.click();
  console.log('Football Club" selected.');

  await page.getByRole('button', { name: 'open-metadata-dialog-subtoolbar' }).click();
  await expect(page.getByRole('tab', { name: 'Column types' })).toBeVisible();
  await page.getByRole('button', { name: 'Add type' }).click();
  await expect(searchBtn).toBeVisible();
  await searchBtn.click();

  const pageWikidataPromise = page.waitForEvent('popup');
  const pageWikidata = await pageWikidataPromise;
  await expect(pageWikidata.getByRole('link', { name: 'vendor (Q1762621)' })).toBeVisible();
  await pageWikidata.getByRole('link', { name: 'vendor (Q1762621)' }).click();
  await expect(pageWikidata.locator('#firstHeading').getByText('vendor')).toBeVisible();
  await expect(pageWikidata.getByText('business that supplies,').first()).toBeVisible({ timeout: 10000 });
  console.log('Type "business" found.');

  const selectPrefix = page.locator('#mui-component-select-prefix');
  await selectPrefix.click();
  await page.getByRole('option', { name: 'wd (Wikidata)', exact: true }).click();

  const wikiUrl = pageWikidata.url();
  console.log('URL di Wikidata:', wikiUrl);
  await page.evaluate((url) => navigator.clipboard.writeText(url), wikiUrl);
  console.log('URL of the type copied.');

  const uriInput = page.getByRole('textbox', { name: 'Uri' });
  await uriInput.click();
  const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
  await page.keyboard.press(`${modifier}+V`);
  await expect(uriInput).toHaveValue(wikiUrl);
  console.log('URL of the type pasted.');

  await expect(page.getByRole('textbox', { name: 'Name' })).toHaveValue('vendor', { timeout: 100000 });
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.getByRole('button', { name: 'Go to next page' }).click();
  await expect(page.getByRole('cell', { name: 'wd:Q1762621' })).toBeVisible();
  console.log('Type added and selected.');

  await page.getByRole('button', { name: 'Confirm and Close' }).click();
  await expect(confirmBtn).toBeEnabled();
  await confirmBtn.click();
  console.log('Addition of "vendor" type successful.');
});

test('Column Revision - Property (entity-entity)', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);

  test.setTimeout(120000);
  const columnMatchLoc = page.getByRole('columnheader', { name: 'Match Location' });
  const viewBtn = page.getByRole('button', { name: 'View' });
  const confirmBtn = page.getByRole('button', { name: 'Confirm' });

  await columnMatchLoc.click();
  console.log('Match Location" selected.');

  await page.getByRole('button', { name: 'open-metadata-dialog-subtoolbar' }).click();
  await expect(page.getByRole('heading', { name: 'Match Location' })).toBeVisible();
  await page.getByRole('tab', { name: 'Column properties' }).click();
  await page.getByRole('button', { name: 'Add property' }).click();
  await expect(viewBtn).toBeVisible();
  await viewBtn.click();

  const pageWikidataPromise = page.waitForEvent('popup');
  const pageWikidataList = await pageWikidataPromise;
  await pageWikidataList.getByRole('link', { name: '500' }).first().click();
  await pageWikidataList.getByRole('link', { name: 'country (P17)' }).click();
  await expect(pageWikidataList.locator('#firstHeading').getByText('country')).toBeVisible();
  console.log('Property "country" found.');

  const selectPrefix = page.locator('#mui-component-select-prefix');
  await selectPrefix.click();
  await page.getByRole('option', { name: 'wd (Wikidata)', exact: true }).click();

  const wikiListUrl = pageWikidataList.url();
  console.log('URL di Wikidata:', wikiListUrl);
  await page.evaluate((url) => navigator.clipboard.writeText(url), wikiListUrl);
  console.log('URL of the property copied.');

  const uriInput = page.getByRole('textbox', { name: 'Uri' });
  await uriInput.click();
  const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
  await page.keyboard.press(`${modifier}+V`);
  await expect(uriInput).toHaveValue(wikiListUrl);
  console.log('URL of the property pasted.');

  await expect(page.getByRole('textbox', { name: 'Name' })).toHaveValue('country', { timeout: 100000 });

  const objSelect = page.locator('#mui-component-select-obj');
  await objSelect.click();
  await page.getByRole('option', { name: 'Match Country' }).click();
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await expect(page.getByRole('cell', { name: 'wd:P17' })).toBeVisible();
  console.log('Property added and selected.');

  await page.getByRole('button', { name: 'Confirm and Close' }).click();
  await expect(confirmBtn).toBeEnabled();
  await confirmBtn.click();
  console.log('Addition of "country" property successful.');
});

test('Column Revision - Property (entity-literal)', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);

  test.setTimeout(120000);
  const columnMatchDate = page.getByRole('columnheader', { name: 'Match Date' });
  const viewBtn = page.getByRole('button', { name: 'View' });

  await columnMatchDate.click();
  console.log('Match Date" selected.');

  await page.getByRole('button', { name: 'open-metadata-dialog-subtoolbar' }).click();
  await expect(page.getByRole('heading', { name: 'Match Date' })).toBeVisible();
  await page.getByRole('tab', { name: 'Column properties' }).click();
  await expect(viewBtn).toBeVisible();
  await viewBtn.click();

  const pageWikidataPromise = page.waitForEvent('popup');
  const pageWikidataList = await pageWikidataPromise;
  await pageWikidataList.getByRole('link', { name: '500' }).first().click();
  await expect(pageWikidataList.getByRole('link', { name: 'point in time (P585)' })).toBeVisible();
  await pageWikidataList.getByRole('link', { name: 'point in time (P585)' }).click();
  await expect(pageWikidataList.locator('#firstHeading').getByText('point in time')).toBeVisible();
  console.log('Property "point in time" found.');

  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  const columnMatchLoc = page.getByRole('columnheader', { name: 'Match Location' });
  await columnMatchLoc.click();
  console.log('Column "Match Location" selected.');

  await page.getByRole('button', { name: 'open-metadata-dialog-subtoolbar' }).click();
  await expect(page.getByRole('heading', { name: 'Match Location' })).toBeVisible();
  await page.getByRole('tab', { name: 'Column properties' }).click();
  await page.getByRole('button', { name: 'Add property' }).click();

  const selectPrefix = page.locator('#mui-component-select-prefix');
  await selectPrefix.click();
  await page.getByRole('option', { name: 'wd (Wikidata)', exact: true }).click();

  const wikiListUrl = pageWikidataList.url();
  console.log('URL di Wikidata:', wikiListUrl);
  await page.evaluate((url) => navigator.clipboard.writeText(url), wikiListUrl);
  console.log('URL of the property copied.');

  const uriInput = page.getByRole('textbox', { name: 'Uri' });
  await uriInput.click();
  const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
  await page.keyboard.press(`${modifier}+V`);
  await expect(uriInput).toHaveValue(wikiListUrl);
  console.log('URL of the property pasted.');

  await expect(page.getByRole('textbox', { name: 'Name' })).toHaveValue('point in time');

  const objSelect = page.locator('#mui-component-select-obj');
  await objSelect.click();
  await page.getByRole('option', { name: 'Match Date' }).click();
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await expect(page.getByRole('cell', { name: 'wd:P585' })).toBeVisible();
  console.log('Property added and selected.');

  await page.getByRole('button', { name: 'Confirm and Close' }).click();
  console.log('Addition of "point in time" property successful.');
});
