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
              <div
                v-if="
                  product.isPermanent &&
                  product.type !== 'traffic' &&
                  product.type !== 'proxies'
                "
                class="price"
              >
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

              <!-- 使用无序列表显示产品描述，每一行作为一个列表项 -->
              <ul class="features-list">
                <li
                  v-for="(line, index) in product.desc
                    .split('\n')
                    .filter((line) => line.trim() !== '')"
                  :key="index"
                  class="feature-item"
                >
                  <span>{{ line }}</span>
                </li>
              </ul>

              <!-- 简化产品卡片，只显示基本信息和立即购买按钮 -->
              <NButton
                type="primary"
                block
                @click="openPurchaseSidebar(product)"
              >
                立即购买
              </NButton>
            </NCard>
          </div>
          <NEmpty
            style="margin-top: 35px; margin-bottom: 45px"
            v-if="products.length === 0 && !loading"
            description="暂无产品"
          />
        </NCard>
      </div>
    </NSpin>

    <!-- 购买配置侧边栏 -->
    <NDrawer
      v-model:show="showPurchaseSidebar"
      :width="400"
      placement="right"
      :show-mask="true"
    >
      <NDrawerContent :title="selectedProduct?.name || '购买配置'" closable>
        <div v-if="selectedProduct" class="purchase-sidebar-content">
          <!-- 购买数量配置 -->
          <NCard title="购买数量" size="small" class="config-card">
            <!-- 流量和隧道类型始终显示输入框，其他永久产品不显示 -->
            <div
              v-if="
                selectedProduct.type === 'traffic' ||
                selectedProduct.type === 'proxies' ||
                !selectedProduct.isPermanent
              "
            >
              <div
                v-if="selectedProduct.type === 'traffic'"
                class="input-group"
              >
                <NInputNumber
                  v-model:value="selectedProduct.selectedAmount"
                  :min="1"
                  :max="200"
                  placeholder="输入购买数量(GB)"
                />
                <span class="unit-label">GB</span>
              </div>
              <div
                v-else-if="selectedProduct.type === 'proxies'"
                class="input-group"
              >
                <NInputNumber
                  v-model:value="selectedProduct.selectedAmount"
                  :min="1"
                  :max="200"
                  placeholder="输入购买数量(个)"
                />
                <span class="unit-label">个</span>
              </div>
              <div v-else class="input-group">
                <NInputNumber
                  v-model:value="selectedProduct.selectedAmount"
                  :min="1"
                  :max="200"
                  placeholder="输入购买数量"
                />
                <span class="unit-label">月</span>
              </div>
            </div>
            <!-- 其他永久产品固定数量为1 -->
            <div v-else class="permanent-note">
              <NIcon><InformationCircle /></NIcon>
              <span>一次性永久购买</span>
            </div>
          </NCard>

          <!-- 支付方式选择 -->
          <NCard title="支付方式" size="small" class="config-card">
            <div class="payment-options">
              <NRadioGroup v-model:value="selectedProduct.isPoint">
                <NSpace vertical style="width: 100%">
                  <NRadio
                    :value="true"
                    v-if="selectedProduct.payMethods.includes('points')"
                    style="width: 100%"
                  >
                    <NSpace align="center" style="width: 100%">
                      <svg
                        class="payment-icon"
                        viewBox="0 0 1024 1024"
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M513.28 512.3072m-453.2224 0a453.2224 453.2224 0 1 0 906.4448 0 453.2224 453.2224 0 1 0-906.4448 0Z"
                          fill="#F49D22"
                        ></path>
                        <path
                          d="M513.28 59.0848c-250.3168 0-453.2224 202.9056-453.2224 453.2224 0 99.7888 32.256 192 86.8864 266.8544 74.8544 54.6304 167.0656 86.8864 266.8544 86.8864 250.3168 0 453.2224-202.9056 453.2224-453.2224 0-99.7888-32.256-192-86.8864-266.8544-74.8544-54.6304-167.0656-86.8864-266.8544-86.8864z"
                          fill="#F6AD2A"
                        ></path>
                        <path
                          d="M756.9408 305.7664c0-72.6016-17.152-141.2096-47.5136-202.0352-59.3408-28.5696-125.8496-44.5952-196.096-44.5952-250.3168 0-453.2224 202.9056-453.2224 453.2224 0 72.6016 17.152 141.2096 47.5136 202.0352 59.3408 28.5696 125.8496 44.5952 196.096 44.5952 250.3168 0 453.2224-202.9568 453.2224-453.2224z"
                          fill="#F9BF34"
                        ></path>
                        <path
                          d="M60.0576 512.3072c0 38.912 4.9664 76.6464 14.2336 112.64a443.5968 443.5968 0 0 0 114.688 15.0528c245.7088 0 444.928-199.2192 444.928-444.928 0-43.1616-6.2464-84.7872-17.7152-124.2112-33.024-7.68-67.4816-11.776-102.8608-11.776-250.3168 0-453.2736 202.9056-453.2736 453.2224z"
                          fill="#FAC93A"
                        ></path>
                        <path
                          d="M170.752 454.6048v119.808c8.4992 12.1856 22.1696 24.1664 40.192 35.2768l67.072-67.072c-65.7408-21.5552-107.264-52.992-107.264-88.0128zM488.9088 288.6144c-175.7184 0-318.1568 52.6336-318.1568 117.5552 0 41.3184 57.8048 77.6704 145.1008 98.6112l215.1424-215.1424c-13.7728-0.6656-27.8016-1.024-42.0864-1.024z"
                          fill="#FFFFFF"
                        ></path>
                        <path
                          d="M170.752 809.3696c20.4288 23.5008 43.264 44.9024 68.096 63.7952l35.84-35.84c-41.6256-12.8-76.9536-29.2864-103.936-48.7424v20.7872zM175.7184 644.9152l-4.9664 4.9664v71.5776c20.736 29.696 71.68 58.112 143.5136 76.3392l83.1488-83.1488c-93.2352-9.984-170.9056-34.9696-221.696-69.7344zM442.368 669.696l99.1232-99.1232c-17.1008 1.0752-34.6624 1.6384-52.5824 1.6384-80.896 0-154.7264-11.1616-210.8928-29.5424l-67.072 67.072c48.8448 30.1056 130.2528 54.1696 231.424 59.9552zM530.9952 289.6896L315.8528 504.7808c49.8176 11.9808 109.2096 18.944 173.056 18.944 37.2224 0 72.96-2.4064 106.1376-6.7072l169.5232-169.5232c-48.3328-30.9248-133.632-52.9408-233.5744-57.8048z"
                          fill="#FEFAF3"
                        ></path>
                        <path
                          d="M749.7728 653.6704c-92.0064 15.5648-164.4032 87.808-179.0976 179.0976l179.0976-179.0976zM533.6576 869.7856l-0.1536-4.4544c-14.592 0.7168-29.44 1.1776-44.5952 1.1776-80.8448 0-154.112-10.6496-214.2208-29.1328l-35.84 35.84c58.624 44.5952 128.4096 75.2128 204.4928 86.9376l90.3168-90.368zM537.856 816.5888c9.0624-47.36 30.5664-81.5616 47.7696-102.4512-30.6688 3.4816-63.0272 5.3248-96.7168 5.3248-31.7952 0-62.3616-1.6896-91.4944-4.8128l-83.1488 83.1488c49.3568 12.544 108.5952 20.2752 174.6432 20.2752 16.7936-0.0512 33.0752-0.5632 48.9472-1.4848zM488.9088 670.976c162.2016 0 283.1872-46.5408 318.1568-96.6144v-119.808c0 58.3168-114.8928 106.6496-265.5744 115.9168L442.368 669.696c15.104 0.8192 30.6176 1.28 46.5408 1.28z"
                          fill="#FDF3E2"
                        ></path>
                        <path
                          d="M807.0656 406.1696c0-21.4016-15.5136-41.4208-42.496-58.6752l-169.5232 169.5232c123.5456-16.1792 212.0192-59.6992 212.0192-110.848z"
                          fill="#FDF3E2"
                        ></path>
                        <path
                          d="M726.2208 912.2816c-19.2512-18.432-40.1408-35.9936-57.4464-44.6464 71.6288-39.168 114.3296-110.6432 114.3296-110.6432 6.9632 15.9744 31.1296 43.9808 57.4464 68.5056a453.72416 453.72416 0 0 0 85.2992-126.0032c-37.7856-30.6176-86.1184-48.9984-138.8032-48.9984-12.6976 0-25.1392 1.1264-37.2736 3.1744l-179.0464 179.0464c-1.792 11.1616-2.7648 22.5792-2.7648 34.2016 0 32.9728 7.4752 64.256 20.8384 92.2112a449.50528 449.50528 0 0 0 137.4208-46.848zM513.024 965.4784c13.056 0 26.0096-0.5632 38.7584-1.6896-11.9808-34.6112-17.3568-65.9456-18.1248-94.0544l-90.368 90.368c22.7328 3.5328 46.0288 5.376 69.7344 5.376z"
                          fill="#F7E8D2"
                        ></path>
                        <path
                          d="M616.2432 868.1472c0-94.72 77.056-171.776 171.776-171.776 44.6464 0 85.3504 17.1008 115.9168 45.1072 2.6624-4.5056 5.2224-9.0624 7.7312-13.6704-33.024-29.1328-76.288-46.848-123.648-46.848-103.168 0-187.136 83.968-187.136 187.136 0 30.3104 7.2704 58.9312 20.1216 84.2752 5.12-1.2288 10.1376-2.6112 15.2064-3.9936a170.09664 170.09664 0 0 1-19.968-80.2304z"
                          fill="#F6AD2A"
                        ></path>
                        <path
                          d="M175.7696 644.9664c-1.6384-1.1264-3.4304-2.2016-5.0176-3.3792v8.3968l5.0176-5.0176z"
                          fill="#FFFFFF"
                        ></path>
                      </svg>
                      <span>积分支付</span>
                    </NSpace>
                  </NRadio>
                  <NRadio
                    :value="false"
                    v-if="selectedProduct.payMethods.includes('money')"
                    style="width: 100%"
                  >
                    <NSpace align="center" style="width: 100%">
                      <svg
                        class="payment-icon"
                        viewBox="0 0 512 512"
                        xmlns="http://www.w3.org/2000/svg"
                        xmlns:xlink="http://www.w3.org/1999/xlink"
                      >
                        <path
                          d="M102.41 32C62.38 32 32 64.12 32 103.78v304.45C32 447.86 64.38 480 104.41 480h303.2c40 0 72.39-32.14 72.39-71.77v-3.11c-1.35-.56-115.47-48.57-174.5-76.7c-39.82 48.57-91.18 78-144.5 78c-90.18 0-120.8-78.22-78.1-129.72c9.31-11.22 25.15-21.94 49.73-28c38.45-9.36 99.64 5.85 157 24.61a309.41 309.41 0 0 0 25.46-61.67H138.34V194h91.13v-31.83H119.09v-17.75h110.38V99s0-7.65 7.82-7.65h44.55v53H391v17.75H281.84V194h89.08a359.41 359.41 0 0 1-37.72 94.43c27 9.69 49.31 18.88 67.39 24.89c60.32 20 77.23 22.45 79.41 22.7V103.78C480 64.12 447.6 32 407.61 32h-305.2zM152 274.73q-5.81.06-11.67.63c-11.3 1.13-32.5 6.07-44.09 16.23c-34.74 30-13.94 84.93 56.37 84.93c40.87 0 81.71-25.9 113.79-67.37c-41.36-20-77-34.85-114.4-34.42z"
                          fill="currentColor"
                        ></path>
                      </svg>
                      <span>支付宝支付</span>
                    </NSpace>
                  </NRadio>
                </NSpace>
              </NRadioGroup>
            </div>
            <div class="payment-note" v-if="!selectedProduct.isPoint">
              <NIcon><InformationCircle /></NIcon>
              <span>目前支付只支持支付宝</span>
            </div>
          </NCard>

          <!-- 价格预览 -->
          <NCard title="价格预览" size="small" class="config-card">
            <div class="price-preview">
              <div class="price-item">
                <span>单价：</span>
                <span
                  >{{
                    selectedProduct.isPoint
                      ? selectedProduct.pointPrice
                      : selectedProduct.price
                  }}
                  {{ selectedProduct.isPoint ? '积分' : '元' }}</span
                >
              </div>
              <div class="price-item">
                <span>数量：</span>
                <span>{{
                  shouldUseSelectedAmount(selectedProduct)
                    ? selectedProduct.selectedAmount || 1
                    : 1
                }}</span>
              </div>
              <div class="price-item total">
                <span>总计：</span>
                <span class="total-price">
                  {{
                    selectedProduct.isPoint
                      ? selectedProduct.pointPrice *
                        (shouldUseSelectedAmount(selectedProduct)
                          ? selectedProduct.selectedAmount || 1
                          : 1)
                      : selectedProduct.price *
                        (shouldUseSelectedAmount(selectedProduct)
                          ? selectedProduct.selectedAmount || 1
                          : 1)
                  }}
                  {{ selectedProduct.isPoint ? '积分' : '元' }}
                </span>
              </div>
            </div>
          </NCard>
        </div>

        <template #footer>
          <NSpace justify="end">
            <NButton @click="showPurchaseSidebar = false">取消</NButton>
            <NButton type="primary" @click="confirmPurchase">确认购买</NButton>
          </NSpace>
        </template>
      </NDrawerContent>
    </NDrawer>

    <!-- 二维码支付弹窗 -->
    <NModal
      v-model:show="showQrModal"
      preset="dialog"
      title="扫码支付"
      :style="{ width: '400px' }"
    >
      <div class="qr-code-container">
        <div v-if="qrCodeUrl" class="qr-code-wrapper">
          <n-qr-code
            :value="qrCodeUrl"
            alt="支付二维码"
            class="qr-code-image"
            :size="200"
            error-correction-level="M"
          />
          <p class="qr-code-tip">请使用支付宝扫描二维码完成支付</p>
          <p class="countdown-tip">
            支付窗口将在 {{ formatCountdown(countdownTime) }} 后自动关闭
          </p>
        </div>
        <div v-else class="qr-code-loading">
          <NSpin size="large" description="正在生成支付二维码..." />
        </div>
      </div>
      <template #action>
        <NButton @click="showQrModal = false">关闭</NButton>
      </template>
    </NModal>
  </div>
</template>

<script setup lang="ts">
import {
  NCard,
  NButton,
  NInputNumber,
  NIcon,
  NSpin,
  NEmpty,
  NModal,
  NDrawer,
  NDrawerContent,
  NRadioGroup,
  NRadio,
  NSpace,
} from 'naive-ui'
import { ref, onMounted, watch } from 'vue'
import { InformationCircle, InfiniteOutline } from '@vicons/ionicons5'
import { useMessage, useDialog } from 'naive-ui'
import { userApi } from '@/net'
import { Product } from '@/net/user/type'

const message = useMessage()
const dialog = useDialog()
const products = ref<Product[]>([])
const loading = ref(false)
const showQrModal = ref(false)
const qrCodeUrl = ref('')
const paymentCheckInterval = ref<number | null>(null)
const currentTradeNo = ref('')
const autoCloseTimeout = ref<number | null>(null)
const countdownTime = ref(300) // 5分钟倒计时（秒）
const showPurchaseSidebar = ref(false)
const selectedProduct = ref<Product | null>(null)

// 清除支付状态检查定时器
const clearPaymentCheck = () => {
  if (paymentCheckInterval.value) {
    clearInterval(paymentCheckInterval.value)
    paymentCheckInterval.value = null
  }
  if (autoCloseTimeout.value) {
    clearTimeout(autoCloseTimeout.value)
    autoCloseTimeout.value = null
  }
}

// 倒计时格式化函数
const formatCountdown = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 判断是否应该使用用户选择的数量
const shouldUseSelectedAmount = (product: Product) => {
  return (
    product.type === 'traffic' ||
    product.type === 'tunnel' ||
    !product.isPermanent
  )
}

// 从API获取产品数据
const fetchProducts = async () => {
  loading.value = true
  try {
    const data = await userApi.getProducts()
    if (data.code === 0 && data.data && data.data.products) {
      products.value = data.data.products.map((product) => {
        const payMethod = product.payMethod || ''
        const payMethods = payMethod.split(';')
        const isPoint =
          payMethods.includes('points') && payMethods[0] === 'points'
        return {
          ...product,
          payMethods,
          isPoint,
          selectedAmount: 1,
        }
      })
    } else {
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
      if (!product.isPoint) {
        // 金钱支付时显示二维码
        qrCodeUrl.value = data.data.qr_code
        showQrModal.value = true
        message.success('订单创建成功，请扫码支付')

        // 保存当前订单号
        currentTradeNo.value = data.data.out_trade_no

        // 清除之前的定时器（如果有）
        clearPaymentCheck()

        // 重置倒计时时间
        countdownTime.value = 300 // 5分钟

        // 循环检查支付状态
        const checkPayment = async () => {
          try {
            const payStatus = await userApi.checkPaymentStatus(
              currentTradeNo.value,
            )
            if (payStatus.code === 0) {
              // 支付成功，清除定时器并关闭弹窗
              clearPaymentCheck()
              showQrModal.value = false
              message.success('支付成功！')
              dialog.success({
                title: '购买成功',
                content: `您已成功购买：${product.name}${shouldUseSelectedAmount(product) ? `（数量：${amount}）` : ''}`,
                positiveText: '确定',
              })
            }
          } catch (error) {
            console.error('检查支付状态失败:', error)
          }
        }

        // 立即检查一次
        checkPayment()
        // 每2秒检查一次支付状态
        paymentCheckInterval.value = window.setInterval(checkPayment, 2000)

        // 5分钟后自动关闭窗口
        autoCloseTimeout.value = window.setTimeout(
          () => {
            showQrModal.value = false
            message.warning('支付窗口已超时关闭，请重新下单')
            clearPaymentCheck()
          },
          5 * 60 * 1000,
        ) // 5分钟

        // 倒计时更新（每秒更新一次）
        const countdownInterval = setInterval(() => {
          countdownTime.value--
          if (countdownTime.value <= 0) {
            clearInterval(countdownInterval)
          }
        }, 1000)

        // 监听弹窗关闭，清除倒计时
        watch(
          showQrModal,
          (newVal) => {
            if (!newVal) {
              clearInterval(countdownInterval)
            }
          },
          { immediate: false },
        )
      } else {
        // 积分支付直接成功
        dialog.success({
          title: '购买成功',
          content: `您已成功购买：${product.name}${shouldUseSelectedAmount(product) ? `（数量：${amount}）` : ''}`,
          positiveText: '确定',
        })
      }
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

// 监听弹窗关闭事件，清除定时器
watch(showQrModal, (newVal) => {
  if (!newVal) {
    clearPaymentCheck()
  }
})

// 打开购买侧边栏
const openPurchaseSidebar = (product: Product) => {
  selectedProduct.value = product
  showPurchaseSidebar.value = true
}

// 确认购买
const confirmPurchase = async () => {
  if (!selectedProduct.value) return

  // 关闭侧边栏
  showPurchaseSidebar.value = false

  // 调用原来的购买逻辑
  await handleBuy(selectedProduct.value)
}

// 在组件挂载时获取产品数据
onMounted(() => {
  fetchProducts()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/cash' as *;

.unit-label {
  text-align: center;
  color: $text-color-2;
  font-size: 12px;
  margin-top: 4px;
}

.payment-options {
  margin: 12px 0;
}

.option-label {
  margin-bottom: 8px;
  font-weight: bold;
  color: $text-color;
}

.option-buttons {
  display: flex;
}

.active {
  background-color: $primary-color !important;
}

.price-display {
  margin: 12px 0;
  font-weight: bold;
  text-align: center;
  color: $text-color;
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
  color: $primary-color;
}

/* 新增样式：无序列表样式 */
.features-list {
  padding: 0;
  margin: 12px 20px;
}

/* 新增样式：永久产品提示 */
.permanent-note {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 12px 0;
  color: $primary-color;
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
  box-shadow: $box-shadow;
}

.permanent-badge .n-icon {
  font-size: 14px;
}

/* 确保卡片有相对定位，以便永久标签可以正确定位 */
.service-card {
  position: relative;
}

/* 二维码容器样式 */
.qr-code-container {
  text-align: center;
  padding: 20px 0;
}

.qr-code-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.qr-code-image {
  border: 2px solid #f0f0f0;
  border-radius: 12px;
  padding: 16px;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.qr-code-tip {
  color: #666;
  font-size: 14px;
  margin-top: 8px;
}

.countdown-tip {
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 8px;
  font-weight: bold;
}

.qr-code-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

/* 购买侧边栏样式 */
.purchase-sidebar-content {
  padding: 16px 0;
}

.product-info {
  margin-bottom: 24px;
  padding: 16px;
  background-color: $bg-color-hover;
  border-radius: 8px;
}

.price-summary {
  text-align: center;
}

.purchase-config {
  margin-bottom: 24px;
}

/* 配置卡片样式 */
.config-card {
  margin-bottom: 12px;
}

.config-card:last-child {
  margin-bottom: 0;
}

/* 调整配置卡片内部间距 */
.config-card .n-card-header {
  padding: 12px 16px;
}

.config-card .n-card__content {
  padding: 12px 16px;
}

.config-section {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid $border-color;
}

.config-section:last-child {
  border-bottom: none;
}

.config-section h4 {
  margin-bottom: 12px;
  color: $text-color;
  font-size: 16px;
  font-weight: 600;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.unit-label {
  color: $text-color-2;
  font-size: 14px;
  white-space: nowrap;
}

.payment-options {
  margin-top: 12px;
}

.payment-note {
  margin-top: 8px;
  display: flex;
  align-items: center;
  color: #ff4d4f;
  font-size: 12px;
}

.payment-note .n-icon {
  margin-right: 4px;
}

.price-preview {
  background-color: $bg-color-hover;
  padding: 16px;
  border-radius: 8px;
}

.price-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: $text-color-2;
}

.price-item:last-child {
  margin-bottom: 0;
}

.price-item.total {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid $border-color;
  font-size: 16px;
  font-weight: 600;
  color: $text-color;
}

.total-price {
  color: #ff6b6b;
  font-size: 18px;
}

/* 支付图标样式 */
.payment-icon {
  width: 28px;
  height: 28px;
  vertical-align: middle;
  margin-right: 8px;
}
</style>
