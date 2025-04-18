<template>
  <div class="proxies">
    <NCard title="隧道管理">
      <div class="toolbar">
        <div class="search-box">
          <NInput v-model:value="searchText" placeholder="搜索隧道..." clearable>
            <template #prefix>
              <NIcon>
                <SearchOutline />
              </NIcon>
            </template>
          </NInput>
        </div>

        <div class="toolbar-right">
          <NButtonGroup>
            <NButton :type="viewMode === 'grid' ? 'primary' : 'default'" @click="viewMode = 'grid'">
              <template #icon>
                <NIcon>
                  <GridOutline />
                </NIcon>
              </template>
              <span class="view-text">网格</span><span class="view-suffix">视图</span>
            </NButton>
            <NButton :type="viewMode === 'list' ? 'primary' : 'default'" @click="viewMode = 'list'">
              <template #icon>
                <NIcon>
                  <ListOutline />
                </NIcon>
              </template>
              <span class="view-text">列表</span><span class="view-suffix">视图</span>
            </NButton>
          </NButtonGroup>

          <NButton secondary @click="handleRefresh">
            <template #icon>
              <NIcon>
                <RefreshOutline />
              </NIcon>
            </template>刷新
          </NButton>
        </div>
      </div>

      <!-- 网格视图 -->
      <div v-if="viewMode === 'grid'" class="proxy-grid">
        <template v-if="filteredProxies.length">
          <NCard v-for="proxy in filteredProxies" :key="proxy.proxyId" class="proxy-card">
            <div class="proxy-header">
              <h3 class="proxy-title">
                {{ proxy.proxyName }}
              </h3>
              <div class="status-tags">
                <NTag :type="proxy.isOnline ? 'success' : 'error'" size="small">
                  {{ proxy.isOnline ? '在线' : '离线' }}
                </NTag>
                <NTag v-if="proxy.is_banned" type="error" size="small" style="margin-left: 4px">
                  已封禁
                </NTag>
                <NTag v-if="proxy.isDisabled" type="warning" size="small" style="margin-left: 4px">
                  已禁用
                </NTag>
              </div>
            </div>
            <div class="proxy-info">
              <div class="info-item">
                <span class="label">ID:</span>
                <span class="value">
                  <NTag type="info" size="small"># {{ proxy.proxyId }}</NTag>
                </span>
              </div>
              <div class="info-item">
                <span class="label">协议:</span>
                <span class="value">{{ proxy.proxyType.toUpperCase() }}</span>
              </div>
              <div class="info-item">
                <span class="label">
                  {{ proxy.proxyType === 'http' || proxy.proxyType === 'https' ? '绑定域名：' : '远程端口：' }}
                </span>
                <span class="value">
                  <div v-if="proxy.proxyType === 'http' || proxy.proxyType === 'https'" class="remote-port">
                    <div v-for="domain in JSON.parse(proxy.domain || '[]')" :key="domain" class="domain">
                      <NTag type="info" size="small" style="cursor: pointer"
                            @click="() => openUrl(proxy.proxyType, domain)">
                        {{ domain }}
                      </NTag>
                    </div>
                  </div>
                  <template v-else>{{ proxy.remotePort }}</template>
                </span>
              </div>
              <div class="info-item" style="display: flex; align-items: flex-start">
                <span class="label">节点：</span>
                <span class="value" style="flex: 1; word-break: break-all;">{{ getNodeLabel(proxy.nodeId) }}</span>
              </div>
            </div>
            <div class="proxy-actions">
              <NDropdown :options="dropdownOptions(proxy)" @select="key => handleSelect(key, proxy)" trigger="click">
                <NButton secondary size="small">
                  <template #icon>
                    <NIcon>
                      <BuildOutline />
                    </NIcon>
                  </template>
                  更多
                </NButton>
              </NDropdown>
            </div>
          </NCard>
        </template>
        <NEmpty v-else description="暂无隧道" class="no-data">
          <template #extra>
            <NButton secondary @click="() => router.push('/dashboard/proxy/create')">
              <template #icon>
                <NIcon>
                  <AddOutline />
                </NIcon>
              </template>
              创建
            </NButton>
          </template>
        </NEmpty>
      </div>

      <!-- 列表视图 -->
      <template v-else>
        <NDataTable v-if="filteredProxies.length" :columns="columns" :data="filteredProxies" :style="{
          '.n-data-table-td': {
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '200px'
          }
        }" />
        <NEmpty v-else description="暂无隧道" class="no-data">
          <template #extra>
            <NButton secondary @click="() => router.push('/proxy/create')">
              <template #icon>
                <NIcon>
                  <AddOutline />
                </NIcon>
              </template>
              创建
            </NButton>
          </template>
        </NEmpty>
      </template>
    </NCard>

    <!-- 远程地址信息弹窗 -->
    <NModal v-model:show="showModal" preset="dialog" title="隧道详细信息" style="width: 800px; max-width: 90vw">
      <template #header>
        <div>隧道详细信息</div>
      </template>
      <div v-if="selectedProxy" style="padding: 16px 0" :class="{
        'proxy-detail-container': selectedProxy.proxyType === 'http' || selectedProxy.proxyType === 'https'
      }">
        <div class="proxy-detail-left">
          <div class="modal-info-item">
            <span class="label">状态：</span>
            <NTag :type="selectedProxy.isOnline ? 'success' : 'error'" size="small">
              {{ selectedProxy.isOnline ? '在线' : '离线' }}
            </NTag>
            <NTag v-if="selectedProxy.isBanned" type="error" size="small" style="margin-left: 8px">
              已封禁
            </NTag>
          </div>
          <div class="modal-info-item">
            <span class="label">隧道名称：</span>
            <span class="value">{{ selectedProxy.proxyName }}</span>
          </div>
          <div class="modal-info-item">
            <span class="label">协议类型：</span>
            <span class="value">{{ selectedProxy.proxyType.toUpperCase() }}</span>
          </div>
          <div class="modal-info-item">
            <span class="label">本地端口：</span>
            <span class="value">{{ selectedProxy.localPort }}</span>
          </div>
          <div class="modal-info-item">
            <span class="label">本地地址：</span>
            <span class="value">{{ selectedProxy.localIp }}</span>
          </div>
          <div class="modal-info-item">
            <span class="label">节点名称：</span>
            <span class="value">{{ getNodeLabel(selectedProxy.nodeId).split(' - ')[1] }}</span>
          </div>
          <template v-if="selectedProxy.proxyType === 'http' || selectedProxy.proxyType === 'https'">
            <div class="modal-info-item">
              <span class="label">绑定域名：</span>
              <span class="value">
                <NTag size="small" v-for="domain in JSON.parse(selectedProxy.domain || '[]')" :key="domain" type="info"
                      style="cursor: pointer; margin-right: 8px" @click="() => openUrl(selectedProxy.proxyType, domain)">
                  {{ domain }}
                </NTag>
              </span>
            </div>
          </template>
          <template v-else>
            <div class="modal-info-item">
              <span class="label">链接地址：</span>
              <span class="value">
                {{nodeOptions.find(node => node.value === selectedProxy?.nodeId)?.hostname}}:{{
                  selectedProxy.remotePort
                }}
              </span>
            </div>
          </template>
          <div class="modal-info-item">
            <span class="label">上次启动时间：</span>
            <span class="value">{{ selectedProxy.lastStartTime ? formatTime(selectedProxy.lastStartTime) : '从未启动'
              }}</span>
          </div>
          <div class="modal-info-item">
            <span class="label">上次关闭时间：</span>
            <span class="value">{{ selectedProxy.lastCloseTime ? formatTime(selectedProxy.lastCloseTime) : '从未关闭'
              }}</span>
          </div>
        </div>
        <template v-if="selectedProxy.proxyType === 'http' || selectedProxy.proxyType === 'https'">
          <div class="proxy-detail-right">
            <div class="modal-info-item">
              <span class="label">域名解析配置</span>
              <div class="value" style="margin-top: 16px">
                <NAlert type="info" style="margin-bottom: 16px">添加以下信息至您的域名解析配置后，服务才会生效。</NAlert>
                <NTable size="small" :single-line="false"
                        style="width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  <thead>
                  <tr>
                    <th>根域名</th>
                    <th>主机记录</th>
                    <th>记录类型</th>
                    <th>记录值</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="domain in JSON.parse(selectedProxy.domain || '[]')" :key="domain">
                    <td style="word-break: break-all; overflow-wrap: break-word;">{{ splitDomain(domain).rootDomain }}
                    </td>
                    <td style="word-break: break-all; overflow-wrap: break-word;">{{ splitDomain(domain).host }}</td>
                    <td style="word-break: break-all; overflow-wrap: break-word;">
                      {{isIPAddress(nodeOptions.find(n => n.value === selectedProxy.nodeId)?.hostname || '') ? 'A' :
                        'CNAME' }}
                    </td>
                    <td style="word-break: break-all; overflow-wrap: break-word;">
                      <NText type="primary">{{nodeOptions.find(n => n.value === selectedProxy.nodeId)?.hostname}}
                      </NText>
                    </td>
                  </tr>
                  </tbody>
                </NTable>
              </div>
            </div>
          </div>
        </template>
      </div>
    </NModal>

    <!-- 删除确认弹窗 -->
    <NModal v-model:show="showDeleteModal" preset="dialog" title="是否删除此隧道？" style="width: 400px">
      <template #header>
        <div>删除确认</div>
      </template>
      <p>确定要删除此隧道吗？此操作不可恢复。</p>
      <template #action>
        <NButton size="small" @click="showDeleteModal = false">取消</NButton>
        <NButton size="small" type="error" :loading="loading" @click="handleDeleteConfirm">删除</NButton>
      </template>
    </NModal>

    <!-- 编辑隧道弹窗 -->
    <NModal v-model:show="showEditModal" preset="dialog" title="编辑隧道" style="width: 800px; max-width: 90vw">
      <NForm ref="editFormRef" :model="editForm" :rules="rules" label-placement="left" label-width="120"
             require-mark-placement="right-hanging" size="medium" style="padding-top: 12px;">
        <NFormItem label="隧道名称" path="proxyName">
          <NInput v-model:value="editForm.proxyName" placeholder="请输入隧道名称" />
        </NFormItem>
        <NFormItem label="本地地址" path="localIp">
          <NInput v-model:value="editForm.localIp" placeholder="请输入本地地址" />
        </NFormItem>
        <NFormItem label="本地端口" path="localPort">
          <NInputNumber v-model:value="editForm.localPort" :min="1" :max="65535" placeholder="请输入本地端口" />
        </NFormItem>
        <NFormItem v-if="editForm.proxyType !== 'http' && editForm.proxyType !== 'https'" label="远程端口"
                   path="remotePort">
          <NInputNumber v-model:value="editForm.remotePort" :min="1" :max="65535" placeholder="请输入远程端口" />
          <NButton size="medium" :loading="gettingFreePort" @click="handleGetFreePortForEdit">
            获取空闲端口
          </NButton>
        </NFormItem>
        <NFormItem v-if="editForm.proxyType === 'http' || editForm.proxyType === 'https'" label="绑定域名" path="domain">
          <NDynamicTags v-model:value="domainTags" :render-tag="renderDomainTag" @update:value="handleDomainsUpdate" />
        </NFormItem>

        <NDivider>高级配置</NDivider>
        <NText depth="3" style="padding-bottom: 15px; display: block;">
          提示：仅推荐技术用户使用, 一般用户请勿随意填写。请确保您的配置正确, 否则隧道可能无法启动。
        </NText>

        <NFormItem label="访问密钥" path="accessKey">
          <NInput v-model:value="editForm.accessKey" placeholder="访问密钥已不再支持" :disabled="true"/>
        </NFormItem>
        <NFormItem label="Host Header Rewrite" path="hostHeaderRewrite">
          <NInput v-model:value="editForm.hostHeaderRewrite" placeholder="请输入 Host 请求头重写值" />
        </NFormItem>
        <NFormItem label="X-From-Where" path="headerXFromWhere">
          <NInput v-model:value="editForm.headerXFromWhere" placeholder="请输入 X-From-Where 请求头值" />
        </NFormItem>
        <NFormItem label="Proxy Protocol" path="proxyProtocolVersion">
          <NSelect v-model:value="editForm.proxy_protocol_version" :options="[
            { label: '不启用', value: '' },
            { label: 'v1', value: 'v1' },
            { label: 'v2', value: 'v2' }
          ]" placeholder="Proxy Protocol Version" />
        </NFormItem>
        <NFormItem label="其他选项">
          <div style="display: flex; gap: 16px;">
            <NSwitch v-model:value="editForm.use_encryption" :rail-style="switchButtonRailStyle">
              <template #checked>启用加密</template>
              <template #unchecked>禁用加密</template>
            </NSwitch>
            <NSwitch v-model:value="editForm.use_compression" :rail-style="switchButtonRailStyle">
              <template #checked>启用压缩</template>
              <template #unchecked>禁用压缩</template>
            </NSwitch>
          </div>
        </NFormItem>
      </NForm>
      <template #action>
        <NButton size="small" @click="showEditModal = false">取消</NButton>
        <NButton size="small" type="primary" :loading="loading" @click="handleEditSubmit">确定</NButton>
      </template>
    </NModal>

    <!-- 禁用/启用确认弹窗 -->
    <NModal v-model:show="showToggleModal" preset="dialog" style="width: 400px">
      <template #header>
        <div>{{ toggleModalTitle }}</div>
      </template>
      <div>{{ toggleModalContent }}</div>
      <template #action>
        <NButton size="small" @click="showToggleModal = false">取消</NButton>
        <NButton size="small" type="primary" :loading="loading" @click="handleToggleConfirm">确定</NButton>
      </template>
    </NModal>

    <!-- 启动参数和配置文件 Modal -->
    <NModal v-model:show="showConfigModal" preset="dialog" style="width: 800px; max-width: 90vw" class="config-dialog">
      <template #header>
        <div>生成启动配置</div>
      </template>
      <div style="margin: 16px 0" class="config-modal-container">
        <NCollapse v-model:expanded-names="expandedNames" :on-update:expanded-names="handleUpdateExpanded">
          <NCollapseItem title="启动参数" name="args" v-if="selectedProxy?.proxyType !== 'https'">
            <NScrollbar style="max-height: 200px; overflow: auto">
              <NCode :code="runArgs" language="yaml" :hljs="hljs" />
            </NScrollbar>
            <div style="margin-top: 8px;">Windows 用户如果启动失败，请尝试把 <NCode>lyfrpc</NCode> 换成 <NCode>.\lyfrpc.exe</NCode>。</div>
          </NCollapseItem>
          <NCollapseItem title="配置文件" name="config">
            <NAlert type="error" style="margin-bottom: 16px" title="友情提示">
              此处是为专业用户准备的配置文件, 请不要在没有判断能力的情况下随意修改, 否则隧道可能无法正常启动。<br>
              请使用 "
              <NCode>./lyfrpc -c </NCode>配置文件 " 进行启动。
            </NAlert>
            <NAlert type="warning" style="margin-bottom: 16px" title="HTTPS 隧道配置修改提示" v-if="selectedProxy?.proxyType == 'https'">
              请修改相关 SSL 配置, 否则隧道无法正常启动。
            </NAlert>

            <NTabs
                v-model:value="configFormat"
                type="line"
                placement="left"
                style="margin-top: 20px"
            >
              <NTabPane name="toml" tab="Toml">
                <NSpin :show="loading && configFormat === 'toml'">
                  <NScrollbar style="max-height: 500px; overflow: auto">
                    <NCode :code="tomlContent" language="toml" :hljs="hljs" />
                  </NScrollbar>
                </NSpin>
              </NTabPane>

              <NTabPane name="json" tab="Json">
                <NSpin :show="loading && configFormat === 'json'">
                  <NScrollbar style="max-height: 500px; overflow: auto">
                    <NCode :code="jsonContent" language="json" :hljs="hljs" />
                  </NScrollbar>
                </NSpin>
              </NTabPane>

              <NTabPane name="yml" tab="Yaml">
                <NSpin :show="loading && configFormat === 'yml'">
                  <NScrollbar style="max-height: 500px; overflow: auto">
                    <NCode :code="ymlContent" language="yaml" :hljs="hljs" />
                  </NScrollbar>
                </NSpin>
              </NTabPane>

              <NTabPane name="ini" tab="Ini">
                <NSpin :show="loading && configFormat === 'ini'">
                  <NScrollbar style="max-height: 500px; overflow: auto">
                    <NCode :code="iniContent" language="ini" :hljs="hljs" />
                  </NScrollbar>
                </NSpin>
              </NTabPane>
            </NTabs>
          </NCollapseItem>
        </NCollapse>
      </div>
      <template #action>
        <NButton size="small" @click="showConfigModal = false">关闭</NButton>
        <NButton v-if="expandedNames.includes('config')" size="small" secondary type="info"
                 @click="handleDownloadConfig">
          <template #icon>
            <NIcon>
              <DownloadOutline />
            </NIcon>
          </template>
          下载配置
        </NButton>
        <NButton size="small" type="primary" @click="handleCopyConfig" :disabled="expandedNames.length === 0">
          <template #icon>
            <NIcon>
              <CopyOutline />
            </NIcon>
          </template>
          复制
        </NButton>
      </template>
    </NModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h, watch } from 'vue'
import {
  NCard, NButton, NButtonGroup, NTag, NDataTable, NTable, NSpace, NIcon,
  NModal, NInput, NDropdown, NForm, NFormItem, NSelect, NInputNumber,
  useMessage, type FormInst, type FormRules, NDivider, NSwitch, NText,
  NEmpty, NCode, NCollapse, NCollapseItem, NAlert, NDynamicTags, NSpin,
  NTabs, NTabPane, NScrollbar
} from 'naive-ui'
import { GridOutline, ListOutline, BuildOutline, RefreshOutline, SearchOutline, InformationCircleOutline, CreateOutline, TrashOutline, PowerOutline, AddOutline, CopyOutline, DocumentOutline, EllipsisHorizontalCircleOutline, DownloadOutline } from '@vicons/ionicons5'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import ini from 'highlight.js/lib/languages/ini'
import toml from 'highlight.js/lib/languages/ini'
import json from 'highlight.js/lib/languages/json'
import yaml from 'highlight.js/lib/languages/yaml'
import type { Proxy} from '@/types'
import { switchButtonRailStyle } from '@/constants/theme'
import { useRouter } from 'vue-router'
import {userApi} from "@/net";
import {accessHandle} from "@/net/base.ts";

const isIPAddress = (hostname: string) => {
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/
  return ipRegex.test(hostname)
}

const splitDomain = (domain: string) => {
  const parts = domain.split('.')
  if (parts.length <= 2) {
    return {
      host: '@',
      rootDomain: domain
    }
  }
  return {
    host: parts[0],
    rootDomain: parts.slice(1).join('.')
  }
}

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('ini', ini)
hljs.registerLanguage('toml', toml)
hljs.registerLanguage('json', json)
hljs.registerLanguage('yaml', yaml)

const message = useMessage()
const loading = ref(false)
const proxies = ref<Proxy[]>([])
const viewMode = ref<'grid' | 'list'>('grid')
const searchText = ref('')
const nodeOptions = ref<{ label: string; value: number; hostname: string }[]>([])
const showModal = ref(false)
const selectedProxy = ref<Proxy | null>(null)
const showEditModal = ref(false)
const editFormRef = ref<FormInst | null>(null)
const editForm = ref({
  proxyId: 0,
  proxyName: '',
  localIp: '',
  localPort: 0,
  remotePort: 0,
  domain: '',
  location: '',
  accessKey: '',
  hostHeaderRewrite: '',
  headerXFromWhere: '',
  use_encryption: false,
  use_compression: false,
  proxy_protocol_version: '',
  proxyType: '',
  nodeId: 0
})
const router = useRouter()
const gettingFreePort = ref(false)
const showConfigModal = ref(false)
const configFormat = ref<'toml' | 'ini' | 'json' | 'yml'>('toml')
const tomlContent = ref('')
const iniContent = ref('')
const jsonContent = ref('')
const ymlContent = ref('')
const runArgs = ref('')
const token = ref('')
const domainTags = ref<string[]>([])

const formatTime = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

const rules: FormRules = {
  proxyName: {
    required: true,
    message: '请输入隧道名称',
    trigger: ['blur', 'input']
  },
  localIp: {
    required: true,
    message: '请输入本地地址',
    trigger: ['blur', 'input']
  },
  localPort: {
    required: true,
    type: 'number',
    message: '请输入本地端口',
    trigger: ['blur', 'input'],
    validator: (_rule: any, value: number) => {
      if (value < 1 || value > 65535) {
        return new Error('端口范围必须在 1-65535 之间')
      }
      return true
    }
  },
  remotePort: {
    required: true,
    message: '请输入远程端口',
    trigger: ['blur', 'input'],
    validator: (_rule: any, value: number) => {
      if (editForm.value.proxyType === 'http' || editForm.value.proxyType === 'https') {
        return true
      }
      if (value < 1 || value > 65535) {
        return new Error('端口范围必须在 1-65535 之间')
      }
      return true
    }
  },
  domain: {
    validator: (_rule: any, _value: string) => {
      if (editForm.value.proxyType === 'http' || editForm.value.proxyType === 'https') {
        if (!domainTags.value.length) {
          return new Error('请至少添加一个域名')
        }
      }
      return true
    },
    trigger: ['blur', 'change', 'input']
  }
}

// 过滤隧道列表
const filteredProxies = computed(() => {
  const search = searchText.value.toLowerCase()
  return proxies.value.filter(proxy =>
      proxy.proxyName.toLowerCase().includes(search) ||
      proxy.proxyType.toLowerCase().includes(search) ||
      (proxy.domain || '').toLowerCase().includes(search) ||
      getNodeLabel(proxy.nodeId).toLowerCase().includes(search)
  )
})

const handleRefresh = async () => {
  loading.value = true
  try {
    userApi.get("/proxy/list", accessHandle(), (data) => {
      if (data.code === 0) {
        proxies.value = data.data
      } else {
        message.error(data.message || '获取隧道列表失败')
      }
    }, (error) => {
      message.error(error.message || '获取隧道列表失败')
    }, (error) => {
      message.error(error.message || '获取隧道列表失败')
      loading.value = false
    })
  } catch (error: any) {
    message.error(error?.response?.data?.message || '获取隧道列表失败')
  } finally {
    loading.value = false
  }
}


// 获取节点列表
const fetchNodes = async () => {
  try {
    userApi.get("/proxy/node/list",  accessHandle(), (data) => {
      if (data.code === 0) {
        nodeOptions.value = (data.data || []).map((node: any) => ({
          label: node.name,
          value: node.nodeId,
          hostname: node.hostname
        }))
      } else {
        message.error('获取节点列表失败')
      }
    }, () => {
    })
  } catch (error: any) {
    message.error('获取节点列表失败')
  }
}

const getNodeLabel = (nodeId: number) => {
  const node = nodeOptions.value?.find(node => node.value === nodeId)
  return node ? `#${nodeId} - ${node.label}` : `#${nodeId}`
}

// 初始化数据
fetchNodes()
handleRefresh()

function renderIcon(icon: any) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const showToggleModal = ref(false)
const showKickModal = ref(false)
const proxyToOperate = ref<Proxy | null>(null)

const toggleModalTitle = computed(() => {
  if (!proxyToOperate.value) return ''
  return proxyToOperate.value.is_disabled ? '启用确认' : '禁用确认'
})

const toggleModalContent = computed(() => {
  if (!proxyToOperate.value) return ''
  return proxyToOperate.value.is_disabled ? '确认要启用此隧道吗？' : '确认要禁用此隧道吗？'
})

const handleToken = async () => {
  try {
    userApi.get("/user/info/token", accessHandle(), (data) => {
      if (data.code === 0) {
        token.value = data.data.token
      } else {
        message.error(data.message || '获取Token失败')
      }
    }, () => {
      message.error('获取Token失败')
    })
  } catch (error: any) {
    message.error('获取Token失败')
  }
}
handleToken()
const handleGenConfig = async (proxy: Proxy) => {
  selectedProxy.value = proxy
  showConfigModal.value = true
  runArgs.value = `./lyfrpc -t ${token.value} -p ${proxy.proxyId}`

  try {
    loading.value = true
    userApi.post("/proxy/config", {
      proxyId: proxy.proxyId,
      type: configFormat.value
    }, accessHandle(), (data) => {
      if (data.code === 0) {
        switch (configFormat.value) {
          case 'toml':
            tomlContent.value = data.data.config
            break
          case 'ini':
            iniContent.value = data.data.config
            break
          case 'json':
            jsonContent.value = data.data.config
            break
          case 'yml':
            ymlContent.value = data.data.config
            break
        }
      } else {
        message.error(data.message || '获取配置失败')
      }
    }, (error) => {
      message.error(error.message || '获取配置失败')
    }, () => {
      loading.value = false
})
  } catch (error: any) {
    message.error(error?.response?.data?.message || '获取配置失败')
  } finally {
    loading.value = false
  }
}

const dropdownOptions = (proxy: Proxy) => [
  {
    label: '查看详情',
    key: 'view',
    icon: renderIcon(InformationCircleOutline)
  },
  {
    label: '生成启动配置',
    key: 'genConfig',
    icon: renderIcon(DocumentOutline)
  },
  {
    type: 'divider',
    key: 'd1'
  },
  {
    label: '编辑',
    key: 'edit',
    icon: renderIcon(CreateOutline)
  },
  {
    type: 'divider',
    key: 'd2'
  },
  {
    label: proxy.isDisabled ? '启用' : '禁用',
    key: 'toggle',
    icon: renderIcon(PowerOutline)
  },
  {
    label: '删除',
    key: 'delete',
    icon: renderIcon(TrashOutline)
  }
]

const handleToggleClick = (proxy: Proxy) => {
  proxyToOperate.value = proxy
  showToggleModal.value = true
}

const handleToggleConfirm = async () => {
  if (!proxyToOperate.value) return
  try {
    loading.value = true
    userApi.post("/proxy/toggle", {
      proxyId: proxyToOperate.value.proxyId,
      isDisabled: !proxyToOperate.value.isDisabled
    }, accessHandle(), (data) => {
      if (data.code === 0) {
        message.success('操作成功')
        showToggleModal.value = false
        handleRefresh()
      } else {
        message.error(data.message || '操作失败')
      }
    }, (messageText) => {
      message.error(messageText || '操作失败')
    })
  } catch (error: any) {
    message.error(error?.response?.data?.message || '操作失败')
  } finally {
    loading.value = false
    showToggleModal.value = false
  }
}

const handleKickClick = (proxy: Proxy) => {
  proxyToOperate.value = proxy
  showKickModal.value = true
}

const handleEdit = (proxy: Proxy) => {
  editForm.value = {
    proxyId: proxy.proxyId,
    proxyName: proxy.proxyName,
    localIp: proxy.localIp,
    localPort: proxy.localPort,
    remotePort: proxy.remotePort,
    domain: proxy.domain || '',
    location: proxy.location || '',
    accessKey: '',
    hostHeaderRewrite: proxy.hostHeaderRewrite || '',
    headerXFromWhere: proxy.headerXFromWhere || '',
    use_encryption: proxy.useEncryption || false,
    use_compression: proxy.useCompression || false,
    proxy_protocol_version: proxy.proxyProtocolVersion || '',
    proxyType: proxy.proxyType,
    nodeId: proxy.nodeId
  }
  // 处理域名数组
  try {
    domainTags.value = proxy.domain ? JSON.parse(proxy.domain) : []
  } catch {
    domainTags.value = proxy.domain ? [proxy.domain] : []
  }
  showEditModal.value = true
}

const handleEditSubmit = () => {
  editFormRef.value?.validate(async (errors) => {
    if (!errors) {
      loading.value = true
      try {
        userApi.post("/proxy/update", editForm.value, accessHandle(), (data) => {
          if (data.code === 0) {
            message.success('更新隧道成功')
            showEditModal.value = false
            handleRefresh()
          } else {
            message.error(data.message || '更新隧道失败')
          }
        }, (messageText) => {
          message.error("更新隧道失败:" + messageText || '更新隧道失败')
        }, () => {
          loading.value = false
        })
      } catch (error: any) {
        message.error(error?.response?.data?.message || '更新隧道失败')
      } finally {
        loading.value = false
      }
    }
  })
}

// 监听协议类型变化
watch(() => editForm.value.proxyType, (newType) => {
  if (newType !== 'http' && newType !== 'https') {
    domainTags.value = []
    editForm.value.domain = ''
  }
})

const showDeleteModal = ref(false)
const proxyToDelete = ref<Proxy | null>(null)

const handleDeleteClick = (proxy: Proxy) => {
  proxyToDelete.value = proxy
  showDeleteModal.value = true
}

const handleDeleteConfirm = async () => {
  if (!proxyToDelete.value) return
  try {
    userApi.post("/proxy/delete", {
      proxyId: proxyToDelete.value.proxyId
    }, accessHandle(), (data) => {
      console.log(data)
      if (data.code === 0) {
        message.success('删除隧道成功')
        handleRefresh()
      } else {
        message.error('删除隧道失败')
      }
    }, (messageText) => {
      loading.value = false
      message.error(messageText || '删除隧道失败')
    })
    showDeleteModal.value = false
  } catch (error: any) {
    message.error(error?.response?.data?.message || '删除隧道失败')
  }
}

const handleSelect = (key: string, proxy: Proxy) => {
  switch (key) {
    case 'view':
      selectedProxy.value = proxy
      showModal.value = true
      break
    case 'genConfig':
      handleGenConfig(proxy)
      break
    case 'edit':
      handleEdit(proxy)
      break
    case 'kickProxy':
      handleKickClick(proxy)
      break
    case 'toggle':
      handleToggleClick(proxy)
      break
    case 'delete':
      handleDeleteClick(proxy)
      break
  }
}

const handleGetFreePortForEdit = async () => {
  try {
    gettingFreePort.value = true
    userApi.post("/proxy/freePort", {
      nodeId: editForm.value.nodeId,
      protocol: editForm.value.proxyType === 'udp' ? 'udp' : 'tcp'
      }, accessHandle(), (data) => {
      if (data.code === 0) {
        editForm.value.remotePort = data.data
      } else {
        message.error(data.message || '获取空闲端口失败')
      }
    })
  } catch (error: any) {
    message.error(error?.response?.data?.message || '获取空闲端口失败')
  } finally {
    gettingFreePort.value = false
  }
}

const handleCopyConfig = async () => {
  try {
    let content = ''
    // 使用响应式变量判断当前展开的面板
    if (expandedNames.value.includes('args')) {
      content = runArgs.value
    } else if (expandedNames.value.includes('config')) {
      switch (configFormat.value) {
        case 'toml':
          content = tomlContent.value
          break
        case 'ini':
          content = iniContent.value
          break
        case 'json':
          content = jsonContent.value
          break
        case 'yml':
          content = ymlContent.value
          break
      }
    }

    await navigator.clipboard.writeText(content)
    message.success('已复制到剪贴板')
  } catch (err) {
    message.error('复制失败')
  }
}

// 添加监听器以在切换配置格式时更新配置内容
watch(() => configFormat.value, async (newFormat) => {
  if (!selectedProxy.value || !showConfigModal.value) return

  try {
    loading.value = true
userApi.post("/proxy/config", {
    proxyId: selectedProxy.value.proxyId,
    type: newFormat
  }, accessHandle(), (data) => {

    if (data.code === 0) {
      switch (newFormat) {
        case 'toml':
          tomlContent.value = data.data.config
          break
        case 'ini':
          iniContent.value = data.data.config
          break
        case 'json':
          jsonContent.value = data.data.config
          break
        case 'yml':
          ymlContent.value = data.data.config
          break
      }
    } else {
      message.error(data.message || '获取配置失败')
    }
    }, (error) => {
      message.error(error || '获取配置失败')
    }, (error) => {
message.error('获取配置失败:' + error.message)
    })
  } catch (error: any) {
    message.error(error?.response?.data?.message || '获取配置失败')
  } finally {
    loading.value = false
  }
})

// 添加一个响应式变量来跟踪展开的面板
const expandedNames = ref(['args'])

// 添加一个监听器来处理折叠面板的互斥
const handleUpdateExpanded = (names: string[]) => {
  // 如果尝试展开多个面板，只保留最后一个
  if (names.length > 1) {
    expandedNames.value = [names[names.length - 1]]
  } else {
    expandedNames.value = names
  }
}

const openUrl = (protocol: string, domain: string) => {
  window.open(`${protocol}://${domain}`, '_blank')
}

const handleDomainsUpdate = (tags: string[]) => {
  domainTags.value = tags
  editForm.value.domain = JSON.stringify(tags)
}

const renderDomainTag = (tag: string) => {
  return h(
      NTag,
      {
        round: false,
        closable: true,
        style: 'cursor: pointer',
        onClose: () => {
          const index = domainTags.value.indexOf(tag)
          if (index !== -1) {
            const newTags = [...domainTags.value]
            newTags.splice(index, 1)
            handleDomainsUpdate(newTags)
          }
        },
        onDblclick: (e: { target: HTMLElement }) => {
          const tagEl = e.target as HTMLElement
          const input = document.createElement('input')
          input.style.width = '100px'
          input.value = tag
          input.onkeydown = (e) => {
            if (e.key === 'Enter') {
              const newValue = input.value.trim()
              if (newValue && newValue !== tag) {
                const index = domainTags.value.indexOf(tag)
                if (index !== -1) {
                  const newTags = [...domainTags.value]
                  newTags[index] = newValue
                  handleDomainsUpdate(newTags)
                }
              }
              input.remove()
            }
            if (e.key === 'Escape') {
              input.remove()
            }
          }
          input.onblur = () => {
            const newValue = input.value.trim()
            if (newValue && newValue !== tag) {
              const index = domainTags.value.indexOf(tag)
              if (index !== -1) {
                const newTags = [...domainTags.value]
                newTags[index] = newValue
                handleDomainsUpdate(newTags)
              }
            }
            input.remove()
          }
          tagEl.appendChild(input)
          input.focus()
        }
      },
      { default: () => tag }
  )
}

const columns = [
  {
    title: 'ID',
    key: 'proxyId',
    render(row) {
      return h(NTag, { type: 'info', size: 'medium' }, { default: () => `# ${row.proxyId}` })
    }
  },
  {
    title: '名称',
    key: 'proxyName',
    render(row) {
      return h('div', { style: 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;' }, row.proxyName)
    }
  },
  {
    title: '类型',
    key: 'proxyType',
    render(row) {
      return h('div', { style: 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;' }, row.proxyType.toUpperCase())
    }
  },
  {
    title: '远程端口',
    key: 'remotePort',
    render(row) {
      return h('div', { style: 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;' }, row.remotePort)
    }
  },
  {
    title: '节点',
    key: 'nodeId',
    render(row) {
      return h('div', { style: 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;' }, getNodeLabel(row.nodeId))
    }
  },
  {
    title: '状态',
    key: 'status',
    render(row) {
      return h(NSpace, { size: 4 }, {
        default: () => [
          h(NTag, {
            type: row.isOnline ? 'success' : 'error',
            size: 'small'
          }, { default: () => row.isOnline ? '在线' : '离线' }),
          row.isBanned && h(NTag, {
            type: 'error',
            size: 'small'
          }, { default: () => '已封禁' }),
          row.isDisabled && h(NTag, {
            type: 'warning',
            size: 'small'
          }, { default: () => '已禁用' })
        ].filter(Boolean)
      })
    }
  },
  {
    title: '操作',
    key: 'actions',
    render(row) {
      return h(NDropdown, {
        trigger: 'click',
        options: dropdownOptions(row),
        onSelect: (key: string) => handleSelect(key, row),
        placement: 'bottom'
      }, {
        default: () => h(NButton, {
          text: true,
          style: 'display: flex; align-items: center;'
        }, {
          icon: () => h(NIcon, null, {
            default: () => h(EllipsisHorizontalCircleOutline)
          })
        })
      })
    }
  }
]

const handleDownloadConfig = () => {
  let content = ''
  let fileName = ''
  let fileExt = ''

  switch (configFormat.value) {
    case 'toml':
      content = tomlContent.value
      fileExt = 'toml'
      break
    case 'ini':
      content = iniContent.value
      fileExt = 'ini'
      break
    case 'json':
      content = jsonContent.value
      fileExt = 'json'
      break
    case 'yml':
      content = ymlContent.value
      fileExt = 'yml'
      break
  }

  if (!content) {
    message.error('配置内容为空，无法下载')
    return
  }

  fileName = `config_${selectedProxy.value?.proxyId || 'config'}.${fileExt}`

  // 创建 Blob 对象
  const blob = new Blob([content], { type: 'text/plain' })

  // 创建下载链接
  const downloadLink = document.createElement('a')
  downloadLink.href = URL.createObjectURL(blob)
  downloadLink.download = fileName

  // 模拟点击下载
  document.body.appendChild(downloadLink)
  downloadLink.click()

  // 清理
  document.body.removeChild(downloadLink)
  URL.revokeObjectURL(downloadLink.href)

  message.success(`配置文件已下载: ${fileName}`)
}
</script>

<style lang="scss" scoped>
@use "../../../assets/styles/manageTunnel.scss";
</style>