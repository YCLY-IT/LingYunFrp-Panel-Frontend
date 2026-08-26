<template>
  <div
    class="statistic-container"
    :class="{ expanded: isExpanded, 'dark-mode': isDarkMode }"
  >
    <div class="statistic-bar" @click="toggleExpand">
      <div class="statistic-content" ref="statisticContent">
        <div v-if="loading" class="loading">
          <n-spin size="small" />
          <span>加载中...</span>
        </div>
        <div v-else-if="error" class="error">
          <n-icon color="#ff4d4f" :size="12">
            <AlertCircleIcon />
          </n-icon>
          <span>统计加载失败</span>
        </div>
        <div v-else class="statistic-items">
          <!-- 默认显示前3个统计项 -->
          <div
            v-for="(index, i) in visibleDisplayOrder"
            :key="i"
            class="statistic-item"
          >
            <span class="statistic-title">{{ props.titles[index] }}</span>
            <span class="statistic-value">{{
              statisticData[index] || '0'
            }}</span>
          </div>
          <!-- 展开时显示全部 -->
          <div
            v-if="isExpanded"
            v-for="(index, i) in hiddenDisplayOrder"
            :key="`hidden-${i}`"
            class="statistic-item"
          >
            <span class="statistic-title">{{ props.titles[index] }}</span>
            <span class="statistic-value">{{
              statisticData[index] || '0'
            }}</span>
          </div>
        </div>
      </div>

      <div v-if="showFooter" class="statistic-footer">
        <span>统计：</span>
        <a href="https://v6.51.la/" target="_blank" rel="noopener">51la</a>
      </div>

      <!-- 展开/收起指示器 -->
      <div class="expand-indicator">
        <n-icon :size="12" :depth="3">
          <component :is="isExpanded ? ChevronDownIcon : ChevronUpIcon" />
        </n-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import {
  AlertCircleIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from 'lucide-vue-next'
import { getLaStatistic } from '@/net/user/user'
import { useThemeStore } from '@/stores/theme'

// 组件属性定义
interface Props {
  // 是否显示底部链接
  showFooter?: boolean
  // 自定义显示顺序，数组中的数字对应统计项索引
  displayOrder?: number[]
  // 自定义统计项标题
  titles?: string[]
  // 51LA的API地址
  apiUrl?: string
}

const themeStore = useThemeStore()

const props = withDefaults(defineProps<Props>(), {
  showFooter: true,
  displayOrder: () => [1, 3, 2, 4, 5], // 默认显示：今日人数、昨日人数、今日访问、昨日访问、本月访问
  titles: () => [
    '最近活跃访客',
    '今日人数',
    '今日访问',
    '昨日人数',
    '昨日访问',
    '本月访问',
    '总访问量',
  ],
  apiUrl: 'https://v6-widget.51.la/v6/3MYttaE5F5kzUqrF/quote.js',
})

// 注入主题状态
const isDarkMode = computed(() => themeStore.theme === 'dark')

const loading = ref(true)
const error = ref(false)
const statisticData = ref<string[]>([])
const isExpanded = ref(false)

// 计算可见的显示顺序（默认显示前3个）
const visibleDisplayOrder = computed(() => {
  return props.displayOrder.slice(0, 3)
})

// 计算隐藏的显示顺序（展开时显示）
const hiddenDisplayOrder = computed(() => {
  return props.displayOrder.slice(3)
})

// 切换展开状态
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

// 用 user 接口统一获取统计数据
const fetchStatisticData = async (): Promise<string[] | null> => {
  try {
    return await getLaStatistic(props.apiUrl)
  } catch (err) {
    console.error('获取统计数据失败:', err)
    return null
  }
}

// 组件挂载时获取数据
onMounted(async () => {
  try {
    loading.value = true
    error.value = false

    const data = await fetchStatisticData()
    if (data) {
      statisticData.value = data
    } else {
      error.value = true
    }
  } catch (err) {
    console.error('统计数据加载失败:', err)
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>

<style lang="scss" scoped>
.statistic-container {
  position: static;
  display: flex;
  justify-content: center;
  width: 100%;
  margin: 24px 0 0;
  transition: all 0.3s ease;

  &.expanded {
    .statistic-bar {
      max-width: 600px;
      min-width: 500px;
    }
  }

  .statistic-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 40px;
    padding: 0 20px;
    background-color: #ffffff;
    border-radius: 20px;
    border: 1px solid #e1e5e9;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    cursor: pointer;
    transition: all 0.3s ease;
    max-width: 500px;
    min-width: 400px;

    &:hover {
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
      transform: translateY(-1px);
    }
  }

  // 暗黑模式下的样式 - 使用动态类名
  &.dark-mode .statistic-bar {
    background-color: #18181c !important;
    border-color: rgba(255, 255, 255, 0.1) !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;

    &:hover {
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4) !important;
    }

    .loading,
    .error {
      color: rgba(240, 240, 240, 0.7) !important;
    }

    .statistic-items .statistic-item .statistic-title {
      color: rgba(240, 240, 240, 0.7) !important;
    }

    .expand-indicator {
      color: rgba(240, 240, 240, 0.7) !important;
    }
  }
}
// 暗黑模式下的样式 - 使用媒体查询

.statistic-content {
  flex: 1;
  display: flex;
  align-items: center;
  height: 100%;

  .loading,
  .error {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #666666;
    font-size: 14px;
    height: 100%;
  }

  .statistic-items {
    display: flex;
    align-items: center;
    gap: 20px;
    height: 100%;
    flex-wrap: wrap;

    .statistic-item {
      display: flex;
      align-items: center;
      gap: 6px;
      height: 100%;
      white-space: nowrap;

      .statistic-title {
        font-size: 13px;
        color: #666666;
        line-height: 1;
      }

      .statistic-value {
        font-size: 13px;
        font-weight: 600;
        color: #73a6ff;
        line-height: 1;
      }
    }
  }
}

.statistic-footer {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #73a6ff;
  margin-left: 16px;
  white-space: nowrap;

  a {
    color: #73a6ff;
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: #8caeff;
    }
  }
}

.expand-indicator {
  display: flex;
  align-items: center;
  margin-left: 12px;
  color: #999999;
  transition: transform 0.3s ease;
}

// 响应式设计
@media (max-width: 768px) {
  .statistic-container {
    margin: 20px 0 0;

    &.expanded {
      .statistic-bar {
        max-width: 400px;
        min-width: 350px;
      }
    }

    .statistic-bar {
      height: 36px;
      padding: 0 16px;
      max-width: 350px;
      min-width: 300px;

      .statistic-content {
        .statistic-items {
          gap: 16px;

          .statistic-item {
            gap: 4px;

            .statistic-title {
              font-size: 12px;
            }

            .statistic-value {
              font-size: 12px;
            }
          }
        }
      }

      .statistic-footer {
        font-size: 11px;
        margin-left: 12px;
      }

      .expand-indicator {
        margin-left: 8px;
      }
    }
  }
}

// 超小屏幕适配
@media (max-width: 480px) {
  .statistic-container {
    margin: 16px 0 0;

    &.expanded {
      .statistic-bar {
        max-width: 320px;
        min-width: 280px;
      }
    }

    .statistic-bar {
      height: 32px;
      padding: 0 12px;
      max-width: 280px;
      min-width: 240px;

      .statistic-content {
        .statistic-items {
          gap: 12px;

          .statistic-item {
            gap: 3px;

            .statistic-title {
              font-size: 11px;
            }

            .statistic-value {
              font-size: 11px;
            }
          }
        }
      }

      .statistic-footer {
        font-size: 10px;
        margin-left: 8px;
      }

      .expand-indicator {
        margin-left: 6px;
      }
    }
  }
}
</style>
