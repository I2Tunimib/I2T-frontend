import { test, expect } from '@playwright/test';
import { getOrCreateDataset, getOrCreateTable, login } from "../utils/setup.utils";
import { getComponents } from "../utils/components.utils";

test.beforeEach(async ({ page }) => {
  const urlLocal = '/';
  // Please provide your local base directory path below
  const baseDirectory = 'FILE_PATH';
  const filePath = `${baseDirectory}/Shared drives/SemT project (shared)/Test_Tables/Test interface/table_fullTableAnnotation.json`;
  const datasetName = 'Dataset_test';
  const tableName = 'table_sample';
  const username = 'test';
  const password = 'test';

  await login(page, urlLocal, username, password);
  await getOrCreateDataset(page, datasetName);
  await expect(page.getByRole('heading', { name: datasetName })).toBeVisible();
  console.log('Dataset opened.');
  await getOrCreateTable(page, tableName, filePath);
  const tableNameInput = page.getByLabel('Table name');
  await expect(tableNameInput).toBeVisible();
  await expect(tableNameInput).toHaveValue(tableName);
  console.log('Table opened.');
  await page.getByRole('link').filter({ hasText: /^$/ }).click();
  await page.locator('ol').getByRole('button').click();
});

test('Add viewer dataset', async ({ page }) => {
  test.setTimeout(120000);
  const urlLocal = '/';
  const datasetName = 'Dataset_test';
  const userViewer = 'test_1';
  const emailViewer = 'test_1';
  const passwordViewer = 'test_1';
  const ui = getComponents(page);

  await expect(page.getByRole('link', { name: datasetName, exact: true })).toBeVisible();
  await page.getByRole('link', { name: datasetName, exact: true }).hover();
  await expect(ui.accessBtn.first()).toBeVisible();
  await ui.accessBtn.first().click();
  await ui.addUserTarget(userViewer, emailViewer, true);
  await ui.userMenuBtn.click();
  await ui.logoutBtn.click();

  await login(page, urlLocal, userViewer, passwordViewer);
  await expect(page.getByRole('link', { name: datasetName, exact: true })).toBeVisible();
  await page.getByRole('link', { name: datasetName, exact: true }).hover();
  await expect(page.getByTestId('LockOutlinedIcon').first()).toBeVisible();
  await page.getByLabel('Read only').first().hover();
  await expect(page.getByText('Read only').first()).toBeVisible();
});

test('Add editor dataset', async ({ page }) => {
  test.setTimeout(120000);
  const urlLocal = '/';
  const datasetName = 'Dataset_test';
  const userEditor = 'test_2';
  const emailEditor = 'test_2';
  const passwordEditor = 'test_2';
  const ui = getComponents(page);

  await expect(page.getByRole('link', { name: datasetName, exact: true })).toBeVisible();
  await page.getByRole('link', { name: datasetName, exact: true }).hover();
  await expect(ui.accessBtn.first()).toBeVisible();
  await ui.accessBtn.first().click();
  await ui.addUserTarget(userEditor, emailEditor, false);
  await ui.userMenuBtn.click();
  await ui.logoutBtn.click();

  await login(page, urlLocal, userEditor, passwordEditor);
  await expect(page.getByRole('link', { name: datasetName, exact: true })).toBeVisible();
  await page.getByRole('link', { name: datasetName, exact: true }).hover();
  await expect(page.getByTestId('LockOpenOutlinedIcon').first()).toBeVisible();
  await page.getByLabel('Read & Write').first().hover();
  await expect(page.getByText('Read & Write').first()).toBeVisible();
});

test('Remove viewer dataset', async ({ page }) => {
  test.setTimeout(120000);
  const urlLocal = '/';
  const datasetName = 'Dataset_test';
  const userViewer = 'test_1';
  const emailViewer = 'test_1';
  const passwordViewer = 'test_1';
  const ui = getComponents(page);

  await expect(page.getByRole('link', { name: datasetName, exact: true })).toBeVisible();
  await page.getByRole('link', { name: datasetName, exact: true }).hover();
  await expect(ui.accessBtn.first()).toBeVisible();
  await ui.accessBtn.first().click();
  await ui.removeUserTarget(userViewer, emailViewer, true);
  await ui.userMenuBtn.click();
  await ui.logoutBtn.click();

  await login(page, urlLocal, userViewer, passwordViewer);
  await expect(page.getByRole('link', { name: datasetName, exact: true })).not.toBeVisible();
});

test('Remove editor dataset', async ({ page }) => {
  test.setTimeout(120000);
  const urlLocal = '/';
  const datasetName = 'Dataset_test';
  const userEditor = 'test_2';
  const emailEditor = 'test_2';
  const passwordEditor = 'test_2';
  const ui = getComponents(page);

  await expect(page.getByRole('link', { name: datasetName, exact: true })).toBeVisible();
  await page.getByRole('link', { name: datasetName, exact: true }).hover();
  await expect(ui.accessBtn.first()).toBeVisible();
  await ui.accessBtn.first().click();
  await ui.removeUserTarget(userEditor, emailEditor, false);
  await ui.userMenuBtn.click();
  await ui.logoutBtn.click();

  await login(page, urlLocal, userEditor, passwordEditor);
  await expect(page.getByRole('link', { name: datasetName, exact: true })).not.toBeVisible();
});

test('Dataset public', async ({ page }) => {
  test.setTimeout(120000);
  const urlLocal = '/';
  const datasetName = 'Dataset_test';
  const userTarget = 'test_1';
  const passwordTarget = 'test_1';
  const ui = getComponents(page);

  await expect(page.getByRole('link', { name: datasetName, exact: true })).toBeVisible();
  await page.getByRole('link', { name: datasetName, exact: true }).hover();
  await expect(ui.accessBtn.first()).toBeVisible();
  await ui.accessBtn.first().click();

  await expect(page.getByRole('heading', { name: 'Visibility' })).toBeVisible();
  await page.getByRole('radio', { name: 'Public (any authenticated' }).check();
  await ui.closeBtn.click();
  await ui.userMenuBtn.click();
  await ui.logoutBtn.click();

  await login(page, urlLocal, userTarget, passwordTarget);
  await expect(page.getByRole('link', { name: datasetName, exact: true })).toBeVisible();
  await page.getByRole('link', { name: datasetName, exact: true }).hover();
  await expect(page.getByTestId('LockOutlinedIcon').first()).toBeVisible();
  await page.getByLabel('Read only').first().hover();
  await expect(page.getByText('Read only').first()).toBeVisible();
});

test('Quick Actions table', async ({ page }) => {
  test.setTimeout(120000);
  const datasetName = 'Dataset_test';
  const tableName = 'table_sample';
  const ui = getComponents(page);

  await expect(page.getByRole('link', { name: datasetName, exact: true })).toBeVisible();
  await page.getByRole('link', { name: datasetName, exact: true }).click();
  await expect(page.getByRole('link', { name: tableName, exact: true })).toBeVisible();
  await page.getByRole('link', { name: tableName, exact: true }).hover();
  await expect(ui.complianceBtn).toBeVisible();
  await ui.complianceBtn.click();
  await expect(page.getByRole('heading', { name: 'Compliance report' })).toBeVisible();
  await ui.cancelBtn.click();

  await page.getByRole('link', { name: tableName, exact: true }).hover();
  await expect(ui.schemaBtn).toBeVisible();
  await ui.schemaBtn.click();
  await expect(page.getByRole('heading', { name: 'Schema Graph Visualization' })).toBeVisible();
  await page.getByRole('button').first().click();

  await page.getByRole('link', { name: tableName, exact: true }).hover();
  await expect(ui.pipelineBtn).toBeVisible();
  await ui.pipelineBtn.click();
  await expect(page.getByRole('heading', { name: 'Pipeline' })).toBeVisible();
  await ui.closePanelBtn.click();
});

test('Table private - Add viewer table', async ({ page }) => {
  test.setTimeout(120000);
  const urlLocal = '/';
  const datasetName = 'Dataset_test';
  const tableName = 'table_sample';
  const userViewer = 'test_1';
  const emailViewer = 'test_1';
  const passwordViewer = 'test_1';
  const ui = getComponents(page);

  await expect(page.getByRole('link', { name: datasetName, exact: true })).toBeVisible();
  await page.getByRole('link', { name: datasetName, exact: true }).click();
  await expect(page.getByRole('link', { name: tableName, exact: true })).toBeVisible();
  await page.getByRole('link', { name: tableName, exact: true }).hover();
  await expect(ui.accessBtn.first()).toBeVisible();
  await ui.accessBtn.first().click();
  await expect(page.getByRole('heading', { name: 'Table access control' })).toBeVisible();
  await page.getByRole('radio', { name: 'Private' }).check();
  await ui.addUserTarget(userViewer, emailViewer, true);
  await ui.userMenuBtn.click();
  await ui.logoutBtn.click();

  await login(page, urlLocal, userViewer, passwordViewer);
  await expect(page.getByRole('link', { name: datasetName, exact: true })).toBeVisible();
  await page.getByRole('link', { name: datasetName, exact: true }).click();
  await expect(page.getByRole('link', { name: tableName, exact: true })).toBeVisible();
  await page.getByRole('link', { name: tableName, exact: true }).hover();
  await expect(page.getByTestId('LockOutlinedIcon').first()).toBeVisible();
  await page.getByLabel('Read only').first().hover();
  await expect(page.getByText('Read only').first()).toBeVisible();
});

test('Table private - Add editor table', async ({ page }) => {
  test.setTimeout(120000);
  const urlLocal = '/';
  const datasetName = 'Dataset_test';
  const tableName = 'table_sample';
  const userEditor = 'test_2';
  const emailEditor = 'test_2';
  const passwordEditor = 'test_2';
  const ui = getComponents(page);

  await expect(page.getByRole('link', { name: datasetName, exact: true })).toBeVisible();
  await page.getByRole('link', { name: datasetName, exact: true }).click();
  await expect(page.getByRole('link', { name: tableName, exact: true })).toBeVisible();
  await page.getByRole('link', { name: tableName, exact: true }).hover();
  await expect(ui.accessBtn.first()).toBeVisible();
  await ui.accessBtn.first().click();
  await expect(page.getByRole('heading', { name: 'Table access control' })).toBeVisible();
  await page.getByRole('radio', { name: 'Private' }).check();
  await ui.addUserTarget(userEditor, emailEditor, false);
  await ui.userMenuBtn.click();
  await ui.logoutBtn.click();

  await login(page, urlLocal, userEditor, passwordEditor);
  await expect(page.getByRole('link', { name: datasetName, exact: true })).toBeVisible();
  await page.getByRole('link', { name: datasetName, exact: true }).click();
  await expect(page.getByRole('link', { name: tableName, exact: true })).toBeVisible();
  await page.getByRole('link', { name: tableName, exact: true }).hover();
  await expect(page.getByTestId('LockOpenOutlinedIcon').first()).toBeVisible();
  await page.getByLabel('Read & Write').first().hover();
  await expect(page.getByText('Read & Write').first()).toBeVisible();
});

test('Remove viewer table', async ({ page }) => {
  test.setTimeout(120000);
  const urlLocal = '/';
  const datasetName = 'Dataset_test';
  const tableName = 'table_sample';
  const userViewer = 'test_1';
  const emailViewer = 'test_1';
  const passwordViewer = 'test_1';
  const ui = getComponents(page);

  await expect(page.getByRole('link', { name: datasetName, exact: true })).toBeVisible();
  await page.getByRole('link', { name: datasetName, exact: true }).click();
  await expect(page.getByRole('link', { name: tableName, exact: true })).toBeVisible();
  await page.getByRole('link', { name: tableName, exact: true }).hover();
  await expect(ui.accessBtn.first()).toBeVisible();
  await ui.accessBtn.first().click();
  await expect(page.getByRole('heading', { name: 'Table access control' })).toBeVisible();
  await page.getByRole('radio', { name: 'Private' }).check();
  await ui.removeUserTarget(userViewer, emailViewer, true);
  await ui.userMenuBtn.click();
  await ui.logoutBtn.click();

  await login(page, urlLocal, userViewer, passwordViewer);
  await expect(page.getByRole('link', { name: datasetName, exact: true })).toBeVisible();
  await page.getByRole('link', { name: datasetName, exact: true }).click();
  await expect(page.getByRole('link', { name: tableName, exact: true })).not.toBeVisible();
});

test('Remove editor table', async ({ page }) => {
  test.setTimeout(120000);
  const urlLocal = '/';
  const datasetName = 'Dataset_test';
  const tableName = 'table_sample';
  const userEditor = 'test_2';
  const emailEditor = 'test_2';
  const passwordEditor = 'test_2';
  const ui = getComponents(page);

  await expect(page.getByRole('link', { name: datasetName, exact: true })).toBeVisible();
  await page.getByRole('link', { name: datasetName, exact: true }).click();
  await expect(page.getByRole('link', { name: tableName, exact: true })).toBeVisible();
  await page.getByRole('link', { name: tableName, exact: true }).hover();
  await expect(ui.accessBtn.first()).toBeVisible();
  await ui.accessBtn.first().click();
  await expect(page.getByRole('heading', { name: 'Table access control' })).toBeVisible();
  await page.getByRole('radio', { name: 'Private' }).check();
  await ui.removeUserTarget(userEditor, emailEditor, false);
  await ui.userMenuBtn.click();
  await ui.logoutBtn.click();

  await login(page, urlLocal, userEditor, passwordEditor);
  await expect(page.getByRole('link', { name: datasetName, exact: true })).toBeVisible();
  await page.getByRole('link', { name: datasetName, exact: true }).click();
  await expect(page.getByRole('link', { name: tableName, exact: true })).not.toBeVisible();
});

test('Table public', async ({ page }) => {
  test.setTimeout(120000);
  const urlLocal = '/';
  const datasetName = 'Dataset_test';
  const tableName = 'table_sample';
  const userTarget = 'test_1';
  const passwordTarget = 'test_1';
  const ui = getComponents(page);

  await expect(page.getByRole('link', { name: datasetName, exact: true })).toBeVisible();
  await page.getByRole('link', { name: datasetName, exact: true }).click();
  await expect(page.getByRole('link', { name: tableName, exact: true })).toBeVisible();
  await page.getByRole('link', { name: tableName, exact: true }).hover();
  await expect(ui.accessBtn.first()).toBeVisible();
  await ui.accessBtn.first().click();
  await expect(page.getByRole('heading', { name: 'Table access control' })).toBeVisible();
  await page.getByRole('radio', { name: 'Public' }).check();
  await ui.closeBtn.click();
  await ui.userMenuBtn.click();
  await ui.logoutBtn.click();

  await login(page, urlLocal, userTarget, passwordTarget);
  await page.getByRole('link', { name: datasetName, exact: true }).click();
  await expect(page.getByRole('link', { name: tableName, exact: true })).toBeVisible();
  await page.getByRole('link', { name: tableName, exact: true }).hover();
  await expect(page.getByTestId('LockOutlinedIcon').first()).toBeVisible();
  await page.getByLabel('Read only').first().hover();
  await expect(page.getByText('Read only').first()).toBeVisible();
});
