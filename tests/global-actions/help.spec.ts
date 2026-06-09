import { test, expect } from '@playwright/test';
import { login, getOrCreateDataset, getOrCreateTable } from '../utils/setup.utils';
import { getComponents } from "../utils/components.utils";

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
  const ui = getComponents(page);

  //Open Help dialog
  await ui.helpDialogBtn.click();
  await expect(page.getByRole('dialog', { name: 'Welcome' })).toBeVisible();
  await ui.videoBtn.click();

  //Open video on Youtube
  const pageYoutubePromise = page.waitForEvent('popup');
  const pageYoutube = await pageYoutubePromise;
  await expect(pageYoutube.locator('video')).toBeVisible({ timeout: 10000 });
  await expect(pageYoutube.getByRole('link', { name: 'YouTube Home' })).toBeVisible({ timeout: 10000 });
  console.log('Video opened.');
});

test('Tutorial', async ({ page }) => {
  test.setTimeout(150000);
  const ui = getComponents(page);
  const helpDialog = page.getByRole('dialog', { name: 'Welcome' });
  const tableNameInput = page.getByLabel('Table name');
  const tableName = 'table_help';

  await ui.helpDialogBtn.click();
  await expect(helpDialog).toBeVisible();

  //Introduction
  await ui.startTutorialBtn.click();
  await expect(page.getByRole('heading', { name: 'Tutorial Contents' })).toBeVisible();

  //Toolbar - Global Actions
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Global Actions' })).toBeVisible();

  //Toolbar - Visualization
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Visualization' })).toBeVisible();

  //Link to Table Viewer
  await ui.tableViewerBtn.click();
  await expect(page.getByRole('heading', { name: 'Contextual Actions' })).toBeVisible({ timeout: 10000 });

  //Back to Toolbar - Visualization
  await ui.visualizationBtn.click();
  await expect(page.getByRole('heading', { name: 'Visualization' })).toBeVisible({ timeout: 10000 });

  //Link to Graph Visualization Tutorial
  await ui.graphTutorialBtn.click();
  await expect(page.getByRole('dialog', { name: 'Graph Visualization' })).toBeVisible({ timeout: 10000 });

  //Graph Visualization Tutorial
  await ui.startTutorialBtn.click();
  await expect(page.getByRole('heading', { name: 'Tutorial Contents' })).toBeVisible({ timeout: 10000 });

  //Back to Table Viewer
  await ui.backBtn.click();
  await page.getByRole('dialog').press('Escape');
  await expect(tableNameInput).toBeVisible({ timeout: 10000 });
  await expect(tableNameInput).toHaveValue(tableName);

  //Back to Tutorial
  await ui.helpDialogBtn.click();
  await expect(page.getByRole('heading', { name: 'Tutorial Contents' })).toBeVisible({ timeout: 10000 });

  //Toolbar - Comnpliance
  await ui.toolbarBtn.click();
  await expect(ui.complianceBtn).toBeVisible({ timeout: 10000 });
  await ui.complianceBtn.click();
  await expect(page.getByRole('heading', { name: 'Compliance' })).toBeVisible({ timeout: 10000 });

  //Link to Discover Service - GDPR
  await page.getByRole('button', { name: 'open-GDPR' }).click();
  await expect(page.getByRole('heading', { name: 'GDPR' })).toBeVisible({ timeout: 10000 });
  await ui.doneBtn.click();

  //Back to Tutorial - Introduction
  await ui.startTutorialBtn.click();
  await expect(page.getByRole('heading', { name: 'Tutorial Contents' })).toBeVisible({ timeout: 10000 });

  //Toolbar - Automatic Annotation
  await ui.toolbarBtn.click();
  await expect(ui.toolbarBtn).toBeVisible({ timeout: 10000 });
  await ui.autoAnnotationTutorialBtn.click();
  await expect(page.getByRole('heading', { name: 'Automatic Annotation' })).toBeVisible({ timeout: 10000 });

  //Link to Reconciliation - Semantic Table Interpretation
  await page.getByRole('button', { name: 'open-semantic-table-interpretation' }).click();
  await expect(page.getByRole('heading', { name: 'Semantic Table Interpretation' })).toBeVisible({ timeout: 10000 });

  //Back to Toolbar - Automatic Annotation
  await ui.autoAnnotationTutorialBtn.click();
  await expect(page.getByRole('heading', { name: 'Automatic Annotation' })).toBeVisible({ timeout: 10000 });

  //Link to Reconciliation - Schema Annotation
  await page.getByRole('button', { name: 'open-schema-annotation' }).click();
  await expect(page.getByRole('heading', { name: 'Schema Annotation' })).toBeVisible({ timeout: 10000 });

  //Toolbar - Export
  await page.getByRole('button', { name: 'Export' }).click();
  await expect(page.getByRole('heading', { name: 'Export' })).toBeVisible({ timeout: 10000 });

  //Table Viewer - Contextual Actions
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Contextual Actions' })).toBeVisible();

  //Link to Matching Revision - Group of Cells Refinement
  await page.getByRole('button', { name: 'open-group-cells-refinement' }).click();
  await expect(page.getByRole('heading', { name: 'Group of Cells Refinement' })).toBeVisible({ timeout: 10000 });

  //Table Viewer - Search and Navigation
  await page.getByRole('button', { name: 'Search and Navigation' }).click();
  await expect(page.getByRole('heading', { name: 'Search and Navigation' })).toBeVisible({ timeout: 10000 });

  //Table Viewer - Filtering and Column Visibility
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Filtering and Column Visibility' })).toBeVisible();

  //Link to Reconciliation - Annotation Symbols
  await page.getByRole('button', { name: 'open-annotation-symbols' }).click();
  await expect(page.getByRole('heading', { name: 'Annotation Symbols' })).toBeVisible({ timeout: 10000 });

  //Table Viewer - Column Header Actions
  await page.getByRole('button', { name: 'Column Header Actions' }).click();
  await expect(page.getByRole('heading', { name: 'Column Header Actions' })).toBeVisible({ timeout: 10000 });

  //Modification
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Modification' })).toBeVisible();

  //Reconciliation - Introduction
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Introduction' })).toBeVisible();

  //Reconciliation - Semantic Table Interpretation (Automatic)
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Semantic Table Interpretation (Automatic)' })).toBeVisible();

  //Reconciliation - Service-based Reconciliation
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Service-based Reconciliation' })).toBeVisible();

  //Reconciliation - Manual Reconciliation
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Manual Reconciliation' })).toBeVisible();

  //Reconciliation - Schema Annotation
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Schema Annotation' })).toBeVisible();

  //Reconciliation - Annotation Symbols
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Annotation Symbols' })).toBeVisible();

  //Matching Revision - Introduction
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Introduction' })).toBeVisible();

  //Matching Revision - Single Cell Entity Matching Revision
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Single Cell Entity Matching Revision' })).toBeVisible();

  //Matching Revision - Group of Cells Refinement
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Group of Cells Refinement' })).toBeVisible();

  //Extension
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Extension' })).toBeVisible();

  //Generative AI
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Generative AI' })).toBeVisible();

  //Tutorial completed
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Tutorial completed!' })).toBeVisible();

  //Back to Help dialog
  await ui.doneBtn.click();
  await expect(helpDialog).toBeVisible();
  await helpDialog.press('Escape');
  console.log('Tutorial checked.');

  //Back to Table View
  await expect(tableNameInput).toBeVisible();
  await expect(tableNameInput).toHaveValue(tableName);
});

test('Discover Services', async ({ page }) => {
  test.setTimeout(120000);
  const ui = getComponents(page);
  const helpDialog = page.getByRole('dialog', { name: 'Welcome' });
  const tableNameInput = page.getByLabel('Table name');
  const tableName = `table_help`;

  await ui.helpDialogBtn.click();
  await expect(helpDialog).toBeVisible();
  //Discover Services
  await page.getByRole('button', { name: 'Discover Services' }).click();
  //Introduction
  await expect(page.getByRole('heading', { name: 'Introduction' })).toBeVisible();
  //Modification - Data Cleaning
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Data Cleaning' })).toBeVisible();
  //Modification - Date Formatter
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Date Formatter' })).toBeVisible();
  //Modification - Pseudoanonymization
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Pseudoanonymization' })).toBeVisible();
  //Modification - Regular Expression Modifier
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Regular Expression Modifier' })).toBeVisible();
  //Modification - Text to columns / Columns to text
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Text to columns / Columns to text' })).toBeVisible();
  //Modification - Text to rows
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Text to rows' })).toBeVisible();
  //Reconciliation - Geocoding: Geo Coordinates (GeoNames)
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Geocoding: Geo Coordinates (GeoNames)' })).toBeVisible();
  //Reconciliation - Geocoding: Geo Coordinates (HERE)
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Geocoding: Geo Coordinates (HERE)' })).toBeVisible();
  //Reconciliation - Linking: GeoNames (GeoNames)
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Linking: GeoNames (GeoNames)' })).toBeVisible();
  //Reconciliation - Linking: In-Table Linking
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Linking: In-Table Linking' })).toBeVisible();
  //Reconciliation - Linking: Wikidata (Alligator)
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Linking: Wikidata (Alligator)' })).toBeVisible();
  //Reconciliation - Linking: Wikidata (OpenRefine)
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Linking: Wikidata (OpenRefine)' })).toBeVisible();
  //Extension - Annotation properties
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Annotation properties' })).toBeVisible();
  //Extension - Annotation properties (Wikidata)
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Annotation properties (Wikidata)' })).toBeVisible();
  //Extension - Geo Properties (Wikidata)
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Geo Properties (Wikidata)' })).toBeVisible();
  //Extension - Geo Route (HERE)
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Geo Route (HERE)' })).toBeVisible();
  //Extension - Meteo Properties (OpenMeteo)
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Meteo Properties (OpenMeteo)' })).toBeVisible();
  //Extension - SPARQL (Wikidata)
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'SPARQL (Wikidata)' })).toBeVisible();
  //Extension - Wikidata properties
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Wikidata properties' })).toBeVisible();
  //Gen AI - Modification - Custom (LLM Modifier)
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Custom (LLM Modifier)' })).toBeVisible();
  //Gen AI - Reconciliation - Custom (LLM Reconciler)
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Custom (LLM Reconciler)' })).toBeVisible();
  //Gen AI - Reconciliation - Custom Wikidata (LLM Reconciler)
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Custom Wikidata (LLM Reconciler)' })).toBeVisible();
  //Gen AI - Extension - CH Matching - Private
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'CH Matching - Private' })).toBeVisible();
  //Gen AI - Extension - COFOG (LLM Classifier)
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'COFOG (LLM Classifier)' })).toBeVisible();
  //Gen AI - Extension - Custom (LLM Extender)
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Custom (LLM Extender)' })).toBeVisible();
  //Compliance - GDPR
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'GDPR' })).toBeVisible();
  //Back to Help dialog
  await ui.doneBtn.click();
  await expect(helpDialog).toBeVisible();
  await helpDialog.press('Escape');
  console.log('Discover Services checked.');

  //Back to Table View
  await expect(tableNameInput).toBeVisible();
  await expect(tableNameInput).toHaveValue(tableName);
});

test('Compliance Link', async ({ page }) => {
  test.setTimeout(120000);
  const ui = getComponents(page);
  const complianceDialog = page.getByRole('dialog', { name: 'Compliance Check' });
  const tableNameInput = page.getByLabel('Table name');
  const tableName = `table_help`;

  //Open Compliance Dialog
  await ui.ComplianceBtn.click();
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
  await ui.cancelBtn.click();

  //Back to Table View
  await expect(tableNameInput).toBeVisible();
  await expect(tableNameInput).toHaveValue(tableName);
});

test('Automatic Annotation Link', async ({ page }) => {
  test.setTimeout(120000);
  const ui = getComponents(page);
  const automaticAnnotationDialog = page.getByRole('dialog', { name: 'Automatic Annotation' });
  const tableNameInput = page.getByLabel('Table name');
  const tableName = `table_help`;

  //Open Automatic Annotation Dialog
  await ui.autoAnnotationTutorialBtn.click();
  await expect(automaticAnnotationDialog).toBeVisible();

  //Open Automatic Annotation in Tutorial
  await page.getByRole('button', { name: 'open-automatic-annotation-tutorial' }).click();
  await expect(page.getByRole('heading', { name: 'Automatic Annotation' })).toBeVisible();
  console.log('Automatic Annotation checked in tutorial.');

  //Back to Automatic Annotation Dialog
  await page.getByRole('dialog').press('Escape');
  await expect(automaticAnnotationDialog).toBeVisible();
  await ui.cancelBtn.click();

  //Back to Table View
  await expect(tableNameInput).toBeVisible();
  await expect(tableNameInput).toHaveValue(tableName);
});

test('Export Link', async ({ page }) => {
  test.setTimeout(120000);
  const ui = getComponents(page);
  const exportDialog = page.getByRole('dialog', { name: 'Export' });
  const tableNameInput = page.getByLabel('Table name');
  const tableName = `table_help`;

  //Open Export Dialog
  await ui.exportBtn.click();
  await expect(exportDialog).toBeVisible();

  //Open Export in Tutorial
  await page.getByRole('button', { name: 'open-export-tutorial' }).click();
  await expect(page.getByRole('heading', { name: 'Export' })).toBeVisible();
  console.log('Export checked in tutorial.');

  //Back to Export Dialog
  await page.getByRole('dialog').press('Escape');
  await expect(exportDialog).toBeVisible();
  await ui.cancelBtn.click();

  //Back to Table View
  await expect(tableNameInput).toBeVisible();
  await expect(tableNameInput).toHaveValue(tableName);
});

test('Modify Link', async ({ page }) => {
  test.setTimeout(120000);
  const ui = getComponents(page);
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
  await expect(ui.modificationBtn).toBeEnabled();
  await ui.modificationBtn.click();
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
  await ui.closeBtn.click();

  //Back to Table View
  await expect(tableNameInput).toBeVisible();
  await expect(tableNameInput).toHaveValue(tableName);
});

test('Reconcile Link', async ({ page }) => {
  test.setTimeout(120000);
  const ui = getComponents(page);
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
  await expect(ui.reconciliationBtn).toBeEnabled();
  await ui.reconciliationBtn.click();
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
  await ui.closeBtn.click();

  //Back to Table View
  await expect(tableNameInput).toBeVisible();
  await expect(tableNameInput).toHaveValue(tableName);
});

test('Extend Link', async ({ page }) => {
  test.setTimeout(120000);
  const ui = getComponents(page);
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
  await expect(ui.extensionBtn).toBeEnabled();
  await ui.extensionBtn.click();
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
  await ui.closeBtn.click();

  //Back to Table View
  await expect(tableNameInput).toBeVisible();
  await expect(tableNameInput).toHaveValue(tableName);
});

test('Gen AI Link', async ({ page }) => {
  test.setTimeout(120000);
  const ui = getComponents(page);
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
  await expect(ui.genAIBtn).toBeEnabled();
  await ui.genAIBtn.click();
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
  await ui.closeBtn.click();
  await expect(tableNameInput).toBeVisible();
  await expect(tableNameInput).toHaveValue(tableName);
});

test('Metadata Cell Link', async ({ page }) => {
  test.setTimeout(120000);
  const ui = getComponents(page);
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
  await ui.cancelBtn.click();

  //Back to Table View
  await expect(tableNameInput).toBeVisible();
  await expect(tableNameInput).toHaveValue(tableName);
});

test('Refinement Link', async ({ page }) => {
  test.setTimeout(120000);
  const ui = getComponents(page);
  const refinementHeading = page.getByRole('heading', { name: 'Refine matching' });
  const column = page.getByRole('columnheader', { name: 'Football Club' });
  const tableNameInput = page.getByLabel('Table name');
  const tableName = `table_help`;

  //Select column
  await expect(column).toBeVisible();
  await column.click();
  console.log('Column "Football Club" selected.');

  //Open Refinement Dialog
  await ui.refinementBtn.click();
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
  const ui = getComponents(page);
  const graphHeading = page.getByRole('heading', { name: 'Graph Visualization' });
  const tableNameInput = page.getByLabel('Table name');
  const tableName = `table_help`;

  //Open Graph View
  await ui.rightAlignedBtn.click();
  await expect(page.getByRole('heading', { name: 'Graph Info' })).toBeVisible();

  //Open Graph Tutorial
  await ui.graphTutorialBtn.click();
  await expect(graphHeading).toBeVisible();
  await ui.startTutorialBtn.click();
  await expect(page.getByRole('heading', { name: 'Tutorial Contents' })).toBeVisible();
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Graph Area' })).toBeVisible();
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Sidebar' })).toBeVisible();
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Graph info' })).toBeVisible();
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Selected Node/Link Details' })).toBeVisible();
  await ui.nextBtn.click();
  await expect(page.getByRole('heading', { name: 'Column Values' })).toBeVisible();
  await ui.doneBtn.click();

  //Back to Graph View
  await expect(graphHeading).toBeVisible();
  await page.getByRole('dialog').press('Escape');

  //Back to Table View
  await expect(tableNameInput).toBeVisible();
  await expect(tableNameInput).toHaveValue(tableName);
});
