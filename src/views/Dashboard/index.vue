<template>
  <div class="home">
    <div class="welcome-banner">
      欢迎回来, {{ nickname }}
    </div>
    <div class="content-grid">
      <!-- 左侧列：用户信息和广告 -->
      <div class="left-column">
        <NCard title="用户信息" class="info-card">
          <NAlert v-if="IsRealname === false" type="warning" title="未实名认证" style="margin-bottom: 16px">
            您的账户尚未完成实名认证, 请尽快完成实名认证。<br>
            <NButton text type="primary" @click="goToRealname">立即前往</NButton>
          </NAlert>
          <UserInfo ref="userInfoRef" />
        </NCard>
      </div>

      <NCard title="通知内容" class="notice-card">
        <div class="markdown-content" v-html="renderedNotice" />
      </NCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NCard, NAlert, NButton, useMessage } from 'naive-ui'
import { ref, onMounted, computed } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import UserInfo from '../../components/UserInfo.vue'
import { useRouter } from 'vue-router'
import { userApi } from "@/net";
import { accessHandle } from "@/net/base.ts";
import userInfo from "@/components/UserInfo.vue";

const router = useRouter()
const message = useMessage()
const notices = ref<string>('')
const nickname = localStorage.getItem('nickname')
const userInfoRef = ref<null | { userInfo: typeof userInfo }>(null)
const IsRealname = computed(() => userInfoRef.value?.userInfo.isRealname)

// 配置 marked
marked.setOptions({
  gfm: true,
  breaks: true
})

const goToRealname = () => {
  router.push('/dashboard/profile')
}

const renderedNotice = computed(() => {
  if (!notices.value) return ''
  try {
    const html = marked.parse(notices.value) as string
    return DOMPurify.sanitize(html)
  } catch {
    return ''
  }
})

const fetchNotice = async (): Promise<void> => {
  userApi.get('/user/info/broadcast', accessHandle(), (data) => {
    if (data.code === 0) {
      notices.value = data.data.broadcast
    } else {
      message.error(data.message || '获取公告失败')
    }
  }, (error) => {
    message.error('获取公告失败:' + error.message)
  })
}


onMounted(() => {
  fetchNotice()
})
</script>


<style lang="scss" scoped>
@use '../../assets/styles/home.scss';
</style>