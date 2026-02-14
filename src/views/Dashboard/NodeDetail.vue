<template>
  <div class="node-detail-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <n-button quaternary circle @click="goBack">
        <template #icon>
          <n-icon><ArrowBackOutline /></n-icon>
        </template>
      </n-button>
      <div class="header-title">
        <h2>{{ nodeData?.node_name || '节点详情' }}</h2>
        <n-tag
          :type="nodeData?.isOnline ? 'success' : 'error'"
          :bordered="false"
          size="small"
          round
        >
          {{ nodeData?.isOnline ? '在线' : '离线' }}
        </n-tag>
      </div>
      <n-space>
        <n-radio-group
          v-model:value="historyTimeRange"
          size="small"
          @update:value="handleTimeRangeChange"
        >
          <n-radio-button value="1">1小时</n-radio-button>
          <n-radio-button value="6">6小时</n-radio-button>
          <n-radio-button value="24">24小时</n-radio-button>
        </n-radio-group>
      </n-space>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <n-spin size="large" />
    </div>

    <template v-else-if="nodeData">
      <!-- 指标卡片区域 -->
      <div class="metrics-section">
        <div class="metric-card" :class="getCpuStatus(nodeData.cpu_usage)">
          <div class="metric-icon">
            <n-icon size="28"><HardwareChipOutline /></n-icon>
          </div>
          <div class="metric-info">
            <div class="metric-label">CPU 使用率</div>
            <div class="metric-value">
              {{ (nodeData.cpu_usage || 0).toFixed(0) }}%
            </div>
            <div class="metric-sub">
              平均 {{ cpuStats.avg }}% / 峰值 {{ cpuStats.max }}%
            </div>
          </div>
        </div>

        <div
          class="metric-card"
          :class="
            getMemoryStatus(
              nodeData.used_memory,
              nodeData.total_memory,
              nodeData.free_memory,
            )
          "
        >
          <div class="metric-icon">
            <n-icon size="28"><DesktopOutline /></n-icon>
          </div>
          <div class="metric-info">
            <div class="metric-label">内存使用率</div>
            <div class="metric-value">
              {{
                getMemoryPercentage(
                  nodeData.used_memory,
                  nodeData.total_memory,
                  nodeData.free_memory,
                ).toFixed(0)
              }}%
            </div>
            <div class="metric-sub">
              平均 {{ memoryStats.avg }}% / 峰值 {{ memoryStats.max }}%
            </div>
          </div>
        </div>

        <div class="metric-card info">
          <div class="metric-icon">
            <n-icon size="28"><PeopleOutline /></n-icon>
          </div>
          <div class="metric-info">
            <div class="metric-label">客户端连接</div>
            <div class="metric-value">{{ nodeData.client_counts || 0 }}</div>
            <div class="metric-sub">
              最高 {{ clientStats.max }} / 平均 {{ clientStats.avg }}
            </div>
          </div>
        </div>

        <div class="metric-card warning">
          <div class="metric-icon">
            <n-icon size="28"><GitNetworkOutline /></n-icon>
          </div>
          <div class="metric-info">
            <div class="metric-label">当前速度</div>
            <div class="metric-value speed">
              <span class="up"
                >↑{{ formatSpeed(nodeData.cur_rate_out_kb) }}</span
              >
              <span class="down"
                >↓{{ formatSpeed(nodeData.cur_rate_in_kb) }}</span
              >
            </div>
            <div class="metric-sub">
              最高↑ {{ speedStats.maxOut }} / 最高↓ {{ speedStats.maxIn }}
            </div>
          </div>
        </div>

        <div class="metric-card traffic">
          <div class="metric-icon">
            <n-icon size="28"><SwapVerticalOutline /></n-icon>
          </div>
          <div class="metric-info">
            <div class="metric-label">今日流量</div>
            <div class="metric-value traffic">
              <span class="up"
                >↑{{ formatTraffic(nodeData.today_in_traffic) }}</span
              >
              <span class="down"
                >↓{{ formatTraffic(nodeData.today_out_traffic) }}</span
              >
            </div>
            <div class="metric-sub">
              累计上传 {{ formatTraffic(nodeData.total_traffic_in) }}
            </div>
          </div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="charts-section">
        <n-tabs
          v-model:value="activeTab"
          type="line"
          animated
          class="chart-tabs"
          @update:value="handleTabChange"
        >
          <n-tab-pane
            name="performance"
            tab="性能监控"
            display-directive="show"
          >
            <div class="chart-grid">
              <div class="chart-card">
                <div class="chart-title">
                  <n-icon size="18" color="#18a058"
                    ><HardwareChipOutline
                  /></n-icon>
                  <span>CPU 使用率趋势</span>
                </div>
                <div ref="cpuChartRef" class="chart-content"></div>
              </div>
              <div class="chart-card">
                <div class="chart-title">
                  <n-icon size="18" color="#2080f0"><DesktopOutline /></n-icon>
                  <span>内存使用率趋势</span>
                </div>
                <div ref="memoryChartRef" class="chart-content"></div>
              </div>
            </div>
          </n-tab-pane>

          <n-tab-pane name="network" tab="网络监控" display-directive="show">
            <div class="chart-grid single">
              <div class="chart-card wide">
                <div class="chart-title">
                  <n-icon size="18" color="#f0a020"
                    ><SwapVerticalOutline
                  /></n-icon>
                  <span>流量趋势</span>
                </div>
                <div ref="trafficChartRef" class="chart-content"></div>
              </div>
            </div>
          </n-tab-pane>

          <n-tab-pane name="realtime" tab="实时速度" display-directive="show">
            <div class="chart-grid single">
              <div class="chart-card wide">
                <div class="chart-title">
                  <n-icon size="18" color="#d03050"
                    ><GitNetworkOutline
                  /></n-icon>
                  <span>当前速度趋势</span>
                </div>
                <div ref="tunnelChartRef" class="chart-content"></div>
              </div>
            </div>
          </n-tab-pane>

          <n-tab-pane
            name="connections"
            tab="连接统计"
            display-directive="show"
          >
            <div class="chart-grid single">
              <div class="chart-card wide">
                <div class="chart-title">
                  <n-icon size="18" color="#2080f0"><PeopleOutline /></n-icon>
                  <span>客户端连接趋势</span>
                </div>
                <div ref="clientChartRef" class="chart-content"></div>
              </div>
            </div>
          </n-tab-pane>
        </n-tabs>
      </div>
    </template>

    <div v-else class="empty-container">
      <n-empty description="节点不存在或暂无数据" />
      <n-button type="primary" @click="goBack" style="margin-top: 16px">
        返回节点列表
      </n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  NButton,
  NSpace,
  NTag,
  NRadioGroup,
  NRadioButton,
  NTabs,
  NTabPane,
  NSpin,
  NEmpty,
  NIcon,
} from 'naive-ui'
import {
  ArrowBackOutline,
  PeopleOutline,
  GitNetworkOutline,
  HardwareChipOutline,
  DesktopOutline,
  SwapVerticalOutline,
} from '@vicons/ionicons5'
import { userApi } from '@/net'
import * as echarts from 'echarts'
import { useThemeVars } from 'naive-ui'

const route = useRoute()
const router = useRouter()
const themeVars = useThemeVars()

// 节点数据
const nodeData = ref<any>(null)
const nodeHistory = ref<any[]>([])
const loading = ref(true)
const historyTimeRange = ref('6')
const activeTab = ref('performance')

// 图表引用
const cpuChartRef = ref<HTMLElement | null>(null)
const memoryChartRef = ref<HTMLElement | null>(null)
const trafficChartRef = ref<HTMLElement | null>(null)
const clientChartRef = ref<HTMLElement | null>(null)
const tunnelChartRef = ref<HTMLElement | null>(null)

// 图表实例
let cpuChart: echarts.ECharts | null = null
let memoryChart: echarts.ECharts | null = null
let trafficChart: echarts.ECharts | null = null
let clientChart: echarts.ECharts | null = null
let tunnelChart: echarts.ECharts | null = null

// 获取节点ID
const nodeId = computed(() => route.params.id as string)

// 返回上一页
const goBack = () => {
  router.push('/dashboard/node-status')
}

// 获取节点数据
const fetchNodeData = async () => {
  try {
    const res: any = await userApi.getStatus()
    const nodes = res.data?.nodes || []
    nodeData.value = nodes.find((n: any) => n.id === parseInt(nodeId.value))
  } catch (error) {
    console.error('获取节点数据失败:', error)
  }
}

// 获取节点历史数据
const fetchNodeHistory = async (hours: number = 6) => {
  try {
    const res: any = await userApi.getNodeHistory(parseInt(nodeId.value), hours)
    nodeHistory.value = Array.isArray(res) ? res : res?.data || []
    // 使用 setTimeout 确保 DOM 完全渲染后再初始化图表
    setTimeout(() => {
      initAllCharts()
    }, 100)
  } catch (error) {
    console.error('获取历史数据失败:', error)
    nodeHistory.value = []
  }
}

// 处理时间范围变化
const handleTimeRangeChange = async (val: string) => {
  await fetchNodeHistory(parseInt(val))
}

// 处理 Tab 切换
const handleTabChange = (tabName: string) => {
  activeTab.value = tabName
  // 延迟初始化图表，确保 DOM 已渲染
  setTimeout(() => {
    switch (tabName) {
      case 'performance':
        initCpuChart()
        initMemoryChart()
        break
      case 'network':
        initTrafficChart()
        break
      case 'realtime':
        initTunnelChart()
        break
      case 'connections':
        initClientChart()
        break
    }
  }, 50)
}

// 计算统计数据
const cpuStats = computed(() => {
  if (!nodeHistory.value.length) return { avg: 0, max: 0 }
  const values = nodeHistory.value.map((item) => item.cpu_usage || 0)
  return {
    avg: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1),
    max: Math.max(...values).toFixed(1),
  }
})

const memoryStats = computed(() => {
  if (!nodeHistory.value.length) return { avg: 0, max: 0 }
  const values = nodeHistory.value.map((item) => {
    const total =
      item.total_memory || (item.used_memory || 0) + (item.free_memory || 0)
    // 如果 used_memory 值太小，使用 total - free_memory 计算
    const used =
      item.used_memory && item.used_memory > 0.01
        ? item.used_memory
        : item.free_memory !== undefined
          ? Math.max(0, total - item.free_memory)
          : 0
    return total > 0 ? (used / total) * 100 : 0
  })
  return {
    avg: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1),
    max: Math.max(...values).toFixed(1),
  }
})

const clientStats = computed(() => {
  if (!nodeHistory.value.length) return { avg: 0, max: 0 }
  const values = nodeHistory.value.map((item) => item.client_counts || 0)
  return {
    avg: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(0),
    max: Math.max(...values),
  }
})

const speedStats = computed(() => {
  if (!nodeHistory.value.length) return { maxIn: '0 KB/s', maxOut: '0 KB/s' }
  const inValues = nodeHistory.value.map((item) => item.cur_rate_in_kb || 0)
  const outValues = nodeHistory.value.map((item) => item.cur_rate_out_kb || 0)
  return {
    maxIn: formatSpeed(Math.max(...inValues)),
    maxOut: formatSpeed(Math.max(...outValues)),
  }
})

// 格式化流量数据
const formatTraffic = (mb: number) => {
  if (!mb || mb === 0) return '0 MB'
  if (mb < 1024) return `${mb.toFixed(2)} MB`
  if (mb < 1024 * 1024) return `${(mb / 1024).toFixed(2)} GB`
  return `${(mb / (1024 * 1024)).toFixed(2)} TB`
}

// 格式化速度数据
const formatSpeed = (kb: number) => {
  if (!kb || kb === 0) return '0 KB/s'
  if (kb < 1024) return `${kb.toFixed(1)} KB/s`
  return `${(kb / 1024).toFixed(2)} MB/s`
}

// 获取CPU状态
const getCpuStatus = (usage: number) => {
  const percentage = usage || 0
  if (percentage >= 80) return 'error'
  if (percentage >= 50) return 'warning'
  return 'success'
}

// 获取内存使用状态
const getMemoryStatus = (used: number, total: number, free?: number) => {
  const percentage = getMemoryPercentage(used, total, free)
  if (percentage >= 80) return 'error'
  if (percentage >= 50) return 'warning'
  return 'success'
}

// 获取内存使用百分比
const getMemoryPercentage = (used: number, total: number, free?: number) => {
  if (!total || total === 0) return 0
  // 如果 used 值太小（可能是数据问题），使用 total - free 计算
  const effectiveUsed =
    used && used > 0.01
      ? used
      : free !== undefined
        ? Math.max(0, total - free)
        : 0
  return Math.min((effectiveUsed / total) * 100, 100)
}

// 获取图表主题色
const getChartColors = () => {
  const textColor = themeVars.value.textColorBase || 'rgba(0, 0, 0, 0.88)'
  const lineColor = themeVars.value.borderColor || 'rgba(0, 0, 0, 0.1)'
  const cardBg = themeVars.value.cardColor || '#fff'
  return { textColor, lineColor, cardBg }
}

// 初始化所有图表
const initAllCharts = () => {
  initCpuChart()
  initMemoryChart()
  initTrafficChart()
  initClientChart()
  initTunnelChart()
}

// 初始化CPU图表
const initCpuChart = () => {
  if (!cpuChartRef.value || !nodeHistory.value.length) return

  if (cpuChart) {
    cpuChart.dispose()
    cpuChart = null
  }

  cpuChart = echarts.init(cpuChartRef.value)

  const { textColor, lineColor } = getChartColors()
  const times = nodeHistory.value.map(
    (item) => item.record_time?.substring(11, 16) || '',
  )
  const data = nodeHistory.value.map((item) => item.cpu_usage?.toFixed(1) || 0)

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>CPU使用率: {c}%',
      backgroundColor: themeVars.value.cardColor,
      borderColor: lineColor,
      textStyle: { color: textColor },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true,
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100,
        zoomOnMouseWheel: true,
        moveOnMouseWheel: true,
        moveOnMouseMove: true,
      },
    ],
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: times,
      axisLine: { lineStyle: { color: lineColor } },
      axisLabel: { color: textColor, fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLine: { show: false },
      axisLabel: { color: textColor, formatter: '{value}%' },
      splitLine: { lineStyle: { color: lineColor, opacity: 0.3 } },
    },
    series: [
      {
        name: 'CPU使用率',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 3, color: '#18a058' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(24, 160, 88, 0.4)' },
            { offset: 1, color: 'rgba(24, 160, 88, 0.05)' },
          ]),
        },
        data: data,
      },
    ],
  }

  cpuChart.setOption(option)
}

// 初始化内存图表
const initMemoryChart = () => {
  if (!memoryChartRef.value || !nodeHistory.value.length) return

  if (memoryChart) {
    memoryChart.dispose()
    memoryChart = null
  }

  memoryChart = echarts.init(memoryChartRef.value)

  const { textColor, lineColor } = getChartColors()
  const times = nodeHistory.value.map(
    (item) => item.record_time?.substring(11, 16) || '',
  )
  const data = nodeHistory.value.map((item) => {
    const total =
      item.total_memory || (item.used_memory || 0) + (item.free_memory || 0)
    // 如果 used_memory 值太小，使用 total - free_memory 计算
    const used =
      item.used_memory && item.used_memory > 0.01
        ? item.used_memory
        : item.free_memory !== undefined
          ? Math.max(0, total - item.free_memory)
          : 0
    return total > 0 ? ((used / total) * 100).toFixed(1) : 0
  })

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>内存使用率: {c}%',
      backgroundColor: themeVars.value.cardColor,
      borderColor: lineColor,
      textStyle: { color: textColor },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true,
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100,
        zoomOnMouseWheel: true,
        moveOnMouseWheel: true,
        moveOnMouseMove: true,
      },
    ],
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: times,
      axisLine: { lineStyle: { color: lineColor } },
      axisLabel: { color: textColor, fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLine: { show: false },
      axisLabel: { color: textColor, formatter: '{value}%' },
      splitLine: { lineStyle: { color: lineColor, opacity: 0.3 } },
    },
    series: [
      {
        name: '内存使用率',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 3, color: '#2080f0' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(32, 128, 240, 0.4)' },
            { offset: 1, color: 'rgba(32, 128, 240, 0.05)' },
          ]),
        },
        data: data,
      },
    ],
  }

  memoryChart.setOption(option)
}

// 初始化流量图表
const initTrafficChart = () => {
  if (!trafficChartRef.value || !nodeHistory.value.length) return

  if (trafficChart) {
    trafficChart.dispose()
    trafficChart = null
  }

  trafficChart = echarts.init(trafficChartRef.value)

  const { textColor, lineColor } = getChartColors()
  const times = nodeHistory.value.map(
    (item) => item.record_time?.substring(11, 16) || '',
  )
  const uploadData = nodeHistory.value.map((item) => item.today_in_traffic || 0)
  const downloadData = nodeHistory.value.map(
    (item) => item.today_out_traffic || 0,
  )

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        let result = params[0].axisValue + '<br/>'
        params.forEach((param: any) => {
          result +=
            param.marker +
            param.seriesName +
            ': ' +
            formatTraffic(param.value) +
            '<br/>'
        })
        return result
      },
      backgroundColor: themeVars.value.cardColor,
      borderColor: lineColor,
      textStyle: { color: textColor },
    },
    legend: {
      data: ['上传流量', '下载流量'],
      textStyle: { color: textColor },
      top: 0,
      right: 10,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true,
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100,
        zoomOnMouseWheel: true,
        moveOnMouseWheel: true,
        moveOnMouseMove: true,
      },
    ],
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: times,
      axisLine: { lineStyle: { color: lineColor } },
      axisLabel: { color: textColor, fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: {
        color: textColor,
        formatter: (value: number) => formatTraffic(value),
      },
      splitLine: { lineStyle: { color: lineColor, opacity: 0.3 } },
    },
    series: [
      {
        name: '上传流量',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: '#d03050' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(208, 48, 80, 0.3)' },
            { offset: 1, color: 'rgba(208, 48, 80, 0.05)' },
          ]),
        },
        data: uploadData,
      },
      {
        name: '下载流量',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: '#36ad6a' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(54, 173, 106, 0.3)' },
            { offset: 1, color: 'rgba(54, 173, 106, 0.05)' },
          ]),
        },
        data: downloadData,
      },
    ],
  }

  trafficChart.setOption(option)
}

// 初始化客户端图表
const initClientChart = () => {
  if (!clientChartRef.value || !nodeHistory.value.length) return

  if (clientChart) {
    clientChart.dispose()
    clientChart = null
  }

  clientChart = echarts.init(clientChartRef.value)

  const { textColor, lineColor } = getChartColors()
  const times = nodeHistory.value.map(
    (item) => item.record_time?.substring(11, 16) || '',
  )
  const data = nodeHistory.value.map((item) => item.client_counts || 0)

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>客户端数: {c}',
      backgroundColor: themeVars.value.cardColor,
      borderColor: lineColor,
      textStyle: { color: textColor },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true,
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100,
        zoomOnMouseWheel: true,
        moveOnMouseWheel: true,
        moveOnMouseMove: true,
      },
    ],
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: times,
      axisLine: { lineStyle: { color: lineColor } },
      axisLabel: { color: textColor, fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLine: { show: false },
      axisLabel: { color: textColor },
      splitLine: { lineStyle: { color: lineColor, opacity: 0.3 } },
    },
    series: [
      {
        name: '客户端数',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 3, color: '#2080f0' },
        itemStyle: { color: '#2080f0' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(32, 128, 240, 0.3)' },
            { offset: 1, color: 'rgba(32, 128, 240, 0.05)' },
          ]),
        },
        data: data,
      },
    ],
  }

  clientChart.setOption(option)
}

// 初始化速度图表
const initTunnelChart = () => {
  if (!tunnelChartRef.value || !nodeHistory.value.length) return

  if (tunnelChart) {
    tunnelChart.dispose()
    tunnelChart = null
  }

  tunnelChart = echarts.init(tunnelChartRef.value)

  const { textColor, lineColor } = getChartColors()
  const times = nodeHistory.value.map(
    (item) => item.record_time?.substring(11, 16) || '',
  )
  const inData = nodeHistory.value.map((item) => item.cur_rate_in_kb || 0)
  const outData = nodeHistory.value.map((item) => item.cur_rate_out_kb || 0)

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any[]) => {
        let result = params[0].name + '<br/>'
        params.forEach((param) => {
          result +=
            param.marker +
            ' ' +
            param.seriesName +
            ': ' +
            formatSpeed(param.value) +
            '<br/>'
        })
        return result
      },
      backgroundColor: themeVars.value.cardColor,
      borderColor: lineColor,
      textStyle: { color: textColor },
    },
    legend: {
      data: ['上传速度', '下载速度'],
      textStyle: { color: textColor, fontSize: 10 },
      top: 0,
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100,
        zoomOnMouseWheel: true,
        moveOnMouseMove: true,
        moveOnMouseWheel: true,
      },
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: times,
      axisLine: { lineStyle: { color: lineColor } },
      axisLabel: { color: textColor, fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: {
        color: textColor,
        formatter: (value: number) => formatSpeed(value),
      },
      splitLine: { lineStyle: { color: lineColor, opacity: 0.3 } },
    },
    series: [
      {
        name: '上传速度',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: { width: 2, color: '#d03050' },
        itemStyle: { color: '#d03050' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(208, 48, 80, 0.3)' },
            { offset: 1, color: 'rgba(208, 48, 80, 0.05)' },
          ]),
        },
        data: outData,
      },
      {
        name: '下载速度',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: { width: 2, color: '#36ad6a' },
        itemStyle: { color: '#36ad6a' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(54, 173, 106, 0.3)' },
            { offset: 1, color: 'rgba(54, 173, 106, 0.05)' },
          ]),
        },
        data: inData,
      },
    ],
  }

  tunnelChart.setOption(option)
}

// 处理窗口大小变化
const handleResize = () => {
  cpuChart?.resize()
  memoryChart?.resize()
  trafficChart?.resize()
  clientChart?.resize()
  tunnelChart?.resize()
}

// 监听主题变化
watch(
  () => themeVars.value,
  () => {
    setTimeout(() => {
      initAllCharts()
    }, 50)
  },
  { deep: true },
)

// 组件挂载
onMounted(async () => {
  loading.value = true
  await fetchNodeData()
  if (nodeData.value) {
    await fetchNodeHistory(6)
  }
  loading.value = false
  window.addEventListener('resize', handleResize)
})

// 组件卸载
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  cpuChart?.dispose()
  memoryChart?.dispose()
  trafficChart?.dispose()
  clientChart?.dispose()
  tunnelChart?.dispose()
})
</script>

<style scoped lang="scss">
.node-detail-page {
  padding: 20px;
  min-height: 100%;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(128, 128, 128, 0.1);

  .header-title {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 12px;

    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
    }
  }
}

.loading-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.metrics-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 24px;

  .metric-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    border-radius: 12px;
    background: rgba(128, 128, 128, 0.04);
    border: 1px solid rgba(128, 128, 128, 0.06);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    &.success {
      background: rgba(24, 160, 88, 0.06);
      border-color: rgba(24, 160, 88, 0.15);
      .metric-icon {
        color: #18a058;
      }
    }

    &.warning {
      background: rgba(240, 160, 32, 0.06);
      border-color: rgba(240, 160, 32, 0.15);
      .metric-icon {
        color: #f0a020;
      }
    }

    &.error {
      background: rgba(208, 48, 80, 0.06);
      border-color: rgba(208, 48, 80, 0.15);
      .metric-icon {
        color: #d03050;
      }
    }

    &.info {
      background: rgba(32, 128, 240, 0.06);
      border-color: rgba(32, 128, 240, 0.15);
      .metric-icon {
        color: #2080f0;
      }
    }

    &.traffic {
      background: rgba(144, 96, 240, 0.06);
      border-color: rgba(144, 96, 240, 0.15);
      .metric-icon {
        color: #9060f0;
      }
    }

    .metric-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .metric-info {
      flex: 1;
      min-width: 0;

      .metric-label {
        font-size: 13px;
        color: rgba(128, 128, 128, 0.8);
        margin-bottom: 6px;
      }

      .metric-value {
        font-size: 24px;
        font-weight: 700;
        color: rgba(0, 0, 0, 0.85);
        line-height: 1.2;

        &.speed,
        &.traffic {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 16px;

          .up {
            color: #d03050;
          }
          .down {
            color: #36ad6a;
          }
        }
      }

      .metric-sub {
        font-size: 12px;
        color: rgba(128, 128, 128, 0.6);
        margin-top: 6px;
      }
    }
  }
}

.charts-section {
  background: rgba(128, 128, 128, 0.02);
  border-radius: 12px;
  border: 1px solid rgba(128, 128, 128, 0.06);
  padding: 20px;

  .chart-tabs {
    :deep(.n-tabs-nav) {
      margin-bottom: 16px;
    }

    :deep(.n-tab-pane) {
      padding: 0;
    }
  }

  .chart-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    height: 400px;

    &.single {
      grid-template-columns: 1fr;
    }

    .chart-card {
      background: rgba(128, 128, 128, 0.03);
      border-radius: 12px;
      padding: 16px;
      border: 1px solid rgba(128, 128, 128, 0.06);
      display: flex;
      flex-direction: column;

      &.wide {
        grid-column: 1 / -1;
      }

      .chart-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 12px;
        color: rgba(0, 0, 0, 0.7);
      }

      .chart-content {
        flex: 1;
        min-height: 0;
        width: 100%;
      }
    }
  }
}

// 响应式调整
@media (max-width: 768px) {
  .node-detail-page {
    padding: 12px;
  }

  .page-header {
    flex-wrap: wrap;
    gap: 12px;

    .header-title {
      width: 100%;
      order: -1;
    }
  }

  .metrics-section {
    grid-template-columns: 1fr;
  }

  .charts-section {
    .chart-grid {
      grid-template-columns: 1fr;
      height: auto;

      .chart-card {
        min-height: 300px;
      }
    }
  }
}
</style>
