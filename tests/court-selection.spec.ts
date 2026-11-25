import { expect, test, type Page, type Route } from '@playwright/test';

const origin = process.env.COURT_SELECTION_E2E_URL;
const branchId = process.env.COURT_SELECTION_E2E_BRANCH;
const businessDate = process.env.COURT_SELECTION_E2E_DATE;
const courtName = process.env.COURT_SELECTION_E2E_COURT ?? 'Sân E2E';
const fixtureCourtId = process.env.COURT_SELECTION_E2E_FIXTURE_COURT_ID;
const slotTime = process.env.COURT_SELECTION_E2E_TIME ?? '07:00';
const label = (state: string) => `${courtName} ${slotTime}: ${state}`;
const cell = (page: Page, state: string) =>
  page.getByRole('gridcell', { name: label(state), exact: true });

test.skip(
  !origin || !branchId || !businessDate,
  'Requires a disposable branch/date and a running app',
);

test('two browsers reconcile a keyboard claim, release, and simultaneous claim', async ({
  browser,
}) => {
  const contexts = await Promise.all([browser.newContext(), browser.newContext()]);
  try {
    const [a, b] = await Promise.all(contexts.map((context) => context.newPage()));
    const notices: string[] = [];
    b.on('websocket', (socket) => {
      socket.on('framereceived', ({ payload }) => {
        if (String(payload).includes('SlotHeld')) notices.push(String(payload));
      });
    });
    if (fixtureCourtId) {
      for (const page of [a, b]) {
        await page.route(/\/api\/court-status\?/, (route) =>
          route.fulfill({
            json: {
              data: {
                branchId,
                branchName: 'E2E',
                date: businessDate,
                openTime: '06:00:00',
                closeTime: '23:00:00',
                courts: [{ courtId: fixtureCourtId, courtName, courtNumber: 1, status: 'active' }],
                scheduleItems: [],
              },
            },
          }),
        );
        await page.route(/\/api\/branches\?/, (route) =>
          route.fulfill({ json: { data: { branches: [] } } }),
        );
      }
    }
    const url = `${origin}/customer/branches/${branchId}/court-status?date=${businessDate}`;
    await Promise.all([a.goto(url), b.goto(url)]);
    await expect(cell(a, 'Còn trống')).toBeEnabled();
    await expect(cell(b, 'Còn trống')).toBeEnabled();
    await expect(b.getByText('Đang kết nối lại với bảng lịch.')).toHaveCount(0);

    await cell(a, 'Còn trống').focus();
    await a.keyboard.press('Enter');
    await expect(cell(a, 'Sân đang được chọn')).toBeEnabled();
    await expect(cell(b, 'Đang được giữ')).toBeDisabled();
    await expect(cell(b, 'Đang được giữ')).toHaveClass(/bg-slate-200/);
    await expect.poll(() => notices.length).toBeGreaterThan(0);
    await cell(a, 'Sân đang được chọn').click();
    await expect(cell(b, 'Còn trống')).toBeEnabled();

    const mutation = '**/api/court-selections/slots';
    const blocked: Route[] = [];
    const barrier = async (route: Route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }
      blocked.push(route);
      if (blocked.length === 2) await Promise.all(blocked.map((request) => request.continue()));
    };
    await Promise.all([a.route(mutation, barrier), b.route(mutation, barrier)]);
    const responses = [a, b].map((page) =>
      page.waitForResponse(
        (response) =>
          response.url().endsWith('/court-selections/slots') &&
          response.request().method() === 'POST',
      ),
    );
    await Promise.all([cell(a, 'Còn trống').click(), cell(b, 'Còn trống').click()]);
    const statuses = (await Promise.all(responses)).map((response) => response.status());
    expect([...statuses].sort()).toEqual([200, 409]);
    const winner = statuses[0] === 200 ? a : b;
    const loser = winner === a ? b : a;
    await expect(cell(winner, 'Sân đang được chọn')).toBeEnabled();
    await expect(cell(loser, 'Đang được giữ')).toBeDisabled();
    await cell(winner, 'Sân đang được chọn').click();
    await expect(cell(loser, 'Còn trống')).toBeEnabled();
  } finally {
    await Promise.all(contexts.map((context) => context.close()));
  }
});
