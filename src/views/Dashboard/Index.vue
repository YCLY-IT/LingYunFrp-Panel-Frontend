<template>
  <div class="home gradient-bg">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      欢迎回来, {{ nickname }}
    </div>

    <!-- 用户卡片 -->
    <div class="content-info">
      <n-card :loading="loading" class="user-card">
        <n-space>
          <div class="user-card-avatar">
            <div
              :style="{
                backgroundImage: `url(${userInfoRef?.userInfo.avatar})`,
                borderRadius: '64px',
                width: '62px',
                height: '62px',
                marginTop: '1px',
                transform: 'scale(1.2)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'block',
              }"
            />
          </div>
          <div style="margin-left: 16px; text-align: left; margin-top: 5px;">
            <h3 style="margin: 0px;">{{ forTime }}{{ greetEmoji }}，{{ nickname }}</h3>
            <n-skeleton style="margin: 8px 0px 0px; width: 500px;" v-if="loading" />
            <p style="margin: 5px 0px 0px;">{{ textHitokoto }}</p>
          </div>
        </n-space>
      </n-card>
    </div>

    <!-- 内容面板 -->
    <div style="margin-top: 20px;" class="content-grid">
      <div class="left-column">
        <!-- 用户信息卡片 -->
        <NCard title="用户信息" class="info-card">
          <NAlert v-if="IsRealname === false" type="warning" title="未实名认证" style="margin-bottom: 16px">
            您的账户尚未完成实名认证, 请尽快完成实名认证。
            <br>
            <NButton text type="primary" @click="goToRealname">立即前往</NButton>
          </NAlert>
          <UserInfo ref="userInfoRef" @update="handleUserUpdate" />
        </NCard>
      </div>

      <!-- 通知卡片 -->
      <!-- 添加 loading 绑定，控制加载状态显示 -->
      <NCard title="通知内容" class="notice-card" :loading="isNoticeLoading">
        <div class="markdown-content" v-html="renderedNotice" />
      </NCard>
    </div>

    <!-- 统计卡片 -->
    <div style="margin-top: 20px;">
      <Traffic />
    </div>
  </div>
</template>

<script setup lang="ts">
import { NCard, NAlert, NButton, useMessage } from 'naive-ui'
import { ref, onMounted, computed, markRaw, Ref } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { useRouter } from 'vue-router'
import { userApi } from "@/net"
import { accessHandle } from "@/net/base"
import UserInfo from "@/components/UserInfo.vue"
import Traffic from '@/components/Traffic.vue'
import { TrafficType } from '@/types'

const router = useRouter()
const message = useMessage()
const notices = ref('')
const nickname = localStorage.getItem('nickname') || ''

// 用户信息引用
const userInfoRef = ref<{ userInfo: { isRealname: boolean; avatar: string; signRemainder: number; } } | null>(null)
const statisticRef = ref<{ 
  getUserTraffic: () => Promise<void>;
  traffic: Ref<TrafficType>;
} | null>()
// 是否实名认证
const IsRealname = computed(() => userInfoRef.value?.userInfo.isRealname || false)

// 一言和流量数据
const textHitokoto = ref('')
const loading = ref(false)

// 定义通知加载状态
const isNoticeLoading = ref(false)

// 现在几点
const forTime = computed(() => {
  const date = new Date()
  const hours = date.getHours()
  if (hours < 6) {
    return '凌晨好'
  } else if (hours < 12) {
    return '早上好'
  } else if (hours < 18) {
    return '下午好'
  } else {
    return '晚上好'
  }
})

// 问候 emoji
const emojiList = ['🌞', '🌈', '😃', '✨', '🥳', '🎉', '🦄', '🍀', '😺', '🚀', '🌸', '🍉', '🧸', '🎈', '😎']
const greetEmoji = ref('')

// 配置 marked
marked.setOptions({
  gfm: true,
  breaks: true
})

// 前往实名认证
const goToRealname = () => {
  router.push('/dashboard/profile')
}

const handleUserUpdate = () => {
  // 当用户信息更新时调用子组件方法
  statisticRef.value?.getUserTraffic()
}

// 渲染通知
const renderedNotice = computed(() => {
  if (!notices.value) return ''
  try {
    const html = marked.parse(notices.value) as string
    return DOMPurify.sanitize(html)
  } catch {
    return ''
  }
})


// 获取通知
const fetchNotice = async (): Promise<void> => {
  // 开始获取通知，显示加载状态
  isNoticeLoading.value = true
  userApi.get('/user/info/broadcast', accessHandle(), (data) => {
      notices.value = data.data[0].broadcast
      // 通知获取成功，隐藏加载状态
      isNoticeLoading.value = false
  }, (messageText) => {
    message.error('获取公告失败:' + messageText)
    // 通知获取失败，隐藏加载状态
    isNoticeLoading.value = false
  })
}

// 获取一言
const getHitokoto = async (): Promise<void> => {
  loading.value = true
  userApi.getHitokoto({}, (data) => {
    textHitokoto.value = data.hitokoto
    loading.value = false
  }, (messageText) => {
    message.error('获取一言失败:' + messageText)
  })
}

// 页面挂载后执行
onMounted(() => {
  fetchNotice()
  getHitokoto()
  // 随机选择一个 emoji
  greetEmoji.value = emojiList[Math.floor(Math.random() * emojiList.length)]
})
</script>

<style lang="scss" scoped>
@use '../../assets/styles/home.scss';

.gradient-bg {
  min-height: 100vh;
  transition: background 0.5s;
}

.welcome-banner {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 24px;
  letter-spacing: 2px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.content-grid {
  display: flex;
  gap: 24px;
  .left-column, .notice-card {
    flex: 1;
    min-width: 0;
  }
}

@media (max-width: 768px) {
  .content-grid {
    flex-direction: column;
    gap: 16px;
  }
  .user-card, .info-card, .notice-card {
    width: 100% !important;
    max-width: 100%;
    min-width: 0;
  }
  .welcome-banner {
    font-size: 1.2rem;
  }
  h3 {
    font-size: 1rem;
    word-break: break-all;
  }
  p {
    font-size: 0.95rem;
    word-break: break-all;
  }
  .user-card {
    .n-space {
      display: flex !important;
      flex-direction: row !important;
      align-items: center !important;
      flex-wrap: nowrap !important;
    }
    .user-card-avatar {
      width: 48px !important;
      height: 48px !important;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .user-card-avatar img {
      width: 62px !important;
      height: 62px !important;
      border-radius: 50% !important;
      margin-top: 0 !important;
      transform: scale(1) !important;
      object-fit: cover;
      display: block;
    }
    h3, p {
      text-align: left !important;
      word-break: break-all;
    }
  }
}
</style>