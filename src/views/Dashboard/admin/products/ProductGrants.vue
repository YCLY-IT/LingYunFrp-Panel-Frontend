<template>
  <div>
    <div class="grant-toolbar">
      <n-button type="primary" size="medium" @click="openAddModal">
        <template #icon>
          <n-icon><AddOutline /></n-icon>
        </template>
        添加规则
      </n-button>
      <n-button size="medium" @click="fetchGrants">刷新</n-button>
    </div>

    <n-alert type="warning" :show-icon="true" style="margin-bottom: 12px">
      同一「商品标识」可以配置多条发放目标，购买商品时按排序依次执行；发放目标只能从后端白名单中选择，倍率为每份商品实际增加的数值。
    </n-alert>

    <div class="table-container">
      <n-data-table
        remote
        :columns="grantColumns"
        :data="grantsData"
        :loading="loading"
        :pagination="{ pageSize: 10 }"
        :scroll-x="1100"
      />
    </div>

    <n-modal
      v-model:show="showModal"
      preset="dialog"
      :title="mode === 'add' ? '添加发放规则' : '编辑发放规则'"
      style="width: 600px; max-width: 90vw"
    >
      <n-form
        ref="formRef"
        :model="formValue"
        :rules="grantRules"
        label-placement="left"
        label-width="110px"
        style="margin-top: 16px"
      >
        <n-form-item label="商品标识" path="grantCode">
          <n-input
            v-model:value="formValue.grantCode"
            placeholder="商品标识，如 traffic / proxies"
            clearable
          />
        </n-form-item>
        <n-form-item label="发放目标" path="target">
          <n-select
            v-model:value="formValue.target"
            :options="targetOptions"
            placeholder="请选择发放目标"
            filterable
            clearable
          />
        </n-form-item>
        <n-form-item v-if="selectedTarget" label=" " :show-label="false">
          <n-text depth="3">
            目标表 {{ selectedTarget.table }} · 列 {{ selectedTarget.column }} ·
            条件列 {{ selectedTarget.keyColumn }}（由后端按白名单解析）
          </n-text>
        </n-form-item>
        <n-form-item label="倍率" path="scale">
          <n-input-number
            v-model:value="formValue.scale"
            :min="1"
            placeholder="每份商品增加的数值"
            style="width: 100%"
          />
        </n-form-item>
        <n-form-item label="排序" path="sort">
          <n-input-number
            v-model:value="formValue.sort"
            placeholder="同一标识下的执行顺序"
            style="width: 100%"
          />
        </n-form-item>
      </n-form>
      <template #action>
        <n-space justify="end">
          <n-button size="medium" @click="closeModal">取消</n-button>
          <n-button
            type="primary"
            size="medium"
            :loading="submitting"
            @click="handleSubmit"
          >
            确定
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script lang="ts" setup>
import { computed, h, onMounted, ref } from 'vue'
import {
  NButton,
  NSpace,
  NTag,
  useMessage,
  useDialog,
  DataTableColumns,
  FormInst,
  FormRules,
} from 'naive-ui'
import { AddOutline } from '@vicons/ionicons5'
import { adminApi } from '@/net'
import type { GrantTarget, ProductGrant } from '@/net/admin/type'

const emit = defineEmits<{ (e: 'updated'): void }>()

const message = useMessage()
const dialog = useDialog()

const loading = ref(false)
const submitting = ref(false)
const showModal = ref(false)
const mode = ref<'add' | 'edit'>('add')
const currentId = ref<number | null>(null)
const formRef = ref<FormInst | null>(null)

const grantsData = ref<ProductGrant[]>([])
const targetsData = ref<GrantTarget[]>([])

const formValue = ref({
  grantCode: '',
  target: '',
  scale: 1,
  sort: 0,
})

const targetOptions = ref<{ label: string; value: string }[]>([])

const selectedTarget = computed(() =>
  targetsData.value.find((item) => item.target === formValue.value.target),
)

const grantRules: FormRules = {
  grantCode: {
    required: true,
    message: '请输入商品标识',
    trigger: ['blur', 'input'],
  },
  target: {
    required: true,
    message: '请选择发放目标',
    trigger: ['blur', 'change'],
  },
  scale: [
    {
      required: true,
      type: 'number' as const,
      message: '请输入倍率',
      trigger: ['blur', 'change'],
    },
    {
      validator: (_rule, value: number) => Number(value) > 0,
      message: '倍率必须大于 0',
      trigger: ['blur', 'change'],
    },
  ],
} satisfies FormRules

const grantColumns: DataTableColumns<ProductGrant> = [
  { title: 'ID', key: 'id', width: 70 },
  {
    title: '商品标识',
    key: 'grantCode',
    render: (row) =>
      h(
        NTag,
        { size: 'small', bordered: false, type: 'info' },
        { default: () => row.grantCode },
      ),
  },
  {
    title: '发放目标',
    key: 'target',
    minWidth: 200,
    render: (row) => {
      const hit = targetsData.value.find((item) => item.target === row.target)
      return h(
        'span',
        hit ? `${hit.label}（${row.target}）` : row.target || '-',
      )
    },
  },
  {
    title: '目标表.列',
    key: 'tableColumn',
    minWidth: 200,
    render: (row) => h('span', `${row.tableName}.${row.columnName}`),
  },
  { title: '条件列', key: 'keyColumn', width: 110 },
  { title: '倍率', key: 'scale', width: 90 },
  { title: '排序', key: 'sort', width: 80 },
  {
    title: '操作',
    key: 'actions',
    width: 160,
    render: (row) =>
      h(NSpace, null, {
        default: () => [
          h(
            NButton,
            {
              size: 'small',
              type: 'primary',
              onClick: () => openEditModal(row),
            },
            { default: () => '修改' },
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
      }),
  },
]

const resetForm = () => {
  formValue.value = {
    grantCode: '',
    target: '',
    scale: 1,
    sort: 0,
  }
  currentId.value = null
  formRef.value?.restoreValidation()
}

const closeModal = () => {
  showModal.value = false
  resetForm()
}

const openAddModal = () => {
  mode.value = 'add'
  resetForm()
  showModal.value = true
}

const openEditModal = (row: ProductGrant) => {
  mode.value = 'edit'
  currentId.value = row.id
  formValue.value = {
    grantCode: row.grantCode,
    target: row.target || `${row.tableName}.${row.columnName}`,
    scale: row.scale ?? 1,
    sort: row.sort ?? 0,
  }
  formRef.value?.restoreValidation()
  showModal.value = true
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  submitting.value = true
  try {
    const payload = {
      grantCode: formValue.value.grantCode,
      target: formValue.value.target,
      scale: Number(formValue.value.scale) || 1,
      sort: Number(formValue.value.sort) || 0,
    }

    const data =
      mode.value === 'add'
        ? await adminApi.createProductGrant(payload)
        : await adminApi.updateProductGrant({
            id: currentId.value!,
            ...payload,
          })

    if (data.code === 0) {
      message.success(mode.value === 'add' ? '添加规则成功' : '修改规则成功')
      closeModal()
      await fetchGrants()
      emit('updated')
    } else {
      message.error(data.message || '操作失败')
    }
  } catch (error: any) {
    message.error(
      error?.message || error?.response?.data?.message || '操作失败',
    )
  } finally {
    submitting.value = false
  }
}

const handleDelete = (row: ProductGrant) => {
  dialog.warning({
    title: '删除发放规则',
    content: `确定要删除商品标识「${row.grantCode}」的发放规则（${row.target}）吗？`,
    positiveText: '确定删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const data = await adminApi.deleteProductGrant(row.id)
        if (data.code === 0) {
          message.success('删除规则成功')
          await fetchGrants()
          emit('updated')
        } else {
          message.error(data.message || '删除规则失败')
        }
      } catch (error: any) {
        message.error(
          error?.message || error?.response?.data?.message || '删除规则失败',
        )
      }
    },
  })
}

const fetchGrants = async () => {
  loading.value = true
  try {
    const data = await adminApi.getProductGrants()
    if (data.code === 0) {
      grantsData.value = (data.data?.grants || []).map((item: any) => {
        const target =
          item.target ??
          `${item.tableName ?? item.table_name}.${item.columnName ?? item.column_name}`
        return {
          id: item.id,
          grantCode: item.grantCode ?? item.grant_code,
          target,
          tableName: item.tableName ?? item.table_name,
          columnName: item.columnName ?? item.column_name,
          keyColumn: item.keyColumn ?? item.key_column,
          scale: item.scale,
          sort: item.sort ?? 0,
        }
      })
    } else {
      message.error(data.message || '获取发放规则失败')
    }
  } catch (error: any) {
    message.error(
      error?.message || error?.response?.data?.message || '获取发放规则失败',
    )
  } finally {
    loading.value = false
  }
}

const fetchTargets = async () => {
  try {
    const data = await adminApi.getGrantTargets()
    if (data.code === 0) {
      targetsData.value = data.data?.targets || []
      targetOptions.value = targetsData.value.map((item) => ({
        label: `${item.label}（${item.target}）`,
        value: item.target,
      }))
    }
  } catch {
    targetsData.value = []
    targetOptions.value = []
  }
}

onMounted(() => {
  fetchGrants()
  fetchTargets()
})

defineExpose({ fetchGrants })
</script>

<style lang="scss" scoped>
.grant-toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  :deep(.n-data-table) {
    font-size: 12px;
  }
}
</style>
