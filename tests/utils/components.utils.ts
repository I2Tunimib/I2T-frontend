import { expect } from '@playwright/test';

export const getComponents = (page) => ({
  deleteBtn: page.getByText('Delete column'),
  hideBtn: page.getByText('Hide column'),
  pinBtn: page.getByText('Pin column'),
  unpinBtn: page.getByText('Unpin column'),
  extendRightBtn: page.getByText('Extend column'),
  reconcileRightBtn: page.getByText('Reconcile column'),
  modifyRightBtn: page.getByText('Modify column'),
  editBtn: page.getByText('Edit'),
  reconcileCellBtn: page.getByText('Reconciliate cell'),
  manageMetaBtn: page.getByText('Manage metadata'),
  deleteRowBtn: page.getByText('Delete row'),
  typeRefineText: page.getByText('Type refine matching'),
  scoreRefineText: page.getByText('Score refine matching'),
  logoutBtn: page.getByText('Logout'),
  listProps: page.getByText('Show list').nth(1),
  listTypes: page.getByText('Show list').first(),

  datasetBtn: page.getByRole('button', { name: 'New dataset' }),
  tableBtn: page.getByRole('button', { name: 'New table' }),
  fileBtn: page.getByRole('button', { name: 'Select file (.csv or .json)' }),
  nextBtn: page.getByRole('button', { name: 'Next' }),
  doneBtn: page.getByRole('button', { name: 'Done' }),
  helpBtn: page.getByRole('button', { name: 'help' }),
  cancelBtn: page.getByRole('button', { name: 'Cancel' }),
  userMenuBtn: page.getByRole('button', { name: 'user-menu' }),
  helpDatasetBtn: page.getByRole('button', { name: 'help-dataset' }),
  rawViewBtn: page.getByRole('button', { name: 'raw view' }),
  listViewBtn: page.getByRole('button', { name: 'list view' }),
  gridViewBtn: page.getByRole('button', { name: 'grid view' }),
  visibilityBtn: page.getByRole('button', { name: 'visibility-column' }),
  accessibleViewBtn: page.getByRole('button', { name: 'accessible-view' }),
  denseViewBtn: page.getByRole('button', { name: 'dense-view' }),
  filterBtn: page.getByRole('button', { name: 'filter-rows' }),
  labelBtn: page.getByRole('button', { name: 'label' }),
  metaTypeBtn: page.getByRole('button', { name: 'metaType' }),
  metaNameBtn: page.getByRole('button', { name: 'metaName' }),
  metadataBtn: page.getByRole('button', { name: 'open-metadata-dialog-subtoolbar' }),
  expandHeaderBtn: page.getByRole('button', { name: 'expand-header' }),
  expandCellBtn: page.getByRole('button', { name: 'expand-cell' }),
  deleteSelectedBtn: page.getByRole('button', { name: 'delete-selected' }),
  undoBtn: page.getByRole('button', { name: 'undo' }),
  redoBtn: page.getByRole('button', { name: 'redo' }),
  refinementBtn: page.getByRole('button', { name: 'open-refinement-dialog' }),
  helpDialogBtn: page.getByRole('button', { name: 'help-dialog' }),
  exportBtn: page.getByRole('button', { name: 'Export' }),
  startTutorialBtn: page.getByRole('button', { name: 'Start tutorial' }),
  backBtn: page.getByRole('button', { name: 'Back' }),
  toolbarBtn: page.getByRole('button', { name: 'Toolbar' }),
  videoBtn: page.getByRole('button', { name: 'Video introduction' }),
  rightAlignedBtn: page.getByRole('button', { name: 'right aligned' }),
  centeredBtn: page.getByRole('button', { name: 'centered' }),
  typeTabBtn: page.getByRole('tab', { name: 'Column types' }),
  propertyTabBtn: page.getByRole('tab', { name: 'Column properties' }),
  addPropertyBtn: page.getByRole('button', { name: 'Add property' }),
  searchBtn: page.getByRole('button', { name: 'Search' }),
  confirmCloseBtn: page.getByRole('button', { name: 'Confirm and Close' }),
  viewBtn: page.getByRole('button', { name: 'View' }),
  addType: page.getByRole('button', { name: 'Add type' }),
  nextPageBtn: page.getByRole('button', { name: 'Go to next page' }),
  addMetadataBtn: page.getByRole('button', { name: 'Add metadata' }),
  confirmPropagateBtn: page.getByRole('button', { name: 'Confirm and Propagate' }),
  showTypesBtn: page.getByRole('button', { name: '👉' }),
  hideTypesBtn: page.getByRole('button', { name: '👇' }),
  graphTutorialBtn: page.getByRole('button', { name: 'open-graph-tutorial' }),
  tableViewerBtn: page.getByRole('button', { name: 'open-table-viewer' }),
  visualizationBtn: page.getByRole('button', { name: 'Visualization' }),
  autoAnnotationTutorialBtn: page.getByRole('button', { name: 'Automatic Annotation' }),
  genAIBtn: page.getByRole('button', { name: 'Gen AI' }),

  autoAnnotationBtn: page.getByRole('button', { name: 'Automatic annotation', exact: true }),
  startAnnotationBtn: page.getByRole('button', { name: 'Start annotation', exact: true }),
  complianceBtn: page.getByRole('button', { name: 'Compliance', exact: true }),
  closeBtn: page.getByRole('button', { name: 'Close', exact: true }),
  checkBtn: page.getByRole('button', { name: 'Check Compliance', exact: true }),
  checkAgainBtn: page.getByRole('button', { name: 'Check Again', exact: true }),
  confirmBtn: page.getByRole('button', { name: 'Confirm', exact: true }),
  modificationBtn: page.getByRole('button', { name: 'Modify', exact: true }),
  reconciliationBtn: page.getByRole('button', { name: 'Reconcile', exact: true }),
  extensionBtn: page.getByRole('button', { name: 'Extend', exact: true }),
  addBtn: page.getByRole('button', { name: 'Add', exact: true }),
  saveBtn: page.getByRole('button', { name: 'Save', exact: true }),

  selectDatasetBtn: (datasetName: string) => page.getByRole('row', { name: `${datasetName}` }).getByRole('checkbox'),
  selectTableBtn: (tableName: string) => page.getByRole('row', { name: `${tableName}` }).getByRole('checkbox'),
  cell: (cellLabel: string) => page.getByRole('gridcell', { name: cellLabel }).first(),
  searchInWikidataBtn: (label: string) => page.getByRole('button', { name: `Search "${label}" in Wikidata` }),
  labelCellBtn: (label: string) => page.getByRole('button', { name: `${label}` }),
  confirmComponentBtn: (component: string) => page.getByRole(`${component}`).getByRole('button', { name: 'Confirm' }),
  showTypesNumberBtn: (number: string) => page.getByRole('button', { name: `(${number}) 👉` }),
  selectService: (enrichmentStep: string) => page.getByText(`Choose ${enrichmentStep} service...`),
  linkLabelBtn: (celLabel: string, number: number) => page.getByRole('row', { name: `${celLabel} (${number}) 👇` }).getByRole('link'),

  pinColumn: async (columnName: string, rightClick: boolean) => {
    const ui = getComponents(page);
    const column = page.getByRole('columnheader', { name: columnName });
    if (rightClick) {
      await column.click({ button: 'right' });
      await ui.pinBtn.click();
    } else {
      await column.scrollIntoViewIfNeeded();
      await column.hover();
      await page.getByRole('button', { name: 'pin-column' }).click();
      await column.hover();
      await expect(column.getByLabel('unpin-column')).toBeVisible();
    }
  },
  unpinColumn: async (columnName: string, rightClick: boolean) => {
    const ui = getComponents(page);
    const column = page.getByRole('columnheader', { name: columnName });
    if (rightClick) {
      await column.click({ button: 'right' });
      await ui.unpinBtn.click();
    } else {
      await column.scrollIntoViewIfNeeded();
      await column.hover();
      await column.getByLabel('unpin-column').click();
      await column.hover();
      await expect(column.getByLabel('pin-column')).toBeVisible();
    }
  },
  deleteColumn: async (columnName: string) => {
    const ui = getComponents(page);
    const column = page.getByRole('columnheader', { name: columnName });
    await column.click({ button: 'right' });
    await ui.deleteBtn.click();
    await expect(column).not.toBeVisible();
  },
  hideColumn: async (columnName: string) => {
    const ui = getComponents(page);
    const column = page.getByRole('columnheader', { name: columnName });
    await column.click({ button: 'right' });
    await ui.hideBtn.click();
    await expect(column).not.toBeVisible();
  },
  enrichColumn: async (columnName: string, enrichmentStep: string) => {
    const ui = getComponents(page);
    const column = page.getByRole('columnheader', { name: columnName });
    await column.click({ button: 'right' });
    if (enrichmentStep === 'Modification') {
      await ui.modifyRightBtn.click();
    } else if (enrichmentStep === 'Reconciliation') {
      await ui.reconcileRightBtn.click();
    } else if (enrichmentStep === 'Extension') {
      await ui.extendRightBtn.click();
    }
    await expect(page.getByRole('heading', { name: enrichmentStep })).toBeVisible();
  },
});
