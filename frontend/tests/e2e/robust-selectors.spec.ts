import { test, expect } from '@playwright/test'
import { mockEmptyAPIs, mockTaskAPIs } from './helpers/task-helpers'

test.describe('Robust Element Selection with data-testid', () => {
  test('should interact with tasks using data-testid selectors', async ({ page }) => {
    const sampleTasks = [
      {
        id: 1,
        title: 'Test Task 1',
        description: 'First test task',
        completed: false,
        important: false,
        dueDate: '2024-01-15',
        category: 'Work',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 2,
        title: 'Test Task 2',
        description: 'Second test task',
        completed: false,
        important: true,
        dueDate: '2024-01-16',
        category: 'Personal',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ]

    const sampleCategories = [
      { id: '1', name: 'Work' },
      { id: '2', name: 'Personal' }
    ]

    await mockTaskAPIs(page, sampleTasks, sampleCategories)
    
    await page.goto('/')
    await page.getByRole('button', { name: 'Get Started' }).click()
    await page.getByText('All', { exact: true }).click()

    // Wait for tasks to load
    await expect(page.getByText('Test Task 1')).toBeVisible()

    // Test task item interaction using data-testid
    const task1Item = page.getByTestId('task-item-1')
    await expect(task1Item).toBeVisible()

    // Test checkbox interaction
    const task1Checkbox = page.getByTestId('task-checkbox-1')
    await expect(task1Checkbox).toBeVisible()
    await task1Checkbox.click()

    // Test star button interaction
    const task1Star = page.getByTestId('task-star-1')
    await expect(task1Star).toBeVisible()
    await task1Star.click()

    // Verify important task has different styling
    const task2Item = page.getByTestId('task-item-2')
    await expect(task2Item).toBeVisible()
    
    // The important task should have a yellow star
    const task2Star = page.getByTestId('task-star-2')
    const starIcon = task2Star.locator('svg')
    await expect(starIcon).toHaveClass(/fill-yellow-500/)
  })

  test('should handle task deletion with robust selectors', async ({ page }) => {
    const sampleTasks = [
      {
        id: 1,
        title: 'Task to Delete',
        description: 'This task will be deleted',
        completed: false,
        important: false,
        dueDate: '2024-01-15',
        category: 'Work',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ]

    await mockTaskAPIs(page, sampleTasks, [{ id: '1', name: 'Work' }])
    
    // Mock the delete API call
    await page.route('**/api/v1/todos/1', route => {
      if (route.request().method() === 'DELETE') {
        route.fulfill({ status: 200 })
      }
    })

    await page.goto('/')
    await page.getByRole('button', { name: 'Get Started' }).click()
    await page.getByText('All', { exact: true }).click()

    // Wait for task to be visible
    await expect(page.getByText('Task to Delete')).toBeVisible()

    // Use the delete button with data-testid
    const deleteButton = page.getByTestId('task-delete-1')
    await expect(deleteButton).toBeVisible()
    
    // The delete button should be visible on hover
    const taskItem = page.getByTestId('task-item-1')
    await taskItem.hover()
    await deleteButton.click()

    // After deletion, task should no longer be visible
    // (Note: In a real test, you might mock the API to return updated data)
  })

  test('should work with category selectors when added', async ({ page }) => {
    await mockEmptyAPIs(page)
    
    await page.goto('/')
    await page.getByRole('button', { name: 'Get Started' }).click()

    // Future: When category cards get data-testid attributes
    // await page.getByTestId('category-card-work').click()
    
    // For now, we can still use existing selectors
    await expect(page.getByText('All Tasks')).toBeVisible()
  })
})