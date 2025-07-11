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
          <n-grid :cols="3" :x-gap="16" :y-gap="16" responsive="screen">
            <n-gi v-for="node in paginatedNodes" :key="node.node_name">
              <n-card class="node-item-card" hoverable>
                <template #header>
                  <n-space justify="space-between" align="center">
                    <n-text strong>{{ node.node_name }}</n-text>
                    <n-tag
                      :type="node.isOnline ? 'success' : 'error'"
                      :bordered="false"
                      size="small"
                    >
                      {{ node.isOnline ? '在线' : '离线' }}
                    </n-tag>
                  </n-space>
                </template>

                <n-space vertical size="small">
                  <n-grid :cols="2" :x-gap="12">
                    <n-gi>
                      <div class="metric-item">
                        <n-text depth="3" class="metric-label">客户端数</n-text>
                        <n-text strong class="metric-value">{{
                          node.client_counts
                        }}</n-text>
                      </div>
                    </n-gi>
                    <n-gi>
                      <div class="metric-item">
                        <n-text depth="3" class="metric-label">隧道数</n-text>
                        <n-text strong class="metric-value">{{
                          node.tunnel_counts
                        }}</n-text>
                      </div>
                    </n-gi>
                  </n-grid>

                  <n-divider style="margin: 8px 0" />

                  <div class="traffic-section">
                    <n-text depth="2" class="section-title">今日流量</n-text>
                    <n-grid :cols="2" :x-gap="12" style="margin-top: 8px">
                      <n-gi>
                        <div class="traffic-item">
                          <n-icon color="#d03050" size="16">
                            <ArrowUpOutline />
                          </n-icon>
                          <n-text class="traffic-value">{{
                            formatTraffic(node.today_in_traffic)
                          }}</n-text>
                        </div>
                      </n-gi>
                      <n-gi>
                        <div class="traffic-item">
                          <n-icon color="#36ad6a" size="16">
                            <ArrowDownOutline />
                          </n-icon>
                          <n-text class="traffic-value">{{
                            formatTraffic(node.today_out_traffic)
                          }}</n-text>
                        </div>
                      </n-gi>
                    </n-grid>
                  </div>

                  <n-divider style="margin: 8px 0" />

                  <div class="traffic-section">
                    <n-text depth="2" class="section-title">总流量</n-text>
                    <n-grid :cols="2" :x-gap="12" style="margin-top: 8px">
                      <n-gi>
                        <div class="traffic-item">
                          <n-icon color="#d03050" size="16">
                            <ArrowUpOutline />
                          </n-icon>
                          <n-text class="traffic-value">{{
                            formatTraffic(node.total_traffic_in)
                          }}</n-text>
                        </div>
                      </n-gi>
                      <n-gi>
                        <div class="traffic-item">
                          <n-icon color="#36ad6a" size="16">
                            <ArrowDownOutline />
                          </n-icon>
                          <n-text class="traffic-value">{{
                            formatTraffic(node.total_traffic_out)
                          }}</n-text>
                        </div>
                      </n-gi>
                    </n-grid>
                  </div>
                </n-space>
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

<script setup>
import { ref, computed, onMounted, h } from 'vue'
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
  NDivider,
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
} from '@vicons/ionicons5'
import { userApi } from '@/net'

// 消息提示
const message = useMessage()

// 视图模式
const viewMode = ref('table')
const currentPage = ref(1)
const cardsPerPage = ref(9)

// 节点数据
const nodeData = ref([])
const loading = ref(false)
const pagination = ref({
  pageSize: 10,
})

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
const formatTraffic = (mb) => {
  if (!mb || mb === 0) return '0 MB'
  if (mb < 1024) return `${mb.toFixed(2)} MB`
  if (mb < 1024 * 1024) return `${(mb / 1024).toFixed(2)} GB`
  return `${(mb / (1024 * 1024)).toFixed(2)} TB`
}

// 格式化流量值（用于统计卡片）
const formatTrafficValue = (mb) => {
  if (!mb || mb === 0) return 0
  if (mb < 1024) return mb.toFixed(2)
  if (mb < 1024 * 1024) return (mb / 1024).toFixed(2)
  return (mb / (1024 * 1024)).toFixed(2)
}

// 获取流量单位
const getTrafficUnit = (mb) => {
  if (!mb || mb === 0) return 'MB'
  if (mb < 1024) return 'MB'
  if (mb < 1024 * 1024) return 'GB'
  return 'TB'
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
    title: '节点名称',
    key: 'node_name',
    width: 150,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '状态',
    key: 'isOnline',
    width: 100,
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
    title: '客户端数',
    key: 'client_counts',
    width: 100,
    render: (row) => row.client_counts || 0,
  },
  {
    title: '隧道数',
    key: 'tunnel_counts',
    width: 100,
    render: (row) => row.tunnel_counts || 0,
  },
  {
    title: '今日流入',
    key: 'today_in_traffic',
    width: 120,
    render: (row) => formatTraffic(row.today_in_traffic),
  },
  {
    title: '今日流出',
    key: 'today_out_traffic',
    width: 120,
    render: (row) => formatTraffic(row.today_out_traffic),
  },
  {
    title: '总流入',
    key: 'total_traffic_in',
    width: 120,
    render: (row) => formatTraffic(row.total_traffic_in),
  },
  {
    title: '总流出',
    key: 'total_traffic_out',
    width: 120,
    render: (row) => formatTraffic(row.total_traffic_out),
  },
]

// 获取节点数据
const fetchNodeData = async () => {
  loading.value = true
  try {
    // userApi.get('/proxy/status', accessHandle(), (data) => {
    //   if (data.code === 0) {
    //     nodeData.value = data.data?.nodes || []
    //     message.success(data.message || '数据获取成功')
    //   } else {
    //     message.error(data.message || '获取节点数据失败')
    //     nodeData.value = []
    //   }
    // })
    const data = await userApi.getStatus()
    nodeData.value = data.data?.nodes
    message.success('数据获取成功')
  } catch (error) {
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
$shadow-card: 0 2px 8px rgba(0, 0, 0, 0.1);
$shadow-card-hover: 0 4px 12px rgba(0, 0, 0, 0.15);
$shadow-card-hover-strong: 0 8px 24px rgba(0, 0, 0, 0.15);
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

.metric-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $gap-small;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 6px;
}

.metric-label {
  font-size: 12px;
  margin-bottom: 4px;
}

.metric-value {
  font-size: 18px;
}

.traffic-section {
  padding: 4px 0;
}

.section-title {
  font-size: 13px;
  font-weight: 500;
}

.traffic-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 4px;
}

.traffic-value {
  font-size: 12px;
  font-weight: 500;
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
</style>
