'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../lib'

interface DateSelectorProps {
  selectedDate: string
  onDateChange: (date: string) => void
}

export default function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
  const [startDate, setStartDate] = useState(() => {
    // Start with today as the middle date
    const today = new Date()
    today.setDate(today.getDate() - 2) // Go back 2 days to show today in the middle
    return today
  })

  // Generate 5 consecutive days starting from startDate
  const generateDates = (start: Date) => {
    const dates = []
    for (let i = 0; i < 5; i++) {
      const date = new Date(start)
      date.setDate(start.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  const dates = generateDates(startDate)

  const goToPrevious = () => {
    const newStart = new Date(startDate)
    newStart.setDate(startDate.getDate() - 5)
    setStartDate(newStart)
  }

  const goToNext = () => {
    const newStart = new Date(startDate)
    newStart.setDate(startDate.getDate() + 5)
    setStartDate(newStart)
  }

  const formatDate = (date: Date) => ({
    dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
    dayNumber: date.getDate().toString(),
    monthName: date.toLocaleDateString('en-US', { month: 'short' }),
    fullDate: date.toISOString().split('T')[0]
  })

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (dateString: string) => {
    return selectedDate === dateString
  }

  return (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-2 bg-card rounded-xl p-2 shadow-sm border border-border">
        {/* Previous button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPrevious}
          className="h-8 w-8 hover:bg-accent"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Date buttons */}
        <div className="flex space-x-1">
          {dates.map((date) => {
            const { dayName, dayNumber, monthName, fullDate } = formatDate(date)
            const selected = isSelected(fullDate)
            const today = isToday(date)

            return (
              <Button
                key={fullDate}
                variant={selected ? 'default' : 'ghost'}
                onClick={() => onDateChange(fullDate)}
                className={cn(
                  'flex flex-col h-16 w-14 p-2 rounded-lg transition-all duration-200',
                  selected
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'hover:bg-accent hover:text-accent-foreground',
                  today && !selected && 'ring-2 ring-primary ring-opacity-50'
                )}
              >
                <span className="text-xs font-medium opacity-80">
                  {dayName}
                </span>
                <span className="text-lg font-bold">
                  {dayNumber}
                </span>
                <span className="text-xs opacity-70">
                  {monthName}
                </span>
              </Button>
            )
          })}
        </div>

        {/* Next button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={goToNext}
          className="h-8 w-8 hover:bg-accent"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}