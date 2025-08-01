<template>
  <div class="users">
    <NCard title="用户管理">
      <NSpace vertical :size="12">
        <div style="display: flex">
          <NInput
            v-model:value="filters.search"
            placeholder="搜索 ID、用户名、邮箱或访问密钥"
            clearable
            style="flex: 1"
            @update:value="handleSearch"
          >
            <template #prefix>
              <NIcon :component="Search" />
            </template>
          </NInput>
        </div>
        <NSpace>
          <NSelect
            v-model:value="filters.group"
            :options="groupOptions"
            placeholder="用户组"
            clearable
            style="width: 200px"
            @update:value="handleGroupFilter"
          />
          <NSelect
            v-model:value="filters.isRealname"
            :options="realnameOptions"
            placeholder="实名状态"
            clearable
            style="width: 200px"
            @update:value="handleRealnameFilter"
          />
          <NSelect
            v-model:value="filters.status"
            :options="statusOptions"
            placeholder="账户状态"
            clearable
            style="width: 200px"
            @update:value="handleStatusFilter"
          />
          <NSelect
            v-model:value="sortOptions.key"
            :options="sortFieldOptions"
            placeholder="排序字段"
            clearable
            style="width: 150px"
            @update:value="handleSortFieldChange"
          />
          <NSelect
            v-model:value="sortOptions.order"
            :options="sortOrderOptions"
            placeholder="排序方式"
            clearable
            style="width: 120px"
            @update:value="handleSortOrderChange"
          />
        </NSpace>
        <div class="table-container">
          <NDataTable
            :columns="columns"
            :data="sortedUsers"
            :loading="loading"
            :pagination="pagination"
            :sorter="sorter"
            @update:sorter="handleSortChange"
          />
        </div>
      </NSpace>
    </NCard>

    <!-- 添加编辑用户的模态框 -->
    <NModal
      v-model:show="showEditModal"
      preset="card"
      title="编辑用户"
      :style="modalStyle"
    >
      <NForm
        ref="formRef"
        :model="editForm"
        :rules="rules"
        label-placement="left"
        label-width="auto"
        require-mark-placement="right-hanging"
      >
        <NFormItem label="用户名" path="username">
          <NInput
            v-model:value="editForm.username"
            placeholder="请输入用户名"
          />
        </NFormItem>
        <NFormItem label="邮箱" path="email">
          <NInput v-model:value="editForm.email" placeholder="请输入邮箱" />
        </NFormItem>
        <NFormItem label="用户组" path="group">
          <NSelect
            v-model:value="editForm.group"
            :options="groupOptions"
            placeholder="请选择用户组"
          />
        </NFormItem>
        <NFormItem label="账户状态" path="status">
          <NSelect
            v-model:value="editForm.status"
            :options="statusOptions"
            placeholder="请选择账户状态"
          />
        </NFormItem>
        <NFormItem label="实名状态" path="isRealname">
          <NSwitch
            v-model:value="editForm.is_realname"
            :rail-style="switchButtonRailStyle"
          />
        </NFormItem>
        <NFormItem label="验证码次数" path="remainder">
          <NSpace>
            <NInputNumber
              v-model:value="editForm.remainder"
              placeholder="请输入手机验证码次数"
              :min="0"
            />
            <span>次</span>
          </NSpace>
        </NFormItem>
        <NFormItem label="流量限制" path="traffic">
          <NSpace>
            <NInputNumber
              v-model:value="editForm.traffic"
              placeholder="请输入流量限制"
              :min="0"
            />
            <span>GB</span>
          </NSpace>
        </NFormItem>
        <NFormItem label="出站带宽" path="out_limit">
          <NSpace>
            <NInputNumber
              v-model:value="editForm.out_limit"
              placeholder="请输入出站带宽"
              :min="0"
            />
            <span>Mbps</span>
          </NSpace>
        </NFormItem>
        <NFormItem label="入站带宽" path="in_limit">
          <NSpace>
            <NInputNumber
              v-model:value="editForm.in_limit"
              placeholder="请输入入站带宽"
              :min="0"
            />
            <span>Mbps</span>
          </NSpace>
        </NFormItem>
        <NFormItem label="隧道数量" path="proxies">
          <NSpace>
            <NInputNumber
              v-model:value="editForm.proxies"
              placeholder="请输入隧道数量"
              :min="0"
            />
            <span>个</span>
          </NSpace>
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace justify="end">
          <NButton size="small" @click="showEditModal = false">取消</NButton>
          <NButton
            type="primary"
            size="small"
            :loading="submitting"
            @click="handleEditSubmit"
          >
            确定
          </NButton>
        </NSpace>
      </template>
    </NModal>

    <NModal
      v-model:show="showBanReasonModal"
      preset="dialog"
      :title="banReasonModalTitle"
    >
      <NInput
        v-model:value="banReason"
        type="textarea"
        :placeholder="banReasonModalPlaceholder"
        :autosize="{ minRows: 3, maxRows: 5 }"
      />
      <template #action>
        <NButton @click="cancelBanReason">取消</NButton>
        <NButton
          type="primary"
          :disabled="!banReason.trim()"
          @click="submitBanReason"
          >确定</NButton
        >
      </template>
    </NModal>

    <NModal
      v-model:show="showEditReasonModal"
      preset="dialog"
      title="请输入修改账户状态原因"
    >
      <NInput
        v-model:value="editReason"
        type="textarea"
        placeholder="请填写原因"
        :autosize="{ minRows: 3, maxRows: 5 }"
      />
      <template #action>
        <NButton
          @click="
            () => {
              showEditReasonModal = false
              editReason = ''
            }
          "
          >取消</NButton
        >
        <NButton
          type="primary"
          :disabled="!editReason.trim()"
          @click="submitEditReason"
          >确定</NButton
        >
      </template>
    </NModal>
  </div>
</template>

<script lang="ts" setup>
import { ref, h, computed, onMounted } from 'vue'
import {
  NCard,
  NSpace,
  NDataTable,
  NButton,
  useMessage,
  NTag,
  NInput,
  NSelect,
  NIcon,
  NModal,
  NForm,
  NFormItem,
  NInputNumber,
  NSwitch,
  SelectOption,
  useLoadingBar,
} from 'naive-ui'
import { Search } from '@vicons/ionicons5'
import type { DataTableColumns, FormInst, FormRules } from 'naive-ui'
import type { User } from '@/net/admin/type'
import type { UserListParams } from '@/net/admin/type'
import { switchButtonRailStyle } from '@/constants/theme.ts'
import { adminApi } from '@/net'
const message = useMessage()
const loading = ref(false)
const users = ref<User[]>([])
const groupNameMap = ref<Record<string, string>>({})

const realnameOptions: SelectOption[] = [
  { label: '已实名', value: 'true' },
  { label: '未实名', value: 'false' },
]

// 修改filters类型定义
const filters = ref<{
  search: string
  group: string | null
  isRealname: string | null
  status: number | null
}>({
  search: '',
  group: null,
  isRealname: null,
  status: null,
})

const loadingBar = useLoadingBar()
const groupOptions = ref<{ label: string; value: string }[]>([])

const statusOptions: SelectOption[] = [
  { label: '正常', value: 0 },
  { label: '封禁', value: 1 },
  { label: '流量超限', value: 2 },
]

// 排序字段选项
const sortFieldOptions: SelectOption[] = [
  { label: 'ID', value: 'id' },
  { label: '用户名', value: 'username' },
  { label: '用户组', value: 'group' },
  { label: '邮箱', value: 'email' },
  { label: '注册时间', value: 'created_at' },
  { label: '状态', value: 'status' },
]

// 排序方式选项
const sortOrderOptions: SelectOption[] = [
  { label: '升序', value: 'asc' },
  { label: '降序', value: 'desc' },
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
    // 本地分页，不需要重新加载数据
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.value.pageSize = pageSize
    pagination.value.page = 1
    // 本地分页，不需要重新加载数据
  },
})

const showEditModal = ref(false)
const formRef = ref<FormInst | null>(null)
const submitting = ref(false)

const editForm = ref({
  ID: 0,
  username: '',
  email: '',
  group: '',
  status: 0,
  originalStatus: 0, // 新增
  is_realname: false,
  remainder: 0,
  traffic: 0,
  out_limit: 0,
  in_limit: 0,
  proxies: 0,
})

const showBanReasonModal = ref(false)
const banReason = ref('')
const banningUser = ref<User | null>(null)
const isUnbanning = ref(false)

// 计算属性：动态设置模态框标题和占位符
const banReasonModalTitle = computed(() => {
  return isUnbanning.value ? '请输入解封原因' : '请输入封禁原因'
})

const banReasonModalPlaceholder = computed(() => {
  return isUnbanning.value ? '请填写解封原因' : '请填写封禁原因'
})

const formatTime = (timestamp: number | string) => {
  const date = new Date(
    typeof timestamp === 'string' ? timestamp : timestamp * 1000,
  )
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

const rules: FormRules = {
  username: {
    required: true,
    message: '请输入用户名',
    trigger: ['blur', 'input'],
  },
  email: {
    required: true,
    message: '请输入邮箱',
    trigger: ['blur', 'input'],
    validator: (_rule: any, value: string) => {
      if (!value) return true
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        return new Error('请输入有效的邮箱地址')
      }
      return true
    },
  },
  group: {
    required: true,
    message: '请选择用户组',
    trigger: ['blur', 'change'],
  },
}

const columns: DataTableColumns<User> = [
  {
    title: 'ID',
    key: 'id',
    sorter: true,
    render(row) {
      return h(
        'div',
        {
          style:
            'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;',
        },
        row.id,
      )
    },
  },
  {
    title: '用户名',
    key: 'username',
    sorter: true,
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
    title: '邮箱',
    key: 'email',
    sorter: true,
    render(row) {
      return h(
        'div',
        {
          style:
            'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;',
        },
        row.email,
      )
    },
  },
  {
    title: '用户组',
    key: 'group',
    sorter: true,
    render(row) {
      return h(
        'div',
        {
          style:
            'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;',
        },
        row.friendlyGroup || row.group,
      )
    },
  },
  {
    title: '注册时间',
    key: 'created_at',
    sorter: true,
    render(row) {
      return h(
        'div',
        {
          style:
            'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;',
        },
        formatTime(row.created_at),
      )
    },
  },
  {
    title: '状态',
    key: 'status',
    sorter: true,
    render(row) {
      const statusMap: Record<
        number,
        { text: string; type: 'success' | 'error' | 'warning' }
      > = {
        0: { text: '正常', type: 'success' },
        1: { text: '封禁', type: 'error' },
        2: { text: '流量超限', type: 'warning' },
      }
      const status = statusMap[row.status] || { text: '未知', type: 'warning' }
      return h(
        NTag,
        {
          type: status.type,
        },
        { default: () => status.text },
      )
    },
  },
  {
    title: '操作',
    key: 'actions',
    render(row) {
      return h(
        NSpace,
        { size: 'small' },
        {
          default: () => [
            h(
              NButton,
              {
                size: 'small',
                type: 'primary',
                onClick: () => handleEdit(row),
              },
              { default: () => '编辑' },
            ),
            h(
              NButton,
              {
                size: 'small',
                type: row.status === 1 ? 'success' : 'error',
                onClick: () => {
                  banningUser.value = row
                  isUnbanning.value = row.status === 1
                  showBanReasonModal.value = true
                },
              },
              { default: () => (row.status === 1 ? '解封' : '封禁') },
            ),
          ],
        },
      )
    },
  },
]

const searchTimeout = ref<number>()

const handleSearch = () => {
  window.clearTimeout(searchTimeout.value)
  searchTimeout.value = window.setTimeout(() => {
    pagination.value.page = 1
    loadData() // 搜索时重新加载数据
  }, 300)
}

const handleGroupFilter = () => {
  pagination.value.page = 1
  loadData()
}

const handleRealnameFilter = () => {
  pagination.value.page = 1
  loadData()
}

const handleStatusFilter = () => {
  pagination.value.page = 1
  loadData()
}

const handleSortFieldChange = () => {
  // 本地排序，不需要重新加载数据
}

const handleSortOrderChange = () => {
  // 本地排序，不需要重新加载数据
}

const submitBanReason = () => {
  if (!banningUser.value) return
  handleToggleStatus(banningUser.value, banReason.value)
  showBanReasonModal.value = false
  banReason.value = ''
  banningUser.value = null
  isUnbanning.value = false
}

const cancelBanReason = () => {
  showBanReasonModal.value = false
  banReason.value = ''
  banningUser.value = null
  isUnbanning.value = false
}

const handleToggleStatus = async (user: User, reason?: string) => {
  try {
    const data = await adminApi.toggleUser({
      userId: user.id,
      status: user.status === 1 ? 0 : 1,
      reason: reason,
    })
    if (data.code === 0) {
      message.success(data.message || '操作成功')
      loadData()
      showBanReasonModal.value = false
      banReason.value = ''
      banningUser.value = null
      isUnbanning.value = false
    } else {
      message.error(data.message || '操作失败')
    }
  } catch (error: any) {
    message.error(error?.message || '操作失败')
  }
}

const editReason = ref('') // 新增
const showEditReasonModal = ref(false) // 新增
const pendingEditSubmit = ref(false) // 新增

const handleEditSubmit = async () => {
  try {
    await formRef.value?.validate()
    // 检查状态是否变化
    if (
      editForm.value.status !== editForm.value.originalStatus &&
      !pendingEditSubmit.value
    ) {
      showEditReasonModal.value = true
      return
    }
    submitting.value = true

    editForm.value.traffic *= 1024
    editForm.value.out_limit *= 128
    editForm.value.in_limit *= 128

    const data = await adminApi.updateUser({
      id: editForm.value.ID,
      username: editForm.value.username,
      email: editForm.value.email,
      group: editForm.value.group,
      status: editForm.value.status,
      maxProxies: editForm.value.proxies,
      traffic: editForm.value.traffic,
      outBound: editForm.value.out_limit,
      inBound: editForm.value.in_limit,
      isRealname: editForm.value.is_realname,
      remainder: editForm.value.remainder,
      reason: editReason.value,
    })

    if (data.code === 0) {
      message.success('更新用户成功')
      showEditModal.value = false
      loadData()
    } else {
      message.error(data.message || '更新用户失败')
    }
  } catch (error: any) {
    message.error(error?.message || '更新用户失败')
  } finally {
    submitting.value = false
    editReason.value = ''
    pendingEditSubmit.value = false
  }
}

const handleEdit = async (user: User) => {
  try {
    const data = await adminApi.getUserById(user.id)
    if (data.code === 0) {
      const userDetail = data.data
      console.log('用户详情数据:', userDetail)
      console.log('用户详情字段:', Object.keys(userDetail))

      editForm.value = {
        ID: userDetail.id,
        username: userDetail.username,
        email: userDetail.email,
        group: userDetail.group,
        status: userDetail.status,
        originalStatus: userDetail.status, // 新增
        is_realname: userDetail.is_realname,
        remainder: userDetail.remainder,
        traffic: userDetail.traffic / 1024,
        out_limit: userDetail.outBound / 128,
        in_limit: userDetail.inBound / 128,
        proxies: userDetail.proxies,
      }
      console.log('编辑表单数据:', editForm.value)
      showEditModal.value = true
    } else {
      message.error(data.message || '获取用户信息失败')
    }
  } catch (error: any) {
    message.error(error?.message || '获取用户信息失败')
  }
}

// 修改后的获取用户组方法
const fetchUserGroups = async () => {
  try {
    const data = await adminApi.getGroupList()
    if (data.code === 0) {
      // 修复：使用 data.data.groups 而不是 data.data
      const groups = data.data.groups || data.data

      // 同时更新组名映射和下拉选项
      groupOptions.value = groups.map((group) => ({
        label: group.friendlyName, // 使用接口返回的友好名称
        value: group.name,
      }))

      groupNameMap.value = groups.reduce(
        (acc: Record<string, string>, group) => {
          acc[group.name] = group.friendlyName
          return acc
        },
        {},
      )

      loadingBar.finish()
    } else {
      message.error(data.message || '获取用户组列表失败')
    }
  } catch (error: any) {
    console.error('获取用户组异常:', error)
    message.error('获取用户组失败')
  }
}

// 处理用户数据, 添加 friendlyGroup
const processUsers = (users: User[]) => {
  return users.map((user) => ({
    ...user,
    friendlyGroup: groupNameMap.value[user.group] || user.group,
  }))
}

// 统一的数据加载函数
const loadData = async () => {
  loading.value = true
  try {
    // 确保先加载用户组信息
    if (Object.keys(groupNameMap.value).length === 0) {
      await fetchUserGroups()
    }
    const params: UserListParams = {
      page: 1,
      limit: 1000, // 获取足够多的数据用于本地排序和分页
    }

    // 添加所有有效的筛选条件
    if (filters.value.search) {
      params.keyword = filters.value.search
    }
    if (filters.value.group) {
      params.group = filters.value.group
    }
    // 修改后的筛选条件处理部分
    if (filters.value.isRealname !== null) {
      // 使用API响应中的字段名
      params.isRealname = filters.value.isRealname === 'true'
    }

    if (filters.value.status !== null) {
      params.status = filters.value.status
    }

    const data = await adminApi.getUserList(params)
    if (data.code === 0) {
      users.value = processUsers(data.data.users)
      // 本地分页处理
      const total = data.data.pagination.total
      pagination.value.itemCount = total
      pagination.value.pageCount = Math.ceil(total / pagination.value.pageSize)
    } else {
      message.error(data.message || '获取用户列表失败')
    }
  } catch (error) {
    message.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 初始化数据
onMounted(() => {
  fetchUserGroups()
  loadData()
})

const modalStyle = computed(() => {
  const isMobile = window.innerWidth <= 768
  return {
    width: isMobile ? '95vw' : '600px',
    maxWidth: '95vw',
  }
})

const sortOptions = ref<{
  key: string
  order: 'asc' | 'desc'
}>({
  key: 'id',
  order: 'asc',
})

const sorter = computed(() => {
  return {
    columnKey: sortOptions.value.key,
    order: sortOptions.value.order === 'asc' ? 'ascend' : 'descend',
  }
})

// 本地排序和分页的计算属性
const sortedUsers = computed(() => {
  let sorted = [...users.value]

  // 本地排序
  if (sortOptions.value.key && sortOptions.value.order) {
    sorted = sorted.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortOptions.value.key) {
        case 'id':
          aValue = a.id
          bValue = b.id
          break
        case 'username':
          aValue = a.username
          bValue = b.username
          break
        case 'email':
          aValue = a.email
          bValue = b.email
          break
        case 'group':
          aValue = a.friendlyGroup || a.group
          bValue = b.friendlyGroup || b.group
          break
        case 'created_at':
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          // 状态相同时，按ID升降序
          if (aValue === bValue) {
            if (sortOptions.value.order === 'asc') {
              return a.id - b.id
            } else {
              return b.id - a.id
            }
          }
          break
        default:
          return 0
      }

      if (sortOptions.value.order === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
      }
    })
  }

  // 本地分页
  const startIndex = (pagination.value.page - 1) * pagination.value.pageSize
  const endIndex = startIndex + pagination.value.pageSize
  return sorted.slice(startIndex, endIndex)
})

const handleSortChange = (sorter: any) => {
  if (sorter) {
    sortOptions.value.key = sorter.columnKey
    sortOptions.value.order = sorter.order === 'ascend' ? 'asc' : 'desc'
    // 本地排序，不需要重新加载数据
  }
}

const submitEditReason = () => {
  showEditReasonModal.value = false
  pendingEditSubmit.value = true
  handleEditSubmit()
}
</script>

<style lang="scss" scoped>
.table-container {
  overflow-x: auto;
  :deep(.n-data-table) {
    min-width: 800px;
  }
}
:deep(.n-input-number) {
  width: 100%;
}
// 移动端优化
@media (max-width: 768px) {
  :deep(.n-card .n-card-header) {
    padding: 16px 12px;
    .n-card-header__main {
      font-size: 16px;
    }
  }
  :deep(.n-card .n-card-content) {
    padding: 12px;
  }
  :deep(.n-data-table) {
    font-size: 12px;
    .n-data-table-th,
    .n-data-table-td {
      padding: 8px 4px;
    }
  }
  :deep(.n-form-item) {
    margin-bottom: 16px;
  }
  :deep(.n-modal .n-card) {
    margin: 16px 8px;
  }
  :deep(.n-modal .n-card .n-card-header) {
    padding: 16px;
  }
  :deep(.n-modal .n-card .n-card-content) {
    padding: 16px;
  }
  :deep(.n-button) {
    min-height: 32px;
  }
}
// 超小屏幕优化
@media (max-width: 480px) {
  .table-container {
    padding: 4px;
  }
  :deep(.n-data-table) {
    font-size: 11px;
  }
  :deep(.n-modal .n-card) {
    margin: 8px 4px;
  }
}
</style>
