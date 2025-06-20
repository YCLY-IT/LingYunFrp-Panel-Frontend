<template>
  <div class="login">
    <NCard class="auth-card">
      <div class="auth-header">
        <div class="title-with-icon">
          <NIcon size="32" :component="LogInOutline" />
          <h1>{{ packageData.title }}</h1>
          <span>后台管理系统</span>
        </div>
        <br>
        <hr>
      </div>
      <NForm ref="formRef" :model="formValue" :rules="rules">
        <NFormItem path="username" label="用户名/邮箱">
          <NInput v-model:value="formValue.username" placeholder="请输入用户名或邮箱" />
        </NFormItem>
        <NFormItem path="password" label="密码">
          <NInput v-model:value="formValue.password" type="password" placeholder="请输入密码" 
                  show-password-on="click" />
        </NFormItem>
        <!-- 新增验证码按钮 -->
        <NFormItem>
          <NButton 
            type="primary" 
            @click="onCaptchaButtonClick"
            :loading="captchaLoading"
            :disabled="captchaVerified"
            block
          >
            {{ captchaVerified ? '已验证' : '进行人机验证' }}
          </NButton>
        </NFormItem>
        <div class="checkbox-forgot">
          <NCheckbox v-model:checked="formValue.remember">记住密码</NCheckbox>
          <router-link to="/forget" class="forgot-link">忘记密码？</router-link>
        </div>
        <NButton :loading="loading" type="primary" block secondary strong @click="onLoginButtonClick">
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
import { NForm, NFormItem, NInput, NButton, NCard, NIcon, type FormRules, useMessage, type FormInst } from 'naive-ui'
import { LogInOutline } from '@vicons/ionicons5'
import { userApi } from '@/net'
import { GeetestService, loadGeetest } from '@/utils/captcha'
import packageData from '@/../package.json'

const router = useRouter()
const message = useMessage()
const formRef = ref<FormInst | null>(null)
const loading = ref(false)
const formValue = ref({
  username: '',
  password: '',
  remember: false
})

const rules: FormRules = {
  username: {
    required: true,
    message: '请输入用户名/邮箱',
    trigger: 'blur'
  },
  password: {
    required: true,
    message: '请输入密码',
    trigger: 'blur'
  }
}

// 新增响应式状态
const captchaLoading = ref(false)
const captchaVerified = ref(false)
let geetestResult: GeetestResult | null = null

// 分离验证码获取逻辑
const onCaptchaButtonClick = async () => {
  captchaLoading.value = true
  const geetestService = new GeetestService(packageData.captcha.Captcha_Id_Login);
  const result = await geetestService.initAndShowCaptchaForBind();
  if (result) {
    geetestResult = result
    captchaVerified.value = true
  } else {
    message.error('验证失败')
  }
  captchaLoading.value = false
}

// 修改原登录按钮逻辑
const onLoginButtonClick = async () => {
  if (!captchaVerified.value || !geetestResult) {
    message.error('请先完成验证码验证')
    return
  }
  loading.value = true
  try {
    await formRef.value?.validate()
    await handleSubmit(geetestResult!)
  } finally {
    loading.value = false
  }
}

const handleSubmit = async (geetestResult: GeetestResult) => {
  await formRef.value?.validate()
  loading.value = true
  try {
    userApi.login(
      formValue.value.username,
      formValue.value.password,
      formValue.value.remember,
      `?lotNumber=${geetestResult.lot_number}&passToken=${geetestResult.pass_token}&genTime=${geetestResult.gen_time}&captchaOutput=${geetestResult.captcha_output}`,
      (data) => {
        localStorage.setItem('username', data.data.username)
        localStorage.setItem('nickname', data.data.nickname)
        localStorage.setItem('avatar', data.data.avatar)
        message.success(data.message)
        loading.value = false
        setTimeout(() => {
          router.push('/dashboard');
        }, 1200)
      },
      (data)=> {
        message.error(data)
        loading.value = false
        // 不自动弹窗，用户需手动点击
      },(err) => {
        message.error(err.response?.data?.message)
        message.warning('请重新进行人机验证')
        captchaVerified.value = false
      }
    )
  } catch (error: any) {
    message.error(error)
    loading.value = false
    captchaVerified.value = false
    message.warning('请重新进行人机验证')
    // 不自动弹窗，用户需手动点击
  } finally {
    loading.value = false
  }
}
onMounted(async () => {
  // 加载极验脚本
  await loadGeetest()
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
  background-image: url('https://dailybing.com/api/v1');
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
  gap: 0px;; // 调整这个值来改变间距
}
</style>