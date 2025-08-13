'use client'

import { Button } from '@/components/ui/button'
import { useAppStore } from '../../shared/stores'
import { CheckCircle2, Clock, FileText, Headphones, StickyNote } from 'lucide-react'

export default function WelcomePage() {
  const setCurrentView = useAppStore((state) => state.setCurrentView)

  const handleGetStarted = () => {
    setCurrentView('my-day')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-main-gradient">
      <div className="w-full max-w-md mx-auto text-center space-y-8">
        {/* Application Name */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-primary-dark">Tasks</h1>
        </div>

        {/* Hero Illustration */}
        <div className="relative mx-auto w-64 h-64 flex items-center justify-center">
          {/* Character with productivity elements */}
          <div className="relative">
            {/* Main character circle */}
            <div className="w-32 h-32 bg-primary rounded-full flex items-center justify-center shadow-lg">
              <div className="w-24 h-24 bg-primary-light rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-primary-dark" />
              </div>
            </div>

            {/* Floating productivity elements */}
            <div className="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow-md animate-bounce">
              <Headphones className="w-6 h-6 text-primary" />
            </div>
            
            <div className="absolute -bottom-4 -left-4 bg-white rounded-full p-2 shadow-md animate-bounce animation-delay-150">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            
            <div className="absolute -top-2 -left-8 bg-white rounded-full p-2 shadow-md animate-bounce animation-delay-300">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            
            <div className="absolute -bottom-2 -right-8 bg-white rounded-full p-2 shadow-md animate-bounce animation-delay-500">
              <StickyNote className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        {/* Welcome Text Block */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-primary-dark">Welcome to Tasks</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Tasks will help you to stay organized and perform your tasks much faster.
          </p>
        </div>

        {/* Primary Call-to-Action */}
        <div className="pt-4">
          <Button
            onClick={handleGetStarted}
            className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            data-testid="get-started-button"
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  )
}

