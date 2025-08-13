import { test, expect } from '@playwright/test'

test.describe('Todo Application', () => {
  // This test stays outside the beforeEach as it tests the welcome page
  test('should load welcome page', async ({ page }) => {
    await page.goto('/')
    
    // Check that welcome page loads
    await expect(page.getByText('Welcome to Tasks')).toBeVisible()
    await expect(page.getByText('Get Started')).toBeVisible()
  })

  test.describe('After getting started', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/')
      await page.getByTestId('get-started-button').click()
      await expect(page.getByRole('heading', { name: 'Tasks', exact: true })).toBeVisible()
    })

    test('should navigate to My Day after clicking Get Started', async ({ page }) => {
      // Should navigate to My Day view
      await expect(page.getByText("Today's Tasks")).toBeVisible()
      
      // Should show the sidebar (use more specific selectors)
      await expect(page.getByText('My Day')).toBeVisible()
      await expect(page.getByText('Important')).toBeVisible()
      await expect(page.getByText('Active')).toBeVisible()
    })

    test('should show task views and navigation', async ({ page }) => {
      // Check My Day view loads 
      await expect(page.getByText("Today's Tasks")).toBeVisible()
      
      // Navigate to Important view
      await page.getByTestId('nav-important').click()
      await expect(page.getByRole('heading', { name: 'Important Tasks' })).toBeVisible()
      
      // Navigate to Active view  
      await page.getByTestId('nav-active').click()
      await expect(page.getByRole('heading', { name: 'Active Tasks' })).toBeVisible()
      
      // Check if Add New Task button works
      await expect(page.getByTestId('add-new-task-button')).toBeVisible()
    })

    test('should have responsive sidebar', async ({ page }) => {
      // Check sidebar is visible on desktop
      await expect(page.getByRole('heading', { name: 'Tasks', exact: true })).toBeVisible()
      
      // Test mobile view (simulate smaller viewport)
      await page.setViewportSize({ width: 375, height: 667 })
      
      // Check that the view still loads properly
      await expect(page.getByText("Today's Tasks")).toBeVisible()
    })

    test('should have date selector and search functionality', async ({ page }) => {
      // Check if date selector is visible in My Day view
      await expect(page.locator('div').filter({ hasText: /Today/ }).first()).toBeVisible()
      
      // Check if search input is available
      await expect(page.getByTestId('search-input')).toBeVisible()
      
      // Test search functionality
      await page.getByTestId('search-input').fill('test')
      // Should show search results view
      await expect(page.getByText('Search Results')).toBeVisible()
      
      // Clear search
      await page.getByTestId('search-input').fill('')
      // Should return to normal view
      await expect(page.getByText("Today's Tasks")).toBeVisible()
    })

    test('should open task form when clicking Add New Task', async ({ page }) => {
      // Wait for My Day view to be visible
      await expect(page.getByText("Today's Tasks")).toBeVisible()
      
      // Click Add New Task button
      await page.getByTestId('add-new-task-button').click()
      
      // Playwright will automatically wait for these elements to be visible
      await expect(page.getByRole('heading', { name: 'Add New Task' })).toBeVisible()
      await expect(page.getByTestId('task-title-input')).toBeVisible()
      
      // Check form fields are present
      await expect(page.getByText('Title')).toBeVisible()
      await expect(page.getByText('Description (Optional)')).toBeVisible()
      await expect(page.getByText('Category').first()).toBeVisible()
    })
  })
})