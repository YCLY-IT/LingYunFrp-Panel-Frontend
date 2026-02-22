<template>
  <div class="node-detail-page">
    <!-- 页面头部 -->
    <n-card class="page-header-card" :bordered="false">
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
            <n-radio-button value="168">7天</n-radio-button>
          </n-radio-group>
        </n-space>
      </div>
    </n-card>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <n-spin size="large" />
    </div>

    <template v-else-if="nodeData">
      <!-- 指标卡片区域 -->
      <n-card class="metrics-section-card" :bordered="false">
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

          <div class="metric-card info">
            <div class="metric-icon">
              <n-icon size="28"><LinkOutline /></n-icon>
            </div>
            <div class="metric-info">
              <div class="metric-label">当前连接数</div>
              <div class="metric-value">{{ nodeData.cur_conns || 0 }}</div>
              <div class="metric-sub">
                最高 {{ connStats.max }} / 平均 {{ connStats.avg }}
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
                <span class="sub-item"
                  >累积↑{{ formatTraffic(nodeData.total_traffic_in) }}</span
                >
                <span class="sub-item"
                  >累积↓{{ formatTraffic(nodeData.total_traffic_out) }}</span
                >
                <span class="sub-item"
                  >总计{{
                    formatTraffic(
                      (nodeData.total_traffic_in || 0) +
                        (nodeData.total_traffic_out || 0),
                    )
                  }}</span
                >
              </div>
            </div>
          </div>
        </div>
      </n-card>

      <!-- 图表区域 -->
      <n-card class="charts-section-card" :bordered="false">
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
                    <n-icon size="18" color="#2080f0"
                      ><DesktopOutline
                    /></n-icon>
                    <span>内存使用率趋势</span>
                  </div>
                  <div ref="memoryChartRef" class="chart-content"></div>
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
              <div class="chart-grid">
                <div class="chart-card">
                  <div class="chart-title">
                    <n-icon size="18" color="#2080f0"><PeopleOutline /></n-icon>
                    <span>客户端连接趋势</span>
                  </div>
                  <div ref="clientChartRef" class="chart-content"></div>
                </div>
                <div class="chart-card">
                  <div class="chart-title">
                    <n-icon size="18" color="#d03050"><LinkOutline /></n-icon>
                    <span>连接数趋势</span>
                  </div>
                  <div ref="connChartRef" class="chart-content"></div>
                </div>
              </div>
            </n-tab-pane>

            <n-tab-pane
              name="proxyTypes"
              tab="隧道类型"
              display-directive="show"
            >
              <div class="chart-grid">
                <div class="chart-card">
                  <div class="chart-title">
                    <n-icon size="18" color="#f0a020"
                      ><GitNetworkOutline
                    /></n-icon>
                    <span>隧道类型历史趋势</span>
                  </div>
                  <div
                    ref="proxyTypeHistoryChartRef"
                    class="chart-content"
                  ></div>
                </div>
                <div class="chart-card">
                  <div class="chart-title">
                    <n-icon size="18" color="#18a058"
                      ><GitNetworkOutline
                    /></n-icon>
                    <span>隧道类型分布</span>
                  </div>
                  <div ref="proxyTypeChartRef" class="chart-content"></div>
                </div>
              </div>
            </n-tab-pane>
          </n-tabs>
        </div>
      </n-card>
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
  NCard,
} from 'naive-ui'
import {
  ArrowBackOutline,
  PeopleOutline,
  GitNetworkOutline,
  HardwareChipOutline,
  DesktopOutline,
  SwapVerticalOutline,
  LinkOutline,
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
const clientChartRef = ref<HTMLElement | null>(null)
const tunnelChartRef = ref<HTMLElement | null>(null)
const proxyTypeChartRef = ref<HTMLElement | null>(null)
const proxyTypeHistoryChartRef = ref<HTMLElement | null>(null)
const connChartRef = ref<HTMLElement | null>(null)

// 图表实例
let cpuChart: echarts.ECharts | null = null
let memoryChart: echarts.ECharts | null = null
let trafficChart: echarts.ECharts | null = null
let clientChart: echarts.ECharts | null = null
let tunnelChart: echarts.ECharts | null = null
let proxyTypeChart: echarts.ECharts | null = null
let proxyTypeHistoryChart: echarts.ECharts | null = null
let connChart: echarts.ECharts | null = null

// 获取节点ID
const nodeId = computed(() => route.params.id as string)

// 返回上一页
const goBack = () => {
  router.push('/dashboard/node-status')
}

// 获取节点数据
const fetchNodeData = async () => {
  try {
    const res: any = await userApi.getProxyStats()
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
      case 'realtime':
        initTunnelChart()
        break
      case 'connections':
        initClientChart()
        initConnChart()
        break
      case 'proxyTypes':
        initProxyTypeChart()
        initProxyTypeHistoryChart()
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

const connStats = computed(() => {
  if (!nodeHistory.value.length) return { avg: 0, max: 0 }
  const values = nodeHistory.value.map((item) => item.cur_conns || 0)
  return {
    avg: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(0),
    max: Math.max(...values),
  }
})

// 格式化流量数据（MB为单位，用于节点状态数据）
const formatTraffic = (mb: number) => {
  if (!mb || mb === 0) return '0 MB'
  if (mb < 1024) return `${mb.toFixed(2)} MB`
  if (mb < 1024 * 1024) return `${(mb / 1024).toFixed(2)} GB`
  if (mb < 1024 * 1024 * 1024) return `${(mb / (1024 * 1024)).toFixed(2)} TB`
  return `${(mb / (1024 * 1024 * 1024)).toFixed(2)} PB`
}

// 格式化速度数据
const formatSpeed = (kb: number) => {
  if (!kb || kb === 0) return '0 KB/s'
  if (kb < 1024) return `${kb.toFixed(1)} KB/s`
  return `${(kb / 1024).toFixed(2)} MB/s`
}

// 获取图表时间标签
const getTimeLabel = (recordTime: string) => {
  if (!recordTime) return ''
  return recordTime.substring(0, 19) // YYYY-MM-DD HH:mm:ss
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
  // 根据当前激活的Tab初始化对应的图表
  switch (activeTab.value) {
    case 'performance':
      initCpuChart()
      initMemoryChart()
      break
    case 'realtime':
      initTunnelChart()
      break
    case 'connections':
      initClientChart()
      initConnChart()
      break
    case 'proxyTypes':
      initProxyTypeChart()
      initProxyTypeHistoryChart()
      break
  }
}

// 初始化CPU图表
const initCpuChart = () => {
  if (!cpuChartRef.value || !nodeHistory.value.length) return

  // 检查DOM宽高
  const dom = cpuChartRef.value
  if (dom.clientWidth === 0 || dom.clientHeight === 0) return

  if (cpuChart) {
    cpuChart.dispose()
    cpuChart = null
  }

  cpuChart = echarts.init(dom)

  const { textColor, lineColor } = getChartColors()
  const times = nodeHistory.value.map((item) => getTimeLabel(item.record_time))
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
    (item) => item.record_time?.substring(0, 19) || '',
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
    (item) => item.record_time?.substring(0, 19) || '',
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

  // 检查DOM宽高
  const dom = tunnelChartRef.value
  if (dom.clientWidth === 0 || dom.clientHeight === 0) return

  if (tunnelChart) {
    tunnelChart.dispose()
    tunnelChart = null
  }

  tunnelChart = echarts.init(dom)

  const { textColor, lineColor } = getChartColors()
  const times = nodeHistory.value.map((item) => getTimeLabel(item.record_time))
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

// 初始化隧道类型饼图
const initProxyTypeChart = () => {
  if (!proxyTypeChartRef.value || !nodeData.value?.proxy_type_count) return

  // 检查DOM宽高
  const dom = proxyTypeChartRef.value
  if (dom.clientWidth === 0 || dom.clientHeight === 0) return

  if (proxyTypeChart) {
    proxyTypeChart.dispose()
    proxyTypeChart = null
  }

  proxyTypeChart = echarts.init(dom)

  const { textColor } = getChartColors()
  const proxyTypeCount = nodeData.value.proxy_type_count

  // 转换为饼图数据格式
  const pieData = Object.entries(proxyTypeCount).map(([type, count]) => ({
    name: String(type).toUpperCase(),
    value: count,
  }))

  // 颜色配置
  const colors = [
    '#18a058',
    '#2080f0',
    '#f0a020',
    '#d03050',
    '#8a2be2',
    '#ff69b4',
  ]

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
      backgroundColor: themeVars.value.cardColor,
      textStyle: { color: textColor },
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle: { color: textColor, fontSize: 12 },
      itemWidth: 10,
      itemHeight: 10,
    },
    series: [
      {
        name: '隧道类型',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: themeVars.value.cardColor,
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
            color: textColor,
          },
        },
        labelLine: {
          show: false,
        },
        data: pieData,
        color: colors,
      },
    ],
  }

  proxyTypeChart.setOption(option)
}

// 初始化隧道类型历史趋势图表
const initProxyTypeHistoryChart = () => {
  if (!proxyTypeHistoryChartRef.value || !nodeHistory.value.length) return

  // 检查DOM宽高
  const dom = proxyTypeHistoryChartRef.value
  if (dom.clientWidth === 0 || dom.clientHeight === 0) return

  if (proxyTypeHistoryChart) {
    proxyTypeHistoryChart.dispose()
    proxyTypeHistoryChart = null
  }

  proxyTypeHistoryChart = echarts.init(dom)

  const { textColor, lineColor } = getChartColors()
  const times = nodeHistory.value.map((item) => getTimeLabel(item.record_time))

  // 收集所有协议类型
  const allTypes = new Set<string>()
  nodeHistory.value.forEach((item) => {
    if (item.proxy_type_count) {
      Object.keys(item.proxy_type_count).forEach((type) => allTypes.add(type))
    }
  })

  // 颜色配置
  const colors = [
    '#18a058',
    '#2080f0',
    '#f0a020',
    '#d03050',
    '#8a2be2',
    '#ff69b4',
    '#00ced1',
    '#ff6347',
  ]

  // 为每种协议类型生成数据
  const series = Array.from(allTypes).map((type, index) => {
    const data = nodeHistory.value.map((item) => {
      return item.proxy_type_count?.[type] || 0
    })

    return {
      name: type.toUpperCase(),
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 4,
      lineStyle: { width: 2 },
      itemStyle: { color: colors[index % colors.length] },
      areaStyle: {
        opacity: 0.3,
      },
      stack: 'total',
      emphasis: {
        focus: 'series',
      },
      data: data,
    }
  })

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985',
        },
      },
      backgroundColor: themeVars.value.cardColor,
      textStyle: { color: textColor },
    },
    legend: {
      data: Array.from(allTypes).map((t) => t.toUpperCase()),
      textStyle: { color: textColor, fontSize: 12 },
      top: 8,
    },
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
      axisLabel: { color: textColor, fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { color: textColor },
      splitLine: { lineStyle: { color: lineColor, opacity: 0.3 } },
    },
    series: series,
    color: colors,
  }

  proxyTypeHistoryChart.setOption(option)
}

// 初始化连接数趋势图表
const initConnChart = () => {
  if (!connChartRef.value || !nodeHistory.value.length) return

  // 检查DOM宽高
  const dom = connChartRef.value
  if (dom.clientWidth === 0 || dom.clientHeight === 0) return

  if (connChart) {
    connChart.dispose()
    connChart = null
  }

  connChart = echarts.init(dom)

  const { textColor, lineColor } = getChartColors()
  const times = nodeHistory.value.map((item) => getTimeLabel(item.record_time))
  const data = nodeHistory.value.map((item) => item.cur_conns || 0)

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any[]) => {
        return (
          params[0].name +
          '<br/>' +
          params[0].marker +
          ' 连接数: ' +
          params[0].value
        )
      },
      backgroundColor: themeVars.value.cardColor,
      textStyle: { color: textColor },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: times,
      axisLine: { lineStyle: { color: lineColor } },
      axisLabel: { color: textColor, fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { color: textColor },
      splitLine: { lineStyle: { color: lineColor, opacity: 0.3 } },
    },
    series: [
      {
        name: '连接数',
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
        data: data,
      },
    ],
  }

  connChart.setOption(option)
}

// 处理窗口大小变化
const handleResize = () => {
  cpuChart?.resize()
  memoryChart?.resize()
  trafficChart?.resize()
  clientChart?.resize()
  tunnelChart?.resize()
  proxyTypeChart?.resize()
  proxyTypeHistoryChart?.resize()
  connChart?.resize()
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
  proxyTypeChart?.dispose()
  proxyTypeHistoryChart?.dispose()
  connChart?.dispose()
})
</script>

<style scoped lang="scss">
.node-detail-page {
  padding: 20px;
  min-height: 100%;
}

// 页面头部卡片
.page-header-card {
  margin-bottom: 16px;
  border-radius: 12px;

  :deep(.n-card__content) {
    padding: 16px 20px;
  }
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;

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

// 指标区域卡片
.metrics-section-card {
  margin-bottom: 16px;
  border-radius: 12px;

  :deep(.n-card__content) {
    padding: 20px;
  }
}

// 图表区域卡片
.charts-section-card {
  border-radius: 12px;

  :deep(.n-card__content) {
    padding: 20px;
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
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

        .sub-item {
          white-space: nowrap;
        }
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

  // 页面头部卡片移动端适配
  .page-header-card {
    margin-bottom: 12px;

    :deep(.n-card__content) {
      padding: 12px 16px;
    }
  }

  .page-header {
    flex-wrap: wrap;
    gap: 12px;

    .header-title {
      width: 100%;
      order: -1;

      h2 {
        font-size: 18px;
      }
    }

    .n-radio-group {
      width: 100%;

      .n-radio-button {
        flex: 1;
        text-align: center;
      }
    }
  }

  // 指标区域卡片移动端适配
  .metrics-section-card {
    margin-bottom: 12px;

    :deep(.n-card__content) {
      padding: 16px;
    }
  }

  .metrics-section {
    grid-template-columns: 1fr;
    gap: 12px;
    margin-bottom: 0;

    .metric-card {
      padding: 16px;
      gap: 12px;

      .metric-icon {
        width: 48px;
        height: 48px;

        .n-icon {
          font-size: 24px !important;
        }
      }

      .metric-info {
        .metric-label {
          font-size: 12px;
          margin-bottom: 4px;
        }

        .metric-value {
          font-size: 20px;

          &.speed,
          &.traffic {
            font-size: 14px;
          }
        }

        .metric-sub {
          font-size: 11px;
          margin-top: 4px;
        }
      }
    }
  }

  // 图表区域卡片移动端适配
  .charts-section-card {
    :deep(.n-card__content) {
      padding: 16px;
    }
  }

  .charts-section {
    padding: 0;
    border: none;
    background: transparent;

    .chart-tabs {
      :deep(.n-tabs-nav) {
        margin-bottom: 12px;

        .n-tabs-tab {
          padding: 8px 12px;
          font-size: 13px;
        }
      }
    }

    .chart-grid {
      grid-template-columns: 1fr;
      gap: 12px;
      height: auto;

      .chart-card {
        min-height: 280px;
        padding: 12px;

        .chart-title {
          font-size: 13px;
          margin-bottom: 8px;
        }
      }
    }
  }
}

// 小屏幕手机适配
@media (max-width: 480px) {
  .node-detail-page {
    padding: 8px;
  }

  .page-header-card {
    :deep(.n-card__content) {
      padding: 10px 12px;
    }
  }

  .page-header {
    gap: 8px;

    .header-title {
      h2 {
        font-size: 16px;
      }
    }
  }

  .metrics-section-card {
    :deep(.n-card__content) {
      padding: 12px;
    }
  }

  .metrics-section {
    .metric-card {
      padding: 12px;

      .metric-icon {
        width: 40px;
        height: 40px;

        .n-icon {
          font-size: 20px !important;
        }
      }

      .metric-info {
        .metric-value {
          font-size: 18px;

          &.speed,
          &.traffic {
            font-size: 12px;
          }
        }
      }
    }
  }

  .charts-section-card {
    :deep(.n-card__content) {
      padding: 12px;
    }
  }

  .charts-section {
    .chart-grid {
      .chart-card {
        min-height: 250px;
        padding: 10px;
      }
    }
  }
}
</style>
