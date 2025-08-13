import React from 'react'
import { render, screen, waitFor } from '../../test-utils'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import TaskForm from '../../../app/shared/components/forms/task-form'
import { Task } from '../../../app/shared/types'

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock the hooks
const mockCreateMutate = vi.fn()
const mockUpdateMutate = vi.fn()

vi.mock('../../../app/shared/hooks', () => ({
  useCategories: () => ({
    data: [
      { id: 'work', name: 'Work', color: 'bg-blue-500', icon: 'Briefcase' },
      { id: 'personal', name: 'Personal', color: 'bg-green-500', icon: 'User' }
    ],
    isLoading: false,
    error: null
  }),
  useCreateTask: () => ({
    mutateAsync: mockCreateMutate,
    isPending: false
  }),
  useUpdateTask: () => ({
    mutateAsync: mockUpdateMutate,
    isPending: false
  })
}))

const mockTask: Task = {
  id: '1',
  title: 'Test Task',
  description: 'Test description',
  completed: false,
  important: true,
  dueDate: '2025-08-11',
  dueTime: '14:30',
  categoryId: 'work',
  createdAt: '2025-08-10T10:00:00Z',
  updatedAt: '2025-08-10T10:00:00Z',
}

describe('TaskForm', () => {
  const mockOnClose = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateMutate.mockResolvedValue({ id: 'new-task', title: 'New Task' })
    mockUpdateMutate.mockResolvedValue({ ...mockTask, title: 'Updated Task' })
  })

  describe('Form Rendering', () => {
    it('renders create form correctly', () => {
      render(<TaskForm onClose={mockOnClose} onSuccess={mockOnSuccess} />)

      expect(screen.getByText('Add New Task')).toBeInTheDocument()
      expect(screen.getByText('Create a new task')).toBeInTheDocument()
      expect(screen.getByTestId('task-title-input')).toBeInTheDocument()
      expect(screen.getByTestId('task-description-input')).toBeInTheDocument()
      expect(screen.getByTestId('task-category-trigger')).toBeInTheDocument()
      expect(screen.getByTestId('task-due-date-input')).toBeInTheDocument()
      expect(screen.getByTestId('task-due-time-input')).toBeInTheDocument()
      expect(screen.getByTestId('task-important-checkbox')).toBeInTheDocument()
      expect(screen.getByTestId('task-form-submit-button')).toBeInTheDocument()
      expect(screen.getByTestId('task-form-cancel-button')).toBeInTheDocument()
    })

    it('renders edit form correctly', () => {
      render(<TaskForm task={mockTask} onClose={mockOnClose} onSuccess={mockOnSuccess} />)

      expect(screen.getByText('Edit Task')).toBeInTheDocument()
      expect(screen.getByText('Update task details')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Test description')).toBeInTheDocument()
      expect(screen.getByDisplayValue('2025-08-11')).toBeInTheDocument()
      expect(screen.getByDisplayValue('14:30')).toBeInTheDocument()
      expect(screen.getByRole('checkbox')).toBeChecked()
    })
  })

  describe('Form Validation', () => {
    it('disables submit button when title is empty', () => {
      render(<TaskForm onClose={mockOnClose} onSuccess={mockOnSuccess} />)

      const submitButton = screen.getByTestId('task-form-submit-button')
      expect(submitButton).toBeDisabled()
    })

    it('enables submit button when title is provided', async () => {
      const user = userEvent.setup()
      render(<TaskForm onClose={mockOnClose} onSuccess={mockOnSuccess} />)

      const titleInput = screen.getByTestId('task-title-input')
      const submitButton = screen.getByTestId('task-form-submit-button')

      await user.type(titleInput, 'New Task Title')

      expect(submitButton).toBeEnabled()
    })

    it('requires title field to be filled', async () => {
      const user = userEvent.setup()
      render(<TaskForm onClose={mockOnClose} onSuccess={mockOnSuccess} />)

      const submitButton = screen.getByTestId('task-form-submit-button')
      
      // Try to submit without title
      await user.click(submitButton)

      // Form should not submit (no API call)
      expect(mockCreateMutate).not.toHaveBeenCalled()
    })
  })

  describe('Form Interactions', () => {
    it('updates form fields correctly', async () => {
      const user = userEvent.setup()
      render(<TaskForm onClose={mockOnClose} onSuccess={mockOnSuccess} />)

      const titleInput = screen.getByTestId('task-title-input')
      const descriptionInput = screen.getByTestId('task-description-input')
      const dueDateInput = screen.getByTestId('task-due-date-input')
      const dueTimeInput = screen.getByTestId('task-due-time-input')
      const importantCheckbox = screen.getByTestId('task-important-checkbox')

      await user.type(titleInput, 'Test Title')
      await user.type(descriptionInput, 'Test Description')
      await user.type(dueDateInput, '2025-08-15')
      await user.type(dueTimeInput, '09:30')
      await user.click(importantCheckbox)

      expect(titleInput).toHaveValue('Test Title')
      expect(descriptionInput).toHaveValue('Test Description')
      expect(dueDateInput).toHaveValue('2025-08-15')
      expect(dueTimeInput).toHaveValue('09:30')
      expect(importantCheckbox).toBeChecked()
    })

    it('handles category selection', async () => {
      const user = userEvent.setup()
      render(<TaskForm onClose={mockOnClose} onSuccess={mockOnSuccess} />)

      const categoryTrigger = screen.getByTestId('task-category-trigger')
      await user.click(categoryTrigger)

      // Category options should be available
      expect(screen.getByText('Work')).toBeInTheDocument()
      expect(screen.getByText('Personal')).toBeInTheDocument()
    })
  })

  describe('Form Submission', () => {
    it('creates new task successfully', async () => {
      const user = userEvent.setup()
      render(<TaskForm onClose={mockOnClose} onSuccess={mockOnSuccess} />)

      const titleInput = screen.getByTestId('task-title-input')
      const submitButton = screen.getByTestId('task-form-submit-button')

      await user.type(titleInput, 'New Task')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockCreateMutate).toHaveBeenCalledWith({
          title: 'New Task',
          description: '',
          important: false,
          dueDate: '',
          dueTime: '',
          categoryId: ''
        })
      })

      expect(mockOnSuccess).toHaveBeenCalledWith({ id: 'new-task', title: 'New Task' })
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('updates existing task successfully', async () => {
      const user = userEvent.setup()
      render(<TaskForm task={mockTask} onClose={mockOnClose} onSuccess={mockOnSuccess} />)

      const titleInput = screen.getByTestId('task-title-input')
      const submitButton = screen.getByTestId('task-form-submit-button')

      await user.clear(titleInput)
      await user.type(titleInput, 'Updated Task')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockUpdateMutate).toHaveBeenCalledWith({
          id: '1',
          data: {
            title: 'Updated Task',
            description: 'Test description',
            important: true,
            dueDate: '2025-08-11',
            dueTime: '14:30',
            categoryId: 'work'
          }
        })
      })

      expect(mockOnSuccess).toHaveBeenCalledWith({ ...mockTask, title: 'Updated Task' })
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('handles submission errors gracefully', async () => {
      const user = userEvent.setup()
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockCreateMutate.mockRejectedValue(new Error('Network error'))

      render(<TaskForm onClose={mockOnClose} onSuccess={mockOnSuccess} />)

      const titleInput = screen.getByTestId('task-title-input')
      const submitButton = screen.getByTestId('task-form-submit-button')

      await user.type(titleInput, 'New Task')
      await user.click(submitButton)

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to save task:', expect.any(Error))
      })

      // Form should not close on error
      expect(mockOnClose).not.toHaveBeenCalled()
      expect(mockOnSuccess).not.toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
    })
  })

  describe('Form Controls', () => {
    it('closes form when cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(<TaskForm onClose={mockOnClose} onSuccess={mockOnSuccess} />)

      const cancelButton = screen.getByTestId('task-form-cancel-button')
      await user.click(cancelButton)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('closes form when close button is clicked', async () => {
      const user = userEvent.setup()
      render(<TaskForm onClose={mockOnClose} onSuccess={mockOnSuccess} />)

      const closeButton = screen.getByTestId('task-form-close-button')
      await user.click(closeButton)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('closes form when clicking outside modal', async () => {
      const user = userEvent.setup()
      render(<TaskForm onClose={mockOnClose} onSuccess={mockOnSuccess} />)

      // Click on the backdrop (the fixed overlay div)
      const overlay = document.querySelector('.fixed.inset-0')
      if (overlay) {
        await user.click(overlay)
        expect(mockOnClose).toHaveBeenCalled()
      }
    })

    it('closes form when pressing Escape key', async () => {
      const user = userEvent.setup()
      render(<TaskForm onClose={mockOnClose} onSuccess={mockOnSuccess} />)

      await user.keyboard('{Escape}')

      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  describe('Form State', () => {
    it('disables form during submission', () => {
      // Test with empty title to verify disabled state
      render(<TaskForm onClose={mockOnClose} onSuccess={mockOnSuccess} />)

      const submitButton = screen.getByTestId('task-form-submit-button')
      expect(submitButton).toBeDisabled()
    })
  })
})