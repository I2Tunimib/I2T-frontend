import { expect, type Page } from '@playwright/test';
import { getComponents } from "./components.utils";

export const extensionDialog = async (page: Page, columnName: string, service: string) => {
  const ui = getComponents(page);

  const column = page.locator('#root').getByText(columnName, { exact: true });
  if (await ui.extensionBtn.isDisabled()) {
    await column.click();
  }

  await ui.extensionBtn.click();
  await expect(page.getByRole('heading', { name: 'Extension' })).toBeVisible();
  await ui.selectService('an extension').click();
  await page.getByRole('option', { name: service, exact: true }).click();
  await expect(page.getByText(service).first()).toBeVisible();
};

export const extensionDialogChronos = async (page: Page, columnName: string, service: string) => {
  const ui = getComponents(page);

  const column = page.locator('#root').getByText(columnName, { exact: true });
  if (await ui.extensionBtn.isDisabled()) {
    await column.click();
  }

  await ui.extensionBtn.click();
  await expect(page.getByRole('heading', { name: 'Extension' })).toBeVisible();
  await page.getByLabel('Extension').getByText(`Choose a service...`).click();
  await page.getByRole('option', { name: service }).click();
  await expect(page.getByText(service).first()).toBeVisible();
};

export const propertiesConfig = async (page: Page, params: string[]) => {
  const ui = getComponents(page);

  for (const param of params) {
    await page.getByRole('checkbox', { name: param }).check();
  }

  await ui.confirmComponentBtn('dialog').click();

  if (params.length > 1) {
    await expect(page.getByText('columns added')).toBeVisible({ timeout: 100000 });
  } else {
    await expect(page.getByText('column added')).toBeVisible({ timeout: 100000 });
  }
};

export const meteoPropsConfig = async (
  page: Page,
  columnDate: string,
  granularity: string,
  meteoParams: string[],
  comma: boolean,
  ) => {
  const ui = getComponents(page);

  const dateSelect = page.locator('#mui-component-select-dates');
  await dateSelect.click();
  await page.getByRole('option', { name: columnDate, exact: true }).click();
  await expect(page.getByRole('combobox', { name: columnDate })).toBeVisible();
  await ui.confirmComponentBtn('dialog').click();

  await page.getByRole('radio', { name: granularity }).check();

  for (const param of meteoParams) {
    await page.getByRole('checkbox', { name: param }).check();
  }

  if (comma) {
    await page.getByRole('checkbox', { name: 'Use comma as decimal' }).check();
  }
  await ui.confirmBtn.click();

  try {
    const errorLocator = page.getByText('Invalid column for hourly params');
    await errorLocator.waitFor({ state: 'visible', timeout: 5000 });
    console.log('Error.');
  } catch (e) {
    if (meteoParams.length > 1) {
      await expect(page.getByText('columns added')).toBeVisible({ timeout: 10000 });
    } else {
      await expect(page.getByText('column added')).toBeVisible({ timeout: 10000 });
    }
  }
};

export const sparqlConfig = async (
  page: Page,
  variables: string[],
  body: string,
  order: string,
  limit: string
) => {
  const ui = getComponents(page);

  await page.getByRole('textbox', { name: '*variables* for the query' }).click();
  if (variables.length > 1) {
    const variable = variables.join(' ');
    await expect(page.getByRole('textbox', { name: '*variables* for the query' })).fill(variable);
  } else {
    await page.getByRole('textbox', { name: '*variables* for the query' }).fill(variables[0]);
  }

  await page.getByRole('textbox', { name: '*body* of the query:' }).click();
  await page.getByRole('textbox', { name: '*body* of the query:' }).fill(body);

  if (order && order !== '') {
    await page.locator('input[name="order"]').click();
    await page.locator('input[name="order"]').fill(order);
  }

  if (limit && limit !== '') {
    await page.locator('input[name="limit"]').click();
    await page.locator('input[name="limit"]').fill(limit);
  }

  await ui.confirmComponentBtn('dialog').click();

  if (variables.length > 1) {
    await expect(page.getByText('columns added')).toBeVisible({ timeout: 100000 });
    for (const variable of variables) {
      await expect(page.getByRole('columnheader', { name: variable })).toBeVisible();
    }
  } else {
    await expect(page.getByText('column added')).toBeVisible({ timeout: 100000 });
  }
};

export const wikiPropsConfig = async (page: Page, properties: string[]) => {
  const ui = getComponents(page);

  await page.getByRole('textbox', { name: '*properties* e.g.: P625 P2044' }).click();
  if (properties.length > 1) {
    const property = properties.join(' ');
    await expect(page.getByRole('textbox', { name: '*properties* e.g.: P625 P2044' })).fill(property);
  } else {
    await page.getByRole('textbox', { name: '*properties* e.g.: P625 P2044' }).fill(properties[0]);
  }

  await ui.confirmComponentBtn('dialog').click();

  if (properties.length > 1) {
    await expect(page.getByText('columns added')).toBeVisible({ timeout: 100000 });
  } else {
    await expect(page.getByText('column added')).toBeVisible({ timeout: 100000 });
  }
};

export const geoRouteConfig = async (
  page: Page,
  end: string,
  mode: string,
  poi: boolean,
  routeParams: string[],
) => {
  const ui = getComponents(page);

  await page.locator('#mui-component-select-end').click();
  await page.getByRole('option', { name: end, exact: true }).click();
  await expect(page.getByRole('combobox', { name: end })).toBeVisible();

  if (mode && mode !== '') {
    await page.getByRole('radio', { name: mode }).check();
  } else {
    if (poi) {
      await page.getByRole('checkbox', { name: 'Use POI for the destination column' }).check();
    }
  }

  for (const param of routeParams) {
    await page.getByRole('checkbox', { name: param }).check();
  }

  await ui.confirmComponentBtn('dialog').click();

  if (routeParams.length > 1) {
    await expect(page.getByText('columns added')).toBeVisible({ timeout: 100000 });
  } else {
    await expect(page.getByText('column added')).toBeVisible({ timeout: 100000 });
  }
};
