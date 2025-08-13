import { test, expect } from '@playwright/test'

test.describe('Tasks Without Date Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Navigate to My Day view to start testing
    await page.getByTestId('get-started-button').click()
    
    // Wait for the sidebar to be visible as a sign that navigation is complete
    await expect(page.getByRole('heading', { name: 'Tasks', exact: true })).toBeVisible()
  })

  test('Tasks without date should NOT appear in Today\'s Tasks view', async ({ page }) => {
    const taskWithoutDate = `Task Without Date ${Date.now()}`
    const taskWithTodayDate = `Task With Today Date ${Date.now()}`
    const today = new Date().toISOString().split('T')[0]

    await test.step('Create a task WITHOUT due date', async () => {
      // Open task creation form
      await page.getByTestId('add-new-task-button').click()
      
      // Fill in task details - NO due date
      await page.getByTestId('task-title-input').fill(taskWithoutDate)
      await page.getByTestId('task-description-input').fill('Task without any due date')
      
      // Do NOT set any due date - leave it empty
      
      // Save the task
      await page.getByTestId('task-form-submit-button').click()
      
      // Wait for form to close
      await expect(page.getByTestId('task-title-input')).not.toBeVisible()
    })

    await test.step('Create a task WITH today\'s due date for comparison', async () => {
      // Open task creation form again
      await page.getByTestId('add-new-task-button').click()
      
      // Fill in task details WITH today's date
      await page.getByTestId('task-title-input').fill(taskWithTodayDate)
      await page.getByTestId('task-description-input').fill('Task with today as due date')
      
      // Set due date to today
      await page.getByTestId('task-due-date-input').fill(today)
      
      // Save the task
      await page.getByTestId('task-form-submit-button').click()
      
      // Wait for form to close
      await expect(page.getByTestId('task-title-input')).not.toBeVisible()
    })

    await test.step('Verify in My Day (Today\'s Tasks) view', async () => {
      // Make sure we're in My Day view
      await page.getByTestId('nav-my-day').click()
      
      // Wait for the view to load
      await expect(page.getByText('My Day', { exact: true })).toBeVisible()
      
      // Task with today's date SHOULD be visible
      await expect(page.locator(`h3:has-text("${taskWithTodayDate}")`)).toBeVisible()
      
      // Task without date should NOT be visible in Today's Tasks
      await expect(page.locator(`h3:has-text("${taskWithoutDate}")`)).not.toBeVisible()
    })

    await test.step('Verify task without date appears in other views', async () => {
      // Check Active view - task without date should appear here
      await page.getByTestId('nav-active').click()
      await expect(page.locator('main h1')).toContainText('Active')
      
      // Both tasks should be visible in Active view
      await expect(page.locator(`h3:has-text("${taskWithoutDate}")`)).toBeVisible()
      await expect(page.locator(`h3:has-text("${taskWithTodayDate}")`)).toBeVisible()
      
      // Check All view - both tasks should appear here too
      await page.getByTestId('nav-all').click()
      await expect(page.locator('main h1')).toContainText('All Tasks')
      
      // Both tasks should be visible in All view
      await expect(page.locator(`h3:has-text("${taskWithoutDate}")`)).toBeVisible()
      await expect(page.locator(`h3:has-text("${taskWithTodayDate}")`)).toBeVisible()
    })

    await test.step('Double-check: Go back to My Day and confirm task without date is still not there', async () => {
      // Go back to My Day view
      await page.getByTestId('nav-my-day').click()
      
      // Task with today's date should still be visible
      await expect(page.locator(`h3:has-text("${taskWithTodayDate}")`)).toBeVisible()
      
      // Task without date should still NOT be visible
      await expect(page.locator(`h3:has-text("${taskWithoutDate}")`)).not.toBeVisible()
      
      // Log the current tasks for debugging
      const allTasksInMyDay = await page.locator('h3').allTextContents()
      console.log('Tasks currently visible in My Day view:', allTasksInMyDay)
    })
  })

  test('Tasks with future dates should NOT appear in Today\'s Tasks view', async ({ page }) => {
    const taskWithFutureDate = `Task Future Date ${Date.now()}`
    const taskWithTodayDate = `Task Today Date ${Date.now()}`
    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowDate = tomorrow.toISOString().split('T')[0]

    await test.step('Create a task with FUTURE due date', async () => {
      await page.getByTestId('add-new-task-button').click()
      
      await page.getByTestId('task-title-input').fill(taskWithFutureDate)
      await page.getByTestId('task-description-input').fill('Task for tomorrow')
      
      // Set due date to tomorrow
      await page.getByTestId('task-due-date-input').fill(tomorrowDate)
      
      await page.getByTestId('task-form-submit-button').click()
      await expect(page.getByTestId('task-title-input')).not.toBeVisible()
    })

    await test.step('Create a task with TODAY\'s due date for comparison', async () => {
      await page.getByTestId('add-new-task-button').click()
      
      await page.getByTestId('task-title-input').fill(taskWithTodayDate)
      await page.getByTestId('task-description-input').fill('Task for today')
      
      // Set due date to today
      await page.getByTestId('task-due-date-input').fill(today)
      
      await page.getByTestId('task-form-submit-button').click()
      await expect(page.getByTestId('task-title-input')).not.toBeVisible()
    })

    await test.step('Verify in My Day view - only today\'s task should appear', async () => {
      await page.getByTestId('nav-my-day').click()
      await expect(page.getByText('My Day', { exact: true })).toBeVisible()
      
      // Task with today's date SHOULD be visible
      await expect(page.locator(`h3:has-text("${taskWithTodayDate}")`)).toBeVisible()
      
      // Task with future date should NOT be visible in Today's Tasks
      await expect(page.locator(`h3:has-text("${taskWithFutureDate}")`)).not.toBeVisible()
    })
  })
})