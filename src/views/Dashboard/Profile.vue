<template>
  <div class="profile">
    <div class="mb-[11px]">
      <Statistic
        :signRemainder="userInfoRef?.userInfo.signRemainder"
        ref="statisticRef"
      />
    </div>
    <div
      class="flex gap-4 w-full max-md:flex-col max-md:p-3 max-md:gap-3 max-md:mx-2.5"
    >
      <div class="flex-1 flex flex-col gap-4 max-md:gap-3">
        <!-- 账户设置区域 -->
        <n-card
          class="settings-card rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
        >
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-medium mb-4">账户设置</h2>
            <div class="tabs">
              <span class="tab active" style="margin-right: 10px"
                >Settings</span
              >
            </div>
          </div>

          <div
            class="grid grid-cols-2 gap-4 max-[1200px]:grid-cols-1"
            :style="{ '--setting-icon-color': themeStore.primaryColor }"
          >
            <!-- 修改用户名 -->
            <div class="flex gap-3 p-3 rounded-md cursor-pointer transition-[background-color] duration-200 hover:bg-black/5" @click="showModal('changeUsername')">
              <div class="w-10 h-10 flex items-center justify-center text-[var(--setting-icon-color)] [&_svg]:text-[var(--setting-icon-color)] [&_i]:w-6 [&_i]:h-6 [&_i]:block [&_i]:bg-center [&_i]:bg-no-repeat [&_i]:bg-contain max-md:w-8 max-md:h-8">
                <UserIcon style="width: 50px; height: 50px; margin-top: 25px" />
              </div>
              <div class="flex-1">
                <h3 class="text-base font-medium mb-1 max-md:text-sm">修改用户名</h3>
                <p class="text-sm text-[#666] m-0 max-md:text-xs">点击这里可以修改您的用户名</p>
              </div>
            </div>

            <!-- 更换昵称 -->
            <div class="flex gap-3 p-3 rounded-md cursor-pointer transition-[background-color] duration-200 hover:bg-black/5" @click="showModal('changeNickname')">
              <div class="w-10 h-10 flex items-center justify-center text-[var(--setting-icon-color)] [&_svg]:text-[var(--setting-icon-color)] [&_i]:w-6 [&_i]:h-6 [&_i]:block [&_i]:bg-center [&_i]:bg-no-repeat [&_i]:bg-contain max-md:w-8 max-md:h-8">
                <UserIcon style="width: 50px; height: 50px; margin-top: 25px" />
              </div>
              <div class="flex-1">
                <h3 class="text-base font-medium mb-1 max-md:text-sm">更换昵称</h3>
                <p class="text-sm text-[#666] m-0 max-md:text-xs">点击这里可以修改您的昵称</p>
              </div>
            </div>

            <!-- 更改头像 -->
            <div class="flex gap-3 p-3 rounded-md cursor-pointer transition-[background-color] duration-200 hover:bg-black/5" @click="showModal('changeAvatar')">
              <div class="w-10 h-10 flex items-center justify-center text-[var(--setting-icon-color)] [&_svg]:text-[var(--setting-icon-color)] [&_i]:w-6 [&_i]:h-6 [&_i]:block [&_i]:bg-center [&_i]:bg-no-repeat [&_i]:bg-contain max-md:w-8 max-md:h-8">
                <ImageUpIcon
                  style="width: 50px; height: 50px; margin-top: 25px"
                />
              </div>
              <div class="flex-1">
                <h3 class="text-base font-medium mb-1 max-md:text-sm">更改头像</h3>
                <p class="text-sm text-[#666] m-0 max-md:text-xs">点击这里上传图片，可以更换您的头像</p>
              </div>
            </div>

            <!-- 修改密码 -->
            <div class="flex gap-3 p-3 rounded-md cursor-pointer transition-[background-color] duration-200 hover:bg-black/5" @click="showModal('changePassword')">
              <div class="w-10 h-10 flex items-center justify-center text-[var(--setting-icon-color)] [&_svg]:text-[var(--setting-icon-color)] [&_i]:w-6 [&_i]:h-6 [&_i]:block [&_i]:bg-center [&_i]:bg-no-repeat [&_i]:bg-contain max-md:w-8 max-md:h-8">
                <LockIcon style="width: 50px; height: 50px; margin-top: 25px" />
              </div>
              <div class="flex-1">
                <h3 class="text-base font-medium mb-1 max-md:text-sm">修改密码</h3>
                <p class="text-sm text-[#666] m-0 max-md:text-xs">点击这里可以修改您的登录密码</p>
              </div>
            </div>

            <!-- 实人认证 -->
            <div
              v-if="!UserInfo.isRealname"
              class="flex gap-3 p-3 rounded-md cursor-pointer transition-[background-color] duration-200 hover:bg-black/5"
              @click="showModal('changeRealname')"
            >
              <div class="w-10 h-10 flex items-center justify-center text-[var(--setting-icon-color)] [&_svg]:text-[var(--setting-icon-color)] [&_i]:w-6 [&_i]:h-6 [&_i]:block [&_i]:bg-center [&_i]:bg-no-repeat [&_i]:bg-contain max-md:w-8 max-md:h-8">
                <BadgeCheckIcon
                  style="width: 50px; height: 50px; margin-top: 25px"
                />
              </div>
              <div class="flex-1">
                <h3 class="text-base font-medium mb-1 max-md:text-sm">实人认证</h3>
                <p class="text-sm text-[#666] m-0 max-md:text-xs">点击这里可以实人认证哦</p>
              </div>
            </div>
            <!-- 重置Token -->
            <div class="flex gap-3 p-3 rounded-md cursor-pointer transition-[background-color] duration-200 hover:bg-black/5" @click="showModal('changeResetToken')">
              <div class="w-10 h-10 flex items-center justify-center text-[var(--setting-icon-color)] [&_svg]:text-[var(--setting-icon-color)] [&_i]:w-6 [&_i]:h-6 [&_i]:block [&_i]:bg-center [&_i]:bg-no-repeat [&_i]:bg-contain max-md:w-8 max-md:h-8">
                <KeyIcon style="width: 50px; height: 50px; margin-top: 25px" />
              </div>
              <div class="flex-1">
                <h3 class="text-base font-medium mb-1 max-md:text-sm">重置Token</h3>
                <p class="text-sm text-[#666] m-0 max-md:text-xs">点击这里可以重置您的Token (退出登录)</p>
              </div>
            </div>
          </div>
        </n-card>
        <div class="welcome-card-container">
          <WelcomeCard />
        </div>
      </div>
      <div class="w-[450px] flex flex-col gap-4 max-md:w-full max-md:mt-3">
        <!-- 账户详情区域 -->
        <n-card
          class="account-details rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
          size="medium"
          title="账户详情"
        >
          <div class="flex items-center gap-4 mb-2 max-md:gap-3">
            <div
              class="w-20 h-20 rounded-lg overflow-hidden [&_img]:w-full [&_img]:h-full [&_img]:object-cover max-md:w-[60px] max-md:h-[60px]"
            >
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
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-medium mb-1 max-md:text-base">
                Hi, {{ UserInfo.nickname }}
              </h3>
              <span style="display: flex; font-size: 17px">今天过的还好吗</span>
              <p class="text-sm text-[#666] m-0 max-md:text-xs">
                {{ UserInfo.email }}
              </p>
            </div>
          </div>

          <div
            class="min-[601px]:p-2.5 max-[600px]:flex max-[600px]:p-3 max-[600px]:overflow-x-auto max-[600px]:snap-x max-[600px]:snap-mandatory max-[600px]:gap-3 max-[600px]:[&::-webkit-scrollbar]:h-1 max-[600px]:[&::-webkit-scrollbar-thumb]:bg-[#888] max-[600px]:[&::-webkit-scrollbar-thumb]:rounded-sm"
          >
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
          <n-form-item label="验证码" path="emailCode">
            <div style="display: flex; gap: 8px">
              <n-input
                v-model:value="forms.username.emailCode"
                placeholder="请输入验证码"
              />
              <n-button
                :disabled="emailCodeSending || emailCodeCountdown > 0"
                @click="sendEmailVerificationCode('username', 'email')"
              >
                {{ emailCodeButtonText }}
              </n-button>
            </div>
          </n-form-item>
          <div class="flex justify-end gap-3 mt-6">
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
          <n-alert type="info" title="提示">
            在我们称呼你时将会使用该昵称。
          </n-alert>
          <n-form-item label="当前昵称" style="margin-top: 20px">
            <n-input
              v-model:value="UserInfo.nickname"
              readonly
              style="cursor: default"
            />
          </n-form-item>
          <n-form-item label="新的昵称" style="margin-top: 20px">
            <n-input
              v-model:value="forms.nickname.newNickname"
              placeholder="请输入新的昵称"
            />
          </n-form-item>
          <br />
          <div class="flex justify-end gap-3 mt-6">
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
            <div
              class="w-[100px] h-[100px] rounded-lg overflow-hidden mx-auto [&_img]:w-full [&_img]:h-full [&_img]:object-cover"
            >
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
          <div class="flex justify-end gap-3 mt-6">
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
          <div
            class="w-full relative [&_.vue-advanced-cropper__image]:opacity-100! [&_.vue-circle-stencil]:shadow-[0_0_0_9999px_rgba(0,0,0,0.4)] [&_.vue-circle-stencil]:border-2 [&_.vue-circle-stencil]:border-[var(--n-primary-color)] [&_.cropper-view-box]:rounded-full [&_.cropper-face]:rounded-full [&_.cropper-view-box]:outline-0 [&_.cropper-view-box]:shadow-[0_0_0_1px_var(--n-primary-color)]"
            style="height: 360px"
          >
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
          <div class="flex justify-end gap-3 mt-6">
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
          <div class="flex justify-end gap-3 mt-6">
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
          <div class="flex justify-end gap-3 mt-6">
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

      <n-modal
        v-model:show="modals.changeResetToken"
        type="warning"
        preset="dialog"
        title="重置密钥"
        style="width: 500px"
      >
        <div style="margin-bottom: 24px">
          此操作将重置您的Token（密钥），这将可能导致你的服务全部中断，并会导致当前账号强制退出登录。请确认是否继续？
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <n-button @click="modals.changeResetToken = false">取消</n-button>
          <n-button type="error" @click="handleResetToken" :loading="loading"
            >确认重置</n-button
          >
        </div>
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
  useDialog,
} from 'naive-ui'
import {
  UserIcon,
  ImageUpIcon,
  LockIcon,
  BadgeCheckIcon,
  KeyIcon,
} from 'lucide-vue-next'
import userInfo from '../../components/UserInfo.vue'
import WelcomeCard from '@/components/WelcomeCard.vue'
import { userApi } from '../../net'
import { removeToken } from '../../net/token'
import Statistic from '@/components/Statistic.vue'
import { useThemeStore } from '@/stores/theme'
import { Cropper, CircleStencil } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
import md5 from 'blueimp-md5'
import { GeetestService, loadGeetest } from '@/utils/captcha'
import packageData from '@/../package.json'
import router from '@/router'

const userInfoRef = ref<InstanceType<typeof userInfo>>()

const themeStore = useThemeStore()

// 消息提示
const message = useMessage()
const dialog = useDialog()
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
  changeResetToken: false,
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
  loading.value = true
  try {
    let data
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
      formData.append('avatar', file)
      data = await userApi.updateAvatarUpload(formData)
    } else if (forms.avatar.avatarMode === 'qq') {
      if (!forms.avatar.qqNumber) {
        message.error('请输入QQ号')
        return
      }
      data = await userApi.updateAvatarQQ(forms.avatar.qqNumber)
    } else if (forms.avatar.avatarMode === 'cravatar') {
      if (!UserInfo.email) {
        message.error('未获取到邮箱，无法使用Cravatar')
        return
      }
      data = await userApi.updateAvatarCravatar(md5(UserInfo.email))
    }
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

const handleResetToken = async () => {
  loading.value = true
  const data = await userApi.resetToken()
  if (data.code === 0) {
    loading.value = false
    modals.changeResetToken = false
    dialog.success({
      title: '重置成功',
      content: '令牌重置成功，请重新登录',
      positiveText: '确定',
      onPositiveClick: () => {
        removeToken()
        router.push('/login')
      },
      closable: false,
    })
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


