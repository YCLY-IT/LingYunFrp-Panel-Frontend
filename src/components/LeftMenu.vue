<template>
  <NMenu :collapsed-width="64" :collapsed-icon-size="24" :options="menuOptions" :value="currentKey" :icon-size="22"
    @update:value="handleMenuSelect" style="user-select: none" :default-expanded-keys="defaultExpandedKeys" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NMenu, type MenuOption } from 'naive-ui'
import { useRouter, useRoute } from 'vue-router'
import { getMenuOptions, defaultExpandedKeys } from '../shared/menuOptions.ts'

const emit = defineEmits(['select'])
const route = useRoute()
const router = useRouter()
const menuOptions = ref(getMenuOptions())

const handleMenuSelect = (_: any, item: MenuOption) => {
  router.push(item.link as string)
  emit('select')
}

const currentKey = computed(() => {
  return route.name as string
})

</script>

