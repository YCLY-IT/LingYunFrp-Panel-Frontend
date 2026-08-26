<template>
  <n-modal
    v-model:show="showEgg"
    preset="card"
    :style="{ maxWidth: '400px', width: '90%' }"
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
        <n-text strong style="font-size: 18px">开发者模式</n-text>
      </n-space>
    </template>

    <n-space vertical size="large" align="center">
      <span style="font-size: 30px">(((o(*ﾟ▽ﾟ*)o)))</span>
      <n-text style="text-align: center"> 居然会打开控制台输入命令 </n-text>
      <n-text depth="3" style="text-align: center; font-size: 12px">
        平时没少调试吧
      </n-text>
    </n-space>

    <template #footer>
      <n-space justify="center">
        <n-button type="primary" @click="showEgg = false"> 当然啦 </n-button>
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
