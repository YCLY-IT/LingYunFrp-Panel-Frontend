<template>
  <div>
    <NSpin :show="loading">
      <NCard title="产品下载">
        <template #header>
          <div>
            <NText depth="3">选择下载源和产品，获取最新版本</NText>
          </div>
        </template>

        <NTabs type="line" animated>
          <NTabPane name="download" tab="文件下载">
            <div class="pt-1">
              <div class="flex flex-wrap gap-4 items-end mb-6">
                <div>
                  <span class="block text-[13px] text-[var(--n-text-color-3)] mb-1.5">下载源</span>
                  <NSelect
                    v-model:value="srcId"
                    :options="srcOpts"
                    placeholder="全部下载源"
                    style="min-width: 180px"
                    @update:value="onSrcChange"
                  />
                </div>
                <div>
                  <span class="block text-[13px] text-[var(--n-text-color-3)] mb-1.5">产品</span>
                  <NSelect
                    v-model:value="prodId"
                    :options="prodOpts"
                    placeholder="请选择产品"
                    style="min-width: 240px"
                    @update:value="onProdChange"
                  />
                </div>
                <div v-if="curProd">
                  <span class="block text-[13px] text-[var(--n-text-color-3)] mb-1.5">版本</span>
                  <NSelect
                    v-model:value="ver"
                    :options="verOpts"
                    placeholder="请选择版本"
                    style="min-width: 140px"
                    @update:value="onVerChange"
                  />
                </div>
                <template v-if="curProd && !isDocker">
                  <div>
                    <span class="block text-[13px] text-[var(--n-text-color-3)] mb-1.5">系统</span>
                    <NSelect
                      v-model:value="os"
                      :options="osOpts"
                      placeholder="请选择"
                      style="min-width: 130px"
                    />
                  </div>
                  <div>
                    <span class="block text-[13px] text-[var(--n-text-color-3)] mb-1.5">架构</span>
                    <NSelect
                      v-model:value="arch"
                      :options="archOpts"
                      placeholder="请选择"
                      style="min-width: 130px"
                      :disabled="!os"
                    />
                  </div>
                </template>
              </div>

              <div
                v-if="curProd"
                class="bg-[var(--n-color-embedded)] rounded-lg p-5"
              >
                <div class="flex items-center gap-2.5 [&_h3]:m-0">
                  <h3>{{ curProd.name }}</h3>
                  <NTag v-if="isDocker" type="info" size="small">Docker</NTag>
                </div>
                <div
                  v-if="curProd.description"
                  class="mt-3 leading-[1.7] text-[var(--n-text-color-2)] [&_a]:text-[var(--n-color-primary)]"
                  v-html="descHtml"
                />

                <NDivider />

                <div v-if="isDocker" class="[&_p]:mt-0 [&_p]:mb-2">
                  <NAlert type="info">
                    <template #icon>
                      <NIcon><InfoIcon /></NIcon>
                    </template>
                    <p>使用以下命令拉取镜像：</p>
                    <div
                      class="flex items-center gap-2 bg-[var(--n-color)] rounded-md p-[6px_6px_6px_12px]"
                    >
                      <NCode>{{ dockerCmd }}</NCode>
                      <NButton text size="small" @click="copyDockerCmd">
                        <template #icon>
                          <NIcon><CopyIcon /></NIcon>
                        </template>
                      </NButton>
                    </div>
                  </NAlert>
                </div>

                <div v-else class="flex gap-3">
                  <NButton secondary :disabled="!ready" @click="copyLink">
                    <template #icon>
                      <NIcon><CopyIcon /></NIcon>
                    </template>
                    复制链接
                  </NButton>
                  <NButton
                    type="primary"
                    :disabled="!ready"
                    @click="doDownload"
                  >
                    <template #icon>
                      <NIcon><DownloadIcon /></NIcon>
                    </template>
                    下载
                  </NButton>
                </div>
              </div>

              <NEmpty
                v-else
                description="请选择下载源和产品"
                class="mt-20 mb-20"
              >
                <template #icon>
                  <NIcon size="48"><DownloadIcon /></NIcon>
                </template>
              </NEmpty>
            </div>
          </NTabPane>

          <NTabPane name="overview" tab="产品总览">
            <div class="pt-1">
              <div class="ov-flt">
                <span class="block text-[13px] text-[var(--n-text-color-3)] mb-1.5" style="margin-bottom: 6px">下载源</span>
                <NSelect
                  :value="ovSrc"
                  :options="ovSrcOpts"
                  placeholder="全部下载源"
                  style="min-width: 180px; margin-bottom: 16px"
                  @update:value="ovSrc = $event"
                />
              </div>
              <NDataTable
                :columns="overCols"
                :data="overData"
                :pagination="overPg"
                :bordered="true"
                :scroll-x="1000"
                :max-height="550"
                :row-key="(r: any) => r.id"
                :expanded-row-keys="expKeys"
                @update:expanded-row-keys="
                  (keys: any[]) => {
                    expKeys = keys
                  }
                "
              />
            </div>
          </NTabPane>
        </NTabs>
      </NCard>
    </NSpin>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { useDownloadStore } from '@/stores/download'
import {
  NCode,
  NCard,
  NButton,
  NDivider,
  NText,
  NSelect,
  NIcon,
  NTag,
  NAlert,
  useMessage,
  NDataTable,
  NTabs,
  NTabPane,
  NSpin,
  NEmpty,
  type DataTableColumns,
} from 'naive-ui'
import {
  DownloadOutline,
  CopyOutline,
  InformationCircleOutline,
} from '@vicons/ionicons5'
import { marked } from 'marked'
import type { SoftwareVersion } from '@/net/user/type'

const DownloadIcon = DownloadOutline
const CopyIcon = CopyOutline
const InfoIcon = InformationCircleOutline

const message = useMessage()
const store = useDownloadStore()

onMounted(() => {
  store.fetchAll()
})

const loading = computed(() => store.loading)

// ====== 下载页 ======
const srcId = ref<number | null>(null)
const prodId = ref<number | null>(null)
const ver = ref<string | null>(null)
const os = ref<string | null>(null)
const arch = ref<string | null>(null)

const srcOpts = computed<any[]>(() => [
  { label: '全部下载源', value: null },
  ...store.downloadSources.map((s) => ({ label: s.name, value: s.id })),
])

const filteredProducts = computed(() => {
  if (!srcId.value) return store.allProducts
  return store.allProducts.filter((p) => p.source_id === srcId.value)
})

const prodOpts = computed(() =>
  filteredProducts.value.map((p) => ({ label: p.name, value: p.id })),
)

const curProd = computed(() => {
  if (!prodId.value) return null
  return store.allProducts.find((p) => p.id === prodId.value) || null
})

const isDocker = computed(() => {
  if (!curProd.value) return false
  return curProd.value.code.toLowerCase().includes('docker')
})

const prodVers = computed(() =>
  store.softwareVersions.filter((v) => v.software_id === prodId.value),
)

const verOpts = computed(() =>
  prodVers.value
    .map((v) => v.version)
    .filter((x, i, a) => a.indexOf(x) === i)
    .sort((a, b) => b.localeCompare(a))
    .map((v) => ({ label: `v${v}`, value: v })),
)

const curVers = computed(() =>
  prodVers.value.filter((v) => v.version === ver.value),
)

const osOpts = computed(() => {
  if (!ver.value || isDocker.value) return []
  const set = new Set(
    prodVers.value.filter((v) => v.version === ver.value).map((v) => v.os),
  )
  return [...set].map((o) => ({ label: o, value: o }))
})

const archOpts = computed(() => {
  if (!os.value || isDocker.value) return []
  return curVers.value
    .filter((v) => v.os === os.value)
    .map((v) => ({ label: v.arch, value: v.arch }))
})

const curFile = computed(() => {
  if (!ver.value || isDocker.value) return null
  return (
    curVers.value.find((v) => v.os === os.value && v.arch === arch.value) ||
    null
  )
})

const ready = computed(() => {
  if (!curProd.value) return false
  if (isDocker.value) return !!ver.value
  return !!curFile.value?.download_url
})

const dockerCmd = computed(() => {
  if (!curProd.value || !isDocker.value) return ''
  const tag = ver.value || 'latest'
  return `docker pull ${curProd.value.code}:${tag}`
})

const descHtml = computed(() => {
  if (!curProd.value?.description) return ''
  return marked.parse(curProd.value.description, { breaks: true }) as string
})

// 切换下载源时重置所有
function onSrcChange() {
  prodId.value = null
  ver.value = null
  os.value = null
  arch.value = null
}

// 切换产品时自动选第一个版本
function onProdChange() {
  ver.value = null
  os.value = null
  arch.value = null
  if (verOpts.value.length === 1) {
    ver.value = verOpts.value[0].value as string
  }
}

// 切换版本时，如果只有一个 os 就自动选
function onVerChange() {
  os.value = null
  arch.value = null
  if (!isDocker.value && osOpts.value.length === 1) {
    os.value = osOpts.value[0].value as string
  }
}

function copyLink() {
  const url = curFile.value?.download_url
  if (!url) return
  navigator.clipboard
    .writeText(url)
    .then(() => message.success('下载链接已复制'))
}

function doDownload() {
  const url = curFile.value?.download_url
  if (!url) return
  window.open(url, '_blank')
}

function copyDockerCmd() {
  navigator.clipboard
    .writeText(dockerCmd.value)
    .then(() => message.success('命令已复制'))
}

// ====== 产品总览 ======
const expKeys = ref<number[]>([])
const ovSrc = ref<number | null>(null)

const ovSrcOpts = computed<any[]>(() => [
  { label: '全部下载源', value: null },
  ...store.downloadSources.map((s) => ({ label: s.name, value: s.id })),
])

const overData = computed(() => {
  let list = store.allProducts
  if (ovSrc.value) {
    list = list.filter((p) => p.source_id === ovSrc.value)
  }
  return list
    .map((p) => {
      const allVer = store.softwareVersions.filter(
        (v) => v.software_id === p.id,
      )
      if (!allVer.length) return null
      const uniqueVers = [...new Set(allVer.map((v) => v.version))]
      const latest = uniqueVers.sort((a, b) => b.localeCompare(a))[0]
      const src = store.downloadSources.find((s) => s.id === p.source_id)
      return {
        ...p,
        uniqueVers,
        latestVer: latest || '-',
        verCount: uniqueVers.length,
        srcName: src?.name || '-',
        allVer,
      }
    })
    .filter(Boolean) as any[]
})

const overCols: DataTableColumns<any> = [
  {
    type: 'expand',
    renderExpand(row: any) {
      const versions: SoftwareVersion[] = row.allVer || []
      const grouped = new Map<string, string[]>()
      versions.forEach((v) => {
        if (!grouped.has(v.version)) grouped.set(v.version, [])
        grouped.get(v.version)!.push(`${v.os}/${v.arch}`)
      })
      const sortedKeys = [...grouped.keys()].sort((a, b) => b.localeCompare(a))
      if (!sortedKeys.length) {
        return h('div', { class: 'text-[13px] text-[var(--n-text-color-3)]' }, '暂无版本')
      }
      return h(
        'div',
        { class: 'py-1' },
        sortedKeys.map((verName) =>
          h('div', { class: 'flex items-center gap-2.5 py-[3px]' }, [
            h(
              NTag,
              { type: 'success', size: 'small', round: true },
              { default: () => `v${verName}` },
            ),
            h(
              'span',
              { class: 'text-[13px] text-[var(--n-text-color-3)]' },
              grouped.get(verName)!.join(', '),
            ),
          ]),
        ),
      )
    },
  },
  { title: '产品名称', key: 'name', width: 180 },
  { title: '标识', key: 'code', width: 120 },
  { title: '版本数', key: 'verCount', width: 80, align: 'center' as const },
  { title: '最新版本', key: 'latestVer', width: 120 },
  { title: '下载源', key: 'srcName', width: 120 },
]

const overPg = { pageSize: 12, pageSizes: [10, 12, 20, 30] }
</script>
