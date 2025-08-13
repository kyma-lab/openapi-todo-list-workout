import { test, expect } from '@playwright/test'

test.describe('Task Flow Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Navigate to My Day view to start testing
    await page.getByRole('button', { name: 'Get Started' }).click()
    
    // Wait for the sidebar to be visible as a sign that navigation is complete
    await expect(page.getByRole('heading', { name: 'Tasks', exact: true })).toBeVisible()
  })

  test('Flow1: Track a task through different views', async ({ page }) => {
    const uniqueTaskName = `Work Task ${Date.now()}`
    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowDate = tomorrow.toISOString().split('T')[0]

    await test.step('Create: Create a new task with due date tomorrow, mark as Important, and select Work category', async () => {
      // Open task creation form (sidebar should be visible from beforeEach)
      await page.getByRole('button', { name: 'Add New Task' }).click()
      
      // Fill in task details
      await page.getByPlaceholder('e.g., Finalize Q4 report').fill(uniqueTaskName)
      await page.getByPlaceholder('Add more details about the task...').fill('Important work task for testing flow')
      
      // Set due date to tomorrow
      await page.locator('input[type="date"]').fill(tomorrowDate)
      
      // Mark as important
      await page.getByLabel('Mark as Important').click()
      
      // Select Work category
      const categorySelect = page.locator('[role="combobox"]').first()
      await categorySelect.click()
      const workOption = page.locator('[role="option"]').filter({ hasText: 'Work' })
      await workOption.click()
      
      // Save the task
      await page.getByRole('button', { name: 'Save Task' }).click()
      
      // Wait for form to close
      await expect(page.getByPlaceholder('e.g., Finalize Q4 report')).not.toBeVisible()
    })

    await test.step('Verify (Important): Navigate to Important view and verify task is visible', async () => {
      await page.getByText('Important', { exact: true }).click()
      
      // Verify we're in Important view
      await expect(page.locator('main h1')).toContainText('Important')
      
      // Verify our task is visible
      await expect(page.locator(`h3:has-text("${uniqueTaskName}")`)).toBeVisible()
      
      // Verify task shows important star (filled)
      const taskContainer = page.locator(`.group:has-text("${uniqueTaskName}")`).first()
      await expect(taskContainer.locator('.lucide-star.fill-yellow-500')).toBeVisible()
    })

    await test.step('Verify (Active): Navigate to Active view and verify task is visible', async () => {
      await page.getByText('Active', { exact: true }).click()
      
      // Verify we're in Active view
      await expect(page.locator('main h1')).toContainText('Active')
      
      // Verify our task is visible
      await expect(page.locator(`h3:has-text("${uniqueTaskName}")`)).toBeVisible()
      
      // Task should show Work category badge
      const taskContainer = page.locator(`.group:has-text("${uniqueTaskName}")`).first()
      await expect(taskContainer.locator('div').filter({ hasText: 'Work' })).toBeVisible()
    })

    await test.step('Verify (Category): Navigate to Work category and verify task is visible', async () => {
      // Click on Work category card in sidebar
      await page.locator('.cursor-pointer').filter({ hasText: 'Work' }).first().click()
      
      // Verify we're in Work category view
      await expect(page.locator('main h1')).toContainText('Work')
      
      // Verify our task is visible
      await expect(page.locator(`h3:has-text("${uniqueTaskName}")`)).toBeVisible()
    })

    await test.step('Edit: Edit the task and change due date to today', async () => {
      // Click on the task to edit it
      const taskContainer = page.locator(`.group:has-text("${uniqueTaskName}")`).first()
      await taskContainer.click()
      
      // Wait for edit form to open
      await expect(page.getByPlaceholder('e.g., Finalize Q4 report')).toBeVisible()
      
      // Change due date to today
      await page.locator('input[type="date"]').fill(today)
      
      // Save the changes
      await page.getByRole('button', { name: 'Update Task' }).click()
      
      // Wait for form to close
      await expect(page.getByPlaceholder('e.g., Finalize Q4 report')).not.toBeVisible()
    })

    await test.step('Verify (My Day): Navigate to My Day view and verify task appears', async () => {
      await page.getByText('My Day', { exact: true }).click()
      
      // Verify we're in My Day view by checking for specific content
      await expect(page.getByText('My Day', { exact: true })).toBeVisible()
      
      // Verify our task is now visible in My Day
      await expect(page.locator(`h3:has-text("${uniqueTaskName}")`)).toBeVisible()
      
      // Task should still show as important and have Work category
      const taskContainer = page.locator(`.group:has-text("${uniqueTaskName}")`).first()
      await expect(taskContainer.locator('.lucide-star.fill-yellow-500')).toBeVisible()
      await expect(taskContainer.locator('div').filter({ hasText: 'Work' })).toBeVisible()
    })

    await test.step('Complete: Mark the task as completed in My Day view', async () => {
      // Find the task's checkbox and click it
      const taskContainer = page.locator(`.group:has-text("${uniqueTaskName}")`).first()
      const taskCheckbox = taskContainer.getByRole('checkbox')
      await taskCheckbox.click()
      
      // Wait for task to be marked as completed
      await expect(taskCheckbox).toBeChecked()
      
      // Task should now have strikethrough styling
      await expect(taskContainer.locator('h3.line-through')).toBeVisible()
      
      // Task container should have reduced opacity
      await expect(taskContainer).toHaveClass(/opacity-60/)
    })

    await test.step('Verify (Disappear from Active): Task should disappear from Active view', async () => {
      await page.getByText('Active', { exact: true }).click()
      
      // Verify we're in Active view
      await expect(page.locator('main h1')).toContainText('Active')
      
      // Completed task should NOT be visible in Active view
      await expect(page.locator(`h3:has-text("${uniqueTaskName}")`)).not.toBeVisible()
    })

    await test.step('Verify (Completed styling in other views): Task should appear as completed in other views', async () => {
      // Check Important view - completed important tasks should still appear
      await page.getByText('Important', { exact: true }).click()
      await expect(page.locator('main h1')).toContainText('Important')
      
      const importantTaskContainer = page.locator(`.group:has-text("${uniqueTaskName}")`).first()
      if (await importantTaskContainer.isVisible()) {
        // Should have strikethrough and reduced opacity
        await expect(importantTaskContainer.locator('h3.line-through')).toBeVisible()
        await expect(importantTaskContainer).toHaveClass(/opacity-60/)
      }
      
      // Check Work category view
      await page.locator('.cursor-pointer').filter({ hasText: 'Work' }).first().click()
      await expect(page.locator('main h1')).toContainText('Work')
      
      const categoryTaskContainer = page.locator(`.group:has-text("${uniqueTaskName}")`).first()
      if (await categoryTaskContainer.isVisible()) {
        // Should have strikethrough and reduced opacity
        await expect(categoryTaskContainer.locator('h3.line-through')).toBeVisible()
        await expect(categoryTaskContainer).toHaveClass(/opacity-60/)
      }
      
      // Check All view - completed tasks should definitely appear here
      await page.getByText('All', { exact: true }).click()
      await expect(page.locator('main h1')).toContainText('All Tasks')
      
      const allTaskContainer = page.locator(`.group:has-text("${uniqueTaskName}")`).first()
      await expect(allTaskContainer).toBeVisible()
      await expect(allTaskContainer.locator('h3.line-through')).toBeVisible()
      await expect(allTaskContainer).toHaveClass(/opacity-60/)
      
      // Should still show Work category badge and important star
      await expect(allTaskContainer.locator('div').filter({ hasText: 'Work' })).toBeVisible()
      await expect(allTaskContainer.locator('.lucide-star.fill-yellow-500')).toBeVisible()
    })
  })
})