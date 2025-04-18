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
          <NButton
              type="primary"
              style="margin-bottom: 8px;"
              @click="showAddSourceModal = true"
          >
            添加下载源
          </NButton>
          <NSpace vertical>
            <NDataTable
                :columns="downloadSourceColumns"
                :data="downloadSourcesData"
                :bordered="false"
            />
          </NSpace>
        </NTabPane>

        <NTabPane name="groups" tab="用户组">
          <NSpace vertical>
            <NButton
                type="primary"
                @click="showAddGroupModal = true"
            >
              添加用户组
            </NButton>
            <NDataTable
                :columns="groupColumns"
                :data="groupsData"
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
        <NFormItem label="ID" path="id">
          <NInput
              v-model:value="editSourceForm.id"
              placeholder="请输入下载源 ID"
          />
        </NFormItem>
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
        <NFormItem label="描述" path="desc">
          <NInput
              v-model:value="editSourceForm.desc"
              placeholder="请输入下载源描述"
          />
        </NFormItem>
        <NFormItem label="架构" path="arch">
          <NInput
              v-model:value="editSourceForm.arch"
              placeholder="请输入下载源架构"
          />
        </NFormItem>
        <NFormItem label="版本" path="version">
          <NInput
              v-model:value="editSourceForm.version"
              placeholder="请输入下载源版本"
          />
        </NFormItem>
        <NFormItem label="系统" path="os">
          <NInput
              v-model:value="editSourceForm.os"
              placeholder="请输入下载源系统"
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
        <NFormItem label="ID" path="id">
          <NInput
              v-model:value="addSourceForm.id"
              placeholder="请输入下载源 ID"
          />
        </NFormItem>
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
        <NFormItem label="描述" path="desc">
          <NInput
              v-model:value="addSourceForm.desc"
              placeholder="请输入下载源描述"
          />
        </NFormItem>
        <NFormItem label="架构" path="arch">
          <NInput
              v-model:value="addSourceForm.arch"
              placeholder="请输入下载源架构"
          />
        </NFormItem>
        <NFormItem label="版本" path="version">
          <NInput
              v-model:value="addSourceForm.version"
              placeholder="请输入下载源版本"
          />
        </NFormItem>
        <NFormItem label="系统" path="os">
          <NInput
              v-model:value="addSourceForm.os"
              placeholder="请输入下载源系统"
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
          <NSpace align="center">
            <NInputNumber
                v-model:value="groupForm.out_limit"
                :min="0"
            />
            <span>Mbps</span>
          </NSpace>
        </NFormItem>
        <NFormItem label="入站带宽" path="in_limit">
          <NSpace align="center">
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
          <NSpace align="center">
            <NInputNumber
                v-model:value="editGroupForm.out_limit"
                :min="0"
            />
            <span>Mbps</span>
          </NSpace>
        </NFormItem>
        <NFormItem label="入站带宽" path="in_limit">
          <NSpace align="center">
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
        <NButton type="primary" @click="handleEditGroup">确定</NButton>
      </template>
    </NModal>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import {
  NCard, NTabs, NTabPane, NForm, NFormItem,
  NInput, NInputNumber, NSwitch, NSpace, NButton,
  useMessage,
  NDataTable, NModal
} from 'naive-ui'
import type { FormRules, FormInst, DataTableColumns } from 'naive-ui'
import { switchButtonRailStyle } from '@/constants/theme.ts'
import type { DownloadSource, Group } from '@/types'
import { userApi } from '@/net'
import { accessHandle } from '@/net/base.ts'

const message = useMessage()

// 表单引用
const basicFormRef = ref<FormInst | null>(null)
const securityFormRef = ref<FormInst | null>(null)
const editSourceFormRef = ref<FormInst | null>(null)
const addSourceFormRef = ref<FormInst | null>(null)
const groupFormRef = ref<FormInst | null>(null)
const editGroupFormRef = ref<FormInst | null>(null)

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

// 模态框状态
const showEditModal = ref(false)
const showAddSourceModal = ref(false)
const showAddGroupModal = ref(false)
const showEditGroupModal = ref(false)

// 表单数据
const addSourceForm = ref<DownloadSource>({
  id: '',
  name: '',
  path: '',
  arch: '',
  version: '',
  os: '',
  desc: ''
})

const editSourceForm = ref<DownloadSource>({
  originalId: '',
  id: '',
  name: '',
  path: '',
  arch: '',
  version: '',
  os: '',
  desc: ''
})

const groupForm = ref<Group>({
  name: '',
  friendlyName: '',
  point: 0,
  proxies: 0,
  traffic: 0,
  out_limit: 0,
  in_limit: 0
})

const editGroupForm = ref<Group>({
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
const downloadSourceColumns: DataTableColumns<DownloadSource> = [
  {
    title: 'ID',
    key: 'id'
  },
  {
    title: '名称',
    key: 'name'
  },
  {
    title: "架构",
    key: 'arch',
    render(row) {
      return h('div', { style: 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;' }, row.arch)
    }
  },
  {
    title: '系统',
    key: 'os',
    render(row) {
      return h('div', { style: 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;' }, row.os)
    }
  },
    {
      title: '版本',
      key: 'version',
      render(row) {
        return h('div', { style: 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;' }, row.version)
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
                  editSourceForm.value.originalId = row.ID.toString()
                  editSourceForm.value.id = row.ID.toString()
                  editSourceForm.value.path = row.url
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
                onClick: () => handleRemoveDownloadSource(row.ID)
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

// 保存公告
const handleSaveBasic = async () => {
  try {
    userApi.post("/admin/setting/set/Broadcast", {
      message: basicForm.value.notice
    }, accessHandle(), (data) => {
      if (data.code === 0) {
        message.success('保存公告成功')
      } else {
        message.error(data.message || '保存公告失败')
      }
    })
  } catch (error) {
    message.error('保存基础设置失败')
  }
}

// 保存安全设置
const handleSaveSecurity = async () => {
  try {
    await securityFormRef.value?.validate()
    userApi.post("/admin/setting/set/safety", {
      allowRegister: securityForm.value.allowRegister,
      allowRealname: securityForm.value.allowRealName,
      allowLogin: securityForm.value.allowLogin,
      allowSendEmail: securityForm.value.allowEmail,
      allowSendSms: securityForm.value.allowSms,
      allowSign: securityForm.value.allowSign
    }, accessHandle(), (data) => {
      if (data.code === 0) {
        message.success('保存安全设置成功')
      } else {
        message.error(data.message || '保存安全设置失败')
      }
    })
  } catch (error) {
    message.error('保存安全设置失败')
  }
}

// 获取下载源列表
const fetchDownloadSources = async () => {
  try {
    userApi.get("/user/info/download", accessHandle(), (data) => {
      if (data.code === 0) {
        downloadSourcesData.value = data.data
      } else {
        message.error(data.message || '获取下载源列表失败')
      }
    })
  } catch (error: any) {
    message.error('获取下载源列表失败')
  }
}

// 获取基础设置
const fetchBasicSettings = async () => {
  try {
    userApi.get("/user/info/broadcast", accessHandle(), (data) => {
      if (data.code === 0) {
        basicForm.value.notice = data.data.broadcast
      } else {
        message.error(data.message || '获取公告失败')
      }
    })
  } catch (error) {
    message.error('获取基础设置失败')
  }
}

// 获取安全设置
const fetchSecuritySettings = async () => {
  try {
    userApi.get("/admin/setting/get", accessHandle(), (data) => {
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
    });
  } catch (error) {
    message.error('获取安全设置失败');
  }
}

// 获取用户组列表
const fetchGroups = async () => {
  try {
    userApi.get("/user/info/groups", accessHandle(), (data) => {
      if (data.code === 0) {
        groupsData.value = data.data.groups.map(group => ({
          ...group,
          out_limit: group.out_limit / 128,
          in_limit: group.in_limit / 128
        }))
      } else {
        message.error(data.message || '获取用户组列表失败')
      }
    })
  } catch (error: any) {
    message.error('获取用户组列表失败')
  }
}

// 添加下载源
const handleAddDownloadSource = async () => {
  if (!addSourceForm.value.id || !addSourceForm.value.name || !addSourceForm.value.path || !addSourceForm.value.arch || !addSourceForm.value.os) {
    message.error('请填写完整信息')
    return
  }

  try {
    userApi.post("/admin/setting/download/create", {
      id: addSourceForm.value.id,
      path: addSourceForm.value.path,
      name: addSourceForm.value.name,
      arch: addSourceForm.value.arch,
      os: addSourceForm.value.os,
      desc: addSourceForm.value.desc,
      version: addSourceForm.value.version
    }, accessHandle(), (data) => {
      if (data.code === 0) {
        message.success('添加成功')
        addSourceForm.value.id = ''
        addSourceForm.value.name = ''
        addSourceForm.value.path = ''
        showAddSourceModal.value = false
      } else {
        message.error(data.message || '添加失败')
      }
    })
    setTimeout(() => {
      fetchDownloadSources()
    }, 100)
  } catch (error: any) {
    message.error(error?.response?.data?.message || '添加失败')
  }
}

// 编辑下载源
const handleEditSource = async () => {
  if (!editSourceForm.value.id || !editSourceForm.value.name) {
    message.error('请填写完整信息')
    return
  }

  try {
    userApi.post(
        `/admin/setting/download/update/${editSourceForm.value.originalId}`,
        {
          id: editSourceForm.value.id,
          path: editSourceForm.value.path,
          name: editSourceForm.value.name
        },
        accessHandle(), (data) => {
          if (data.code === 0) {
            message.success('修改成功')
            showEditModal.value = false
            editSourceForm.value.id = ''
            editSourceForm.value.name = ''
            editSourceForm.value.path = ''
          } else {
            message.error(data.message || '修改失败')
          }
          setTimeout(() => {
            fetchDownloadSources()
          }, 100)
        }
    )
  } catch (error: any) {
    message.error(error?.response?.data?.message || '修改失败')
  }
}

// 删除下载源
const handleRemoveDownloadSource = async (id: string) => {
  try {
    userApi.post(`/admin/setting/download/delete/${id}`, {
      id: id,
    }, accessHandle(), (data) => {
      if (data.code === 0) {
        message.success('删除成功')
      } else {
        message.error(data.message || '删除失败')
      }
      setTimeout(() => {
        fetchDownloadSources()
      }, 100)
    })
  } catch (error: any) {
    message.error(error?.response?.data?.message || '删除失败')
  }
}

// 添加用户组
const handleAddGroup = async () => {
  try {
    userApi.post(`/admin/setting/groups/create`, {
      ...groupForm.value,
      traffic: groupForm.value.traffic
    }, accessHandle(), (data) => {
      if (data.code === 0) {
        message.success('添加用户组成功')
        showAddGroupModal.value = false
        groupForm.value = {
          name: '',
          friendlyName: '',
          point: 0,
          proxies: 0,
          traffic: 0,
          out_limit: 0,
          in_limit: 0
        }
      } else {
        message.error(data.message || '添加失败')
      }
    })
    setTimeout(() => {
      fetchGroups()
    }, 100)
  } catch (error: any) {
    message.error(error?.response?.data?.message || '添加失败')
  }
}

// 编辑用户组
const handleEditGroup = async () => {
  try {
    userApi.post(`/admin/setting/groups/update/${editGroupForm.value.id}`,
        {
          ...editGroupForm.value,
          traffic: editGroupForm.value.traffic
        }, accessHandle(), (data) => {
      if (data.code === 0) {
        message.success('更新用户组成功')
      } else {
        message.error(data.message || '更新用户组失败')
      }
    })
    showEditGroupModal.value = false
    setTimeout(() => {
      fetchGroups()
    }, 100)
  } catch (error: any) {
    message.error(error?.response?.data?.message || '修改失败')
  }
}

// 删除用户组
const handleRemoveGroup = async (id: string) => {
  try {
    userApi.post(`/admin/setting/groups/delete/${id}`, {}, accessHandle(), (data) => {
      if (data.code === 0) {
        message.success('删除用户组成功')
      } else {
        message.error(data.message || '删除用户组失败')
      }
    })
    setTimeout(() => {
      fetchGroups()
    }, 100)
  } catch (error: any) {
    message.error(error?.response?.data?.message || '删除失败')
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