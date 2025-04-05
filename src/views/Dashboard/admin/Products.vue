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
          ref="formRef"
          :model="formValue"
          :rules="productRules"
          style="padding-top: 12px; padding-bottom: 12px;"
      >
        <NFormItem label="类型" path="type">
          <NSelect
              v-model:value="formValue.type"
              :options="typeOptions"
              placeholder="请选择产品类型"
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
        <!-- 新增积分价格字段 -->
        <NFormItem label="积分价格" path="pointsPrice">
          <NInputNumber v-model:value="formValue.pointsPrice" placeholder="请输入积分价格" />
        </NFormItem>
        <NFormItem label="支付方式" path="paymentMethod">
          <NCheckboxGroup v-model:value="formValue.paymentMethod">
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
          ref="formRef"
          :model="formValue"
          :rules="productRules"
          style="padding-top: 12px; padding-bottom: 12px;"
      >
        <NFormItem label="类型" path="type">
          <NSelect
              v-model:value="formValue.type"
              :options="typeOptions"
              placeholder="请选择产品类型"
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
        <!-- 新增积分价格字段 -->
        <NFormItem label="积分价格" path="pointsPrice">
          <NInputNumber v-model:value="formValue.pointsPrice" placeholder="请输入积分价格" />
        </NFormItem>
        <NFormItem label="支付方式" path="paymentMethod">
          <NCheckboxGroup v-model:value="formValue.paymentMethod">
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
import {onMounted, ref, watch} from 'vue'
import {DataTableColumns, FormInst, NTag} from 'naive-ui'
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
  useMessage
} from 'naive-ui'
import {userApi} from '@/net'
import {accessHandle} from '@/net/base.ts'

interface Product {
  ID?: number
  type: string
  name: string
  desc: string
  price: number
  pointsPrice: number // 新增积分价格字段
  pay_method: string // 后端返回的支付方式字段
  created_at?: string
  updated_at?: string
}

const message = useMessage()
const loading = ref(false)

const formRef = ref<FormInst | null>(null)
const formValue = ref<Product>({
  type: '',
  name: '',
  desc: '',
  price: 0,
  pointsPrice: 0, // 新增积分价格字段
  pay_method: ''
})
const mode = ref<'add' | 'edit'>('add')
const currentProduct = ref<Product | null>(null)
const productsData = ref<Product[]>([])
const groups = ref<Group[]>([])
const showAddModal = ref(false)
const showEditModal = ref(false)

const typeOptions = ref([
  { label: '流量包', value: 'traffic' },
  { label: '额外隧道', value: 'proxies' },
  { label: 'VIP会员', value: 'vip' }
])

const productRules = {
  type: { required: true, message: '请选择产品类型', trigger: ['blur', 'change'] },
  name: { required: true, message: '请输入产品名称', trigger: ['blur', 'input'] },
  desc: { required: true, message: '请输入产品描述', trigger: ['blur', 'input'] },
  price: { required: true, type: 'number', message: '请输入产品价格', trigger: ['blur', 'input'] },
  pointsPrice: { required: true, type: 'number', message: '请输入积分价格', trigger: ['blur', 'input'] }, // 新增积分价格验证
  paymentMethod: { required: true, type: 'array', message: '请选择至少一种支付方式', trigger: ['blur', 'change'] }
};

const productColumns: DataTableColumns<Product> = [
  { title: 'ID', key: 'ID' },
  { title: '类型', key: 'type' },
  { title: '名称', key: 'name' },
  { title: '描述', key: 'desc' },
  { title: '价格', key: 'price', render: row => h('span', `${row.price} 元`) },
  // 新增积分价格列
  { title: '积分价格', key: 'pointsPrice', render: row => h('span', `${row.pointsPrice} 积分`) },
  {
    title: '支付方式',
    key: 'pay_method',
    render: row => {
      if (!row.pay_method) return h('span', '无支付方式');

      const methods = row.pay_method.split(';');
      const colorMap = {
        points: {
          color: '#4caf50', // 绿色
          textColor: '#fff',
          borderColor: '#4caf50'
        },
        money: {
          color: '#2196f3', // 蓝色
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
              const tagColor = colorMap[method] || colorMap.points; // 默认使用绿色

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
                    color: tagColor // 传递颜色对象
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
                    onClick: () => handleDeleteProduct(row.ID!)
                  },
                  { default: () => '删除' }
              )
            ]
          }
      )
    }
  }
]

// 关闭模态框并重置表单
const closeModal = (modalMode: 'add' | 'edit') => {
  showAddModal.value = false
  showEditModal.value = false
  if (modalMode === 'add') {
    resetForm()
  }
}

// 重置表单
const resetForm = () => {
  formValue.value = {
    type: '',
    name: '',
    desc: '',
    price: 0,
    pointsPrice: 0, // 新增积分价格字段
    pay_method: ''
  }
  mode.value = 'add'
}

// 打开添加模态框
const openAddModal = () => {
  resetForm()
  showAddModal.value = true
}

// 打开编辑模态框
const openEditModal = (product: Product) => {
  // 将支付方式字符串解析为数组
  const paymentMethods = product.pay_method.split(';');
  formValue.value = { ...product, paymentMethod: paymentMethods };
  mode.value = 'edit';
  currentProduct.value = { ...product };
  showEditModal.value = true;
};

// 提交表单
const handleSubmitProduct = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();

    const formData = { ...formValue.value };
    // 将支付方式数组转换为用分号分隔的字符串
    formData.pay_method = formValue.value.paymentMethod.join(';');

    const apiPath = mode.value === 'add'
        ? '/user/admin/product/create'
        : `/user/admin/product/update/${currentProduct.value?.ID}`;

    userApi.post(apiPath, formData, accessHandle(), (data) => {
      if (data.code === 0) {
        message.success(`${mode.value === 'add' ? '添加' : '修改'}产品成功`);
        closeModal(mode.value);
        fetchProducts();
      } else {
        message.error(data.message);
      }
    });
  } catch (error) {
    message.error('请填写完整信息');
  }
};

// 删除产品
const handleDeleteProduct = async (productId: number) => {
  try {
    userApi.post(`/user/admin/product/delete/${productId}`, {}, accessHandle(), (data) => {
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
        // 确保后端返回的数据包含 pointsPrice 字段
        productsData.value = data.data.products.map(product => ({
          ...product,
          pointsPrice: product.point_price || 0 // 假设后端字段名为 points_price
        }));
      } else {
        message.error(data.message)
      }
    }, (error) => {
      message.error('获取产品列表失败')
    })
  } catch (error) {
    message.error('获取产品列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProducts()
})
</script>