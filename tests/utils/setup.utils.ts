import { expect } from '@playwright/test';

export const login = async (page, url, username, password) => {
  await page.goto(url);
  await page.getByRole('link', { name: 'Get started' }).click();
  await page.locator('input[name="username"]').fill(username);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Confirm', exact: true }).click();
  await expect(page).toHaveURL(/datasets/, { timeout: 10000 });
  const dashboardHeader = page.getByRole('heading', { name: 'Datasets' });
  await expect(dashboardHeader).toBeVisible();
};

export const openDataset = async (page, datasetName) => {
  const datasetLink = page.getByRole('link', { name: datasetName, exact: true });
  try {
    await datasetLink.waitFor({ state: 'visible', timeout: 3000 });
  } catch (e) {
    const goToPageBtn = page.getByRole('button', { name: 'Go to page' });
    if (await goToPageBtn.isVisible()) {
      await goToPageBtn.click();
      await datasetLink.waitFor({ state: 'visible', timeout: 3000 });
    }
  }

  //Open dataset
  await datasetLink.click();
  await expect(page.getByRole('heading', { name: datasetName })).toBeVisible();
};

export const openTable = async (page, tabletName) => {
  const tableLink = page.getByRole('link', { name: tabletName, exact: true });
  try {
    await tableLink.waitFor({ state: 'visible', timeout: 3000 });
  } catch (e) {
    const goToPageBtn = page.getByRole('button', { name: 'Go to page' });
    if (await goToPageBtn.isVisible()) {
      await goToPageBtn.click();
      await tableLink.waitFor({ state: 'visible', timeout: 3000 });
    }
  }

  //Open table
  await tableLink.click();
  await expect(page.getByRole('heading', { name: tabletName })).toBeVisible();
};

export const getOrCreateDataset = async (page, datasetName) => {
  const datasetLink = page.getByRole('link', { name: datasetName });
  try {
    await datasetLink.waitFor({ state: 'visible', timeout: 3000 });
  } catch (e) {
    const goToPageBtn = page.getByRole('button', { name: 'Go to page' });
    if (await goToPageBtn.isVisible()) {
      await goToPageBtn.click();
      try {
        await datasetLink.waitFor({ state: 'visible', timeout: 2000 });
      } catch (err) {}
    }
  }

  if (!(await datasetLink.isVisible())) {
    await page.getByRole('button', { name: 'New dataset' }).click();
    await page.getByRole('textbox', { name: 'Dataset name' }).fill(datasetName);
    await page.getByRole('button', { name: 'Confirm', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Add dataset' })).not.toBeVisible();
  }

  await openDataset(page, datasetName);
};

export const getOrCreateTable = async (page, tableName, filePath) => {
  const tableLink = page.getByRole('link', { name: tableName, exact: true });
  try {
    await tableLink.waitFor({ state: 'visible', timeout: 3000 });
  } catch (e) {
    const goToPageBtn = page.getByRole('button', { name: 'Go to page' });
    if (await goToPageBtn.isVisible()) {
      await goToPageBtn.click();
      try {
        await tableLink.waitFor({ state: 'visible', timeout: 2000 });
      } catch (err) {}
    }
  }

  if (!(await tableLink.isVisible())) {
    await page.getByRole('button', { name: 'New table' }).click();
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Select file (.csv or .json)' }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);
    await page.getByRole('textbox', { name: 'Table name' }).fill(tableName);
    await page.getByRole('button', { name: 'Confirm', exact: true }).click();
  }
  await tableLink.click();
};

export const checkOrAddService = async (page, serviceName, serviceURL) => {
  const serviceRadio = page.getByRole('radio', { name: serviceName });

  if (await serviceRadio.isVisible()) {
    await serviceRadio.check();
    await expect(serviceRadio).toBeChecked();
  } else {
    await page.getByRole('button', { name: 'Add standard service...' }).click();
    await page.getByRole('textbox', { name: 'Enter the service\'s URL' }).fill(serviceURL);
    await page.getByRole('button', { name: 'Add service' }).click();
    await expect(serviceRadio).toBeChecked();
  }
};
