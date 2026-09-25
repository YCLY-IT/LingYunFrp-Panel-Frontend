<template>
  <div class="p-5 max-w-[1000px] mx-auto">
    <n-card>
      <div v-if="loading" class="text-center p-10 text-base">加载中...</div>
      <div v-else-if="error" class="text-center p-10 text-base text-[#ff4d4f]">
        {{ error }}
      </div>
      <div v-else class="legal-md" v-html="renderedNotice" />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import { NCard, useMessage } from 'naive-ui'
import { computed, ref, onMounted } from 'vue'
import DOMPurify from 'dompurify'

const message = useMessage()
const notice = ref('')
const loading = ref(true)
const error = ref('')

marked.use({
  gfm: true,
  breaks: true,
})

onMounted(async () => {
  try {
    const response = await fetch('/docs/terms.md')
    if (!response.ok) throw new Error('文件加载失败')
    notice.value = await response.text()
  } catch (err) {
    console.error('加载条款文件时出错:', err)
    error.value = '条款文件加载失败，请检查网络连接'
    message.error(error.value)
  } finally {
    loading.value = false
  }
})

const renderedNotice = computed(() => {
  if (!notice.value) return ''

  try {
    return DOMPurify.sanitize(marked.parse(notice.value) as string)
  } catch (err) {
    console.error('渲染Markdown时出错:', err)
    return '<div class="error">条款内容渲染失败</div>'
  }
})
</script>
