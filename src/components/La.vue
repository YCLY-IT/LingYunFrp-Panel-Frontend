<!--
  51LA 统计组件 - 页面中间布局设计
  
  使用方法：
  <La /> - 使用默认配置，显示在页面中间
  <La :show-footer="false" /> - 隐藏底部链接
  <La :display-order="[0, 1, 2]" /> - 自定义显示顺序
  <La :titles="['自定义标题1', '自定义标题2']" /> - 自定义标题
  <La :api-url="'https://your-custom-api.com'" /> - 自定义API地址
  
  属性说明：
  - showFooter: boolean - 是否显示底部链接，默认 true
  - displayOrder: number[] - 显示顺序，默认 [1, 3, 2, 4, 5]
    索引对应：0=最近活跃访客, 1=今日人数, 2=今日访问, 3=昨日人数, 4=昨日访问, 5=本月访问, 6=总访问量
  - titles: string[] - 统计项标题，默认 ['最近活跃访客', '今日人数', '今日访问', '昨日人数', '昨日访问', '本月访问', '总访问量']
  - apiUrl: string - 51LA API地址，默认 'https://v6-widget.51.la/v6/JkxJmzzWDhbGjOFf/quote.js'
  
  样式特点：
  - 页面中间布局
  - 默认显示部分统计项，点击展开全部
  - 响应式设计，支持移动端
  - 加载状态和错误状态处理
  - 紧凑的布局设计
  - 支持暗黑模式
-->

<template>
  <div class="statistic-container" :class="{ 'expanded': isExpanded, 'dark-mode': isDarkMode }">
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
          <div v-for="(index, i) in visibleDisplayOrder" :key="i" class="statistic-item">
            <span class="statistic-title">{{ props.titles[index] }}</span>
            <span class="statistic-value">{{ statisticData[index] || '0' }}</span>
          </div>
          <!-- 展开时显示全部 -->
          <div v-if="isExpanded" v-for="(index, i) in hiddenDisplayOrder" :key="`hidden-${i}`" class="statistic-item">
            <span class="statistic-title">{{ props.titles[index] }}</span>
            <span class="statistic-value">{{ statisticData[index] || '0' }}</span>
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
import { ref, onMounted, computed, inject, Ref } from 'vue'
import { AlertCircleIcon, ChevronUpIcon, ChevronDownIcon } from 'lucide-vue-next'

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

const props = withDefaults(defineProps<Props>(), {
  showFooter: true,
  displayOrder: () => [1, 3, 2, 4, 5], // 默认显示：今日人数、昨日人数、今日访问、昨日访问、本月访问
  titles: () => ['最近活跃访客', '今日人数', '今日访问', '昨日人数', '昨日访问', '本月访问', '总访问量'],
  apiUrl: 'https://v6-widget.51.la/v6/JkxJmzzWDhbGjOFf/quote.js'
})

// 注入主题状态
const { isDarkMode } = inject('theme', {
  isDarkMode: ref(false)
}) as {
  isDarkMode: Ref<boolean>
}

const statisticContent = ref<HTMLElement>()
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

// 获取统计数据
const fetchStatisticData = async (): Promise<string[] | null> => {
  try {
    const response = await fetch(props.apiUrl)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.text()
    
    // 使用正则表达式提取数字
    const matches = data.match(/(?<=<\/span><span>).*?(?=<\/span><\/p>)/g)
    if (!matches || matches.length === 0) {
      throw new Error('无法解析统计数据')
    }
    return matches
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
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
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
  
  // 暗黑模式下的样式 - 使用媒体查询
  @media (prefers-color-scheme: dark) {
    .statistic-bar {
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
  
  // 暗黑模式下的样式 - 使用Naive UI的类名
  :deep(.n-theme-dark) .statistic-bar {
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
          color: #73A6FF;
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
    color: #73A6FF;
    margin-left: 16px;
    white-space: nowrap;
    
    a {
      color: #73A6FF;
      text-decoration: none;
      transition: color 0.2s ease;
      
      &:hover {
        color: #8CAEFF;
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
}

// 响应式设计
@media (max-width: 768px) {
  .statistic-container {
    bottom: 15px;
    
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
    bottom: 10px;
    
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
