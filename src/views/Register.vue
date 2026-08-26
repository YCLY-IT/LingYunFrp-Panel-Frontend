<template>
  <div class="register">
    <NCard class="auth-card">
      <div class="auth-header">
        <div class="title-with-icon">
          <NIcon size="32" :component="PersonAddOutline" />
          <h1>{{ packageData.title }}</h1>
          <span>后台管理系统</span>
        </div>
        <br />
        <hr />
      </div>
      <NSteps :current="current" :status="stepStatus" class="register-steps">
        <NStep title="账户信息" />
        <NStep title="邮箱验证" />
        <NStep title="设置密码" />
      </NSteps>
      <NForm
        ref="formRef"
        :model="formValue"
        :rules="rules"
        class="register-form"
      >
        <div v-show="current === 1">
          <NFormItem path="username" label="用户名">
            <NInput
              v-model:value="formValue.username"
              placeholder="请输入用户名"
            />
          </NFormItem>
          <NFormItem path="nickname" label="昵称">
            <NInput
              v-model:value="formValue.nickname"
              placeholder="请输入昵称"
            />
          </NFormItem>
        </div>

        <div v-show="current === 2">
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
        </div>

        <div v-show="current === 3">
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
          <div class="form-footer">
            <span>注册即代表您同意我们的</span>
            <RouterLink to="/terms">服务条款</RouterLink>
            <span>与</span>
            <RouterLink to="/privacy">隐私政策</RouterLink>
          </div>
        </div>

        <div class="steps-action">
          <NButton v-if="current > 1" secondary strong @click="prevStep">
            上一步
          </NButton>
          <NButton
            v-if="current < 3"
            type="primary"
            secondary
            strong
            :loading="stepValidating"
            @click="nextStep"
          >
            下一步
          </NButton>
          <NButton
            v-else
            type="primary"
            secondary
            strong
            :loading="isSubmitting"
            @click="onRegisterButtonClick"
          >
            注册
          </NButton>
        </div>

        <div class="form-footer login-link">
          <span>已有账号？</span>
          <RouterLink to="/login">立即登录</RouterLink>
        </div>
      </NForm>
    </NCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  NForm,
  NFormItem,
  NInput,
  NButton,
  NCard,
  NIcon,
  NInputGroup,
  NSteps,
  NStep,
  type FormRules,
  useMessage,
  type FormInst,
  type FormValidationError,
  type FormItemRule,
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
const stepValidating = ref(false)

const current = ref(1)
const stepStatus = ref<'process' | 'finish' | 'error'>('process')

const formValue = ref({
  username: '',
  nickname: '',
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

const stepFields: Record<number, string[]> = {
  1: ['username', 'nickname'],
  2: ['email', 'emailCode'],
  3: ['password', 'confirmPassword'],
}

const rules: FormRules = {
  username: {
    key: 'username',
    required: true,
    message: '请输入用户名',
    trigger: 'blur',
  },
  nickname: {
    key: 'nickname',
    required: true,
    message: '请输入昵称',
    trigger: 'blur',
  },
  email: {
    key: 'email',
    required: true,
    message: '请输入邮箱',
    trigger: 'blur',
    type: 'email',
  },
  emailCode: {
    key: 'emailCode',
    required: true,
    message: '请输入验证码',
    trigger: 'blur',
  },
  password: {
    key: 'password',
    required: true,
    message: '请输入密码',
    trigger: 'blur',
  },
  confirmPassword: {
    key: 'confirmPassword',
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

  captchaLoading.value = true
  try {
    const geetestService = new GeetestService(packageData.captcha.Captcha)
    const result = await geetestService.initAndShowCaptchaForBind()
    if (result) {
      geetestResult = result
      captchaVerified.value = true

      isEmailCodeSending.value = true
      try {
        const url = `?lotNumber=${result.lot_number}&passToken=${result.pass_token}&genTime=${result.gen_time}&captchaOutput=${result.captcha_output}`
        const data = await userApi.sendEmailCode(
          formValue.value.email,
          'register',
          url,
        )
        if (data.code === 0) {
          message.success('验证码发送成功')
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

const validateStep = (step: number) => {
  const fields = stepFields[step]
  return new Promise<boolean>((resolve) => {
    formRef.value?.validate(
      (errors: FormValidationError[] | undefined) => {
        resolve(!errors)
      },
      (rule: FormItemRule) => {
        return fields.includes(rule.key ?? '')
      },
    )
  })
}

const nextStep = async () => {
  stepValidating.value = true
  stepStatus.value = 'process'
  try {
    const ok = await validateStep(current.value)
    if (ok) {
      current.value++
      stepStatus.value = 'process'
    } else {
      stepStatus.value = 'error'
    }
  } finally {
    stepValidating.value = false
  }
}

const prevStep = () => {
  if (current.value > 1) {
    current.value--
    stepStatus.value = 'process'
  }
}

const handleSubmit = async () => {
  await formRef.value?.validate()
  isSubmitting.value = true
  try {
    const data = await userApi.register({
      username: formValue.value.username,
      nickname: formValue.value.nickname,
      password: formValue.value.password,
      email: formValue.value.email,
      code: formValue.value.emailCode,
    })
    if (data.code === 0) {
      message.success('注册成功')
      setTimeout(() => {
        router.push('/login')
      }, 1200)
    } else {
      message.error(data.message || '注册失败')
      captchaVerified.value = false
    }
  } catch (error: any) {
    message.error(error.message || '注册失败')
    captchaVerified.value = false
  } finally {
    isSubmitting.value = false
  }
}

const captchaLoading = ref(false)
const captchaVerified = ref(false)
let geetestResult: GeetestResult | null = null

const onRegisterButtonClick = async () => {
  if (!geetestResult) {
    message.error('验证信息已失效，请重新验证')
    return
  }

  try {
    await handleSubmit()
  } catch (error) {
    message.error('注册验证失败')
  }
}
onMounted(async () => {
  document.body.style.overflowY = 'hidden'
  await loadGeetest()
  const bgUrl = BING_BG_URL
  const loginEl = document.querySelector('.register') as HTMLElement
  if (loginEl) {
    loginEl.style.backgroundImage = `url('${bgUrl}')`
    loginEl.style.backgroundSize = 'cover'
    loginEl.style.backgroundPosition = 'center'
  }
})

onUnmounted(() => {
  document.body.style.overflowY = ''
})
</script>

<style lang="scss" scoped>
@use '../assets/styles/auth.scss';

.register {
  display: flex;
  min-height: calc(100vh - 59px);
}

.auth-card {
  background-color: transparent;
  backdrop-filter: blur(8px);
  border-radius: 0 16px 16px 0 !important;
  overflow-y: auto;
}

.title-with-icon {
  display: flex;
  align-items: center;
  gap: 0px;
}

.register-steps {
  margin-bottom: 24px;
}

.register-form {
  margin-top: 8px;
}

.steps-action {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}
.steps-action :deep(.n-button) {
  flex: 1;
  min-width: 0;
}
.register {
  overflow-x: hidden;
}
.auth-card {
  overflow-x: hidden;
}
</style>
