<template>
  <div>
    <NCard title="系统管理">
      <NTabs type="line" animated @update:value="handleTabUpdate">
        <NTabPane name="security" tab="基本">
          <NForm
            ref="securityFormRef"
            :model="securityForm"
            :rules="securityRules"
            :label-placement="isMobile ? 'top' : 'left'"
            :label-width="isMobile ? undefined : '120px'"
            require-mark-placement="right-hanging"
          >
            <NGrid :cols="2" :x-gap="24" :y-gap="16" responsive="screen">
              <NGridItem>
                <NFormItem label="注册开关" path="allowRegister">
                  <NSwitch
                    v-model:value="securityForm.allowRegister"
                    :rail-style="switchButtonRailStyle"
                  >
                    <template #checked>启用</template>
                    <template #unchecked>禁用</template>
                  </NSwitch>
                </NFormItem>
              </NGridItem>
              <NGridItem>
                <NFormItem label="登录开关" path="allowLogin">
                  <NSwitch
                    v-model:value="securityForm.allowLogin"
                    :rail-style="switchButtonRailStyle"
                  >
                    <template #checked>启用</template>
                    <template #unchecked>禁用</template>
                  </NSwitch>
                </NFormItem>
              </NGridItem>
              <NGridItem>
                <NFormItem label="实名认证" path="allowRealName">
                  <NSwitch
                    v-model:value="securityForm.allowRealName"
                    :rail-style="switchButtonRailStyle"
                  >
                    <template #checked>启用</template>
                    <template #unchecked>禁用</template>
                  </NSwitch>
                </NFormItem>
              </NGridItem>
              <NGridItem>
                <NFormItem label="签到功能" path="allowSign">
                  <NSwitch
                    v-model:value="securityForm.allowSign"
                    :rail-style="switchButtonRailStyle"
                  >
                    <template #checked>启用</template>
                    <template #unchecked>禁用</template>
                  </NSwitch>
                </NFormItem>
              </NGridItem>
              <NGridItem>
                <NFormItem label="邮箱发送" path="allowEmail">
                  <NSwitch
                    v-model:value="securityForm.allowEmail"
                    :rail-style="switchButtonRailStyle"
                  >
                    <template #checked>启用</template>
                    <template #unchecked>禁用</template>
                  </NSwitch>
                </NFormItem>
              </NGridItem>
              <NGridItem>
                <NFormItem label="短信发送" path="allowSms">
                  <NSwitch
                    v-model:value="securityForm.allowSms"
                    :rail-style="switchButtonRailStyle"
                  >
                    <template #checked>启用</template>
                    <template #unchecked>禁用</template>
                  </NSwitch>
                </NFormItem>
              </NGridItem>
              <NGridItem :span="isMobile ? 2 : 1">
                <NFormItem label="签到积分范围">
                  <div class="range-inputs">
                    <NInputNumber
                      v-model:value="securityForm.signPointsMin"
                      :min="0"
                      placeholder="最小值"
                      class="range-input"
                    />
                    <span class="range-separator">-</span>
                    <NInputNumber
                      v-model:value="securityForm.signPointsMax"
                      :min="0"
                      placeholder="最大值"
                      class="range-input"
                    />
                  </div>
                </NFormItem>
              </NGridItem>
              <NGridItem :span="isMobile ? 2 : 1">
                <NFormItem label="签到流量范围">
                  <div class="range-inputs">
                    <NInputNumber
                      v-model:value="securityForm.signTrafficMin"
                      :min="0"
                      placeholder="最小值"
                      class="range-input"
                    >
                      <template #suffix>MB</template>
                    </NInputNumber>
                    <span class="range-separator">-</span>
                    <NInputNumber
                      v-model:value="securityForm.signTrafficMax"
                      :min="0"
                      placeholder="最大值"
                      class="range-input"
                    >
                      <template #suffix>MB</template>
                    </NInputNumber>
                  </div>
                </NFormItem>
              </NGridItem>
            </NGrid>
            <NDivider style="margin: 24px 0" />
            <NSpace justify="end">
              <NButton type="primary" @click="handleSaveSecurity"
                >保存设置</NButton
              >
            </NSpace>
          </NForm>
        </NTabPane>

        <NTabPane name="smtp" tab="邮件">
          <NForm
            ref="smtpFormRef"
            :model="smtpForm"
            :rules="smtpRules"
            :label-placement="isMobile ? 'top' : 'left'"
            :label-width="isMobile ? undefined : '120px'"
            require-mark-placement="right-hanging"
          >
            <NGrid
              :cols="isMobile ? 1 : 2"
              :x-gap="24"
              :y-gap="16"
              responsive="screen"
            >
              <NGridItem>
                <NFormItem label="SMTP服务器" path="host">
                  <NInput
                    v-model:value="smtpForm.host"
                    placeholder="请输入SMTP服务器地址"
                  />
                </NFormItem>
              </NGridItem>
              <NGridItem>
                <NFormItem label="端口" path="port">
                  <NInputNumber
                    v-model:value="smtpForm.port"
                    :min="1"
                    :max="65535"
                    placeholder="请输入端口号"
                  />
                </NFormItem>
              </NGridItem>
              <NGridItem>
                <NFormItem label="加密方式" path="encryption">
                  <NSelect
                    v-model:value="smtpForm.encryption"
                    :options="encryptionOptions"
                    placeholder="请选择加密方式"
                  />
                </NFormItem>
              </NGridItem>
              <NGridItem>
                <NFormItem label="用户名" path="username">
                  <NInput
                    v-model:value="smtpForm.username"
                    placeholder="请输入邮箱用户名"
                  />
                </NFormItem>
              </NGridItem>
              <NGridItem>
                <NFormItem label="密码" path="password">
                  <NInput
                    v-model:value="smtpForm.password"
                    type="password"
                    placeholder="请输入邮箱密码或授权码"
                    show-password-on="click"
                  />
                </NFormItem>
              </NGridItem>
              <NGridItem>
                <NFormItem label="发件人邮箱" path="fromEmail">
                  <NInput
                    v-model:value="smtpForm.fromEmail"
                    placeholder="请输入发件人邮箱地址"
                  />
                </NFormItem>
              </NGridItem>
            </NGrid>
            <NDivider style="margin: 24px 0" />
            <NSpace justify="end">
              <NButton type="primary" :loading="loading" @click="handleSaveSmtp"
                >保存设置</NButton
              >
            </NSpace>
          </NForm>
        </NTabPane>

        <NTabPane name="sms" tab="短信">
          <NAlert style="margin-bottom: 20px" title="短信配置" type="info">
            注意目前只支持短信宝
          </NAlert>
          <NForm
            ref="smsFormRef"
            :model="smsForm"
            :rules="smsRules"
            :label-placement="isMobile ? 'top' : 'left'"
            :label-width="isMobile ? undefined : '120px'"
            require-mark-placement="right-hanging"
          >
            <NGrid
              :cols="isMobile ? 1 : 2"
              :x-gap="24"
              :y-gap="16"
              responsive="screen"
            >
              <NGridItem>
                <NFormItem label="APPID" path="appId">
                  <NInput
                    v-model:value="smsForm.appId"
                    placeholder="请输入APPID"
                  />
                </NFormItem>
              </NGridItem>
              <NGridItem>
                <NFormItem label="TOKEN" path="smsToken">
                  <NInput
                    v-model:value="smsForm.smsToken"
                    type="password"
                    placeholder="请输入SecretKey"
                    show-password-on="click"
                  />
                </NFormItem>
              </NGridItem>
              <NGridItem span="2">
                <NFormItem label="模板" path="template">
                  <NInput
                    v-model:value="smsForm.template"
                    placeholder="请输入短信模板"
                  />
                </NFormItem>
              </NGridItem>
            </NGrid>
            <NDivider style="margin: 24px 0" />
            <NSpace justify="end">
              <NButton
                type="primary"
                :loading="smsLoading"
                @click="handleSaveSms"
                >保存设置</NButton
              >
            </NSpace>
          </NForm>
        </NTabPane>

        <NTabPane name="downloads" tab="下载">
          <div
            :class="
              isMobile ? 'download-filter-row-mobile' : 'download-filter-row'
            "
          >
            <n-select
              v-model:value="filterMode"
              :options="filterModeOptions"
              placeholder="筛选方式"
              :class="
                isMobile
                  ? 'download-filter-item-mobile'
                  : 'download-filter-item'
              "
              style="min-width: 100px"
            />
            <n-input
              v-model:value="filterKeyword"
              placeholder="请输入关键词"
              :class="
                isMobile
                  ? 'download-filter-item-mobile'
                  : 'download-filter-item'
              "
              clearable
              @update:value="filterDownloadSources"
            />
            <n-select
              v-model:value="sortOrder"
              :options="sortOrderOptions"
              placeholder="排序方式"
              :class="
                isMobile
                  ? 'download-filter-item-mobile'
                  : 'download-filter-item'
              "
              style="min-width: 100px"
              @update:value="filterDownloadSources"
            />
            <n-button
              type="primary"
              @click="showAddSourceModal = true"
              :class="
                isMobile ? 'download-filter-btn-mobile' : 'download-filter-btn'
              "
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
          <div
            :class="isMobile ? 'group-filter-row-mobile' : 'group-filter-row'"
          >
            <n-select
              v-model:value="groupFilterMode"
              :options="groupFilterModeOptions"
              placeholder="筛选方式"
              :class="
                isMobile ? 'group-filter-item-mobile' : 'group-filter-item'
              "
              style="min-width: 100px"
            />
            <n-input
              v-model:value="groupFilterKeyword"
              placeholder="请输入关键词"
              :class="
                isMobile ? 'group-filter-item-mobile' : 'group-filter-item'
              "
              clearable
              @update:value="filterGroups"
            />
            <n-select
              v-model:value="groupSortOrder"
              :options="groupSortOrderOptions"
              placeholder="排序方式"
              :class="
                isMobile ? 'group-filter-item-mobile' : 'group-filter-item'
              "
              style="min-width: 100px"
              @update:value="filterGroups"
            />
            <n-button
              type="primary"
              @click="showAddGroupModal = true"
              :class="isMobile ? 'group-filter-btn-mobile' : 'group-filter-btn'"
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

        <NTabPane name="broadcast" tab="通知管理">
          <div
            :class="
              isMobile ? 'broadcast-filter-row-mobile' : 'broadcast-filter-row'
            "
          >
            <n-select
              v-model:value="broadcastFilterMode"
              :options="broadcastFilterModeOptions"
              placeholder="筛选方式"
              :class="
                isMobile
                  ? 'broadcast-filter-item-mobile'
                  : 'broadcast-filter-item'
              "
              style="min-width: 100px"
            />
            <n-input
              v-model:value="broadcastFilterKeyword"
              placeholder="请输入关键词"
              :class="
                isMobile
                  ? 'broadcast-filter-item-mobile'
                  : 'broadcast-filter-item'
              "
              clearable
              @update:value="filterBroadcasts"
            />
            <n-select
              v-model:value="broadcastSortOrder"
              :options="broadcastSortOrderOptions"
              placeholder="排序方式"
              :class="
                isMobile
                  ? 'broadcast-filter-item-mobile'
                  : 'broadcast-filter-item'
              "
              style="min-width: 100px"
              @update:value="filterBroadcasts"
            />
            <n-button
              type="primary"
              @click="showAddBroadcastModal = true"
              :class="
                isMobile
                  ? 'broadcast-filter-btn-mobile'
                  : 'broadcast-filter-btn'
              "
              size="small"
            >
              添加通知
            </n-button>
          </div>
          <NSpace vertical>
            <NDataTable
              :columns="broadcastColumns"
              :data="filteredBroadcastsData"
              :bordered="false"
              :scroll-x="1000"
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
      :style="{ width: isMobile ? '90vw' : '500px' }"
    >
      <NForm
        ref="editSourceFormRef"
        :model="editSourceForm"
        :rules="addSourceRules"
      >
        <NFormItem label="Path" path="path">
          <NInput
            v-model:value="editSourceForm.url"
            placeholder="请输入下载源 URL"
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
      :style="{ width: isMobile ? '90vw' : '500px' }"
    >
      <NForm
        ref="addSourceFormRef"
        :model="addSourceForm"
        :rules="addSourceRules"
      >
        <NFormItem label="Path" path="path">
          <NInput
            v-model:value="addSourceForm.url"
            placeholder="请输入下载源 URL"
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
      style="width: 600px; max-width: 90vw"
    >
      <NForm
        ref="groupFormRef"
        :model="groupForm"
        :rules="groupRules"
        label-placement="left"
        label-width="100px"
        style="margin-top: 20px"
      >
        <NGrid :cols="2" :x-gap="20" :y-gap="8" responsive="screen">
          <NGridItem span="2">
            <NFormItem label="组名" path="name">
              <NInput
                v-model:value="groupForm.name"
                placeholder="请输入用户组名称"
                clearable
              />
            </NFormItem>
          </NGridItem>
          <NGridItem>
            <NFormItem label="显示名称" path="friendlyName">
              <NInput
                v-model:value="groupForm.friendlyName"
                placeholder="请输入显示名称"
                clearable
              />
            </NFormItem>
          </NGridItem>
          <NGridItem>
            <NFormItem label="基础流量" path="traffic">
              <NInputNumber
                v-model:value="groupForm.traffic"
                :min="0"
                placeholder="请输入基础流量"
                style="width: 100%"
              >
                <template #suffix>MB</template>
              </NInputNumber>
            </NFormItem>
          </NGridItem>
          <NGridItem>
            <NFormItem label="最大隧道数" path="proxies">
              <NInputNumber
                v-model:value="groupForm.proxies"
                :min="0"
                placeholder="请输入最大隧道数"
                style="width: 100%"
              />
            </NFormItem>
          </NGridItem>
          <NGridItem span="2">
            <NDivider title-placement="left" style="margin: 16px 0"
              >带宽设置</NDivider
            >
          </NGridItem>
          <NGridItem>
            <NFormItem label="出站带宽" path="out_limit">
              <NInputNumber
                v-model:value="groupForm.out_limit"
                :min="0"
                placeholder="请输入出站带宽"
                style="width: 100%"
              >
                <template #suffix>Mbps</template>
              </NInputNumber>
            </NFormItem>
          </NGridItem>
          <NGridItem>
            <NFormItem label="入站带宽" path="in_limit">
              <NInputNumber
                v-model:value="groupForm.in_limit"
                :min="0"
                placeholder="请输入入站带宽"
                style="width: 100%"
              >
                <template #suffix>Mbps</template>
              </NInputNumber>
            </NFormItem>
          </NGridItem>
          <NGridItem span="2">
            <NDivider title-placement="left" style="margin: 16px 0"
              >海外带宽设置</NDivider
            >
          </NGridItem>
          <NGridItem>
            <NFormItem label="海外出站" path="no_cn_out_limit">
              <NInputNumber
                v-model:value="groupForm.no_cn_out_limit"
                :min="0"
                placeholder="请输入海外出站带宽"
                style="width: 100%"
              >
                <template #suffix>Mbps</template>
              </NInputNumber>
            </NFormItem>
          </NGridItem>
          <NGridItem>
            <NFormItem label="海外入站" path="no_cn_in_limit">
              <NInputNumber
                v-model:value="groupForm.no_cn_in_limit"
                :min="0"
                placeholder="请输入海外入站带宽"
                style="width: 100%"
              >
                <template #suffix>Mbps</template>
              </NInputNumber>
            </NFormItem>
          </NGridItem>
        </NGrid>
      </NForm>
      <template #action>
        <NSpace justify="end" style="margin-top: 16px">
          <NButton @click="showAddGroupModal = false" size="medium"
            >取消</NButton
          >
          <NButton type="primary" @click="handleAddGroup" size="medium"
            >确定</NButton
          >
        </NSpace>
      </template>
    </NModal>

    <!-- 编辑用户组模态框 -->
    <NModal
      v-model:show="showEditGroupModal"
      preset="dialog"
      title="修改用户组"
      style="width: 600px; max-width: 90vw"
    >
      <NForm
        ref="editGroupFormRef"
        :model="editGroupForm"
        :rules="groupRules"
        label-placement="left"
        label-width="100px"
        style="margin-top: 20px"
      >
        <NGrid :cols="2" :x-gap="20" :y-gap="8" responsive="screen">
          <NGridItem span="2">
            <NFormItem label="组名" path="name">
              <NInput
                v-model:value="editGroupForm.name"
                placeholder="请输入用户组名称"
                clearable
              />
            </NFormItem>
          </NGridItem>
          <NGridItem>
            <NFormItem label="显示名称" path="friendlyName">
              <NInput
                v-model:value="editGroupForm.friendlyName"
                placeholder="请输入显示名称"
                clearable
              />
            </NFormItem>
          </NGridItem>
          <NGridItem>
            <NFormItem label="基础流量" path="traffic">
              <NInputNumber
                v-model:value="editGroupForm.traffic"
                :min="0"
                placeholder="请输入基础流量"
                style="width: 100%"
              >
                <template #suffix>MB</template>
              </NInputNumber>
            </NFormItem>
          </NGridItem>
          <NGridItem>
            <NFormItem label="最大隧道数" path="proxies">
              <NInputNumber
                v-model:value="editGroupForm.proxies"
                :min="0"
                placeholder="请输入最大隧道数"
                style="width: 100%"
              />
            </NFormItem>
          </NGridItem>
          <NGridItem span="2">
            <NDivider title-placement="left" style="margin: 16px 0"
              >带宽设置</NDivider
            >
          </NGridItem>
          <NGridItem>
            <NFormItem label="出站带宽" path="out_limit">
              <NInputNumber
                v-model:value="editGroupForm.out_limit"
                :min="0"
                placeholder="请输入出站带宽"
                style="width: 100%"
              >
                <template #suffix>Mbps</template>
              </NInputNumber>
            </NFormItem>
          </NGridItem>
          <NGridItem>
            <NFormItem label="入站带宽" path="in_limit">
              <NInputNumber
                v-model:value="editGroupForm.in_limit"
                :min="0"
                placeholder="请输入入站带宽"
                style="width: 100%"
              >
                <template #suffix>Mbps</template>
              </NInputNumber>
            </NFormItem>
          </NGridItem>
          <NGridItem span="2">
            <NDivider title-placement="left" style="margin: 16px 0"
              >海外带宽设置</NDivider
            >
          </NGridItem>
          <NGridItem>
            <NFormItem label="海外出站" path="no_cn_out_limit">
              <NInputNumber
                v-model:value="editGroupForm.no_cn_out_limit"
                :min="0"
                placeholder="请输入海外出站带宽"
                style="width: 100%"
              >
                <template #suffix>Mbps</template>
              </NInputNumber>
            </NFormItem>
          </NGridItem>
          <NGridItem>
            <NFormItem label="海外入站" path="no_cn_in_limit">
              <NInputNumber
                v-model:value="editGroupForm.no_cn_in_limit"
                :min="0"
                placeholder="请输入海外入站带宽"
                style="width: 100%"
              >
                <template #suffix>Mbps</template>
              </NInputNumber>
            </NFormItem>
          </NGridItem>
        </NGrid>
      </NForm>
      <template #action>
        <NSpace justify="end" style="margin-top: 16px">
          <NButton @click="showEditGroupModal = false" size="medium"
            >取消</NButton
          >
          <NButton
            type="primary"
            @click="showSetUserGroupModal = true"
            size="medium"
          >
            确定
          </NButton>
        </NSpace>
      </template>
    </NModal>

    <!-- 同步设置用户模态框 -->
    <n-modal
      v-model:show="showSetUserGroupModal"
      preset="dialog"
      title="是否同步设置用户？"
    >
      <n-text>
        同步设置用户将使所有用户的隧道数、带宽设置等与当前组一致。(除了修改过流量、隧道数、带宽设置的用户)
      </n-text>
      <template #action>
        <n-button @click="handleCancelSetUserGroup">不设置</n-button>
        <n-button type="primary" @click="handleSetUserGroup">直接提交</n-button>
      </template>
    </n-modal>

    <!-- 添加通知模态框 -->
    <NModal
      v-model:show="showAddBroadcastModal"
      preset="dialog"
      title="添加通知"
      :style="{ width: isMobile ? '90vw' : '500px' }"
    >
      <NForm
        ref="addBroadcastFormRef"
        :model="addBroadcastForm"
        :rules="broadcastRules"
      >
        <NFormItem label="标题" path="title">
          <NInput
            v-model:value="addBroadcastForm.title"
            placeholder="请输入通知标题"
          />
        </NFormItem>
        <NFormItem label="内容" path="message">
          <NInput
            v-model:value="addBroadcastForm.message"
            type="textarea"
            placeholder="请输入通知内容"
            :rows="5"
          />
        </NFormItem>
        <NFormItem label="类型" path="type">
          <NSelect
            v-model:value="addBroadcastForm.type"
            :options="broadcastTypeOptions"
            placeholder="请选择通知类型"
          />
        </NFormItem>
      </NForm>
      <template #action>
        <NButton @click="showAddBroadcastModal = false">取消</NButton>
        <NButton type="primary" @click="handleAddBroadcast">确定</NButton>
      </template>
    </NModal>

    <!-- 编辑通知模态框 -->
    <NModal
      v-model:show="showEditBroadcastModal"
      preset="dialog"
      title="修改通知"
      :style="{ width: isMobile ? '90vw' : '500px' }"
    >
      <NForm
        ref="editBroadcastFormRef"
        :model="editBroadcastForm"
        :rules="broadcastRules"
      >
        <NFormItem label="标题" path="title">
          <NInput
            v-model:value="editBroadcastForm.title"
            placeholder="请输入通知标题"
          />
        </NFormItem>
        <NFormItem label="内容" path="message">
          <NInput
            v-model:value="editBroadcastForm.message"
            type="textarea"
            placeholder="请输入通知内容"
            :rows="5"
          />
        </NFormItem>
        <NFormItem label="类型" path="type">
          <NSelect
            v-model:value="editBroadcastForm.type"
            :options="broadcastTypeOptions"
            placeholder="请选择通知类型"
          />
        </NFormItem>
      </NForm>
      <template #action>
        <NButton @click="showEditBroadcastModal = false">取消</NButton>
        <NButton type="primary" @click="handleEditBroadcast">确定</NButton>
      </template>
    </NModal>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, h, computed } from 'vue'
import {
  NCard,
  NTabs,
  NTabPane,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NSwitch,
  NSpace,
  NButton,
  useMessage,
  NDataTable,
  NModal,
  NSelect,
  NGrid,
  NGridItem,
  NDivider,
  NAlert,
  NTag,
} from 'naive-ui'
import type { FormRules, FormInst, DataTableColumns } from 'naive-ui'
import { switchButtonRailStyle } from '@/constants/theme.ts'
import type { DownloadSource, Group } from '@/types'
import type { Broadcast } from '@/net/admin/type'
import { adminApi } from '@/net'
import type { ApiError } from '@/net/request'

const message = useMessage()

// 判断是否为移动端
const isMobile = computed(() => {
  return window.innerWidth <= 768
})

// 表单引用
const securityFormRef = ref<FormInst | null>(null)
const smtpFormRef = ref<FormInst | null>(null)
const smsFormRef = ref<FormInst | null>(null)
const showSetUserGroupModal = ref(false)

// 表单数据
const securityForm = ref({
  allowRegister: true,
  allowLogin: true,
  allowRealName: true,
  allowSign: true,
  allowEmail: true,
  allowSms: true,
  signPointsMin: 0,
  signPointsMax: 0,
  signTrafficMin: 0,
  signTrafficMax: 0,
})

const smtpForm = ref({
  host: '',
  port: 587,
  username: '',
  password: '',
  fromEmail: '',
  encryption: 'tls' as 'none' | 'ssl' | 'tls',
})

const smsForm = ref({
  appId: '',
  smsToken: '',
  template: '',
})

// 加密方式选项
const encryptionOptions = [
  { label: '无加密', value: 'none' },
  { label: 'SSL', value: 'ssl' },
  { label: 'TLS', value: 'tls' },
]

const downloadSourcesData = ref<DownloadSource[]>([])
const groupsData = ref<Group[]>([])
const filteredGroupsData = ref<Group[]>([])
const broadcastsData = ref<Broadcast[]>([])
const filteredBroadcastsData = ref<Broadcast[]>([])
const SetUserGroup = ref(false)
const loading = ref(false)
const smsLoading = ref(false)

// 模态框状态
const showEditModal = ref(false)
const showAddSourceModal = ref(false)
const showAddGroupModal = ref(false)
const showEditGroupModal = ref(false)
const showAddBroadcastModal = ref(false)
const showEditBroadcastModal = ref(false)

// 表单数据
const addSourceForm = ref<DownloadSource>({
  id: 0,
  name: '',
  url: '',
})

const editSourceForm = ref<DownloadSource>({
  id: 0,
  name: '',
  url: '',
})

const groupForm = ref<Group>({
  id: 0,
  name: '',
  friendlyName: '',
  proxies: 0,
  traffic: 0,
  out_limit: 0,
  in_limit: 0,
  no_cn_out_limit: 0,
  no_cn_in_limit: 0,
})

const editGroupForm = ref<Group>({
  id: 0,
  name: '',
  friendlyName: '',
  proxies: 0,
  traffic: 0,
  out_limit: 0,
  in_limit: 0,
  no_cn_out_limit: 0,
  no_cn_in_limit: 0,
})

const addBroadcastForm = ref<Broadcast>({
  id: 0,
  title: '',
  message: '',
  type: 'info',
  created_at: '',
  updated_at: '',
})

const editBroadcastForm = ref<Broadcast>({
  id: 0,
  title: '',
  message: '',
  type: 'info',
  created_at: '',
  updated_at: '',
})

// 表单规则
const securityRules: FormRules = {
  allowRegister: {
    required: true,
    type: 'boolean',
  },
  allowSign: {
    required: true,
    type: 'boolean',
  },
  allowLogin: {
    required: true,
    type: 'boolean',
  },
  allowRealName: {
    required: true,
    type: 'boolean',
  },
  allowEmail: {
    required: true,
    type: 'boolean',
  },
  allowSms: {
    required: true,
    type: 'boolean',
  },
}

const smtpRules: FormRules = {
  host: {
    required: true,
    message: '请输入SMTP服务器地址',
    trigger: ['blur', 'input'],
  },
  port: {
    required: true,
    type: 'number',
    min: 1,
    max: 65535,
    message: '请输入有效的端口号',
    trigger: ['blur', 'input'],
  },
  username: {
    required: true,
    message: '请输入邮箱用户名',
    trigger: ['blur', 'input'],
  },
  password: {
    required: true,
    message: '请输入邮箱密码或授权码',
    trigger: ['blur', 'input'],
  },
  fromEmail: {
    required: true,
    type: 'email',
    message: '请输入有效的邮箱地址',
    trigger: ['blur', 'input'],
  },
  fromName: {
    required: true,
    message: '请输入发件人名称',
    trigger: ['blur', 'input'],
  },
  encryption: {
    required: true,
    message: '请选择加密方式',
    trigger: ['blur', 'change'],
  },
}

const smsRules: FormRules = {
  provider: {
    required: true,
    message: '请选择短信服务商',
    trigger: ['blur', 'change'],
  },
  accessKey: {
    required: true,
    message: '请输入AccessKey',
    trigger: ['blur', 'input'],
  },
  secretKey: {
    required: true,
    message: '请输入SecretKey',
    trigger: ['blur', 'input'],
  },
  signName: {
    required: true,
    message: '请输入短信签名',
    trigger: ['blur', 'input'],
  },
  templateId: {
    required: true,
    message: '请输入短信模板ID',
    trigger: ['blur', 'input'],
  },
  region: {
    required: true,
    message: '请输入服务区域',
    trigger: ['blur', 'input'],
  },
}

const addSourceRules: FormRules = {
  id: {
    required: true,
    message: '请输入下载 ID',
    trigger: ['blur', 'input'],
  },
  name: {
    required: true,
    message: '请输入下载名称',
    trigger: ['blur', 'input'],
  },
  path: {
    required: true,
    message: '请输入下载路径',
    trigger: ['blur', 'input'],
  },
  arch: {
    required: true,
    message: '请输入下载架构',
    trigger: ['blur', 'input'],
  },
  os: {
    required: true,
    message: '请输入下载系统',
    trigger: ['blur', 'input'],
  },
}

const groupRules: FormRules = {
  name: {
    required: true,
    message: '请输入用户组名称',
    trigger: ['blur', 'input'],
  },
}

const broadcastRules: FormRules = {
  title: {
    required: true,
    message: '请输入通知标题',
    trigger: ['blur', 'input'],
  },
  message: {
    required: true,
    message: '请输入通知内容',
    trigger: ['blur', 'input'],
  },
}

// 表格列定义
const downloadSourceColumn: DataTableColumns<DownloadSource> = [
  {
    title: 'ID',
    key: 'id',
  },
  {
    title: '名称',
    key: 'name',
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    render: (row) => {
      return h(
        NSpace,
        {},
        {
          default: () => [
            h(
              NButton,
              {
                size: 'small',
                type: 'primary',
                onClick: () => {
                  editSourceForm.value.id = row.id
                  editSourceForm.value.url = row.url
                  editSourceForm.value.name = row.name
                  showEditModal.value = true
                },
              },
              { default: () => '修改' },
            ),
            h(
              NButton,
              {
                size: 'small',
                type: 'error',
                onClick: () => handleRemoveDownloadSource(row.id),
              },
              { default: () => '删除' },
            ),
          ],
        },
      )
    },
  },
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
      return h(
        'div',
        {
          style:
            'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;',
        },
        row.name,
      )
    },
  },
  {
    title: '显示名称',
    key: 'friendlyName',
    render(row) {
      return h(
        'div',
        {
          style:
            'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;',
        },
        row.friendlyName,
      )
    },
  },
  {
    title: '最大隧道数',
    key: 'maxProxies',
    render(row) {
      return h(
        'div',
        {
          style:
            'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;',
        },
        row.proxies,
      )
    },
  },
  {
    title: '基础流量',
    key: 'traffic',
    render(row) {
      return h(
        'div',
        {
          style:
            'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;',
        },
        formatTraffic(row.traffic),
      )
    },
  },
  {
    title: '出站带宽',
    key: 'outBound',
    render(row) {
      return h(
        'div',
        {
          style:
            'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;',
        },
        row.out_limit ? `${row.out_limit} Mbps` : '无',
      )
    },
  },
  {
    title: '入站带宽',
    key: 'inBound',
    render(row) {
      return h(
        'div',
        {
          style:
            'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;',
        },
        row.in_limit ? `${row.in_limit} Mbps` : '无',
      )
    },
  },
  {
    title: '操作',
    key: 'actions',
    render: (row) => {
      return h(
        NSpace,
        {},
        {
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
                },
              },
              { default: () => '修改' },
            ),
            h(
              NButton,
              {
                size: 'small',
                type: 'error',
                onClick: () => handleRemoveGroup(row.id),
              },
              { default: () => '删除' },
            ),
          ],
        },
      )
    },
  },
]

const broadcastColumns: DataTableColumns<Broadcast> = [
  {
    title: 'ID',
    key: 'id',
  },
  {
    title: '标题',
    key: 'title',
    width: 200,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '内容',
    key: 'message',
    render(row) {
      return h(
        'div',
        {
          style:
            'white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px;',
        },
        row.message,
      )
    },
  },
  {
    title: '类型',
    key: 'type',
    render(row) {
      const typeMap: Record<string, string> = {
        info: '通知',
        warning: '紧急',
        danger: '重要',
      }
      return h(
        NTag,
        {
          type:
            row.type === 'danger'
              ? 'error'
              : row.type === 'warning'
                ? 'warning'
                : 'info',
          size: 'small',
          bordered: false,
        },
        { default: () => typeMap[row.type || 'info'] || '通知' },
      )
    },
  },
  {
    title: '创建时间',
    key: 'created_at',
    render(row) {
      return h(
        'div',
        {
          style:
            'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;',
        },
        new Date(row.created_at).toLocaleString('zh-CN'),
      )
    },
  },
  {
    title: '更新时间',
    key: 'updated_at',
    render(row) {
      return h(
        'div',
        {
          style:
            'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;',
        },
        new Date(row.updated_at).toLocaleString('zh-CN'),
      )
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 130,
    fixed: 'right',
    render: (row) => {
      return h(
        NSpace,
        { wrap: false },
        {
          default: () => [
            h(
              NButton,
              {
                size: 'small',
                type: 'primary',
                onClick: () => {
                  editBroadcastForm.value = { ...row }
                  showEditBroadcastModal.value = true
                },
              },
              { default: () => '修改' },
            ),
            h(
              NButton,
              {
                size: 'small',
                type: 'error',
                onClick: () => handleRemoveBroadcast(row.id),
              },
              { default: () => '删除' },
            ),
          ],
        },
      )
    },
  },
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

// 保存安全设置
const handleSaveSecurity = async () => {
  try {
    await securityFormRef.value?.validate()
    const data = await adminApi.updateSetting({
      allowRegister: securityForm.value.allowRegister,
      allowRealname: securityForm.value.allowRealName,
      allowLogin: securityForm.value.allowLogin,
      allowSendMail: securityForm.value.allowEmail,
      allowSendSms: securityForm.value.allowSms,
      allowSign: securityForm.value.allowSign,
      signPoints: `${securityForm.value.signPointsMin}-${securityForm.value.signPointsMax}`,
      signTraffic: `${securityForm.value.signTrafficMin}-${securityForm.value.signTrafficMax}`,
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
  { label: '名称', value: 'name' },
]
const sortOrderOptions = [
  { label: '升序', value: 'asc' },
  { label: '降序', value: 'desc' },
]
const filterMode = ref('id')
const filterKeyword = ref('')
const sortOrder = ref('asc')

// 用户组筛选条件
const groupFilterModeOptions = [
  { label: '组名', value: 'name' },
  { label: '显示名称', value: 'friendlyName' },
]
const groupSortOrderOptions = [
  { label: '升序', value: 'asc' },
  { label: '降序', value: 'desc' },
]
const groupFilterMode = ref('name')
const groupFilterKeyword = ref('')
const groupSortOrder = ref('asc')

// 通知筛选条件
const broadcastFilterModeOptions = [
  { label: '标题', value: 'title' },
  { label: '内容', value: 'message' },
]
const broadcastSortOrderOptions = [
  { label: '升序', value: 'asc' },
  { label: '降序', value: 'desc' },
]
const broadcastTypeOptions = [
  { label: '通知', value: 'info' },
  { label: '紧急', value: 'warning' },
  { label: '重要', value: 'danger' },
]
const broadcastFilterMode = ref('title')
const broadcastFilterKeyword = ref('')
const broadcastSortOrder = ref('asc')

// 原始数据副本
const allDownloadSources = ref<DownloadSource[]>([])

// 获取下载源列表
const fetchDownloadSources = async () => {
  try {
    const data = await adminApi.getDownloadSources()
    if (data.code === 0) {
      if (!data.data) {
        return
      }
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
      filtered = filtered.filter((item) =>
        String(item.id).includes(filterKeyword.value.trim()),
      )
    } else if (filterMode.value === 'name') {
      filtered = filtered.filter((item) =>
        item.name
          ?.toLowerCase()
          .includes(filterKeyword.value.trim().toLowerCase()),
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
      filtered = filtered.filter((item) =>
        item.name
          ?.toLowerCase()
          .includes(groupFilterKeyword.value.trim().toLowerCase()),
      )
    } else if (groupFilterMode.value === 'friendlyName') {
      filtered = filtered.filter((item) =>
        item.friendlyName
          ?.toLowerCase()
          .includes(groupFilterKeyword.value.trim().toLowerCase()),
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

// 通知过滤方法
const filterBroadcasts = () => {
  let filtered = broadcastsData.value
  if (broadcastFilterKeyword.value) {
    if (broadcastFilterMode.value === 'title') {
      filtered = filtered.filter((item) =>
        item.title
          ?.toLowerCase()
          .includes(broadcastFilterKeyword.value.trim().toLowerCase()),
      )
    } else if (broadcastFilterMode.value === 'message') {
      filtered = filtered.filter((item) =>
        item.message
          ?.toLowerCase()
          .includes(broadcastFilterKeyword.value.trim().toLowerCase()),
      )
    }
  }
  filtered.sort((a, b) => {
    const typePriority = { danger: 3, warning: 2, info: 1 }
    const priorityA = typePriority[a.type as keyof typeof typePriority] || 0
    const priorityB = typePriority[b.type as keyof typeof typePriority] || 0
    if (priorityA !== priorityB) {
      return priorityB - priorityA
    }
    if (broadcastSortOrder.value === 'asc') {
      if (a.id === b.id) return 0
      return a.id - b.id
    } else {
      if (a.id === b.id) return 0
      return b.id - a.id
    }
  })
  filteredBroadcastsData.value = filtered
}

// 获取所有系统设置
const fetchAllSystemSettings = async () => {
  try {
    const data = await adminApi.getSystemSettings()
    if (data.code === 0) {
      const configs = data.data

      securityForm.value.allowRegister = configs.allowRegister === 'true'
      securityForm.value.allowSign = configs.allowSign === 'true'
      securityForm.value.allowLogin = configs.allowLogin === 'true'
      securityForm.value.allowRealName = configs.allowRealname === 'true'
      securityForm.value.allowEmail = configs.allowSendMail === 'true'
      securityForm.value.allowSms = configs.allowSendSms === 'true'

      if (configs.signPoints) {
        const [min, max] = configs.signPoints.split('-').map(Number)
        securityForm.value.signPointsMin = min || 0
        securityForm.value.signPointsMax = max || 0
      }

      if (configs.signTraffic) {
        const [min, max] = configs.signTraffic.split('-').map(Number)
        securityForm.value.signTrafficMin = min || 0
        securityForm.value.signTrafficMax = max || 0
      }
    } else {
      message.error(data.message || '获取系统设置失败')
    }
  } catch (error) {
    message.error((error as ApiError).message)
  }
}

// 获取用户组列表
const fetchGroups = async () => {
  try {
    const data = await adminApi.getGroupList()
    if (data.code === 0) {
      const groups = data.data.groups || data.data
      groupsData.value = groups.map((group) => ({
        ...group,
        out_limit: group.out_limit / 128,
        in_limit: group.in_limit / 128,
        no_cn_out_limit: group.no_cn_out_limit / 128,
        no_cn_in_limit: group.no_cn_in_limit / 128,
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
  if (!addSourceForm.value.name || !addSourceForm.value.url) {
    message.error('请填写完整信息')
    return
  }

  try {
    const data = await adminApi.createDownloadSource({
      name: addSourceForm.value.name,
      path: addSourceForm.value.url,
    })
    if (data.code === 0) {
      message.success('添加成功')
      addSourceForm.value.name = ''
      addSourceForm.value.url = ''
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
  if (!editSourceForm.value.name || !editSourceForm.value.url) {
    message.error('请填写完整信息')
    return
  }

  try {
    const data = await adminApi.updateDownloadSource(editSourceForm.value.id, {
      name: editSourceForm.value.name,
      path: editSourceForm.value.url,
    })
    if (data.code === 0) {
      message.success('修改成功')
      showEditModal.value = false
      editSourceForm.value.name = ''
      editSourceForm.value.url = ''
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
      proxies: groupForm.value.proxies,
      traffic: groupForm.value.traffic,
      out_limit: groupForm.value.out_limit * 128,
      in_limit: groupForm.value.in_limit * 128,
      no_cn_out_limit: groupForm.value.no_cn_out_limit * 128,
      no_cn_in_limit: groupForm.value.no_cn_in_limit * 128,
    })
    if (data.code === 0) {
      message.success('添加用户组成功')
      showAddGroupModal.value = false
      groupForm.value = {
        id: 0,
        name: '',
        friendlyName: '',
        proxies: 0,
        traffic: 0,
        out_limit: 0,
        in_limit: 0,
        no_cn_out_limit: 0,
        no_cn_in_limit: 0,
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
      proxies: editGroupForm.value.proxies,
      traffic: editGroupForm.value.traffic,
      out_limit: editGroupForm.value.out_limit,
      in_limit: editGroupForm.value.in_limit,
      no_cn_out_limit: editGroupForm.value.no_cn_out_limit,
      no_cn_in_limit: editGroupForm.value.no_cn_in_limit,
      setUserGroup: SetUserGroup.value,
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

// 获取通知列表
const fetchBroadcasts = async () => {
  try {
    const data = await adminApi.getBroadcastList()
    if (data.code === 0) {
      broadcastsData.value = data.data || []
      filterBroadcasts()
    } else {
      message.error(data.message || '获取通知列表失败')
    }
  } catch (error) {
    message.error((error as ApiError).message)
  }
}

// 添加通知
const handleAddBroadcast = async () => {
  try {
    const data = await adminApi.createBroadcast({
      title: addBroadcastForm.value.title,
      message: addBroadcastForm.value.message,
      type: addBroadcastForm.value.type,
    })
    if (data.code === 0) {
      message.success('添加通知成功')
      showAddBroadcastModal.value = false
      addBroadcastForm.value = {
        id: 0,
        title: '',
        message: '',
        type: 'info',
        created_at: '',
        updated_at: '',
      }
      await fetchBroadcasts()
    } else {
      message.error(data.message || '添加通知失败')
    }
  } catch (error) {
    message.error((error as ApiError).message)
  }
}

// 编辑通知
const handleEditBroadcast = async () => {
  try {
    const data = await adminApi.updateBroadcast({
      id: editBroadcastForm.value.id,
      title: editBroadcastForm.value.title,
      message: editBroadcastForm.value.message,
      type: editBroadcastForm.value.type,
    })
    if (data.code === 0) {
      message.success('修改通知成功')
      showEditBroadcastModal.value = false
      editBroadcastForm.value = {
        id: 0,
        title: '',
        message: '',
        type: 'info',
        created_at: '',
        updated_at: '',
      }
      await fetchBroadcasts()
    } else {
      message.error(data.message || '修改通知失败')
    }
  } catch (error) {
    message.error((error as ApiError).message)
  }
}

// 删除通知
const handleRemoveBroadcast = async (id: number) => {
  try {
    const data = await adminApi.deleteBroadcast(id)
    if (data.code === 0) {
      message.success('删除通知成功')
      await fetchBroadcasts()
    } else {
      message.error(data.message || '删除通知失败')
    }
  } catch (error) {
    message.error((error as ApiError).message)
  }
}

// 保存SMTP配置
const handleSaveSmtp = async () => {
  loading.value = true
  try {
    await smtpFormRef.value?.validate()
    const data = await adminApi.updateSmtpSetting({
      smtpServer: smtpForm.value.host,
      smtpPort: smtpForm.value.port,
      smtpUsername: smtpForm.value.username,
      smtpPassword: smtpForm.value.password,
      smtpFrom: smtpForm.value.fromEmail,
      smtpEncryption: smtpForm.value.encryption,
    })
    if (data.code === 0) {
      message.success(data.message || '保存SMTP配置成功')
    } else {
      message.error(data.message || '保存SMTP配置失败')
    }
  } catch (error) {
    message.error('保存SMTP配置失败')
  } finally {
    loading.value = false
  }
}

// 保存短信配置
const handleSaveSms = async () => {
  smsLoading.value = true
  try {
    await smsFormRef.value?.validate()
    const data = await adminApi.updateSmsSetting({
      appId: smsForm.value.appId,
      smsToken: smsForm.value.smsToken,
      template: smsForm.value.template,
    })
    if (data.code === 0) {
      message.success('保存短信配置成功')
    } else {
      message.error(data.message || '保存短信配置失败')
    }
  } catch (error) {
    message.error('保存短信配置失败')
  } finally {
    smsLoading.value = false
  }
}

const fetchSmtpSetting = async () => {
  try {
    const data = await adminApi.getSmtpSetting()
    if (data.code === 0) {
      smtpForm.value = {
        host: data.data.host,
        port: data.data.port,
        username: data.data.username,
        password: data.data.password,
        fromEmail: data.data.from,
        encryption: data.data.encryption,
      }
    } else {
      message.error(data.message || '获取SMTP配置失败')
    }
  } catch (error) {
    message.error((error as ApiError).message)
  }
}

const fetchSmsSetting = async () => {
  try {
    const data = await adminApi.getSmsSetting()
    if (data.code === 0) {
      smsForm.value = {
        appId: data.data.app_id,
        smsToken: data.data.token,
        template: data.data.context,
      }
    } else {
      message.error(data.message || '获取SMS配置失败')
    }
  } catch (error) {
    message.error((error as ApiError).message)
  }
}

// 切换标签时加载对应数据
const handleTabUpdate = (tab: string) => {
  switch (tab) {
    case 'security':
      // 安全设置已在初始化时获取，无需重新获取
      break
    case 'smtp':
      fetchSmtpSetting()
      break
    case 'sms':
      fetchSmsSetting()
      break
    case 'downloads':
      fetchDownloadSources()
      break
    case 'groups':
      fetchGroups()
      break
    case 'broadcast':
      fetchBroadcasts()
      break
  }
}

// 生命周期钩子 - 初始化加载基础设置
onMounted(() => {
  fetchAllSystemSettings()
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

.broadcast-filter-row {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  width: 100%;
  align-items: stretch;
}
.broadcast-filter-item {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  align-items: center;
}
.broadcast-filter-btn {
  flex: none;
  min-width: unset;
  width: auto;
  padding: 0 16px;
  height: 32px;
  align-self: center;
}

/* 移动端筛选区域样式 */
.download-filter-row-mobile,
.group-filter-row-mobile,
.broadcast-filter-row-mobile {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
  width: 100%;
}

.download-filter-item-mobile,
.group-filter-item-mobile,
.broadcast-filter-item-mobile {
  width: 100%;
  display: flex;
  align-items: center;
}

.download-filter-btn-mobile,
.group-filter-btn-mobile,
.broadcast-filter-btn-mobile {
  width: 100%;
  height: 36px;
  align-self: stretch;
}

/* 移动端表格横向滚动 */
:deep(.n-data-table-wrapper) {
  overflow-x: auto;
}

/* 范围输入框样式 */
.range-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.range-input {
  flex: 1;
}

.range-separator {
  line-height: 34px;
  flex-shrink: 0;
}

/* 桌面端固定宽度 */
@media screen and (min-width: 769px) {
  .range-input {
    flex: 0 0 auto;
    width: 110px;
  }
}

/* 移动端表单优化 */
@media screen and (max-width: 768px) {
  :deep(.n-form-item) {
    margin-bottom: 16px;
  }

  :deep(.n-form-item-label) {
    padding-bottom: 4px;
  }
}
</style>
