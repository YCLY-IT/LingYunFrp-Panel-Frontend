<template>
  <div>
    <NCard title="隧道管理">
      <NSpace vertical :size="12">
        <NInput
          v-model:value="filters.search"
          placeholder="搜索ID、隧道名、用户名或绑定域名"
          clearable
          style="width: 100%"
          @update:value="handleSearch"
        />
        <NSelect
          v-model:value="filters.nodeId"
          :options="nodeOptions"
          placeholder="节点"
          clearable
          style="width: 100%"
          @update:value="handleFilterChange"
        />
        <div class="proxy-sort-filter-row">
          <NSelect
            v-model:value="sortOptions.key"
            :options="sortFieldOptions"
            placeholder="排序字段"
            clearable
            class="proxy-sort-item"
            @update:value="handleSortFieldChange"
          />
          <NSelect
            v-model:value="sortOptions.order"
            :options="sortOrderOptions"
            placeholder="排序方式"
            clearable
            class="proxy-sort-item"
            @update:value="handleSortOrderChange"
          />
          <NSelect
            v-model:value="filters.proxyType"
            :options="proxyTypeOptions"
            placeholder="协议"
            clearable
            class="proxy-sort-item"
            @update:value="handleFilterChange"
          />
          <NSelect
            v-model:value="filters.isOnline"
            :options="onlineOptions"
            placeholder="在线状态"
            clearable
            class="proxy-sort-item"
            @update:value="handleFilterChange"
          />
          <NSelect
            v-model:value="filters.isBanned"
            :options="banOptions"
            placeholder="封禁状态"
            clearable
            class="proxy-sort-item"
            @update:value="handleFilterChange"
          />
        </div>
        <div class="table-container">
          <NDataTable
            remote
            :columns="columns"
            :data="sortedProxies"
            :loading="loading"
            :pagination="pagination"
            :style="{
              '.n-data-table-td': {
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '200px',
              },
            }"
            @update:page="handlePageChange"
            @update:sorter="handleSortChange"
          />
        </div>
      </NSpace>
    </NCard>

    <!-- 编辑隧道弹窗 -->
    <NModal
      v-model:show="showEditModal"
      preset="dialog"
      title="编辑隧道"
      class="edit-modal"
      :style="modalStyle"
    >
      <NForm
        ref="editFormRef"
        :model="editForm"
        :rules="rules"
        label-placement="left"
        label-width="120"
        require-mark-placement="right-hanging"
        size="medium"
        style="padding-top: 12px"
      >
        <NFormItem label="隧道名称" path="proxyName">
          <NInput
            v-model:value="editForm.proxyName"
            placeholder="请输入隧道名称"
          />
        </NFormItem>
        <NFormItem label="节点" path="nodeId">
          <NSelect
            v-model:value="editForm.nodeId"
            :options="nodeOptions"
            placeholder="请选择节点"
          />
        </NFormItem>
        <NFormItem label="本地地址" path="localIp">
          <NInput
            v-model:value="editForm.localIp"
            placeholder="请输入本地地址"
          />
        </NFormItem>
        <NFormItem label="本地端口" path="localPort">
          <NInputNumber
            v-model:value="editForm.localPort"
            :min="1"
            :max="65535"
            placeholder="请输入本地端口"
          />
        </NFormItem>
        <NFormItem label="协议类型" path="proxyType">
          <NSelect
            v-model:value="editForm.proxyType"
            :options="proxyTypeOptions"
            placeholder="请选择协议类型"
          />
        </NFormItem>
        <NFormItem
          v-if="editForm.proxyType === 'http' || editForm.proxyType === 'https'"
          label="绑定域名"
          path="domain"
        >
          <NDynamicTags
            v-model:value="domainTags"
            :render-tag="renderDomainTag"
          />
        </NFormItem>
        <NFormItem v-else label="远程端口" path="remotePort">
          <div class="remote-port-container">
            <NInputNumber
              v-model:value="editForm.remotePort"
              :min="1"
              :max="65535"
              placeholder="请输入远程端口"
            />
            <NButton
              size="medium"
              :loading="gettingFreePort"
              @click="handleGetFreePortForEdit"
            >
              获取空闲端口
            </NButton>
          </div>
        </NFormItem>

        <NDivider>高级配置</NDivider>

        <NFormItem label="访问密钥" path="accessKey">
          <NInput
            v-model:value="editForm.accessKey"
            placeholder="访问密钥已不再支持"
            :disabled="true"
          />
        </NFormItem>
        <NFormItem label="Host Header Rewrite" path="hostHeaderRewrite">
          <NInput
            v-model:value="editForm.hostHeaderRewrite"
            placeholder="请输入 Host 请求头重写值"
          />
        </NFormItem>
        <NFormItem label="X-From-Where" path="headerXFromWhere">
          <NInput
            v-model:value="editForm.headerXFromWhere"
            placeholder="请输入 X-From-Where 请求头值"
          />
        </NFormItem>
        <NFormItem label="Proxy Protocol" path="proxyProtocolVersion">
          <NSelect
            v-model:value="editForm.proxyProtocolVersion"
            :options="[
              { label: '不启用', value: '' },
              { label: 'v1', value: 'v1' },
              { label: 'v2', value: 'v2' },
            ]"
            placeholder="Proxy Protocol Version"
          />
        </NFormItem>
        <NFormItem label="其他选项">
          <div class="switch-container">
            <NSwitch
              v-model:value="editForm.useEncryption"
              :rail-style="switchButtonRailStyle"
            >
              <template #checked>启用加密</template>
              <template #unchecked>禁用加密</template>
            </NSwitch>
            <NSwitch
              v-model:value="editForm.useCompression"
              :rail-style="switchButtonRailStyle"
            >
              <template #checked>启用压缩</template>
              <template #unchecked>禁用压缩</template>
            </NSwitch>
          </div>
        </NFormItem>
      </NForm>
      <template #action>
        <NButton secondary size="small" @click="showEditModal = false"
          >取消</NButton
        >
        <NButton
          secondary
          size="small"
          type="primary"
          :loading="submitting"
          @click="handleEditSubmit"
          >确定</NButton
        >
      </template>
    </NModal>

    <!-- 下线确认模态框 -->
    <NModal
      v-model:show="showKickModal"
      preset="dialog"
      title="确认下线"
      :style="modalStyle"
    >
      <template #default> 确认要强制下线此隧道吗？ </template>
      <template #action>
        <NButton secondary size="small" @click="showKickModal = false"
          >取消</NButton
        >
        <NButton
          secondary
          size="small"
          type="info"
          :loading="loading"
          @click="handleKickProxy(currentProxy)"
          >确定</NButton
        >
      </template>
    </NModal>

    <!-- 启用/禁用确认模态框 -->
    <NModal
      v-model:show="showToggleModal"
      preset="dialog"
      :title="currentProxy?.isDisabled ? '确认启用' : '确认禁用'"
      :style="modalStyle"
    >
      <template #default>
        {{ currentProxy?.isDisabled ? '确认启用此隧道？' : '确认禁用此隧道？' }}
      </template>
      <template #action>
        <NButton secondary size="small" @click="showToggleModal = false"
          >取消</NButton
        >
        <NButton
          secondary
          size="small"
          :type="currentProxy?.isDisabled ? 'success' : 'warning'"
          :loading="loading"
          @click="() => currentProxy && handleToggleProxy(currentProxy)"
          >确定</NButton
        >
      </template>
    </NModal>

    <!-- 封禁/解封确认模态框 -->
    <NModal
      v-model:show="showBanModal"
      preset="dialog"
      :title="currentProxy?.isBanned ? '确认解封' : '确认封禁'"
      :style="modalStyle"
    >
      <template #default>
        {{ currentProxy?.isBanned ? '确认解封此隧道？' : '确认封禁此隧道？' }}
      </template>
      <template #action>
        <NButton secondary size="small" @click="showBanModal = false"
          >取消</NButton
        >
        <NButton
          secondary
          size="small"
          :type="currentProxy?.isBanned ? 'success' : 'warning'"
          :loading="loading"
          @click="() => currentProxy && handleBanProxy(currentProxy)"
          >确定</NButton
        >
      </template>
    </NModal>

    <!-- 删除确认模态框 -->
    <NModal
      v-model:show="showDeleteModal"
      preset="dialog"
      title="确认删除"
      :style="modalStyle"
    >
      <template #default> 确认要删除此隧道吗？此操作不可恢复！ </template>
      <template #action>
        <NButton secondary size="small" @click="showDeleteModal = false"
          >取消</NButton
        >
        <NButton
          secondary
          size="small"
          type="error"
          :loading="loading"
          @click="handleDelete(currentProxy)"
          >确定</NButton
        >
      </template>
    </NModal>
  </div>
</template>

<script lang="ts" setup>
import { ref, h, VNode, computed, onMounted } from 'vue'
import {
  NCard,
  NSpace,
  NDataTable,
  NButton,
  NInput,
  NSelect,
  useMessage,
  NTag,
  NModal,
  NForm,
  NFormItem,
  NInputNumber,
  NDynamicTags,
  NDivider,
  NSwitch,
  NDropdown,
  NIcon,
} from 'naive-ui'
import type {
  DataTableColumns,
  SelectOption,
  FormRules,
  FormInst,
} from 'naive-ui'
import type { Proxy, FilterProxiesArgs } from '@/types'
import { switchButtonRailStyle } from '@/constants/theme.ts'
import {
  BanOutline,
  TrashOutline,
  EllipsisHorizontalCircleOutline,
  CreateOutline,
  PowerOutline,
  LogOutOutline,
} from '@vicons/ionicons5'
import { DropdownMixedOption } from 'naive-ui/es/dropdown/src/interface'
import { adminApi } from '@/net'

const message = useMessage()
const loading = ref(false)
const proxies = ref<Proxy[]>([])

const filters = ref<{
  search: string
  proxyType: string | null
  isOnline: string | null
  isBanned: string | null
  nodeId: number | null
}>({
  search: '',
  proxyType: null,
  isOnline: null,
  isBanned: null,
  nodeId: null,
})

const proxyTypeOptions: SelectOption[] = [
  { label: 'TCP', value: 'tcp' },
  { label: 'UDP', value: 'udp' },
  { label: 'HTTP', value: 'http' },
  { label: 'HTTPS', value: 'https' },
]

const onlineOptions: SelectOption[] = [
  { label: '在线', value: 'online' },
  { label: '离线', value: 'offline' },
]

const banOptions: SelectOption[] = [
  { label: '正常', value: 'normal' },
  { label: '已封禁', value: 'banned' },
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
      value: 10,
    },
    {
      label: '20 条 / 页',
      value: 20,
    },
    {
      label: '30 条 / 页',
      value: 30,
    },
    {
      label: '40 条 / 页',
      value: 40,
    },
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
  },
})

const showEditModal = ref(false)
const editFormRef = ref<FormInst | null>(null)
const submitting = ref(false)

interface NodeOption extends SelectOption {
  id: number
  name: string
  hostname: string
  ip: string
}

const nodeOptions = ref<NodeOption[]>([])

const editForm = ref<Proxy>({
  proxyId: 0,
  proxyName: '',
  nodeId: 0,
  localIp: '',
  localPort: 0,
  remotePort: 0,
  domain: '',
  proxyType: '',
  isOnline: false,
  isBanned: false,
  isDisabled: false,
  location: '',
  accessKey: '',
  lastStartTime: 0,
  lastCloseTime: 0,
  hostHeaderRewrite: '',
  headerXFromWhere: '',
  useEncryption: false,
  useCompression: false,
  proxyProtocolVersion: '',
})

const domainTags = ref<string[]>([])

const handleDomainsUpdate = (tags: string[]) => {
  domainTags.value = tags
  editForm.value.domain = JSON.stringify(tags)
}

const handleEdit = (proxy: Proxy) => {
  editForm.value = {
    ...proxy,
    domain: proxy.domain || '',
    location: proxy.location || '',
    accessKey: proxy.accessKey || '',
    hostHeaderRewrite: proxy.hostHeaderRewrite || '',
    headerXFromWhere: proxy.headerXFromWhere
      ? String(proxy.headerXFromWhere)
      : '',
    useEncryption: proxy.useEncryption || false,
    useCompression: proxy.useCompression || false,
    proxyProtocolVersion: proxy.proxyProtocolVersion || '',
    username: proxy.username || '',
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
        .map((domain) => domain.trim())
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
    trigger: ['blur', 'input'],
  },
  localIp: {
    required: true,
    message: '请输入本地地址',
    trigger: ['blur', 'input'],
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
    },
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
    },
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
    },
  },
  proxyType: {
    required: true,
    message: '请选择协议类型',
    trigger: ['blur', 'change'],
  },
  nodeId: {
    type: 'number',
    required: true,
    message: '请选择节点',
    trigger: ['blur', 'change'],
  },
}

const renderStatus = (row: Proxy) => {
  const tags: VNode[] = []

  // 在线状态标签
  tags.push(
    h(
      NTag,
      {
        type: row.isOnline ? 'success' : 'warning',
        size: 'small',
        style: 'margin-right: 4px',
      },
      { default: () => (row.isOnline ? '在线' : '离线') },
    ),
  )

  // 封禁状态标签
  if (row.isBanned) {
    tags.push(
      h(
        NTag,
        {
          type: 'error',
          size: 'small',
          style: 'margin-right: 4px',
        },
        { default: () => '已封禁' },
      ),
    )
  }

  // 禁用状态标签
  if (row.isDisabled) {
    tags.push(
      h(
        NTag,
        {
          type: 'warning',
          size: 'small',
        },
        { default: () => '已禁用' },
      ),
    )
  }

  return h(NSpace, { size: 4 }, { default: () => tags })
}

const handleToggleProxy = async (proxy: Proxy) => {
  if (!proxy) return
  try {
    const data = await adminApi.toggleProxy(proxy.proxyId, proxy.isDisabled)
    if (data.code === 0) {
      proxy.isDisabled = !proxy.isDisabled
      message.success(proxy.isDisabled ? '禁用隧道成功' : '启用隧道成功')
      showToggleModal.value = false
    } else {
      message.error(data.message || '操作失败')
    }
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
    icon: () => h(NIcon, null, { default: () => h(CreateOutline) }),
  },
  {
    label: row.isDisabled ? '启用' : '禁用',
    key: 'toggle',
    disabled: false,
    type: row.isDisabled ? 'success' : 'warning',
    icon: () => h(NIcon, null, { default: () => h(PowerOutline) }),
  },
  {
    label: '下线',
    key: 'kick',
    disabled: !row.isOnline,
    type: 'info',
    icon: () => h(NIcon, null, { default: () => h(LogOutOutline) }),
  },
  {
    label: row.isBanned ? '解封' : '封禁',
    key: 'ban',
    disabled: false,
    type: row.isBanned ? 'success' : 'warning',
    icon: () => h(NIcon, null, { default: () => h(BanOutline) }),
  },
  {
    label: '删除',
    key: 'delete',
    disabled: false,
    type: 'error',
    icon: () => h(NIcon, null, { default: () => h(TrashOutline) }),
  },
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
    key: 'proxy_id',
    render(row) {
      return h(
        'div',
        {
          style:
            'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;',
        },
        row.proxyId,
      )
    },
  },
  {
    title: '所属用户',
    key: 'username',
    render(row) {
      return h(
        'div',
        {
          style:
            'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;',
        },
        row.username,
      )
    },
  },
  {
    title: '隧道名',
    key: 'proxyName',
    render(row) {
      return h(
        'div',
        {
          style:
            'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;',
        },
        row.proxyName,
      )
    },
  },
  {
    title: '节点',
    key: 'nodeId',
    render(row: Proxy) {
      const node = nodeOptions.value.find((opt) => opt.id === row.nodeId)
      return h(
        'div',
        {
          style:
            'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;',
        },
        {
          default: () => [
            h(
              NTag,
              { type: 'info', style: 'margin-right: 4px' },
              { default: () => `#${row.nodeId}` },
            ),
            node?.name || '未知节点',
          ],
        },
      )
    },
  },
  {
    title: '本地地址',
    key: 'localIp',
    render(row) {
      return h(
        'div',
        {
          style:
            'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;',
        },
        [
          h('span', null, row.localIp),
          h('span', null, ':'),
          h(
            'span',
            {
              class: 'n-text',
              style: 'color: var(--n-primary-color); font-weight: bold;',
            },
            row.localPort,
          ),
        ],
      )
    },
  },
  {
    title: '远程端口/域名',
    key: ' remotePort',
    render(row) {
      if (['http', 'https'].includes(row.proxyType)) {
        const domains = (row.domain || '-')
          .replace(/[\[\]"]/g, '')
          .split(',')
          .map((domain) => domain.trim())
          .filter(Boolean)
        return h(
          NSpace,
          { vertical: true, size: 4 },
          {
            default: () =>
              domains.map((domain) =>
                h(
                  NTag,
                  {
                    type: 'info',
                    style:
                      'max-width: 100%; word-break: break-all; cursor: pointer',
                    onClick: () => {
                      window.open(`${row.proxyType}://${domain}`, '_blank')
                    },
                  },
                  { default: () => domain },
                ),
              ),
          },
        )
      }
      const node = nodeOptions.value.find((opt) => opt.id === row.nodeId)
      return h(
        NTag,
        {
          type: 'info',
          style: 'max-width: 100%; cursor: pointer',
          onClick: () => {
            const text = `${node?.hostname}:${row.remotePort}`
            navigator.clipboard.writeText(text)
            message.success('已复制到剪贴板：' + text)
          },
        },
        { default: () => `${node?.hostname}:${row.remotePort}` },
      )
    },
  },
  {
    title: '协议',
    key: 'proxyType',
    render(row) {
      const option = proxyTypeOptions.find((opt) => opt.value === row.proxyType)
      return h(
        NTag,
        {
          type: 'success',
          size: 'small',
        },
        { default: () => (option ? option.label : row.proxyType) },
      )
    },
  },
  {
    title: '状态',
    key: 'is_online',
    render: renderStatus,
  },
  {
    title: '操作',
    key: 'actions',
    render(row) {
      return h(
        NDropdown,
        {
          trigger: 'click',
          options: dropdownOptions(row),
          onSelect: (key: string) => handleSelect(key, row),
          placement: 'bottom',
        },
        {
          default: () =>
            h(
              NButton,
              {
                text: true,
                style: 'display: flex; align-items: center;',
              },
              {
                icon: () =>
                  h(NIcon, null, {
                    default: () => h(EllipsisHorizontalCircleOutline),
                  }),
              },
            ),
        },
      )
    },
  },
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

const handleBanProxy = async (proxy: Proxy) => {
  if (!proxy) return
  try {
    if (proxy.isBanned) {
      const data = await adminApi.banProxy(proxy.proxyId, !proxy.isBanned)
      if (data.code === 0) {
        message.success('解封隧道成功')
        showBanModal.value = false
        setTimeout(() => {
          loadData()
        }, 50)
      } else {
        message.error(data.message || '解封失败')
      }
    } else {
      const data = await adminApi.banProxy(proxy.proxyId, !proxy.isBanned)
      if (data.code === 0) {
        message.success('封禁隧道成功')
        showBanModal.value = false
        loadData()
      } else {
        message.error(data.message || '封禁失败')
      }
    }
  } catch (error: any) {
    message.error(error.message || '操作失败')
  }
}

const handleKickProxy = async (proxy: Proxy | null) => {
  if (proxy) {
    handleToggleProxy(proxy)
  }
}

const handleDelete = async (proxy: Proxy | null) => {
  if (!proxy) return
  try {
    const data = await adminApi.deleteProxy(proxy.proxyId)
    if (data.code === 0) {
      message.success('删除隧道成功')
      loadData()
    } else {
      message.error(data.message || '删除失败')
    }
  } catch (error: any) {
    message.error(error?.response?.data?.message || '删除失败')
  }
}

const handleEditSubmit = async () => {
  // 确保在提交前更新domain字段
  if (['http', 'https'].includes(editForm.value.proxyType)) {
    editForm.value.domain = JSON.stringify(domainTags.value)
  }

  if (!editFormRef.value) return

  try {
    await editFormRef.value.validate()
    submitting.value = true
    try {
      const data = await adminApi.updateProxy({
        id: editForm.value.proxyId,
        name: editForm.value.proxyName,
        type: editForm.value.proxyType,
        localIp: editForm.value.localIp,
        localPort: editForm.value.localPort,
        remotePort: editForm.value.remotePort,
        nodeId: editForm.value.nodeId,
        // 高级配置字段补全
        hostHeaderRewrite: editForm.value.hostHeaderRewrite,
        headerXFromWhere: editForm.value.headerXFromWhere,
        useEncryption: editForm.value.useEncryption,
        useCompression: editForm.value.useCompression,
        proxyProtocolVersion: editForm.value.proxyProtocolVersion,
        // 还有 domain 字段
        domain: editForm.value.domain,
      })
      if (data.code === 0) {
        message.success('更新隧道成功')
        showEditModal.value = false
        loadData()
      } else {
        message.error(data.message || '更新失败')
      }
    } catch (error: any) {
      message.error(error.message || '更新失败')
    } finally {
      submitting.value = false
    }
  } catch (error) {
    // 表单验证失败
  }
}

// 获取节点列表
const fetchNodes = async () => {
  try {
    const data = await adminApi.getNodeList({
      page: 1,
      limit: 1000,
    })
    if (data.code === 0) {
      const nodes = data.data.nodes
      nodeOptions.value = nodes.map((node: any) => ({
        id: node.id,
        name: node.name,
        value: node.id,
        label: `#${node.id} - ${node.name}`,
        hostname: node.hostname,
        ip: node.ip || '',
      }))
    } else {
      message.error(data.message || '获取节点列表失败')
    }
  } catch (error: any) {
    message.error(error?.response?.data?.message || '获取节点列表失败')
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const params: FilterProxiesArgs = {
      page: pagination.value.page,
      limit: pagination.value.pageSize,
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

    const data = await adminApi.getProxyList(params)
    if (data.code === 0) {
      proxies.value = data.data.proxies.map((proxy: any) => ({
        proxyId: proxy.proxyId ?? proxy.id,
        proxyName: proxy.proxyName ?? proxy.name ?? '',
        nodeId: proxy.nodeId,
        localIp: proxy.localIp,
        localPort: proxy.localPort,
        remotePort: proxy.remotePort,
        domain: proxy.domain ?? '',
        proxyType: proxy.proxyType ?? proxy.type ?? '',
        isOnline: proxy.isOnline,
        isBanned: proxy.isBanned,
        isDisabled: proxy.isDisabled ?? false,
        username: proxy.username ?? '',
        accessKey: proxy.accessKey ?? '',
        lastStartTime: proxy.lastStartTime ?? 0,
        lastCloseTime: proxy.lastCloseTime ?? 0,
        hostHeaderRewrite: proxy.hostHeaderRewrite ?? '',
        headerXFromWhere: String(
          proxy.headerXFromWhere ?? proxy['header_X-From-Where'] ?? '',
        ),
        useEncryption: proxy.useEncryption ?? false,
        useCompression: proxy.useCompression ?? false,
        proxyProtocolVersion: proxy.proxyProtocolVersion ?? '',
        location: proxy.location ?? '',
      }))
      pagination.value.pageCount = Math.ceil(
        data.data.pagination?.total / pagination.value.pageSize,
      )
      pagination.value.itemCount = data.data.pagination?.total
    } else {
      message.error(data.message || '获取数据失败')
    }
  } catch (error: any) {
    message.error(error?.response?.data?.message || '获取数据失败')
  } finally {
    loading.value = false
  }
}

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
      },
    },
    { default: () => tag },
  )
}

const gettingFreePort = ref(false)

const handleGetFreePortForEdit = async () => {
  try {
    gettingFreePort.value = true
    // 注意：这个API可能不在adminApi中，需要添加或使用其他方式
    const data = await adminApi.getProxyList({
      page: 1,
      limit: 1,
      nodeId: editForm.value.nodeId,
    })
    if (data.code === 0) {
      // 这里需要根据实际API调整
      editForm.value.remotePort = 8080 // 临时默认值
    } else {
      message.error(data.message || '获取空闲端口失败')
    }
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

const modalStyle = computed(() => {
  const isMobile = window.innerWidth <= 768
  return {
    width: isMobile ? '95vw' : '600px',
    maxWidth: '95vw',
  }
})

// 排序相关
const sortFieldOptions: SelectOption[] = [
  { label: 'ID', value: 'proxyId' },
  { label: '所属用户', value: 'username' },
  { label: '隧道名称', value: 'proxyName' },
  { label: '节点', value: 'nodeId' },
  { label: '协议', value: 'proxyType' },
  { label: '状态', value: 'status' },
]
const sortOrderOptions: SelectOption[] = [
  { label: '升序', value: 'asc' },
  { label: '降序', value: 'desc' },
]
const sortOptions = ref({ key: 'proxyId', order: 'asc' })

// 本地排序和分页
const sortedProxies = computed(() => {
  let sorted = [...proxies.value]
  if (sortOptions.value.key && sortOptions.value.order) {
    sorted = sorted.sort((a, b) => {
      let aValue: any, bValue: any
      switch (sortOptions.value.key) {
        case 'proxyId':
          aValue = a.proxyId
          bValue = b.proxyId
          break
        case 'username':
          aValue = a.username
          bValue = b.username
          break
        case 'proxyName':
          aValue = a.proxyName
          bValue = b.proxyName
          break
        case 'nodeId':
          aValue = a.nodeId
          bValue = b.nodeId
          break
        case 'proxyType':
          aValue = a.proxyType
          bValue = b.proxyType
          break
        case 'status':
          // 状态：在线>封禁>禁用>正常
          const getStatus = (row: any) =>
            row.isOnline ? 3 : row.isBanned ? 2 : row.isDisabled ? 1 : 0
          aValue = getStatus(a)
          bValue = getStatus(b)
          break
        default:
          return 0
      }
      // 主字段相同用ID次级排序
      if (aValue === bValue) {
        return sortOptions.value.order === 'asc'
          ? a.proxyId - b.proxyId
          : b.proxyId - a.proxyId
      }
      if (sortOptions.value.order === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
      }
    })
  }
  // 本地分页
  const start = (pagination.value.page - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return sorted.slice(start, end)
})

const handleSortFieldChange = () => {
  pagination.value.page = 1
}
const handleSortOrderChange = () => {
  pagination.value.page = 1
}
const handleSortChange = (sorter: any) => {
  if (sorter) {
    sortOptions.value.key = sorter.columnKey
    sortOptions.value.order = sorter.order === 'ascend' ? 'asc' : 'desc'
    pagination.value.page = 1
  }
}

onMounted(() => {
  fetchNodes()
  loadData()
})
</script>

<style lang="scss" scoped>
.n-button {
  margin-right: 8px;
}

.remote-port-container {
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;
}

.switch-container {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-space {
  flex-wrap: wrap;
}

.proxy-sort-filter-row {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
  width: 100%;
}

.proxy-sort-item {
  flex: 1 1 0;
  min-width: 0;
}

.table-container {
  overflow-x: auto;
  :deep(.n-data-table) {
    min-width: 800px;
  }
}

// 移动端适配
@media (max-width: 768px) {
  .n-card {
    margin: 0 !important;
    border-radius: 0 !important;
  }

  .edit-modal {
    width: 95vw !important;
    max-width: 95vw !important;
    margin: 0 auto !important;
  }

  .n-modal {
    padding: 8px !important;
  }

  .n-form {
    padding-top: 8px !important;
  }

  .n-form-item {
    margin-bottom: 12px !important;

    .n-form-item-label {
      font-size: 14px !important;
      min-width: 80px !important;
      width: 80px !important;
    }
  }

  .n-input,
  .n-select,
  .n-input-number {
    font-size: 16px !important;
    min-height: 40px !important;
  }

  .n-button {
    font-size: 14px !important;
    min-height: 36px !important;
    padding: 0 12px !important;
    margin-right: 4px !important;
  }

  .n-data-table {
    overflow-x: auto;
    font-size: 12px !important;

    .n-data-table-table {
      min-width: 800px;
    }

    .n-data-table-th,
    .n-data-table-td {
      padding: 8px 4px !important;
      font-size: 12px !important;
    }
  }

  .filter-space {
    .n-select {
      min-width: 100px !important;
      width: 100px !important;
    }
  }

  .remote-port-container {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;

    .n-input-number {
      width: 100% !important;
    }

    .n-button {
      width: 100% !important;
      margin-right: 0 !important;
    }
  }

  .switch-container {
    flex-direction: column;
    gap: 12px;

    .n-switch {
      width: 100% !important;
    }
  }

  .n-space {
    gap: 8px !important;
  }

  .n-pagination {
    .n-pagination-item {
      min-width: 32px !important;
      height: 32px !important;
      font-size: 12px !important;
    }

    .n-pagination-size-picker {
      .n-select {
        min-width: 80px !important;
      }
    }
  }

  .n-tag {
    font-size: 11px !important;
    padding: 2px 6px !important;
    max-width: 120px !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }
}

@media (max-width: 480px) {
  .edit-modal {
    width: 98vw !important;
    max-width: 98vw !important;
  }

  .n-form-item {
    .n-form-item-label {
      min-width: 70px !important;
      width: 70px !important;
      font-size: 13px !important;
    }
  }

  .n-data-table {
    .n-data-table-table {
      min-width: 700px;
    }

    .n-data-table-th,
    .n-data-table-td {
      padding: 6px 2px !important;
      font-size: 11px !important;
    }
  }

  .filter-space {
    .n-select {
      min-width: 90px !important;
      width: 90px !important;
    }
  }

  .n-tag {
    font-size: 10px !important;
    padding: 1px 4px !important;
    max-width: 100px !important;
  }
}
</style>
