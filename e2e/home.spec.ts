import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('should load the home page with correct title and content', async ({ page }) => {
    await page.goto('/')

    // Check page title
    await expect(page).toHaveTitle(/React Vite Starter/)

    // Check main heading
    await expect(page.getByRole('heading', { name: /Welcome to/i })).toBeVisible()
    await expect(page.getByText('React Vite Starter')).toBeVisible()

    // Check feature cards are displayed
    await expect(page.getByRole('heading', { name: 'Features' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'React 18' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Vite' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'TailwindCSS' })).toBeVisible()
  })

  test('should show login and register buttons when not authenticated', async ({ page }) => {
    await page.goto('/')

    // Check CTA buttons for unauthenticated users
    await expect(page.getByRole('link', { name: /Get started/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Sign in/i })).toBeVisible()
  })
})
