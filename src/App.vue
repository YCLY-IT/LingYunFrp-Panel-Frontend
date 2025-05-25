<template>
  <NConfigProvider :theme="theme" :theme-overrides="themeOverrides">
    <NDialogProvider>
      <NMessageProvider>
        <NNotificationProvider>
          <NLoadingBarProvider>
            <AppContent />
          </NLoadingBarProvider>
        </NNotificationProvider>
      </NMessageProvider>
    </NDialogProvider>
  </NConfigProvider>
</template>

<script setup lang="ts">
import { ref, computed, provide, onMounted } from 'vue'
import {
  NConfigProvider,
  NMessageProvider,
  NDialogProvider,
  NNotificationProvider,
  NLoadingBarProvider,
  darkTheme
} from 'naive-ui'
import { themeOverrides } from './constants/theme'
import AppContent from './components/AppContent.vue'

// 从localStorage读取主题状态，默认跟随系统
const isDarkMode = ref(localStorage.getItem('theme') === 'dark' || 
  window.matchMedia('(prefers-color-scheme: dark)').matches)

const theme = computed(() => isDarkMode.value ? darkTheme : null)

// 监听系统主题变化
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')
prefersDark.addEventListener('change', (e) => {
  isDarkMode.value = e.matches
})

// 主题切换函数
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  // 存储主题状态到localStorage
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
}

// 从本地存储获取恢复主题状态
onMounted(() => {
  const theme = localStorage.getItem('theme')
  if (theme === 'dark') {
    isDarkMode.value = true
  } else if (theme === 'light') {
    isDarkMode.value = false
  }
})
// 提供给全局使用
provide('theme', {
  isDarkMode,
  theme,
  toggleTheme
})
</script>

<style lang="scss">
@use "./assets/styles/transitions.scss";
input, textarea, select {
  font-size: 16px !important;
}

@media screen and (max-width: 768px) {
  input, textarea, select {
    font-size: 16px !important;
  }
}
</style>

<style lang="scss">
.n-card {
  border-radius: 10px;
}
body {
  margin: 0;
  padding: 0;
}
</style>