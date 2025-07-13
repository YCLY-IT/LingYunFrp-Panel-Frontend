// 天气服务工具类
import { get } from '@/net/request'

export interface WeatherInfo {
  weather: string
  temp: string
  humidity: string
  winddirection: string
  windpower: string
  reporttime: string
}

export interface LocationInfo {
  ip: string
  province: string
  city: string
  adcode?: string
}

class WeatherService {
  /**
   * 获取IP地址和位置信息
   */
  async getLocationInfo(ip?: string): Promise<LocationInfo> {
    try {
      // 如果没有提供IP，使用当前访问者的IP
      const targetIp = ip || (await this.getCurrentIP())

      // 如果是本地IP，直接返回默认位置
      if (
        targetIp === '127.0.0.1' ||
        targetIp.startsWith('192.168.') ||
        targetIp.startsWith('10.')
      ) {
        return {
          ip: targetIp,
          province: '北京市',
          city: '北京市',
          adcode: 'beijing',
        }
      }

      // 使用ip-api.com获取位置信息（免费且无需密钥）
      const data = await get<any>(
        `http://ip-api.com/json/${targetIp}?lang=zh-CN`,
      )

      if (data.status === 'success') {
        return {
          ip: targetIp,
          province: data.regionName || '未知',
          city: data.city || '未知',
          adcode: data.city || '', // 使用城市名作为标识
        }
      } else {
        throw new Error('位置信息获取失败')
      }
    } catch (error) {
      console.error('获取位置信息失败:', error)
      return {
        ip: ip || '未知',
        province: '未知',
        city: '未知',
      }
    }
  }

  /**
   * 获取天气信息
   */
  async getWeatherInfo(location: string): Promise<WeatherInfo> {
    try {
      // 使用wttr.in API获取天气信息（免费且无需密钥）
      const data = await get<any>(
        `https://wttr.in/${encodeURIComponent(location)}?format=j1`,
      )

      if (data.current_condition && data.current_condition.length > 0) {
        const current = data.current_condition[0]
        const windDirMap: Record<string, string> = {
          N: '北风',
          NNE: '北东北风',
          NE: '东北风',
          ENE: '东东北风',
          E: '东风',
          ESE: '东东南风',
          SE: '东南风',
          SSE: '南东南风',
          S: '南风',
          SSW: '南西南风',
          SW: '西南风',
          WSW: '西西南风',
          W: '西风',
          WNW: '西西北风',
          NW: '西北风',
          NNW: '北西北风',
        }
        return {
          weather:
            current.lang_zh?.[0]?.value ||
            current.weatherDesc?.[0]?.value ||
            '未知',
          temp: current.temp_C || '--',
          humidity: current.humidity || '--',
          winddirection:
            windDirMap[current.winddir16Point] ||
            current.winddir16Point ||
            '--',
          windpower: current.windspeedKmph
            ? `${current.windspeedKmph}级`
            : '--',
          reporttime: current.observation_time || new Date().toLocaleString(),
        }
      } else {
        throw new Error('天气数据为空')
      }
    } catch (error) {
      console.error('获取天气信息失败:', error)
      // 返回默认天气信息
      return {
        weather: '晴',
        temp: '25',
        humidity: '60',
        winddirection: '东',
        windpower: '3',
        reporttime: new Date().toLocaleString(),
      }
    }
  }

  /**
   * 获取当前IP地址
   */
  private async getCurrentIP(): Promise<string> {
    try {
      // 只保留可用的IP查询服务
      const services = [
        'https://api.ipify.org?format=json',
        'https://ipinfo.io/json',
      ]

      for (const service of services) {
        try {
          const data = await get<any>(service)
          if (data.ip) {
            return data.ip
          }
        } catch (error) {
          console.warn(`IP查询服务 ${service} 失败:`, error)
          continue
        }
      }

      // 如果所有服务都失败，返回本地IP
      console.warn('所有IP查询服务都失败，使用本地IP')
      return '127.0.0.1'
    } catch (error) {
      console.error('获取当前IP失败:', error)
      return '127.0.0.1'
    }
  }

  /**
   * 获取完整的访问者信息（位置+天气）
   */
  async getVisitorInfo(ip?: string): Promise<{
    location: LocationInfo
    weather: WeatherInfo
  }> {
    const location = await this.getLocationInfo(ip)
    let weather: WeatherInfo

    if (location.city && location.city !== '未知') {
      weather = await this.getWeatherInfo(location.city)
    } else {
      // 如果没有城市信息，使用默认天气
      weather = {
        weather: '晴',
        temp: '25',
        humidity: '60',
        winddirection: '东',
        windpower: '3',
        reporttime: new Date().toLocaleString(),
      }
    }

    return { location, weather }
  }
}

export const weatherService = new WeatherService()
