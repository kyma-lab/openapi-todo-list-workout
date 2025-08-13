import { test, expect } from '@playwright/test'

test.describe('Task Views with Mocked API', () => {
  test('should display empty message when there are no tasks', async ({ page }) => {
    // Mock the tasks API to return empty data
    await page.route('**/api/v1/todos', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      })
    })

    // Mock the categories API
    await page.route('**/api/v1/categories', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      })
    })

    await page.goto('/')
    await page.getByRole('button', { name: 'Get Started' }).click()
    
    // Navigate to All tasks view
    await page.getByText('All', { exact: true }).click()

    // Check if empty message is displayed
    await expect(page.getByText('No tasks found')).toBeVisible()
  })

  test('should display error message when API fails', async ({ page }) => {
    // Mock the tasks API to return an error
    await page.route('**/api/v1/todos', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      })
    })

    // Mock the categories API to succeed
    await page.route('**/api/v1/categories', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      })
    })

    await page.goto('/')
    await page.getByRole('button', { name: 'Get Started' }).click()
    
    // Navigate to All tasks view
    await page.getByText('All', { exact: true }).click()

    // Check if error message is displayed
    await expect(page.getByText('Error loading tasks')).toBeVisible()
  })

  test('should display loading state initially', async ({ page }) => {
    // Mock the tasks API with a delay
    await page.route('**/api/v1/todos', route => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [] }),
        })
      }, 1000) // 1 second delay to see loading state
    })

    // Mock the categories API
    await page.route('**/api/v1/categories', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      })
    })

    await page.goto('/')
    await page.getByRole('button', { name: 'Get Started' }).click()
    
    // Check if loading message is displayed briefly
    await expect(page.getByText('Loading tasks...')).toBeVisible()
    
    // After delay, should show empty message
    await expect(page.getByText('No tasks found')).toBeVisible()
  })

  test('should filter tasks correctly in My Day view', async ({ page }) => {
    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // Mock tasks API with test data
    await page.route('**/api/v1/todos', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          data: [
            {
              id: 1,
              title: 'Today Task',
              description: 'Task for today',
              completed: false,
              important: false,
              dueDate: today,
              category: 'Work',
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z'
            },
            {
              id: 2,
              title: 'Tomorrow Task',
              description: 'Task for tomorrow',
              completed: false,
              important: false,
              dueDate: tomorrow,
              category: 'Personal',
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z'
            },
            {
              id: 3,
              title: 'No Date Task',
              description: 'Task without date',
              completed: false,
              important: false,
              dueDate: null,
              category: 'Work',
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z'
            }
          ]
        }),
      })
    })

    // Mock categories API
    await page.route('**/api/v1/categories', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          data: [
            { id: '1', name: 'Work' },
            { id: '2', name: 'Personal' }
          ]
        }),
      })
    })

    await page.goto('/')
    await page.getByRole('button', { name: 'Get Started' }).click()
    
    // Should be in My Day view by default and show only today's task
    await expect(page.getByText("Today's Tasks")).toBeVisible()
    await expect(page.getByText('Today Task')).toBeVisible()
    await expect(page.getByText('Tomorrow Task')).not.toBeVisible()
    await expect(page.getByText('No Date Task')).not.toBeVisible()

    // Navigate to All tasks view to see all tasks
    await page.getByText('All', { exact: true }).click()
    await expect(page.getByText('Today Task')).toBeVisible()
    await expect(page.getByText('Tomorrow Task')).toBeVisible()
    await expect(page.getByText('No Date Task')).toBeVisible()
  })

  test('should filter important tasks correctly', async ({ page }) => {
    // Mock tasks API with test data
    await page.route('**/api/v1/todos', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          data: [
            {
              id: 1,
              title: 'Important Task',
              description: 'This is important',
              completed: false,
              important: true,
              dueDate: '2024-01-15',
              category: 'Work',
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z'
            },
            {
              id: 2,
              title: 'Regular Task',
              description: 'This is not important',
              completed: false,
              important: false,
              dueDate: '2024-01-15',
              category: 'Personal',
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z'
            }
          ]
        }),
      })
    })

    // Mock categories API
    await page.route('**/api/v1/categories', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          data: [
            { id: '1', name: 'Work' },
            { id: '2', name: 'Personal' }
          ]
        }),
      })
    })

    await page.goto('/')
    await page.getByRole('button', { name: 'Get Started' }).click()
    
    // Navigate to Important tasks view
    await page.getByText('Important', { exact: true }).click()
    
    // Should show only important tasks
    await expect(page.getByText('Important Tasks')).toBeVisible()
    await expect(page.getByText('Important Task')).toBeVisible()
    await expect(page.getByText('Regular Task')).not.toBeVisible()
  })
})