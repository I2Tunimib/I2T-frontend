import { test, expect } from '@playwright/test';
import { login, getOrCreateDataset, getOrCreateTable } from '../utils/setup.utils';

test.beforeEach(async ({ page }) => {
  const urlLocal = '/';
  // Please provide your local base directory path below
  const baseDirectory = 'FILE_PATH';
  const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_sample.csv`;
  const datasetName = 'Dataset_test';
  const tableName = 'table_task_3';
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

test('Schema Annotation & Graph Visualization', async ({ page, context }) => {
  const saveBtn = page.getByRole('button', { name: 'Save', exact: true });
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);

  await test.step('Modify Match Date Column', async () => {
    test.setTimeout(120000);
    const columnMatchDate = page.getByRole('columnheader', { name: 'Match Date' });
    const confirmBtn = page.getByRole('button', { name: 'Confirm', exact: true });
    const modifyBtn = page.getByRole('button', { name: 'Modify', exact: true });
    const selectService = page.getByText('Choose a modification service...');

    await columnMatchDate.click();
    console.log('Column "Match Date" selected.');

    await expect(modifyBtn).toBeEnabled();
    await modifyBtn.click();
    await expect(page.getByRole('heading', { name: 'Modification' })).toBeVisible();
    await selectService.click();
    await page.getByRole('option', { name: 'Date Formatter' }).click();
    await expect(page.getByText('A transformation function that converts date-like values in the selected')).toBeVisible();

    await page.getByRole('radio', { name: 'ISO' }).check();
    await page.locator('#mui-component-select-detailLevel').click();
    await page.getByRole('option', { name: 'Date only (yyyy-MM-dd)', exact: true }).click();
    console.log('"Date only (yyyy-MM-dd)" selected as level of detail.');

    await confirmBtn.click();
    await expect(page.getByText('column updated')).toBeVisible();
    const matchDateKind = page
      .getByRole('columnheader', { name: /Match Date/i })
      .getByLabel('kind-literal');
    await expect(matchDateKind).toBeVisible();
    console.log('Date Formatter successfully.');
  });

  await test.step('Schema Annotation', async () => {
    const autoAnnotationBtn = page.getByRole('button', { name: 'Automatic annotation', exact: true });
    const startAnnotationBtn = page.getByRole('button', { name: 'Start annotation', exact: true });

    //Open Automatic Annotation Dialog
    await expect(autoAnnotationBtn).toBeVisible();
    await autoAnnotationBtn.click();
    await page.getByRole('combobox', { name: 'Annotation target' }).click();
    await page.getByRole('option', { name: 'Schema' }).click();
    await expect(page.getByRole('combobox', { name: 'Annotation method' })).toBeEnabled();
    await page.getByRole('combobox', { name: 'Annotation method' }).click();
    await page.getByRole('option', { name: 'LLM Column Classifier' }).click();
    await expect(page.getByRole('button', { name: 'Start annotation' })).toBeEnabled();
    await startAnnotationBtn.click();

    //Automatic Annotation Completed
    await expect(page.getByText('Annotation schema for table')).toBeVisible({ timeout: 100000 });
    const footballClubBadge = page
      .getByRole('columnheader', { name: /Football Club/i })
      .getByLabel('kind-entity');
    const managerBadge = page
      .getByRole('columnheader', { name: /Manager/i })
      .getByLabel('kind-entity');
    const teamCaptainBadge = page
      .getByRole('columnheader', { name: /Team Captain/i })
      .getByLabel('kind-entity');
    const supplierBadge = page
      .getByRole('columnheader', { name: /Supplier/i })
      .getByLabel('kind-entity');
    const matchDateBadge = page
      .getByRole('columnheader', { name: /Match Date/i })
      .getByLabel('kind-literal');
    const matchLocationBadge = page
      .getByRole('columnheader', { name: /Match Location/i })
      .getByLabel('kind-entity');
    const matchCountryBadge = page
      .getByRole('columnheader', { name: /Match Country/i })
      .getByLabel('kind-entity');

    await expect(footballClubBadge).toBeVisible();
    await expect(managerBadge).toBeVisible();
    await expect(teamCaptainBadge).toBeVisible();
    await expect(supplierBadge).toBeVisible();
    await expect(matchDateBadge).toBeVisible();
    await expect(matchLocationBadge).toBeVisible();
    await expect(matchCountryBadge).toBeVisible();

    console.log('Schema annotated correctly with LLM Column Classifier.');
  });

  await test.step('Add country Property', async () => {
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
    const matchLocRole = page
      .getByRole('columnheader', { name: /Match Location/i })
      .getByLabel('role-subject');
    await expect(matchLocRole).toBeVisible();
    console.log('Addition of "country" property successful.');
  });

  await test.step('Add point in time Property', async () => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    test.setTimeout(120000);
    const columnMatchDate = page.getByRole('columnheader', { name: 'Match Date' });
    const viewBtn = page.getByRole('button', { name: 'View' });
    const confirmBtn = page.getByRole('button', { name: 'Confirm' });

    await columnMatchDate.click();
    await page.getByRole('button', { name: 'open-metadata-dialog-subtoolbar' }).click();
    await expect(page.getByRole('heading', { name: 'Match Date' })).toBeVisible();
    await page.getByRole('tab', { name: 'Column properties' }).click();
    await expect(viewBtn).toBeVisible();
    await viewBtn.click();

    const pageWikidataPromise = page.waitForEvent('popup');
    const pageWikidataList = await pageWikidataPromise;
    await pageWikidataList.getByRole('link', { name: '500' }).first().click();
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
    await confirmBtn.click();
    const matchLocRole = page
      .getByRole('columnheader', { name: /Match Location/i })
      .getByLabel('role-subject');
    await expect(matchLocRole).toBeVisible();
    console.log('Addition of "point in time" property successful.');
  });

  await test.step('Graph Visualization', async () => {
    test.setTimeout(120000);
    await saveBtn.click();
    console.log('Table saved.');

    await page.getByRole('button', { name: 'right aligned' }).click();
    console.log('Graph visualization opened.');

    await page.getByText('Show list').nth(1).click();
    await expect(page.getByText('P17')).toBeVisible();
    await expect(page.getByText('P585')).toBeVisible();
  });
});
