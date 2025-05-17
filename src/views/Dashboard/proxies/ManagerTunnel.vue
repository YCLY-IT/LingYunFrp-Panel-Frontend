<template>
  <div class="tunnel-manager">
    <NCard class="header-card" title="管理隧道">
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
            <NButton 
              :type="viewMode === 'grid' ? 'primary' : 'default'" 
              @click="viewMode = 'grid'"
              class="view-btn"
            >
              <template #icon>
                <NIcon>
                  <GridOutline />
                </NIcon>
              </template>
              <span class="view-text">网格</span><span class="view-suffix">视图</span>
            </NButton>
            <NButton 
              :type="viewMode === 'list' ? 'primary' : 'default'" 
              @click="viewMode = 'list'"
              class="view-btn"
            >
              <template #icon>
                <NIcon>
                  <ListOutline />
                </NIcon>
              </template>
              <span class="view-text">列表</span><span class="view-suffix">视图</span>
            </NButton>
          </NButtonGroup>

          <NButton type="info" @click="handleRefresh" class="refresh-btn">
            <template #icon>
              <NIcon>
                <RefreshOutline />
              </NIcon>
            </template>
            刷新
          </NButton>
          
          <NButton type="primary" @click="createTunnel" class="create-btn">
            <template #icon>
              <NIcon>
                <AddOutline />
              </NIcon>
            </template>
            创建隧道
          </NButton>
        </div>
      </div>
    </NCard>

    <!-- 网格视图 -->
    <div v-if="viewMode === 'grid'" class="tunnel-grid">
      <template v-if="filteredProxies.length">
        <NCard v-for="proxy in filteredProxies" :key="proxy.proxyId" class="tunnel-card">
          <div class="tunnel-header">
            <div class="tunnel-title-area">
              <h3 class="tunnel-title">
                {{ proxy.proxyName }}
              </h3>
              <div class="status-tags">
                <NTag :type="proxy.isOnline ? 'success' : 'error'" size="small" round>
                  {{ proxy.isOnline ? '在线' : '离线' }}
                </NTag>
                <NTag v-if="proxy.isBanned" type="error" size="small" round style="margin-left: 4px">
                  已封禁
                </NTag>
                <NTag v-if="proxy.isDisabled" type="warning" size="small" round style="margin-left: 4px">
                  已禁用
                </NTag>
              </div>
            </div>
            <div class="tunnel-id">
              <NTag type="info" size="small"># {{ proxy.proxyId }}</NTag>
            </div>
          </div>
          
          <div class="tunnel-info">
            <div class="info-row">
              <div class="info-item">
                <div class="label">协议:</div>
                <div class="value protocol">{{ proxy.proxyType.toUpperCase() }}</div>
              </div>
              
              <div class="info-item node-item">
                <div class="label">节点:</div>
                <div class="value node-value">{{ getNodeLabel(proxy.nodeId).split(' - ')[1] }}</div>
              </div>
            </div>
            
            <div class="info-item domain-item">
              <div class="label">
                {{ proxy.proxyType === 'http' || proxy.proxyType === 'https' ? '绑定域名：' : '远程端口：' }}
              </div>
              <div class="value">
                <div v-if="proxy.proxyType === 'http' || proxy.proxyType === 'https'" class="domain-list">
                  <div v-for="domain in JSON.parse(proxy.domain || '[]')" :key="domain" class="domain">
                    <NTag type="info" size="small" style="cursor: pointer" @click="() => openUrl(proxy.proxyType, domain)">
                      {{ domain }}
                    </NTag>
                  </div>
                </div>
                <template v-else>{{ proxy.remotePort }}</template>
              </div>
            </div>
          </div>
          
          <div class="tunnel-actions">
            <NButton quaternary size="small" @click="() => handleSelect('view', proxy)" class="action-btn">
              <template #icon>
                <NIcon>
                  <InformationCircleOutline />
                </NIcon>
              </template>
              详情
            </NButton>
            
            <NButton quaternary size="small" @click="() => handleSelect('genConfig', proxy)" class="action-btn">
              <template #icon>
                <NIcon>
                  <DocumentOutline />
                </NIcon>
              </template>
              配置
            </NButton>
            
            <NButton quaternary size="small" @click="() => handleSelect('edit', proxy)" class="action-btn">
              <template #icon>
                <NIcon>
                  <CreateOutline />
                </NIcon>
              </template>
              编辑
            </NButton>
            
            <NButton 
              quaternary 
              size="small" 
              :type="proxy.isDisabled ? 'success' : 'warning'"
              @click="() => handleSelect('toggle', proxy)" 
              class="action-btn"
            >
              <template #icon>
                <NIcon>
                  <PowerOutline />
                </NIcon>
              </template>
              {{ proxy.isDisabled ? '启用' : '禁用' }}
            </NButton>
            
            <NButton quaternary size="small" type="error" @click="() => handleSelect('delete', proxy)" class="action-btn">
              <template #icon>
                <NIcon>
                  <TrashOutline />
                </NIcon>
              </template>
              删除
            </NButton>
          </div>
        </NCard>
      </template>
      <NEmpty v-else description="暂无隧道" class="no-data">
        <template #extra>
          <NButton type="primary" @click="createTunnel">
            <template #icon>
              <NIcon>
                <AddOutline />
              </NIcon>
            </template>
            创建隧道
          </NButton>
        </template>
      </NEmpty>
    </div>

    <!-- 列表视图 -->
    <div v-else class="tunnel-list">
      <NDataTable 
        v-if="filteredProxies.length" 
        :columns="columns" 
        :data="filteredProxies" 
        :pagination="{ pageSize: 10 }"
        :bordered="false"
        class="data-table"
      />
      <NEmpty v-else description="暂无隧道" class="no-data">
        <template #extra>
          <NButton type="primary" @click="createTunnel">
            <template #icon>
              <NIcon>
                <AddOutline />
              </NIcon>
            </template>
            创建隧道
          </NButton>
        </template>
      </NEmpty>
    </div>

    <!-- 远程地址信息弹窗 -->
    <NModal v-model:show="showModal" preset="card" title="隧道详细信息" style="width: 800px; max-width: 90vw" class="detail-modal">
      <template #header>
        <div class="modal-header">
          <h2>隧道详细信息</h2>
          <div v-if="selectedProxy" class="modal-status">
            <NTag :type="selectedProxy.isOnline ? 'success' : 'error'" size="small" round>
              {{ selectedProxy.isOnline ? '在线' : '离线' }}
            </NTag>
            <NTag v-if="selectedProxy.isBanned" type="error" size="small" round style="margin-left: 8px">
              已封禁
            </NTag>
            <NTag v-if="selectedProxy.isDisabled" type="warning" size="small" round style="margin-left: 8px">
              已禁用
            </NTag>
          </div>
        </div>
      </template>
      
      <div v-if="selectedProxy" class="modal-content" :class="{
        'proxy-detail-container': selectedProxy.proxyType === 'http' || selectedProxy.proxyType === 'https'
      }">
        <div class="proxy-detail-left">
          <div class="detail-section">
            <h3 class="section-title">基本信息</h3>
            <div class="detail-grid">
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
            </div>
          </div>
          
          <template v-if="selectedProxy.proxyType === 'http' || selectedProxy.proxyType === 'https'">
            <div class="detail-section">
              <h3 class="section-title">域名信息</h3>
              <div class="modal-info-item">
                <span class="label">绑定域名：</span>
                <div class="value domain-tags">
                  <NTag 
                    size="small" 
                    v-for="domain in JSON.parse(selectedProxy.domain || '[]')" 
                    :key="domain" 
                    type="info"
                    style="cursor: pointer; margin-right: 8px; margin-bottom: 8px" 
                    @click="() => openUrl(selectedProxy?.proxyType ?? 'http', domain ?? '')"
                  >
                    {{ domain }}
                  </NTag>
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="detail-section">
              <h3 class="section-title">连接信息</h3>
              <div class="modal-info-item">
                <span class="label">链接地址：</span>
                <span class="value connection-value">
                  {{nodeOptions.find(node => node.value === selectedProxy?.nodeId)?.hostname}}:{{
                    selectedProxy.remotePort
                  }}
                </span>
              </div>
            </div>
          </template>
        </div>
        
        <template v-if="selectedProxy.proxyType === 'http' || selectedProxy.proxyType === 'https'">
          <div class="proxy-detail-right">
            <div class="detail-section">
              <h3 class="section-title">域名解析配置</h3>
              <NAlert type="info" style="margin-bottom: 16px">添加以下信息至您的域名解析配置后，服务才会生效。</NAlert>
              <NTable size="small" :single-line="false" class="dns-table">
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
                  <td>{{ splitDomain(domain).rootDomain }}</td>
                  <td>{{ splitDomain(domain).host }}</td>
                  <td>
                    {{isIPAddress(nodeOptions.find(n => n.value === selectedProxy?.nodeId)?.hostname || '') ? 'A' : 'CNAME' }}
                  </td>
                  <td>
                    <NText type="primary">{{nodeOptions.find(n => n.value === selectedProxy?.nodeId)?.hostname}}</NText>
                  </td>
                </tr>
                </tbody>
              </NTable>
            </div>
          </div>
        </template>
      </div>
      
      <template #footer>
        <div class="modal-footer">
          <NButton @click="showModal = false">
            <template #icon>
              <RefreshOutline />
            </template>
            关闭</NButton>
          <NButton 
            v-if="selectedProxy" 
            type="info" 
            @click="() => selectedProxy && handleSelect('genConfig', selectedProxy)"
          >
            <template #icon>
              <NIcon>
                <DocumentOutline />
              </NIcon>
            </template>
            生成配置
          </NButton>
        </div>
      </template>
    </NModal>

    <!-- 删除确认弹窗 -->
    <NModal v-model:show="showDeleteModal" preset="dialog" title="是否删除此隧道？" style="width: 400px">
      <template #header>
        <div>删除确认</div>
      </template>
      <div class="delete-warning">
        <NIcon size="48" color="#f56c6c">
          <TrashOutline />
        </NIcon>
        <p>确定要删除此隧道吗？此操作不可恢复。</p>
      </div>
      <template #action>
        <NButton size="small" @click="showDeleteModal = false">取消</NButton>
        <NButton size="small" type="error" :loading="loading" @click="handleDeleteConfirm">删除</NButton>
      </template>
    </NModal>

    <!-- 编辑隧道弹窗 -->
    <NModal v-model:show="showEditModal" preset="card" title="编辑隧道" style="width: 800px; max-width: 90vw">
      <template #header>
        <div class="modal-header">
          <h2>编辑隧道</h2>
        </div>
      </template>
      
      <NForm 
        ref="editFormRef" 
        :model="editForm" 
        :rules="rules" 
        label-placement="left" 
        label-width="120"
        require-mark-placement="right-hanging" 
        size="medium" 
        class="edit-form"
      >
        <div class="form-section">
          <h3 class="section-title">基本设置</h3>
          <NFormItem label="隧道名称" path="proxyName">
            <NInput v-model:value="editForm.proxyName" placeholder="请输入隧道名称" />
          </NFormItem>
          <NFormItem label="本地地址" path="localIp">
            <NInput v-model:value="editForm.localIp" placeholder="请输入本地地址" />
          </NFormItem>
          <NFormItem label="本地端口" path="localPort">
            <NInputNumber v-model:value="editForm.localPort" :min="1" :max="65535" placeholder="请输入本地端口" />
          </NFormItem>
          <NFormItem v-if="editForm.proxyType !== 'http' && editForm.proxyType !== 'https'" label="远程端口" path="remotePort">
              <NInputNumber v-model:value="editForm.remotePort" :min="1" :max="65535" placeholder="请输入远程端口" />
              <NButton style="margin-left: 8px" :loading="gettingFreePort" @click="handleGetFreePortForEdit">
                获取空闲端口
              </NButton>
          </NFormItem>
          <NFormItem v-if="editForm.proxyType === 'http' || editForm.proxyType === 'https'" label="绑定域名" path="domain">
            <NDynamicTags v-model:value="domainTags" :render-tag="renderDomainTag" @update:value="handleDomainsUpdate" />
          </NFormItem>
        </div>

        <div class="form-section">
          <h3 class="section-title">高级配置</h3>
          <NText depth="3" class="advanced-notice">
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
            <div class="switch-group">
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
        </div>
      </NForm>
      
      <template #footer>
        <div class="modal-footer">
          <NButton @click="showEditModal = false">取消</NButton>
          <NButton style="margin-left: 8px;" type="primary" :loading="loading" @click="handleEditSubmit">保存更改</NButton>
        </div>
      </template>
    </NModal>

    <!-- 禁用/启用确认弹窗 -->
    <NModal v-model:show="showToggleModal" preset="dialog" style="width: 400px">
      <template #header>
        <div>{{ toggleModalTitle }}</div>
      </template>
      <div class="toggle-content">
        <NIcon size="48" :color="proxyToOperate?.isDisabled ? '#18a058' : '#f0a020'">
          <PowerOutline />
        </NIcon>
        <p>{{ toggleModalContent }}</p>
      </div>
      <template #action>
        <NButton size="small" @click="showToggleModal = false">取消</NButton>
        <NButton 
          size="small" 
          :type="proxyToOperate?.isDisabled ? 'success' : 'warning'" 
          :loading="loading" 
          @click="handleToggleConfirm"
        >
          确定
        </NButton>
      </template>
    </NModal>

    <!-- 启动参数和配置文件 Modal -->
    <NModal v-model:show="showConfigModal" preset="card" style="width: 800px; max-width: 90vw" class="config-dialog" title="启动参数和配置文件">
      <template #header>
        <div class="modal-header">
          <div v-if="selectedProxy" class="config-info">
            <NTag type="info" size="small">{{ selectedProxy.proxyType.toUpperCase() }}</NTag>
            <NTag type="default" size="small">ID: {{ selectedProxy.proxyId }}</NTag>
          </div>
        </div>
      </template>
      
      <div class="config-modal-container">
        <NCollapse v-model:expanded-names="expandedNames" :on-update:expanded-names="handleUpdateExpanded">
          <NCollapseItem title="启动参数" name="args" v-if="selectedProxy?.proxyType !== 'https'">
            <div class="code-container">
              <NScrollbar style="max-height: 200px; overflow: auto">
                <NCode :code="runArgs" language="yaml" :hljs="hljs" />
              </NScrollbar>
            </div>
            <div class="code-note">Windows 用户如果启动失败，请尝试把 <NCode>lyfrpc</NCode> 换成 <NCode>.\lyfrpc.exe</NCode>。</div>
          </NCollapseItem>
          
          <NCollapseItem title="配置文件" name="config">
            <NAlert type="error" class="config-alert" title="友情提示">
              此处是为专业用户准备的配置文件, 请不要在没有判断能力的情况下随意修改, 否则隧道可能无法正常启动。<br>
              请使用 "<NCode>./lyfrpc -c </NCode>配置文件 " 进行启动。
            </NAlert>
            
            <NAlert type="warning" class="config-alert" title="HTTPS 隧道配置修改提示" v-if="selectedProxy?.proxyType == 'https'">
              请修改相关 SSL 配置, 否则隧道无法正常启动。
            </NAlert>

            <NTabs
              v-model:value="configFormat"
              type="line"
              class="config-tabs"
            >
              <NTabPane name="toml" tab="Toml">
                <NSpin :show="loading && configFormat === 'toml'">
                  <div class="code-container">
                    <NScrollbar style="max-height: 500px; overflow: auto">
                      <NCode :code="tomlContent" language="toml" :hljs="hljs" />
                    </NScrollbar>
                  </div>
                </NSpin>
              </NTabPane>

              <NTabPane name="json" tab="Json">
                <NSpin :show="loading && configFormat === 'json'">
                  <div class="code-container">
                    <NScrollbar style="max-height: 500px; overflow: auto">
                      <NCode :code="jsonContent" language="json" :hljs="hljs" />
                    </NScrollbar>
                  </div>
                </NSpin>
              </NTabPane>

              <NTabPane name="yml" tab="Yaml">
                <NSpin :show="loading && configFormat === 'yml'">
                  <div class="code-container">
                    <NScrollbar style="max-height: 500px; overflow: auto">
                      <NCode :code="ymlContent" language="yaml" :hljs="hljs" />
                    </NScrollbar>
                  </div>
                </NSpin>
              </NTabPane>

              <NTabPane name="ini" tab="Ini">
                <NSpin :show="loading && configFormat === 'ini'">
                  <div class="code-container">
                    <NScrollbar style="max-height: 500px; overflow: auto">
                      <NCode :code="iniContent" language="ini" :hljs="hljs" />
                    </NScrollbar>
                  </div>
                </NSpin>
              </NTabPane>
            </NTabs>
          </NCollapseItem>
        </NCollapse>
      </div>
      
      <template #footer>
        <div class="modal-footer">
          <NButton @click="showConfigModal = false">
            <template #icon>
              <NIcon>
                <RefreshOutline />
              </NIcon>
            </template>
            关闭</NButton>
          <NButton 
            v-if="expandedNames.includes('config')" 
            secondary 
            type="info"
            @click="handleDownloadConfig"
          >
            <template #icon>
              <NIcon>
                <DownloadOutline />
              </NIcon>
            </template>
            下载配置
          </NButton>
          
          <NButton 
            type="primary" 
            @click="handleCopyConfig" 
            :disabled="expandedNames.length === 0"
          >
            <template #icon>
              <NIcon>
                <CopyOutline />
              </NIcon>
            </template>
            复制
          </NButton>
        </div>
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
import { 
  GridOutline, ListOutline, BuildOutline, RefreshOutline, SearchOutline, 
  InformationCircleOutline, CreateOutline, TrashOutline, PowerOutline, 
  AddOutline, CopyOutline, DocumentOutline, 
  DownloadOutline 
} from '@vicons/ionicons5'
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
        proxies.value = data.data
    }, (error) => {
      message.warning(error || '获取隧道列表失败')
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

const createTunnel = () => {
  router.push('/dashboard/proxy/create')
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


const showToggleModal = ref(false)
const showKickModal = ref(false)
const proxyToOperate = ref<Proxy | null>(null)

const toggleModalTitle = computed(() => {
  if (!proxyToOperate.value) return ''
  return proxyToOperate.value.isDisabled ? '启用确认' : '禁用确认'
})

const toggleModalContent = computed(() => {
  if (!proxyToOperate.value) return ''
  return proxyToOperate.value.isDisabled ? '确认要启用此隧道吗？' : '确认要禁用此隧道吗？'
})

const handleToken = async () => {
  try {
    token.value = localStorage.getItem('token') || ''
    if (!token.value) {
      message.error('未获取到Token')
      return
    }
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
      message.error(error || '获取配置失败')
    }, () => {
      loading.value = false
})
  } catch (error: any) {
    message.error(error?.response?.data?.message || '获取配置失败')
  } finally {
    loading.value = false
  }
}

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
        message.error(error|| '更新隧道失败')
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
            size: 'small',
            round: true
          }, { default: () => row.isOnline ? '在线' : '离线' }),
          row.isBanned && h(NTag, {
            type: 'error',
            size: 'small',
            round: true
          }, { default: () => '已封禁' }),
          row.isDisabled && h(NTag, {
            type: 'warning',
            size: 'small',
            round: true
          }, { default: () => '已禁用' })
        ].filter(Boolean)
      })
    }
  },
  {
    title: '操作',
    key: 'actions',
    render(row) {
      return h(NSpace, { size: 'small' }, {
        default: () => [
          h(NButton, {
            quaternary: true,
            size: 'small',
            onClick: () => handleSelect('view', row)
          }, { default: () => '详情' }),
          h(NButton, {
            quaternary: true,
            size: 'small',
            onClick: () => handleSelect('edit', row)
          }, { default: () => '编辑' }),
          h(NButton, {
            quaternary: true,
            size: 'small',
            type: row.isDisabled ? 'success' : 'warning',
            onClick: () => handleSelect('toggle', row)
          }, { default: () => row.isDisabled ? '启用' : '禁用' })
        ]
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
.tunnel-manager {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  
  .header-card {
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    margin-bottom: 24px;
    
    
    .toolbar {
      padding: 10px;
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: center;
      
      .search-box {
        flex: 1;
        min-width: 200px;
      }
      
      .toolbar-right {
        display: flex;
        gap: 12px;
        align-items: center;
        flex-wrap: wrap;
        
        .view-btn {
          min-width: 80px;
        }
        
        .refresh-btn, .create-btn {
          white-space: nowrap;
        }
      }
    }
  }
  
  .tunnel-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
    margin-bottom: 24px;
    
    .tunnel-card {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      padding: 1px;
      transition: all 0.3s ease;
      
      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }
      
      .tunnel-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 16px;
        
        .tunnel-title-area {
          flex: 1;
          
          .tunnel-title {
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 8px 0;
            color: #00ffd5;
          }
          
          .status-tags {
            display: flex;
            gap: 8px;
          }
        }
        
        .tunnel-id {
          margin-left: 12px;
        }
      }
      
      .tunnel-info {
        margin-bottom: 20px;
        
        .info-row {
          display: flex;
          gap: 16px;
          margin-bottom: 12px;
        }
        
        .info-item {
          margin-bottom: 12px;
          
          &.node-item {
            flex: 1;
          }
          
          .label {
            font-size: 14px;
            margin-bottom: 4px;
          }
          
          .value {
            font-size: 14px;
            color: gold;
            
            &.protocol {
              font-weight: 500;
              color: #1890ff;
            }
            
            &.node-value {
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
          }
        }
        
        .domain-item {
          .domain-list {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 4px;
          }
        }
      }
      
      .tunnel-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        
        .action-btn {
          flex: 1;
          min-width: 80px;
          justify-content: center;
        }
      }
    }
  }

  .no-data {
    padding: 40px 0;
    text-align: center;
  }
  
  // Modal styles
  .detail-modal {
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      h2 {
        margin: 0;
        font-size: 20px;
      }
      
      .modal-status {
        display: flex;
        gap: 8px;
      }
    }
    
    .modal-content {
      padding: 16px 0;
      
      .detail-section {
        margin-bottom: 24px;
        
        .section-title {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 16px 0;
          color: #333;
          padding-bottom: 8px;
          border-bottom: 1px solid #eee;
        }
        
        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 16px;
        }
      }
      
      .modal-info-item {
        margin-bottom: 12px;
        
        .label {
          font-size: 14px;
          color: #666;
          margin-right: 8px;
        }
        
        .value {
          font-size: 14px;
          color: #333;
          
          &.connection-value {
            font-family: monospace;
            padding: 2px 6px;
            border-radius: 4px;
          }
        }
        
        .domain-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 8px;
        }
      }
      
      .dns-table {
        :deep(th) {
          background-color: #f5f7fa;
          font-weight: 600;
        }
        
        :deep(td) {
          word-break: break-all;
          overflow-wrap: break-word;
        }
      }
    }
    
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
  }
  
  .delete-warning, .toggle-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 16px 0;
    
    p {
      text-align: center;
      margin: 0;
    }
  }
  
  .edit-form {
    .form-section {
      margin-bottom: 24px;
      
      .section-title {
        font-size: 16px;
        font-weight: 600;
        margin: 0 0 16px 0;
        color: #333;
        padding-bottom: 8px;
        border-bottom: 1px solid #eee;
      }
      
      .advanced-notice {
        display: block;
        margin-bottom: 16px;
      }
    }
    
    .port-input-group {
      display: flex;
      gap: 12px;
    }
    
    .switch-group {
      display: flex;
      gap: 24px;
    }
  }
  
  .config-dialog {
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      h2 {
        margin: 0;
        font-size: 20px;
      }
      
      .config-info {
        display: flex;
        gap: 8px;
      }
    }
    
    .config-modal-container {
      margin: 16px 0;
      
      .code-container {
        border: 1px solid #eee;
        border-radius: 6px;
        margin-bottom: 12px;
      }
      
      .code-note {
        font-size: 14px;
        color: #666;
        margin-top: 8px;
      }
      
      .config-alert {
        margin-bottom: 16px;
      }
      
      .config-tabs {
        margin-top: 20px;
      }
    }
  }
  
  @media (max-width: 768px) {
    .header-card {
      .toolbar {
        flex-direction: column;
        align-items: stretch;
        
        .toolbar-right {
          justify-content: space-between;
        }
      }
    }
    
    .tunnel-grid {
      grid-template-columns: 1fr;
    }
    
    .proxy-detail-container {
      flex-direction: column;
    }
  }
  
  @media (max-width: 480px) {
    .view-suffix {
      display: none;
    }
    
    .tunnel-actions {
      flex-direction: column;
      
      .action-btn {
        width: 100%;
      }
    }
  }
}
</style>