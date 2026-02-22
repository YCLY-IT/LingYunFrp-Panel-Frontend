<template>
  <div class="node-management">
    <n-card title="节点管理" class="main-card">
      <n-space vertical :size="16">
        <div class="filter-container-grid">
          <!-- 桌面端布局 -->
          <n-grid v-if="!isMobile" :cols="24" :x-gap="16" :y-gap="8">
            <!-- 第一行：搜索相关 -->
            <n-grid-item :span="12">
              <n-input
                v-model:value="nodesStore.searchKeyword"
                placeholder="搜索ID、节点名称或主机名"
                clearable
              >
                <template #prefix>
                  <n-icon><search-outline /></n-icon>
                </template>
              </n-input>
            </n-grid-item>
            <n-grid-item :span="6">
              <n-select
                v-model:value="nodesStore.selectedOnline"
                placeholder="在线状态"
                :options="onlineOptions"
                clearable
                @update:value="nodesStore.handleFilterChange"
              />
            </n-grid-item>
            <n-grid-item :span="6">
              <n-select
                v-model:value="nodesStore.selectedStatus"
                placeholder="节点状态"
                :options="statusOptions"
                clearable
                @update:value="nodesStore.handleFilterChange"
              />
            </n-grid-item>
            <!-- 第二行：排序相关+操作 -->
            <n-grid-item :span="6">
              <n-select
                v-model:value="sortOptions.key"
                :options="sortFieldOptions"
                placeholder="排序字段"
                clearable
                @update:value="handleSortFieldChange"
              />
            </n-grid-item>
            <n-grid-item :span="6">
              <n-select
                v-model:value="sortOptions.order"
                :options="sortOrderOptions"
                placeholder="排序方式"
                clearable
                @update:value="handleSortOrderChange"
              />
            </n-grid-item>
            <n-grid-item :span="12">
              <n-button
                type="primary"
                @click="onAddNodeClick"
                style="width: 100%"
              >
                <template #icon>
                  <n-icon><add-outline /></n-icon>
                </template>
                添加节点
              </n-button>
            </n-grid-item>
          </n-grid>
          <!-- 移动端布局 -->
          <n-space v-else vertical :size="12">
            <!-- 搜索框 -->
            <n-input
              v-model:value="nodesStore.searchKeyword"
              placeholder="搜索ID、节点名称或主机名"
              clearable
            >
              <template #prefix>
                <n-icon><search-outline /></n-icon>
              </template>
            </n-input>
            <!-- 状态和排序行 -->
            <n-grid :cols="2" :x-gap="8">
              <n-grid-item>
                <n-select
                  v-model:value="nodesStore.selectedOnline"
                  placeholder="在线状态"
                  :options="onlineOptions"
                  clearable
                  @update:value="nodesStore.handleFilterChange"
                />
              </n-grid-item>
              <n-grid-item>
                <n-select
                  v-model:value="nodesStore.selectedStatus"
                  placeholder="节点状态"
                  :options="statusOptions"
                  clearable
                  @update:value="nodesStore.handleFilterChange"
                />
              </n-grid-item>
            </n-grid>
            <n-grid :cols="2" :x-gap="8">
              <n-grid-item>
                <n-select
                  v-model:value="sortOptions.key"
                  :options="sortFieldOptions"
                  placeholder="排序字段"
                  clearable
                  @update:value="handleSortFieldChange"
                />
              </n-grid-item>
              <n-grid-item>
                <n-select
                  v-model:value="sortOptions.order"
                  :options="sortOrderOptions"
                  placeholder="排序方式"
                  clearable
                  @update:value="handleSortOrderChange"
                />
              </n-grid-item>
            </n-grid>
            <!-- 添加按钮 -->
            <n-button
              type="primary"
              @click="onAddNodeClick"
              style="width: 100%"
            >
              <template #icon>
                <n-icon><add-outline /></n-icon>
              </template>
              添加节点
            </n-button>
          </n-space>
        </div>

        <n-data-table
          v-if="nodesStore.shouldShowTable"
          remote
          :columns="columns"
          :data="nodesStore.nodes"
          :loading="nodesStore.loading"
          :pagination="false"
          :row-class-name="rowClassName"
          :scroll-x="1200"
          :empty="nodesStore.emptySlot"
          @update:sorter="handleSortChange"
        />

        <!-- 独立的分页组件 -->
        <div
          v-if="nodesStore.shouldShowTable"
          style="display: flex; justify-content: right"
        >
          <NPagination
            v-model:page="nodesStore.pagination.page"
            v-model:page-size="nodesStore.pagination.pageSize"
            :item-count="nodesStore.pagination.itemCount"
            :page-count="nodesStore.pagination.pageCount"
            show-size-picker
            :page-sizes="[
              { label: '10 条/页', value: 10 },
              { label: '20 条/页', value: 20 },
              { label: '30 条/页', value: 30 },
              { label: '40 条/页', value: 40 },
            ]"
            :prefix="nodesStore.pagination.prefix"
            @update:page="nodesStore.handlePageChange"
            @update:page-size="
              (pageSize: number) => {
                nodesStore.pagination.pageSize = pageSize
                nodesStore.pagination.page = 1
                nodesStore.handleFilterChange()
              }
            "
          />
        </div>

        <!-- 空状态显示 -->
        <div
          v-else-if="
            !nodesStore.loading &&
            nodesStore.nodes.length === 0 &&
            !nodesStore.hasFilters
          "
          class="empty-state"
        >
          <n-empty description="暂无数据" />
        </div>
      </n-space>

      <!-- 添加节点模态框 -->
      <n-modal
        v-model:show="showAddModal"
        preset="card"
        title="添加节点"
        class="node-modal"
        :style="{ width: isMobile ? '95vw' : '650px' }"
      >
        <n-form
          ref="formRef"
          :model="formModel"
          :rules="rules"
          label-placement="left"
          label-width="auto"
          require-mark-placement="right-hanging"
        >
          <n-grid :cols="1" :x-gap="16">
            <n-form-item-gi label="节点名称" path="name">
              <n-input
                v-model:value="formModel.name"
                placeholder="请输入节点名称"
              />
            </n-form-item-gi>

            <n-grid-item :span="1">
              <n-grid
                :cols="isMobile ? 1 : 2"
                :x-gap="16"
                :y-gap="isMobile ? 12 : 0"
                responsive="screen"
              >
                <n-form-item-gi label="主机名" path="hostname">
                  <n-input
                    v-model:value="formModel.hostname"
                    placeholder="请输入主机名"
                  />
                </n-form-item-gi>
                <n-form-item-gi label="IP地址" path="ip">
                  <n-input
                    v-model:value="formModel.ip"
                    placeholder="请输入IP地址"
                  />
                </n-form-item-gi>
              </n-grid>
            </n-grid-item>

            <n-form-item-gi label="节点描述" path="description">
              <n-input
                v-model:value="formModel.description"
                type="textarea"
                placeholder="请输入节点描述"
              />
            </n-form-item-gi>

            <n-form-item-gi label="Token" path="token">
              <n-input
                v-model:value="formModel.token"
                placeholder="请输入Token"
              />
            </n-form-item-gi>

            <n-grid-item :span="1">
              <n-grid
                :cols="isMobile ? 1 : 2"
                :x-gap="16"
                :y-gap="isMobile ? 12 : 0"
                responsive="screen"
              >
                <n-form-item-gi label="服务端口" path="port">
                  <n-input-number
                    v-model:value="formModel.port"
                    placeholder="请输入服务端口"
                  />
                </n-form-item-gi>
                <n-form-item-gi label="管理端口" path="admin_port">
                  <n-input-number
                    v-model:value="formModel.admin_port"
                    placeholder="请输入管理端口"
                  />
                </n-form-item-gi>
              </n-grid>
            </n-grid-item>

            <n-grid-item :span="1">
              <n-grid :cols="2" :x-gap="16">
                <n-form-item-gi label="管理密码" path="admin_pass">
                  <n-input
                    v-model:value="formModel.admin_pass"
                    type="password"
                    show-password-on="click"
                    placeholder="请输入管理密码"
                    style="width: 220px"
                  >
                    <template #suffix>
                      <n-button
                        quaternary
                        size="small"
                        style="padding: 0 4px"
                        @click="handleRandomPassword"
                        :focusable="false"
                      >
                        <n-icon :component="SparklesOutline" />
                      </n-button>
                    </template>
                  </n-input>
                </n-form-item-gi>
                <n-form-item-gi label="带宽(Mbps)" path="bandwidth">
                  <n-input-number
                    v-model:value="formModel.bandwidth"
                    placeholder="请输入带宽"
                  />
                </n-form-item-gi>
              </n-grid>
            </n-grid-item>

            <n-grid-item :span="1">
              <n-grid :cols="2" :x-gap="16">
                <n-form-item-gi label="节点地区" path="location">
                  <n-select
                    v-model:value="formModel.location"
                    :options="locationOptions"
                    placeholder="请选择节点地区"
                    clearable
                  />
                </n-form-item-gi>
                <n-form-item-gi label="是否需要实名" path="need_realname">
                  <n-switch v-model:value="formModel.need_realname" />
                </n-form-item-gi>
              </n-grid>
            </n-grid-item>

            <n-form-item-gi label="允许用户组" path="group">
              <div class="group-buttons">
                <n-tag
                  v-for="group in groupsStore.groupOptions"
                  :key="group.value"
                  :type="
                    formModel.group.includes(group.value)
                      ? 'primary'
                      : 'default'
                  "
                  :disabled="group.value === 'admin'"
                  class="group-tag"
                  :bordered="false"
                  @click="toggleGroup(group.value)"
                >
                  {{ group.label }}
                </n-tag>
              </div>
            </n-form-item-gi>

            <n-form-item-gi label="允许端口" path="allow_port">
              <n-input
                v-model:value="formModel.allow_port"
                placeholder="请输入允许的端口范围, 如: 10000-20000"
              />
            </n-form-item-gi>

            <n-form-item-gi label="允许协议" path="allow_type">
              <div class="protocol-buttons">
                <n-tag
                  v-for="protocol in protocolOptions"
                  :key="protocol.value"
                  :type="
                    formModel.allow_type.includes(protocol.value)
                      ? 'primary'
                      : 'default'
                  "
                  class="protocol-tag"
                  :bordered="false"
                  @click="toggleProtocol(protocol.value)"
                >
                  {{ protocol.label }}
                </n-tag>
              </div>
            </n-form-item-gi>
          </n-grid>
        </n-form>
        <template #footer>
          <n-space justify="end">
            <n-button @click="showAddModal = false">取消</n-button>
            <n-button
              type="primary"
              :loading="nodesStore.submitting"
              @click="handleAddNode"
              >确定</n-button
            >
          </n-space>
        </template>
      </n-modal>

      <!-- 编辑节点模态框 -->
      <n-modal
        v-model:show="showEditModal"
        preset="card"
        title="编辑节点"
        class="node-modal"
        :style="{ width: isMobile ? '95vw' : '650px' }"
      >
        <n-form
          ref="formRef"
          :model="formModel"
          :rules="rules"
          label-placement="left"
          label-width="auto"
          require-mark-placement="right-hanging"
        >
          <n-grid :cols="1" :x-gap="16">
            <n-form-item-gi label="节点名称" path="name">
              <n-input
                v-model:value="formModel.name"
                placeholder="请输入节点名称"
              />
            </n-form-item-gi>

            <n-grid-item :span="1">
              <n-grid :cols="2" :x-gap="16">
                <n-form-item-gi label="主机名" path="hostname">
                  <n-input
                    v-model:value="formModel.hostname"
                    placeholder="请输入主机名"
                  />
                </n-form-item-gi>
                <n-form-item-gi label="IP地址" path="ip">
                  <n-input
                    v-model:value="formModel.ip"
                    placeholder="请输入IP地址"
                  />
                </n-form-item-gi>
              </n-grid>
            </n-grid-item>

            <n-form-item-gi label="节点描述" path="description">
              <n-input
                v-model:value="formModel.description"
                type="textarea"
                placeholder="请输入节点描述"
              />
            </n-form-item-gi>

            <n-form-item-gi label="Token" path="token">
              <n-input
                v-model:value="formModel.token"
                placeholder="请输入Token"
              />
            </n-form-item-gi>

            <n-grid-item :span="1">
              <n-grid :cols="2" :x-gap="16">
                <n-form-item-gi label="服务端口" path="port">
                  <n-input-number
                    v-model:value="formModel.port"
                    placeholder="请输入服务端口"
                  />
                </n-form-item-gi>
                <n-form-item-gi label="管理端口" path="admin_port">
                  <n-input-number
                    v-model:value="formModel.admin_port"
                    placeholder="请输入管理端口"
                  />
                </n-form-item-gi>
              </n-grid>
            </n-grid-item>

            <n-grid-item :span="1">
              <n-grid :cols="2" :x-gap="16">
                <n-form-item-gi label="管理密码" path="admin_pass">
                  <n-input
                    v-model:value="formModel.admin_pass"
                    type="password"
                    show-password-on="click"
                    placeholder="请输入管理密码"
                    style="width: 220px"
                  >
                    <template #suffix>
                      <n-button
                        quaternary
                        size="small"
                        style="padding: 0 4px"
                        @click="handleRandomPassword"
                        :focusable="false"
                      >
                        <n-icon :component="SparklesOutline" />
                      </n-button>
                    </template>
                  </n-input>
                </n-form-item-gi>
                <n-form-item-gi label="带宽(Mbps)" path="bandwidth">
                  <n-input-number
                    v-model:value="formModel.bandwidth"
                    placeholder="请输入带宽"
                  />
                </n-form-item-gi>
              </n-grid>
            </n-grid-item>

            <n-grid-item :span="1">
              <n-grid :cols="2" :x-gap="16">
                <n-form-item-gi label="节点地区" path="location">
                  <n-select
                    v-model:value="formModel.location"
                    :options="locationOptions"
                    placeholder="请选择节点地区"
                    clearable
                  />
                </n-form-item-gi>
                <n-form-item-gi label="是否需要实名" path="need_realname">
                  <n-switch v-model:value="formModel.need_realname" />
                </n-form-item-gi>
              </n-grid>
            </n-grid-item>

            <n-form-item-gi label="允许用户组" path="group">
              <div class="group-buttons">
                <n-tag
                  v-for="group in groupsStore.groupOptions"
                  :key="group.value"
                  :type="
                    formModel.group.includes(group.value)
                      ? 'primary'
                      : 'default'
                  "
                  :disabled="group.value === 'admin'"
                  class="group-tag"
                  :bordered="false"
                  @click="toggleGroup(group.value)"
                >
                  {{ group.label }}
                </n-tag>
              </div>
            </n-form-item-gi>

            <n-form-item-gi label="允许端口" path="allow_port">
              <n-input
                v-model:value="formModel.allow_port"
                placeholder="请输入允许的端口范围, 如: 10000-20000"
              />
            </n-form-item-gi>

            <n-form-item-gi label="允许协议" path="allow_type">
              <div class="protocol-buttons">
                <n-tag
                  v-for="protocol in protocolOptions"
                  :key="protocol.value"
                  :type="
                    formModel.allow_type.includes(protocol.value)
                      ? 'primary'
                      : 'default'
                  "
                  class="protocol-tag"
                  :bordered="false"
                  @click="toggleProtocol(protocol.value)"
                >
                  {{ protocol.label }}
                </n-tag>
              </div>
            </n-form-item-gi>
          </n-grid>
        </n-form>
        <template #footer>
          <n-space justify="end">
            <n-button @click="showEditModal = false">取消</n-button>
            <n-button
              type="primary"
              :loading="nodesStore.submitting"
              @click="handleEditNode"
              >确定</n-button
            >
          </n-space>
        </template>
      </n-modal>

      <!-- 启用/禁用节点确认框 -->
      <n-modal
        v-model:show="showToggleModal"
        preset="dialog"
        :title="currentNode?.is_disabled ? '启用节点' : '禁用节点'"
        :style="{ width: isMobile ? '90vw' : '420px' }"
        :show-icon="false"
      >
        <div class="confirm-text">
          确定要{{ currentNode?.is_disabled ? '启用' : '禁用' }}节点 "{{
            currentNode?.name
          }}" 吗？
        </div>
        <template #action>
          <n-space justify="end">
            <n-button @click="showToggleModal = false">取消</n-button>
            <n-button
              :type="currentNode?.is_disabled ? 'primary' : 'warning'"
              :loading="nodesStore.submitting"
              @click="() => currentNode && handleToggleNode(currentNode)"
            >
              确定
            </n-button>
          </n-space>
        </template>
      </n-modal>

      <!-- 删除节点确认框 -->
      <n-modal
        v-model:show="showDeleteModal"
        preset="dialog"
        title="删除节点"
        :style="{ width: isMobile ? '90vw' : '420px' }"
        :show-icon="false"
      >
        <div class="confirm-text">
          确定要删除节点 "{{ currentNode?.name }}" 吗？此操作不可恢复！
        </div>
        <template #action>
          <n-space justify="end">
            <n-button @click="showDeleteModal = false">取消</n-button>
            <n-button
              type="error"
              :loading="nodesStore.submitting"
              @click="() => currentNode && handleDeleteNode(currentNode)"
            >
              删除
            </n-button>
          </n-space>
        </template>
      </n-modal>
    </n-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, h, watch, computed } from 'vue'
import {
  NCard,
  NSpace,
  NDataTable,
  NButton,
  NModal,
  NForm,
  NFormItemGi,
  NGrid,
  NGridItem,
  NInput,
  NInputNumber,
  useMessage,
  NSelect,
  NTag,
  NDropdown,
  NIcon,
  NSwitch,
  NEmpty,
  NPagination,
} from 'naive-ui'
import {
  EllipsisHorizontalCircleOutline,
  CreateOutline,
  PowerOutline,
  TrashOutline,
  SearchOutline,
  AddOutline,
  SparklesOutline,
} from '@vicons/ionicons5'
import type {
  DataTableColumns,
  FormRules,
  FormInst,
  SelectOption,
  DropdownOption,
} from 'naive-ui'
import type { Node } from '@/types'
import { useNodesStore } from '@/stores/nodes'
import { useGroupsStore } from '@/stores/groups'

const message = useMessage()
const nodesStore = useNodesStore()
const groupsStore = useGroupsStore()

// 判断是否为移动端
const isMobile = computed(() => {
  return window.innerWidth <= 768
})

// 搜索防抖定时器
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

// 监听搜索关键词变化，带防抖
watch(
  () => nodesStore.searchKeyword,
  () => {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer)
    }
    searchDebounceTimer = setTimeout(() => {
      nodesStore.pagination.page = 1
      nodesStore.fetchNodes(message)
    }, 300)
  },
)

// 模态框状态
const showAddModal = ref(false)
const showEditModal = ref(false)
const showToggleModal = ref(false)
const showDeleteModal = ref(false)
const formRef = ref<FormInst | null>(null)
const editingNode = ref<Node | null>(null)
const currentNode = ref<Node | null>(null)

// 表单模型
const formModel = ref({
  id: 0,
  name: '',
  hostname: '',
  ip: '',
  description: '',
  token: '',
  port: 7000,
  admin_port: 7500,
  admin_pass: '',
  group: [] as string[],
  allow_port: '',
  allow_type: [] as string[],
  need_realname: true,
  bandwidth: 0,
  location: '',
})

// 选项配置
const protocolOptions = [
  { label: 'TCP', value: 'tcp' },
  { label: 'UDP', value: 'udp' },
  { label: 'HTTP', value: 'http' },
  { label: 'HTTPS', value: 'https' },
  { label: 'STCP', value: 'stcp' },
  { label: 'XTCP', value: 'xtcp' },
]

const locationOptions = [
  { label: '请选择地区', value: '' },
  { label: '中国', value: 'cn' },
  { label: '中国港澳台', value: 'cn-out' },
  { label: '海外', value: 'out' },
]

const onlineOptions: SelectOption[] = [
  { label: '在线', value: 'online' },
  { label: '离线', value: 'offline' },
]

const statusOptions: SelectOption[] = [
  { label: '已启用', value: 'enabled' },
  { label: '已禁用', value: 'disabled' },
]

// 1. 排序字段和方式选项
const sortFieldOptions = [
  { label: 'ID', value: 'id' },
  { label: '名称', value: 'name' },
  { label: '服务端口', value: 'port' },
  { label: '管理端口', value: 'admin_port' },
  { label: '实名', value: 'need_realname' },
  { label: '用户组', value: 'group' },
]
const sortOrderOptions = [
  { label: '升序', value: 'asc' },
  { label: '降序', value: 'desc' },
]
const sortOptions = ref({ key: 'id', order: 'asc' })

const handleSortFieldChange = () => {
  nodesStore.pagination.page = 1
}
const handleSortOrderChange = () => {
  nodesStore.pagination.page = 1
}
const handleSortChange = (sorter) => {
  if (sorter) {
    sortOptions.value.key = sorter.columnKey
    sortOptions.value.order = sorter.order === 'ascend' ? 'asc' : 'desc'
    nodesStore.pagination.page = 1
  }
}

// 表单验证规则
const rules: FormRules = {
  name: {
    required: true,
    message: '请输入节点名称',
    trigger: ['blur', 'input'],
  },
  ip: {
    required: true,
    message: '请输入IP地址',
    trigger: ['blur', 'input'],
  },
  token: {
    required: true,
    message: '请输入Token',
    trigger: ['blur', 'input'],
  },
  servicePort: {
    required: true,
    message: '请输入服务端口',
    trigger: ['blur', 'input'],
    validator: (_rule, value) => {
      if (typeof value !== 'number' || value < 1 || value > 65535) {
        return new Error('端口范围必须在 1-65535 之间')
      }
      return true
    },
  },
  admin_port: {
    required: true,
    message: '请输入管理端口',
    trigger: ['blur', 'input'],
    validator: (_rule, value) => {
      if (typeof value !== 'number' || value < 1 || value > 65535) {
        return new Error('端口范围必须在 1-65535 之间')
      }
      return true
    },
  },
  admin_pass: {
    required: true,
    message: '请输入管理密码',
    trigger: ['blur', 'input'],
  },
  location: {
    required: true,
    message: '请选择节点地区',
    trigger: ['change'],
  },
  group: {
    required: true,
    message: '请选择允许的用户组',
    trigger: ['blur', 'input'],
    validator: (_rule, value) => {
      if (!Array.isArray(value) || value.length === 0) {
        return new Error('请至少选择一个用户组')
      }
      return true
    },
  },
  allow_port: {
    required: true,
    message: '请输入允许的端口范围',
    trigger: ['blur', 'input'],
    validator: (_rule, value) => {
      if (!value) return new Error('请输入端口范围')

      // 支持多个端口范围, 用逗号分隔
      const ranges = value.split(';').map((range) => range.trim())

      for (const range of ranges) {
        // 检查单个端口
        if (/^\d+$/.test(range)) {
          const port = parseInt(range)
          if (port < 1 || port > 65535) {
            return new Error('端口必须在 1-65535 之间')
          }
          continue
        }

        // 检查端口范围
        const match = range.match(/^(\d+)-(\d+)$/)
        if (!match) {
          return new Error(
            '端口范围格式不正确, 请使用 1-65535 或 80,443 或 1000-2000,3000-4000 的格式',
          )
        }

        const start = parseInt(match[1])
        const end = parseInt(match[2])

        if (start < 1 || start > 65535 || end < 1 || end > 65535) {
          return new Error('端口必须在 1-65535 之间')
        }

        if (start >= end) {
          return new Error('起始端口必须小于结束端口')
        }
      }

      return true
    },
  },
  allow_type: {
    required: true,
    message: '请选择允许的协议',
    trigger: ['blur', 'input'],
    validator: (_rule, value) => {
      if (!Array.isArray(value) || value.length === 0) {
        return new Error('请至少选择一个协议')
      }
      return true
    },
  },
}

// 行样式
const rowClassName = (row: Node) => {
  return row.is_disabled ? 'disabled-row' : ''
}

// 渲染状态标签
const renderStatusTag = (
  status: boolean,
  successText: string,
  errorText: string,
) => {
  return h(
    NTag,
    {
      type: status ? 'success' : 'error',
      size: 'small',
      round: true,
      bordered: false,
    },
    { default: () => (status ? successText : errorText) },
  )
}

// 表格列配置
const columns: DataTableColumns<Node> = [
  {
    title: 'ID',
    key: 'id',
    width: 80,
  },
  {
    title: '名称',
    key: 'name',
    width: 180,
    render(row) {
      return h(
        NSpace,
        { align: 'center', wrap: false },
        {
          default: () => [
            renderStatusTag(row.is_online, '在线', '离线'),
            h(
              'span',
              {
                style: {
                  'max-width': '100px',
                  overflow: 'hidden',
                  'text-overflow': 'ellipsis',
                  'white-space': 'nowrap',
                  display: 'inline-block',
                  'vertical-align': 'middle',
                },
              },
              row.name,
            ),
          ],
        },
      )
    },
  },
  {
    title: '主机名',
    key: 'hostname',
    width: 150,
  },
  {
    title: '描述',
    key: 'description',
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '服务端口',
    key: 'port',
    width: 100,
  },
  {
    title: '管理端口',
    key: 'admin_port',
    width: 100,
  },
  {
    title: '实名',
    key: 'need_realname',
    width: 80,
    render(row) {
      return renderStatusTag(row.need_realname, '需要', '不需要')
    },
  },
  {
    title: '用户组',
    key: 'group',
    width: 180,
    render(row) {
      const groups = row.group ? row.group.split(';') : []
      return h(
        NSpace,
        { wrap: true, justify: 'start' },
        {
          default: () =>
            groups.map((group) => {
              const option = groupsStore.groupOptions.find(
                (opt) => opt.value === group,
              )
              return h(
                NTag,
                {
                  type: 'info',
                  size: 'small',
                  round: true,
                  bordered: false,
                  style: 'margin: 2px',
                },
                { default: () => (option ? option.label : group) },
              )
            }),
        },
      )
    },
  },
  {
    title: '地区',
    key: 'location',
    width: 100,
    render(row) {
      const option = locationOptions.find((opt) => opt.value === row.location)
      return h(
        NTag,
        {
          type: 'info',
          size: 'small',
          round: true,
          bordered: false,
        },
        { default: () => (option ? option.label : row.location) },
      )
    },
  },
  {
    title: '协议',
    key: 'allow_type',
    width: 180,
    render(row) {
      const types = row.allow_type ? row.allow_type.split(';') : []
      return h(
        NSpace,
        { wrap: true, justify: 'start' },
        {
          default: () =>
            types.map((type) => {
              const option = protocolOptions.find((opt) => opt.value === type)
              return h(
                NTag,
                {
                  type: 'success',
                  size: 'small',
                  round: true,
                  bordered: false,
                  style: 'margin: 2px',
                },
                { default: () => (option ? option.label : type) },
              )
            }),
        },
      )
    },
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render(row) {
      return renderStatusTag(!row.is_disabled, '已启用', '已禁用')
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    fixed: 'right',
    render(row) {
      return h(
        NDropdown,
        {
          trigger: 'click',
          options: dropdownOptions(row),
          onSelect: (key: string) => handleSelect(key, row),
          placement: 'bottom-end',
        },
        {
          default: () =>
            h(
              NButton,
              {
                quaternary: true,
                circle: true,
                size: 'small',
              },
              {
                icon: () =>
                  h(NIcon, null, {
                    default: () => h(EllipsisHorizontalCircleOutline),
                  }),
              },
            ),
        },
      )
    },
  },
]

// 下拉菜单选项
const dropdownOptions = (row: Node): DropdownOption[] => [
  {
    label: '编辑',
    key: 'edit',
    disabled: false,
    icon: () => h(NIcon, null, { default: () => h(CreateOutline) }),
  },
  {
    label: !row.is_disabled ? '禁用' : '启用',
    key: 'toggle',
    disabled: false,
    icon: () => h(NIcon, null, { default: () => h(PowerOutline) }),
  },
  {
    label: '删除',
    key: 'delete',
    disabled: false,
    icon: () => h(NIcon, null, { default: () => h(TrashOutline) }),
  },
]

// 用户组和协议切换
const toggleGroup = (value: string) => {
  if (value === 'admin') {
    if (!formModel.value.group.includes(value)) {
      formModel.value.group.push(value)
    }
    return
  }

  const index = formModel.value.group.indexOf(value)
  if (index === -1) {
    formModel.value.group.push(value)
  } else {
    formModel.value.group.splice(index, 1)
  }
}

const toggleProtocol = (value: string) => {
  const index = formModel.value.allow_type.indexOf(value)
  if (index === -1) {
    formModel.value.allow_type.push(value)
  } else {
    formModel.value.allow_type.splice(index, 1)
  }
}

// 表单重置
const resetForm = () => {
  Object.assign(formModel.value, {
    id: 0,
    name: '',
    hostname: '',
    ip: '',
    description: '',
    token: '',
    port: 7000,
    admin_port: 7500,
    admin_pass: '',
    group: ['admin'],
    allow_port: '',
    allow_type: [],
    need_realname: true,
    bandwidth: 0,
    location: '',
  })
}

// 编辑节点
const handleEdit = (row: Node) => {
  editingNode.value = row
  formModel.value = {
    id: row.id,
    name: row.name,
    hostname: row.hostname,
    ip: row.ip,
    description: row.description,
    token: row.token,
    port: row.port,
    admin_port: row.admin_port,
    admin_pass: row.admin_pass,
    group: row.group ? row.group.split(';') : [],
    allow_port: row.allow_port,
    allow_type: row.allow_type ? row.allow_type.split(';') : [],
    need_realname: row.need_realname,
    bandwidth: row.bandwidth,
    location: row.location,
  }
  showEditModal.value = true
}

// 编辑节点提交
const handleEditNode = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    const config = {
      id: editingNode.value!.id,
      name: formModel.value.name,
      hostname: formModel.value.hostname,
      ip: formModel.value.ip,
      description: formModel.value.description,
      token: formModel.value.token,
      port: formModel.value.port,
      admin_port: formModel.value.admin_port,
      admin_pass: formModel.value.admin_pass,
      group: formModel.value.group.join(';'),
      allow_port: formModel.value.allow_port,
      allow_type: formModel.value.allow_type.join(';'),
      need_realname: formModel.value.need_realname,
      bandwidth: formModel.value.bandwidth,
      location: formModel.value.location,
    }

    const success = await nodesStore.updateNode(config, message)
    if (success) {
      showEditModal.value = false
      formRef.value?.restoreValidation()
      editingNode.value = null
    }
  } catch (error: any) {
    message.error(error.message || '更新节点失败')
  }
}

// 添加节点提交
const handleAddNode = async () => {
  if (!formModel.value.group.includes('admin')) {
    formModel.value.group.push('admin')
  }

  if (!formRef.value) return

  try {
    await formRef.value.validate()

    const config = {
      name: formModel.value.name,
      hostname: formModel.value.hostname,
      ip: formModel.value.ip,
      description: formModel.value.description,
      token: formModel.value.token,
      port: formModel.value.port,
      admin_port: formModel.value.admin_port,
      admin_pass: formModel.value.admin_pass,
      group: formModel.value.group.join(';'),
      allow_port: formModel.value.allow_port,
      allow_type: formModel.value.allow_type.join(';'),
      need_realname: formModel.value.need_realname,
      bandwidth: formModel.value.bandwidth,
      location: formModel.value.location,
    }

    const success = await nodesStore.addNode(config, message)
    if (success) {
      showAddModal.value = false
      formRef.value?.restoreValidation()
      resetForm()
    }
  } catch (error: any) {
    if (error.message == '') return
    message.error(error.message)
  }
}

// 切换节点状态
const handleToggleNode = async (node: Node) => {
  const success = await nodesStore.toggleNode(
    node.id,
    !node.is_disabled,
    message,
  )
  if (success) {
    showToggleModal.value = false
  }
}

// 删除节点
const handleDeleteNode = async (node: Node) => {
  const success = await nodesStore.deleteNode(node.id, message)
  if (success) {
    showDeleteModal.value = false
  }
}

// 下拉菜单选择处理
const handleSelect = (key: string, row: Node) => {
  switch (key) {
    case 'edit':
      handleEdit(row)
      break
    case 'toggle':
      currentNode.value = row
      showToggleModal.value = true
      break
    case 'delete':
      currentNode.value = row
      showDeleteModal.value = true
      break
  }
}

// 初始化数据
const init = () => {
  groupsStore.fetchUserGroups(message)
  nodesStore.fetchNodes(message)
}

const onAddNodeClick = () => {
  resetForm()
  showAddModal.value = true
}

const generateRandomPassword = (length = 12) => {
  const chars =
    'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*'
  let pwd = ''
  for (let i = 0; i < length; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return pwd
}

const handleRandomPassword = () => {
  formModel.value.admin_pass = generateRandomPassword()
}

init()
</script>

<style scoped>
.node-management {
  width: 100%;
}

.main-card {
  border-radius: 8px;
}

.filter-container-grid {
  margin-bottom: 8px;
}

.add-button {
  margin-left: auto;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  padding: 40px 0;
}

.group-buttons,
.protocol-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.group-tag,
.protocol-tag {
  cursor: pointer;
  padding: 6px 12px;
  transition: all 0.2s ease;
}

.group-tag:hover,
.protocol-tag:hover {
  opacity: 0.8;
}

.confirm-text {
  margin: 16px 0;
  text-align: center;
}

.node-modal :deep(.n-form-item-label) {
  font-weight: 500;
}

:deep(.n-data-table-th) {
  background-color: var(--n-merged-th-color) !important;
  font-weight: 600;
}

:deep(.n-data-table-tr:hover) {
  background-color: rgba(0, 0, 0, 0.03);
}

:deep(.disabled-row) {
  opacity: 0.7;
  background-color: rgba(0, 0, 0, 0.02);
}

:deep(.n-tag) {
  font-size: 12px;
}

:deep(.n-button) {
  font-weight: 500;
}

@media (max-width: 900px) {
  .filter-container-grid .n-grid {
    flex-direction: column;
  }
  .filter-container-grid .n-grid-item {
    width: 100% !important;
    min-width: 0;
  }
}
</style>
