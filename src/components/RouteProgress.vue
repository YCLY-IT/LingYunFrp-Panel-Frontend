<template>
  <Teleport to="body">
    <div
      class="route-progress"
      :style="{
        width: `${progress}%`,
        opacity: visible ? 1 : 0,
        background: `linear-gradient(90deg, ${primaryColor}00, ${primaryColor})`,
        boxShadow: `0 0 10px ${primaryColor}, 0 0 4px ${primaryColor}`,
      }"
      aria-hidden="true"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import router from '@/router'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
const primaryColor = ref(themeStore.primaryColor)

const progress = ref(0)
const visible = ref(false)

let tickTimer: ReturnType<typeof setInterval> | null = null
let offBefore: (() => void) | null = null
let offAfter: (() => void) | null = null

const stopTick = () => {
  if (tickTimer) {
    clearInterval(tickTimer)
    tickTimer = null
  }
}

const start = () => {
  stopTick()
  progress.value = 8
  visible.value = true

  tickTimer = setInterval(() => {
    const remain = 95 - progress.value
    progress.value += Math.max(0.35, remain * 0.08)
  }, 180)
}

const finish = () => {
  stopTick()
  progress.value = 100

  window.setTimeout(() => {
    visible.value = false
    window.setTimeout(() => {
      progress.value = 0
    }, 300)
  }, 220)
}

onMounted(() => {
  offBefore = router.beforeEach(() => {
    start()
  })
  offAfter = router.afterEach(() => {
    finish()
  })
})

onUnmounted(() => {
  stopTick()
  offBefore?.()
  offAfter?.()
})
</script>
