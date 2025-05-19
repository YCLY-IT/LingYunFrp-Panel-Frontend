<template>
  <div class="node-management">
    <n-card title="节点管理" class="main-card">
      <n-space vertical :size="16">
        <n-space align="center" class="filter-container">
          <n-input 
            v-model:value="searchKeyword" 
            placeholder="搜索ID、节点名称或主机名" 
            style="width: 240px" 
            clearable
            @update:value="handleSearch"
          >
            <template #prefix>
              <n-icon><search-outline /></n-icon>
            </template>
          </n-input>
          
          <n-select 
            v-model:value="selectedOnline" 
            placeholder="在线状态" 
            :options="onlineOptions" 
            style="width: 140px" 
            clearable 
            @update:value="handleFilterChange"
          />
          
          <n-select 
            v-model:value="selectedStatus" 
            placeholder="节点状态" 
            :options="statusOptions" 
            style="width: 140px" 
            clearable 
            @update:value="handleFilterChange"
          />
          
          <n-button type="primary" @click="showAddModal = true" class="add-button">
            <template #icon>
              <n-icon><add-outline /></n-icon>
            </template>
            添加节点
          </n-button>
        </n-space>

        <n-data-table
          remote
          :columns="columns"
          :data="nodes"
          :loading="loading"
          :pagination="pagination"
          :row-class-name="rowClassName"
          :scroll-x="1200"
          @update:page="handlePageChange"
        />
      </n-space>

      <!-- 添加节点模态框 -->
      <n-modal 
        v-model:show="showAddModal" 
        preset="card" 
        title="添加节点" 
        class="node-modal"
        :style="{ width: '650px' }"
      >
        <n-form 
          ref="formRef" 
          :model="formModel" 
          :rules="rules" 
          label-placement="left" 
          label-width="auto"
          require-mark-placement="right-hanging"
        >
          <n-grid :cols="1" :x-gap="16">
            <n-form-item-gi label="节点名称" path="name">
              <n-input v-model:value="formModel.name" placeholder="请输入节点名称" />
            </n-form-item-gi>
            
            <n-grid-item :span="1">
              <n-grid :cols="2" :x-gap="16">
                <n-form-item-gi label="主机名" path="hostname">
                  <n-input v-model:value="formModel.hostname" placeholder="请输入主机名" />
                </n-form-item-gi>
                <n-form-item-gi label="IP地址" path="ip">
                  <n-input v-model:value="formModel.ip" placeholder="请输入IP地址" />
                </n-form-item-gi>
              </n-grid>
            </n-grid-item>
            
            <n-form-item-gi label="节点描述" path="description">
              <n-input v-model:value="formModel.description" type="textarea" placeholder="请输入节点描述" />
            </n-form-item-gi>
            
            <n-form-item-gi label="Token" path="token">
              <n-input v-model:value="formModel.token" placeholder="请输入Token" />
            </n-form-item-gi>
            
            <n-grid-item :span="1">
              <n-grid :cols="2" :x-gap="16">
                <n-form-item-gi label="服务端口" path="servicePort">
                  <n-input-number v-model:value="formModel.servicePort" placeholder="请输入服务端口" />
                </n-form-item-gi>
                <n-form-item-gi label="管理端口" path="adminPort">
                  <n-input-number v-model:value="formModel.adminPort" placeholder="请输入管理端口" />
                </n-form-item-gi>
              </n-grid>
            </n-grid-item>
            
            <n-grid-item :span="1">
              <n-grid :cols="2" :x-gap="16">
                <n-form-item-gi label="管理密码" path="adminPass">
                  <n-input 
                    v-model:value="formModel.adminPass" 
                    type="password" 
                    show-password-on="click"
                    placeholder="请输入管理密码" 
                  />
                </n-form-item-gi>
                <n-form-item-gi label="带宽(Mbps)" path="bandWidth">
                  <n-input-number v-model:value="formModel.bandWidth" placeholder="请输入带宽" />
                </n-form-item-gi>
              </n-grid>
            </n-grid-item>
            
            <n-form-item-gi label="是否需要实名" path="need_realname">
              <n-switch v-model:value="formModel.need_realname" />
            </n-form-item-gi>
            
            <n-form-item-gi label="允许用户组" path="allowGroup">
              <div class="group-buttons">
                <n-tag
                  v-for="group in groupOptions"
                  :key="group.value"
                  :type="formModel.allowGroup.includes(group.value) ? 'primary' : 'default'"
                  :disabled="group.value === 'admin'"
                  class="group-tag"
                  :bordered="false"
                  @click="toggleGroup(group.value)"
                >
                  {{ group.label }}
                </n-tag>
              </div>
            </n-form-item-gi>
            
            <n-form-item-gi label="允许端口" path="allowPort">
              <n-input v-model:value="formModel.allowPort" placeholder="请输入允许的端口范围, 如: 10000-20000" />
            </n-form-item-gi>
            
            <n-form-item-gi label="允许协议" path="allowType">
              <div class="protocol-buttons">
                <n-tag
                  v-for="protocol in protocolOptions"
                  :key="protocol.value"
                  :type="formModel.allowType.includes(protocol.value) ? 'primary' : 'default'"
                  class="protocol-tag"
                  :bordered="false"
                  @click="toggleProtocol(protocol.value)"
                >
                  {{ protocol.label }}
                </n-tag>
              </div>
            </n-form-item-gi>
          </n-grid>
        </n-form>
        <template #footer>
          <n-space justify="end">
            <n-button @click="showAddModal = false">取消</n-button>
            <n-button type="primary" :loading="submitting" @click="handleAddNode">确定</n-button>
          </n-space>
        </template>
      </n-modal>

      <!-- 编辑节点模态框 -->
      <n-modal 
        v-model:show="showEditModal" 
        preset="card" 
        title="编辑节点" 
        class="node-modal"
        :style="{ width: '650px' }"
      >
        <n-form 
          ref="formRef" 
          :model="formModel" 
          :rules="rules" 
          label-placement="left" 
          label-width="auto"
          require-mark-placement="right-hanging"
        >
          <n-grid :cols="1" :x-gap="16">
            <n-form-item-gi label="节点名称" path="name">
              <n-input v-model:value="formModel.name" placeholder="请输入节点名称" />
            </n-form-item-gi>
            
            <n-grid-item :span="1">
              <n-grid :cols="2" :x-gap="16">
                <n-form-item-gi label="主机名" path="hostname">
                  <n-input v-model:value="formModel.hostname" placeholder="请输入主机名" />
                </n-form-item-gi>
                <n-form-item-gi label="IP地址" path="ip">
                  <n-input v-model:value="formModel.ip" placeholder="请输入IP地址" />
                </n-form-item-gi>
              </n-grid>
            </n-grid-item>
            
            <n-form-item-gi label="节点描述" path="description">
              <n-input v-model:value="formModel.description" type="textarea" placeholder="请输入节点描述" />
            </n-form-item-gi>
            
            <n-form-item-gi label="Token" path="token">
              <n-input v-model:value="formModel.token" placeholder="请输入Token" />
            </n-form-item-gi>
            
            <n-grid-item :span="1">
              <n-grid :cols="2" :x-gap="16">
                <n-form-item-gi label="服务端口" path="servicePort">
                  <n-input-number v-model:value="formModel.servicePort" placeholder="请输入服务端口" />
                </n-form-item-gi>
                <n-form-item-gi label="管理端口" path="adminPort">
                  <n-input-number v-model:value="formModel.adminPort" placeholder="请输入管理端口" />
                </n-form-item-gi>
              </n-grid>
            </n-grid-item>
            
            <n-grid-item :span="1">
              <n-grid :cols="2" :x-gap="16">
                <n-form-item-gi label="管理密码" path="adminPass">
                  <n-input 
                    v-model:value="formModel.adminPass" 
                    type="password" 
                    show-password-on="click"
                    placeholder="请输入管理密码" 
                  />
                </n-form-item-gi>
                <n-form-item-gi label="带宽(Mbps)" path="bandWidth">
                  <n-input-number v-model:value="formModel.bandWidth" placeholder="请输入带宽" />
                </n-form-item-gi>
              </n-grid>
            </n-grid-item>
            
            <n-form-item-gi label="是否需要实名" path="need_realname">
              <n-switch v-model:value="formModel.need_realname" />
            </n-form-item-gi>
            
            <n-form-item-gi label="允许用户组" path="allowGroup">
              <div class="group-buttons">
                <n-tag
                  v-for="group in groupOptions"
                  :key="group.value"
                  :type="formModel.allowGroup.includes(group.value) ? 'primary' : 'default'"
                  :disabled="group.value === 'admin'"
                  class="group-tag"
                  :bordered="false"
                  @click="toggleGroup(group.value)"
                >
                  {{ group.label }}
                </n-tag>
              </div>
            </n-form-item-gi>
            
            <n-form-item-gi label="允许端口" path="allowPort">
              <n-input v-model:value="formModel.allowPort" placeholder="请输入允许的端口范围, 如: 10000-20000" />
            </n-form-item-gi>
            
            <n-form-item-gi label="允许协议" path="allowType">
              <div class="protocol-buttons">
                <n-tag
                  v-for="protocol in protocolOptions"
                  :key="protocol.value"
                  :type="formModel.allowType.includes(protocol.value) ? 'primary' : 'default'"
                  class="protocol-tag"
                  :bordered="false"
                  @click="toggleProtocol(protocol.value)"
                >
                  {{ protocol.label }}
                </n-tag>
              </div>
            </n-form-item-gi>
          </n-grid>
        </n-form>
        <template #footer>
          <n-space justify="end">
            <n-button @click="showEditModal = false">取消</n-button>
            <n-button type="primary" :loading="submitting" @click="handleEditSubmit">确定</n-button>
          </n-space>
        </template>
      </n-modal>

      <!-- 启用/禁用节点确认框 -->
      <n-modal 
        v-model:show="showToggleModal" 
        preset="dialog"
        :title="currentNode?.isDisabled ? '启用节点' : '禁用节点'"
        :style="{ width: '420px' }"
        :show-icon="false"
      >
        <div class="confirm-text">确定要{{ currentNode?.isDisabled ? '启用' : '禁用' }}节点 "{{ currentNode?.name }}" 吗？</div>
        <template #action>
          <n-space justify="end">
            <n-button @click="showToggleModal = false">取消</n-button>
            <n-button 
              :type="currentNode?.isDisabled ? 'primary' : 'warning'" 
              :loading="submitting" 
              @click="() => currentNode && handleToggleNode(currentNode)"
            >
              确定
            </n-button>
          </n-space>
        </template>
      </n-modal>

      <!-- 删除节点确认框 -->
      <n-modal 
        v-model:show="showDeleteModal" 
        preset="dialog"
        title="删除节点"
        :style="{ width: '420px' }"
        :show-icon="false"
      >
        <div class="confirm-text">确定要删除节点 "{{ currentNode?.name }}" 吗？此操作不可恢复！</div>
        <template #action>
          <n-space justify="end">
            <n-button @click="showDeleteModal = false">取消</n-button>
            <n-button 
              type="error" 
              :loading="submitting" 
              @click="() => currentNode && handleDeleteNode(currentNode)"
            >
              删除
            </n-button>
          </n-space>
        </template>
      </n-modal>
    </n-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, h } from 'vue'
import { 
  NCard, 
  NSpace, 
  NDataTable, 
  NButton, 
  NModal, 
  NForm, 
  NFormItem, 
  NFormItemGi,
  NGrid,
  NGridItem,
  NInput, 
  NInputNumber, 
  useMessage, 
  NButtonGroup, 
  NSelect, 
  NTag, 
  NDropdown, 
  NIcon,
  NSwitch
} from 'naive-ui'
import { 
  EllipsisHorizontalCircleOutline, 
  CreateOutline, 
  PowerOutline, 
  TrashOutline,
  SearchOutline,
  AddOutline
} from '@vicons/ionicons5'
import type { DataTableColumns, FormRules, FormInst, SelectOption, DropdownOption } from 'naive-ui'
import type { Node, UpdateNodeArgs, GetNodesArgs } from '@/types'
import { userApi } from "@/net"
import { accessHandle } from "@/net/base.ts"

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
  id: 0,
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
  bandWidth: 0,
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

// 行样式
const rowClassName = (row: Node) => {
  return row.isDisabled ? 'disabled-row' : ''
}

const renderStatusTag = (status: boolean, successText: string, errorText: string) => {
  return h(
    NTag,
    {
      type: status ? 'success' : 'error',
      size: 'small',
      round: true,
      bordered: false
    },
    { default: () => status ? successText : errorText }
  )
}

const columns: DataTableColumns<Node> = [
  {
    title: 'ID',
    key: 'id',
    width: 80
  },
  {
    title: '名称',
    key: 'name',
    width: 180,
    render(row) {
      return h(NSpace, { align: 'center' }, {
        default: () => [
          renderStatusTag(row.isOnline, '在线', '离线'),
          h('span', row.name)
        ]
      })
    }
  },
  {
    title: '主机名',
    key: 'hostname',
    width: 150
  },
  {
    title: '描述',
    key: 'description',
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: '服务端口',
    key: 'servicePort',
    width: 100,
    render(row) {
      return row.port
    }
  },
  {
    title: '管理端口',
    key: 'adminPort',
    width: 100
  },
  {
    title: '实名',
    key: 'need_realname',
    width: 80,
    render(row) {
      return renderStatusTag(row.need_realname, '需要', '不需要')
    }
  },
  {
    title: '用户组',
    key: 'allowGroup',
    width: 180,
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
                round: true,
                bordered: false,
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
    title: '协议',
    key: 'allowType',
    width: 180,
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
                round: true,
                bordered: false,
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
    width: 100,
    render(row) {
      return renderStatusTag(!row.isDisabled, '已启用', '已禁用')
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    fixed: 'right',
    render(row) {
      return h(NDropdown, {
        trigger: 'click',
        options: dropdownOptions(row),
        onSelect: (key: string) => handleSelect(key, row),
        placement: 'bottom-end'
      }, {
        default: () => h(NButton, {
          quaternary: true,
          circle: true,
          size: 'small'
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
    id: row.id,
    name: row.name,
    hostname: row.hostname,
    ip: row.ip,
    description: row.description,
    token: row.token,
    servicePort: row.port,
    adminPort: row.adminPort,
    adminPass: row.adminPass,
    allowGroup: row.allowGroup.split(';'),
    allowPort: row.allowPort,
    allowType: row.allowType.split(';'),
    need_realname: row.need_realname,
    bandWidth: row.bandWidth
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
          id: editingNode.value!.id,
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
          need_realname: formModel.value.need_realname,
          bandWidth: formModel.value.bandWidth,
        }
        userApi.post(`/admin/node/set/${editingNode.value!.id}`, config, accessHandle(), (data) => {
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
              need_realname: false,
              bandWidth: 0
            })
            fetchNodes()
          } else {
            message.error(data.message || '更新节点失败')
          }
        })
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
        userApi.post(`/admin/node/create`, config, accessHandle(), (data) => {
          if (data.code === 0) {
            message.success('添加节点成功')
            showAddModal.value = false
            formRef.value?.restoreValidation()
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
              need_realname: true,
              bandWidth: 0
            })
            fetchNodes()
          } else {
            message.error(data.message || '添加节点失败')
          }
        })
      } catch (error: any) {
        message.error(error || '添加节点失败')
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
  { label: '已启用', value: 'enabled' },
  { label: '已禁用', value: 'disabled' },
]

const showToggleModal = ref(false)
const showDeleteModal = ref(false)
const currentNode = ref<Node | null>(null)

const handleToggleNode = async (node: Node) => {
  try {
    submitting.value = true
    userApi.post(`/admin/node/toggle/${node.id}`, { isDisabled: !node.isDisabled }, accessHandle(), (data) => {
      if (data.code === 0) {
        node.isDisabled = !node.isDisabled
        message.success(node.isDisabled ? '禁用节点成功' : '启用节点成功')
        showToggleModal.value = false
        loadData()
      } else {
        message.error(data.message || '操作失败')
      }
    })
  } catch (error: any) {
    message.error(error || '操作失败')
  } finally {
    submitting.value = false
  }
}

const handleDeleteNode = async (node: Node) => {
  try {
    submitting.value = true
    userApi.post(`/admin/node/delete/${node.id}`, {}, accessHandle(), (data) => {
      if (data.code === 0) {
        message.success('删除节点成功')
        setTimeout(() => {
          fetchNodes()
        }, 100)
      } else {
        message.error(data.message || '删除节点失败')
      }
    })
    showDeleteModal.value = false
    loadData()
  } catch (error: any) {
    message.error(error || '操作失败')
  } finally {
    submitting.value = false
  }
}

const dropdownOptions = (row: Node): DropdownOption[] => [
  {
    label: '编辑',
    key: 'edit',
    disabled: false,
    icon: () => h(NIcon, null, { default: () => h(CreateOutline) })
  },
  {
    label: !row.isDisabled ? '禁用' : '启用',
    key: 'toggle',
    disabled: false,
    icon: () => h(NIcon, null, { default: () => h(PowerOutline) })
  },
  {
    label: '删除',
    key: 'delete',
    disabled: false,
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

    userApi.post("/admin/node/list", params, accessHandle(), (data) => {
      nodes.value = (data.data?.nodes || []).map(node => ({
        ...node,
        allowGroup: node.group || '',
        allowType: node.allowType || ''
      }))
      pagination.value.itemCount = data.data?.total || 0
      pagination.value.pageCount = Math.ceil((data.data?.total || 0) / pagination.value.pageSize)
    }, (error) => {
      message.warning(error || '获取节点列表失败')
      nodes.value = []
      pagination.value.itemCount = 0
      pagination.value.pageCount = 0
    })
  } catch (error: any) {
    message.error(error || '获取节点列表失败')
    nodes.value = []
  } finally {
    loading.value = false
  }
}

const fetchUserGroups = async () => {
  try {
    userApi.get("/user/info/groups", accessHandle(), (data) => {
      if (data.code === 0) {
        // 过滤掉 traffic 和 proxies 组
        groupOptions.value = data.data.groups
          .filter(group => group.name !== 'traffic' && group.name !== 'proxies')
          .map(group => ({
            label: group.friendlyName,
            value: group.name
          }));
      } else {
        message.error(data.message || '获取用户组列表失败');
      }
    });
  } catch (error: any) {
    message.error(error || '获取用户组列表失败');
  }
};

const loadData = () => {
  fetchNodes()
  fetchUserGroups()
}

// 在组件挂载时获取用户组列表
const init = () => {
  fetchUserGroups()
  fetchNodes()
}

init()
</script>

<style scoped>
.node-management {
  width: 100%;
}

.main-card {
  border-radius: 8px;
}

.filter-container {
  padding: 8px 0;
}

.add-button {
  margin-left: auto;
}

.group-buttons,
.protocol-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.group-tag,
.protocol-tag {
  cursor: pointer;
  padding: 6px 12px;
  transition: all 0.2s ease;
}

.group-tag:hover,
.protocol-tag:hover {
  opacity: 0.8;
}

.confirm-text {
  margin: 16px 0;
  text-align: center;
}

.node-modal :deep(.n-form-item-label) {
  font-weight: 500;
}

:deep(.n-data-table-th) {
  background-color: var(--n-merged-th-color) !important;
  font-weight: 600;
}

:deep(.n-data-table-tr:hover) {
  background-color: rgba(0, 0, 0, 0.03);
}

:deep(.disabled-row) {
  opacity: 0.7;
  background-color: rgba(0, 0, 0, 0.02);
}

:deep(.n-tag) {
  font-size: 12px;
}

:deep(.n-button) {
  font-weight: 500;
}
</style>