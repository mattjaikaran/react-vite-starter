import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('public homepage actions reach the account routes', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('link', { name: /Get started/i }).click()
    await expect(page).toHaveURL('/register')
    await page.goto('/')
    await page.getByRole('link', { name: /Sign in/i }).click()
    await expect(page).toHaveURL('/login')
  })

  test('keeps account navigation available on a narrow screen', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    const navigation = page.getByRole('navigation', { name: 'Main navigation' })
    await expect(navigation.getByRole('link', { name: 'Login', exact: true })).toBeVisible()
    await expect(navigation.getByRole('link', { name: 'Register', exact: true })).toBeVisible()
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true)
  })

  test('supports dark mode and a keyboard skip link', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' })
    await page.goto('/')
    await page.keyboard.press('Tab')
    const skipLink = page.getByRole('link', { name: 'Skip to content' })
    await expect(skipLink).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('main')).toBeFocused()
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme)).toBe(
      'dark'
    )
  })
})
