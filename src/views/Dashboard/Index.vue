<template>
  <div class="home gradient-bg">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner">欢迎回来, {{ nickname }}</div>

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
          <div style="margin-left: 16px; text-align: left; margin-top: 5px">
            <h3 style="margin: 0px">
              {{ forTime }}{{ greetEmoji }}，{{ nickname }}
            </h3>
            <n-skeleton
              style="margin: 8px 0px 0px; width: 500px"
              v-if="loading"
            />
            <p style="margin: 5px 0px 0px">{{ textHitokoto }}</p>
          </div>
        </n-space>
      </n-card>
    </div>

    <!-- 内容面板 -->
    <div style="margin-top: 20px" class="content-grid">
      <div class="left-column">
        <!-- 用户信息卡片 -->
        <NCard title="用户信息" class="info-card">
          <NAlert
            v-if="!IsRealname"
            type="warning"
            title="未实名认证"
            style="margin-bottom: 16px"
          >
            您的账户尚未完成实名认证, 请尽快完成实名认证。
            <br />
            <NButton text type="primary" @click="goToRealname"
              >立即前往</NButton
            >
          </NAlert>
          <UserInfo ref="userInfoRef" @update="handleUserUpdate" />
        </NCard>
      </div>

      <div class="right-column">
        <div class="notice-and-welcome">
          <div class="welcome-card-container">
            <WelcomeCard />
          </div>
          <NCard
            title="通知内容"
            class="notice-card"
            :loading="isNoticeLoading"
          >
            <template #default>
              <div class="notice-scroll">
                <NScrollbar :vertical-rail-style="{ right: '-15px' }">
                  <NCollapse v-if="sortedNotices.length > 0" accordion>
                    <template
                      v-for="(notice, _index) in sortedNotices"
                      :key="notice.id"
                    >
                      <NCollapseItem :title="notice.title" :name="notice.id">
                        <template #header-extra>
                          <div
                            style="display: flex; align-items: center; gap: 8px"
                          >
                            <NTag
                              v-if="notice.top"
                              type="warning"
                              size="small"
                              :bordered="false"
                              >置顶</NTag
                            >
                            <span class="notice-time">{{
                              formatTime(notice.created_at)
                            }}</span>
                          </div>
                        </template>
                        <div
                          class="notice-content"
                          v-html="renderNoticeContent(notice.message)"
                        />
                      </NCollapseItem>
                    </template>
                    <NDivider style="margin: 15px 0px 0px 0px" />
                  </NCollapse>
                  <div v-else class="no-notice">暂无通知</div>
                </NScrollbar>
              </div>
            </template>
          </NCard>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div style="margin-top: 20px">
      <Traffic />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  NCard,
  NAlert,
  NButton,
  NCollapse,
  NCollapseItem,
  NTag,
  NDivider,
  useMessage,
} from 'naive-ui'
import { ref, onMounted, computed, Ref } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { useRouter } from 'vue-router'
import { userApi } from '@/net'
import type { BroadcastData } from '@/net/user/type'
import UserInfo from '@/components/UserInfo.vue'
import Traffic from '@/components/Traffic.vue'
import WelcomeCard from '@/components/WelcomeCard.vue'
import { TrafficType } from '@/types'

const router = useRouter()
const message = useMessage()
const notices = ref<BroadcastData[]>([])
const nickname = localStorage.getItem('nickname') || ''

// 排序后的通知列表（置顶的在前）
const sortedNotices = computed(() => {
  return [...notices.value].sort((a, b) => {
    if (a.top && !b.top) return -1
    if (!a.top && b.top) return 1
    return 0
  })
})

// 用户信息引用
const userInfoRef = ref<{
  userInfo: { isRealname: boolean; avatar: string; signRemainder: number }
} | null>(null)
const statisticRef = ref<{
  getUserTraffic: () => Promise<void>
  traffic: Ref<TrafficType>
} | null>()
// 是否实名认证
const IsRealname = computed(
  () => userInfoRef.value?.userInfo.isRealname ?? false,
)

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
const emojiList = [
  '🌞',
  '🌈',
  '😃',
  '✨',
  '🥳',
  '🎉',
  '🦄',
  '🍀',
  '😺',
  '🚀',
  '🌸',
  '🍉',
  '🧸',
  '🎈',
  '😎',
]
const greetEmoji = ref('')

// 配置 marked
marked.setOptions({
  gfm: true,
  breaks: true,
})

// 前往实名认证
const goToRealname = () => {
  router.push('/dashboard/profile')
}

const handleUserUpdate = () => {
  // 当用户信息更新时调用子组件方法
  statisticRef.value?.getUserTraffic()
}

// 渲染通知内容
const renderNoticeContent = (message: string) => {
  try {
    const html = marked.parse(message) as string
    return DOMPurify.sanitize(html)
  } catch {
    return message
  }
}

// 格式化时间
const formatTime = (timeStr: string) => {
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor(diff / (1000 * 60))

  if (days > 0) return `${days}天前`
  if (hours > 0) return `${hours}小时前`
  if (minutes > 0) return `${minutes}分钟前`
  return '刚刚'
}

// 获取通知
const fetchNotice = async (): Promise<void> => {
  // 开始获取通知，显示加载状态
  isNoticeLoading.value = true
  try {
    const data = await userApi.getBroadcast()
    notices.value = data?.data || []
    isNoticeLoading.value = false
  } catch (err: any) {
    isNoticeLoading.value = false
  }
}

// 获取一言
const getHitokoto = async (): Promise<void> => {
  loading.value = true
  try {
    const data = await userApi.getHitokoto()
    textHitokoto.value = data
    loading.value = false
  } catch (err: any) {
    message.error('获取一言失败:' + err.message)
  }
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
  align-items: stretch;
}

.left-column,
.right-column {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.right-column {
  // 让右侧整体和左侧一样高
  height: 100%;
}

.notice-and-welcome {
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 1 1 0;
  min-height: 0;
}

.notice-card {
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  margin-top: 12px;
}

.notice-card :deep(.n-card__content) {
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.notice-scroll {
  flex: 1 1 0;
  min-height: 0;
  max-height: 100%;
  margin-top: 10px;
}

.notice-scroll :deep(.n-scrollbar) {
  overflow: visible;
}

.notice-scroll :deep(.n-collapse-item) {
  overflow: hidden;
  margin-bottom: 0;
}

.notice-scroll :deep(.n-collapse-item__header) {
  font-size: 18px;
  font-weight: 500;
  border-radius: 8px 8px 0 0;
  display: flex !important;
  justify-content: space-between;
  align-items: center;
}

.notice-scroll :deep(.n-collapse-item__header-main) {
  max-width: 50%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-shrink: 0;
}

.notice-scroll :deep(.n-collapse-item__header-extra) {
  margin-left: auto;
  flex-shrink: 0;
}

.notice-scroll :deep(.n-collapse-item__content-inner) {
  padding: 10px !important;
}

.notice-time {
  font-size: 13px;
  color: var(--n-text-color-3);
  font-weight: normal;
}

.notice-content {
  line-height: 1.8;
  color: var(--n-text-color);
  font-size: 14px;
  word-break: break-word;
}

.notice-content :deep(p) {
  margin: 8px 0;
}

.no-notice {
  text-align: center;
  color: var(--n-text-color-3);
  padding: 40px 0;
  font-size: 14px;
}

.welcome-card-container {
  width: 100%;
  margin: 0;
  padding: 0;
}

.card-container {
  width: 100% !important;
  max-width: none !important;
  min-width: 0 !important;
}

@media (max-width: 768px) {
  .content-grid {
    flex-direction: column;
    gap: 16px;

    .right-column {
      gap: 16px;
      height: auto !important;
    }
  }
  .user-card,
  .info-card,
  .notice-card,
  .welcome-card-container,
  .right-column {
    width: 100% !important;
    max-width: 100%;
    min-width: 0;
  }

  .notice-and-welcome {
    height: auto !important;
    min-height: auto !important;
  }

  .notice-card {
    height: auto !important;
    min-height: 200px !important;
    flex: none !important;
  }

  .notice-card :deep(.n-card__content) {
    flex: none !important;
    min-height: 150px !important;
  }

  .notice-scroll {
    min-height: 150px !important;
    max-height: 300px !important;
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
    .user-card-avatar > div {
      width: 48px !important;
      height: 48px !important;
      border-radius: 50% !important;
      margin-top: 0 !important;
      transform: scale(1.5) !important;
      background-size: cover !important;
      background-position: center !important;
      display: block !important;
    }
    h3,
    p {
      text-align: left !important;
      word-break: break-all;
    }
  }
}
</style>
