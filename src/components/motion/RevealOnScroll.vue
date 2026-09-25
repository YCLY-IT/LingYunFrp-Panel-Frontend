<template>
  <component
    :is="motion[props.as]"
    :initial="reduced ? false : 'hidden'"
    :while-in-view="reduced ? undefined : 'show'"
    :variants="variants"
    :in-view-options="{ once: props.once, amount: props.amount }"
    :while-hover="props.lift && !reduced ? hoverLift : undefined"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { motion, useReducedMotion } from 'motion-v'
import { hoverLift } from '@/utils/motion'

/**
 * 滚动进入视口时「模糊 + 上浮 + 淡入」的揭示容器。
 *
 * 系统开启「减少动态效果」时自动降级为直接显示（不产生位移/模糊）。
 */
const props = withDefaults(
  defineProps<{
    /** 渲染的标签，默认 div */
    as?: string
    /** 延迟（秒） */
    delay?: number
    /** 初始纵向位移（px） */
    y?: number
    /** 初始横向位移（px） */
    x?: number
    /** 初始缩放 */
    scale?: number
    /** 初始模糊（px），传 0 关闭 */
    blur?: number
    /** 进入视口的触发比例 */
    amount?: number
    /** 是否只播放一次 */
    once?: boolean
    /** 动画时长（秒） */
    duration?: number
    /** 悬浮时是否抬升 */
    lift?: boolean
  }>(),
  {
    as: 'div',
    delay: 0,
    y: 24,
    x: 0,
    scale: 1,
    blur: 8,
    amount: 0.25,
    once: true,
    duration: 0.6,
    lift: false,
  },
)

const reduced = useReducedMotion()

const variants = computed(() => ({
  hidden: {
    opacity: 0,
    y: props.y,
    x: props.x,
    scale: props.scale,
    filter: `blur(${props.blur}px)`,
  },
  show: {
    opacity: 1,
    y: 0,
    x: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: props.duration,
      delay: props.delay,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}))
</script>
