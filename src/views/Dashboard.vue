<script setup lang="ts">
import {  darkTheme } from "naive-ui";
import { ref, computed, onMounted, onUnmounted } from 'vue'
import LeftMenu from "@/components/LeftMenu.vue";
import TopMenu from "@/components/TopMenu.vue";

const collapsed = ref(false)
const isMobile = ref(window.innerWidth <= 768)

const contentStyle = computed(() => ({
  padding: isMobile.value ? '16px' : '24px'
}))

const handleResize = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

defineExpose({
  darkTheme
});
</script>


<template>
  <div>
    <NLayout position="absolute">
      <NLayoutHeader bordered style="height: 64px; padding: 0">
        <TopMenu />
      </NLayoutHeader>
      <NLayout has-sider position="absolute" style="top: 64px">
        <NLayoutSider v-if="!isMobile" bordered collapse-mode="width" :collapsed-width="64" :width="240"
                      :collapsed="collapsed" :native-scrollbar="false" show-trigger @update:collapsed="collapsed = $event">
          <LeftMenu />
        </NLayoutSider>
        <NLayout :native-scrollbar="false">
          <NLayoutContent :style="contentStyle">
            <RouterView v-slot="{ Component }">
              <transition name="fade" mode="out-in" appear>
                <component :is="Component" />
              </transition>
            </RouterView>
          </NLayoutContent>
        </NLayout>
      </NLayout>
    </NLayout>
  </div>
</template>

<style lang="scss">
@use "../assets/styles/dashboard.scss";
</style>