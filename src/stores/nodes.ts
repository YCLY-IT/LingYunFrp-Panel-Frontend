// src/stores/useNodesStore.ts
import { defineStore } from 'pinia'
import { ref, computed, h } from 'vue'
import { adminApi } from '@/net'
import type { Node } from '@/types'
import { NEmpty } from 'naive-ui'

export const useNodesStore = defineStore('nodes', () => {
  const nodes = ref<Node[]>([])
  const loading = ref(false)
  const submitting = ref(false)

  const searchKeyword = ref('')
  const selectedOnline = ref<string | null>(null)
  const selectedStatus = ref<string | null>(null)

  // 搜索防抖定时器
  let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

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
    // 每次请求前清空旧数据
    nodes.value = []
    loading.value = true
    try {
      const data = await adminApi.getNodeList(
        pagination.value.page,
        pagination.value.pageSize,
        searchKeyword.value || undefined,
        selectedOnline.value || undefined,
        selectedStatus.value || undefined,
      )
      if (data.code === 0) {
        nodes.value = (data.data.nodes || []).map(normalize)
        pagination.value.itemCount = data.data.total
        pagination.value.pageCount = data.data.totalPages
      }
    } catch (e: any) {
      nodes.value = []
      pagination.value.itemCount = 0
      pagination.value.pageCount = 0
      message?.error(e?.response?.data?.message || '获取节点列表失败')
    } finally {
      loading.value = false
    }
  }

  const handleSearch = () => {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer)
    }
    searchDebounceTimer = setTimeout(() => {
      pagination.value.page = 1
      fetchNodes()
    }, 300)
  }

  const handleFilterChange = () => {
    pagination.value.page = 1
    fetchNodes()
  }

  const handlePageChange = (p: number) => {
    pagination.value.page = p
    fetchNodes()
  }

  const addNode = async (nodeData: any, message?: any) => {
    submitting.value = true
    try {
      const data = await adminApi.createNode(nodeData)
      if (data.code === 0) {
        message?.success('添加节点成功')
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
    loading.value = false
    submitting.value = false
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
    loading,
    submitting,
    searchKeyword,
    selectedOnline,
    selectedStatus,
    pagination,
    hasFilters,
    shouldShowTable: computed(() => true),
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
