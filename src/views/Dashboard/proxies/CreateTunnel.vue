<template>
  <div class="content-grid">
    <!-- 实名认证提示弹窗 -->
    <NModal v-model:show="showRealnameModal" preset="dialog" title="未实名认证提示" :show-icon="false" style="width: 400px;">
      <div>
        您的账户尚未完成实名认证, 请尽快完成实名认证。<br>
        实名认证后, 您将获得更多节点权限, 且双向带宽将提升至 30Mbps。
      </div>
      <div style="margin-top: 12px; text-align: right;">
        <NText depth="3">{{ countDown }}秒后自动关闭</NText>
      </div>
      <template #action>
        <NButton size="small" @click="showRealnameModal = false">关闭</NButton>
        <NButton size="small" type="primary" @click="goToRealname">立即前往</NButton>
      </template>
    </NModal>
    <!-- 修改步骤指示器区域 -->
    <div class="steps-container" v-if="isMobile" style="user-select: none">
      <NButton secondary round v-if="currentStep === 2" @click="currentStep = 1" size="medium">
        返回
        <template #icon>
          <NIcon>
            <ArrowBackOutline />
          </NIcon>
        </template>
      </NButton>
      <NSteps :current="currentStep" class="mobile-steps">
        <NStep title="选择节点" />
        <NStep title="隧道配置" />
      </NSteps>
    </div>
    <!-- 修改节点卡片的显示逻辑 -->
    <NCard v-if="!isMobile || currentStep === 1" title="选择节点" class="node-card">
      <NSpace vertical>
        <NGrid x-gap="12" y-gap="12" cols="1" style="padding-top: 14px;">
          <NGridItem v-for="node in nodeOptions" :key="node.value">
            <NCard hoverable @click="handleNodeChange(node.value)"
                   :class="{ 'selected-node': formValue.nodeId === node.value }" class="node-item">
              <NSpace vertical>
                <div class="node-header">
                  <NSpace align="center" justify="space-between">
                    <NSpace align="center">
                      <NSpace :size="4">
                        <NTag type="info" size="small"># {{ node.id }}</NTag>
                        <NTag :type="node.isOnline ? 'success' : 'error'" size="small">
                          {{ node.isOnline ? '在线' : '离线' }}
                        </NTag>
                      </NSpace>
                      <NText>{{ node.name }}</NText>
                    </NSpace>
                  </NSpace>
                </div>
                <NText depth="3" style="font-size: 13px;">{{ node.description }}</NText>
                <NSpace vertical size="small">
                  <div class="info-item">
                    <span class="label">用户组:</span>
                    <NSpace>
                      <NTag v-for="group in node.allowGroups" :key="group.name" size="small" type="info">
                        {{ group.friendlyName }}
                      </NTag>
                    </NSpace>
                  </div>
                  <div class="info-item">
                    <span class="label">支持协议:</span>
                    <NSpace>
                      <NTag v-for="protocol in node.allowedProtocols" :key="protocol" size="small" type="success">
                        {{ protocol.toUpperCase() }}
                      </NTag>
                    </NSpace>
                  </div>
                  <div class="info-item">
                    <span class="label">端口范围:</span>
                    <NTag type="warning" size="small">
                      {{ node.portRange.min }} - {{ node.portRange.max }}
                    </NTag>
                  </div>
                </NSpace>
              </NSpace>
            </NCard>
          </NGridItem>
        </NGrid>
      </NSpace>
    </NCard>

    <!-- 修改配置卡片的显示逻辑 -->
    <NCard v-if="!isMobile || currentStep === 2" title="隧道配置" class="config-card">
      <!-- 基础配置 -->
      <NForm ref="formRef" :model="formValue" :rules="rules" label-placement="left" label-width="120"
             require-mark-placement="right-hanging">
        <NFormItem label="隧道名称" path="name">
          <NInput v-model:value="formValue.name" placeholder="请输入隧道名称" :disabled="!canEditConfig" />
        </NFormItem>

        <NFormItem label="本地地址" path="localAddr">
          <NInput v-model:value="formValue.localAddr" placeholder="请输入本地地址" :disabled="!canEditConfig" />
        </NFormItem>

        <NFormItem label="本地端口" path="localPort">
          <NInputNumber v-model:value="formValue.localPort" :min="1" :max="65535" placeholder="请输入本地端口"
                        :disabled="!canEditConfig" />
        </NFormItem>

        <NFormItem label="协议类型" path="type">
          <NSelect v-model:value="formValue.type" :options="allowedProxyTypeOptions" placeholder="请选择协议类型"
                   :disabled="!canEditConfig" />
        </NFormItem>

        <NFormItem v-if="formValue.type === 'http' || formValue.type === 'https'" label="绑定域名" path="domain">
          <NDynamicTags v-model:value="domainTags" :render-tag="renderDomainTag" :disabled="!canEditConfig" />
        </NFormItem>

        <NFormItem v-else label="远程端口" path="remotePort">
          <NSpace align="center">
            <NInputNumber v-model:value="formValue.remotePort" :min="selectedNode?.portRange?.min || 1"
                          :max="selectedNode?.portRange?.max || 65535" placeholder="请输入远程端口" :disabled="!canEditConfig" />
            <NButton size="medium" :loading="gettingFreePort" :disabled="!canEditConfig" @click="handleGetFreePort">
              获取随机端口
            </NButton>
          </NSpace>
        </NFormItem>

        <NDivider>高级配置</NDivider>
        <NText depth="3" style="padding-bottom: 15px; display: block;">
          提示：仅推荐技术用户使用, 一般用户请勿随意填写。请确保您的配置正确, 否则隧道可能无法启动。
        </NText>

        <NFormItem label="访问密钥" path="accessKey">
          <NInput v-model:value="formValue.accessKey" placeholder="请输入访问密钥" :disabled="!canEditConfig" />
        </NFormItem>

        <NFormItem label="Host Header Rewrite" path="hostHeaderRewrite">
          <NInput v-model:value="formValue.hostHeaderRewrite" placeholder="请输入 Host 请求头重写值"
                  :disabled="!canEditConfig" />
        </NFormItem>

        <NFormItem label="X-From-Where" path="headerXFromWhere">
          <NInput v-model:value="formValue.headerXFromWhere" placeholder="请输入 X-From-Where 请求头值"
                  :disabled="!canEditConfig" />
        </NFormItem>

        <NFormItem label="Proxy Protocol" path="proxyProtocolVersion">
          <NSelect v-model:value="formValue.proxyProtocolVersion" :options="[
            { label: '不启用', value: '' },
            { label: 'v1', value: 'v1' },
            { label: 'v2', value: 'v2' }
          ]" placeholder="Proxy Protocol Version" :disabled="!canEditConfig" />
        </NFormItem>

        <NFormItem label="其他选项">
          <div style="display: flex; gap: 16px;">
            <NSwitch v-model:value="formValue.useEncryption" :rail-style="switchButtonRailStyle" :disabled="!canEditConfig">
              <template #checked>启用加密</template>
              <template #unchecked>禁用加密</template>
            </NSwitch>
            <NSwitch v-model:value="formValue.useCompression" :rail-style="switchButtonRailStyle" :disabled="!canEditConfig">
              <template #checked>启用压缩</template>
              <template #unchecked>禁用压缩</template>
            </NSwitch>
          </div>
        </NFormItem>
      </NForm>

      <!-- 修改提交按钮区域 -->
      <div class="submit-section">
        <NSpace justify="end">
          <NButton v-if="isMobile && currentStep === 1" type="primary" :disabled="!formValue.nodeId"
                   @click="currentStep = 2">
            下一步
          </NButton>
          <NButton v-if="!isMobile || currentStep === 2" type="primary" :loading="loading" @click="handleCreate"
                   :disabled="!canEditConfig">
            <template #icon>
              <NIcon>
                <CloudUploadOutline />
              </NIcon>
            </template>
            创建隧道
          </NButton>
        </NSpace>
      </div>
    </NCard>
  </div>
</template>

<script setup lang="ts">
import { ref, h, computed, onMounted, onUnmounted, watch } from 'vue'
import { NCard, NForm, NFormItem, NInput, NInputNumber, NSelect, NButton, NIcon, useMessage, type FormRules, type FormInst, NDivider, NSwitch, NTag, NSpace, NText, NGrid, NGridItem, NDynamicTags, NSteps, NStep, NModal } from 'naive-ui'
import { CloudUploadOutline, ArrowBackOutline } from '@vicons/ionicons5'
import { switchButtonRailStyle } from '@/constants/theme.ts'
import { useRouter } from 'vue-router'
import {userApi} from "@/net";
import {accessHandle} from "@/net/base.ts";

const router = useRouter()
const message = useMessage()
const formRef = ref<FormInst | null>(null)
const loading = ref(false)
const userGroup = localStorage.getItem('group')

const formValue = ref({
  nodeId: null as number | null,
  localAddr: '',
  localPort: null as number | null,
  remotePort: null as number | null,
  type: null as string | null,
  domain: '',
  name: '',
  accessKey: '',
  hostHeaderRewrite: '',
  headerXFromWhere: '',
  proxyProtocolVersion: '',
  useEncryption: false,
  useCompression: false
})

const goToRealname = () => {
  router.push('/dashboard/profile')
}

const proxyTypeOptions = [
  { label: 'TCP', value: 'tcp' },
  { label: 'UDP', value: 'udp' },
  { label: 'HTTP', value: 'http' },
  { label: 'HTTPS', value: 'https' }
]

const nodeOptions = ref<{
  label: string;
  value: number;
  id: number;
  name: string;
  hostname: string;
  description: string;
  isOnline: boolean;
  allowedProtocols: string[];
  allowGroups: { name: string; friendlyName: string }[];
  portRange: {
    min: number;
    max: number
  }
}[]>([])

const rules: FormRules = {
  nodeId: {
    required: true,
    message: '请选择节点',
    trigger: 'blur'
  },
  localAddr: {
    required: true,
    message: '请输入本地地址',
    trigger: 'blur'
  },
  localPort: {
    required: true,
    type: 'number',
    message: '请输入本地端口',
    trigger: 'blur',
    validator: (_rule, value) => {
      if (typeof value !== 'number' || value < 1 || value > 65535) {
        return new Error('端口范围必须在 1-65535 之间')
      }
      return true
    }
  },
  remotePort: {
    required: true,
    type: 'number',
    message: '请输入远程端口',
    trigger: 'blur',
    validator: (_rule, value) => {
      if (['http', 'https'].includes(formValue.value.type || '')) {
        return true
      }
      if (typeof value !== 'number' || value < 1 || value > 65535) {
        return new Error('端口范围必须在 1-65535 之间')
      }
      return true
    }
  },
  type: {
    required: true,
    message: '请选择隧道类型',
    trigger: 'blur'
  },
  name: {
    required: true,
    message: '请输入隧道名称',
    trigger: 'blur'
  },
  domain: {
    validator: (_rule, _value) => {
      if (formValue.value.type === 'http' || formValue.value.type === 'https') {
        if (!domainTags.value.length) {
          return new Error('请至少添加一个域名')
        }
      }
      return true
    },
    trigger: ['blur', 'change']
  }
}

const groupNameMap = ref<Record<string, string>>({})

const fetchUserGroups = async () => {
  userApi.get("/user/info/groups", accessHandle(), (data) => {
      if (data.code === 0) {
          groupNameMap.value = data.data.groups.reduce((acc: Record<string, string>, group: any) => {
              acc[group.name] = group.friendlyName
              return acc
          }, {} as Record<string, string>)
      } else {
          message.error(data.message || '获取用户组列表失败')
      }
  }, (error) => {
      message.error(error?.response?.data?.message || '获取用户组列表失败')
  })
}

const fetchNodes = async () => {
    userApi.get("/proxy/node/list", accessHandle(), (data) => {
      if (data.code === 0) {
        nodeOptions.value = data.data.map((node: any) => {
          const [minPort, maxPort] = node.allowPort.split('-').map(Number)
          const allowedProtocols = node.allowType.split(';').map((type: string) => type.trim())
          const allowGroups = node.allowGroup.split(';').map((group: string) => {
            const trimmedGroup = group.trim()
            return {
              name: trimmedGroup,
              friendlyName: groupNameMap.value[trimmedGroup] || trimmedGroup
            }
          })

          return {
            label: `#${node.id} - ${node.name}`,
            value: node.id,
            id: node.id,
            name: node.name,
            hostname: node.hostname,
            description: node.description,
            isOnline: node.status,
            allowedProtocols,
            allowGroups,
            portRange: {
              min: minPort,
              max: maxPort
            }
          }
      })
      } else {
        message.error(data.message || '获取节点列表失败')
      }
    }, (error) => {
        message.error(error.message || '获取节点列表失败')
    })
}
const selectedNode = ref<{
  id: number;
  name: string;
  hostname: string;
  allowedProtocols: string[];
  allowGroups: { name: string; friendlyName: string }[];
  portRange: {
    min: number;
    max: number;
  };
} | null>(null)

const handleNodeChange = (value: number | null) => {
  if (value) {
    const node = nodeOptions.value.find(opt => opt.value === value)
    if (node) {
      selectedNode.value = {
        id: node.id,
        name: node.name,
        hostname: node.hostname,
        allowedProtocols: node.allowedProtocols,
        allowGroups: node.allowGroups,
        portRange: node.portRange
      }
      formValue.value.nodeId = value
      formValue.value.type = selectedNode.value?.allowedProtocols[0] || null
      formValue.value.remotePort = null

      // 在移动端选择节点后自动进入下一步
      if (isMobile.value) {
        currentStep.value = 2
      }
    }
  } else {
    selectedNode.value = null
    formValue.value.nodeId = null
  }
}

const allowedProxyTypeOptions = computed(() => {
  if (!selectedNode.value) return proxyTypeOptions
  return proxyTypeOptions.filter(opt =>
      selectedNode.value?.allowedProtocols.includes(opt.value)
  )
})

const domainTags = ref<string[]>([])

const handleDomainTagsUpdate = (tags: string[]) => {
  domainTags.value = tags
  formValue.value.domain = JSON.stringify(tags)
}

const renderDomainTag = (tag: string) => {
  return h(
      NTag,
      {
        round: false,
        closable: true,
        onClose: () => {
          const index = domainTags.value.indexOf(tag)
          if (index !== -1) {
            const newTags = [...domainTags.value]
            newTags.splice(index, 1)
            domainTags.value = newTags
            handleDomainTagsUpdate(newTags)
          }
        }
      },
      { default: () => tag }
  )
}


const handleCreate = () => {
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      try {
        loading.value = true;

        const requestData = {
          nodeId: formValue.value.nodeId,
          proxyName: formValue.value.name,
          localIp: formValue.value.localAddr,
          localPort: formValue.value.localPort,
          remotePort: formValue.value.remotePort,
          domain: ['http', 'https'].includes(formValue.value.type)
              ? JSON.stringify(domainTags.value)
              : '',
          proxyType: formValue.value.type,
          accessKey: formValue.value.accessKey,
          hostHeaderRewrite: formValue.value.hostHeaderRewrite,
          headerXFromWhere: formValue.value.headerXFromWhere,
          proxyProtocolVersion: formValue.value.proxyProtocolVersion,
          useEncryption: formValue.value.useEncryption,
          useCompression: formValue.value.useCompression
        };

        userApi.post(
            "/proxy/create",
              requestData,
              accessHandle(),
              (data) => {
                if (data.code === 0) {
                  message.success('隧道创建成功');
                  formRef.value?.restoreValidation();
                } else {
                  message.error(data.message || '创建失败');
                }
              },
        );
      } catch (error) {
        const errorMsg = error.response?.data?.message || '服务器连接异常';
        message.error(`创建失败: ${errorMsg}`);
      } finally {
        loading.value = false;
      }
    }
  });
}


// 计算是否可以编辑配置
const canEditConfig = computed(() => {
  return formValue.value.nodeId && selectedNode.value
})

const showRealnameModal = ref(false)
const countDown = ref(10)
let timer: number | null = null

const startCountDown = () => {
  countDown.value = 10
  timer = window.setInterval(() => {
    if (countDown.value > 0) {
      countDown.value--
    } else {
      showRealnameModal.value = false
      if (timer) {
        clearInterval(timer)
        timer = null
      }
    }
  }, 1000)
}

watch(showRealnameModal, (newVal) => {
  if (!newVal && timer) {
    clearInterval(timer)
    timer = null
  }
})

// 修改初始化顺序
const init = async () => {
  await fetchUserGroups()
  await fetchNodes()
  if (userGroup === 'noRealname') {
    showRealnameModal.value = true
    startCountDown()
  }
}

// 修改初始化调用
init()
const isMobile = ref(window.innerWidth <= 768)

const handleResize = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})
const currentStep = ref<number>(1)

const gettingFreePort = ref(false)

const handleGetFreePort = async () => {
  if (!canEditConfig.value) return

  //随机端口
  formValue.value.remotePort = Math.floor(Math.random() * (65535 - 1024 + 1)) + 1024
}
</script>

<style lang="scss" scoped>
@use '../../../assets/styles/createProxy.scss';
</style>