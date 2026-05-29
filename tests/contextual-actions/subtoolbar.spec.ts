import { test, expect } from '@playwright/test';
import { login, getOrCreateDataset, getOrCreateTable } from '../utils/setup.utils';
import { getComponents } from "../utils/components.utils";

test.beforeEach(async ({ page }) => {
  const urlLocal = '/';
  // Please provide your local base directory path below
  const baseDirectory = 'FILE_PATH';
  const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_fullTableAnnotation.json`;
  const datasetName = 'Dataset_test';
  const tableName = 'table_subtoolbar';
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

test('Toggle view', async ({ page }) => {
  const ui = getComponents(page);

  await ui.accessibleViewBtn.click();
  await expect(ui.denseViewBtn).toBeVisible();
  console.log('Accessible view chenged.');

  await ui.denseViewBtn.click();
  await expect(ui.accessibleViewBtn).toBeVisible();
  console.log('Dense view changed.');
});

test('Visibility', async ({ page }) => {
  const ui = getComponents(page);
  const columnFootball = page.getByRole('columnheader', { name: 'Football Club' });
  const columnManager = page.getByRole('columnheader', { name: 'Manager' });
  const columnTeamCaptain = page.getByRole('columnheader', { name: 'Team Captain' });
  const columnSupplier = page.getByRole('columnheader', { name: 'Supplier' });
  const columnMatchDate = page.getByRole('columnheader', { name: 'Match Date' });
  const columnMatchLocation = page.getByRole('columnheader', { name: 'Match Location' });
  const columnMatchCountry = page.getByRole('columnheader', { name: 'Match Country' });

  //Open Visibility menu
  await ui.visibilityBtn.click();
  await expect(page.getByRole('menu')).toBeVisible();

  //Hide Football column
  await page.getByRole('listitem').filter({ hasText: 'Football Club' }).getByRole('checkbox').uncheck();
  await expect(columnFootball).not.toBeVisible();
  console.log('Column "Footbal Club" hidden.');

  //Hide all
  await page.getByRole('listitem').filter({ hasText: /^All$/ }).getByRole('checkbox').uncheck();
  await expect(columnFootball).not.toBeVisible();
  await expect(columnManager).not.toBeVisible();
  await expect(columnTeamCaptain).not.toBeVisible();
  await expect(columnSupplier).not.toBeVisible();
  await expect(columnMatchDate).not.toBeVisible();
  await expect(columnMatchLocation).not.toBeVisible();
  await expect(columnMatchCountry).not.toBeVisible();
  console.log('All columns hidden.');

  //Show all
  await page.getByRole('listitem').filter({ hasText: /^All$/ }).getByRole('checkbox').check();
  await expect(page.getByText('Total columns: 7', { exact: true })).toBeVisible();
  console.log('All columns seen.');
});

test('Filter Reconciliation Status', async ({ page }) => {
  const ui = getComponents(page);
  const pumaRow = page.getByRole('row').filter({ hasText: 'Puma' });
  const nikeRow = page.getByRole('row').filter({ hasText: 'Nike' });
  const ubstadtRow = page.getByRole('row').filter({ hasText: 'Ubstadt-Weiher' });

  //Uncheck Matches
  await ui.filterBtn.click();
  await page.getByRole('listitem').filter({ hasText: /^Matches$/ }).getByRole('checkbox').uncheck();
  await page.getByRole('listitem').filter({ hasText: /^Ambiguous$/ }).getByRole('checkbox').uncheck();
  console.log('Matches unchecked.');
  await page.keyboard.press('Escape');

  //Verify
  await expect(pumaRow.first().getByLabel('status-miss')).toBeVisible();
  await expect(nikeRow.first().getByLabel('status-miss')).toBeVisible();
  await expect(pumaRow.nth(1).getByLabel('status-miss')).toBeVisible();
  await expect(nikeRow.nth(1).getByLabel('status-miss')).toBeVisible();
  await expect(ubstadtRow.getByLabel('status-miss')).toBeVisible();
  console.log('Rows filtered.');

  //Uncheck Miss matches
  await ui.filterBtn.click();
  await page.getByRole('listitem').filter({ hasText: 'Miss matches' }).getByRole('checkbox').uncheck();
  console.log('Miss matches unchecked.');
  await page.keyboard.press('Escape');

  //Verify
  await expect(page.getByText('Total rows: 0', { exact: true })).toBeVisible();

  //No filter - Check Matches and Miss matches
  await ui.filterBtn.click();
  await page.getByRole('listitem').filter({ hasText: /^Matches$/ }).getByRole('checkbox').check();
  await page.getByRole('listitem').filter({ hasText: 'Miss matches' }).getByRole('checkbox').check();
  await page.keyboard.press('Escape');

  //Verify
  await expect(page.getByText('Total rows: 15', { exact: true })).toBeVisible();
  console.log('No filters.');
});

test('Seach Labels', async ({ page }) => {
  const ui = getComponents(page);
  const pumaRow = page.getByRole('row').filter({ hasText: 'Puma' });
  const searchBar = page.getByRole('textbox', { name: 'Search table, metadata...' });
  //Search for Puma
  await searchBar.click();
  await searchBar.fill('Puma');
  await ui.labelBtn('Puma').click();
  await expect(searchBar).toHaveValue('Puma');

  //Puma cells
  await expect(pumaRow.first()).toBeVisible();
  await expect(pumaRow.nth(1)).toBeVisible();
  await expect(pumaRow.nth(2)).toBeVisible();
  console.log('Rows filtered.');
});

test('Seach Metadata Name', async ({ page }) => {
  const ui = getComponents(page);
  const searchBar = page.getByRole('textbox', { name: 'Search table, metadata...' });

  //Switch to metadata name
  await ui.labelBtn.click();
  await ui.metaNameBtn.click();
  console.log('Switched to metadata name.');

  //Search for Balance
  await searchBar.click();
  await searchBar.fill('Balance');
  await ui.labelCellBtn('Balance').click();
  await expect(page.getByRole('link', { name: 'New Balance' })).toBeVisible();
  console.log('Rows filtered.');

  //Check in Metadata Dialog
  await page.getByRole('gridcell', { name: 'New Balance' }).getByLabel('open-metadata-dialog').click();
  await expect(page.getByRole('link', { name: 'Balance', exact: true })).toBeVisible();
  console.log('Metadata "Balance" checked.');
});

test('Seach Metadata Type', async ({ page }) => {
  test.setTimeout(120000);
  const ui = getComponents(page);
  const searchBar = page.getByRole('textbox', { name: 'Search table, metadata...' });
  const columnFootball = page.getByRole('columnheader', { name: 'Football Club' });

  //Switch to metadata type
  await ui.labelBtn.click();
  await ui.metaType.click();
  console.log('Switched to metadata type.');

  //Search for association football club
  await searchBar.click();
  await searchBar.fill('association');
  await expect(page.getByText('association football club')).toBeVisible({ timeout: 100000 });
  await expect(page.getByText('association football player')).toBeVisible({ timeout: 100000 });
  await expect(page.getByText('association football coach')).toBeVisible({ timeout: 100000 });
  await ui.labelCellBtn('association football club').click();
  await expect(searchBar).toHaveValue('association football club', { timeout: 100000 });

  //Football Club column highlighted
  const footballClubsLabels = ['Arsenal', 'Aston Villa', 'Bournemouth', 'Brighton & Hove Albion', 'Burnley', 'Chelsea',
    'Crystal Palace', 'Everton', 'Huddersfield Town', 'Liverpool', 'Manchester City', 'Newcastle United', 'Southampton'];

  for (const text of footballClubsLabels) {
    await expect(page.locator('.css-z1sted').getByText(text, { exact: true })).toBeVisible();
  }

  //Check in Metadata Dialog
  await columnFootball.click();
  await ui.metadataBtn.click();
  await expect(page.getByRole('link', { name: 'association football club' })).toBeVisible();
  console.log('Metadata type "association football club" checked.');
});

test('Expand Header', async ({ page }) => {
  const ui = getComponents(page);
  await ui.expandHeaderBtn.click();

  //Check arrows
  await expect(page.getByText('head coach')).toBeVisible();
  console.log('Header expanded.');
});

test('Expand Column', async ({ page }) => {
  const columnFootball = page.getByRole('columnheader', { name: 'Football Club' });
  const ui = getComponents(page);

  await columnFootball.click();
  await ui.expandCellBtn.click();

  //Check metadata
  await expect(page.getByRole('link', { name: 'wd:Q9617 (Arsenal)' })).toBeVisible();
  console.log('Column expanded.');
});

test('Expand Cell', async ({ page }) => {
  const arsenalCell = page.getByRole('gridcell', { name: 'Arsenal' });
  const ui = getComponents(page);

  await arsenalCell.click();
  await ui.expandCellBtn.click();

  //Check metadata
  await expect(page.getByRole('link', { name: 'wd:Q9617 (Arsenal)' })).toBeVisible();
  console.log('Cell expanded.');
});

test('Delete Column - Undo/Redo', async ({ page }) => {
  const columnFootball = page.getByRole('columnheader', { name: 'Football Club' });
  const ui = getComponents(page);

  await columnFootball.click();
  await ui.deteleSelectedBtn.click();
  await expect(columnFootball).not.toBeVisible();
  console.log('Column "Football Club" deleted.');

  await ui.undoBtn.click();
  await expect(columnFootball).toBeVisible();
  console.log('Operation Undo.');

  await ui.redoBtn.click();
  await expect(columnFootball).not.toBeVisible();
  console.log('Operation Redo.');
});

test('Refine Matching Type', async ({ page }) => {
  const ui = getComponents(page);
  const columnSupplier = page.getByRole('columnheader', { name: 'Supplier' });
  const pumaCell = page.getByRole('gridcell', { name: 'Puma' }).first();
  const supplierStatus = page
    .getByRole('columnheader', { name: /Supplier/i })
    .getByLabel('status-match-reconciliator');

  //Select column
  await columnSupplier.click();
  await expect(ui.refinementBtn).toBeEnabled();

  //Open Refinement Dialog
  await ui.refinementBtn.click();
  await expect(ui.typeRefineText).toBeVisible();
  await ui.labelCellBtn('business').click();
  console.log('Type "business" selected.');

  //Verify status
  await expect(page.getByText('100.00%')).toBeVisible();
  console.log('All cells reconciled.');
  await ui.confirmBtn.click();
  await expect(pumaCell.getByLabel('status-match-refinement')).toBeVisible();
  await expect(supplierStatus).toBeVisible({ timeout: 10000 });
  console.log('Refine successfully.');

  //Verify type
  await pumaCell.click();
  await ui.metadataBtn.click();
  await expect(page.getByRole('heading', { name: 'Puma' })).toBeVisible();
  await ui.showTypesNumberBtn('5').click();
  await expect(page.getByText('business')).toBeVisible();
  console.log('Checked for "Puma".');
});

test('Refine Matching Score', async ({ page }) => {
  const ui = getComponents(page);
  const columnMatchLocation = page.getByRole('columnheader', { name: 'Match Location' });
  const ubstadtCell = page.getByRole('gridcell', { name: 'Ubstadt-Weiher' }).first();

  //Select column
  await columnMatchLocation.click();
  await ui.refinementBtn.click();

  //Open Refinement Dialog
  await expect(ui.typeRefineText).toBeVisible();
  await ui.scoreRefineText.click();
  await page.locator('.MuiSlider-track').click();
  await page.locator('.MuiSlider-track').click();
  await expect(page.getByText('0.09')).toBeVisible();
  console.log('Set score at 0.09.');
  await ui.confirmBtn.click();

  //Verify status
  await expect(ubstadtCell.getByLabel('status-match-refinement')).toBeVisible();
  console.log('Refine successfully.');

  //Verify score
  await ubstadtCell.click();
  await ui.metadataBtn.click();
  await expect(page.getByRole('cell', { name: '0.11' })).toBeVisible();
  console.log('Checked for "Ubstadt-Weiher".');
});
