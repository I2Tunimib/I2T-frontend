import { test, expect } from '@playwright/test';
import { login, getOrCreateDataset, getOrCreateTable } from '../utils/setup.utils';
import { getComponents } from "../utils/components.utils";

test.beforeEach(async ({ page }) => {
  const urlLocal = '/';
  // Please provide your local base directory path below
  const baseDirectory = 'FILE_PATH';
  const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_compliance.csv`;
  const datasetName = 'Dataset_test';
  const tableName = 'table_compliance';
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

test('Compliance', async ({ page, context }) => {
  const ui = getComponents(page);
  const purpose = page.getByRole('textbox', { name: 'Purpose' });
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);

  test.setTimeout(100000);

  //Open Compliance Dialog
  await expect(ui.complianceBtn).toBeVisible();
  await ui.complianceBtn.click();
  await expect(page.getByRole('heading', { name: 'Compliance assessment' })).toBeVisible();
  await page.getByRole('combobox', { name: 'Compliance type' }).click();
  await page.getByRole('option', { name: 'GDPR (General Data Protection Regulation)' }).click();
  await expect(page.getByText('GDPR Configuration')).toBeVisible();
  await purpose.click();
  await purpose.press('ControlOrMeta+a');
  await purpose.fill('The purpose is to prepare a dataset suitable for studying air pollution exposure in proximity to schools and children\'s residences, while ensuring compliance with the GDPR, in particular Articles 4 and 25.');

  if (await ui.checkBtn.isVisible()) {
    console.log("Check Compliance first time");
    await ui.checkBtn.click();
  } else if (await ui.checkAgainBtn.isVisible()) {
    console.log("Check Again");
    await ui.checkAgainBtn.click();
  }

  //View results
  await expect(page.getByRole('heading', { name: 'Table: table_compliance' })).toBeVisible({ timeout: 120000 });
  await expect(page.getByRole('heading', { name: 'Column Analysis' })).toBeVisible({ timeout: 120000 });
  console.log('Compliance GDPR checked.');

  //Check badge
  await ui.closeBtn.click();

  const chilIdBadge = page
    .getByRole('columnheader', { name: 'ChildID' })
    .getByLabel('compliance-badge');
  const birthYearBadge = page
    .getByRole('columnheader', { name: 'Birth Year' })
    .getByLabel('compliance-badge');
  const kindergartenBadge = page
    .getByRole('columnheader', { name: 'Kindergarten' })
    .getByLabel('compliance-badge');
  const groupYearBadge = page
    .getByRole('columnheader', { name: 'Group Year' })
    .getByLabel('compliance-badge');
  const districtBadge = page
    .getByRole('columnheader', { name: 'District' })
    .getByLabel('compliance-badge');
  const permanentAddressBadge = page
    .getByRole('columnheader', { name: 'Permanent address' })
    .getByLabel('compliance-badge');

  await expect(chilIdBadge).toBeVisible();
  await expect(birthYearBadge).toBeVisible();
  await expect(kindergartenBadge).toBeVisible();
  await expect(groupYearBadge).toBeVisible();
  await expect(districtBadge).toBeVisible();
  await expect(permanentAddressBadge).toBeVisible();
});
