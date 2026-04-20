import { test, expect } from '@playwright/test';
import { login, getOrCreateDataset, getOrCreateTable } from '../utils/setup.utils';

test.beforeEach(async ({ page }) => {
  const urlLocal = '/';
  // Please provide your local base directory path below
  const baseDirectory = 'FILE_PATH';
  const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_fullTableAnnotation.json`;
  const datasetName = 'Dataset_test';
  const tableName = 'table_help';
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

test('Video Introduction', async ({ page }) => {
  test.setTimeout(150000);
  //Open Help dialog
  const helpBtn = page.getByRole('button', { name: 'help-dialog' });
  await helpBtn.click();
  await expect(page.getByRole('dialog', { name: 'Welcome' })).toBeVisible();
  await page.getByRole('button', { name: 'Video introduction' }).click();

  //Open video on Youtube
  const pageYoutubePromise = page.waitForEvent('popup');
  const pageYoutube = await pageYoutubePromise;
  await expect(pageYoutube.locator('video')).toBeVisible({ timeout: 10000 });
  await expect(pageYoutube.getByRole('link', { name: 'YouTube Home' })).toBeVisible({ timeout: 10000 });
  console.log('Video opened.');
});

test('Tutorial', async ({ page }) => {
  test.setTimeout(150000);
  const helpBtn = page.getByRole('button', { name: 'help-dialog' });
  const nextBtn = page.getByRole('button', { name: 'Next', exact: true });
  const doneBtn = page.getByRole('button', { name: 'Done', exact: true });
  const helpDialog = page.getByRole('dialog', { name: 'Welcome' });
  const tableNameInput = page.getByLabel('Table name');
  const tableName = 'table_help';

  await helpBtn.click();
  await expect(helpDialog).toBeVisible();

  //Introduction
  await page.getByRole('button', { name: 'Start tutorial' }).click();
  await expect(page.getByRole('heading', { name: 'Tutorial Contents' })).toBeVisible();

  //Toolbar - Global Actions
  await nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Global Actions' })).toBeVisible();

  //Toolbar - Visualization
  await nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Visualization' })).toBeVisible();

  //Link to Table Viewer
  await page.getByRole('button', { name: 'open-table-viewer' }).click();
  await expect(page.getByRole('heading', { name: 'Contextual Actions' })).toBeVisible({ timeout: 10000 });

  //Back to Toolbar - Visualization
  await page.getByRole('button', { name: 'Visualization' }).click();
  await expect(page.getByRole('heading', { name: 'Visualization' })).toBeVisible({ timeout: 10000 });

  //Link to Graph Visualization Tutorial
  await page.getByRole('button', { name: 'open-graph-visualization-tutorial' }).click();
  await expect(page.getByRole('dialog', { name: 'Graph Visualization' })).toBeVisible({ timeout: 10000 });

  //Graph Visualization Tutorial
  await page.getByRole('button', { name: 'Start tutorial' }).click();
  await expect(page.getByRole('heading', { name: 'Tutorial Contents' })).toBeVisible({ timeout: 10000 });

  //Back to Table Viewer
  await page.getByRole('button', { name: 'Back' }).click();
  await page.getByRole('dialog').press('Escape');
  await expect(tableNameInput).toBeVisible({ timeout: 10000 });
  await expect(tableNameInput).toHaveValue(tableName);

  //Back to Tutorial
  await helpBtn.click();
  await expect(page.getByRole('heading', { name: 'Tutorial Contents' })).toBeVisible({ timeout: 10000 });

  //Toolbar - Comnpliance
  await page.getByRole('button', { name: 'Toolbar' }).click();
  await expect(page.getByRole('button', { name: 'Compliance' })).toBeVisible({ timeout: 10000 });
  await page.getByRole('button', { name: 'Compliance' }).click();
  await expect(page.getByRole('heading', { name: 'Compliance' })).toBeVisible({ timeout: 10000 });

  //Link to Discover Service - GDPR
  await page.getByRole('button', { name: 'open-GDPR' }).click();
  await expect(page.getByRole('heading', { name: 'GDPR' })).toBeVisible({ timeout: 10000 });
  await doneBtn.click();

  //Back to Tutorial - Introduction
  await page.getByRole('button', { name: 'Start tutorial' }).click();
  await expect(page.getByRole('heading', { name: 'Tutorial Contents' })).toBeVisible({ timeout: 10000 });

  //Toolbar - Automatic Annotation
  await page.getByRole('button', { name: 'Toolbar' }).click();
  await expect(page.getByRole('button', { name: 'Toolbar' })).toBeVisible({ timeout: 10000 });
  await page.getByRole('button', { name: 'Automatic Annotation' }).click();
  await expect(page.getByRole('heading', { name: 'Automatic Annotation' })).toBeVisible({ timeout: 10000 });

  //Link to Reconciliation - Semantic Table Interpretation
  await page.getByRole('button', { name: 'open-semantic-table-interpretation' }).click();
  await expect(page.getByRole('heading', { name: 'Semantic Table Interpretation' })).toBeVisible({ timeout: 10000 });

  //Back to Toolbar - Automatic Annotation
  await page.getByRole('button', { name: 'Automatic Annotation' }).click();
  await expect(page.getByRole('heading', { name: 'Automatic Annotation' })).toBeVisible({ timeout: 10000 });

  //Link to Reconciliation - Schema Annotation
  await page.getByRole('button', { name: 'open-schema-annotation' }).click();
  await expect(page.getByRole('heading', { name: 'Schema Annotation' })).toBeVisible({ timeout: 10000 });

  //Toolbar - Export
  await page.getByRole('button', { name: 'Export' }).click();
  await expect(page.getByRole('heading', { name: 'Export' })).toBeVisible({ timeout: 10000 });

  //Table Viewer - Contextual Actions
  await nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Contextual Actions' })).toBeVisible();

  //Link to Matching Revision - Group of Cells Refinement
  await page.getByRole('button', { name: 'open-group-cells-refinement' }).click();
  await expect(page.getByRole('heading', { name: 'Group of Cells Refinement' })).toBeVisible({ timeout: 10000 });

  //Table Viewer - Search and Navigation
  await page.getByRole('button', { name: 'Search and Navigation' }).click();
  await expect(page.getByRole('heading', { name: 'Search and Navigation' })).toBeVisible({ timeout: 10000 });

  //Table Viewer - Filtering and Column Visibility
  await nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Filtering and Column Visibility' })).toBeVisible();

  //Link to Reconciliation - Annotation Symbols
  await page.getByRole('button', { name: 'open-annotation-symbols' }).click();
  await expect(page.getByRole('heading', { name: 'Annotation Symbols' })).toBeVisible({ timeout: 10000 });

  //Table Viewer - Column Header Actions
  await page.getByRole('button', { name: 'Column Header Actions' }).click();
  await expect(page.getByRole('heading', { name: 'Column Header Actions' })).toBeVisible({ timeout: 10000 });

  //Modification
  await nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Modification' })).toBeVisible();

  //Reconciliation - Introduction
  await nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Introduction' })).toBeVisible();

  //Reconciliation - Semantic Table Interpretation (Automatic)
  await nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Semantic Table Interpretation (Automatic)' })).toBeVisible();

  //Reconciliation - Service-based Reconciliation
  await nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Service-based Reconciliation' })).toBeVisible();

  //Reconciliation - Manual Reconciliation
  await nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Manual Reconciliation' })).toBeVisible();

  //Reconciliation - Schema Annotation
  await nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Schema Annotation' })).toBeVisible();

  //Reconciliation - Annotation Symbols
  await nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Annotation Symbols' })).toBeVisible();

  //Matching Revision - Introduction
  await nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Introduction' })).toBeVisible();

  //Matching Revision - Single Cell Entity Matching Revision
  await nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Single Cell Entity Matching Revision' })).toBeVisible();

  //Matching Revision - Group of Cells Refinement
  await nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Group of Cells Refinement' })).toBeVisible();

  //Extension
  await nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Extension' })).toBeVisible();

  //Generative AI
  await nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Generative AI' })).toBeVisible();

  //Tutorial completed
  await nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Tutorial completed!' })).toBeVisible();

  //Back to Help dialog
  await doneBtn.click();
  await expect(helpDialog).toBeVisible();
  await helpDialog.press('Escape');
  console.log('Tutorial checked.');

  //Back to Table View
  await expect(tableNameInput).toBeVisible();
  await expect(tableNameInput).toHaveValue(tableName);
});

test('Discover Services', async ({ page }) => {
  test.setTimeout(120000);
  const helpBtn = page.getByRole('button', { name: 'help-dialog' });
  const nextBtn = page.getByRole('button', { name: 'Next', exact: true });
  const doneBtn = page.getByRole('button', { name: 'Done', exact: true });
  const helpDialog = page.getByRole('dialog', { name: 'Welcome' });
  const tableNameInput = page.getByLabel('Table name');
  const tableName = `table_help`;

  await helpBtn.click();
  await expect(helpDialog).toBeVisible();
  //Discover Services
  await page.getByRole('button', { name: 'Discover Services' }).click();
  //Introduction
  await expect(page.getByRole('heading', { name: 'Introduction' })).toBeVisible();
  //Modification - Data Cleaning
  await nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Data Cleaning' })).toBeVisible();
  //Modification - Date Formatter
  await nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Date Formatter' })).toBeVisible();
  //Modification - Pseudoanonymization
  await nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Pseudoanonymization' })).toBeVisible();
  //Modification - Regular Expression Modifier
  await nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Regular Expression Modifier' })).toBeVisible();
  //Modification - Text to columns / Columns to text
  await nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Text to columns / Columns to text' })).toBeVisible();
  //Modification - Text to rows
  await nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Text to rows' })).toBeVisible();
  //Reconciliation - Geocoding: Geo Coordinates (GeoNames)
  await nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Geocoding: Geo Coordinates (GeoNames)' })).toBeVisible();
  //Reconciliation - Geocoding: Geo Coordinates (HERE)
  await nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Geocoding: Geo Coordinates (HERE)' })).toBeVisible();
  //Reconciliation - Linking: GeoNames (GeoNames)
  await nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Linking: GeoNames (GeoNames)' })).toBeVisible();
  //Reconciliation - Linking: In-Table Linking
  await nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Linking: In-Table Linking' })).toBeVisible();
  //Reconciliation - Linking: Wikidata (Alligator)
  await nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Linking: Wikidata (Alligator)' })).toBeVisible();
  //Reconciliation - Linking: Wikidata (OpenRefine)
  await nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Linking: Wikidata (OpenRefine)' })).toBeVisible();
  //Extension - Annotation properties
  await nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Annotation properties' })).toBeVisible();
  //Extension - Annotation properties (Wikidata)
  await nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Annotation properties (Wikidata)' })).toBeVisible();
  //Extension - Geo Properties (Wikidata)
  await nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Geo Properties (Wikidata)' })).toBeVisible();
  //Extension - Geo Route (HERE)
  await nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Geo Route (HERE)' })).toBeVisible();
  //Extension - Meteo Properties (OpenMeteo)
  await nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Meteo Properties (OpenMeteo)' })).toBeVisible();
  //Extension - SPARQL (Wikidata)
  await nextBtn.click();
  await expect(page.getByRole('heading', { name: 'SPARQL (Wikidata)' })).toBeVisible();
  //Extension - Wikidata properties
  await nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Wikidata properties' })).toBeVisible();
  //Gen AI - Modification - Custom (LLM Modifier)
  await nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Custom (LLM Modifier)' })).toBeVisible();
  //Gen AI - Reconciliation - Custom (LLM Reconciler)
  await nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Custom (LLM Reconciler)' })).toBeVisible();
  //Gen AI - Reconciliation - Custom Wikidata (LLM Reconciler)
  await nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Custom Wikidata (LLM Reconciler)' })).toBeVisible();
  //Gen AI - Extension - CH Matching - Private
  await nextBtn.click();
  await expect(page.getByRole('heading', { name: 'CH Matching - Private' })).toBeVisible();
  //Gen AI - Extension - COFOG (LLM Classifier)
  await nextBtn.click();
  await expect(page.getByRole('heading', { name: 'COFOG (LLM Classifier)' })).toBeVisible();
  //Gen AI - Extension - Custom (LLM Extender)
  await nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Custom (LLM Extender)' })).toBeVisible();
  //Compliance - GDPR
  await nextBtn.click();
  await expect(page.getByRole('heading', { name: 'GDPR' })).toBeVisible();
  //Back to Help dialog
  await doneBtn.click();
  await expect(helpDialog).toBeVisible();
  await helpDialog.press('Escape');
  console.log('Discover Services checked.');

  //Back to Table View
  await expect(tableNameInput).toBeVisible();
  await expect(tableNameInput).toHaveValue(tableName);
});

test('Compliance Link', async ({ page }) => {
  test.setTimeout(120000);
  const complianceDialog = page.getByRole('dialog', { name: 'Compliance Check' });
  const tableNameInput = page.getByLabel('Table name');
  const tableName = `table_help`;

  //Open Compliance Dialog
  await page.getByRole('button', { name: 'Compliance' }).click();
  await expect(complianceDialog).toBeVisible();

  //Open Compliance in Tutorial
  await page.getByRole('button', { name: 'open-compliance-tutorial' }).click();
  await expect(page.getByRole('heading', { name: 'Compliance' })).toBeVisible();
  console.log('Compliance checked in tutorial.');

  //Back to Compliance Dialog
  await page.getByRole('dialog').press('Escape');
  await expect(complianceDialog).toBeVisible();

  //Open Compliance in Discover
  await page.getByRole('button', { name: 'open-compliance-discover' }).click();
  await expect(page.getByRole('heading', { name: 'GDPR' })).toBeVisible();
  console.log('Compliance checked in discover.');

  //Back to Compliance Dialog
  await page.getByRole('dialog').press('Escape');
  await expect(complianceDialog).toBeVisible();
  await page.getByRole('button', { name: 'Cancel' }).click();

  //Back to Table View
  await expect(tableNameInput).toBeVisible();
  await expect(tableNameInput).toHaveValue(tableName);
});

test('Automatic Annotation Link', async ({ page }) => {
  test.setTimeout(120000);
  const automaticAnnotationDialog = page.getByRole('dialog', { name: 'Automatic Annotation' });
  const tableNameInput = page.getByLabel('Table name');
  const tableName = `table_help`;

  //Open Automatic Annotation Dialog
  await page.getByRole('button', { name: 'Automatic Annotation' }).click();
  await expect(automaticAnnotationDialog).toBeVisible();

  //Open Automatic Annotation in Tutorial
  await page.getByRole('button', { name: 'open-automatic-annotation-tutorial' }).click();
  await expect(page.getByRole('heading', { name: 'Automatic Annotation' })).toBeVisible();
  console.log('Automatic Annotation checked in tutorial.');

  //Back to Automatic Annotation Dialog
  await page.getByRole('dialog').press('Escape');
  await expect(automaticAnnotationDialog).toBeVisible();
  await page.getByRole('button', { name: 'Cancel' }).click();

  //Back to Table View
  await expect(tableNameInput).toBeVisible();
  await expect(tableNameInput).toHaveValue(tableName);
});

test('Export Link', async ({ page }) => {
  test.setTimeout(120000);
  const exportDialog = page.getByRole('dialog', { name: 'Export' });
  const tableNameInput = page.getByLabel('Table name');
  const tableName = `table_help`;

  //Open Export Dialog
  await page.getByRole('button', { name: 'Export' }).click();
  await expect(exportDialog).toBeVisible();

  //Open Export in Tutorial
  await page.getByRole('button', { name: 'open-export-tutorial' }).click();
  await expect(page.getByRole('heading', { name: 'Export' })).toBeVisible();
  console.log('Export checked in tutorial.');

  //Back to Export Dialog
  await page.getByRole('dialog').press('Escape');
  await expect(exportDialog).toBeVisible();
  await page.getByRole('button', { name: 'Cancel' }).click();

  //Back to Table View
  await expect(tableNameInput).toBeVisible();
  await expect(tableNameInput).toHaveValue(tableName);
});

test('Modify Link', async ({ page }) => {
  test.setTimeout(120000);
  const modificationDialog = page.getByRole('dialog', { name: 'Modification' });
  const modificationHeading = page.getByRole('heading', { name: 'Modification' });
  const column = page.getByRole('columnheader', { name: 'Football Club' });
  const tableNameInput = page.getByLabel('Table name');
  const tableName = `table_help`;

  //Select column
  await expect(column).toBeVisible();
  await column.click();
  console.log('Column "Football Club" selected.');

  //Open Modification Dialog
  await expect(page.getByRole('button', { name: 'Modify' })).toBeEnabled();
  await page.getByRole('button', { name: 'Modify' }).click();
  await expect(modificationDialog).toBeVisible();

  //Open Modification in Tutorial
  await page.getByRole('button', { name: 'open-modification-tutorial' }).click();
  await expect(modificationHeading).toBeVisible();
  console.log('Modification checked in tutorial.');

  //Back to Modification Dialog
  await page.getByRole('dialog').press('Escape');
  await expect(modificationHeading).toBeVisible();

  //Open Modification in Discover
  await page.getByRole('button', { name: 'open-modification-discover' }).click();
  await expect(page.getByRole('heading', { name: 'Data Cleaning' })).toBeVisible();
  console.log('Modification checked in discover.');

  //Back to Modification Dialog
  await page.getByRole('dialog').press('Escape');
  await expect(modificationHeading).toBeVisible();
  await page.getByRole('button', { name: 'close' }).click();

  //Back to Table View
  await expect(tableNameInput).toBeVisible();
  await expect(tableNameInput).toHaveValue(tableName);
});

test('Reconcile Link', async ({ page }) => {
  test.setTimeout(120000);
  const reconciliationDialog = page.getByRole('dialog', { name: 'Reconciliation' });
  const reconciliationHeading = page.getByRole('heading', { name: 'Reconciliation' });
  const column = page.getByRole('columnheader', { name: 'Football Club' });
  const tableNameInput = page.getByLabel('Table name');
  const tableName = `table_help`;

  //Select column
  await expect(column).toBeVisible();
  await column.click();
  console.log('Column "Football Club" selected.');

  //Open Reconciliation Dialog
  await expect(page.getByRole('button', { name: 'Reconcile' })).toBeEnabled();
  await page.getByRole('button', { name: 'Reconcile' }).click();
  await expect(reconciliationDialog).toBeVisible();

  //Open Reconciliation in Tutorial
  await page.getByRole('button', { name: 'open-reconciliation-tutorial' }).click();
  await expect(page.getByRole('heading', { name: 'Introduction' })).toBeVisible();
  console.log('Reconciliation checked in tutorial.');

  //Back to Reconciliation Dialog
  await page.getByRole('dialog').press('Escape');
  await expect(reconciliationHeading).toBeVisible();

  //Open Reconciliation in Discover
  await page.getByRole('button', { name: 'open-reconciliation-discover' }).click();
  await expect(page.getByRole('heading', { name: 'Geocoding: Geo Coordinates (GeoNames)' })).toBeVisible();
  console.log('Reconciliation checked in discover.');

  //Back to Reconciliation Dialog
  await page.getByRole('dialog').press('Escape');
  await expect(reconciliationHeading).toBeVisible();
  await page.getByRole('button', { name: 'close' }).click();

  //Back to Table View
  await expect(tableNameInput).toBeVisible();
  await expect(tableNameInput).toHaveValue(tableName);
});

test('Extend Link', async ({ page }) => {
  test.setTimeout(120000);
  const extensionDialog = page.getByRole('dialog', { name: 'Extension' });
  const extensionHeading = page.getByRole('heading', { name: 'Extension' });
  const column = page.getByRole('columnheader', { name: 'Football Club' });
  const tableNameInput = page.getByLabel('Table name');
  const tableName = `table_help`;

  //Select column
  await expect(column).toBeVisible();
  await column.click();
  console.log('Column "Football Club" selected.');

  //Open Extension Dialog
  await expect(page.getByRole('button', { name: 'Extend' })).toBeEnabled();
  await page.getByRole('button', { name: 'Extend' }).click();
  await expect(extensionDialog).toBeVisible();

  //Open Extension in Tutorial
  await page.getByRole('button', { name: 'open-extension-tutorial' }).click();
  await expect(extensionHeading).toBeVisible();
  console.log('Extension checked in tutorial.');

  //Back to Extension Dialog
  await page.getByRole('dialog').press('Escape');
  await expect(extensionHeading).toBeVisible();

  //Open Extension in Discover
  await page.getByRole('button', { name: 'open-extension-discover' }).click();
  await expect(page.getByRole('heading', { name: 'Annotation properties' })).toBeVisible();
  console.log('Extension checked in discover.');

  //Back to Extension Dialog
  await page.getByRole('dialog').press('Escape');
  await expect(extensionHeading).toBeVisible();
  await page.getByRole('button', { name: 'close' }).click();

  //Back to Table View
  await expect(tableNameInput).toBeVisible();
  await expect(tableNameInput).toHaveValue(tableName);
});

test('Gen AI Link', async ({ page }) => {
  test.setTimeout(120000);
  const genAIDialog = page.getByRole('dialog', { name: 'Services - Gen AI' });
  const genAIHeading = page.getByRole('heading', { name: 'Services - Gen AI' });
  const column = page.getByRole('columnheader', { name: 'Football Club' });
  const tableNameInput = page.getByLabel('Table name');
  const tableName = `table_help`;

  //Select column
  await expect(column).toBeVisible();
  await column.click();
  console.log('Column "Football Club" selected.');

  //Open GenAI Dialog
  await expect(page.getByRole('button', { name: 'Gen AI' })).toBeEnabled();
  await page.getByRole('button', { name: 'Gen AI' }).click();
  await expect(genAIDialog).toBeVisible();

  //Open GenAI in Tutorial
  await page.getByRole('button', { name: 'open-genAI-tutorial' }).click();
  await expect(page.getByRole('heading', { name: 'Generative AI' })).toBeVisible();
  console.log('GenAI checked in tutorial.');

  //Back to GenAI Dialog
  await page.getByRole('dialog').press('Escape');
  await expect(genAIHeading).toBeVisible();

  //Open GenAI in Discover
  await page.getByRole('button', { name: 'open-genAI-discover' }).click();
  await expect(page.getByRole('heading', { name: 'Custom (LLM Modifier)' })).toBeVisible();
  console.log('GenAI checked in discover.');

  //Back to GenAI Dialog
  await page.getByRole('dialog').press('Escape');
  await expect(genAIHeading).toBeVisible();
  await page.getByRole('button', { name: 'close' }).click();
  await expect(tableNameInput).toBeVisible();
  await expect(tableNameInput).toHaveValue(tableName);
});

test('Metadata Cell Link', async ({ page }) => {
  test.setTimeout(120000);
  const cellHeading = page.getByRole('heading', { name: 'Arsenal' });
  const tableNameInput = page.getByLabel('Table name');
  const tableName = `table_help`;

  //Open Metadata Dialog for Arsenal cell
  await page.getByRole('gridcell', { name: 'Arsenal' }).getByLabel('open-metadata-dialog').click();
  await expect(cellHeading).toBeVisible();
  console.log('Opened Manage Metadata for Cell "Arsenal".');

  //Open Metadata in Tutorial
  await page.getByRole('button', { name: 'open-metadata-tutorial' }).click();
  await expect(page.getByRole('heading', { name: 'Single Cell Entity Matching Revision' })).toBeVisible();

  //Back to Metadata Dialog
  await page.getByRole('dialog').press('Escape');
  await expect(cellHeading).toBeVisible();
  await page.getByRole('button', { name: 'Cancel' }).click();

  //Back to Table View
  await expect(tableNameInput).toBeVisible();
  await expect(tableNameInput).toHaveValue(tableName);
});

test('Refinement Link', async ({ page }) => {
  test.setTimeout(120000);
  const refinementHeading = page.getByRole('heading', { name: 'Refine matching' });
  const column = page.getByRole('columnheader', { name: 'Football Club' });
  const tableNameInput = page.getByLabel('Table name');
  const tableName = `table_help`;

  //Select column
  await expect(column).toBeVisible();
  await column.click();
  console.log('Column "Football Club" selected.');

  //Open Refinement Dialog
  await page.getByRole('button', { name: 'open-refinement-dialog' }).click();
  await expect(refinementHeading).toBeVisible();

  //Open Refinement in Tutorial
  await page.getByRole('button', { name: 'open-refinement-tutorial' }).click();
  await expect(page.getByRole('heading', { name: 'Group of Cells Refinement' })).toBeVisible();

  //Back to Refinement Dialog
  await page.getByRole('dialog').press('Escape');

  //Back to Table View
  await expect(tableNameInput).toBeVisible();
  await expect(tableNameInput).toHaveValue(tableName);
});

test('Graph Visualization', async ({ page }) => {
  test.setTimeout(120000);
  const graphHeading = page.getByRole('heading', { name: 'Graph Visualization' });
  const nextBtn = page.getByRole('button', { name: 'Next', exact: true });
  const doneBtn = page.getByRole('button', { name: 'Done', exact: true });
  const tableNameInput = page.getByLabel('Table name');
  const tableName = `table_help`;

  //Open Graph View
  await page.getByRole('button', { name: 'right aligned' }).click();
  await expect(page.getByRole('heading', { name: 'Graph Info' })).toBeVisible();

  //Open Graph Tutorial
  await page.getByRole('button', { name: 'open-graph-tutorial' }).click();
  await expect(graphHeading).toBeVisible();
  await page.getByRole('button', { name: 'Start tutorial' }).click();
  await expect(page.getByRole('heading', { name: 'Tutorial Contents' })).toBeVisible();
  await nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Graph Area' })).toBeVisible();
  await nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Sidebar' })).toBeVisible();
  await nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Graph info' })).toBeVisible();
  await nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Selected Node/Link Details' })).toBeVisible();
  await nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Column Values' })).toBeVisible();
  await doneBtn.click();

  //Back to Graph View
  await expect(graphHeading).toBeVisible();
  await page.getByRole('dialog').press('Escape');

  //Back to Table View
  await expect(tableNameInput).toBeVisible();
  await expect(tableNameInput).toHaveValue(tableName);
});
