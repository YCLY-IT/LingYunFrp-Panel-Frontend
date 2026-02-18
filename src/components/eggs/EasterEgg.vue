<template>
  <n-modal
    v-model:show="showEasterEgg"
    preset="card"
    :style="{ maxWidth: '400px', width: '90%' }"
    :bordered="false"
  >
    <template #header>
      <n-space align="center" justify="center" style="width: 100%">
        <span style="font-size: 28px">🎉</span>
        <n-text strong style="font-size: 20px">我嘞个！</n-text>
        <span style="font-size: 28px">🎉</span>
      </n-space>
    </template>

    <n-space vertical size="large" align="center">
      <span style="font-size: 60px">Σヽ(ﾟД ﾟ; )ﾉ</span>

      <n-text style="text-align: center; font-size: 16px">
        这都被你发现了
      </n-text>

      <n-text depth="3" style="text-align: center">
        你是懂彩蛋的，真的厉害呀(ﾉ>ω<)ﾉ
      </n-text>
    </n-space>

    <template #footer>
      <n-space justify="center">
        <n-button type="primary" @click="closeEasterEgg"> 6 </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { NModal, NSpace, NText, NButton } from 'naive-ui'

const showEasterEgg = ref(false)

const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
]
let inputSequence: string[] = []

const handleKeydown = (e: KeyboardEvent) => {
  const key = e.key

  if (key === KONAMI_CODE[inputSequence.length]) {
    inputSequence.push(key)

    if (inputSequence.length === KONAMI_CODE.length) {
      showEasterEgg.value = true
      inputSequence = []
    }
  } else {
    if (key === KONAMI_CODE[0]) {
      inputSequence = [key]
    } else {
      inputSequence = []
    }
  }
}

const closeEasterEgg = () => {
  showEasterEgg.value = false
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>
