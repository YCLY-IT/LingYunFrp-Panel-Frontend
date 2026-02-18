<template>
  <NLayoutHeader
    bordered
    position="absolute"
    style="height: 64px; z-index: 999; user-select: none"
  >
    <div class="header-content">
      <div class="left">
        <NPopover
          trigger="click"
          placement="bottom-start"
          :show="showMenu"
          @update:show="showMenu = $event"
        >
          <template #trigger>
            <NButton text class="menu-trigger">
              <NIcon size="24">
                <MenuOutline />
              </NIcon>
            </NButton>
          </template>
          <div class="mobile-menu">
            <NScrollbar style="max-height: 500px">
              <NMenu
                :options="menuOptions"
                :value="currentKey"
                @update:value="handleMenuSelect"
                :default-expanded-keys="defaultExpandedKeys"
              />
            </NScrollbar>
          </div>
        </NPopover>
        <h2
          class="logo"
          style="
            background: transparent;
            -webkit-background-clip: text;
            color: transparent;
            background-image: linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%);
          "
        >
          {{ packageData.title }}
        </h2>
      </div>
      <div class="right">
        <n-button
          quaternary
          style="font-size: 18px; transform: translateX(-30px)"
          @click="ThemeSwitcherDrawer('right')"
        >
          <n-icon :component="SettingsOutline" style="cursor: pointer"></n-icon>
        </n-button>
        <n-button
          quaternary
          circle
          size="small"
          @click="handleThemeToggle"
          class="theme-toggle-btn"
          style="transform: translateX(-30px)"
        >
          <NIcon
            size="20"
            :component="themeStore.theme === 'dark' ? Sunny : Moon"
          />
        </n-button>
        <NDropdown
          :options="options"
          @select="handleUserMenuSelect"
          trigger="hover"
        >
          <NButton text>
            <template #icon>
              <NIcon>
                <div
                  class="avatar"
                  style="transform: translateY(-6px) translateX(-20px)"
                >
                  <img :src="avatarUrl" alt="avatar" />
                </div>
              </NIcon>
            </template>
            {{ nickname }}
          </NButton>
        </NDropdown>
      </div>
    </div>
  </NLayoutHeader>

  <!-- 移动端菜单抽屉 -->
  <NDrawer v-model:show="showMobileMenu" :width="280" placement="left">
    <NDrawerContent title="菜单">
      <LeftMenu @select="showMobileMenu = false" />
    </NDrawerContent>
  </NDrawer>
  <n-drawer
    v-model:show="themeSwitcherDrawer"
    :placement="placement"
    :default-width="320"
    resizable
  >
    <n-drawer-content title="面板配置">
      <ThemeSwitcher />
    </n-drawer-content>
  </n-drawer>
</template>

<script setup lang="ts">
import packageData from '../../package.json'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  NLayoutHeader,
  NIcon,
  NButton,
  NDropdown,
  useDialog,
  useMessage,
  NPopover,
  NMenu,
  MenuOption,
  NDrawer,
  NDrawerContent,
  NScrollbar,
  DrawerPlacement,
} from 'naive-ui'
import {
  PersonCircleOutline,
  LogOutOutline,
  Sunny,
  Moon,
  MenuOutline,
  HomeOutline,
  SettingsOutline,
} from '@vicons/ionicons5'

import {
  getMenuOptions,
  renderIcon,
  defaultExpandedKeys,
} from '../shared/menuOptions.ts'
import LeftMenu from './LeftMenu.vue'
import { userApi } from '@/net'
import { removeToken } from '@/net/token.ts'
import { useThemeStore } from '@/stores/theme.ts'
import { useThemeTransition } from '@/utils/useThemeTransition.ts'

const router = useRouter()
const route = useRoute()
const showMenu = ref(false)
const menuOptions = ref(getMenuOptions())
const dialog = useDialog()
const message = useMessage()
const nickname = localStorage.getItem('nickname')
const showMobileMenu = ref(false)
const isMobile = ref(window.innerWidth <= 768)
const { toggleThemeWithDualCircle } = useThemeTransition()

const handleThemeToggle = async (event: MouseEvent) => {
  await toggleThemeWithDualCircle(event, {
    duration: 600,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  })
}

// 从 localStorage 获取头像链接
const avatarUrl = ref(localStorage.getItem('avatar') || '')

const themeSwitcherDrawer = ref(false)
const placement = ref<DrawerPlacement>('right')
const themeStore = useThemeStore()
const ThemeSwitcherDrawer = (place: DrawerPlacement) => {
  themeSwitcherDrawer.value = true
  placement.value = place
}

const options = [
  // {
  //   key: 'theme',
  //   type: 'render',
  //   render: renderThemeOption,
  // },
  // {
  //   type: 'divider',
  //   key: 'd1',
  // },
  {
    label: '返回首页',
    key: 'home',
    icon: renderIcon(HomeOutline),
  },
  {
    type: 'divider',
    key: 'd2',
  },
  {
    label: '个人资料',
    key: 'profile',
    icon: renderIcon(PersonCircleOutline),
  },
  {
    label: '退出登录',
    key: 'logout',
    icon: renderIcon(LogOutOutline),
  },
]

const userLogout = async () => {
  try {
    await userApi.logout()
    removeToken()
  } catch (error: any) {
    removeToken()
  }
}

const handleUserMenuSelect = (key: string) => {
  switch (key) {
    case 'logout':
      dialog.warning({
        title: '提示',
        content: '确定要退出登录吗？',
        positiveText: '确定',
        negativeText: '取消',
        onPositiveClick: async () => {
          await userLogout()
          message.success('已退出登录')
          router.push('/login')
        },
      })
      break
    case 'profile':
      router.push('/dashboard/profile')
      break
    case 'home':
      router.push('/')
      break
  }
}

const handleMenuSelect = (_: any, item: MenuOption) => {
  router.push(item.link as string)
  showMenu.value = false
}

const currentKey = computed(() => {
  const key = route.path.replace('/dashboard/', '').replace('/', '-')
  if (key === 'home') return 'dashboardIndex'
  return key
})

const handleResize = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  transform: translateY(-6px) translateX(-12px);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.theme-toggle-btn {
  transition: all 0.3s ease;
  &:hover {
    transform: rotate(30deg);
    background-color: var(--n-color-hover);
  }
  .n-icon {
    transition: all 0.3s ease;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .logo {
    font-size: 16px;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .right {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .right .n-button {
    transform: translateX(0) !important;
    padding: 0 6px;
  }

  .avatar {
    transform: translateY(-6px) translateX(0) !important;
  }
}
</style>
