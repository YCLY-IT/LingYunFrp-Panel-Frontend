<template>
  <SecureArea>
    <div>
      <n-card title="隧道管理">
        <n-space vertical :size="12">
          <template v-if="!isMobile">
            <n-input
              v-model:value="filters.search"
              placeholder="搜索ID、隧道名、用户名或绑定域名"
              clearable
              style="width: 100%"
              @update:value="handleSearch"
            />
            <n-select
              v-model:value="filters.nodeId"
              :options="nodeOptions"
              placeholder="节点"
              clearable
              style="width: 100%"
              @update:value="handleFilterChange"
            />
            <div class="proxy-sort-filter-row">
              <n-select
                v-model:value="sortOptions.key"
                :options="sortFieldOptions"
                placeholder="排序字段"
                clearable
                class="proxy-sort-item"
                @update:value="handleSortFieldChange"
              />
              <n-select
                v-model:value="sortOptions.order"
                :options="sortOrderOptions"
                placeholder="排序方式"
                clearable
                class="proxy-sort-item"
                @update:value="handleSortOrderChange"
              />
              <n-select
                v-model:value="filters.proxyType"
                :options="proxyTypeOptions"
                placeholder="协议"
                clearable
                class="proxy-sort-item"
                @update:value="handleFilterChange"
              />
              <n-select
                v-model:value="filters.isOnline"
                :options="onlineOptions"
                placeholder="在线状态"
                clearable
                class="proxy-sort-item"
                @update:value="handleFilterChange"
              />
              <n-select
                v-model:value="filters.isBanned"
                :options="banOptions"
                placeholder="封禁状态"
                clearable
                class="proxy-sort-item"
                @update:value="handleFilterChange"
              />
            </div>
          </template>

          <template v-else>
            <n-input
              v-model:value="filters.search"
              placeholder="搜索ID、隧道名、用户名或绑定域名"
              clearable
              style="width: 100%"
              @update:value="handleSearch"
            />
            <n-select
              v-model:value="filters.nodeId"
              :options="nodeOptions"
              placeholder="节点"
              clearable
              style="width: 100%"
              @update:value="handleFilterChange"
            />

            <n-grid :cols="3" :x-gap="8">
              <n-grid-item>
                <n-select
                  v-model:value="filters.proxyType"
                  :options="proxyTypeOptions"
                  placeholder="协议"
                  clearable
                  style="width: 100%"
                  @update:value="handleFilterChange"
                />
              </n-grid-item>
              <n-grid-item>
                <n-select
                  v-model:value="filters.isOnline"
                  :options="onlineOptions"
                  placeholder="在线状态"
                  clearable
                  style="width: 100%"
                  @update:value="handleFilterChange"
                />
              </n-grid-item>
              <n-grid-item>
                <n-select
                  v-model:value="filters.isBanned"
                  :options="banOptions"
                  placeholder="封禁状态"
                  clearable
                  style="width: 100%"
                  @update:value="handleFilterChange"
                />
              </n-grid-item>
            </n-grid>

            <n-grid :cols="2" :x-gap="8">
              <n-grid-item>
                <n-select
                  v-model:value="sortOptions.key"
                  :options="sortFieldOptions"
                  placeholder="排序字段"
                  clearable
                  style="width: 100%"
                  @update:value="handleSortFieldChange"
                />
              </n-grid-item>
              <n-grid-item>
                <n-select
                  v-model:value="sortOptions.order"
                  :options="sortOrderOptions"
                  placeholder="排序方式"
                  clearable
                  style="width: 100%"
                  @update:value="handleSortOrderChange"
                />
              </n-grid-item>
            </n-grid>
          </template>
          <div class="table-container">
            <n-data-table
              remote
              :columns="columns"
              :data="proxies"
              :loading="loading"
              :pagination="false"
              :style="{
                '.ndata-table-td': {
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '200px',
                },
              }"
              :scroll-x="900"
            />
          </div>

          <div style="display: flex; justify-content: right">
            <n-pagination
              v-model:page="pagination.page"
              v-model:page-size="pagination.pageSize"
              :item-count="pagination.itemCount"
              :page-count="pagination.pageCount"
              show-size-picker
              :page-sizes="pagination.pageSizes"
              :prefix="pagination.prefix"
              @update:page="handlePageChange"
              @update:page-size="
                (pageSize: number) => {
                  pagination.pageSize = pageSize
                  pagination.page = 1
                  loadData()
                }
              "
            />
          </div>
        </n-space>
      </n-card>

      <n-modal
        v-model:show="showEditModal"
        preset="dialog"
        title="编辑隧道"
        class="edit-modal"
        :style="modalStyle"
      >
        <n-form
          ref="editFormRef"
          :model="editForm"
          :rules="rules"
          label-placement="left"
          label-width="150"
          require-mark-placement="right-hanging"
          size="medium"
          style="padding-top: 12px"
        >
          <n-collapse
            v-model:expanded-names="editFormCollapse"
            accordion
            style="margin-bottom: 24px"
          >
            <n-collapse-item name="basic" title="基本设置">
              <n-form-item label="隧道名称" path="proxyName">
                <n-input
                  v-model:value="editForm.proxyName"
                  placeholder="请输入隧道名称"
                />
              </n-form-item>
              <n-form-item label="节点" path="nodeId">
                <n-select
                  v-model:value="editForm.nodeId"
                  :options="nodeOptions"
                  placeholder="请选择节点"
                />
              </n-form-item>
              <n-form-item label="本地地址" path="localIp">
                <n-input
                  v-model:value="editForm.localIp"
                  placeholder="请输入本地地址"
                />
              </n-form-item>
              <n-form-item label="本地端口" path="localPort">
                <n-input-number
                  v-model:value="editForm.localPort"
                  :min="1"
                  :max="65535"
                  placeholder="请输入本地端口"
                />
              </n-form-item>
              <n-form-item label="协议类型" path="proxyType">
                <n-select
                  v-model:value="editForm.proxyType"
                  :options="proxyTypeOptions"
                  placeholder="请选择协议类型"
                />
              </n-form-item>
              <n-form-item
                v-if="['stcp', 'xtcp'].includes(editForm.proxyType)"
                label="访问密钥"
                path="accessKey"
              >
                <n-input
                  v-model:value="editForm.accessKey"
                  placeholder="请输入访问密钥"
                />
              </n-form-item>
              <n-form-item
                v-if="
                  editForm.proxyType === 'http' ||
                  editForm.proxyType === 'https'
                "
                label="绑定域名"
                path="domain"
              >
                <n-dynamic-tags
                  v-model:value="domainTags"
                  :render-tag="renderDomainTag"
                />
              </n-form-item>
              <n-form-item
                v-if="['tcp', 'udp'].includes(editForm.proxyType)"
                label="远程端口"
                path="remotePort"
              >
                <div class="remote-port-container">
                  <n-input-number
                    v-model:value="editForm.remotePort"
                    :min="1"
                    :max="65535"
                    placeholder="请输入远程端口"
                  />
                  <n-button
                    size="medium"
                    :loading="gettingFreePort"
                    @click="handleGetFreePortForEdit"
                  >
                    获取空闲端口
                  </n-button>
                </div>
              </n-form-item>
            </n-collapse-item>

            <n-collapse-item name="advanced" title="高级配置">
              <template #header-extra>
                <n-text depth="3" style="font-size: 12px; margin-left: 8px">
                  仅推荐技术用户使用
                </n-text>
              </template>
              <n-form-item label="Proxy Protocol" path="proxyProtocolVersion">
                <n-select
                  v-model:value="editForm.proxyProtocolVersion"
                  :options="[
                    { label: '不启用', value: '' },
                    { label: 'v1', value: 'v1' },
                    { label: 'v2', value: 'v2' },
                  ]"
                  placeholder="Proxy Protocol Version"
                />
              </n-form-item>
              <n-form-item label="每个IP最大下载速率" path="ipLimitIn">
                <div class="speed-input-group">
                  <n-input-number
                    v-model:value="editForm.ipLimitIn"
                    :min="0"
                    placeholder="请输入最大下载速率"
                    style="flex: 1"
                  />
                  <n-select
                    v-model:value="editForm.ipLimitInUnit"
                    :options="speedUnitOptions"
                    style="width: 100px"
                  />
                </div>
              </n-form-item>
              <n-form-item label="每个IP最大上传速率" path="ipLimitOut">
                <div class="speed-input-group">
                  <n-input-number
                    v-model:value="editForm.ipLimitOut"
                    :min="0"
                    placeholder="请输入最大上传速率"
                    style="flex: 1"
                  />
                  <n-select
                    v-model:value="editForm.ipLimitOutUnit"
                    :options="speedUnitOptions"
                    style="width: 100px"
                  />
                </div>
              </n-form-item>
              <n-form-item label="其他选项">
                <div class="switch-container">
                  <n-switch
                    v-model:value="editForm.useEncryption"
                    :rail-style="switchButtonRailStyle"
                  >
                    <template #checked>启用加密</template>
                    <template #unchecked>禁用加密</template>
                  </n-switch>
                  <n-switch
                    v-model:value="editForm.useCompression"
                    :rail-style="switchButtonRailStyle"
                  >
                    <template #checked>启用压缩</template>
                    <template #unchecked>禁用压缩</template>
                  </n-switch>
                </div>
              </n-form-item>
            </n-collapse-item>
          </n-collapse>
        </n-form>
        <template #action>
          <n-button secondary size="small" @click="showEditModal = false"
            >取消</n-button
          >
          <n-button
            secondary
            size="small"
            type="primary"
            :loading="submitting"
            @click="handleEditSubmit"
            >确定</n-button
          >
        </template>
      </n-modal>

      <n-modal
        v-model:show="showKickModal"
        preset="dialog"
        title="确认下线"
        :style="modalStyle"
      >
        <template #default> 确认要强制下线此隧道吗？ </template>
        <template #action>
          <n-button secondary size="small" @click="showKickModal = false"
            >取消</n-button
          >
          <n-button
            secondary
            size="small"
            type="info"
            :loading="loading"
            @click="handleKickProxy(currentProxy)"
            >确定</n-button
          >
        </template>
      </n-modal>

      <n-modal
        v-model:show="showToggleModal"
        preset="dialog"
        :title="currentProxy?.isDisabled ? '确认启用' : '确认禁用'"
        :style="modalStyle"
      >
        <template #default>
          {{
            currentProxy?.isDisabled ? '确认启用此隧道？' : '确认禁用此隧道？'
          }}
        </template>
        <template #action>
          <n-button secondary size="small" @click="showToggleModal = false"
            >取消</n-button
          >
          <n-button
            secondary
            size="small"
            :type="currentProxy?.isDisabled ? 'success' : 'warning'"
            :loading="loading"
            @click="() => currentProxy && handleToggleProxy(currentProxy)"
            >确定</n-button
          >
        </template>
      </n-modal>

      <n-modal
        v-model:show="showBanModal"
        preset="dialog"
        :title="currentProxy?.isBanned ? '确认解封' : '确认封禁'"
        :style="modalStyle"
      >
        <template #default>
          {{ currentProxy?.isBanned ? '确认解封此隧道？' : '确认封禁此隧道？' }}
        </template>
        <template #action>
          <n-button secondary size="small" @click="showBanModal = false"
            >取消</n-button
          >
          <n-button
            secondary
            size="small"
            :type="currentProxy?.isBanned ? 'success' : 'warning'"
            :loading="loading"
            @click="() => currentProxy && handleBanProxy(currentProxy)"
            >确定</n-button
          >
        </template>
      </n-modal>

      <n-modal
        v-model:show="showDeleteModal"
        preset="dialog"
        title="确认删除"
        :style="modalStyle"
      >
        <template #default> 确认要删除此隧道吗？此操作不可恢复！ </template>
        <template #action>
          <n-button secondary size="small" @click="showDeleteModal = false"
            >取消</n-button
          >
          <n-button
            secondary
            size="small"
            type="error"
            :loading="loading"
            @click="handleDelete(currentProxy)"
            >确定</n-button
          >
        </template>
      </n-modal>
    </div>
  </SecureArea>
</template>

<script lang="ts" setup>
import { ref, h, VNode, computed, onMounted } from 'vue'
import { NSpace, NButton, useMessage, NTag, NDropdown, NIcon } from 'naive-ui'
import type {
  DataTableColumns,
  SelectOption,
  FormRules,
  FormInst,
} from 'naive-ui'
import type { Proxy } from '@/types'
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
import { adminApi, userApi } from '@/net'
import SecureArea from '@/components/SecureArea.vue'

const message = useMessage()

const isMobile = computed(() => {
  return window.innerWidth <= 768
})

const loading = ref(false)

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
  { label: 'STCP', value: 'stcp' },
  { label: 'XTCP', value: 'xtcp' },
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
})

const showEditModal = ref(false)
const editFormRef = ref<FormInst | null>(null)
const submitting = ref(false)
const editFormCollapse = ref<string[]>(['basic']) // 默认展开基本设置
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
  useEncryption: false,
  useCompression: false,
  proxyProtocolVersion: '',
  ipLimitIn: 0,
  ipLimitInUnit: 'MB',
  ipLimitOut: 0,
  ipLimitOutUnit: 'MB',
})

const domainTags = ref<string[]>([])

const speedUnitOptions = [
  { label: 'KB', value: 'KB' },
  { label: 'MB', value: 'MB' },
  { label: 'Mbps', value: 'Mbps' },
]

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
    useEncryption: proxy.useEncryption || false,
    useCompression: proxy.useCompression || false,
    proxyProtocolVersion: proxy.proxyProtocolVersion?.trim() || '',
    username: proxy.username || '',
  }

  if (proxy.domain && ['http', 'https'].includes(proxy.proxyType)) {
    try {
      domainTags.value = JSON.parse(proxy.domain)
    } catch (e) {
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
      if (
        ['http', 'https', 'stcp', 'xtcp'].includes(editForm.value.proxyType)
      ) {
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
  accessKey: {
    validator: (_rule, value) => {
      if (['stcp', 'xtcp'].includes(editForm.value.proxyType) && !value) {
        return new Error('使用 STCP/XTCP 协议时，访问密钥为必填项')
      }
      return true
    },
    trigger: ['blur', 'change'],
  },
}

const renderStatus = (row: Proxy) => {
  const tags: VNode[] = []

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
              class: 'ntext',
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
      } else if (['tcp', 'udp'].includes(row.proxyType)) {
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
      } else {
        return h(
          NTag,
          { type: 'info', style: 'max-width: 100%;' },
          { default: () => 'N/A' },
        )
      }
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

const proxies = ref<Proxy[]>([])

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
        accessKey: editForm.value.accessKey,
        useEncryption: editForm.value.useEncryption,
        useCompression: editForm.value.useCompression,
        proxyProtocolVersion: editForm.value.proxyProtocolVersion?.trim() || '',

        domain: editForm.value.domain,

        ipLimitIn: convertSpeedToKB(
          editForm.value.ipLimitIn || 0,
          editForm.value.ipLimitInUnit || 'MB',
        ),
        ipLimitOut: convertSpeedToKB(
          editForm.value.ipLimitOut || 0,
          editForm.value.ipLimitOutUnit || 'MB',
        ),
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
  } catch (error) {}
}

const fetchNodes = async () => {
  try {
    const data = await adminApi.getNodeList(1, 1000)
    if (data.code === 0 && data.data) {
      const nodes = data.data.nodes || []
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
    const data = await adminApi.getProxyList(
      pagination.value.page,
      pagination.value.pageSize,
      filters.value.search || undefined,
      filters.value.nodeId || undefined,
      filters.value.proxyType || undefined,
      filters.value.isOnline || undefined,
      filters.value.isBanned || undefined,
      sortOptions.value.key || undefined,
      sortOptions.value.order || undefined,
    )
    if (data.code === 0 && data.data) {
      proxies.value = (data.data.proxies || []).map((proxy: any) => ({
        proxyId: proxy.proxy_id,
        proxyName: proxy.proxy_name ?? '',
        nodeId: proxy.node,
        localIp: proxy.local_ip,
        localPort: proxy.local_port,
        remotePort: proxy.remote_port,
        domain: proxy.domain ?? '',
        proxyType: proxy.proxy_type ?? '',
        isOnline: proxy.is_online,
        isBanned: proxy.is_banned,
        isDisabled: proxy.is_disabled ?? false,
        username: proxy.username ?? '',
        accessKey: proxy.sk ?? '',
        useEncryption: proxy.use_encryption ?? false,
        useCompression: proxy.use_compression ?? false,
        proxyProtocolVersion: proxy.proxy_protocol_version?.trim() ?? '',
        location: proxy.locations ?? '',
        lastStartTime: proxy.last_start_time || 0,
        lastCloseTime: proxy.last_close_time || 0,
        ...(() => {
          const inKB = proxy.ip_limit_in ?? 0
          const outKB = proxy.ip_limit_out ?? 0

          const getDisplayUnit = (kbValue: number) => {
            if (kbValue >= 1024) return 'MB'
            if (kbValue >= 1) return 'KB'
            return 'Mbps'
          }

          const inUnitResult = getDisplayUnit(inKB)
          const outUnitResult = getDisplayUnit(outKB)

          const inDisplay = convertKBToDisplay(inKB, inUnitResult)
          const outDisplay = convertKBToDisplay(outKB, outUnitResult)

          return {
            ipLimitIn: inDisplay,
            ipLimitInUnit: inUnitResult,
            ipLimitOut: outDisplay,
            ipLimitOutUnit: outUnitResult,
          }
        })(),
      }))
      pagination.value.pageCount = data.data.totalPages
      pagination.value.itemCount = data.data.total
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

const convertSpeedToKB = (value: number, unit: string): number => {
  if (!value || value <= 0) return 0

  switch (unit) {
    case 'KB':
      return value
    case 'MB':
      return value * 1024
    case 'Mbps':
      return value * 125 // 1 Mbps = 125 KB/s
    default:
      return value
  }
}

const convertKBToDisplay = (kbValue: number, unit: string): number => {
  if (!kbValue || kbValue <= 0) return 0

  switch (unit) {
    case 'KB':
      return kbValue
    case 'MB':
      return kbValue / 1024
    case 'Mbps':
      return kbValue / 125
    default:
      return kbValue
  }
}

const gettingFreePort = ref(false)

const handleGetFreePortForEdit = async () => {
  if (
    editForm.value.proxyType !== 'tcp' &&
    editForm.value.proxyType !== 'udp'
  ) {
    message.error('仅支持TCP和UDP协议')
    return
  }
  try {
    gettingFreePort.value = true

    const data = await userApi.getFreePort({
      nodeId: editForm.value.nodeId,
      protocol: editForm.value.proxyType,
    })
    if (data.code === 0) {
      editForm.value.remotePort = data.data || 0
    } else {
      message.error(data.message || '获取空闲端口失败')
    }
  } catch (error: any) {
    message.error(error?.response?.data?.message || '获取空闲端口失败')
  } finally {
    gettingFreePort.value = false
  }
}

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

const handleSortFieldChange = () => {
  pagination.value.page = 1
}
const handleSortOrderChange = () => {
  pagination.value.page = 1
}

onMounted(() => {
  fetchNodes()
  loadData()
})
</script>

<style lang="scss" scoped>
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

.speed-input-group {
  display: flex;
  gap: 8px;
  align-items: center;
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

@media (max-width: 768px) {
  .ncard {
    margin: 0 !important;
    border-radius: 0 !important;
  }

  .edit-modal {
    width: 95vw !important;
    max-width: 95vw !important;
    margin: 0 auto !important;
  }

  .nmodal {
    padding: 8px !important;
  }

  .nform {
    padding-top: 8px !important;
  }

  .nform-item {
    margin-bottom: 12px !important;

    .nform-item-label {
      font-size: 14px !important;
      min-width: 80px !important;
      width: 80px !important;
    }
  }

  .ninput,
  .nselect,
  .ninput-number {
    font-size: 16px !important;
    min-height: 40px !important;
  }

  .nbutton {
    font-size: 14px !important;
    min-height: 36px !important;
    padding: 0 12px !important;
    margin-right: 4px !important;
  }

  .ndata-table {
    overflow-x: auto;
    font-size: 12px !important;

    .ndata-table-table {
      min-width: 800px;
    }

    .ndata-table-th,
    .ndata-table-td {
      padding: 8px 4px !important;
      font-size: 12px !important;
    }
  }

  .filter-space {
    .nselect {
      min-width: 100px !important;
      width: 100px !important;
    }
  }

  .remote-port-container {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;

    .ninput-number {
      width: 100% !important;
    }

    .nbutton {
      width: 100% !important;
      margin-right: 0 !important;
    }
  }

  .switch-container {
    flex-direction: column;
    gap: 12px;

    .nswitch {
      width: 100% !important;
    }
  }

  .speed-input-group {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .nspace {
    gap: 8px !important;
  }

  .npagination {
    .npagination-item {
      min-width: 32px !important;
      height: 32px !important;
      font-size: 12px !important;
    }

    .npagination-size-picker {
      .nselect {
        min-width: 80px !important;
      }
    }
  }

  .ntag {
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

  .nform-item {
    .nform-item-label {
      min-width: 70px !important;
      width: 70px !important;
      font-size: 13px !important;
    }
  }

  .ndata-table {
    .ndata-table-table {
      min-width: 700px;
    }

    .ndata-table-th,
    .ndata-table-td {
      padding: 6px 2px !important;
      font-size: 11px !important;
    }
  }

  .filter-space {
    .nselect {
      min-width: 90px !important;
      width: 90px !important;
    }
  }

  .ntag {
    font-size: 10px !important;
    padding: 1px 4px !important;
    max-width: 100px !important;
  }
}
</style>
