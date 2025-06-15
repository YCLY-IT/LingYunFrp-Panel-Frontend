<template>
  <div class="content-grid">
    <!-- 实名认证提示弹窗 -->
    <NModal v-model:show="showRealnameModal" preset="dialog" title="未实名认证提示" :show-icon="false" style="width: 400px;">
      <div>
        您的账户尚未完成实名认证, 请尽快完成实名认证。<br>
      </div>
      <div style="margin-top: 12px; text-align: right;">
        <NText depth="3">{{ countDown }}秒后自动关闭</NText>
      </div>
      <template #action>
        <NButton size="small" @click="showRealnameModal = false">关闭</NButton>
        <NButton size="small" type="primary" @click="goToRealname">立即前往</NButton>
      </template>
    </NModal>
    
    <!-- 搜索和区域筛选 -->
    <NCard title="筛选选项" class="filter-card">
      <NSpace vertical size="medium">
        <NInput style="margin-top: 20px;" v-model:value="searchQuery" placeholder="搜索节点..." clearable>
          <template #prefix>
            <NIcon><SearchOutline /></NIcon>
          </template>
        </NInput>
        
        <div style="margin-top: 10px;">
          <NText>区域筛选：</NText>
          <NSpace style="margin-top: 5px;">
            <NTag 
              :type="selectedRegion === 'all' ? 'primary' : 'default'" 
              checkable 
              :checked="selectedRegion === 'all'"
              @click="selectedRegion = 'all'"
            >
              全部
            </NTag>
            <NTag 
              :type="selectedRegion === 'cn' ? 'primary' : 'default'" 
              checkable 
              :checked="selectedRegion === 'cn'"
              @click="selectedRegion = 'cn'"
            >
              中国大陆
            </NTag>
            <NTag 
              :type="selectedRegion === 'cn-out' ? 'primary' : 'default'" 
              checkable 
              :checked="selectedRegion === 'cn-out'"
              @click="selectedRegion = 'cn-out'"
            >
              中国港澳台
            </NTag>
            <NTag 
              :type="selectedRegion === 'out' ? 'primary' : 'default'" 
              checkable 
              :checked="selectedRegion === 'out'"
              @click="selectedRegion = 'out'"
            >
              海外地区
            </NTag>
          </NSpace>
        </div>
      </NSpace>
    </NCard>
    
    <!-- 节点选择卡片 - 修改为每行三个节点 -->
    <NCard title="选择节点" class="node-card">
      <NSpace vertical>
        <!-- 修改这里的cols属性从1改为3 -->
        <NGrid x-gap="16" y-gap="16" cols="3" responsive="screen" style="padding-top: 14px;">
          <NGridItem v-for="node in filteredNodes" :key="node.value">
            <NCard hoverable @click="handleNodeSelect(node)"
                   :class="{ 'selected-node': selectedNodeId === node.value }" class="node-item">
              <div class="node-header">
                <div class="node-title">
                  <NTag type="info" size="small"># {{ node.id }}</NTag>
                  <NText style="white-space: nowrap; margin-right: 8px;">{{ node.name }}</NText>
                </div>
                <div class="node-tags">
                  <!-- 显示在线/离线状态标签 -->
                  <NTag :type="node.isOnline ? 'success' : 'error'" size="small">
                    {{ node.isOnline ? '在线' : '离线' }}
                  </NTag>
                  
                  <!-- 显示区域标签 -->
                  <NTag :type="getRegionTagType(node.location)" size="small">
                    {{ getRegionName(node.location) }}
                  </NTag>
                  
                  <!-- 显示协议标签 -->
                  <NTag v-if="supportsUdp(node)" type="success" size="small">UDP</NTag>
                  <NTag v-if="supportsHttp(node)" type="success" size="small">
                    {{ supportsHttps(node) ? 'HTTP(S)' : 'HTTP' }}
                  </NTag>
                  <NTag v-else="supportsHttps(node)" type="success" size="small">
                    HTTPS
                  </NTag>
                </div>
              </div>
              
              <NText depth="3" style="font-size: 13px; margin: 8px 0;">{{ node.description }}</NText>
              
              <NSpace vertical size="small" style="margin-top: 8px;">
                <div class="info-item">
                  <NSpace wrap>
                    <NTag v-for="group in node.allowGroups" :key="group.name" size="small" type="info">
                      {{ group.friendlyName }}
                    </NTag>
                  </NSpace>
                </div>
                <div class="info-item">
                  <NSpace wrap>
                    <NTag type="warning" size="small">
                      {{ node.portRange.min }} - {{ node.portRange.max }}
                    </NTag>
                    <NTag type="info" size="small">
                      {{ node.bandWidth }} Mbps
                    </NTag>
                    <NTag v-if="node.needRealname" type="info" size="small">
                      实名
                    </NTag>
                  </NSpace>
                </div>
              </NSpace>
            </NCard>
          </NGridItem>
        </NGrid>
        
        <!-- 无结果提示 -->
        <div v-if="filteredNodes.length === 0" class="no-results">
          <NEmpty description="没有找到符合条件的节点" />
        </div>
      </NSpace>
    </NCard>

    <!-- 隧道配置弹窗 -->
    <NModal v-model:show="showConfigModal" preset="card" title="隧道配置" style="width: 650px;" :bordered="false" :segmented="{
      content: true,
      footer: 'soft'
    }">
      <NForm ref="formRef" :model="formValue" :rules="rules" label-placement="left" label-width="120"
             require-mark-placement="right-hanging">
        <NFormItem label="隧道名称" path="name">
          <NInput v-model:value="formValue.name" placeholder="请输入隧道名称" />
        </NFormItem>

        <NFormItem label="本地地址" path="localAddr">
          <NInput v-model:value="formValue.localAddr" placeholder="请输入本地地址" />
        </NFormItem>

        <NFormItem label="本地端口" path="localPort">
          <NInputNumber v-model:value="formValue.localPort" :min="1" :max="65535" placeholder="请输入本地端口" />
        </NFormItem>

        <NFormItem label="协议类型" path="type">
          <NSelect v-model:value="formValue.type" :options="allowedProxyTypeOptions" placeholder="请选择协议类型" />
        </NFormItem>

        <NFormItem v-if="formValue.type === 'http' || formValue.type === 'https'" label="绑定域名" path="domain">
          <NDynamicTags v-model:value="domainTags" :render-tag="renderDomainTag" />
        </NFormItem>

        <NFormItem v-else label="远程端口" path="remotePort">
          <NSpace>
            <NInputNumber v-model:value="formValue.remotePort" :min="selectedNode?.portRange?.min || 1"
                          :max="selectedNode?.portRange?.max || 65535" placeholder="请输入远程端口" />
            <NButton size="medium" :loading="gettingFreePort" @click="handleGetFreePort">
              获取随机端口
            </NButton>
          </NSpace>
        </NFormItem>

        <NDivider>高级配置</NDivider>
        <NText depth="3" style="padding-bottom: 15px; display: block;">
          提示：仅推荐技术用户使用, 一般用户请勿随意填写。请确保您的配置正确, 否则隧道可能无法启动。
        </NText>

        <NFormItem label="访问密钥" path="accessKey">
          <NInput v-model:value="formValue.accessKey" placeholder="请输入访问密钥" />
        </NFormItem>

        <NFormItem label="Host Header Rewrite" path="hostHeaderRewrite">
          <NInput v-model:value="formValue.hostHeaderRewrite" placeholder="请输入 Host 请求头重写值" />
        </NFormItem>

        <NFormItem label="X-From-Where" path="headerXFromWhere">
          <NInput v-model:value="formValue.headerXFromWhere" placeholder="请输入 X-From-Where 请求头值" />
        </NFormItem>

        <NFormItem label="Proxy Protocol" path="proxyProtocolVersion">
          <NSelect v-model:value="formValue.proxyProtocolVersion" :options="[
            { label: '不启用', value: '' },
            { label: 'v1', value: 'v1' },
            { label: 'v2', value: 'v2' }
          ]" placeholder="Proxy Protocol Version" />
        </NFormItem>

        <NFormItem label="其他选项">
          <div style="display: flex; gap: 16px;">
            <NSwitch v-model:value="formValue.useEncryption" :rail-style="switchButtonRailStyle">
              <template #checked>启用加密</template>
              <template #unchecked>禁用加密</template>
            </NSwitch>
            <NSwitch v-model:value="formValue.useCompression" :rail-style="switchButtonRailStyle">
              <template #checked>启用压缩</template>
              <template #unchecked>禁用压缩</template>
            </NSwitch>
          </div>
        </NFormItem>
      </NForm>
      <template #footer>
        <div style="display: flex; justify-content: flex-end">
          <NButton @click="showConfigModal = false">取消</NButton>
          <NButton type="primary" :loading="loading" @click="showCreateModal" style="margin-left: 12px">
            <template #icon>
              <NIcon>
                <CloudUploadOutline />
              </NIcon>
            </template>
            创建隧道
          </NButton>
        </div>
      </template>
    </NModal>
    
    <!-- 创建隧道确认弹窗 -->
    <NModal v-model:show="showCreateConfirmModal" preset="dialog" title="确认创建隧道" :show-icon="false" style="width: 500px;">
      <div>
        <p>您即将创建以下隧道配置：</p>
        <div class="tunnel-confirm-details">
          <div class="confirm-item">
            <span class="confirm-label">节点：</span>
            <span>{{ selectedNode?.name || '未选择' }}</span>
          </div>
          <div class="confirm-item">
            <span class="confirm-label">隧道名称：</span>
            <span>{{ formValue.name }}</span>
          </div>
          <div class="confirm-item">
            <span class="confirm-label">本地地址：</span>
            <span>{{ formValue.localAddr }}:{{ formValue.localPort }}</span>
          </div>
          <div class="confirm-item">
            <span class="confirm-label">协议类型：</span>
            <span>{{ formValue.type.toUpperCase() }}</span>
          </div>
          <div v-if="formValue.type === 'http' || formValue.type === 'https'" class="confirm-item">
            <span class="confirm-label">绑定域名：</span>
            <span>{{ domainTags.join(', ') }}</span>
          </div>
          <div v-else class="confirm-item">
            <span class="confirm-label">远程端口：</span>
            <span>{{ formValue.remotePort }}</span>
          </div>
        </div>
        <p class="confirm-warning">请确认以上信息无误，点击确认后将创建隧道。</p>
      </div>
      <template #action>
        <NButton size="medium" @click="showCreateConfirmModal = false">取消</NButton>
        <NButton size="medium" type="primary" :loading="loading" @click="handleCreate">确认创建</NButton>
      </template>
    </NModal>
  </div>
</template>

<script setup lang="ts">
import { ref, h, computed, onMounted, watch } from 'vue'
import { NCard, NForm, NFormItem, NInput, NInputNumber, NSelect, NButton, NIcon, useMessage, type FormRules, type FormInst, NDivider, NSwitch, NTag, NSpace, NText, NGrid, NGridItem, NDynamicTags, NModal, NEmpty } from 'naive-ui'
import { CloudUploadOutline, SearchOutline } from '@vicons/ionicons5'
import { switchButtonRailStyle } from '@/constants/theme.ts'
import { useRouter } from 'vue-router'
import { userApi } from "@/net"
import { accessHandle } from "@/net/base.ts"

const router = useRouter()
const message = useMessage()
const formRef = ref<FormInst | null>(null)
const loading = ref(false)

// 新增搜索和区域筛选
const searchQuery = ref('')
const selectedRegion = ref('all') // 'all', 'cn', 'cn-out', 'out'

// 新增弹窗状态
const showConfigModal = ref(false)
const showCreateConfirmModal = ref(false)
const selectedNodeId = ref<number | null>(null)

const formValue = ref({
  nodeId: null as number | null,
  localAddr: '',
  localPort: null as number | null,
  remotePort: null as number | null,
  type: '',
  domain: '',
  name: '',
  accessKey: '',
  hostHeaderRewrite: '',
  headerXFromWhere: '',
  proxyProtocolVersion: '',
  useEncryption: false,
  useCompression: false
})

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
  isDisabled: boolean;
  bandWidth: number;
  location: string;
  allowedProtocols: string[];
  allowGroups: { name: string; friendlyName: string }[];
  needRealname: boolean;
  portRange: {
    min: number;
    max: number
  }
}[]>([])

// 添加区域名称获取函数
const getRegionName = (location: string) => {
  switch (location) {
    case 'cn':
      return '中国大陆'
    case 'cn-out':
      return '中国港澳台'
    case 'out':
      return '海外'
    default:
      return '未知区域'
  }
}

// 添加区域标签类型获取函数
const getRegionTagType = (location: string) => {
  switch (location) {
    case 'cn':
      return 'info'
    case 'cn-out':
      return 'warning'
    case 'out':
      return 'error'
    default:
      return 'default'
  }
}

// 添加过滤节点的计算属性
const filteredNodes = computed(() => {
  return nodeOptions.value.filter(node => {
    // 区域筛选
    if (selectedRegion.value !== 'all' && node.location !== selectedRegion.value) {
      return false
    }
    
    // 搜索筛选
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      return (
        node.name.toLowerCase().includes(query) ||
        node.description.toLowerCase().includes(query) ||
        node.id.toString().includes(query)
      )
    }
    
    return true
  })
})

// 添加协议支持检查函数
const supportsUdp = (node: any) => {
  return node.allowedProtocols.includes('udp')
}

const supportsHttp = (node: any) => {
  return node.allowedProtocols.includes('http')
}

const supportsHttps = (node: any) => {
  return node.allowedProtocols.includes('https')
}

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
        return new Error('端口范围必须在 1-65535之间')
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
  return new Promise((resolve) => {
    userApi.get("/user/info/groups", accessHandle(), (data) => {
      if (data.code === 0) {
        // 处理两种不同的响应格式
        const groups = typeof data.data.groups === 'string' 
          ? JSON.parse(data.data.groups) 
          : data.data.groups;

        groupNameMap.value = groups.reduce((acc: Record<string, string>, group: any) => {
          acc[group.name] = group.friendlyName;
          return acc;
        }, {} as Record<string, string>);
        resolve(true);
      } else {
        message.error(data.message || '获取用户组列表失败');
        resolve(false);
      }
    }, (messageText) => {
      message.error(messageText || '获取用户组列表失败');
      resolve(false);
    })
  })
}

const fetchNodes = async () => {
  userApi.get("/proxy/node/list", accessHandle(), (data) => {
    if (data.code === 0) {
      nodeOptions.value = data.data.map((node: any) => {
        const [minPort, maxPort] = node.allowPort.split('-').map(Number)
        const allowedProtocols = node.allowType.split(';').map((type: string) => type.trim())
        
        // 确保allowGroup分割正确
        const allowGroups = node.allowGroup.split(';')
          .map((group: string) => group.trim())
          .filter((group: string) => group) // 过滤空值
          .map((group: string) => ({
            name: group,
            friendlyName: groupNameMap.value[group] || group
          }));

        return {
          label: `#${node.id} - ${node.name}`,
          value: node.id,
          id: node.id,
          name: node.name,
          hostname: node.hostname,
          description: node.description,
          isOnline: node.status,
          isDisabled: node.isDisabled,
          allowedProtocols,
          allowGroups,
          needRealname: node.needRealname,
          bandWidth: node.bandWidth,
          location: node.location,
          portRange: {
            min: minPort,
            max: maxPort
          }
        }
      })
    }
    // ... existing error handling ...
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

// 修改为点击节点时打开配置弹窗
const handleNodeSelect = (node: any) => {
  if (!node.isOnline) {
    message.error('该节点当前处于离线状态，无法选择')
    return
  }
  
  if (node.isDisabled) {
    message.error('该节点已被禁用，无法选择')
    return
  }
  
  selectedNodeId.value = node.value
  selectedNode.value = {
    id: node.id,
    name: node.name,
    hostname: node.hostname,
    allowedProtocols: node.allowedProtocols,
    allowGroups: node.allowGroups,
    portRange: node.portRange
  }
  
  // 设置表单默认值
  formValue.value.nodeId = node.value
  formValue.value.type = node.allowedProtocols[0] || ''
  formValue.value.remotePort = null
  
  // 打开配置弹窗
  showConfigModal.value = true
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

// 显示创建确认弹窗
const showCreateModal = () => {
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      showCreateConfirmModal.value = true
    }
  })
}

const handleCreate = async () => {
  try {
    loading.value = true

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
    }

    userApi.post(
        "/proxy/create",
          requestData,
          accessHandle(),
          (data) => {
            if (data.code === 0) {
              message.success('隧道创建成功')
              formRef.value?.restoreValidation()
              // 关闭所有弹窗
              showCreateConfirmModal.value = false
              showConfigModal.value = false
              // 重置选中状态
              selectedNodeId.value = null
              // 可以在这里添加创建成功后的跳转逻辑
              // router.push('/dashboard/tunnels')
            } else {
              message.error(data.message || '创建失败')
            }
          },
    )
  } catch (error) {
    const errorMsg = error || '服务器连接异常'
    message.error(`创建失败: ${errorMsg}`)
  } finally {
    loading.value = false
  }
}

const showRealnameModal = ref(false)
const countDown = ref(10)
let timer: number | null = null

const goToRealname = () => {
  router.push('/dashboard/profile')
}

// 修改初始化顺序
const init = async () => {
  await fetchUserGroups()  // 确保先获取用户组信息
  fetchNodes()            // 移除 setTimeout 直接调用
}

onMounted(() => {
  init()
})

const gettingFreePort = ref(false)

const handleGetFreePort = async () => {
  if (!selectedNode.value) return

  // 随机端口
  const min = selectedNode.value.portRange.min || 1024
  const max = selectedNode.value.portRange.max || 65535
  formValue.value.remotePort = Math.floor(Math.random() * (max - min + 1)) + min
}

watch(showRealnameModal, (newVal) => {
  if (!newVal && timer) {
    clearInterval(timer)
    timer = null
  }
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;
.divider-line {
  border-bottom: 1px solid $divider-color;
  margin: 16px 0;
}
.content-grid {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 20px;

  .filter-card, .node-card {
    width: 100%;
    max-width: 1200px; /* 增加最大宽度以适应三列布局 */
    margin: 0 auto;
    
    :deep(.n-card-header) {
      border-bottom: 1px solid $border-color;
    }

    :deep(.n-card__content) {
      max-height: calc(90vh - 100px);
      overflow-y: auto;

      &::-webkit-scrollbar {
        width: 5px;
        border-radius: 5px;
        cursor: pointer;
      }

      &::-webkit-scrollbar-thumb {
        background-color: rgba(255, 255, 255, 0.2);
        border-radius: 5px;
        cursor: pointer;

        &:hover {
          background-color: rgba(255, 255, 255, 0.3);
        }
      }

      &::-webkit-scrollbar-track {
        background-color: transparent;
      }
    }
  }

  .node-item {
    border: 1px solid $border-color;
    transition: $transition-all;
    cursor: pointer;
    height: 100%;
    position: relative;
  }

  .selected-node {
    box-shadow: 0 0 8px rgba($primary-color, 0.2);
    background-color: rgba($primary-color, 0.05);
    border-color: $primary-color !important;

    &:hover {
      background-color: rgba($primary-color, 0.08);
    }
  }

  .node-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
    
    .node-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .node-tags {
      display: flex;
      gap: 4px;
    }
  }

  .info-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 8px;
  }
  
  .no-results {
    padding: 40px 0;
    text-align: center;
  }
}

/* 确认弹窗样式 */
.tunnel-confirm-details {
  background-color: rgba($primary-color, 0.05);
  border-radius: 8px;
  padding: 16px;
  margin: 12px 0;
}

.confirm-item {
  display: flex;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .confirm-label {
    width: 100px;
    color: $text-color-2;
    font-weight: 500;
  }
}

.confirm-warning {
  font-size: 14px;
  margin-top: 12px;
}

/* 添加响应式布局 */
@media (max-width: 1200px) {
  .content-grid .node-card, .content-grid .filter-card {
    max-width: 900px;
  }
}

@media (max-width: 768px) {
  .content-grid .node-card :deep(.n-grid) {
    grid-template-columns: repeat(1, 1fr) !important;
  }
}
</style>