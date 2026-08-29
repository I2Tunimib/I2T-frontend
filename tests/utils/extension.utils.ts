import { expect, type Page } from '@playwright/test';
import { getComponents } from "./components.utils";

export const extensionDialog = async (page: Page, columnName: string, service: string) => {
  const ui = getComponents(page);

  const textElement = page.getByRole('table').getByText(columnName, { exact: true });
  console.log("textElement", textElement);
  const thElement = textElement.locator('xpath=ancestor::th');
  console.log("thElement", thElement);
  const classAttr = await thElement.getAttribute('class') || '';
  console.log("classAttr", classAttr);
  const isSelected = classAttr.includes('Selected');
  console.log("isSelected", isSelected);

  if (!isSelected) {
    await thElement.scrollIntoViewIfNeeded();
    await thElement.click();
  }

  await ui.extensionBtn.click();
  await expect(page.getByRole('heading', { name: 'Extension' })).toBeVisible();
  await ui.selectService('an extension').click();
  await page.getByRole('option', { name: service, exact: true }).click();
  await expect(page.getByText(service).first()).toBeVisible();
};

export const extensionDialogChronos = async (page: Page, columnName: string, service: string) => {
  const ui = getComponents(page);

  const column = page.getByRole('table').getByText(columnName, { exact: true });
  const classAttr = await column.getAttribute('class') || '';
  const isSelected = classAttr.includes('Selected');

  if (!isSelected) {
    await column.scrollIntoViewIfNeeded();
    await column.click();
  }

  await ui.extensionBtn.click();
  await expect(page.getByRole('heading', { name: 'Extension' })).toBeVisible();
  await page.getByLabel('Extension').getByText(`Choose a service...`).click();
  await page.getByRole('option', { name: service }).click();
  await expect(page.getByText(service).first()).toBeVisible();
};

async function checkMetadata(
  page: Page,
  columnName: string,
  tabType: 'Column types' | 'Column properties',
  expectedKind: string,
  expectedValues: string[],
) {
  const ui = getComponents(page);
  const column = page.getByRole('table').getByText(columnName, { exact: true });
  const textElement = page.getByRole('table').getByText(columnName, { exact: true });
  const thElement = textElement.locator('xpath=ancestor::th');
  const classAttr = await thElement.getAttribute('class') || '';
  const isSelected = classAttr.includes('Selected');

  if (!isSelected) {
    await thElement.scrollIntoViewIfNeeded();
    await thElement.click();
  }

  await ui.metadataBtn.click();

  if (expectedKind) {
    await expect(page.getByRole('combobox').filter({ hasText: expectedKind })).toBeVisible();
  }

  if (tabType === 'Column properties') {
    await ui.propertyTabBtn.click();
  }

  await expect(page.getByRole('tab', { name: tabType })).toBeVisible();
  for (const value of expectedValues) {
    const rowLocator = page.getByRole('row', { name: value });
    console.log("rowLocator", rowLocator);
    const isVisible = await rowLocator.isVisible({ timeout: 20000 }).catch(() => false);
    console.log("isVisible", isVisible);

    if (!isVisible) {
      await page.getByRole('button', { name: 'Go to page' }).click();
    }

    await expect(rowLocator).toBeVisible();
  }
  await ui.cancelBtn.click();
  await column.click();
}

export const propertiesConfig = async (page: Page, columnName: string, service: string, params: string[]) => {
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

  if (service.includes('Annotation properties')) {
    const hasId = params.some((p) => p.toLowerCase().includes('id'));
    const hasName = params.some((p) => p.toLowerCase().includes('name'));

    // Check annotations
    if (hasId) {
      const idColName = `id_${columnName}`;
      await checkMetadata(page, idColName, 'Column types', 'Named Entity', ['wd:Q853614']);
    }
    if (hasName) {
      const nameColName = `name_${columnName}`;
      await checkMetadata(page, columnName, 'Column properties', undefined, ['official name']);
      await checkMetadata(page, nameColName, 'Column types', 'Named Entity', ['wd:Q11938905']);
    }

    // Annotation properties (Wikidata)
    if (params.length > 2) {
      const hasDescription = params.some((p) => p.toLowerCase().includes('description'));
      const hasUrl = params.some((p) => p.toLowerCase().includes('url'));

      // Check annotations
      if (hasDescription) {
        const descriptionColName = `description_${columnName}`;
        await checkMetadata(page, descriptionColName, 'Column types', 'Literal', ['wd:Q1200750']);
      }
      if (hasUrl) {
        const urlColName = `url_${columnName}`;
        await checkMetadata(page, columnName, 'Column properties', undefined, ['official website']);
        await checkMetadata(page, urlColName, 'Column types', 'Literal', ['wd:Q42253']);
      }
    }
  } else if (service.includes('Geo Properties')) {
    const hasCoordinates = params.some((p) => p.toLowerCase().includes('coordinate'));
    const hasTime = params.some((p) => p.toLowerCase().includes('time'));
    const hasPostal = params.some((p) => p.toLowerCase().includes('postal'));

    // Check annotations
    if (hasCoordinates) {
      const coordsColName = `${columnName}_coordinate location`;
      await checkMetadata(page, columnName, 'Column properties', undefined, [coordsColName]);
      await checkMetadata(page, coordsColName, 'Column types', 'Named Entity', ['wd:Q104224919']);
    }
    if (hasTime) {
      const timezoneColName = `${columnName}_located in time zone`;
      await checkMetadata(page, columnName, 'Column properties', undefined, [timezoneColName]);
      await checkMetadata(page, timezoneColName, 'Column types', 'Named Entity', ['wd:Q12143']);
    }
    if (hasPostal) {
      const postalCodeColName = `${columnName}_postal code`;
      await checkMetadata(page, columnName, 'Column properties', undefined, [postalCodeColName]);
      await checkMetadata(page, postalCodeColName, 'Column types', 'Literal', ['wd:Q37447']);
    }
  }
};

export const meteoPropsConfig = async (
  page: Page,
  columnName: string,
  columnDate: string,
  granularity: string,
  meteoParams: string[],
  comma: boolean,
  expectError: boolean = false,
  ) => {
  const ui = getComponents(page);

  const dateSelect = page.locator('#mui-component-select-dates');
  await dateSelect.click();
  await page.getByRole('option', {name: columnDate, exact: true}).click();
  await expect(page.getByRole('combobox', {name: columnDate})).toBeVisible();
  await ui.confirmComponentBtn('dialog').click();

  await page.getByRole('radio', {name: granularity}).check();

  for (const param of meteoParams) {
    await page.getByRole('checkbox', {name: param}).check();
  }

  if (comma) {
    await page.getByRole('checkbox', {name: 'Use comma as decimal'}).check();
  }
  await ui.confirmBtn.click();

  if (expectError) {
    const errorLocator = page.getByText('Invalid column for hourly params');
    await expect(errorLocator).toBeVisible({ timeout: 10000 });
    return;
  }

  if (meteoParams.length > 1) {
    await expect(page.getByText('columns added')).toBeVisible({timeout: 10000});
  } else {
    await expect(page.getByText('column added')).toBeVisible({timeout: 10000});
  }

  await checkMetadata(page, columnName, 'Column properties', undefined, [`point in time ${columnDate}`]);

  if (granularity === 'Daily') {
    const hasDaylight = meteoParams.some((p) => p.toLowerCase().includes('daylight'));
    const hasSunriseSunset = meteoParams.some((p) => p.toLowerCase().includes('sun rise and set'));
    const hasMaxTemp = meteoParams.some((p) => p.toLowerCase().includes('maximum'));
    const hasMinTemp = meteoParams.some((p) => p.toLowerCase().includes('minimum'));
    const hasSumPrecipitation = meteoParams.some((p) => p.toLowerCase().includes('sum'));
    const hasHoursRain = meteoParams.some((p) => p.toLowerCase().includes('hours'));

    // Check annotations
    if (hasDaylight) {
      const daylightColName = `${columnName}_daylight_duration`;
      await checkMetadata(page, columnName, 'Column properties', undefined, [`duration ${daylightColName}`]);
      await checkMetadata(page, daylightColName, 'Column types', 'Literal', ['wd:Q11574']);
    }
    if (hasSunriseSunset) {
      const sunriseColName = `${columnName}_sunrise`;
      const sunsetColName = `${columnName}_sunset`;
      await checkMetadata(page, columnName, 'Column properties', undefined, [`duration ${sunriseColName}`, `duration ${sunsetColName}`]);
      await checkMetadata(page, sunriseColName, 'Column types', 'Literal', ['wd:Q18640029']);
      await checkMetadata(page, sunsetColName, 'Column types', 'Literal', ['wd:Q18640029']);
    }
    if (hasMaxTemp) {
      const maxTempColName = `${columnName}_temperature_max`;
      await checkMetadata(page, columnName, 'Column properties', undefined, [`maximum temperature record ${maxTempColName}`]);
      await checkMetadata(page, maxTempColName, 'Column types', 'Literal', ['wd:Q11567']);
    }
    if (hasMinTemp) {
      const minTempColName = `${columnName}_temperature_min`;
      await checkMetadata(page, columnName, 'Column properties', undefined, [`minimum temperature record ${minTempColName}`]);
      await checkMetadata(page, minTempColName, 'Column types', 'Literal', ['wd:Q11567']);
    }
    if (hasSumPrecipitation) {
      const precipitationSumColName = `${columnName}_precipitation_sum`;
      await checkMetadata(page, columnName, 'Column properties', undefined, [`precipitation ${precipitationSumColName}`]);
      await checkMetadata(page, precipitationSumColName, 'Column types', 'Literal', ['wd:Q174789']);
    }
    if (hasHoursRain) {
      const hoursRainColName = `${columnName}_precipitation_hours`;
      await checkMetadata(page, columnName, 'Column properties', undefined, [`duration ${hoursRainColName}`]);
      await checkMetadata(page, hoursRainColName, 'Column types', 'Literal', ['wd:Q11573']);
    }
  } else if (granularity === 'Hourly') {
    const hasTemp = meteoParams.some((p) => p.toLowerCase().includes('temperature'));
    const hasHumidity = meteoParams.some((p) => p.toLowerCase().includes('humidity'));
    const hasPrecipitation = meteoParams.some((p) => p.toLowerCase().includes('precipitation'));

    if (hasTemp) {
      const tempColName = `${columnName}_temperature_2m`;
      await checkMetadata(page, columnName, 'Column properties', undefined, [`temperature ${tempColName}`]);
      await checkMetadata(page, tempColName, 'Column types', 'Literal', ['wd:Q11567']);
    }
    if (hasHumidity) {
      const humidityColName = `${columnName}_relative_humidity_2m`;
      await checkMetadata(page, columnName, 'Column properties', undefined, [`humidity ${humidityColName}`]);
      await checkMetadata(page, humidityColName, 'Column types', 'Literal', ['wd:Q11229']);
    }
    if (hasPrecipitation) {
      const precipitationColName = `${columnName}_precipitation`;
      await checkMetadata(page, columnName, 'Column properties', undefined, [`precipitation ${precipitationColName}`]);
      await checkMetadata(page, precipitationColName, 'Column types', 'Literal', ['wd:Q174789']);
    }
  }
};

export const sparqlConfig = async (
  page: Page,
  columnName: string,
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

  const propertyId = body.split(" ").find((p) => p.includes("wdt:"))?.split(":")[1];
  await checkMetadata(page, columnName, 'Column properties', undefined, [propertyId]);
};

export const wikiPropsConfig = async (page: Page, columnName: string, properties: string[]) => {
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

  await checkMetadata(page, columnName, 'Column properties', undefined, properties);
};

export const geoRouteConfig = async (
  page: Page,
  columnName: string,
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

  const column = page.getByRole('table').getByText(columnName, { exact: true });
  await column.click();

  const hasDuration = routeParams.some((p) => p.toLowerCase().includes('duration'));
  const hasLength = routeParams.some((p) => p.toLowerCase().includes('length'));
  const hasRoute = routeParams.some((p) => p.toLowerCase().includes('route'));

  await checkMetadata(page, columnName, 'Column properties', undefined, [`destination point ${end}`]);

  const finalMode = mode.split(" ")[1];
  if (hasDuration) {
    const durationColName = `duration_${finalMode}`;
    await checkMetadata(page, columnName, 'Column properties', undefined, [`duration ${durationColName}`]);
    await checkMetadata(page, durationColName, 'Column types', 'Literal', ['wd:Q7727']);
  }
  if (hasLength) {
    const lengthColName = `length_${finalMode}`;
    await checkMetadata(page, columnName, 'Column properties', undefined, [`distance ${lengthColName}`]);
    await checkMetadata(page, lengthColName, 'Column types', 'Literal', ['wd:Q828224']);
  }
  if (hasRoute) {
    const routeColName = `route_${finalMode}`;
    await checkMetadata(page, columnName, 'Column properties', undefined, [`via ${routeColName}`]);
    await checkMetadata(page, routeColName, 'Column types', 'Named Entity', ['wd:Q111226201']);
  }
};
