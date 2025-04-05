<template>
  <div class="cash">
    <div class="content-grid">
      <NCard title="增值服务">
        <div class="service-cards">
          <!-- 动态渲染产品卡片 -->
          <NCard
              v-for="product in products"
              :key="product.ID"
              class="service-card"
              :title="product.name"
          >
            <div class="price">
              ¥{{ product.price }} <span class="unit">/ GB</span>
            </div>
            <div class="features">
              <div
                  v-for="(feature, index) in product.features"
                  :key="index"
                  class="feature-item"
              >
                <NIcon><CheckmarkCircle /></NIcon>
                {{ feature }}
              </div>
            </div>
            <div v-if="product.type === 'traffic'">
              <NInputNumber
                  v-model:value="product.selectedAmount"
                  :min="10"
                  :max="200"
                  placeholder="输入购买数量(GB)"
                  style="margin-bottom: 12px"
              />
            </div>

            <!-- 支付方式选择 -->
            <div class="payment-options">
              <div class="option-label">支付方式:</div>
              <div class="option-buttons">
                <NButton
                    type="primary"
                    :class="{ active: product.isPoint }"
                    @click="product.isPoint = true"
                    style="margin-right: 8px"
                >
                  积分支付
                </NButton>
                <NButton
                    type="default"
                    :class="{ active: !product.isPoint }"
                    @click="product.isPoint = false"
                >
                  价格支付
                </NButton>
              </div>
            </div>

            <!-- 总价显示 -->
            <div class="price-display">
              <div v-if="product.isPoint">
                所需积分: {{ product.point_price * (product.selectedAmount || 1) }} 积分
              </div>
              <div v-else>
                总价: ¥{{ product.price * (product.selectedAmount || 1) }}
              </div>
            </div>

            <NButton type="primary" block @click="handleBuy(product)">
              立即购买
            </NButton>
          </NCard>
        </div>
      </NCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NCard, NButton, NInputNumber, NIcon } from 'naive-ui'
import { ref, onMounted } from 'vue'
import { CheckmarkCircle } from '@vicons/ionicons5'
import { useMessage } from 'naive-ui'
import { userApi } from '@/net'
import { accessHandle } from '@/net/base.ts'

const message = useMessage()
const products = ref([])

// 从API获取产品数据
const fetchProducts = () => {
  userApi.get("/user/info/product", accessHandle(), (data) => {
    if (data.code === 0) {
      products.value = data.data.products.map(product => {
        return {
          ...product,
          selectedAmount: 1, // 默认购买数量为1
          isPoint: false, // 默认不使用积分支付
        }
      })
    } else {
      message.error(data.message)
    }
  }, (messageText, code, url) => {
    message.error(messageText)
  }, (err) => {
    message.error(err.message)
  })
}

// 购买处理
const handleBuy = (product) => {
  // 验证购买数量是否为空
  if (!product.selectedAmount) {
    message.error('请输入购买数量')
    return
  }

  // 验证购买数量是否在合理范围内
  if (product.selectedAmount < 10 || product.selectedAmount > 200) {
    message.error('购买数量必须在10到200之间')
    return
  }

  // 根据支付方式显示提示信息
  if (product.isPoint) {
    message.info(`正在创建积分订单：${product.name}`)
  } else {
    message.info(`正在创建价格订单：${product.name}`)
  }

  // 调用API进行购买
  userApi.post("/user/buy", {
    productId: product.ID,
    type: product.type,
    amount: product.selectedAmount,
    isPoint: product.isPoint,
  }, accessHandle(), (data) => {
    if (data.code === 0) {
      message.success('购买成功')
      // 可以在这里重置购买数量
      product.selectedAmount = 1
    } else {
      message.error(data.message)
    }
  }, (messageText, code, url) => {
    message.error(messageText)
  }, (err) => {
    message.error(err.message)
  })
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
</style>