import { test, expect } from '@playwright/test';
import { login, getOrCreateDataset, getOrCreateTable } from '../utils/setup.utils';

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
  const accessibleView = page.getByRole('button', { name: 'accessible-view' });
  const denseView = page.getByRole('button', { name: 'dense-view' });

  await accessibleView.click();
  await expect(denseView).toBeVisible();
  console.log('Accessible view chenged.');

  await denseView.click();
  await expect(accessibleView).toBeVisible();
  console.log('Dense view changed.');
});

test('Visibility', async ({ page }) => {
  const visibilityBtn = page.getByRole('button', { name: 'visibility-column' });
  const columnFootball = page.getByRole('columnheader', { name: 'Football Club' });
  const columnManager = page.getByRole('columnheader', { name: 'Manager' });
  const columnTeamCaptain = page.getByRole('columnheader', { name: 'Team Captain' });
  const columnSupplier = page.getByRole('columnheader', { name: 'Supplier' });
  const columnMatchDate = page.getByRole('columnheader', { name: 'Match Date' });
  const columnMatchLocation = page.getByRole('columnheader', { name: 'Match Location' });
  const columnMatchCountry = page.getByRole('columnheader', { name: 'Match Country' });

  //Open Visibility menu
  await visibilityBtn.click();
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
  const filterBtn = page.getByRole('button', { name: 'filter-rows' });
  const pumaRow = page.getByRole('row').filter({ hasText: 'Puma' });
  const nikeRow = page.getByRole('row').filter({ hasText: 'Nike' });
  const ubstadtRow = page.getByRole('row').filter({ hasText: 'Ubstadt-Weiher' });

  //Uncheck Matches
  await filterBtn.click();
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
  await filterBtn.click();
  await page.getByRole('listitem').filter({ hasText: 'Miss matches' }).getByRole('checkbox').uncheck();
  console.log('Miss matches unchecked.');
  await page.keyboard.press('Escape');

  //Verify
  await expect(page.getByText('Total rows: 0', { exact: true })).toBeVisible();

  //No filter - Check Matches and Miss matches
  await filterBtn.click();
  await page.getByRole('listitem').filter({ hasText: /^Matches$/ }).getByRole('checkbox').check();
  await page.getByRole('listitem').filter({ hasText: 'Miss matches' }).getByRole('checkbox').check();
  await page.keyboard.press('Escape');

  //Verify
  await expect(page.getByText('Total rows: 15', { exact: true })).toBeVisible();
  console.log('No filters.');
});

test('Seach Labels', async ({ page }) => {
  const searchBar = page.getByRole('textbox', { name: 'Search table, metadata...' });
  const pumaRow = page.getByRole('row').filter({ hasText: 'Puma' });

  //Search for Puma
  await searchBar.click();
  await searchBar.fill('Puma');
  await page.getByRole('button', { name: 'Puma' }).click();
  await expect(searchBar).toHaveValue('Puma');

  //Puma cells
  await expect(pumaRow.first()).toBeVisible();
  await expect(pumaRow.nth(1)).toBeVisible();
  await expect(pumaRow.nth(2)).toBeVisible();
  console.log('Rows filtered.');
});

test('Seach Metadata Name', async ({ page }) => {
  const searchBar = page.getByRole('textbox', { name: 'Search table, metadata...' });

  //Switch to metadata name
  await page.getByRole('button', { name: 'label' }).click();
  await page.getByRole('button', { name: 'metaName' }).click();
  console.log('Switched to metadata name.');

  //Search for Balance
  await searchBar.click();
  await searchBar.fill('Balance');
  await page.getByRole('button', { name: 'Balance' }).click();
  await expect(page.getByRole('link', { name: 'New Balance' })).toBeVisible();
  console.log('Rows filtered.');

  //Check in Metadata Dialog
  await page.getByRole('gridcell', { name: 'New Balance' }).getByLabel('open-metadata-dialog').click();
  await expect(page.getByRole('link', { name: 'Balance', exact: true })).toBeVisible();
  console.log('Metadata "Balance" checked.');
});

test('Seach Metadata Type', async ({ page }) => {
  test.setTimeout(120000);
  const searchBar = page.getByRole('textbox', { name: 'Search table, metadata...' });
  const columnFootball = page.getByRole('columnheader', { name: 'Football Club' });
  const metadataBtn = page.getByRole('button', { name: 'open-metadata-dialog-subtoolbar' });

  //Switch to metadata type
  await page.getByRole('button', { name: 'label' }).click();
  await page.getByRole('button', { name: 'metaType' }).click();
  console.log('Switched to metadata type.');

  //Search for association football club
  await searchBar.click();
  await searchBar.fill('association');
  await expect(page.getByText('association football club')).toBeVisible({ timeout: 100000 });
  await expect(page.getByText('association football player')).toBeVisible({ timeout: 100000 });
  await expect(page.getByText('association football coach')).toBeVisible({ timeout: 100000 });
  await page.getByRole('button', { name: 'association football club' }).click();
  await expect(searchBar).toHaveValue('association football club', { timeout: 100000 });

  //Football Club column highlighted
  const footballClubsLabels = ['Arsenal', 'Aston Villa', 'Bournemouth', 'Brighton & Hove Albion', 'Burnley', 'Chelsea',
    'Crystal Palace', 'Everton', 'Huddersfield Town', 'Liverpool', 'Manchester City', 'Newcastle United', 'Southampton'];

  for (const text of footballClubsLabels) {
    await expect(page.locator('.css-z1sted').getByText(text, { exact: true })).toBeVisible();
  }

  //Check in Metadata Dialog
  await columnFootball.click();
  await metadataBtn.click();
  await expect(page.getByRole('link', { name: 'association football club' })).toBeVisible();
  console.log('Metadata type "association football club" checked.');
});

test('Expand Header', async ({ page }) => {
  await page.getByRole('button', { name: 'expand-header' }).click();

  //Check arrows
  await expect(page.getByText('head coach')).toBeVisible();
  console.log('Header expanded.');
});

test('Expand Column', async ({ page }) => {
  const columnFootball = page.getByRole('columnheader', { name: 'Football Club' });

  await columnFootball.click();
  await page.getByRole('button', { name: 'expand-cell' }).click();

  //Check metadata
  await expect(page.getByRole('link', { name: 'wd:Q9617 (Arsenal)' })).toBeVisible();
  console.log('Column expanded.');
});

test('Expand Cell', async ({ page }) => {
  const arsenalCell = page.getByRole('gridcell', { name: 'Arsenal' });

  await arsenalCell.click();
  await page.getByRole('button', { name: 'expand-cell' }).click();

  //Check metadata
  await expect(page.getByRole('link', { name: 'wd:Q9617 (Arsenal)' })).toBeVisible();
  console.log('Cell expanded.');
});

test('Delete Column - Undo/Redo', async ({ page }) => {
  const columnFootball = page.getByRole('columnheader', { name: 'Football Club' });

  await columnFootball.click();
  await page.getByRole('button', { name: 'delete-selected' }).click();
  await expect(columnFootball).not.toBeVisible();
  console.log('Column "Football Club" deleted.');

  await page.getByRole('button', { name: 'undo' }).click();
  await expect(columnFootball).toBeVisible();
  console.log('Operation Undo.');

  await page.getByRole('button', { name: 'redo' }).click();
  await expect(columnFootball).not.toBeVisible();
  console.log('Operation Redo.');
});

test('Refine Matching Type', async ({ page }) => {
  const refinementBtn = page.getByRole('button', { name: 'open-refinement-dialog' });
  const columnSupplier = page.getByRole('columnheader', { name: 'Supplier' });
  const pumaCell = page.getByRole('gridcell', { name: 'Puma' }).first();
  const supplierStatus = page
    .getByRole('columnheader', { name: /Supplier/i })
    .getByLabel('status-match-reconciliator');

  //Select column
  await columnSupplier.click();
  await expect(refinementBtn).toBeEnabled();

  //Open Refinement Dialog
  await refinementBtn.click();
  await expect(page.getByText('Type refine matching')).toBeVisible();
  await page.getByRole('button', { name: 'business' }).click();
  console.log('Type "business" selected.');

  //Verify status
  await expect(page.getByText('100.00%')).toBeVisible();
  console.log('All cells reconciled.');
  await page.getByRole('button', { name: 'Confirm' }).click();
  await expect(pumaCell.getByLabel('status-match-refinement')).toBeVisible();
  await expect(supplierStatus).toBeVisible({ timeout: 10000 });
  console.log('Refine successfully.');

  //Verify type
  await pumaCell.click();
  await page.getByRole('button', { name: 'open-metadata-dialog-subtoolbar' }).click();
  await expect(page.getByRole('heading', { name: 'Puma' })).toBeVisible();
  await page.getByRole('button', { name: '(5) 👉' }).click();
  await expect(page.getByText('business')).toBeVisible();
  console.log('Checked for "Puma".');
});

test('Refine Matching Score', async ({ page }) => {
  const refinementBtn = page.getByRole('button', { name: 'open-refinement-dialog' });
  const columnMatchLocation = page.getByRole('columnheader', { name: 'Match Location' });
  const ubstadtCell = page.getByRole('gridcell', { name: 'Ubstadt-Weiher' }).first();

  //Select column
  await columnMatchLocation.click();
  await refinementBtn.click();

  //Open Refinement Dialog
  await expect(page.getByText('Type refine matching')).toBeVisible();
  await page.getByText('Score refine matching').click();
  await page.locator('.MuiSlider-track').click();
  await page.locator('.MuiSlider-track').click();
  await expect(page.getByText('0.09')).toBeVisible();
  console.log('Set score at 0.09.');
  await page.getByRole('button', { name: 'Confirm' }).click();

  //Verify status
  await expect(ubstadtCell.getByLabel('status-match-refinement')).toBeVisible();
  console.log('Refine successfully.');

  //Verify score
  await ubstadtCell.click();
  await page.getByRole('button', { name: 'open-metadata-dialog-subtoolbar' }).click();
  await expect(page.getByRole('cell', { name: '0.11' })).toBeVisible();
  console.log('Checked for "Ubstadt-Weiher".');
});
