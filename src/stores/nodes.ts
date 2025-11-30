// src/stores/useNodesStore.ts
import { defineStore } from 'pinia'
import { ref, computed, h } from 'vue'
import { adminApi } from '@/net'
import type { Node } from '@/types'
import { NEmpty } from 'naive-ui'

export const useNodesStore = defineStore('nodes', () => {
  const nodes = ref<Node[]>([])
  const allNodes = ref<Node[]>([])
  const loading = ref(false)
  const submitting = ref(false)
  const dataLoaded = ref(false)

  const searchKeyword = ref('')
  const selectedOnline = ref<string | null>(null)
  const selectedStatus = ref<string | null>(null)

  const pagination = ref({
    page: 1,
    pageSize: 10,
    pageCount: 1,
    itemCount: 0,
    prefix({ itemCount }: { itemCount?: number }) {
      return `共 ${itemCount} 条`
    },
  })

  const hasFilters = computed(
    () =>
      !!(searchKeyword.value || selectedOnline.value || selectedStatus.value),
  )

  const emptySlot = () =>
    h('div', { class: 'empty-state' }, [h(NEmpty, { description: '暂无数据' })])

  const normalize = (raw: any): Node => ({
    ...raw,
    nodeId: raw.id,
    servicePort: raw.port,
    allowGroup: raw.group || '',
    allowType: raw.allowType || '',
  })

  const fetchNodes = async (message?: any) => {
    // 如果已缓存，直接本地筛
    if (dataLoaded.value) {
      filterAndPaginate()
      return
    }

    loading.value = true
    try {
      // 一次性拉全部
      const data = await adminApi.getNodeList()
      if (data.code === 0) {
        allNodes.value = (data.data.nodes || []).map(normalize)
        dataLoaded.value = true
        filterAndPaginate()
      } else {
        message?.error(data.message || '获取节点列表失败')
      }
    } catch (e: any) {
      message?.error(e?.response?.data?.message || '获取节点列表失败')
    } finally {
      loading.value = false
    }
  }

  const filterAndPaginate = () => {
    let list = [...allNodes.value]

    // 关键词
    if (searchKeyword.value.trim()) {
      const kw = searchKeyword.value.trim().toLowerCase()
      list = list.filter(
        (n) =>
          n.id.toString().includes(kw) ||
          n.name.toLowerCase().includes(kw) ||
          n.hostname.toLowerCase().includes(kw),
      )
    }

    // 在线状态
    if (selectedOnline.value) {
      const flag = selectedOnline.value === 'online'
      list = list.filter((n) => n.isOnline === flag)
    }

    // 启用/禁用
    if (selectedStatus.value) {
      const flag = selectedStatus.value === 'disabled'
      list = list.filter((n) => n.isDisabled === flag)
    }

    // 分页
    const { page, pageSize } = pagination.value
    const total = list.length
    const start = (page - 1) * pageSize
    nodes.value = list.slice(start, start + pageSize)
    pagination.value.itemCount = total
    pagination.value.pageCount = Math.ceil(total / pageSize)
  }

  const handleSearch = () => {
    pagination.value.page = 1
    if (dataLoaded.value) filterAndPaginate()
    else fetchNodes()
  }

  const handleFilterChange = () => {
    pagination.value.page = 1
    if (dataLoaded.value) filterAndPaginate()
    else fetchNodes()
  }

  const handlePageChange = (p: number) => {
    pagination.value.page = p
    // 已缓存则本地分页
    if (dataLoaded.value) filterAndPaginate()
    else fetchNodes()
  }

  const addNode = async (nodeData: any, message?: any) => {
    submitting.value = true
    try {
      const data = await adminApi.createNode(nodeData)
      if (data.code === 0) {
        message?.success('添加节点成功')
        // 重新拉取全量
        dataLoaded.value = false
        await fetchNodes(message)
        return true
      } else {
        message?.error(data.message || '添加失败')
        return false
      }
    } finally {
      submitting.value = false
    }
  }

  const updateNode = async (nodeData: any, message?: any) => {
    submitting.value = true
    try {
      const data = await adminApi.updateNode(nodeData)
      if (data.code === 0) {
        message?.success('更新节点成功')
        dataLoaded.value = false
        await fetchNodes(message)
        return true
      } else {
        message?.error(data.message || '更新失败')
        return false
      }
    } finally {
      submitting.value = false
    }
  }

  const deleteNode = async (nodeId: number, message?: any) => {
    submitting.value = true
    try {
      const data = await adminApi.deleteNode(nodeId)
      if (data.code === 0) {
        message?.success('删除节点成功')
        dataLoaded.value = false
        await fetchNodes(message)
        return true
      } else {
        message?.error(data.message || '删除失败')
        return false
      }
    } finally {
      submitting.value = false
    }
  }

  const toggleNode = async (
    nodeId: number,
    isDisabled: boolean,
    message?: any,
  ) => {
    submitting.value = true
    try {
      const data = await adminApi.toggleNode(nodeId, isDisabled)
      if (data.code === 0) {
        message?.success(isDisabled ? '禁用成功' : '启用成功')
        dataLoaded.value = false
        await fetchNodes(message)
        return true
      } else {
        message?.error(data.message || '操作失败')
        return false
      }
    } finally {
      submitting.value = false
    }
  }

  const resetState = () => {
    nodes.value = []
    allNodes.value = []
    loading.value = false
    submitting.value = false
    dataLoaded.value = false
    searchKeyword.value = ''
    selectedOnline.value = null
    selectedStatus.value = null
    pagination.value = {
      page: 1,
      pageSize: 10,
      pageCount: 1,
      itemCount: 0,
      prefix({ itemCount }: { itemCount?: number }) {
        return `共 ${itemCount} 条`
      },
    }
  }

  return {
    nodes,
    allNodes,
    loading,
    submitting,
    dataLoaded,
    searchKeyword,
    selectedOnline,
    selectedStatus,
    pagination,
    hasFilters,
    shouldShowTable: computed(() =>
      dataLoaded.value ? nodes.value.length > 0 || !hasFilters.value : true,
    ),
    emptySlot,
    fetchNodes,
    handleSearch,
    handleFilterChange,
    handlePageChange,
    addNode,
    updateNode,
    deleteNode,
    toggleNode,
    resetState,
  }
})
