<template>
  <div>
    <NCard title="节点管理">
      <NSpace vertical :size="12">
        <NSpace>
          <NInput v-model:value="searchKeyword" placeholder="搜索ID、节点名称或主机名" style="width: 200px" clearable
            @update:value="handleSearch" />
          <NSelect v-model:value="selectedOnline" placeholder="在线状态" :options="onlineOptions" style="width: 120px"
            clearable @update:value="handleFilterChange" />
          <NSelect v-model:value="selectedStatus" placeholder="节点状态" :options="statusOptions" style="width: 120px"
            clearable @update:value="handleFilterChange" />
          <NButton type="primary" @click="showAddModal = true">
            添加节点
          </NButton>
        </NSpace>

        <NDataTable remote :columns="columns" :data="nodes" :loading="loading" :pagination="pagination"
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

      <NModal v-model:show="showAddModal" preset="card" title="添加节点" style="width: 600px;">
        <NForm ref="formRef" :model="formModel" :rules="rules" label-placement="left" label-width="auto"
          require-mark-placement="right-hanging">
          <NFormItem label="节点名称" path="name">
            <NInput v-model:value="formModel.name" placeholder="请输入节点名称" />
          </NFormItem>
          <NFormItem label="主机名" path="hostname">
            <NInput v-model:value="formModel.hostname" placeholder="请输入主机名" />
          </NFormItem>
          <NFormItem label="IP地址" path="hostname">
            <NInput v-model:value="formModel.ip" placeholder="请输入IP地址" />
          </NFormItem>
          <NFormItem label="节点描述" path="description">
            <NInput v-model:value="formModel.description" type="textarea" placeholder="请输入节点描述" />
          </NFormItem>
          <NFormItem label="Token" path="token">
            <NInput v-model:value="formModel.token" placeholder="请输入Token" />
          </NFormItem>
          <NFormItem label="服务端口" path="servicePort">
            <NInputNumber v-model:value="formModel.servicePort" placeholder="请输入服务端口" />
          </NFormItem>
          <NFormItem label="管理端口" path="adminPort">
            <NInputNumber v-model:value="formModel.adminPort" placeholder="请输入管理端口" />
          </NFormItem>
          <NFormItem label="管理密码" path="adminPass">
            <NInput v-model:value="formModel.adminPass" type="password" show-password-on="click"
              placeholder="请输入管理密码" />
          </NFormItem>
          <NFormItem label="是否需要实名" path="need_realname">
            <NSwitch v-model:value="formModel.need_realname" />
          </NFormItem>
          <NFormItem label="允许用户组" path="allowGroup">
            <NButtonGroup>
              <NButton v-for="group in groupOptions" :key="group.value"
                :type="formModel.allowGroup.includes(group.value) ? 'primary' : 'default'"
                :disabled="group.value === 'admin'" @click="toggleGroup(group.value)">
                {{ group.label }}
              </NButton>
            </NButtonGroup>
          </NFormItem>
          <NFormItem label="允许端口" path="allowPort">
            <NInput v-model:value="formModel.allowPort" placeholder="请输入允许的端口范围, 如: 10000-20000" />
          </NFormItem>
          <NFormItem label="允许协议" path="allowType">
            <NButtonGroup>
              <NButton v-for="protocol in protocolOptions" :key="protocol.value"
                :type="formModel.allowType.includes(protocol.value) ? 'primary' : 'default'"
                @click="toggleProtocol(protocol.value)">
                {{ protocol.label }}
              </NButton>
            </NButtonGroup>
          </NFormItem>
        </NForm>
        <template #footer>
          <NSpace justify="end">
            <NButton @click="showAddModal = false">取消</NButton>
            <NButton type="primary" :loading="submitting" @click="handleAddNode">确定</NButton>
          </NSpace>
        </template>
      </NModal>

      <NModal v-model:show="showEditModal" preset="card" title="编辑节点" style="width: 600px;">
        <NForm ref="formRef" :model="formModel" :rules="rules" label-placement="left" label-width="auto"
          require-mark-placement="right-hanging">
          <NFormItem label="节点名称" path="name">
            <NInput v-model:value="formModel.name" placeholder="请输入节点名称" />
          </NFormItem>
          <NFormItem label="主机名" path="hostname">
            <NInput v-model:value="formModel.hostname" placeholder="请输入主机名" />
          </NFormItem>
          <NFormItem label="IP地址" path="hostname">
            <NInput v-model:value="formModel.ip" placeholder="请输入IP地址" />
          </NFormItem>
          <NFormItem label="节点描述" path="description">
            <NInput v-model:value="formModel.description" type="textarea" placeholder="请输入节点描述" />
          </NFormItem>
          <NFormItem label="Token" path="token">
            <NInput v-model:value="formModel.token" placeholder="请输入Token" />
          </NFormItem>
          <NFormItem label="服务端口" path="servicePort">
            <NInputNumber v-model:value="formModel.servicePort" placeholder="请输入服务端口" />
          </NFormItem>
          <NFormItem label="管理端口" path="adminPort">
            <NInputNumber v-model:value="formModel.adminPort" placeholder="请输入管理端口" />
          </NFormItem>
          <NFormItem label="管理密码" path="adminPass">
            <NInput v-model:value="formModel.adminPass" type="password" show-password-on="click"
              placeholder="请输入管理密码" />
          </NFormItem>
          <NFormItem label="是否需要实名" path="need_realname">
            <NSwitch v-model:value="formModel.need_realname" />
          </NFormItem>
          <NFormItem label="允许用户组" path="allowGroup">
            <NButtonGroup>
              <NButton v-for="group in groupOptions" :key="group.value"
                :type="formModel.allowGroup.includes(group.value) ? 'primary' : 'default'"
                :disabled="group.value === 'admin'" @click="toggleGroup(group.value)">
                {{ group.label }}
              </NButton>
            </NButtonGroup>
          </NFormItem>
          <NFormItem label="允许端口" path="allowPort">
            <NInput v-model:value="formModel.allowPort" placeholder="请输入允许的端口范围, 如: 10000-20000" />
          </NFormItem>
          <NFormItem label="允许协议" path="allowType">
            <NButtonGroup>
              <NButton v-for="protocol in protocolOptions" :key="protocol.value"
                :type="formModel.allowType.includes(protocol.value) ? 'primary' : 'default'"
                @click="toggleProtocol(protocol.value)">
                {{ protocol.label }}
              </NButton>
            </NButtonGroup>
          </NFormItem>
        </NForm>
        <template #footer>
          <NSpace justify="end">
            <NButton @click="showEditModal = false">取消</NButton>
            <NButton type="primary" :loading="submitting" @click="handleEditSubmit">确定</NButton>
          </NSpace>
        </template>
      </NModal>

      <NModal v-model:show="showToggleModal" preset="dialog"
        :title="currentNode?.isDisabled ? '启用节点' : '禁用节点'"
        style="width: 400px;"
        :show-icon="false">
        <div>确定要{{ currentNode?.isDisabled ? '启用' : '禁用' }}节点 "{{ currentNode?.name }}" 吗？</div>
        <template #action>
          <NButton secondary size="small" @click="showToggleModal = false">取消</NButton>
          <NButton secondary size="small" type="warning" :loading="submitting" @click="() => currentNode && handleToggleNode(currentNode)">确定</NButton>
        </template>
      </NModal>

      <NModal v-model:show="showDeleteModal" preset="dialog"
        title="删除节点"
        style="width: 400px;"
        :show-icon="false">
        <div>确定要删除节点 "{{ currentNode?.name }}" 吗？此操作不可恢复！</div>
        <template #action>
          <NButton secondary size="small" @click="showDeleteModal = false">取消</NButton>
          <NButton secondary size="small" type="error" :loading="submitting" @click="() => currentNode && handleDeleteNode(currentNode)">删除</NButton>
        </template>
      </NModal>
    </NCard>
  </div>
</template>

<script lang="ts" setup>
import { ref, h } from 'vue'
import { NCard, NSpace, NDataTable, NButton, NModal, NForm, NFormItem, NInput, NInputNumber, useMessage, NButtonGroup, NSelect, NTag, NDropdown, NIcon } from 'naive-ui'
import { EllipsisHorizontalCircleOutline, CreateOutline, PowerOutline, TrashOutline } from '@vicons/ionicons5'
import type { DataTableColumns, FormRules, FormInst, SelectOption, DropdownOption } from 'naive-ui'
import type { Node, UpdateNodeArgs, GetNodesArgs } from '@/types/User'
import {userApi} from "@/net";
import {accessHandle} from "@/net/base.ts";

const message = useMessage()
const loading = ref(false)
const submitting = ref(false)
const nodes = ref<Node[]>([])
const showAddModal = ref(false)
const formRef = ref<FormInst | null>(null)

const searchKeyword = ref('')
const selectedOnline = ref<string | null>(null)
const selectedStatus = ref<string | null>(null)

const groupOptions = ref<{ label: string; value: string }[]>([])

const protocolOptions = [
  { label: 'TCP', value: 'tcp' },
  { label: 'UDP', value: 'udp' },
  { label: 'HTTP', value: 'http' },
  { label: 'HTTPS', value: 'https' }
]

const formModel = ref({
  name: '',
  hostname: '',
  ip: '',
  description: '',
  token: '',
  servicePort: 2333,
  adminPort: 8233,
  adminPass: '',
  allowGroup: [] as string[],
  allowPort: '',
  allowType: [] as string[],
  need_realname: true,
})

const toggleGroup = (value: string) => {
  if (value === 'admin') {
    if (!formModel.value.allowGroup.includes(value)) {
      formModel.value.allowGroup.push(value)
    }
    return
  }

  const index = formModel.value.allowGroup.indexOf(value)
  if (index === -1) {
    formModel.value.allowGroup.push(value)
  } else {
    formModel.value.allowGroup.splice(index, 1)
  }
}

const toggleProtocol = (value: string) => {
  const index = formModel.value.allowType.indexOf(value)
  if (index === -1) {
    formModel.value.allowType.push(value)
  } else {
    formModel.value.allowType.splice(index, 1)
  }
}

const rules: FormRules = {
  name: {
    required: true,
    message: '请输入节点名称',
    trigger: ['blur', 'input']
  },
  hostname: {
    required: true,
    message: '请输入主机名',
    trigger: ['blur', 'input']
  },
  token: {
    required: true,
    message: '请输入Token',
    trigger: ['blur', 'input']
  },
  servicePort: {
    required: true,
    message: '请输入服务端口',
    trigger: ['blur', 'input'],
    validator: (_rule, value) => {
      if (typeof value !== 'number' || value < 1 || value > 65535) {
        return new Error('端口范围必须在 1-65535 之间')
      }
      return true
    }
  },
  adminPort: {
    required: true,
    message: '请输入管理端口',
    trigger: ['blur', 'input'],
    validator: (_rule, value) => {
      if (typeof value !== 'number' || value < 1 || value > 65535) {
        return new Error('端口范围必须在 1-65535 之间')
      }
      return true
    }
  },
  adminPass: {
    required: true,
    message: '请输入管理密码',
    trigger: ['blur', 'input']
  },
  allowGroup: {
    required: true,
    message: '请选择允许的用户组',
    trigger: ['blur', 'input'],
    validator: (_rule, value) => {
      if (!Array.isArray(value) || value.length === 0) {
        return new Error('请至少选择一个用户组')
      }
      return true
    }
  },
  allowPort: {
    required: true,
    message: '请输入允许的端口范围',
    trigger: ['blur', 'input'],
    validator: (_rule, value) => {
      if (!value) return new Error('请输入端口范围')

      // 支持多个端口范围, 用逗号分隔
      const ranges = value.split(';').map(range => range.trim())

      for (const range of ranges) {
        // 检查单个端口
        if (/^\d+$/.test(range)) {
          const port = parseInt(range)
          if (port < 1 || port > 65535) {
            return new Error('端口必须在 1-65535 之间')
          }
          continue
        }

        // 检查端口范围
        const match = range.match(/^(\d+)-(\d+)$/)
        if (!match) {
          return new Error('端口范围格式不正确, 请使用 1-65535 或 80,443 或 1000-2000,3000-4000 的格式')
        }

        const start = parseInt(match[1])
        const end = parseInt(match[2])

        if (start < 1 || start > 65535 || end < 1 || end > 65535) {
          return new Error('端口必须在 1-65535 之间')
        }

        if (start >= end) {
          return new Error('起始端口必须小于结束端口')
        }
      }

      return true
    }
  },
  allowType: {
    required: true,
    message: '请选择允许的协议',
    trigger: ['blur', 'input'],
    validator: (_rule, value) => {
      if (!Array.isArray(value) || value.length === 0) {
        return new Error('请至少选择一个协议')
      }
      return true
    }
  }
}

const pagination = ref({
  page: 1,
  pageSize: 10,
  pageCount: 1,
  itemCount: 0,
  prefix({ itemCount }: { itemCount?: number }) {
    return `共 ${itemCount} 条`
  }
})

const columns: DataTableColumns = [
  {
    title: 'ID',
    key: 'ID',
    render(row) {
      return h('div', { style: 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;' }, row.ID)
    }
  },
  {
    title: '名称',
    key: 'name',
    render(row) {
      return h(NSpace, { align: 'center' }, {
        default: () => [
          h('div', { style: 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;' }, [
            h(NTag, {
              type: row.isOnline ? 'success' : 'error',
              size: 'small'
            }, { default: () => row.isOnline ? '在线' : '离线' }),
            h('span', { style: 'margin-right: 4px' }, row.name)
          ])
        ]
      })
    }
  },
  {
    title: '主机名',
    key: 'hostname',
    render(row) {
      return h('div', { style: 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;' }, row.hostname)
    }
  },
  {
    title: '描述',
    key: 'description',
    render(row) {
      return h('div', { style: 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;' }, row.description)
    }
  },
  {
    title: '服务端口',
    key: 'servicePort',
    render(row) {
      return h('div', { style: 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;' }, row.port)
    }
  },
  {
    title: '管理端口',
    key: 'adminPort',
    render(row) {
      return h('div', { style: 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;' }, row.admin_port)
    }
  },
  {
    title: '实名',
    key: 'need_realname',
    render(row) {
      return h(
        NTag,
        {
          type: row.need_realname ? 'success' : 'error',
          size: 'small'
        },
        { default: () => row.need_realname ? '需要' : '不需要' }
      )
    }
  },
  {
    title: '用户组',
    key: 'allowGroup',
    render(row) {
      const groups = row.allowGroup.split(';')
      return h(
        NSpace,
        { wrap: true, justify: 'start' },
        {
          default: () => groups.map(group => {
            const option = groupOptions.value.find(opt => opt.value === group)
            return h(
              NTag,
              {
                type: 'info',
                size: 'small',
                style: 'margin: 2px'
              },
              { default: () => option ? option.label : group }
            )
          })
        }
      )
    }
  },
  {
    title: '端口',
    key: 'allowPort',
    render(row) {
      return h('div', { style: 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;' }, row.allow_port)
    }
  },
  {
    title: '协议',
    key: 'allowType',
    render(row) {
      const types = row.allowType.split(';')
      return h(
        NSpace,
        { wrap: true, justify: 'start' },
        {
          default: () => types.map(type => {
            const option = protocolOptions.find(opt => opt.value === type)
            return h(
              NTag,
              {
                type: 'success',
                size: 'small',
                style: 'margin: 2px'
              },
              { default: () => option ? option.label : type }
            )
          })
        }
      )
    }
  },
  {
    title: '状态',
    key: 'status',
    render(row) {
      return h(
        NTag,
        {
          type: row.isDisabled ? 'success' : 'error',
          size: 'small'
        },
        { default: () => row.isDisabled ? '已启用' : '已禁用' }
      )
    }
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
  fetchNodes()
}

const showEditModal = ref(false)
const editingNode = ref<Node | null>(null)

const handleEdit = (row: Node) => {
  editingNode.value = row
  formModel.value = {
    name: row.name,
    hostname: row.hostname,
    ip: row.ip,
    description: row.description,
    token: row.token,
    servicePort: row.port,
    adminPort: row.admin_port,
    adminPass: row.admin_pass,
    allowGroup: row.allowGroup.split(';'),
    allowPort: row.allow_port,
    allowType: row.allowType.split(';'),
    need_realname: row.need_realname
  }
  showEditModal.value = true
}

const handleEditSubmit = () => {
  if (!editingNode.value) return

  if (!formModel.value.allowGroup.includes('admin')) {
    formModel.value.allowGroup.push('admin')
  }

  formRef.value?.validate(async (errors) => {
    if (!errors) {
      submitting.value = true
      try {
        const config: UpdateNodeArgs = {
          ID: editingNode.value.ID,
          name: formModel.value.name,
          hostname: formModel.value.hostname,
          ip: formModel.value.ip,
          description: formModel.value.description,
          token: formModel.value.token,
          port: formModel.value.servicePort,
          adminPort: formModel.value.adminPort,
          adminPass: formModel.value.adminPass,
          group: formModel.value.allowGroup.join(';'),
          allowPort: formModel.value.allowPort,
          allowType: formModel.value.allowType.join(';'),
          need_realname: formModel.value.need_realname
        }
        userApi.post(`/user/admin/node/set/${editingNode.value.ID}`, config, accessHandle(), (data) => {
          if (data.code === 0) {
            message.success('更新节点成功')
            showEditModal.value = false
            formRef.value?.restoreValidation()
            editingNode.value = null
            Object.assign(formModel.value, {
              name: '',
              hostname: '',
              ip: '',
              description: '',
              token: '',
              servicePort: 2333,
              adminPort: 8233,
              adminPass: '',
              allowGroup: [],
              allowPort: '',
              allowType: [],
              need_realname: false
            })
            fetchNodes()
          }else{
            message.error(data.message || '更新节点失败')
          }
        })
        fetchNodes()
      } catch (error: any) {
        message.error(error?.response?.data?.message || '更新节点失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

const handleAddNode = () => {
  if (!formModel.value.allowGroup.includes('admin')) {
    formModel.value.allowGroup.push('admin')
  }

  formRef.value?.validate(async (errors) => {
    if (!errors) {
      submitting.value = true
      try {
        const config = {
          ...formModel.value,
          allowGroup: formModel.value.allowGroup.join(';'),
          allowType: formModel.value.allowType.join(';')
        }
        userApi.post(`/user/admin/node/create`, config, accessHandle(), (data) => {
          if (data.code === 0) {
            message.success('添加节点成功')
            showAddModal.value = false
            formRef.value?.restoreValidation()
            Object.assign(formModel.value, {
              name: '',
              hostname: '',
              description: '',
              token: '',
              servicePort: 2333,
              adminPort: 8233,
              adminPass: '',
              allowGroup: [],
              allowPort: '',
              allowType: [],
              need_realname: true
            })
            fetchNodes()
          } else {
            message.error(data.message || '添加节点失败')
          }
        })
      } catch (error: any) {
        message.error(error?.response?.data?.message || '添加节点失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

const handleSearch = () => {
  pagination.value.page = 1
  fetchNodes()
}

const handleFilterChange = () => {
  pagination.value.page = 1
  fetchNodes()
}

const onlineOptions: SelectOption[] = [
  { label: '在线', value: 'online' },
  { label: '离线', value: 'offline' }
]

const statusOptions: SelectOption[] = [
  { label: '已启用', value: 'disabled' },
  { label: '已禁用', value: 'enabled' },
]

const showToggleModal = ref(false)
const showDeleteModal = ref(false)
const currentNode = ref<Node | null>(null)

const handleToggleNode = async (node: Node) => {
  try {
    submitting.value = true
    userApi.post(`/user/admin/node/toggle/${node.ID}`, { isDisabled: !node.isDisabled }, accessHandle(), (data) => {
      if (data.code === 0) {
        node.isDisabled = !node.isDisabled
        message.success(node.isDisabled ? '禁用节点成功' : '启用节点成功')
        showToggleModal.value = false
        loadData()
      }else {
        message.error(data.message || '操作失败')
      }
    })
  } catch (error: any) {
    message.error(error?.response?.data?.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

const handleDeleteNode = async (node: Node) => {
  try {
    submitting.value = true
    userApi.post(`/user/admin/node/delete/${node.ID}`, {}, accessHandle(), (data) => {
      if (data.code === 0) {
        message.success('删除节点成功')
      } else {
        message.error(data.message || '删除节点失败')
      }
    })
    showDeleteModal.value = false
    loadData()
  } catch (error: any) {
    message.error(error?.response?.data?.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

const dropdownOptions = (row: Node): DropdownOption[] => [
  {
    label: '编辑',
    key: 'edit',
    disabled: false,
    type: 'primary',
    icon: () => h(NIcon, null, { default: () => h(CreateOutline) })
  },
  {
    label: row.isDisabled ? '禁用' : '启用',
    key: 'toggle',
    disabled: false,
    type: row.isDisabled ? 'warning' : 'success',
    icon: () => h(NIcon, null, { default: () => h(PowerOutline) })
  },
  {
    label: '删除',
    key: 'delete',
    disabled: false,
    type: 'error',
    icon: () => h(NIcon, null, { default: () => h(TrashOutline) })
  }
]

const handleSelect = (key: string, row: Node) => {
  switch (key) {
    case 'edit':
      handleEdit(row)
      break
    case 'toggle':
      currentNode.value = row
      showToggleModal.value = true
      break
    case 'delete':
      currentNode.value = row
      showDeleteModal.value = true
      break
  }
}

const fetchNodes = async () => {
  loading.value = true
  try {
    const params: GetNodesArgs = {
      page: pagination.value.page,
      limit: pagination.value.pageSize
    }

    if (searchKeyword.value) {
      params.keyword = searchKeyword.value
    }
    if (selectedOnline.value !== null) {
      params.isOnline = selectedOnline.value === 'online'
    }
    if (selectedStatus.value !== null) {
      params.isDisabled = selectedStatus.value === 'disabled'
    }

    userApi.post("/user/admin/node/list", params, accessHandle(), (data) => {
      if (data.code === 0) {
        nodes.value = data.data.nodes.map(node => ({
          ...node,
          allowGroup: node.group || '',
          allowType: node.allow_type || ''
        }))
        pagination.value.itemCount = data.data.total
        pagination.value.pageCount = Math.ceil(data.data.total / pagination.value.pageSize)
      } else {
        message.error(data.message || '获取节点列表失败')
      }
    })
  } catch (error: any) {
    message.error(error?.response?.data?.message || '获取节点列表失败')
    nodes.value = [] // 确保即使失败，nodes也有默认值
  } finally {
    loading.value = false
  }
}

const fetchUserGroups = async () => {
  try {
    userApi.get("/user/info/groups", accessHandle(), (data) => {
      if (data.code === 0) {
        groupOptions.value = data.data.groups.map(group => ({
          label: group.friendlyName,
          value: group.name
        }))
      } else {
        message.error(data.message || '获取用户组列表失败')
      }
    })
  } catch (error: any) {
    message.error(error?.response?.data?.message || '获取用户组列表失败')
  }
}

const loadData = () => {
  fetchNodes()
  fetchUserGroups()
}

// 在组件挂载时获取用户组列表
fetchUserGroups()
fetchNodes()
</script>