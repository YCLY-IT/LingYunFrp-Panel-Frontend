<template>
    <div class="realname-Modal">
        <NAlert v-if="IsRealname === false" type="warning" title="未实人认证" style="margin-bottom: 16px">
          您的账户尚未完成实人认证, 请尽快完成实人认证。<br>
          <NButton text type="primary" @click="goToRealname">立即前往</NButton>
        </NAlert>
        <NAlert v-else type="success" title="已实人认证" style="margin-bottom: 16px">
          您的账户已完成实人认证<br>
        </NAlert>
      <NModal v-model:show="showRealnameModal" title="实人认证" preset="dialog" style="width: 400px;">
        <p></p>
        <NForm ref="formRef" :model="formValue" :rules="rules">
          <NFormItem path="name" label="真实姓名">
            <NInput v-model:value="formValue.name" placeholder="请输入真实姓名" />
          </NFormItem>
          <NFormItem path="IDCard" label="身份证号">
            <NInput v-model:value="formValue.IDCard" placeholder="请输入身份证号" />
          </NFormItem>
          <NFormItem path="email" label="手机号">
            <NInputGroup>
              <NInput v-model:value="formValue.phone" placeholder="请输入手机号" :disabled="emailCodeCountdown > 0"/>
              <NButton type="primary" ghost :disabled="isPhoneCodeSending || emailCodeCountdown > 0"
                       @click="handleSendPhoneCode" :loading="isPhoneCodeSending">
                {{ emailCodeButtonText }}
              </NButton>
            </NInputGroup>
          </NFormItem>
          <NFormItem path="emailCode" label="验证码">
            <NInput v-model:value="formValue.phoneCode" placeholder="请输入验证码" />
          </NFormItem>
          <br>
          <NButton
              type="primary"
              block
              secondary
              strong
              @click="handleSubmit"
              :loading="isSubmitting"
          >
            提交
          </NButton>
        </NForm>
      </NModal>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  NForm,
  NFormItem,
  NInput,
  NButton,
  NInputGroup,
  type FormRules,
  useMessage,
  type FormInst,
  NAlert} from 'naive-ui'
import {userApi} from "@/net";
import {accessHandle} from "@/net/base.ts";

const router = useRouter()
const message = useMessage()

const formRef = ref<FormInst | null>(null)
const isSubmitting = ref(false)
const isPhoneCodeSending = ref(false)
const showRealnameModal = ref(false)
const IsRealname = ref(false)
const emailCodeCountdown = ref(0)

const formValue = ref({
  name: '',
  phone: '',
  phoneCode: '',
  IDCard: '',
})

const goToRealname = () => {
  showRealnameModal.value = true
}

const handleRealname = () => {
  showRealnameModal.value = false
  userApi.get("/user/info/info", accessHandle(), (data) => {
    if (data.code === 0) {
      IsRealname.value = data.data.isRealname
    } else {
      message.error(data.message || '获取用户信息失败')
    }
  }, (error) => {
    message.error(error)
  })
}
handleRealname()

const emailCodeButtonText = computed(() => {
  if (isPhoneCodeSending.value) return '发送中...'
  if (emailCodeCountdown.value > 0) return `${emailCodeCountdown.value}s后重试`
  return '获取验证码'
})

const rules: FormRules = {
  name: {
    required: true,
    message: '请输入用户名',
    trigger: 'blur'
  },
  phone: {
    required: true,
    message: '请输入邮箱',
    trigger: 'blur',
    type: 'email'
  },
  phoneCode: {
    required: true,
    message: '请输入验证码',
    trigger: 'blur'
  },
  IDCard: {
    required: true,
    message: '请输入身份证号',
    trigger: 'blur'
  }
}

const startPhoneCodeCountdown = () => {
  emailCodeCountdown.value = 60
  const timer = setInterval(() => {
    emailCodeCountdown.value--
    if (emailCodeCountdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

const handleSendPhoneCode = async () => {
  if (!formValue.value.phone) {
    message.error('请输入手机号码')
    return
  }
  if (!/^[1][3,4,5,7,8][0-9]{9}$/.test(formValue.value.phone)) {
    message.error('请输入有效的手机号码')
    return
  }

  isPhoneCodeSending.value = true
  userApi.sendSmsCode(
      formValue.value.phone,
      "realname",
      (data) => {
         if (data.code === 0) {
           message.success(data.message)
           startPhoneCodeCountdown()
           formValue.value.phoneCode = ''
           isPhoneCodeSending.value = false // 确保发送成功后将状态设置为false
         }else{
           message.error(data.message)
           isPhoneCodeSending.value = false
         }
      },
      (error) => {
        message.error(error)
        isPhoneCodeSending.value = false // 发送失败后也需要将状态设置为false
      },
  )
}


const handleSubmit = async () => {
  await formRef.value?.validate()
  isSubmitting.value = true
  userApi.post(
      '/user/realname',
      formValue.value,
      accessHandle(),
      (data) => {
        if (data.code === 0) {
          message.success(data.message)
          showRealnameModal.value = false
          isSubmitting.value = false
          IsRealname.value = true
          router.push('/dashboard')
        }else{
          message.error(data.message)
          isSubmitting.value = false
        }
      },
      (error) => {
        message.error(error)
        isSubmitting.value = false
      },
  )
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/register.scss';
</style>