<!--
  Copyright (c) 2025, TechCat-Team
  本部分代码来源于：https://github.com/TechCat-Team/ChmlFrp-Panel-v3/blob/main/src/components/Layout/ThemeSwitcher.vue
  遵循 Apache 2.0 许可证
  修改者：eefen
  修改时间：2025-12-05
-->

<template>
  <div class="theme-switcher">
    <n-scrollbar
      class="container-scrollbar"
      :vertical-rail-style="{ right: '-15px' }"
    >
      <div class="container">
        <!-- 主题设置卡片 -->
        <n-card class="setting-card" size="small">
          <template #header>
            <div class="card-header">
              <n-icon :component="ColorPaletteOutline" :size="20" />
              <span>主题设置</span>
            </div>
          </template>
          <div class="setting-content">
            <div class="setting-item">
              <div class="setting-label">
                <n-icon :component="SyncOutline" :size="18" />
                <span>自动切换主题</span>
              </div>
              <n-switch
                size="large"
                v-model:value="isAutoTheme"
                @click="changeTheme"
                :checked-value="true"
                :unchecked-value="false"
              >
                <template #checked>自动切换</template>
                <template #unchecked>手动切换</template>
              </n-switch>
            </div>
            <div class="setting-item" v-if="!isAutoTheme">
              <div class="setting-label">
                <n-icon
                  :component="isDarkTheme ? Sparkles : Sunny"
                  :size="18"
                />
                <span>主题模式</span>
              </div>
              <n-switch
                size="large"
                v-model:value="isDarkTheme"
                :rail-style="railStyle"
                :checked-value="true"
                :unchecked-value="false"
                @click="changeTheme"
                :loading="isTransitioning"
              >
                <template #checked-icon>
                  <n-icon :component="Sparkles" color="#9f9f9c" />
                </template>
                <template #unchecked-icon>
                  <n-icon :component="Sunny" color="#E6A23C" />
                </template>
                <template #checked>月映万川</template>
                <template #unchecked>日照千里</template>
              </n-switch>
            </div>
          </div>
        </n-card>

        <!-- 主题色设置卡片 -->
        <n-card class="setting-card" size="small">
          <template #header>
            <div class="card-header">
              <n-icon :component="BrushOutline" :size="20" />
              <span>主题色</span>
            </div>
          </template>
          <div class="setting-content">
            <div class="color-picker-wrapper">
              <n-color-picker
                v-model:value="primaryColor"
                :show-preview="true"
                :modes="['hex']"
                size="large"
              />
            </div>
            <div class="preset-colors">
              <div
                v-for="color in presetColors"
                :key="color"
                :style="{ backgroundColor: color }"
                class="preset-color"
                :class="{ active: primaryColor === color }"
                @click="setPresetColor(color)"
              >
                <n-icon
                  v-if="primaryColor === color"
                  :component="CheckmarkCircleOutline"
                  :size="16"
                  color="#fff"
                />
              </div>
            </div>
          </div>
        </n-card>

        <!-- 视觉效果设置卡片 -->
        <n-card class="setting-card" size="small">
          <template #header>
            <div class="card-header">
              <n-icon :component="EyeOutline" :size="20" />
              <span>视觉效果</span>
            </div>
          </template>
          <div class="setting-content">
            <div class="setting-item">
              <div class="setting-label">
                <n-icon :component="ColorFilterOutline" :size="18" />
                <span>RGB模式</span>
              </div>
              <n-switch
                size="large"
                v-model:value="isRGBMode"
                :checked-value="true"
                :unchecked-value="false"
              />
            </div>
            <div class="setting-item">
              <div class="setting-label">
                <n-icon :component="LayersOutline" :size="18" />
                <span>对话框模糊</span>
              </div>
              <n-switch
                size="large"
                v-model:value="isDialogBoxHairGlass"
                :checked-value="true"
                :unchecked-value="false"
              />
            </div>
          </div>
        </n-card>

        <!-- 无障碍设置卡片 -->
        <n-card class="setting-card" size="small">
          <template #header>
            <div class="card-header">
              <n-icon :component="AccessibilityOutline" :size="20" />
              <span>无障碍</span>
            </div>
          </template>
          <div class="setting-content">
            <div class="setting-item">
              <div class="setting-label">
                <n-icon :component="ColorWandOutline" :size="18" />
                <span>色弱模式</span>
              </div>
              <n-switch
                size="large"
                v-model:value="colorBlindMode"
                :checked-value="true"
                :unchecked-value="false"
              />
            </div>
            <div class="setting-item">
              <div class="setting-label">
                <n-icon :component="ContrastOutline" :size="18" />
                <span>高对比度模式</span>
              </div>
              <n-switch
                size="large"
                v-model:value="highContrastMode"
                :checked-value="true"
                :unchecked-value="false"
              />
            </div>
          </div>
        </n-card>

        <!-- 背景图设置卡片 -->
        <n-card class="setting-card" size="small">
          <template #header>
            <div class="card-header">
              <n-icon :component="ImageOutline" :size="20" />
              <span>背景图</span>
            </div>
          </template>
          <div class="setting-content">
            <div class="background-settings">
              <n-upload
                :file-list="[]"
                :show-file-list="false"
                accept="image/*"
                @change="handleFileChange"
                :max="1"
                :disabled="isCompressing"
              >
                <n-button
                  block
                  type="primary"
                  ghost
                  :loading="isCompressing"
                  :disabled="isCompressing"
                >
                  <template #icon>
                    <n-icon :component="CloudUploadOutline" />
                  </template>
                  {{ isCompressing ? '处理中...' : '选择本地图片' }}
                </n-button>
              </n-upload>
              <n-input
                v-model:value="backgroundImageUrl"
                placeholder="输入网络图片链接"
                class="background-input"
                @update:value="handleImageUrlChange"
                clearable
                :disabled="isUrlLoading"
              >
                <template #prefix>
                  <n-icon :component="LinkOutline" />
                </template>
              </n-input>
              <div
                v-if="backgroundImageUrl || backgroundImage"
                class="image-preview"
              >
                <div class="preview-wrapper">
                  <img
                    :src="backgroundImageUrl || backgroundImage"
                    alt="背景预览"
                    class="preview-image"
                  />
                  <div class="preview-overlay">
                    <n-button
                      size="small"
                      type="error"
                      @click="clearBackgroundImage"
                    >
                      <template #icon>
                        <n-icon :component="TrashOutline" />
                      </template>
                      清除
                    </n-button>
                  </div>
                </div>
                <div class="slider-control">
                  <div class="slider-label">
                    <n-icon :component="LayersOutline" :size="16" />
                    <span>模糊深度: {{ backgroundBlur }}px</span>
                  </div>
                  <n-slider
                    v-model:value="backgroundBlur"
                    :min="0"
                    :max="20"
                    :step="1"
                    @update:value="handleBlurChange"
                  />
                </div>
                <div class="slider-control" v-if="!frostedGlassMode">
                  <div class="slider-label">
                    <n-icon :component="WaterOutline" :size="16" />
                    <span>元素不透明度: {{ backgroundOpacity || 100 }}%</span>
                  </div>
                  <n-slider
                    v-model:value="backgroundOpacity"
                    :min="20"
                    :max="100"
                    :step="1"
                    @update:value="handleOpacityChange"
                  />
                </div>
                <div class="setting-item" style="margin-top: 12px">
                  <div class="setting-label">
                    <n-icon :component="LayersOutline" :size="18" />
                    <span>毛玻璃模式</span>
                  </div>
                  <n-switch
                    size="large"
                    v-model:value="frostedGlassMode"
                    :checked-value="true"
                    :unchecked-value="false"
                    @update:value="handleFrostedGlassChange"
                  />
                </div>
                <div class="slider-control" v-if="frostedGlassMode">
                  <div class="slider-label">
                    <n-icon :component="WaterOutline" :size="16" />
                    <span>毛玻璃强度: {{ frostedGlassIntensity }}px</span>
                  </div>
                  <n-slider
                    v-model:value="frostedGlassIntensity"
                    :min="5"
                    :max="30"
                    :step="1"
                    @update:value="handleFrostedGlassIntensityChange"
                  />
                </div>
              </div>
            </div>
          </div>
        </n-card>
      </div>
    </n-scrollbar>
  </div>
</template>

<script lang="ts" setup>
import { CSSProperties, ref, onMounted, watch } from 'vue'
import { useThemeStore } from '../stores/theme'
import {
  Sparkles,
  Sunny,
  ColorPaletteOutline,
  SyncOutline,
  BrushOutline,
  EyeOutline,
  ColorFilterOutline,
  LayersOutline,
  AccessibilityOutline,
  ColorWandOutline,
  ContrastOutline,
  ImageOutline,
  CloudUploadOutline,
  LinkOutline,
  TrashOutline,
  WaterOutline,
  CheckmarkCircleOutline,
} from '@vicons/ionicons5'
import { useThemeTransition } from '@/utils/useThemeTransition'
import {
  compressImage,
  compressNetworkImage,
  formatFileSize,
  type CompressResult,
} from '@/utils/imageUtils'
import { useMessage } from 'naive-ui'

const message = useMessage()
const themeStore = useThemeStore()
const { toggleThemeWithDualCircle, isTransitioning } = useThemeTransition()
const isDarkTheme = ref(themeStore.theme === 'dark')
const primaryColor = ref(themeStore.primaryColor)
const isAutoTheme = ref(themeStore.isAutoTheme)
const isRGBMode = ref(themeStore.isRGBMode)
const isDialogBoxHairGlass = ref(themeStore.isDialogBoxHairGlass)
const backgroundImage = ref(themeStore.backgroundImage)
const backgroundImageUrl = ref(themeStore.backgroundImage)
const backgroundBlur = ref(themeStore.backgroundBlur)
const backgroundOpacity = ref(themeStore.backgroundOpacity || 100)
const colorBlindMode = ref(themeStore.colorBlindMode)
const highContrastMode = ref(themeStore.highContrastMode)
const frostedGlassMode = ref(themeStore.frostedGlassMode)
const frostedGlassIntensity = ref(themeStore.frostedGlassIntensity || 15)

const presetColors = [
  '#18a058',
  '#2080f0',
  '#f5222d',
  '#fa541c',
  '#faad14',
  '#13c2c2',
  '#52c41a',
  '#eb2f96',
  '#722ed1',
  '#2f54eb',
]

const changeTheme = async (event?: MouseEvent) => {
  await toggleThemeWithDualCircle(event, {
    duration: 600,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  })
}

const changePrimaryColor = (color: string) => {
  themeStore.setPrimaryColor(color)
}

const setPresetColor = (color: string) => {
  primaryColor.value = color
  changePrimaryColor(color)
}

const setAutoTheme = (isAuto: boolean) => {
  isAutoTheme.value = isAuto
  themeStore.setAutoTheme(isAuto)
}

const setRGBMode = (isRGB: boolean) => {
  isRGBMode.value = isRGB
  themeStore.setRGBMode(isRGB)
}

const setDialogBoxHairGlass = (isDBH: boolean) => {
  isDialogBoxHairGlass.value = isDBH
  themeStore.setDialogBoxHairGlass(isDBH)
}

watch(isDialogBoxHairGlass, (newVal) => {
  setDialogBoxHairGlass(newVal)
  if (newVal) {
    document.documentElement.style.setProperty('--modal-filter', '10px')
  } else {
    document.documentElement.style.setProperty('--modal-filter', '0px')
  }
})

watch(isDarkTheme, async () => {
  if (!isAutoTheme.value && !isTransitioning.value) {
    await changeTheme()
  }
})

watch(primaryColor, (newColor) => {
  changePrimaryColor(newColor)
})

watch(isAutoTheme, (newVal) => {
  setAutoTheme(newVal)
  if (newVal) {
    const systemDarkTheme = window.matchMedia('(prefers-color-scheme: dark)')
    isDarkTheme.value = systemDarkTheme.matches
    changeTheme()
    systemDarkTheme.addEventListener('change', handleSystemThemeChange)
  } else {
    const systemDarkTheme = window.matchMedia('(prefers-color-scheme: dark)')
    systemDarkTheme.removeEventListener('change', handleSystemThemeChange)
  }
})

watch(isRGBMode, (newVal) => {
  setRGBMode(newVal)
})

const setColorBlindMode = (enabled: boolean) => {
  colorBlindMode.value = enabled
  themeStore.setColorBlindMode(enabled)
  updateAccessibilityStyles()
}

const setHighContrastMode = (enabled: boolean) => {
  highContrastMode.value = enabled
  themeStore.setHighContrastMode(enabled)
  updateAccessibilityStyles()
}

const updateAccessibilityStyles = () => {
  const root = document.documentElement
  if (colorBlindMode.value) {
    // 应用色弱模式滤镜（红绿色盲辅助）
    root.style.setProperty('--color-blind-filter', 'url(#colorblind)')
    root.classList.add('color-blind-mode')
  } else {
    root.style.removeProperty('--color-blind-filter')
    root.classList.remove('color-blind-mode')
  }

  if (highContrastMode.value) {
    root.classList.add('high-contrast-mode')
  } else {
    root.classList.remove('high-contrast-mode')
  }
}

const updateFrostedGlassStyle = () => {
  const root = document.documentElement
  if (frostedGlassMode.value && backgroundImage.value) {
    root.classList.add('frosted-glass-mode')
    // 添加毛玻璃模式的动画效果
    root.style.setProperty('--frosted-glass-transition', 'all 0.3s ease')
  } else {
    root.classList.remove('frosted-glass-mode')
    // 移除毛玻璃模式的动画效果
    root.style.removeProperty('--frosted-glass-transition')
  }
}

watch(colorBlindMode, (newVal) => {
  setColorBlindMode(newVal)
})

watch(highContrastMode, (newVal) => {
  setHighContrastMode(newVal)
})

const railStyle = ({
  focused,
  checked,
}: {
  focused: boolean
  checked: boolean
}) => {
  const style: CSSProperties = {}
  if (checked) {
    style.background = '#000000'
    if (focused) {
      style.boxShadow = '0 0 0 2px #00000040'
    }
  }
  return style
}

const handleSystemThemeChange = (e: MediaQueryListEvent) => {
  isDarkTheme.value = e.matches
  changeTheme()
}

const isCompressing = ref(false)

const handleFileChange = async (options: { fileList: any[] }) => {
  const file = options.fileList[0]?.file
  if (file && file.type.startsWith('image/')) {
    const maxFileSize = 10 * 1024 * 1024
    if (file.size > maxFileSize) {
      message.warning(
        `图片文件过大 (${formatFileSize(file.size)})，建议使用小于 10MB 的图片`,
      )
    }

    isCompressing.value = true
    message.loading('正在处理图片...', { duration: 0 })

    try {
      const result: CompressResult = await compressImage(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.8,
        maxSizeKB: 500,
      })

      message.destroyAll()
      message.success(
        `图片处理完成！原始大小: ${formatFileSize(result.originalSize)}，` +
          `压缩后: ${formatFileSize(result.compressedSize)}，` +
          `尺寸: ${result.width}x${result.height}`,
      )

      backgroundImageUrl.value = result.data
      backgroundImage.value = result.data
      await themeStore.setBackgroundImage(result.data)
      updateBackgroundStyle()
    } catch (error) {
      message.destroyAll()
      message.error('图片处理失败，请尝试使用较小的图片')
      console.error('图片处理失败:', error)
    } finally {
      isCompressing.value = false
    }
  }
}

const isUrlLoading = ref(false)

const handleImageUrlChange = async (url: string) => {
  backgroundImageUrl.value = url

  if (url && url.trim()) {
    const trimmedUrl = url.trim()
    isUrlLoading.value = true
    message.loading('正在加载网络图片...', { duration: 0 })

    try {
      const result: CompressResult = await compressNetworkImage(trimmedUrl, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.8,
        maxSizeKB: 500,
      })

      message.destroyAll()
      message.success(
        `网络图片已缓存！压缩后大小: ${formatFileSize(result.compressedSize)}，` +
          `尺寸: ${result.width}x${result.height}`,
      )

      backgroundImage.value = result.data
      await themeStore.setBackgroundImage(result.data)
      updateBackgroundStyle()
    } catch (error) {
      message.destroyAll()
      message.warning('网络图片加载失败或跨域限制，将直接使用原图链接')
      console.warn('网络图片压缩失败:', error)

      backgroundImage.value = trimmedUrl
      await themeStore.setBackgroundImage(trimmedUrl)
      updateBackgroundStyle()
    } finally {
      isUrlLoading.value = false
    }
  } else {
    backgroundImage.value = ''
    await themeStore.clearBackgroundImage()
    updateBackgroundStyle()
  }
}

const handleBlurChange = (blur: number) => {
  backgroundBlur.value = blur
  themeStore.setBackgroundBlur(blur)
  updateBackgroundStyle()
}

const handleOpacityChange = (opacity: number) => {
  // 如果启用了毛玻璃模式，不允许修改不透明度
  if (frostedGlassMode.value) {
    backgroundOpacity.value = 100
    return
  }
  // 确保不透明度不低于20%
  const clampedOpacity = Math.max(20, opacity)
  backgroundOpacity.value = clampedOpacity
  themeStore.setBackgroundOpacity(clampedOpacity)
  updateBackgroundStyle()
}

const handleFrostedGlassChange = (enabled: boolean) => {
  frostedGlassMode.value = enabled
  themeStore.setFrostedGlassMode(enabled)
  // 启用毛玻璃模式时，强制不透明度为100%
  if (enabled) {
    backgroundOpacity.value = 100
    themeStore.setBackgroundOpacity(100)
  }
  updateBackgroundStyle()
  updateFrostedGlassStyle()
}

const handleFrostedGlassIntensityChange = (intensity: number) => {
  frostedGlassIntensity.value = intensity
  themeStore.setFrostedGlassIntensity(intensity)
  // 更新毛玻璃强度样式
  const root = document.documentElement
  root.style.setProperty('--frosted-glass-blur', `${intensity}px`)
}

const clearBackgroundImage = async () => {
  backgroundImageUrl.value = ''
  backgroundImage.value = ''
  await themeStore.clearBackgroundImage()
  if (frostedGlassMode.value) {
    frostedGlassMode.value = false
    themeStore.setFrostedGlassMode(false)
  }
  updateBackgroundStyle()
  updateFrostedGlassStyle()
  message.success('背景图已清除')
}

const updateBackgroundStyle = () => {
  const root = document.documentElement
  if (backgroundImage.value) {
    try {
      const imageUrl = `url(${backgroundImage.value})`
      // 确保不透明度不低于20%
      const opacity = Math.max(20, backgroundOpacity.value || 100)

      // 设置 CSS 变量
      root.style.setProperty('--background-image', imageUrl)
      root.style.setProperty('--background-blur', `${backgroundBlur.value}px`)
      root.style.setProperty('--background-opacity', `${opacity / 100}`)

      // 验证是否设置成功
      const setValue = root.style.getPropertyValue('--background-image')
      if (!setValue || setValue === 'none') {
        console.warn('背景图 CSS 变量设置可能失败，图片可能太大')
      }

      // 调试信息
      console.log('背景图已设置:', {
        length: backgroundImage.value.length,
        blur: backgroundBlur.value,
        opacity: opacity,
      })
    } catch (error) {
      console.error('设置背景图失败:', error)
    }
  } else {
    // 移除 CSS 变量以恢复默认样式
    root.style.removeProperty('--background-image')
    root.style.removeProperty('--background-blur')
    root.style.removeProperty('--background-opacity')
    console.log('背景图已清除')
  }
}

// 监听 themeStore 的变化
watch(
  () => themeStore.backgroundImage,
  (newImage) => {
    if (newImage !== backgroundImage.value) {
      backgroundImage.value = newImage
      backgroundImageUrl.value = newImage
      updateBackgroundStyle()
    }
  },
)

watch(
  () => themeStore.backgroundBlur,
  (newBlur) => {
    if (newBlur !== backgroundBlur.value) {
      backgroundBlur.value = newBlur
      updateBackgroundStyle()
    }
  },
)

watch(
  () => themeStore.backgroundOpacity,
  (newOpacity) => {
    if (newOpacity !== backgroundOpacity.value) {
      // 确保不透明度不低于20%
      const clampedOpacity = Math.max(20, newOpacity)
      backgroundOpacity.value = clampedOpacity
      if (clampedOpacity !== newOpacity) {
        themeStore.setBackgroundOpacity(clampedOpacity)
      }
      updateBackgroundStyle()
    }
  },
)

watch(
  () => themeStore.frostedGlassMode,
  (newMode) => {
    if (newMode !== frostedGlassMode.value) {
      frostedGlassMode.value = newMode
      updateFrostedGlassStyle()
    }
  },
)

watch(
  () => backgroundImage.value,
  () => {
    // 当背景图变化时，更新毛玻璃样式
    updateFrostedGlassStyle()
  },
)

onMounted(async () => {
  if (!backgroundOpacity.value || isNaN(backgroundOpacity.value)) {
    backgroundOpacity.value = 100
    themeStore.setBackgroundOpacity(100)
  } else if (backgroundOpacity.value < 20) {
    backgroundOpacity.value = 20
    themeStore.setBackgroundOpacity(20)
  }
  if (frostedGlassMode.value) {
    backgroundOpacity.value = 100
    themeStore.setBackgroundOpacity(100)
  }

  if (isDialogBoxHairGlass.value) {
    document.documentElement.style.setProperty('--modal-filter', '10px')
  } else {
    document.documentElement.style.setProperty('--modal-filter', '0px')
  }

  await themeStore.loadBackgroundImageFromStorage()
  backgroundImage.value = themeStore.backgroundImage
  backgroundImageUrl.value = themeStore.backgroundImage

  updateBackgroundStyle()
  updateAccessibilityStyles()
  updateFrostedGlassStyle()
})
</script>

<style lang="scss" scoped>
.theme-switcher {
  height: 100%;
}

.theme-switcher :deep(.n-scrollbar) {
  height: 100%;
  overflow: visible;
}

.container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 8px 0;
}

.setting-card {
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 15px;
}

.setting-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 4px 0;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  transition: all 0.2s ease;

  &:hover {
    padding-left: 4px;
  }
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-color-1);
}

.color-picker-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}

.preset-colors {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  justify-content: center;
  max-width: 100%;
  padding: 8px 0;
}

.preset-color {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  cursor: pointer;
  border: 3px solid transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    padding: 2px;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.3),
      rgba(0, 0, 0, 0.1)
    );
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: scale(1.15);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);

    &::before {
      opacity: 1;
    }
  }

  &.active {
    border-color: var(--primary-color, #18a058);
    box-shadow:
      0 0 0 2px var(--primary-color, #18a058),
      0 4px 12px rgba(0, 0, 0, 0.25);
    transform: scale(1.1);
  }
}

.background-settings {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.background-input {
  margin-top: 0;
}

.image-preview {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  margin-top: 8px;
}

.preview-wrapper {
  position: relative;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);

    .preview-overlay {
      opacity: 1;
    }
  }
}

.preview-image {
  width: 100%;
  max-height: 180px;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;

  .preview-wrapper:hover & {
    transform: scale(1.02);
  }
}

.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.4), transparent);
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.slider-control {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.slider-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-color-2);
  font-weight: 500;
}

// 响应式设计
@media (max-width: 768px) {
  .preset-colors {
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
  }

  .preset-color {
    width: 32px;
    height: 32px;
  }
}
</style>
