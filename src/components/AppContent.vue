<template>
  <HomeMenu v-if="!isDashboard" />
  <RouterView v-slot="{ Component }">
    <transition name="fade" mode="out-in" appear>
      <component :is="Component" />
    </transition>
  </RouterView>
  <NGlobalStyle />
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, RouterView } from 'vue-router'
import { NGlobalStyle, useLoadingBar, useMessage, useDialog, useNotification } from 'naive-ui'
import { Window } from '@/types'
import HomeMenu from './HomeMenu.vue'

// 声明window类型
declare const window: Window

const route = useRoute()
const isDashboard = computed(() => route.path.startsWith('/dashboard'))

// 初始化全局UI组件
onMounted(() => {
  // 在组件挂载后，将UI组件实例挂载到window对象上
  window.$loadingBar = useLoadingBar()
  window.$message = useMessage()
  window.$dialog = useDialog()
  window.$notification = useNotification()
})
</script> 