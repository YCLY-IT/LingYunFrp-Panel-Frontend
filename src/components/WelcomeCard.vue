<template>
  <div class="flex items-center p-0 w-full">
    <div
      class="relative w-full! min-w-0! max-w-full! min-h-[250px] rounded-2xl overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.08)] bg-white m-0 max-[600px]:min-h-[180px] max-[600px]:p-0 max-[600px]:rounded-[10px]"
      ref="cardRef"
    >
      <!-- 背景图片 -->
      <img
        class="w-full h-full object-cover absolute inset-0 z-[1]"
        src="/images/bg.png"
        alt="背景"
      />

      <!-- 内容层 -->
      <div
        class="relative z-[2] w-full h-full p-[24px_18px_18px_18px] flex flex-col justify-between box-border max-[600px]:p-[10px_12px_8px_12px] max-[600px]:gap-2"
      >
        <!-- 顶部：欢迎语和天气 -->
        <div
          class="flex w-full justify-between items-start max-[600px]:flex-row! max-[600px]:items-start! max-[600px]:justify-between! max-[600px]:gap-2 max-[350px]:flex-col! max-[350px]:items-start! max-[350px]:justify-start! max-[350px]:gap-1"
        >
          <div
            class="text-xl font-bold text-[#00334e] tracking-[1px] font-['msyh',sans-serif] max-[600px]:text-[15px] max-[600px]:mb-0.5"
          >
            欢迎来到 <span class="text-[var(--n-primary-color)] font-bold max-[600px]:text-[15px]">LingYunFrp</span>
          </div>
          <div
            class="flex items-start gap-2.5 max-[600px]:mt-1 max-[600px]:gap-1.5"
          >
            <img
              :src="weatherIconSrc"
              :alt="weatherStore.weatherInfo.weather"
              class="w-[38px] h-[38px] mt-0.5 max-[600px]:w-7 max-[600px]:h-7 max-[600px]:mt-0"
            />
            <div
              class="flex flex-col text-[13px] text-[#00334e] gap-0.5 max-[600px]:text-[11px]"
            >
              <div>{{ weatherStore.weatherInfo.weather }}</div>
              <div
                class="text-[11px] text-[#00334e] flex gap-2.5 max-[600px]:text-[10px] max-[600px]:gap-1.5"
              >
                <span>温度: {{ weatherStore.weatherInfo.temp }}℃</span>
                <span>湿度: {{ weatherStore.weatherInfo.humidity }}%RH</span>
              </div>
              <div
                class="text-[11px] text-[#00334e] flex gap-2.5 max-[600px]:text-[10px] max-[600px]:gap-1.5"
              >
                <span
                  >风向: {{ weatherStore.weatherInfo.winddirection }}方</span
                >
                <span>风力: {{ weatherStore.weatherInfo.windpower }}级</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 中部：自定义文字 -->
        <div class="flex w-full justify-center mt-2.5 max-[600px]:mt-1" v-if="customText">
          <span
            class="text-lg text-[var(--n-primary-color)] font-['msyh',sans-serif] font-bold tracking-[1px] max-[600px]:text-[13px]"
            >{{ customText }}</span
          >
        </div>

        <!-- 底部：访问信息 -->
        <div
          class="flex w-full justify-between items-end mt-[18px] max-[600px]:flex-row! max-[600px]:items-start! max-[600px]:justify-between! max-[600px]:gap-2 max-[350px]:flex-col! max-[350px]:items-start! max-[350px]:justify-start! max-[350px]:gap-1"
        >
          <div class="flex flex-col gap-1.5 max-[600px]:gap-[3px]">
            <div
              class="flex items-center gap-1.5 text-xs text-[#00334e] font-['msyh',sans-serif] max-[600px]:text-[10px] max-[600px]:gap-1"
            >
              <img
                src="/icon/ico/IP.png"
                class="w-4 h-4 align-middle max-[600px]:w-[13px] max-[600px]:h-[13px]"
              />
              <span>{{ visitorInfo.ip }}</span>
            </div>
            <div
              class="flex items-center gap-1.5 text-xs text-[#00334e] font-['msyh',sans-serif] max-[600px]:text-[10px] max-[600px]:gap-1"
            >
              <img
                src="/icon/ico/system.png"
                class="w-4 h-4 align-middle max-[600px]:w-[13px] max-[600px]:h-[13px]"
              />
              <span>{{ visitorInfo.os }}</span>
            </div>
            <div
              class="flex items-center gap-1.5 text-xs text-[#00334e] font-['msyh',sans-serif] max-[600px]:text-[10px] max-[600px]:gap-1"
            >
              <img
                src="/icon/ico/bro.png"
                class="w-4 h-4 align-middle max-[600px]:w-[13px] max-[600px]:h-[13px]"
              />
              <span>{{ visitorInfo.browser }}</span>
            </div>
            <div
              class="flex items-center gap-1.5 text-xs text-[#00334e] font-['msyh',sans-serif] max-[600px]:text-[10px] max-[600px]:gap-1"
            >
              <img
                src="/icon/ico/local.png"
                class="w-4 h-4 align-middle max-[600px]:w-[13px] max-[600px]:h-[13px]"
              />
              <span>{{ location }}</span>
            </div>
          </div>
          <div class="flex flex-col gap-1.5 max-[600px]:gap-[3px]">
            <div
              class="flex items-center gap-1.5 text-xs text-[#00334e] font-['msyh',sans-serif] max-[600px]:text-[10px] max-[600px]:gap-1"
            >
              <img
                src="/icon/ico/time.png"
                class="w-4 h-4 align-middle max-[600px]:w-[13px] max-[600px]:h-[13px]"
              />
              <span>{{ currentDate }}</span>
            </div>
            <div
              class="flex items-center gap-1.5 text-xs text-[#00334e] font-['msyh',sans-serif] max-[600px]:text-[10px] max-[600px]:gap-1"
            >
              <span>更新时间: {{ weatherStore.weatherInfo.reporttime }}</span>
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
import { useWeatherStore } from '@/stores/weather'

const message = useMessage()
const weatherStore = useWeatherStore()

// 响应式数据
const customText = ref('')

// 访问者信息
const visitorInfo = ref({
  ip: '',
  os: '',
  browser: '',
  province: '',
  city: '',
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
  const weather = weatherStore.weatherInfo.weather
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
    const { location } = await weatherStore.getVisitorInfo()

    visitorInfo.value = {
      ip: location.ip,
      os: visitorInfo.value.os, // 保持原有的系统信息
      browser: visitorInfo.value.browser, // 保持原有的浏览器信息
      province: location.province,
      city: location.city,
    }
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
