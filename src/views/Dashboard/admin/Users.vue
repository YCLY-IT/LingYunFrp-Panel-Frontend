<template>
  <SecureArea>
    <div class="users">
      <n-card title="用户管理">
        <n-space vertical :size="12">
          <div style="display: flex">
            <n-input
              v-model:value="filters.search"
              placeholder="搜索 ID、用户名、邮箱或访问密钥"
              clearable
              style="flex: 1"
            >
              <template #prefix>
                <n-icon :component="Search" />
              </template>
            </n-input>
          </div>

          <n-space v-if="!isMobile">
            <n-select
              v-model:value="filters.group"
              :options="groupOptions"
              placeholder="用户组"
              clearable
              style="width: 200px"
            />
            <n-select
              v-model:value="filters.isRealname"
              :options="realnameOptions"
              placeholder="实名状态"
              clearable
              style="width: 200px"
            />
            <n-select
              v-model:value="filters.status"
              :options="statusOptions"
              placeholder="账户状态"
              clearable
              style="width: 200px"
            />
            <n-select
              v-model:value="sortOptions.key"
              :options="sortFieldOptions"
              placeholder="排序字段"
              clearable
              style="width: 150px"
            />
            <n-select
              v-model:value="sortOptions.order"
              :options="sortOrderOptions"
              placeholder="排序方式"
              clearable
              style="width: 120px"
            />
          </n-space>

          <n-space v-else vertical :size="8" style="width: 100%">
            <n-grid :cols="2" :x-gap="8">
              <n-grid-item>
                <n-select
                  v-model:value="filters.group"
                  :options="groupOptions"
                  placeholder="用户组"
                  clearable
                  style="width: 100%"
                />
              </n-grid-item>
              <n-grid-item>
                <n-select
                  v-model:value="filters.isRealname"
                  :options="realnameOptions"
                  placeholder="实名状态"
                  clearable
                  style="width: 100%"
                />
              </n-grid-item>
            </n-grid>
            <n-grid :cols="3" :x-gap="8">
              <n-grid-item>
                <n-select
                  v-model:value="filters.status"
                  :options="statusOptions"
                  placeholder="账户状态"
                  clearable
                  style="width: 100%"
                />
              </n-grid-item>
              <n-grid-item>
                <n-select
                  v-model:value="sortOptions.key"
                  :options="sortFieldOptions"
                  placeholder="排序字段"
                  clearable
                  style="width: 100%"
                />
              </n-grid-item>
              <n-grid-item>
                <n-select
                  v-model:value="sortOptions.order"
                  :options="sortOrderOptions"
                  placeholder="排序方式"
                  clearable
                  style="width: 100%"
                />
              </n-grid-item>
            </n-grid>
          </n-space>

          <div class="table-container">
            <n-data-table
              :columns="columns"
              :data="users"
              :loading="loading"
              :pagination="false"
              :scroll-x="900"
            />
          </div>

          <div style="display: flex; justify-content: right">
            <n-pagination
              v-model:page="pagination.page"
              v-model:page-size="pagination.pageSize"
              :item-count="pagination.itemCount"
              :page-count="pagination.pageCount"
              :page-sizes="pagination.pageSizes"
              show-size-picker
              :prefix="pagination.prefix"
            />
          </div>
        </n-space>
      </n-card>

      <n-modal
        v-model:show="showEditModal"
        preset="card"
        title="编辑用户"
        :style="modalStyle"
      >
        <n-form
          ref="formRef"
          :model="editForm"
          :rules="rules"
          label-placement="left"
          label-width="100px"
          require-mark-placement="right-hanging"
        >
          <n-collapse
            v-model:expanded-names="expandedNames"
            accordion
            :bordered="false"
          >
            <n-collapse-item title="基本信息" name="base">
              <n-grid :cols="2" :x-gap="20" :y-gap="8" responsive="screen">
                <n-grid-item span="2">
                  <n-form-item label="用户名" path="username">
                    <n-input :value="editForm.username" disabled />
                  </n-form-item>
                </n-grid-item>
                <n-grid-item span="2">
                  <n-form-item label="邮箱" path="email">
                    <n-input :value="editForm.email" disabled />
                  </n-form-item>
                </n-grid-item>
                <n-grid-item>
                  <n-form-item label="用户组" path="group">
                    <n-select
                      v-model:value="editForm.group"
                      :options="groupOptions"
                      placeholder="请选择用户组"
                      clearable
                    />
                  </n-form-item>
                </n-grid-item>
                <n-grid-item>
                  <n-form-item label="账户状态" path="status">
                    <n-select
                      v-model:value="editForm.status"
                      :options="statusOptions"
                      placeholder="请选择账户状态"
                      clearable
                    />
                  </n-form-item>
                </n-grid-item>
                <n-grid-item>
                  <n-form-item label="实名状态" path="isRealname">
                    <n-switch v-model:value="editForm.is_realname" />
                  </n-form-item>
                </n-grid-item>
                <n-grid-item>
                  <n-form-item label="验证码次数" path="remainder">
                    <n-input-number
                      v-model:value="editForm.remainder"
                      :min="0"
                      placeholder="请输入验证码次数"
                      style="width: 100%"
                    >
                      <template #suffix>次</template>
                    </n-input-number>
                  </n-form-item>
                </n-grid-item>
              </n-grid>
            </n-collapse-item>
            <n-collapse-item title="资源限制" name="resource">
              <n-grid :cols="2" :x-gap="20" :y-gap="8" responsive="screen">
                <n-grid-item>
                  <n-form-item label="流量限制" path="traffic">
                    <n-input-number
                      v-model:value="editForm.traffic"
                      :min="0"
                      placeholder="请输入流量限制"
                      style="width: 100%"
                    >
                      <template #suffix>GB</template>
                    </n-input-number>
                  </n-form-item>
                </n-grid-item>
                <n-grid-item>
                  <n-form-item label="隧道数量" path="proxies">
                    <n-input-number
                      v-model:value="editForm.proxies"
                      :min="0"
                      placeholder="请输入隧道数量"
                      style="width: 100%"
                    >
                      <template #suffix>个</template>
                    </n-input-number>
                  </n-form-item>
                </n-grid-item>
              </n-grid>
            </n-collapse-item>
            <n-collapse-item title="带宽设置" name="bandwidth">
              <n-grid :cols="2" :x-gap="20" :y-gap="8" responsive="screen">
                <n-grid-item>
                  <n-form-item label="出站带宽" path="out_limit">
                    <n-input-number
                      v-model:value="editForm.out_limit"
                      :min="0"
                      placeholder="请输入出站带宽"
                      style="width: 100%"
                    >
                      <template #suffix>Mbps</template>
                    </n-input-number>
                  </n-form-item>
                </n-grid-item>
                <n-grid-item>
                  <n-form-item label="入站带宽" path="in_limit">
                    <n-input-number
                      v-model:value="editForm.in_limit"
                      :min="0"
                      placeholder="请输入入站带宽"
                      style="width: 100%"
                    >
                      <template #suffix>Mbps</template>
                    </n-input-number>
                  </n-form-item>
                </n-grid-item>
              </n-grid>
            </n-collapse-item>
            <n-collapse-item title="海外带宽设置" name="overseas">
              <n-grid :cols="2" :x-gap="20" :y-gap="8" responsive="screen">
                <n-grid-item>
                  <n-form-item label="海外出站" path="no_cn_out_limit">
                    <n-input-number
                      v-model:value="editForm.no_cn_out_limit"
                      :min="0"
                      placeholder="请输入海外出站带宽"
                      style="width: 100%"
                    >
                      <template #suffix>Mbps</template>
                    </n-input-number>
                  </n-form-item>
                </n-grid-item>
                <n-grid-item>
                  <n-form-item label="海外入站" path="no_cn_in_limit">
                    <n-input-number
                      v-model:value="editForm.no_cn_in_limit"
                      :min="0"
                      placeholder="请输入海外入站带宽"
                      style="width: 100%"
                    >
                      <template #suffix>Mbps</template>
                    </n-input-number>
                  </n-form-item>
                </n-grid-item>
              </n-grid>
            </n-collapse-item>
          </n-collapse>
        </n-form>

        <template #footer>
          <n-space justify="end">
            <n-button size="small" @click="showEditModal = false"
              >取消</n-button
            >
            <n-button
              type="primary"
              size="small"
              :loading="submitting"
              @click="handleEditSubmit"
            >
              确定
            </n-button>
          </n-space>
        </template>
      </n-modal>

      <n-modal
        v-model:show="showBanReasonModal"
        preset="dialog"
        :title="isUnbanning ? '请输入解封原因' : '请输入封禁原因'"
      >
        <n-text> 输入封禁/解封原因（该原因会发送邮件给用户） </n-text>
        <n-input
          style="margin-top: 16px"
          v-model:value="banReason"
          type="textarea"
          :placeholder="isUnbanning ? '请填写解封原因' : '请填写封禁原因'"
          :autosize="{ minRows: 3, maxRows: 5 }"
        />
        <template #action>
          <n-button @click="showBanReasonModal = false">取消</n-button>
          <n-button
            type="primary"
            :disabled="!banReason.trim()"
            @click="submitBanReason"
          >
            确定
          </n-button>
        </template>
      </n-modal>

      <n-modal
        v-model:show="showEditReasonModal"
        preset="dialog"
        title="请输入修改账户状态原因"
      >
        <n-input
          v-model:value="editReason"
          type="textarea"
          placeholder="请填写原因"
          :autosize="{ minRows: 3, maxRows: 5 }"
        />
        <template #action>
          <n-button @click="showEditReasonModal = false">取消</n-button>
          <n-button
            type="primary"
            :disabled="!editReason.trim()"
            @click="submitEditReason"
          >
            确定
          </n-button>
        </template>
      </n-modal>
    </div>
  </SecureArea>
</template>

<script lang="ts" setup>
import { ref, h, computed, onMounted, nextTick, type Ref, watch } from 'vue'
import {
  NSpace,
  NButton,
  useMessage,
  NTag,
  type SelectOption,
  type DataTableColumns,
  type FormInst,
  type FormRules,
} from 'naive-ui'
import { Search } from '@vicons/ionicons5'
import SecureArea from '@/components/SecureArea.vue'
import { adminApi } from '@/net'
import type { User } from '@/net/admin/type'

const message = useMessage()

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

watch(
  [() => pagination.value.page, () => pagination.value.pageSize],
  () => {
    loadData()
  },
  { deep: true },
)

const showEditModal = ref(false)
const expandedNames = ref<string[]>(['base'])
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

let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

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

watch([() => pagination.value.page, () => pagination.value.pageSize], () => {
  loadData()
})

const modalStyle = computed(() => ({
  width: window.innerWidth <= 768 ? '95vw' : '600px',
  maxWidth: '95vw',
}))
</script>

<style lang="scss" scoped>
:deep(.ninput-number) {
  width: 100%;
}

@media (max-width: 768px) {
  :deep(.ncard .ncard-header) {
    padding: 16px 12px;
    .ncard-header__main {
      font-size: 16px;
    }
  }
  :deep(.ncard .ncard-content) {
    padding: 12px;
  }
  :deep(.ndata-table) {
    font-size: 12px;
    .ndata-table-th,
    .ndata-table-td {
      padding: 8px 4px;
    }
  }
  :deep(.nform-item) {
    margin-bottom: 16px;
  }
  :deep(.nmodal .ncard) {
    margin: 16px 8px;
  }
  :deep(.nmodal .ncard .ncard-header) {
    padding: 16px;
  }
  :deep(.nmodal .ncard .ncard-content) {
    padding: 16px;
  }
  :deep(.nbutton) {
    min-height: 32px;
  }
}

@media (max-width: 480px) {
  .table-container {
    padding: 4px;
  }
  :deep(.ndata-table) {
    font-size: 11px;
  }
  :deep(.nmodal .ncard) {
    margin: 8px 4px;
  }
}
</style>
