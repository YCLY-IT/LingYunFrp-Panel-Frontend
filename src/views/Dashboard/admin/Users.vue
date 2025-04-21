<template>
  <div class="users">
    <NCard title="用户管理">
      <NSpace vertical :size="12">
        <div style="display: flex;">
          <NInput v-model:value="filters.search" placeholder="搜索 ID、用户名、邮箱或访问密钥" clearable style="flex: 1;"
            @update:value="handleSearch">
            <template #prefix>
              <NIcon :component="Search" />
            </template>
          </NInput>
        </div>
        <NSpace>
          <NSelect v-model:value="filters.group" :options="groupOptions" placeholder="用户组" clearable
            style="width: 200px" @update:value="handleGroupFilter" />
          <NSelect v-model:value="filters.isRealname" :options="realnameOptions" placeholder="实名状态" clearable
            style="width: 200px" @update:value="handleRealnameFilter" />
          <NSelect v-model:value="filters.status" :options="statusOptions" placeholder="账户状态" clearable
            style="width: 200px" @update:value="handleStatusFilter" />
        </NSpace>
        <NDataTable remote :columns="columns" :data="users" :loading="loading" :pagination="pagination" />
      </NSpace>
    </NCard>

    <!-- 添加编辑用户的模态框 -->
    <NModal v-model:show="showEditModal" preset="card" title="编辑用户" style="width: 600px;">
      <NForm ref="formRef" :model="editForm" :rules="rules" label-placement="left" label-width="auto"
        require-mark-placement="right-hanging">
        <NFormItem label="用户名" path="username">
          <NInput v-model:value="editForm.username" placeholder="请输入用户名" />
        </NFormItem>
        <NFormItem label="邮箱" path="email">
          <NInput v-model:value="editForm.email" placeholder="请输入邮箱" />
        </NFormItem>
        <NFormItem label="用户组" path="group">
          <NSelect v-model:value="editForm.group" :options="groupOptions" placeholder="请选择用户组" />
        </NFormItem>
        <NFormItem label="账户状态" path="status">
          <NSelect v-model:value="editForm.status" :options="statusOptions" placeholder="请选择账户状态" />
        </NFormItem>
        <NFormItem label="实名状态" path="isRealname">
          <NSwitch v-model:value="editForm.is_realname" :rail-style="switchButtonRailStyle" />
        </NFormItem>
        <NFormItem label="验证码次数" path="remainder">
          <NSpace align="center">
            <NInputNumber v-model:value="editForm.remainder" placeholder="请输入手机验证码次数" :min="0" />
            <span>次</span>
          </NSpace>
        </NFormItem>
        <NFormItem label="流量限制" path="traffic">
          <NSpace align="center">
            <NInputNumber v-model:value="editForm.traffic" placeholder="请输入流量限制" :min="0" />
            <span>GB</span>
          </NSpace>
        </NFormItem>
        <NFormItem label="出站带宽" path="out_limit">
          <NSpace align="center">
            <NInputNumber v-model:value="editForm.out_limit" placeholder="请输入出站带宽" :min="0" />
            <span>Mbps</span>
          </NSpace>
        </NFormItem>
        <NFormItem label="入站带宽" path="in_limit">
          <NSpace align="center">
            <NInputNumber v-model:value="editForm.in_limit" placeholder="请输入入站带宽" :min="0" />
            <span>Mbps</span>
          </NSpace>
        </NFormItem>
        <NFormItem label="隧道数量" path="proxies">
          <NSpace align="center">
            <NInputNumber v-model:value="editForm.proxies" placeholder="请输入隧道数量" :min="0" />
            <span>个</span>
          </NSpace>
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace justify="end">
          <NButton size="small" @click="showEditModal = false">取消</NButton>
          <NButton type="primary" size="small" :loading="submitting" @click="handleEditSubmit">
            确定
          </NButton>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>

<script lang="ts" setup>
import { ref, h } from 'vue'
import { NCard, NSpace, NDataTable, NButton, useMessage, NTag, NInput, NSelect, NPopconfirm, NIcon, NModal, NForm, NFormItem, NInputNumber, NSwitch, SelectOption } from 'naive-ui'
import { Search } from '@vicons/ionicons5'
import type { DataTableColumns, FormInst, FormRules } from 'naive-ui'
import type { UserInfo } from '@/types'
import moment from 'moment';
import type { FilterUsersArgs } from '@/types'
import { switchButtonRailStyle } from '@/constants/theme.ts'
import {userApi} from "@/net";
import {accessHandle} from "@/net/base.ts";
const message = useMessage()
const loading = ref(false)
const users = ref<UserInfo[]>([])
const groupNameMap = ref<Record<string, string>>({})

const realnameOptions: SelectOption[] = [
  { label: '已实名', value: true },
  { label: '未实名', value: false }
]

// 修改filters类型定义
const filters = ref<{
  search: string;
  group: string | null;
  isRealname: boolean | null;  // 类型改为boolean|null
  status: number | null;
}>({
  search: '',
  group: null,
  isRealname: null,  // 初始值保持null
  status: null
})


const groupOptions = ref<{ label: string; value: string }[]>([])

const statusOptions: SelectOption[] = [
  { label: '正常', value: 0 },
  { label: '封禁', value: 1 },
  { label: '流量超限', value: 2 }
]

const pagination = ref({
  page: 1,
  pageSize: 20,
  pageCount: 1,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [
    {
      label: '10 条 / 页',
      value: 10
    },
    {
      label: '20 条 / 页',
      value: 20
    },
    {
      label: '30 条 / 页',
      value: 30
    },
    {
      label: '40 条 / 页',
      value: 40
    }
  ],
  prefix({ itemCount }: { itemCount?: number }) {
    return `共 ${itemCount} 条`
  },
  onUpdatePage: (page: number) => {
    pagination.value.page = page
    loadData()
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.value.pageSize = pageSize
    pagination.value.page = 1
    loadData()
  }
})

const showEditModal = ref(false)
const formRef = ref<FormInst | null>(null)
const submitting = ref(false)

const editForm = ref({
  ID: 0,
  username: '',
  email: '',
  group: '',
  status: 0,
  is_realname: false,
  remainder: 0,
  traffic: 0,
  out_limit: 0,
  in_limit: 0,
  proxies: 0
})

const rules: FormRules = {
  username: {
    required: true,
    message: '请输入用户名',
    trigger: ['blur', 'input']
  },
  email: {
    required: true,
    message: '请输入邮箱',
    trigger: ['blur', 'input'],
    validator: (_rule: any, value: string) => {
      if (!value) return true
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        return new Error('请输入有效的邮箱地址')
      }
      return true
    }
  },
  group: {
    required: true,
    message: '请选择用户组',
    trigger: ['blur', 'change']
  }
}

const columns: DataTableColumns<UserInfo> = [
  {
    title: 'ID',
    key: 'id',
    render(row) {
      return h('div', { style: 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;' }, row.id)
    }
  },
  {
    title: '用户名',
    key: 'username',
    render(row) {
      return h('div', { style: 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;' }, row.username)
    }
  },
  {
    title: '邮箱',
    key: 'email',
    render(row) {
      return h('div', { style: 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;' }, row.email)
    }
  },
  {
    title: '用户组',
    key: 'group',
    render(row) {
      return h('div', { style: 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;' }, row.friendlyGroup || row.group)
    }
  },
  {
    title: '注册时间',
    key: 'create_at',
    render(row) {
      return h('div', { style: 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;' }, moment(row.create_at).format('LLLL'))
    }
  },
  {
    title: '状态',
    key: 'status',
    render(row) {
      const statusMap: Record<number, { text: string, type: 'success' | 'error' | 'warning' }> = {
        0: { text: '正常', type: 'success' },
        1: { text: '封禁', type: 'error' },
        2: { text: '流量超限', type: 'warning' }
      }
      const status = statusMap[row.status] || { text: '未知', type: 'warning' }
      return h(
        NTag,
        {
          type: status.type
        },
        { default: () => status.text }
      )
    }
  },
  {
    title: '操作',
    key: 'actions',
    render(row) {
      return h(
        NSpace,
        {},
        {
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
              NPopconfirm,
              {
                onPositiveClick: () => handleToggleStatus(row),
                positiveText: '确定',
                negativeText: '取消'
              },
              {
                default: () => row.status === 1 ? '确认解封此用户？' : '确认封禁此用户？',
                trigger: () =>
                  h(
                    NButton,
                    {
                      size: 'small',
                      type: row.status === 1 ? 'success' : 'error'
                    },
                    { default: () => row.status === 1 ? '解封' : '封禁' }
                  )
              }
            )
          ]
        }
      )
    }
  }
]

const searchTimeout = ref<number>()

const handleSearch = () => {
  window.clearTimeout(searchTimeout.value)
  searchTimeout.value = window.setTimeout(() => {
    if (pagination.value.page !== 1) {
      pagination.value.page = 1
    } else {
      loadData() // 防止页码相同时不触发
    }
  }, 300)
}

const handleGroupFilter = () => {
  pagination.value.page = 1
  loadData()
}

const handleRealnameFilter = () => {
  pagination.value.page = 1
  loadData()
}

const handleStatusFilter = () => {
  pagination.value.page = 1
  loadData()
}

const handleToggleStatus = async (user: UserInfo) => {
  try {
    userApi.post("/admin/user/toggle", {
      userId: user.id,
      status: user.status === 1? 0 : 1
    }, accessHandle(), (data) => {
      if (data.code === 0) {
        message.success(data.message || '操作成功')
        loadData()
      } else {
        message.error(data.message || '操作失败')
      }
    })
  } catch (error: any) {
    message.error(error?.response?.data?.message || '操作失败')
  }
}

const handleEditSubmit = () => {
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      submitting.value = true
      try {
        editForm.value.traffic *= 1024
        editForm.value.out_limit *= 128
        editForm.value.in_limit *= 128
        userApi.post(`/admin/user/set/${editForm.value.ID}`, editForm.value, accessHandle(), (data) => {
          if (data.code === 0) {
            message.success('更新用户成功')
          } else {
            message.error(data.message || '更新用户失败')
          }
        })
        showEditModal.value = false
        loadData()
      } catch (error: any) {
        message.error(error?.response?.data?.message || '更新用户失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

const handleEdit = async (user: UserInfo) => {
  try {
    userApi.get(`/admin/user/get/${user.id}`,  accessHandle(), (data) => {
      if (data.code === 0) {
        const userDetail = data.data
        editForm.value = {
          ID: userDetail.id,
          username: userDetail.username,
          email: userDetail.email,
          group: userDetail.group,
          status: userDetail.status,
          is_realname: userDetail.is_realname,
          remainder: userDetail.remainder,
          traffic: userDetail.traffic / 1024,
          out_limit: userDetail.outBound / 128,
          in_limit: userDetail.inBound / 128,
          proxies: userDetail.proxies
        }
        showEditModal.value = true
      } else {
        message.error(data.message || '获取用户信息失败')
      }
    })
  } catch (error: any) {
    message.error(error?.response?.data?.message || '获取用户信息失败')
  }
}

// 修改后的获取用户组方法
const fetchUserGroups = async () => {
  try {
    userApi.get("/user/info/groups", accessHandle(), (data) => {
      if (data.code === 0) {
        // 同时更新组名映射和下拉选项
        groupOptions.value = data.data.groups.map(group => ({
          label: group.friendlyName,  // 使用接口返回的友好名称
          value: group.name
        }));

        groupNameMap.value = data.data.groups.reduce((acc: Record<string, string>, group) => {
          acc[group.name] = group.friendlyName;
          return acc;
        }, {});
      } else {
        message.error(data.message || '获取用户组列表失败');
      }
    })
  } catch (error) {
    message.error('获取用户组失败');
  }
}


// 处理用户数据, 添加 friendlyGroup
const processUsers = (users: UserInfo[]) => {
  return users.map(user => ({
    ...user,
    friendlyGroup: groupNameMap.value[user.group] || user.group
  }))
}

// 统一的数据加载函数
const loadData = async () => {
  loading.value = true
  try {
    const params: FilterUsersArgs = {
      page: pagination.value.page,
      limit: pagination.value.pageSize
    }

    // 添加所有有效的筛选条件
    if (filters.value.search) {
      params.keyword = filters.value.search
    }
    if (filters.value.group) {
      params.group = filters.value.group
    }
// 修改后的筛选条件处理部分
    if (filters.value.isRealname !== null) {
      // 直接使用boolean值
      params.isRealname = filters.value.isRealname
    }


    if (filters.value.status !== null) {
      params.status = filters.value.status
    }

    userApi.post("/admin/user/list", params, accessHandle(), (data) => {
      if (data.code === 0) {
        users.value = processUsers(data.data.users)
        pagination.value.pageCount = data.data.totalPages
        pagination.value.itemCount = data.data.totalUsers
      } else {
        message.error(data.message || '获取数据失败')
      }
    })
  } catch (error) {
    message.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 初始化数据
fetchUserGroups()
loadData()
</script>