<template>
  <n-modal
    v-model:show="showEgg"
    preset="card"
    :style="{ maxWidth: '350px', width: '90%' }"
    :bordered="false"
  >
    <template #header>
      <n-space align="center" justify="center" style="width: 100%">
        <span style="font-size: 24px">☁️</span>
        <n-text strong style="font-size: 18px">蚌埠住了</n-text>
      </n-space>
    </template>

    <n-space vertical size="large" align="center">
      <span style="font-size: 80px">🤡</span>
      <n-text style="text-align: center"> 输入"凌云FRP"都能触发彩蛋 </n-text>
      <n-text depth="3" style="text-align: center; font-size: 12px">
        这波操作我给满分
      </n-text>
    </n-space>

    <template #footer>
      <n-space justify="center">
        <n-button type="primary" @click="showEgg = false"> 赢麻了 </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { NModal, NSpace, NText, NButton } from 'naive-ui'

const showEgg = ref(false)

const SUMMON_SEQUENCE = ['凌', '云', 'F', 'R', 'P']
let inputSequence: string[] = []
let lastInputTime = 0

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  const value = target.value

  if (!value) return

  const now = Date.now()
  if (now - lastInputTime > 3000) {
    inputSequence = []
  }
  lastInputTime = now

  const lastChar = value.slice(-1)

  if (lastChar === SUMMON_SEQUENCE[inputSequence.length]) {
    inputSequence.push(lastChar)

    if (inputSequence.length === SUMMON_SEQUENCE.length) {
      showEgg.value = true
      inputSequence = []
      target.value = ''
    }
  } else if (SUMMON_SEQUENCE.includes(lastChar)) {
    inputSequence = [lastChar]
  }
}

onMounted(() => {
  document.addEventListener('input', handleInput)
})

onUnmounted(() => {
  document.removeEventListener('input', handleInput)
})
</script>
