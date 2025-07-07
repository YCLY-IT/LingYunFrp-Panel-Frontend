<template>
  <div>
    <NCard title="系统管理">
      <NTabs type="line" animated @update:value="handleTabUpdate">
        <NTabPane name="basic" tab="基础">
          <NForm
              ref="basicFormRef"
              :model="basicForm"
              :rules="basicRules"
              label-placement="left"
              label-width="auto"
              require-mark-placement="right-hanging"
          >
            <NFormItem label="公告内容" path="notice">
              <NInput
                  v-model:value="basicForm.notice"
                  type="textarea"
                  placeholder="请输入公告内容"
                  :rows="15"
              />
            </NFormItem>
            <NSpace justify="end">
              <NButton type="primary" @click="handleSaveBasic">保存设置</NButton>
            </NSpace>
          </NForm>
        </NTabPane>

        <NTabPane name="security" tab="安全">
          <NForm
              ref="securityFormRef"
              :model="securityForm"
              :rules="securityRules"
              label-placement="left"
              label-width="auto"
              require-mark-placement="right-hanging"
          >
            <NFormItem label="注册开关" path="allowRegister">
              <NSwitch
                  v-model:value="securityForm.allowRegister"
                  :rail-style="switchButtonRailStyle"
              />
            </NFormItem>
            <NFormItem label="登录开关" path="allowLogin">
              <NSwitch
                  v-model:value="securityForm.allowLogin"
                  :rail-style="switchButtonRailStyle"
              />
            </NFormItem>
            <NFormItem label="实名认证" path="allowRealName">
              <NSwitch
                  v-model:value="securityForm.allowRealName"
                  :rail-style="switchButtonRailStyle"
              />
            </NFormItem>
            <NFormItem label="签到功能" path="allowSign">
              <NSwitch
                  v-model:value="securityForm.allowSign"
                  :rail-style="switchButtonRailStyle"
              />
            </NFormItem>
            <NFormItem label="邮箱发送" path="allowEmail">
              <NSwitch
                  v-model:value="securityForm.allowEmail"
                  :rail-style="switchButtonRailStyle"
              />
            </NFormItem>
            <NFormItem label="短信发送" path="allowSms">
              <NSwitch
                  v-model:value="securityForm.allowSms"
                  :rail-style="switchButtonRailStyle"
              />
            </NFormItem>
            <NSpace justify="end">
              <NButton type="primary" @click="handleSaveSecurity">保存设置</NButton>
            </NSpace>
          </NForm>
        </NTabPane>

        <NTabPane name="downloads" tab="下载">
          <div class="download-filter-row">
            <n-select
              v-model:value="filterMode"
              :options="filterModeOptions"
              placeholder="筛选方式"
              class="download-filter-item"
              style="min-width: 100px"
            />
            <n-input
              v-model:value="filterKeyword"
              placeholder="请输入关键词"
              class="download-filter-item"
              clearable
              @update:value="filterDownloadSources"
            />
            <n-select
              v-model:value="sortOrder"
              :options="sortOrderOptions"
              placeholder="排序方式"
              class="download-filter-item"
              style="min-width: 100px"
              @update:value="filterDownloadSources"
            />
            <n-button
              type="primary"
              @click="showAddSourceModal = true"
              class="download-filter-btn"
              size="small"
            >
              添加下载源
            </n-button>
          </div>
          <NSpace vertical>
            <NDataTable
                :columns="downloadSourceColumn"
                :data="downloadSourcesData"
                :bordered="false"
            />
          </NSpace>
        </NTabPane>

        <NTabPane name="groups" tab="用户组">
          <div class="group-filter-row">
            <n-select
              v-model:value="groupFilterMode"
              :options="groupFilterModeOptions"
              placeholder="筛选方式"
              class="group-filter-item"
              style="min-width: 100px"
            />
            <n-input
              v-model:value="groupFilterKeyword"
              placeholder="请输入关键词"
              class="group-filter-item"
              clearable
              @update:value="filterGroups"
            />
            <n-select
              v-model:value="groupSortOrder"
              :options="groupSortOrderOptions"
              placeholder="排序方式"
              class="group-filter-item"
              style="min-width: 100px"
              @update:value="filterGroups"
            />
            <n-button
              type="primary"
              @click="showAddGroupModal = true"
              class="group-filter-btn"
              size="small"
            >
              添加用户组
            </n-button>
          </div>
          <NSpace vertical>
            <NDataTable
                :columns="groupColumns"
                :data="filteredGroupsData"
                :bordered="false"
            />
          </NSpace>
        </NTabPane>
      </NTabs>
    </NCard>

    <!-- 编辑下载源模态框 -->
    <NModal
        v-model:show="showEditModal"
        preset="dialog"
        title="修改下载源"
    >
      <NForm
          ref="editSourceFormRef"
          :model="editSourceForm"
          :rules="addSourceRules"
      >
        <NFormItem label="Path" path="path">
          <NInput
              v-model:value="editSourceForm.path"
              placeholder="请输入下载源 Path"
          />
        </NFormItem>
        <NFormItem label="名称" path="name">
          <NInput
              v-model:value="editSourceForm.name"
              placeholder="请输入下载名称"
          />
        </NFormItem>
      </NForm>
      <template #action>
        <NButton @click="showEditModal = false">取消</NButton>
        <NButton type="primary" @click="handleEditSource">确定</NButton>
      </template>
    </NModal>

    <!-- 添加下载源模态框 -->
    <NModal
        v-model:show="showAddSourceModal"
        preset="dialog"
        title="添加下载源"
    >
      <NForm
          ref="addSourceFormRef"
          :model="addSourceForm"
          :rules="addSourceRules"
      >
        <NFormItem label="Path" path="path">
          <NInput
              v-model:value="addSourceForm.path"
              placeholder="请输入下载源 Path"
          />
        </NFormItem>
        <NFormItem label="名称" path="name">
          <NInput
              v-model:value="addSourceForm.name"
              placeholder="请输入下载名称"
          />
        </NFormItem>
      </NForm>
      <template #action>
        <NButton @click="showAddSourceModal = false">取消</NButton>
        <NButton type="primary" @click="handleAddDownloadSource">确定</NButton>
      </template>
    </NModal>

    <!-- 添加用户组模态框 -->
    <NModal
        v-model:show="showAddGroupModal"
        preset="dialog"
        title="添加用户组"
    >
      <NForm
          ref="groupFormRef"
          :model="groupForm"
          :rules="groupRules"
      >
        <NFormItem label="组名" path="name">
          <NInput
              v-model:value="groupForm.name"
              placeholder="请输入用户组名称"
          />
        </NFormItem>
        <NFormItem label="显示名称" path="friendlyName">
          <NInput
              v-model:value="groupForm.friendlyName"
              placeholder="请输入显示名称"
          />
        </NFormItem>
        <NFormItem label="积分" path="point">
          <NInputNumber
              v-model:value="groupForm.point"
              :min="0"
              placeholder="请输入积分"
          />
        </NFormItem>
        <NFormItem label="基础流量(MB)" path="traffic">
          <NInputNumber
              v-model:value="groupForm.traffic"
              :min="0"
          />
        </NFormItem>
        <NFormItem label="最大隧道数" path="proxies">
          <NInputNumber
              v-model:value="groupForm.proxies"
              :min="0"
          />
        </NFormItem>
        <NFormItem label="出站带宽" path="out_limit">
          <NSpace>
            <NInputNumber
                v-model:value="groupForm.out_limit"
                :min="0"
            />
            <span>Mbps</span>
          </NSpace>
        </NFormItem>
        <NFormItem label="入站带宽" path="in_limit">
          <NSpace>
            <NInputNumber
                v-model:value="groupForm.in_limit"
                :min="0"
            />
            <span>Mbps</span>
          </NSpace>
        </NFormItem>
      </NForm>
      <template #action>
        <NButton @click="showAddGroupModal = false">取消</NButton>
        <NButton type="primary" @click="handleAddGroup">确定</NButton>
      </template>
    </NModal>

    <!-- 编辑用户组模态框 -->
    <NModal
        v-model:show="showEditGroupModal"
        preset="dialog"
        title="修改用户组"
    >
      <NForm
          ref="editGroupFormRef"
          :model="editGroupForm"
          :rules="groupRules"
      >
        <NFormItem label="组名" path="name">
          <NInput
              v-model:value="editGroupForm.name"
              placeholder="请输入用户组名称"
          />
        </NFormItem>
        <NFormItem label="积分" path="point">
          <NInputNumber
              v-model:value="editGroupForm.point"
              :min="0"
              placeholder="请输入积分"
          />
        </NFormItem>
        <NFormItem label="显示名称" path="friendlyName">
          <NInput
              v-model:value="editGroupForm.friendlyName"
              placeholder="请输入显示名称"
          />
        </NFormItem>
        <NFormItem label="基础流量(MB)" path="traffic">
          <NInputNumber
              v-model:value="editGroupForm.traffic"
              :min="0"
          />
        </NFormItem>
        <NFormItem label="最大隧道数" path="proxies">
          <NInputNumber
              v-model:value="editGroupForm.proxies"
              :min="0"
          />
        </NFormItem>
        <NFormItem label="出站带宽" path="out_limit">
          <NSpace>
            <NInputNumber
                v-model:value="editGroupForm.out_limit"
                :min="0"
            />
            <span>Mbps</span>
          </NSpace>
        </NFormItem>
        <NFormItem label="入站带宽" path="in_limit">
          <NSpace>
            <NInputNumber
                v-model:value="editGroupForm.in_limit"
                :min="0"
            />
            <span>Mbps</span>
          </NSpace>
        </NFormItem>
      </NForm>
      <template #action>
        <NButton @click="showEditGroupModal = false">取消</NButton>
        <n-button type="primary" @click="showSetUserGroupModal = true">确定</n-button>
      </template>
    </NModal>

    <!-- 同步设置用户模态框 -->
     <n-modal
        v-model:show="showSetUserGroupModal"
        preset="dialog"
        title="是否同步设置用户？"
    >
      <template #action>
        <n-button @click="handleCancelSetUserGroup">取消</n-button>
        <n-button type="primary" @click="handleSetUserGroup">确定</n-button>
      </template>
     </n-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, h } from 'vue'
import {
  NCard, NTabs, NTabPane, NForm, NFormItem,
  NInput, NInputNumber, NSwitch, NSpace, NButton,
  useMessage,
  NDataTable, NModal
} from 'naive-ui'
import type { FormRules, FormInst, DataTableColumns } from 'naive-ui'
import { switchButtonRailStyle } from '@/constants/theme.ts'
import type { DownloadSource, Group } from '@/types'
import { adminApi } from '@/net'
import type { ApiError } from '@/net/request'

const message = useMessage()

// 表单引用
const basicFormRef = ref<FormInst | null>(null)
const securityFormRef = ref<FormInst | null>(null)
const editSourceFormRef = ref<FormInst | null>(null)
const addSourceFormRef = ref<FormInst | null>(null)
const groupFormRef = ref<FormInst | null>(null)
const editGroupFormRef = ref<FormInst | null>(null)
const showSetUserGroupModal = ref(false)

// 表单数据
const basicForm = ref({
  notice: ''
})

const securityForm = ref({
  allowRegister: true,
  allowLogin: true,
  allowRealName: true,
  allowSign: true,
  allowEmail: true,
  allowSms: true,
})

const downloadSourcesData = ref<DownloadSource[]>([])
const groupsData = ref<Group[]>([])
const filteredGroupsData = ref<Group[]>([])
const SetUserGroup = ref(false)

// 模态框状态
const showEditModal = ref(false)
const showAddSourceModal = ref(false)
const showAddGroupModal = ref(false)
const showEditGroupModal = ref(false)

// 表单数据
const addSourceForm = ref<DownloadSource>({
  id: 0,
  name: '',
  path: ''
})

const editSourceForm = ref<DownloadSource>({
  id: 0,
  name: '',
  path: ''
})

const groupForm = ref<Group>({
  id: 0,
  name: '',
  friendlyName: '',
  point: 0,
  proxies: 0,
  traffic: 0,
  out_limit: 0,
  in_limit: 0
})

const editGroupForm = ref<Group>({
  id: 0,
  name: '',
  friendlyName: '',
  point: 0,
  proxies: 0,
  traffic: 0,
  out_limit: 0,
  in_limit: 0
})

// 表单规则
const basicRules: FormRules = {
  notice: {
    required: true,
    type: 'string',
    message: '请输入公告内容',
    trigger: ['blur', 'input']
  }
}

const securityRules: FormRules = {
  allowRegister: {
    required: true,
    type: 'boolean'
  },
  allowSign: {
    required: true,
    type: 'boolean'
  },
  allowLogin: {
    required: true,
    type: 'boolean'
  },
  allowRealName: {
    required: true,
    type: 'boolean'
  },
  allowEmail: {
    required: true,
    type: 'boolean'
  },
  allowSms: {
    required: true,
    type: 'boolean'
  }
}

const addSourceRules: FormRules = {
  id: {
    required: true,
    message: '请输入下载 ID',
    trigger: ['blur', 'input']
  },
  name: {
    required: true,
    message: '请输入下载名称',
    trigger: ['blur', 'input']
  },
  path: {
    required: true,
    message: '请输入下载路径',
    trigger: ['blur', 'input']
  },
  arch: {
    required: true,
    message: '请输入下载架构',
    trigger: ['blur', 'input']
  },
  os: {
    required: true,
    message: '请输入下载系统',
    trigger: ['blur', 'input']
  }
}

const groupRules: FormRules = {
  name: {
    required: true,
    message: '请输入用户组名称',
    trigger: ['blur', 'input']
  }
}

// 表格列定义
const downloadSourceColumn: DataTableColumns<DownloadSource> = [
  {
    title: 'ID',
    key: 'id'
  },
  {
    title: '名称',
    key: 'name'
  },
  {
    title: '操作',
    key: 'actions',
    width: 150, 
    render: (row) => {
      return h(NSpace, {}, {
        default: () => [
          h(
              NButton,
              {
                size: 'small',
                type: 'primary',
                onClick: () => {
                  editSourceForm.value.id = row.id
                  editSourceForm.value.path = row.path
                  editSourceForm.value.name = row.name
                  showEditModal.value = true
                }
              },
              { default: () => '修改' }
          ),
          h(
              NButton,
              {
                size: 'small',
                type: 'error',
                onClick: () => handleRemoveDownloadSource(row.id)
              },
              { default: () => '删除' }
          )
        ]
      })
    }
  }
]

// 格式化流量数值
function formatTraffic(traffic: number): string {
  const value = traffic
  if (isNaN(value)) return String(traffic)
  if (value >= 1024) {
    return `${(value / 1024).toFixed(2)} GB`
  }
  return `${value.toFixed(2)} MB`
}

const groupColumns: DataTableColumns<Group> = [
  {
    title: '组名',
    key: 'name',
    render(row) {
      return h('div', { style: 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;' }, row.name)
    }
  },
  {
    title: '显示名称',
    key: 'friendlyName',
    render(row) {
      return h('div', { style: 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;' }, row.friendlyName)
    }
  },
  {
    title: '最大隧道数',
    key: 'maxProxies',
    render(row) {
      return h('div', { style: 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;' }, row.proxies)
    }
  },
  {
    title: '积分数量',
    key: 'point',
    render(row) {
      return h('div', { style: 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;' }, row.point)
    }
  },
  {
    title: '基础流量',
    key: 'traffic',
    render(row) {
      return h('div', { style: 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;' }, formatTraffic(row.traffic))
    }
  },
  {
    title: '出站带宽',
    key: 'outBound',
    render(row) {
      return h('div', { style: 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;' }, row.out_limit ? `${row.out_limit} Mbps` : '无')
    }
  },
  {
    title: '入站带宽',
    key: 'inBound',
    render(row) {
      return h('div', { style: 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;' }, row.in_limit ? `${row.in_limit} Mbps` : '无')
    }
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
                type: 'primary',
                onClick: () => {
                  editGroupForm.value = { ...row }
                  SetUserGroup.value = false
                  showEditGroupModal.value = true
                }
              },
              { default: () => '修改' }
          ),
          h(
              NButton,
              {
                size: 'small',
                type: 'error',
                onClick: () => handleRemoveGroup(row.id)
              },
              { default: () => '删除' }
          )
        ]
      })
    }
  }
]

const handleSetUserGroup = async () => {
  SetUserGroup.value = true
  handleEditGroup()
  showSetUserGroupModal.value = false
}

const handleCancelSetUserGroup = () => {
  SetUserGroup.value = false
  showSetUserGroupModal.value = false
  handleEditGroup()
}


// 保存公告
const handleSaveBasic = async () => {
  try {
    const data = await adminApi.createBroadcast(basicForm.value.notice)
    if (data.code === 0) {
      message.success('保存公告成功')
    } else {
      message.error(data.message || '保存公告失败')
    }
  } catch (error) {
    message.error((error as ApiError).message)
  }
}

// 保存安全设置
const handleSaveSecurity = async () => {
  try {
    await securityFormRef.value?.validate()
    const data = await adminApi.updateSafetySetting({
      allowRegister: securityForm.value.allowRegister,
      allowRealname: securityForm.value.allowRealName,
      allowLogin: securityForm.value.allowLogin,
      allowSendEmail: securityForm.value.allowEmail,
      allowSendSms: securityForm.value.allowSms,
      allowSign: securityForm.value.allowSign
    })
    if (data.code === 0) {
      message.success('保存安全设置成功')
    } else {
      message.error(data.message || '保存安全设置失败')
    }
  } catch (error) {
    message.error('保存安全设置失败')
  }
}

// 过滤条件
const filterModeOptions = [
  { label: 'ID', value: 'id' },
  { label: '名称', value: 'name' }
]
const sortOrderOptions = [
  { label: '升序', value: 'asc' },
  { label: '降序', value: 'desc' }
]
const filterMode = ref('id')
const filterKeyword = ref('')
const sortOrder = ref('asc')

// 用户组筛选条件
const groupFilterModeOptions = [
  { label: '组名', value: 'name' },
  { label: '显示名称', value: 'friendlyName' }
]
const groupSortOrderOptions = [
  { label: '升序', value: 'asc' },
  { label: '降序', value: 'desc' }
]
const groupFilterMode = ref('name')
const groupFilterKeyword = ref('')
const groupSortOrder = ref('asc')

// 原始数据副本
const allDownloadSources = ref<DownloadSource[]>([])

// 获取下载源列表
const fetchDownloadSources = async () => {
  try {
    const data = await adminApi.getDownloadSources()
    if (data.code === 0) {
      allDownloadSources.value = data.data
      filterDownloadSources()
    } else {
      message.error(data.message || '获取下载源列表失败')
    }
  } catch (error) {
    message.error('获取下载源列表失败')
  }
}

// 过滤方法
const filterDownloadSources = () => {
  let filtered = allDownloadSources.value
  if (filterKeyword.value) {
    if (filterMode.value === 'id') {
      filtered = filtered.filter(item =>
        String(item.id).includes(filterKeyword.value.trim())
      )
    } else if (filterMode.value === 'name') {
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(filterKeyword.value.trim().toLowerCase())
      )
    }
  }
  if (sortOrder.value === 'asc') {
    filtered.sort((a, b) => a.id - b.id)
  } else {
    filtered.sort((a, b) => b.id - a.id)
  }
  downloadSourcesData.value = filtered
}

// 用户组过滤方法
const filterGroups = () => {
  let filtered = groupsData.value
  if (groupFilterKeyword.value) {
    if (groupFilterMode.value === 'name') {
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(groupFilterKeyword.value.trim().toLowerCase())
      )
    } else if (groupFilterMode.value === 'friendlyName') {
      filtered = filtered.filter(item =>
        item.friendlyName?.toLowerCase().includes(groupFilterKeyword.value.trim().toLowerCase())
      )
    }
  }
  if (groupSortOrder.value === 'asc') {
    filtered.sort((a, b) => {
      if (a.id === b.id) return 0
      return a.id - b.id
    })
  } else {
    filtered.sort((a, b) => {
      if (a.id === b.id) return 0
      return b.id - a.id
    })
  }
  filteredGroupsData.value = filtered
}

// 获取基础设置
const fetchBasicSettings = async () => {
  try {
    const data = await adminApi.getBroadcastList()
    if (data.code === 0) {
      basicForm.value.notice = data.data[0].broadcast
    } else {
      message.error(data.message || '获取公告失败')
    }
  } catch (error) {
    message.error('获取基础设置失败')
  }
}

// 获取安全设置
const fetchSecuritySettings = async () => {
  try {
    const data = await adminApi.getSystemSettings()
    if (data.code === 0) {
      const configs = data.data;

      securityForm.value.allowRegister = configs.find(c => c.type === 'allowRegister')?.value === 'true';
      securityForm.value.allowSign = configs.find(c => c.type === 'allowSign')?.value === 'true';
      securityForm.value.allowLogin = configs.find(c => c.type === 'allowLogin')?.value === 'true';
      securityForm.value.allowRealName = configs.find(c => c.type === 'allowRealname')?.value === 'true';
      securityForm.value.allowEmail = configs.find(c => c.type === 'allowSendMail')?.value === 'true';
      securityForm.value.allowSms = configs.find(c => c.type === 'allowSendSms')?.value === 'true';
    } else {
      message.error(data.message || '获取安全设置失败');
    }
  } catch (error) {
    message.error((error as ApiError).message);
  }
}

// 获取用户组列表
const fetchGroups = async () => {
  try {
    const data = await adminApi.getGroupList()
    if (data.code === 0) {
      const groups = data.data.groups || data.data
      groupsData.value = groups.map(group => ({
        ...group,
        out_limit: group.out_limit / 128,
        in_limit: group.in_limit / 128
      }))
      filterGroups()
    } else {
      message.error(data.message || '获取用户组列表失败')
    }
  } catch (error) {
    message.error((error as ApiError).message)
  }
}

// 添加下载源
const handleAddDownloadSource = async () => {
  if (!addSourceForm.value.name || !addSourceForm.value.path) {
    message.error('请填写完整信息')
    return
  }

  try {
    const data = await adminApi.createDownloadSource({
      name: addSourceForm.value.name,
      path: addSourceForm.value.path
    })
    if (data.code === 0) {
      message.success('添加成功')
      addSourceForm.value.name = ''
      addSourceForm.value.path = ''
      showAddSourceModal.value = false
      await fetchDownloadSources()
    } else {
      message.error(data.message || '添加失败')
    }
  } catch (error) {
    message.error((error as ApiError).message)
  }
}

// 编辑下载源
const handleEditSource = async () => {
  if (!editSourceForm.value.name || !editSourceForm.value.path ) {
    message.error('请填写完整信息')
    return
  }

  try {
    const data = await adminApi.updateDownloadSource(editSourceForm.value.id, {
      name: editSourceForm.value.name,
      path: editSourceForm.value.path
    })
    if (data.code === 0) {
      message.success('修改成功')
      showEditModal.value = false
      editSourceForm.value.name = ''
      editSourceForm.value.path = ''
      await fetchDownloadSources()
    } else {
      message.error(data.message || '修改失败')
    }
  } catch (error) {
    message.error((error as ApiError).message)
  }
  showEditModal.value = false
  showSetUserGroupModal.value = false
}

// 删除下载源
const handleRemoveDownloadSource = async (id: number) => {
  try {
    const data = await adminApi.deleteDownloadSource(id)
    if (data.code === 0) {
      message.success('删除成功')
      await fetchDownloadSources()
    } else {
      message.error(data.message || '删除失败')
    }
  } catch (error) {
    message.error((error as ApiError).message)
  }
}

// 添加用户组
const handleAddGroup = async () => {
  try {
    const data = await adminApi.createGroup({
      name: groupForm.value.name,
      friendlyName: groupForm.value.friendlyName,
      point: groupForm.value.point,
      proxies: groupForm.value.proxies,
      traffic: groupForm.value.traffic,
      out_limit: groupForm.value.out_limit,
      in_limit: groupForm.value.in_limit
    })
    if (data.code === 0) {
      message.success('添加用户组成功')
      showAddGroupModal.value = false
      groupForm.value = {
        id: 0,
        name: '',
        friendlyName: '',
        point: 0,
        proxies: 0,
        traffic: 0,
        out_limit: 0,
        in_limit: 0
      }
      await fetchGroups()
    } else {
      message.error(data.message || '添加失败')
    }
  } catch (error) {
    message.error((error as ApiError).message)
  }
}

// 编辑用户组
const handleEditGroup = async () => {
  try {
    const data = await adminApi.updateGroup({
      id: editGroupForm.value.id,
      name: editGroupForm.value.name,
      friendlyName: editGroupForm.value.friendlyName,
      point: editGroupForm.value.point,
      proxies: editGroupForm.value.proxies,
      traffic: editGroupForm.value.traffic,
      out_limit: editGroupForm.value.out_limit,
      in_limit: editGroupForm.value.in_limit,
      setUserGroup: SetUserGroup.value ? 'true' : 'false'
    })
    if (data.code === 0) {
      message.success('更新用户组成功')
      showEditGroupModal.value = false
      SetUserGroup.value = false
      await fetchGroups()
    } else {
      message.error(data.message || '更新用户组失败')
    }
  } catch (error) {
    message.error((error as ApiError).message)
  }
}

// 删除用户组
const handleRemoveGroup = async (id: number) => {
  try {
    const data = await adminApi.deleteGroup(id)
    if (data.code === 0) {
      message.success('删除用户组成功')
      await fetchGroups()
    } else {
      message.error(data.message || '删除用户组失败')
    }
  } catch (error) {
    message.error((error as ApiError).message)
  }
}

// 切换标签时加载对应数据
const handleTabUpdate = (tab: string) => {
  switch (tab) {
    case 'basic':
      fetchBasicSettings()
      break
    case 'security':
      fetchSecuritySettings()
      break
    case 'downloads':
      fetchDownloadSources()
      break
    case 'groups':
      fetchGroups()
      break
  }
}

// 生命周期钩子 - 初始化加载基础设置
onMounted(() => {
  fetchBasicSettings()
})
</script>

<style scoped>
.download-filter-row {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  width: 100%;
  align-items: stretch;
}
.download-filter-item {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  align-items: center;
}
.download-filter-btn {
  flex: none;
  min-width: unset;
  width: auto;
  padding: 0 16px;
  height: 32px;
  align-self: center;
}

.group-filter-row {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  width: 100%;
  align-items: stretch;
}
.group-filter-item {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  align-items: center;
}
.group-filter-btn {
  flex: none;
  min-width: unset;
  width: auto;
  padding: 0 16px;
  height: 32px;
  align-self: center;
}
</style>