<template>
  <n-modal
    v-model:show="showEgg"
    preset="card"
    :style="{ maxWidth: '350px', width: '90%' }"
    :bordered="false"
  >
    <template #header>
      <n-space
        style="
          display: flex;
          align-items: center;
          justify-content: center;
          padding-left: 60px;
          padding-right: 40px;
        "
      >
        <n-text strong style="font-size: 18px">夜猫子 detected</n-text>
      </n-space>
    </template>

    <n-space vertical size="large" align="center">
      <span style="font-size: 60px">⎝( OωO)⎠</span>
      <n-text style="text-align: center">
        都 {{ currentTime }} 了还在肝
      </n-text>
      <n-text depth="3" style="text-align: center; font-size: 12px">
        要早点休息，身体要紧(`・ω・´)
      </n-text>
    </n-space>

    <template #footer>
      <n-space justify="center">
        <n-button type="primary" @click="closeEgg"> 嗯嗯 </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { NModal, NSpace, NText, NButton } from 'naive-ui'

const showEgg = ref(false)
const currentTime = ref('')
let timer: number | null = null

const STORAGE_KEY = 'midnight_egg_shown'

const hasShownToday = () => {
  const lastShown = localStorage.getItem(STORAGE_KEY)
  if (!lastShown) return false

  const lastDate = new Date(lastShown)
  const today = new Date()

  return (
    lastDate.getDate() === today.getDate() &&
    lastDate.getMonth() === today.getMonth() &&
    lastDate.getFullYear() === today.getFullYear()
  )
}

const markAsShown = () => {
  localStorage.setItem(STORAGE_KEY, new Date().toISOString())
}

const closeEgg = () => {
  showEgg.value = false
  markAsShown()
}

const checkMidnight = () => {
  const now = new Date()
  const hours = now.getHours()
  const minutes = now.getMinutes()

  currentTime.value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`

  // 只在 00:00-00:05 之间显示，且今天还没显示过
  if (hours === 0 && minutes < 5 && !showEgg.value && !hasShownToday()) {
    showEgg.value = true
  }
}

onMounted(() => {
  checkMidnight()
  timer = window.setInterval(checkMidnight, 30000) // 每30秒检查一次，减少频率
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
