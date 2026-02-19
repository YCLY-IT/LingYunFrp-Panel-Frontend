<template>
  <NConfigProvider :theme="theme" :theme-overrides="themeOverrides">
    <NDialogProvider>
      <NMessageProvider>
        <NNotificationProvider>
          <NLoadingBarProvider>
            <GlobalEggs />
            <AppContent />
          </NLoadingBarProvider>
        </NNotificationProvider>
      </NMessageProvider>
    </NDialogProvider>
  </NConfigProvider>
  <svg class="defs-only" aria-hidden="true">
    <defs>
      <filter id="colorblind" color-interpolation-filters="sRGB">
        <feColorMatrix
          type="matrix"
          values="0.567 0.433 0 0 0 0.558 0.442 0 0 0 0 0.242 0.758 0 0 0 0 0 1 0"
        />
      </filter>
    </defs>
  </svg>
</template>

<script setup lang="ts">
import { ref, computed, provide, onMounted, onUnmounted, watch } from 'vue'
import {
  NConfigProvider,
  NMessageProvider,
  NDialogProvider,
  NNotificationProvider,
  NLoadingBarProvider,
  darkTheme,
  lightTheme,
} from 'naive-ui'
import AppContent from './components/AppContent.vue'
import GlobalEggs from './components/GlobalEggs.vue'
import { useThemeStore } from './stores/theme'

const theme = computed(() =>
  themeStore.theme === 'dark' ? darkTheme : lightTheme,
)

// 主题切换函数
const toggleTheme = () => {
  themeStore.theme = themeStore.theme === 'dark' ? 'light' : 'dark'
}

const themeStore = useThemeStore()

const themeOverrides = computed(() => {
  const commonColors = {
    primaryColor: themeStore.primaryColor,
    primaryColorHover: themeStore.primaryColor,
    primaryColorPressed: themeStore.primaryColor,
    primaryColorSuppl: themeStore.primaryColor,
    colorHover:
      themeStore.theme === 'dark'
        ? 'rgb(255, 255, 240)'
        : 'rgba(0, 0, 0, 0.06)',
  }

  // 如果有背景图，则让背景色透明，否则使用默认背景色
  const hasBackgroundImage = !!themeStore.backgroundImage
  const bodyColor = hasBackgroundImage
    ? 'transparent'
    : themeStore.theme === 'light'
      ? '#f5f5f5'
      : undefined

  const lightThemeOverrides =
    themeStore.theme === 'light'
      ? {
          bodyColor: bodyColor || '#f5f5f5', // 更改亮色主题下的背景颜色
        }
      : {}

  return {
    common: {
      ...commonColors,
      ...lightThemeOverrides,
      // 如果有背景图，强制设置 bodyColor 为透明
      ...(hasBackgroundImage ? { bodyColor: 'transparent' } : {}),
    },
    Button: {
      // 调整Primary按钮，让它看起来更合适
      textColorPrimary: '#fff',
      textColorHoverPrimary: '#fff',
      textColorPressedPrimary: '#fff',
      textColorFocusPrimary: '#fff',
      textColorDisabledPrimary: '#fff',
      colorPrimary: themeStore.primaryColor,
      colorHoverPrimary: themeStore.primaryColor,
      colorPressedPrimary: themeStore.primaryColor,
      colorFocusPrimary: themeStore.primaryColor,
      colorDisabledPrimary: themeStore.primaryColor,
    },
  }
})

let animationFrameId: number | null = null
let isRGBRunning = false

const animatePrimaryColor = () => {
  if (isRGBRunning) return
  isRGBRunning = true

  let r = 255,
    g = 0,
    b = 0
  let dr = -5,
    dg = 5,
    db = 0

  const step = () => {
    if (!themeStore.isRGBMode) {
      isRGBRunning = false
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
        animationFrameId = null
      }
      return
    }
    if (r <= 0 && g >= 255) {
      dr = 0
      dg = -5
      db = 5
    }
    if (g <= 0 && b >= 255) {
      dr = 5
      dg = 0
      db = -5
    }
    if (b <= 0 && r >= 255) {
      dr = -5
      dg = 5
      db = 0
    }
    r += dr
    g += dg
    b += db

    themeStore.primaryColor = `rgb(${r}, ${g}, ${b})`
    animationFrameId = requestAnimationFrame(step)
  }

  step()
}

watch(
  () => themeStore.isRGBMode,
  (newVal) => {
    if (newVal) {
      animatePrimaryColor()
    } else {
      // 完全停止RGB动画
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
        animationFrameId = null
      }
      isRGBRunning = false

      // 重置主色调为默认值
      const defaultColor =
        localStorage.getItem('app-primary-color') || '#722ed1'
      themeStore.setPrimaryColor(defaultColor)
    }
  },
)

// 监听背景图变化，更新主题覆盖
watch(
  () => themeStore.backgroundImage,
  (newImage) => {
    if (newImage) {
      const opacity = Math.max(20, themeStore.backgroundOpacity || 100)
      document.documentElement.style.setProperty(
        '--background-image',
        `url(${newImage})`,
      )
      document.documentElement.style.setProperty(
        '--background-blur',
        `${themeStore.backgroundBlur}px`,
      )
      document.documentElement.style.setProperty(
        '--background-opacity',
        `${opacity / 100}`,
      )
      if (themeStore.frostedGlassMode) {
        document.documentElement.classList.add('frosted-glass-mode')
        document.documentElement.style.setProperty(
          '--frosted-glass-blur',
          `${themeStore.frostedGlassIntensity}px`,
        )
      }
    } else {
      document.documentElement.style.removeProperty('--background-image')
      document.documentElement.style.removeProperty('--background-blur')
      document.documentElement.style.removeProperty('--background-opacity')
      document.documentElement.classList.remove('frosted-glass-mode')
    }
  },
  { immediate: true },
)

// 触屏识别
const isTouchDevice = ref(false)

provide('isTouchDevice', isTouchDevice)

const detectInputMethod = (event: PointerEvent) => {
  if (event.pointerType === 'touch') {
    isTouchDevice.value = true
  } else if (event.pointerType === 'mouse') {
    isTouchDevice.value = false
  }
}

onMounted(async () => {
  // 先加载背景图（watch 会自动应用样式）
  await themeStore.loadBackgroundImageFromStorage()

  if (themeStore.isRGBMode) {
    animatePrimaryColor()
  }
  // 初始化模糊效果
  if (themeStore.isDialogBoxHairGlass) {
    document.documentElement.style.setProperty('--modal-filter', '10px')
  } else {
    document.documentElement.style.setProperty('--modal-filter', '0px')
  }
  // 初始化无障碍模式
  if (themeStore.colorBlindMode) {
    document.documentElement.classList.add('color-blind-mode')
    document.documentElement.style.setProperty(
      '--color-blind-filter',
      'url(#colorblind)',
    )
  }
  if (themeStore.highContrastMode) {
    document.documentElement.classList.add('high-contrast-mode')
  }
  // 设置自定义 hover 颜色变量
  const updateHoverColor = () => {
    const hoverColor =
      themeStore.theme === 'dark'
        ? 'rgba(255, 255, 255, 0.08)'
        : 'rgba(0, 0, 0, 0.06)'
    document.documentElement.style.setProperty('--n-color-hover', hoverColor)
  }
  updateHoverColor()

  // 监听主题变化，更新 hover 颜色
  watch(() => themeStore.theme, updateHoverColor)

  // 设置悬浮阴影颜色变量（使用主题色）
  const updateHoverShadowColor = () => {
    const primaryColor = themeStore.primaryColor.replace('FF', '') // 移除透明度
    document.documentElement.style.setProperty(
      '--n-color-hover-shadow',
      `${primaryColor}1F`,
    ) // 12% 透明度
  }
  updateHoverShadowColor()

  // 监听主题色变化，更新阴影颜色
  watch(() => themeStore.primaryColor, updateHoverShadowColor)

  // 更新目前的指针方式
  window.addEventListener('pointerdown', detectInputMethod)
})

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
  // 移除指针事件监听器
  window.removeEventListener('pointerdown', detectInputMethod)
})
// 提供给全局使用
provide('theme', {
  theme,
  toggleTheme,
})
</script>

<style lang="scss">
@use './assets/styles/transitions.scss';
input,
textarea,
select {
  font-size: 16px !important;
}

@media screen and (max-width: 768px) {
  input,
  textarea,
  select {
    font-size: 16px !important;
  }
}
</style>

<style lang="scss">
@use './assets/styles/index.scss';
body {
  margin: 0;
  padding: 0;
}

#app {
  font-family: 'Lato', 'Fira Code', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 确保SVG滤镜不占用空间 */
.defs-only {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
  pointer-events: none;
}
</style>
