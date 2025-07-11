<template>
  <div class="profile">
    <div class="statistic-container">
      <Statistic
        :signRemainder="userInfoRef?.userInfo.signRemainder"
        ref="statisticRef"
      />
    </div>
    <div class="page-container">
      <div class="left-column">
        <!-- 账户设置区域 -->
        <n-card>
          <div class="card-header">
            <h2 class="card-title">账户设置</h2>
            <div class="tabs">
              <span class="tab active" style="margin-right: 10px"
                >Settings</span
              >
            </div>
          </div>

          <div class="settings-grid">
            <!-- 修改用户名 -->
            <div class="setting-item" @click="showModal('changeUsername')">
              <div class="setting-icon">
                <UserIcon style="width: 50px; height: 50px; margin-top: 25px" />
              </div>
              <div class="setting-content">
                <h3 class="setting-title">修改用户名</h3>
                <p class="setting-desc">点击这里可以修改您的用户名</p>
              </div>
            </div>

            <!-- 更换昵称 -->
            <div class="setting-item" @click="showModal('changeNickname')">
              <div class="setting-icon">
                <UserIcon style="width: 50px; height: 50px; margin-top: 25px" />
              </div>
              <div class="setting-content">
                <h3 class="setting-title">更换昵称</h3>
                <p class="setting-desc">点击这里可以修改您的昵称</p>
              </div>
            </div>

            <!-- 更改头像 -->
            <div class="setting-item" @click="showModal('changeAvatar')">
              <div class="setting-icon">
                <ImageUpIcon
                  style="width: 50px; height: 50px; margin-top: 25px"
                />
              </div>
              <div class="setting-content">
                <h3 class="setting-title">更改头像</h3>
                <p class="setting-desc">点击这里上传图片，可以更换您的头像</p>
              </div>
            </div>

            <!-- 修改密码 -->
            <div class="setting-item" @click="showModal('changePassword')">
              <div class="setting-icon">
                <LockIcon style="width: 50px; height: 50px; margin-top: 25px" />
              </div>
              <div class="setting-content">
                <h3 class="setting-title">修改密码</h3>
                <p class="setting-desc">点击这里可以修改您的登录密码</p>
              </div>
            </div>

            <!-- 实人认证 -->
            <div
              v-if="!UserInfo.isRealname"
              class="setting-item"
              @click="showModal('changeRealname')"
            >
              <div class="setting-icon">
                <BadgeCheckIcon
                  style="width: 50px; height: 50px; margin-top: 25px"
                />
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
              <div
                :style="{
                  backgroundImage: `url(${UserInfo.avatar})`,
                  borderRadius: '50%',
                  width: '80px',
                  height: '80px',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }"
                alt="User Avatar"
              />
            </div>
            <div class="user-info">
              <h3 class="user-greeting">Hi, {{ UserInfo.nickname }}</h3>
              <span style="display: flex; font-size: 17px">今天过的还好吗</span>
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
      <n-modal
        v-model:show="modals.changeUsername"
        preset="card"
        title="修改用户名"
        style="width: 500px"
      >
        <n-form
          ref="usernameFormRef"
          :model="forms.username"
          :rules="rules.username"
        >
          <n-form-item label="当前用户名" path="currentUsername">
            <n-input v-model:value="forms.username.currentUsername" disabled />
          </n-form-item>
          <n-form-item label="新用户名" path="newUsername">
            <n-input
              v-model:value="forms.username.newUsername"
              placeholder="请输入新用户名"
            />
          </n-form-item>
          <n-form-item label="邮箱" path="email">
            <n-input
              v-model:value="forms.username.emailCode"
              placeholder="请输入邮箱"
            />
          </n-form-item>
          <n-form-item label="验证码" path="emailCode">
            <div style="display: flex; gap: 8px">
              <n-input
                v-model:value="forms.username.emailCode"
                placeholder="请输入验证码"
              />
              <n-button
                :disabled="emailCodeSending || emailCodeCountdown > 0"
                @click="
                  sendEmailVerificationCode(
                    'UpdateUsername',
                    forms.username.emailCode,
                  )
                "
              >
                {{ emailCodeButtonText }}
              </n-button>
            </div>
          </n-form-item>
          <div class="modal-actions">
            <n-button @click="modals.changeUsername = false">取消</n-button>
            <n-button
              :loading="loading"
              type="primary"
              @click="handleChangeUsername"
              >确认修改</n-button
            >
          </div>
        </n-form>
      </n-modal>

      <!-- 修改昵称模态 -->
      <n-modal
        v-model:show="modals.changeNickname"
        preset="card"
        title="更换昵称"
        style="width: 500px"
      >
        <n-form
          :model="forms.nickname"
          :rules="rules.nickname"
          ref="forms.nickname"
          label-placement="left"
          label-width="auto"
          :show-feedback="false"
        >
          <n-form-item label="新的昵称">
            <n-input
              v-model:value="forms.nickname.newNickname"
              placeholder="请输入新的昵称"
            />
          </n-form-item>
          <br />
          <div class="modal-actions">
            <n-button
              :loading="loading"
              type="primary"
              @click="handleUpdateNickname"
              >确定</n-button
            >
            <n-button @click="modals.changeNickname = false">取消</n-button>
          </div>
        </n-form>
      </n-modal>

      <!-- 更改头像模态窗口 -->
      <n-modal
        v-model:show="modals.changeAvatar"
        preset="card"
        title="更改头像"
        style="width: 500px"
      >
        <n-form ref="avatarFormRef" :model="forms.avatar">
          <n-tabs v-model:value="forms.avatar.avatarMode">
            <n-tab-pane name="upload" tab="上传图片">
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
            </n-tab-pane>
            <n-tab-pane name="qq" tab="QQ 头像">
              <n-form-item label="QQ号">
                <n-input
                  v-model:value="forms.avatar.qqNumber"
                  placeholder="请输入QQ号"
                />
              </n-form-item>
            </n-tab-pane>
            <n-tab-pane name="cravatar" tab="Cravatar">
              <n-form-item label="邮箱">
                <n-input :value="UserInfo.email" disabled />
              </n-form-item>
            </n-tab-pane>
          </n-tabs>
          <n-form-item label="预览">
            <div class="avatar-preview">
              <template v-if="forms.avatar.avatarMode === 'upload'">
                <div
                  :style="{
                    backgroundImage: `url(${forms.avatar.avatarUrl})`,
                    borderRadius: '50%',
                    width: '100px',
                    height: '100px',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }"
                  alt="Avatar Preview"
                />
              </template>
              <template
                v-else-if="
                  forms.avatar.avatarMode === 'qq' && forms.avatar.qqNumber
                "
              >
                <img
                  :src="`https://q1.qlogo.cn/g?b=qq&nk=${forms.avatar.qqNumber}&s=640`"
                  style="
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    object-fit: cover;
                  "
                />
              </template>
              <template v-else-if="forms.avatar.avatarMode === 'cravatar'">
                <img
                  :src="`https://cravatar.cn/avatar/${md5(UserInfo.email)}?s=100`"
                  style="
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    object-fit: cover;
                  "
                />
              </template>
              <template v-else>
                <div
                  :style="{
                    backgroundImage: `url(${UserInfo.avatar})`,
                    borderRadius: '50%',
                    width: '100px',
                    height: '100px',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }"
                  alt="当前头像"
                />
              </template>
            </div>
          </n-form-item>
          <div class="modal-actions">
            <n-button @click="modals.changeAvatar = false">取消</n-button>
            <n-button
              :loading="loading"
              type="primary"
              @click="handleChangeAvatar"
              >确认修改</n-button
            >
          </div>
        </n-form>
      </n-modal>

      <!-- 新增头像裁剪弹窗 -->
      <n-modal
        v-model:show="cropperVisible"
        preset="card"
        title="裁剪头像"
        style="width: 500px"
      >
        <div style="padding: 20px">
          <div class="cropper-container" style="height: 360px">
            <Cropper
              ref="cropperRef"
              class="cropper"
              :src="cropperImg"
              :stencil-props="{
                aspectRatio: 1,
                minWidth: '80%',
                minHeight: '80%',
              }"
              :resize-image="{
                touch: true,
                wheel: true,
              }"
              :stencil-component="CircleStencil"
              :auto-zoom="true"
              :canvas="{
                width: 500,
                height: 500,
              }"
              :default-visibility="true"
              :class-names="{
                default: 'vue-advanced-cropper',
              }"
              style="height: 400px"
            />
          </div>
          <div class="modal-actions">
            <n-button @click="cropperVisible = false">取消</n-button>
            <n-button type="primary" @click="handleCropConfirm">确认</n-button>
          </div>
        </div>
      </n-modal>

      <!-- 修改密码模态窗口 -->
      <n-modal
        v-model:show="modals.changePassword"
        preset="card"
        title="修改密码"
        style="width: 500px"
      >
        <n-form
          ref="passwordFormRef"
          :model="forms.password"
          :rules="rules.password"
        >
          <n-form-item label="当前密码" path="currentPassword">
            <n-input
              v-model:value="forms.password.currentPassword"
              type="password"
              placeholder="请输入当前密码"
            />
          </n-form-item>
          <n-form-item label="新密码" path="newPassword">
            <n-input
              v-model:value="forms.password.newPassword"
              type="password"
              placeholder="请输入新密码"
            />
          </n-form-item>
          <n-form-item label="确认新密码" path="confirmPassword">
            <n-input
              v-model:value="forms.password.confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
            />
          </n-form-item>
          <div class="modal-actions">
            <n-button @click="modals.changePassword = false">取消</n-button>
            <n-button
              :loading="loading"
              type="primary"
              @click="handleChangePassword"
              >确认修改</n-button
            >
          </div>
        </n-form>
      </n-modal>

      <!-- 实名认证模态窗口 -->
      <n-modal
        v-model:show="modals.changeRealname"
        preset="card"
        title="实名认证"
        style="width: 500px"
      >
        <n-form
          ref="realnameFormRef"
          :model="forms.realname"
          :rules="rules.realname"
        >
          <n-form-item label="姓名" path="realname">
            <n-input
              v-model:value="forms.realname.realname"
              placeholder="请输入真实姓名"
            />
          </n-form-item>
          <n-form-item label="身份证号" path="idCard">
            <n-input
              v-model:value="forms.realname.idCard"
              placeholder="请输入身份证号"
            />
          </n-form-item>
          <n-form-item label="手机号" path="phone">
            <n-input
              v-model:value="forms.realname.phone"
              placeholder="请输入手机号"
            />
          </n-form-item>
          <n-form-item label="验证码" path="phoneCode">
            <div style="display: flex; gap: 8px">
              <n-input
                v-model:value="forms.realname.phoneCode"
                placeholder="请输入验证码"
              />
              <n-button
                :disabled="phoneCodeSending || phoneCodeCountdown > 0"
                @click="handleSendPhoneCode"
              >
                {{ phoneCodeButtonText }}
              </n-button>
            </div>
          </n-form-item>
          <div class="modal-actions">
            <n-button @click="modals.changeRealname = false">取消</n-button>
            <n-button
              :loading="loading"
              type="primary"
              @click="handleChangeRealname"
              >提交认证</n-button
            >
          </div>
        </n-form>
      </n-modal>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue'
import {
  NModal,
  NButton,
  NForm,
  NFormItem,
  NInput,
  useMessage,
  NTabs,
  NTabPane,
  NUpload,
  UploadFileInfo,
} from 'naive-ui'
import {
  UserIcon,
  ImageUpIcon,
  LockIcon,
  BadgeCheckIcon,
} from 'lucide-vue-next'
import userInfo from '../../components/UserInfo.vue'
import { userApi } from '../../net'
import { removeToken } from '../../net/token'
import Statistic from '@/components/Statistic.vue'
import { Cropper, CircleStencil } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
import md5 from 'blueimp-md5'
import { GeetestService, loadGeetest } from '@/utils/captcha'
import packageData from '@/../package.json'

const userInfoRef = ref<InstanceType<typeof userInfo>>()

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
    emailCode: '',
  },
  avatar: {
    avatarMode: 'upload', // 新增，'upload' | 'qq' | 'cravatar'
    avatarUrl: UserInfo.avatar || '',
    avatarFile: [] as UploadFileInfo[],
    qqNumber: '', // 新增
    cravatarAccount: '', // 新增
  },
  password: {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  },
  email: {
    currentEmail: '',
    newEmail: '',
    verificationCode: '',
  },
  nickname: {
    newNickname: '',
  },
  realname: {
    realname: '',
    idCard: '',
    phone: '',
    phoneCode: '',
  },
})

// 表单规则
const rules = {
  username: {
    newUsername: [
      { required: true, message: '请输入新用户名', trigger: 'blur' },
      {
        min: 3,
        max: 20,
        message: '用户名长度应在3-20个字符之间',
        trigger: 'blur',
      },
    ],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  },
  nickname: {
    newNickname: [
      { required: true, message: '请输入新的昵称', trigger: 'blur' },
      {
        min: 2,
        max: 20,
        message: '昵称长度应在2-20个字符之间',
        trigger: 'blur',
      },
    ],
  },
  password: {
    currentPassword: [
      { required: true, message: '请输入当前密码', trigger: 'blur' },
    ],
    newPassword: [
      { required: true, message: '请输入新密码', trigger: 'blur' },
      { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' },
    ],
    confirmPassword: [
      { required: true, message: '请确认新密码', trigger: 'blur' },
      {
        validator: (_rule, value) => {
          return value === forms.password.newPassword
        },
        message: '两次输入的密码不一致',
        trigger: 'blur',
      },
    ],
  },
  email: {
    newEmail: [
      { required: true, message: '请输入新邮箱', trigger: 'blur' },
      {
        pattern: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
        message: '请输入有效的邮箱地址',
        trigger: 'blur',
      },
    ],
    verificationCode: [
      { required: true, message: '请输入验证码', trigger: 'blur' },
      { len: 6, message: '验证码长度应为6位', trigger: 'blur' },
    ],
  },
  realname: {
    realname: [
      { required: true, message: '请输入真实姓名', trigger: 'blur' },
      {
        min: 2,
        max: 20,
        message: '真实姓名长度应在2-20个字符之间',
        trigger: 'blur',
      },
    ],
    idCard: [
      { required: true, message: '请输入身份证号', trigger: 'blur' },
      {
        pattern: /^[1-9]\d{5}(18|19|20)\d{2}\d{2}\d{2}\d{3}[\dXx]$/,
        message: '请输入有效的身份证号',
        trigger: 'blur',
      },
    ],
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

// 新增裁剪相关的响应式变量
const cropperImg = ref('')
const cropperVisible = ref(false)
const cropperRef = ref()

// 验证码相关状态
const captchaLoading = ref(false)
const captchaVerified = ref(false)

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
    const data = await userApi.updateUsername({
      newUsername: forms.username.newUsername,
      emailCode: forms.username.emailCode,
    })
    if (data.code === 0) {
      UserInfo.username = forms.username.newUsername
      message.success('用户名修改成功')
      forms.username.newUsername = ''
      forms.username.emailCode = ''
      modals.changeUsername = false
    } else {
      message.error(data.message || '用户名修改失败')
    }
  } catch (error: any) {
    message.error(error.message || '用户名修改失败')
  }
  loading.value = false
}

const sendEmailVerificationCode = async (model: string, email: string) => {
  if (emailCodeSending.value || emailCodeCountdown.value > 0) return
  if (!email) {
    message.error('请输入邮箱')
    return
  }

  // 先进行人机验证
  captchaLoading.value = true
  try {
    const geetestService = new GeetestService(packageData.captcha.Captcha)
    const result = await geetestService.initAndShowCaptchaForBind()
    if (result) {
      captchaVerified.value = true

      // 人机验证通过后发送邮件验证码
      emailCodeSending.value = true
      try {
        const url = `?lotNumber=${result.lot_number}&passToken=${result.pass_token}&genTime=${result.gen_time}&captchaOutput=${result.captcha_output}`
        const data = await userApi.sendEmailCode(email, model, url)
        if (data.code === 0) {
          message.success('验证码发送成功')
          emailCodeCountdown.value = 60
          const timer = setInterval(() => {
            emailCodeCountdown.value--
            if (emailCodeCountdown.value <= 0) {
              clearInterval(timer)
            }
          }, 1000)
        } else {
          message.error(data.message || '验证码发送失败')
        }
      } catch (error: any) {
        message.error(error.message || '验证码发送失败')
      } finally {
        emailCodeSending.value = false
      }
    }
  } catch (error) {
    message.error('人机验证失败，请重试')
  } finally {
    captchaLoading.value = false
  }
}

const handleUpdateNickname = async () => {
  if (!forms.nickname.newNickname) {
    message.error('昵称不能为空')
    return
  }
  loading.value = true
  try {
    const data = await userApi.updateNickname(forms.nickname.newNickname)
    if (data.code === 0) {
      localStorage.setItem('nickname', forms.nickname.newNickname)
      message.success('昵称修改成功')
      forms.nickname.newNickname = ''
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } else {
      message.error(data.message || '昵称修改失败')
    }
  } catch (error: any) {
    message.error(error.message || '昵称修改失败')
  } finally {
    modals.changeNickname = false
    loading.value = false
  }
}

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
    cropperImg.value = e.target?.result as string
    cropperVisible.value = true
  }
  if (file.file) {
    reader.readAsDataURL(file.file)
  }
  return false
}

const handleCropConfirm = () => {
  const { canvas } = cropperRef.value.getResult()

  if (canvas) {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], 'avatar.png', { type: 'image/png' })
          const uploadFileInfo = {
            id: Date.now().toString(),
            name: 'avatar.png',
            status: 'finished' as const,
            percentage: 100,
            file: file,
            url: URL.createObjectURL(blob),
            type: 'image/png',
            batchId: null,
            thumbnailUrl: '',
            fullPath: '',
          }
          forms.avatar.avatarFile = [uploadFileInfo]
          forms.avatar.avatarUrl = uploadFileInfo.url
          cropperVisible.value = false
        }
      },
      'image/png',
      1,
    )
  }
}

const handleChangeAvatar = async () => {
  let params: any = { mode: forms.avatar.avatarMode }
  if (forms.avatar.avatarMode === 'upload') {
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
    formData.append('mode', 'upload')
    formData.append('avatar', file)
    params = formData
  } else if (forms.avatar.avatarMode === 'qq') {
    if (!forms.avatar.qqNumber) {
      message.error('请输入QQ号')
      return
    }
    params = { mode: 'qq', qq: forms.avatar.qqNumber }
  } else if (forms.avatar.avatarMode === 'cravatar') {
    if (!UserInfo.email) {
      message.error('未获取到邮箱，无法使用Cravatar')
      return
    }
    params = { mode: 'cravatar', cravatar: md5(UserInfo.email) }
  }
  loading.value = true
  try {
    message.loading('正在上传头像...')
    const data = await userApi.updateAvatar(params)
    if (data.code === 0) {
      localStorage.setItem('avatar', data.data)
      message.success(data.message)
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } else {
      message.error(data.message || '头像上传失败，请稍后再试')
    }
  } catch (error: any) {
    message.error(error.message || '头像上传失败，请稍后再试')
  } finally {
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
    const data = await userApi.updatePassword({
      oldPassword: forms.password.currentPassword,
      newPassword: forms.password.newPassword,
      confirmPassword: forms.password.confirmPassword,
    })
    if (data.code === 0) {
      forms.password.currentPassword = ''
      forms.password.newPassword = ''
      forms.password.confirmPassword = ''
      modals.changePassword = false
      message.success('密码修改成功，请重新登录')
      removeToken()
      setTimeout(() => {
        window.location.href = '/login'
      }, 2000)
    } else {
      message.error(data.message || '密码修改失败')
    }
  } catch (error: any) {
    message.error(error.message || '密码修改失败')
  } finally {
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
    const data = await userApi.submitRealname({
      name: forms.realname.realname,
      IDCard: forms.realname.idCard,
      phone: forms.realname.phone,
      phoneCode: forms.realname.phoneCode,
    })
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
  } catch (error: any) {
    message.error(error.message || '真实姓名认证失败')
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

  // 先进行人机验证
  captchaLoading.value = true
  try {
    const geetestService = new GeetestService(packageData.captcha.Captcha)
    const result = await geetestService.initAndShowCaptchaForBind()
    if (result) {
      captchaVerified.value = true

      // 人机验证通过后发送手机验证码
      phoneCodeSending.value = true
      try {
        const url = `?lotNumber=${result.lot_number}&passToken=${result.pass_token}&genTime=${result.gen_time}&captchaOutput=${result.captcha_output}`
        const data = await userApi.sendSmsCode(
          forms.realname.phone,
          'realname',
          url,
        )
        if (data.code === 0) {
          message.success('验证码已发送')
          phoneCodeCountdown.value = 60
          const timer = setInterval(() => {
            phoneCodeCountdown.value--
            if (phoneCodeCountdown.value <= 0) {
              clearInterval(timer)
            }
          }, 1000)
        } else {
          message.error(data.message || '验证码发送失败')
        }
      } catch (error: any) {
        message.error(error.message || '验证码发送失败')
      } finally {
        phoneCodeSending.value = false
      }
    }
  } catch (error) {
    message.error('人机验证失败，请重试')
  } finally {
    captchaLoading.value = false
  }
}

// 组件卸载时清理
onMounted(async () => {
  // 加载极验脚本
  await loadGeetest()

  return () => {
    if (cropperRef.value) {
      cropperRef.value.destroy()
      cropperRef.value = null
    }
  }
})
</script>

<style lang="scss" scoped>
// 基础变量
$card-radius: 8px;
$primary-spacing: 16px;
$mobile-spacing: 12px;
$card-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
$transition-normal: all 0.2s ease;

// 容器样式
.statistic-container {
  padding: 15px;
}

.page-container {
  display: flex;
  gap: $primary-spacing;
  padding: $primary-spacing;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    flex-direction: column;
    padding: $mobile-spacing;
    gap: $mobile-spacing;
  }
}

// 左侧列样式
.left-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $primary-spacing;

  @media (max-width: 768px) {
    gap: $mobile-spacing;
  }
}

// 右侧列样式
.right-column {
  width: 450px;
  display: flex;
  flex-direction: column;
  gap: $primary-spacing;

  @media (max-width: 768px) {
    width: 100%;
    margin-top: $mobile-spacing;
  }
}

// 卡片基础样式
.card {
  border-radius: $card-radius;
  box-shadow: $card-shadow;

  &-title {
    font-size: 18px;
    font-weight: 500;
    margin: 0 0 $primary-spacing 0;
  }

  &-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $primary-spacing;
  }
}

// 设置网格
.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $primary-spacing;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
}

// 设置项样式
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

// 账户详情样式
.account-details {
  .user-profile {
    display: flex;
    align-items: center;
    gap: $primary-spacing;
    margin-bottom: 24px;

    @media (max-width: 768px) {
      gap: $mobile-spacing;
    }
  }

  .user-avatar {
    width: 80px;
    height: 80px;
    border-radius: $card-radius;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .user-info {
    flex: 1;
    min-width: 0;
  }

  .user-greeting {
    font-size: 18px;
    font-weight: 500;
    margin: 0 0 4px 0;
  }

  .user-email {
    font-size: 14px;
    color: #666;
    margin: 0;
  }
}

// 账户信息网格
.account-info-grid {
  @media (min-width: 601px) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $primary-spacing;
    padding: $primary-spacing;
  }

  @media (max-width: 600px) {
    display: flex;
    padding: $mobile-spacing;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    gap: $mobile-spacing;

    &::-webkit-scrollbar {
      height: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 2px;
    }

    .user-info-item,
    .user-info-item-right {
      flex: 0 0 auto;
      width: 160px;
      scroll-snap-align: start;
      background: rgba(0, 0, 0, 0.02);
      padding: $mobile-spacing;
      border-radius: 6px;

      .user-info-label {
        font-size: 12px;
        color: #666;
        margin-bottom: 4px;
      }

      .user-info-value {
        font-size: 14px;
        font-weight: 500;
      }
    }
  }
}

// 模态框样式
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.avatar-preview {
  width: 100px;
  height: 100px;
  border-radius: $card-radius;
  overflow: hidden;
  margin: 0 auto;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

// 移动端优化
@media (max-width: 768px) {
  .setting-icon {
    width: 32px;
    height: 32px;
  }

  .setting-title {
    font-size: 14px;
  }

  .setting-desc {
    font-size: 12px;
  }

  .user-avatar {
    width: 60px;
    height: 60px;
  }

  .user-greeting {
    font-size: 16px;
  }

  .user-email {
    font-size: 12px;
  }
}

.cropper-container {
  width: 100%;
  position: relative;

  :deep(.vue-advanced-cropper) {
    .vue-advanced-cropper__image {
      opacity: 1 !important;
    }

    .vue-circle-stencil {
      box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.4);
      border: 2px solid #2080f0;
    }
  }
}

.preview-container {
  margin-top: 20px;

  .cropper-preview {
    border: 2px solid #eee;
  }
}

// 确保裁剪区域是圆形的
:deep(.cropper-view-box),
:deep(.cropper-face) {
  border-radius: 50%;
}

:deep(.cropper-view-box) {
  outline: 0;
  box-shadow: 0 0 0 1px #39f;
}
</style>
