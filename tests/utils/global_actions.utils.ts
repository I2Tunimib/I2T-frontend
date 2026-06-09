import { expect, type Page } from '@playwright/test';
import { getComponents } from "./components.utils";

export const saveTable = async (page: Page) => {
  const ui = getComponents(page);

  await expect(ui.saveBtn).toBeEnabled();
  await ui.saveBtn.click();
};

export const compliance = async (page: Page, type: string, purpose: string) => {
  const ui = getComponents(page);

  await expect(ui.complianceBtn).toBeVisible();
  await ui.complianceBtn.click();
  await page.getByRole('combobox', { name: 'Compliance type' }).click();
  await page.getByRole('option', { name: type }).click();

  await expect(page.getByRole('textbox', { name: 'Purpose' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Purpose' }).click();
  await page.getByRole('textbox', { name: 'Purpose' }).fill(purpose);
  await ui.checkBtn.click();
  await expect(page.getByText('Compliance assessments are being done')).toBeVisible();
  await expect(page.getByText('Reasoning:')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Column Analysis' })).toBeVisible();
};

export const tableAnnotation = async (page: Page, method: string) => {
  const ui = getComponents(page);

  await expect(ui.autoAnnotationBtn).toBeVisible();
  await ui.autoAnnotationBtn.click();
  await page.getByRole('combobox', { name: 'Annotation target' }).click();
  await page.getByRole('option', { name: 'Full table' }).click();
  await expect(page.getByRole('combobox', { name: 'Annotation method' })).toBeEnabled();
  await page.getByRole('combobox', { name: 'Annotation method' }).click();
  await page.getByRole('option', { name: method }).click();
  await expect(ui.startAnnotationBtn).toBeEnabled();
  await ui.startAnnotationBtn.click();
};

export const schemaAnnotation = async (page: Page, method: string) => {
  const ui = getComponents(page);

  await expect(ui.autoAnnotationBtn).toBeVisible();
  await ui.autoAnnotationBtn.click();
  await page.getByRole('combobox', { name: 'Annotation target' }).click();
  await page.getByRole('option', { name: 'Schema' }).click();
  await expect(page.getByRole('combobox', { name: 'Annotation method' })).toBeEnabled();
  await page.getByRole('combobox', { name: 'Annotation method' }).click();
  await page.getByRole('option', { name: method }).click();
  await expect(ui.startAnnotationBtn).toBeEnabled();
  await ui.startAnnotationBtn.click();
};

export const exportTable = async (page: Page, format: string) => {
  const ui = getComponents(page);

  await ui.exportBtn.click();
  await page.getByRole('combobox', { name: 'Export type' }).click();
  await page.getByRole('option', { name: 'Table' }).click();
  await expect(page.getByRole('combobox', { name: 'Export format' })).toBeEnabled();
  await page.getByRole('combobox', { name: 'Export format' }).click();
  await page.getByRole('option', { name: format }).click();
  await expect(ui.confirmBtn).toBeEnabled();
  await ui.confirmBtn.click();
};

export const graphVisualization = async (page: Page) => {
  const ui = getComponents(page);

  await expect(ui.saveBtn).not.toBeEnabled();
  await ui.rightAlignedBtn.click();
};

export const checkPropsGraph = async (page: Page, properties: string[]) => {
  const ui = getComponents(page);

  await ui.listProps.click();
  for (const prop of properties) {
    await expect(page.getByText(prop)).toBeVisible();
  }
};
