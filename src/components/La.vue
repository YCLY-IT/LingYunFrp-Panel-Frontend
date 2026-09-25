<template>
  <div
    class="static flex justify-center w-full mt-6 transition-all duration-300 ease-in-out max-md:mt-5 max-[480px]:mt-4"
    :class="
      isDarkMode
        ? '[&_.statistic-bar]:bg-[#18181c]! [&_.statistic-bar]:border-white/10! [&_.statistic-bar]:shadow-[0_4px_12px_rgba(0,0,0,0.3)]! [&_.statistic-bar:hover]:shadow-[0_6px_16px_rgba(0,0,0,0.4)]! [&_.loading]:text-[rgba(240,240,240,0.7)]! [&_.error]:text-[rgba(240,240,240,0.7)]! [&_.statistic-item_.statistic-title]:text-[rgba(240,240,240,0.7)]! [&_.expand-indicator]:text-[rgba(240,240,240,0.7)]!'
        : ''
    "
  >
    <div
      class="flex items-center justify-between h-10 px-5 bg-white rounded-[20px] border border-[#e1e5e9] shadow-[0_4px_12px_rgba(0,0,0,0.15)] cursor-pointer transition-all duration-300 ease-in-out hover:shadow-[0_6px_16px_rgba(0,0,0,0.2)] hover:-translate-y-px max-md:h-auto max-md:min-h-9 max-md:py-1 max-md:px-4 max-[480px]:min-h-8 max-[480px]:px-3"
      :class="
        isExpanded
          ? 'max-w-[600px] min-w-[500px] max-md:max-w-[400px] max-md:min-w-[350px] max-[480px]:max-w-[320px] max-[480px]:min-w-[280px]'
          : 'max-w-[500px] min-w-[400px] max-md:max-w-[350px] max-md:min-w-[300px] max-[480px]:max-w-[280px] max-[480px]:min-w-[240px]'
      "
      @click="toggleExpand"
    >
      <div class="flex-1 flex items-center h-full" ref="statisticContent">
        <div
          v-if="loading"
          class="flex items-center gap-1 text-[#666666] text-sm h-full"
        >
          <n-spin size="small" />
          <span>加载中...</span>
        </div>
        <div
          v-else-if="error"
          class="flex items-center gap-1 text-[#666666] text-sm h-full"
        >
          <n-icon color="#ff4d4f" :size="12">
            <AlertCircleIcon />
          </n-icon>
          <span>统计加载失败</span>
        </div>
        <div
          v-else
          class="flex items-center gap-5 h-full flex-wrap max-md:gap-4 max-[480px]:gap-3"
        >
          <!-- 默认显示前3个统计项 -->
          <div
            v-for="(index, i) in visibleDisplayOrder"
            :key="i"
            class="flex items-center gap-1.5 h-full whitespace-nowrap max-md:gap-1 max-[480px]:gap-[3px]"
          >
            <span
              class="text-[13px] text-[#666666] leading-none max-md:text-xs max-[480px]:text-[11px]"
              >{{ props.titles[index] }}</span
            >
            <span
              class="text-[13px] font-semibold text-[#73a6ff] leading-none max-md:text-xs max-[480px]:text-[11px]"
              >{{ statisticData[index] || '0' }}</span
            >
          </div>
          <!-- 展开时显示全部 -->
          <div
            v-if="isExpanded"
            v-for="(index, i) in hiddenDisplayOrder"
            :key="`hidden-${i}`"
            class="flex items-center gap-1.5 h-full whitespace-nowrap max-md:gap-1 max-[480px]:gap-[3px]"
          >
            <span
              class="text-[13px] text-[#666666] leading-none max-md:text-xs max-[480px]:text-[11px]"
              >{{ props.titles[index] }}</span
            >
            <span
              class="text-[13px] font-semibold text-[#73a6ff] leading-none max-md:text-xs max-[480px]:text-[11px]"
              >{{ statisticData[index] || '0' }}</span
            >
          </div>
        </div>
      </div>

      <div
        v-if="showFooter"
        class="flex items-center gap-1 text-xs text-[#73a6ff] ml-4 whitespace-nowrap max-md:text-[11px] max-md:ml-3 max-[480px]:text-[10px] max-[480px]:ml-2 [&_a]:text-[#73a6ff] [&_a]:no-underline [&_a]:transition-colors [&_a]:duration-200 [&_a]:ease-in [&_a:hover]:text-[#8caeff]"
      >
        <span>统计：</span>
        <a href="https://v6.51.la/" target="_blank" rel="noopener">51la</a>
      </div>

      <!-- 展开/收起指示器 -->
      <div
        class="flex items-center ml-3 text-[#999999] transition-transform duration-300 ease-in-out max-md:ml-2 max-[480px]:ml-1.5"
      >
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
