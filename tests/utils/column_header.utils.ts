import { expect, type Page } from '@playwright/test';
import { getComponents } from "./components.utils";

export const confirmClose = async (page: Page) => {
  const ui = getComponents(page);
  await ui.confirmCloseBtn.click();
  await expect(ui.confirmBtn).toBeEnabled();
  await ui.confirmBtn.click();
};

export const columnDialog = async (page: Page, columnName: string) => {
  const ui = getComponents(page);

  const column = page.locator('#root').getByText(columnName, { exact: true });
  await column.click();

  await ui.metadataBtn.click();
  await expect(page.getByRole('heading', { name: columnName })).toBeVisible();
  await page.getByRole('tab', { name: 'Column properties' }).click();
};

export const searchInKGList = async (
  pageKGList: Page,
  propId: string,
  propName: string,
) => {
  await pageKGList.getByRole('link', { name: '500' }).first().click();
  await pageKGList.getByRole('link', { name: `${propName} (${propId})` }).click();
  await expect(pageKGList.locator('#firstHeading').getByText(propName)).toBeVisible();
};

export const addPropertyEntities = async (
  page: Page,
  propId: string,
  propName: string,
  prefix: string,
  columnObj: string,
) => {
  const ui = getComponents(page);

  await ui.addPropertyBtn.click();
  await expect(ui.viewBtn).toBeVisible();
  await ui.viewBtn.click();

  const pageKGPromise = page.waitForEvent('popup');
  const pageKGList = await pageKGPromise;
  await searchInKGList(pageKGList, propId, propName);

  const selectPrefix = page.locator('#mui-component-select-prefix');
  await selectPrefix.click();
  await page.getByRole('option', { name: prefix }).click();

  const urlKG = pageKGList.url();
  await page.evaluate((url) => navigator.clipboard.writeText(url), urlKG);

  const uriInput = page.getByRole('textbox', { name: 'Uri' });
  await uriInput.click();
  const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
  await page.keyboard.press(`${modifier}+V`);
  await expect(uriInput).toHaveValue(urlKG);

  await expect(page.getByRole('textbox', { name: 'Name' })).toHaveValue(propName, { timeout: 100000 });

  const objSelect = page.locator('#mui-component-select-obj');
  await objSelect.click();
  await page.getByRole('option', { name: columnObj }).click();
  await ui.addBtn.click();
  await expect(page.getByRole('cell', { name: `${prefix}:${propId}` })).toBeVisible();

  await confirmClose(page);
};

export const checkKind = async (page: Page, columnName: string, kind: string) => {
  const columnKind = page
    .getByRole('columnheader', { name: new RegExp(columnName, 'i') })
    .getByLabel(kind);
  await expect(columnKind).toBeVisible();
};

export const checkRole = async (page: Page, columnName: string, role: string) => {
  const columnRole = page
    .getByRole('columnheader', { name: new RegExp(columnName, 'i') })
    .getByLabel(role);
  await expect(columnRole).toBeVisible();
};

export const checkPropsLiteral = async (
  page: Page,
  propId: string,
  propName: string,
) => {
  const ui = getComponents(page);

  await expect(ui.viewBtn).toBeVisible();
  await ui.viewBtn.click();

  const pageKGPromise = page.waitForEvent('popup');
  const pageKGList = await pageKGPromise;
  await searchInKGList(pageKGList, propId, propName);
  const urlKG = pageKGList.url();
  await page.evaluate((url) => navigator.clipboard.writeText(url), urlKG);
  await ui.cancelBtn.click();
};

export const addPropertyLiteral = async (
  page: Page,
  propId: string,
  propName: string,
  prefix: string,
  columnObj: string,
) => {
  const ui = getComponents(page);

  await ui.addPropertyBtn.click();

  const selectPrefix = page.locator('#mui-component-select-prefix');
  await selectPrefix.click();
  await page.getByRole('option', { name: prefix }).click();

  const uriInput = page.getByRole('textbox', { name: 'Uri' });
  await uriInput.click();
  const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
  await page.keyboard.press(`${modifier}+V`);

  await expect(page.getByRole('textbox', { name: 'Name' })).toHaveValue(propName, { timeout: 100000 });

  const objSelect = page.locator('#mui-component-select-obj');
  await objSelect.click();
  await page.getByRole('option', { name: columnObj }).click();
  await ui.addBtn.click();
  await expect(page.getByRole('cell', { name: `${prefix}:${propId}` })).toBeVisible();

  await confirmClose(page);
};
