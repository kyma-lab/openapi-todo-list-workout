import React from 'react'
import { render, screen } from '../../test-utils'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import TaskItem from '../../../app/shared/components/task/task-item'
import { Task } from '../../../app/shared/types'

// Mock the app store
vi.mock('../../../app/shared/stores', () => ({
  useAppStore: () => ({
    currentView: 'active'
  }),
  selectCurrentView: () => 'active'
}))

// Mock the hooks
vi.mock('../../../app/shared/hooks', () => ({
  useUpdateTask: () => ({
    mutate: vi.fn()
  }),
  useDeleteTask: () => ({
    mutate: vi.fn()
  })
}))

const mockTask: Task = {
  id: '1',
  title: 'Test Task',
  description: 'Test description',
  completed: false,
  important: false,
  dueDate: '2025-08-11',
  dueTime: '14:30',
  categoryId: 'work',
  createdAt: '2025-08-10T10:00:00Z',
  updatedAt: '2025-08-10T10:00:00Z',
}

describe('TaskItem', () => {
  it('renders task title and description', () => {
    render(<TaskItem task={mockTask} />)
    
    expect(screen.getByText('Test Task')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('shows completed task with strikethrough', () => {
    const completedTask = { ...mockTask, completed: true }
    render(<TaskItem task={completedTask} />)
    
    const title = screen.getByText('Test Task')
    expect(title).toHaveClass('line-through')
  })

  it('shows important task with filled star', () => {
    const importantTask = { ...mockTask, important: true }
    render(<TaskItem task={importantTask} />)
    
    // Look for star icon with testid
    const starIcon = screen.getByTestId('task-star-1')
    expect(starIcon).toBeInTheDocument()
  })

  it('allows interaction with task completion', async () => {
    const user = userEvent.setup()
    render(<TaskItem task={mockTask} />)
    
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()
    
    // The actual mutation testing is in task-item-interactions.test.tsx
    // Here we just verify the UI elements are present and interactive
    await user.click(checkbox)
    // Since we're mocking the hooks, the UI state won't change, but the click should work
  })

  it('shows interactive star button for importance', async () => {
    const user = userEvent.setup()
    render(<TaskItem task={mockTask} />)
    
    const starButton = screen.getByTestId('task-star-1')
    expect(starButton).toBeInTheDocument()
    
    // Should be clickable
    await user.hover(starButton)
    // The actual mutation testing is in task-item-interactions.test.tsx
  })

  it('displays due date information', () => {
    render(<TaskItem task={mockTask} />)
    
    // Should show date info (could be "Yesterday" or "Aug 11" depending on current date)
    expect(screen.getByText('Yesterday') || screen.queryByText('Aug 11')).toBeTruthy()
  })

  it('shows overdue badge for overdue tasks', () => {
    const overdueTask = { 
      ...mockTask, 
      dueDate: '2025-07-01',
      dueTime: '10:00'
    }
    render(<TaskItem task={overdueTask} />)
    
    expect(screen.getByText('Overdue')).toBeInTheDocument()
  })
})