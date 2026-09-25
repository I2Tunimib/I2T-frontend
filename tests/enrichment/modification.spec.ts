import { test, expect } from '@playwright/test';
import { login, getOrCreateDataset, getOrCreateTable } from '../utils/setup.utils';
import {
  modificationDialog,
  modificationDialogChronos,
  dataCleaningConfig,
  regexConfig,
  textColumnsConfig,
  textRowsConfig,
  dateFormatterConfig, pseudoanonymizationConfig
} from "../utils/modification.utils";

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

    await expect(page.getByText('UMBRò', { exact: true })).toBeVisible();
    /**
     * Open Modification Dialog of a specific column and select a modifier service
     * * @param {import('@playwright/test').Page} page
     * @param {string} columnName
     * @param {string} service
     */
    await modificationDialog(page, 'Supplier', 'Data Cleaning');
    console.log('Column "Supplier" selected.');

    //Normalize accents and diacritics
    /**
     * Configuration of Data Cleaning modifier
     * * @param {import('@playwright/test').Page} page
     * @param {string} option
     */
    await dataCleaningConfig(page, 'Normalize accents and diacritics');
    await expect(page.getByText('UMBRo', { exact: true })).toBeVisible();
    console.log('Normalized UMBRò -> UMBRo.');

    //Remove special characters
    await expect(page.getByText('UNDER - ARMOUR')).toBeVisible();
    await modificationDialog(page, 'Supplier', 'Data Cleaning');
    await dataCleaningConfig(page, 'Remove special characters');
    await expect(page.getByText('UNDER ARMOUR', { exact: true })).toBeVisible();
    console.log('Removed special character UNDER - ARMOUR -> UNDER ARMOUR.');

    //Remove unnecessary whitespace
    await modificationDialog(page, 'Supplier', 'Data Cleaning');
    await dataCleaningConfig(page, 'Remove unnecessary whitespace');
    console.log('Removed unnecessary whitespace.');

    //Convert uppercase
    await expect(page.getByText('Adidas', { exact: true })).toBeVisible();
    await modificationDialog(page, 'Supplier', 'Data Cleaning');
    await dataCleaningConfig(page, 'Convert to uppercase');
    await expect(page.getByText('ADIDAS', { exact: true }).first()).toBeVisible();
    console.log('Converted to uppercase.');

    //Convert lowercase
    await expect(page.getByText('PUMA', { exact: true }).first()).toBeVisible();
    await modificationDialog(page, 'Supplier', 'Data Cleaning');
    await dataCleaningConfig(page, 'Convert to lowercase');
    await expect(page.getByText('puma', { exact: true }).first()).toBeVisible();
    console.log('Converted to lowercase.');

    //Convert titlecase
    await expect(page.getByText('puma', { exact: true }).first()).toBeVisible();
    await modificationDialog(page, 'Supplier', 'Data Cleaning');
    await dataCleaningConfig(page, 'Convert to titlecase');
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
    await modificationDialog(page, 'Match Location Coordinates', 'Regular Expression Modifier');
    console.log('Column "Match Location Coordinates" selected.');

    /**
     * Configuration of Regular Expression modifier
     * * @param {import('@playwright/test').Page} page
     * @param {string} type
     * @param {string} pattern
     * @param {string} flag
     * @param {string} replacement
     * @param {string} matchIndex
     * @param {string} matchCount
     * @param {boolean} newColumn
     */
    await regexConfig(page, 'Extract all matches', '\\d+\\.\\d{1,2}', 'g', undefined, undefined, undefined, false);
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

    await expect(page.getByText('Gabriele Maggi 886197, Nicolò Molteni 938190')).toBeVisible();
    await modificationDialog(page, 'Group member', 'Text to rows');
    console.log('Column "Group member" selected.');

    /**
     * Configuration of Text to Rows modifier
     * * @param {import('@playwright/test').Page} page
     * @param {string} separator
     */
    await textRowsConfig(page, '-');
    await expect(page.getByText('Invalid separator')).toBeVisible();
    console.log('Error.');

    await textRowsConfig(page, ',');
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

    await expect(page.getByText('Gabriele Maggi 886197, Nicolò Molteni 938190')).toBeVisible();
    await modificationDialog(page, 'Group member', 'Text to rows');
    console.log('Column "Group member" selected.');

    await textRowsConfig(page, ',');
    await expect(page.getByText('rows added')).toBeVisible();
    await expect(page.getByText('Gabriele Maggi 886197', { exact: true })).toBeVisible();
    console.log('Text to rows successfully.');

    await modificationDialog(page, 'Group member', 'Text to columns / Columns to text');
    console.log('Text to columns / Columns to text selected.');

    /**
     * Configuration of Text to Columns / Columns to Text modifier
     * * @param {import('@playwright/test').Page} page
     * @param {string} operation
     * @param {string} splitMode
     * @param {string} splitDirection
     * @param {string} separator
     * @param {string} columnsJoin
     * @param {string} nameNewColumn
     */
    await textColumnsConfig(
      page,
      'Split a single column into multiple ones',
      'Split at a single occurrence',
      'From right (last occurrence)',
      ' ',
      [],
      'Fullname, Student ID',
    );
    console.log('Text to columns successfully.');

    await expect(page.getByText('Gabriele Maggi', { exact: true })).toBeVisible();
    await modificationDialog(page, 'Group member', 'Text to columns / Columns to text');
    console.log('Text to columns / Columns to text selected.');

    await textColumnsConfig(
      page,
      'Split a single column into multiple ones',
      'Split at a single occurrence',
      'From left (first occurrence)',
      '-',
      [],
      undefined
    );
    console.log('Error detected: Invalid separator.');

    await textColumnsConfig(
      page,
      'Split a single column into multiple ones',
      'Split at a single occurrence',
      'From left (first occurrence)',
      ' ',
      [],
      undefined,
    );
    console.log('Text to columns successfully.');
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

    await expect(page.getByText('08:12:34', { exact: true })).toBeVisible();
    await modificationDialog(page, 'timeB', 'Text to columns / Columns to text');
    console.log('Text to columns / Columns to text selected.');

    await textColumnsConfig(
      page,
      'Split a single column into multiple ones',
      'Split at every occurrence',
      undefined,
      ':',
      [],
      undefined,
    );
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

    await modificationDialog(page, 'Match Location', 'Text to columns / Columns to text');
    console.log('Text to columns / Columns to text selected.');

    await textColumnsConfig(
      page,
      'Join multiple columns into a single one',
      undefined,
      undefined,
      ', ',
      ['Match Country'],
      undefined,
    );
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

    await modificationDialog(page, 'strings', 'Date Formatter');
    await dateFormatterConfig(page, 'strings', undefined, undefined, false, undefined, false, undefined);
    console.log('Error detected: "strings" does not contain date/time values.');
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

    await modificationDialog(page, 'datetime', 'Date Formatter');
    /**
     * Configuration of Date Formatter modifier
     * * @param {import('@playwright/test').Page} page
     * @param {string} columnName
     * @param {string} format
     * @param {string} detailLevel
     * @param {boolean} splitDatetime
     * @param {string} columnJoin
     * @param {boolean} newColumn
     * @param {string} separator
     */
    await dateFormatterConfig(
      page,
      'datetime',
      'ISO 8601',
      'Hour and minutes (yyyy-MM-dd\'T\'HH:mm)', true, undefined, false, undefined
    );
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

    await modificationDialog(page, 'dateA', 'Date Formatter');
    await dateFormatterConfig(
      page,
      'dateA',
      'European',
      'Hour with timezone GMT (dd/MM/yyyy HH:mm:ss z) [e.g., GMT+2]',
      false,
      'dateB',
      true,
      '--'
      );
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

    await modificationDialog(page, 'timeA', 'Date Formatter');
    await dateFormatterConfig(
      page,
      'timeA',
      'US (MM/dd/yyyy HH:mm:ssXXX)',
      'Hour 12h only (hh a)',
      false,
      'timeB',
      true,
      '-'
    );
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

    await modificationDialog(page, 'dateA', 'Date Formatter');
    await dateFormatterConfig(
      page,
      'dateA',
      'ISO',
      'Hour with seconds UTC (yyyy-MM-dd\'T\'HH:mm:ss\'Z\')',
      false,
      'timeB',
      true,
      undefined,
    );
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

    await modificationDialog(page, 'dateB', 'Date Formatter');
    await dateFormatterConfig(
      page,
      'dateB',
      'European',
      'Hour with milliseconds (dd/MM/yyyy HH:mm:ss.SSS)',
      false,
      undefined,
      true,
      undefined,
    );
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

    await modificationDialog(page, 'timeB', 'Date Formatter');
    await dateFormatterConfig(
      page,
      'timeB',
      'US (MM/dd/yyyy HH:mm:ssXXX)',
      'Hour and minutes 12h (hh:mm a)',
      false,
      undefined,
      false,
      undefined,
    );
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

  await modificationDialogChronos(page, 'Manager', 'Pseudoanonymization');
  /**
   * Configuration of Pseudoanonymization modifier
   * * @param {import('@playwright/test').Page} page
   * @param {string} columnName
   * @param {boolean} updateColumn
   * @param {boolean} deanonymize
   * @param {string} newColumnName
   */
  await pseudoanonymizationConfig(page, 'Manager', false, false, undefined);
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

  await modificationDialogChronos(page, 'Manager', 'Pseudoanonymization');
  await pseudoanonymizationConfig(page, 'Manager', true);

  await modificationDialogChronos(page, 'Manager', 'Pseudoanonymization');
  await pseudoanonymizationConfig(page, 'Manager', true, true, 'Manager names');
});
