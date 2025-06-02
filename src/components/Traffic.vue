<template>
  <div class="traffic-trend-container">
    <n-card title="流量趋势分析">
      <template #header-extra>
        <n-space>
           <n-select
            v-model:value="days" 
            :options="dayOptions" 
            style="width: 120px" 
            @update:value="fetchData" 
          />
          <n-button type="primary" @click="fetchData" :loading="loading">
            <template #icon>
              <n-icon><RefreshIcon /></n-icon>
            </template>
            刷新数据
          </n-button>
        </n-space>
      </template>
      
      <n-spin :show="loading">
        <div ref="chartContainer" style="width: 100%; height: 400px;"></div>
      </n-spin>
      
      <template #footer>
        <n-space justify="space-between">
          <n-statistic label="总入站流量" :value="totalInTraffic" suffix="MB" />
          <n-statistic label="总出站流量" :value="totalOutTraffic" suffix="MB" />
          <n-statistic label="数据点数" :value="chartData.length" />
        </n-space>
        <p style="color: #999; font-size: 12px;">数据可能会延迟十分钟</p>
      </template>
    </n-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick, computed, onUnmounted } from 'vue'
import { 
  NCard, 
  NInputNumber, 
  NButton, 
  NIcon, 
  NSpin, 
  NSpace, 
  NStatistic,
  NSelect,
  useMessage 
} from 'naive-ui'
import { Refresh as RefreshIcon } from '@vicons/ionicons5'
import * as echarts from 'echarts'
import { userApi } from '@/net'
import { accessHandle } from '@/net/base'
import { TrafficData } from '@/types'

// 响应式数据
const days = ref(7)
const loading = ref(false)
const chartData = ref<TrafficData[]>([]);
const chartContainer = ref(null)
const message = useMessage()

let chartInstance: echarts.ECharts | null = null

const formatTraffic = (traffic: number) => {
  const value = traffic
  if (isNaN(value)) return traffic
  if (value >= 1024) {
    return `${(value / 1024).toFixed(2)} GB`
  }
  return `${value.toFixed(2)} MB`
}
// 计算属性
const totalInTraffic = computed(() => {
  return formatTraffic(chartData.value.reduce((sum, item) => sum + item.inTraffic, 0))
})

const totalOutTraffic = computed(() => {
  return formatTraffic(chartData.value.reduce((sum, item) => sum + item.outTraffic, 0))
})

// 天数选项
const dayOptions = ref([
  { label: '1 天', value: 1 },
  { label: '7 天', value: 7 },
  { label: '30 天', value: 30 },
  { label: '90 天', value: 90 },
])

// 获取数据的模拟函数
const fetchData = async () => {
  loading.value = true
  try {
    userApi.get('/user/info/trafficTrend?day='+ days.value, accessHandle(), async (data) => {
    chartData.value = data.data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    await nextTick()
    updateChart()
    }, (error) => {
      message.error('数据加载失败: ' + error)
  })
  } catch (error) {
    message.error('请求失败: ' + error)
  } finally {
    loading.value = false
  }
}

// 初始化图表
const initChart = () => {
  if (chartContainer.value) {
    chartInstance = echarts.init(chartContainer.value)
    
    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      chartInstance?.resize()
    })
  }
}

// 更新图表
const updateChart = () => {
  if (!chartInstance || !chartData.value.length) return

  const dates = chartData.value.map(item => item.date)
  const inTrafficData = chartData.value.map(item => item.inTraffic)
  const outTrafficData = chartData.value.map(item => item.outTraffic)

  const option = {
    title: {
        text: '流量趋势图',
        left: 'center',
        textStyle: {
            fontSize: 16,
            fontWeight: 'normal'
        }
    },
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'cross',
            label: {
                backgroundColor: '#6a7985'
            }
        },
        formatter: function(params) {
            let result = `<div style="margin-bottom: 5px;">${params[0].axisValue}</div>`;
            params.forEach(param => {
                result += `<div style="display: flex; align-items: center; margin-bottom: 3px;">
                    <span style="display: inline-block; width: 10px; height: 10px; background-color: ${param.color}; border-radius: 50%; margin-right: 8px;"></span>
                    <span style="margin-right: 20px;">${param.seriesName}:</span>
                    <span style="font-weight: bold;">${param.value} MB</span>
                </div>`;
            });
            return result;
        }
    },
    legend: {
        data: ['入站流量', '出站流量'],
        top: 30
    },
    grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true
    },
    xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates,
        axisLabel: {
            formatter: function(value) {
                return value.substring(5); // 只显示月-日
            }
        }
    },
    yAxis: {
        type: 'value',
        axisLabel: {
            formatter: '{value} MB'
        }
    },
    series: [
                  // 入站流量配置修改
            {
                name: '入站流量',
                type: 'line',
                stack: 'Total',
                emphasis: {
                    focus: 'series'
                },
                data: inTrafficData,
                smooth: true,
                itemStyle: {
                    color: '#18a058'
                },
                areaStyle: { // 合并后的areaStyle
                    opacity: 0.6,
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(24, 160, 88, 0.8)' },
                        { offset: 1, color: 'rgba(24, 160, 88, 0.1)' }
                    ])
                }
            },
            {
                name: '出站流量',
                type: 'line',
                stack: 'Total',
                emphasis: {
                    focus: 'series'
                },
                data: outTrafficData,
                smooth: true,
                itemStyle: {
                    color: '#2080f0'
                },
                areaStyle: { // 合并后的areaStyle
                    opacity: 0.6,
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(32, 128, 240, 0.8)' },
                        { offset: 1, color: 'rgba(32, 128, 240, 0.1)' }
                    ])
                }
            }
    ]
};

  chartInstance.setOption(option)
}

// 组件挂载时初始化
onMounted(async () => {
  await nextTick()
  initChart()
  fetchData()
})

// 组件卸载时清理
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  window.removeEventListener('resize', () => {
    chartInstance?.resize()
  })
})
</script>

<style scoped>
.traffic-trend-container {
  width: 100%;
}

:deep(.n-card-header) {
  padding-bottom: 12px;
}

:deep(.n-statistic) {
  text-align: center;
}

:deep(.n-statistic .n-statistic-value) {
  font-size: 18px;
  font-weight: 600;
}
</style>