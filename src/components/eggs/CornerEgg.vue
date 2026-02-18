<template>
  <n-modal
    v-model:show="showEgg"
    preset="card"
    :style="{ maxWidth: '350px', width: '90%' }"
    :bordered="false"
  >
    <template #header>
      <n-space align="center" justify="center" style="width: 100%">
        <span style="font-size: 24px">🎯</span>
        <n-text strong style="font-size: 18px">好厉害⁽⁽٩(๑˃̶͈̀ ᗨ ˂̶͈́)۶⁾⁾</n-text>
      </n-space>
    </template>

    <n-space vertical size="large" align="center">
      <n-text>5秒四个角都点到了</n-text>
      <n-text depth="3" style="font-size: 12px">
        顺序: 左上 → 右上 → 右下 → 左下
      </n-text>
    </n-space>

    <template #footer>
      <n-space justify="center">
        <n-button type="primary" @click="showEgg = false">
          不愧是你呀！
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { NModal, NSpace, NText, NButton } from 'naive-ui'

const showEgg = ref(false)
const cornerSequence = ref<number[]>([])

const CORRECT_SEQUENCE = [0, 1, 2, 3]
const CORNER_SIZE = 30
let lastClickTime = 0
const TIMEOUT = 5000

const getCorner = (x: number, y: number): number | null => {
  const width = window.innerWidth
  const height = window.innerHeight

  if (x < CORNER_SIZE && y < CORNER_SIZE) return 0
  if (x > width - CORNER_SIZE && y < CORNER_SIZE) return 1
  if (x > width - CORNER_SIZE && y > height - CORNER_SIZE) return 2
  if (x < CORNER_SIZE && y > height - CORNER_SIZE) return 3

  return null
}

const handleClick = (e: MouseEvent) => {
  const corner = getCorner(e.clientX, e.clientY)
  if (corner === null) return

  e.stopPropagation()

  const now = Date.now()

  if (now - lastClickTime > TIMEOUT) {
    cornerSequence.value = []
  }
  lastClickTime = now

  const expectedCorner = CORRECT_SEQUENCE[cornerSequence.value.length]

  if (corner === expectedCorner) {
    cornerSequence.value.push(corner)

    if (cornerSequence.value.length === CORRECT_SEQUENCE.length) {
      showEgg.value = true
      cornerSequence.value = []
    }
  } else {
    cornerSequence.value = []
  }
}

onMounted(() => {
  document.addEventListener('click', handleClick, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClick, true)
})
</script>
