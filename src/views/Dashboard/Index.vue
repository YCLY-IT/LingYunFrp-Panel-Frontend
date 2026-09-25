<template>
  <div
    class="home gradient-bg min-h-screen transition-[background] duration-500 [&_.n-card-header]:relative [&_.n-card-header]:z-[5] [&_.n-card-header]:box-border [&_.n-card-content]:overflow-hidden [&_.n-card-content]:relative [&_.n-card-content]:z-[1] [&_.n-card-content]:box-border [&_.n-collapse-item]:[--n-item-margin:12px_0_0_0]!"
  >
    <!-- 用户卡片 -->
    <div class="content-info">
      <n-card
        :loading="loading"
        class="user-card w-full max-md:w-full! max-md:max-w-full max-md:min-w-0 max-md:[&_.n-space]:flex! max-md:[&_.n-space]:flex-row! max-md:[&_.n-space]:items-center! max-md:[&_.n-space]:flex-nowrap! max-md:[&_.user-card-avatar]:w-12! max-md:[&_.user-card-avatar]:h-12! max-md:[&_.user-card-avatar]:flex max-md:[&_.user-card-avatar]:items-center max-md:[&_.user-card-avatar]:justify-center max-md:[&_.user-card-avatar]:shrink-0 max-md:[&_.user-card-avatar>div]:w-12! max-md:[&_.user-card-avatar>div]:h-12! max-md:[&_.user-card-avatar>div]:rounded-full! max-md:[&_.user-card-avatar>div]:mt-0! max-md:[&_.user-card-avatar>div]:scale-150! max-md:[&_.user-card-avatar>div]:bg-cover! max-md:[&_.user-card-avatar>div]:bg-center! max-md:[&_.user-card-avatar>div]:block! max-md:[&_h3]:text-left! max-md:[&_h3]:break-all max-md:[&_p]:text-left! max-md:[&_p]:break-all"
      >
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
            <h3
              style="margin: 0px"
              class="max-md:text-base max-md:break-all"
            >
              {{ forTime }}{{ greetEmoji }}，{{ nickname }}
            </h3>
            <n-skeleton
              style="margin: 8px 0px 0px; width: 500px"
              v-if="loading"
            />
            <p
              style="margin: 5px 0px 0px"
              class="max-md:text-[0.95rem] max-md:break-all"
            >
              {{ textHitokoto }}
            </p>
          </div>
        </n-space>
      </n-card>
    </div>

    <!-- 内容面板 -->
    <div
      style="margin-top: 20px"
      class="content-grid flex gap-6 items-stretch max-md:flex-col max-md:gap-4"
    >
      <div class="left-column flex-1 min-w-0 flex flex-col gap-4">
        <NCard title="用户信息" class="info-card w-full">
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

      <!-- 右列脱离文档流，高度完全由左列（用户信息卡片）决定，
           这样「欢迎卡片 + 通知内容」的总高恒等于用户信息卡片高度 -->
      <div
        class="right-column relative flex-1 min-w-0 max-md:gap-4 max-md:h-auto!"
      >
        <div
          class="notice-and-welcome absolute inset-0 flex flex-col min-h-0 max-md:static max-md:h-auto! max-md:min-h-auto!"
        >
          <div
            class="welcome-card-container w-full m-0 p-0 max-md:w-full! max-md:max-w-full max-md:min-w-0"
          >
            <WelcomeCard />
          </div>
          <NCard
            title="通知内容"
            class="notice-card flex-1 min-h-0 flex flex-col mt-3 max-md:min-h-[200px]! max-md:flex-none! max-md:w-full! max-md:max-w-full max-md:min-w-0 [&_.n-card-content]:flex-1 [&_.n-card-content]:min-h-0 [&_.n-card-content]:flex [&_.n-card-content]:flex-col max-md:[&_.n-card-content]:flex-none! max-md:[&_.n-card-content]:min-h-[150px]!"
            :loading="isNoticeLoading"
          >
            <template #default>
              <div
                class="flex-1 min-h-0 max-h-full p-1 -m-1 max-md:min-h-[150px]! max-md:max-h-[300px]! [&_.n-scrollbar]:overflow-hidden [&_.n-scrollbar]:h-full [&_.n-collapse-item]:overflow-hidden [&_.n-collapse-item]:mb-0"
              >
                <NScrollbar>
                  <div v-if="sortedNotices.length > 0" class="p-1 pr-3">
                    <div
                      v-for="(notice, _index) in sortedNotices"
                      :key="notice.id"
                      class="notice-item p-[12px_16px] mb-2 rounded-lg border border-[var(--n-border-color)] cursor-pointer transition-all duration-200 ease-in-out hover:bg-[var(--n-color-hover)] hover:shadow-[0_4px_16px_var(--n-color-hover-shadow)]"
                      @click="showNoticeDetail(notice)"
                    >
                      <div class="flex justify-between items-center gap-3">
                        <span
                          class="text-base font-medium flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
                          >{{
                          notice.title
                        }}</span>
                        <div class="flex items-center gap-2 shrink-0">
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
                          <span class="text-[13px] text-[var(--n-text-color-3)] font-normal">{{
                            formatTime(notice.created_at)
                          }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    v-else
                    class="text-center text-[var(--n-text-color-3)] py-10 text-sm"
                  >
                    暂无通知
                  </div>
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
          class="leading-[1.8] text-[var(--n-text-color)] text-sm break-words pr-3 [&_p]:my-2"
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
          <span class="text-[13px] text-[var(--n-text-color-3)] font-normal">{{
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


