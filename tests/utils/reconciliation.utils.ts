import { expect, type Page } from '@playwright/test';
import { getComponents } from "./components.utils";

export const reconciliationDialog = async (
  page: Page,
  columnName: string,
  groupService: string,
  service: string,
) => {
  const ui = getComponents(page);

  const column = page.locator('#root').getByText(columnName, { exact: true });
  if (await ui.reconciliationBtn.isDisabled()) {
    await column.click();
  }

  await ui.reconciliationBtn.click();
  await expect(page.getByRole('heading', { name: 'Reconciliation' })).toBeVisible();
  await page.getByText('Choose a service group...').click();
  await page.getByRole('option', { name: groupService, exact: true }).click();

  await expect(ui.selectService('a reconciliation')).toBeEnabled();
  await ui.selectService('a reconciliation').click();
  await page.getByRole('option', { name: service }).click();

  await expect(page.getByText(service).first()).toBeVisible();
};

export const reconcilerConfig = async (page: Page, additionalColumns: string[]) => {
  const ui = getComponents(page);

  if (additionalColumns) {
    const contextSelect = page.locator('#mui-component-select-additionalColumns');
    await contextSelect.click();
    for (const column of additionalColumns) {
      await page.getByRole('option', { name: column, exact: true }).click();
    }
    await ui.confirmComponentBtn('listbox').click();

    if (additionalColumns.length > 2) {
      const supportColumns = additionalColumns.join(' , ');
      await expect(page.getByRole('combobox', { name: supportColumns })).toBeVisible({ timeout: 10000 });
    } else {
      await expect(page.getByRole('combobox', { name: additionalColumns[0] })).toBeVisible({ timeout: 10000 });
    }
  }

  await ui.confirmComponentBtn('dialog').click();
};

export const reconcilerInTableConfig = async (
  page: Page,
  prefix: string,
  columnName: string,
  ) => {
  const ui = getComponents(page);

  await page.locator('#mui-component-select-prefix').click();
  await page.getByRole('option', { name: prefix, exact: true }).click();
  await expect(page.getByRole('combobox', { name: prefix })).toBeVisible();

  await page.locator('#mui-component-select-columnToReconcile').click();
  await page.getByRole('option', { name: columnName, exact: true }).click();
  await expect(page.getByRole('combobox', { name: columnName })).toBeVisible();

  await ui.confirmComponentBtn('dialog').click();
};

export const metadataDialog = async (page: Page, cellLabel: string) => {
  const cellHeading = page.getByRole('heading', { name: cellLabel });
  const cell = page.getByRole('gridcell', { name: cellLabel });

  await cell.first().getByLabel('open-metadata-dialog').click();
  await expect(cellHeading).toBeVisible();
};

export const searchInKG = async (
  pageKG: Page,
  idKG: string,
  nameKG: string,
  descriptionKG: string
) => {
  await expect(pageKG.getByRole('link', { name: `${nameKG} (${idKG})` })).toBeVisible();
  await pageKG.getByRole('link', { name: `${nameKG} (${idKG})` }).click();
  await expect(pageKG.getByText(descriptionKG).first()).toBeVisible({ timeout: 10000 });
};

export const addMetadata = async (
  page: Page,
  cellLabel: string,
  prefix: string,
  idKG: string,
  nameKG: string,
  descriptionKG: string
  ) => {
  const ui = getComponents(page);

  await ui.addMetadataBtn.click();
  await page.locator('#mui-component-select-prefix').click();
  await page.getByRole('option', { name: prefix, exact: true }).click();
  await expect(ui.searchBtn).toBeVisible();

  const pageKGPromise = page.waitForEvent('popup');
  await ui.searchBtn.click();
  const pageKG = await pageKGPromise;
  await searchInKG(pageKG, idKG, nameKG, descriptionKG);

  const urlKG = pageKG.url();
  await page.evaluate((url) => navigator.clipboard.writeText(url), urlKG);
  const uriInput = page.getByRole('textbox', { name: 'Uri' });
  await uriInput.click();
  const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
  await page.keyboard.press(`${modifier}+V`);
  await expect(uriInput).toHaveValue(urlKG);

  await expect(page.getByRole('textbox', { name: 'Name' })).toHaveValue(nameKG, { timeout: 10000 });
  await ui.addBtn.click();
  await expect(page.getByText(idKG)).toBeVisible({ timeout: 10000 });
  const checkboxCorrectEntity = page.locator('tr')
    .filter({ hasText: idKG })
    .locator('input[type="checkbox"]');
  await expect(checkboxCorrectEntity).toBeChecked();
  console.log('Correct entity selected.');
};

export const checkInKG = async (
  pageKG: Page,
  cellLabel: string,
  descriptionKG: string
) => {
  await expect(pageKG.locator('#firstHeading').getByText(cellLabel)).toBeVisible();
  await expect(pageKG.getByText(descriptionKG).first()).toBeVisible();
};

export const selectMetadata = async (
  page: Page,
  cellLabel: string,
  types: string[],
  prefix: string,
  idKG: string,
  descriptionKG: string,
) => {
  const ui = getComponents(page);

  await ui.showTypesBtn.first().click();
  for (const type of types) {
    await expect(page.getByText(type, { exact: true })).toBeVisible();
  }

  await ui.linkLabelBtn(cellLabel, types.length).first().click();
  const pageKGPromise = page.waitForEvent('popup');
  const pageKG = await pageKGPromise;
  await checkInKG(pageKG, cellLabel, descriptionKG);

  const checkboxCorrectEntity = page.locator('tr')
    .filter({ hasText: idKG })
    .locator('input[type="checkbox"]');
  await checkboxCorrectEntity.click();
  await expect(checkboxCorrectEntity).toBeChecked();
};

export const confirmPropagate = async (page: Page, cellLabel: string) => {
  const ui = getComponents(page);
  await ui.confirmPropagateBtn.click();
  await expect(page.getByRole('heading', { name: 'Are you sure to propagate?' })).toBeVisible();
  await ui.confirmBtn.click();

  const cell = page.getByRole('gridcell', { name: cellLabel });
  await expect(cell.first().getByLabel('status-match-manual')).toBeVisible();
};
