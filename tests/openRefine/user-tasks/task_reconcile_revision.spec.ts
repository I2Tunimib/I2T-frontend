import { test, expect } from '@playwright/test';
import { checkOrAddService } from "../../utils/setup.utils";

test('Reconcile and Revision', async ({ page }) => {
  test.setTimeout(1000000);
  await page.evaluate(() => {
    document.body.style.zoom = "0.75";
  });
  //Upload file
  await test.step('Upload file', async () => {
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

  //Reconciliation Football Club
  await test.step('Reconciliation Football Club', async () => {
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
    await expect(page.getByText('includematched15')).toBeVisible({ timeout: 100000 });
  });

  //Entity Matching Revision and Manual Reconciliation for Arsenal
  await test.step('Entity Matching Revision Arsenal', async () => {
    await page.getByRole('link', { name: 'Choose new match' }).first().click();
    await expect(page.locator('#notification').getByText('Discard recon judgment for')).toBeVisible({ timeout: 100000 });
    await page.getByRole('link', { name: 'Search for match' }).click();
    await expect(page.locator('.dialog-header')).toBeVisible();
    await page.getByRole('textbox', { name: 'Item to match' }).fill('Arsenal F.C.');
    await expect(page.getByText('Arsenal F.C.').first()).toBeVisible({ timeout: 100000 });
    await page.getByRole('listitem').filter({ hasText: 'Q9617Arsenal F.C.' }).getByRole('strong').click();
    await expect(page.locator('#notification').getByText('Match item Arsenal F.C. (')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Arsenal F.C.' })).toBeVisible({ timeout: 100000 });
    await expect(page.locator('#notification')).not.toBeVisible({ timeout: 100000 });
  });

  //Entity Matching Revision and Manual Reconciliation for Bournemouth
  await test.step('Entity Matching Revision Bournemouth', async () => {
    await page.locator('tr:nth-child(3) > td:nth-child(4) > .data-table-cell-content > div > .data-table-recon-action').click();
    await expect(page.locator('#notification').getByText('Discard recon judgment for')).toBeVisible({ timeout: 100000 });
    await page.getByRole('link', { name: 'See more' }).first().click();
    await page.locator('div:nth-child(10) > span > .data-table-recon-topic').first().hover();
    await expect(page.getByRole('button', { name: 'Match this cell' })).toBeVisible();
    await page.getByRole('button', { name: 'Match this cell' }).click();
    await expect(page.locator('#notification').getByText('Match Bournemouth (Q19568) to')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Bournemouth' })).toBeVisible({ timeout: 100000 });
    await expect(page.locator('#notification')).not.toBeVisible({ timeout: 100000 });
  });

  //Entity Matching Revision and Manual Reconciliation for Burnley
  await test.step('Entity Matching Revision Burnley', async () => {
    await page.locator('tr:nth-child(5) > td:nth-child(4) > .data-table-cell-content > div > .data-table-recon-action').click();
    await expect(page.locator('#notification').getByText('Discard recon judgment for')).toBeVisible({ timeout: 100000 });
    await page.getByRole('link', { name: 'See more' }).first().click();
    await page.locator('div:nth-child(9) > span > .data-table-recon-topic').first().hover();
    await expect(page.getByRole('button', { name: 'Match this cell' })).toBeVisible();
    await page.getByRole('button', { name: 'Match this cell' }).click();
    await expect(page.locator('#notification').getByText('Match Burnley (Q19458) to')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Burnley' })).toBeVisible({ timeout: 100000 });
    await expect(page.locator('#notification')).not.toBeVisible({ timeout: 100000 });
  });

  //Entity Matching Revision and Manual Reconciliation for Chelsea
  await test.step('Entity Matching Revision Chelsea', async () => {
    await page.locator('tr:nth-child(6) > td:nth-child(4) > .data-table-cell-content > div > .data-table-recon-action').click();
    await expect(page.locator('#notification').getByText('Discard recon judgment for')).toBeVisible({ timeout: 100000 });
    await page.getByRole('link', { name: 'Search for match' }).first().click();
    await page.getByRole('textbox', { name: 'Item to match' }).fill('Chelsea F.C.');
    await expect(page.getByText('Chelsea F.C.').first()).toBeVisible({ timeout: 100000 });
    await page.getByRole('listitem').filter({ hasText: 'Q9616Chelsea F.C.' }).getByRole('strong').click();
    await expect(page.locator('#notification').getByText('Match item Chelsea F.C. (')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Chelsea F.C.' })).toBeVisible({ timeout: 100000 });
    await expect(page.locator('#notification')).not.toBeVisible({ timeout: 100000 });
  });

  //Entity Matching Revision and Manual Reconciliation for Crystal Palace
  await test.step('Entity Matching Revision Crystal Palace', async () => {
    await page.locator('tr:nth-child(7) > td:nth-child(4) > .data-table-cell-content > div > .data-table-recon-action').click();
    await expect(page.locator('#notification').getByText('Discard recon judgment for')).toBeVisible({ timeout: 100000 });
    await page.getByRole('link', { name: 'Search for match' }).first().click();
    await page.getByRole('textbox', { name: 'Item to match' }).fill('Crystal Palace F.C.');
    await expect(page.getByText('Crystal Palace F.C.').first()).toBeVisible({ timeout: 100000 });
    await page.getByRole('listitem').filter({ hasText: 'Q19467Crystal Palace F.C.' }).getByRole('strong').click();
    await expect(page.locator('#notification').getByText('Match item Crystal Palace F.C')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Crystal Palace F.C.' })).toBeVisible({ timeout: 100000 });
    await expect(page.locator('#notification')).not.toBeVisible({ timeout: 100000 });
  });

  //Entity Matching Revision and Manual Reconciliation for Everton
  await test.step('Entity Matching Revision Everton', async () => {
    await page.locator('tr:nth-child(8) > td:nth-child(4) > .data-table-cell-content > div > .data-table-recon-action').click();
    await expect(page.locator('#notification').getByText('Discard recon judgment for')).toBeVisible({ timeout: 100000 });
    await page.getByRole('link', { name: 'Search for match' }).first().click();
    await page.getByRole('textbox', { name: 'Item to match' }).fill('Everton F.C.');
    await expect(page.getByText('Everton F.C.').first()).toBeVisible({ timeout: 100000 });
    await page.getByRole('listitem').filter({ hasText: 'Q5794Everton F.C.' }).getByRole('strong').click();
    await expect(page.locator('#notification').getByText('Match item Everton F.C. (')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Everton F.C.' })).toBeVisible({ timeout: 100000 });
    await expect(page.locator('#notification')).not.toBeVisible({ timeout: 100000 });
  });

  //Entity Matching Revision and Manual Reconciliation for Liverpool
  await test.step('Entity Matching Revision Liverpool', async () => {
    await page.locator('tr:nth-child(10) > td:nth-child(4) > .data-table-cell-content > div > .data-table-recon-action').click();
    await expect(page.locator('#notification').getByText('Discard recon judgment for')).toBeVisible({ timeout: 100000 });
    await page.getByRole('link', { name: 'See more' }).first().click();
    await page.locator('div:nth-child(14) > span > .data-table-recon-topic').first().hover();
    await expect(page.getByRole('button', { name: 'Match this cell' })).toBeVisible();
    await page.getByRole('button', { name: 'Match this cell' }).click();
    await expect(page.locator('#notification').getByText('Match Liverpool (Q1130849) to')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Liverpool' })).toBeVisible({ timeout: 100000 });
    await expect(page.locator('#notification')).not.toBeVisible({ timeout: 100000 });
  });

  //Entity Matching Revision and Manual Reconciliation for Southampton
  await test.step('Entity Matching Revision Southampton', async () => {
    await page.locator('tr:nth-child(13) > td:nth-child(4) > .data-table-cell-content > div > .data-table-recon-action').click();
    await expect(page.locator('#notification').getByText('Discard recon judgment for')).toBeVisible({ timeout: 100000 });
    await page.getByRole('link', { name: 'See more' }).first().click();
    await page.getByRole('link', { name: 'Southampton' }).nth(5).hover();
    await expect(page.getByRole('button', { name: 'Match this cell' })).toBeVisible();
    await page.getByRole('button', { name: 'Match this cell' }).click();
    await expect(page.locator('#notification').getByText('Match Southampton (Q18732) to')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Southampton' })).toBeVisible({ timeout: 100000 });
    await expect(page.locator('#notification')).not.toBeVisible({ timeout: 100000 });
  });
});
