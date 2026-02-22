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
          >
            <template #prefix>
              <NIcon :component="Search" />
            </template>
          </NInput>
        </div>

        <!-- 桌面端筛选 -->
        <NSpace v-if="!isMobile">
          <NSelect
            v-model:value="filters.group"
            :options="groupOptions"
            placeholder="用户组"
            clearable
            style="width: 200px"
          />
          <NSelect
            v-model:value="filters.isRealname"
            :options="realnameOptions"
            placeholder="实名状态"
            clearable
            style="width: 200px"
          />
          <NSelect
            v-model:value="filters.status"
            :options="statusOptions"
            placeholder="账户状态"
            clearable
            style="width: 200px"
          />
          <NSelect
            v-model:value="sortOptions.key"
            :options="sortFieldOptions"
            placeholder="排序字段"
            clearable
            style="width: 150px"
          />
          <NSelect
            v-model:value="sortOptions.order"
            :options="sortOrderOptions"
            placeholder="排序方式"
            clearable
            style="width: 120px"
          />
        </NSpace>
        <!-- 移动端筛选 -->
        <NSpace v-else vertical :size="8" style="width: 100%">
          <NGrid :cols="2" :x-gap="8">
            <NGridItem>
              <NSelect
                v-model:value="filters.group"
                :options="groupOptions"
                placeholder="用户组"
                clearable
                style="width: 100%"
              />
            </NGridItem>
            <NGridItem>
              <NSelect
                v-model:value="filters.isRealname"
                :options="realnameOptions"
                placeholder="实名状态"
                clearable
                style="width: 100%"
              />
            </NGridItem>
          </NGrid>
          <NGrid :cols="3" :x-gap="8">
            <NGridItem>
              <NSelect
                v-model:value="filters.status"
                :options="statusOptions"
                placeholder="账户状态"
                clearable
                style="width: 100%"
              />
            </NGridItem>
            <NGridItem>
              <NSelect
                v-model:value="sortOptions.key"
                :options="sortFieldOptions"
                placeholder="排序字段"
                clearable
                style="width: 100%"
              />
            </NGridItem>
            <NGridItem>
              <NSelect
                v-model:value="sortOptions.order"
                :options="sortOrderOptions"
                placeholder="排序方式"
                clearable
                style="width: 100%"
              />
            </NGridItem>
          </NGrid>
        </NSpace>

        <div class="table-container">
          <NDataTable
            :columns="columns"
            :data="users"
            :loading="loading"
            :pagination="false"
            :scroll-x="900"
          />
        </div>

        <!-- 独立的分页组件 -->
        <div style="display: flex; justify-content: right">
          <NPagination
            v-model:page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :item-count="pagination.itemCount"
            :page-count="pagination.pageCount"
            :page-sizes="pagination.pageSizes"
            show-size-picker
            :prefix="pagination.prefix"
          />
        </div>
      </NSpace>
    </NCard>

    <!-- 编辑模态框 -->
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
        label-width="100px"
        require-mark-placement="right-hanging"
      >
        <NGrid :cols="2" :x-gap="20" :y-gap="8" responsive="screen">
          <NGridItem span="2">
            <NFormItem label="用户名" path="username">
              <NInput
                v-model:value="editForm.username"
                placeholder="请输入用户名"
                clearable
              />
            </NFormItem>
          </NGridItem>
          <NGridItem>
            <NFormItem label="邮箱" path="email">
              <NInput
                v-model:value="editForm.email"
                placeholder="请输入邮箱"
                clearable
              />
            </NFormItem>
          </NGridItem>
          <NGridItem>
            <NFormItem label="用户组" path="group">
              <NSelect
                v-model:value="editForm.group"
                :options="groupOptions"
                placeholder="请选择用户组"
                clearable
              />
            </NFormItem>
          </NGridItem>
          <NGridItem>
            <NFormItem label="账户状态" path="status">
              <NSelect
                v-model:value="editForm.status"
                :options="statusOptions"
                placeholder="请选择账户状态"
                clearable
              />
            </NFormItem>
          </NGridItem>
          <NGridItem>
            <NFormItem label="实名状态" path="isRealname">
              <NSwitch v-model:value="editForm.is_realname" />
            </NFormItem>
          </NGridItem>
          <NGridItem>
            <NFormItem label="验证码次数" path="remainder">
              <NInputNumber
                v-model:value="editForm.remainder"
                :min="0"
                placeholder="请输入验证码次数"
                style="width: 100%"
              >
                <template #suffix>次</template>
              </NInputNumber>
            </NFormItem>
          </NGridItem>
          <NGridItem span="2">
            <NDivider title-placement="left" style="margin: 16px 0"
              >资源限制</NDivider
            >
          </NGridItem>
          <NGridItem>
            <NFormItem label="流量限制" path="traffic">
              <NInputNumber
                v-model:value="editForm.traffic"
                :min="0"
                placeholder="请输入流量限制"
                style="width: 100%"
              >
                <template #suffix>GB</template>
              </NInputNumber>
            </NFormItem>
          </NGridItem>
          <NGridItem>
            <NFormItem label="隧道数量" path="proxies">
              <NInputNumber
                v-model:value="editForm.proxies"
                :min="0"
                placeholder="请输入隧道数量"
                style="width: 100%"
              >
                <template #suffix>个</template>
              </NInputNumber>
            </NFormItem>
          </NGridItem>
          <NGridItem span="2">
            <NDivider title-placement="left" style="margin: 16px 0"
              >带宽设置</NDivider
            >
          </NGridItem>
          <NGridItem>
            <NFormItem label="出站带宽" path="out_limit">
              <NInputNumber
                v-model:value="editForm.out_limit"
                :min="0"
                placeholder="请输入出站带宽"
                style="width: 100%"
              >
                <template #suffix>Mbps</template>
              </NInputNumber>
            </NFormItem>
          </NGridItem>
          <NGridItem>
            <NFormItem label="入站带宽" path="in_limit">
              <NInputNumber
                v-model:value="editForm.in_limit"
                :min="0"
                placeholder="请输入入站带宽"
                style="width: 100%"
              >
                <template #suffix>Mbps</template>
              </NInputNumber>
            </NFormItem>
          </NGridItem>
          <NGridItem span="2">
            <NDivider title-placement="left" style="margin: 16px 0"
              >海外带宽设置</NDivider
            >
          </NGridItem>
          <NGridItem>
            <NFormItem label="海外出站" path="no_cn_out_limit">
              <NInputNumber
                v-model:value="editForm.no_cn_out_limit"
                :min="0"
                placeholder="请输入海外出站带宽"
                style="width: 100%"
              >
                <template #suffix>Mbps</template>
              </NInputNumber>
            </NFormItem>
          </NGridItem>
          <NGridItem>
            <NFormItem label="海外入站" path="no_cn_in_limit">
              <NInputNumber
                v-model:value="editForm.no_cn_in_limit"
                :min="0"
                placeholder="请输入海外入站带宽"
                style="width: 100%"
              >
                <template #suffix>Mbps</template>
              </NInputNumber>
            </NFormItem>
          </NGridItem>
        </NGrid>
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

    <!-- 封禁/解封原因 -->
    <NModal
      v-model:show="showBanReasonModal"
      preset="dialog"
      :title="isUnbanning ? '请输入解封原因' : '请输入封禁原因'"
    >
      <n-text> 输入封禁/解封原因（该原因会发送邮件给用户） </n-text>
      <NInput
        style="margin-top: 16px"
        v-model:value="banReason"
        type="textarea"
        :placeholder="isUnbanning ? '请填写解封原因' : '请填写封禁原因'"
        :autosize="{ minRows: 3, maxRows: 5 }"
      />
      <template #action>
        <NButton @click="showBanReasonModal = false">取消</NButton>
        <NButton
          type="primary"
          :disabled="!banReason.trim()"
          @click="submitBanReason"
        >
          确定
        </NButton>
      </template>
    </NModal>

    <!-- 修改状态原因 -->
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
        <NButton @click="showEditReasonModal = false">取消</NButton>
        <NButton
          type="primary"
          :disabled="!editReason.trim()"
          @click="submitEditReason"
        >
          确定
        </NButton>
      </template>
    </NModal>
  </div>
</template>

<script lang="ts" setup>
import { ref, h, computed, onMounted, nextTick, type Ref, watch } from 'vue'
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
  NGrid,
  NGridItem,
  type SelectOption,
  type DataTableColumns,
  type FormInst,
  type FormRules,
  NPagination,
} from 'naive-ui'
import { Search } from '@vicons/ionicons5'
import { adminApi } from '@/net'
import type { User } from '@/net/admin/type'

const message = useMessage()

// 判断是否为移动端
const isMobile = computed(() => {
  return window.innerWidth <= 768
})

const loading = ref(false)
const users: Ref<User[]> = ref([])
const groupNameMap = ref<Record<string, string>>({})

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

const realnameOptions: SelectOption[] = [
  { label: '已实名', value: 'true' },
  { label: '未实名', value: 'false' },
]

const statusOptions: SelectOption[] = [
  { label: '正常', value: 0 },
  { label: '封禁', value: 1 },
  { label: '流量超限', value: 2 },
]

const groupOptions = ref<SelectOption[]>([])

const sortFieldOptions: SelectOption[] = [
  { label: 'ID', value: 'id' },
  { label: '用户名', value: 'username' },
  { label: '用户组', value: 'group' },
  { label: '邮箱', value: 'email' },
  { label: '注册时间', value: 'created_at' },
  { label: '状态', value: 'status' },
]

const sortOrderOptions: SelectOption[] = [
  { label: '升序', value: 'asc' },
  { label: '降序', value: 'desc' },
]

const sortOptions = ref<{ key: string; order: 'asc' | 'desc' }>({
  key: 'id',
  order: 'asc',
})

const pagination = ref({
  page: 1,
  pageSize: 20,
  pageCount: 1,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 30, 40].map((v) => ({ label: `${v} 条/页`, value: v })),
  prefix({ itemCount }: { itemCount?: number }) {
    return `共 ${itemCount} 条`
  },
})

const columns: DataTableColumns<User> = [
  { title: 'ID', key: 'id', width: 80 },
  { title: '用户名', key: 'username', minWidth: 120, ellipsis: true },
  { title: '邮箱', key: 'email', minWidth: 160, ellipsis: true },
  {
    title: '用户组',
    key: 'group',
    minWidth: 120,
    render: (row) => row.friendlyGroup || row.group,
  },
  {
    title: '注册时间',
    key: 'created_at',
    minWidth: 140,
    render: (row) => formatTime(row.created_at),
  },
  {
    title: '状态',
    key: 'status',
    width: 90,
    render: (row) => {
      const map: Record<
        number,
        { text: string; type: 'success' | 'error' | 'warning' }
      > = {
        0: { text: '正常', type: 'success' },
        1: { text: '封禁', type: 'error' },
        2: { text: '流量超限', type: 'warning' },
      }
      const cur = map[row.status] || { text: '未知', type: 'warning' }
      return h(NTag, { type: cur.type }, () => cur.text)
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 140,
    render: (row) =>
      h(NSpace, { size: 'small' }, () => [
        h(
          NButton,
          { size: 'small', type: 'primary', onClick: () => handleEdit(row) },
          () => '编辑',
        ),
        h(
          NButton,
          {
            size: 'small',
            type: row.status === 1 ? 'success' : 'error',
            onClick: () => openBanModal(row),
          },
          () => (row.status === 1 ? '解封' : '封禁'),
        ),
      ]),
  },
]

const formatTime = (ts: string | number) =>
  new Date(typeof ts === 'string' ? ts : ts * 1000).toLocaleString('zh-CN')

// 监听分页变化，重新加载数据
watch(
  [() => pagination.value.page, () => pagination.value.pageSize],
  () => {
    loadData()
  },
  { deep: true },
)

/* ----------------- 编辑 / 封禁 / 解封 ----------------- */
const showEditModal = ref(false)
const formRef = ref<FormInst | null>(null)
const submitting = ref(false)
const editForm = ref({
  ID: 0,
  username: '',
  email: '',
  group: '',
  status: 0,
  originalStatus: 0,
  is_realname: false,
  remainder: 0,
  traffic: 0,
  out_limit: 0,
  in_limit: 0,
  no_cn_out_limit: 0,
  no_cn_in_limit: 0,
  proxies: 0,
})

const rules: FormRules = {
  username: { required: true, message: '请输入用户名', trigger: 'blur' },
  email: {
    required: true,
    validator: (_rule, value) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        ? Promise.resolve()
        : Promise.reject(new Error('请输入有效邮箱')),
    trigger: 'blur',
  },
  group: { required: true, message: '请选择用户组', trigger: 'change' },
}

const showBanReasonModal = ref(false)
const banReason = ref('')
const banningUser = ref<User | null>(null)
const isUnbanning = ref(false)

const openBanModal = (user: User) => {
  banningUser.value = user
  isUnbanning.value = user.status === 1
  showBanReasonModal.value = true
  banReason.value = ''
}

const submitBanReason = async () => {
  if (!banningUser.value) return
  try {
    const { id, status } = banningUser.value
    const data = await adminApi.toggleUser({
      userId: id,
      status: status === 1 ? 0 : 1,
      reason: banReason.value,
    })
    if (data.code === 0) {
      message.success(data.message || '操作成功')
      loadData()
    } else {
      message.error(data.message || '操作失败')
    }
  } catch (e: any) {
    message.error(e.message || '操作失败')
  } finally {
    showBanReasonModal.value = false
  }
}

const handleEdit = (row: User) => {
  editForm.value = {
    ID: row.id,
    username: row.username,
    email: row.email,
    group: row.group,
    status: row.status,
    originalStatus: row.status,
    is_realname: row.is_realname,
    remainder: row.remainder,
    traffic: row.traffic / 1024,
    out_limit: row.outBound / 128,
    in_limit: row.inBound / 128,
    no_cn_out_limit: row.noCnOutBound / 128,
    no_cn_in_limit: row.noCnInBound / 128,
    proxies: row.proxies,
  }
  showEditModal.value = true
  nextTick(() => formRef.value?.restoreValidation())
}

const showEditReasonModal = ref(false)
const editReason = ref('')
const handleEditSubmit = async () => {
  await formRef.value?.validate()
  if (editForm.value.status !== editForm.value.originalStatus) {
    showEditReasonModal.value = true
    return
  }
  await doEdit()
}

const submitEditReason = async () => {
  showEditReasonModal.value = false
  await doEdit()
}

const doEdit = async () => {
  submitting.value = true
  try {
    const data = await adminApi.updateUser({
      id: editForm.value.ID,
      username: editForm.value.username,
      email: editForm.value.email,
      group: editForm.value.group,
      status: editForm.value.status,
      maxProxies: editForm.value.proxies,
      traffic: editForm.value.traffic * 1024,
      outBound: editForm.value.out_limit * 128,
      inBound: editForm.value.in_limit * 128,
      noCnOutBound: editForm.value.no_cn_out_limit * 128,
      noCnInBound: editForm.value.no_cn_in_limit * 128,
      isRealname: editForm.value.is_realname,
      remainder: editForm.value.remainder,
      reason: editReason.value,
    })
    if (data.code === 0) {
      message.success('更新成功')
      showEditModal.value = false
      loadData()
    } else {
      message.error(data.message || '更新失败')
    }
  } catch (e: any) {
    message.error(e.message || '更新失败')
  } finally {
    submitting.value = false
    editReason.value = ''
  }
}

const fetchUserGroups = async () => {
  try {
    const data = await adminApi.getGroupList()
    if (data.code === 0) {
      const groups = data.data.groups || data.data
      groupOptions.value = groups.map((g) => ({
        label: g.friendlyName,
        value: g.name,
      }))
      groupNameMap.value = groups.reduce((acc: Record<string, string>, g) => {
        acc[g.name] = g.friendlyName
        return acc
      }, {})
    } else {
      message.error(data.message || '获取用户组失败')
    }
  } catch (e) {
    message.error('获取用户组失败')
  }
}

const loadData = async () => {
  loading.value = true
  try {
    if (!groupOptions.value.length) await fetchUserGroups()
    const data = await adminApi.getUserList(
      pagination.value.page,
      pagination.value.pageSize,
      filters.value.search || undefined,
      filters.value.group || undefined,
      filters.value.isRealname === null
        ? undefined
        : filters.value.isRealname === 'true',
      filters.value.status === null ? undefined : filters.value.status,
      sortOptions.value.key || undefined,
      sortOptions.value.order || undefined,
    )
    if (data.code === 0 && data.data) {
      users.value = (data.data.users || []).map((u: User) => ({
        ...u,
        friendlyGroup: groupNameMap.value[u.group] || u.group,
      }))
      pagination.value.itemCount = data.data.total
      pagination.value.pageCount = data.data.totalPages
    } else {
      message.error(data.message || '获取用户列表失败')
    }
  } catch (e) {
    message.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

// 搜索防抖定时器
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

// 监听搜索输入，带防抖
watch(
  () => filters.value.search,
  () => {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer)
    }
    searchDebounceTimer = setTimeout(() => {
      pagination.value.page = 1
      loadData()
    }, 300)
  },
)

// 监听其他筛选条件变化（无防抖）
watch(
  [
    () => filters.value.group,
    () => filters.value.isRealname,
    () => filters.value.status,
    () => sortOptions.value.key,
    () => sortOptions.value.order,
  ],
  () => {
    pagination.value.page = 1
    loadData()
  },
  { deep: true },
)

// 监听分页变化
watch([() => pagination.value.page, () => pagination.value.pageSize], () => {
  loadData()
})

const modalStyle = computed(() => ({
  width: window.innerWidth <= 768 ? '95vw' : '600px',
  maxWidth: '95vw',
}))
</script>

<style lang="scss" scoped>
:deep(.n-input-number) {
  width: 100%;
}

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
