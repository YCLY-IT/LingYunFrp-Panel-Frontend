<template>
  <div>
    <div class="user-info-grid">
      <template v-if="loading">
        <div v-for="i in 8" :key="i" class="user-info-item">
          <NSkeleton :sharp="false" size="medium" />
        </div>
      </template>
      <template v-else>
        <div class="user-info-item">
          <div class="user-info-label">用户昵称</div>
          <div class="user-info-value">
              {{ userInfo.nickname }}
          </div>
        </div>

        <div class="user-info-item">
          <div class="user-info-label">实名认证</div>
          <div class="user-info-value">
            <NTag :type="userInfo.isRealname ? 'success' : 'default'" size="small">
              {{ userInfo.isRealname ? '已实名' : '未实名' }}
            </NTag>
          </div>
        </div>

        <div class="user-info-item">
          <div class="user-info-label">用户组</div>
          <div class="user-info-value">
            <NTag type="info" size="small">
              {{ userInfo.friendlyGroup }}
            </NTag>
          </div>
        </div>

        <div class="user-info-item">
          <div class="user-info-label">注册时间</div>
          <div class="user-info-value">{{ formattedRegTime }}</div>
        </div>

        <div class="user-info-item">
          <div class="user-info-label">注册邮箱</div>
          <div class="user-info-value">{{ userInfo.email }}</div>
        </div>

        <div class="user-info-item">
          <div class="user-info-label">隧道数量</div>
          <div class="user-info-value">{{ userInfo.usedProxies }} / {{ userInfo.maxProxies }}</div>
        </div>

        <div class="user-info-item">
          <div class="user-info-label">剩余流量</div>
          <div class="user-info-value">
            {{ formattedTraffic }} </div>
        </div>
        <div class="user-info-item">
          <div class="user-info-label">剩余积分</div>
          <div class="user-info-value">
            {{ userInfo.point }} 分</div>
        </div>
        <div class="user-info-item">
          <div class="user-info-label">入站带宽</div>
          <div class="user-info-value">{{ userInfo.inlimit / 128 }} Mbps</div>
        </div>

        <div class="user-info-item">
          <div class="user-info-label">出站带宽</div>
          <div class="user-info-value">{{ userInfo.outlimit / 128 }} Mbps</div>
        </div>
        <div class="user-info-item">
          <div class="user-info-value">
            <NSpace class="token-section">
              <NButton text type="primary" size="small" @click="handleCopyToken">
                <template #icon>
                  <CopyPlusIcon />
                </template>
                <div style="font-size: 14px;">复制令牌</div>
              </NButton>
            </NSpace>
          </div>
        </div>
      </template>
      <NSpace vertical :size="4">
        <NButton text type="primary" :loading="signLoading" :disabled="!isSignAvailable" @click="handleSign">
          <template #icon>
            <NIcon>
              <CalendarOutline />
            </NIcon>
          </template>
          {{ signButtonText }}
        </NButton>
        <NText depth="3" style="font-size: 13px;">签到可以获得 100-500 积分 和 1-5GB 流量 </NText>
      </NSpace>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { NTag, useMessage, NSkeleton, NButton, NIcon, NSpace, NText } from 'naive-ui'
import { CalendarOutline } from '@vicons/ionicons5'
import {userApi} from "@/net";
import {accessHandle} from "@/net/base.ts";
import { CopyPlusIcon } from 'lucide-vue-next';
const message = useMessage()
const loading = ref(true)
const signLoading = ref(false)
const isSignAvailable = ref(false)

const userInfo = ref({
  userId: 0,
  username: '',
  nickname: '',
  isRealname: false,
  group: '',
  friendlyGroup: '',
  usedProxies: 0,
  maxProxies: 0,
  regTime: '',
  traffic: 0,
  outlimit: 0,
  inlimit: 0,
  email: '',
  point: 0,
  status: 0,
  todaySigned: false,
  token: ''
})

const formatTime = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};


const formatTraffic = (traffic: number) => {
  const value = traffic
  if (isNaN(value)) return traffic
  if (value >= 1024) {
    return `${(value / 1024).toFixed(2)} GB`
  }
  return `${value.toFixed(2)} MB`
}

const formattedRegTime = computed(() => formatTime(userInfo.value.regTime))
const formattedTraffic = computed(() => formatTraffic(userInfo.value.traffic))
const signButtonText = computed(() => signLoading.value ? '签到中...' : (isSignAvailable.value ? '签到' : '已签到'))

// 执行签到
const handleSign = async () => {
  if (!isSignAvailable.value || signLoading.value) return
  signLoading.value = true
  userApi.post('/user/sign', {}, accessHandle(), (data) => {
    if (data.code === 0) {
      message.success(`签到成功, 获得 ${data.data.point} 积分 和 ${data.data.traffic}GB 流量`)
      isSignAvailable.value = false
      // 刷新用户信息以更新流量显示
      fetchUserInfo()
    } else {
      message.error(data.message || '签到失败')
    }
    signLoading.value = false
  }, (error) => {
    message.error(error || '签到失败')
    signLoading.value = false
})
}

const handleCopyToken = async () => {
  try {
    await window.navigator.clipboard.writeText(userInfo.value.token);
    message.success('Token 已复制到剪贴板');
  } catch (err) {
    message.error('复制失败，请手动复制');
  }
};

const fetchUserInfo = async () => {
    loading.value = true

  userApi.get('/user/info/info', accessHandle(), (data) => {
    if (data.code === 0) {
      userInfo.value = data.data
      localStorage.setItem('group', userInfo.value.group)
      localStorage.setItem('token', userInfo.value.token)
      isSignAvailable.value = !data.data.sign
    } else {
      message.error(data.message || '获取用户信息失败')
    }
    loading.value = false
  }, (error) => {
    message.error(error || '获取用户信息失败')
    loading.value = false
  })
}
onMounted(async () => {
  await fetchUserInfo()
})
defineExpose({
  userInfo
})
</script>

<style lang="scss" scoped>
@use '../assets/styles/components/userInfo.scss';
</style>
