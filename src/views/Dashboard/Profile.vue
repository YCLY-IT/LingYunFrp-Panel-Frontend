<template>
  <div class="page-container">
    <div class="left-column">
      <!-- 账户设置区域 -->
      <n-card>
        <div class="card-header">
          <h2 class="card-title">账户设置</h2>
          <div class="tabs">
            <span class="tab active" style="margin-right: 10px;">Settings</span>
          </div>
        </div>

        <div class="settings-grid">
          <!-- 修改用户名 -->
          <div class="setting-item" @click="showModal('changeUsername')">
            <div class="setting-icon">
                <UserIcon style="width: 50px; height: 50px; margin-top: 25px;" />
            </div>
            <div class="setting-content">
              <h3 class="setting-title">修改用户名</h3>
              <p class="setting-desc">点击这里可以修改您的用户名</p>
            </div>
          </div>

          <!-- 更换昵称 -->
          <div class="setting-item" @click="showModal('changeNickname')">
            <div class="setting-icon">
                <UserIcon style="width: 50px; height: 50px; margin-top: 25px;" />
            </div>
            <div class="setting-content">
              <h3 class="setting-title">更换昵称</h3>
              <p class="setting-desc">点击这里可以修改您的昵称</p>
            </div>
          </div>

          <!-- 更改头像 -->
          <div class="setting-item" @click="showModal('changeAvatar')">
            <div class="setting-icon">
              <ImageUpIcon style="width: 50px; height: 50px; margin-top: 25px;" />
            </div>
            <div class="setting-content">
              <h3 class="setting-title">更改头像</h3>
              <p class="setting-desc">点击这里上传图片，可以更换您的头像</p>
            </div>
          </div>

          <!-- 修改密码 -->
          <div class="setting-item" @click="showModal('changePassword')">
            <div class="setting-icon">
              <LockIcon style="width: 50px; height: 50px; margin-top: 25px;" />
            </div>
            <div class="setting-content">
              <h3 class="setting-title">修改密码</h3>
              <p class="setting-desc">点击这里可以修改您的登录密码</p>
            </div>
          </div>
          
          <!-- 实人认证 -->
          <div v-if="!UserInfo.isRealname" class="setting-item" @click="showModal('changeRealname')">
            <div class="setting-icon">
              <BadgeCheckIcon style="width: 50px; height: 50px; margin-top: 25px;" />
            </div>
            <div class="setting-content">
              <h3 class="setting-title">实人认证</h3>
              <p class="setting-desc">点击这里可以实人认证哦</p>
            </div>
          </div>
        </div>
      </n-card>
    </div>

    <div class="right-column">
      <!-- 账户详情区域 -->
      <n-card class="card account-details">
        <div class="card-header">
          <h2 class="card-title">账户详情</h2>
        </div>
        
        <div class="user-profile">
          <div class="user-avatar">
            <img :src="UserInfo.avatar" style="border-radius: 64px;" alt="User Avatar" />
          </div>
          <div class="user-info">
            <h3 class="user-greeting">Hi, {{ UserInfo.nickname }} </h3> 
            <span style="display: flex; font-size: 17px;">今天过的还好吗</span>
            <p class="user-email">{{ UserInfo.email }}</p>
          </div>
        </div>

        <div class="account-info-grid">
          <userInfo ref="userInfoRef" />
        </div>
      </n-card>
    </div>

    <!-- 模态窗口 -->
    <!-- 修改用户名模态窗口 -->
    <n-modal v-model:show="modals.changeUsername" preset="card" title="修改用户名" style="width: 500px;">
      <n-form ref="usernameFormRef" :model="forms.username" :rules="rules.username">
        <n-form-item label="当前用户名" path="currentUsername">
          <n-input v-model:value="forms.username.currentUsername" disabled />
        </n-form-item>
        <n-form-item label="新用户名" path="newUsername">
          <n-input v-model:value="forms.username.newUsername" placeholder="请输入新用户名" />
        </n-form-item>
        <n-form-item label="邮箱" path="email">
          <n-input v-model:value="forms.username.emailCode" placeholder="请输入邮箱" />
        </n-form-item>
        <n-form-item label="验证码" path="emailCode">
          <div style="display: flex; gap: 8px;">
            <n-input v-model:value="forms.username.emailCode" placeholder="请输入验证码" />
            <n-button :disabled="emailCodeSending || emailCodeCountdown > 0" @click="sendEmailVerificationCode('UpdateUsername', forms.username.emailCode)">
              {{ emailCodeButtonText }}
            </n-button>
          </div>
        </n-form-item>
        <div class="modal-actions">
          <n-button @click="modals.changeUsername = false">取消</n-button>
          <n-button :loading="loading" type="primary" @click="handleChangeUsername">确认修改</n-button>
        </div>
      </n-form>
    </n-modal>

    <!-- 修改昵称模态 -->
    <n-modal v-model:show="modals.changeNickname" preset="card" title="更换昵称" style="width: 500px;">
      <n-form :model="forms.nickname" :rules="rules.nickname" ref="forms.nickname" label-placement="left" label-width="auto" :show-feedback="false">
        <n-form-item label="新的昵称">
          <n-input v-model:value="forms.nickname.newNickname" placeholder="请输入新的昵称"/>
        </n-form-item>
        <br>
        <div class="modal-actions">
          <n-button :loading="loading" type="primary" @click="handleUpdateNickname">确定</n-button>
          <n-button @click="modals.changeNickname = false">取消</n-button>
        </div>
      </n-form>
    </n-modal>

    <!-- 更改头像模态窗口 -->
    <n-modal v-model:show="modals.changeAvatar" preset="card" title="更改头像" style="width: 500px;">
      <n-form ref="avatarFormRef" :model="forms.avatar">
        <n-form-item label="上传头像" path="avatarUrl">
          <n-upload
            @before-upload="handleBeforeUpload"
            v-model:file-list="forms.avatar.avatarFile"
            accept="image/*"
            list-type="image-card"
            :max="1"
          >
          </n-upload>
        </n-form-item>
        <n-form-item label="预览">
          <div class="avatar-preview">
            <img style="border-radius: 64px;" :src="forms.avatar.avatarUrl" alt="Avatar Preview" />
          </div>
        </n-form-item>
        <div class="modal-actions">
          <n-button @click="modals.changeAvatar = false">取消</n-button>
          <n-button :loading="loading" type="primary" @click="handleChangeAvatar">确认修改</n-button>
        </div>
      </n-form>
    </n-modal>

    <!-- 修改密码模态窗口 -->
    <n-modal v-model:show="modals.changePassword" preset="card" title="修改密码" style="width: 500px;">
      <n-form ref="passwordFormRef" :model="forms.password" :rules="rules.password">
        <n-form-item label="当前密码" path="currentPassword">
          <n-input v-model:value="forms.password.currentPassword" type="password" placeholder="请输入当前密码" />
        </n-form-item>
        <n-form-item label="新密码" path="newPassword">
          <n-input v-model:value="forms.password.newPassword" type="password" placeholder="请输入新密码" />
        </n-form-item>
        <n-form-item label="确认新密码" path="confirmPassword">
          <n-input v-model:value="forms.password.confirmPassword" type="password" placeholder="请再次输入新密码" />
        </n-form-item>
        <div class="modal-actions">
          <n-button @click="modals.changePassword = false">取消</n-button>
          <n-button :loading="loading" type="primary" @click="handleChangePassword">确认修改</n-button>
        </div>
      </n-form>
    </n-modal>

    <!-- 实名认证模态窗口 -->
    <n-modal v-model:show="modals.changeRealname" preset="card" title="实名认证" style="width: 500px;">
      <n-form ref="realnameFormRef" :model="forms.realname" :rules="rules.realname">
        <n-form-item label="姓名" path="realname">
          <n-input v-model:value="forms.realname.realname" placeholder="请输入真实姓名" />
        </n-form-item>
        <n-form-item label="身份证号" path="idCard">
          <n-input v-model:value="forms.realname.idCard" placeholder="请输入身份证号" />
        </n-form-item>
        <n-form-item label="手机号" path="phone">
          <n-input v-model:value="forms.realname.phone" placeholder="请输入手机号" />
        </n-form-item>
        <n-form-item label="验证码" path="phoneCode">
          <div style="display: flex; gap: 8px;">
            <n-input v-model:value="forms.realname.phoneCode" placeholder="请输入验证码" />
            <n-button :disabled="phoneCodeSending || phoneCodeCountdown > 0" @click="handleSendPhoneCode">
              {{ phoneCodeButtonText }}
            </n-button>
          </div>
        </n-form-item>
        <div class="modal-actions">
          <n-button @click="modals.changeRealname = false">取消</n-button>
          <n-button :loading="loading" type="primary" @click="handleChangeRealname">提交认证</n-button>
        </div>
      </n-form>
    </n-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed } from 'vue'
import { 
  NModal, 
  NButton, 
  NForm, 
  NFormItem, 
  NInput, 
  useMessage 
} from 'naive-ui'
import { UserIcon, ImageUpIcon, LockIcon, BadgeCheckIcon } from 'lucide-vue-next'
import userInfo from "../../components/UserInfo.vue";
import { UploadFileInfo } from 'naive-ui'
import { userApi } from '../../net'
import { accessHandle, removeToken } from '../../net/base'

const userInfoRef = ref<InstanceType<typeof userInfo>>();

// 消息提示
const message = useMessage()

// 用户信息
const UserInfo = reactive({
  username: localStorage.getItem('username') || '',
  nickname: localStorage.getItem('nickname') || '',
  email: localStorage.getItem('email') || '',
  avatar: localStorage.getItem('avatar') || '',
  isRealname: computed(() => userInfoRef.value?.userInfo.isRealname || false),
})

// 模态窗口状态
const modals = reactive({
  changeUsername: false,
  changeAvatar: false,
  changePassword: false,
  changeEmail: false,
  changeNickname: false,
  changeRealname: false,
})

// 表单数据
const forms = reactive({
  username: {
    currentUsername: UserInfo.username,
    newUsername: '',
    emailCode: ''
  },
  avatar: {
    avatarUrl: UserInfo.avatar || '',
    avatarFile: [] as UploadFileInfo[]
  },
  password: {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  },
  email: {
    currentEmail: '',
    newEmail: '',
    verificationCode: ''
  },
  nickname: {
    newNickname: ''
  },
  realname: {
    realname: '',
    idCard: '' ,
    phone: '',
    phoneCode: '',
  }
})

// 表单规则
const rules = {
  username: {
    newUsername: [
      { required: true, message: '请输入新用户名', trigger: 'blur' },
      { min: 3, max: 20, message: '用户名长度应在3-20个字符之间', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' }
    ]
  },
  nickname: {
    newNickname: [
      { required: true, message: '请输入新的昵称', trigger: 'blur' },
      { min: 2, max: 20, message: '昵称长度应在2-20个字符之间', trigger: 'blur' }
    ]
  },
  password: {
    currentPassword: [
      { required: true, message: '请输入当前密码', trigger: 'blur' }
    ],
    newPassword: [
      { required: true, message: '请输入新密码', trigger: 'blur' },
      { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
    ],
    confirmPassword: [
      { required: true, message: '请确认新密码', trigger: 'blur' },
      {
        validator: (rule, value) => {
          return value === forms.password.newPassword
        },
        message: '两次输入的密码不一致',
        trigger: 'blur'
      }
    ]
  },
  email: {
    newEmail: [
      { required: true, message: '请输入新邮箱', trigger: 'blur' },
      { 
        pattern: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/, 
        message: '请输入有效的邮箱地址', 
        trigger: 'blur' 
      }
    ],
    verificationCode: [
      { required: true, message: '请输入验证码', trigger: 'blur' },
      { len: 6, message: '验证码长度应为6位', trigger: 'blur' }
    ],
  },
  realname: {
    realname: [
      { required: true, message: '请输入真实姓名', trigger: 'blur' },
      { min: 2, max: 20, message: '真实姓名长度应在2-20个字符之间', trigger: 'blur' }
    ],
    idCard: [
      { required: true, message: '请输入身份证号', trigger: 'blur' },
      { pattern: /^[1-9]\d{5}(18|19)\d{8}[\dXx]$/, message: '请输入有效的身份证号', trigger: 'blur' }
    ]
  },
}

// 表单引用
const usernameFormRef = ref(null)
const avatarFormRef = ref(null)
const passwordFormRef = ref(null)
const loading = ref(false)

// 邮箱验证码相关状态
const emailCodeSending = ref(false)
const emailCodeCountdown = ref(0)
const emailCodeButtonText = computed(() => {
  if (emailCodeSending.value) return '发送中...'
  if (emailCodeCountdown.value > 0) return `${emailCodeCountdown.value}s后重试`
  return '获取验证码'
})

// 手机验证码相关状态 - 新增独立的状态管理
const phoneCodeSending = ref(false)
const phoneCodeCountdown = ref(0)
const phoneCodeButtonText = computed(() => {
  if (phoneCodeSending.value) return '发送中...'
  if (phoneCodeCountdown.value > 0) return `${phoneCodeCountdown.value}s后重试`
  return '获取验证码'
})

// 显示模态窗口
const showModal = (modalName) => {
  modals[modalName] = true
}

// 处理修改用户名
const handleChangeUsername = async () => {
  if (!forms.username.newUsername) {
    message.error('请输入新用户名')
    return
  }
  if (!forms.username.emailCode) {
    message.error('请输入邮箱验证码')
    return
  }
  if (forms.username.newUsername === UserInfo.username) {
    message.error('新用户名与当前用户名相同')
    return
  }
  loading.value = true
  try {
    userApi.post('/user/update/username', { newUsername: forms.username.newUsername, emailCode: forms.username.emailCode }, accessHandle(), (data) => {
      UserInfo.username = forms.username.newUsername
      message.success('用户名修改成功')
      forms.username.newUsername = ''
      forms.username.emailCode = ''
      modals.changeUsername = false
    },(errors) => {
      message.error(errors || '用户名修改失败')
    })
  } catch (errors) {
    message.error('用户名修改失败')
  }
  loading.value = false
}

const sendEmailVerificationCode = async (model : string, email: string) => {
  if (emailCodeSending.value || emailCodeCountdown.value > 0) return
  if (!email) {
    message.error('请输入邮箱')
    return
  }
  
  emailCodeSending.value = true
  
  try {
    userApi.post(`/user/code/${model}`, { email: email }, accessHandle(), (data) => {
      if (data.code !== 0) {
        message.success('验证码发送成功')
        emailCodeCountdown.value = 60
        const timer = setInterval(() => {
          emailCodeCountdown.value--
          if (emailCodeCountdown.value <= 0) {
            clearInterval(timer)
          }
        }, 1000)
      }
    }, (messageText) => {
      message.error(messageText || '验证码发送失败')
    })
  } catch (error) {
    message.error('验证码发送失败')
  } finally {
    emailCodeSending.value = false
  }
}

const handleUpdateNickname = async () => {
  if (!forms.nickname.newNickname) {
    message.error('昵称不能为空')
    return 
  }
  loading.value = true
  try {
    userApi.post(`/user/update/nickname/${forms.nickname.newNickname}`, { nickname: forms.nickname.newNickname }, accessHandle(), (data) => {
      localStorage.setItem('nickname', forms.nickname.newNickname)
      message.success('昵称修改成功')
      forms.nickname.newNickname = ''
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    }, (messageText) => {
      message.error(messageText || '昵称修改失败')
    })
  }
  catch (error) {
    message.error('昵称修改失败') 
  }
  finally {
    modals.changeNickname = false
    loading.value = false
  }
}

// 处理更改头像前的验证
const handleBeforeUpload = async (options: { file: UploadFileInfo }) => {
  const { file } = options
  if (!file.type?.startsWith('image/')) {
    message.error('只能上传图片文件')
    return false
  }
  if (file.file?.size && file.file.size > 2 * 1024 * 1024) {
    message.error('图片大小不能超过2MB')
    return false
  }
  
  const reader = new FileReader()
  reader.onload = (e) => {
    file.url = e.target?.result as string
    forms.avatar.avatarUrl = e.target?.result as string
  }
  
  if (file.file) {
    reader.readAsDataURL(file.file)
    forms.avatar.avatarFile = [file]
  }
  
  return false
}

const handleChangeAvatar = async () => {
  if (!forms.avatar.avatarFile || forms.avatar.avatarFile.length === 0) {
    message.error('请先上传头像')
    return
  }
  
  const file = forms.avatar.avatarFile[0].file as File
  if (!file) {
    message.error('请先选择头像文件')
    return
  }
  
  const formData = new FormData()
  formData.append('avatar', file)
  loading.value = true
  try {
    message.loading('正在上传头像...')
    userApi.post('/user/update/avatar', formData, {
      ...accessHandle(),
      'Content-Type': 'multipart/form-data',
    }, (data) => {
      localStorage.setItem('avatar', data.data)
      message.success(data.message)
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    })
  } catch (error) {
    message.error('头像上传失败，请稍后再试')
  }
  finally {
    loading.value = false 
  }
}

// 处理修改密码
const handleChangePassword = async () => {
  if (!forms.password.currentPassword) {
    message.error('请输入当前密码')
    return
  }
  
  if (forms.password.newPassword !== forms.password.confirmPassword) {
    message.error('两次输入的密码不一致')
    return
  }
  loading.value = true
  try {
    userApi.post('/user/update/password', {
      oldPassword: forms.password.currentPassword,
      newPassword: forms.password.newPassword,
      confirmPassword: forms.password.confirmPassword
    }, accessHandle(), (data) => {
      forms.password.currentPassword = ''
      forms.password.newPassword = ''
      forms.password.confirmPassword = ''
      modals.changePassword = false
      message.success('密码修改成功，请重新登录')
      removeToken()
      setTimeout(() => {
        window.location.href = '/login'
      }, 2000)
    })
  } catch (errors) {
    message.error('密码修改失败')
  } finally{
    loading.value = false
  }
}

const handleChangeRealname = async () => {
  if (!forms.realname.realname) {
    message.error('请输入真实姓名')
    return
  }
  if (!forms.realname.idCard) {
    message.error('请输入身份证号')
    return 
  }
  if (!forms.realname.phoneCode) {
    message.error('请输入手机验证码')
    return
  }
  
  loading.value = true
  try {
    userApi.post(
      '/user/realname',
      { 
        name: forms.realname.realname, 
        IDCard: forms.realname.idCard,
        phone: forms.realname.phone,
        phoneCode: forms.realname.phoneCode
      },
      accessHandle(),
      (data) => {
        if (data.code === 0) {
          message.success(data.message)
          modals.changeRealname = false
          UserInfo.isRealname = true
          // 清空表单
          forms.realname.realname = ''
          forms.realname.idCard = ''
          forms.realname.phone = ''
          forms.realname.phoneCode = ''
        } else {
          message.error(data.message)
        }
      },
      (error) => {
        message.error(error)
      },
    )
  } catch (error) {
    message.error('真实姓名认证失败')
  } finally {
    loading.value = false
  }
}

// 修复后的发送手机验证码函数
const handleSendPhoneCode = async () => {
  if (phoneCodeSending.value || phoneCodeCountdown.value > 0) return
  
  if (!forms.realname.phone) {
    message.error('请输入手机号码')
    return
  }
  if (!/^[1][3,4,5,7,8][0-9]{9}$/.test(forms.realname.phone)) {
    message.error('请输入有效的手机号码')
    return
  }
  
  phoneCodeSending.value = true
  
  try {
    userApi.sendSmsCode(forms.realname.phone, "realname", (data) => {
      message.success('验证码已发送')
      phoneCodeCountdown.value = 60
      const timer = setInterval(() => {
        phoneCodeCountdown.value--
        if (phoneCodeCountdown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    })
  } catch (error) {
    message.error('验证码发送失败') 
  } finally {
    phoneCodeSending.value = false
  }
}

</script>

<style lang="scss" scoped>
.page-container {
  display: flex;
  gap: 16px;
  padding: 16px;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
}

.left-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.right-column {
  width: 450px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  @media (max-width: 768px) {
    width: 100%;
  }
}

.card {
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 16px;
  
  &-title {
    font-size: 18px;
    font-weight: 500;
    margin: 0 0 16px 0;
  }
  
  &-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
}

.tabs {
  display: flex;
  gap: 16px;
  
  .tab {
    cursor: pointer;
    padding-bottom: 4px;
    
    &.active {
      border-bottom: 2px solid;
      font-weight: 500;
    }
  }
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
}

.setting-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
}

.setting-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  i {
    width: 24px;
    height: 24px;
    display: block;
    background-position: center;
    background-repeat: no-repeat;
    background-size: contain;
  }
}

.setting-content {
  flex: 1;
}

.setting-title {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 4px 0;
}

.setting-desc {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.redemption-code {
  .code-input-group {
    margin-top: 16px;
  }
  
  .input-label {
    margin-bottom: 8px;
    font-size: 14px;
    
    .required {
      color: #ff4d4f;
    }
  }
  
  .input-with-button {
    display: flex;
    gap: 8px;
  }
  
  .code-input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    font-size: 14px;
    
    &:focus {
      outline: none;
      border-color: #1890ff;
    }
  }
  
  .verify-button {
    padding: 0 16px;
    border: none;
    border-radius: 4px;
    background-color: #b392f0;
    cursor: pointer;
  }
}

.account-details {
  .close-button {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    padding: 0;
    line-height: 1;
  }
  
  .user-profile {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
  }
  
  .user-avatar {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    overflow: hidden;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  
  .user-greeting {
    font-size: 18px;
    font-weight: 500;
    margin: 0 0 4px 0;
    
    .user-id {
      font-weight: normal;
      opacity: 0.7;
    }
  }
  
  .user-email {
    font-size: 14px;
    color: #666;
    margin: 0;
  }
  
  .account-info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    border-radius: 8px;
    padding: 16px;
  }
  
  .info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .info-label {
    font-size: 14px;
    color: #666;
  }
  
  .info-value {
    font-size: 16px;
    font-weight: 500;
  }
}

// 模态窗口样式
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.avatar-preview {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  margin: 0 auto;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
</style>