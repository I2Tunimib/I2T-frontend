import { test, expect } from '@playwright/test';
import { login, getOrCreateDataset, getOrCreateTable } from '../utils/setup.utils';

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

  test('Modify Data Cleaning', async ({ page }) => {
    test.setTimeout(120000);
    // Please provide your local base directory path below
    const baseDirectory = 'FILE_PATH';
    const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_dataCleaning_regex_columnsText.csv`;
    const tableName = 'table_dataCleaning_regex_columnsText';
    await getOrCreateTable(page, tableName, filePath);
    const tableNameInput = page.getByLabel('Table name');
    await expect(tableNameInput).toBeVisible();
    await expect(tableNameInput).toHaveValue(tableName);
    console.log('Table opened.');

    const columnSupplier = page.getByRole('columnheader', { name: 'Supplier' });
    const confirmBtn = page.getByRole('button', { name: 'Confirm', exact: true });
    const modifyBtn = page.getByRole('button', { name: 'Modify', exact: true });
    const selectService = page.getByText('Choose a modification service...');

    await columnSupplier.click();
    console.log('Column "Supplier" selected.');

    //Normalize accents and diacritics
    await expect(modifyBtn).toBeEnabled();
    await expect(page.getByText('UMBRò', { exact: true })).toBeVisible();
    await modifyBtn.click();

    //Open Modification dialog
    await expect(page.getByRole('heading', { name: 'Modification' })).toBeVisible();
    await selectService.click();
    await page.getByRole('option', { name: 'Data Cleaning', exact: true }).click();
    await expect(page.getByText('A transformation function that allows users to clean and normalize textual data')).toBeVisible();
    console.log('Data Cleaning selected.');

    //Data Cleaning service
    await page.getByRole('radio', { name: 'Normalize accents and diacritics' }).check();
    await confirmBtn.click();
    await expect(page.getByText('UMBRo', { exact: true })).toBeVisible();
    console.log('Normalized UMBRò -> UMBRo.');

    //Remove special characters
    await expect(page.getByText('UNDER - ARMOUR')).toBeVisible();
    await modifyBtn.click();
    await expect(page.getByRole('heading', { name: 'Modification' })).toBeVisible();
    await selectService.click();
    await page.getByRole('option', { name: 'Data Cleaning', exact: true }).click();
    await expect(page.getByText('A transformation function that allows users to clean and normalize textual data')).toBeVisible();
    console.log('Data Cleaning selected.');

    await page.getByRole('radio', { name: 'Remove special characters' }).check();
    await confirmBtn.click();
    await expect(page.getByText('UNDER ARMOUR', { exact: true })).toBeVisible();
    console.log('Removed special character UNDER - ARMOUR -> UNDER ARMOUR.');

    //Remove unnecessary whitespace
    await modifyBtn.click();
    await expect(page.getByRole('heading', { name: 'Modification' })).toBeVisible();
    await selectService.click();
    await page.getByRole('option', { name: 'Data Cleaning', exact: true }).click();
    await expect(page.getByText('A transformation function that allows users to clean and normalize textual data')).toBeVisible();
    console.log('Data Cleaning selected.');

    await page.getByRole('radio', { name: 'Remove unnecessary whitespace' }).check();
    await confirmBtn.click();
    console.log('Removed unnecessary whitespace.');

    //Convert uppercase
    await expect(page.getByText('Adidas', { exact: true })).toBeVisible();
    await modifyBtn.click();
    await expect(page.getByRole('heading', { name: 'Modification' })).toBeVisible();
    await selectService.click();
    await page.getByRole('option', { name: 'Data Cleaning', exact: true }).click();
    await expect(page.getByText('A transformation function that allows users to clean and normalize textual data')).toBeVisible();
    console.log('Data Cleaning selected.');

    await page.getByRole('radio', { name: 'Convert to uppercase' }).check();
    await confirmBtn.click();
    await expect(page.getByText('ADIDAS', { exact: true }).first()).toBeVisible();
    console.log('Converted to uppercase.');

    //Convert lowercase
    await expect(page.getByText('PUMA', { exact: true }).first()).toBeVisible();
    await modifyBtn.click();
    await expect(page.getByRole('heading', { name: 'Modification' })).toBeVisible();
    await selectService.click();
    await page.getByRole('option', { name: 'Data Cleaning', exact: true }).click();
    await expect(page.getByText('A transformation function that allows users to clean and normalize textual data')).toBeVisible();
    console.log('Data Cleaning selected.');

    await page.getByRole('radio', { name: 'Convert to lowercase' }).check();
    await confirmBtn.click();
    await expect(page.getByText('puma', { exact: true }).first()).toBeVisible();
    console.log('Converted to lowercase.');

    //Convert titlecase
    await expect(page.getByText('puma', { exact: true }).first()).toBeVisible();
    await modifyBtn.click();
    await expect(page.getByRole('heading', { name: 'Modification' })).toBeVisible();
    await selectService.click();
    await page.getByRole('option', { name: 'Data Cleaning', exact: true }).click();
    await expect(page.getByText('A transformation function that allows users to clean and normalize textual data')).toBeVisible();
    console.log('Data Cleaning selected.');

    await page.getByRole('radio', { name: 'Convert to titlecase' }).check();
    await confirmBtn.click();
    await expect(page.getByText('Puma', { exact: true }).first()).toBeVisible();
    console.log('Converted to uppercase.');
  });

  test('Modify Regex', async ({ page, context }) => {
    test.setTimeout(120000);
    // Please provide your local base directory path below
    const baseDirectory = 'FILE_PATH';
    const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_dataCleaning_regex_columnsText.csv`;
    const tableName = 'table_dataCleaning_regex_columnsText';
    await getOrCreateTable(page, tableName, filePath);
    const tableNameInput = page.getByLabel('Table name');
    await expect(tableNameInput).toBeVisible();
    await expect(tableNameInput).toHaveValue(tableName);
    console.log('Table opened.');

    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const columnMatchLocCoord = page.getByRole('columnheader', { name: 'Match Location Coordinates' });
    const confirmBtn = page.getByRole('button', { name: 'Confirm', exact: true });
    const modifyBtn = page.getByRole('button', { name: 'Modify', exact: true });
    const selectService = page.getByText('Choose a modification service...');

    await expect(page.getByRole('gridcell', { name: '48.64683,9.45378' })).toBeVisible();

    await columnMatchLocCoord.click();
    console.log('Column "Match Location Coordinates" selected.');

    await expect(modifyBtn).toBeEnabled();
    await modifyBtn.click();
    await expect(page.getByRole('heading', { name: 'Modification' })).toBeVisible();
    await selectService.click();
    await page.getByRole('option', { name: 'Regular Expression Modifier', exact: true }).click();
    await expect(page.getByText('A transformation function that allows users to apply regular expression')).toBeVisible();
    console.log('Regular Expression Modifier selected.');

    await page.getByRole('radio', { name: 'Extract all matches' }).check();
    const regexElement = page.getByText('\\d+\\.\\d{1,2}', { exact: true });
    await expect(regexElement).toBeVisible();
    const textToInsert = await regexElement.innerText();
    console.log('Text:', textToInsert);
    console.log('Regex selected e copied.');

    const patternInput = page.getByRole('textbox', { name: 'Regular expression pattern' });
    await patternInput.click();
    await patternInput.fill(textToInsert);
    await expect(patternInput).toHaveValue('\\d+\\.\\d{1,2}');
    console.log('Regex pasted.');

    await expect(page.getByRole('textbox', { name: 'Regular expression flags' })).toHaveValue('g');
    await expect(page.getByRole('radio', { name: 'Update the current column' })).toBeChecked();
    await confirmBtn.click();
    await expect(page.getByText('column updated')).toBeVisible();
    console.log('Regex successfully.');
  });

  test('Modify Text to Rows & Check Error Sep', async ({ page }) => {
    test.setTimeout(120000);
    // Please provide your local base directory path below
    const baseDirectory = 'FILE_PATH';
    const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_textRows_textColumnsSingle.csv`;
    const tableName = 'table_textRows_textColumnsSingle';
    await getOrCreateTable(page, tableName, filePath);
    const tableNameInput = page.getByLabel('Table name');
    await expect(tableNameInput).toBeVisible();
    await expect(tableNameInput).toHaveValue(tableName);
    console.log('Table opened.');

    const columnGroupMember = page.getByRole('columnheader', { name: 'Group member' });
    const confirmBtn = page.getByRole('button', { name: 'Confirm', exact: true });
    const modifyBtn = page.getByRole('button', { name: 'Modify', exact: true });
    const selectService = page.getByText('Choose a modification service...');

    await columnGroupMember.click();
    console.log('Column "Group member" selected.');

    await expect(page.getByText('Gabriele Maggi 886197, Nicolò Molteni 938190')).toBeVisible();
    await expect(modifyBtn).toBeEnabled();
    await modifyBtn.click();
    await expect(page.getByRole('heading', { name: 'Modification' })).toBeVisible();
    await selectService.click();
    await page.getByRole('option', { name: 'Text to rows' }).click();
    await expect(page.getByText('A transformation function that allows splitting the values of a single')).toBeVisible();
    console.log('Text to rows selected.');

    const sep = page.getByRole('textbox', { name: 'Separator' });
    await sep.click();
    await sep.fill('-');
    await confirmBtn.click();
    await expect(page.getByText('Invalid separator')).toBeVisible();
    console.log('Error.');

    await sep.click();
    await sep.fill(',');
    await confirmBtn.click();
    await expect(page.getByText('rows added')).toBeVisible();
    await expect(page.getByText('Gabriele Maggi 886197', { exact: true })).toBeVisible();
    console.log('Text to rows successfully.');
  });

  test('Modify Text to Columns - single, rename - Error', async ({ page }) => {
    test.setTimeout(120000);
    // Please provide your local base directory path below
    const baseDirectory = 'FILE_PATH';
    const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_textRows_textColumnsSingle.csv`;
    const tableName = 'table_textRows_textColumnsSingle';
    await getOrCreateTable(page, tableName, filePath);
    const tableNameInput = page.getByLabel('Table name');
    await expect(tableNameInput).toBeVisible();
    await expect(tableNameInput).toHaveValue(tableName);
    console.log('Table opened.');

    const columnGroupMember = page.getByRole('columnheader', { name: 'Group member' });
    const confirmBtn = page.getByRole('button', { name: 'Confirm', exact: true });
    const modifyBtn = page.getByRole('button', { name: 'Modify', exact: true });
    const selectService = page.getByText('Choose a modification service...');

    await columnGroupMember.click();
    console.log('Column "Group member" selected.');

    await expect(page.getByText('Gabriele Maggi 886197, Nicolò Molteni 938190')).toBeVisible();
    await expect(modifyBtn).toBeEnabled();
    await modifyBtn.click();
    await expect(page.getByRole('heading', { name: 'Modification' })).toBeVisible();
    await selectService.click();
    await page.getByRole('option', { name: 'Text to rows' }).click();
    await expect(page.getByText('A transformation function that allows splitting the values of a single')).toBeVisible();
    console.log('Text to rows selected.');

    const sep = page.getByRole('textbox', { name: 'Separator' });
    await sep.click();
    await sep.fill(',');
    await confirmBtn.click();
    await expect(page.getByText('rows added')).toBeVisible();
    await expect(page.getByText('Gabriele Maggi 886197', { exact: true })).toBeVisible();

    await expect(modifyBtn).toBeEnabled();
    await modifyBtn.click();
    await selectService.click();
    await page.getByRole('option', { name: 'Text to columns / Columns to text' }).click();
    await expect(page.getByText('A transformation function that allows joining multiple columns into one')).toBeVisible();
    console.log('Text to columns / Columns to text selected.');

    await page.getByRole('radio', { name: 'Split a single column into' }).check();
    await sep.click();
    await sep.fill(' ');
    await page.getByRole('radio', { name: 'Split at a single occurrence' }).check();
    await page.getByRole('radio', { name: 'From right (last occurrence)' }).check();
    await page.getByRole('radio', { name: 'Rename new column(s)' }).check();
    const renameField = page.getByRole('textbox', { name: 'Rename new columns' });
    await renameField.click();
    await renameField.fill('Fullname, Student ID');
    await confirmBtn.click();
    await expect(page.getByText('columns added')).toBeVisible();
    console.log('Text to columns successfully.');

    await expect(page.getByText('Gabriele Maggi', { exact: true })).toBeVisible();
    await modifyBtn.click();
    await expect(page.getByRole('heading', { name: 'Modification' })).toBeVisible();
    await selectService.click();
    await page.getByRole('option', { name: 'Text to columns / Columns to text' }).click();
    await expect(page.getByText('A transformation function that allows joining multiple columns into one')).toBeVisible();
    console.log('Text to columns / Columns to text selected.');

    await page.getByRole('radio', { name: 'Split a single column into' }).check();
    await sep.click();
    await sep.fill('-');
    await page.getByRole('radio', { name: 'Split at a single occurrence' }).check();
    await page.getByRole('radio', { name: 'From left (first occurrence)' }).check();
    await page.getByText('Use default names').click();
    await confirmBtn.click();
    await expect(page.getByText('Invalid separator')).toBeVisible();
    console.log('Error.');

    await page.getByRole('radio', { name: 'Split a single column into' }).check();
    await sep.click();
    await sep.fill(' ');
    await page.getByRole('radio', { name: 'Split at a single occurrence' }).check();
    await page.getByRole('radio', { name: 'From left (first occurrence)' }).check();
    await page.getByText('Use default names').click();
    await confirmBtn.click();
    await expect(page.getByText('columns added')).toBeVisible();
    console.log('Text to columns / Columns to text selected.');
  });

  test('Modify Text to Columns - every, default', async ({ page }) => {
    test.setTimeout(120000);
    // Please provide your local base directory path below
    const baseDirectory = 'FILE_PATH';
    const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_dateFormatter_textColumnsEvery.csv`;
    const tableName = 'table_dateFormatter_textColumnsEvery';
    await getOrCreateTable(page, tableName, filePath);
    const tableNameInput = page.getByLabel('Table name');
    await expect(tableNameInput).toBeVisible();
    await expect(tableNameInput).toHaveValue(tableName);
    console.log('Table opened.');

    const columnTimeB = page.getByRole('columnheader', { name: 'timeB' });
    const modifyBtn = page.getByRole('button', { name: 'Modify', exact: true });
    const selectService = page.getByText('Choose a modification service...');

    await columnTimeB.click();
    console.log('Column "timeB" selected.');

    await expect(page.getByText('08:12:34', { exact: true })).toBeVisible();
    await expect(modifyBtn).toBeEnabled();
    await modifyBtn.click();
    await expect(page.getByRole('heading', { name: 'Modification' })).toBeVisible();
    await selectService.click();
    await page.getByRole('option', { name: 'Text to columns / Columns to text' }).click();
    await expect(page.getByText('A transformation function that allows joining multiple columns into one')).toBeVisible();
    console.log('Text to columns / Columns to text selected.');

    await page.getByRole('radio', { name: 'Split a single column into' }).check();
    const sep = page.getByRole('textbox', { name: 'Separator' });
    await sep.click();
    await sep.fill(':');
    await page.getByRole('radio', { name: 'Split at every occurrence' }).check();
    await page.getByText('Use default names').click();
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.getByText('columns added')).toBeVisible();
    console.log('Text to columns successfully.');
  });

  test('Modify Columns to text - additional, default', async ({ page }) => {
    test.setTimeout(120000);
    // Please provide your local base directory path below
    const baseDirectory = 'FILE_PATH';
    const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_dataCleaning_regex_columnsText.csv`;
    const tableName = 'table_dataCleaning_regex_columnsText';
    await getOrCreateTable(page, tableName, filePath);
    const tableNameInput = page.getByLabel('Table name');
    await expect(tableNameInput).toBeVisible();
    await expect(tableNameInput).toHaveValue(tableName);
    console.log('Table opened.');

    const columnMatchLoc = page.getByRole('columnheader').filter({ hasText: /^Match Location$/ });
    const confirmBtn = page.getByRole('button', { name: 'Confirm', exact: true });
    const modifyBtn = page.getByRole('button', { name: 'Modify', exact: true });
    const selectService = page.getByText('Choose a modification service...');

    await columnMatchLoc.click();
    console.log('Column "Match Location" selected.');

    await expect(modifyBtn).toBeEnabled();
    await modifyBtn.click();
    await expect(page.getByRole('heading', { name: 'Modification' })).toBeVisible();
    await selectService.click();
    await page.getByRole('option', { name: 'Text to columns / Columns to text' }).click();
    await expect(page.getByText('A transformation function that allows joining multiple columns into one')).toBeVisible();
    console.log('Text to columns / Columns to text selected.');

    await page.getByRole('radio', { name: 'Join multiple columns' }).check();
    const selectColumnJoin = page.locator('#mui-component-select-columnToJoin');
    await selectColumnJoin.click();
    await page.getByRole('option', { name: 'Match Country', exact: true }).click();
    await page.getByRole('listbox').getByRole('button', { name: 'Confirm' }).click();
    console.log('Column "Match Country" selected as additional column.');

    await expect(page.getByRole('combobox', { name: 'Match Country' })).toBeVisible();
    const sep = page.getByRole('textbox', { name: 'Separator' });
    await sep.click();
    await sep.fill(', ');
    await page.getByText('Use default names').click();
    await confirmBtn.click();
    await expect(page.getByText('column added')).toBeVisible();
    console.log('Columns to text successfully.');
  });

  test('Modify Date Formatter - Error', async ({ page }) => {
    test.setTimeout(120000);
    // Please provide your local base directory path below
    const baseDirectory = 'FILE_PATH';
    const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_dateFormatter_textColumnsEvery.csv`;
    const tableName = 'table_dateFormatter_textColumnsEvery';
    await getOrCreateTable(page, tableName, filePath);
    const tableNameInput = page.getByLabel('Table name');
    await expect(tableNameInput).toBeVisible();
    await expect(tableNameInput).toHaveValue(tableName);
    console.log('Table opened.');

    const columnStrings = page.getByRole('columnheader', { name: 'strings' });
    const modifyBtn = page.getByRole('button', { name: 'Modify', exact: true });
    const selectService = page.getByText('Choose a modification service...');

    await columnStrings.click();
    console.log('Column "strings" selected.');

    await expect(modifyBtn).toBeEnabled();
    await modifyBtn.click();
    await expect(page.getByRole('heading', { name: 'Modification' })).toBeVisible();
    await selectService.click();
    await page.getByRole('option', { name: 'Date Formatter' }).click();
    await expect(page.getByText('Please select either one date column and one time column')).toBeVisible();
    console.log('Error.');
  });

  test('Modify Date Formatter - Split', async ({ page }) => {
    test.setTimeout(120000);
    // Please provide your local base directory path below
    const baseDirectory = 'FILE_PATH';
    const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_dateFormatter_textColumnsEvery.csv`;
    const tableName = 'table_dateFormatter_textColumnsEvery';
    await getOrCreateTable(page, tableName, filePath);
    const tableNameInput = page.getByLabel('Table name');
    await expect(tableNameInput).toBeVisible();
    await expect(tableNameInput).toHaveValue(tableName);
    console.log('Table opened.');

    const columnDatetime = page.getByRole('columnheader', { name: 'datetime' });
    const confirmBtn = page.getByRole('button', { name: 'Confirm', exact: true });
    const modifyBtn = page.getByRole('button', { name: 'Modify', exact: true });
    const selectService = page.getByText('Choose a modification service...');

    await columnDatetime.click();
    console.log('Column "datetime" selected.');

    await expect(modifyBtn).toBeEnabled();
    await modifyBtn.click();
    await expect(page.getByRole('heading', { name: 'Modification' })).toBeVisible();
    await selectService.click();
    await page.getByRole('option', { name: 'Date Formatter' }).click();
    await expect(page.getByText('A transformation function that converts date-like values in the selected')).toBeVisible();

    await page.getByRole('radio', { name: 'ISO 8601' }).check();
    await page.locator('#mui-component-select-detailLevel').click();
    await page.getByRole('option', { name: 'Hour and minutes' }).click();
    console.log('"Hour and minutes" selected as level of detail.');

    await page.getByRole('checkbox', { name: 'Split datetime' }).check();
    await confirmBtn.click();
    await expect(page.getByText('columns added')).toBeVisible();
    console.log('Date Formatter successfully.');
  });

  test('Modify Date Formatter - Join - dates', async ({ page }) => {
    test.setTimeout(120000);
    // Please provide your local base directory path below
    const baseDirectory = 'FILE_PATH';
    const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_dateFormatter_textColumnsEvery.csv`;
    const tableName = 'table_dateFormatter_textColumnsEvery';
    await getOrCreateTable(page, tableName, filePath);
    const tableNameInput = page.getByLabel('Table name');
    await expect(tableNameInput).toBeVisible();
    await expect(tableNameInput).toHaveValue(tableName);
    console.log('Table opened.');

    const columnDateA = page.getByRole('columnheader', { name: 'dateA' });
    const confirmBtn = page.getByRole('button', { name: 'Confirm', exact: true });
    const modifyBtn = page.getByRole('button', { name: 'Modify', exact: true });
    const selectService = page.getByText('Choose a modification service...');

    await columnDateA.click();
    console.log('Column "dateA" selected.');

    await expect(modifyBtn).toBeEnabled();
    await modifyBtn.click();
    await expect(page.getByRole('heading', { name: 'Modification' })).toBeVisible();
    await selectService.click();
    await page.getByRole('option', { name: 'Date Formatter' }).click();
    await expect(page.getByText('A transformation function that converts date-like values in the selected')).toBeVisible();
    await page.getByRole('radio', { name: 'European' }).check();

    await page.locator('#mui-component-select-columnToJoin').click();
    await page.getByRole('option', { name: 'dateB' }).click();
    console.log('Column "dateB" selected to join.');

    await page.locator('#mui-component-select-detailLevel').click();
    await page.getByRole('option', { name: 'Hour with timezone GMT (dd/MM/yyyy HH:mm:ss z) [e.g., GMT+2]' }).click();
    console.log('"Hour with timezone GMT (dd/MM/yyyy HH:mm:ss z) [e.g., GMT+2]" selected as level of detail.');

    await page.getByRole('radio', { name: 'Create a new column' }).check();
    const sep = page.getByRole('textbox', { name: 'Separator' });
    await sep.click();
    await sep.fill('--');
    await confirmBtn.click();
    await expect(page.getByText('column added')).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'dateA_dateB' })).toBeVisible();
    console.log('Date Formatter successfully.');
  });

  test('Modify Date Formatter - Join - times', async ({ page }) => {
    test.setTimeout(120000);
    // Please provide your local base directory path below
    const baseDirectory = 'FILE_PATH';
    const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_dateFormatter_textColumnsEvery.csv`;
    const tableName = 'table_dateFormatter_textColumnsEvery';
    await getOrCreateTable(page, tableName, filePath);
    const tableNameInput = page.getByLabel('Table name');
    await expect(tableNameInput).toBeVisible();
    await expect(tableNameInput).toHaveValue(tableName);
    console.log('Table opened.');

    const columnTimeA = page.getByRole('columnheader', { name: 'timeA' });
    const confirmBtn = page.getByRole('button', { name: 'Confirm', exact: true });
    const modifyBtn = page.getByRole('button', { name: 'Modify', exact: true });
    const selectService = page.getByText('Choose a modification service...');

    await columnTimeA.click();
    console.log('Column "timeA" selected.');

    await expect(modifyBtn).toBeEnabled();
    await modifyBtn.click();
    await expect(page.getByRole('heading', { name: 'Modification' })).toBeVisible();
    await selectService.click();
    await page.getByRole('option', { name: 'Date Formatter' }).click();
    await expect(page.getByText('A transformation function that converts date-like values in the selected')).toBeVisible();
    await page.getByRole('radio', { name: 'US (MM/dd/yyyy HH:mm:ssXXX)' }).check();

    await page.locator('#mui-component-select-columnToJoin').click();
    await page.getByRole('option', { name: 'timeB' }).click();
    console.log('Column "timeB" selected to join.');

    await page.locator('#mui-component-select-detailLevel').click();
    await page.getByRole('option', { name: 'Hour 12h only (hh a)' }).click();
    console.log('"Hour 12h only (hh a)" selected as level of detail.');

    await page.getByRole('radio', { name: 'Create a new column' }).check();
    const sep = page.getByRole('textbox', { name: 'Separator' });
    await sep.click();
    await sep.fill('-');
    await confirmBtn.click();
    await expect(page.getByText('column added')).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'timeA_timeB' })).toBeVisible();
    console.log('Date Formatter successfully.');
  });

  test('Modify Date Formatter - Join - datetime', async ({ page }) => {
    test.setTimeout(120000);
    // Please provide your local base directory path below
    const baseDirectory = 'FILE_PATH';
    const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_dateFormatter_textColumnsEvery.csv`;
    const tableName = 'table_dateFormatter_textColumnsEvery';
    await getOrCreateTable(page, tableName, filePath);
    const tableNameInput = page.getByLabel('Table name');
    await expect(tableNameInput).toBeVisible();
    await expect(tableNameInput).toHaveValue(tableName);
    console.log('Table opened.');

    const columnDateA = page.getByRole('columnheader', { name: 'dateA' });
    const confirmBtn = page.getByRole('button', { name: 'Confirm', exact: true });
    const modifyBtn = page.getByRole('button', { name: 'Modify', exact: true });
    const selectService = page.getByText('Choose a modification service...');

    await columnDateA.click();
    console.log('Column "dateA" selected.');

    await expect(modifyBtn).toBeEnabled();
    await modifyBtn.click();
    await expect(page.getByRole('heading', { name: 'Modification' })).toBeVisible();
    await selectService.click();
    await page.getByRole('option', { name: 'Date Formatter' }).click();
    await expect(page.getByText('A transformation function that converts date-like values in the selected')).toBeVisible();
    await page.getByRole('radio', { name: 'ISO' }).check();
    await page.locator('#mui-component-select-columnToJoin').click();
    await page.getByRole('option', { name: 'timeB' }).click();
    console.log('Column "timeB" selected to join.');

    await page.locator('#mui-component-select-detailLevel').click();
    await page.getByRole('option', { name: 'Hour with seconds UTC (yyyy-MM-dd\'T\'HH:mm:ss\'Z\')' }).click();
    console.log('"Hour with seconds UTC (yyyy-MM-dd\'T\'HH:mm:ss\'Z\')" selected as level of detail.');

    await page.getByRole('radio', { name: 'Create a new column' }).check();
    await confirmBtn.click();
    await expect(page.getByText('column added')).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'dateA_timeB' })).toBeVisible();
    console.log('Date Formatter successfully.');
  });

  test('Modify Date Formatter - date', async ({ page }) => {
    test.setTimeout(120000);
    // Please provide your local base directory path below
    const baseDirectory = 'FILE_PATH';
    const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_dateFormatter_textColumnsEvery.csv`;
    const tableName = 'table_dateFormatter_textColumnsEvery';
    await getOrCreateTable(page, tableName, filePath);
    const tableNameInput = page.getByLabel('Table name');
    await expect(tableNameInput).toBeVisible();
    await expect(tableNameInput).toHaveValue(tableName);
    console.log('Table opened.');

    const columnDateB = page.getByRole('columnheader', { name: 'dateB' });
    const confirmBtn = page.getByRole('button', { name: 'Confirm', exact: true });
    const modifyBtn = page.getByRole('button', { name: 'Modify', exact: true });
    const selectService = page.getByText('Choose a modification service...');

    await columnDateB.click();
    console.log('Column "dateB" selected.');

    await expect(modifyBtn).toBeEnabled();
    await modifyBtn.click();
    await expect(page.getByRole('heading', { name: 'Modification' })).toBeVisible();
    await selectService.click();
    await page.getByRole('option', { name: 'Date Formatter' }).click();
    await expect(page.getByText('A transformation function that converts date-like values in the selected')).toBeVisible();

    await page.getByRole('radio', { name: 'European' }).check();
    await page.locator('#mui-component-select-detailLevel').click();
    await page.getByRole('option', { name: 'Hour with milliseconds (dd/MM/yyyy HH:mm:ss.SSS)' }).click();
    console.log('"Hour with milliseconds (dd/MM/yyyy HH:mm:ss.SSS)" selected as level of detail.');

    await page.getByRole('radio', { name: 'Create a new column' }).check();
    await confirmBtn.click();
    await expect(page.getByText('column added')).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'dateB_formatted' })).toBeVisible();
    console.log('Date Formatter successfully.');
  });

  test('Modify Date Formatter - time', async ({ page }) => {
    test.setTimeout(120000);
    // Please provide your local base directory path below
    const baseDirectory = 'FILE_PATH';
    const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_dateFormatter_textColumnsEvery.csv`;
    const tableName = 'table_dateFormatter_textColumnsEvery';
    await getOrCreateTable(page, tableName, filePath);
    const tableNameInput = page.getByLabel('Table name');
    await expect(tableNameInput).toBeVisible();
    await expect(tableNameInput).toHaveValue(tableName);
    console.log('Table opened.');

    const columntimeB = page.getByRole('columnheader', { name: 'timeB' });
    const confirmBtn = page.getByRole('button', { name: 'Confirm', exact: true });
    const modifyBtn = page.getByRole('button', { name: 'Modify', exact: true });
    const selectService = page.getByText('Choose a modification service...');

    await columntimeB.click();
    console.log('Column "timeB" selected.');

    await expect(modifyBtn).toBeEnabled();
    await modifyBtn.click();
    await expect(page.getByRole('heading', { name: 'Modification' })).toBeVisible();
    await selectService.click();
    await page.getByRole('option', { name: 'Date Formatter' }).click();
    await expect(page.getByText('A transformation function that converts date-like values in the selected')).toBeVisible();
    await page.getByRole('radio', { name: 'US (MM/dd/yyyy HH:mm:ssXXX)' }).check();
    await page.locator('#mui-component-select-detailLevel').click();
    await page.getByRole('option', { name: 'Hour and minutes 12h (hh:mm a)' }).click();
    console.log('"Hour and minutes 12h (MM/dd/yyyy hh:mm a)" selected as level of detail.');

    await expect(page.getByRole('radio', { name: 'Update the current column' })).toBeChecked();
    await confirmBtn.click();
    await expect(page.getByText('column updated')).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'timeB' })).toBeVisible();
    console.log('Date Formatter successfully.');
  });
});

test('Modify Pseudoanonymization - default', async ({ page }) => {
  test.setTimeout(120000);
  const urlChronos = 'http://vm.chronos.disco.unimib.it:3001/';
  const datasetName = 'Evaluation';
  const tableName = 'table_sample';
  // Please provide your local base directory path below
  const baseDirectory = 'FILE_PATH';
  const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_sample.csv`;
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

  const columnManager = page.getByRole('columnheader', { name: 'Manager' });
  const confirmBtn = page.getByRole('button', { name: 'Confirm', exact: true });
  const modifyBtn = page.getByRole('button', { name: 'Modify', exact: true });
  const selectService = page.getByLabel('Modify', { exact: true }).getByText('Choose a service...');

  await columnManager.click();
  console.log('Column "Manager" selected.');

  await expect(modifyBtn).toBeEnabled();
  await modifyBtn.click();
  await expect(page.getByRole('heading', { name: 'Modify' })).toBeVisible();
  await selectService.click();
  await page.getByRole('option', { name: 'Pseudoanonymization', exact: true }).click();
  await expect(page.getByText('Pseudoanonymize or de-anonymize data in the selected column using')).toBeVisible();
  console.log('Pseudoanonymization selected.');

  await confirmBtn.click();
  await expect(page.getByText('column added')).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Manager_anonymized' })).toBeVisible();
});

test('Modify Pseudoanonymization - deanonymize, rename', async ({ page }) => {
  test.setTimeout(120000);
  const urlChronos = 'http://vm.chronos.disco.unimib.it:3001/';
  const datasetName = 'Evaluation';
  const tableName = 'table_sample';
  // Please provide your local base directory path below
  const baseDirectory = 'FILE_PATH';
  const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_sample.csv`;
  //Please provide your username and password
  const username = 'USERNAME';
  const password = 'PASSWORD';

  await login(page, urlChronos, username, password);
  await getOrCreateDataset(page, datasetName);
  await expect(page.getByRole('textbox').first()).toBeVisible();
  console.log('Dataset "Dataset_test" opened.');

  await getOrCreateTable(page, tableName, filePath);
  await expect(page.getByRole('textbox').first()).toBeVisible();
  console.log('Table opened.');

  const columnManager = page.getByRole('columnheader', { name: 'Manager' });
  const confirmBtn = page.getByRole('button', { name: 'Confirm', exact: true });
  const modifyBtn = page.getByRole('button', { name: 'Modify', exact: true });
  const selectService = page.getByLabel('Modify', { exact: true }).getByText('Choose a service...');

  await columnManager.click();
  console.log('Column "Manager" selected.');

  await expect(modifyBtn).toBeEnabled();
  await modifyBtn.click();
  await expect(page.getByRole('heading', { name: 'Modify' })).toBeVisible();
  await selectService.click();
  await page.getByRole('option', { name: 'Pseudoanonymization', exact: true }).click();
  await expect(page.getByText('Pseudoanonymize or de-anonymize data in the selected column using')).toBeVisible();
  console.log('Pseudoanonymization selected.');

  await page.getByRole('radio', { name: 'Update the current column' }).check();
  await confirmBtn.click();

  await expect(page.getByRole('button', { name: 'Modify' })).toBeEnabled();
  await page.getByRole('button', { name: 'Modify' }).click();
  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: 'Pseudoanonymization', exact: true }).click();
  await expect(page.getByText('Pseudoanonymize or de-anonymize data in the selected column using')).toBeVisible();
  console.log('Pseudoanonymization selected.');

  await page.getByRole('checkbox', { name: 'De-anonymize' }).check();
  const renameField = page.getByRole('textbox', { name: 'New column name' });
  await renameField.click();
  await renameField.fill('Manager names');
  await confirmBtn.click();
  await expect(page.getByText('column updated')).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Manager names' })).toBeVisible();
});
