<template>
  <div class="forget">
    <NCard class="auth-card">
      <div class="auth-header">
        <div class="title-with-icon">
          <NIcon size="32" :component="PersonAddOutline" />
          <h1>LINGYUNFRP</h1>
          <span>后台管理系统</span>
        </div>
        <br />
        <hr />
      </div>
      <NForm ref="formRef" :model="formValue" :rules="rules">
        <NFormItem path="email" label="邮箱">
          <NInputGroup>
            <NInput
              v-model:value="formValue.email"
              placeholder="请输入邮箱"
              :disabled="emailCodeCountdown > 0"
            />
            <NButton
              type="info"
              ghost
              :disabled="isEmailCodeSending || emailCodeCountdown > 0"
              @click="handleSendEmailCode"
              :loading="isEmailCodeSending"
            >
              <template #icon>
                <NIcon :component="MailOutline" />
              </template>
              {{ emailCodeButtonText }}
            </NButton>
          </NInputGroup>
        </NFormItem>
        <NFormItem path="emailCode" label="验证码">
          <NInput
            v-model:value="formValue.emailCode"
            placeholder="请输入邮箱验证码"
          />
        </NFormItem>

        <NFormItem path="password" label="密码">
          <NInput
            v-model:value="formValue.password"
            type="password"
            placeholder="请输入密码"
            show-password-on="click"
          />
        </NFormItem>
        <NFormItem path="confirmPassword" label="确认密码">
          <NInput
            v-model:value="formValue.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            show-password-on="click"
          />
        </NFormItem>
        <NButton
          type="primary"
          block
          secondary
          strong
          @click="onForgetButtonClick"
          :loading="isSubmitting"
        >
          {{ isSubmitting ? '提交中...' : '提交' }}
        </NButton>
        <div class="form-footer login-link">
          <span>我才没有忘记呢, 我要</span>
          <RouterLink to="/login">立即登录</RouterLink>
        </div>
      </NForm>
    </NCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  NForm,
  NFormItem,
  NInput,
  NButton,
  NCard,
  NIcon,
  NInputGroup,
  type FormRules,
  useMessage,
  type FormInst,
} from 'naive-ui'
import { PersonAddOutline, MailOutline } from '@vicons/ionicons5'
import { userApi } from '@/net'
import { GeetestService, loadGeetest } from '@/utils/captcha'
import packageData from '@/../package.json'
import { BING_BG_URL } from '@/constants/bing'

const router = useRouter()
const message = useMessage()

const formRef = ref<FormInst | null>(null)
const isSubmitting = ref(false)
const isEmailCodeSending = ref(false)
const emailCodeCountdown = ref(0)

// 新增验证状态
const captchaLoading = ref(false)
const captchaVerified = ref(false)
let geetestResult: GeetestResult | null = null

const formValue = ref({
  username: '',
  email: '',
  emailCode: '',
  password: '',
  confirmPassword: '',
})

const emailCodeButtonText = computed(() => {
  if (isEmailCodeSending.value) return '发送中...'
  if (emailCodeCountdown.value > 0) return `${emailCodeCountdown.value}s后重试`
  return '获取验证码'
})

const rules: FormRules = {
  email: {
    required: true,
    message: '请输入邮箱',
    trigger: 'blur',
    type: 'email',
  },
  emailCode: {
    required: true,
    message: '请输入验证码',
    trigger: 'blur',
  },
  password: {
    required: true,
    message: '请输入密码',
    trigger: 'blur',
  },
  confirmPassword: {
    required: true,
    message: '请再次输入密码',
    trigger: 'blur',
    validator: (_rule: any, value: string) => {
      return (
        value === formValue.value.password || new Error('两次输入的密码不一致')
      )
    },
  },
}

const startEmailCodeCountdown = () => {
  emailCodeCountdown.value = 60
  const timer = setInterval(() => {
    emailCodeCountdown.value--
    if (emailCodeCountdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

const handleSendEmailCode = async () => {
  if (!formValue.value.email) {
    message.error('请输入邮箱')
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValue.value.email)) {
    message.error('请输入有效的邮箱地址')
    return
  }

  // 先进行人机验证
  captchaLoading.value = true
  try {
    const geetestService = new GeetestService(packageData.captcha.Captcha)
    const result = await geetestService.initAndShowCaptchaForBind()
    if (result) {
      geetestResult = result
      captchaVerified.value = true

      // 人机验证通过后发送邮件验证码
      isEmailCodeSending.value = true
      try {
        const url = `?lotNumber=${result.lot_number}&passToken=${result.pass_token}&genTime=${result.gen_time}&captchaOutput=${result.captcha_output}`
        const data = await userApi.sendEmailCode(
          formValue.value.email,
          'forget',
          url,
        )
        if (data.code === 0) {
          message.success(data.message)
          startEmailCodeCountdown()
          formValue.value.emailCode = ''
        } else {
          message.error(data.message || '验证码发送失败')
        }
      } catch (error: any) {
        message.error(error.message || '验证码发送失败')
      } finally {
        isEmailCodeSending.value = false
      }
    }
  } catch (error) {
    message.error('人机验证失败，请重试')
  } finally {
    captchaLoading.value = false
  }
}

// 修改提交逻辑
const onForgetButtonClick = async () => {
  if (!geetestResult) {
    message.error('验证信息已过期，请重新验证')
    return
  }

  try {
    await formRef.value?.validate()
    isSubmitting.value = true
    handleSubmit()
  } catch (error) {
    isSubmitting.value = false
  }
}

const handleSubmit = async () => {
  await formRef.value?.validate()
  isSubmitting.value = true
  try {
    const data = await userApi.forget({
      email: formValue.value.email,
      password: formValue.value.password,
      code: formValue.value.emailCode,
    })
    if (data.code === 0) {
      message.success(data.message)
      setTimeout(() => {
        router.push('/login')
      }, 1200)
    } else {
      message.error(data.message || '重置密码失败')
      captchaVerified.value = false
    }
  } catch (error: any) {
    message.error(error.message || '重置密码失败')
    message.warning('请重新进行人机验证')
    captchaVerified.value = false
  } finally {
    isSubmitting.value = false
  }
}
onMounted(async () => {
  // 加载极验脚本
  await loadGeetest()
  const bgUrl = BING_BG_URL
  const loginEl = document.querySelector('.forget') as HTMLElement
  if (loginEl) {
    loginEl.style.backgroundImage = `url('${bgUrl}')`
    loginEl.style.backgroundSize = 'cover'
    loginEl.style.backgroundPosition = 'center'
  }
})
</script>

<style lang="scss" scoped>
@use '../assets/styles/register.scss';

.forget {
  display: flex;
}
.auth-card {
  background-color: transparent;
  backdrop-filter: blur(8px);
  border-radius: 16px;
}
.title-with-icon {
  display: flex;
  align-items: center;
  gap: 0px; // 调整这个值来改变间距
}
</style>
