import { expect, test } from '@playwright/test';

test('game page loads and shows initial count', async ({ page }) => {
	await page.goto('/game');
	await expect(page.getByText('Count: 0')).toBeVisible();
});

test('increment button increases count', async ({ page }) => {
	await page.goto('/game');
	await page.getByRole('button', { name: 'Increment' }).click();
	await expect(page.getByText('Count: 1')).toBeVisible();
});
