<template>
  <div
    ref="rootRef"
    class="secure-area"
    :class="{ 'is-blurred': blurred }"
    @contextmenu="onContextMenu"
    @copy="onCopy"
    @cut="onCopy"
    @dragstart="onCopy"
  >
    <div
      class="secure-area__content"
      :class="{ 'is-no-select': disableSelect }"
    >
      <slot />
    </div>
    <div
      v-if="showWatermark"
      class="secure-area__watermark"
      :style="{ backgroundImage: `url(${watermarkDataUrl})` }"
      aria-hidden="true"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'

const props = withDefaults(
  defineProps<{
    /** 管理员用户名（留空则自动从 localStorage 读取） */
    username?: string
    nickname?: string
    email?: string
    showWatermark?: boolean
    disableSelect?: boolean
    disableContextMenu?: boolean
    disableCopy?: boolean
    blurOnHidden?: boolean
    refreshInterval?: number
    fontSize?: number
    watermarkLines?: string[]
  }>(),
  {
    username: '',
    nickname: '',
    email: '',
    showWatermark: true,
    disableSelect: true,
    disableContextMenu: true,
    disableCopy: true,
    blurOnHidden: true,
    refreshInterval: 60000,
    fontSize: 14,
    watermarkLines: undefined,
  },
)

const blurred = ref(false)
const watermarkDataUrl = ref('')

const info = computed(() => {
  const username = props.username || localStorage.getItem('username') || 'admin'
  const nickname = props.nickname || localStorage.getItem('nickname') || ''
  const email = props.email || localStorage.getItem('email') || ''
  const time = new Date().toLocaleString('zh-CN', { hour12: false })
  return { username, nickname, email, time }
})

const buildLines = (): string[] => {
  if (props.watermarkLines && props.watermarkLines.length) {
    return props.watermarkLines
  }
  const { username, nickname, email, time } = info.value
  const lines: string[] = []
  lines.push(nickname ? `${nickname}（${username}）` : username)
  if (email) lines.push(email)
  lines.push(time)
  return lines
}

const drawWatermark = () => {
  const canvas = document.createElement('canvas')
  const w = 280
  const h = 170
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, w, h)
  ctx.translate(w / 2, h / 2)
  ctx.rotate((-22 * Math.PI) / 180)
  ctx.font = `${props.fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif`
  ctx.fillStyle = 'rgba(130, 130, 130, 0.25)'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const lines = buildLines()
  const gap = props.fontSize + 6
  const startY = -((lines.length - 1) * gap) / 2
  lines.forEach((line, i) => {
    ctx.fillText(line, 0, startY + i * gap)
  })
  watermarkDataUrl.value = canvas.toDataURL('image/png')
}

let timer: ReturnType<typeof setInterval> | null = null

const handleVisibility = () => {
  if (props.blurOnHidden) blurred.value = document.hidden
}
const handleBlur = () => {
  if (props.blurOnHidden) blurred.value = true
}
const handleFocus = () => {
  blurred.value = false
}
const handlePrintScreen = (e: KeyboardEvent) => {
  if (e.key === 'PrintScreen') {
    // 截屏威慑：尝试清空剪贴板（浏览器支持有限，仅作提示性防护）
    try {
      navigator.clipboard?.writeText('').catch(() => {})
    } catch {
      /* ignore */
    }
  }
}

const onContextMenu = (e: Event) => {
  if (props.disableContextMenu) e.preventDefault()
}
const onCopy = (e: Event) => {
  if (props.disableCopy) e.preventDefault()
}

onMounted(() => {
  if (props.showWatermark) {
    drawWatermark()
    timer = setInterval(drawWatermark, props.refreshInterval)
  }
  document.addEventListener('visibilitychange', handleVisibility)
  window.addEventListener('blur', handleBlur)
  window.addEventListener('focus', handleFocus)
  window.addEventListener('keyup', handlePrintScreen)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  document.removeEventListener('visibilitychange', handleVisibility)
  window.removeEventListener('blur', handleBlur)
  window.removeEventListener('focus', handleFocus)
  window.removeEventListener('keyup', handlePrintScreen)
})
</script>

<style lang="scss" scoped>
@use '../assets/styles/components/secureArea.scss';
</style>
