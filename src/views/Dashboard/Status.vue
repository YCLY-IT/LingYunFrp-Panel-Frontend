<template>
  <div
    class="node-status-container max-md:p-2 max-md:[&_.n-grid]:grid-cols-1! max-md:[&_.n-card-header__extra_.n-space]:gap-2! max-md:[&_.n-card-header__extra_.n-button]:text-xs max-[600px]:[&_.n-grid]:grid-cols-1! max-[480px]:[&_.n-pagination_.n-pagination-item]:min-w-7 max-[480px]:[&_.n-pagination_.n-pagination-item]:h-7 max-[480px]:[&_.n-pagination_.n-pagination-item]:text-xs max-md:[&_.node-card_.n-card-header]:p-[12px_16px] max-md:[&_.node-card_.n-card-content]:p-3 max-md:[&_.stat-card]:mb-2 max-md:[&_.stat-card_.n-statistic__label]:text-xs max-md:[&_.stat-card_.n-statistic-value]:text-xl"
  >
    <n-card
      title="节点状态监控"
      class="node-card rounded-xl shadow-[0_2px_8px_rgba(128,128,128,0.15)]"
    >
      <template #header-extra>
        <n-space>
          <n-button @click="toggleView" secondary size="small">
            <template #icon>
              <component
                :is="viewMode === 'table' ? GridOutline : ListOutline"
              />
            </template>
            {{ viewMode === 'table' ? '卡片视图' : '表格视图' }}
          </n-button>
          <n-button
            @click="refreshData"
            secondary
            circle
            size="small"
            :loading="loading"
          >
            <template #icon>
              <RefreshOutline />
            </template>
          </n-button>
        </n-space>
      </template>

      <n-space vertical size="large">
        <!-- 节点状态统计 -->
        <n-grid :cols="5" :x-gap="16" :y-gap="16" responsive="screen">
          <n-gi>
            <n-card embedded class="stat-card rounded-lg transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(128,128,128,0.2)] mb-0">
              <n-statistic label="在线节点" :value="onlineNodesCount">
                <template #prefix>
                  <n-icon color="#18a058">
                    <CheckmarkCircleOutline />
                  </n-icon>
                </template>
              </n-statistic>
            </n-card>
          </n-gi>
          <n-gi>
            <n-card embedded class="stat-card rounded-lg transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(128,128,128,0.2)] mb-0">
              <n-statistic label="总客户端数" :value="totalClients">
                <template #prefix>
                  <n-icon color="var(--n-primary-color)">
                    <PeopleOutline />
                  </n-icon>
                </template>
              </n-statistic>
            </n-card>
          </n-gi>
          <n-gi>
            <n-card embedded class="stat-card rounded-lg transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(128,128,128,0.2)] mb-0">
              <n-statistic label="总隧道数" :value="totalTunnels">
                <template #prefix>
                  <n-icon color="#f0a020">
                    <GitNetworkOutline />
                  </n-icon>
                </template>
              </n-statistic>
            </n-card>
          </n-gi>
          <n-gi>
            <n-card embedded class="stat-card rounded-lg transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(128,128,128,0.2)] mb-0">
              <n-statistic
                label="今日上传流量"
                :value="formatTrafficValue(todayInTraffic)"
              >
                <template #suffix>
                  <n-text depth="3">{{
                    getTrafficUnit(todayInTraffic)
                  }}</n-text>
                </template>
                <template #prefix>
                  <n-icon color="#d03050">
                    <ArrowUpOutline />
                  </n-icon>
                </template>
              </n-statistic>
            </n-card>
          </n-gi>
          <n-gi>
            <n-card embedded class="stat-card rounded-lg transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(128,128,128,0.2)] mb-0">
              <n-statistic
                label="今日下载流量"
                :value="formatTrafficValue(todayOutTraffic)"
              >
                <template #suffix>
                  <n-text depth="3">{{
                    getTrafficUnit(todayOutTraffic)
                  }}</n-text>
                </template>
                <template #prefix>
                  <n-icon color="#36ad6a">
                    <ArrowDownOutline />
                  </n-icon>
                </template>
              </n-statistic>
            </n-card>
          </n-gi>
        </n-grid>

        <!-- 视图切换内容 -->
        <div v-if="viewMode === 'table'">
          <!-- 表格视图 -->
          <div class="max-[600px]:overflow-x-auto">
            <n-data-table
              :columns="columns"
              :data="nodeData"
              :pagination="pagination"
              :bordered="false"
              :loading="loading"
              striped
              class="node-table rounded-lg overflow-hidden max-[600px]:min-w-[700px] max-[600px]:w-max max-[600px]:[&_table]:min-w-[700px] max-[600px]:[&_table]:w-max"
            />
          </div>
        </div>

        <div v-else>
          <!-- 卡片视图 -->
          <n-grid :cols="2" :x-gap="16" :y-gap="16" responsive="screen">
            <n-gi v-for="node in paginatedNodes" :key="node.node_name">
              <n-card
                class="group rounded-xl transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden hover:shadow-[0_8px_24px_rgba(128,128,128,0.18)] hover:-translate-y-0.5"
                hoverable
                @click="goToNodeDetail(node)"
                style="cursor: pointer"
              >
                <!-- 头部：节点名称和状态 -->
                <div
                  class="flex items-center justify-between p-[12px_16px] bg-[linear-gradient(135deg,rgba(128,128,128,0.04)_0%,rgba(128,128,128,0.08)_100%)] border-b border-[rgba(128,128,128,0.1)] max-md:p-[10px_12px] max-[480px]:flex-col max-[480px]:items-start max-[480px]:gap-2"
                >
                  <div class="flex items-center gap-2 max-md:gap-1.5">
                    <n-icon
                      size="18"
                      :color="node.isOnline ? '#18a058' : '#d03050'"
                    >
                      <ServerOutline />
                    </n-icon>
                    <span class="text-[15px] font-semibold max-md:text-sm">{{
                      node.node_name
                    }}</span>
                    <span
                      class="text-[11px] opacity-50 bg-[rgba(128,128,128,0.1)] p-[2px_6px] rounded max-md:text-[10px]"
                      >#{{ node.id }}</span
                    >
                  </div>
                  <n-tag
                    :type="node.isOnline ? 'success' : 'error'"
                    :bordered="false"
                    size="small"
                    round
                    class="text-[11px] max-[480px]:self-end"
                  >
                    {{ node.isOnline ? '在线' : '离线' }}
                  </n-tag>
                </div>

                <!-- 主体内容 -->
                <div
                  class="flex items-center p-4 gap-16 max-md:flex-col max-md:p-3 max-md:gap-4"
                >
                  <!-- CPU 圆形进度 -->
                  <div class="shrink-0">
                    <div
                      class="w-[120px] h-[120px] rounded-full flex items-center justify-center relative shadow-[inset_0_2px_4px_rgba(128,128,128,0.15)] max-md:w-[100px] max-md:h-[100px] max-[480px]:w-[90px] max-[480px]:h-[90px]"
                      :style="getCpuRingStyle(node.cpu_usage)"
                    >
                      <div
                        class="w-24 h-24 bg-[var(--n-color,rgba(255,255,255,0.9))] rounded-full flex flex-col items-center justify-center shadow-[0_2px_8px_rgba(128,128,128,0.12)] max-md:w-20 max-md:h-20 max-[480px]:w-[72px] max-[480px]:h-[72px]"
                      >
                        <span
                          class="text-[28px] font-bold leading-none max-md:text-[22px] max-[480px]:text-xl"
                          :style="{ color: getCpuColor(node.cpu_usage) }"
                        >
                          {{ (node.cpu_usage || 0).toFixed(0) }}%
                        </span>
                        <span
                          class="text-[13px] opacity-50 mt-1.5 max-md:text-[11px]"
                          >CPU</span
                        >
                      </div>
                    </div>
                  </div>

                  <!-- 数据指标 -->
                  <div
                    class="flex-1 flex flex-col gap-2.5 max-md:w-full max-md:gap-2"
                  >
                    <!-- 客户端 -->
                    <div class="flex items-center gap-2.5">
                      <div
                        class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-[linear-gradient(135deg,var(--n-primary-color)_0%,var(--n-primary-color-hover)_100%)] max-md:w-6 max-md:h-6"
                      >
                        <n-icon size="16" color="#fff"
                          ><PeopleOutline
                        /></n-icon>
                      </div>
                      <div class="flex flex-col gap-0.5">
                        <span
                          class="text-base font-semibold leading-none max-md:text-sm">
                          {{
                          node.client_counts || 0
                        }}</span>
                        <span class="text-[11px] opacity-50 max-md:text-[10px]">客户端</span>
                      </div>
                    </div>

                    <!-- 上传 -->
                    <div class="flex items-center gap-2.5">
                      <div
                        class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-[linear-gradient(135deg,#d03050_0%,#f05070_100%)] max-md:w-6 max-md:h-6"
                      >
                        <n-icon size="14" color="#fff"
                          ><ArrowUpOutline
                        /></n-icon>
                      </div>
                      <div class="flex flex-col gap-0.5">
                        <span
                          class="text-[13px] font-semibold leading-none max-md:text-xs">
                          {{
                          formatTraffic(node.today_in_traffic)
                        }}</span>
                        <span class="text-[11px] opacity-50 max-md:text-[10px]">今日上传</span>
                      </div>
                    </div>

                    <!-- 下载 -->
                    <div class="flex items-center gap-2.5">
                      <div
                        class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-[linear-gradient(135deg,#18a058_0%,#36c070_100%)] max-md:w-6 max-md:h-6"
                      >
                        <n-icon size="14" color="#fff"
                          ><ArrowDownOutline
                        /></n-icon>
                      </div>
                      <div class="flex flex-col gap-0.5">
                        <span
                          class="text-[13px] font-semibold leading-none max-md:text-xs">
                          {{
                          formatTraffic(node.today_out_traffic)
                        }}</span>
                        <span class="text-[11px] opacity-50 max-md:text-[10px]">今日下载</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 底部箭头 -->
                <div
                  class="flex justify-end p-[0_16px_12px_16px] max-md:p-[0_12px_10px_12px]"
                >
                  <n-icon
                    size="18"
                    depth="3"
                    class="opacity-30 transition-all duration-300 group-hover:opacity-80 group-hover:translate-x-1"
                    ><ChevronForwardOutline
                  /></n-icon>
                </div>
              </n-card>
            </n-gi>
          </n-grid>

          <!-- 卡片视图分页 -->
          <n-pagination
            v-if="nodeData.length > cardsPerPage"
            v-model:page="currentPage"
            :page-count="Math.ceil(nodeData.length / cardsPerPage)"
            :page-size="cardsPerPage"
            show-size-picker
            :page-sizes="[6, 9, 12, 15]"
            @update:page-size="handlePageSizeChange"
            style="margin-top: 16px; justify-content: center"
          />
        </div>
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import {
  NCard,
  NSpace,
  NDataTable,
  NButton,
  NStatistic,
  NGrid,
  NGi,
  NTag,
  NText,
  NIcon,
  NPagination,
  useMessage,
} from 'naive-ui'
import {
  RefreshOutline,
  CheckmarkCircleOutline,
  PeopleOutline,
  GitNetworkOutline,
  ArrowUpOutline,
  ArrowDownOutline,
  GridOutline,
  ListOutline,
  ServerOutline,
  ChevronForwardOutline,
} from '@vicons/ionicons5'
import { userApi } from '@/net'

const router = useRouter()

// 消息提示
const message = useMessage()

// 视图模式 - 默认为卡片视图
const viewMode = ref('card')
const currentPage = ref(1)
const cardsPerPage = ref(9)

// 节点数据
const nodeData = ref<any[]>([])
const loading = ref(false)
const pagination = ref({
  pageSize: 10,
})

// 跳转到节点详情页
const goToNodeDetail = (node: any) => {
  router.push(`/dashboard/node/${node.id}`)
}

// 计算属性
const onlineNodesCount = computed(
  () => nodeData.value.filter((node) => node.isOnline).length,
)

const totalClients = computed(() =>
  nodeData.value.reduce((sum, node) => sum + (node.client_counts || 0), 0),
)

const totalTunnels = computed(() =>
  nodeData.value.reduce((sum, node) => sum + (node.tunnel_counts || 0), 0),
)

const todayInTraffic = computed(() =>
  nodeData.value.reduce((sum, node) => sum + (node.today_in_traffic || 0), 0),
)

const todayOutTraffic = computed(() =>
  nodeData.value.reduce((sum, node) => sum + (node.today_out_traffic || 0), 0),
)

// 卡片视图分页数据
const paginatedNodes = computed(() => {
  const start = (currentPage.value - 1) * cardsPerPage.value
  const end = start + cardsPerPage.value
  return nodeData.value.slice(start, end)
})

// 格式化流量数据
const formatTraffic = (mb: number) => {
  if (!mb || mb === 0) return '0 MB'
  if (mb < 1024) return `${mb.toFixed(2)} MB`
  if (mb < 1024 * 1024) return `${(mb / 1024).toFixed(2)} GB`
  return `${(mb / (1024 * 1024)).toFixed(2)} TB`
}

// 格式化流量值（用于统计卡片）
const formatTrafficValue = (mb: number) => {
  if (!mb || mb === 0) return 0
  if (mb < 1024) return mb.toFixed(2)
  if (mb < 1024 * 1024) return (mb / 1024).toFixed(2)
  return (mb / (1024 * 1024)).toFixed(2)
}

// 获取流量单位
const getTrafficUnit = (mb: number) => {
  if (!mb || mb === 0) return 'MB'
  if (mb < 1024) return 'MB'
  if (mb < 1024 * 1024) return 'GB'
  return 'TB'
}

// 获取 CPU 圆环样式
const getCpuRingStyle = (usage: number) => {
  const percentage = Math.min(usage || 0, 100)
  const color = getCpuColor(usage)
  return {
    background: `conic-gradient(${color} ${percentage * 3.6}deg, rgba(128, 128, 128, 0.15) 0deg)`,
  }
}

// 获取 CPU 颜色
const getCpuColor = (usage: number) => {
  const percentage = usage || 0
  if (percentage >= 80) return '#d03050'
  if (percentage >= 50) return '#f0a020'
  return '#18a058'
}

// 切换视图模式
const toggleView = () => {
  viewMode.value = viewMode.value === 'table' ? 'card' : 'table'
  currentPage.value = 1
}

// 处理分页大小变化
const handlePageSizeChange = (pageSize) => {
  cardsPerPage.value = pageSize
  currentPage.value = 1
}

// 表格列定义
const columns = [
  {
    title: 'ID',
    key: 'id',
    width: 60,
    render: (row) =>
      h('span', { style: 'opacity: 0.5; font-size: 12px;' }, `#${row.id}`),
  },
  {
    title: '节点名称',
    key: 'node_name',
    width: 140,
    ellipsis: {
      tooltip: true,
    },
    render: (row) =>
      h(
        'a',
        {
          style: 'cursor: pointer; color: var(--n-primary-color);',
          onClick: () => goToNodeDetail(row),
        },
        row.node_name,
      ),
  },
  {
    title: '状态',
    key: 'isOnline',
    width: 80,
    render: (row) => {
      return row.isOnline
        ? h(
            NTag,
            { type: 'success', bordered: false, size: 'small' },
            () => '在线',
          )
        : h(
            NTag,
            { type: 'error', bordered: false, size: 'small' },
            () => '离线',
          )
    },
  },
  {
    title: 'CPU',
    key: 'cpu_usage',
    width: 80,
    render: (row) => {
      const usage = row.cpu_usage || 0
      const color =
        usage >= 80 ? '#d03050' : usage >= 50 ? '#f0a020' : '#18a058'
      return h(
        'span',
        { style: `color: ${color}; font-weight: 600;` },
        `${usage.toFixed(0)}%`,
      )
    },
  },
  {
    title: '内存',
    key: 'memory',
    width: 120,
    render: (row) => {
      const used = row.used_memory || row.memory_used || 0
      const total = row.total_memory || row.memory_total || 1
      const percentage = total > 0 ? ((used / total) * 100).toFixed(0) : 0
      const color =
        Number(percentage) >= 80
          ? '#d03050'
          : Number(percentage) >= 50
            ? '#f0a020'
            : '#18a058'
      return h('span', { style: `color: ${color};` }, `${percentage}%`)
    },
  },
  {
    title: '客户端',
    key: 'client_counts',
    width: 80,
    render: (row) =>
      h('span', { style: 'font-weight: 600;' }, row.client_counts || 0),
  },
  {
    title: '隧道',
    key: 'tunnel_counts',
    width: 80,
    render: (row) => row.tunnel_counts || 0,
  },
  {
    title: '今日上传',
    key: 'today_in_traffic',
    width: 110,
    render: (row) => formatTraffic(row.today_in_traffic),
  },
  {
    title: '今日下载',
    key: 'today_out_traffic',
    width: 110,
    render: (row) => formatTraffic(row.today_out_traffic),
  },
  {
    title: '总上传',
    key: 'total_traffic_in',
    width: 110,
    render: (row) => formatTraffic(row.total_traffic_in),
  },
  {
    title: '总下载',
    key: 'total_traffic_out',
    width: 110,
    render: (row) => formatTraffic(row.total_traffic_out),
  },
]

// 获取节点数据
const fetchNodeData = async () => {
  loading.value = true
  try {
    const data = await userApi.getProxyStats()
    if (!data.data.nodes) {
      return
    }
    nodeData.value = data.data?.nodes
    message.success('数据获取成功')
  } catch (error: any) {
    message.error('获取节点数据失败: ' + error.message)
    nodeData.value = []
  } finally {
    loading.value = false
  }
}

// 刷新数据
const refreshData = () => {
  fetchNodeData()
}

// 组件挂载时获取数据
onMounted(() => {
  fetchNodeData()
})
</script>


