<template>
  <div class="profile-container">
    <NCard title="我的资料" :bordered="false">
      <NSpace vertical>
        <!-- 用户信息展示 -->
        <NCard title="基本信息" size="small">
          <NForm label-placement="left" label-width="100">
            <NGrid cols="1 s:2" responsive="screen">
              <NGi>
                <NFormItem label="用户名">
                  <NText>{{ userInfo.username }}</NText>
                </NFormItem>
                <NFormItem label="电子邮箱">
                  <NText>{{ userInfo.email }}</NText>
                </NFormItem>
              </NGi>
              <NGi>
                <NFormItem label="用户组">
                  <NTag type="info">{{ userInfo.groupFriendlyName }}</NTag>
                </NFormItem>
                <NFormItem label="实名状态">
                  <NTag :type="userInfo.isRealname ? 'success' : 'warning'">
                    {{ userInfo.isRealname ? '已认证' : '未认证' }}
                  </NTag>
                  <NButton v-if="!userInfo.isRealname"
                           text
                           type="primary"
                           @click="router.push('/dashboard/user/profile')"
                           class="ml-2"
                  >
                    立即认证
                  </NButton>
                </NFormItem>
              </NGi>
            </NGrid>
          </NForm>
        </NCard>

        <!-- 修改昵称表单 -->
        <NCard title="修改昵称" size="small">
          <NForm ref="nicknameFormRef" :model="nicknameForm" :rules="nicknameRules">
            <NFormItem label="昵称" path="nickname">
              <NInput v-model:value="nicknameForm.nickname" placeholder="请输入昵称"/>
            </NFormItem>
            <div class="form-actions">
              <NButton type="primary" @click="handleNicknameSubmit">保存修改</NButton>
            </div>
          </NForm>
        </NCard>

        <!-- 修改头像表单 -->
        <NCard title="修改头像" size="small">
          <NForm ref="avatarFormRef" :model="avatarForm">
            <NFormItem label="头像">
              <NUpload
                  v-model:file-list="avatarFiles"
                  accept="image/*"
                  list-type="image-card"
                  :max="1"
                  @OnBeforeUpload="handleBeforeUpload"
              />
            </NFormItem>
            <div class="form-actions">
              <NButton type="primary" @click="handleAvatarSubmit">保存修改</NButton>
            </div>
          </NForm>
        </NCard>

        <!-- 修改用户名表单 -->
        <NCard title="修改用户名" size="small">
          <NForm ref="usernameFormRef" :model="usernameForm" :rules="usernameRules">
            <NFormItem label="新用户名" path="newUsername">
              <NInput v-model:value="usernameForm.newUsername" placeholder="请输入新用户名"/>
            </NFormItem>
            <NFormItem label="邮箱" path="email">
              <NInput v-model:value="usernameForm.email" placeholder="请输入邮箱"/>
              <NButton type="primary" style="margin-left: 8px;" ghost :disabled="isEmailCodeSending || emailCodeCountdown > 0"
                       @click="handleSendEmailCode('UpdateUsername', usernameForm.email)" :loading="isEmailCodeSending">
                {{ emailCodeButtonText }}
              </NButton>
            </NFormItem>
            <NFormItem label="邮箱验证码" path="emailCode">
              <NInput v-model:value="usernameForm.emailCode" placeholder="请输入邮箱验证码"/>
            </NFormItem>
            <div class="form-actions">
              <NButton type="primary" @click="handleUsernameSubmit">保存修改</NButton>
            </div>
          </NForm>
        </NCard>

        <!-- 修改密码表单 -->
        <NCard title="修改密码" size="small">
          <NForm ref="passwordFormRef" :model="passwordForm" :rules="passwordRules">
            <NFormItem label="旧密码" path="oldPassword">
              <NInput v-model:value="passwordForm.oldPassword" placeholder="请输入旧密码"/>
            </NFormItem>
            <NFormItem label="新密码" path="newPassword">
              <NInput v-model:value="passwordForm.newPassword" placeholder="请输入新密码"/>
            </NFormItem>
            <NFormItem label="确认密码" path="confirmPassword">
              <NInput v-model:value="passwordForm.confirmPassword" placeholder="请确认新密码"/>
            </NFormItem>
            <div class="form-actions">
              <NButton type="primary" @click="handlePasswordSubmit">保存修改</NButton>
            </div>
          </NForm>
        </NCard>
      </NSpace>
    </NCard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  NCard,
  NForm,
  NFormItem,
  NInput,
  NUpload,
  NTag,
  NButton,
  useMessage,
  type FormInst
} from 'naive-ui'
import type { FormRules, UploadFileInfo } from 'naive-ui'
import { userApi } from '@/net'
import { accessHandle, removeToken } from '@/net/base.ts'

interface UserInfo {
  username: string
  email: string
  nickname: string
  groupFriendlyName: string
  isRealname: boolean
  avatar?: string
}

// 用户信息
const userInfo = ref<UserInfo>({
  username: '',
  email: '',
  nickname: '',
  groupFriendlyName: '普通用户',
  isRealname: false
})

// 昵称表单
const nicknameFormRef = ref<FormInst | null>(null)
const nicknameForm = ref({
  nickname: ''
})
const nicknameRules: FormRules = {
  nickname: [
    { required: true, message: '请输入昵称' },
    { min: 2, max: 16, message: '长度需在2-16个字符之间' }
  ]
}

// 头像表单
const avatarFormRef = ref<FormInst | null>(null)
const avatarForm = ref({})
const avatarFiles = ref<UploadFileInfo[]>([])

// 用户名表单
const usernameFormRef = ref<FormInst | null>(null)
const usernameForm = ref({
  currentUsername: '',
  newUsername: '',
  email: '',
  emailCode: ''
})
const usernameRules: FormRules = {
  newUsername: [
    { required: true, message: '请输入新用户名' },
    { pattern: /^[a-zA-Z0-9_]{2,16}$/, message: '用户名只能包含字母、数字和下划线，长度为2-16个字符' }
  ],
  email: [
    { required: true, message: '请输入邮箱' },
    { type: 'email', message: '请输入有效的邮箱地址' }
  ],
  emailCode: [
    { required: true, message: '请输入邮箱验证码' }
  ]
}

// 密码表单
const passwordFormRef = ref<FormInst | null>(null)
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})
const passwordRules: FormRules = {
  oldPassword: [
    { required: true, message: '请输入旧密码' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码' },
    { min: 6, message: '密码长度不能少于6位' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码' }
  ],
  email: [
    { required: true, message: '请输入邮箱' },
    { type: 'email', message: '请输入有效的邮箱地址' }
  ],
  emailCode: [
    { required: true, message: '请输入邮箱验证码' }
  ]
}

// 邮箱验证码相关
const isEmailCodeSending = ref(false)
const emailCodeCountdown = ref(0)
const emailCodeButtonText = computed(() => {
  if (isEmailCodeSending.value) return '发送中...'
  if (emailCodeCountdown.value > 0) return `${emailCodeCountdown.value}s后重试`
  return '获取验证码'
})

const startEmailCodeCountdown = () => {
  emailCodeCountdown.value = 60
  const timer = setInterval(() => {
    emailCodeCountdown.value--
    if (emailCodeCountdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

function handleSendEmailCode(module: string, email: string) {
  if (!email) {
    message.error('请输入邮箱')
    return
  }
  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
    message.error('请输入有效的邮箱地址')
    return
  }

  isEmailCodeSending.value = true
  userApi.sendEmailCode(
      email,
      module,
      (data) => {
        message.success(data.message)
        startEmailCodeCountdown()
        isEmailCodeSending.value = false
      },
      (error) => {
        message.error(error)
        isEmailCodeSending.value = false
      }
  )
}

// 头像上传前校验
const handleBeforeUpload = (file: UploadFileInfo) => {
  if (!file.file?.type.startsWith('image/')) {
    message.error('只能上传图片文件')
    return false
  }
  if (file.file.size > 2 * 1024 * 1024) {
    message.error('图片大小不能超过2MB')
    return false
  }
  return true
}

// 提交昵称
const handleNicknameSubmit = async () => {
  if (!nicknameFormRef.value) return
  await nicknameFormRef.value.validate()
  userApi.post(`/user/update/nickname/${nicknameForm.value.nickname}`, {
  }, accessHandle(), (data) => {
    if (data.code === 0) {
      localStorage.setItem('nickname', nicknameForm.value.nickname)
      message.success('昵称更新成功')
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } else {
      message.error('昵称更新失败')
    }
  })
}

// 提交头像
const handleAvatarSubmit = async () => {
  if (avatarFiles.value.length === 0) {
    message.error('请上传头像')
    return
  }

  const avatarFile = avatarFiles.value[0].file as File | undefined
  if (!avatarFile) {
    message.error('文件上传异常，请重新选择')
    return
  }

  const formData = new FormData()
  formData.append('avatar', avatarFile)
  userApi.post('/user/update/avatar', formData, accessHandle(), (data) => {
    if (data.code === 0) {
      localStorage.setItem('avatar', data.path)
      message.success('头像更新成功')
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } else {
      message.error('头像更新失败')
    }
  }, () => {
    message.error('头像更新失败')
  })
}

// 提交用户名
const handleUsernameSubmit = async () => {
  if (!usernameFormRef.value) return
  await usernameFormRef.value.validate()
  userApi.post('/user/update/username', {
    currentUsername: usernameForm.value.currentUsername,
    newUsername: usernameForm.value.newUsername,
    email: usernameForm.value.email,
    emailCode: usernameForm.value.emailCode
  }, accessHandle(), (data) => {
    if (data.code === 0) {
      message.success('用户名更新成功')
      removeToken()
      router.push('/login')
      fetchUserInfo()
    } else {
      message.error('用户名更新失败')
    }
  })
}

// 提交密码
const handlePasswordSubmit = async () => {
  if (!passwordFormRef.value) return
  await passwordFormRef.value.validate()
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    message.error('两次输入的密码不一致')
    return
  }
  if (passwordForm.value.newPassword === passwordForm.value.oldPassword) {
    message.error('新密码不能与旧密码相同')
    return
  }
  userApi.post('/user/update/password', {
    oldPassword: passwordForm.value.oldPassword,
    newPassword: passwordForm.value.newPassword,
    confirmPassword: passwordForm.value.confirmPassword,
  }, accessHandle(), (data) => {
    if (data.code === 0) {
      message.success('密码更新成功')
      passwordForm.value.oldPassword = ''
      passwordForm.value.newPassword = ''
      passwordForm.value.confirmPassword = ''
      removeToken()
      router.push('/login')
    } else {
      message.error('密码更新失败')
    }
  })
}

// 获取用户信息
const fetchUserInfo = async () => {
  userApi.get('/user/info/info', accessHandle(), (data) => {
    if (data.code === 0) {
      userInfo.value = {
        ...data.data,
        groupFriendlyName: groupNameMap.value[data.data.group] || data.data.group
      }
      nicknameForm.value.nickname = data.data.nickname
      usernameForm.value.currentUsername = data.data.username
    }
  })
}

// 获取用户组信息
const groupNameMap = ref<Record<string, string>>({})
const fetchUserGroups = async () => {
  userApi.get("/user/info/groups", accessHandle(), (data) => {
    if (data.code === 0 && data.data?.groups) {
      groupNameMap.value = data.data.groups.reduce((acc, group) => {
        acc[group.name] = group.friendlyName
        return acc
      }, {} as Record<string, string>)
    }
  })
}


// 初始化
const router = useRouter()
const message = useMessage()
onMounted(async () => {
  await fetchUserGroups()
  await fetchUserInfo()
})
</script>

<style lang="scss">
.profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;

  .form-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 24px;
  }

  .ml-2 {
    margin-left: 8px;
  }
  .n-card {
    margin-bottom: 10px;
  }
}
</style>