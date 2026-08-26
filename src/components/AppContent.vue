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

const loadingBar = useLoadingBar()
const message = useMessage()
const dialog = useDialog()
const notification = useNotification()

const route = useRoute()
const router = useRouter()
const isReady = ref(false)

const isDashboard = computed(() => {
  return route.path.startsWith('/dashboard')
})

declare const window: Window

onMounted(async () => {
  await router.isReady()

  window.$loadingBar = loadingBar
  window.$message = message
  window.$dialog = dialog
  window.$notification = notification

  isReady.value = true
})
</script>
