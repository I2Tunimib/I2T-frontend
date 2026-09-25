import { test, expect } from '@playwright/test';
import { login, getOrCreateDataset, getOrCreateTable } from '../utils/setup.utils';
import { getComponents } from "../utils/components.utils";

test.describe('Test in local', () => {
  test.beforeEach(async ({ page }) => {
    const urlLocal = '/';
    const datasetName = 'Dataset_test';
    const username = 'test';
    const password = 'test';

    await login(page, urlLocal, username, password);
    await getOrCreateDataset(page, datasetName);
    await expect(page.getByRole('heading', { name: datasetName })).toBeVisible();
    console.log('Dataset "Dataset_test" opened.');
  });

  test('Modification: Custom - Join', async ({ page }) => {
    test.setTimeout(120000);
    const ui = getComponents(page);
    // Please provide your local base directory path below
    const baseDirectory = 'FILE_PATH';
    const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_sample.csv`;
    const tableName = 'table_genAI';
    await getOrCreateTable(page, tableName, filePath);
    const tableNameInput = page.getByLabel('Table name');
    await expect(tableNameInput).toBeVisible();
    await expect(tableNameInput).toHaveValue(tableName);
    console.log('Table opened.');

    const columnMatchLoc = page.getByRole('columnheader', { name: 'Match Location' });
    const selectService = page.getByText('Choose a service of the selected type...');

    await columnMatchLoc.click();
    console.log('Column "Match Location" selected.');

    await expect(ui.genAIBtn).toBeEnabled();
    await ui.genAIBtn.click();

    await page.getByText('Choose a service type...').click();
    await page.getByRole('option', { name: 'Modification', exact: true }).click();
    await expect(selectService).toBeEnabled();
    await selectService.click();
    await page.getByRole('option', { name: 'Custom (LLM Modifier)', exact: true }).click();
    await expect(page.getByText('A flexible LLM-powered modification service')).toBeVisible();
    console.log('Custom (LLM Modifier) selected.');

    await page.getByRole('radio', { name: 'Join multiple' }).check();
    await page.locator('#mui-component-select-columnToJoin').click();
    await page.getByRole('option', { name: 'Match Country', exact: true }).click();
    await ui.confirmComponentBtn('listbox').click();
    console.log('Column "Match Country" selected as additional column.');

    await expect(page.getByRole('combobox', { name: 'Match Country' })).toBeVisible();
    await page.getByRole('radio', { name: 'Use default names' }).check();
    const prompt = page.getByRole('textbox', { name: 'Modification prompt' });
    await prompt.click();
    await prompt.fill('Merge Match Location and Match Country into a joined column using a comma as separator. Trim spaces and capitalize properly.');
    await ui.confirmComponentBtn('dialog').click();
    console.log('Modification in process.');

    await expect(page.getByText('column processed')).toBeVisible({ timeout: 100000 });
    await expect(page.getByRole('columnheader', { name: 'Match Location_Match Country' })).toBeVisible();
    console.log('Modification successfully.');
  });

  test('Modification: Custom - Split', async ({ page }) => {
    test.setTimeout(120000);
    const ui = getComponents(page);
    // Please provide your local base directory path below
    const baseDirectory = 'FILE_PATH';
    const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_sample.csv`;
    const tableName = 'table_genAI';
    await getOrCreateTable(page, tableName, filePath);
    const tableNameInput = page.getByLabel('Table name');
    await expect(tableNameInput).toBeVisible();
    await expect(tableNameInput).toHaveValue(tableName);
    console.log('Table opened.');

    const columnManager = page.getByRole('columnheader', { name: 'Manager' });
    const selectService = page.getByText('Choose a service of the selected type...');

    await columnManager.click();
    console.log('Column "Manager" selected.');

    await expect(ui.genAIBtn).toBeEnabled();
    await ui.genAIBtn.click();

    await page.getByText('Choose a service type...').click();
    await page.getByRole('option', { name: 'Modification', exact: true }).click();
    await expect(selectService).toBeEnabled();
    await selectService.click();
    await page.getByRole('option', { name: 'Custom (LLM Modifier)', exact: true }).click();
    await expect(page.getByText('A flexible LLM-powered modification service')).toBeVisible();
    console.log('Custom (LLM Modifier) selected.');

    await page.getByRole('radio', { name: 'Split a single column' }).check();
    await page.getByRole('radio', { name: 'Rename' }).check();
    const renameField = page.getByRole('textbox', { name: 'Rename new columns' });
    await renameField.click();
    await renameField.fill('Manager_Name, Manager_Surname');
    const prompt = page.getByRole('textbox', { name: 'Modification prompt' });
    await prompt.click();
    await prompt.fill('From \'Manager\' extract name, and surname. Return values exactly as: Manager_Name | Manager_Surname.');
    await ui.confirmComponentBtn('dialog').click();
    console.log('Modification in process.');

    await expect(page.getByText('columns processed')).toBeVisible({ timeout: 100000 });
    await expect(page.getByRole('columnheader', { name: 'Manager_Name' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Manager_Surname' })).toBeVisible();
    console.log('Modification successfully.');
  });

  test('Modification: Custom - Edit', async ({ page }) => {
    test.setTimeout(120000);
    const ui = getComponents(page);
    // Please provide your local base directory path below
    const baseDirectory = 'FILE_PATH';
    const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_sample.csv`;
    const tableName = 'table_genAI';
    await getOrCreateTable(page, tableName, filePath);
    const tableNameInput = page.getByLabel('Table name');
    await expect(tableNameInput).toBeVisible();
    await expect(tableNameInput).toHaveValue(tableName);
    console.log('Table opened.');

    const columnMatchDate = page.getByRole('columnheader', { name: 'Match Date' });
    const selectService = page.getByText('Choose a service of the selected type...');

    await columnMatchDate.click();
    console.log('Column "Match Date" selected.');

    await expect(ui.genAIBtn).toBeEnabled();
    await ui.genAIBtn.click();

    await page.getByText('Choose a service type...').click();
    await page.getByRole('option', { name: 'Modification', exact: true }).click();
    await expect(selectService).toBeEnabled();
    await selectService.click();
    await page.getByRole('option', { name: 'Custom (LLM Modifier)', exact: true }).click();
    await expect(page.getByText('A flexible LLM-powered modification service')).toBeVisible();
    console.log('Custom (LLM Modifier) selected.');

    await page.getByRole('radio', { name: 'Edit' }).check();
    const prompt = page.getByRole('textbox', { name: 'Modification prompt' });
    await prompt.click();
    await prompt.fill('Standardize dates to ISO format (YYYY-MM-DD). If missing, return an empty string.');
    await ui.confirmComponentBtn('dialog').click();
    console.log('Modification in process.');

    await expect(page.getByText('column processed')).toBeVisible({ timeout: 100000 });
    await expect(page.getByText('2017-12-12', { exact: true })).toBeVisible();
    console.log('Modification successfully.');
  });

  test('Reconciliation: Custom', async ({ page }) => {
    test.setTimeout(120000);
    const ui = getComponents(page);
    // Please provide your local base directory path below
    const baseDirectory = 'FILE_PATH';
    const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_sample.csv`;
    const tableName = 'table_genAI';
    await getOrCreateTable(page, tableName, filePath);
    const tableNameInput = page.getByLabel('Table name');
    await expect(tableNameInput).toBeVisible();
    await expect(tableNameInput).toHaveValue(tableName);
    console.log('Table opened.');

    const columnMatchLoc = page.getByRole('columnheader', { name: 'Match Location' });
    const selectService = page.getByText('Choose a service of the selected type...');

    await columnMatchLoc.click();
    console.log('Column "Match Location" selected.');

    await expect(ui.genAIBtn).toBeEnabled();
    await ui.genAIBtn.click();

    await page.getByText('Choose a service type...').click();
    await page.getByRole('option', { name: 'Reconciliation', exact: true }).click();
    await expect(selectService).toBeEnabled();
    await selectService.click();
    await page.getByRole('option', { name: 'Custom (LLM Reconciler)', exact: true }).click();
    await expect(page.getByText('A flexible LLM-powered reconciliation service')).toBeVisible();
    console.log('Custom (LLM Reconciler) selected.');

    await page.getByRole('textbox', { name: 'Entity prefix' }).click();
    await page.getByRole('textbox', { name: 'Entity prefix' }).fill('geo');
    await page.getByRole('textbox', { name: 'Base URI' }).click();
    await page.getByRole('textbox', { name: 'Base URI' }).fill('https://www.geonames.org/');
    await page.getByRole('textbox', { name: 'Reconciliation prompt' }).click();
    await page.getByRole('textbox', { name: 'Reconciliation prompt' }).fill('Match this location to a GeoNames entity. Return the entity ID, name, description, and confidence score (0-100).');
    await ui.confirmComponentBtn('dialog').click();
    console.log('Reconciliation in process.');

    await expect(page.getByText('Reconciliation completed')).toBeVisible({ timeout: 100000 });
    await ui.expandCellBtn.click();
    await expect(page.getByRole('link', { name: 'geo:2890473 (Kirchheim unter Teck)' }).first()).toBeVisible();
    console.log('Reconciliation successfully.');
  });

  test('Reconciliation: Custom - Wikidata', async ({ page }) => {
    test.setTimeout(120000);
    const ui = getComponents(page);
    // Please provide your local base directory path below
    const baseDirectory = 'FILE_PATH';
    const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_sample.csv`;
    const tableName = 'table_genAI';
    await getOrCreateTable(page, tableName, filePath);
    const tableNameInput = page.getByLabel('Table name');
    await expect(tableNameInput).toBeVisible();
    await expect(tableNameInput).toHaveValue(tableName);
    console.log('Table opened.');

    const columnMatchLoc = page.getByRole('columnheader', { name: 'Match Location' });
    const selectService = page.getByText('Choose a service of the selected type...');

    await columnMatchLoc.click();
    console.log('Column "Match Location" selected.');

    await expect(ui.genAIBtn).toBeEnabled();
    await ui.genAIBtn.click();

    await page.getByText('Choose a service type...').click();
    await page.getByRole('option', { name: 'Reconciliation', exact: true }).click();
    await expect(selectService).toBeEnabled();
    await selectService.click();
    await page.getByRole('option', { name: 'Custom Wikidata (LLM Reconciler)', exact: true }).click();
    await expect(page.getByText('A flexible LLM-powered reconciliation service that matches text values to Wikidata entities ')).toBeVisible();
    console.log('Custom (LLM Reconciler) selected.');

    await page.locator('#mui-component-select-additionalColumns').click();
    await page.getByRole('option', { name: 'Match Country', exact: true }).click();
    await ui.confirmComponentBtn('listbox').click();
    console.log('Column "Match Country" selected as additional column.');

    await expect(page.getByRole('combobox', { name: 'Match Country' })).toBeVisible();
    await ui.confirmComponentBtn('dialog').click();
    console.log('Reconciliation in process.');

    await expect(page.getByText('Reconciliation completed')).toBeVisible({ timeout: 100000 });
    await ui.expandCellBtn.click();
    await expect(page.getByRole('link', { name: 'wd:Q14866 (Kirchheim unter Teck)' }).first()).toBeVisible();
    console.log('Reconciliation successfully.');
  });

  test('Extension: COFOG', async ({ page }) => {
    test.setTimeout(120000);
    const ui = getComponents(page);
    // Please provide your local base directory path below
    const baseDirectory = 'FILE_PATH';
    const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_extensionGen.json`;
    const tableName = 'table_extensionGenAI';
    await getOrCreateTable(page, tableName, filePath);
    const tableNameInput = page.getByLabel('Table name');
    await expect(tableNameInput).toBeVisible();
    await expect(tableNameInput).toHaveValue(tableName);
    console.log('Table opened.');

    const columnSupplier = page.getByRole('columnheader', { name: 'Supplier' });
    const selectServiceExt = page.getByText('Choose an extension service...');
    const selectServiceGen = page.getByText('Choose a service of the selected type...');

    await columnSupplier.click();
    console.log('Column "Supplier" selected.');

    await expect(ui.extensionBtn).toBeEnabled();
    await ui.extensionBtn.click();
    await selectServiceExt.click();
    await page.getByRole('option', { name: 'Annotation properties (Wikidata)', exact: true }).click();
    await expect(page.getByText('An extender that extracts Wikidata metadata')).toBeVisible();
    console.log('Annotation properties (Wikidata) selected.');
    await page.getByRole('checkbox', { name: 'Description of entities' }).check();
    await ui.confirmComponentBtn('dialog').click();
    console.log('Extension in process.');

    await expect(page.getByText('column added')).toBeVisible();
    console.log('Extension successfully.');

    await expect(ui.genAIBtn).toBeEnabled();
    await ui.genAIBtn.click();

    await page.getByText('Choose a service type...').click();
    await page.getByRole('option', { name: 'Extension', exact: true }).click();
    await expect(selectServiceGen).toBeEnabled();
    await selectServiceGen.click();
    await page.getByRole('option', { name: 'COFOG (LLM Classifier)', exact: true }).click();
    await expect(page.getByText('A classification service that assigns a government department')).toBeVisible();
    console.log('COFOG (LLM Classifier) selected.');

    await page.locator('#mui-component-select-description').click();
    await page.locator('#menu-description').getByText('description_Supplier').click();
    await ui.confirmBtn.click();
    await expect(page.getByText('columns added')).toBeVisible({ timeout: 100000 });
    await expect(page.getByRole('columnheader', { name: 'COFOG Category' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Confidence' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Reasoning' })).toBeVisible();
    console.log('Extension successfully.');
  });

  test('Extension: Custom', async ({ page }) => {
    test.setTimeout(120000);
    const ui = getComponents(page);
    // Please provide your local base directory path below
    const baseDirectory = 'FILE_PATH';
    const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_sample.csv`;
    const tableName = 'table_genAI';
    await getOrCreateTable(page, tableName, filePath);
    const tableNameInput = page.getByLabel('Table name');
    await expect(tableNameInput).toBeVisible();
    await expect(tableNameInput).toHaveValue(tableName);
    console.log('Table opened.');

    const columnMatchCountry = page.getByRole('columnheader', { name: 'Match Country' });
    const selectService = page.getByText('Choose a service of the selected type...');

    await columnMatchCountry.click();
    console.log('Column "Match Country" selected.');

    await expect(ui.genAIBtn).toBeEnabled();
    await ui.genAIBtn.click();

    await page.getByText('Choose a service type...').click();
    await page.getByRole('option', { name: 'Extension', exact: true }).click();
    await expect(selectService).toBeEnabled();
    await selectService.click();
    await page.getByRole('option', { name: 'Custom (LLM Extender)', exact: true }).click();
    await expect(page.getByText('A flexible LLM-powered extension service')).toBeVisible();
    console.log('Custom (LLM Extender) selected.');

    await page.getByRole('textbox', { name: 'Output column names' }).click();
    await page.getByRole('textbox', { name: 'Output column names' }).fill('Supplier_Length');
    const prompt = page.getByRole('textbox', { name: 'Extension prompt' });
    await prompt.click();
    await prompt.fill('Count the characters and return as Supplier_Length.');

    await ui.confirmBtn.click();
    await expect(page.getByText('column added')).toBeVisible({ timeout: 100000 });
    await expect(page.getByRole('columnheader', { name: 'Supplier_Length' })).toBeVisible();
  });
});

test('Extension: CH', async ({ page }) => {
  test.setTimeout(120000);
  const ui = getComponents(page);
  const urlChronos = 'http://vm.chronos.disco.unimib.it:3001/';
  const datasetName = 'Evaluation';
  const tableName = 'table_extension';
  // Please provide your local base directory path below
  const baseDirectory = 'FILE_PATH';
  const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_extensionGen.json`;
  //Please provide your username and password
  const username = 'USERNAME';
  const password = 'PASSWORD';

  await login(page, urlChronos, username, password);
  await getOrCreateDataset(page, datasetName);
  await expect(page.getByRole('heading', { name: datasetName })).toBeVisible();
  console.log('Dataset "Dataset_test" opened.');

  await getOrCreateTable(page, tableName, filePath);
  await expect(page.getByRole('textbox').first()).toBeVisible();
  console.log('Table opened.');

  await expect(page.locator('th').filter({ hasText: 'Supplier' })).toBeVisible();
  await page.locator('th').filter({ hasText: 'Supplier' }).click();
  console.log('Column "Supplier" selected.');

  await expect(ui.genAIBtn).toBeEnabled();
  await ui.genAIBtn.click();

  await page.getByText('Choose a service type...').click();
  await page.getByRole('option', { name: 'Extension', exact: true }).click();
  await expect(page.getByText('Choose a service of the selected type...')).toBeEnabled();
  await page.getByText('Choose a service of the selected type...').click();
  await page.getByRole('option', { name: 'CH Matching - Private', exact: true }).click();
  await expect(page.getByText('An LLM-based Open Opportunities company house matching service')).toBeVisible();
  console.log('CH Matching - Private selected.');
  await ui.confirmComponentBtn('dialog').click();
  console.log('Extension in process.');

  await expect(page.getByText('columns added')).toBeVisible({ timeout: 100000 });
  console.log('Extension successfully.');
});
