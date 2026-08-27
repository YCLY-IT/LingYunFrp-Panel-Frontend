<template>
  <SecureArea>
    <div>
      <n-card title="产品管理">
        <n-space vertical>
          <div v-if="!isMobile" class="product-sort-row">
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

          <n-space v-else vertical :size="8" style="width: 100%">
            <n-grid :cols="2" :x-gap="8">
              <n-grid-item>
                <n-select
                  v-model:value="sortOptions.key"
                  :options="sortFieldOptions"
                  placeholder="排序字段"
                  clearable
                  style="width: 100%"
                  @update:value="handleSortFieldChange"
                />
              </n-grid-item>
              <n-grid-item>
                <n-select
                  v-model:value="sortOptions.order"
                  :options="sortOrderOptions"
                  placeholder="排序方式"
                  clearable
                  style="width: 100%"
                  @update:value="handleSortOrderChange"
                />
              </n-grid-item>
            </n-grid>
            <n-button
              type="primary"
              @click="openAddModal"
              style="width: 100%"
              size="medium"
            >
              添加产品
            </n-button>
          </n-space>
          <div class="table-container">
            <n-data-table
              remote
              :columns="productColumns"
              :data="sortedProductsData"
              :loading="loading"
              :pagination="{ pageSize: 10 }"
              :scroll-x="900"
            />
          </div>
        </n-space>
      </n-card>

      <n-modal
        v-model:show="showAddModal"
        preset="dialog"
        title="添加产品"
        style="width: 600px; max-width: 90vw"
      >
        <n-tabs v-model:value="activeTab" type="line" style="margin-top: 16px">
          <n-tab-pane name="basic" tab="基本信息">
            <n-form
              ref="addFormRef"
              :model="formValue"
              :rules="productRules"
              label-placement="left"
              label-width="100px"
            >
              <n-grid :cols="2" :x-gap="20" :y-gap="8" responsive="screen">
                <n-grid-item span="2">
                  <n-form-item label="分组" path="type">
                    <n-select
                      v-model:value="formValue.type"
                      :options="groupsOptions"
                      placeholder="请选择产品分组"
                    />
                  </n-form-item>
                </n-grid-item>
                <n-grid-item span="2">
                  <n-form-item label="名称" path="name">
                    <n-input
                      v-model:value="formValue.name"
                      placeholder="请输入产品名称"
                      clearable
                    />
                  </n-form-item>
                </n-grid-item>
                <n-grid-item span="2">
                  <n-form-item label="描述" path="desc">
                    <n-input
                      type="textarea"
                      v-model:value="formValue.desc"
                      placeholder="请输入产品描述"
                      clearable
                    />
                  </n-form-item>
                </n-grid-item>
                <n-grid-item>
                  <n-form-item label="价格" path="price">
                    <n-input-number
                      v-model:value="formValue.price"
                      placeholder="请输入产品价格"
                      style="width: 100%"
                    />
                  </n-form-item>
                </n-grid-item>
                <n-grid-item>
                  <n-form-item label="积分价格" path="pointPrice">
                    <n-input-number
                      v-model:value="formValue.pointPrice"
                      placeholder="请输入积分价格"
                      style="width: 100%"
                    />
                  </n-form-item>
                </n-grid-item>
                <n-grid-item>
                  <n-form-item label="是否为永久" path="isPermanent">
                    <n-switch v-model:value="formValue.isPermanent">
                      <template #on>是</template>
                      <template #off>否</template>
                    </n-switch>
                  </n-form-item>
                </n-grid-item>
                <n-grid-item span="2">
                  <n-form-item label="支付方式" path="payMethods">
                    <n-checkbox-group v-model:value="formValue.payMethods">
                      <n-space>
                        <n-checkbox value="points">积分支付</n-checkbox>
                        <n-checkbox value="money">金钱支付</n-checkbox>
                      </n-space>
                    </n-checkbox-group>
                  </n-form-item>
                </n-grid-item>
                <n-grid-item span="2">
                  <n-alert
                    type="info"
                    :show-icon="true"
                    style="margin-bottom: 8px"
                  >
                    产品默认以一个月为周期，如需永久产品请开启"是否为永久"开关
                  </n-alert>
                </n-grid-item>
              </n-grid>
            </n-form>
          </n-tab-pane>
          <n-tab-pane name="discount" tab="折扣规则">
            <n-alert
              type="warning"
              :show-icon="true"
              style="margin-bottom: 16px"
            >
              请设置不同购买月数对应的折扣率，例如：购买3个月打9折
            </n-alert>
            <n-space vertical style="width: 100%">
              <n-collapse v-if="discountRulesList.length > 0">
                <n-collapse-item
                  :title="`已设置 ${discountRulesList.length} 条折扣规则`"
                >
                  <n-space vertical>
                    <n-space
                      v-for="(rule, index) in discountRulesList"
                      :key="index"
                      align="center"
                    >
                      <n-input-number
                        v-model:value="rule.months"
                        :min="1"
                        placeholder="月数"
                        style="width: 100px"
                      />
                      <span>个月</span>
                      <n-input-number
                        v-model:value="rule.discount"
                        :min="0.01"
                        :max="1"
                        :step="0.01"
                        placeholder="折扣"
                        style="width: 100px"
                      />
                      <span>折</span>
                      <n-button
                        type="error"
                        size="small"
                        circle
                        @click="removeDiscountRule(index)"
                      >
                        <template #icon>
                          <n-icon><TrashOutline /></n-icon>
                        </template>
                      </n-button>
                    </n-space>
                  </n-space>
                </n-collapse-item>
              </n-collapse>
              <n-text v-else type="info">暂无折扣规则</n-text>
              <n-button type="primary" size="small" @click="addDiscountRule">
                <template #icon>
                  <n-icon><AddOutline /></n-icon>
                </template>
                添加折扣规则
              </n-button>
            </n-space>
          </n-tab-pane>
        </n-tabs>
        <template #action>
          <n-space justify="end" style="margin-top: 16px">
            <n-button @click="closeModal('add')" size="medium">取消</n-button>
            <n-button type="primary" @click="handleSubmit" size="medium"
              >确定</n-button
            >
          </n-space>
        </template>
      </n-modal>

      <n-modal
        v-model:show="showEditModal"
        preset="dialog"
        title="编辑产品"
        style="width: 600px; max-width: 90vw"
      >
        <n-tabs v-model:value="activeTab" type="line" style="margin-top: 16px">
          <n-tab-pane name="basic" tab="基本信息">
            <n-form
              ref="editFormRef"
              :model="formValue"
              :rules="productRules"
              label-placement="left"
              label-width="100px"
            >
              <n-collapse
                v-model:expanded-names="expandedNames"
                accordion
                :bordered="false"
              >
                <n-collapse-item title="基本信息" name="base">
                  <n-grid :cols="2" :x-gap="20" :y-gap="8" responsive="screen">
                    <n-grid-item span="2">
                      <n-form-item label="分组" path="type">
                        <n-select
                          v-model:value="formValue.type"
                          :options="groupsOptions"
                          placeholder="请选择产品分组"
                        />
                      </n-form-item>
                    </n-grid-item>
                    <n-grid-item span="2">
                      <n-form-item label="名称" path="name">
                        <n-input
                          v-model:value="formValue.name"
                          placeholder="请输入产品名称"
                          clearable
                        />
                      </n-form-item>
                    </n-grid-item>
                    <n-grid-item span="2">
                      <n-form-item label="描述" path="desc">
                        <n-input
                          type="textarea"
                          v-model:value="formValue.desc"
                          placeholder="请输入产品描述"
                          clearable
                        />
                      </n-form-item>
                    </n-grid-item>
                  </n-grid>
                </n-collapse-item>
                <n-collapse-item title="价格与支付" name="price">
                  <n-grid :cols="2" :x-gap="20" :y-gap="8" responsive="screen">
                    <n-grid-item>
                      <n-form-item label="价格" path="price">
                        <n-input-number
                          v-model:value="formValue.price"
                          placeholder="请输入产品价格"
                          style="width: 100%"
                        />
                      </n-form-item>
                    </n-grid-item>
                    <n-grid-item>
                      <n-form-item label="积分价格" path="pointPrice">
                        <n-input-number
                          v-model:value="formValue.pointPrice"
                          placeholder="请输入积分价格"
                          style="width: 100%"
                        />
                      </n-form-item>
                    </n-grid-item>
                    <n-grid-item>
                      <n-form-item label="是否为永久" path="isPermanent">
                        <n-switch v-model:value="formValue.isPermanent">
                          <template #on>是</template>
                          <template #off>否</template>
                        </n-switch>
                      </n-form-item>
                    </n-grid-item>
                    <n-grid-item span="2">
                      <n-form-item label="支付方式" path="payMethods">
                        <n-checkbox-group v-model:value="formValue.payMethods">
                          <n-space>
                            <n-checkbox value="points">积分支付</n-checkbox>
                            <n-checkbox value="money">金钱支付</n-checkbox>
                          </n-space>
                        </n-checkbox-group>
                      </n-form-item>
                    </n-grid-item>
                  </n-grid>
                </n-collapse-item>
              </n-collapse>
            </n-form>
          </n-tab-pane>
          <n-tab-pane name="discount" tab="折扣规则">
            <n-alert
              type="warning"
              :show-icon="true"
              style="margin-bottom: 16px"
            >
              请设置不同购买月数对应的折扣率，例如：购买3个月打9折
            </n-alert>
            <n-space vertical style="width: 100%">
              <n-collapse v-if="discountRulesList.length > 0">
                <n-collapse-item
                  :title="`已设置 ${discountRulesList.length} 条折扣规则`"
                >
                  <n-space vertical>
                    <n-space
                      v-for="(rule, index) in discountRulesList"
                      :key="index"
                      align="center"
                    >
                      <n-input-number
                        v-model:value="rule.months"
                        :min="1"
                        placeholder="月数"
                        style="width: 100px"
                      />
                      <span>个月</span>
                      <n-input-number
                        v-model:value="rule.discount"
                        :min="0.01"
                        :max="1"
                        :step="0.01"
                        placeholder="折扣"
                        style="width: 100px"
                      />
                      <span>折</span>
                      <n-button
                        type="error"
                        size="small"
                        circle
                        @click="removeDiscountRule(index)"
                      >
                        <template #icon>
                          <n-icon><TrashOutline /></n-icon>
                        </template>
                      </n-button>
                    </n-space>
                  </n-space>
                </n-collapse-item>
              </n-collapse>
              <n-text v-else type="info">暂无折扣规则</n-text>
              <n-button
                type="primary"
                size="small"
                @click="addDiscountRule"
                style="margin-top: 8px"
              >
                <template #icon>
                  <n-icon><AddOutline /></n-icon>
                </template>
                添加折扣规则
              </n-button>
            </n-space>
          </n-tab-pane>
        </n-tabs>
        <template #action>
          <n-space justify="end" style="margin-top: 16px">
            <n-button @click="closeModal('edit')" size="medium">取消</n-button>
            <n-button type="primary" @click="handleSubmit" size="medium"
              >确定</n-button
            >
          </n-space>
        </template>
      </n-modal>
    </div>
  </SecureArea>
</template>

<script lang="ts" setup>
import { h, onMounted, ref, watch, computed } from 'vue'
import {
  NButton,
  NSpace,
  NTag,
  useMessage,
  DataTableColumns,
  FormInst,
  FormRules,
} from 'naive-ui'
import { TrashOutline, AddOutline } from '@vicons/ionicons5'
import { adminApi } from '@/net'
import { Group, Product } from '@/types'
import SecureArea from '@/components/SecureArea.vue'

const message = useMessage()

const isMobile = computed(() => {
  return window.innerWidth <= 768
})

const loading = ref(false)

const addFormRef = ref<FormInst | null>(null)
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
  discountRules: '',
})

interface DiscountRule {
  months: number
  discount: number
}
const discountRulesList = ref<DiscountRule[]>([])

const activeTab = ref('basic')

const mode = ref<'add' | 'edit'>('add')
const currentProduct = ref<Product | null>(null)
const productsData = ref<Product[]>([])
const groupsData = ref<Group[]>([])
const groupsOptions = ref<{ label: string; value: string }[]>([])
const showAddModal = ref(false)
const showEditModal = ref(false)
const expandedNames = ref<string[]>(['base'])

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

const closeModal = (modalMode: 'add' | 'edit') => {
  if (modalMode === 'add') {
    showAddModal.value = false
    resetForm()
  } else {
    showEditModal.value = false
    resetForm()
  }
}

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
    discountRules: '',
  }
  discountRulesList.value = []
  activeTab.value = 'basic'
}

const addDiscountRule = () => {
  discountRulesList.value.push({ months: 3, discount: 0.9 })
}

const removeDiscountRule = (index: number) => {
  discountRulesList.value.splice(index, 1)
}

const convertDiscountRulesToJson = (): string => {
  if (discountRulesList.value.length === 0) return ''
  const rules: Record<string, number> = {}
  discountRulesList.value.forEach((rule) => {
    rules[rule.months.toString()] = rule.discount
  })
  return JSON.stringify(rules)
}

const parseDiscountRulesFromJson = (jsonStr: string) => {
  if (!jsonStr) {
    discountRulesList.value = []
    return
  }
  try {
    const rules = JSON.parse(jsonStr)
    discountRulesList.value = Object.entries(rules).map(
      ([months, discount]) => ({
        months: parseInt(months),
        discount: discount as number,
      }),
    )
  } catch {
    discountRulesList.value = []
  }
}

const openAddModal = () => {
  resetForm()
  showAddModal.value = true
}

const openEditModal = (product: Product) => {
  const paymentMethods = product.payMethod ? product.payMethod.split(';') : []
  formValue.value = { ...product, payMethods: paymentMethods }
  parseDiscountRulesFromJson(product.discountRules || '')
  mode.value = 'edit'
  currentProduct.value = { ...product }
  showEditModal.value = true
}

const validateDiscountRules = (): boolean => {
  if (discountRulesList.value.length === 0) return true

  for (let i = 0; i < discountRulesList.value.length; i++) {
    const rule = discountRulesList.value[i]
    if (!rule.months || rule.months <= 0) {
      message.error(`第 ${i + 1} 条折扣规则的月数未填写`)
      return false
    }
    if (!rule.discount || rule.discount <= 0 || rule.discount > 1) {
      message.error(
        `第 ${i + 1} 条折扣规则的折扣率未填写或格式错误（应为0.01-1之间的小数）`,
      )
      return false
    }
  }
  return true
}

const handleSubmit = async () => {
  try {
    await addFormRef.value?.validate()

    if (!validateDiscountRules()) {
      return
    }

    const formMode = mode.value
    const formData = {
      type: formValue.value.type,
      name: formValue.value.name,
      desc: formValue.value.desc,
      isPermanent: formValue.value.isPermanent,
      price: formValue.value.price,
      pointPrice: formValue.value.pointPrice,
      payMethod: formValue.value.payMethods.join(';'),
      discountRules: convertDiscountRulesToJson() || undefined,
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

const fetchProductsInfo = async () => {
  loading.value = true
  try {
    const data = await adminApi.getProductList()
    if (data.code === 0) {
      if (!data.data.products) {
        productsData.value = []
        return
      }
      productsData.value = data.data.products.map((product: any) => ({
        id: product.id,
        name: product.name,
        desc: product.desc,
        type: product.type,
        price: product.price,
        pointPrice: product.point_price,
        isPermanent: product.is_permanent,
        payMethod: product.pay_method,
        discountRules: product.discount_rules,
        createdAt: product.created_at,
        updatedAt: product.updated_at,
        payMethods: product.pay_method ? product.pay_method.split(';') : [],
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
