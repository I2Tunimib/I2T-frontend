import { test, expect } from '@playwright/test';
import { checkOrAddService } from '../../utils/setup.utils';

test.beforeEach(async ({ page }) => {
  test.setTimeout(120000);
  await page.goto('http://127.0.0.1:3333/#create-project');
  // Please provide your local base directory path below
  const baseDirectory = 'FILE_PATH';
  const filePath = `${baseDirectory}/Drive condivisi/SemT project (shared)/Test_Tables/Test interface/table_user_task.csv`;
  await page.getByRole('button', { name: 'Choose File' }).click();
  await page.getByRole('button', { name: 'Choose File' }).setInputFiles(filePath);
  await page.getByRole('button', { name: 'Next »' }).click();
  await page.getByRole('textbox', { name: 'Project name' }).click();
  await page.getByRole('textbox', { name: 'Project name' }).fill('Football Clubs');
  await expect(page.getByRole('textbox', { name: 'Project name' })).toBeVisible();
  await page.getByRole('button', { name: 'Create project »' }).click();
  await page.getByRole('link', { name: '25' }).click();
});

test('Entity Matching Revision - Selection', async ({ page }) => {
  const wikidataAlligatorService = "Alligator EMD Reconciliation Service";
  const wikidataAlligatorURL = "http://vm.chronos.disco.unimib.it:3004/alligator/reconcile";

  await page.getByRole('columnheader', { name: 'Football Clubs' }).getByRole('button').click();
  await page.getByRole('link', { name: 'Reconcile' }).click();
  await page.getByRole('link', { name: 'Start reconciling…' }).click();
  await checkOrAddService(page, wikidataAlligatorService, wikidataAlligatorURL);
  await page.getByRole('button', { name: 'Next »' }).click();
  await expect(page.getByRole('radio', { name: 'location Q17334923' })).toBeChecked({ timeout: 100000 });
  await page.getByRole('textbox', { name: 'Type' }).click();
  await page.getByRole('textbox', { name: 'Type' }).fill('association');
  await expect(page.getByText('Q476028association football')).toBeVisible({ timeout: 100000 });
  await page.getByText('Q476028association football').click();
  await expect(page.getByText('Reconcile against type: association football club(Q476028)edit')).toBeVisible();
  await page.getByRole('checkbox', { name: 'Auto-match candidates with' }).uncheck();
  await page.getByRole('spinbutton', { name: 'Maximum number of candidates' }).click();
  await page.getByRole('spinbutton', { name: 'Maximum number of candidates' }).fill('20');
  await page.getByRole('row', { name: 'Manager', exact: true }).getByRole('textbox').click();
  await page.getByRole('row', { name: 'Manager', exact: true }).getByRole('textbox').fill('coach');
  await page.getByText('P286head coachon-field').click();
  await page.getByRole('row', { name: 'Team Captain', exact: true }).getByRole('textbox').click();
  await page.getByRole('row', { name: 'Team Captain', exact: true }).getByRole('textbox').fill('team captain');
  await page.getByText('P634team captaincaptain of').click();
  await expect(page.getByText('head coach(P286)edit')).toBeVisible();
  await expect(page.getByText('team captain(P634)edit')).toBeVisible();
  await page.getByRole('button', { name: 'Start reconciling...' }).click();
  await expect(page.getByText('Reconcile cells in column Football Clubs to type Q476028')).toBeVisible({ timeout: 100000 });
  await expect(page.getByText('includenone15')).toBeVisible({ timeout: 100000 });

  await page.getByRole('link', { name: 'Aston Villa' }).first().hover();
  await page.getByRole('button', { name: 'Match this cell' }).click();
  await expect(page.locator('#notification').getByText('Match Aston Villa (Q18711) to')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Aston Villa' })).toBeVisible();
});

test('Entity Matching Revision - Search', async ({ page }) => {
  const wikidataAlligatorService = "Alligator EMD Reconciliation Service";
  const wikidataAlligatorURL = "http://vm.chronos.disco.unimib.it:3004/alligator/reconcile";

  await page.getByRole('columnheader', { name: 'Football Clubs' }).getByRole('button').click();
  await page.getByRole('link', { name: 'Reconcile' }).click();
  await page.getByRole('link', { name: 'Start reconciling…' }).click();
  await checkOrAddService(page, wikidataAlligatorService, wikidataAlligatorURL);
  await page.getByRole('button', { name: 'Next »' }).click();
  await page.getByRole('textbox', { name: 'Type' }).click();
  await page.getByRole('textbox', { name: 'Type' }).fill('association');
  await expect(page.getByText('Q476028association football')).toBeVisible({ timeout: 100000 });
  await page.getByText('Q476028association football').click();
  await expect(page.getByText('Reconcile against type: association football club(Q476028)edit')).toBeVisible();
  await page.getByRole('checkbox', { name: 'Auto-match candidates with' }).uncheck();
  await page.getByRole('spinbutton', { name: 'Maximum number of candidates' }).click();
  await page.getByRole('spinbutton', { name: 'Maximum number of candidates' }).fill('20');
  await page.getByRole('row', { name: 'Manager', exact: true }).getByRole('textbox').click();
  await page.getByRole('row', { name: 'Manager', exact: true }).getByRole('textbox').fill('coach');
  await page.getByText('P286head coachon-field').click();
  await page.getByRole('row', { name: 'Team Captain', exact: true }).getByRole('textbox').click();
  await page.getByRole('row', { name: 'Team Captain', exact: true }).getByRole('textbox').fill('team captain');
  await page.getByText('P634team captaincaptain of').click();
  await expect(page.getByText('head coach(P286)edit')).toBeVisible();
  await expect(page.getByText('team captain(P634)edit')).toBeVisible();
  await page.getByRole('button', { name: 'Start reconciling...' }).click();
  await expect(page.getByText('Reconcile cells in column Football Clubs to type Q476028')).toBeVisible({ timeout: 100000 });
  await expect(page.getByText('includenone15')).toBeVisible({ timeout: 100000 });

  //Entity Matching Revision and Manual Reconciliation for Arsenal
  await page.getByRole('link', { name: 'Search for match' }).first().click();
  await expect(page.locator('.dialog-header')).toBeVisible();
  await page.getByRole('textbox', { name: 'Item to match' }).fill('Arsenal F.C.');
  await expect(page.getByText('Arsenal F.C.').first()).toBeVisible({ timeout: 100000 });
  await page.getByRole('listitem').filter({ hasText: 'Q476836Arsenal F.C.' }).getByRole('strong').click();
  await expect(page.locator('#notification').getByText('Match item Arsenal F.C. (')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Arsenal F.C.' })).toBeVisible();
});
