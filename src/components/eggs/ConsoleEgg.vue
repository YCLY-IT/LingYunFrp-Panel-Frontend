<template>
  <n-modal
    v-model:show="showEgg"
    preset="card"
    :style="{ maxWidth: '400px', width: '90%' }"
    :bordered="false"
  >
    <template #header>
      <n-space align="center" justify="center" style="width: 100%">
        <span style="font-size: 24px">💻</span>
        <n-text strong style="font-size: 18px">开发者模式</n-text>
      </n-space>
    </template>

    <n-space vertical size="large" align="center">
      <span style="font-size: 60px">🕵️</span>
      <n-text style="text-align: center"> 居然会打开控制台输入命令 </n-text>
      <n-text depth="3" style="text-align: center; font-size: 12px">
        平时没少调试吧
      </n-text>
    </n-space>

    <template #footer>
      <n-space justify="center">
        <n-button type="primary" @click="showEgg = false"> 泰裤辣 </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { NModal, NSpace, NText, NButton } from 'naive-ui'

const showEgg = ref(false)

onMounted(() => {
  const w = window as any

  w.lingyun = {
    secret: () => {
      showEgg.value = true
      return 'found'
    },
  }

  console.log('提示: lingyun.secret()')
})
</script>
