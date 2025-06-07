<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-4xl mx-auto">
      <n-space vertical size="large" class="mt-6">
        <!-- 面板信息卡片 -->
        <n-card title="面板信息" hoverable>
          <template #header-extra>
            <n-tag type="success" round>
              <template #icon>
                <n-icon><CheckCircle /></n-icon>
              </template>
              运行中
            </n-tag>
          </template>
          
          <n-descriptions :column="2" bordered>
            <n-descriptions-item label="面板版本">
              <n-tag type="info">v{{ packageData.version }}</n-tag>
            </n-descriptions-item>
            <n-descriptions-item label="最后日期">
              {{ formattedDate }}
            </n-descriptions-item>
            <n-descriptions-item label="技术栈" :span="2">
              <n-space>
                <n-tag type="primary">Vue 3</n-tag>
                <n-tag type="success">Naive UI</n-tag>
                <n-tag type="warning">TypeScript</n-tag>
                <n-tag type="error">Vite</n-tag>
                <n-tag type="info">Pinia</n-tag>
              </n-space>
            </n-descriptions-item>
            <n-descriptions-item label="运行环境" :span="2">
              <n-space>
                <n-tag>Docker</n-tag>
                <n-tag>OpenResty</n-tag>
                <n-tag>PostgreSQL</n-tag>
                <n-tag>Redis</n-tag>
              </n-space>
            </n-descriptions-item>
          </n-descriptions>
        </n-card>

        <!-- 功能特性 -->
        <n-card title="功能特性" hoverable>
          <n-grid :cols="3" :x-gap="16" :y-gap="16">
            <n-grid-item>
              <n-thing>
                <template #avatar>
                  <n-avatar color="#18a058">
                    <n-icon><Zap /></n-icon>
                  </n-avatar>
                </template>
                <template #header>高性能</template>
                <template #description>
                  基于 Vue 3 Composition API，提供出色的性能表现
                </template>
              </n-thing>
            </n-grid-item>
            <n-grid-item>
              <n-thing>
                <template #avatar>
                  <n-avatar color="#2080f0">
                    <n-icon><Shield /></n-icon>
                  </n-avatar>
                </template>
                <template #header>安全可靠</template>
                <template #description>
                  多层安全防护，保障数据安全和系统稳定
                </template>
              </n-thing>
            </n-grid-item>
            <n-grid-item>
              <n-thing>
                <template #avatar>
                  <n-avatar color="#f0a020">
                    <n-icon><Smartphone /></n-icon>
                  </n-avatar>
                </template>
                <template #header>响应式设计</template>
                <template #description>
                  适配各种设备，提供一致的用户体验
                </template>
              </n-thing>
            </n-grid-item>
          </n-grid>
        </n-card>

        <!-- 更新日志 -->
        <n-card title="更新日志" hoverable>
          <template #header-extra>
            <n-button 
              size="small" 
              type="primary" 
              ghost 
              @click="fetchGetGitHubCommits"
              :loading="loading"
            >
              <template #icon>
                <n-icon><RefreshCw /></n-icon>
              </template>
              刷新
            </n-button>
          </template>
          
          <n-spin :show="loading">
            <n-timeline v-if="commits.length > 0">
              <n-timeline-item
                v-for="(commit, index) in visibleCommits"
                :key="commit.sha"
                :type="getCommitType(commit.commit.message)"
                :title="getCommitTitle(commit.commit.message)"
                :content="getCommitContent(commit.commit.message)"
                :time="formatDate(commit.commit.author.date)"
              >
                <template #icon>
                  <n-avatar 
                    :src="commit.author.avatar_url" 
                    :alt="commit.author.login"
                    :style="{ width: 'auto', height: 'auto' }"
                    style="transform: scale(1.9);"
                  />
                </template>
                <template #footer>
                  <n-space size="small">
                    <n-tag size="small" type="info">
                      {{ commit.author.login }}
                    </n-tag>
                    <n-button 
                      size="tiny" 
                      text 
                      type="primary"
                      @click="openCommit(commit.html_url)"
                    >
                      查看详情
                    </n-button>
                  </n-space>
                </template>
              </n-timeline-item>
            </n-timeline>
            
            <n-empty 
              v-else-if="!loading" 
              description="暂无更新记录"
              style="margin: 40px 0;"
            />
            
            <div v-if="!loading && commits.length > 0" class="text-center mt-4">
              <n-space justify="center">
                <n-button 
                  v-if="visibleCount > 5" 
                  @click="showLess" 
                  type="warning" 
                  ghost
                >
                  收回
                </n-button>
                <n-button 
                  v-if="visibleCount < commits.length" 
                  @click="showMore" 
                  type="primary"
                >
                  显示更多...
                </n-button>
              </n-space>
            </div>
          </n-spin>
        </n-card>

        <!-- 联系信息 -->
        <n-card title="联系信息" hoverable>
          <n-grid :cols="2" :x-gap="16">
            <n-grid-item>
              <n-space vertical>
                <n-thing>
                  <template #avatar>
                    <n-icon size="24" color="#18a058"><Mail /></n-icon>
                  </template>
                  <template #header>邮箱地址</template>
                  <template #description>1263115878@qq.com</template>
                </n-thing>
                <n-thing style="margin-top: 16px;">
                  <template #avatar>
                    <n-icon size="24" color="#d03050"><MessageCircle /></n-icon>
                  </template>
                  <template #header>QQ 群</template>
                  <template #description><n-text @click="handleAddQQGroup" style="color: aquamarine;">882670857</n-text></template>
                </n-thing>
              </n-space>
            </n-grid-item>
            <n-grid-item>
              <n-space vertical>
                <n-thing>
                  <template #avatar>
                    <n-icon size="24" color="#f0a020"><Globe /></n-icon>
                  </template>
                  <template #header>官方网站</template>
                  <template #description>{{ packageData.ycly }}</template>
                </n-thing>
                <n-thing style="margin-top: 16px;">
                  <template #avatar>
                    <n-icon size="24" color="#2080f0"><Github /></n-icon>
                  </template>
                  <template #header>GitHub</template>
                  <template #description>{{ packageData.github }}</template>
                </n-thing>
              </n-space>
            </n-grid-item>
          </n-grid>
        </n-card>

        <!-- 许可证信息 -->
        <n-card title="许可证信息" hoverable>
          <n-alert type="info" show-icon>
            <template #icon>
              <n-icon><FileText /></n-icon>
            </template>
            本项目基于 AGPL 3.0 许可证开源
          </n-alert>
          <br>
          <div class="mt-4">
            <n-space>
              <n-button type="primary" ghost @click="viewLicense">
                查看完整许可证
              </n-button>
              <n-button type="default" @click="downloadSource">
                打开项目源代码
              </n-button>
            </n-space>
          </div>
        </n-card>
      </n-space>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import {
  NCard,
  NDescriptions,
  NDescriptionsItem,
  NTag,
  NSpace,
  NAvatar,
  NButton,
  NIcon,
  NGrid,
  NGridItem,
  NThing,
  NAlert,
  NTimeline,
  NTimelineItem,
  NSpin,
  NEmpty,
  NText,
  useMessage
} from 'naive-ui'
import {
  CheckCircle,
  MessageCircle,
  Zap,
  Shield,
  Smartphone,
  Mail,
  Globe,
  Github,
  FileText,
  RefreshCw
} from 'lucide-vue-next'

import packageData from '../../../../package.json'
import { userApi } from '@/net'
import { accessHandle } from '@/net/base'

interface GitHubCommit {
  sha: string
  html_url: string
  author: {
    login: string
    avatar_url: string
  }
  commit: {
    author: {
      name: string
      email: string
      date: string
    }
    message: string
  }
}

const message = useMessage()
const commits = ref<GitHubCommit[]>([])
const visibleCommits = ref<GitHubCommit[]>([])
const visibleCount = ref(3)
const loading = ref(false)

const formattedDate = computed(() => {
  return new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
})

const handleAddQQGroup = () => {
  message.info('正在跳转 QQ 群...')
  window.open('http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=lKysMDnalZOkdAPhOoar-F6fnMVatr9A&authKey=ahTVSjZZdthWiZZwGJzuy6BwJFaljsB%2FIfxeVyrehz2zr8GlovYdGfU99Tq5tq0m&noverify=0&group_code=882670857')
}

const viewLicense = () => {
  message.info('正在打开许可证页面...')
  window.open('https://www.gnu.org/licenses/agpl-3.0.zh-cn.html')
}

const downloadSource = () => {
  message.success('正在打开...')
  window.open(packageData.github + '/LingYunFrp-Panel-Frontend')
}

const openCommit = (url: string) => {
  window.open(url, '_blank')
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getCommitType = (message: string) => {
  if (message.startsWith('feat')) return 'success'
  if (message.startsWith('fix')) return 'error'
  if (message.startsWith('docs')) return 'info'
  if (message.startsWith('style') || message.startsWith('refactor')) return 'warning'
  return 'default'
}

const getCommitTitle = (message: string) => {
  const lines = message.split('\n')
  const firstLine = lines[0]
  
  // 提取类型和描述
  const match = firstLine.match(/^(\w+)(?:\([^)]*\))?: (.+)$/)
  if (match) {
    const [, type, description] = match
    const typeMap: Record<string, string> = {
      feat: '✨ 新功能',
      fix: '🐛 修复',
      docs: '📝 文档',
      style: '💄 样式',
      refactor: '♻️ 重构',
      perf: '⚡ 性能',
      test: '✅ 测试',
      chore: '🔧 构建'
    }
    return `${typeMap[type] || '📦 更新'}: ${description}`
  }
  
  return firstLine
}

const getCommitContent = (message: string) => {
  const lines = message.split('\n').slice(1).filter(line => line.trim())
  return lines.length > 0 ? lines.join(' ') : '查看提交详情了解更多信息'
}

const fetchGetGitHubCommits = async () => {
  loading.value = true
  try {
    userApi.get('/user/info/githubCommits', accessHandle(), (data) => {
      console.log('GitHub 提交记录:', data.data)
      commits.value = data.data || []
      // 初始化显示前五条
      visibleCommits.value = commits.value.slice(0, visibleCount.value)
    }, (messageText) => {
      message.warning(messageText)
    }, (err) => {
      message.error('获取 GitHub 提交记录失败: ' + err.message)
    })
  } catch (error) {
    message.error('获取 GitHub 提交记录失败: ' + error)
  } finally {
    loading.value = false
  }
}

const showMore = () => {
  visibleCount.value += 5
  visibleCommits.value = commits.value.slice(0, visibleCount.value)
}

const showLess = () => {
  visibleCount.value = 3
  visibleCommits.value = commits.value.slice(0, visibleCount.value)
}

onMounted(() => {
  fetchGetGitHubCommits()
})
</script>

<style scoped>
.n-card {
  margin-bottom: 16px;
}
</style>