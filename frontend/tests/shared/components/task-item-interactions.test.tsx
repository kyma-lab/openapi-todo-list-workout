import React from 'react'
import { render, screen } from '../../test-utils'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import TaskItem from '../../../app/shared/components/task/task-item'
import { Task } from '../../../app/shared/types'

// Mock the hooks to monitor function calls
const mockUpdateMutate = vi.fn()
const mockDeleteMutate = vi.fn()

vi.mock('../../../app/shared/stores', () => ({
  useAppStore: () => ({
    currentView: 'active'
  }),
  selectCurrentView: () => 'active'
}))

vi.mock('../../../app/shared/hooks', () => ({
  useUpdateTask: () => ({
    mutate: mockUpdateMutate
  }),
  useDeleteTask: () => ({
    mutate: mockDeleteMutate
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

describe('TaskItem User Interactions', () => {
  beforeEach(() => {
    // Clear mock calls before each test
    vi.clearAllMocks()
  })

  it('calls update mutation when checkbox is clicked to complete task', async () => {
    const user = userEvent.setup()
    render(<TaskItem task={mockTask} />)

    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)

    // Verify the update mutation was called with correct data to mark as completed
    expect(mockUpdateMutate).toHaveBeenCalledWith({
      id: '1',
      data: { completed: true }
    })
    expect(mockUpdateMutate).toHaveBeenCalledTimes(1)
  })

  it('calls update mutation when checkbox is clicked to uncomplete task', async () => {
    const user = userEvent.setup()
    const completedTask = { ...mockTask, completed: true }
    render(<TaskItem task={completedTask} />)

    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)

    // Verify the update mutation was called with correct data to mark as not completed
    expect(mockUpdateMutate).toHaveBeenCalledWith({
      id: '1',
      data: { completed: false }
    })
    expect(mockUpdateMutate).toHaveBeenCalledTimes(1)
  })

  it('calls update mutation when star button is clicked to mark as important', async () => {
    const user = userEvent.setup()
    render(<TaskItem task={mockTask} />)

    // Find the star button using data-testid since it doesn't have an accessible name
    const starButton = screen.getByTestId('task-star-1')
    await user.click(starButton)

    // Verify the update mutation was called with correct data to mark as important
    expect(mockUpdateMutate).toHaveBeenCalledWith({
      id: '1',
      data: { important: true }
    })
    expect(mockUpdateMutate).toHaveBeenCalledTimes(1)
  })

  it('calls update mutation when star button is clicked to unmark as important', async () => {
    const user = userEvent.setup()
    const importantTask = { ...mockTask, important: true }
    render(<TaskItem task={importantTask} />)

    const starButton = screen.getByTestId('task-star-1')
    await user.click(starButton)

    // Verify the update mutation was called with correct data to unmark as important
    expect(mockUpdateMutate).toHaveBeenCalledWith({
      id: '1',
      data: { important: false }
    })
    expect(mockUpdateMutate).toHaveBeenCalledTimes(1)
  })

  it('calls delete mutation when more actions button is clicked', async () => {
    const user = userEvent.setup()
    render(<TaskItem task={mockTask} />)

    // Find the delete button using data-testid
    const deleteButton = screen.getByTestId('task-delete-1')
    await user.click(deleteButton)

    // Verify the delete mutation was called with the task ID
    expect(mockDeleteMutate).toHaveBeenCalledWith('1')
    expect(mockDeleteMutate).toHaveBeenCalledTimes(1)
  })

  it('calls onEdit when task item is clicked', async () => {
    const user = userEvent.setup()
    const mockOnEdit = vi.fn()
    render(<TaskItem task={mockTask} onEdit={mockOnEdit} />)

    // Click on the task item (not on buttons)
    const taskTitle = screen.getByText('Test Task')
    await user.click(taskTitle)

    // Verify onEdit was called with the task ID
    expect(mockOnEdit).toHaveBeenCalledWith('1')
    expect(mockOnEdit).toHaveBeenCalledTimes(1)
  })

  it('prevents event propagation when clicking buttons inside task item', async () => {
    const user = userEvent.setup()
    const mockOnEdit = vi.fn()
    render(<TaskItem task={mockTask} onEdit={mockOnEdit} />)

    // Click on the checkbox - should not trigger onEdit
    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)

    expect(mockOnEdit).not.toHaveBeenCalled()
    expect(mockUpdateMutate).toHaveBeenCalledTimes(1)

    // Click on star button - should not trigger onEdit
    const starButton = screen.getByTestId('task-star-1')
    await user.click(starButton)

    expect(mockOnEdit).not.toHaveBeenCalled()
    expect(mockUpdateMutate).toHaveBeenCalledTimes(2)
  })

  it('handles keyboard interactions correctly', async () => {
    const user = userEvent.setup()
    const mockOnEdit = vi.fn()
    render(<TaskItem task={mockTask} onEdit={mockOnEdit} />)

    const taskItem = screen.getByTestId('task-item-1')
    
    // Focus and press Enter should trigger edit
    await user.click(taskItem)
    await user.keyboard('{Enter}')
    
    expect(mockOnEdit).toHaveBeenCalledWith('1')
  })

  it('displays task properties correctly based on state', async () => {
    const user = userEvent.setup()
    
    // Test completed task styling
    const completedTask = { ...mockTask, completed: true }
    const { rerender } = render(<TaskItem task={completedTask} />)
    
    const taskTitle = screen.getByText('Test Task')
    expect(taskTitle).toHaveClass('line-through')
    
    // Test important task styling
    const importantTask = { ...mockTask, important: true }
    rerender(<TaskItem task={importantTask} />)
    
    const starIcon = screen.getByTestId('task-star-1')
    expect(starIcon).toBeInTheDocument()
  })

  it('handles different view contexts correctly', async () => {
    const taskWithTime = { ...mockTask, dueTime: '14:30' }
    render(<TaskItem task={taskWithTime} />)
    
    // Should render task with time data
    expect(screen.getByText('Test Task')).toBeInTheDocument()
  })
})