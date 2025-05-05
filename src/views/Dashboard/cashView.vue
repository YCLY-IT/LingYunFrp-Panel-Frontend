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
            <div v-if="product.type === 'traffic'" class="price">
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
              <div v-for="(line, index) in product.desc.split('<br>')" :key="index" class="feature-line">
                <NIcon class="feature-icon"><CheckmarkCircle /></NIcon>
                <span>{{ line }}</span>
              </div>
            </div>

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
import { NCard, NButton, NInputNumber, NIcon } from 'naive-ui';
import { ref, onMounted } from 'vue';
import { CheckmarkCircle } from '@vicons/ionicons5';
import { useMessage } from 'naive-ui';
import { userApi } from '@/net';
import { accessHandle } from '@/net/base.ts';

const message = useMessage();
const products = ref([]);

// 从API获取产品数据
const fetchProducts = () => {
  userApi.get("/user/info/product", accessHandle(), (data) => {
    if (data.code === 0) {
      products.value = data.data.products.map(product => {
        // 解析 pay_method 字段为数组
        const payMethods = product.pay_method.split(';');
        // 默认选中第一个可用的支付方式
        const isPoint = payMethods.includes('points') && (payMethods[0] === 'points');
        return {
          ...product,
          payMethods, // 存储支付方式数组
          isPoint, // 默认选中第一个可用的支付方式
        };
      });
    } else {
      message.error(data.message);
    }
  }, (messageText, code, url) => {
    message.error(messageText);
  }, (err) => {
    message.error(err.message);
  });
};

// 购买处理
const handleBuy = (product) => {
  // 验证购买数量是否为空
  if (!product.selectedAmount) {
    message.error('请输入购买数量');
    return;
  }

  // 验证购买数量是否在合理范围内
  if (product.selectedAmount < 1 || product.selectedAmount > 200) {
    message.error('购买数量必须在1到200之间');
    return;
  }

  // 根据支付方式显示提示信息
  if (product.isPoint) {
    message.info(`正在创建积分订单：${product.name}`);
  } else {
    message.info(`正在创建价格订单：${product.name}`);
  }

  // 调用API进行购买
  userApi.post("/user/buy", {
    productId: product.id,
    type: product.type,
    amount: product.selectedAmount,
    isPoint: product.isPoint,
  }, accessHandle(), (data) => {
    if (data.code === 0) {
      message.success('购买成功');
      // 可以在这里重置购买数量
      product.selectedAmount = 1;
    } else {
      message.error(data.message);
    }
  }, (messageText, code, url) => {
    message.error(messageText);
  }, (err) => {
    message.error(err.message);
  });
};

// 在组件挂载时获取产品数据
onMounted(() => {
  fetchProducts();
});
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
</style>