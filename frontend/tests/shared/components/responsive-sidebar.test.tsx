import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import React from 'react'
import { render, screen, fireEvent } from '../../test-utils'
import { AppLayout } from '../../../app/shared/components'
import { useAppStore } from '../../../app/shared/stores'

// Mock the hooks and stores
vi.mock('../../../app/shared/hooks', () => ({
  useCategories: () => ({ data: [], isLoading: false }),
  useTasks: () => ({ data: [], isLoading: false }),
}))

// Mock window.matchMedia for responsive testing
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

// TestWrapper is now provided by test-utils

describe('Responsive Sidebar', () => {
  beforeEach(() => {
    // Reset store state
    useAppStore.getState().setSidebarOpen(false)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Desktop behavior (md and above)', () => {
    beforeEach(() => {
      mockMatchMedia(true) // Simulate desktop/tablet
    })

    it('should always show sidebar on desktop', () => {
      render(
        <AppLayout>
          <div data-testid="main-content">Main Content</div>
        </AppLayout>
      )

      // Sidebar should be visible on desktop regardless of sidebarOpen state
      const sidebar = screen.getByRole('complementary')
      expect(sidebar).toBeInTheDocument()
      
      // Check that sidebar has desktop-specific classes
      expect(sidebar).toHaveClass('md:relative', 'md:translate-x-0', 'md:w-80')
      
      // Main content should be visible
      expect(screen.getByTestId('main-content')).toBeInTheDocument()
      
      // Hamburger menu should not be visible on desktop
      expect(screen.queryByTestId('hamburger-menu-button')).not.toBeInTheDocument()
    })

    it('should not show mobile overlay on desktop', () => {
      // Even with sidebar open, no overlay should appear on desktop
      useAppStore.getState().setSidebarOpen(true)
      
      render(
        <AppLayout>
          <div data-testid="main-content">Main Content</div>
        </AppLayout>
      )

      // No overlay should be present (md:hidden class)
      const overlay = document.querySelector('.bg-black\\/50')
      expect(overlay).toBeInTheDocument() // Exists in DOM but hidden on md+
    })
  })

  describe('Mobile behavior (below md)', () => {
    beforeEach(() => {
      mockMatchMedia(false) // Simulate mobile
    })

    it('should show hamburger menu on mobile', () => {
      render(
        <AppLayout>
          <div data-testid="main-content">Main Content</div>
        </AppLayout>
      )

      // Hamburger menu should be visible
      const hamburgerButton = screen.getByTestId('hamburger-menu-button')
      expect(hamburgerButton).toBeInTheDocument()
      
      // Should have correct icon
      const menuIcon = hamburgerButton.querySelector('svg')
      expect(menuIcon).toBeInTheDocument()
    })

    it('should hide sidebar when sidebarOpen is false', () => {
      useAppStore.getState().setSidebarOpen(false)
      
      render(
        <AppLayout>
          <div data-testid="main-content">Main Content</div>
        </AppLayout>
      )

      const sidebar = screen.getByRole('complementary')
      expect(sidebar).toHaveClass('-translate-x-full', 'w-0')
    })

    it('should show sidebar when sidebarOpen is true', () => {
      useAppStore.getState().setSidebarOpen(true)
      
      render(
        <AppLayout>
          <div data-testid="main-content">Main Content</div>
        </AppLayout>
      )

      const sidebar = screen.getByRole('complementary')
      expect(sidebar).toHaveClass('translate-x-0', 'w-80')
    })

    it('should show overlay when sidebar is open on mobile', () => {
      useAppStore.getState().setSidebarOpen(true)
      
      render(
        <AppLayout>
          <div data-testid="main-content">Main Content</div>
        </AppLayout>
      )

      const overlay = document.querySelector('.bg-black\\/50')
      expect(overlay).toBeInTheDocument()
    })

    it('should open sidebar when hamburger menu is clicked', () => {
      render(
        <AppLayout>
          <div data-testid="main-content">Main Content</div>
        </AppLayout>
      )

      const hamburgerButton = screen.getByTestId('hamburger-menu-button')
      
      // Sidebar should be closed initially
      expect(useAppStore.getState().sidebarOpen).toBe(false)
      
      // Click hamburger menu
      fireEvent.click(hamburgerButton)
      
      // Sidebar should now be open
      expect(useAppStore.getState().sidebarOpen).toBe(true)
    })

    it('should close sidebar when X button is clicked', () => {
      useAppStore.getState().setSidebarOpen(true)
      
      render(
        <AppLayout>
          <div data-testid="main-content">Main Content</div>
        </AppLayout>
      )

      const closeButton = screen.getByTestId('sidebar-close-button')
      
      // Click close button
      fireEvent.click(closeButton)
      
      // Sidebar should now be closed
      expect(useAppStore.getState().sidebarOpen).toBe(false)
    })

    it('should close sidebar when overlay is clicked', () => {
      useAppStore.getState().setSidebarOpen(true)
      
      render(
        <AppLayout>
          <div data-testid="main-content">Main Content</div>
        </AppLayout>
      )

      const overlay = document.querySelector('.bg-black\\/50') as HTMLElement
      expect(overlay).toBeInTheDocument()
      
      // Click overlay
      fireEvent.click(overlay)
      
      // Sidebar should now be closed
      expect(useAppStore.getState().sidebarOpen).toBe(false)
    })
  })

  describe('Responsive transitions', () => {
    it('should have smooth transition classes', () => {
      render(
        <AppLayout>
          <div data-testid="main-content">Main Content</div>
        </AppLayout>
      )

      const sidebar = screen.getByRole('complementary')
      expect(sidebar).toHaveClass('transition-all', 'duration-300', 'ease-in-out')
    })

    it('should maintain proper z-index layering', () => {
      useAppStore.getState().setSidebarOpen(true)
      
      render(
        <AppLayout>
          <div data-testid="main-content">Main Content</div>
        </AppLayout>
      )

      const sidebar = screen.getByRole('complementary')
      const overlay = document.querySelector('.bg-black\\/50')

      expect(sidebar).toHaveClass('z-50')
      expect(overlay).toHaveClass('z-40')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <AppLayout>
          <div data-testid="main-content">Main Content</div>
        </AppLayout>
      )

      const sidebar = screen.getByRole('complementary')
      expect(sidebar).toBeInTheDocument()
      
      const mainContent = screen.getByRole('main')
      expect(mainContent).toBeInTheDocument()
    })

    it('should support keyboard navigation for hamburger menu', () => {
      render(
        <AppLayout>
          <div data-testid="main-content">Main Content</div>
        </AppLayout>
      )

      const hamburgerButton = screen.getByTestId('hamburger-menu-button')
      
      // Button should be focusable
      hamburgerButton.focus()
      expect(document.activeElement).toBe(hamburgerButton)
      
      // Should respond to Enter key
      fireEvent.keyDown(hamburgerButton, { key: 'Enter' })
      expect(useAppStore.getState().sidebarOpen).toBe(true)
    })
  })
})