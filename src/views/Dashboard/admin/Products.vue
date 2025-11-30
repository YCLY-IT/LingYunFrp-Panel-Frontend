<template>
  <div>
    <NCard title="产品管理">
      <NSpace vertical>
        <div class="product-sort-row">
          <n-select
            v-model:value="sortOptions.key"
            :options="sortFieldOptions"
            placeholder="排序字段"
            clearable
            class="product-sort-item"
            @update:value="handleSortFieldChange"
          />
          <n-select
            v-model:value="sortOptions.order"
            :options="sortOrderOptions"
            placeholder="排序方式"
            clearable
            class="product-sort-item"
            @update:value="handleSortOrderChange"
          />
          <n-button
            type="primary"
            @click="openAddModal"
            class="product-sort-btn"
            size="medium"
          >
            添加产品
          </n-button>
        </div>
        <div class="table-container">
          <NDataTable
            remote
            :columns="productColumns"
            :data="sortedProductsData"
            :loading="loading"
            :pagination="{ pageSize: 10 }"
          />
        </div>
      </NSpace>
    </NCard>

    <NModal
      v-model:show="showAddModal"
      preset="dialog"
      title="添加产品"
      :style="modalStyle"
    >
      <NForm
        ref="addFormRef"
        :model="formValue"
        :rules="productRules"
        style="padding-top: 12px; padding-bottom: 12px"
      >
        <NFormItem label="分组" path="type">
          <NSelect
            v-model:value="formValue.type"
            :options="groupsOptions"
            placeholder="请选择产品分组"
          />
        </NFormItem>
        <NFormItem label="名称" path="name">
          <NInput v-model:value="formValue.name" placeholder="请输入产品名称" />
        </NFormItem>
        <NFormItem label="描述" path="desc">
          <NInput
            type="textarea"
            v-model:value="formValue.desc"
            placeholder="请输入产品描述"
          />
        </NFormItem>
        <NFormItem label="价格" path="price">
          <NInputNumber
            v-model:value="formValue.price"
            placeholder="请输入产品价格"
          />
        </NFormItem>
        <NFormItem label="积分价格" path="pointPrice">
          <NInputNumber
            v-model:value="formValue.pointPrice"
            placeholder="请输入积分价格"
          />
        </NFormItem>
        <NFormItem label="是否为永久" path="isPermanent">
          <NSwitch v-model:value="formValue.isPermanent">
            <template #on>是</template>
            <template #off>否</template>
          </NSwitch>
        </NFormItem>
        <NFormItem label="支付方式" path="payMethods">
          <NCheckboxGroup v-model:value="formValue.payMethods">
            <NSpace>
              <NCheckbox value="points">积分支付</NCheckbox>
              <NCheckbox value="money">金钱支付</NCheckbox>
            </NSpace>
          </NCheckboxGroup>
        </NFormItem>
      </NForm>
      <template #action>
        <NButton @click="closeModal('add')">取消</NButton>
        <NButton type="primary" @click="handleSubmit">确定</NButton>
      </template>
    </NModal>

    <NModal
      v-model:show="showEditModal"
      preset="dialog"
      title="编辑产品"
      :style="modalStyle"
    >
      <NForm
        ref="editFormRef"
        :model="formValue"
        :rules="productRules"
        style="padding-top: 12px; padding-bottom: 12px"
      >
        <NFormItem label="分组" path="type">
          <NSelect
            v-model:value="formValue.type"
            :options="groupsOptions"
            placeholder="请选择产品分组"
          />
        </NFormItem>
        <NFormItem label="名称" path="name">
          <NInput v-model:value="formValue.name" placeholder="请输入产品名称" />
        </NFormItem>
        <NFormItem label="描述" path="desc">
          <NInput
            type="textarea"
            v-model:value="formValue.desc"
            placeholder="请输入产品描述"
          />
        </NFormItem>
        <NFormItem label="价格" path="price">
          <NInputNumber
            v-model:value="formValue.price"
            placeholder="请输入产品价格"
          />
        </NFormItem>
        <NFormItem label="积分价格" path="pointPrice">
          <NInputNumber
            v-model:value="formValue.pointPrice"
            placeholder="请输入积分价格"
          />
        </NFormItem>
        <NFormItem label="是否为永久" path="isPermanent">
          <NSwitch v-model:value="formValue.isPermanent">
            <template #on>是</template>
            <template #off>否</template>
          </NSwitch>
        </NFormItem>
        <NFormItem label="支付方式" path="payMethods">
          <NCheckboxGroup v-model:value="formValue.payMethods">
            <NSpace>
              <NCheckbox value="points">积分支付</NCheckbox>
              <NCheckbox value="money">金钱支付</NCheckbox>
            </NSpace>
          </NCheckboxGroup>
        </NFormItem>
      </NForm>
      <template #action>
        <NButton @click="closeModal('edit')">取消</NButton>
        <NButton type="primary" @click="handleSubmit">确定</NButton>
      </template>
    </NModal>
  </div>
</template>

<script lang="ts" setup>
import { h, onMounted, ref, watch, computed } from 'vue'
import {
  NButton,
  NCard,
  NDataTable,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NModal,
  NSelect,
  NSpace,
  NCheckbox,
  NCheckboxGroup,
  NTag,
  useMessage,
  DataTableColumns,
  FormInst,
  FormRules,
} from 'naive-ui'
import { adminApi } from '@/net'
import { Group, Product } from '@/types'

const message = useMessage()
const loading = ref(false)

// 表单相关
const addFormRef = ref<FormInst | null>(null)
const editFormRef = ref<FormInst | null>(null)
const formValue = ref<Product>({
  id: 0,
  type: '',
  name: '',
  desc: '',
  isPermanent: false,
  price: 0,
  pointPrice: 0,
  payMethods: [],
  payMethod: '',
  isPoint: false,
  selectedAmount: 0,
})

const mode = ref<'add' | 'edit'>('add')
const currentProduct = ref<Product | null>(null)
const productsData = ref<Product[]>([])
const groupsData = ref<Group[]>([])
const groupsOptions = ref<{ label: string; value: string }[]>([])
const showAddModal = ref(false)
const showEditModal = ref(false)

const modalStyle = computed(() => {
  const isMobile = window.innerWidth <= 768
  return {
    width: isMobile ? '95vw' : '600px',
    maxWidth: '95vw',
  }
})

const sortFieldOptions = [
  { label: 'ID', value: 'id' },
  { label: '分组', value: 'type' },
  { label: '名称', value: 'name' },
  { label: '价格', value: 'price' },
  { label: '积分价格', value: 'pointPrice' },
  { label: '支付方式', value: 'payMethod' },
]
const sortOrderOptions = [
  { label: '升序', value: 'asc' },
  { label: '降序', value: 'desc' },
]
const sortOptions = ref({ key: 'id', order: 'asc' })

const sortedProductsData = computed(() => {
  let sorted = [...productsData.value]
  if (sortOptions.value.key && sortOptions.value.order) {
    sorted = sorted.sort((a, b) => {
      let aValue: any, bValue: any
      switch (sortOptions.value.key) {
        case 'id':
          aValue = a.id
          bValue = b.id
          break
        case 'type':
          aValue = a.type
          bValue = b.type
          break
        case 'name':
          aValue = a.name
          bValue = b.name
          break
        case 'price':
          aValue = a.price
          bValue = b.price
          break
        case 'pointPrice':
          aValue = a.pointPrice
          bValue = b.pointPrice
          break
        case 'payMethod':
          aValue = a.payMethod
          bValue = b.payMethod
          break
        default:
          return 0
      }
      // 主字段相同用ID次级排序
      if (aValue === bValue) {
        return sortOptions.value.order === 'asc' ? a.id - b.id : b.id - a.id
      }
      if (sortOptions.value.order === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
      }
    })
  }
  return sorted
})

const handleSortFieldChange = () => {}
const handleSortOrderChange = () => {}

// 过滤分组（排除 user 和 admin）
watch(
  groupsData,
  (newGroups) => {
    groupsOptions.value = newGroups
      .filter((group) => !['user', 'admin'].includes(group.name))
      .map((group) => ({
        label: group.friendlyName,
        value: group.name,
      }))
  },
  { immediate: true },
)

// 表单验证规则
// 将原有 productRules 替换为：
const productRules: FormRules = {
  type: {
    required: true,
    message: '请选择产品分组',
    trigger: ['blur', 'change'],
  },
  name: {
    required: true,
    message: '请输入产品名称',
    trigger: ['blur', 'input'],
  },
  desc: {
    required: true,
    message: '请输入产品描述',
    trigger: ['blur', 'input'],
  },
  price: {
    required: true,
    type: 'number' as const,
    message: '请输入产品价格',
    trigger: ['blur', 'input'],
  },
  pointPrice: {
    required: true,
    type: 'number' as const,
    message: '请输入积分价格',
    trigger: ['blur', 'input'],
  },
  payMethods: {
    required: true,
    type: 'array' as const,
    message: '请选择至少一种支付方式',
    trigger: ['blur', 'change'],
  },
} satisfies FormRules

// 表格列定义
const productColumns: DataTableColumns<Product> = [
  { title: 'ID', key: 'id' },
  { title: '分组', key: 'type' },
  { title: '名称', key: 'name' },
  { title: '描述', key: 'desc' },
  {
    title: '价格',
    key: 'price',
    render: (row) => h('span', `${row.price} 元`),
  },
  {
    title: '积分价格',
    key: 'pointPrice',
    render: (row) => h('span', `${row.pointPrice} 积分`),
  },
  {
    title: '支付方式',
    key: 'pay_method',
    render: (row) => {
      if (!row.payMethod) return h('span', '无支付方式')

      const methods = row.payMethod.split(';')
      const colorMap = {
        points: {
          color: '#4caf50',
          textColor: '#fff',
          borderColor: '#4caf50',
        },
        money: {
          color: '#2196f3',
          textColor: '#fff',
          borderColor: '#2196f3',
        },
      }

      return h(
        NSpace,
        { wrap: true },
        {
          default: () =>
            methods.map((method) => {
              const tagType = method === 'points' ? '积分支付' : '金钱支付'
              const tagColor = colorMap[method] || colorMap.points

              return h(
                NTag,
                {
                  style: {
                    marginRight: '8px',
                    marginBottom: '8px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                  },
                  color: tagColor,
                },
                { default: () => tagType },
              )
            }),
        },
      )
    },
  },
  {
    title: '操作',
    key: 'actions',
    render: (row) => {
      return h(NSpace, null, {
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
              onClick: () => handleDeleteProduct(row.id!),
            },
            { default: () => '删除' },
          ),
        ],
      })
    },
  },
]

// 关闭模态框
const closeModal = (modalMode: 'add' | 'edit') => {
  if (modalMode === 'add') {
    showAddModal.value = false
    resetForm()
  } else {
    showEditModal.value = false
    resetForm()
  }
}

// 重置表单
const resetForm = () => {
  formValue.value = {
    id: 0,
    type: '',
    name: '',
    desc: '',
    isPermanent: false,
    price: 0,
    pointPrice: 0,
    payMethods: [],
    payMethod: '',
    isPoint: false,
    selectedAmount: 0,
  }
}

// 打开添加模态框
const openAddModal = () => {
  resetForm()
  showAddModal.value = true
}

// 打开编辑模态框
const openEditModal = (product: Product) => {
  const paymentMethods = product.payMethod ? product.payMethod.split(';') : []
  formValue.value = { ...product, payMethods: paymentMethods }
  mode.value = 'edit'
  currentProduct.value = { ...product }
  showEditModal.value = true
}

// 提交产品表单
const handleSubmit = async () => {
  try {
    await addFormRef.value?.validate()

    const formMode = mode.value
    const formData = {
      type: formValue.value.type,
      name: formValue.value.name,
      desc: formValue.value.desc,
      isPermanent: formValue.value.isPermanent,
      price: formValue.value.price,
      pointPrice: formValue.value.pointPrice,
      payMethod: formValue.value.payMethods.join(';'),
    }

    if (formMode === 'add') {
      const data = await adminApi.createProduct(formData)
      if (data.code === 0) {
        message.success('添加产品成功')
        closeModal('add')
        await fetchProductsInfo()
      } else {
        message.error(data.message || '添加产品失败')
      }
    } else {
      if (!currentProduct.value?.id) return
      const data = await adminApi.updateProduct({
        id: currentProduct.value.id,
        ...formData,
      })
      if (data.code === 0) {
        message.success('修改产品成功')
        closeModal('edit')
        await fetchProductsInfo()
      } else {
        message.error(data.message || '修改产品失败')
      }
    }
  } catch (error: any) {
    message.error(error?.response?.data?.message || '操作失败')
  }
}

// 删除产品
const handleDeleteProduct = async (productId: number) => {
  try {
    const data = await adminApi.deleteProduct(productId)
    if (data.code === 0) {
      message.success('删除产品成功')
      await fetchProductsInfo()
    } else {
      message.error(data.message || '删除产品失败')
    }
  } catch (error: any) {
    message.error(error?.response?.data?.message || '删除产品失败')
  }
}

// 获取产品列表
const fetchProductsInfo = async () => {
  loading.value = true
  try {
    const data = await adminApi.getProductList()
    if (data.code === 0) {
      productsData.value = data.data.products.map((product) => ({
        ...product,
        payMethods: product.payMethod ? product.payMethod.split(';') : [],
        isPoint: false,
        selectedAmount: 0,
      }))
    } else {
      message.error(data.message || '获取产品列表失败')
    }
  } catch (error: any) {
    message.error(error?.response?.data?.message || '获取产品列表失败')
  } finally {
    loading.value = false
  }
}

// 获取分组信息
const fetchGroupsInfo = async () => {
  try {
    const data = await adminApi.getGroupList()
    if (data.code === 0) {
      groupsData.value = data.data.groups || data.data
    } else {
      message.error(data.message || '获取用户组列表失败')
    }
  } catch (error: any) {
    message.error(error?.response?.data?.message || '获取用户组列表失败')
  }
}

onMounted(() => {
  fetchProductsInfo()
  fetchGroupsInfo()
})
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

.product-sort-row {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  width: 100%;
  align-items: stretch;
}
.product-sort-item {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  align-items: center;
}
.product-sort-btn {
  flex: none;
  min-width: unset;
  width: auto;
  padding: 0 40px;
  align-self: center;
}
</style>
