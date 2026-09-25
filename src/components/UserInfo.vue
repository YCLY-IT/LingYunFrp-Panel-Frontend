<template>
  <div>
    <div class="max-[600px]:overflow-x-auto">
      <div class="grid grid-cols-2 gap-5 max-[600px]:w-max">
        <template v-if="loading">
          <div v-for="i in 8" :key="i" class="flex flex-col relative p-0.5 gap-2">
            <NSkeleton :sharp="false" size="medium" />
          </div>
        </template>
        <template v-else>
          <div class="flex flex-col relative p-0.5 gap-2">
            <div class="text-sm text-[var(--n-text-color-2)]">用户昵称</div>
            <div class="whitespace-nowrap text-sm text-[var(--n-text-color)]">
              {{ userInfo.nickname }}
            </div>
          </div>

          <div class="ml-5 flex flex-col relative p-0.5 gap-2">
            <div class="text-sm text-[var(--n-text-color-2)]">实名认证</div>
            <div class="whitespace-nowrap text-sm text-[var(--n-text-color)]">
              <NTag
                :type="userInfo.isRealname ? 'success' : 'default'"
                size="small"
              >
                {{ userInfo.isRealname ? '已实名' : '未实名' }}
              </NTag>
            </div>
          </div>

          <div class="flex flex-col relative p-0.5 gap-2">
            <div class="text-sm text-[var(--n-text-color-2)]">用户组</div>
            <div class="whitespace-nowrap text-sm text-[var(--n-text-color)]">
              <NTag type="info" size="small">
                {{ userInfo.friendlyGroup }}
              </NTag>
            </div>
          </div>

          <div class="ml-5 flex flex-col relative p-0.5 gap-2">
            <div class="text-sm text-[var(--n-text-color-2)]">注册时间</div>
            <div class="whitespace-nowrap text-sm text-[var(--n-text-color)]">{{ formattedRegTime }}</div>
          </div>

          <div class="flex flex-col relative p-0.5 gap-2">
            <div class="text-sm text-[var(--n-text-color-2)]">注册邮箱</div>
            <div class="whitespace-nowrap text-sm text-[var(--n-text-color)]">{{ userInfo.email }}</div>
          </div>

          <div class="ml-5 flex flex-col relative p-0.5 gap-2">
            <div class="text-sm text-[var(--n-text-color-2)]">隧道数量</div>
            <div class="whitespace-nowrap text-sm text-[var(--n-text-color)]">
              {{ userInfo.usedProxies }} / {{ userInfo.maxProxies }}
            </div>
          </div>
          <div class="flex flex-col relative p-0.5 gap-2">
            <div class="text-sm text-[var(--n-text-color-2)]">剩余流量</div>
            <div class="whitespace-nowrap text-sm text-[var(--n-text-color)]">
              {{ formattedTraffic }}
            </div>
          </div>
          <div class="ml-5 flex flex-col relative p-0.5 gap-2">
            <div class="text-sm text-[var(--n-text-color-2)]">剩余积分</div>
            <div class="whitespace-nowrap text-sm text-[var(--n-text-color)]">{{ userInfo.point }} 分</div>
          </div>
          <div class="flex flex-col relative p-0.5 gap-2">
            <div class="text-sm text-[var(--n-text-color-2)]">国内入站带宽</div>
            <div class="whitespace-nowrap text-sm text-[var(--n-text-color)]">{{ userInfo.inlimit / 128 }} Mbps</div>
          </div>

          <div class="ml-5 flex flex-col relative p-0.5 gap-2">
            <div class="text-sm text-[var(--n-text-color-2)]">国内出站带宽</div>
            <div class="whitespace-nowrap text-sm text-[var(--n-text-color)]">
              {{ userInfo.outlimit / 128 }} Mbps
            </div>
          </div>
          <div class="flex flex-col relative p-0.5 gap-2">
            <div class="text-sm text-[var(--n-text-color-2)]">海外出站带宽</div>
            <div class="whitespace-nowrap text-sm text-[var(--n-text-color)]">
              {{ userInfo.noCNOutlimit / 128 }} Mbps
            </div>
          </div>
          <div class="ml-5 flex flex-col relative p-0.5 gap-2">
            <div class="text-sm text-[var(--n-text-color-2)]">海外入站带宽</div>
            <div class="whitespace-nowrap text-sm text-[var(--n-text-color)]">
              {{ userInfo.noCNInlimit / 128 }} Mbps
            </div>
          </div>
          <div class="flex flex-col relative p-0.5 gap-2">
            <div class="whitespace-nowrap text-sm text-[var(--n-text-color)]">
              <NSpace class="justify-self-start flex relative mt-[3px]">
                <NButton
                  text
                  type="primary"
                  size="small"
                  @click="handleCopyToken"
                >
                  <template #icon>
                    <CopyPlusIcon />
                  </template>
                  <div style="font-size: 14px">复制令牌</div>
                </NButton>
              </NSpace>
            </div>
          </div>
        </template>
        <NSpace class="ml-5 flex flex-col relative p-0.5 gap-2" vertical :size="4">
          <NButton
            text
            type="primary"
            :loading="signLoading"
            :disabled="!isSignAvailable"
            @click="onSignButtonClick"
          >
            <template #icon>
              <NIcon>
                <CalendarOutline />
              </NIcon>
            </template>
            {{ signButtonText }}
          </NButton>
        </NSpace>
      </div>
    </div>
    <br />
    <NAlert class="flex flex-col relative p-0.5 gap-2" type="info" show-icon>
      <NText depth="3" style="font-size: 13px"
        >签到可以获得<NText type="primary"> 积分</NText> 和
        <NText type="primary">流量 </NText> 噢!(๑´ڡ`๑)
      </NText>
    </NAlert>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import {
  NTag,
  useMessage,
  NSkeleton,
  NButton,
  NIcon,
  NSpace,
  NText,
  NAlert,
  useDialog,
} from 'naive-ui'
import { CalendarOutline } from '@vicons/ionicons5'
import { userApi } from '@/net'
import packageData from '@/../package.json'
import { CopyPlusIcon } from 'lucide-vue-next'
import { GeetestService, loadGeetest } from '@/utils/captcha'
import { UserInfoData } from '@/net/user/type'
import { storeUserInfo } from '@/utils/user'
const emit = defineEmits<{
  (e: 'update'): void
}>()
const dialog = useDialog()
const message = useMessage()
const loading = ref(true)
const signLoading = ref(false)
const isSignAvailable = ref(false)

const userInfo = ref<UserInfoData>({
  avatar: '',
  email: '',
  isRealname: false,
  nickname: '',
  friendlyGroup: '',
  group: '',
  status: '',
  outlimit: 0,
  inlimit: 0,
  noCNOutlimit: 0,
  noCNInlimit: 0,
  traffic: 0,
  maxProxies: 0,
  username: '',
  remainder: 0,
  sign: '',
  signRemainder: 0,
  point: 0,
  regTime: '',
  usedProxies: 0,
  token: '',
})
const formatTime = (isoString: string) => {
  const date = new Date(isoString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

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
const signButtonText = computed(() =>
  signLoading.value ? '签到中...' : isSignAvailable.value ? '签到' : '已签到',
)

const onSignButtonClick = async () => {
  signLoading.value = true
  try {
    const geetestService = new GeetestService(packageData.captcha.Captcha)
    const result = await geetestService.initAndShowCaptchaForBind()
    if (result) {
      signIn(result)
    } else {
      signLoading.value = false
    }
  } catch (e) {
    message.error('验证码加载失败')
  }
}
const signIn = async (geetestResult: GeetestResult) => {
  try {
    const url = `?lotNumber=${geetestResult.lot_number}&passToken=${geetestResult.pass_token}&genTime=${geetestResult.gen_time}&captchaOutput=${geetestResult.captcha_output}`
    const data = await userApi.sign(url)
    if (data.code === 0) {
      dialog.success({
        title: data.message,
        content: `获得 ${data.data.point} 积分, ${data.data.traffic}MB 流量`,
        positiveText: '确定',
        onPositiveClick: () => {
          isSignAvailable.value = false
          emit('update')
          fetchUserInfo()
        },
      })
      isSignAvailable.value = false
      emit('update')
      fetchUserInfo()
    } else {
      message.error(data.message || '签到失败')
    }
    signLoading.value = false
  } catch (error: any) {
    message.error(error.message || '签到失败')
  }
}

const handleCopyToken = async () => {
  try {
    await window.navigator.clipboard.writeText(userInfo.value.token)
    message.success('Token 已复制到剪贴板')
  } catch (err) {
    message.error('复制失败，请手动复制')
  }
}

const fetchUserInfo = async () => {
  loading.value = true
  try {
    const data = await userApi.getUserInfo()
    if (data.code === 0) {
      userInfo.value = data.data
      storeUserInfo(data.data)
      isSignAvailable.value = !data.data.sign
    }
  } catch (error: any) {
    message.error(error.message || '获取用户信息失败')
  }
  loading.value = false
}
onMounted(async () => {
  await fetchUserInfo()
  // 加载极验脚本
  await loadGeetest()
})
defineExpose({
  userInfo,
})
</script>
