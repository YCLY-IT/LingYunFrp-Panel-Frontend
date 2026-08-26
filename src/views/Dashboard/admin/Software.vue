<template>
  <div class="software-container">
    <n-card title="软件管理">
      <!-- 桌面端筛选 -->
      <div v-if="!isMobile" class="software-sort-row">
        <n-select
          v-model:value="sortOptions.key"
          :options="sortFieldOptions"
          placeholder="排序字段"
          clearable
          class="software-sort-item"
          @update:value="handleSortFieldChange"
        />
        <n-select
          v-model:value="sortOptions.order"
          :options="sortOrderOptions"
          placeholder="排序方式"
          clearable
          class="software-sort-item"
          @update:value="handleSortOrderChange"
        />
        <n-button
          type="primary"
          @click="handleAddSoftware"
          class="software-sort-btn"
          size="medium"
        >
          添加软件
        </n-button>
      </div>
      <!-- 移动端筛选 -->
      <n-space v-else vertical :size="8" style="width: 100%">
        <n-grid :cols="2" :x-gap="8">
          <n-grid-item>
            <n-select
              v-model:value="sortOptions.key"
              :options="sortFieldOptions"
              placeholder="排序字段"
              clearable
              style="width: 100%"
              @update:value="handleSortFieldChange"
            />
          </n-grid-item>
          <n-grid-item>
            <n-select
              v-model:value="sortOptions.order"
              :options="sortOrderOptions"
              placeholder="排序方式"
              clearable
              style="width: 100%"
              @update:value="handleSortOrderChange"
            />
          </n-grid-item>
        </n-grid>
        <n-button
          type="primary"
          @click="handleAddSoftware"
          style="width: 100%"
          size="medium"
        >
          添加软件
        </n-button>
      </n-space>

      <div class="table-container">
        <n-data-table
          :columns="columns"
          :data="sortedSoftwareList"
          :loading="initLoading"
          :scroll-x="900"
          size="medium"
        />
      </div>
    </n-card>

    <!-- 添加/编辑软件对话框 -->
    <n-modal
      v-model:show="showAddModal"
      :title="editingSoftware ? '编辑软件' : '添加软件'"
      preset="card"
      :style="modalStyle"
      :mask-closable="false"
      @update:show="(show) => !show && handleModalClosed('software-modal')"
    >
      <n-form
        ref="formRef"
        :model="formValue"
        :rules="rules"
        label-placement="top"
        label-width="auto"
        require-mark-placement="right-hanging"
      >
        <n-form-item label="软件名称" path="name">
          <n-input
            v-model:value="formValue.name"
            placeholder="请输入软件名称"
          />
        </n-form-item>
        <n-form-item label="软件代号" path="code">
          <n-input
            v-model:value="formValue.code"
            placeholder="请输入软件代号"
          />
        </n-form-item>
        <n-form-item label="描述" path="description">
          <n-input
            v-model:value="formValue.description"
            type="textarea"
            placeholder="请输入软件描述"
            :autosize="{ minRows: 3, maxRows: 5 }"
          />
        </n-form-item>
        <n-form-item label="下载源" path="sourceId">
          <n-select
            v-model:value="formValue.sourceId"
            :options="
              downloadSources.map((source) => ({
                label: source.name,
                value: source.id,
              }))
            "
            placeholder="请选择下载源"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end" :size="[8, 8]">
          <n-button @click="handleCloseSoftwareModal" size="medium"
            >取消</n-button
          >
          <n-button type="primary" @click="handleSubmit" size="medium"
            >确定</n-button
          >
        </n-space>
      </template>
    </n-modal>

    <!-- 版本管理对话框 -->
    <n-modal
      v-model:show="showVersionModal"
      title="版本管理"
      preset="card"
      :style="versionModalStyle"
      :mask-closable="false"
      @update:show="(show) => !show && handleModalClosed('version-modal')"
    >
      <n-space vertical :size="16">
        <n-space justify="space-between" align="center">
          <n-alert
            v-if="editingSoftware"
            type="info"
            :bordered="false"
            style="flex: 1"
          >
            当前软件: {{ editingSoftware.name }} (ID: {{ editingSoftware.id }})
          </n-alert>
          <n-button type="primary" @click="handleAddVersion" size="small">
            添加版本
          </n-button>
        </n-space>

        <div class="version-table-container">
          <n-data-table
            :columns="versionColumns"
            :data="currentVersions"
            :scroll-x="600"
            size="small"
          />
        </div>
      </n-space>
      <template #footer>
        <n-space justify="end" :size="[8, 8]">
          <n-button @click="handleCloseVersionModal" size="small"
            >关闭</n-button
          >
        </n-space>
      </template>
    </n-modal>

    <!-- 添加/编辑版本对话框 -->
    <n-modal
      v-model:show="showAddVersionModal"
      :title="editingVersion ? '编辑版本' : '添加版本'"
      preset="card"
      :style="modalStyle"
      :mask-closable="false"
      @update:show="(show) => !show && handleModalClosed('add-version-modal')"
    >
      <n-form
        ref="versionFormRef"
        :model="versionForm"
        :rules="versionRules"
        label-placement="top"
        label-width="auto"
        require-mark-placement="right-hanging"
      >
        <n-grid :cols="24" :x-gap="12">
          <n-form-item-gi :span="12" label="版本号" path="version">
            <n-input
              v-model:value="versionForm.version"
              placeholder="请输入版本号"
            />
          </n-form-item-gi>
          <n-form-item-gi :span="12" label="文件大小(MB)" path="size">
            <n-input-number
              v-model:value="versionForm.size"
              placeholder="请输入文件大小"
              style="width: 100%"
              :min="0"
              :precision="2"
            />
          </n-form-item-gi>
        </n-grid>

        <n-form-item label="下载地址" path="download_url">
          <n-input
            v-model:value="versionForm.download_url"
            placeholder="请输入下载地址"
          />
        </n-form-item>

        <n-grid :cols="24" :x-gap="12">
          <n-form-item-gi :span="12" label="操作系统" path="os">
            <n-select
              v-model:value="versionForm.os"
              :options="osOptions"
              placeholder="请选择操作系统"
            />
          </n-form-item-gi>
          <n-form-item-gi :span="12" label="架构" path="arch">
            <n-select
              v-model:value="versionForm.arch"
              :options="archOptions"
              placeholder="请选择架构"
            />
          </n-form-item-gi>
        </n-grid>

        <n-form-item label="强制更新" path="force_update">
          <n-checkbox v-model:checked="versionForm.force_update">
            是否强制更新到此版本
          </n-checkbox>
          <template #feedback>
            开启后，用户打开部分软件时会强制更新到此版本
          </template>
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end" :size="[8, 8]">
          <n-button @click="handleCloseAddVersionModal" size="small"
            >取消</n-button
          >
          <n-button type="primary" @click="handleVersionSubmit" size="small"
            >确定</n-button
          >
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, h, onMounted, onUnmounted, computed } from 'vue'
import {
  NButton,
  NSpace,
  useMessage,
  NCheckbox,
  NGrid,
  NGridItem,
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { adminApi } from '@/net'
import type { Software, SoftwareVersion } from '@/net/admin/type'

interface DownloadSource {
  id: number
  name: string
  path: string
  created_at: string
  updated_at: string
}

const message = useMessage()

// 判断是否为移动端
const isMobile = computed(() => {
  return window.innerWidth <= 768
})

const loading = ref(false)
const showAddModal = ref(false)
const showVersionModal = ref(false)
const showAddVersionModal = ref(false)
const editingSoftware = ref<Software | null>(null)
const softwareList = ref<Software[]>([])
const downloadSources = ref<DownloadSource[]>([])
const currentVersions = ref<SoftwareVersion[]>([])
const allVersions = ref<SoftwareVersion[]>([])
const initLoading = ref(true)

const unregisterSoftwareModal = ref<(() => void) | undefined>(undefined)
const unregisterVersionModal = ref<(() => void) | undefined>(undefined)
const unregisterAddVersionModal = ref<(() => void) | undefined>(undefined)

const sortFieldOptions = [
  { label: 'ID', value: 'id' },
  { label: '软件名称', value: 'name' },
  { label: '软件代号', value: 'code' },
  { label: '创建时间', value: 'created_at' },
]
const sortOrderOptions = [
  { label: '升序', value: 'asc' },
  { label: '降序', value: 'desc' },
]
const sortOptions = ref({ key: 'id', order: 'asc' })

const sortedSoftwareList = computed(() => {
  let sorted = [...softwareList.value]
  if (sortOptions.value.key && sortOptions.value.order) {
    sorted = sorted.sort((a, b) => {
      let aValue: any, bValue: any
      switch (sortOptions.value.key) {
        case 'id':
          aValue = a.id
          bValue = b.id
          break
        case 'name':
          aValue = a.name
          bValue = b.name
          break
        case 'code':
          aValue = a.code
          bValue = b.code
          break
        case 'created_at':
          aValue = a.created_at
          bValue = b.created_at
          break
        default:
          return 0
      }
      // 主字段相同用ID次级排序
      if (aValue === bValue) {
        return sortOptions.value.order === 'asc' ? a.id - b.id : b.id - a.id
      }
      if (sortOptions.value.order === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
      }
    })
  }
  return sorted
})

const handleSortFieldChange = () => {}
const handleSortOrderChange = () => {}

// 响应式样式计算
const modalStyle = computed(() => {
  const isMobile = window.innerWidth <= 768
  return {
    width: isMobile ? '95vw' : '600px',
    maxWidth: '95vw',
  }
})

const versionModalStyle = computed(() => {
  const isMobile = window.innerWidth <= 768
  return {
    width: isMobile ? '95vw' : '800px',
    maxWidth: '95vw',
  }
})

const formValue = ref({
  name: '',
  code: '',
  description: '',
  sourceId: '' as string | number,
})

const versionForm = ref({
  version: '',
  download_url: '',
  os: '',
  arch: '',
  size: 0,
  force_update: false,
})

const editingVersion = ref<SoftwareVersion | null>(null)

const rules = {
  name: { required: true, message: '请输入软件名称', trigger: 'blur' },
  code: { required: true, message: '请输入软件代码', trigger: 'blur' },
  description: { required: true, message: '请输入软件描述', trigger: 'blur' },
  sourceId: { required: true, message: '请选择下载源', trigger: 'blur' },
}

const versionRules = {
  version: { required: true, message: '请输入版本号', trigger: 'blur' },
  download_url: { required: true, message: '请输入下载地址', trigger: 'blur' },
  os: { required: true, message: '请选择操作系统', trigger: 'blur' },
  arch: { required: true, message: '请选择架构', trigger: 'blur' },
  size: { required: true, message: '请输入文件大小', trigger: 'blur' },
}

const osOptions = [
  { label: 'Windows', value: 'windows' },
  { label: 'Linux', value: 'linux' },
  { label: 'macOS', value: 'macos' },
]

const archOptions = [
  { label: 'amd64', value: 'amd64' },
  { label: 'arm64', value: 'arm64' },
  { label: '386', value: '386' },
]

const columns: DataTableColumns<Software> = [
  {
    title: 'ID',
    key: 'id',
    width: 60,
    minWidth: 60,
  },
  {
    title: '软件名称',
    key: 'name',
    minWidth: 120,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '软件代号',
    key: 'code',
    minWidth: 100,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '最新版本',
    key: 'latestVersion',
    minWidth: 100,
    render: (row) => {
      if (!row.versions || row.versions.length === 0) {
        return '-'
      }
      const latestVersion = row.versions.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )[0]
      return latestVersion ? latestVersion.version : '-'
    },
  },
  {
    title: '创建时间',
    key: 'created_at',
    minWidth: 120,
    render: (row) => formatDate(row.created_at),
  },
  {
    title: '操作',
    key: 'actions',
    width: 180,
    minWidth: 180,
    render: (row) => {
      return h(
        NSpace,
        { size: [4, 4] },
        {
          default: () => [
            h(
              NButton,
              {
                size: 'small',
                onClick: () => handleEdit(row),
              },
              { default: () => '编辑' },
            ),
            h(
              NButton,
              {
                size: 'small',
                type: 'info',
                onClick: () => handleVersionManage(row),
              },
              { default: () => '版本' },
            ),
            h(
              NButton,
              {
                size: 'small',
                type: 'error',
                onClick: () => handleDelete(row),
              },
              { default: () => '删除' },
            ),
          ],
        },
      )
    },
  },
]

const versionColumns: DataTableColumns<SoftwareVersion> = [
  {
    title: '软件ID',
    key: 'software_id',
    minWidth: 80,
  },
  {
    title: '版本号',
    key: 'version',
    minWidth: 80,
  },
  {
    title: '系统',
    key: 'os',
    minWidth: 80,
  },
  {
    title: '架构',
    key: 'arch',
    minWidth: 80,
  },
  {
    title: '大小',
    key: 'size',
    minWidth: 80,
    render: (row) => formatSize(row.size),
  },
  {
    title: '强制更新',
    key: 'force_update',
    minWidth: 80,
    render: (row) => (row.force_update ? '是' : '否'),
  },
  {
    title: '创建时间',
    key: 'created_at',
    minWidth: 120,
    render: (row) => formatDate(row.created_at),
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    minWidth: 150,
    render: (row) => {
      return h('div', { style: { display: 'flex', gap: '8px' } }, [
        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            onClick: () => handleEditVersion(row),
          },
          { default: () => '编辑' },
        ),
        h(
          NButton,
          {
            size: 'small',
            type: 'error',
            onClick: () => handleDeleteVersion(row),
          },
          { default: () => '删除' },
        ),
      ])
    },
  },
]

const formatSize = (size: number) => {
  if (!size || size === 0) return '0 MB'
  const units = ['MB', 'GB']
  let index = 0
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024
    index++
  }
  return `${size.toFixed(2)} ${units[index]}`
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

const handleAddSoftware = () => {
  editingSoftware.value = null
  formValue.value = {
    name: '',
    code: '',
    description: '',
    sourceId: '',
  }
  window.$modalMutex?.open('software-modal')
}

const handleAddVersion = () => {
  editingVersion.value = null
  versionForm.value = {
    version: '',
    download_url: '',
    os: '',
    arch: '',
    size: 0,
    force_update: false,
  }
  window.$modalMutex?.open('add-version-modal')
}

const handleEditVersion = (row: SoftwareVersion) => {
  editingVersion.value = row
  versionForm.value = {
    version: row.version,
    download_url: row.download_url,
    os: row.os,
    arch: row.arch,
    size: row.size,
    force_update: row.force_update,
  }
  window.$modalMutex?.open('add-version-modal')
}

const handleCloseSoftwareModal = () => {
  window.$modalMutex?.close('software-modal')
}

const handleCloseVersionModal = () => {
  window.$modalMutex?.close('version-modal')
}

const handleCloseAddVersionModal = () => {
  editingVersion.value = null
  window.$modalMutex?.close('add-version-modal')
}

// 处理弹窗关闭事件（包括手动关闭）
const handleModalClosed = (modalName: string) => {
  window.$modalMutex?.close(modalName)
}

const handleEdit = (row: Software) => {
  editingSoftware.value = row
  formValue.value = {
    name: row.name,
    code: row.code,
    description: row.description,
    sourceId: row.source_id,
  }
  window.$modalMutex?.open('software-modal')
}

const handleVersionManage = (row: Software) => {
  editingSoftware.value = row
  currentVersions.value = allVersions.value.filter(
    (version) => version.software_id === row.id,
  )
  console.log('过滤后的版本:', currentVersions.value)
  window.$modalMutex?.open('version-modal')
}

const handleDelete = async (row: Software) => {
  try {
    const data = await adminApi.deleteSoftware(row.id)
    message.success(data.message)
    await fetchSoftwareList()
  } catch (error: any) {
    message.error(error?.response?.data?.message || '删除失败')
  }
}

const handleDeleteVersion = async (version: SoftwareVersion) => {
  try {
    const data = await adminApi.deleteSoftwareVersion(version.id)
    message.success(data.message)
    currentVersions.value = currentVersions.value.filter(
      (v) => v.id !== version.id,
    )
    allVersions.value = allVersions.value.filter((v) => v.id !== version.id)
    await fetchSoftwareVersions()
  } catch (error: any) {
    message.error(error?.response?.data?.message || '删除失败')
  }
}

const handleSubmit = async () => {
  try {
    if (
      !formValue.value.name ||
      !formValue.value.code ||
      !formValue.value.description ||
      !formValue.value.sourceId
    ) {
      message.error('请填写完整')
      return
    }
    if (editingSoftware.value) {
      const data = await adminApi.updateSoftware({
        id: editingSoftware.value.id,
        name: formValue.value.name,
        code: formValue.value.code,
        description: formValue.value.description,
        sourceId: Number(formValue.value.sourceId),
      })
      message.success(data.message)
    } else {
      const data = await adminApi.createSoftware({
        name: formValue.value.name,
        code: formValue.value.code,
        description: formValue.value.description,
        sourceId: Number(formValue.value.sourceId),
      })
      message.success(data.message)
    }
    window.$modalMutex?.close('software-modal')
    formValue.value = {
      name: '',
      code: '',
      description: '',
      sourceId: '',
    }
    editingSoftware.value = null
    await fetchSoftwareList()
  } catch (error: any) {
    message.error(error?.response?.data?.message || '操作失败')
  }
}

const handleVersionSubmit = async () => {
  if (!editingSoftware.value) return
  if (
    !versionForm.value.version ||
    !versionForm.value.download_url ||
    !versionForm.value.os ||
    !versionForm.value.arch ||
    versionForm.value.size === undefined ||
    versionForm.value.size === null
  ) {
    message.error('请填写完整')
    return
  }

  if (!/^[0-9.-]+$/.test(versionForm.value.version)) {
    message.error('版本号只能包含0-9-.')
    return
  }

  try {
    if (editingVersion.value) {
      const data = await adminApi.updateSoftwareVersion({
        id: editingVersion.value.id,
        name: versionForm.value.version,
        version: versionForm.value.version,
        downloadUrl: versionForm.value.download_url,
        os: versionForm.value.os,
        arch: versionForm.value.arch,
        size: versionForm.value.size,
        softwareId: editingSoftware.value.id,
        forceUpdate: versionForm.value.force_update,
      })
      message.success(data.message)
    } else {
      const data = await adminApi.createSoftwareVersion({
        name: versionForm.value.version,
        version: versionForm.value.version,
        downloadUrl: versionForm.value.download_url,
        os: versionForm.value.os,
        arch: versionForm.value.arch,
        size: versionForm.value.size,
        softwareId: editingSoftware.value.id,
        forceUpdate: versionForm.value.force_update,
      })
      message.success(data.message)
    }
    window.$modalMutex?.close('add-version-modal')
    versionForm.value = {
      version: '',
      download_url: '',
      os: '',
      arch: '',
      size: 0,
      force_update: false,
    }
    editingVersion.value = null
    await fetchSoftwareVersions()
  } catch (error: any) {
    message.error(error?.response?.data?.message || '操作失败')
  }
}

const fetchSoftwareList = async () => {
  loading.value = true
  try {
    const data = await adminApi.getSoftwareList()
    if (data.code === 0 && data.data) {
      softwareList.value = data.data.softwares || []
    } else {
      message.info('暂无可用软件')
      softwareList.value = []
    }
  } catch (error) {
    message.error('获取软件列表失败')
    softwareList.value = []
  } finally {
    loading.value = false
  }
}

const fetchSoftwareVersions = async () => {
  try {
    const data = await adminApi.getSoftwareVersions()
    if (data.code === 0 && data.data) {
      allVersions.value = data.data

      if (editingSoftware.value) {
        currentVersions.value = allVersions.value.filter(
          (version) => version.software_id === editingSoftware.value?.id,
        )
      }
    } else {
      allVersions.value = []
      currentVersions.value = []
      message.info('暂无可用版本')
    }
  } catch (error) {
    console.error('获取版本列表失败:', error)
    message.error('获取版本列表失败')
    allVersions.value = []
    currentVersions.value = []
  }
}

const getDownloadSource = async () => {
  try {
    const data = await adminApi.getDownloadSources()
    if (data.code === 0 && data.data) {
      downloadSources.value = data.data
    } else {
      downloadSources.value = []
      message.info('暂无可用下载源')
    }
  } catch (error) {
    message.error('获取下载源失败')
    downloadSources.value = []
  }
}

// 初始化加载数据
onMounted(async () => {
  initLoading.value = true
  await Promise.all([
    getDownloadSource(),
    fetchSoftwareList(),
    fetchSoftwareVersions(),
  ])
  initLoading.value = false

  unregisterSoftwareModal.value = window.$modalMutex?.register(
    'software-modal',
    () => (showAddModal.value = true),
    () => (showAddModal.value = false),
  )

  unregisterVersionModal.value = window.$modalMutex?.register(
    'version-modal',
    () => (showVersionModal.value = true),
    () => (showVersionModal.value = false),
  )

  unregisterAddVersionModal.value = window.$modalMutex?.register(
    'add-version-modal',
    () => (showAddVersionModal.value = true),
    () => (showAddVersionModal.value = false),
  )
})

onUnmounted(() => {
  unregisterSoftwareModal.value?.()
  unregisterVersionModal.value?.()
  unregisterAddVersionModal.value?.()
})
</script>

<style lang="scss" scoped>
.version-table-container {
  overflow-x: auto;

  :deep(.n-data-table) {
    min-width: 600px;
  }
}

:deep(.n-input-number) {
  width: 100%;
}

// 移动端优化
@media (max-width: 768px) {
  :deep(.n-card .n-card-header) {
    padding: 16px 12px;

    .n-card-header__main {
      font-size: 16px;
    }
  }

  :deep(.n-card .n-card-content) {
    padding: 12px;
  }

  :deep(.n-data-table) {
    font-size: 12px;

    .n-data-table-th {
      padding: 8px 4px;
    }

    .n-data-table-td {
      padding: 8px 4px;
    }
  }

  :deep(.n-form-item) {
    margin-bottom: 16px;
  }

  :deep(.n-modal .n-card) {
    margin: 16px 8px;
  }

  :deep(.n-modal .n-card .n-card-header) {
    padding: 16px;
  }

  :deep(.n-modal .n-card .n-card-content) {
    padding: 16px;
  }

  :deep(.n-button) {
    min-height: 32px;
  }
}

// 超小屏幕优化
@media (max-width: 480px) {
  .software-container {
    padding: 4px;
  }

  :deep(.n-data-table) {
    font-size: 11px;
  }

  :deep(.n-modal .n-card) {
    margin: 8px 4px;
  }
}

.software-sort-row {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  width: 100%;
  align-items: stretch;
}
.software-sort-item {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  align-items: center;
}
.software-sort-btn {
  flex: none;
  min-width: unset;
  width: auto;
  padding: 0 40px;
  align-self: center;
  /* 让按钮高度和小号下拉框一致 */
}
</style>
