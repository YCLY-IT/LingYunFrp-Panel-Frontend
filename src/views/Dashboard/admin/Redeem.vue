<template>
  <SecureArea>
    <div
      class="flex w-full min-w-0 flex-col gap-5 max-md:[&_.n-pagination]:flex-wrap max-md:[&_.n-pagination]:gap-2 max-md:[&_.n-pagination-prefix]:w-full max-md:[&_.n-pagination-prefix]:text-center max-md:[&_.n-pagination-prefix]:mb-1"
    >
      <NCard title="兑换码管理">
        <NSpace vertical :size="12">
          <div
            class="flex gap-3 max-md:flex-col! max-md:gap-2! max-md:[&_.n-input]:w-full! max-md:[&_.n-input]:flex-none! max-md:[&_.n-select]:w-full!"
          >
            <NInput
              v-model:value="filters.search"
              placeholder="搜索兑换码 / 批次 / 名称 / 备注 / 使用者"
              clearable
              style="flex: 1"
              @update:value="handleSearch"
            >
              <template #prefix>
                <NIcon :component="Search" />
              </template>
            </NInput>
            <NSelect
              v-model:value="filters.type"
              :options="typeOptions"
              placeholder="类型"
              clearable
              style="width: 200px"
              @update:value="handleFilterChange"
            />
            <NInput
              v-model:value="filters.batch"
              placeholder="批次"
              clearable
              style="width: 160px"
              @update:value="handleSearch"
            />
            <NSelect
              v-model:value="filters.status"
              :options="statusOptions"
              placeholder="状态"
              clearable
              style="width: 140px"
              @update:value="handleFilterChange"
            />
          </div>

          <NSpace>
            <NButton type="primary" @click="openGenerateModal">
              批量生成
            </NButton>
            <NButton :loading="exporting" @click="handleExport">导出</NButton>
          </NSpace>

          <div class="w-full min-w-0 overflow-x-auto">
            <NDataTable
              :columns="columns"
              :data="codes"
              :loading="loading"
              :pagination="false"
              striped
              :scroll-x="1250"
            />
          </div>

          <div style="display: flex; justify-content: right">
            <NPagination
              v-model:page="pagination.page"
              v-model:page-size="pagination.pageSize"
              :item-count="pagination.itemCount"
              :page-count="pagination.pageCount"
              :page-sizes="pagination.pageSizes"
              show-size-picker
              @update:page="fetchCodes"
              @update:page-size="handlePageSizeChange"
            >
              <template #prefix="{ itemCount }">
                共 {{ itemCount }} 条
              </template>
            </NPagination>
          </div>
        </NSpace>
      </NCard>

      <!-- 批量生成 -->
      <NModal
        v-model:show="showGenerateModal"
        preset="card"
        title="批量生成兑换码"
        :style="modalStyle"
        :mask-closable="false"
      >
        <NForm
          ref="formRef"
          :model="formValue"
          :rules="rules"
          label-placement="top"
        >
          <NGrid :cols="24" :x-gap="12">
            <NFormItemGi :span="24" label="类型" path="type">
              <NSelect
                v-model:value="formValue.type"
                :options="typeOptions"
                placeholder="请选择类型（商品类型或用户组）"
              />
            </NFormItemGi>
            <NFormItemGi :span="12" label="每张数量" path="num">
              <NInputNumber
                v-model:value="formValue.num"
                :min="1"
                placeholder="每张兑换的数量（份数/月数）"
                style="width: 100%"
              />
            </NFormItemGi>
            <NFormItemGi :span="12" label="生成数量" path="count">
              <NInputNumber
                v-model:value="formValue.count"
                :min="1"
                :max="1000"
                placeholder="1 ~ 1000"
                style="width: 100%"
              />
            </NFormItemGi>
            <NFormItemGi :span="12" label="名称" path="name">
              <NInput
                v-model:value="formValue.name"
                placeholder="如：国庆活动"
              />
            </NFormItemGi>
            <NFormItemGi :span="12" label="批次" path="batch">
              <NInput
                v-model:value="formValue.batch"
                placeholder="如：20261001"
              />
            </NFormItemGi>
            <NFormItemGi :span="12" label="是否永久" path="isPermanent">
              <NSwitch v-model:value="formValue.isPermanent" />
            </NFormItemGi>
            <NFormItemGi :span="12" label="过期时间" path="expiresAt">
              <NDatePicker
                v-model:value="expiresAtValue"
                type="datetime"
                clearable
                :disabled="formValue.isPermanent"
                placeholder="留空则不过期"
                style="width: 100%"
              />
            </NFormItemGi>
            <NFormItemGi :span="24" label="备注" path="remark">
              <NInput
                v-model:value="formValue.remark"
                type="textarea"
                placeholder="如：活动赠送"
                :autosize="{ minRows: 2, maxRows: 4 }"
              />
            </NFormItemGi>
          </NGrid>
        </NForm>
        <template #footer>
          <NSpace justify="end" :size="[8, 8]">
            <NButton @click="showGenerateModal = false">取消</NButton>
            <NButton
              type="primary"
              :loading="generating"
              @click="handleGenerate"
            >
              生成
            </NButton>
          </NSpace>
        </template>
      </NModal>

      <!-- 兑换码结果 -->
      <NModal
        v-model:show="showResultModal"
        preset="card"
        :title="resultTitle"
        :style="modalStyle"
      >
        <NSpace vertical :size="12">
          <NAlert type="success" :bordered="false">
            共 {{ resultCount }} 条{{ resultBatch ? `，批次：${resultBatch}` : '' }}
          </NAlert>
          <NInput
            :value="resultText"
            type="textarea"
            readonly
            :autosize="{ minRows: 8, maxRows: 16 }"
          />
        </NSpace>
        <template #footer>
          <NSpace justify="end" :size="[8, 8]">
            <NButton @click="showResultModal = false">关闭</NButton>
            <NButton @click="handleCopyResult">复制</NButton>
            <NButton type="primary" @click="handleDownloadResult">
              下载 TXT
            </NButton>
          </NSpace>
        </template>
      </NModal>
    </div>
  </SecureArea>
</template>

<script setup lang="ts">
import { ref, h, computed, onMounted } from 'vue'
import {
  NCard,
  NSpace,
  NInput,
  NSelect,
  NButton,
  NIcon,
  NDataTable,
  NPagination,
  NModal,
  NForm,
  NFormItemGi,
  NGrid,
  NInputNumber,
  NSwitch,
  NDatePicker,
  NAlert,
  NTag,
  NTooltip,
  useMessage,
  useDialog,
  type DataTableColumns,
  type FormInst,
  type FormRules,
  type SelectGroupOption,
  type SelectOption,
} from 'naive-ui'
import { Search } from 'lucide-vue-next'
import SecureArea from '@/components/SecureArea.vue'
import { adminApi } from '@/net'
import type {
  CreateRedeemCodesParams,
  ExportRedeemCodesParams,
  RedeemCode,
  SellableProductKind,
} from '@/net/admin/type'

const message = useMessage()
const dialog = useDialog()

const loading = ref(false)
const exporting = ref(false)
const generating = ref(false)
const codes = ref<RedeemCode[]>([])
const typeOptions = ref<SelectGroupOption[]>([])
const showGenerateModal = ref(false)
const showResultModal = ref(false)
const resultTitle = ref('兑换码')
const resultText = ref('')
const resultCount = ref(0)
const resultBatch = ref('')
const formRef = ref<FormInst | null>(null)

const filters = ref({
  search: '',
  type: null as string | null,
  batch: '',
  status: null as number | null,
})

const pagination = ref({
  page: 1,
  pageSize: 10,
  pageCount: 1,
  itemCount: 0,
  pageSizes: [
    { label: '10 条/页', value: 10 },
    { label: '20 条/页', value: 20 },
    { label: '50 条/页', value: 50 },
    { label: '100 条/页', value: 100 },
  ],
})

const formValue = ref({
  type: null as string | null,
  num: 1,
  count: 10,
  name: '',
  batch: '',
  remark: '',
  isPermanent: false,
})

const expiresAtValue = ref<number | null>(null)

const statusOptions = [
  { label: '未使用', value: 0 },
  { label: '已使用', value: 1 },
  { label: '已作废', value: 2 },
]

const rules: FormRules = {
  type: {
    required: true,
    message: '请选择类型',
    trigger: ['blur', 'change'],
  },
  num: {
    required: true,
    type: 'number',
    message: '请输入每张数量',
    trigger: ['blur', 'change'],
  },
  count: {
    required: true,
    type: 'number',
    message: '请输入生成数量',
    trigger: ['blur', 'change'],
  },
}

const modalStyle = computed(() => ({
  width: window.innerWidth <= 768 ? '95vw' : '640px',
  maxWidth: '95vw',
}))

const pad = (value: number) => String(value).padStart(2, '0')

const toDateTimeString = (timestamp: number | null) => {
  if (!timestamp) return undefined
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds(),
  )}`
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return dateStr
  return date.toLocaleString('zh-CN', { hour12: false })
}

const statusTagType = (status: number): 'default' | 'info' | 'success' => {
  if (status === 0) return 'info'
  if (status === 1) return 'success'
  return 'default'
}

const columns: DataTableColumns<RedeemCode> = [
  { title: 'ID', key: 'id', width: 60 },
  {
    title: '兑换码',
    key: 'code',
    minWidth: 200,
    render: (row) =>
      h('div', { style: { lineHeight: '1.4' } }, [
        h('code', { style: { fontSize: '12px' } }, row.code),
        h(
          'div',
          { style: { fontSize: '11px', color: '#999' } },
          `创建 ${formatDate(row.createdAt)}`,
        ),
      ]),
  },
  {
    title: '名称 / 批次',
    key: 'name',
    minWidth: 140,
    render: (row) =>
      `${row.name || '-'}${row.batch ? ` / ${row.batch}` : ''}`,
  },
  {
    title: '类型',
    key: 'typeName',
    minWidth: 100,
    render: (row) => row.typeName || row.type || '-',
  },
  {
    title: '数量',
    key: 'num',
    width: 100,
    render: (row) => `${row.num}${row.isPermanent ? '（永久）' : ''}`,
  },
  {
    title: '状态',
    key: 'statusText',
    width: 90,
    render: (row) =>
      h(
        NTag,
        { size: 'small', type: statusTagType(row.status) },
        { default: () => row.statusText },
      ),
  },
  {
    title: '使用者',
    key: 'usedByName',
    minWidth: 110,
    render: (row) => row.usedByName || row.usedBy || '-',
  },
  {
    title: '兑换 / 到期时间',
    key: 'usedAt',
    minWidth: 175,
    render: (row) =>
      h('div', { style: { fontSize: '12px', lineHeight: '1.6' } }, [
        h('div', null, `兑换：${formatDate(row.usedAt)}`),
        h(
          'div',
          null,
          `到期：${row.expiresAt ? formatDate(row.expiresAt) : '不过期'}`,
        ),
      ]),
  },
  {
    title: '备注',
    key: 'remark',
    minWidth: 120,
    ellipsis: { tooltip: true },
    render: (row) => row.remark || '-',
  },
  {
    title: '操作',
    key: 'actions',
    width: 140,
    fixed: 'right',
    render: (row) => {
      if (row.status === 1) {
        return h(
          NTooltip,
          { trigger: 'hover' },
          {
            trigger: () => h('span', { style: { color: '#999' } }, '已使用'),
            default: () => '已使用的兑换码不可操作',
          },
        )
      }
      const isVoid = row.status === 2
      return h(NSpace, { size: [4, 4] }, {
        default: () => [
          h(
            NButton,
            {
              size: 'small',
              type: isVoid ? 'primary' : 'warning',
              onClick: () => handleChangeStatus(row, isVoid ? 0 : 2),
            },
            { default: () => (isVoid ? '恢复' : '作废') },
          ),
          h(
            NButton,
            {
              size: 'small',
              type: 'error',
              onClick: () => handleDelete(row),
            },
            { default: () => '删除' },
          ),
        ],
      })
    },
  },
]

const fetchCodes = async () => {
  loading.value = true
  try {
    const res = await adminApi.getRedeemCodeList(
      pagination.value.page,
      pagination.value.pageSize,
      filters.value.search || undefined,
      filters.value.type || undefined,
      filters.value.batch || undefined,
      filters.value.status ?? undefined,
    )
    if (res.code === 0 && res.data) {
      codes.value = res.data.list || []
      pagination.value.itemCount = res.data.total || 0
      pagination.value.pageCount = res.data.totalPages || 1
    } else {
      codes.value = []
      message.error(res.message || '获取兑换码列表失败')
    }
  } catch (error: any) {
    codes.value = []
    message.error(error?.message || '获取兑换码列表失败')
  } finally {
    loading.value = false
  }
}

let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

const handleSearch = () => {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    pagination.value.page = 1
    fetchCodes()
  }, 300)
}

const handleFilterChange = () => {
  pagination.value.page = 1
  fetchCodes()
}

const handlePageSizeChange = (size: number) => {
  pagination.value.pageSize = size
  pagination.value.page = 1
  fetchCodes()
}

const fetchTypes = async () => {
  const buildOptions = (
    groupItems: SelectOption[],
    resourceItems: SelectOption[],
  ) => {
    const options: SelectGroupOption[] = []
    if (groupItems.length) {
      options.push({
        type: 'group',
        key: 'group',
        label: '用户组',
        children: groupItems,
      })
    }
    if (resourceItems.length) {
      options.push({
        type: 'group',
        key: 'resource',
        label: '商品类型',
        children: resourceItems,
      })
    }
    return options
  }

  try {
    const info = await adminApi.getSellableProductKinds()
    if (info.code === 0 && info.data?.kinds?.length) {
      const toOption = (item: SellableProductKind): SelectOption => ({
        label: item.name ? `${item.name}（${item.code}）` : item.code,
        value: item.code,
      })
      typeOptions.value = buildOptions(
        info.data.kinds
          .filter((item) => item.category === 'group')
          .map(toOption),
        info.data.kinds
          .filter((item) => item.category === 'resource')
          .map(toOption),
      )
      return
    }
  } catch {
    // 接口不可用时走兜底
  }

  try {
    const [kindsRes, groupsRes] = await Promise.all([
      adminApi.getProductKinds(),
      adminApi.getGroupList(),
    ])
    const resourceItems: SelectOption[] =
      kindsRes.code === 0
        ? (kindsRes.data?.kinds || []).map((item: any) => ({
            label: item.name ? `${item.name}（${item.code}）` : item.code,
            value: item.code,
          }))
        : []
    const groups: any[] =
      groupsRes.code === 0
        ? (groupsRes.data as any)?.groups || (groupsRes.data as any) || []
        : []
    const groupItems: SelectOption[] = groups.map((group: any) => ({
      label: group.friendlyName
        ? `${group.friendlyName}（${group.name}）`
        : group.name,
      value: group.name,
    }))
    typeOptions.value = buildOptions(groupItems, resourceItems)
  } catch (error: any) {
    message.error(error?.message || '获取类型列表失败')
  }
}

const openGenerateModal = () => {
  formValue.value = {
    type: filters.value.type,
    num: 1,
    count: 10,
    name: '',
    batch: filters.value.batch || '',
    remark: '',
    isPermanent: false,
  }
  expiresAtValue.value = null
  showGenerateModal.value = true
}

const handleGenerate = async () => {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  const params: CreateRedeemCodesParams = {
    type: formValue.value.type as string,
    num: formValue.value.num,
    count: formValue.value.count,
    name: formValue.value.name || undefined,
    batch: formValue.value.batch || undefined,
    remark: formValue.value.remark || undefined,
    isPermanent: formValue.value.isPermanent,
    expiresAt:
      formValue.value.isPermanent || !expiresAtValue.value
        ? undefined
        : toDateTimeString(expiresAtValue.value),
  }

  generating.value = true
  try {
    const res = await adminApi.createRedeemCodes(params)
    if (res.code === 0 && res.data) {
      showGenerateModal.value = false
      resultTitle.value = '生成成功'
      resultText.value = res.data.text || (res.data.codes || []).join('\n')
      resultCount.value = res.data.count || 0
      resultBatch.value = res.data.batch || ''
      showResultModal.value = true
      message.success('生成成功')
      pagination.value.page = 1
      await fetchCodes()
    } else {
      message.error(res.message || '生成失败')
    }
  } catch (error: any) {
    message.error(error?.message || '生成失败')
  } finally {
    generating.value = false
  }
}

const handleExport = async () => {
  const params: ExportRedeemCodesParams = {
    type: filters.value.type || undefined,
    batch: filters.value.batch || undefined,
    status: filters.value.status ?? undefined,
  }

  exporting.value = true
  try {
    const res = await adminApi.exportRedeemCodes(params)
    if (res.code === 0 && res.data) {
      resultTitle.value = '导出结果'
      resultText.value = res.data.text || (res.data.codes || []).join('\n')
      resultCount.value = res.data.count || 0
      resultBatch.value = filters.value.batch || ''
      showResultModal.value = true
    } else {
      message.error(res.message || '导出失败')
    }
  } catch (error: any) {
    message.error(error?.message || '导出失败')
  } finally {
    exporting.value = false
  }
}

const handleCopyResult = async () => {
  try {
    await navigator.clipboard.writeText(resultText.value)
    message.success('已复制到剪贴板')
  } catch {
    message.error('复制失败，请手动选择复制')
  }
}

const handleDownloadResult = () => {
  const blob = new Blob([resultText.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `redeem-codes-${resultBatch.value || Date.now()}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const handleChangeStatus = (row: RedeemCode, status: number) => {
  const isVoid = status === 2
  dialog.warning({
    title: isVoid ? '作废兑换码' : '恢复兑换码',
    content: `确定要${isVoid ? '作废' : '恢复'}兑换码「${row.code}」吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const res = await adminApi.updateRedeemCodeStatus(row.id, status)
        if (res.code === 0) {
          message.success(isVoid ? '作废成功' : '恢复成功')
          await fetchCodes()
        } else {
          message.error(res.message || '操作失败')
        }
      } catch (error: any) {
        message.error(error?.message || '操作失败')
      }
    },
  })
}

const handleDelete = (row: RedeemCode) => {
  dialog.warning({
    title: '删除兑换码',
    content: `确定要删除兑换码「${row.code}」吗？此操作不可恢复。`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const res = await adminApi.deleteRedeemCode(row.id)
        if (res.code === 0) {
          message.success('删除成功')
          await fetchCodes()
        } else {
          message.error(res.message || '删除失败')
        }
      } catch (error: any) {
        message.error(error?.message || '删除失败')
      }
    },
  })
}

onMounted(() => {
  fetchTypes()
  fetchCodes()
})
</script>
