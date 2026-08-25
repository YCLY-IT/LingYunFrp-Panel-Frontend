<template>
  <div class="home gradient-bg">
    <!-- 用户卡片 -->
    <div class="content-info">
      <n-card :loading="loading" class="user-card">
        <n-space>
          <div class="user-card-avatar" @click="handleAvatarClick">
            <div
              :style="{
                backgroundImage: `url(${userInfoRef?.userInfo.avatar})`,
                borderRadius: '64px',
                width: '62px',
                height: '62px',
                marginTop: '1px',
                transform: `scale(1.2) rotate(${rotationDegree}deg)`,
                transition: 'transform 0.5s ease',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'block',
                cursor: 'pointer',
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
                  <div v-if="sortedNotices.length > 0" class="notice-list">
                    <div
                      v-for="(notice, _index) in sortedNotices"
                      :key="notice.id"
                      class="notice-item"
                      @click="showNoticeDetail(notice)"
                    >
                      <div class="notice-item-header">
                        <span class="notice-item-title">{{
                          notice.title
                        }}</span>
                        <div class="notice-item-meta">
                          <NTag
                            v-if="notice.type"
                            :type="
                              notice.type === 'info'
                                ? 'info'
                                : notice.type === 'warning'
                                  ? 'warning'
                                  : 'error'
                            "
                            size="small"
                            :bordered="false"
                            >{{
                              notice.type === 'info'
                                ? '通知'
                                : notice.type === 'warning'
                                  ? '紧急'
                                  : '重要'
                            }}</NTag
                          >
                          <span class="notice-time">{{
                            formatTime(notice.created_at)
                          }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
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

    <!-- 通知详情弹窗 -->
    <NModal
      v-model:show="showNoticeModal"
      preset="card"
      :title="selectedNotice?.title"
      style="width: 600px; max-width: 100vw"
    >
      <template #header-extra>
        <NTag
          v-if="selectedNotice?.type"
          :type="
            selectedNotice.type === 'info'
              ? 'info'
              : selectedNotice.type === 'warning'
                ? 'warning'
                : 'error'
          "
          size="small"
          :bordered="false"
          >{{
            selectedNotice.type === 'info'
              ? '通知'
              : selectedNotice.type === 'warning'
                ? '紧急'
                : '重要'
          }}</NTag
        >
      </template>
      <NScrollbar style="max-height: 430px">
        <div
          class="notice-detail-content"
          v-html="renderNoticeContent(selectedNotice?.message || '')"
        />
      </NScrollbar>
      <template #footer>
        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
          "
        >
          <span class="notice-time">{{
            selectedNotice ? formatTime(selectedNotice.created_at) : ''
          }}</span>
          <NButton @click="showNoticeModal = false">关闭</NButton>
        </div>
      </template>
    </NModal>
  </div>
</template>

<script setup lang="ts">
import {
  NCard,
  NAlert,
  NButton,
  NTag,
  NModal,
  NScrollbar,
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
const showNoticeModal = ref(false)
const selectedNotice = ref<BroadcastData | null>(null)

// 显示通知详情
const showNoticeDetail = (notice: BroadcastData) => {
  selectedNotice.value = notice
  showNoticeModal.value = true
}

// 排序后的通知列表（重要 > 紧急 > 通知）
const sortedNotices = computed(() => {
  const typePriority = { danger: 3, warning: 2, info: 1 }
  return [...notices.value].sort((a, b) => {
    const priorityA = typePriority[a.type as keyof typeof typePriority] || 0
    const priorityB = typePriority[b.type as keyof typeof typePriority] || 0
    return priorityB - priorityA
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

// 彩蛋相关
const easterEggClickCount = ref(0)
const rotationDegree = ref(0)
const easterEggTimer = ref<number | null>(null)

// 彩蛋触发处理
const handleAvatarClick = () => {
  easterEggClickCount.value++

  // 每次点击都旋转360度
  rotationDegree.value += 360

  // 清除之前的定时器
  if (easterEggTimer.value) {
    clearTimeout(easterEggTimer.value)
  }

  // 2秒内没有继续点击则重置计数和旋转
  easterEggTimer.value = window.setTimeout(() => {
    easterEggClickCount.value = 0
    rotationDegree.value = 0
  }, 2000)

  // 连续点击5次触发彩蛋消息
  if (easterEggClickCount.value >= 5) {
    triggerEasterEgg()
    easterEggClickCount.value = 0
  }
}

// 触发彩蛋效果
const triggerEasterEgg = () => {
  if (easterEggTimer.value) {
    clearTimeout(easterEggTimer.value)
  }
}

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

.notice-scroll {
  padding: 4px;
  margin: -4px;
}

.notice-scroll :deep(.n-scrollbar) {
  overflow: visible;
}

.notice-scroll :deep(.n-collapse-item) {
  overflow: hidden;
  margin-bottom: 0;
}

.notice-list {
  padding: 4px;
}

.notice-time {
  font-size: 13px;
  color: var(--n-text-color-3);
  font-weight: normal;
}

.no-notice {
  text-align: center;
  color: var(--n-text-color-3);
  padding: 40px 0;
  font-size: 14px;
}

.notice-item {
  padding: 12px 16px;
  margin-bottom: 8px;
  border-radius: 8px;
  border: 1px solid var(--n-border-color);
  cursor: pointer;
  transition: all 0.2s ease;
}

.notice-item:hover {
  background-color: var(--n-color-hover);
  box-shadow: 0 4px 16px var(--n-color-hover-shadow);
}

.notice-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.notice-item-title {
  font-size: 16px;
  font-weight: 500;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notice-item-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.notice-detail-content {
  line-height: 1.8;
  color: var(--n-text-color);
  font-size: 14px;
  word-break: break-word;
  padding-right: 12px;
}

.notice-detail-content :deep(p) {
  margin: 8px 0;
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
