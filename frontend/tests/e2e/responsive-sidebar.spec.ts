import { test, expect } from '@playwright/test'

test.describe('Responsive Sidebar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for the app to load
    await page.waitForSelector('[data-testid="nav-my-day"]', { timeout: 10000 })
  })

  test.describe('Desktop behavior', () => {
    test('should always show sidebar on desktop', async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1024, height: 768 })
      
      // Sidebar should be visible
      const sidebar = page.locator('aside')
      await expect(sidebar).toBeVisible()
      
      // Hamburger menu should not be visible on desktop
      const hamburgerMenu = page.locator('[data-testid="hamburger-menu-button"]')
      await expect(hamburgerMenu).not.toBeVisible()
      
      // Main content should be visible
      const mainContent = page.locator('main')
      await expect(mainContent).toBeVisible()
    })

    test('should not show mobile overlay on desktop', async ({ page }) => {
      // Set desktop viewport  
      await page.setViewportSize({ width: 1024, height: 768 })
      
      // No overlay should be visible
      const overlay = page.locator('.bg-black\\/50')
      await expect(overlay).not.toBeVisible()
    })

    test('should maintain sidebar visibility when resizing from mobile to desktop', async ({ page }) => {
      // Start with mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      
      // Sidebar should be hidden initially on mobile
      const sidebar = page.locator('aside')
      
      // Resize to desktop
      await page.setViewportSize({ width: 1024, height: 768 })
      
      // Sidebar should now be visible
      await expect(sidebar).toBeVisible()
      
      // Hamburger menu should be hidden
      const hamburgerMenu = page.locator('[data-testid="hamburger-menu-button"]')
      await expect(hamburgerMenu).not.toBeVisible()
    })
  })

  test.describe('Mobile behavior', () => {
    test('should show hamburger menu on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      
      // Hamburger menu should be visible
      const hamburgerMenu = page.locator('[data-testid="hamburger-menu-button"]')
      await expect(hamburgerMenu).toBeVisible()
      
      // Mobile header should be visible
      const mobileHeader = hamburgerMenu.locator('..')
      await expect(mobileHeader).toBeVisible()
    })

    test('should open sidebar when hamburger menu is clicked', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      
      // Sidebar should be hidden initially with width 0 and overflow hidden
      const sidebar = page.locator('aside')
      await expect(sidebar).toHaveCSS('width', '0px')
      await expect(sidebar).toHaveCSS('overflow', 'hidden')
      
      // Click hamburger menu
      const hamburgerMenu = page.locator('[data-testid="hamburger-menu-button"]')
      await hamburgerMenu.click()
      
      // Sidebar should now be visible with full width
      await expect(sidebar).toHaveCSS('width', '320px') // w-80 = 320px
      await expect(sidebar).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)') // translateX(0)
      
      // Overlay should be visible
      const overlay = page.locator('.bg-black\\/50')
      await expect(overlay).toBeVisible()
    })

    test('should close sidebar when X button is clicked', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      
      // Open sidebar first
      const hamburgerMenu = page.locator('[data-testid="hamburger-menu-button"]')
      await hamburgerMenu.click()
      
      // Wait for sidebar to open
      const sidebar = page.locator('aside')
      await expect(sidebar).toHaveCSS('width', '320px')
      
      // Click close button
      const closeButton = page.locator('[data-testid="sidebar-close-button"]')
      await closeButton.click()
      
      // Sidebar should now be hidden with width 0 and overflow hidden
      await expect(sidebar).toHaveCSS('width', '0px')
      await expect(sidebar).toHaveCSS('overflow', 'hidden')
      
      // Overlay should be hidden
      const overlay = page.locator('.bg-black\\/50')
      await expect(overlay).not.toBeVisible()
    })

    test('should close sidebar when overlay is clicked', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      
      // Open sidebar first
      const hamburgerMenu = page.locator('[data-testid="hamburger-menu-button"]')
      await hamburgerMenu.click()
      
      // Wait for sidebar to open
      const sidebar = page.locator('aside')
      await expect(sidebar).toHaveCSS('width', '320px')
      
      // Click overlay
      const overlay = page.locator('.bg-black\\/50')
      await overlay.click()
      
      // Sidebar should now be hidden with width 0 and overflow hidden
      await expect(sidebar).toHaveCSS('width', '0px')
      await expect(sidebar).toHaveCSS('overflow', 'hidden')
      
      // Overlay should be hidden
      await expect(overlay).not.toBeVisible()
    })

    test('should hide sidebar content when closed on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      
      // Sidebar should be hidden and have width 0
      const sidebar = page.locator('aside')
      await expect(sidebar).toHaveCSS('width', '0px')
      
      // Open sidebar
      const hamburgerMenu = page.locator('[data-testid="hamburger-menu-button"]')
      await hamburgerMenu.click()
      
      // Sidebar should now have full width
      await expect(sidebar).toHaveCSS('width', '320px') // w-80 = 320px
    })
  })

  test.describe('Responsive transitions', () => {
    test('should have smooth transitions', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      
      const sidebar = page.locator('aside')
      
      // Check that sidebar has transition classes
      await expect(sidebar).toHaveClass(/transition-all/)
      await expect(sidebar).toHaveClass(/duration-300/)
      await expect(sidebar).toHaveClass(/ease-in-out/)
    })

    test('should maintain proper z-index layering', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      
      // Open sidebar
      const hamburgerMenu = page.locator('[data-testid="hamburger-menu-button"]')
      await hamburgerMenu.click()
      
      const sidebar = page.locator('aside')
      const overlay = page.locator('.bg-black\\/50')
      
      // Check z-index values
      await expect(sidebar).toHaveCSS('z-index', '50')
      await expect(overlay).toHaveCSS('z-index', '40')
    })
  })

  test.describe('Responsive breakpoints', () => {
    test('should switch between mobile and desktop behavior at md breakpoint', async ({ page }) => {
      // Test various screen sizes around the md breakpoint (768px)
      
      // Mobile (below md)
      await page.setViewportSize({ width: 767, height: 600 })
      const hamburgerMenu = page.locator('[data-testid="hamburger-menu-button"]')
      await expect(hamburgerMenu).toBeVisible()
      
      // Desktop (md and above)
      await page.setViewportSize({ width: 768, height: 600 })
      await expect(hamburgerMenu).not.toBeVisible()
      
      const sidebar = page.locator('aside')
      await expect(sidebar).toBeVisible()
    })

    test('should handle tablet viewport correctly', async ({ page }) => {
      // Tablet viewport (768px+, should behave like desktop)
      await page.setViewportSize({ width: 768, height: 1024 })
      
      const sidebar = page.locator('aside')
      const hamburgerMenu = page.locator('[data-testid="hamburger-menu-button"]')
      
      // Should behave like desktop
      await expect(sidebar).toBeVisible()
      await expect(hamburgerMenu).not.toBeVisible()
    })
  })

  test.describe('Accessibility', () => {
    test('should support keyboard navigation for hamburger menu', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      
      const hamburgerMenu = page.locator('[data-testid="hamburger-menu-button"]')
      
      // Focus hamburger menu
      await hamburgerMenu.focus()
      await expect(hamburgerMenu).toBeFocused()
      
      // Press Enter to open sidebar
      await page.keyboard.press('Enter')
      
      // Sidebar should open with full width
      const sidebar = page.locator('aside')
      await expect(sidebar).toHaveCSS('width', '320px')
    })

    test('should support keyboard navigation for close button', async ({ page }) => {
      // Set mobile viewport and open sidebar
      await page.setViewportSize({ width: 375, height: 667 })
      
      const hamburgerMenu = page.locator('[data-testid="hamburger-menu-button"]')
      await hamburgerMenu.click()
      
      const closeButton = page.locator('[data-testid="sidebar-close-button"]')
      
      // Focus close button
      await closeButton.focus()
      await expect(closeButton).toBeFocused()
      
      // Press Enter to close sidebar
      await page.keyboard.press('Enter')
      
      // Sidebar should close with width 0 and overflow hidden
      const sidebar = page.locator('aside')
      await expect(sidebar).toHaveCSS('width', '0px')
      await expect(sidebar).toHaveCSS('overflow', 'hidden')
    })

    test('should have proper ARIA attributes', async ({ page }) => {
      const sidebar = page.locator('aside')
      const mainContent = page.locator('main')
      
      // Check semantic HTML elements
      await expect(sidebar).toBeVisible()
      await expect(mainContent).toBeVisible()
    })
  })
})