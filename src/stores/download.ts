import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userApi } from '@/net'
import type { DownloadSource, Software, SoftwareVersion } from '@/net/user/type'

export const useDownloadStore = defineStore('download', () => {
  const products = ref<Software[]>([])
  const allProducts = ref<Software[]>([])
  const softwareVersions = ref<SoftwareVersion[]>([])
  const downloadSources = ref<DownloadSource[]>([])
  const loading = ref(false)
  const loaded = ref(false)

  // 分页配置
  const pagination = ref({
    page: 1,
    pageSize: 20,
    pageCount: 1,
    itemCount: 0,
  })

  // 拉取所有数据
  async function fetchAll() {
    if (loaded.value) return
    loading.value = true
    await Promise.all([
      fetchProducts(),
      fetchDownloadSources(),
      fetchSoftwareVersions(),
    ])
    loading.value = false
    loaded.value = true
  }

  async function fetchProducts() {
    try {
      const data = await userApi.getSoftwares()
      let softwares: any[] = []
      const raw = data.data as any
      if (data.code === 0 && raw) {
        if (Array.isArray(raw)) {
          softwares = raw
        } else if (Array.isArray(raw.softwares)) {
          softwares = raw.softwares
        }
      }
      allProducts.value = softwares
      products.value = softwares
    } catch (error) {
      console.error('获取软件列表失败:', error)
      products.value = []
      allProducts.value = []
    }
  }

  async function fetchDownloadSources() {
    try {
      const data = await userApi.getDownloadSources()
      if (data.code === 0 && data.data) {
        downloadSources.value = data.data
      } else {
        downloadSources.value = []
      }
    } catch (error) {
      console.error('获取下载源失败:', error)
      downloadSources.value = []
    }
  }

  async function fetchSoftwareVersions() {
    try {
      const data = await userApi.getSoftwareVersions()
      if (data.code === 0 && data.data) {
        if (Array.isArray(data.data)) {
          softwareVersions.value = data.data
        } else if (Array.isArray(data.data.list)) {
          softwareVersions.value = data.data.list
          pagination.value.itemCount = data.data.total
          pagination.value.pageCount = data.data.totalPages
        } else {
          softwareVersions.value = []
        }
      } else {
        softwareVersions.value = []
      }
    } catch (error) {
      console.error('获取软件版本失败:', error)
      softwareVersions.value = []
    }
  }

  // 可选：强制刷新
  async function refreshAll() {
    loaded.value = false
    await fetchAll()
  }

  return {
    products,
    allProducts,
    softwareVersions,
    downloadSources,
    loading,
    loaded,
    pagination,
    fetchAll,
    refreshAll,
    fetchSoftwareVersions,
  }
})
