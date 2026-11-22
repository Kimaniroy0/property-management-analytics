import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/auth/**', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ session: null, user: null }),
    }),
  );
});

test('shows the app sign-in form', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('Property Management Analytics Dashboard');
  await expect(page.getByRole('heading', { name: 'ESTATE ANALYTICS' })).toBeVisible();
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();
});

test('navigates from sign-in to sign-up', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Create one' }).click();

  await expect(page).toHaveURL(/\/sign-up$/);
  await expect(page.getByLabel('Full name')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible();
});
