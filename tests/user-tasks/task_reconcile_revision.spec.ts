import { test, expect } from '@playwright/test';
import { login, getOrCreateDataset, getOrCreateTable } from '../utils/setup.utils';

test.beforeEach(async ({ page }) => {
  const urlLocal = '/';
  // Please provide your local base directory path below
  const baseDirectory = 'FILE_PATH';
  const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_sample.csv`;
  const datasetName = 'Dataset_test';
  const tableName = 'table_task_1';
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

test('Reconcile and Revision', async ({ page, context }) => {
  const reconcileBtn = page.getByRole('button', { name: 'Reconcile', exact: true });
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);

  await test.step('Reconcile Football Club Column', async () => {
    test.setTimeout(120000);
    const footballClubHeader = page.locator('th').filter({ hasText: /^Football Club$/ });
    await expect(footballClubHeader).toBeVisible();
    await footballClubHeader.click();
    console.log('Column "Football Club" selected.');

    await expect(reconcileBtn).toBeEnabled();
    await reconcileBtn.click();

    await page.getByText('Choose a service group...').click();
    await page.getByRole('option', { name: 'Wikidata', exact: true }).click();
    const serviceSelect = page.getByText('Choose a reconciliation service...');
    await expect(serviceSelect).toBeEnabled();
    await serviceSelect.click();
    await page.getByRole('option', { name: 'Linking: Wikidata (Alligator)', exact: true }).click();
    await expect(page.getByText('A general purpose reconciliation service')).toBeVisible();
    console.log('Linking: Wikidata (Alligator) selected.');

    const contextSelect = page.locator('#mui-component-select-additionalColumns');
    await contextSelect.click();
    await page.getByRole('option', { name: 'Manager', exact: true }).click();
    await page.getByRole('option', { name: 'Team Captain', exact: true }).click();
    await page.getByRole('listbox').getByRole('button', { name: 'Confirm' }).click();
    console.log('Column "Manager" and "Team Captain" selected as additional column.');

    await expect(page.getByRole('combobox', { name: 'Manager , Team Captain' })).toBeVisible();
    await page.getByRole('dialog').getByRole('button', { name: 'Confirm' }).click();
    console.log('Reconciliation in process.');

    await expect(page.getByText('Learn more about annotation')).toBeVisible({ timeout: 100000 });
    console.log('Column "Football Club" reconciled.');
  });

  await test.step('Manual Reconciliation Arsenal Cell', async () => {
    const cellHeading = page.getByRole('heading', { name: 'Arsenal' });
    const arsenalCell = page.getByRole('gridcell', { name: 'Arsenal' });
    const searchBtn = page.getByRole('button', { name: 'Search "Arsenal" in Wikidata' });

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

  await test.step('Manual Reconciliation Chelsea Cell', async () => {
    const cellHeading = page.getByRole('heading', { name: 'Chelsea' });
    const chelseaCell = page.getByRole('gridcell', { name: 'Chelsea' });
    const searchBtn = page.getByRole('button', { name: 'Search "Chelsea" in Wikidata' });

    await chelseaCell.first().getByLabel('open-metadata-dialog').click();
    await expect(cellHeading).toBeVisible();
    console.log('Manage Metadata for "Chelsea" Cell opened.');

    await page.getByRole('button', { name: 'Add metadata' }).click();
    await page.locator('#mui-component-select-prefix').click();
    await page.getByRole('option', { name: 'wd (Wikidata)', exact: true }).click();
    await expect(searchBtn).toBeVisible();
    const pageWikidataChelseaPromise = page.waitForEvent('popup');
    await searchBtn.click();
    const pageWikidataChelsea = await pageWikidataChelseaPromise;
    await expect(pageWikidataChelsea.getByRole('link', { name: 'Chelsea F.C. (Q9616)' })).toBeVisible();
    await pageWikidataChelsea.getByRole('link', { name: 'Chelsea F.C. (Q9616)' }).click();
    await expect(pageWikidataChelsea.getByText('association football club in London, England').first()).toBeVisible({ timeout: 10000 });
    console.log('Correct Entity for "Chelsea" Cell found.');

    const wikiListUrl = pageWikidataChelsea.url();
    console.log('URL di Wikidata:', wikiListUrl);
    await page.evaluate((url) => navigator.clipboard.writeText(url), wikiListUrl);
    console.log('URL of the entity copied.');

    const uriInput = page.getByRole('textbox', { name: 'Uri' });
    await uriInput.click();
    const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
    await page.keyboard.press(`${modifier}+V`);
    await expect(uriInput).toHaveValue(wikiListUrl);
    console.log('URL of the entity pasted.');

    await expect(page.getByRole('textbox', { name: 'Name' })).toHaveValue('Chelsea F.C.', { timeout: 10000 });
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await expect(page.getByText('wd:Q9616')).toBeVisible({ timeout: 10000 });
    const checkboxCorrectEntity = page.locator('tr')
      .filter({ hasText: 'wd:Q9616' })
      .locator('input[type="checkbox"]');
    await expect(checkboxCorrectEntity).toBeChecked();
    console.log('Correct entity selected.');

    await page.getByRole('button', { name: 'Confirm and Propagate' }).click();
    await expect(page.getByRole('heading', { name: 'Are you sure to propagate?' })).toBeVisible();
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(chelseaCell.first().getByLabel('status-match-manual')).toBeVisible();
    console.log('"Chelsea" cell reconciled.');
  });

  await test.step('Manual Reconciliation Liverpool Cell', async () => {
    const cellHeading = page.getByRole('heading', { name: 'Liverpool' });
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
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(liverpoolCell.first().getByLabel('status-match-manual')).toBeVisible();
    console.log('"Liverpool" cell rconciled.');
  });
});
