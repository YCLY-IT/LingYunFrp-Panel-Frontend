<template>
  <div class="node-status-container">
    <n-card title="节点状态监控" class="node-card">
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
            <n-card embedded class="stat-card">
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
            <n-card embedded class="stat-card">
              <n-statistic label="总客户端数" :value="totalClients">
                <template #prefix>
                  <n-icon color="#2080f0">
                    <PeopleOutline />
                  </n-icon>
                </template>
              </n-statistic>
            </n-card>
          </n-gi>
          <n-gi>
            <n-card embedded class="stat-card">
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
            <n-card embedded class="stat-card">
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
            <n-card embedded class="stat-card">
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
          <div class="status-table-scroll">
            <n-data-table
              :columns="columns"
              :data="nodeData"
              :pagination="pagination"
              :bordered="false"
              :loading="loading"
              striped
              class="node-table"
            />
          </div>
        </div>

        <div v-else>
          <!-- 卡片视图 -->
          <n-grid :cols="2" :x-gap="16" :y-gap="16" responsive="screen">
            <n-gi v-for="node in paginatedNodes" :key="node.node_name">
              <n-card
                class="node-card-beautiful"
                hoverable
                @click="goToNodeDetail(node)"
                style="cursor: pointer"
              >
                <!-- 头部：节点名称和状态 -->
                <div class="node-card-header">
                  <div class="node-title-row">
                    <n-icon
                      size="18"
                      :color="node.isOnline ? '#18a058' : '#d03050'"
                    >
                      <ServerOutline />
                    </n-icon>
                    <span class="node-name">{{ node.node_name }}</span>
                    <span class="node-id">#{{ node.id }}</span>
                  </div>
                  <n-tag
                    :type="node.isOnline ? 'success' : 'error'"
                    :bordered="false"
                    size="small"
                    round
                    class="status-tag"
                  >
                    {{ node.isOnline ? '在线' : '离线' }}
                  </n-tag>
                </div>

                <!-- 主体内容 -->
                <div class="node-card-body">
                  <!-- CPU 圆形进度 -->
                  <div class="cpu-wrapper">
                    <div
                      class="cpu-ring"
                      :style="getCpuRingStyle(node.cpu_usage)"
                    >
                      <div class="cpu-center">
                        <span
                          class="cpu-value"
                          :style="{ color: getCpuColor(node.cpu_usage) }"
                        >
                          {{ (node.cpu_usage || 0).toFixed(0) }}%
                        </span>
                        <span class="cpu-label">CPU</span>
                      </div>
                    </div>
                  </div>

                  <!-- 数据指标 -->
                  <div class="metrics-wrapper">
                    <!-- 客户端 -->
                    <div class="metric-box">
                      <div class="metric-icon-wrapper blue">
                        <n-icon size="16" color="#fff"
                          ><PeopleOutline
                        /></n-icon>
                      </div>
                      <div class="metric-content">
                        <span class="metric-value">{{
                          node.client_counts || 0
                        }}</span>
                        <span class="metric-label">客户端</span>
                      </div>
                    </div>

                    <!-- 上传 -->
                    <div class="metric-box">
                      <div class="metric-icon-wrapper red">
                        <n-icon size="14" color="#fff"
                          ><ArrowUpOutline
                        /></n-icon>
                      </div>
                      <div class="metric-content">
                        <span class="metric-value small">{{
                          formatTraffic(node.today_in_traffic)
                        }}</span>
                        <span class="metric-label">今日上传</span>
                      </div>
                    </div>

                    <!-- 下载 -->
                    <div class="metric-box">
                      <div class="metric-icon-wrapper green">
                        <n-icon size="14" color="#fff"
                          ><ArrowDownOutline
                        /></n-icon>
                      </div>
                      <div class="metric-content">
                        <span class="metric-value small">{{
                          formatTraffic(node.today_out_traffic)
                        }}</span>
                        <span class="metric-label">今日下载</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 底部箭头 -->
                <div class="node-card-footer">
                  <n-icon size="18" depth="3" class="arrow-icon"
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
          style: 'cursor: pointer; color: #2080f0;',
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
    const data = await userApi.getStatus()
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

<style lang="scss" scoped>
$radius-card: 12px;
$radius-inner: 8px;
$shadow-card: 0 2px 8px rgba(128, 128, 128, 0.15);
$shadow-card-hover: 0 4px 12px rgba(128, 128, 128, 0.2);
$shadow-card-hover-strong: 0 8px 24px rgba(128, 128, 128, 0.2);
$gap-main: 16px;
$gap-small: 8px;

.node-card {
  border-radius: $radius-card;
  box-shadow: $shadow-card;
}

.stat-card {
  border-radius: $radius-inner;
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-card-hover;
  }
  margin-bottom: 0;
}

.node-item-card {
  border-radius: $radius-inner;
  transition: all 0.3s ease;
  height: 100%;
  &:hover {
    transform: translateY(-4px);
    box-shadow: $shadow-card-hover-strong;
  }
}

.node-card-beautiful {
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;

  &:hover {
    box-shadow: 0 8px 24px rgba(128, 128, 128, 0.18);
    transform: translateY(-2px);
  }

  .node-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: linear-gradient(
      135deg,
      rgba(128, 128, 128, 0.04) 0%,
      rgba(128, 128, 128, 0.08) 100%
    );
    border-bottom: 1px solid rgba(128, 128, 128, 0.1);

    .node-title-row {
      display: flex;
      align-items: center;
      gap: 8px;

      .node-name {
        font-size: 15px;
        font-weight: 600;
      }

      .node-id {
        font-size: 11px;
        opacity: 0.5;
        background: rgba(128, 128, 128, 0.1);
        padding: 2px 6px;
        border-radius: 4px;
      }
    }

    .status-tag {
      font-size: 11px;
    }
  }

  .node-card-body {
    display: flex;
    align-items: center;
    padding: 16px;
    gap: 64px;
  }

  .cpu-wrapper {
    flex-shrink: 0;

    .cpu-ring {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      box-shadow: inset 0 2px 4px rgba(128, 128, 128, 0.15);

      .cpu-center {
        width: 96px;
        height: 96px;
        background: var(--n-color, rgba(255, 255, 255, 0.9));
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(128, 128, 128, 0.12);

        .cpu-value {
          font-size: 28px;
          font-weight: 700;
          line-height: 1;
        }

        .cpu-label {
          font-size: 13px;
          opacity: 0.5;
          margin-top: 6px;
        }
      }
    }
  }

  .metrics-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .metric-box {
    display: flex;
    align-items: center;
    gap: 10px;

    .metric-icon-wrapper {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      &.blue {
        background: linear-gradient(135deg, #2080f0 0%, #4098ff 100%);
      }

      &.red {
        background: linear-gradient(135deg, #d03050 0%, #f05070 100%);
      }

      &.green {
        background: linear-gradient(135deg, #18a058 0%, #36c070 100%);
      }
    }

    .metric-content {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .metric-value {
        font-size: 16px;
        font-weight: 600;
        line-height: 1;

        &.small {
          font-size: 13px;
        }
      }

      .metric-label {
        font-size: 11px;
        opacity: 0.5;
      }
    }
  }

  .node-card-footer {
    display: flex;
    justify-content: flex-end;
    padding: 0 16px 12px 16px;

    .arrow-icon {
      opacity: 0.3;
      transition: all 0.3s;
    }
  }

  &:hover .arrow-icon {
    opacity: 0.8;
    transform: translateX(4px);
  }
}

.node-table {
  border-radius: $radius-inner;
  overflow: hidden;
}

@media (max-width: 768px) {
  // 统计卡片区域：一行只显示1个
  .n-grid {
    grid-template-columns: 1fr !important;
  }
  .stat-card {
    margin-bottom: $gap-small;
  }
}

@media (max-width: 600px) {
  .status-table-scroll {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  .node-table {
    min-width: 700px;
    width: max-content;
  }
  .node-table :deep(table) {
    min-width: 700px;
    width: max-content;
  }
  // 卡片视图一列
  .n-grid {
    grid-template-columns: 1fr !important;
  }
  .node-item-card {
    margin-bottom: $gap-main;
  }
}

// 节点详情模态框样式
.node-detail-modal {
  :deep(.n-card-header) {
    padding: 16px 20px;
    border-bottom: 1px solid rgba(128, 128, 128, 0.1);
  }

  :deep(.n-card__content) {
    padding: 0;
  }
}

// 详情布局 - 左侧指标 + 右侧图表
.detail-layout {
  display: flex;
  height: calc(90vh - 70px);
  overflow: hidden;
}

// 左侧指标侧边栏
.metrics-sidebar {
  width: 280px;
  min-width: 280px;
  padding: 20px;
  background: rgba(128, 128, 128, 0.02);
  border-right: 1px solid rgba(128, 128, 128, 0.08);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;

  .metric-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
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
      width: 48px;
      height: 48px;
      border-radius: 10px;
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
        font-size: 12px;
        color: rgba(128, 128, 128, 0.8);
        margin-bottom: 4px;
      }

      .metric-value {
        font-size: 20px;
        font-weight: 700;
        color: rgba(0, 0, 0, 0.85);
        line-height: 1.2;

        &.speed,
        &.traffic {
          display: flex;
          flex-direction: column;
          gap: 2px;
          font-size: 14px;

          .up {
            color: #d03050;
          }
          .down {
            color: #36ad6a;
          }
        }
      }

      .metric-sub {
        font-size: 11px;
        color: rgba(128, 128, 128, 0.6);
        margin-top: 4px;
      }
    }
  }
}

// 右侧图表区域
.charts-area {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .chart-tabs {
    flex: 1;
    display: flex;
    flex-direction: column;

    :deep(.n-tabs-nav) {
      padding: 0 20px;
      border-bottom: 1px solid rgba(128, 128, 128, 0.08);
    }

    :deep(.n-tabs-pane-wrapper) {
      flex: 1;
      overflow: hidden;
    }

    :deep(.n-tab-pane) {
      height: 100%;
      padding: 20px;
    }
  }

  .chart-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    height: 100%;

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
@media (max-width: 1200px) {
  .detail-layout {
    flex-direction: column;
  }

  .metrics-sidebar {
    width: 100%;
    min-width: auto;
    max-height: 200px;
    flex-direction: row;
    flex-wrap: wrap;
    padding: 12px;

    .metric-card {
      flex: 1;
      min-width: 200px;
    }
  }

  .charts-area {
    .chart-grid {
      grid-template-columns: 1fr;
      overflow-y: auto;

      .chart-card {
        min-height: 300px;
      }
    }
  }
}
</style>
