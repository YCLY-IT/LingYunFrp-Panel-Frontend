import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userApi } from '@/net'
import { accessHandle } from '@/net/base'
import type { DownloadSource, Software, SoftwareVersion } from '@/types'

export const useDownloadStore = defineStore('download', () => {
  const products = ref<Software[]>([])
  const allProducts = ref<Software[]>([])
  const softwareVersions = ref<SoftwareVersion[]>([])
  const downloadSources = ref<DownloadSource[]>([])
  const loading = ref(false)
  const loaded = ref(false)

  // 拉取所有数据
  async function fetchAll() {
    if (loaded.value) return
    loading.value = true
    await Promise.all([
      fetchProducts(),
      fetchDownloadSources(),
      fetchSoftwareVersions()
    ])
    loading.value = false
    loaded.value = true
  }

  async function fetchProducts() {
    return new Promise<void>((resolve) => {
      userApi.get('/user/info/softwares', accessHandle(), (data: any) => {
        if (!data.data || !data.data.softwares) {
          products.value = []
          allProducts.value = []
          resolve()
          return
        }
        allProducts.value = data.data.softwares
        products.value = allProducts.value
        resolve()
      })
    })
  }

  async function fetchDownloadSources() {
    return new Promise<void>((resolve) => {
      userApi.get('/user/info/download/sources', accessHandle(), (data: any) => {
        if (data.code !== 0 || !data.data) {
          downloadSources.value = []
          resolve()
          return
        }
        downloadSources.value = data.data || []
        resolve()
      })
    })
  }

  async function fetchSoftwareVersions() {
    return new Promise<void>((resolve) => {
      userApi.get('/user/info/softwares/version', accessHandle(), (data: any) => {
        if (data.code !== 0 || !data.data) {
          softwareVersions.value = []
          resolve()
          return
        }
        softwareVersions.value = data.data
        resolve()
      })
    })
  }

  // 可选：强制刷新
  async function refreshAll() {
    loaded.value = false
    await fetchAll()
  }

  return {
    products, allProducts, softwareVersions, downloadSources, loading, loaded,
    fetchAll, refreshAll
  }
})
