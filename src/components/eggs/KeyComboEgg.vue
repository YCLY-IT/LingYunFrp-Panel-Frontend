<template>
  <n-modal
    v-model:show="showEgg"
    preset="card"
    :style="{ maxWidth: '350px', width: '90%' }"
    :bordered="false"
  >
    <template #header>
      <n-space align="center" justify="center" style="width: 100%">
        <span style="font-size: 24px">⌨️</span>
        <n-text strong style="font-size: 18px">手速王者</n-text>
      </n-space>
    </template>

    <n-space vertical size="large" align="center">
      <n-text>code{{ currentYear }} 输完了</n-text>
      <n-text depth="3" style="font-size: 12px">
        单身多少年练出来的手速
      </n-text>
    </n-space>

    <template #footer>
      <n-space justify="center">
        <n-button type="primary" @click="showEgg = false"> 基操勿6 </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { NModal, NSpace, NText, NButton } from 'naive-ui'

const showEgg = ref(false)
const keySequence = ref<string[]>([])

const currentYear = new Date().getFullYear().toString()
const CORRECT_SEQUENCE = ['c', 'o', 'd', 'e', ...currentYear.split('')]
let lastKeyTime = 0
const TIMEOUT = 3000

const handleKeydown = (e: KeyboardEvent) => {
  const target = e.target as HTMLElement
  if (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.isContentEditable
  ) {
    return
  }

  const key = e.key.toLowerCase()
  if (!CORRECT_SEQUENCE.includes(key)) return

  const now = Date.now()

  if (now - lastKeyTime > TIMEOUT) {
    keySequence.value = []
  }
  lastKeyTime = now

  const expectedKey = CORRECT_SEQUENCE[keySequence.value.length]

  if (key === expectedKey) {
    keySequence.value.push(key)

    if (keySequence.value.length === CORRECT_SEQUENCE.length) {
      showEgg.value = true
      keySequence.value = []
    }
  } else {
    keySequence.value = []
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>
