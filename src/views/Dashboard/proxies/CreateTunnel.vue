<template>
  <div class="content-grid">
    <!-- 搜索和区域筛选 -->
    <NCard title="筛选选项" class="filter-card">
      <NSpace vertical size="medium">
        <NInput
          style="margin-top: 10px"
          v-model:value="searchQuery"
          placeholder="搜索节点..."
          clearable
        >
          <template #prefix>
            <NIcon>
              <SearchOutline />
            </NIcon>
          </template>
        </NInput>

        <div class="filter-row" style="margin-top: 5px">
          <div class="group-filter">
            <NText>用户组筛选：</NText>
            <NSelect
              class="group-select"
              style="width: 300px"
              v-model:value="selectedGroup"
              :options="[{ label: '全部', value: 'all' }, ...groupList]"
              clearable
              placeholder="请选择用户组"
            />
          </div>
          <div class="protocol-filter">
            <NText>协议筛选：</NText>
            <NSelect
              class="protocol-select"
              style="width: 100%"
              v-model:value="selectedProtocols"
              :options="protocolOptions"
              multiple
              clearable
              placeholder="请选择协议"
            />
          </div>
        </div>
      </NSpace>
    </NCard>

    <!-- 节点选择卡片 - 修改为折叠篮按地区分组 -->
    <NCard title="选择节点" class="node-card">
      <NSpin :show="nodeLoading" tip="节点加载中...">
        <NSpace vertical>
          <NCollapse v-model:expanded-names="expandedRegion">
            <NCollapseItem title="中国大陆" name="cn">
              <NGrid
                x-gap="8"
                y-gap="8"
                cols="3"
                responsive="screen"
                style="padding-top: 14px"
              >
                <NGridItem
                  v-for="node in filteredNodes.filter(
                    (n) => n.location === 'cn',
                  )"
                  :key="node.value"
                >
                  <NCard
                    hoverable
                    @click="handleNodeSelect(node)"
                    :class="[
                      {
                        'selected-node': selectedNodeId === node.value,
                        'node-offline': !node.isOnline,
                      },
                    ]"
                    class="node-item"
                  >
                    <div class="node-header">
                      <div class="node-title">
                        <NTag type="info" size="small"># {{ node.id }}</NTag>
                        <NTooltip trigger="hover">
                          <template #trigger>
                            <NText
                              style="
                                white-space: nowrap;
                                overflow: hidden;
                                text-overflow: ellipsis;
                                margin-left: -3px;
                                margin-right: 4px;
                                flex: 1;
                                min-width: 0;
                                cursor: default;
                              "
                              >{{ node.name }}</NText
                            >
                          </template>
                          {{ node.name }}
                        </NTooltip>
                        <NTag
                          :type="getLoadStatusType(node.loadStatus)"
                          size="small"
                          strong
                          round
                        >
                          {{ getLoadStatusText(node.loadStatus) }}
                        </NTag>
                      </div>
                      <!-- <div class="node-tags">
                        <NTag
                          v-if="supportsUdp(node)"
                          type="success"
                          size="small"
                          >UDP</NTag
                        >
                        <NTag
                          v-if="supportsHttp(node) && supportsHttps(node)"
                          type="success"
                          size="small"
                          >HTTP(S)</NTag
                        >
                        <NTag
                          v-else-if="supportsHttp(node)"
                          type="success"
                          size="small"
                          >HTTP</NTag
                        >
                        <NTag
                          v-else-if="supportsHttps(node)"
                          type="success"
                          size="small"
                          >HTTPS</NTag
                        >
                      </div> -->
                    </div>
                    <NText depth="3" style="font-size: 13px; margin: 6px 0">{{
                      node.description
                    }}</NText>
                    <NSpace vertical style="margin-top: 4px">
                      <div class="info-item">
                        <NSpace wrap>
                          <NTag
                            v-for="group in node.allowGroups.filter(
                              (g) =>
                                !['admin', 'proxies', 'traffic'].includes(
                                  g.name.trim().toLowerCase(),
                                ),
                            )"
                            :key="group.name"
                            size="small"
                            type="info"
                          >
                            {{ group.friendlyName }}
                          </NTag>
                        </NSpace>
                      </div>
                      <div class="info-item" style="margin-top: -1px">
                        <NSpace wrap>
                          <NTag
                            v-if="supportsTcp(node)"
                            type="success"
                            size="small"
                            >TCP</NTag
                          >
                          <NTag
                            v-if="supportsUdp(node)"
                            type="success"
                            size="small"
                            >UDP</NTag
                          >
                          <NTag
                            v-if="supportsHttp(node) && supportsHttps(node)"
                            type="success"
                            size="small"
                            >HTTP(S)</NTag
                          >
                          <NTag
                            v-else-if="supportsHttp(node)"
                            type="success"
                            size="small"
                            >HTTP</NTag
                          >
                          <NTag
                            v-else-if="supportsHttps(node)"
                            type="success"
                            size="small"
                            >HTTPS</NTag
                          >
                          <NTag
                            v-if="supportsStcp(node)"
                            type="success"
                            size="small"
                            >STCP</NTag
                          >
                          <NTag
                            v-if="supportsXtcp(node)"
                            type="success"
                            size="small"
                            >XTCP</NTag
                          >
                        </NSpace>
                      </div>
                      <div class="info-item" style="margin-top: -1px">
                        <NSpace wrap>
                          <NTag type="warning" size="small">
                            {{ node.portRange.min }} - {{ node.portRange.max }}
                          </NTag>
                          <NTag type="info" size="small">
                            {{ node.bandWidth }} Mbps
                          </NTag>
                          <NTag
                            v-if="node.needRealname"
                            type="info"
                            size="small"
                          >
                            实名
                          </NTag>
                        </NSpace>
                      </div>
                    </NSpace>
                  </NCard>
                </NGridItem>
              </NGrid>
              <div
                v-if="
                  filteredNodes.filter((n) => n.location === 'cn').length === 0
                "
                class="no-results"
              >
                <NEmpty description="没有找到符合条件的节点" />
              </div>
            </NCollapseItem>
            <NCollapseItem title="中国港澳台" name="cn-out">
              <NGrid
                x-gap="8"
                y-gap="8"
                cols="3"
                responsive="screen"
                style="padding-top: 14px"
              >
                <NGridItem
                  v-for="node in filteredNodes.filter(
                    (n) => n.location === 'cn-out',
                  )"
                  :key="node.value"
                >
                  <NCard
                    hoverable
                    @click="handleNodeSelect(node)"
                    :class="[
                      {
                        'selected-node': selectedNodeId === node.value,
                        'node-offline': !node.isOnline,
                      },
                    ]"
                    class="node-item"
                  >
                    <div class="node-header">
                      <div class="node-title">
                        <NTag type="info" size="small"># {{ node.id }}</NTag>
                        <NTooltip trigger="hover">
                          <template #trigger>
                            <NText
                              style="
                                white-space: nowrap;
                                overflow: hidden;
                                text-overflow: ellipsis;
                                margin-left: -3px;
                                margin-right: 4px;
                                flex: 1;
                                min-width: 0;
                                cursor: default;
                              "
                              >{{ node.name }}</NText
                            >
                          </template>
                          {{ node.name }}
                        </NTooltip>
                        <NTag
                          :type="getLoadStatusType(node.loadStatus)"
                          size="small"
                          strong
                          round
                        >
                          {{ getLoadStatusText(node.loadStatus) }}
                        </NTag>
                      </div>
                      <!-- <div class="node-tags">
                        <NTag
                          v-if="supportsUdp(node)"
                          type="success"
                          size="small"
                          >UDP</NTag
                        >
                        <NTag
                          v-if="supportsHttp(node) && supportsHttps(node)"
                          type="success"
                          size="small"
                          >HTTP(S)</NTag
                        >
                        <NTag
                          v-else-if="supportsHttp(node)"
                          type="success"
                          size="small"
                          >HTTP</NTag
                        >
                        <NTag
                          v-else-if="supportsHttps(node)"
                          type="success"
                          size="small"
                          >HTTPS</NTag
                        >
                        <NTag
                          v-if="supportsStcp(node)"
                          type="success"
                          size="small"
                          >STCP</NTag
                        >
                        <NTag
                          v-if="supportsXtcp(node)"
                          type="success"
                          size="small"
                          >XTCP</NTag
                        >
                      </div> -->
                    </div>
                    <NText depth="3" style="font-size: 13px; margin: 6px 0">{{
                      node.description
                    }}</NText>
                    <NSpace vertical style="margin-top: 4px">
                      <div class="info-item">
                        <NSpace wrap>
                          <NTag
                            v-for="group in node.allowGroups.filter(
                              (g) =>
                                !['admin', 'proxies', 'traffic'].includes(
                                  g.name.trim().toLowerCase(),
                                ),
                            )"
                            :key="group.name"
                            size="small"
                            type="info"
                          >
                            {{ group.friendlyName }}
                          </NTag>
                        </NSpace>
                      </div>
                      <div class="info-item" style="margin-top: -1px">
                        <NSpace wrap>
                          <NTag
                            v-if="supportsTcp(node)"
                            type="success"
                            size="small"
                            >TCP</NTag
                          >
                          <NTag
                            v-if="supportsUdp(node)"
                            type="success"
                            size="small"
                            >UDP</NTag
                          >
                          <NTag
                            v-if="supportsHttp(node) && supportsHttps(node)"
                            type="success"
                            size="small"
                            >HTTP(S)</NTag
                          >
                          <NTag
                            v-else-if="supportsHttp(node)"
                            type="success"
                            size="small"
                            >HTTP</NTag
                          >
                          <NTag
                            v-else-if="supportsHttps(node)"
                            type="success"
                            size="small"
                            >HTTPS</NTag
                          >
                          <NTag
                            v-if="supportsStcp(node)"
                            type="success"
                            size="small"
                            >STCP</NTag
                          >
                          <NTag
                            v-if="supportsXtcp(node)"
                            type="success"
                            size="small"
                            >XTCP</NTag
                          >
                        </NSpace>
                      </div>
                      <div class="info-item" style="margin-top: -1px">
                        <NSpace wrap>
                          <NTag type="warning" size="small">
                            {{ node.portRange.min }} - {{ node.portRange.max }}
                          </NTag>
                          <NTag type="info" size="small">
                            {{ node.bandWidth }} Mbps
                          </NTag>
                          <NTag
                            v-if="node.needRealname"
                            type="info"
                            size="small"
                          >
                            实名
                          </NTag>
                        </NSpace>
                      </div>
                    </NSpace>
                  </NCard>
                </NGridItem>
              </NGrid>
              <div
                v-if="
                  filteredNodes.filter((n) => n.location === 'cn-out')
                    .length === 0
                "
                class="no-results"
              >
                <NEmpty description="没有找到符合条件的节点" />
              </div>
            </NCollapseItem>
            <NCollapseItem title="海外地区" name="out">
              <NGrid
                x-gap="8"
                y-gap="8"
                cols="3"
                responsive="screen"
                style="padding-top: 14px"
              >
                <NGridItem
                  v-for="node in filteredNodes.filter(
                    (n) => n.location === 'out',
                  )"
                  :key="node.value"
                >
                  <NCard
                    hoverable
                    @click="handleNodeSelect(node)"
                    :class="[
                      {
                        'selected-node': selectedNodeId === node.value,
                        'node-offline': !node.isOnline,
                      },
                    ]"
                    class="node-item"
                  >
                    <div class="node-header">
                      <div class="node-title">
                        <NTag type="info" size="small"># {{ node.id }}</NTag>
                        <NTooltip trigger="hover">
                          <template #trigger>
                            <NText
                              style="
                                white-space: nowrap;
                                overflow: hidden;
                                text-overflow: ellipsis;
                                margin-left: -3px;
                                margin-right: 4px;
                                flex: 1;
                                min-width: 0;
                                cursor: default;
                              "
                              >{{ node.name }}</NText
                            >
                          </template>
                          {{ node.name }}
                        </NTooltip>
                        <NTag
                          :type="getLoadStatusType(node.loadStatus)"
                          size="small"
                          strong
                          round
                        >
                          {{ getLoadStatusText(node.loadStatus) }}
                        </NTag>
                      </div>
                      <!-- <div class="node-tags">
                        <NTag
                          v-if="supportsUdp(node)"
                          type="success"
                          size="small"
                          >UDP</NTag
                        >
                        <NTag
                          v-if="supportsHttp(node) && supportsHttps(node)"
                          type="success"
                          size="small"
                          >HTTP(S)</NTag
                        >
                        <NTag
                          v-else-if="supportsHttp(node)"
                          type="success"
                          size="small"
                          >HTTP</NTag
                        >
                        <NTag
                          v-else-if="supportsHttps(node)"
                          type="success"
                          size="small"
                          >HTTPS</NTag
                        >
                        <NTag
                          v-if="supportsStcp(node)"
                          type="success"
                          size="small"
                          >STCP</NTag
                        >
                        <NTag
                          v-if="supportsXtcp(node)"
                          type="success"
                          size="small"
                          >XTCP</NTag
                        >
                      </div> -->
                    </div>
                    <NText depth="3" style="font-size: 13px; margin: 6px 0">{{
                      node.description
                    }}</NText>
                    <NSpace vertical style="margin-top: 4px">
                      <div class="info-item">
                        <NSpace wrap>
                          <NTag
                            v-for="group in node.allowGroups.filter(
                              (g) =>
                                !['admin', 'proxies', 'traffic'].includes(
                                  g.name.trim().toLowerCase(),
                                ),
                            )"
                            :key="group.name"
                            size="small"
                            type="info"
                          >
                            {{ group.friendlyName }}
                          </NTag>
                        </NSpace>
                      </div>
                      <div class="info-item" style="margin-top: -1px">
                        <NSpace wrap>
                          <NTag
                            v-if="supportsTcp(node)"
                            type="success"
                            size="small"
                            >TCP</NTag
                          >
                          <NTag
                            v-if="supportsUdp(node)"
                            type="success"
                            size="small"
                            >UDP</NTag
                          >
                          <NTag
                            v-if="supportsHttp(node) && supportsHttps(node)"
                            type="success"
                            size="small"
                            >HTTP(S)</NTag
                          >
                          <NTag
                            v-else-if="supportsHttp(node)"
                            type="success"
                            size="small"
                            >HTTP</NTag
                          >
                          <NTag
                            v-else-if="supportsHttps(node)"
                            type="success"
                            size="small"
                            >HTTPS</NTag
                          >
                          <NTag
                            v-if="supportsStcp(node)"
                            type="success"
                            size="small"
                            >STCP</NTag
                          >
                          <NTag
                            v-if="supportsXtcp(node)"
                            type="success"
                            size="small"
                            >XTCP</NTag
                          >
                        </NSpace>
                      </div>
                      <div class="info-item" style="margin-top: -1px">
                        <NSpace wrap>
                          <NTag type="warning" size="small">
                            {{ node.portRange.min }} - {{ node.portRange.max }}
                          </NTag>
                          <NTag type="info" size="small">
                            {{ node.bandWidth }} Mbps
                          </NTag>
                          <NTag
                            v-if="node.needRealname"
                            type="info"
                            size="small"
                          >
                            实名
                          </NTag>
                        </NSpace>
                      </div>
                    </NSpace>
                  </NCard>
                </NGridItem>
              </NGrid>
              <div
                v-if="
                  filteredNodes.filter((n) => n.location === 'out').length === 0
                "
                class="no-results"
              >
                <NEmpty description="没有找到符合条件的节点" />
              </div>
            </NCollapseItem>
          </NCollapse>
        </NSpace>
      </NSpin>
    </NCard>

    <!-- 隧道配置弹窗 -->
    <NModal
      v-model:show="showConfigModal"
      preset="card"
      title="隧道配置"
      style="width: 650px"
      :bordered="false"
      :segmented="{
        content: true,
        footer: 'soft',
      }"
    >
      <NForm
        ref="formRef"
        :model="formValue"
        :rules="rules"
        label-placement="left"
        label-width="150"
        require-mark-placement="right-hanging"
      >
        <NCollapse
          v-model:expanded-names="expandedAdvanced"
          :on-update:expanded-names="handleCreateFormCollapseUpdate"
        >
          <NCollapseItem name="basic" title="基本设置">
            <NFormItem label="隧道名称" path="name">
              <NInput
                v-model:value="formValue.name"
                placeholder="请输入隧道名称"
              />
            </NFormItem>

            <NFormItem label="本地地址" path="localAddr">
              <NInput
                v-model:value="formValue.localAddr"
                placeholder="请输入本地地址"
              />
            </NFormItem>

            <NFormItem label="本地端口" path="localPort">
              <NInputNumber
                v-model:value="formValue.localPort"
                :min="1"
                :max="65535"
                placeholder="请输入本地端口"
              />
            </NFormItem>

            <NFormItem label="协议类型" path="type">
              <NSelect
                v-model:value="formValue.type"
                :options="allowedProxyTypeOptions"
                placeholder="请选择协议类型"
              />
            </NFormItem>

            <NFormItem
              v-if="['stcp', 'xtcp'].includes(formValue.type)"
              label="访问密钥"
              path="accessKey"
            >
              <NInput
                v-model:value="formValue.accessKey"
                placeholder="请输入访问密钥"
              />
            </NFormItem>

            <NFormItem
              v-if="formValue.type === 'http' || formValue.type === 'https'"
              label="绑定域名"
              path="domain"
            >
              <NDynamicTags
                v-model:value="domainTags"
                :render-tag="renderDomainTag"
              />
            </NFormItem>

            <NFormItem
              v-if="['tcp', 'udp'].includes(formValue.type)"
              label="远程端口"
              path="remotePort"
            >
              <NSpace>
                <NInputNumber
                  v-model:value="formValue.remotePort"
                  :min="selectedNode?.portRange?.min || 1"
                  :max="selectedNode?.portRange?.max || 65535"
                  placeholder="请输入远程端口"
                />
                <NButton
                  size="medium"
                  :loading="gettingFreePort"
                  @click="handleGetFreePort"
                >
                  获取随机端口
                </NButton>
              </NSpace>
            </NFormItem>
          </NCollapseItem>

          <NCollapseItem title="高级配置" name="advanced">
            <template #header-extra>
              <NText depth="3" style="font-size: 12px; margin-left: 8px">
                仅推荐技术用户使用
              </NText>
            </template>

            <NFormItem label="Proxy Protocol" path="proxyProtocolVersion">
              <NSelect
                v-model:value="formValue.proxyProtocolVersion"
                :options="[
                  { label: '不启用', value: '' },
                  { label: 'v1', value: 'v1' },
                  { label: 'v2', value: 'v2' },
                ]"
                placeholder="Proxy Protocol Version"
              />
            </NFormItem>

            <NFormItem label="每个IP最大下载速率" path="ipLimitIn">
              <div class="speed-input-group">
                <NInputNumber
                  v-model:value="formValue.ipLimitIn"
                  :min="0"
                  placeholder="请输入最大下载速率"
                  style="flex: 1"
                />
                <NSelect
                  v-model:value="formValue.ipLimitInUnit"
                  :options="speedUnitOptions"
                  style="width: 100px"
                />
              </div>
            </NFormItem>
            <NFormItem label="每个IP最大上传速率" path="ipLimitOut">
              <div class="speed-input-group">
                <NInputNumber
                  v-model:value="formValue.ipLimitOut"
                  :min="0"
                  placeholder="请输入最大上传速率"
                  style="flex: 1"
                />
                <NSelect
                  v-model:value="formValue.ipLimitOutUnit"
                  :options="speedUnitOptions"
                  style="width: 100px"
                />
              </div>
            </NFormItem>
            <NFormItem label="其他选项">
              <div style="display: flex; gap: 16px">
                <NSwitch
                  v-model:value="formValue.useEncryption"
                  :rail-style="switchButtonRailStyle"
                >
                  <template #checked>启用加密</template>
                  <template #unchecked>禁用加密</template>
                </NSwitch>
                <NSwitch
                  v-model:value="formValue.useCompression"
                  :rail-style="switchButtonRailStyle"
                >
                  <template #checked>启用压缩</template>
                  <template #unchecked>禁用压缩</template>
                </NSwitch>
              </div>
            </NFormItem>
          </NCollapseItem>
        </NCollapse>
      </NForm>
      <template #footer>
        <div style="display: flex; justify-content: flex-end">
          <NButton @click="closeModal('config')">取消</NButton>
          <NButton
            type="primary"
            :loading="loading"
            @click="showCreateModal"
            style="margin-left: 12px"
          >
            <template #icon>
              <NIcon>
                <CloudUploadOutline />
              </NIcon>
            </template>
            创建隧道
          </NButton>
        </div>
      </template>
    </NModal>

    <!-- 创建隧道确认弹窗 -->
    <NModal
      v-model:show="showCreateConfirmModal"
      preset="dialog"
      title="确认创建隧道"
      :show-icon="false"
      style="width: 500px"
    >
      <div>
        <p>您即将创建以下隧道配置：</p>
        <div class="tunnel-confirm-details">
          <div class="confirm-item">
            <span class="confirm-label">节点：</span>
            <span>{{ selectedNode?.name || '未选择' }}</span>
          </div>
          <div class="confirm-item">
            <span class="confirm-label">隧道名称：</span>
            <span>{{ formValue.name }}</span>
          </div>
          <div class="confirm-item">
            <span class="confirm-label">本地地址：</span>
            <span>{{ formValue.localAddr }}:{{ formValue.localPort }}</span>
          </div>
          <div class="confirm-item">
            <span class="confirm-label">协议类型：</span>
            <span>{{ formValue.type.toUpperCase() }}</span>
          </div>
          <div
            v-if="formValue.type === 'http' || formValue.type === 'https'"
            class="confirm-item"
          >
            <span class="confirm-label">绑定域名：</span>
            <span>{{ domainTags.join(', ') }}</span>
          </div>
          <div
            v-if="['tcp', 'udp'].includes(formValue.type)"
            class="confirm-item"
          >
            <span class="confirm-label">远程端口：</span>
            <span>{{ formValue.remotePort }}</span>
          </div>
        </div>
        <p class="confirm-warning">
          请确认以上信息无误，点击确认后将创建隧道。
        </p>
      </div>
      <template #action>
        <NButton size="medium" @click="closeModal('createConfirm')"
          >取消</NButton
        >
        <NButton
          size="medium"
          type="primary"
          :loading="loading"
          @click="handleCreate"
          >确认创建</NButton
        >
      </template>
    </NModal>
  </div>
</template>

<script setup lang="ts">
import { ref, h, computed, onMounted, watch, nextTick } from 'vue'
import {
  NCard,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NSelect,
  NButton,
  NIcon,
  useMessage,
  type FormRules,
  type FormInst,
  NSwitch,
  NTag,
  NSpace,
  NText,
  NGrid,
  NGridItem,
  NDynamicTags,
  NModal,
  NEmpty,
  NSpin,
  NCollapse,
  NCollapseItem,
  NTooltip,
} from 'naive-ui'
import { CloudUploadOutline, SearchOutline } from '@vicons/ionicons5'
import { switchButtonRailStyle } from '@/constants/theme.ts'
import { userApi } from '@/net'
import { CreateTunnelParams } from '@/net/proxies/type'

const message = useMessage()
const formRef = ref<FormInst | null>(null)
const loading = ref(false)
const nodeLoading = ref(false)

// ========== 弹窗互斥逻辑 ========== //
const modalStack = ref<string[]>([])

function setModalVisible(name: string, visible: boolean) {
  if (name === 'config') showConfigModal.value = visible
  if (name === 'createConfirm') showCreateConfirmModal.value = visible
}

function getCurrentOpenModal(): string | null {
  if (showConfigModal.value) return 'config'
  if (showCreateConfirmModal.value) return 'createConfirm'
  return null
}

function openModal(modalName: string) {
  const currentModal = getCurrentOpenModal()
  if (currentModal && currentModal !== modalName) {
    modalStack.value.push(currentModal)
    setModalVisible(currentModal, false)
  }
  setModalVisible(modalName, true)
}

function closeModal(modalName: string) {
  setModalVisible(modalName, false)
  nextTick(() => {
    if (modalStack.value.length > 0) {
      const prevModal = modalStack.value.pop()
      if (prevModal) setModalVisible(prevModal, true)
    }
  })
}
// ========== 弹窗互斥逻辑 END ========== //

// 新增搜索和区域筛选
const searchQuery = ref('')
// 删除区域筛选相关变量
// const selectedRegion = ref('all') // 'all', 'cn', 'cn-out', 'out'
const selectedGroup = ref('all') // 新增：'all' 或 groupNameMap 的 key
const selectedProtocols = ref<string[]>([])

// 新增弹窗状态
const showConfigModal = ref(false)
const showCreateConfirmModal = ref(false)
const selectedNodeId = ref<number | null>(null)

const formValue = ref({
  nodeId: null as number | null,
  localAddr: '',
  localPort: null as number | null,
  remotePort: null as number | null,
  type: '',
  domain: '',
  name: '',
  accessKey: '',
  proxyProtocolVersion: '',
  useEncryption: false,
  useCompression: false,
  ipLimitIn: 0,
  ipLimitInUnit: 'MB',
  ipLimitOut: 0,
  ipLimitOutUnit: 'MB',
})

const protocolOptions = [
  { label: 'TCP', value: 'tcp' },
  { label: 'UDP', value: 'udp' },
  { label: 'HTTP', value: 'http' },
  { label: 'HTTPS', value: 'https' },
  { label: 'STCP', value: 'stcp' },
  { label: 'XTCP', value: 'xtcp' },
]

// 速率单位选项
const speedUnitOptions = [
  { label: 'KB', value: 'KB' },
  { label: 'MB', value: 'MB' },
  { label: 'Mbps', value: 'Mbps' },
]

const nodeOptions = ref<
  {
    label: string
    value: number
    id: number
    name: string
    hostname: string
    description: string
    isOnline: boolean
    isDisabled: boolean
    bandWidth: number
    location: string
    allowedProtocols: string[]
    allowGroups: { name: string; friendlyName: string }[]
    needRealname: boolean
    portRange: {
      min: number
      max: number
    }
    loadStatus:
      | 'low'
      | 'normal'
      | 'high'
      | 'overload'
      | 'offline'
      | 'disabled'
      | 'unknown'
  }[]
>([])
// 添加过滤节点的计算属性
const filteredNodes = computed(() => {
  return nodeOptions.value
    .filter((node) => {
      // 用户组多选筛选
      if (!selectedGroup.value.includes('all')) {
        const groupNames = node.allowGroups.map((g) => g.name)
        if (!groupNames.some((name) => selectedGroup.value.includes(name))) {
          return false
        }
      }
      // 协议多选筛选
      if (selectedProtocols.value.length > 0) {
        if (
          !selectedProtocols.value.every((protocol) =>
            node.allowedProtocols.includes(protocol),
          )
        ) {
          return false
        }
      }
      // 搜索筛选
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        return (
          node.name.toLowerCase().includes(query) ||
          node.description.toLowerCase().includes(query) ||
          node.id.toString().includes(query)
        )
      }
      return true
    })
    .sort((a, b) => {
      // 在线优先，ID升序
      if (a.isOnline !== b.isOnline) {
        return a.isOnline ? -1 : 1
      }
      return a.id - b.id
    })
})

// 添加协议支持检查函数
const supportsTcp = (node: any) => {
  return node.allowedProtocols.includes('tcp')
}

const supportsUdp = (node: any) => {
  return node.allowedProtocols.includes('udp')
}

const supportsHttp = (node: any) => {
  return node.allowedProtocols.includes('http')
}

const supportsHttps = (node: any) => {
  return node.allowedProtocols.includes('https')
}

const supportsStcp = (node: any) => {
  return node.allowedProtocols.includes('stcp')
}

const supportsXtcp = (node: any) => {
  return node.allowedProtocols.includes('xtcp')
}

// 获取负载状态的显示文本
const getLoadStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    low: '低负载',
    normal: '正常',
    high: '高负载',
    overload: '超载',
    offline: '离线',
    disabled: '禁用',
    unknown: '未知',
  }
  return statusMap[status] || '未知'
}

// 获取负载状态的标签类型
const getLoadStatusType = (
  status: string,
): 'default' | 'success' | 'error' | 'warning' | 'primary' | 'info' => {
  const typeMap: Record<
    string,
    'default' | 'success' | 'error' | 'warning' | 'primary' | 'info'
  > = {
    low: 'success',
    normal: 'success',
    high: 'warning',
    overload: 'error',
    offline: 'default',
    disabled: 'default',
    unknown: 'default',
  }
  return typeMap[status] || 'default'
}

const rules: FormRules = {
  nodeId: {
    required: true,
    message: '请选择节点',
    trigger: 'blur',
  },
  localAddr: {
    required: true,
    message: '请输入本地地址',
    trigger: 'blur',
  },
  localPort: {
    required: true,
    type: 'number',
    message: '请输入本地端口',
    trigger: 'blur',
    validator: (_rule, value) => {
      if (typeof value !== 'number' || value < 1 || value > 65535) {
        return new Error('端口范围必须在 1-65535 之间')
      }
      return true
    },
  },
  remotePort: {
    required: true,
    type: 'number',
    message: '请输入远程端口',
    trigger: 'blur',
    validator: (_rule, value) => {
      if (
        ['http', 'https', 'stcp', 'xtcp'].includes(formValue.value.type || '')
      ) {
        return true
      }
      if (typeof value !== 'number' || value < 1 || value > 65535) {
        return new Error('端口范围必须在 1-65535之间')
      }
      return true
    },
  },
  type: {
    required: true,
    message: '请选择隧道类型',
    trigger: 'blur',
  },
  name: {
    required: true,
    message: '请输入隧道名称',
    trigger: 'blur',
  },
  accessKey: {
    validator: (_rule, value) => {
      if (['stcp', 'xtcp'].includes(formValue.value.type) && !value) {
        return new Error('使用 STCP/XTCP 协议时，访问密钥为必填项')
      }
      return true
    },
    trigger: ['blur', 'change'],
  },
  domain: {
    validator: (_rule, _value) => {
      if (formValue.value.type === 'http' || formValue.value.type === 'https') {
        if (!domainTags.value.length) {
          return new Error('请至少添加一个域名')
        }
      }
      return true
    },
    trigger: ['blur', 'change'],
  },
}

const groupNameMap = ref<Record<string, string>>({})
const groupList = ref<{ label: string; value: string }[]>([])

const fetchUserGroups = async () => {
  try {
    const data = await userApi.getUserGroups()
    const groups =
      typeof data.data.groups === 'string'
        ? JSON.parse(data.data.groups)
        : data.data.groups

    groupNameMap.value = groups.reduce(
      (acc: Record<string, string>, group: any) => {
        acc[group.name] = group.friendlyName
        return acc
      },
      {} as Record<string, string>,
    )

    // 生成下拉用的 groupList
    groupList.value = groups
      .filter(
        (group: any) =>
          !['proxies', 'traffic', 'admin'].includes(
            group.name.trim().toLowerCase(),
          ),
      )
      .map((group: any) => ({
        label: group.friendlyName,
        value: group.name,
      }))
    return true
  } catch (error) {
    message.error((error as Error).message || '获取用户组列表失败')
    return false
  }
}

const fetchNodes = async () => {
  nodeLoading.value = true
  try {
    const data = await userApi.getNodes()
    const nodes = Array.isArray(data.data) ? data.data : []
    nodeOptions.value = nodes.map((node: any) => {
      const [minPort, maxPort] = (node.allowPort || '0-0')
        .split('-')
        .map(Number)
      const allowedProtocols = (node.allowType || '')
        .split(';')
        .map((type: string) => type.trim())
        .filter((p) => p)

      // 确保allowGroup分割正确
      const allowGroups = (node.allowGroup || '')
        .split(';')
        .map((group: string) => group.trim())
        .filter((group: string) => group) // 过滤空值
        .map((group: string) => ({
          name: group,
          friendlyName: groupNameMap.value[group] || group,
        }))

      return {
        label: `#${node.id} - ${node.name}`,
        value: node.id,
        id: node.id,
        name: node.name,
        hostname: node.hostname,
        description: node.description,
        isOnline: node.status,
        isDisabled: node.isDisabled,
        allowedProtocols,
        allowGroups,
        needRealname: node.needRealname,
        bandWidth: node.bandWidth,
        location: node.location,
        portRange: {
          min: minPort,
          max: maxPort,
        },
        loadStatus: node.loadStatus || 'unknown',
      }
    })
  } catch (error) {
    message.error((error as Error).message || '获取节点列表失败')
    nodeLoading.value = false
  }
  nodeLoading.value = false
}

const selectedNode = ref<{
  id: number
  name: string
  hostname: string
  allowedProtocols: string[]
  allowGroups: { name: string; friendlyName: string }[]
  portRange: {
    min: number
    max: number
  }
} | null>(null)

// 修改为点击节点时打开配置弹窗

const allowedProxyTypeOptions = computed(() => {
  if (!selectedNode.value) return protocolOptions
  return protocolOptions.filter((opt) =>
    selectedNode.value?.allowedProtocols.includes(opt.value),
  )
})

const domainTags = ref<string[]>([])

const handleDomainTagsUpdate = (tags: string[]) => {
  domainTags.value = tags
  formValue.value.domain = JSON.stringify(tags)
}

const renderDomainTag = (tag: string) => {
  return h(
    NTag,
    {
      round: false,
      closable: true,
      onClose: () => {
        const index = domainTags.value.indexOf(tag)
        if (index !== -1) {
          const newTags = [...domainTags.value]
          newTags.splice(index, 1)
          domainTags.value = newTags
          handleDomainTagsUpdate(newTags)
        }
      },
    },
    { default: () => tag },
  )
}

// 修改所有弹窗的显示/隐藏逻辑
const showRealnameModal = ref(false)
let timer: number | null = null

// 修改节点选择逻辑
const handleNodeSelect = (node: any) => {
  if (!node.isOnline) {
    message.error('该节点当前处于离线状态，无法选择')
    return
  }
  if (node.isDisabled) {
    message.error('该节点已被禁用，无法选择')
    return
  }
  if (node.loadStatus === 'overload') {
    message.error('该节点当前处于超载状态，无法选择')
    return
  }
  selectedNodeId.value = node.value
  selectedNode.value = {
    id: node.id,
    name: node.name,
    hostname: node.hostname,
    allowedProtocols: node.allowedProtocols,
    allowGroups: node.allowGroups,
    portRange: node.portRange,
  }
  // 设置表单默认值
  formValue.value.nodeId = node.value
  formValue.value.type = node.allowedProtocols[0] || ''
  formValue.value.remotePort = null
  // 打开配置弹窗
  openModal('config')
}

// 显示创建确认弹窗
const showCreateModal = () => {
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      openModal('createConfirm')
    }
  })
}

// 速率单位转换函数
const convertSpeedToKB = (value: number, unit: string): number => {
  if (!value || value <= 0) return 0

  switch (unit) {
    case 'KB':
      return value
    case 'MB':
      return value * 1024
    case 'Mbps':
      return value * 125 // 1 Mbps = 125 KB/s
    default:
      return value
  }
}

const handleCreate = async () => {
  try {
    loading.value = true

    const requestData: CreateTunnelParams = {
      nodeId: formValue.value.nodeId!,
      proxyName: formValue.value.name,
      localIp: formValue.value.localAddr,
      localPort: formValue.value.localPort!,
      remotePort: formValue.value.remotePort!,
      domain: ['http', 'https'].includes(formValue.value.type)
        ? JSON.stringify(domainTags.value)
        : '',
      proxyType: formValue.value.type,
      accessKey: formValue.value.accessKey,
      proxyProtocolVersion: formValue.value.proxyProtocolVersion?.trim() || '',
      useEncryption: formValue.value.useEncryption,
      useCompression: formValue.value.useCompression,
      ipLimitIn: convertSpeedToKB(
        formValue.value.ipLimitIn || 0,
        formValue.value.ipLimitInUnit || 'MB',
      ),
      ipLimitOut: convertSpeedToKB(
        formValue.value.ipLimitOut || 0,
        formValue.value.ipLimitOutUnit || 'MB',
      ),
    }
    const data = await userApi.createTunnel(requestData)
    if (data.code !== 0) {
      message.error(data.message || '创建失败')
      return
    } else {
      message.success(data.message || '创建成功')
      formRef.value?.restoreValidation()
    }
    // 关闭所有弹窗
    closeModal('createConfirm')
    closeModal('config')
    // 重置选中状态
    selectedNodeId.value = null
  } catch (error) {
    const errorMsg = error || '服务器连接异常'
    message.error(`创建失败: ${errorMsg}`)
  } finally {
    loading.value = false
  }
}

// 修改初始化顺序
const init = async () => {
  await fetchUserGroups() // 确保先获取用户组信息
  fetchNodes() // 移除 setTimeout 直接调用
}

onMounted(() => {
  init()
})

const gettingFreePort = ref(false)

const handleGetFreePort = async () => {
  if (!selectedNode.value) return

  // 随机端口
  const min = selectedNode.value.portRange.min || 1024
  const max = selectedNode.value.portRange.max || 65535
  formValue.value.remotePort = Math.floor(Math.random() * (max - min + 1)) + min
}

watch(showRealnameModal, (newVal) => {
  if (!newVal && timer) {
    clearInterval(timer)
    timer = null
  }
})

// 折叠篮默认展开中国大陆
const expandedRegion = ref(['cn'])
// 高级配置折叠栏默认收起
const expandedAdvanced = ref<string[]>(['basic']) // 默认展开基本设置

// 处理创建表单折叠面板的互斥逻辑
const handleCreateFormCollapseUpdate = (names: string[]) => {
  // 如果尝试展开多个面板，只保留最后一个
  if (names.length > 1) {
    expandedAdvanced.value = [names[names.length - 1]]
  } else {
    expandedAdvanced.value = names
  }
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;
.divider-line {
  border-bottom: 1px solid $divider-color;
  margin: 16px 0;
}
.content-grid {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 20px;

  .filter-card,
  .node-card {
    width: 100%;
    max-width: 1200px; /* 增加最大宽度以适应三列布局 */
    margin: 0 auto;

    :deep(.n-card-header) {
      border-bottom: 1px solid $border-color;
    }

    :deep(.n-card__content) {
      padding: 16px;
    }
  }

  .node-item {
    border: 1px solid $border-color;
    transition: $transition-all;
    cursor: pointer;
    height: 100%;
    position: relative;
  }

  .selected-node {
    box-shadow: 0 0 4px rgba($primary-color, 0.15);
    background-color: rgba($primary-color, 0.02);
    border-color: rgba($primary-color, 0.3) !important;

    &:hover {
      background-color: rgba($primary-color, 0.04);
    }
  }

  .node-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;

    .node-title {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      min-width: 0;
    }

    // .node-tags {
    //   display: flex;
    //   gap: 4px;
    // }
  }

  .info-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 2px;
    &:last-child {
      margin-bottom: 0;
    }
  }

  .no-results {
    padding: 40px 0;
    text-align: center;
  }
}

/* 确认弹窗样式 */
.tunnel-confirm-details {
  background-color: rgba($primary-color, 0.05);
  border-radius: 8px;
  padding: 16px;
  margin: 12px 0;
}

.confirm-item {
  display: flex;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }

  .confirm-label {
    width: 100px;
    color: $text-color-2;
    font-weight: 500;
  }
}

.confirm-warning {
  font-size: 14px;
  margin-top: 12px;
}

.speed-input-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* 添加响应式布局 */
@media (max-width: 1200px) {
  .content-grid .node-card,
  .content-grid .filter-card {
    max-width: 900px;
  }
}

@media (max-width: 768px) {
  .content-grid .node-card :deep(.n-grid) {
    grid-template-columns: repeat(1, 1fr) !important;
  }
  .protocol-select :deep(.n-base-selection-tags) {
    max-height: 32px; // 只显示一行
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    display: block;
  }
}

/* 区域筛选标签最初始样式 */
.region-tags-row {
  display: flex;
  gap: 16px;
  flex-wrap: nowrap;

  .n-tag {
    border-radius: 16px !important;
  }
}

/* 新增用户组筛选标签样式 */
.group-tags-row {
  display: flex;
  gap: 16px;
  flex-wrap: nowrap;
  .n-tag {
    border-radius: 16px !important;
  }
}

.node-offline {
  filter: grayscale(0.4);
  opacity: 0.5;
}

.node-tags :deep(.n-tag) {
  margin-left: -1px;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 30px;
  width: 100%;
  min-width: 0;
  flex-wrap: nowrap;
}

.region-filter {
  flex: 0 0 auto;
}

.group-filter {
  flex: 0 0 auto;
}

.protocol-filter {
  flex: 1 1 0;
  min-width: 0;
}

.protocol-select {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
    gap: 10px;
    width: 100%;
    flex-wrap: wrap;
  }
  .region-filter,
  .group-filter,
  .protocol-filter {
    width: 100%;
  }
  .group-select,
  .protocol-select {
    width: 100% !important;
    min-width: 0;
    max-width: 100%;
  }
}

/* PC端 */
.group-select {
  width: 250px;
  max-width: 100%;
}

.protocol-select {
  width: 340px;
  max-width: 100%;
}

/* 移动端 */
@media (max-width: 768px) {
  .group-select,
  .protocol-select {
    width: 100%;
    min-width: 0;
    max-width: 100%;
    box-sizing: border-box;
  }
  .group-filter,
  .protocol-filter {
    width: 100%;
    margin: 0;
  }
}
</style>
