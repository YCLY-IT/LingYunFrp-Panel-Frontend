<template>
  <div class="downloads">
    <div class="downloads-layout">
      <!-- 左侧：资源下载 -->
      <NCard title="文件下载" class="download-card">
        <div class="downloads-container">
          <!-- 下载源选择 -->
          <div class="select-row">
            <div class="select-label">下载源</div>
            <NPopselect
              v-model:value="selectedSource"
              :options="sourceOptions"
              trigger="click"
              @update:value="handleSourceChange"
            >
              <NButton :focusable="false" text size="small" type="info">
                <span class="select-text">{{ currentSource?.name || '请选择下载源' }}</span>
                <NIcon :size="16" class="select-icon" :component="ChevronDownOutline" />
              </NButton>
            </NPopselect>
          </div>

          <!-- 主要内容区域 -->
          <div class="main-content" v-if="selectedSource">
            <!-- 产品选择 -->
            <div class="select-row">
              <div class="select-label">产品</div>
              <NPopselect
                v-model:value="selectedProduct"
                :options="productOptions"
                trigger="click"
                @update:value="handleProductChange"
              >
                <NButton :focusable="false" text size="small" type="info">
                  <span class="select-text">{{ currentProduct?.name || '请选择产品' }}</span>
                  <NIcon :size="16" class="select-icon" :component="ChevronDownOutline" />
                </NButton>
              </NPopselect>
              <div v-if="currentProduct" class="version-selector">
                <NPopselect
                  v-model:value="selectedVersion"
                  :options="versionOptions"
                  trigger="click"
                  @update:value="handleVersionChange"
                >
                  <NButton :focusable="false" text size="small" type="info">
                    <div class="version-tag">
                      <NTag size="small" type="success" round>
                        <template #icon>
                          <NIcon :component="PricetagOutline" />
                        </template>
                        v{{ selectedVersion }}
                      </NTag>
                    </div>
                    <NIcon :size="16" class="select-icon" :component="ChevronDownOutline" />
                  </NButton>
                </NPopselect>
              </div>
            </div>

            <!-- 产品详情 -->
            <div v-if="currentProduct" class="product-content">
              <div class="markdown-content">
                <NText depth="3">
                  <div v-html="renderedDesc"></div>
                </NText>
              </div>
              <NDivider />

              <!-- 非Docker产品显示系统和架构选择 -->
              <template v-if="!isDockerProduct">
                <div class="select-row">
                  <div class="select-label">系统</div>
                  <NSelect
                    v-model:value="currentSystem"
                    :options="systemOptions"
                    @update:value="handleSystemChange"
                    placeholder="请选择系统"
                  />
                </div>
                <div class="select-row">
                  <div class="select-label">架构</div>
                  <NSelect
                    v-model:value="currentArch"
                    :options="archOptions"
                    :disabled="!currentSystem"
                    @update:value="handleArchChange"
                    placeholder="请选择架构"
                  />
                </div>
                <div class="download-row">
                  <NButton
                    secondary
                    size="medium"
                    :disabled="!canDownload"
                    @click="handleCopyDownloadUrl"
                  >
                    <template #icon>
                      <NIcon :component="CopyOutline" />
                    </template>
                    复制下载链接
                  </NButton>
                  <NButton
                    type="primary"
                    size="medium"
                    :disabled="!canDownload"
                    @click="handleDownload"
                  >
                    <template #icon>
                      <NIcon :component="DownloadOutline" />
                    </template>
                    下载
                  </NButton>
                </div>
              </template>

              <!-- Docker产品显示Docker命令 -->
              <template v-else>
                <div class="docker-info">
                  <NAlert type="info" title="Docker 镜像">
                    <template #icon>
                      <NIcon :component="InformationCircleOutline" />
                    </template>
                    <p>此产品为 Docker 镜像，请使用以下命令拉取：</p>
                    <div class="docker-command">
                      <NCode>docker pull {{ currentProduct.code }}:{{ selectedVersion }}</NCode>
                      <NButton size="small" @click="copyDockerCommand">
                        <template #icon>
                          <NIcon :component="CopyOutline" />
                        </template>
                        复制
                      </NButton>
                    </div>
                  </NAlert>
                </div>
              </template>
            </div>
          </div>
        </div>
      </NCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { NCode, NCard, NButton, NDivider, NText, NPopselect, NSelect, NIcon, NTag, NAlert, useMessage } from 'naive-ui'
import { ChevronDownOutline, DownloadOutline, CopyOutline, InformationCircleOutline, PricetagOutline } from '@vicons/ionicons5'
import type { SelectOption } from 'naive-ui'
import { marked } from 'marked'
import { accessHandle } from "@/net/base.ts"
import { userApi } from "@/net"

// 类型定义
interface Software {
  id: number
  name: string
  code: string
  description: string
  sourceId: number
  created_at: string
  updated_at: string
}

interface SoftwareVersion {
  id: number
  softwareId: number
  version: string
  downloadUrl: string
  os: string
  arch: string
  size: number
  created_at: string
  updated_at: string
}

interface DownloadSource {
  id: number
  name: string
  url: string
}

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

const message = useMessage()

// 状态管理
const products = ref<Software[]>([])
const allProducts = ref<Software[]>([])
const softwareVersions = ref<SoftwareVersion[]>([])
const downloadSources = ref<DownloadSource[]>([])
const selectedSource = ref<number | null>(null)
const selectedProduct = ref<number | null>(null)
const selectedVersion = ref<string | null>(null)
const versionSystemMap = ref<Map<string, string | null>>(new Map())
const versionArchMap = ref<Map<string, string | null>>(new Map())

// 计算属性
const isDockerProduct = computed(() => {
  if (!currentProduct.value) return false
  return currentProduct.value.code.toLowerCase().includes('docker')
})

const canDownload = computed(() => {
  if (!currentProduct.value || !selectedVersion.value) return false
  return !isDockerProduct.value && currentSystem.value && currentArch.value
})

const productOptions = computed<SelectOption[]>(() => {
  const uniqueProducts = new Map<string, Software>()
  products.value.forEach(product => {
    if (!uniqueProducts.has(product.name)) {
      uniqueProducts.set(product.name, product)
    }
  })
  return Array.from(uniqueProducts.values()).map(product => ({
    label: product.name,
    value: product.id
  }))
})

const currentProduct = computed(() => {
  return (products.value || []).find(p => p.id === selectedProduct.value) || null
})

const currentSource = computed(() =>
  (downloadSources.value || []).find(s => s.id === selectedSource.value)
)

const sourceOptions = computed<SelectOption[]>(() =>
  (downloadSources.value || []).map(source => ({
    label: source.name,
    value: source.id
  }))
)

const currentSystem = computed(() => {
  if (!selectedVersion.value) return null
  return versionSystemMap.value.get(selectedVersion.value) || null
})

const currentArch = computed(() => {
  if (!selectedVersion.value) return null
  return versionArchMap.value.get(selectedVersion.value) || null
})

const systemOptions = computed<SelectOption[]>(() => {
  if (!currentProduct.value || !selectedVersion.value) return []
  const systems = new Set<string>()
  softwareVersions.value
    .filter(v => v.softwareId === currentProduct.value?.id && v.version === selectedVersion.value)
    .forEach(v => systems.add(v.os))
  return Array.from(systems).map(os => ({
    label: os,
    value: os
  }))
})

const archOptions = computed<SelectOption[]>(() => {
  if (!currentProduct.value || !selectedVersion.value || !currentSystem.value) return []
  const archs = new Set<string>()
  softwareVersions.value
    .filter(v => 
      v.softwareId === currentProduct.value?.id && 
      v.version === selectedVersion.value && 
      v.os === currentSystem.value
    )
    .forEach(v => archs.add(v.arch))
  return Array.from(archs).map(arch => ({
    label: arch,
    value: arch
  }))
})

const renderedDesc = computed(() => {
  if (!currentProduct.value?.description) return ''
  return marked(currentProduct.value.description, { breaks: true })
})

const versionOptions = computed<SelectOption[]>(() => {
  if (!currentProduct.value) return []
  const versions = new Set<string>()
  softwareVersions.value
    .filter(v => v.softwareId === currentProduct.value?.id)
    .forEach(v => versions.add(v.version))
  return Array.from(versions)
    .sort((a, b) => b.localeCompare(a))
    .map(version => ({
      label: `v${version}`,
      value: version
    }))
})

// 方法
const handleSourceChange = (value: number) => {
  selectedSource.value = value
  selectedProduct.value = null
  selectedVersion.value = null
  if (value) {
    products.value = allProducts.value.filter(p => p.sourceId === value)
  } else {
    products.value = allProducts.value
  }
}

const handleProductChange = (value: number) => {
  selectedProduct.value = value
  selectedVersion.value = null
  // 清空版本相关的系统架构映射
  versionSystemMap.value.clear()
  versionArchMap.value.clear()
  
  // 获取当前产品的所有版本并设置最高版本
  if (value) {
    const versions = softwareVersions.value
      .filter(v => v.softwareId === value)
      .map(v => v.version)
      .sort((a, b) => b.localeCompare(a))
    
    if (versions.length > 0) {
      selectedVersion.value = versions[0]
      // 初始化最高版本的系统架构映射
      versionSystemMap.value.set(versions[0], null)
      versionArchMap.value.set(versions[0], null)
    }
  }
}

const handleSystemChange = (value: string) => {
  if (!selectedVersion.value) return
  versionSystemMap.value.set(selectedVersion.value, value)
  versionArchMap.value.set(selectedVersion.value, null)
}

const handleArchChange = (value: string) => {
  if (!selectedVersion.value) return
  versionArchMap.value.set(selectedVersion.value, value)
}

const handleVersionChange = (version: string) => {
  selectedVersion.value = version
  if (!versionSystemMap.value.has(version)) {
    versionSystemMap.value.set(version, null)
  }
  if (!versionArchMap.value.has(version)) {
    versionArchMap.value.set(version, null)
  }
}

const copyDockerCommand = () => {
  if (!currentProduct.value) return
  const command = `docker pull ${currentProduct.value.code}:${selectedVersion.value}`
  navigator.clipboard.writeText(command)
  message.success('复制 Docker 拉取命令成功')
}

const getDownloadUrl = async (): Promise<string> => {
  if (!currentProduct.value || !selectedVersion.value || !currentSystem.value || !currentArch.value) return '#'
  const version = softwareVersions.value.find(
    v => v.softwareId === currentProduct.value?.id && 
         v.version === selectedVersion.value && 
         v.os === currentSystem.value && 
         v.arch === currentArch.value
  )
  return version?.downloadUrl || '#'
}

const handleDownload = async () => {
  const url = await getDownloadUrl()
  if (url !== '#') {
    window.open(url, '_blank')
  }
}

const handleCopyDownloadUrl = async () => {
  const url = await getDownloadUrl()
  if (url !== '#') {
    navigator.clipboard.writeText(url)
    message.success('复制下载链接成功')
  }
}

// 数据获取
const fetchProducts = async () => {
  try {
    userApi.get('/user/info/softwares', accessHandle(), (data: ApiResponse<{ softwares: Software[] }>) => {
      if (!data.data || !data.data.softwares) {
        message.info('暂无可用产品')
        products.value = []
        allProducts.value = []
        return
      }

      allProducts.value = data.data.softwares
      products.value = allProducts.value
    })
  } catch (error) {
    message.error('获取产品列表失败')
    products.value = []
    allProducts.value = []
  }
}

const fetchDownloadSources = async () => {
  try {
    userApi.get('/user/info/download/sources', accessHandle(), (data: ApiResponse<DownloadSource[]>) => {
      if (data.code !== 0 || !data.data) {
        message.info('没有可用的源')
        downloadSources.value = []
        return
      }
      downloadSources.value = data.data || []
    })
  } catch (error) {
    message.error('获取下载源列表失败')
    downloadSources.value = []
  }
}

const fetchSoftwareVersions = async () => {
  try {
    userApi.get('/user/info/softwares/version', accessHandle(), (data: ApiResponse<SoftwareVersion[]>) => {
      if (data.code !== 0 || !data.data) {
        message.info('暂无可用版本')
        softwareVersions.value = []
        return
      }
      softwareVersions.value = data.data
    })
  } catch (error) {
    message.error('获取软件版本列表失败')
    softwareVersions.value = []
  }
}

onMounted(async () => {
  await Promise.all([
    fetchProducts(),
    fetchDownloadSources(),
    fetchSoftwareVersions()
  ])
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/downloads.scss' as *;

.docker-info {
  margin-top: 16px;
}

.docker-command {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
  background-color: rgba(0, 0, 0, 0.03);
  padding: 8px 12px;
  border-radius: 4px;

  code {
    flex: 1;
    font-family: monospace;
    font-size: 14px;
    overflow-x: auto;
    white-space: nowrap;
  }
}

.version-selector {
  margin-left: 8px;
  display: inline-flex;
  align-items: center;

  .n-button {
    padding: 0;
    height: auto;
  }

  .select-icon {
    margin-left: 4px;
  }
}

.version-tag {
  display: inline-flex;
  align-items: center;
  
  :deep(.n-tag) {
    font-weight: 500;
    padding: 0 12px;
    height: 24px;
    line-height: 24px;
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-color) 100%);
    border: none;
    box-shadow: 0 2px 4px rgba(24, 160, 88, 0.1);
    
    .n-icon {
      margin-right: 4px;
      font-size: 14px;
    }
  }
}
</style>