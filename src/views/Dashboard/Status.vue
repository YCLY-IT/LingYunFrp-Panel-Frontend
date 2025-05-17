<template>
  <div class="node-status-container">
    <n-card title="节点状态监控" class="node-card">
      <template #header-extra>
        <n-button @click="refreshData" secondary circle size="small">
          <template #icon>
            <RefreshOutline />
          </template>
        </n-button>
      </template>

      <n-space vertical>
        <!-- 节点状态统计 -->
        <n-grid :cols="5" :x-gap="12">
          <n-gi>
            <n-statistic label="在线节点">
              <n-number-animation
                ref="onlineNodesRef"
                :from="0"
                :to="onlineNodesCount"
              />
            </n-statistic>
          </n-gi>
          <n-gi>
            <n-statistic label="总客户端数">
              <n-number-animation
                ref="totalClientsRef"
                :from="0"
                :to="totalClients"
              />
            </n-statistic>
          </n-gi>
          <n-gi>
            <n-statistic label="总隧道数">
              <n-number-animation
                ref="totalTunnelsRef"
                :from="0"
                :to="totalTunnels"
              />
            </n-statistic>
          </n-gi>
            <n-gi>
            <n-statistic label="今日上传流量">
                <n-number-animation
                ref="todayUploadRef"
                :from="0"
                :to="todayInTraffic"
                />
                {{ todayInTraffic >= 1024 ? 'GB' : 'MB' }}
            </n-statistic>
            </n-gi>
            <n-gi>
            <n-statistic label="今日下载流量">
                <n-number-animation
                ref="todayDownloadRef"
                :from="0"
                :to="todayOutTraffic"
                />
                {{ todayOutTraffic >= 1024 ? 'GB' : 'MB' }}
            </n-statistic>
            </n-gi>
          
        </n-grid>

        <!-- 节点列表 -->
        <n-data-table
           style="margin-top: 23px;"
          :columns="columns"
          :data="nodeData"
          :pagination="pagination"
          :bordered="false"
          striped
        />
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
  NNumberAnimation,
  NGrid,
  NGi,
  NTag,
  NProgress,
  NText,
  NTooltip,
  useMessage
} from 'naive-ui'
import { RefreshOutline } from '@vicons/ionicons5'
import { userApi } from '@/net'
import { accessHandle } from '@/net/base'

// 消息提示
const message = useMessage()

// 节点数据
const nodeData = ref([])
const loading = ref(false)
const pagination = ref({
  pageSize: 10
})

// 统计数据动画引用
const totalNodesRef = ref(null)
const onlineNodesRef = ref(null)
const totalClientsRef = ref(null)
const totalTunnelsRef = ref(null)

// 计算属性
const onlineNodesCount = computed(() => 
  nodeData.value.filter(node => node.isOnline).length
)

const totalClients = computed(() => 
  nodeData.value.reduce((sum, node) => sum + node.client_counts, 0)
)

const totalTunnels = computed(() => 
  nodeData.value.reduce((sum, node) => sum + node.tunnel_counts, 0)
)

// 格式化流量数据
const formatTraffic = (mb) => {
  if (mb < 1024) return `${mb.toFixed(2)} MB`
  return `${(mb / 1024).toFixed(2)} GB`
}

// 新增计算属性
const todayInTraffic = computed(() => 
  nodeData.value.reduce((sum, node) => sum + node.today_in_traffic, 0)
)
const todayOutTraffic = computed(() => 
  nodeData.value.reduce((sum, node) => sum + node.today_out_traffic, 0)
)

// 表格列定义
const columns = [
  {
    title: '节点名称',
    key: 'node_name',
    width: 150
  },
  {
    title: '状态',
    key: 'isOnline',
    width: 100,
    render: (row) => {
      return row.isOnline ? 
        h(NTag, { type: 'success', bordered: false }, () => '在线') : 
        h(NTag, { type: 'error', bordered: false }, () => '离线')
    }
  },
  {
    title: '客户端数',
    key: 'client_counts',
    width: 100
  },
  {
    title: '隧道数',
    key: 'tunnel_counts',
    width: 100
  },
  {
    title: '今日流入',
    key: 'today_in_traffic',
    width: 120,
    render: (row) => formatTraffic(row.today_in_traffic)
  },
  {
    title: '今日流出',
    key: 'today_out_traffic',
    width: 120,
    render: (row) => formatTraffic(row.today_out_traffic)
  },
  {
    title: '总流入',
    key: 'total_traffic_in',
    width: 120,
    render: (row) => formatTraffic(row.total_traffic_in)
  },
  {
    title: '总流出',
    key: 'total_traffic_out',
    width: 120,
    render: (row) => formatTraffic(row.total_traffic_out)
  }
]

// 获取节点数据
const fetchNodeData = async () => {
  loading.value = true
  try {
    userApi.get('/proxy/status', accessHandle(), (data) => {
        if (data.code === 0) {
            nodeData.value = data.data.nodes
            message.success(data.message)
            
            // 触发统计数字动画
            setTimeout(() => {
                totalNodesRef.value?.play()
                onlineNodesRef.value?.play()
                totalClientsRef.value?.play()
                totalTunnelsRef.value?.play()
            }, 100)
        } else {
            message.error(data.message || '获取节点数据失败')
        }
    })
  } catch (error) {
    message.error('获取节点数据失败: ' + error.message)
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

<style scoped>
.node-status-container {
  padding: 16px;
}

.node-card {
  border-radius: 8px;
}
</style>