import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { formatDate, isTaskOverdue, isTaskDueToday, calculateCompletionPercentage } from '../../../app/shared/lib/utils'
import { Task } from '../../../app/shared/types'

describe('Utils', () => {
  beforeEach(() => {
    // Mock current time to 2025-08-11 12:00:00
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-08-11T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('formatDate', () => {
    it('formats date as "Today" for today', () => {
      const result = formatDate('2025-08-11T10:00:00Z')
      expect(result).toBe('Today')
    })

    it('formats date as "Tomorrow" for tomorrow', () => {
      const result = formatDate('2025-08-12T10:00:00Z')
      expect(result).toBe('Tomorrow')
    })

    it('formats time correctly', () => {
      const result = formatDate('2025-08-11T14:30:00Z', 'time')
      // Time format depends on locale, just check it contains time
      expect(result).toMatch(/\d+:\d+/)
    })

    it('formats short date correctly', () => {
      const result = formatDate('2025-08-15T10:00:00Z', 'short')
      // Date format depends on locale, just check it contains month and day
      expect(result).toMatch(/(Aug|15)/)
    })
  })

  describe('isTaskOverdue', () => {
    const baseTask: Task = {
      id: '1',
      title: 'Test',
      completed: false,
      important: false,
      createdAt: '2025-08-10T10:00:00Z',
      updatedAt: '2025-08-10T10:00:00Z',
    }

    it('returns true for overdue task', () => {
      const overdueTask = {
        ...baseTask,
        dueDate: '2025-08-10',
        dueTime: '10:00'
      }
      expect(isTaskOverdue(overdueTask)).toBe(true)
    })

    it('returns false for future task', () => {
      const futureTask = {
        ...baseTask,
        dueDate: '2025-08-12',
        dueTime: '10:00'
      }
      expect(isTaskOverdue(futureTask)).toBe(false)
    })

    it('returns false for completed task even if overdue', () => {
      const completedTask = {
        ...baseTask,
        completed: true,
        dueDate: '2025-08-10',
        dueTime: '10:00'
      }
      expect(isTaskOverdue(completedTask)).toBe(false)
    })

    it('returns true for overdue task without specific dueTime', () => {
      // Mock current time to 2025-08-11 12:00:00 (already done in beforeEach)
      const overdueTaskNoTime = {
        ...baseTask,
        dueDate: '2025-08-10', // Due yesterday
        dueTime: undefined // No specific time
      }
      expect(isTaskOverdue(overdueTaskNoTime)).toBe(true)
    })

    it('returns false for today task without specific dueTime', () => {
      const todayTaskNoTime = {
        ...baseTask,
        dueDate: '2025-08-11', // Due today
        dueTime: undefined // No specific time - should default to end of day
      }
      expect(isTaskOverdue(todayTaskNoTime)).toBe(false)
    })
  })

  describe('isTaskDueToday', () => {
    const baseTask: Task = {
      id: '1',
      title: 'Test',
      completed: false,
      important: false,
      createdAt: '2025-08-10T10:00:00Z',
      updatedAt: '2025-08-10T10:00:00Z',
    }

    it('returns true for task due today', () => {
      const todayTask = {
        ...baseTask,
        dueDate: '2025-08-11'
      }
      expect(isTaskDueToday(todayTask)).toBe(true)
    })

    it('returns false for task due on different date', () => {
      const otherDayTask = {
        ...baseTask,
        dueDate: '2025-08-12'
      }
      expect(isTaskDueToday(otherDayTask)).toBe(false)
    })
  })

  describe('calculateCompletionPercentage', () => {
    it('calculates percentage correctly', () => {
      expect(calculateCompletionPercentage(3, 10)).toBe(30)
      expect(calculateCompletionPercentage(1, 2)).toBe(50)
      expect(calculateCompletionPercentage(5, 5)).toBe(100)
    })

    it('returns 0 for empty total', () => {
      expect(calculateCompletionPercentage(0, 0)).toBe(0)
    })
  })
})