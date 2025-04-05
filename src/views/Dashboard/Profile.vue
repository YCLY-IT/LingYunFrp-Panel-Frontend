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
                  <NTag type="info">{{ userInfo.friendlyGroup }}</NTag>
                </NFormItem>
                <NFormItem label="实名状态">
                  <NTag :type="userInfo.isRealname ? 'success' : 'warning'">
                    {{ userInfo.isRealname ? '已认证' : '未认证' }}
                  </NTag>
                  <NButton v-if="!userInfo.isRealname"
                           text
                           type="primary"
                           @click="router.push('/dashboard/realname')"
                           class="ml-2"
                  >
                    立即认证
                  </NButton>
                </NFormItem>
              </NGi>
            </NGrid>
          </NForm>
        </NCard>

        <!-- 修改信息表单 -->
        <NCard title="修改资料" size="small">
          <NForm ref="formRef"
                 :model="formValue"
                 :rules="rules"
                 @submit.prevent="handleSubmit"
          >
            <NFormItem label="昵称" path="nickname">
              <NInput v-model:value="formValue.nickname" placeholder="请输入昵称"/>
            </NFormItem>

            <NFormItem label="头像" path="avatar">
              <NUpload
                  v-model:file-list="avatarFiles"
                  accept="image/*"
                  list-type="image-card"
                  :max="1"
                  @before-upload="handleBeforeUpload"
              />
            </NFormItem>

            <div class="form-actions">
              <NButton type="primary" attr-type="submit">保存修改</NButton>
            </div>
          </NForm>
        </NCard>
        <NCard title="修改密码" size="small">
          <NForm ref="formRef" :model="formValue" :rules="rules">
            <NFormItem label="旧密码" path="oldPassword">
              <NInput v-model:value="formValue.oldPassword" placeholder="请输入旧密码"/>
            </NFormItem>
            <NFormItem label="邮箱" path="email">
              <NInput v-model:value="formValue.email" placeholder="请输入邮箱"/>
              <NButton type="primary" style="margin-left: 8px;" ghost :disabled="isEmailCodeSending || emailCodeCountdown > 0"
                       @click="handleSendEmailCode('UpdatePassword')" :loading="isEmailCodeSending">
                {{ emailCodeButtonText }}
              </NButton>
            </NFormItem>
            <NFormItem label="邮箱验证码" path="emailCode">
              <NInput v-model:value="formValue.emailCode" placeholder="请输入邮箱验证码"/>
            </NFormItem>
            <NFormItem label="新密码" path="newPassword">
              <NInput v-model:value="formValue.newPassword" placeholder="请输入新密码"/>
            </NFormItem>
            <NFormItem label="确认密码" path="confirmPassword">
              <NInput v-model:value="formValue.confirmPassword" placeholder="请确认新密码"/>
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
import {ref, onMounted, computed} from 'vue'
import { useRouter } from 'vue-router'
import {
  NCard,
  NForm,
  NFormItem,
  NInput,
  NUpload,
  NTag,
  NButton,
  NText,
  useMessage, type FormInst
} from 'naive-ui'
import type { FormRules, UploadFileInfo } from 'naive-ui'
import { userApi } from '@/net'
import {accessHandle, removeToken} from "@/net/base.ts";

interface UserInfo {
  username: string
  email: string
  nickname: string
  groupFriendlyName: string
  isRealname: boolean
  avatar?: string
}
const formRef = ref<FormInst | null>(null)
const router = useRouter()
const message = useMessage()
const isEmailCodeSending = ref(false)
const emailCodeCountdown = ref(0)

// 用户信息
const userInfo = ref<UserInfo>({
  username: '',
  email: '',
  nickname: '',
  groupFriendlyName: '普通用户',
  is_realname: false
})

// 表单数据
const formValue = ref({
  nickname: '',
  email: '',
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
  emailCode: ''
})

// 头像上传
const avatarFiles = ref<UploadFileInfo[]>([])

// 表单校验规则
const rules: FormRules = {
  nickname: [
    { required: true, message: '请输入昵称' },
    { min: 2, max: 16, message: '长度需在2-16个字符之间' }
  ]
}


// 添加在fetchUserInfo方法之前
const fetchUserGroups = async () => {
  userApi.get("/user/info/groups", accessHandle(), (data) => {
    if (data.code === 0 && data.data?.groups) {
      groupNameMap.value = data.data.groups.reduce((acc, group) => {
        acc[group.name] = group.friendlyName // 确保字段名正确
        return acc
      }, {} as Record<string, string>)
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
      formValue.value.nickname = data.data.nickname
    }
  })
}


// 添加在userInfo声明之后
const groupNameMap = ref<Record<string, string>>({})

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

function handleSendEmailCode(module: string) {
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
      module,
      (data) => {
        message.success(data.message)
        startEmailCodeCountdown()
        formValue.value.emailCode = ''
        isEmailCodeSending.value = false // 确保发送成功后将状态设置为false
      },
      (error) => {
        message.error(error)
        isEmailCodeSending.value = false // 发送失败后也需要将状态设置为false
      },
  )
}


// 提交表单
const handleSubmit = async () => {
  const formData = new FormData()
  formData.append('nickname', formValue.value.nickname)
  if (avatarFiles.value[0]?.file) {
    formData.append('avatar', avatarFiles.value[0].file)
  }

  userApi.post('/user/info/update', formData, accessHandle(), (data) => {
    if (data.code === 0) {
      message.success('资料更新成功')
      fetchUserInfo()
    }else{
      message.error(data.message || '资料更新失败')
    }
  })
}

const handlePasswordSubmit = async () => {
  if (!formValue.value.oldPassword) {
    message.error('请输入旧密码')
    return
  }
  if (!formValue.value.newPassword) {
    message.error('请输入新密码')
    return
  }
  if (!formValue.value.confirmPassword) {
    message.error('请确认新密码')
    return
  }
  if (formValue.value.newPassword !== formValue.value.confirmPassword) {
    message.error('两次输入的密码不一致')
    return
  }
  if (formValue.value.newPassword.length < 6) {
    message.error('密码长度不能少于6位')
    return
  }
  if (formValue.value.newPassword === formValue.value.oldPassword) {
    message.error('新密码不能与旧密码相同')
    return
  }
  userApi.post('/user/update/password', {
    oldPassword: formValue.value.oldPassword,
    newPassword: formValue.value.newPassword,
    confirmPassword: formValue.value.confirmPassword,
    emailCode: formValue.value.emailCode
  }, accessHandle(), (data) => {
    if (data.code === 0) {
      formValue.value.oldPassword = ''
      formValue.value.newPassword = ''
      formValue.value.confirmPassword = ''
      formValue.value.emailCode = ''
      handleLogout()
      message.success('密码更新成功')
    } else {
      message.error('密码更新失败')
    }
  }, (error) => {
    message.error(error || '密码更新失败')
  })
}
const handleLogout = () => {
  removeToken()
  router.push('/login')
}
onMounted(async () => {
  await fetchUserGroups() // 先获取用户组映射
  await fetchUserInfo()         // 再获取用户信息
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
