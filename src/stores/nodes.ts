import { defineStore } from 'pinia'
import { ref, computed, h } from 'vue'
import { adminApi } from '@/net'
import type { Node, GetNodesArgs } from '@/types'

export const useNodesStore = defineStore('nodes', () => {
  // 状态
  const nodes = ref<Node[]>([])
  const allNodes = ref<Node[]>([])
  const loading = ref(false)
  const submitting = ref(false)
  const dataLoaded = ref(false)
  
  // 筛选条件
  const searchKeyword = ref('')
  const selectedOnline = ref<string | null>(null)
  const selectedStatus = ref<string | null>(null)
  
  // 分页
  const pagination = ref({
    page: 1,
    pageSize: 10,
    pageCount: 1,
    itemCount: 0,
    prefix({ itemCount }: { itemCount?: number }) {
      return `共 ${itemCount} 条`
    }
  })

  // 计算属性
  const hasFilters = computed(() => {
    return searchKeyword.value || selectedOnline.value || selectedStatus.value
  })

  const shouldShowTable = computed(() => {
    if (!hasFilters.value) {
      return true
    }
    return nodes.value.length > 0
  })

  // 空状态插槽
  const emptySlot = () => {
    if (hasFilters.value) {
      return null
    }
    return h('div', { class: 'empty-state' }, [
      h('n-empty', { description: '暂无数据' })
    ])
  }

  // Actions
  const fetchNodes = async (message?: any) => {
    // 如果有筛选条件且已经加载过数据，从缓存中筛选
    if (hasFilters.value && dataLoaded.value) {
      filterNodesFromCache()
      return
    }

    loading.value = true
    try {
      const params: GetNodesArgs = {
        page: pagination.value.page,
        limit: pagination.value.pageSize
      }

      if (searchKeyword.value) {
        params.keyword = searchKeyword.value
      }
      if (selectedOnline.value) {
        params.isOnline = selectedOnline.value === 'online'
      }
      if (selectedStatus.value) {
        params.isDisabled = selectedStatus.value === 'disabled'
      }

      const data = await adminApi.getNodeList(params)
      if (data.code === 0) {
        const processedNodes = data.data.nodes.map(node => ({
          ...node,
          nodeId: node.id,
          servicePort: node.port,
          allowGroup: node.group || '',
          allowType: node.allowType || ''
        }))
        
        // 如果没有筛选条件，缓存所有数据
        if (!hasFilters.value) {
          allNodes.value = processedNodes
          dataLoaded.value = true
        }
        
        nodes.value = processedNodes
        pagination.value.pageCount = Math.ceil(data.data.total / pagination.value.pageSize)
        pagination.value.itemCount = data.data.total
      } else {
        message?.error(data.message || '获取节点列表失败')
      }
    } catch (error: any) {
      message?.error(error?.response?.data?.message || '获取节点列表失败')
    } finally {
      loading.value = false
    }
  }

  // 从缓存中筛选节点
  const filterNodesFromCache = () => {
    let filteredNodes = [...allNodes.value]
    
    // 按关键词筛选
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase()
      filteredNodes = filteredNodes.filter(node => 
        node.id.toString().includes(keyword) ||
        node.name.toLowerCase().includes(keyword) ||
        node.hostname.toLowerCase().includes(keyword)
      )
    }
    
    // 按在线状态筛选
    if (selectedOnline.value) {
      const isOnline = selectedOnline.value === 'online'
      filteredNodes = filteredNodes.filter(node => node.isOnline === isOnline)
    }
    
    // 按状态筛选
    if (selectedStatus.value) {
      const isDisabled = selectedStatus.value === 'disabled'
      filteredNodes = filteredNodes.filter(node => node.isDisabled === isDisabled)
    }
    
    // 计算分页
    const total = filteredNodes.length
    const startIndex = (pagination.value.page - 1) * pagination.value.pageSize
    const endIndex = startIndex + pagination.value.pageSize
    const pagedNodes = filteredNodes.slice(startIndex, endIndex)
    
    nodes.value = pagedNodes
    pagination.value.itemCount = total
    pagination.value.pageCount = Math.ceil(total / pagination.value.pageSize)
  }

  // 搜索处理
  const handleSearch = () => {
    pagination.value.page = 1
    if (hasFilters.value && dataLoaded.value) {
      filterNodesFromCache()
    } else {
      fetchNodes()
    }
  }

  // 筛选处理
  const handleFilterChange = () => {
    pagination.value.page = 1
    if (hasFilters.value && dataLoaded.value) {
      filterNodesFromCache()
    } else {
      fetchNodes()
    }
  }

  // 分页处理
  const handlePageChange = (page: number) => {
    pagination.value.page = page
    if (hasFilters.value && dataLoaded.value) {
      filterNodesFromCache()
    } else {
      fetchNodes()
    }
  }

  // 添加节点
  const addNode = async (nodeData: any, message?: any) => {
    submitting.value = true
    try {
      const data = await adminApi.createNode(nodeData)
      if (data.code === 0) {
        message?.success('添加节点成功')
        // 清除缓存，下次获取时重新加载
        dataLoaded.value = false
        allNodes.value = []
        await fetchNodes(message)
        return true
      } else {
        message?.error(data.message || '添加节点失败')
        return false
      }
    } catch (error: any) {
      message?.error(error?.response?.data?.message || '添加节点失败')
      return false
    } finally {
      submitting.value = false
    }
  }

  // 更新节点
  const updateNode = async (nodeData: any, message?: any) => {
    submitting.value = true
    try {
      const data = await adminApi.updateNode(nodeData)
      if (data.code === 0) {
        message?.success('更新节点成功')
        // 清除缓存，下次获取时重新加载
        dataLoaded.value = false
        allNodes.value = []
        await fetchNodes(message)
        return true
      } else {
        message?.error(data.message || '更新节点失败')
        return false
      }
    } catch (error: any) {
      message?.error(error?.response?.data?.message || '更新节点失败')
      return false
    } finally {
      submitting.value = false
    }
  }

  // 删除节点
  const deleteNode = async (nodeId: number, message?: any) => {
    submitting.value = true
    try {
      const data = await adminApi.deleteNode(nodeId)
      if (data.code === 0) {
        message?.success('删除节点成功')
        // 清除缓存，下次获取时重新加载
        dataLoaded.value = false
        allNodes.value = []
        await fetchNodes(message)
        return true
      } else {
        message?.error(data.message || '删除节点失败')
        return false
      }
    } catch (error: any) {
      message?.error(error?.response?.data?.message || '删除节点失败')
      return false
    } finally {
      submitting.value = false
    }
  }

  // 切换节点状态
  const toggleNode = async (nodeId: number, isDisabled: boolean, message?: any) => {
    submitting.value = true
    try {
      const data = await adminApi.toggleNode(nodeId, isDisabled)
      if (data.code === 0) {
        message?.success(isDisabled ? '禁用节点成功' : '启用节点成功')
        // 清除缓存，下次获取时重新加载
        dataLoaded.value = false
        allNodes.value = []
        await fetchNodes(message)
        return true
      } else {
        message?.error(data.message || '操作失败')
        return false
      }
    } catch (error: any) {
      message?.error(error?.response?.data?.message || '操作失败')
      return false
    } finally {
      submitting.value = false
    }
  }

  // 重置状态
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
      }
    }
  }

  return {
    // 状态
    nodes,
    allNodes,
    loading,
    submitting,
    dataLoaded,
    searchKeyword,
    selectedOnline,
    selectedStatus,
    pagination,
    
    // 计算属性
    hasFilters,
    shouldShowTable,
    emptySlot,
    
    // Actions
    fetchNodes,
    filterNodesFromCache,
    handleSearch,
    handleFilterChange,
    handlePageChange,
    addNode,
    updateNode,
    deleteNode,
    toggleNode,
    resetState
  }
}) 