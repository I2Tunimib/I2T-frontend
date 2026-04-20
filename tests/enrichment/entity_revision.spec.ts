import { test, expect } from '@playwright/test';
import { login, getOrCreateDataset, getOrCreateTable } from '../utils/setup.utils';

test.beforeEach(async ({ page }) => {
  test.setTimeout(120000);
  const urlLocal = '/';
  // Please provide your local base directory path below
  const baseDirectory = 'FILE_PATH';
  const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_entityRevision.json`;
  const datasetName = 'Dataset_test';
  const tableName = 'table_entityRevision';
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

test('Entity Matching Revision - Selection', async ({ page }) => {
  const cellHeading = page.getByRole('heading', { name: 'Liverpool' });
  const confirmBtn = page.getByRole('button', { name: 'Confirm' });
  const liverpoolCell = page.getByRole('gridcell', { name: 'Liverpool' });

  await liverpoolCell.first().getByLabel('open-metadata-dialog').click();
  await expect(cellHeading).toBeVisible();
  console.log('Manage Metadata for "Liverpool" Cell opened.');

  await page.getByRole('button', { name: '👉' }).first().click();
  await expect(page.getByText('association football club', { exact: true })).toBeVisible();
  await page.getByRole('row', { name: 'wd:Q1130849 Liverpool (1) 👇' }).getByRole('link').click();
  const pageWikidataPromise = page.waitForEvent('popup');
  const pageWikidata = await pageWikidataPromise;
  await expect(pageWikidata.locator('#firstHeading').getByText('Liverpool')).toBeVisible();
  await expect(pageWikidata.getByText('association football club in Liverpool, England').first()).toBeVisible();
  console.log('Entity correct for cell "Liverpool" checked.');

  const checkboxCorrectEntity = page.locator('tr')
    .filter({ hasText: 'wd:Q1130849' })
    .locator('input[type="checkbox"]');
  await checkboxCorrectEntity.click();
  await expect(checkboxCorrectEntity).toBeChecked();
  await expect(page.getByRole('button', { name: 'Confirm and Propagate' })).toBeEnabled();
  await page.getByRole('button', { name: 'Confirm and Propagate' }).click();
  await expect(page.getByRole('heading', { name: 'Are you sure to propagate?' })).toBeVisible();
  await confirmBtn.click();
  await expect(liverpoolCell.first().getByLabel('status-match-manual')).toBeVisible();
  console.log('"Liverpool" cell rconciled.');
});

test('Entity Matching Revision - Search', async ({ page, context }) => {
  const cellHeading = page.getByRole('heading', { name: 'Arsenal' });
  const arsenalCell = page.getByRole('gridcell', { name: 'Arsenal' });
  const searchBtn = page.getByRole('button', { name: 'Search "Arsenal" in Wikidata' });
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);

  await arsenalCell.first().getByLabel('open-metadata-dialog').click();
  await expect(cellHeading).toBeVisible();
  console.log('Manage Metadata for "Arsenal" Cell opened.');

  await page.getByRole('button', { name: 'Add metadata' }).click();
  await page.locator('#mui-component-select-prefix').click();
  await page.getByRole('option', { name: 'wd (Wikidata)', exact: true }).click();
  await expect(searchBtn).toBeVisible();
  const pageWikidataArsenalPromise = page.waitForEvent('popup');
  await searchBtn.click();
  const pageWikidataArsenal = await pageWikidataArsenalPromise;
  await expect(pageWikidataArsenal.getByRole('link', { name: 'Arsenal F.C. (Q9617)' })).toBeVisible();
  await pageWikidataArsenal.getByRole('link', { name: 'Arsenal F.C. (Q9617)' }).click();
  await expect(pageWikidataArsenal.getByText('association football club in London, England').first()).toBeVisible({ timeout: 10000 });
  console.log('Correct Entity for "Arsenal" Cell found.');

  const wikiListUrl = pageWikidataArsenal.url();
  console.log('URL di Wikidata:', wikiListUrl);
  await page.evaluate((url) => navigator.clipboard.writeText(url), wikiListUrl);
  console.log('URL of the entity copied.');

  const uriInput = page.getByRole('textbox', { name: 'Uri' });
  await uriInput.click();
  const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
  await page.keyboard.press(`${modifier}+V`);
  await expect(uriInput).toHaveValue(wikiListUrl);
  console.log('URL of the entity pasted.');

  await expect(page.getByRole('textbox', { name: 'Name' })).toHaveValue('Arsenal F.C.', { timeout: 10000 });
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await expect(page.getByText('wd:Q9617')).toBeVisible({ timeout: 10000 });
  const checkboxCorrectEntity = page.locator('tr')
    .filter({ hasText: 'wd:Q9617' })
    .locator('input[type="checkbox"]');
  await expect(checkboxCorrectEntity).toBeChecked();
  console.log('Correct entity selected.');

  await page.getByRole('button', { name: 'Confirm and Propagate' }).click();
  await expect(page.getByRole('heading', { name: 'Are you sure to propagate?' })).toBeVisible();
  await page.getByRole('button', { name: 'Confirm' }).click();
  await expect(arsenalCell.first().getByLabel('status-match-manual')).toBeVisible();
  console.log('"Arsenal" cell reconciled.');
});
