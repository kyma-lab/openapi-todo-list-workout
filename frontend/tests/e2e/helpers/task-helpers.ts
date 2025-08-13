import { Page, expect } from '@playwright/test'

export interface TaskOptions {
  title: string
  description?: string
  category?: string
  dueDate?: string
  dueTime?: string
  important?: boolean
}

/**
 * Helper function to create a task through the UI
 */
export async function createTask(page: Page, options: TaskOptions) {
  // Click Add New Task button
  await page.getByRole('button', { name: 'Add New Task' }).click()
  
  // Wait for form to be visible
  await expect(page.getByRole('heading', { name: 'Add New Task' })).toBeVisible()
  
  // Fill in the title (required)
  await page.getByPlaceholder('e.g., Finalize Q4 report').fill(options.title)
  
  // Fill in description if provided
  if (options.description) {
    await page.getByPlaceholder('Add more details about the task...').fill(options.description)
  }
  
  // Select category if provided
  if (options.category) {
    await page.locator('[role="combobox"]').first().click()
    await page.locator('[role="option"]').filter({ hasText: options.category }).click()
  }
  
  // Set due date if provided
  if (options.dueDate) {
    // Click on the date input
    await page.getByLabel('Due Date').click()
    // For simplicity, we'll type the date directly
    await page.getByLabel('Due Date').fill(options.dueDate)
  }
  
  // Set due time if provided
  if (options.dueTime) {
    await page.getByLabel('Due Time').fill(options.dueTime)
  }
  
  // Toggle important if specified
  if (options.important) {
    await page.getByLabel('Important').check()
  }
  
  // Save the task
  await page.getByRole('button', { name: 'Save Task' }).click()
  
  // Wait for form to close and return to main view
  await expect(page.getByRole('heading', { name: 'Add New Task' })).not.toBeVisible()
}

/**
 * Helper function to navigate to the app and get started
 */
export async function navigateAndGetStarted(page: Page) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Get Started' }).click()
  await expect(page.getByText("Today's Tasks")).toBeVisible()
}

/**
 * Helper function to navigate to different views
 */
export async function navigateToView(page: Page, viewName: 'My Day' | 'Important' | 'Active' | 'All') {
  await page.getByText(viewName, { exact: true }).click()
}

/**
 * Helper function to search for tasks
 */
export async function searchTasks(page: Page, searchQuery: string) {
  await page.getByPlaceholder('Search tasks...').fill(searchQuery)
  // Wait a moment for search results to appear
  await page.waitForTimeout(300) // This is acceptable here as it's for search debouncing
}

/**
 * Helper function to verify a task is visible with expected content
 */
export async function verifyTaskVisible(page: Page, taskTitle: string, options?: {
  description?: string
  category?: string
  important?: boolean
  completed?: boolean
}) {
  // Check if task title is visible
  await expect(page.getByText(taskTitle)).toBeVisible()
  
  // Check description if provided
  if (options?.description) {
    await expect(page.getByText(options.description)).toBeVisible()
  }
  
  // Check category badge if provided
  if (options?.category) {
    await expect(page.getByText(options.category)).toBeVisible()
  }
  
  // Check if important star is filled
  if (options?.important) {
    const taskItem = page.getByText(taskTitle).locator('..')
    await expect(taskItem.locator('.fill-yellow-500')).toBeVisible()
  }
  
  // Check if task is completed (strikethrough)
  if (options?.completed) {
    const taskTitle = page.getByText(taskTitle)
    await expect(taskTitle).toHaveClass(/line-through/)
  }
}

/**
 * Helper function to toggle task completion
 */
export async function toggleTaskCompletion(page: Page, taskTitle: string) {
  const taskItem = page.getByText(taskTitle).locator('..')
  const checkbox = taskItem.getByRole('checkbox')
  await checkbox.click()
}

/**
 * Helper function to toggle task completion by ID (more robust)
 */
export async function toggleTaskCompletionById(page: Page, taskId: string) {
  const checkbox = page.getByTestId(`task-checkbox-${taskId}`)
  await checkbox.click()
}

/**
 * Helper function to toggle task importance
 */
export async function toggleTaskImportance(page: Page, taskTitle: string) {
  const taskItem = page.getByText(taskTitle).locator('..')
  const starButton = taskItem.locator('button').filter({ has: page.locator('svg.lucide-star') })
  await starButton.click()
}

/**
 * Helper function to toggle task importance by ID (more robust)
 */
export async function toggleTaskImportanceById(page: Page, taskId: string) {
  const starButton = page.getByTestId(`task-star-${taskId}`)
  await starButton.click()
}

/**
 * Helper function to delete task by ID (more robust)
 */
export async function deleteTaskById(page: Page, taskId: string) {
  const deleteButton = page.getByTestId(`task-delete-${taskId}`)
  await deleteButton.click()
}

/**
 * Mock API responses for testing
 */
export async function mockEmptyAPIs(page: Page) {
  await page.route('**/api/v1/todos', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [] }),
    })
  })

  await page.route('**/api/v1/categories', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [] }),
    })
  })
}

/**
 * Mock API with sample task data
 */
export async function mockTaskAPIs(page: Page, tasks: any[] = [], categories: any[] = []) {
  await page.route('**/api/v1/todos', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: tasks }),
    })
  })

  await page.route('**/api/v1/categories', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: categories }),
    })
  })
}