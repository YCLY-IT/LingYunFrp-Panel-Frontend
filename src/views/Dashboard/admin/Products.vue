<template>
  <div>
    <NCard title="产品管理">
      <NSpace vertical>
        <NButton type="primary" @click="openAddModal">添加产品</NButton>
        <NDataTable
          remote
          :columns="productColumns"
          :data="productsData"
          :loading="loading"
          :pagination="{ pageSize: 10 }"
        />
      </NSpace>
    </NCard>

    <NModal v-model:show="showAddModal" preset="dialog" title="添加产品">
      <NForm
        ref="addFormRef"
        :model="formValue"
        :rules="productRules"
        style="padding-top: 12px; padding-bottom: 12px;"
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
          <NInput v-model:value="formValue.desc" placeholder="请输入产品描述" />
        </NFormItem>
        <NFormItem label="价格" path="price">
          <NInputNumber v-model:value="formValue.price" placeholder="请输入产品价格" />
        </NFormItem>
        <NFormItem label="积分价格" path="pointPrice">
          <NInputNumber v-model:value="formValue.pointPrice" placeholder="请输入积分价格" />
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
        <NButton type="primary" @click="handleSubmitProduct('add')">确定</NButton>
      </template>
    </NModal>

    <NModal v-model:show="showEditModal" preset="dialog" title="编辑产品">
      <NForm
        ref="editFormRef"
        :model="formValue"
        :rules="productRules"
        style="padding-top: 12px; padding-bottom: 12px;"
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
          <NInput v-model:value="formValue.desc" placeholder="请输入产品描述" />
        </NFormItem>
        <NFormItem label="价格" path="price">
          <NInputNumber v-model:value="formValue.price" placeholder="请输入产品价格" />
        </NFormItem>
        <NFormItem label="积分价格" path="pointPrice">
          <NInputNumber v-model:value="formValue.pointPrice" placeholder="请输入积分价格" />
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
        <NButton type="primary" @click="handleSubmitProduct('edit')">确定</NButton>
      </template>
    </NModal>
  </div>
</template>

<script lang="ts" setup>
import { h, onMounted, ref, watch } from 'vue'
import { 
  NButton, NCard, NDataTable, NForm, NFormItem, NInput, NInputNumber, 
  NModal, NSelect, NSpace, NCheckbox, NCheckboxGroup, NTag, useMessage, 
  DataTableColumns,
  FormInst,
  FormRules
} from 'naive-ui'
import { userApi } from '@/net'
import { accessHandle } from '@/net/base.ts'
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
  selectedAmount: 0
})

const mode = ref<'add' | 'edit'>('add')
const currentProduct = ref<Product | null>(null)
const productsData = ref<Product[]>([])
const groupsData = ref<Group[]>([])
const groupsOptions = ref<{ label: string; value: string }[]>([])
const showAddModal = ref(false)
const showEditModal = ref(false)

// 过滤分组（排除 user 和 admin）
watch(groupsData, (newGroups) => {
  groupsOptions.value = newGroups
    .filter(group => !['user', 'admin'].includes(group.name))
    .map(group => ({
      label: group.friendlyName,
      value: group.name
    }))
}, { immediate: true })

// 表单验证规则
// 将原有 productRules 替换为：
const productRules: FormRules = {
  type: { required: true, message: '请选择产品分组', trigger: ['blur', 'change'] },
  name: { required: true, message: '请输入产品名称', trigger: ['blur', 'input'] },
  desc: { required: true, message: '请输入产品描述', trigger: ['blur', 'input'] },
  price: { 
    required: true,
    type: 'number' as const,
    message: '请输入产品价格',
    trigger: ['blur', 'input']
  },
  pointPrice: {
    required: true,
    type: 'number' as const,
    message: '请输入积分价格',
    trigger: ['blur', 'input']
  },
  payMethods: {
    required: true,
    type: 'array' as const,
    message: '请选择至少一种支付方式',
    trigger: ['blur', 'change']
  }
} satisfies FormRules;

// 表格列定义
const productColumns: DataTableColumns<Product> = [
  { title: 'ID', key: 'id' },
  { title: '分组', key: 'type' },
  { title: '名称', key: 'name' },
  { title: '描述', key: 'desc' },
  { 
    title: '价格', 
    key: 'price', 
    render: row => h('span', `${row.price} 元`) 
  },
  { 
    title: '积分价格', 
    key: 'pointPrice', 
    render: row => h('span', `${row.pointPrice} 积分`) 
  },
  {
    title: '支付方式',
    key: 'pay_method',
    render: row => {
      if (!row.payMethod) return h('span', '无支付方式');
      
      const methods = row.payMethod.split(';');
      const colorMap = {
        points: {
          color: '#4caf50',
          textColor: '#fff',
          borderColor: '#4caf50'
        },
        money: {
          color: '#2196f3',
          textColor: '#fff',
          borderColor: '#2196f3'
        }
      };

      return h(
        NSpace,
        { wrap: true },
        {
          default: () => methods.map(method => {
            const tagType = method === 'points' ? '积分支付' : '金钱支付';
            const tagColor = colorMap[method] || colorMap.points;

            return h(
              NTag,
              {
                style: {
                  marginRight: '8px',
                  marginBottom: '8px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px'
                },
                color: tagColor
              },
              { default: () => tagType }
            );
          })
        }
      );
    }
  },
  {
    title: '操作',
    key: 'actions',
    render: (row) => {
      return h(
        NSpace,
        null,
        {
          default: () => [
            h(
              NButton,
              {
                size: 'small',
                type: 'primary',
                onClick: () => openEditModal(row)
              },
              { default: () => '修改' }
            ),
            h(
              NButton,
              {
                size: 'small',
                type: 'error',
                onClick: () => handleDeleteProduct(row.id!)
              },
              { default: () => '删除' }
            )
          ]
        }
      )
    }
  }
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
    selectedAmount: 0
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
const handleSubmitProduct = async (formMode: 'add' | 'edit') => {
  let formRef = formMode === 'add' ? addFormRef : editFormRef
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    
    const formData = { ...formValue.value }
    formData.payMethod = formValue.value.payMethods.join(';')

    const apiPath = formMode === 'add'
      ? '/admin/product/create'
      : `/admin/product/update/${currentProduct.value?.id}`

    userApi.post(apiPath, formData, accessHandle(), (data) => {
      if (data.code === 0) {
        message.success(`${formMode === 'add' ? '添加' : '修改'}产品成功`)
        closeModal(formMode)
        fetchProducts()
      } else {
        message.error(data.message)
      }
    })
  } catch (error) {
    message.error('请填写完整信息')
  }
}

// 删除产品
const handleDeleteProduct = async (productId: number) => {
  try {
    userApi.post(`/admin/product/delete/${productId}`, {}, accessHandle(), (data) => {
      if (data.code === 0) {
        message.success('删除产品成功')
        fetchProducts()
      } else {
        message.error(data.message)
      }
    })
  } catch (error) {
    message.error('删除产品失败')
  }
}

// 获取产品列表
const fetchProducts = async () => {
  loading.value = true
  try {
    userApi.get("/user/info/product", accessHandle(), (data) => {
      if (data.code === 0) {
        productsData.value = data.data.products.map(product => ({
          ...product,
          pointPrice: product.pointPrice || 0
        }))
      } else {
        message.error(data.message)
      }
    }, (error) => {
      message.error(error || '获取产品列表失败')
    })
  } catch (error) {
    message.error('获取产品列表失败')
  } finally {
    loading.value = false
  }
}

// 获取分组信息
const fetchGroupsInfo = async () => {
  try {
    userApi.get("/user/info/groups", accessHandle(), (data) => {
      if (data.code === 0) {
        groupsData.value = data.data.groups
      } else {
        message.error(data.message)
      }
    }, () => {
      message.error('获取分组列表失败')
    })
  } catch (error) {
    message.error('获取分组列表失败')
  }
}

onMounted(() => {
  fetchProducts()
  fetchGroupsInfo()
})
</script>