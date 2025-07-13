<template>
  <div class="welcome-card">
    <div class="card-container" ref="cardRef">
      <!-- 背景图片 -->
      <img class="bg-img" src="/images/bg.png" alt="背景" />

      <!-- 内容层 -->
      <div class="content-layer">
        <!-- 顶部：欢迎语和天气 -->
        <div class="row top-row">
          <div class="welcome-title">
            欢迎来到 <span class="brand">LingYunFrp</span>
          </div>
          <div class="weather-box">
            <img
              :src="weatherIconSrc"
              :alt="weatherInfo.weather"
              class="weather-icon"
            />
            <div class="weather-info">
              <div>{{ weatherInfo.weather }}</div>
              <div class="weather-detail">
                <span>温度: {{ weatherInfo.temp }}℃</span>
                <span>湿度: {{ weatherInfo.humidity }}%RH</span>
              </div>
              <div class="weather-detail">
                <span>风向: {{ weatherInfo.winddirection }}方</span>
                <span>风力: {{ weatherInfo.windpower }}级</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 中部：自定义文字 -->
        <div class="row custom-row" v-if="customText">
          <span class="custom-text">{{ customText }}</span>
        </div>

        <!-- 底部：访问信息 -->
        <div class="row bottom-row">
          <div class="info-list">
            <div class="info-item">
              <img src="/icon/ico/IP.png" class="info-icon" />
              <span>{{ visitorInfo.ip }}</span>
            </div>
            <div class="info-item">
              <img src="/icon/ico/system.png" class="info-icon" />
              <span>{{ visitorInfo.os }}</span>
            </div>
            <div class="info-item">
              <img src="/icon/ico/bro.png" class="info-icon" />
              <span>{{ visitorInfo.browser }}</span>
            </div>
            <div class="info-item">
              <img src="/icon/ico/local.png" class="info-icon" />
              <span>{{ location }}</span>
            </div>
          </div>
          <div class="date-list">
            <div class="info-item">
              <img src="/icon/ico/time.png" class="info-icon" />
              <span>{{ currentDate }}</span>
            </div>
            <div class="info-item">
              <span>更新时间: {{ weatherInfo.reporttime }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useMessage } from 'naive-ui'
import { weatherService } from '@/utils/weatherService'

const message = useMessage()

// 响应式数据
const cardRef = ref<HTMLElement>()
const customText = ref('')

// 访问者信息
const visitorInfo = ref({
  ip: '',
  os: '',
  browser: '',
  province: '',
  city: '',
})

// 天气信息
const weatherInfo = ref({
  weather: '未知',
  temp: '--',
  humidity: '--',
  winddirection: '--',
  windpower: '--',
  reporttime: '--',
})

// 计算属性
const currentDate = computed(() => {
  const now = new Date()
  const weekArray = ['日', '一', '二', '三', '四', '五', '六']
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const date = now.getDate()
  const week = weekArray[now.getDay()]
  return `${year}年${month}月${date}日 星期${week}`
})

const location = computed(() => {
  return `${visitorInfo.value.province}-${visitorInfo.value.city}`
})

const weatherIconSrc = computed(() => {
  const weather = weatherInfo.value.weather
  if (weather.includes('晴')) return '/icon/weather/sunny.png'
  if (weather.includes('云')) return '/icon/weather/dyun.png'
  if (weather.includes('阴')) return '/icon/weather/yin.png'
  if (weather.includes('雾')) return '/icon/weather/wu.png'
  if (weather.includes('雨')) return '/icon/weather/rain.png'
  if (weather.includes('雪')) return '/icon/weather/snow.png'
  if (weather.includes('风')) return '/icon/weather/sha.png'
  return '/icon/weather/unknow.png'
})

// 获取浏览器信息
const getBrowser = (): string => {
  const ua = navigator.userAgent

  if (ua.includes('Chrome')) {
    const match = ua.match(/Chrome\/([0-9.]+)/)
    return `Chrome(${match?.[1] || 'unknown'})`
  }
  if (ua.includes('Firefox')) {
    const match = ua.match(/Firefox\/([0-9.]+)/)
    return `Firefox(${match?.[1] || 'unknown'})`
  }
  if (ua.includes('Safari') && !ua.includes('Chrome')) {
    const match = ua.match(/Version\/([0-9.]+)/)
    return `Safari(${match?.[1] || 'unknown'})`
  }
  if (ua.includes('Edge')) {
    const match = ua.match(/Edge\/([0-9.]+)/)
    return `Edge(${match?.[1] || 'unknown'})`
  }
  if (ua.includes('MSIE') || ua.includes('Trident')) {
    const match = ua.match(/MSIE ([0-9.]+)/) || ua.match(/rv:([0-9.]+)/)
    return `Internet Explorer(${match?.[1] || 'unknown'})`
  }

  return '未知浏览器'
}

// 获取操作系统信息
const getOS = (): string => {
  const ua = navigator.userAgent

  if (ua.includes('Windows')) {
    if (ua.includes('Windows NT 10.0')) return 'Windows 10'
    if (ua.includes('Windows NT 6.3')) return 'Windows 8.1'
    if (ua.includes('Windows NT 6.2')) return 'Windows 8'
    if (ua.includes('Windows NT 6.1')) return 'Windows 7'
    if (ua.includes('Windows NT 6.0')) return 'Windows Vista'
    if (ua.includes('Windows NT 5.1')) return 'Windows XP'
    return 'Windows'
  }
  if (ua.includes('Mac OS X')) {
    const match = ua.match(/Mac OS X ([0-9._]+)/)
    return `Mac OS X(${match?.[1]?.replace(/_/g, '.') || 'unknown'})`
  }
  if (ua.includes('Linux')) {
    if (ua.includes('Android')) {
      const match = ua.match(/Android ([0-9.]+)/)
      return `Android(${match?.[1] || 'unknown'})`
    }
    return 'Linux'
  }
  if (ua.includes('iPhone')) {
    const match = ua.match(/OS ([0-9._]+)/)
    return `iOS(${match?.[1]?.replace(/_/g, '.') || 'unknown'})`
  }
  if (ua.includes('iPad')) {
    const match = ua.match(/OS ([0-9._]+)/)
    return `iPadOS(${match?.[1]?.replace(/_/g, '.') || 'unknown'})`
  }

  return '未知系统'
}

// 获取访问者信息
const getVisitorInfo = async () => {
  try {
    const { location, weather } = await weatherService.getVisitorInfo()

    visitorInfo.value = {
      ip: location.ip,
      os: visitorInfo.value.os, // 保持原有的系统信息
      browser: visitorInfo.value.browser, // 保持原有的浏览器信息
      province: location.province,
      city: location.city,
    }

    weatherInfo.value = weather
  } catch (error) {
    console.error('获取访问者信息失败:', error)
    message.error('获取访问者信息失败')
  }
}

// 初始化访问者信息
const initVisitorInfo = () => {
  visitorInfo.value.browser = getBrowser()
  visitorInfo.value.os = getOS()
}

// 组件挂载时初始化
onMounted(() => {
  initVisitorInfo()
  getVisitorInfo()
})
</script>

<style lang="scss" scoped>
.welcome-card {
  display: flex;
  align-items: center;
  padding: 0;
  width: 100%;
}

.card-container {
  position: relative;
  width: 100% !important;
  min-width: 0 !important;
  max-width: 100% !important;
  min-height: 250px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  background: #fff;
  margin: 0;
}

.bg-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  inset: 0;
  z-index: 1;
}

.content-layer {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  padding: 24px 18px 18px 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
}

.row {
  display: flex;
  width: 100%;
}

.top-row {
  justify-content: space-between;
  align-items: flex-start;
}

.welcome-title {
  font-size: 20px;
  font-weight: bold;
  color: #00334e;
  letter-spacing: 1px;
  font-family: 'msyh', sans-serif;
}

.brand {
  color: #1976d2;
  font-weight: bold;
}

.weather-box {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.weather-icon {
  width: 38px;
  height: 38px;
  margin-top: 2px;
}

.weather-info {
  display: flex;
  flex-direction: column;
  font-size: 13px;
  color: #00334e;
  gap: 2px;
}

.weather-detail {
  font-size: 11px;
  color: #00334e;
  display: flex;
  gap: 10px;
}

.custom-row {
  justify-content: center;
  margin: 10px 0 0 0;
}

.custom-text {
  font-size: 18px;
  color: #1976d2;
  font-family: 'msyh', sans-serif;
  font-weight: bold;
  letter-spacing: 1px;
}

.bottom-row {
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 18px;
}

.info-list,
.date-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #00334e;
  font-family: 'msyh', sans-serif;
}

.info-icon {
  width: 16px;
  height: 16px;
  vertical-align: middle;
}

/* ----------- 移动端样式 ----------- */
@media (max-width: 600px) {
  .card-container {
    width: 100% !important;
    min-width: 0 !important;
    min-height: 180px;
    padding: 0;
    border-radius: 10px;
  }
  .content-layer {
    padding: 10px 12px 8px 12px; // 增加左右内边距
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .row {
    width: 100%;
  }
  .top-row,
  .bottom-row {
    flex-direction: row !important; // 保持左右分布
    align-items: flex-start !important;
    justify-content: space-between !important;
    gap: 8px;
    width: 100%;
  }
  .welcome-title {
    font-size: 15px;
    margin-bottom: 2px;
  }
  .brand {
    font-size: 15px;
  }
  .weather-box {
    margin-top: 4px;
    gap: 6px;
  }
  .weather-icon {
    width: 28px;
    height: 28px;
    margin-top: 0;
  }
  .weather-info {
    font-size: 11px;
  }
  .weather-detail {
    font-size: 10px;
    gap: 6px;
  }
  .custom-row {
    margin: 4px 0 0 0;
  }
  .custom-text {
    font-size: 13px;
  }
  .info-list,
  .date-list {
    gap: 3px;
  }
  .info-item {
    font-size: 10px;
    gap: 4px;
  }
  .info-icon {
    width: 13px;
    height: 13px;
  }
}

@media (max-width: 350px) {
  .top-row,
  .bottom-row {
    flex-direction: column !important;
    align-items: flex-start !important;
    justify-content: flex-start !important;
    gap: 4px;
  }
}
</style>
