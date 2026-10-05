import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should require email and password fields', async ({ page }) => {
    await page.goto('/login')

    // Try to submit empty form
    await page.getByRole('button', { name: /Sign in/i }).click()

    // Schema validation shows accessible errors without contacting the backend.
    await expect(page.getByText('Enter a valid email address')).toBeVisible()
    await expect(page.getByText('Enter your password')).toBeVisible()
    await expect(page).toHaveURL('/login')
  })

  test('should show loading state when submitting', async ({ page }) => {
    // Mock the API to delay response
    await page.route('**/api/auth/login', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Invalid credentials' }),
      })
    })

    await page.goto('/login')

    // Fill in credentials
    await page.getByLabel(/Email address/i).fill('test@example.com')
    await page.getByLabel(/Password/i).fill('password123')

    // Click submit
    await page.getByRole('button', { name: /Sign in/i }).click()

    // Should show loading state
    await expect(page.getByRole('button', { name: /Signing in/i })).toBeVisible()
  })

  test('should show error message on failed login', async ({ page }) => {
    // Mock failed login API response
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Invalid email or password' }),
      })
    })

    await page.goto('/login')

    // Fill in credentials
    await page.getByLabel(/Email address/i).fill('wrong@example.com')
    await page.getByLabel(/Password/i).fill('wrongpassword')

    // Submit form
    await page.getByRole('button', { name: /Sign in/i }).click()

    // Should show error message
    await expect(page.getByText(/Invalid|error|failed/i)).toBeVisible()
  })

  test('should redirect to dashboard on successful login', async ({ page }) => {
    // Mock successful login API response
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
        }),
      })
    })

    // Mock user API response
    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          email: 'test@example.com',
          username: 'testuser',
          first_name: 'Test',
          last_name: 'User',
          avatar_url: null,
          bio: '',
          is_active: true,
          date_joined: '2024-01-01T00:00:00Z',
        }),
      })
    })

    await page.goto('/login')

    // Fill in credentials
    await page.getByLabel(/Email address/i).fill('test@example.com')
    await page.getByLabel(/Password/i).fill('password123')

    // Submit form
    await page.getByRole('button', { name: /Sign in/i }).click()

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
  })

  test('preserves a protected destination and clears an expired session', async ({ page }) => {
    await page.route('**/api/auth/login', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ access_token: 'test-access', refresh_token: 'test-refresh' }),
      })
    )
    await page.route('**/api/auth/me', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          email: 'test@example.com',
          username: 'test',
          first_name: '',
          last_name: '',
          avatar_url: null,
          bio: '',
          is_active: true,
          date_joined: '2024-01-01',
        }),
      })
    )
    await page.goto('/profile?tab=details#account')
    await expect(page).toHaveURL('/login')
    await page.getByLabel('Email address').fill('test@example.com')
    await page.getByLabel('Password', { exact: true }).fill('password123')
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()
    await expect(page).toHaveURL('/profile?tab=details#account')
    await page.route('**/api/auth/me', (route) => route.fulfill({ status: 401, body: '{}' }))
    await page.route('**/api/auth/refresh', (route) => route.fulfill({ status: 401, body: '{}' }))
    await page.reload()
    await expect(page).toHaveURL('/login')
    expect(await page.evaluate(() => localStorage.getItem('access_token'))).toBeNull()
    expect(await page.evaluate(() => localStorage.getItem('refresh_token'))).toBeNull()
  })

  test('registration displays mismatched password feedback', async ({ page }) => {
    await page.goto('/register')
    await page.getByLabel('Email address').fill('test@example.com')
    await page.getByLabel('Username').fill('test')
    await page.getByLabel('Password', { exact: true }).fill('password123')
    await page.getByLabel('Confirm Password').fill('different123')
    await page.getByRole('button', { name: 'Create account', exact: true }).click()
    await expect(page.getByText('Passwords do not match')).toBeVisible()
    await expect(page).toHaveURL('/register')
  })
})
