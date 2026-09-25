<template>
  <!-- PC端导航栏 -->
  <motion.div
    :initial="reducedMotion ? false : { y: -48, opacity: 0 }"
    :animate="reducedMotion ? undefined : { y: 0, opacity: 1 }"
    :transition="springSoft"
  >
    <NLayoutHeader
      bordered
      class="navbar site-header sticky top-0 z-[100] bg-[var(--n-color)] backdrop-blur-[8px] select-none max-md:hidden!"
      :class="
        isScrolled
          ? 'is-scrolled h-14 shadow-[0_6px_24px_rgba(0,0,0,0.08)]'
          : 'h-16 shadow-none'
      "
    >
      <div
        class="h-full mx-auto flex items-center gap-8 px-[40px] max-md:gap-2 max-md:px-4"
      >
        <div class="flex-1 max-md:flex-none">
          <RouterLink to="/" class="block no-underline text-inherit">
            <h2
              class="m-0 text-[1.1rem] font-semibold"
              :style="{ color: themeStore.primaryColor }"
            >
              {{ packageData.title }}
            </h2>
          </RouterLink>
        </div>

        <!-- 桌面端菜单 -->
        <div class="flex items-center [&_.n-button]:text-[0.95rem]">
          <NSpace class="flex items-center">
            <div class="mr-4">
              <n-button
                quaternary
                circle
                @click="handleThemeToggle"
                class="transition-all duration-300 ease-in-out hover:bg-[var(--n-color-hover)] [&_.n-icon]:transition-all [&_.n-icon]:duration-300 [&_.n-icon]:ease-in-out"
              >
                <NIcon
                  size="20"
                  :component="themeStore.theme === 'dark' ? Sunny : Moon"
                />
              </n-button>
            </div>
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
                      class="w-8 h-8 rounded-full overflow-hidden inline-flex items-center justify-center"
                      style="transform: translateY(-6px) translateX(-15px)"
                    >
                      <img
                        :src="userInfo.avatar"
                        alt="avatar"
                        class="w-full h-full object-cover"
                      />
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
  </motion.div>

  <!-- 移动端导航栏 -->
  <motion.div
    :initial="reducedMotion ? false : { y: -48, opacity: 0 }"
    :animate="reducedMotion ? undefined : { y: 0, opacity: 1 }"
    :transition="{ ...springSoft, delay: 0.06 }"
  >
    <NLayoutHeader
      bordered
      class="navbar site-header sticky top-0 z-[100] bg-[var(--n-color)] backdrop-blur-[8px] select-none hidden! max-md:block!"
      :class="
        isScrolled
          ? 'is-scrolled shadow-[0_6px_24px_rgba(0,0,0,0.08)]'
          : 'shadow-none'
      "
    >
      <div
        class="px-6 h-16 flex items-center gap-3"
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
              <NButton text>
                <NIcon size="24">
                  <MenuOutline />
                </NIcon>
              </NButton>
            </template>
            <div
              class="min-w-40 -mx-4 -my-2 [&_.n-menu-item]:px-4 [&_.n-menu-item]:py-2 [&_.n-menu]:[--n-item-height:42px]"
            >
              <NMenu :options="menuOptions" @update:value="handleMenuSelect" />
            </div>
          </NPopover>
          <!-- logo -->
          <div class="flex-1 max-md:flex-none ml-2">
            <RouterLink to="/" class="block no-underline text-inherit">
              <h2
                class="m-0 text-[1.1rem] font-semibold"
                :style="{ color: themeStore.primaryColor }"
              >
                {{ packageData.title }}
              </h2>
            </RouterLink>
          </div>
        </div>

        <!-- 右侧：主题切换按钮 -->
        <div class="flex items-center [&_.n-button]:text-[0.95rem]">
          <NSpace class="flex items-center">
            <n-button
              quaternary
              circle
              @click="handleThemeToggle"
              class="transition-all duration-300 ease-in-out hover:bg-[var(--n-color-hover)] [&_.n-icon]:transition-all [&_.n-icon]:duration-300 [&_.n-icon]:ease-in-out"
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
                      class="w-8 h-8 rounded-full overflow-hidden inline-flex items-center justify-center"
                      style="transform: translateY(-6px) translateX(-15px)"
                    >
                      <img
                        :src="userInfo.avatar"
                        alt="avatar"
                        class="w-full h-full object-cover"
                      />
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
  </motion.div>
</template>

<script setup lang="ts">
import packageData from '../../package.json'
import { h, ref, onMounted, onUnmounted } from 'vue'
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
import { motion, useReducedMotion } from 'motion-v'
import { useThemeStore } from '@/stores/theme'
import { useThemeTransition } from '@/utils/useThemeTransition'
import { userApi } from '@/net'
import { removeToken } from '@/net/token'
import { springSoft } from '@/utils/motion'

const showMenu = ref(false)
const router = useRouter()
const themeStore = useThemeStore()
const dialog = useDialog()
const reducedMotion = useReducedMotion()

const isScrolled = ref(false)
const SCROLL_THRESHOLD = 8

const handleScroll = (event: Event) => {
  const target = event.target as HTMLElement | Document | null
  const top =
    !target || target === document
      ? window.scrollY
      : ((target as HTMLElement).scrollTop ?? 0)
  isScrolled.value = top > SCROLL_THRESHOLD
}

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

onMounted(() => {
  loadUserInfo()
  document.addEventListener('scroll', handleScroll, true)
})

onUnmounted(() => {
  document.removeEventListener('scroll', handleScroll, true)
})
</script>
