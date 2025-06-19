<template>
  <div class="software-container">
    <n-card title="软件管理">
      <template #header-extra>
        <n-button type="primary" @click="showAddModal = true">
          添加软件
        </n-button>
      </template>

      <n-data-table
        :columns="columns"
        :data="softwareList"
        :pagination="pagination"
        :loading="loading"
      />
    </n-card>

    <!-- 添加/编辑软件对话框 -->
    <n-modal
      v-model:show="showAddModal"
      :title="editingSoftware ? '编辑软件' : '添加软件'"
      preset="card"
      style="width: 600px"
    >
      <n-form
        ref="formRef"
        :model="formValue"
        :rules="rules"
        label-placement="left"
        label-width="auto"
        require-mark-placement="right-hanging"
      >
        <n-form-item label="软件名称" path="name">
          <n-input v-model:value="formValue.name" placeholder="请输入软件名称" />
        </n-form-item>
        <n-form-item label="软件代号" path="code">
          <n-input v-model:value="formValue.code" placeholder="请输入软件代号" />
        </n-form-item>
        <n-form-item label="描述" path="description">
          <n-input
            v-model:value="formValue.description"
            type="textarea"
            placeholder="请输入软件描述"
          />
        </n-form-item>
        <n-form-item label="下载源" path="sourceId">
          <n-select
            v-model:value="formValue.sourceId"
            :options="downloadSources.map(source => ({
              label: source.name,
              value: source.id
            }))"
            placeholder="请选择下载源"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showAddModal = false">取消</n-button>
          <n-button type="primary" @click="handleSubmit">确定</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 版本管理对话框 -->
    <n-modal
      v-model:show="showVersionModal"
      title="版本管理"
      preset="card"
      style="width: 800px"
    >
      <n-space vertical>
        <n-space justify="end">
          <n-button type="primary" @click="showAddVersionModal = true">
            添加版本
          </n-button>
        </n-space>
        
        <n-data-table
          :columns="versionColumns"
          :data="currentVersions"
          :pagination="{ pageSize: 5 }"
        />
      </n-space>
    </n-modal>

    <!-- 添加版本对话框 -->
    <n-modal
      v-model:show="showAddVersionModal"
      title="添加版本"
      preset="card"
      style="width: 600px"
    >
      <n-form
        ref="versionFormRef"
        :model="versionForm"
        :rules="versionRules"
        label-placement="left"
        label-width="auto"
        require-mark-placement="right-hanging"
      >
        <n-form-item label="版本号" path="version">
          <n-input v-model:value="versionForm.version" placeholder="请输入版本号" />
        </n-form-item>
        <n-form-item label="下载地址" path="downloadUrl">
          <n-input v-model:value="versionForm.downloadUrl" placeholder="请输入下载地址" />
        </n-form-item>
        <n-form-item label="操作系统" path="os">
          <n-select
            v-model:value="versionForm.os"
            :options="osOptions"
            placeholder="请选择操作系统"
          />
        </n-form-item>
        <n-form-item label="架构" path="arch">
          <n-select
            v-model:value="versionForm.arch"
            :options="archOptions"
            placeholder="请选择架构"
          />
        </n-form-item>
        <n-form-item label="文件大小(MB)" path="size">
          <n-input-number
            v-model:value="versionForm.size"
            placeholder="请输入文件大小(MB)"
            style="width: 100%"
            :min="0"
            :precision="2"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showAddVersionModal = false">取消</n-button>
          <n-button type="primary" @click="handleVersionSubmit">确定</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, h, onMounted } from 'vue'
import { NButton, NSpace, useMessage } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { userApi } from '@/net'
import { accessHandle } from '@/net/base'

interface Software {
  id: number
  name: string
  code: string
  description: string
  sourceId: number
  versions: SoftwareVersion[]
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
  path: string
  created_at: string
  updated_at: string
}

const message = useMessage()
const loading = ref(false)
const showAddModal = ref(false)
const showVersionModal = ref(false)
const showAddVersionModal = ref(false)
const editingSoftware = ref<Software | null>(null)
const softwareList = ref<Software[]>([])
const downloadSources = ref<DownloadSource[]>([])
const currentVersions = ref<SoftwareVersion[]>([])
const allVersions = ref<SoftwareVersion[]>([])

const formValue = ref({
  name: '',
  code: '',
  description: '',
  sourceId: '' as string | number
})

const versionForm = ref({
  version: '',
  downloadUrl: '',
  os: '',
  arch: '',
  size: 0
})

const rules = {
  name: { required: true, message: '请输入软件名称', trigger: 'blur' },
  code: { required: true, message: '请输入软件代码', trigger: 'blur' },
  description: { required: true, message: '请输入软件描述', trigger: 'blur' },
  sourceId: { required: true, message: '请选择下载源', trigger: 'blur' }
}

const versionRules = {
  version: { required: true, message: '请输入版本号', trigger: 'blur' },
  downloadUrl: { required: true, message: '请输入下载地址', trigger: 'blur' },
  os: { required: true, message: '请选择操作系统', trigger: 'blur' },
  arch: { required: true, message: '请选择架构', trigger: 'blur' },
  size: { required: true, message: '请输入文件大小', trigger: 'blur' }
}

const osOptions = [
  { label: 'Windows', value: 'windows' },
  { label: 'Linux', value: 'linux' },
  { label: 'macOS', value: 'macos' },
]

const archOptions = [
  { label: 'amd64', value: 'amd64' },
  { label: 'arm64', value: 'arm64' },
  { label: '386', value: '386' }
]

const pagination = {
  pageSize: 10
}

const columns: DataTableColumns<Software> = [
  { title: 'ID', key: 'id' },
  { title: '软件名称', key: 'name' },
  { title: '软件代号', key: 'code' },
  { title: '最新版本', key: 'latestVersion', render: (row) => {
    const latestVersion = row.versions?.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0]
    return latestVersion ? latestVersion.version : '-'
  }},
  { 
    title: '创建时间', 
    key: 'created_at',
    render: (row) => formatDate(row.created_at)
  },
  {
    title: '操作',
    key: 'actions',
    render: (row) => {
      return h(NSpace, {}, {
        default: () => [
          h(
            NButton,
            {
              size: 'small',
              onClick: () => handleEdit(row)
            },
            { default: () => '编辑' }
          ),
          h(
            NButton,
            {
              size: 'small',
              type: 'info',
              onClick: () => handleVersionManage(row)
            },
            { default: () => '版本管理' }
          ),
          h(
            NButton,
            {
              size: 'small',
              type: 'error',
              onClick: () => handleDelete(row)
            },
            { default: () => '删除' }
          )
        ]
      })
    }
  }
]

const versionColumns: DataTableColumns<SoftwareVersion> = [
  { title: '版本号', key: 'version' },
  { title: '操作系统', key: 'os' },
  { title: '架构', key: 'arch' },
  { title: '文件大小', key: 'size', render: (row) => formatSize(row.size) },
  { 
    title: '创建时间', 
    key: 'created_at',
    render: (row) => formatDate(row.created_at)
  },
  {
    title: '操作',
    key: 'actions',
    render: (row) => {
      return h(NSpace, {}, {
        default: () => [
          h(
            NButton,
            {
              size: 'small',
              type: 'error',
              onClick: () => handleDeleteVersion(row)
            },
            { default: () => '删除' }
          )
        ]
      })
    }
  }
]

const formatSize = (size: number) => {
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
    hour12: false
  })
}

const handleEdit = (row: Software) => {
  editingSoftware.value = row
  formValue.value = { 
    name: row.name,
    code: row.code,
    description: row.description,
    sourceId: row.sourceId,
  }
  showAddModal.value = true
}

const handleVersionManage = (row: Software) => {
  editingSoftware.value = row
  currentVersions.value = allVersions.value.filter(version => version.softwareId === row.id)
  showVersionModal.value = true
}

const handleDelete = async (row: Software) => {
  try {
    userApi.post(`/admin/software/delete/${row.id}`, {}, accessHandle(), async (data) => {
      message.success(data.message)
      setTimeout(async () => {
        await fetchSoftwareList()
      }, 100)
    }, (error) => {
      message.error(error)
    })
  } catch (error) {
    message.error('删除失败')
  }
}

const handleDeleteVersion = async (version: SoftwareVersion) => {
  try {
    userApi.post(`/admin/software/version/delete/${version.id}`, {}, accessHandle(), async (data) => {
      message.success(data.message)
      currentVersions.value = currentVersions.value.filter(v => v.id !== version.id)
      allVersions.value = allVersions.value.filter(v => v.id !== version.id)
      setTimeout(async () => {
        await fetchSoftwareVersions()
      }, 100)
    }, (error) => {
      message.error(error)
    })
  } catch (error) {
    message.error('删除失败')
  }
}

const handleSubmit = async () => {
  try {
    if (!formValue.value.name || !formValue.value.code || !formValue.value.description || !formValue.value.sourceId) {
      message.error('请填写完整')
      return
    }
    if (editingSoftware.value) {
      userApi.post(`/admin/software/update/${editingSoftware.value.id}`, formValue.value, accessHandle(), (data) => {
          message.success(data.message)
      }, (error) => {
        message.error(error)
      })
    } else {
      userApi.post('/admin/software', formValue.value, accessHandle(), (data) => {
          message.success(data.message)
      }, (error) => {
        message.error(error)
      })
    }
    showAddModal.value = false
    // 重置表单和编辑状态
    formValue.value = {
      name: '',
      code: '',
      description: '',
      sourceId: ''
    }
    editingSoftware.value = null
  } catch (error) {
    message.error('操作失败')
  } finally {
    setTimeout(async () => {
      await fetchSoftwareList()
    }, 200)
  }
}

const handleVersionSubmit = async () => {
  if (!editingSoftware.value) return
  if (!versionForm.value.version || !versionForm.value.downloadUrl || !versionForm.value.os || !versionForm.value.arch || !versionForm.value.size) {
    message.error('请填写完整')
    return
  }

  // 只能包含0-9-.
  if (!/^[0-9.-]+$/.test(versionForm.value.version)) {
    message.error('版本号只能包含0-9-.')
    return
  }

  try {
    const versionData = {
      ...versionForm.value,
      softwareId: editingSoftware.value.id
    }
    
    userApi.post('/admin/software/version', versionData, accessHandle(), async (data) => {
      message.success(data.message)
      showAddVersionModal.value = false
      // 重置版本表单
      versionForm.value = {
        version: '',
        downloadUrl: '',
        os: '',
        arch: '',
        size: 0
      }
      // 延迟重新获取数据
      setTimeout(async () => {
        await fetchSoftwareVersions()
      }, 100)
    }, (error) => {
      message.error(error)
    })
  } catch (error) {
    message.error('添加版本失败')
  }
}

const fetchSoftwareList = async () => {
  loading.value = true
  try {
    userApi.get('/user/info/softwares', accessHandle(), (data) => {
      if (data.code === 0 && data.data && data.data.softwares) {
        softwareList.value = data.data.softwares
      } else {
        message.info('暂无可用软件')
        softwareList.value = []
      }
    })
  } catch (error) {
    message.error('获取软件列表失败')
    softwareList.value = []
  } finally {
    loading.value = false
  }
}

const fetchSoftwareVersions = async () => {
  try {
    userApi.get(`/user/info/softwares/version`, accessHandle(), (data) => {
      if (data.data) {
        allVersions.value = data.data
        if (editingSoftware.value) {
          currentVersions.value = data.data.filter(version => version.softwareId === editingSoftware.value?.id)
        }
      } else {
        message.info('暂无可用版本')
      }
    })
  } catch (error) {
    message.error('获取版本列表失败')
  }
}

const getDownloadSource = async () => {
  try {
    userApi.get('/user/info/download/sources', accessHandle(), (data) => {
      if (data.data) {
        downloadSources.value = data.data
      } else {
        message.info('暂无可用下载')
      }
    })
  } catch (error) {
    message.error('获取下载源失败')
  }
}

// 初始化加载数据
onMounted(async () => {
  await getDownloadSource()
  await fetchSoftwareList()
  await fetchSoftwareVersions()
})
</script>

<style lang="scss" scoped>
.software-container {
  padding: 20px;
}

:deep(.n-input-number) {
  width: 100%;
}
</style>