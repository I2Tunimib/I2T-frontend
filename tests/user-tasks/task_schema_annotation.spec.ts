import { test, expect } from '@playwright/test';
import { login, getOrCreateDataset, getOrCreateTable } from '../utils/setup.utils';
import { modificationDialog, dateFormatterConfig } from '../utils/modification.utils';
import { schemaAnnotation, graphVisualization, checkPropsGraph, saveTable } from '../utils/global_actions.utils';
import {
  columnDialog,
  checkKind,
  checkRole,
  addPropertyEntities,
  addPropertyLiteral,
  checkPropsLiteral
} from '../utils/column_header.utils';

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
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);

  await test.step('Modify Match Date Column', async () => {
    test.setTimeout(120000);
    await modificationDialog(page, 'Match Date', 'Date Formatter');
    await dateFormatterConfig(
      page,
      'Match Date',
      'ISO',
      'Date only (yyyy-MM-dd)',
      false,
      undefined,
      false,
      undefined
    );
    console.log('Column "Match Date" modified.');
  });

  await test.step('Schema Annotation', async () => {
    test.setTimeout(120000);
    await schemaAnnotation(page, 'LLM Column Classifier');
    await expect(page.getByText('Annotation schema for table')).toBeVisible({ timeout: 100000 });

    await checkKind(page, 'Football Club', 'kind-entity');
    await checkKind(page, 'Manager', 'kind-entity');
    await checkKind(page, 'Team Captain', 'kind-entity');
    await checkKind(page, 'Supplier', 'kind-entity');
    await checkKind(page, 'Match Date', 'kind-literal');
    await checkKind(page, 'Match Location', 'kind-entity');
    await checkKind(page, 'Match Country', 'kind-entity');
    console.log('Schema annotated correctly with LLM Column Classifier.');
  });

  await test.step('Add country Property', async () => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    test.setTimeout(120000);

    await columnDialog(page, 'Match Location');
    await addPropertyEntities(page, 'P17', 'country', 'wd', 'Match Country');
    await checkRole(page, 'Match Location', 'role-subject');
    console.log('Addition of "country" property successful.');
  });

  await test.step('Add point in time Property', async () => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    test.setTimeout(120000);

    await columnDialog(page, 'Match Date');
    await checkPropsLiteral(page, 'P585', 'point in time');
    await columnDialog(page, 'Match Location');
    await addPropertyLiteral(page, 'P585', 'point in time', 'wd', 'Match Date');

    await checkRole(page, 'Match Location', 'role-subject');
    console.log('Addition of "point in time" property successful.');
  });

  await test.step('Graph Visualization', async () => {
    test.setTimeout(120000);
    await saveTable(page);
    console.log('Table saved.');

    await graphVisualization(page);
    console.log('Graph visualization opened.');

    await checkPropsGraph(page, ['P17', 'P585']);
  });
});
