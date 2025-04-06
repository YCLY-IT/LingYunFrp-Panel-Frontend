<template>
  <div>
    <NCard title="隧道管理">
      <NSpace vertical :size="12">
        <NInput v-model:value="filters.search" placeholder="搜索ID、隧道名、用户名或绑定域名" clearable style="width: 100%"
          @update:value="handleSearch" />
        <NSelect v-model:value="filters.nodeId" :options="nodeOptions" placeholder="节点" clearable style="width: 100%"
          @update:value="handleFilterChange" />
        <NSpace>
          <NSelect v-model:value="filters.proxyType" :options="proxyTypeOptions" placeholder="协议" clearable
            style="width: 120px" @update:value="handleFilterChange" />
          <NSelect v-model:value="filters.isOnline" :options="onlineOptions" placeholder="在线状态" clearable
            style="width: 120px" @update:value="handleFilterChange" />
          <NSelect v-model:value="filters.isBanned" :options="banOptions" placeholder="封禁状态" clearable
            style="width: 120px" @update:value="handleFilterChange" />
        </NSpace>

        <NDataTable remote :columns="columns" :data="proxies" :loading="loading" :pagination="pagination"
          :style="{
            '.n-data-table-td': {
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '200px'
            }
          }"
          @update:page="handlePageChange" />
      </NSpace>
    </NCard>

    <!-- 编辑隧道弹窗 -->
    <NModal v-model:show="showEditModal" preset="dialog" title="编辑隧道" style="width: 600px">
        <NForm ref="editFormRef" :model="editForm" :rules="rules" label-placement="left" label-width="120"
          require-mark-placement="right-hanging" size="medium" style="padding-top: 12px;">
          <NFormItem label="隧道名称" path="proxyName">
            <NInput v-model:value="editForm.proxyName" placeholder="请输入隧道名称" />
          </NFormItem>
          <NFormItem label="节点" path="nodeId">
            <NSelect v-model:value="editForm.nodeId" :options="nodeOptions" placeholder="请选择节点" />
          </NFormItem>
          <NFormItem label="本地地址" path="localIp">
            <NInput v-model:value="editForm.localIp" placeholder="请输入本地地址" />
          </NFormItem>
          <NFormItem label="本地端口" path="localPort">
            <NInputNumber v-model:value="editForm.localPort" :min="1" :max="65535" placeholder="请输入本地端口" />
          </NFormItem>
          <NFormItem label="协议类型" path="proxyType">
            <NSelect v-model:value="editForm.proxyType" :options="proxyTypeOptions" placeholder="请选择协议类型" />
          </NFormItem>
          <NFormItem v-if="editForm.proxyType === 'http' || editForm.proxyType === 'https'" label="绑定域名"
            path="domain">
            <NDynamicTags v-model:value="domainTags" :render-tag="renderDomainTag" />
          </NFormItem>
          <NFormItem v-else label="远程端口" path="remotePort">
              <NInputNumber v-model:value="editForm.remotePort" :min="1" :max="65535" placeholder="请输入远程端口" />
              <NButton size="medium" :loading="gettingFreePort" @click="handleGetFreePortForEdit">
                获取空闲端口
              </NButton>
          </NFormItem>

          <NDivider>高级配置</NDivider>

          <NFormItem label="访问密钥" path="accessKey">
            <NInput v-model:value="editForm.accessKey" placeholder="访问密钥已不再支持" :disabled="true" />
          </NFormItem>
          <NFormItem label="Host Header Rewrite" path="hostHeaderRewrite">
            <NInput v-model:value="editForm.hostHeaderRewrite" placeholder="请输入 Host 请求头重写值" />
          </NFormItem>
          <NFormItem label="X-From-Where" path="headerXFromWhere">
            <NInput v-model:value="editForm.headerXFromWhere" placeholder="请输入 X-From-Where 请求头值" />
          </NFormItem>
          <NFormItem label="Proxy Protocol" path="proxyProtocolVersion">
            <NSelect v-model:value="editForm.proxy_protocol_version" :options="[
              { label: '不启用', value: '' },
              { label: 'v1', value: 'v1' },
              { label: 'v2', value: 'v2' }
            ]" placeholder="Proxy Protocol Version" />
          </NFormItem>
          <NFormItem label="其他选项">
            <div style="display: flex; gap: 16px;">
              <NSwitch v-model:value="editForm.use_encryption" :rail-style="switchButtonRailStyle">
                <template #checked>启用加密</template>
                <template #unchecked>禁用加密</template>
              </NSwitch>
              <NSwitch v-model:value="editForm.use_compression" :rail-style="switchButtonRailStyle">
                <template #checked>启用压缩</template>
                <template #unchecked>禁用压缩</template>
              </NSwitch>
            </div>
          </NFormItem>
        </NForm>
      <template #action>
        <NButton secondary size="small" @click="showEditModal = false">取消</NButton>
        <NButton secondary size="small" type="primary" :loading="submitting" @click="handleEditSubmit">确定</NButton>
      </template>
    </NModal>

    <!-- 下线确认模态框 -->
    <NModal v-model:show="showKickModal" preset="dialog" title="确认下线">
      <template #default>
        确认要强制下线此隧道吗？
      </template>
      <template #action>
        <NButton secondary size="small" @click="showKickModal = false">取消</NButton>
        <NButton secondary size="small" type="info" :loading="loading" @click="handleKickProxy(currentProxy)">确定</NButton>
      </template>
    </NModal>

    <!-- 启用/禁用确认模态框 -->
    <NModal v-model:show="showToggleModal" preset="dialog" :title="currentProxy?.isDisabled ? '确认启用' : '确认禁用'">
      <template #default>
        {{ currentProxy?.isDisabled ? '确认启用此隧道？' : '确认禁用此隧道？' }}
      </template>
      <template #action>
        <NButton secondary size="small" @click="showToggleModal = false">取消</NButton>
        <NButton 
          secondary
          size="small" 
          :type="currentProxy?.isDisabled ? 'success' : 'warning'"
          :loading="loading" 
          @click="handleToggleProxy(currentProxy)"
        >确定</NButton>
      </template>
    </NModal>

    <!-- 封禁/解封确认模态框 -->
    <NModal v-model:show="showBanModal" preset="dialog" :title="currentProxy?.isBanned ? '确认解封' : '确认封禁'">
      <template #default>
        {{ currentProxy?.isBanned ? '确认解封此隧道？' : '确认封禁此隧道？' }}
      </template>
      <template #action>
        <NButton secondary size="small" @click="showBanModal = false">取消</NButton>
        <NButton 
          secondary
          size="small" 
          :type="currentProxy?.isBanned ? 'success' : 'warning'"
          :loading="loading" 
          @click="handleToggleBan(currentProxy)"
        >确定</NButton>
      </template>
    </NModal>

    <!-- 删除确认模态框 -->
    <NModal v-model:show="showDeleteModal" preset="dialog" title="确认删除">
      <template #default>
        确认要删除此隧道吗？此操作不可恢复！
      </template>
      <template #action>
        <NButton secondary size="small" @click="showDeleteModal = false">取消</NButton>
        <NButton secondary size="small" type="error" :loading="loading" @click="handleDelete(currentProxy)">确定</NButton>
      </template>
    </NModal>
  </div>
</template>

<script lang="ts" setup>
import { ref, h, VNode } from 'vue'
import { NCard, NSpace, NDataTable, NButton, NInput, NSelect, useMessage, NTag, NModal, NForm, NFormItem, NInputNumber, NDynamicTags, NDivider, NSwitch, NDropdown, NIcon } from 'naive-ui'
import type { DataTableColumns, SelectOption, FormRules, FormInst } from 'naive-ui'
import type { Proxy, FilterProxiesArgs, UserNode } from '@/types'
import { switchButtonRailStyle } from '@/constants/theme.ts'
import { BanOutline, TrashOutline, EllipsisHorizontalCircleOutline, CreateOutline, PowerOutline, LogOutOutline } from '@vicons/ionicons5'
import { DropdownMixedOption } from 'naive-ui/es/dropdown/src/interface'
import {userApi} from "@/net";
import {accessHandle} from "@/net/base.ts";

const message = useMessage()
const loading = ref(false)
const proxies = ref<Proxy[]>([])

const filters = ref<{
  search: string;
  proxyType: string | null;
  isOnline: string | null;
  isBanned: string | null;
  nodeId: number | null;
}>({
  search: '',
  proxyType: null,
  isOnline: null,
  isBanned: null,
  nodeId: null
})

const proxyTypeOptions: SelectOption[] = [
  { label: 'TCP', value: 'tcp' },
  { label: 'UDP', value: 'udp' },
  { label: 'HTTP', value: 'http' },
  { label: 'HTTPS', value: 'https' }
]

const onlineOptions: SelectOption[] = [
  { label: '在线', value: 'online' },
  { label: '离线', value: 'offline' }
]

const banOptions: SelectOption[] = [
  { label: '正常', value: 'normal' },
  { label: '已封禁', value: 'banned' }
]

const pagination = ref({
  page: 1,
  pageSize: 20,
  pageCount: 1,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [
    {
      label: '10 条 / 页',
      value: 10
    },
    {
      label: '20 条 / 页',
      value: 20
    },
    {
      label: '30 条 / 页',
      value: 30
    },
    {
      label: '40 条 / 页',
      value: 40
    }
  ],
  prefix({ itemCount }: { itemCount?: number }) {
    return `共 ${itemCount} 条`
  },
  onUpdatePage: (page: number) => {
    pagination.value.page = page
    loadData()
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.value.pageSize = pageSize
    pagination.value.page = 1
    loadData()
  }
})

const showEditModal = ref(false)
const editFormRef = ref<FormInst | null>(null)
const submitting = ref(false)

interface NodeOption extends SelectOption {
  id: number;
  name: string;
  hostname: string;
}

const nodeOptions = ref<NodeOption[]>([])

const editForm = ref({
  proxyId: 0,
  nodeId: 0,
  proxyName: '',
  localIp: '',
  localPort: 0,
  remotePort: 0,
  proxyType: '',
  domain: '',
  location: '',
  accessKey: '',
  hostHeaderRewrite: '',
  headerXFromWhere: '',
  use_encryption: false,
  use_compression: false,
  proxy_protocol_version: '',
  username: ''
})

const domainTags = ref<string[]>([])

const handleDomainsUpdate = (tags: string[]) => {
  domainTags.value = tags
  editForm.value.domain = JSON.stringify(tags)
}

const handleEdit = (proxy: Proxy) => {
  editForm.value = {
    proxyId: proxy.ProxyId,
    nodeId: proxy.node,
    proxyName: proxy.proxy_name,
    localIp: proxy.local_ip,
    localPort: proxy.local_port,
    remotePort: proxy.remote_port,
    proxyType: proxy.proxy_type,
    domain: proxy.domain || '',
    location: proxy.location || '',
    accessKey: '',
    hostHeaderRewrite: proxy.hostHeaderRewrite || '',
    headerXFromWhere: proxy.headerXFromWhere || '',
    use_encryption: proxy.use_encryption || false,
    use_compression: proxy.use_compression || false,
    proxy_protocol_version: proxy.proxy_protocol_version || '',
    username: proxy.username || ''
  }
  
  // 解析域名字符串为数组
  if (proxy.domain && ['http', 'https'].includes(proxy.proxyType)) {
    try {
      // 尝试解析JSON字符串
      domainTags.value = JSON.parse(proxy.domain)
    } catch (e) {
      // 如果解析失败，尝试其他格式处理
      domainTags.value = proxy.domain
        .replace(/[\[\]"]/g, '')
        .split(',')
        .map(domain => domain.trim())
        .filter(Boolean)
    }
  } else {
    domainTags.value = []
  }
  
  showEditModal.value = true
}

const rules: FormRules = {
  proxyName: {
    required: true,
    message: '请输入隧道名称',
    trigger: ['blur', 'input']
  },
  localIp: {
    required: true,
    message: '请输入本地地址',
    trigger: ['blur', 'input']
  },
  localPort: {
    type: 'number',
    required: true,
    message: '请输入本地端口',
    trigger: ['blur', 'input'],
    validator: (_rule, value) => {
      if (typeof value !== 'number' || value < 1 || value > 65535) {
        return new Error('端口范围必须在 1-65535 之间')
      }
      return true
    }
  },
  remotePort: {
    required: true,
    message: '请输入远程端口',
    trigger: ['blur', 'input'],
    validator: (_rule, value) => {
      if (['http', 'https'].includes(editForm.value.proxyType)) {
        return true
      }
      if (typeof value !== 'number' || value < 1 || value > 65535) {
        return new Error('端口范围必须在 1-65535 之间')
      }
      return true
    }
  },
  domain: {
    required: true,
    message: '请输入绑定域名',
    trigger: ['blur', 'input'],
    validator: (_rule, _value) => {
      if (!['http', 'https'].includes(editForm.value.proxyType)) {
        return true
      }
      if (!domainTags.value.length) {
        return new Error('请至少添加一个域名')
      }
      return true
    }
  },
  proxyType: {
    required: true,
    message: '请选择协议类型',
    trigger: ['blur', 'change']
  },
  nodeId: {
    type: 'number',
    required: true,
    message: '请选择节点',
    trigger: ['blur', 'change']
  }
}

const renderStatus = (row: Proxy) => {
  const tags: VNode[] = []

  // 在线状态标签
  tags.push(h(
    NTag,
    {
      type: row.is_online ? 'success' : 'warning',
      size: 'small',
      style: 'margin-right: 4px'
    },
    { default: () => row.is_online ? '在线' : '离线' }
  ))

  // 封禁状态标签
  if (row.is_banned) {
    tags.push(h(
      NTag,
      {
        type: 'error',
        size: 'small',
        style: 'margin-right: 4px'
      },
      { default: () => '已封禁' }
    ))
  }

  // 禁用状态标签
  if (row.is_disabled) {
    tags.push(h(
      NTag,
      {
        type: 'warning',
        size: 'small'
      },
      { default: () => '已禁用' }
    ))
  }

  return h(NSpace, { size: 4 }, { default: () => tags })
}

const handleToggleProxy = async (proxy: Proxy | null) => {
  if (!proxy) return
  try {
    userApi.post(`/user/admin/proxy/toggle/${proxy.ProxyId}`, {
      isDisabled: !proxy.is_disabled
    }, accessHandle(), (data) => {
      if (data.code === 0) {
        proxy.isDisabled = !proxy.is_disabled
      } else {
        message.error(data.message || '操作失败')
      }
    }, (error) => {
      message.error(error.message || '操作失败')
    })
    message.success(proxy.is_disabled ? '启用隧道成功' : '禁用隧道成功')
    showToggleModal.value = false
    // 定时器
    setTimeout(() => {
      loadData()
    }, 1000)
  } catch (error: any) {
    message.error(error?.response?.data?.message || '操作失败')
  }
}

const dropdownOptions = (row: Proxy): DropdownMixedOption[] => [
  {
    label: '编辑',
    key: 'edit',
    disabled: false,
    type: 'primary',
    icon: () => h(NIcon, null, { default: () => h(CreateOutline) })
  },
  {
    label: row.is_disabled ? '启用' : '禁用',
    key: 'toggle',
    disabled: false,
    type: row.is_disabled ? 'success' : 'warning',
    icon: () => h(NIcon, null, { default: () => h(PowerOutline) })
  },
  {
    label: '下线',
    key: 'kick',
    disabled: !row.isOnline,
    type: 'info',
    icon: () => h(NIcon, null, { default: () => h(LogOutOutline) })
  },
  {
    label: row.is_banned ? '解封' : '封禁',
    key: 'ban',
    disabled: false,
    type: row.is_banned ? 'success' : 'warning',
    icon: () => h(NIcon, null, { default: () => h(BanOutline) })
  },
  {
    label: '删除',
    key: 'delete',
    disabled: false,
    type: 'error',
    icon: () => h(NIcon, null, { default: () => h(TrashOutline) })
  }
]

const handleSelect = (key: string, row: Proxy) => {
  currentProxy.value = row
  switch (key) {
    case 'edit':
      handleEdit(row)
      break
    case 'toggle':
      showToggleModal.value = true
      break
    case 'kick':
      showKickModal.value = true
      break
    case 'ban':
      showBanModal.value = true
      break
    case 'delete':
      showDeleteModal.value = true
      break
  }
}

const columns: DataTableColumns<Proxy> = [
  {
    title: 'ID',
    key: 'proxyId',
    render(row) {
      return h('div', { style: 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;' }, row.ProxyId)
    }
  },
  {
    title: '所属用户',
    key: 'username',
    render(row) {
      return h('div', { style: 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;' }, row.username)
    }
  },
  {
    title: '隧道名',
    key: 'proxyName',
    render(row) {
      return h('div', { style: 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;' }, row.proxy_name)
    }
  },
  {
    title: '节点',
    key: 'nodeId',
    render(row: Proxy) {
      const node = nodeOptions.value.find(opt => opt.ID === row.nodeId)
      return h('div', { style: 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;' }, {
        default: () => [
          h(NTag, { type: 'info', style: 'margin-right: 4px' }, { default: () => `#${row.node}` }),
          node?.name || '未知节点'
        ]
      })
    }
  },
  {
    title: '本地地址',
    key: 'localIp',
    render(row) {
      return h('div', { style: 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;' }, [
        h('span', null, row.local_ip),
        h('span', null, ':'),
        h('span', { class: 'n-text', style: 'color: var(--n-primary-color); font-weight: bold;' }, row.local_port)
      ])
    }
  },
  {
    title: '远程端口/域名',
    key: 'remotePort',
    render(row) {
      if (['http', 'https'].includes(row.proxy_type)) {
        const domains = (row.domain || '-')
          .replace(/[\[\]"]/g, '')
          .split(',')
          .map(domain => domain.trim())
          .filter(Boolean)
        return h(NSpace, { vertical: true, size: 4 }, {
          default: () => domains.map(domain =>
            h(NTag, {
              type: 'info',
              style: 'max-width: 100%; word-break: break-all; cursor: pointer',
              onClick: () => {
                window.open(`${row.proxy_type}://${domain}`, '_blank')
              }
            }, { default: () => domain })
          )
        })
      }
      const node = nodeOptions.value.find(opt => opt.id === row.node)
      return h(NTag, {
        type: 'info',
        style: 'max-width: 100%; cursor: pointer',
        onClick: () => {
          const text = `${node?.hostname}:${row.remote_port}`
          navigator.clipboard.writeText(text)
          message.success('已复制到剪贴板：' + text)
        }
      }, { default: () => `${node?.hostname}:${row.remote_port}` })
    }
  },
  {
    title: '协议',
    key: 'proxyType',
    render(row) {
      const option = proxyTypeOptions.find(opt => opt.value === row.proxy_type)
      return h(
        NTag,
        {
          type: 'success',
          size: 'small'
        },
        { default: () => option ? option.label : row.proxy_type }
      )
    }
  },
  {
    title: '状态',
    key: 'is_online',
    render: renderStatus
  },
  {
    title: '操作',
    key: 'actions',
    render(row) {
      return h(NDropdown, {
        trigger: 'click',
        options: dropdownOptions(row),
        onSelect: (key: string) => handleSelect(key, row),
        placement: 'bottom'
      }, {
        default: () => h(NButton, {
          text: true,
          style: 'display: flex; align-items: center;'
        }, {
          icon: () => h(NIcon, null, {
            default: () => h(EllipsisHorizontalCircleOutline)
          })
        })
      })
    }
  }
]

const handlePageChange = (page: number) => {
  pagination.value.page = page
  loadData()
}

let searchTimeout: ReturnType<typeof setTimeout> | null = null

const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    pagination.value.page = 1
    loadData()
  }, 300)
}

const handleFilterChange = () => {
  pagination.value.page = 1
  loadData()
}

const handleToggleBan = async (proxy: Proxy | null) => {
  if (!proxy) return
  try {
    if (proxy.is_banned) {
      userApi.post(`/user/admin/proxy/ban/${proxy.ProxyId}`, {
          isBanned: false
        }, accessHandle(), (data) => {
          if (data.code === 0) {
            message.success('解封隧道成功')
          } else {
            message.error(data.message || '解封隧道失败')
          }
        })
    } else {
      userApi.post(`/user/admin/proxy/ban/${proxy.ProxyId}`, {
          isBanned: true
        }, accessHandle(), (data) => {
          if (data.code === 0) {
            message.success('封禁隧道成功')
          } else {
            message.error(data.message || '封禁隧道失败')
            }
      })
    }
    showBanModal.value = false
    setTimeout(() => {
      loadData()
    }, 100)
  } catch (error: any) {
    message.error(error?.response?.data?.message || '操作失败')
  }
}

const handleKickProxy = async (proxy: Proxy | null) => {
  if (!proxy) return
  try {
    await AdminApi.kickProxy(proxy.proxyId)
    message.success('强制下线成功')
    showKickModal.value = false
    loadData()
  } catch (error: any) {
    message.error(error?.response?.data?.message || '强制下线失败')
  }
}

const handleDelete = async (proxy: Proxy | null) => {
  if (!proxy) return
  try {
    userApi.post(`/user/admin/proxy/delete/${proxy.ProxyId}`, {}, accessHandle(), (data) => {
      if (data.code === 0) {
        message.success('删除隧道成功')
      } else {
        message.error(data.message || '删除隧道失败')
      }
    })
    message.success('删除隧道成功')
    showDeleteModal.value = false
    setTimeout(() => {
      loadData()
    }, 100)
  } catch (error: any) {
    message.error(error?.response?.data?.message || '删除隧道失败')
  }
}

const handleEditSubmit = () => {
  // 确保在提交前更新domain字段
  if (['http', 'https'].includes(editForm.value.proxyType)) {
    editForm.value.domain = JSON.stringify(domainTags.value)
  }
  
  editFormRef.value?.validate(async (errors) => {
    if (!errors) {
      submitting.value = true
      try {
        userApi.post("/user/admin/proxy/update", editForm.value, accessHandle(), (data) => {
          if (data.code === 0) {
            message.success('更新隧道成功')
            showEditModal.value = false
            loadData()
          } else {
            message.error(data.message || '更新隧道失败')
          }
        })
      } catch (error: any) {
        message.error(error?.response?.data?.message || '更新隧道失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

// 获取节点列表
const fetchNodes = async () => {
  try {
    userApi.post("/user/admin/node/list",{
    }, accessHandle(), (data) => {
      if (data.code === 0) {
        const nodes = data.data.nodes
        nodeOptions.value = nodes.map((node: UserNode) => ({
          id: node.ID,
          name: node.name,
          value: node.ID,
          label: `#${node.ID} - ${node.name}`,
          hostname: node.hostname
        }))
      } else {
        message.error(data.message || '获取节点列表失败')
      }
    })
  } catch (error: any) {
    message.error(error?.response?.data?.message || '获取节点列表失败')
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const params: FilterProxiesArgs = {
      page: pagination.value.page,
      limit: pagination.value.pageSize
    }

    if (filters.value.search) {
      params.keyword = filters.value.search
    }
    if (filters.value.proxyType) {
      params.proxyType = filters.value.proxyType
    }
    if (filters.value.isOnline !== null) {
      params.isOnline = filters.value.isOnline === 'online'
    }
    if (filters.value.isBanned !== null) {
      params.isBanned = filters.value.isBanned === 'banned'
    }
    if (filters.value.nodeId !== null) {
      params.nodeId = filters.value.nodeId
    }

    userApi.post("/user/admin/proxy/list", params, accessHandle(), (data) => {
      if (data.code === 0) {
        proxies.value = data.data.proxies
        pagination.value.pageCount = Math.ceil(data.data.totalProxies / pagination.value.pageSize)
        pagination.value.itemCount = data.data.total
      } else {
        message.error(data.message || '获取数据失败')
      }
    }, (error) => {
      message.error(error.message || '获取数据失败')
    })
  } catch (error: any) {
    message.error(error?.response?.data?.message || '获取数据失败')
  } finally {
    loading.value = false
  }
}

// 初始化数据
fetchNodes()
loadData()

const renderDomainTag = (tag: string) => {
  return h(
    NTag,
    {
      round: false,
      closable: true,
      style: 'cursor: pointer',
      onDblclick: (e: { target: HTMLElement }) => {
        const tagEl = e.target as HTMLElement
        const input = document.createElement('input')
        input.style.width = '100px'
        input.value = tag
        input.onkeydown = (e) => {
          if (e.key === 'Enter') {
            const newValue = input.value.trim()
            if (newValue && newValue !== tag) {
              const index = domainTags.value.indexOf(tag)
              if (index !== -1) {
                const newTags = [...domainTags.value]
                newTags[index] = newValue
                domainTags.value = newTags
                handleDomainsUpdate(newTags)
              }
            }
            input.remove()
          }
          if (e.key === 'Escape') {
            input.remove()
          }
        }
        input.onblur = () => {
          const newValue = input.value.trim()
          if (newValue && newValue !== tag) {
            const index = domainTags.value.indexOf(tag)
            if (index !== -1) {
              const newTags = [...domainTags.value]
              newTags[index] = newValue
              domainTags.value = newTags
              handleDomainsUpdate(newTags)
            }
          }
          input.remove()
        }
        tagEl.appendChild(input)
        input.focus()
      }
    },
    { default: () => tag }
  )
}

const gettingFreePort = ref(false)

const handleGetFreePortForEdit = async () => {
  try {
    gettingFreePort.value = true
    const protocol = editForm.value.proxyType === 'udp' ? 'udp' : 'tcp'
    userApi.post("/proxy/freePort", {
      nodeId: editForm.value.nodeId,
      protocol
    }, accessHandle(), (data) => {
      if (data.code === 0) {
        editForm.value.remotePort = data.data
      } else {
        message.error(data.message || '获取空闲端口失败')
      }
    })
  } catch (error: any) {
    message.error(error?.response?.data?.message || '获取空闲端口失败')
  } finally {
    gettingFreePort.value = false
  }
}

// 添加新的状态变量
const showKickModal = ref(false)
const showToggleModal = ref(false)
const showBanModal = ref(false)
const showDeleteModal = ref(false)
const currentProxy = ref<Proxy | null>(null)
</script>

<style scoped>
.n-button {
  margin-right: 8px;
}
</style>