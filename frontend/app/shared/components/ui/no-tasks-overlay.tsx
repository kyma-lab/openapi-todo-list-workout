'use client'

import { ReactNode } from 'react'

interface NoTasksOverlayProps {
  show: boolean
  message?: string
  icon?: ReactNode
  children?: ReactNode
}

export default function NoTasksOverlay({
  show,
  message = 'Keine Aufgaben gefunden',
  icon,
  children
}: NoTasksOverlayProps) {
  if (!show) return null

  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
      <div className="bg-card p-8 rounded-lg shadow-lg border border-border max-w-sm mx-4 text-center">
        {icon && (
          <div className="flex justify-center mb-4">
            {icon}
          </div>
        )}
        <p className="text-muted-foreground text-lg mb-4">{message}</p>
        {children}
      </div>
    </div>
  )
}