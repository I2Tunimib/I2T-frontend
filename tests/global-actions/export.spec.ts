import { test, expect } from '@playwright/test';
import { login, getOrCreateDataset, getOrCreateTable } from '../utils/setup.utils';
import { getComponents } from "../utils/components.utils";

test.beforeEach(async ({ page }) => {
  const urlChronos = 'http://vm.chronos.disco.unimib.it:3001/';
  // Please provide your local base directory path below
  const baseDirectory = 'FILE_PATH';
  const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_fullTableAnnotation.json`;
  const datasetName = 'Evaluation';
  const tableName = 'table_export';
  const username = 'test_user_12';
  const password = 'semtui_test_12';

  await login(page, urlChronos, username, password);
  await getOrCreateDataset(page, datasetName);
  await expect(page.getByRole('heading', { name: datasetName })).toBeVisible();
  console.log('Dataset "Evaluation" opened.');
  await getOrCreateTable(page, tableName, filePath);
  await expect(page.getByRole('textbox').first()).toBeVisible();
  console.log('Table opened.');
});

test('Export JSON Format', async ({ page }) => {
  const ui = getComponents(page);

  //Open Export dialog
  await ui.export.click();
  await expect(page.getByRole('heading', { name: 'Export' })).toBeVisible();
  await page.getByRole('combobox', { name: 'Export type' }).click();
  await page.getByRole('option', { name: 'Table' }).click();
  await expect(page.getByRole('combobox', { name: 'Export format' })).toBeEnabled();
  await page.getByRole('combobox', { name: 'Export format' }).click();
  await page.getByRole('option', { name: 'JSON (W3C Compliant)' }).click();

  //Downloading
  await expect(ui.confirmBtn).toBeEnabled();
  await ui.confirmBtn.click();
  console.log('JSON exported.');
});

test('Export CSV Format', async ({ page }) => {
  const ui = getComponents(page);

  //Open Export dialog
  await ui.export.click();
  await expect(page.getByRole('heading', { name: 'Export' })).toBeVisible();
  await page.getByRole('combobox', { name: 'Export type' }).click();
  await page.getByRole('option', { name: 'Table' }).click();
  await expect(page.getByRole('combobox', { name: 'Export format' })).toBeEnabled();
  await page.getByRole('combobox', { name: 'Export format' }).click();
  await page.getByRole('option', { name: 'CSV' }).click();

  //Downloading
  await expect(ui.confirmBtn).toBeEnabled();
  await ui.confirmBtn.click();
  console.log('CSV exported.');
});

test('Export RDF turtle Format', async ({ page }) => {
  const ui = getComponents(page);

  //Open Export dialog
  await ui.export.click();
  await expect(page.getByRole('heading', { name: 'Export' })).toBeVisible();
  await page.getByRole('combobox', { name: 'Export type' }).click();
  await page.getByRole('option', { name: 'Table' }).click();
  await expect(page.getByRole('combobox', { name: 'Export format' })).toBeEnabled();
  await page.getByRole('combobox', { name: 'Export format' }).click();
  await page.getByRole('option', { name: 'RDF' }).click();

  //RDF config
  await page.getByRole('combobox', { name: 'Output RDF format' }).click();
  await page.getByRole('option', { name: 'Turtle (.ttl)' }).click();
  await page.getByRole('textbox', { name: '@base URI' }).click();
  await page.getByRole('textbox', { name: '@base URI' }).fill('http://example.org/');
  await expect(page.getByRole('textbox', { name: '@base URI' })).toHaveValue('http://example.org/');
  await page.getByRole('radio', { name: 'All (Including all matching' }).check();

  //Donwloading
  await expect(ui.confirmBtn).toBeEnabled();
  await ui.confirmBtn.click();
  console.log('RDF turtle exported.');
});

test('Export RDF XML Format', async ({ page }) => {
  const ui = getComponents(page);

  //Open Export dialog
  await ui.export.click();
  await expect(page.getByRole('heading', { name: 'Export' })).toBeVisible();
  await page.getByRole('combobox', { name: 'Export type' }).click();
  await page.getByRole('option', { name: 'Table' }).click();
  await expect(page.getByRole('combobox', { name: 'Export format' })).toBeEnabled();
  await page.getByRole('combobox', { name: 'Export format' }).click();
  await page.getByRole('option', { name: 'RDF' }).click();

  //RDF config
  await page.getByRole('combobox', { name: 'Output RDF format' }).click();
  await page.getByRole('option', { name: 'XML (.rdf)' }).click();
  await page.getByRole('textbox', { name: '@base URI' }).click();
  await page.getByRole('textbox', { name: '@base URI' }).fill('http://example.org/');
  await expect(page.getByRole('textbox', { name: '@base URI' })).toHaveValue('http://example.org/');
  await page.getByRole('radio', { name: 'All (Including all matching' }).check();

  //Downloading
  await expect(ui.confirmBtn).toBeEnabled();
  await ui.confirmBtn.click();
  console.log('RDF XML exported.');
});

test('Export RDF JSON-LD Format', async ({ page }) => {
  const ui = getComponents(page);

  //Open Export dialog
  await ui.export.click();
  await expect(page.getByRole('heading', { name: 'Export' })).toBeVisible();
  await page.getByRole('combobox', { name: 'Export type' }).click();
  await page.getByRole('option', { name: 'Table' }).click();
  await expect(page.getByRole('combobox', { name: 'Export format' })).toBeEnabled();
  await page.getByRole('combobox', { name: 'Export format' }).click();
  await page.getByRole('option', { name: 'RDF' }).click();

  //RDF config
  await page.getByRole('combobox', { name: 'Output RDF format' }).click();
  await page.getByRole('option', { name: 'JSON-LD (.jsonld)' }).click();
  await page.getByRole('textbox', { name: '@base URI' }).click();
  await page.getByRole('textbox', { name: '@base URI' }).fill('http://example.org/');
  await expect(page.getByRole('textbox', { name: '@base URI' })).toHaveValue('http://example.org/');
  await page.getByRole('radio', { name: 'All (Including all matching' }).check();

  //Downloading
  await expect(ui.confirmBtn).toBeEnabled();
  await ui.confirmBtn.click();
  console.log('RDF JSON-LD exported.');
});

test('Export RDF TriG Format', async ({ page }) => {
  const ui = getComponents(page);

  //Open Export dialog
  await ui.export.click();
  await expect(page.getByRole('heading', { name: 'Export' })).toBeVisible();
  await page.getByRole('combobox', { name: 'Export type' }).click();
  await page.getByRole('option', { name: 'Table' }).click();
  await expect(page.getByRole('combobox', { name: 'Export format' })).toBeEnabled();
  await page.getByRole('combobox', { name: 'Export format' }).click();
  await page.getByRole('option', { name: 'RDF' }).click();

  //RDF config
  await page.getByRole('combobox', { name: 'Output RDF format' }).click();
  await page.getByRole('option', { name: 'TriG (.trig)' }).click();
  await page.getByRole('textbox', { name: '@base URI' }).click();
  await page.getByRole('textbox', { name: '@base URI' }).fill('http://example.org/');
  await expect(page.getByRole('textbox', { name: '@base URI' })).toHaveValue('http://example.org/');
  await page.getByRole('radio', { name: 'All (Including all matching' }).check();
  await expect(ui.confirmBtn).toBeEnabled();
  await ui.confirmBtn.click();
  console.log('RDF TriG exported.');
});

test('Export RDF TriX Format', async ({ page }) => {
  const ui = getComponents(page);

  //Open Export dialog
  await ui.export.click();
  await expect(page.getByRole('heading', { name: 'Export' })).toBeVisible();
  await page.getByRole('combobox', { name: 'Export type' }).click();
  await page.getByRole('option', { name: 'Table' }).click();
  await expect(page.getByRole('combobox', { name: 'Export format' })).toBeEnabled();
  await page.getByRole('combobox', { name: 'Export format' }).click();
  await page.getByRole('option', { name: 'RDF' }).click();

  //RDF config
  await page.getByRole('combobox', { name: 'Output RDF format' }).click();
  await page.getByRole('option', { name: 'TriX (.trix)' }).click();
  await page.getByRole('textbox', { name: '@base URI' }).click();
  await page.getByRole('textbox', { name: '@base URI' }).fill('http://example.org/');
  await expect(page.getByRole('textbox', { name: '@base URI' })).toHaveValue('http://example.org/');
  await page.getByRole('radio', { name: 'All (Including all matching' }).check();

  //Downloading
  await expect(ui.confirmBtn).toBeEnabled();
  await ui.confirmBtn.click();
  console.log('RDF TriX exported.');
});

test('Export RDF N-Quads Format', async ({ page }) => {
  const ui = getComponents(page);

  //Open Export dialog
  await ui.export.click();
  await expect(page.getByRole('heading', { name: 'Export' })).toBeVisible();
  await page.getByRole('combobox', { name: 'Export type' }).click();
  await page.getByRole('option', { name: 'Table' }).click();
  await expect(page.getByRole('combobox', { name: 'Export format' })).toBeEnabled();
  await page.getByRole('combobox', { name: 'Export format' }).click();
  await page.getByRole('option', { name: 'RDF' }).click();

  //RDF config
  await page.getByRole('combobox', { name: 'Output RDF format' }).click();
  await page.getByRole('option', { name: 'N-Quads (.nq)' }).click();
  await page.getByRole('textbox', { name: '@base URI' }).click();
  await page.getByRole('textbox', { name: '@base URI' }).fill('http://example.org/');
  await expect(page.getByRole('textbox', { name: '@base URI' })).toHaveValue('http://example.org/');
  await page.getByRole('radio', { name: 'All (Including all matching' }).check();

  //Downloading
  await expect(ui.confirmBtn).toBeEnabled();
  await ui.confirmBtn.click();
  console.log('RDF N-Quads exported.');
});

test('Export RDF N-Triples Format', async ({ page }) => {
  const ui = getComponents(page);

  //Open Export dialog
  await ui.export.click();
  await expect(page.getByRole('heading', { name: 'Export' })).toBeVisible();
  await page.getByRole('combobox', { name: 'Export type' }).click();
  await page.getByRole('option', { name: 'Table' }).click();
  await expect(page.getByRole('combobox', { name: 'Export format' })).toBeEnabled();
  await page.getByRole('combobox', { name: 'Export format' }).click();
  await page.getByRole('option', { name: 'RDF' }).click();

  //RDF config
  await page.getByRole('combobox', { name: 'Output RDF format' }).click();
  await page.getByRole('option', { name: 'N-Triples (.nt)' }).click();
  await page.getByRole('textbox', { name: '@base URI' }).click();
  await page.getByRole('textbox', { name: '@base URI' }).fill('http://example.org/');
  await expect(page.getByRole('textbox', { name: '@base URI' })).toHaveValue('http://example.org/');
  await page.getByRole('radio', { name: 'All (Including all matching' }).check();

  //Downloading
  await expect(ui.confirmBtn).toBeEnabled();
  await ui.confirmBtn.click();
  console.log('RDF N-Triples exported.');
});

test('Export Python Pipeline Format', async ({ page }) => {
  const ui = getComponents(page);

  //Open Export dialog
  await ui.export.click();
  await expect(page.getByRole('heading', { name: 'Export' })).toBeVisible();
  await page.getByRole('combobox', { name: 'Export type' }).click();
  await page.getByRole('option', { name: 'Pipeline' }).click();
  await expect(page.getByRole('combobox', { name: 'Export format' })).toBeEnabled();
  await page.getByRole('combobox', { name: 'Export format' }).click();
  await page.getByRole('option', { name: 'Python pipeline' }).click();
  await expect(ui.confirmBtn).toBeEnabled();
  await ui.confirmBtn.click();
  console.log('Python Pipeline exported.');
});

test('Export Jupyter Pipeline Format', async ({ page }) => {
  const ui = getComponents(page);

  //Open Export dialog
  await ui.export.click();
  await expect(page.getByRole('heading', { name: 'Export' })).toBeVisible();
  await page.getByRole('combobox', { name: 'Export type' }).click();
  await page.getByRole('option', { name: 'Pipeline' }).click();
  await expect(page.getByRole('combobox', { name: 'Export format' })).toBeEnabled();
  await page.getByRole('combobox', { name: 'Export format' }).click();
  await page.getByRole('option', { name: 'Jupyter notebook pipeline' }).click();
  await expect(ui.confirmBtn).toBeEnabled();
  await ui.confirmBtn.click();
  console.log('Jupyter Pipeline exported.');
});
