<template>
  <div class="downloads">
    <div class="downloads-layout">
      <!-- 左侧：资源下载 -->
      <NCard title="文件下载" class="download-card">
        <div class="downloads-container">
          <div class="select-row">
            <div class="select-label">下载源</div>
            <NPopselect
                v-model:value="selectedSource"
                :options="sourceOptions"
                trigger="click"
            >
              <NButton :focusable="false" text size="small" type="info">
                <span style="font-size: 16px;vertical-align: top;">{{ currentSource?.name || '请选择下载源' }}</span>
                <NIcon :size="16" style="margin-top: 2px;margin-left:4px;" :component="ChevronDownOutline" />
              </NButton>
            </NPopselect>
          </div>

          <div class="main-content" v-if="selectedSource">
            <div class="select-row">
              <div class="select-label">产品</div>
              <NPopselect
                  v-model:value="selectedProduct"
                  :options="productOptions"
                  trigger="click"
                  @update:value="handleProductChange"
              >
                <NButton :focusable="false" text size="small" type="info">
                  <span style="font-size: 16px;vertical-align: top;">{{ currentProduct?.name || '请选择产品' }}</span>
                  <NIcon :size="16" style="margin-top: 2px;margin-left:4px;" :component="ChevronDownOutline" />
                </NButton>
              </NPopselect>
              <NTag v-if="currentProduct" size="small" type="info" round>v{{ currentProduct.version }}</NTag>
            </div>

            <div v-if="currentProduct" class="product-content">
              <div class="markdown-content">
                <NText depth="3">
                  <div v-html="renderedDesc"></div>
                </NText>
              </div>
              <NDivider />

              <!-- Docker产品不显示系统和架构选择 -->
              <template v-if="!isDockerProduct">
                <div class="select-row">
                  <div class="select-label">系统</div>
                  <NSelect
                      :key="currentProduct.productId"
                      v-model:value="currentProduct.selectedSystem"
                      :options="getSystemOptions(currentProduct.system)"
                      @update:value="handleSystemChange"
                      placeholder="请选择系统"
                  />
                </div>
                <div class="select-row" style="margin-top: 8px;">
                  <div class="select-label">架构</div>
                  <NSelect
                      :key="currentProduct.productId"
                      v-model:value="currentProduct.selectedArch"
                      :options="getArchOptions(currentProduct.arch, currentProduct.selectedSystem)"
                      :disabled="!currentProduct.selectedSystem"
                      placeholder="请选择架构"
                  />
                </div>
                <div class="download-row">
                  <NButton
                      secondary
                      size="medium"
                      :disabled="!currentProduct.selectedSystem || !currentProduct.selectedArch"
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
                      :disabled="!currentProduct.selectedSystem || !currentProduct.selectedArch"
                      @click="handleDownload"
                  >
                    <template #icon>
                      <NIcon :component="DownloadOutline" />
                    </template>
                    下载
                  </NButton>
                </div>
              </template>

              <!-- Docker产品显示Docker提示 -->
              <template v-else>
                <div class="docker-info">
                  <NAlert type="info" title="Docker 镜像">
                    <template #icon>
                      <NIcon :component="InformationCircleOutline" />
                    </template>
                    <p>此产品为 Docker 镜像，请使用以下命令拉取：</p>
                    <div class="docker-command">
                      <NCode>docker pull {{ currentProduct.path }}:{{ currentProduct.version }}</NCode>
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
import { ref, computed, onMounted, watch } from 'vue'
import { NCode, NCard, NButton, NDivider, NText, NPopselect, NSelect, NIcon, NTag, NAlert, useMessage } from 'naive-ui'
import { ChevronDownOutline, DownloadOutline, CopyOutline, InformationCircleOutline } from '@vicons/ionicons5'
import type { SelectOption } from 'naive-ui'
import { marked } from 'marked'
import {accessHandle} from "@/net/base.ts";
import {userApi} from "@/net";

const message = useMessage()

// 新的数据结构
interface Product {
  id: number
  name: string
  url: string
  arch: string
  os: string
  desc: string
  version: string
  created_at: string
  updated_at: string
}

interface DownloadSource {
  id: string
  name: string
  path: string
}

const products = ref<(Product & {
  selectedSystem?: string
  selectedArch?: string
  system: string
  arch: string
})[]>([])
const downloadSources = ref<DownloadSource[]>([])
const selectedSource = ref<string>('')
const selectedProduct = ref<string>('')

// 判断当前产品是否为 Docker 产品
const isDockerProduct = computed(() => {
  if (!currentProduct.value) return false
  return currentProduct.value.name.toLowerCase().includes('docker')
})

const productOptions = computed<SelectOption[]>(() =>
    products.value.map(product => ({
      label: product.name,
      value: product.id.toString()
    })))

const currentProduct = computed(() =>
    products.value.find(p => p.id.toString() === selectedProduct.value))

const handleProductChange = () => {
  if (currentProduct.value) {
    currentProduct.value.selectedSystem = undefined
    currentProduct.value.selectedArch = undefined
  }
}

const getSystemOptions = (system: string): SelectOption[] => {
  return [{
    label: system,
    value: system
  }]
}

const getArchOptions = (arch: string, selectedSystem?: string): SelectOption[] => {
  if (!selectedSystem) return []
  return [{
    label: arch,
    value: arch
  }]
}

const handleSystemChange = () => {
  if (currentProduct.value) {
    currentProduct.value.selectedArch = undefined
  }
}

// 复制Docker命令
const copyDockerCommand = () => {
  if (!currentProduct.value) return
  const command = `docker pull ${currentProduct.value.url}:${currentProduct.value.version}`
  navigator.clipboard.writeText(command)
  message.success('复制 Docker 拉取命令成功')
}

const getDownloadUrl = async (product: Product & {
  selectedSystem?: string
  selectedArch?: string
}): Promise<string> => {
  if (!product.selectedSystem || !product.selectedArch) return '#'

  try {
    // 直接使用 product.url 作为下载链接
    return product.url
  } catch (error: any) {
    message.error(error.message || '获取下载链接失败')
    return '#'
  }
}

const handleDownload = async () => {
  if (!currentProduct.value) return
  const url = await getDownloadUrl(currentProduct.value)
  if (url !== '#') {
    window.open(url, '_blank')
  }
}

const handleCopyDownloadUrl = async () => {
  if (!currentProduct.value) return
  const url = await getDownloadUrl(currentProduct.value)
  if (url !== '#') {
    navigator.clipboard.writeText(url)
    message.success('复制下载链接成功')
  }
}

const fetchProducts = async () => {
  try {
    userApi.get('/user/info/download', accessHandle(), (data) => {
      products.value = data.data.map(product => ({
        ...product,
        selectedSystem: undefined,
        selectedArch: undefined,
        system: product.os,
        arch: product.arch
      }))
      if (data.length > 0) {
        selectedProduct.value = data[0].id.toString()
      }
    })
  } catch (error) {
    message.error('获取产品列表失败')
  }
}

const fetchDownloadSources = async () => {
  try {
    // 模拟从 API 获取下载源
    downloadSources.value = [
      {
        id: '1',
        name: '默认源',
        path: 'lyfrp'
      }
    ]
    if (downloadSources.value.length > 0) {
      selectedSource.value = downloadSources.value[0].id
    }
  } catch (error) {
    message.error('获取下载源列表失败')
  }
}

const currentSource = computed(() =>
    downloadSources.value.find(s => s.id === selectedSource.value))

const sourceOptions = computed<SelectOption[]>(() =>
    downloadSources.value.map(source => ({
      label: source.name,
      value: source.id
    })))

const renderedDesc = computed(() => {
  if (!currentProduct.value?.desc) return ''
  return marked(currentProduct.value.desc, { breaks: true })
})

onMounted(async () => {
  await Promise.all([
    fetchProducts(),
    fetchDownloadSources()
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
</style>