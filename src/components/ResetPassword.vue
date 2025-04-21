<template>
  <div class="forget">
    <NCard class="auth-card">
      <div class="auth-header">
        <div class="title-with-icon">
          <NIcon size="32" :component="PersonAddOutline" />
          <h1>LINGYUNFRP</h1>
          <span>后台管理系统</span>
        </div>
        <br>
        <hr>
      </div>
      <NForm ref="formRef" :model="formValue" :rules="rules">
        <NFormItem path="username" label="用户名">
          <NInput v-model:value="formValue.username" placeholder="请输入用户名" />
        </NFormItem>
        <NFormItem path="email" label="邮箱">
          <NInputGroup>
            <NInput v-model:value="formValue.email" placeholder="请输入邮箱" :disabled="emailCodeCountdown > 0"/>
            <NButton type="primary" ghost :disabled="isEmailCodeSending || emailCodeCountdown > 0"
                     @click="handleSendEmailCode" :loading="isEmailCodeSending">
              {{ emailCodeButtonText }}
            </NButton>
          </NInputGroup>
        </NFormItem>
        <NFormItem path="emailCode" label="验证码">
          <NInput v-model:value="formValue.emailCode" placeholder="请输入邮箱验证码" />
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
            @click="handleSubmit"
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { NForm, NFormItem, NInput, NButton, NCard, NIcon, NInputGroup, type FormRules, useMessage, type FormInst } from 'naive-ui'
import {PersonAddOutline} from '@vicons/ionicons5'
import {userApi} from "@/net";

const router = useRouter()
const message = useMessage()

const formRef = ref<FormInst | null>(null)
const isSubmitting = ref(false)
const isEmailCodeSending = ref(false)
const emailCodeCountdown = ref(0)

const formValue = ref({
  username: '',
  email: '',
  emailCode: '',
  password: '',
  confirmPassword: ''
})

const emailCodeButtonText = computed(() => {
  if (isEmailCodeSending.value) return '发送中...'
  if (emailCodeCountdown.value > 0) return `${emailCodeCountdown.value}s后重试`
  return '获取验证码'
})

const rules: FormRules = {
  username: {
    required: true,
    message: '请输入用户名',
    trigger: 'blur'
  },
  email: {
    required: true,
    message: '请输入邮箱',
    trigger: 'blur',
    type: 'email'
  },
  emailCode: {
    required: true,
    message: '请输入验证码',
    trigger: 'blur'
  },
  password: {
    required: true,
    message: '请输入密码',
    trigger: 'blur'
  },
  confirmPassword: {
    required: true,
    message: '请再次输入密码',
    trigger: 'blur',
    validator: (_rule: any, value: string) => {
      return value === formValue.value.password || new Error('两次输入的密码不一致')
    }
  }
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

  isEmailCodeSending.value = true
  userApi.sendEmailCode(
      formValue.value.email,
      "forget",
      (data) => {
        message.success(data.message)
        startEmailCodeCountdown()
        formValue.value.emailCode = ''
        isEmailCodeSending.value = false // 确保发送成功后将状态设置为false
      },
      (error) => {
        message.error(error.message)
        isEmailCodeSending.value = false // 发送失败后也需要将状态设置为false
      },
  )
}


const handleSubmit = async () => {
  await formRef.value?.validate()
  isSubmitting.value = true
  userApi.forget(
      formValue.value.username,
      formValue.value.password,
      formValue.value.email,
      formValue.value.emailCode,
      (data) => {
        message.success(data.message)
        setTimeout(() => {
          router.push('/login');
        }, 1200);
      },
      (message) => {
        message.error(message);
      }
  )
}
</script>

<style lang="scss" scoped>
@use '../assets/styles/register.scss';

.forget {
  background-image: url('https://dailybing.com/api/v1');
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
  gap: 0px;; // 调整这个值来改变间距
}
</style>