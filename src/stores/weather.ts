import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  weatherService,
  type WeatherInfo,
  type LocationInfo,
} from '@/utils/weatherService'

/**
 * 天气数据缓存 Store
 *
 * 功能特性：
 * 1. 自动缓存天气和位置信息，避免重复请求
 * 2. 缓存有效期 5 分钟
 * 3. 支持强制刷新数据
 * 4. 防止并发请求
 *
 * 使用示例：
 * ```ts
 * const weatherStore = useWeatherStore()
 *
 * // 获取数据（优先使用缓存）
 * const { location, weather } = await weatherStore.getVisitorInfo()
 *
 * // 强制刷新数据
 * const { location, weather } = await weatherStore.refreshData()
 *
 * // 清除缓存
 * weatherStore.clearCache()
 * ```
 */
export const useWeatherStore = defineStore('weather', () => {
  // 状态
  const weatherInfo = ref<WeatherInfo>({
    weather: '未知',
    temp: '--',
    humidity: '--',
    winddirection: '--',
    windpower: '--',
    reporttime: '--',
  })

  const locationInfo = ref<LocationInfo>({
    ip: '',
    province: '',
    city: '',
  })

  const isLoading = ref(false)
  const lastFetchTime = ref<number>(0)
  const cacheExpireTime = 5 * 60 * 1000 // 5分钟缓存过期时间

  // 计算属性
  const isCacheValid = computed(() => {
    return Date.now() - lastFetchTime.value < cacheExpireTime
  })

  const hasData = computed(() => {
    return locationInfo.value.ip && weatherInfo.value.weather !== '未知'
  })

  /**
   * 获取访问者信息（带缓存）
   * @param forceRefresh 是否强制刷新，忽略缓存
   * @returns Promise<{ location: LocationInfo; weather: WeatherInfo }>
   */
  const getVisitorInfo = async (forceRefresh = false) => {
    // 如果缓存有效且不是强制刷新，直接返回缓存数据
    if (!forceRefresh && isCacheValid.value && hasData.value) {
      console.log('使用缓存的天气数据')
      return {
        location: locationInfo.value,
        weather: weatherInfo.value,
      }
    }

    // 如果正在加载中，等待加载完成
    if (isLoading.value) {
      console.log('等待其他请求完成...')
      return new Promise<{ location: LocationInfo; weather: WeatherInfo }>(
        (resolve) => {
          const checkLoading = () => {
            if (!isLoading.value) {
              resolve({
                location: locationInfo.value,
                weather: weatherInfo.value,
              })
            } else {
              setTimeout(checkLoading, 100)
            }
          }
          checkLoading()
        },
      )
    }

    // 开始加载
    console.log('开始获取天气数据...')
    isLoading.value = true

    try {
      const { location, weather } = await weatherService.getVisitorInfo()

      // 更新状态
      locationInfo.value = location
      weatherInfo.value = weather
      lastFetchTime.value = Date.now()

      console.log('天气数据获取成功，已缓存')
      return { location, weather }
    } catch (error) {
      console.error('获取访问者信息失败:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 清除缓存
   */
  const clearCache = () => {
    lastFetchTime.value = 0
    console.log('天气数据缓存已清除')
  }

  /**
   * 强制刷新数据
   */
  const refreshData = () => {
    console.log('强制刷新天气数据')
    return getVisitorInfo(true)
  }

  return {
    // 状态
    weatherInfo,
    locationInfo,
    isLoading,
    lastFetchTime,

    // 计算属性
    isCacheValid,
    hasData,

    // 方法
    getVisitorInfo,
    clearCache,
    refreshData,
  }
})
