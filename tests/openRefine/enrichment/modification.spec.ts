import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  test.setTimeout(120000);
  await page.goto('http://127.0.0.1:3333/#create-project');
  //Upload file
});

test('Modify Data Cleaning', async ({ page }) => {
  // Please provide your local base directory path below
  const baseDirectory = 'FILE_PATH';
  const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_dataCleaning_regex_columnsText.csv`;
  await page.getByRole('button', { name: 'Choose File' }).click();
  await page.getByRole('button', { name: 'Choose File' }).setInputFiles(filePath);
  await page.getByRole('button', { name: 'Next »' }).click();
  await page.getByRole('textbox', { name: 'Project name' }).click();
  await page.getByRole('textbox', { name: 'Project name' }).fill('Football Clubs');
  await expect(page.getByRole('textbox', { name: 'Project name' })).toBeVisible();
  await page.getByRole('button', { name: 'Create project »' }).click();
  await page.getByRole('link', { name: '25' }).click();

  //Normalize accents and diacritics
  await page.locator('th:nth-child(5) > .column-header-title > .column-header-menu').click();
  await page.getByRole('link', { name: 'Edit cells' }).click();
  await page.getByRole('link', { name: 'Transform…' }).click();
  await expect(page.getByText('Custom text transform on')).toBeVisible();
  await page.getByRole('textbox', { name: 'Expression' }).click();
  await page.getByRole('textbox', { name: 'Expression' }).press('ControlOrMeta+a');
  await page.getByRole('textbox', { name: 'Expression' }).fill('value.replace("ò", "o").replace("à", "a").replace("é", "e").replace("è", "e").replace("ì", "i").replace("ù", "u")');
  await expect(page.getByRole('cell', { name: 'value.replace("ò", "o").replac' })).toBeVisible();
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(page.locator('#notification').getByText('Text transform')).toBeVisible();
  await expect(page.getByText('UMBRo', { exact: true })).toBeVisible();

  //Remove special characters
  await page.locator('th:nth-child(5) > .column-header-title > .column-header-menu').click();
  await page.getByRole('link', { name: 'Edit cells' }).click();
  await page.getByRole('link', { name: 'Transform…' }).click();
  await expect(page.getByText('Custom text transform on')).toBeVisible();
  await page.getByRole('textbox', { name: 'Expression' }).click();
  await page.getByRole('textbox', { name: 'Expression' }).press('ControlOrMeta+a');
  await page.getByRole('textbox', { name: 'Expression' }).fill('value.replace("-", " ")');
  await expect(page.getByRole('cell', { name: 'value.replace("-", " ")' })).toBeVisible();
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(page.locator('#notification').getByText('Text transform')).toBeVisible();
  await expect(page.getByText('UNDER ARMOUR')).toBeVisible();

  //Remove unnecessary whitespace
  await page.locator('th:nth-child(5) > .column-header-title > .column-header-menu').click();
  await page.getByRole('link', { name: 'Edit cells' }).click();
  await page.getByRole('link', { name: 'Common transforms' }).click();
  await page.getByRole('link', { name: 'Collapse consecutive' }).click();
  await expect(page.locator('#notification').getByText('Text transform on 2 cells in')).toBeVisible();

  //Convert uppercase
  await page.locator('th:nth-child(5) > .column-header-title > .column-header-menu').click();
  await page.getByRole('link', { name: 'Edit cells' }).click();
  await page.getByRole('link', { name: 'Common transforms' }).click();
  await page.getByRole('link', { name: 'To uppercase' }).click();
  await expect(page.locator('#notification').getByText('Text transform on 2 cells in')).toBeVisible();
  await expect(page.getByText('ADIDAS').first()).toBeVisible();

  //Convert lowercase
  await page.locator('th:nth-child(5) > .column-header-title > .column-header-menu').click();
  await page.getByRole('link', { name: 'Edit cells' }).click();
  await page.getByRole('link', { name: 'Common transforms' }).click();
  await page.getByRole('link', { name: 'To lowercase' }).click();
  await expect(page.locator('#notification').getByText('Text transform on 15 cells in')).toBeVisible();
  await expect(page.getByText('puma').first()).toBeVisible();

  //Convert titlecase
  await page.locator('th:nth-child(5) > .column-header-title > .column-header-menu').click();
  await page.getByRole('link', { name: 'Edit cells' }).click();
  await page.getByRole('link', { name: 'Common transforms' }).click();
  await page.getByRole('link', { name: 'To titlecase' }).click();
  await expect(page.locator('#notification').getByText('Text transform on 15 cells in')).toBeVisible();
  await expect(page.getByText('Puma').first()).toBeVisible();
});

test('Modify Regex', async ({ page }) => {
  // Please provide your local base directory path below
  const baseDirectory = 'FILE_PATH';
  const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_dataCleaning_regex_columnsText.csv`;
  await page.getByRole('button', { name: 'Choose File' }).click();
  await page.getByRole('button', { name: 'Choose File' }).setInputFiles(filePath);
  await page.getByRole('button', { name: 'Next »' }).click();
  await page.getByRole('textbox', { name: 'Project name' }).click();
  await page.getByRole('textbox', { name: 'Project name' }).fill('Football Clubs');
  await expect(page.getByRole('textbox', { name: 'Project name' })).toBeVisible();
  await page.getByRole('button', { name: 'Create project »' }).click();
  await page.getByRole('link', { name: '25' }).click();

  await page.locator('th:nth-child(8) > .column-header-title > .column-header-menu').click();
  await page.getByRole('link', { name: 'Edit cells' }).click();
  await page.getByRole('link', { name: 'Transform…' }).click();
  await expect(page.getByText('Custom text transform on')).toBeVisible();
  await page.getByRole('textbox', { name: 'Expression' }).click();
  await page.getByRole('textbox', { name: 'Expression' }).press('ControlOrMeta+a');
  await page.getByRole('textbox', { name: 'Expression' }).fill('value.replace(/(\\d+\\.\\d{2})\\d*/, "$1")');
  await expect(page.getByRole('cell', { name: 'value.replace(/(\\d+\\.\\d{2})' })).toBeVisible();
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(page.locator('#notification').getByText('Text transform on 15 cells in')).toBeVisible();
  await expect(page.getByText('48.64,9.45')).toBeVisible();
});

test('Modify Text to Rows', async ({ page }) => {
  // Please provide your local base directory path below
  const baseDirectory = 'FILE_PATH';
  const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_textRows_textColumnsSingle.csv`;
  await page.getByRole('button', { name: 'Choose File' }).click();
  await page.getByRole('button', { name: 'Choose File' }).setInputFiles(filePath);
  await page.getByRole('button', { name: 'Next »' }).click();
  await page.getByRole('textbox', { name: 'Project name' }).click();
  await page.getByRole('textbox', { name: 'Project name' }).fill('Football Clubs');
  await expect(page.getByRole('textbox', { name: 'Project name' })).toBeVisible();
  await page.getByRole('button', { name: 'Create project »' }).click();
  await page.getByRole('link', { name: '25' }).click();

  await page.getByRole('columnheader', { name: 'Group member' }).getByRole('button').click();
  await page.getByRole('link', { name: 'Edit cells' }).click();
  await page.getByRole('link', { name: 'Split multi-valued cells…' }).click();
  await expect(page.getByText('Split multi-valued cells', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'OK' }).click();
  await page.getByRole('columnheader', { name: 'Project name' }).getByRole('button').click();
  await page.getByRole('link', { name: 'Edit cells' }).click();
  await page.getByRole('link', { name: 'Fill down' }).click();
  await expect(page.locator('#notification').getByText('Fill down 8 cells in column')).toBeVisible();
  await page.getByRole('columnheader', { name: 'Group member' }).getByRole('button').click();
  await page.getByRole('link', { name: 'Edit cells' }).click();
  await page.getByRole('link', { name: 'Common transforms' }).click();
  await page.getByRole('link', { name: 'Trim leading and trailing' }).click();
  await expect(page.locator('#notification').getByText('Text transform on 8 cells in')).toBeVisible();
});

test('Modify Columns to Text', async ({ page }) => {
  // Please provide your local base directory path below
  const baseDirectory = 'FILE_PATH';
  const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_dataCleaning_regex_columnsText.csv`;
  await page.getByRole('button', { name: 'Choose File' }).click();
  await page.getByRole('button', { name: 'Choose File' }).setInputFiles(filePath);
  await page.getByRole('button', { name: 'Next »' }).click();
  await page.getByRole('textbox', { name: 'Project name' }).click();
  await page.getByRole('textbox', { name: 'Project name' }).fill('Football Clubs');
  await expect(page.getByRole('textbox', { name: 'Project name' })).toBeVisible();
  await page.getByRole('button', { name: 'Create project »' }).click();
  await page.getByRole('link', { name: '25' }).click();

  await page.locator('th:nth-child(8) > .column-header-title > .column-header-menu').click();
  await page.getByRole('link', { name: 'Edit column' }).click();
  await page.getByRole('link', { name: 'Split into several columns' }).click();
  await expect(page.getByText('Split column "Match Location')).toBeVisible();
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(page.locator('#notification').getByText('Split 15 cell(s)')).toBeVisible();
  await expect(page.getByText('Match Location Coordinates 1', { exact: true })).toBeVisible({ timeout: 100000 });
  await expect(page.getByText('Match Location Coordinates 2', { exact: true })).toBeVisible({ timeout: 100000 });
});

test('Modify Text to Columns Single', async ({ page }) => {
  // Please provide your local base directory path below
  const baseDirectory = 'FILE_PATH';
  const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_textRows_textColumnsSingle.csv`;
  await page.getByRole('button', { name: 'Choose File' }).click();
  await page.getByRole('button', { name: 'Choose File' }).setInputFiles(filePath);
  await page.getByRole('button', { name: 'Next »' }).click();
  await page.getByRole('textbox', { name: 'Project name' }).click();
  await page.getByRole('textbox', { name: 'Project name' }).fill('Football Clubs');
  await expect(page.getByRole('textbox', { name: 'Project name' })).toBeVisible();
  await page.getByRole('button', { name: 'Create project »' }).click();
  await page.getByRole('link', { name: '25' }).click();

  await page.getByRole('columnheader', { name: 'Group member' }).getByRole('button').click();
  await page.getByRole('link', { name: 'Edit cells' }).click();
  await page.getByRole('link', { name: 'Split multi-valued cells…' }).click();
  await expect(page.getByText('Split multi-valued cells', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'OK' }).click();
  await page.getByRole('columnheader', { name: 'Project name' }).getByRole('button').click();
  await page.getByRole('link', { name: 'Edit cells' }).click();
  await page.getByRole('link', { name: 'Fill down' }).click();
  await expect(page.locator('#notification').getByText('Fill down 8 cells in column')).toBeVisible();
  await page.getByRole('columnheader', { name: 'Group member' }).getByRole('button').click();
  await page.getByRole('link', { name: 'Edit cells' }).click();
  await page.getByRole('link', { name: 'Common transforms' }).click();
  await page.getByRole('link', { name: 'Trim leading and trailing' }).click();
  await expect(page.locator('#notification').getByText('Text transform on 8 cells in')).toBeVisible();

  await page.getByRole('columnheader', { name: 'Group member' }).getByRole('button').click();
  await page.getByRole('link', { name: 'Edit column' }).click();
  await page.getByRole('link', { name: 'Add column based on this' }).click();
  await expect(page.getByText('Add column based on column')).toBeVisible();
  await page.getByRole('textbox', { name: 'Expression' }).click();
  await page.getByRole('textbox', { name: 'Expression' }).press('ControlOrMeta+a');
  await page.getByRole('textbox', { name: 'Expression' }).fill('value.split(" ")[-1]');
  await expect(page.getByRole('cell', { name: 'value.split(" ")[-1]' })).toBeVisible();
  await page.getByRole('textbox', { name: 'New column name' }).click();
  await page.getByRole('textbox', { name: 'New column name' }).fill('student ID');
  await page.getByRole('button', { name: 'OK' }).click();
  await page.locator('#notification').getByText('Create new column student ID').click();
  await expect(page.getByText('student ID', { exact: true })).toBeVisible();

  await page.getByRole('columnheader', { name: 'Group member' }).getByRole('button').click();
  await page.getByRole('link', { name: 'Edit column' }).click();
  await page.getByRole('link', { name: 'Add column based on this' }).click();
  await expect(page.getByText('Add column based on column')).toBeVisible();
  await page.getByRole('textbox', { name: 'Expression' }).click();
  await page.getByRole('textbox', { name: 'Expression' }).press('ControlOrMeta+a');
  await page.getByRole('textbox', { name: 'Expression' }).fill('value.split(" ").slice(0, -1).join(" ")');
  await expect(page.getByRole('cell', { name: 'value.split(" ").slice' })).toBeVisible();
  await page.getByRole('textbox', { name: 'New column name' }).click();
  await page.getByRole('textbox', { name: 'New column name' }).fill('student fullname');
  await page.getByRole('button', { name: 'OK' }).click();
  await page.locator('#notification').getByText('Create new column student fullname').click();
  await expect(page.getByText('student fullname', { exact: true })).toBeVisible();
});

test('Modify Text to Columns Every', async ({ page }) => {
  // Please provide your local base directory path below
  const baseDirectory = 'FILE_PATH';
  const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_dateFormatter_textColumnsEvery.csv`;
  await page.getByRole('button', { name: 'Choose File' }).click();
  await page.getByRole('button', { name: 'Choose File' }).setInputFiles(filePath);
  await page.getByRole('button', { name: 'Next »' }).click();
  await page.getByRole('textbox', { name: 'Project name' }).click();
  await page.getByRole('textbox', { name: 'Project name' }).fill('Football Clubs');
  await expect(page.getByRole('textbox', { name: 'Project name' })).toBeVisible();
  await page.getByRole('button', { name: 'Create project »' }).click();
  await page.getByRole('link', { name: '25' }).click();

  await page.getByRole('columnheader', { name: 'timeB' }).getByRole('button').click();
  await page.getByRole('link', { name: 'Edit column' }).click();
  await page.getByRole('link', { name: 'Split into several columns' }).click();
  await expect(page.getByText('Split column "timeB"')).toBeVisible();
  await page.getByRole('textbox').first().click();
  await page.getByRole('textbox').first().fill(':');
  await page.locator('table').nth(1).click();
  await page.getByRole('button', { name: 'OK' }).click();
  await page.locator('#notification').getByText('Split 2 cell(s)').click();
  await expect(page.getByText('timeB 1', { exact: true })).toBeVisible();
  await expect(page.getByText('timeB 2', { exact: true })).toBeVisible();
  await expect(page.getByText('timeB 3', { exact: true })).toBeVisible();
});

test('Modify Match Date column date', async ({ page }) => {
  //Modification Match Date
  await page.locator('th:nth-child(6) > .column-header-title > .column-header-menu').click();
  await page.getByRole('link', { name: 'Edit cells' }).click();
  await page.getByRole('link', { name: 'Common trasforms' }).click();
  await page.getByRole('link', { name: 'To date' }).click();
  await expect(page.locator('#notification').getByText('Text transform')).toBeVisible();
  await expect(page.getByText('+20171212-01-01T00:00:00Z')).toBeVisible();
});

test('Modify Pseudoanonymization', async ({ page }) => {
  // Please provide your local base directory path below
  const baseDirectory = 'FILE_PATH';
  const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_sample.csv`;
  await page.getByRole('button', { name: 'Choose File' }).click();
  await page.getByRole('button', { name: 'Choose File' }).setInputFiles(filePath);
  await page.getByRole('button', { name: 'Next »' }).click();
  await page.getByRole('textbox', { name: 'Project name' }).click();
  await page.getByRole('textbox', { name: 'Project name' }).fill('Football Clubs');
  await expect(page.getByRole('textbox', { name: 'Project name' })).toBeVisible();
  await page.getByRole('button', { name: 'Create project »' }).click();
  await page.getByRole('link', { name: '25' }).click();

  await page.getByRole('columnheader', { name: 'Manager' }).getByRole('button').click();
  await page.getByRole('link', { name: 'Edit cells' }).click();
  await page.getByRole('link', { name: 'Transform…' }).click();
  await expect(page.getByText('Custom text transform')).toBeVisible();
  await page.getByRole('textbox', { name: 'Expression' }).click();
  await page.getByRole('textbox', { name: 'Expression' }).press('ControlOrMeta+a');
  await page.getByRole('textbox', { name: 'Expression' }).fill('value.sha1()');
  await expect(page.getByRole('cell', { name: 'value.sha1()' })).toBeVisible();
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(page.locator('#notification').getByText('Text transform')).toBeVisible();
});
