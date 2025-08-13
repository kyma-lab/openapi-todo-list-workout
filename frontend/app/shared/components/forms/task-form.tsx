'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X, Calendar, Clock, Star } from 'lucide-react'
import { CreateTaskDto, Task } from '../../types'
import { useCategories, useCreateTask, useUpdateTask } from '../../hooks'
import { cn } from '../../lib'

interface TaskFormProps {
  task?: Task // If provided, we're editing
  onClose: () => void
  onSuccess?: (task: Task) => void
}

export default function TaskForm({ task, onClose, onSuccess }: TaskFormProps) {
  const [formData, setFormData] = useState<CreateTaskDto>({
    title: task?.title || '',
    description: task?.description || '',
    important: task?.important || false,
    dueDate: task?.dueDate || '',
    dueTime: task?.dueTime || '',
    categoryId: task?.categoryId || '',
  })

  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useCategories()
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()

  const isEditing = !!task
  const isSubmitting = createTask.isPending || updateTask.isPending

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, isSubmitting])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (isEditing) {
        const updatedTask = await updateTask.mutateAsync({ 
          id: task.id, 
          data: formData 
        })
        onSuccess?.(updatedTask)
      } else {
        const newTask = await createTask.mutateAsync(formData)
        onSuccess?.(newTask)
      }
      onClose()
    } catch (error) {
      console.error('Failed to save task:', error)
    }
  }

  const handleInputChange = (field: keyof CreateTaskDto, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div 
      className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose()
        }
      }}
    >
      <div 
        className="bg-background rounded-lg shadow-xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex flex-row items-center justify-between mb-6 pb-4 border-b border-border">
            <div>
              <h1 className="text-2xl font-bold text-primary-dark">
                {isEditing ? 'Edit Task' : 'Add New Task'}
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                {isEditing ? 'Update task details' : 'Create a new task'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              disabled={isSubmitting}
              className="shrink-0"
              data-testid="task-form-close-button"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Form Container */}
          <div className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Task Title */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  Title <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="e.g., Finalize Q4 report"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="text-base"
                  data-testid="task-title-input"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  Description (Optional)
                </label>
                <Textarea
                  placeholder="Add more details about the task..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  disabled={isSubmitting}
                  rows={2}
                  className="resize-none"
                  data-testid="task-description-input"
                />
              </div>

              {/* Category Selection */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  Category
                </label>
                <Select 
                  value={formData.categoryId} 
                  onValueChange={(value) => handleInputChange('categoryId', value)}
                  disabled={isSubmitting || categoriesLoading}
                  data-testid="task-category-select"
                >
                  <SelectTrigger data-testid="task-category-trigger">
                    <SelectValue placeholder={
                      categoriesLoading ? "Loading categories..." : 
                      categoriesError ? "Error loading" :
                      "Select category"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesLoading ? (
                      <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                    ) : categoriesError ? (
                      <SelectItem value="error" disabled>Error loading</SelectItem>
                    ) : categories.length === 0 ? (
                      <SelectItem value="empty" disabled>No categories available</SelectItem>
                    ) : (
                      categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Due Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Due Date
                  </label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                    disabled={isSubmitting}
                    data-testid="task-due-date-input"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Time
                  </label>
                  <Input
                    type="time"
                    value={formData.dueTime}
                    onChange={(e) => handleInputChange('dueTime', e.target.value)}
                    disabled={isSubmitting}
                    data-testid="task-due-time-input"
                  />
                </div>
              </div>

              {/* Important Toggle */}
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="important"
                  checked={formData.important}
                  onCheckedChange={(checked) => handleInputChange('important', !!checked)}
                  disabled={isSubmitting}
                  data-testid="task-important-checkbox"
                />
                <label htmlFor="important" className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Star className={cn(
                    'h-4 w-4',
                    formData.important ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'
                  )} />
                  Mark as important
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                  data-testid="task-form-cancel-button"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.title.trim()}
                  className="min-w-24"
                  data-testid="task-form-submit-button"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </div>
                  ) : (
                    isEditing ? 'Update' : 'Save'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}