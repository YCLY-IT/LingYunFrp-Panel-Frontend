<template>
  <div class="operation-log">
    <NCard title="操作日志管理">
      <NSpace vertical :size="12">
        <div style="display: flex; gap: 12px">
          <NInput
            v-model:value="filters.search"
            placeholder="搜索用户名、操作类型或模块"
            clearable
            style="flex: 1"
          >
            <template #prefix>
              <NIcon :component="Search" />
            </template>
          </NInput>
          <NSelect
            v-model:value="filters.module"
            :options="moduleOptions"
            placeholder="操作模块"
            clearable
            style="width: 180px"
          />
          <NSelect
            v-model:value="filters.status"
            :options="statusOptions"
            placeholder="操作状态"
            clearable
            style="width: 140px"
          />
          <NButton type="error" @click="handleClear">
            <template #icon>
              <NIcon :component="Trash2" />
            </template>
            清空日志
          </NButton>
        </div>

        <div class="table-container">
          <NDataTable
            :columns="columns"
            :data="pagedLogs"
            :loading="loading"
            :pagination="false"
            striped
            :scroll-x="900"
          />
        </div>

        <div style="display: flex; justify-content: right">
          <NPagination
            v-model:page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :item-count="filteredLogs.length"
            :page-sizes="pagination.pageSizes"
            show-size-picker
            @update:page="pagination.page = $event"
            @update:page-size="handlePageSizeChange"
          >
            <template #prefix="{ itemCount }"> 共 {{ itemCount }} 条 </template>
            <template #suffix="{ startIndex, endIndex, pageCount }">
              {{ startIndex + 1 }} - {{ endIndex }} 条 / 共 {{ pageCount }} 页
            </template>
          </NPagination>
        </div>
      </NSpace>
    </NCard>

    <NModal
      v-model:show="showDetailModal"
      preset="card"
      title="日志详情"
      style="width: 600px"
    >
      <NTabs type="line" animated v-if="selectedLog">
        <NTabPane name="basic" tab="基本信息">
          <NDescriptions bordered :column="2">
            <NDescriptionsItem label="ID" :span="1">{{
              selectedLog.id
            }}</NDescriptionsItem>
            <NDescriptionsItem label="用户" :span="1"
              >{{ selectedLog.user_name }} (ID:
              {{ selectedLog.user_id }})</NDescriptionsItem
            >
            <NDescriptionsItem label="操作时间" :span="2">{{
              formatDate(selectedLog.operation_time)
            }}</NDescriptionsItem>
            <NDescriptionsItem label="操作IP" :span="1">{{
              selectedLog.operation_ip
            }}</NDescriptionsItem>
            <NDescriptionsItem label="操作状态" :span="1">
              <NTag
                :type="
                  selectedLog.operation_status === '成功' ? 'success' : 'error'
                "
              >
                {{ selectedLog.operation_status }}
              </NTag>
            </NDescriptionsItem>
            <NDescriptionsItem label="操作类型" :span="1">{{
              selectedLog.operation_type
            }}</NDescriptionsItem>
            <NDescriptionsItem label="操作模块" :span="1">{{
              selectedLog.operation_module
            }}</NDescriptionsItem>
            <NDescriptionsItem label="操作耗时" :span="1"
              >{{ selectedLog.operation_duration }}ms</NDescriptionsItem
            >
            <NDescriptionsItem label="消息" :span="2">{{
              selectedLog.message
            }}</NDescriptionsItem>
          </NDescriptions>
        </NTabPane>
        <NTabPane name="request" tab="请求数据">
          <NDescriptions bordered :column="1">
            <NDescriptionsItem
              label="提交内容"
              v-if="selectedLog.submit_content"
            >
              <pre
                style="
                  background: #f5f5f5;
                  padding: 8px;
                  border-radius: 4px;
                  overflow-x: auto;
                "
                >{{ JSON.stringify(selectedLog.submit_content, null, 2) }}</pre
              >
            </NDescriptionsItem>
            <NDescriptionsItem v-if="!selectedLog.submit_content">
              无提交内容
            </NDescriptionsItem>
          </NDescriptions>
        </NTabPane>
        <NTabPane name="status" tab="状态变更">
          <NDescriptions bordered :column="1">
            <NDescriptionsItem
              label="操作前状态"
              v-if="selectedLog.before_status"
            >
              <pre
                style="
                  background: #f5f5f5;
                  padding: 8px;
                  border-radius: 4px;
                  overflow-x: auto;
                "
                >{{ JSON.stringify(selectedLog.before_status, null, 2) }}</pre
              >
            </NDescriptionsItem>
            <NDescriptionsItem v-if="!selectedLog.before_status">
              无操作前状态
            </NDescriptionsItem>
            <NDescriptionsItem
              label="操作后状态"
              v-if="selectedLog.after_status"
            >
              <pre
                style="
                  background: #f5f5f5;
                  padding: 8px;
                  border-radius: 4px;
                  overflow-x: auto;
                "
                >{{ JSON.stringify(selectedLog.after_status, null, 2) }}</pre
              >
            </NDescriptionsItem>
            <NDescriptionsItem v-if="!selectedLog.after_status">
              无操作后状态
            </NDescriptionsItem>
          </NDescriptions>
        </NTabPane>
      </NTabs>
    </NModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import {
  NCard,
  NSpace,
  NInput,
  NSelect,
  NDataTable,
  NPagination,
  NIcon,
  NButton,
  NModal,
  NDescriptions,
  NDescriptionsItem,
  NTag,
  NTabs,
  NTabPane,
  type DataTableColumns,
  useDialog,
  useMessage,
} from 'naive-ui'
import { Search, Eye, Trash2 } from 'lucide-vue-next'
import {
  getAdminOperationLogList,
  deleteAdminOperationLog,
  clearAdminOperationLog,
} from '@/net/admin/admin'
import type { OperationLog } from '@/net/admin/type'

const dialog = useDialog()
const message = useMessage()
const loading = ref(false)
const logs = ref<OperationLog[]>([])
const showDetailModal = ref(false)
const selectedLog = ref<OperationLog | null>(null)

const filters = ref({
  search: '',
  module: null as string | null,
  status: null as string | null,
})

const pagination = ref({
  page: 1,
  pageSize: 10,
  pageSizes: [
    { label: '10 条/页', value: 10 },
    { label: '20 条/页', value: 20 },
    { label: '50 条/页', value: 50 },
    { label: '100 条/页', value: 100 },
  ],
})

const moduleOptions = [
  { label: '用户管理', value: '用户管理' },
  { label: '节点管理', value: '节点管理' },
  { label: '隧道管理', value: '隧道管理' },
  { label: '系统管理', value: '系统管理' },
  { label: '产品管理', value: '产品管理' },
  { label: '软件管理', value: '软件管理' },
]

const statusOptions = [
  { label: '成功', value: '成功' },
  { label: '失败', value: '失败' },
]

const filteredLogs = computed(() => {
  return logs.value.filter((log) => {
    const searchMatch =
      !filters.value.search ||
      log.user_name
        .toLowerCase()
        .includes(filters.value.search.toLowerCase()) ||
      log.operation_type
        .toLowerCase()
        .includes(filters.value.search.toLowerCase()) ||
      log.operation_module
        .toLowerCase()
        .includes(filters.value.search.toLowerCase())

    const moduleMatch =
      !filters.value.module || log.operation_module === filters.value.module

    const statusMatch =
      !filters.value.status || log.operation_status === filters.value.status

    return searchMatch && moduleMatch && statusMatch
  })
})

const pagedLogs = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return filteredLogs.value.slice(start, end)
})

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

const handlePageSizeChange = (size: number) => {
  pagination.value.pageSize = size
  pagination.value.page = 1
}

const viewDetail = (log: OperationLog) => {
  selectedLog.value = log
  showDetailModal.value = true
}

const handleDelete = (log: OperationLog) => {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除这条日志吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const res = await deleteAdminOperationLog(log.id)
        if (res.code === 0) {
          message.success('删除成功')
          fetchLogs()
        } else {
          message.error(res.message || '删除失败')
        }
      } catch {
        message.error('删除失败')
      }
    },
  })
}

const handleClear = () => {
  dialog.warning({
    title: '确认清空',
    content: '确定要清空所有日志吗？此操作不可恢复！',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const res = await clearAdminOperationLog()
        if (res.code === 0) {
          message.success('清空成功')
          fetchLogs()
        } else {
          message.error(res.message || '清空失败')
        }
      } catch {
        message.error('清空失败')
      }
    },
  })
}

const columns: DataTableColumns<OperationLog> = [
  {
    title: 'ID',
    key: 'id',
    width: 60,
  },
  {
    title: '用户',
    key: 'user_name',
    width: 120,
  },
  {
    title: '操作时间',
    key: 'operation_time',
    width: 180,
    render(row) {
      return formatDate(row.operation_time)
    },
  },
  {
    title: '操作IP',
    key: 'operation_ip',
    width: 130,
  },
  {
    title: '操作类型',
    key: 'operation_type',
    width: 120,
  },
  {
    title: '操作模块',
    key: 'operation_module',
    width: 100,
  },
  {
    title: '状态',
    key: 'operation_status',
    width: 80,
    render(row) {
      return h(
        NTag,
        {
          type: row.operation_status === '成功' ? 'success' : 'error',
          size: 'small',
        },
        { default: () => row.operation_status },
      )
    },
  },
  {
    title: '耗时',
    key: 'operation_duration',
    width: 90,
    render(row) {
      return `${row.operation_duration}ms`
    },
  },
  {
    title: '消息',
    key: 'message',
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    fixed: 'right',
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
                onClick: () => viewDetail(row),
              },
              {
                icon: () => h(NIcon, { component: Eye }),
              },
            ),
            h(
              NButton,
              {
                size: 'small',
                type: 'error',
                onClick: () => handleDelete(row),
              },
              {
                icon: () => h(NIcon, { component: Trash2 }),
              },
            ),
          ],
        },
      )
    },
  },
]

const fetchLogs = async () => {
  loading.value = true
  try {
    const res = await getAdminOperationLogList()
    if (res.code === 0 && res.data) {
      logs.value = (res.data || []).sort((a, b) => b.id - a.id)
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchLogs()
})
</script>

<style scoped lang="scss">
.operation-log {
  padding: 12px;
}

.table-container {
  overflow-x: auto;
}
</style>
