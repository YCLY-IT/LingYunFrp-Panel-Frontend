<template>
  <!-- PC端导航栏 -->
  <NLayoutHeader bordered class="navbar pc-navbar" style="user-select: none">
    <div class="navbar-content">
      <div class="logo">
        <RouterLink to="/" class="logo-link">
          <h2 :style="{ color: themeStore.primaryColor }">
            {{ packageData.title }}
          </h2>
        </RouterLink>
      </div>

      <!-- 桌面端菜单 -->
      <div class="nav-links">
        <NSpace class="desktop-menu">
          <n-button
            quaternary
            circle
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
            v-if="userInfo"
            :options="options"
            @select="handleUserMenuSelect"
            trigger="hover"
          >
            <NButton text>
              <template #icon>
                <NIcon>
                  <div
                    class="avatar"
                    style="transform: translateY(-6px) translateX(-15px)"
                  >
                    <img :src="userInfo.avatar" alt="avatar" />
                  </div>
                </NIcon>
              </template>
              {{ userInfo.displayName }}
            </NButton>
          </NDropdown>
          <RouterLink v-else to="/dashboard">
            <NButton secondary type="primary">管理面板</NButton>
          </RouterLink>
        </NSpace>
      </div>
    </div>
  </NLayoutHeader>

  <!-- 移动端导航栏 -->
  <NLayoutHeader
    bordered
    class="navbar mobile-navbar"
    style="user-select: none"
  >
    <div
      class="mobile-header"
      style="display: flex; align-items: center; justify-content: space-between"
    >
      <!-- 左侧：菜单按钮 -->
      <div style="display: flex; align-items: center">
        <NPopover
          trigger="click"
          placement="bottom-start"
          :show="showMenu"
          @update:show="showMenu = $event"
        >
          <template #trigger>
            <NButton text class="menu-button">
              <NIcon size="24">
                <MenuOutline />
              </NIcon>
            </NButton>
          </template>
          <div class="mobile-menu">
            <NMenu :options="menuOptions" @update:value="handleMenuSelect" />
          </div>
        </NPopover>
        <!-- logo -->
        <div class="logo" style="margin-left: 8px">
          <RouterLink to="/" class="logo-link">
            <h2 :style="{ color: themeStore.primaryColor }">
              {{ packageData.title }}
            </h2>
          </RouterLink>
        </div>
      </div>

      <!-- 右侧：主题切换按钮 -->
      <div class="nav-links">
        <NSpace class="desktop-menu">
          <n-button
            quaternary
            circle
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
            v-if="userInfo"
            :options="options"
            @select="handleUserMenuSelect"
            trigger="hover"
          >
            <NButton text>
              <template #icon>
                <NIcon>
                  <div
                    class="avatar"
                    style="transform: translateY(-6px) translateX(-15px)"
                  >
                    <img :src="userInfo.avatar" alt="avatar" />
                  </div>
                </NIcon>
              </template>
              {{ userInfo.displayName }}
            </NButton>
          </NDropdown>
          <RouterLink v-else to="/dashboard">
            <NButton secondary type="primary">管理面板</NButton>
          </RouterLink>
        </NSpace>
      </div>
    </div>
  </NLayoutHeader>
</template>

<script setup lang="ts">
import packageData from '../../package.json'
import { h, ref, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import {
  NLayoutHeader,
  NButton,
  NSpace,
  NIcon,
  NPopover,
  NMenu,
  MenuOption,
  useDialog,
  NDropdown,
} from 'naive-ui'
import { LogOutOutline, MenuOutline, Moon, Sunny } from '@vicons/ionicons5'
import { HomeOutline, LogInOutline, PersonAddOutline } from '@vicons/ionicons5'
import { useThemeStore } from '@/stores/theme'
import { useThemeTransition } from '@/utils/useThemeTransition'
import { userApi } from '@/net'
import { removeToken } from '@/net/token'

const showMenu = ref(false)
const router = useRouter()
const themeStore = useThemeStore()
const dialog = useDialog()

interface UserInfo {
  avatar: string
  displayName: string
}

const userInfo = ref<UserInfo | null>(null)

function loadUserInfo() {
  const tokenStr =
    localStorage.getItem('Authorization') ||
    sessionStorage.getItem('Authorization')
  if (!tokenStr) {
    userInfo.value = null
    return
  }
  const avatar = localStorage.getItem('avatar') || ''
  const nickname = localStorage.getItem('nickname') || ''
  const username = localStorage.getItem('username') || ''
  const displayName = nickname || username
  if (!avatar && !displayName) {
    userInfo.value = null
    return
  }
  userInfo.value = { avatar, displayName }
}

onMounted(loadUserInfo)

const { toggleThemeWithDualCircle } = useThemeTransition()

const handleThemeToggle = async (event: MouseEvent) => {
  await toggleThemeWithDualCircle(event, {
    duration: 600,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  })
}
function renderIcon(icon: any) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const menuOptions: MenuOption[] = [
  {
    label: '首页',
    key: 'home',
    icon: renderIcon(HomeOutline),
  },
  {
    label: '登录',
    key: 'login',
    icon: renderIcon(LogInOutline),
  },
  {
    label: '注册',
    key: 'register',
    icon: renderIcon(PersonAddOutline),
  },
  {
    type: 'divider',
    key: 'd2',
  },
]

const options = [
  {
    label: '控制面板',
    key: 'home',
    icon: renderIcon(HomeOutline),
  },
  {
    type: 'divider',
    key: 'd2',
  },
  {
    label: '退出登录',
    key: 'logout',
    icon: renderIcon(LogOutOutline),
  },
]

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
          userInfo.value = null
        },
      })
      break
    case 'home':
      router.push('/dashboard')
      break
  }
}

const userLogout = async () => {
  try {
    await userApi.logout()
    removeToken()
  } catch (error: any) {
    removeToken()
  }
}

function handleMenuSelect(key: string) {
  switch (key) {
    case 'home':
      router.push('/')
      break
    case 'login':
      router.push('/login')
      break
    case 'register':
      router.push('/register')
      break
  }
}
</script>

<style lang="scss" scoped>
@use '../assets/styles/components/homeMenu.scss' as *;

/* 右侧操作区容器 */
.nav-links {
  display: flex;
  align-items: center;
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
</style>
