import { ref } from 'vue'
import { useThemeStore } from '../stores/theme'

export interface TransitionOptions {
  duration?: number
  easing?: string
}

export function useThemeTransition() {
  const themeStore = useThemeStore()
  const isTransitioning = ref(false)

  const calculateClipPath = (
    x: number,
    y: number,
    isExpanding: boolean,
  ): string => {
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    )

    if (isExpanding) {
      return `circle(0% at ${x}px ${y}px)`
    }
    return `circle(${endRadius}px at ${x}px ${y}px)`
  }

  const toggleThemeWithTransition = async (
    event?: MouseEvent,
    options: TransitionOptions = {},
  ): Promise<void> => {
    const { duration = 500, easing = 'ease-in-out' } = options

    if (isTransitioning.value) return

    const newTheme = themeStore.theme === 'dark' ? 'light' : 'dark'

    if (!(document as any).startViewTransition) {
      themeStore.setTheme(newTheme)
      return
    }

    isTransitioning.value = true

    const x = event?.clientX ?? window.innerWidth / 2
    const y = event?.clientY ?? window.innerHeight / 2

    try {
      const transition = (document as any).startViewTransition(() => {
        themeStore.setTheme(newTheme)
      })

      await transition.ready

      const isDark = newTheme === 'dark'

      document.documentElement.animate(
        {
          clipPath: [
            calculateClipPath(x, y, true),
            calculateClipPath(x, y, false),
          ],
        },
        {
          duration,
          easing,
          pseudoElement: isDark
            ? '::view-transition-new(root)'
            : '::view-transition-old(root)',
        },
      )

      await transition.finished
    } catch (error) {
      console.error('Theme transition failed:', error)
      themeStore.setTheme(newTheme)
    } finally {
      isTransitioning.value = false
    }
  }

  const toggleThemeWithCircleReveal = async (
    event?: MouseEvent,
    options: TransitionOptions = {},
  ): Promise<void> => {
    const { duration = 600, easing = 'cubic-bezier(0.4, 0, 0.2, 1)' } = options

    if (isTransitioning.value) return

    const newTheme = themeStore.theme === 'dark' ? 'light' : 'dark'

    if (!(document as any).startViewTransition) {
      themeStore.setTheme(newTheme)
      return
    }

    isTransitioning.value = true

    const x = event?.clientX ?? window.innerWidth / 2
    const y = event?.clientY ?? window.innerHeight / 2

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    )

    try {
      const transition = (document as any).startViewTransition(async () => {
        themeStore.setTheme(newTheme)
      })

      await transition.ready

      const clipPathAnimation = [
        `circle(0% at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ]

      const isDark = newTheme === 'dark'

      document.documentElement.animate(
        {
          clipPath: clipPathAnimation,
        },
        {
          duration,
          easing,
          pseudoElement: isDark
            ? '::view-transition-new(root)'
            : '::view-transition-old(root)',
        },
      )

      await transition.finished
    } catch (error) {
      console.error('Circle reveal transition failed:', error)
      themeStore.setTheme(newTheme)
    } finally {
      isTransitioning.value = false
    }
  }

  const toggleThemeWithDualCircle = async (
    event?: MouseEvent,
    options: TransitionOptions = {},
  ): Promise<void> => {
    const { duration = 600, easing = 'cubic-bezier(0.4, 0, 0.2, 1)' } = options

    if (isTransitioning.value) return

    const currentTheme = themeStore.theme
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
    const isDark = newTheme === 'dark'

    if (!(document as any).startViewTransition) {
      themeStore.setTheme(newTheme)
      return
    }

    isTransitioning.value = true

    const x = event?.clientX ?? window.innerWidth / 2
    const y = event?.clientY ?? window.innerHeight / 2

    const endRadius =
      Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      ) * 1.1

    // 提前添加动画样式类
    const styleId = 'theme-transition-style'
    let styleEl = document.getElementById(styleId)
    if (!styleEl) {
      styleEl = document.createElement('style')
      styleEl.id = styleId
      document.head.appendChild(styleEl)
    }

    // 根据目标主题设置正确的层级和动画
    if (isDark) {
      // 切换到暗色：新视图在上层，从点击处扩散
      styleEl.textContent = `
        ::view-transition-old(root) { z-index: 1; }
        ::view-transition-new(root) { 
          z-index: 9999; 
          clip-path: circle(0% at ${x}px ${y}px);
          animation: circle-expand-dark-${Date.now()} ${duration}ms ${easing} forwards;
        }
        @keyframes circle-expand-dark-${Date.now()} {
          to { clip-path: circle(${endRadius}px at ${x}px ${y}px); }
        }
      `
    } else {
      // 切换到亮色：旧视图在上层，向点击处收缩
      styleEl.textContent = `
        ::view-transition-old(root) { 
          z-index: 9999;
          clip-path: circle(${endRadius}px at ${x}px ${y}px);
          animation: circle-shrink-light-${Date.now()} ${duration}ms ${easing} forwards;
        }
        ::view-transition-new(root) { z-index: 1; }
        @keyframes circle-shrink-light-${Date.now()} {
          to { clip-path: circle(0% at ${x}px ${y}px); }
        }
      `
    }

    try {
      const transition = (document as any).startViewTransition(() => {
        themeStore.setTheme(newTheme)
      })

      await transition.ready
      await transition.finished
    } catch (error) {
      console.error('Dual circle transition failed:', error)
      themeStore.setTheme(newTheme)
    } finally {
      // 清理样式
      if (styleEl) {
        styleEl.remove()
      }
      isTransitioning.value = false
    }
  }

  const isViewTransitionSupported = (): boolean => {
    return 'startViewTransition' in document
  }

  return {
    isTransitioning,
    toggleThemeWithTransition,
    toggleThemeWithCircleReveal,
    toggleThemeWithDualCircle,
    isViewTransitionSupported,
  }
}
