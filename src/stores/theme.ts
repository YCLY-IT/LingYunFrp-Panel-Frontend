import { defineStore } from 'pinia'
import {
  saveBackgroundImage,
  loadBackgroundImage,
  clearBackgroundImage as clearImageStorage,
} from '@/utils/imageUtils'

interface ThemeState {
  theme: string
  primaryColor: string
  isAutoTheme: boolean
  isRGBMode: boolean
  isDialogBoxHairGlass: boolean
  backgroundImage: string
  backgroundBlur: number
  backgroundOpacity: number
  colorBlindMode: boolean
  highContrastMode: boolean
  frostedGlassMode: boolean
  frostedGlassIntensity: number
  backgroundImageLoading: boolean
}

const THEME_KEY = 'app-theme'
const PRIMARY_COLOR_KEY = 'app-primary-color'
const AUTO_THEME_KEY = 'app-auto-theme'
const RGB_MODE_KEY = 'app-rgb-mode'
const DBH_MODE_KEY = 'app-dialog-box-hair-glass'
const BACKGROUND_IMAGE_KEY = 'app-background-image'
const BACKGROUND_BLUR_KEY = 'app-background-blur'
const BACKGROUND_OPACITY_KEY = 'app-background-opacity'
const COLOR_BLIND_MODE_KEY = 'app-color-blind-mode'
const HIGH_CONTRAST_MODE_KEY = 'app-high-contrast-mode'
const FROSTED_GLASS_MODE_KEY = 'app-frosted-glass-mode'
const FROSTED_GLASS_INTENSITY_KEY = 'app-frosted-glass-intensity'

export const useThemeStore = defineStore('theme', {
  state: (): ThemeState => ({
    theme: localStorage.getItem(THEME_KEY) || 'light',
    primaryColor: localStorage.getItem(PRIMARY_COLOR_KEY) || '#2080F0FF',
    isAutoTheme:
      localStorage.getItem(AUTO_THEME_KEY) === 'true' ||
      localStorage.getItem(AUTO_THEME_KEY) === null,
    isRGBMode: localStorage.getItem(RGB_MODE_KEY) === 'true' || false,
    isDialogBoxHairGlass:
      localStorage.getItem(DBH_MODE_KEY) === 'true' || false,
    backgroundImage: '',
    backgroundBlur: Number(localStorage.getItem(BACKGROUND_BLUR_KEY)) || 3,
    backgroundOpacity: (() => {
      const stored = localStorage.getItem(BACKGROUND_OPACITY_KEY)
      const num = stored ? Number(stored) : 100
      return isNaN(num) ? 100 : num
    })(),
    colorBlindMode:
      localStorage.getItem(COLOR_BLIND_MODE_KEY) === 'true' || false,
    highContrastMode:
      localStorage.getItem(HIGH_CONTRAST_MODE_KEY) === 'true' || false,
    frostedGlassMode:
      localStorage.getItem(FROSTED_GLASS_MODE_KEY) === 'true' || false,
    frostedGlassIntensity:
      Number(localStorage.getItem(FROSTED_GLASS_INTENSITY_KEY)) || 15,
    backgroundImageLoading: true,
  }),
  actions: {
    setTheme(theme: string) {
      this.theme = theme
      localStorage.setItem(THEME_KEY, theme)
    },
    setPrimaryColor(color: string) {
      this.primaryColor = color
      localStorage.setItem(PRIMARY_COLOR_KEY, color)
    },
    setAutoTheme(isAuto: boolean) {
      this.isAutoTheme = isAuto
      localStorage.setItem(AUTO_THEME_KEY, isAuto.toString())
    },
    setRGBMode(isRGB: boolean) {
      this.isRGBMode = isRGB
      localStorage.setItem(RGB_MODE_KEY, isRGB.toString())
    },
    setDialogBoxHairGlass(isDBH: boolean) {
      this.isDialogBoxHairGlass = isDBH
      localStorage.setItem(DBH_MODE_KEY, isDBH.toString())
    },
    async setBackgroundImage(imageUrl: string) {
      this.backgroundImage = imageUrl
      if (imageUrl && imageUrl.startsWith('data:')) {
        try {
          await saveBackgroundImage(imageUrl)
        } catch (error) {
          console.error('保存背景图失败:', error)
        }
      } else if (imageUrl) {
        localStorage.setItem(BACKGROUND_IMAGE_KEY, imageUrl)
      } else {
        await clearImageStorage()
        localStorage.removeItem(BACKGROUND_IMAGE_KEY)
      }
    },
    async loadBackgroundImageFromStorage() {
      this.backgroundImageLoading = true
      try {
        const localUrl = localStorage.getItem(BACKGROUND_IMAGE_KEY)
        if (localUrl && !localUrl.startsWith('data:')) {
          this.backgroundImage = localUrl
          this.backgroundImageLoading = false
          return
        }

        const imageData = await loadBackgroundImage()
        if (imageData) {
          this.backgroundImage = imageData
        } else {
          this.backgroundImage = localUrl || ''
        }
      } catch (error) {
        console.error('加载背景图失败:', error)
        this.backgroundImage = localStorage.getItem(BACKGROUND_IMAGE_KEY) || ''
      } finally {
        this.backgroundImageLoading = false
      }
    },
    async clearBackgroundImage() {
      this.backgroundImage = ''
      await clearImageStorage()
      localStorage.removeItem(BACKGROUND_IMAGE_KEY)
    },
    setBackgroundBlur(blur: number) {
      this.backgroundBlur = blur
      localStorage.setItem(BACKGROUND_BLUR_KEY, blur.toString())
    },
    setBackgroundOpacity(opacity: number) {
      this.backgroundOpacity = opacity
      localStorage.setItem(BACKGROUND_OPACITY_KEY, opacity.toString())
    },
    setColorBlindMode(enabled: boolean) {
      this.colorBlindMode = enabled
      localStorage.setItem(COLOR_BLIND_MODE_KEY, enabled.toString())
    },
    setHighContrastMode(enabled: boolean) {
      this.highContrastMode = enabled
      localStorage.setItem(HIGH_CONTRAST_MODE_KEY, enabled.toString())
    },
    setFrostedGlassMode(enabled: boolean) {
      this.frostedGlassMode = enabled
      localStorage.setItem(FROSTED_GLASS_MODE_KEY, enabled.toString())
      if (enabled) {
        this.backgroundOpacity = 100
        localStorage.setItem(BACKGROUND_OPACITY_KEY, '100')
      }
    },
    setFrostedGlassIntensity(intensity: number) {
      this.frostedGlassIntensity = intensity
      localStorage.setItem(FROSTED_GLASS_INTENSITY_KEY, intensity.toString())
    },
  },
})
