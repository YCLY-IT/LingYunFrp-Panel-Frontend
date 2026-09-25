<template>
  <div class="p-5 min-h-full max-md:p-3 max-[480px]:p-2">
    <!-- 页面头部 -->
    <n-card
      class="page-header-card mb-4 rounded-xl [&_.n-card-content]:p-[16px_20px] max-md:mb-3 max-md:[&_.n-card-content]:p-[12px_16px] max-[480px]:[&_.n-card-content]:p-[10px_12px]"
      :bordered="false"
    >
      <div
        class="page-header flex items-center gap-4 max-md:flex-wrap max-md:gap-3 max-md:[&_.n-radio-group]:w-full max-md:[&_.n-radio-button]:flex-1 max-md:[&_.n-radio-button]:text-center max-[480px]:gap-2"
      >
        <n-button quaternary circle @click="goBack">
          <template #icon>
            <n-icon><ArrowBackOutline /></n-icon>
          </template>
        </n-button>
        <div
          class="header-title flex-1 flex items-center gap-3 [&_h2]:m-0 [&_h2]:text-xl [&_h2]:font-semibold max-md:w-full max-md:order-[-1] max-md:[&_h2]:text-lg max-[480px]:[&_h2]:text-base"
        >
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
    <div
      v-if="loading"
      class="flex flex-col items-center justify-center min-h-[400px]"
    >
      <n-spin size="large" />
    </div>

    <template v-else-if="nodeData">
      <!-- 指标卡片区域 -->
      <n-card
        class="metrics-section-card mb-4 rounded-xl [&_.n-card-content]:p-5 max-md:mb-3 max-md:[&_.n-card-content]:p-4 max-[480px]:[&_.n-card-content]:p-3"
        :bordered="false"
      >
        <div
          class="metrics-section grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4 mb-6 max-md:grid-cols-1 max-md:gap-3 max-md:mb-0"
        >
          <div
            class="metric-card flex items-center gap-4 p-5 rounded-xl bg-[rgba(128,128,128,0.04)] border border-[rgba(128,128,128,0.06)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] max-md:p-4 max-md:gap-3 max-[480px]:p-3"
            :class="getCpuStatus(nodeData.cpu_usage)"
          >
            <div class="metric-icon w-14 h-14 rounded-xl bg-white/50 flex items-center justify-center shrink-0 max-md:w-12 max-md:h-12 max-md:[&_.n-icon]:text-2xl! max-[480px]:w-10 max-[480px]:h-10 max-[480px]:[&_.n-icon]:text-xl!">
              <n-icon size="28"><HardwareChipOutline /></n-icon>
            </div>
            <div class="metric-info flex-1 min-w-0">
              <div class="metric-label text-[13px] text-[rgba(128,128,128,0.8)] mb-1.5 max-md:text-xs max-md:mb-1">CPU 使用率</div>
              <div class="metric-value text-2xl font-bold text-black/85 leading-[1.2] max-md:text-xl max-[480px]:text-lg">
                {{ (nodeData.cpu_usage || 0).toFixed(0) }}%
              </div>
              <div class="metric-sub text-xs text-[rgba(128,128,128,0.6)] mt-1.5 flex flex-wrap gap-2 max-md:text-[11px] max-md:mt-1">
                平均 {{ cpuStats.avg }}% / 峰值 {{ cpuStats.max }}%
              </div>
            </div>
          </div>

          <div
            class="metric-card flex items-center gap-4 p-5 rounded-xl bg-[rgba(128,128,128,0.04)] border border-[rgba(128,128,128,0.06)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] max-md:p-4 max-md:gap-3 max-[480px]:p-3"
            :class="
              getMemoryStatus(
                nodeData.used_memory,
                nodeData.total_memory,
                nodeData.free_memory,
              )
            "
          >
            <div class="metric-icon w-14 h-14 rounded-xl bg-white/50 flex items-center justify-center shrink-0 max-md:w-12 max-md:h-12 max-md:[&_.n-icon]:text-2xl! max-[480px]:w-10 max-[480px]:h-10 max-[480px]:[&_.n-icon]:text-xl!">
              <n-icon size="28"><DesktopOutline /></n-icon>
            </div>
            <div class="metric-info flex-1 min-w-0">
              <div class="metric-label text-[13px] text-[rgba(128,128,128,0.8)] mb-1.5 max-md:text-xs max-md:mb-1">内存使用率</div>
              <div class="metric-value text-2xl font-bold text-black/85 leading-[1.2] max-md:text-xl max-[480px]:text-lg">
                {{
                  getMemoryPercentage(
                    nodeData.used_memory,
                    nodeData.total_memory,
                    nodeData.free_memory,
                  ).toFixed(0)
                }}%
              </div>
              <div class="metric-sub text-xs text-[rgba(128,128,128,0.6)] mt-1.5 flex flex-wrap gap-2 max-md:text-[11px] max-md:mt-1">
                平均 {{ memoryStats.avg }}% / 峰值 {{ memoryStats.max }}%
              </div>
            </div>
          </div>

          <div class="metric-card flex items-center gap-4 p-5 rounded-xl bg-[rgba(128,128,128,0.04)] border border-[rgba(128,128,128,0.06)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] max-md:p-4 max-md:gap-3 max-[480px]:p-3 bg-[var(--n-primary-color-tint)]! border-[var(--n-primary-color-line)]! [&_.metric-icon]:text-[var(--n-primary-color)]">
            <div class="metric-icon w-14 h-14 rounded-xl bg-white/50 flex items-center justify-center shrink-0 max-md:w-12 max-md:h-12 max-md:[&_.n-icon]:text-2xl! max-[480px]:w-10 max-[480px]:h-10 max-[480px]:[&_.n-icon]:text-xl!">
              <n-icon size="28"><PeopleOutline /></n-icon>
            </div>
            <div class="metric-info flex-1 min-w-0">
              <div class="metric-label text-[13px] text-[rgba(128,128,128,0.8)] mb-1.5 max-md:text-xs max-md:mb-1">客户端连接</div>
              <div class="metric-value text-2xl font-bold text-black/85 leading-[1.2] max-md:text-xl max-[480px]:text-lg">{{ nodeData.client_counts || 0 }}</div>
              <div class="metric-sub text-xs text-[rgba(128,128,128,0.6)] mt-1.5 flex flex-wrap gap-2 max-md:text-[11px] max-md:mt-1">
                最高 {{ clientStats.max }} / 平均 {{ clientStats.avg }}
              </div>
            </div>
          </div>

          <div class="metric-card flex items-center gap-4 p-5 rounded-xl bg-[rgba(128,128,128,0.04)] border border-[rgba(128,128,128,0.06)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] max-md:p-4 max-md:gap-3 max-[480px]:p-3 bg-[var(--n-primary-color-tint)]! border-[var(--n-primary-color-line)]! [&_.metric-icon]:text-[var(--n-primary-color)]">
            <div class="metric-icon w-14 h-14 rounded-xl bg-white/50 flex items-center justify-center shrink-0 max-md:w-12 max-md:h-12 max-md:[&_.n-icon]:text-2xl! max-[480px]:w-10 max-[480px]:h-10 max-[480px]:[&_.n-icon]:text-xl!">
              <n-icon size="28"><LinkOutline /></n-icon>
            </div>
            <div class="metric-info flex-1 min-w-0">
              <div class="metric-label text-[13px] text-[rgba(128,128,128,0.8)] mb-1.5 max-md:text-xs max-md:mb-1">当前连接数</div>
              <div class="metric-value text-2xl font-bold text-black/85 leading-[1.2] max-md:text-xl max-[480px]:text-lg">{{ nodeData.cur_conns || 0 }}</div>
              <div class="metric-sub text-xs text-[rgba(128,128,128,0.6)] mt-1.5 flex flex-wrap gap-2 max-md:text-[11px] max-md:mt-1">
                最高 {{ connStats.max }} / 平均 {{ connStats.avg }}
              </div>
            </div>
          </div>

          <div class="metric-card flex items-center gap-4 p-5 rounded-xl bg-[rgba(128,128,128,0.04)] border border-[rgba(128,128,128,0.06)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] max-md:p-4 max-md:gap-3 max-[480px]:p-3 bg-[rgba(240,160,32,0.06)]! border-[rgba(240,160,32,0.15)]! [&_.metric-icon]:text-[#f0a020]">
            <div class="metric-icon w-14 h-14 rounded-xl bg-white/50 flex items-center justify-center shrink-0 max-md:w-12 max-md:h-12 max-md:[&_.n-icon]:text-2xl! max-[480px]:w-10 max-[480px]:h-10 max-[480px]:[&_.n-icon]:text-xl!">
              <n-icon size="28"><GitNetworkOutline /></n-icon>
            </div>
            <div class="metric-info flex-1 min-w-0">
              <div class="metric-label text-[13px] text-[rgba(128,128,128,0.8)] mb-1.5 max-md:text-xs max-md:mb-1">当前速度</div>
              <div class="metric-value text-base font-bold leading-[1.2] flex flex-col gap-1 max-md:text-sm max-[480px]:text-xs">
                <span class="text-[#d03050]"
                  >↑{{ formatSpeed(nodeData.cur_rate_out_kb) }}</span
                >
                <span class="text-[#36ad6a]"
                  >↓{{ formatSpeed(nodeData.cur_rate_in_kb) }}</span
                >
              </div>
              <div class="metric-sub text-xs text-[rgba(128,128,128,0.6)] mt-1.5 flex flex-wrap gap-2 max-md:text-[11px] max-md:mt-1">
                最高↑ {{ speedStats.maxOut }} / 最高↓ {{ speedStats.maxIn }}
              </div>
            </div>
          </div>

          <div class="metric-card flex items-center gap-4 p-5 rounded-xl bg-[rgba(128,128,128,0.04)] border border-[rgba(128,128,128,0.06)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] max-md:p-4 max-md:gap-3 max-[480px]:p-3 bg-[rgba(144,96,240,0.06)]! border-[rgba(144,96,240,0.15)]! [&_.metric-icon]:text-[#9060f0]">
            <div class="metric-icon w-14 h-14 rounded-xl bg-white/50 flex items-center justify-center shrink-0 max-md:w-12 max-md:h-12 max-md:[&_.n-icon]:text-2xl! max-[480px]:w-10 max-[480px]:h-10 max-[480px]:[&_.n-icon]:text-xl!">
              <n-icon size="28"><SwapVerticalOutline /></n-icon>
            </div>
            <div class="metric-info flex-1 min-w-0">
              <div class="metric-label text-[13px] text-[rgba(128,128,128,0.8)] mb-1.5 max-md:text-xs max-md:mb-1">今日流量</div>
              <div class="metric-value text-base font-bold leading-[1.2] flex flex-col gap-1 max-md:text-sm max-[480px]:text-xs">
                <span class="text-[#d03050]"
                  >↑{{ formatTraffic(nodeData.today_in_traffic) }}</span
                >
                <span class="text-[#36ad6a]"
                  >↓{{ formatTraffic(nodeData.today_out_traffic) }}</span
                >
              </div>
              <div class="metric-sub text-xs text-[rgba(128,128,128,0.6)] mt-1.5 flex flex-wrap gap-2 max-md:text-[11px] max-md:mt-1">
                <span class="whitespace-nowrap"
                  >累积↑{{ formatTraffic(nodeData.total_traffic_in) }}</span
                >
                <span class="whitespace-nowrap"
                  >累积↓{{ formatTraffic(nodeData.total_traffic_out) }}</span
                >
                <span class="whitespace-nowrap"
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
      <n-card
        class="charts-section-card rounded-xl [&_.n-card-content]:p-5 max-md:[&_.n-card-content]:p-4 max-[480px]:[&_.n-card-content]:p-3"
        :bordered="false"
      >
        <div
          class="charts-section bg-[rgba(128,128,128,0.02)] rounded-xl border border-[rgba(128,128,128,0.06)] p-5 max-md:p-0 max-md:border-none max-md:bg-transparent"
        >
          <n-tabs
            v-model:value="activeTab"
            type="line"
            animated
            class="[&_.n-tabs-nav]:mb-4 [&_.n-tab-pane]:p-0 max-md:[&_.n-tabs-nav]:mb-3 max-md:[&_.n-tabs-nav_.n-tabs-tab]:p-[8px_12px] max-md:[&_.n-tabs-nav_.n-tabs-tab]:text-[13px]"
            @update:value="handleTabChange"
          >
            <n-tab-pane
              name="performance"
              tab="性能监控"
              display-directive="show"
            >
              <div
                class="grid grid-cols-2 gap-5 h-[400px] max-md:grid-cols-1 max-md:gap-3 max-md:h-auto"
              >
                <div
                  class="chart-card bg-[rgba(128,128,128,0.03)] rounded-xl p-4 border border-[rgba(128,128,128,0.06)] flex flex-col max-md:min-h-[280px] max-md:p-3 max-[480px]:min-h-[250px] max-[480px]:p-2.5"
                >
                  <div
                    class="chart-title flex items-center gap-2 text-sm font-semibold mb-3 text-black/70 max-md:text-[13px] max-md:mb-2"
                  >
                    <n-icon size="18" color="#18a058"
                      ><HardwareChipOutline
                    /></n-icon>
                    <span>CPU 使用率趋势</span>
                  </div>
                  <div ref="cpuChartRef" class="chart-content flex-1 min-h-0 w-full"></div>
                </div>
                <div
                  class="chart-card bg-[rgba(128,128,128,0.03)] rounded-xl p-4 border border-[rgba(128,128,128,0.06)] flex flex-col max-md:min-h-[280px] max-md:p-3 max-[480px]:min-h-[250px] max-[480px]:p-2.5"
                >
                  <div
                    class="chart-title flex items-center gap-2 text-sm font-semibold mb-3 text-black/70 max-md:text-[13px] max-md:mb-2"
                  >
                    <n-icon size="18" color="var(--n-primary-color)"
                      ><DesktopOutline
                    /></n-icon>
                    <span>内存使用率趋势</span>
                  </div>
                  <div ref="memoryChartRef" class="chart-content flex-1 min-h-0 w-full"></div>
                </div>
              </div>
            </n-tab-pane>

            <n-tab-pane name="realtime" tab="实时速度" display-directive="show">
              <div class="grid grid-cols-1 gap-5 h-[400px] max-md:gap-3 max-md:h-auto">
                <div
                  class="chart-card bg-[rgba(128,128,128,0.03)] rounded-xl p-4 border border-[rgba(128,128,128,0.06)] flex flex-col col-span-full max-md:min-h-[280px] max-md:p-3 max-[480px]:min-h-[250px] max-[480px]:p-2.5"
                >
                  <div
                    class="chart-title flex items-center gap-2 text-sm font-semibold mb-3 text-black/70 max-md:text-[13px] max-md:mb-2"
                  >
                    <n-icon size="18" color="#d03050"
                      ><GitNetworkOutline
                    /></n-icon>
                    <span>当前速度趋势</span>
                  </div>
                  <div ref="tunnelChartRef" class="chart-content flex-1 min-h-0 w-full"></div>
                </div>
              </div>
            </n-tab-pane>

            <n-tab-pane
              name="connections"
              tab="连接统计"
              display-directive="show"
            >
              <div
                class="grid grid-cols-2 gap-5 h-[400px] max-md:grid-cols-1 max-md:gap-3 max-md:h-auto"
              >
                <div
                  class="chart-card bg-[rgba(128,128,128,0.03)] rounded-xl p-4 border border-[rgba(128,128,128,0.06)] flex flex-col max-md:min-h-[280px] max-md:p-3 max-[480px]:min-h-[250px] max-[480px]:p-2.5"
                >
                  <div
                    class="chart-title flex items-center gap-2 text-sm font-semibold mb-3 text-black/70 max-md:text-[13px] max-md:mb-2"
                  >
                    <n-icon size="18" color="var(--n-primary-color)"><PeopleOutline /></n-icon>
                    <span>客户端连接趋势</span>
                  </div>
                  <div ref="clientChartRef" class="chart-content flex-1 min-h-0 w-full"></div>
                </div>
                <div
                  class="chart-card bg-[rgba(128,128,128,0.03)] rounded-xl p-4 border border-[rgba(128,128,128,0.06)] flex flex-col max-md:min-h-[280px] max-md:p-3 max-[480px]:min-h-[250px] max-[480px]:p-2.5"
                >
                  <div
                    class="chart-title flex items-center gap-2 text-sm font-semibold mb-3 text-black/70 max-md:text-[13px] max-md:mb-2"
                  >
                    <n-icon size="18" color="#d03050"><LinkOutline /></n-icon>
                    <span>连接数趋势</span>
                  </div>
                  <div ref="connChartRef" class="chart-content flex-1 min-h-0 w-full"></div>
                </div>
              </div>
            </n-tab-pane>

            <n-tab-pane
              name="proxyTypes"
              tab="隧道类型"
              display-directive="show"
            >
              <div
                class="grid grid-cols-2 gap-5 h-[400px] max-md:grid-cols-1 max-md:gap-3 max-md:h-auto"
              >
                <div
                  class="chart-card bg-[rgba(128,128,128,0.03)] rounded-xl p-4 border border-[rgba(128,128,128,0.06)] flex flex-col max-md:min-h-[280px] max-md:p-3 max-[480px]:min-h-[250px] max-[480px]:p-2.5"
                >
                  <div
                    class="chart-title flex items-center gap-2 text-sm font-semibold mb-3 text-black/70 max-md:text-[13px] max-md:mb-2"
                  >
                    <n-icon size="18" color="#f0a020"
                      ><GitNetworkOutline
                    /></n-icon>
                    <span>隧道类型历史趋势</span>
                  </div>
                  <div
                    ref="proxyTypeHistoryChartRef"
                    class="chart-content flex-1 min-h-0 w-full"
                  ></div>
                </div>
                <div
                  class="chart-card bg-[rgba(128,128,128,0.03)] rounded-xl p-4 border border-[rgba(128,128,128,0.06)] flex flex-col max-md:min-h-[280px] max-md:p-3 max-[480px]:min-h-[250px] max-[480px]:p-2.5"
                >
                  <div
                    class="chart-title flex items-center gap-2 text-sm font-semibold mb-3 text-black/70 max-md:text-[13px] max-md:mb-2"
                  >
                    <n-icon size="18" color="#18a058"
                      ><GitNetworkOutline
                    /></n-icon>
                    <span>隧道类型分布</span>
                  </div>
                  <div ref="proxyTypeChartRef" class="chart-content flex-1 min-h-0 w-full"></div>
                </div>
              </div>
            </n-tab-pane>
          </n-tabs>
        </div>
      </n-card>
    </template>

    <div
      v-else
      class="flex flex-col items-center justify-center min-h-[400px]"
    >
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
const METRIC_STATUS_CLASS = {
  error:
    'bg-[rgba(208,48,80,0.06)]! border-[rgba(208,48,80,0.15)]! [&_.metric-icon]:text-[#d03050]',
  warning:
    'bg-[rgba(240,160,32,0.06)]! border-[rgba(240,160,32,0.15)]! [&_.metric-icon]:text-[#f0a020]',
  success:
    'bg-[rgba(24,160,88,0.06)]! border-[rgba(24,160,88,0.15)]! [&_.metric-icon]:text-[#18a058]',
} as const

const getCpuStatus = (usage: number) => {
  const percentage = usage || 0
  if (percentage >= 80) return METRIC_STATUS_CLASS.error
  if (percentage >= 50) return METRIC_STATUS_CLASS.warning
  return METRIC_STATUS_CLASS.success
}

// 获取内存使用状态
const getMemoryStatus = (used: number, total: number, free?: number) => {
  const percentage = getMemoryPercentage(used, total, free)
  if (percentage >= 80) return METRIC_STATUS_CLASS.error
  if (percentage >= 50) return METRIC_STATUS_CLASS.warning
  return METRIC_STATUS_CLASS.success
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
  clientChart?.dispose()
  tunnelChart?.dispose()
  proxyTypeChart?.dispose()
  proxyTypeHistoryChart?.dispose()
  connChart?.dispose()
})
</script>


