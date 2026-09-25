import { expect, type Page } from '@playwright/test';
import { getComponents } from "./components.utils";

export const modificationDialog = async (page: Page, columnName: string, service: string) => {
  const ui = getComponents(page);

  const column = page.getByRole('table').getByText(columnName, { exact: true });
  const classAttr = await column.getAttribute('class') || '';
  const isSelected = classAttr.includes('Selected');

  if (!isSelected) {
    await column.scrollIntoViewIfNeeded();
    await column.click();
  }

  await ui.modificationBtn.click();
  await expect(page.getByRole('heading', { name: 'Modification' })).toBeVisible();
  await ui.selectService('a modification').click();
  await page.getByRole('option', { name: service }).click();
  await expect(page.getByText(service).first()).toBeVisible();
};

export const modificationDialogChronos = async (page: Page, columnName: string, service: string) => {
  const ui = getComponents(page);

  const column = page.getByRole('table').getByText(columnName, { exact: true });
  const classAttr = await column.getAttribute('class') || '';
  const isSelected = classAttr.includes('Selected');

  if (!isSelected) {
    await column.scrollIntoViewIfNeeded();
    await column.click();
  }

  await ui.modificationBtn.click();
  await expect(page.getByRole('heading', { name: 'Modify' })).toBeVisible();
  await page.getByLabel('Modify').getByText(`Choose a modification service...`).click();
  await page.getByRole('option', { name: service }).click();
  await expect(page.getByRole('option', { name: service })).toBeVisible();
};

export const dataCleaningConfig = async (page: Page, option: string) => {
  const ui = getComponents(page);

  await page.getByRole('radio', { name: option }).check();
  await ui.confirmBtn.click();
  await expect(page.getByText('column updated')).toBeVisible();
  await expect(page.getByText('column updated')).not.toBeVisible();
};

export const regexConfig = async (
  page: Page,
  type: string,
  pattern: string,
  flag: string,
  replacement?: string,
  matchIndex?: string,
  matchCount?: string,
  newColumn?: boolean,
  ) => {
  const ui = getComponents(page);

  await page.getByRole('radio', { name: type }).check();

  const patternInput = page.getByRole('textbox', { name: 'Regular expression pattern' });
  await patternInput.click();
  await patternInput.fill(pattern);
  await expect(patternInput).toHaveValue(pattern);

  const flagInput = page.getByRole('textbox', { name: 'Regular expression flags' });
  await flagInput.click();
  await flagInput.fill(flag);
  await expect(flagInput).toHaveValue(flag);

  if (replacement && replacement !== "") {
    const replacementInput = page.getByRole('textbox', { name: 'Replacement string' });
    await replacementInput.click();
    await replacementInput.fill(replacement);
    await expect(replacementInput).toHaveValue(replacement);
  }
  if (matchIndex && matchIndex !== "") {
    const matchIndexInput = page.getByRole('textbox', { name: 'Match index' });
    await matchIndexInput.click();
    await matchIndexInput.fill(matchIndex);
    await expect(matchIndexInput).toHaveValue(matchIndex);
  }
  if (matchCount && matchCount !== "") {
    const matchCountInput = page.getByRole('textbox', { name: 'Match count' });
    await matchCountInput.click();
    await matchCountInput.fill(matchCount);
    await expect(matchCountInput).toHaveValue(matchCount);
  }
  if (newColumn) {
    await page.getByRole('radio', { name: 'Create a new column' }).click();
  }

  await ui.confirmBtn.click();
  if (newColumn) {
    await expect(page.getByText('column added')).toBeVisible();
  }
  await expect(page.getByText('column updated')).toBeVisible();
};

export const textRowsConfig = async (page: Page, separator: string) => {
  const ui = getComponents(page);

  const sep = page.getByRole('textbox', { name: 'Separator' });
  await sep.click();
  await sep.fill(separator);

  await ui.confirmBtn.click();
};

export const textColumnsConfig = async (
  page: Page,
  operation: string,
  splitMode?: string,
  splitDirection?: string,
  separator: string,
  columnsJoin?: string[],
  nameNewColumn?: string,
) => {
  const ui = getComponents(page);

  await page.getByRole('radio', { name: operation }).check();

  const sep = page.getByRole('textbox', { name: 'Separator' });
  await sep.click();
  await sep.fill(separator);

  if (splitMode && splitMode !== "") {
    await page.getByRole('radio', { name: splitMode }).check();
  }
  if (splitDirection && splitDirection !== "") {
    await page.getByRole('radio', { name: splitDirection }).check();
  }
  if (columnsJoin && columnsJoin.length !== 0) {
    const columnJoinSelect = page.locator('#mui-component-select-columnToJoin');
    await columnJoinSelect.click();

    for (const column of columnsJoin) {
      await page.getByRole('option', { name: column, exact: true }).click();
    }
    await ui.confirmComponentBtn('listbox').click();

    if (columnsJoin.length > 2) {
      const column = columnsJoin.join(' , ');
      await expect(page.getByRole('combobox', { name: column })).toBeVisible({ timeout: 10000 });
    } else {
      await expect(page.getByRole('combobox', { name: columnsJoin[0] })).toBeVisible({ timeout: 10000 });
    }
  }

  await ui.confirmComponentBtn('dialog').click();
  if (nameNewColumn && nameNewColumn !== '') {
    await page.getByRole('radio', { name: 'Rename new column(s)' }).check();
    const nameNewColumnInput = page.getByRole('textbox', { name: 'Rename new columns' });
    await nameNewColumnInput.click();
    await nameNewColumnInput.fill(nameNewColumn);
    await expect(nameNewColumnInput).toHaveValue(nameNewColumn);
  } else {
    await page.getByRole('radio', { name: 'Use default names' }).check();
  }

  await ui.confirmBtn.click();

  if (await page.getByText('Invalid separator').isVisible()) {
    console.log('Error.');
  } else {
    if (operation === 'Split a single column into multiple ones') {
      await expect(page.getByText('columns added')).toBeVisible();
    } else {
      await expect(page.getByText('column added')).toBeVisible();
    }
  }
};

export const dateFormatterConfig = async (
  page: Page,
  columnName: string,
  format: string,
  detailLevel: string,
  splitDatetime?: boolean,
  columnJoin?: string,
  newColumn: boolean,
  separator?: string,
) => {
  const ui = getComponents(page);

  if (await page.getByText('Please select either one date column and one time column').isVisible()) {
    console.log('Error.');
  } else {
    if (format && format !== '') {
      await page.getByRole('radio', { name: format }).check();
    }
    if (detailLevel && detailLevel !== '') {
      await page.locator('#mui-component-select-detailLevel').click();
      await page.getByRole('option', { name: detailLevel, exact: true }).click();
    }
    if (columnJoin) {
      await page.locator('#mui-component-select-columnToJoin').click();
      await page.getByRole('option', { name: columnJoin }).click();
    }
    if (separator) {
      const sep = page.getByRole('textbox', { name: 'Separator' });
      await sep.click();
      await sep.fill(separator);
    }
    if (splitDatetime) {
      await page.getByRole('checkbox', { name: 'Split datetime' }).check();
      await ui.confirmBtn.click();
      await expect(page.getByText('columns added')).toBeVisible();
    } else if (columnJoin) {
      await ui.confirmBtn.click();
      await expect(page.getByRole('columnheader', { name: `${columnName}_${columnJoin}` })).toBeVisible();
    } else if (newColumn) {
      await page.getByRole('radio', { name: 'Create a new column' }).check();
      await ui.confirmBtn.click();
      await expect(page.getByText('column added')).toBeVisible();
      await expect(page.getByRole('columnheader', { name: `${columnName}_formatted` })).toBeVisible();
    } else {
      await ui.confirmBtn.click();
    }
  }
};

export const pseudoanonymizationConfig = async (
  page: Page,
  columnName: string,
  updateColumn: boolean,
  deanonymize: boolean,
  newColumnName: string,
) => {
  const ui = getComponents(page);

  if (deanonymize) {
    await page.getByRole('checkbox', { name: 'De-anonymize' }).check();
  }
  if (updateColumn) {
    await page.getByRole('radio', { name: 'Update the current column' }).check();
    await ui.confirmBtn.click();
    await expect(page.getByText('column updated')).toBeVisible();
  } else if (newColumnName && newColumnName !== '') {
    const renameField = page.getByRole('textbox', { name: 'New column name' });
    await renameField.click();
    await renameField.fill(newColumnName);
    await ui.confirmBtn.click();
    await expect(page.getByText('column added')).toBeVisible();
    await expect(page.getByText(newColumnName)).toBeVisible();
  } else {
    await ui.confirmBtn.click();
    await expect(page.getByText('column added')).toBeVisible();
    await expect(page.getByRole('columnheader', { name: `${columnName}_anonymized` })).toBeVisible();
  }
};
