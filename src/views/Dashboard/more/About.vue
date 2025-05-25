<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-4xl mx-auto">
      <n-space vertical size="large" class="mt-6">
        <!-- 面板信息卡片 -->
        <n-card title="面板信息" hoverable>
          <template #header-extra>
            <n-tag type="success" round>
              <template #icon>
                <n-icon><CheckCircle /></n-icon>
              </template>
              运行中
            </n-tag>
          </template>
          
          <n-descriptions :column="2" bordered>
            <n-descriptions-item label="面板版本">
              <n-tag type="info">v{{ packageData.version }}</n-tag>
            </n-descriptions-item>
            <n-descriptions-item label="最后日期">
            {{ new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }) }}
            </n-descriptions-item>
            <n-descriptions-item label="技术栈" :span="2">
              <n-space>
                <n-tag type="primary">Vue 3</n-tag>
                <n-tag type="success">Naive UI</n-tag>
                <n-tag type="warning">TypeScript</n-tag>
                <n-tag type="error">Vite</n-tag>
                <n-tag type="info">Pinia</n-tag>
              </n-space>
            </n-descriptions-item>
            <n-descriptions-item label="运行环境" :span="2">
              <n-space>
                <n-tag>Docker</n-tag>
                <n-tag>OpenResty</n-tag>
                <n-tag>PostgreSQL</n-tag>
              </n-space>
            </n-descriptions-item>
          </n-descriptions>
        </n-card>

        <!-- 功能特性 -->
        <n-card title="功能特性" hoverable>
          <n-grid :cols="3" :x-gap="16" :y-gap="16">
            <n-grid-item>
              <n-thing>
                <template #avatar>
                  <n-avatar color="#18a058">
                    <n-icon><Zap /></n-icon>
                  </n-avatar>
                </template>
                <template #header>高性能</template>
                <template #description>
                  基于 Vue 3 Composition API，提供出色的性能表现
                </template>
              </n-thing>
            </n-grid-item>
            <n-grid-item>
              <n-thing>
                <template #avatar>
                  <n-avatar color="#2080f0">
                    <n-icon><Shield /></n-icon>
                  </n-avatar>
                </template>
                <template #header>安全可靠</template>
                <template #description>
                  多层安全防护，保障数据安全和系统稳定
                </template>
              </n-thing>
            </n-grid-item>
            <n-grid-item>
              <n-thing>
                <template #avatar>
                  <n-avatar color="#f0a020">
                    <n-icon><Smartphone /></n-icon>
                  </n-avatar>
                </template>
                <template #header>响应式设计</template>
                <template #description>
                  适配各种设备，提供一致的用户体验
                </template>
              </n-thing>
            </n-grid-item>
          </n-grid>
        </n-card>

        <!-- 系统状态 -->
        <!-- <n-card title="系统状态" hoverable>
          <n-space vertical>
            <n-progress
              type="line"
              :percentage="85"
              :height="24"
              :border-radius="4"
              fill-border-radius="4"
            >
              CPU 使用率: 85%
            </n-progress>
            <n-progress
              type="line"
              :percentage="62"
              :height="24"
              :border-radius="4"
              fill-border-radius="4"
              status="success"
            >
              内存使用率: 62%
            </n-progress>
            <n-progress
              type="line"
              :percentage="45"
              :height="24"
              :border-radius="4"
              fill-border-radius="4"
              status="info"
            >
              磁盘使用率: 45%
            </n-progress>
          </n-space>
        </n-card> -->

        <!-- 更新日志 -->
        <!-- <n-card title="更新日志" hoverable>
          <n-timeline>
            <n-timeline-item
              type="success"
              title="v2.1.3 发布"
              content="修复了若干已知问题，优化了用户界面"
              time="2024-12-15"
            />
            <n-timeline-item
              type="info"
              title="v2.1.2 发布"
              content="新增了数据导出功能，提升了系统性能"
              time="2024-12-01"
            />
            <n-timeline-item
              type="warning"
              title="v2.1.1 发布"
              content="修复了安全漏洞，更新了依赖包"
              time="2024-11-20"
            />
            <n-timeline-item
              type="error"
              title="v2.1.0 发布"
              content="重大版本更新，全新的用户界面设计"
              time="2024-11-01"
            />
          </n-timeline>
        </n-card> -->

        <!-- 联系信息 -->
        <n-card title="联系信息" hoverable>
          <n-grid :cols="2" :x-gap="16">
            <n-grid-item>
              <n-space vertical>
                <n-thing>
                  <template #avatar>
                    <n-icon size="24" color="#18a058"><Mail /></n-icon>
                  </template>
                  <template #header>邮箱地址</template>
                  <template #description>1263115878@qq.com</template>
                </n-thing>
                <n-thing style="margin-top: 16px;">
                  <template #avatar>
                    <n-icon size="24" color="#d03050"><MessageCircle /></n-icon>
                  </template>
                  <template #header>QQ 群</template>
                  <template #description><n-text @click="handleAddQQGroup"> 882670857</n-text></template>
                </n-thing>
              </n-space>
            </n-grid-item>
            <n-grid-item>
              <n-space vertical>
                <n-thing>
                  <template #avatar>
                    <n-icon size="24" color="#f0a020"><Globe /></n-icon>
                  </template>
                  <template #header>官方网站</template>
                  <template #description>https://www.lybyte.cn</template>
                </n-thing>
                <n-thing style="margin-top: 16px;">
                  <template #avatar>
                    <n-icon size="24" color="#2080f0"><Github /></n-icon>
                  </template>
                  <template #header>GitHub</template>
                  <template #description>https://github.com/LingYuByte-Network</template>
                </n-thing>
              </n-space>
            </n-grid-item>
          </n-grid>
        </n-card>

        <!-- 许可证信息 -->
        <n-card title="许可证信息" hoverable>
          <n-alert type="info" show-icon>
            <template #icon>
              <n-icon><FileText /></n-icon>
            </template>
            本项目基于 AGPL 3.0 许可证开源
          </n-alert>
          <br>
          <div class="mt-4">
            <n-space>
              <n-button type="primary" ghost @click="viewLicense">
                查看完整许可证
              </n-button>
              <n-button type="default" @click="downloadSource">
                打开项目源代码
              </n-button>
            </n-space>
          </div>
        </n-card>
      </n-space>
    </div>

    <!-- 反馈模态框 -->
    <n-modal v-model:show="showContactModal" preset="dialog" title="联系我们">
      <template #default>
        <n-form ref="contactForm" :model="contactData" :rules="contactRules">
          <n-form-item label="姓名" path="name">
            <n-input v-model:value="contactData.name" placeholder="请输入您的姓名" />
          </n-form-item>
          <n-form-item label="邮箱" path="email">
            <n-input v-model:value="contactData.email" placeholder="请输入您的邮箱" />
          </n-form-item>
          <n-form-item label="消息" path="message">
            <n-input
              v-model:value="contactData.message"
              type="textarea"
              placeholder="请输入您的消息"
              :rows="4"
            />
          </n-form-item>
        </n-form>
      </template>
      <template #action>
        <n-space>
          <n-button @click="showContactModal = false">取消</n-button>
          <n-button type="primary" @click="submitContact">发送</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import {
  NCard,
  NDescriptions,
  NDescriptionsItem,
  NTag,
  NSpace,
  NAvatar,
  NButton,
  NIcon,
  NGrid,
  NGridItem,
  NThing,
  NAlert,
  NModal,
  NForm,
  NFormItem,
  NInput,
  useMessage
} from 'naive-ui'
import {
  CheckCircle,
  MessageCircle,
  Zap,
  Shield,
  Smartphone,
  Mail,
  Globe,
  Github,
  FileText
} from 'lucide-vue-next'

import packageData from '../../../../package.json'

const message = useMessage()
const showContactModal = ref(false)

const contactData = reactive({
  name: '',
  email: '',
  message: ''
})

const contactRules = {
  name: {
    required: true,
    message: '请输入姓名',
    trigger: 'blur'
  },
  email: {
    required: true,
    message: '请输入邮箱',
    trigger: 'blur'
  },
  message: {
    required: true,
    message: '请输入消息',
    trigger: 'blur'
  }
}

const handleAddQQGroup = () => {
  message.info('正在跳转 QQ 群...')
  //window.open('https://jq.qq.com/?_wv=1027&k=5y5555')
}

const submitContact = () => {
  message.success('消息发送成功！我们会尽快回复您。')
  showContactModal.value = false
  // 重置表单
  Object.assign(contactData, {
    name: '',
    email: '',
    message: ''
  })
}

const viewLicense = () => {
  message.info('正在打开许可证页面...')
  window.open('https://www.gnu.org/licenses/agpl-3.0.zh-cn.html')
}

const downloadSource = () => {
  message.success('正在打开...')
  window.open('https://github.com/LingYuByte-Network/LingYunFrp-Panel-Frontend')
}
</script>

<style scoped>
.n-card {
  margin-bottom: 16px;
}
</style>