<template>
  <!-- PC端导航栏 -->
  <NLayoutHeader bordered class="navbar pc-navbar" style="user-select: none">
    <div class="navbar-content">
      <div class="logo">
        <RouterLink to="/" class="logo-link">
          <h2
            style="
              background: transparent;
              -webkit-background-clip: text;
              color: transparent;
              background-image: linear-gradient(
                -225deg,
                #7de2fc 0%,
                #b9b6e5 100%
              );
            "
          >
            {{ packageData.title }}
          </h2>
        </RouterLink>
      </div>

      <!-- 桌面端菜单 -->
      <div class="nav-links">
        <NSpace class="desktop-menu">
          <NButton
            quaternary
            circle
            size="small"
            @click="toggleTheme"
            class="theme-toggle-btn"
          >
            <NIcon size="20" :component="isDarkMode ? Sunny : Moon" />
          </NButton>
          <RouterLink to="/dashboard">
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
            <h2
              style="
                background: transparent;
                -webkit-background-clip: text;
                color: transparent;
                background-image: linear-gradient(
                  120deg,
                  #84fab0 0%,
                  #8fd3f4 100%
                );
              "
            >
              {{ packageData.title }}
            </h2>
          </RouterLink>
        </div>
      </div>

      <!-- 右侧：主题切换按钮 -->
      <div class="nav-links">
        <NSpace class="desktop-menu">
          <NButton
            quaternary
            circle
            size="small"
            @click="toggleTheme"
            class="theme-toggle-btn"
          >
            <NIcon size="20" :component="isDarkMode ? Sunny : Moon" />
          </NButton>
          <RouterLink to="/dashboard">
            <NButton secondary type="primary">管理面板</NButton>
          </RouterLink>
        </NSpace>
      </div>
    </div>
  </NLayoutHeader>
</template>

<script setup lang="ts">
import packageData from '../../package.json'
import { h, inject, Ref, ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import {
  NLayoutHeader,
  NButton,
  NSpace,
  NIcon,
  NPopover,
  NMenu,
  MenuOption,
} from 'naive-ui'
import { MenuOutline, Moon, Sunny } from '@vicons/ionicons5'
import { HomeOutline, LogInOutline, PersonAddOutline } from '@vicons/ionicons5'

const showMenu = ref(false)
const router = useRouter()
const { isDarkMode, toggleTheme } = inject('theme', {
  isDarkMode: ref(false),
  toggleTheme: () => {},
}) as {
  isDarkMode: Ref<boolean>
  toggleTheme: () => void
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
