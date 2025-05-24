<template>
  <div class="home">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      欢迎回来, {{ nickname }}
    </div>

    <!-- 用户卡片 -->
    <div class="content-info">
      <n-card :loading="loading" class="user-card">
        <n-space>
          <div class="user-card-avatar">
            <img style="margin-top: 1px; height: 64px; border-radius: 64px; transform: scale(1.2);" :src="userInfoRef?.userInfo.avatar" alt="用户头像" />
          </div>
          <div style="margin-left: 16px; text-align: left; margin-top: 5px;">
            <h3 style="margin: 0px;">{{ forTime }}，{{ nickname }}</h3>
            <n-skeleton style="margin: 8px 0px 0px; width: 500px;" v-if="loading" />
            <p style="margin: 5px 0px 0px;">{{ textHitokoto }}</p>
          </div>
        </n-space>
      </n-card>
    </div>

    <!-- 统计卡片 -->
    <div style="margin-top: 20px;">
      <n-grid style="margin-top: 15px" cols="1 s:2 m:4" responsive="screen" :x-gap="15" :y-gap="20">
        <n-gi v-for="(card, index) in cards" :key="index">
          <n-card :title="card.title" size="small">
            <n-flex justify="space-between">
              <n-icon style="margin-top: 5px;" size="32">
                <component :is="card.icon" />
              </n-icon>
              <n-statistic tabular-nums>
                <template v-if="card.suffix" #suffix>
                  {{ card.suffix }}
                </template>
              </n-statistic>
            </n-flex>
          </n-card>
        </n-gi>
      </n-grid>
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
      <NCard title="通知内容" class="notice-card">
        <div class="markdown-content" v-html="renderedNotice" />
      </NCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NCard, NAlert, NButton, useMessage } from 'naive-ui'
import { ref, onMounted, computed, markRaw } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { useRouter } from 'vue-router'
import { userApi } from "@/net"
import { accessHandle } from "@/net/base"
import UserInfo from "@/components/UserInfo.vue"
import { Traffic } from '../../types/User'
import { ArrowDownCircleOutline, ArrowUpCircleOutline, BarChartOutline, CalendarOutline, GlobeOutline } from '@vicons/ionicons5'

const router = useRouter()
const message = useMessage()
const notices = ref('')
const nickname = localStorage.getItem('nickname') || ''

// 用户信息引用
const userInfoRef = ref<{ userInfo: { isRealname: boolean; avatar: string; signRemainder: number; } } | null>(null)

// 是否实名认证
const IsRealname = computed(() => userInfoRef.value?.userInfo.isRealname || false)

// 一言和流量数据
const textHitokoto = ref('')
const traffic = ref<Traffic>({} as Traffic)
const loading = ref(false)

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

// 格式化流量
const formatTraffic = (traffic: number) => {
  if (isNaN(traffic)) return traffic
  if (traffic >= 1024) {
    return `${(traffic / 1024).toFixed(2)} GB`
  }
  return `${traffic.toFixed(2)} MB`
}

// 卡片数据
const cards = computed(() => [
  {
    title: '总流量',
    icon: markRaw(GlobeOutline),
    precision: 2,
    suffix: formatTraffic(traffic.value.allTraffic || 0),
  },
  {
    title: '总使用',
    icon: markRaw(ArrowDownCircleOutline),
    precision: 2,
    suffix: formatTraffic(traffic.value.allUsedTraffic || 0),
  },
  {
    title: '今日使用',
    icon: markRaw(BarChartOutline),
    precision: 2,
    suffix: formatTraffic(traffic.value.todayUsedTraffic || 0),
  },
  {
    title: '签到次数',
    icon: markRaw(CalendarOutline),
    precision: 2,
    suffix: userInfoRef.value?.userInfo.signRemainder,
  }
])

// 配置 marked
marked.setOptions({
  gfm: true,
  breaks: true
})

// 前往实名认证
const goToRealname = () => {
  router.push('/dashboard/profile')
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

const handleUserUpdate = () => {
  getUserTraffic()
}

// 获取通知
const fetchNotice = async (): Promise<void> => {
  userApi.get('/user/info/broadcast', accessHandle(), (data) => {
    if (data.code === 0) {
      notices.value = data.data.broadcast
    } else {
      message.error(data.message || '获取公告失败')
    }
  }, (messageText) => {
    message.error('获取公告失败:' + messageText)
  })
}

// 获取一言
const getHitokoto = async (): Promise<void> => {
  loading.value = true
  userApi.getHitokoto({}, (data) => {
    textHitokoto.value = data.hitokoto
    loading.value = false
  })
}

// 获取用户流量
const getUserTraffic = async (): Promise<void> => {
  userApi.get('/user/info/traffic', accessHandle(), (data) => {
    traffic.value = data.data
  }, (messageText) => {
    message.error('获取用户流量失败:' + messageText)
  })
}

// 页面挂载后执行
onMounted(() => {
  fetchNotice()
  getHitokoto()
  getUserTraffic()
})
</script>

<style lang="scss" scoped>
@use '../../assets/styles/home.scss';
</style>