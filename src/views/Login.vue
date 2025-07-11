<template>
  <div class="login">
    <NCard class="auth-card">
      <div class="auth-header">
        <div class="title-with-icon">
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
        <div class="checkbox-forgot">
          <NCheckbox v-model:checked="formValue.remember">记住密码</NCheckbox>
          <router-link to="/forget" class="forgot-link">忘记密码？</router-link>
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
        <div class="form-footer register-link">
          <span>还没有账号？</span>
          <router-link to="/register">立即注册</router-link>
        </div>
      </NForm>
    </NCard>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
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
    message.success(data.message)
    loading.value = false
    setTimeout(() => {
      router.push('/dashboard')
    }, 1200)
  } catch (error: any) {
    message.error(error.message || '登录失败')
    loading.value = false
  } finally {
    loading.value = false
  }
}
onMounted(() => {
  // 动态设置Bing背景
  const bgUrl = BING_BG_URL
  const loginEl = document.querySelector('.login') as HTMLElement
  if (loginEl) {
    loginEl.style.backgroundImage = `url('${bgUrl}')`
    loginEl.style.backgroundSize = 'cover'
    loginEl.style.backgroundPosition = 'center'
  }
})
</script>

<style lang="scss" scoped>
@use '../assets/styles/login.scss';
.checkbox-forgot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px; // 根据需要调整间距
}
.login {
  height: 100vh;
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
