<template>
  <div class="cash">
    <NSpin :show="loading" description="正在加载产品...">
      <div class="content-grid">
        <NCard title="增值服务">
          <div class="service-cards">
            <!-- 动态渲染产品卡片 -->
            <NCard
                v-for="product in products"
                :key="product.id"
                class="service-card"
                :title="product.name"
            >
              <!-- 永久标签 -->
              <div v-if="product.isPermanent" class="permanent-badge">
                <NIcon><InfiniteOutline /></NIcon>
                <span>永久</span>
              </div>
              
              <!-- 根据是否永久和产品类型显示不同的价格单位 -->
              <div v-if="product.isPermanent && product.type !== 'traffic' && product.type !== 'proxies'" class="price">
                ¥{{ product.price }} <span class="unit">/ 永久</span>
              </div>
              <div v-else-if="product.type === 'traffic'" class="price">
                ¥{{ product.price }} <span class="unit">/ GB</span>
              </div>
              <div v-else-if="product.type === 'proxies'" class="price">
                ¥{{ product.price }} <span class="unit">/ 个</span>
              </div>
              <div v-else class="price">
                ¥{{ product.price }} <span class="unit">/ 月</span>
              </div>

              <!-- 使用 v-for 循环处理描述中的换行 -->
              <div class="features">
                <div v-for="(line, index) in (product.desc || '').split('<br>')" :key="index" class="feature-line">
                  <NIcon class="feature-icon"><CheckmarkCircle /></NIcon>
                  <span>{{ line }}</span>
                </div>
              </div>

              <!-- 流量和隧道类型始终显示输入框，其他永久产品不显示 -->
              <div v-if="product.type === 'traffic' || product.type === 'proxies' || !product.isPermanent">
                <div v-if="product.type === 'traffic'">
                  <NInputNumber
                      v-model:value="product.selectedAmount"
                      :min="1"
                      :max="200"
                      placeholder="输入购买数量(GB)"
                      style="margin-bottom: 12px"
                  />
                </div>
                <div v-else-if="product.type === 'proxies'">
                  <NInputNumber
                      v-model:value="product.selectedAmount"
                      :min="1"
                      :max="200"
                      placeholder="输入购买数量(个)"
                      style="margin-bottom: 12px"
                  />
                </div>
                <div v-else>
                  <NInputNumber
                      v-model:value="product.selectedAmount"
                      :min="1"
                      :max="200"
                      placeholder="输入购买数量"
                      style="margin-bottom: 12px"
                  />
                </div>
              </div>
              <!-- 其他永久产品固定数量为1 -->
              <div v-else class="permanent-note">
                <NIcon><InformationCircle /></NIcon>
                <span>一次性永久购买</span>
              </div>

              <!-- 支付方式选择 -->
              <div class="payment-options">
                <div class="option-label">支付方式:</div>
                <div class="option-buttons">
                  <!-- 动态显示积分支付按钮 -->
                  <NButton
                      v-if="product.payMethods.includes('points')"
                      type="default"
                      :class="{ active: product.isPoint }"
                      @click="product.isPoint = true"
                      style="margin-right: 8px"
                  >
                    积分支付
                  </NButton>
                  <!-- 动态显示价格支付按钮 -->
                  <NButton
                      v-if="product.payMethods.includes('money')"
                      type="default"
                      :class="{ active: !product.isPoint }"
                      @click="product.isPoint = false"
                  >
                    价格支付
                  </NButton>
                </div>
              </div>

              <!-- 新增：支付方式提示 -->
              <div class="payment-note" v-if="!product.isPoint">
                注意：目前金钱支付只支持支付宝
              </div>

              <!-- 总价显示 -->
              <div class="price-display">
                <div v-if="product.isPoint">
                  所需积分: {{ product.pointPrice * (shouldUseSelectedAmount(product) ? (product.selectedAmount || 1) : 1) }} 积分
                </div>
                <div v-else>
                  总价: ¥{{ product.price * (shouldUseSelectedAmount(product) ? (product.selectedAmount || 1) : 1) }}
                </div>
              </div>

              <NButton type="primary" block @click="handleBuy(product)">
                立即购买
              </NButton>
            </NCard>
          </div>
        </NCard>
      </div>
    </NSpin>
  </div>
</template>

<script setup lang="ts">
import { NCard, NButton, NInputNumber, NIcon, NSpin } from 'naive-ui' // 添加 NSpin 导入
import { ref, onMounted } from 'vue'
import { CheckmarkCircle, InformationCircle, InfiniteOutline } from '@vicons/ionicons5'
import { useMessage, useDialog } from 'naive-ui'
import { userApi } from '@/net'
import { Product } from '@/net/user/type'

const message = useMessage()
const dialog = useDialog()
const products = ref<Product[]>([])
const loading = ref(false) // 新增加载状态

// 判断是否应该使用用户选择的数量
const shouldUseSelectedAmount = (product: Product) => {
  return product.type === 'traffic' || product.type === 'tunnel' || !product.isPermanent
}

// 从API获取产品数据
const fetchProducts = async () => {
  loading.value = true 
  try {
    const data = await userApi.getProducts()
    if (data.code === 0 && data.data && data.data.products) {
      products.value = data.data.products.map(product => {
        // 解析 pay_method 字段为数组
        const payMethods = product.payMethod.split(';')
        // 默认选中第一个可用的支付方式
        const isPoint = payMethods.includes('points') && (payMethods[0] === 'points')
        return {
          ...product,
          payMethods, // 存储支付方式数组
          isPoint, // 默认选中第一个可用的支付方式
          selectedAmount: 1, // 默认数量为1
        }
      })
    } else {
      // 当没有产品时，显示空数组
      products.value = []
      if (data.code !== 0) {
        message.warning(data.message || '暂无产品')
      }
    }
  } catch (err: any) {
    message.error(err.message || '获取产品列表失败')
    products.value = []
  } finally {
    loading.value = false
  }
}

// 购买处理
const handleBuy = async (product: Product) => {
  // 确定使用哪个数量
  const amount = shouldUseSelectedAmount(product) ? product.selectedAmount : 1

  // 验证购买数量是否为空
  if (!amount) {
    message.error('请输入购买数量')
    return
  }

  // 验证购买数量是否在合理范围内
  if (amount < 1 || amount > 200) {
    message.error('购买数量必须在1到200之间')
    return
  }

  // 根据支付方式显示提示信息
  if (product.isPoint) {
    message.info(`正在创建积分订单：${product.name}`)
  } else {
    message.info(`正在创建价格订单：${product.name}`)
  }

  try {
    // 调用API进行购买
    const data = await userApi.buyProduct({
      productId: product.id,
      type: product.type,
      amount: amount,
      isPoint: product.isPoint,
    })
    
    if (data.code === 0) {
      console.log(data)
      dialog.success({
        title: '购买成功',
        content: `您已成功购买：${product.name}${shouldUseSelectedAmount(product) ? `（数量：${amount}）` : ''}`,
        positiveText: '确定',
      })
      // 可以在这里重置购买数量
      if (shouldUseSelectedAmount(product)) {
        product.selectedAmount = 1
      }
    } else {
      message.error(data.message)
    }
  } catch (err: any) {
    message.error(err.message || '购买失败')
  }
}

// 在组件挂载时获取产品数据
onMounted(() => {
  fetchProducts()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/cash.scss';

.unit-label {
  text-align: center;
  color: #8a919f;
  font-size: 12px;
  margin-top: 4px;
}

.payment-options {
  margin: 12px 0;
}

.option-label {
  margin-bottom: 8px;
  font-weight: bold;
}

.option-buttons {
  display: flex;
}

.active {
  background-color: #4caf50 !important;
  color: white !important;
}

.price-display {
  margin: 12px 0;
  font-weight: bold;
  text-align: center;
}

/* 新增样式：支付方式提示 */
.payment-note {
  margin: 8px 0;
  color: #ff4d4f;
  font-size: 12px;
  text-align: center;
}

/* 新增样式：确保每行内容和图标在同一行 */
.feature-line {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.feature-icon {
  margin-right: 8px;
  color: #ff8c00;
}

/* 新增样式：永久产品提示 */
.permanent-note {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 12px 0;
  color: #1890ff;
  font-size: 14px;
}

.permanent-note .n-icon {
  margin-right: 8px;
}

/* 新增样式：永久标签 */
.permanent-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #f5a623;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.permanent-badge .n-icon {
  font-size: 14px;
}

/* 确保卡片有相对定位，以便永久标签可以正确定位 */
.service-card {
  position: relative;
}
</style>