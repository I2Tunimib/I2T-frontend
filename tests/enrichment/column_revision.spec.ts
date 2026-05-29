import { test, expect } from '@playwright/test';
import { login, getOrCreateDataset, getOrCreateTable } from '../utils/setup.utils';
import { getComponents } from "../utils/components.utils";

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
  const ui = getComponents(page);
  const columnFootball = page.getByRole('columnheader', { name: 'Football Club' });

  await columnFootball.click();
  console.log('Football Club" selected.');

  await ui.metadataBtn.click();
  await expect(page.getByRole('heading', { name: 'Football Club' })).toBeVisible();
  await page.getByRole('combobox', { name: 'Column Kind:' }).click();
  await page.getByRole('option', { name: 'Named Entity' }).click();
  await page.getByRole('combobox', { name: 'Column Role:' }).click();
  await page.getByRole('option', { name: 'Subject' }).click();
  await ui.confirmCloseBtn.click();
  await expect(ui.confirmBtn).toBeEnabled();
  await ui.confirmBtn.click();
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
  const ui = getComponents(page);
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);

  test.setTimeout(120000);
  const columnSupplier = page.getByRole('columnheader', { name: 'Supplier' });

  await columnSupplier.click();
  console.log('Football Club" selected.');

  await ui.metadataBtn.click();
  await expect(page.getByRole('tab', { name: 'Column types' })).toBeVisible();
  await ui.addType.click();
  await expect(ui.searchBtn).toBeVisible();
  await ui.searchBtn.click();

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
  await ui.addBtn.click();
  await ui.nextPageBtn.click();
  await expect(page.getByRole('cell', { name: 'wd:Q1762621' })).toBeVisible();
  console.log('Type added and selected.');

  await ui.confirmCloseBtn.click();
  await expect(ui.confirmBtn).toBeEnabled();
  await ui.confirmBtn.click();
  console.log('Addition of "vendor" type successful.');
});

test('Column Revision - Property (entity-entity)', async ({ page, context }) => {
  const ui = getComponents(page);
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);

  test.setTimeout(120000);
  const columnMatchLoc = page.getByRole('columnheader', { name: 'Match Location' });

  await columnMatchLoc.click();
  console.log('Match Location" selected.');

  await ui.metadataBtn.click();
  await expect(page.getByRole('heading', { name: 'Match Location' })).toBeVisible();
  await page.getByRole('tab', { name: 'Column properties' }).click();
  await ui.addPropertyBtn.click();
  await expect(ui.viewBtn).toBeVisible();
  await ui.viewBtn.click();

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
  await ui.addBtn.click();
  await expect(page.getByRole('cell', { name: 'wd:P17' })).toBeVisible();
  console.log('Property added and selected.');

  await ui.confirmCloseBtn.click();
  await expect(ui.confirmBtn).toBeEnabled();
  await ui.confirmBtn.click();
  console.log('Addition of "country" property successful.');
});

test('Column Revision - Property (entity-literal)', async ({ page, context }) => {
  const ui = getComponents(page);
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);

  test.setTimeout(120000);
  const columnMatchDate = page.getByRole('columnheader', { name: 'Match Date' });

  await columnMatchDate.click();
  console.log('Match Date" selected.');

  await ui.metadataBtn.click();
  await expect(page.getByRole('heading', { name: 'Match Date' })).toBeVisible();
  await page.getByRole('tab', { name: 'Column properties' }).click();
  await expect(ui.viewBtn).toBeVisible();
  await ui.viewBtn.click();

  const pageWikidataPromise = page.waitForEvent('popup');
  const pageWikidataList = await pageWikidataPromise;
  await pageWikidataList.getByRole('link', { name: '500' }).first().click();
  await expect(pageWikidataList.getByRole('link', { name: 'point in time (P585)' })).toBeVisible();
  await pageWikidataList.getByRole('link', { name: 'point in time (P585)' }).click();
  await expect(pageWikidataList.locator('#firstHeading').getByText('point in time')).toBeVisible();
  console.log('Property "point in time" found.');

  await ui.cancelBtn.click();
  const columnMatchLoc = page.getByRole('columnheader', { name: 'Match Location' });
  await columnMatchLoc.click();
  console.log('Column "Match Location" selected.');

  await ui.metadataBtn.click();
  await expect(page.getByRole('heading', { name: 'Match Location' })).toBeVisible();
  await page.getByRole('tab', { name: 'Column properties' }).click();
  await ui.addPropertyBtn.click();

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
  await ui.addBtn.click();
  await expect(page.getByRole('cell', { name: 'wd:P585' })).toBeVisible();
  console.log('Property added and selected.');

  await ui.confirmCloseBtn.click();
  console.log('Addition of "point in time" property successful.');
});
