<template>
  <div class="terms">
    <n-card>
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else class="markdown-content" v-html="renderedNotice" />
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

// 配置marked（同步模式）
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

<style lang="scss" scoped>
.terms {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.markdown-content {
  transform: translateY(-10px);
  font-size: 14px;
  line-height: 1.7;
  
  :deep(h1) {
    font-size: 1.8em;
    margin: 1em 0;
  }

  :deep(a) {
    color: #0366d6;
    text-decoration: none;
  }
}

.loading,
.error {
  text-align: center;
  padding: 40px;
  font-size: 16px;
}

.error {
  color: #ff4d4f;
}
.markdown-content a {
  color: inherit;
  text-decoration: none; 
}
.markdown-content a:hover {
  text-decoration: underline;
}
</style>