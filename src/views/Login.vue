<template>
  <div class="login flex min-h-[calc(100vh-59px)]">
    <NCard
      class="w-full max-w-[420px] bg-transparent backdrop-blur-[8px] rounded-r-2xl! overflow-y-auto"
    >
      <div class="text-center mb-6">
        <div class="flex flex-col justify-center items-center gap-0 [&_svg]:text-[var(--n-primary-color)]">
          <NIcon size="32" :component="LogInOutline" />
          <h1>{{ packageData.title }}</h1>
          <span>后台管理系统</span>
        </div>
        <br />
        <hr />
      </div>
      <NForm ref="formRef" :model="formValue" :rules="rules">
        <NFormItem path="username" label="用户名/邮箱">
          <NInput
            v-model:value="formValue.username"
            placeholder="请输入用户名或邮箱"
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
        <div class="flex justify-between items-center mb-4">
          <NCheckbox v-model:checked="formValue.remember">记住密码</NCheckbox>
          <router-link
            to="/forget"
            class="text-[0.9rem] text-[var(--n-text-color-2)] no-underline transition-all duration-200 ease-in hover:text-[var(--n-primary-color)]"
          >
            忘记密码？
          </router-link>
        </div>
        <NButton
          :loading="loading"
          type="primary"
          block
          secondary
          strong
          @click="onLoginButtonClick"
        >
          登录
        </NButton>
        <div
          class="flex justify-center gap-2 mt-4 [&_span]:text-[var(--n-text-color-2)] [&_a]:text-[var(--n-primary-color)] [&_a]:no-underline [&_a]:transition-all [&_a]:duration-200 [&_a]:ease-in [&_a:hover]:text-[var(--n-primary-color-pressed)]"
        >
          <span>还没有账号？</span>
          <router-link to="/register">立即注册</router-link>
        </div>
      </NForm>
    </NCard>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  NForm,
  NFormItem,
  NInput,
  NButton,
  NCard,
  NIcon,
  type FormRules,
  useMessage,
  type FormInst,
} from 'naive-ui'
import { LogInOutline } from '@vicons/ionicons5'
import { userApi } from '@/net'
import { BING_BG_URL } from '@/constants/bing'
import packageData from '@/../package.json'

const router = useRouter()
const message = useMessage()
const formRef = ref<FormInst | null>(null)
const loading = ref(false)
const formValue = ref({
  username: '',
  password: '',
  remember: false,
})

const rules: FormRules = {
  username: {
    required: true,
    message: '请输入用户名/邮箱',
    trigger: 'blur',
  },
  password: {
    required: true,
    message: '请输入密码',
    trigger: 'blur',
  },
}

// 登录按钮逻辑
const onLoginButtonClick = async () => {
  loading.value = true
  try {
    await formRef.value?.validate()
    await handleSubmit()
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  await formRef.value?.validate()
  loading.value = true
  try {
    const data = await userApi.login({
      username: formValue.value.username,
      password: formValue.value.password,
      remember: formValue.value.remember,
      url: '',
    })
    localStorage.setItem('username', data.data.username)
    localStorage.setItem('nickname', data.data.nickname)
    localStorage.setItem('avatar', data.data.avatar)
    localStorage.setItem('group', data.data.role)
    message.success('登录成功')
    loading.value = false
    setTimeout(() => {
      router.push('/dashboard')
    }, 1000)
  } catch (error: any) {
    message.error(error.message || '登录失败')
    loading.value = false
  } finally {
    loading.value = false
  }
}
onMounted(() => {
  document.body.style.overflowY = 'hidden'
  const bgUrl = BING_BG_URL
  const loginEl = document.querySelector('.login') as HTMLElement
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
