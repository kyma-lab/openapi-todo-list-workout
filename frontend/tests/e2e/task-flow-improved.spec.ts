import { test, expect } from '@playwright/test'
import { 
  createTask, 
  navigateAndGetStarted, 
  navigateToView, 
  verifyTaskVisible,
  toggleTaskCompletion,
  toggleTaskImportance
} from './helpers/task-helpers'

test.describe('Task Flow Tests (Improved with Helpers)', () => {
  test.beforeEach(async ({ page }) => {
    await navigateAndGetStarted(page)
  })

  test('Flow1: Track a task through different views using helpers', async ({ page }) => {
    const uniqueTaskName = `Work Task ${Date.now()}`
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowDate = tomorrow.toISOString().split('T')[0]

    await test.step('Create: Create a new task with due date tomorrow, mark as Important, and select Work category', async () => {
      await createTask(page, {
        title: uniqueTaskName,
        description: 'Important work task for testing flow',
        category: 'Work',
        dueDate: tomorrowDate,
        important: true
      })
    })

    await test.step('Verify (Important): Navigate to Important view and verify task is visible', async () => {
      await navigateToView(page, 'Important')
      
      await expect(page.getByText('Important Tasks')).toBeVisible()
      await verifyTaskVisible(page, uniqueTaskName, {
        description: 'Important work task for testing flow',
        category: 'Work',
        important: true
      })
    })

    await test.step('Verify (Active): Navigate to Active view and verify task is there', async () => {
      await navigateToView(page, 'Active')
      
      await expect(page.getByText('Active Tasks')).toBeVisible()
      await verifyTaskVisible(page, uniqueTaskName, {
        category: 'Work'
      })
    })

    await test.step('Verify (All): Navigate to All view and verify task is there', async () => {
      await navigateToView(page, 'All')
      
      await expect(page.getByText('All Tasks')).toBeVisible()
      await verifyTaskVisible(page, uniqueTaskName, {
        category: 'Work'
      })
    })

    await test.step('Complete: Mark the task as completed', async () => {
      await toggleTaskCompletion(page, uniqueTaskName)
      
      // Verify task is now marked as completed
      await verifyTaskVisible(page, uniqueTaskName, {
        completed: true
      })
    })

    await test.step('Verify (Active): Task should NOT appear in Active view anymore', async () => {
      await navigateToView(page, 'Active')
      
      await expect(page.getByText(uniqueTaskName)).not.toBeVisible()
    })

    await test.step('Verify (All): But still appear in All view', async () => {
      await navigateToView(page, 'All')
      
      await verifyTaskVisible(page, uniqueTaskName, {
        completed: true
      })
    })

    await test.step('Un-Important: Remove important flag', async () => {
      await toggleTaskImportance(page, uniqueTaskName)
      
      // Go to Important view and verify task is no longer there
      await navigateToView(page, 'Important')
      await expect(page.getByText(uniqueTaskName)).not.toBeVisible()
    })
  })

  test('Flow2: Create multiple tasks and verify filtering', async ({ page }) => {
    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const taskPrefix = `Task-${Date.now()}`

    await test.step('Create multiple tasks with different properties', async () => {
      // Task 1: Today, Important, Work
      await createTask(page, {
        title: `${taskPrefix}-Today-Important`,
        description: 'Important task for today',
        category: 'Work',
        dueDate: today,
        important: true
      })

      // Task 2: Tomorrow, Not Important, Personal
      await createTask(page, {
        title: `${taskPrefix}-Tomorrow-Regular`,
        description: 'Regular task for tomorrow',
        category: 'Personal',
        dueDate: tomorrow,
        important: false
      })

      // Task 3: No date, Important, Work
      await createTask(page, {
        title: `${taskPrefix}-NoDate-Important`,
        description: 'Important task without date',
        category: 'Work',
        important: true
      })
    })

    await test.step('Verify My Day view shows only today\'s task', async () => {
      await navigateToView(page, 'My Day')
      
      await expect(page.getByText(`${taskPrefix}-Today-Important`)).toBeVisible()
      await expect(page.getByText(`${taskPrefix}-Tomorrow-Regular`)).not.toBeVisible()
      await expect(page.getByText(`${taskPrefix}-NoDate-Important`)).not.toBeVisible()
    })

    await test.step('Verify Important view shows only important tasks', async () => {
      await navigateToView(page, 'Important')
      
      await expect(page.getByText(`${taskPrefix}-Today-Important`)).toBeVisible()
      await expect(page.getByText(`${taskPrefix}-Tomorrow-Regular`)).not.toBeVisible()
      await expect(page.getByText(`${taskPrefix}-NoDate-Important`)).toBeVisible()
    })

    await test.step('Verify All view shows all tasks', async () => {
      await navigateToView(page, 'All')
      
      await expect(page.getByText(`${taskPrefix}-Today-Important`)).toBeVisible()
      await expect(page.getByText(`${taskPrefix}-Tomorrow-Regular`)).toBeVisible()
      await expect(page.getByText(`${taskPrefix}-NoDate-Important`)).toBeVisible()
    })
  })
})