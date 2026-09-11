<template>
  <div>
    <div class="kind-toolbar">
      <n-button type="primary" size="medium" @click="openAddModal">
        <template #icon>
          <n-icon><AddOutline /></n-icon>
        </template>
        添加类型
      </n-button>
      <n-button size="medium" @click="fetchKinds">刷新</n-button>
    </div>

    <n-alert type="info" :show-icon="true" style="margin-bottom: 12px">
      商品类型的「标识」即创建商品时的
      type，发放规则决定购买后写入哪张表的哪一列。
    </n-alert>

    <div class="table-container">
      <n-data-table
        remote
        :columns="kindColumns"
        :data="kindsData"
        :loading="loading"
        :pagination="{ pageSize: 10 }"
        :scroll-x="900"
      />
    </div>

    <n-modal
      v-model:show="showModal"
      preset="dialog"
      :title="mode === 'add' ? '添加商品类型' : '编辑商品类型'"
      style="width: 600px; max-width: 90vw"
    >
      <n-form
        ref="formRef"
        :model="formValue"
        :rules="kindRules"
        label-placement="left"
        label-width="110px"
        style="margin-top: 16px"
      >
        <n-form-item label="类型标识" path="code">
          <n-input
            v-model:value="formValue.code"
            placeholder="只能包含字母、数字和下划线"
            :disabled="mode === 'edit'"
            clearable
          />
        </n-form-item>
        <n-form-item label="展示名称" path="name">
          <n-input
            v-model:value="formValue.name"
            placeholder="请输入展示名称"
            clearable
          />
        </n-form-item>
        <n-form-item label="发放规则" path="grantCode">
          <n-select
            v-model:value="formValue.grantCode"
            :options="grantOptions"
            placeholder="请选择发放规则（商品标识）"
            filterable
            clearable
          />
        </n-form-item>
        <n-form-item v-if="!grantOptions.length" label=" " :show-label="false">
          <n-text type="warning" depth="3">
            暂无可选择的发放规则，请先到「发放规则」页添加商品标识（grantCode）
          </n-text>
        </n-form-item>
        <n-form-item label="排序" path="sort">
          <n-input-number
            v-model:value="formValue.sort"
            placeholder="数字越小越靠前"
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
import { h, onMounted, ref } from 'vue'
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
import type { ProductGrant, ProductKind } from '@/net/admin/type'

const emit = defineEmits<{ (e: 'updated'): void }>()

const message = useMessage()
const dialog = useDialog()

const loading = ref(false)
const submitting = ref(false)
const showModal = ref(false)
const mode = ref<'add' | 'edit'>('add')
const currentId = ref<number | null>(null)
const formRef = ref<FormInst | null>(null)

const kindsData = ref<ProductKind[]>([])
const grantsData = ref<ProductGrant[]>([])

const formValue = ref({
  code: '',
  name: '',
  grantCode: '',
  sort: 0,
})

const grantOptions = ref<{ label: string; value: string }[]>([])

const kindRules: FormRules = {
  code: [
    {
      required: true,
      message: '请输入类型标识',
      trigger: ['blur', 'input'],
    },
    {
      validator: (_rule, value: string) => /^[A-Za-z0-9_]+$/.test(value || ''),
      message: '商品类型标识只能包含字母、数字和下划线',
      trigger: ['blur', 'input'],
    },
  ],
  name: {
    required: true,
    message: '请输入展示名称',
    trigger: ['blur', 'input'],
  },
  grantCode: {
    required: true,
    message: '请选择发放规则',
    trigger: ['blur', 'change'],
  },
} satisfies FormRules

const kindColumns: DataTableColumns<ProductKind> = [
  { title: 'ID', key: 'id', width: 70 },
  { title: '标识', key: 'code' },
  { title: '名称', key: 'name' },
  {
    title: '发放规则',
    key: 'grantCode',
    render: (row) =>
      h(
        NTag,
        { size: 'small', bordered: false, type: 'info' },
        { default: () => row.grantCode },
      ),
  },
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
  formValue.value = { code: '', name: '', grantCode: '', sort: 0 }
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

const openEditModal = (row: ProductKind) => {
  mode.value = 'edit'
  currentId.value = row.id
  formValue.value = {
    code: row.code,
    name: row.name,
    grantCode: row.grantCode,
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
      code: formValue.value.code,
      name: formValue.value.name,
      grantCode: formValue.value.grantCode,
      sort: formValue.value.sort ?? 0,
    }

    const data =
      mode.value === 'add'
        ? await adminApi.createProductKind(payload)
        : await adminApi.updateProductKind({
            id: currentId.value!,
            ...payload,
          })

    if (data.code === 0) {
      message.success(mode.value === 'add' ? '添加类型成功' : '修改类型成功')
      closeModal()
      await fetchKinds()
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

const handleDelete = (row: ProductKind) => {
  dialog.warning({
    title: '删除商品类型',
    content: `确定要删除「${row.name}（${row.code}）」吗？`,
    positiveText: '确定删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const data = await adminApi.deleteProductKind(row.id)
        if (data.code === 0) {
          message.success('删除类型成功')
          await fetchKinds()
          emit('updated')
        } else {
          message.error(data.message || '删除类型失败')
        }
      } catch (error: any) {
        message.error(
          error?.message || error?.response?.data?.message || '删除类型失败',
        )
      }
    },
  })
}

const fetchKinds = async () => {
  loading.value = true
  try {
    const data = await adminApi.getProductKinds()
    if (data.code === 0) {
      kindsData.value = (data.data?.kinds || []).map((item: any) => ({
        id: item.id,
        code: item.code,
        name: item.name,
        grantCode: item.grantCode ?? item.grant_code,
        sort: item.sort ?? 0,
      }))
    } else {
      message.error(data.message || '获取商品类型失败')
    }
  } catch (error: any) {
    message.error(
      error?.message || error?.response?.data?.message || '获取商品类型失败',
    )
  } finally {
    loading.value = false
  }
}

const fetchGrants = async () => {
  try {
    const data = await adminApi.getProductGrants()
    if (data.code === 0) {
      grantsData.value = data.data?.grants || []
      const codes = Array.from(
        new Set(grantsData.value.map((item) => item.grantCode)),
      )
      grantOptions.value = codes.map((code) => ({ label: code, value: code }))
    }
  } catch {
    grantOptions.value = []
  }
}

onMounted(() => {
  fetchKinds()
  fetchGrants()
})

defineExpose({ fetchKinds })
</script>

<style lang="scss" scoped>
.kind-toolbar {
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
