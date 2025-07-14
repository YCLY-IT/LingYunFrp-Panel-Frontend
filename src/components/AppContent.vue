<template>
  <HomeMenu v-if="!isDashboard && isReady" />
  <RouterView v-slot="{ Component }">
    <transition name="fade" mode="out-in" appear>
      <component :is="Component" v-if="isReady" />
    </transition>
  </RouterView>
  <NGlobalStyle />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, RouterView, useRouter } from 'vue-router'
import {
  NGlobalStyle,
  useLoadingBar,
  useMessage,
  useDialog,
  useNotification,
} from 'naive-ui'
import HomeMenu from './HomeMenu.vue'

// UI组件初始化（保持不变）
const loadingBar = useLoadingBar()
const message = useMessage()
const dialog = useDialog()
const notification = useNotification()

const route = useRoute()
const router = useRouter() // 新增路由实例
const isReady = ref(false) // 移除isMounted

// 修改后的计算属性
const isDashboard = computed(() => {
  return route.path.startsWith('/dashboard')
})

// 声明window类型
declare const window: Window

// 使用路由的isReady替代setTimeout
onMounted(async () => {
  await router.isReady() // 等待路由完全解析

  // 挂载全局对象
  window.$loadingBar = loadingBar
  window.$message = message
  window.$dialog = dialog
  window.$notification = notification

  isReady.value = true // 设置准备状态
})
</script>
