<template>
  <div>
    <n-scrollbar
      class="home-scrollbar overflow-hidden [&_.n-scrollbar-container]:h-full"
      :style="{ height: scrollbarHeight }"
    >
      <div
        class="landing-page text-[var(--n-text-color)] bg-[var(--n-color)] [--navbar-height:56px]"
      >
        <section
          class="hero relative min-h-[calc(100vh-var(--navbar-height,56px))] flex items-center overflow-hidden max-md:[--navbar-height:65px] max-md:py-10"
        >
          <div
            class="hero-bg absolute inset-0 bg-cover bg-center blur-[4px] scale-105"
            aria-hidden="true"
          />
          <div
            class="absolute inset-0 z-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.45),rgba(0,0,0,0.35))]"
            aria-hidden="true"
          />
          <div
            class="hero-aurora z-0 left-[6%] top-[10%] w-[38vw] h-[38vw] bg-[var(--n-primary-color,#18a058)]"
            aria-hidden="true"
          />
          <div
            class="hero-aurora hero-aurora--slow z-0 right-[2%] top-[24%] w-[32vw] h-[32vw] bg-[#2080f0]"
            aria-hidden="true"
          />
          <div
            class="hero-aurora z-0 left-[36%] bottom-[2%] w-[26vw] h-[26vw] bg-[#9060f0]"
            aria-hidden="true"
          />
          <div class="hero-grid z-0" aria-hidden="true" />

          <div
            class="max-w-[1200px] mb-10 px-[60px] max-md:px-4"
          >
            <motion.div
              class="relative z-[1] flex items-center gap-10 max-md:flex-col max-md:gap-[30px] min-[768px]:max-[1023px]:gap-[30px]"
              initial="hidden"
              animate="show"
              :variants="staggerContainer(0.1, 0.08)"
            >
              <div class="flex-1">
                <motion.h2
                  class="text-[clamp(28px,5vw,48px)] font-extrabold leading-[1.2] mb-10 text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.35)] min-[768px]:max-[1023px]:text-[40px]"
                  :variants="fadeUp"
                >
                  <span
                    class="brand-sheen"
                    :style="{ color: themeStore.primaryColor }"
                    >{{ packageData.title }}</span
                  >
                  内网穿透
                </motion.h2>
                <motion.p
                  class="text-[clamp(16px,2.5vw,18px)] leading-[1.6] mb-8 max-w-[560px] text-white/92 [text-shadow:0_1px_8px_rgba(0,0,0,0.3)]"
                  :variants="fadeUp"
                >
                  免费、易用、安全、稳定、快速、极低占用
                </motion.p>
                <motion.div
                  class="mt-8 [&_.n-button]:text-white/92"
                  :variants="fadeUp"
                >
                  <n-space :vertical="isMobile" :size="isMobile ? 12 : 16">
                    <template v-if="!isLogin">
                      <div class="btn-shine rounded-full">
                        <n-button
                          type="primary"
                          :size="isMobile ? 'medium' : 'large'"
                          block
                          @click="router.push('/login')"
                          >立即登录
                        </n-button>
                      </div>
                    </template>
                    <template v-else>
                      <div class="btn-shine rounded-full">
                        <n-button
                          type="primary"
                          :size="isMobile ? 'medium' : 'large'"
                          block
                          @click="router.push('/dashboard')"
                          >管理面板
                        </n-button>
                      </div>
                    </template>
                    <n-button
                      :size="isMobile ? 'medium' : 'large'"
                      block
                      @click="scrollToFeatures"
                      >了解更多</n-button
                    >
                  </n-space>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        <section
          class="py-10 bg-[var(--n-color-modal)] min-[768px]:max-[1023px]:py-[50px]"
          id="features-section"
        >
          <div class="max-w-[1200px] mx-auto mb-10 px-[20px] max-md:px-4">
            <motion.div
              class="text-center mb-10 max-md:mb-[30px]"
              :variants="fadeUp"
              initial="hidden"
              while-in-view="show"
              :in-view-options="viewportOnce"
            >
              <h2 class="text-[clamp(24px,4vw,36px)] font-bold mb-4 text-[var(--n-text-color)] min-[768px]:max-[1023px]:text-[32px]">为什么选择我们的 FRP 服务</h2>
              <p class="text-[clamp(14px,2vw,18px)] text-[var(--n-text-color-3)] max-w-[700px] mx-auto leading-[1.6]">
                我们提供简单易用、安全可靠的内网穿透服务，满足您的各种需求
              </p>
            </motion.div>
            <motion.div
              initial="hidden"
              while-in-view="show"
              :variants="staggerContainer(0.08)"
              :in-view-options="viewportOnce"
            >
              <n-grid
                :cols="quickStartGridCols"
                responsive="screen"
                :x-gap="isMobile ? 16 : 24"
                :y-gap="isMobile ? 16 : 24"
              >
                <n-grid-item v-for="feature in features" :key="feature.title">
                  <motion.div
                    class="h-full card-glow rounded-2xl"
                    :variants="fadeUpSm"
                    :while-hover="hoverLift"
                    @pointermove="handleCardPointerMove"
                  >
                    <n-card
                      class="h-full flex flex-col items-center text-center p-[24px_16px] max-md:p-[20px_16px]"
                    >
                      <div class="mb-5 text-[var(--n-primary-color)]">
                        <n-icon :size="isMobile ? 28 : 36" :depth="3">
                          <component :is="feature.icon" />
                        </n-icon>
                      </div>
                      <h3
                        class="text-[clamp(16px,2.5vw,20px)] font-semibold mb-3 text-[var(--n-text-color)]"
                      >
                        {{ feature.title }}
                      </h3>
                      <p
                        class="text-[var(--n-text-color-3)] leading-[1.6] text-[clamp(13px,2vw,15px)]"
                      >
                        {{ feature.description }}
                      </p>
                    </n-card>
                  </motion.div>
                </n-grid-item>
              </n-grid>
            </motion.div>
          </div>
        </section>

        <section class="py-10 min-[768px]:max-[1023px]:py-[50px]">
          <div class="max-w-[1200px] mx-auto mb-10 px-[20px] max-md:px-4">
            <motion.div
              class="text-center mb-10 max-md:mb-[30px]"
              :variants="fadeUp"
              initial="hidden"
              while-in-view="show"
              :in-view-options="viewportOnce"
            >
              <h2 class="text-[clamp(24px,4vw,36px)] font-bold mb-4 text-[var(--n-text-color)] min-[768px]:max-[1023px]:text-[32px]">适用场景</h2>
              <p class="text-[clamp(14px,2vw,18px)] text-[var(--n-text-color-3)] max-w-[700px] mx-auto leading-[1.6]">
                {{ packageData.title }} 可以应用于多种场景，满足您的不同需求
              </p>
            </motion.div>
            <motion.div
              initial="hidden"
              while-in-view="show"
              :variants="staggerContainer(0.1)"
              :in-view-options="viewportOnce"
            >
              <n-timeline>
                <n-timeline-item
                  v-for="(useCase, index) in useCases"
                  :key="index"
                  :type="useCase.type"
                  :title="useCase.title"
                >
                  <motion.div :variants="slideInLeft" :while-hover="hoverLift">
                    <n-card>
                      <div class="flex items-center gap-6">
                        <div class="flex-1">
                          <p>{{ useCase.description }}</p>
                        </div>
                      </div>
                    </n-card>
                  </motion.div>
                </n-timeline-item>
              </n-timeline>
            </motion.div>
          </div>
        </section>

        <section
          class="py-10 bg-[var(--n-color-modal)] min-[768px]:max-[1023px]:py-[50px]"
        >
          <div class="max-w-[1200px] mx-auto mb-10 px-[60px] max-md:px-4">
            <motion.div
              class="text-center mb-10 max-md:mb-[30px]"
              :variants="fadeUp"
              initial="hidden"
              while-in-view="show"
              :in-view-options="viewportOnce"
            >
              <h2 class="text-[clamp(24px,4vw,36px)] font-bold mb-4 text-[var(--n-text-color)] min-[768px]:max-[1023px]:text-[32px]">服务优势</h2>
              <p class="text-[clamp(14px,2vw,18px)] text-[var(--n-text-color-3)] max-w-[700px] mx-auto leading-[1.6]">
                选择 {{ packageData.title }}，享受专业的内网穿透服务体验
              </p>
            </motion.div>
            <n-grid
              :cols="gridCols"
              responsive="screen"
              :x-gap="isMobile ? 16 : 24"
              :y-gap="isMobile ? 16 : 24"
            >
            </n-grid>
          </div>
        </section>

        <section
          class="py-[60px] bg-[var(--n-color-modal)] mt-10 max-md:py-10 max-md:mt-6 min-[768px]:max-[1023px]:py-[50px]"
        >
          <div
            class="max-w-[1200px] mx-auto mb-10 px-[20px] max-md:px-4 max-md:mb-6"
          >
            <motion.div
              class="text-center mb-10 max-md:mb-[30px]"
              :variants="fadeUp"
              initial="hidden"
              while-in-view="show"
              :in-view-options="viewportOnce"
            >
              <h2 class="text-[clamp(24px,4vw,36px)] font-bold mb-4 text-[var(--n-text-color)] min-[768px]:max-[1023px]:text-[32px]">快速开始</h2>
              <p class="text-[clamp(14px,2vw,18px)] text-[var(--n-text-color-3)] max-w-[700px] mx-auto leading-[1.6]">
                只需几个简单步骤，即可开始使用 {{ packageData.title }} 服务
              </p>
            </motion.div>
            <motion.div
              initial="hidden"
              while-in-view="show"
              :variants="staggerContainer(0.12)"
              :in-view-options="viewportOnce"
            >
              <n-grid
                :cols="gridCols"
                responsive="screen"
                :x-gap="isMobile ? 16 : 24"
                :y-gap="isMobile ? 16 : 24"
              >
                <n-grid-item
                  v-for="(step, index) in quickStartSteps"
                  :key="index"
                >
                  <motion.div
                    class="h-full"
                    :variants="fadeUpSm"
                    :while-hover="hoverLiftShadow"
                  >
                    <n-card
                      class="step-card group relative text-center h-full group-hover:[&_.step-icon]:scale-110 max-md:min-w-0 max-md:max-w-full max-md:p-[24px_20px] min-[768px]:max-[1023px]:min-w-[180px] min-[768px]:max-[1023px]:max-w-[240px] min-[768px]:max-[1023px]:p-[28px_20px]"
                      :class="{
                        'border border-[var(--n-primary-color)] [&_.step-number]:bg-[var(--n-primary-color)] [&_.step-number]:text-white [&_.step-icon]:text-[var(--n-primary-color)] [&_.step-title]:text-[var(--n-primary-color)]':
                          index === 0 - 1,
                      }"
                    >
                      <template #header>
                        <div
                          class="flex flex-col items-center relative pt-5 max-[767px]:pt-1"
                        >
                          <div
                            class="w-8 h-8 bg-[var(--n-color-modal)] text-[var(--n-text-color)] rounded-full flex items-center justify-center font-bold text-sm shadow-[0_4px_8px_rgba(0,0,0,0.1)] mb-3 max-[767px]:w-7 max-[767px]:h-7 max-[767px]:text-xs max-[767px]:mb-2"
                          >
                            {{ index + 1 }}
                          </div>
                          <div
                            class="step-icon mb-4 text-[var(--n-primary-color)] transition-all duration-300 ease-in-out max-[767px]:mb-3"
                          >
                            <n-icon :size="isMobile ? 32 : 40" :depth="3">
                              <component :is="step.icon" />
                            </n-icon>
                          </div>
                        </div>
                      </template>
                      <div class="py-2 max-[767px]:py-1">
                        <h3
                          class="text-[clamp(16px,2.5vw,18px)] font-semibold mb-3 text-[var(--n-text-color)] transition-colors duration-300 ease-in-out max-[767px]:text-base max-[767px]:mb-2"
                        >
                          {{ step.title }}
                        </h3>
                        <p
                          class="text-[var(--n-text-color-3)] leading-[1.6] text-[clamp(13px,2vw,14px)] transition-colors duration-300 ease-in-out max-[767px]:text-[13px]"
                        >
                          {{ step.description }}
                        </p>
                      </div>
                      <div
                        class="absolute -right-[25px] top-1/2 -translate-y-1/2 text-[var(--n-primary-color)] z-[1] max-[767px]:hidden"
                        v-if="index < quickStartSteps.length - 1"
                      >
                        <n-icon :size="isMobile ? 20 : 2">
                          <ArrowRightIcon />
                        </n-icon>
                      </div>
                    </n-card>
                  </motion.div>
                </n-grid-item>
              </n-grid>
            </motion.div>
          </div>
        </section>

        <section class="py-10 min-[768px]:max-[1023px]:py-[50px]">
          <div class="max-w-[1200px] mx-auto mb-10 px-[20px] max-md:px-4">
            <motion.div
              class="text-center mb-10 max-md:mb-[30px]"
              :variants="fadeUp"
              initial="hidden"
              while-in-view="show"
              :in-view-options="viewportOnce"
            >
              <h2 class="text-[clamp(24px,4vw,36px)] font-bold mb-4 text-[var(--n-text-color)] min-[768px]:max-[1023px]:text-[32px]">常见问题</h2>
              <p class="text-[clamp(14px,2vw,18px)] text-[var(--n-text-color-3)] max-w-[700px] mx-auto leading-[1.6]">了解更多关于我们服务的信息</p>
            </motion.div>
            <motion.div
              :variants="fadeUp"
              initial="hidden"
              while-in-view="show"
              :in-view-options="viewportOnce"
            >
              <n-collapse>
                <n-collapse-item
                  v-for="(item, index) in faqItems"
                  :key="index"
                  :title="item.question"
                  :name="index"
                >
                  {{ item.answer }}
                </n-collapse-item>
              </n-collapse>
            </motion.div>
          </div>
        </section>

        <section
          class="py-10 bg-[var(--n-color-modal)] min-[768px]:max-[1023px]:py-[50px]"
        >
          <div class="max-w-[1200px] mx-auto mb-10 px-[20px] max-md:px-4">
            <motion.div
              class="flex items-center justify-between gap-10 max-md:flex-col max-md:text-center max-md:gap-6"
              :variants="staggerContainer(0.1)"
              initial="hidden"
              while-in-view="show"
              :in-view-options="viewportOnce"
            >
              <motion.div class="flex-1" :variants="slideInLeft">
                <h2 class="text-[clamp(24px,4vw,36px)] font-bold mb-4 text-[var(--n-text-color)] min-[768px]:max-[1023px]:text-[32px]">准备好开始了吗？</h2>
                <p class="text-[clamp(14px,2vw,18px)] text-[var(--n-text-color-3)] leading-[1.6]">
                  立即注册，开始使用我们的
                  {{ packageData.title }} 服务，享受高速稳定的内网穿透体验。
                </p>
              </motion.div>
              <motion.div
                class="contact-action"
                :variants="fadeUpSm"
                :while-hover="hoverLift"
              >
                <template v-if="!isLogin">
                  <n-button
                    type="primary"
                    :size="isMobile ? 'medium' : 'large'"
                    block
                    @click="router.push('/login')"
                    >立即登录
                  </n-button>
                </template>
                <template v-else>
                  <n-button
                    type="primary"
                    :size="isMobile ? 'medium' : 'large'"
                    block
                    @click="router.push('/dashboard')"
                    >管理面板
                  </n-button>
                </template>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <footer class="pt-10 pb-5 bg-[var(--n-color)]">
          <motion.div
            class="max-w-[1200px] mx-auto mb-10 px-[20px] max-md:px-4"
            :variants="fadeUp"
            initial="hidden"
            while-in-view="show"
            :in-view-options="viewportOnce"
          >
            <div
              class="flex justify-between mb-[30px] max-md:flex-col max-md:gap-5 max-md:text-center"
            >
              <div class="max-w-[300px] max-md:max-w-none max-md:w-full">
                <n-gradient-text type="primary" :size="isMobile ? 20 : 24">{{
                  packageData.title
                }}</n-gradient-text>
                <p
                  class="mt-4 text-[var(--n-text-color-3)] text-[clamp(13px,2vw,15px)]"
                >
                  专业的内网穿透服务提供商
                </p>
              </div>
              <div class="footer-links"></div>
            </div>

            <div
              class="flex justify-center w-full mt-20 -mb-[60px] max-md:mt-4 max-md:mb-0"
            >
              <La />
            </div>

            <div
              class="flex justify-between items-center pt-5 flex-wrap gap-4 max-md:flex-col max-md:text-center max-md:gap-3"
            >
              <div
                class="text-[var(--n-text-color-3)] text-[clamp(12px,2vw,14px)] leading-[1.5]"
              >
                © {{ new Date().getFullYear() }} {{ packageData.title }} 服务.
                保留所有权利.<br />
                Powered By
                <a
                  class="text-[var(--n-text-color-3)] transition-colors duration-200 ease-in no-underline hover:text-[var(--n-primary-color)]"
                  :href="packageData.ycly"
                  target="_blank"
                  >云创联跃IT</a
                >
              </div>
              <div
                class="flex gap-4 max-md:order-1 max-md:my-2 max-md:min-w-full max-md:max-w-full"
              >
                <a :href="packageData.github" class="text-[var(--n-text-color-3)] transition-colors duration-200 ease-in no-underline hover:text-[var(--n-primary-color)]">
                  <n-icon :size="isMobile ? 20 : 25"><GithubIcon /></n-icon>
                </a>
                <a :href="packageData.ycly" class="text-[var(--n-text-color-3)] transition-colors duration-200 ease-in no-underline hover:text-[var(--n-primary-color)]">
                  <n-icon :size="isMobile ? 20 : 25"><CloudIcon /></n-icon>
                </a>
              </div>
            </div>
          </motion.div>
        </footer>
      </div>
    </n-scrollbar>
  </div>
</template>

<script setup lang="ts">
import packageData from '../../package.json'
import { BING_BG_URL } from '@/constants/bing'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { NScrollbar } from 'naive-ui'
import {
  ZapIcon,
  ShieldIcon,
  SettingsIcon,
  MonitorIcon,
  ServerIcon,
  DatabaseIcon,
  GithubIcon,
  CloudIcon,
  UserIcon,
  DownloadIcon,
  PlayIcon,
  ArrowRightIcon,
} from 'lucide-vue-next'
import router from '@/router'
import La from '@/components/La.vue'
import { useThemeStore } from '@/stores/theme'
import { motion } from 'motion-v'
import {
  fadeUp,
  fadeUpSm,
  slideInLeft,
  staggerContainer,
  viewportOnce,
  hoverLift,
  hoverLiftShadow,
} from '@/utils/motion'

const themeStore = useThemeStore()
const isLogin = ref(false)

const navbarHeight = ref(56)
const scrollbarHeight = computed(() => `calc(100vh - ${navbarHeight.value}px)`)

const windowWidth = ref(window.innerWidth)

const isMobile = computed(() => windowWidth.value < 768)
const isTablet = computed(
  () => windowWidth.value >= 768 && windowWidth.value < 1024,
)

const gridCols = computed(() => {
  if (isMobile.value) return 1
  if (isTablet.value) return 2
  return 4
})

const quickStartGridCols = computed(() => {
  if (isMobile.value) return 1
  if (isTablet.value) return 2
  return 3
})

const handleResize = () => {
  windowWidth.value = window.innerWidth
}

/** 特性卡片：把指针相对坐标写入 CSS 变量，驱动跟随光晕 */
const handleCardPointerMove = (event: PointerEvent) => {
  const el = event.currentTarget as HTMLElement | null
  if (!el) return
  const rect = el.getBoundingClientRect()
  el.style.setProperty('--mx', `${event.clientX - rect.left}px`)
  el.style.setProperty('--my', `${event.clientY - rect.top}px`)
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 特性数据
const features = [
  {
    icon: ZapIcon,
    title: '高性能',
    description:
      '基于高效的网络库实现，支持高并发连接，保证数据传输的稳定性和速度。',
  },
  {
    icon: ShieldIcon,
    title: '安全可靠',
    description:
      '支持 TLS 加密传输，保护您的数据安全，防止中间人攻击和数据泄露。',
  },
  {
    icon: SettingsIcon,
    title: '简单易用',
    description: '提供简洁的界面，轻松配置和管理您的内网穿透服务。',
  },
  {
    icon: MonitorIcon,
    title: '实时监控',
    description: '提供详细的流量统计和连接状态监控，让您随时了解服务运行情况。',
  },
  {
    icon: ServerIcon,
    title: '多协议支持',
    description: '支持 TCP、UDP、HTTP、HTTPS 等多种协议，满足不同场景的需求。',
  },
  {
    icon: DatabaseIcon,
    title: '多平台兼容',
    description:
      '支持 Windows、Linux、macOS 等多种操作系统，无需担心平台兼容问题。',
  },
]

// 使用场景
const useCases = [
  {
    type: 'success',
    title: '远程办公',
    description: `通过 ${packageData.title} 服务，您可以在任何地方安全地访问公司内网资源，实现远程办公和协作。`,
  },
  {
    type: 'info',
    title: '开发测试',
    description:
      '将本地开发环境暴露到公网，方便团队协作测试和演示，加速开发流程。',
  },
  {
    type: 'warning',
    title: '智能家居',
    description: `通过 ${packageData.title} 服务，您可以在外网时远程控制和监控家中的智能设备，提升生活便利性。`,
  },
  {
    type: 'error',
    title: '游戏联机',
    description: `使用 ${packageData.title} 服务，您可以轻松搭建游戏服务器，与朋友一起享受游戏乐趣。`,
  },
]

// 快速开始步骤
const quickStartSteps = [
  {
    icon: UserIcon,
    title: '注册账号',
    description: '创建您的账户，获取访问权限',
  },
  {
    icon: SettingsIcon,
    title: '创建隧道',
    description: '在控制面板中配置您的隧道',
  },
  {
    icon: DownloadIcon,
    title: '下载客户端',
    description: '下载并安装客户端软件',
  },
  {
    icon: PlayIcon,
    title: '开始使用',
    description: '启动客户端，享受内网穿透服务',
  },
]

// 常见问题
const faqItems = [
  {
    question: 'FRP 是什么？',
    answer:
      'FRP（Fast Reverse Proxy）是一个可用于内网穿透的高性能的反向代理应用，支持 TCP、UDP、HTTP、HTTPS 等多种协议。通过在具有公网 IP 的节点上部署 frps 服务端，可以轻松地将内网服务穿透到公网，使得外网用户可以访问内网资源。',
  },
  {
    question: `如何开始使用 ${packageData.title} 服务？`,
    answer:
      '注册账号后，您可以在控制面板中创建隧道，选择协议类型和端口，然后下载客户端，按照指引在您的设备上运行客户端即可完成配置。',
  },
  {
    question: `${packageData.title} 服务支持哪些操作系统？`,
    answer: `${packageData.title} 客户端支持 Windows、Linux、macOS 等主流操作系统，您可以根据自己的需求选择合适的版本。`,
  },
  {
    question: `使用 ${packageData.title} 服务是否安全？`,
    answer: `我们的 ${packageData.title}服务支持 TLS 加密传输，可以有效保护您的数据安全。同时，我们还提供了多种安全配置选项，如认证、访问控制等，进一步增强服务的安全性。`,
  },
  {
    question: '如何获取技术支持？',
    answer: '您可以加入QQ群获取技术支持。',
  },
]

const scrollToFeatures = () => {
  const featuresSection = document.getElementById('features-section')
  if (featuresSection) {
    featuresSection.scrollIntoView({ behavior: 'smooth' })
  }
}

function loadUserInfo() {
  const tokenStr =
    localStorage.getItem('Authorization') ||
    sessionStorage.getItem('Authorization')
  if (!tokenStr) {
    return
  }
  isLogin.value = true
}

onMounted(() => {
  const bgUrl = BING_BG_URL
  const heroBg = document.querySelector('.hero-bg') as HTMLElement
  if (heroBg) {
    heroBg.style.backgroundImage = `url('${bgUrl}')`
  }
  loadUserInfo()
  document.documentElement.classList.add('home-scroll-lock')
  requestAnimationFrame(() => {
    const navbars = document.querySelectorAll<HTMLElement>('.navbar')
    let height = 56
    navbars.forEach((el) => {
      if (el.offsetHeight > 0) height = el.offsetHeight
    })
    navbarHeight.value = height
  })
})

onUnmounted(() => {
  document.documentElement.classList.remove('home-scroll-lock')
})
</script>




