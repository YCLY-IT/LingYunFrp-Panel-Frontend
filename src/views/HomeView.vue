<template>
  <n-config-provider>
    <div class="landing-page">
      <div class="particles-container" ref="particlesContainer"></div>

      <div class="floating-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
        <div class="shape shape-5"></div>
      </div>

      <section class="hero">
        <div class="hero-overlay"></div>
        <div class="container">
          <div class="hero-content">
            <div class="hero-text">
              <div class="hero-badge">
                <n-icon :size="16"><ZapIcon /></n-icon>
                <span>高性能内网穿透</span>
              </div>
              <h1 class="hero-title">
                <span class="title-line">
                  <span class="typing-text" ref="typingText"></span>
                  <span class="cursor">|</span>
                </span>
              </h1>
              <p class="hero-description">
                {{
                  packageData.title
                }}
                是一个专注于内网穿透的高性能反向代理应用，支持
                TCP、UDP、HTTP、HTTPS
                等多种协议，让您轻松实现内网服务的外网访问。
              </p>
              <div class="hero-actions">
                <n-space :vertical="isMobile" :size="isMobile ? 12 : 16">
                  <n-button
                    type="primary"
                    :size="isMobile ? 'medium' : 'large'"
                    block
                    @click="handleLogin"
                    class="hero-btn-primary"
                  >
                    <template #icon>
                      <n-icon><RocketIcon /></n-icon>
                    </template>
                    立即开始
                  </n-button>
                  <n-button
                    :size="isMobile ? 'medium' : 'large'"
                    block
                    @click="scrollToFeatures"
                    class="hero-btn-secondary"
                  >
                    <template #icon>
                      <n-icon><ArrowDownIcon /></n-icon>
                    </template>
                    了解更多
                  </n-button>
                </n-space>
              </div>
              <div class="hero-stats">
                <div class="stat-item">
                  <div class="stat-number">
                    <span class="counter" ref="counter1">{{
                      heroStats.users
                    }}</span
                    >+
                  </div>
                  <div class="stat-label">总用户</div>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                  <div class="stat-number">
                    <span class="counter" ref="counter2">{{
                      heroStats.nodes
                    }}</span
                    >+
                  </div>
                  <div class="stat-label">服务节点</div>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                  <div class="stat-number">
                    <span class="counter" ref="counter3">{{
                      heroStats.proxies
                    }}</span
                    >+
                  </div>
                  <div class="stat-label">运行隧道</div>
                </div>
              </div>
            </div>
            <div class="hero-visual">
              <div class="hero-image-wrapper">
                <div class="glow-ring"></div>
                <div class="hero-image-container">
                  <div class="code-window">
                    <div class="code-header">
                      <div class="code-dots">
                        <span class="dot red"></span>
                        <span class="dot yellow"></span>
                        <span class="dot green"></span>
                      </div>
                      <span class="code-title">frpc.ini</span>
                    </div>
                    <div class="code-content">
                      <pre><code><span class="code-keyword">[common]</span>
<span class="code-property">server_addr</span> = <span class="code-string">"frp.example.com"</span>
<span class="code-property">server_port</span> = <span class="code-number">7000</span>

<span class="code-keyword">[web]</span>
<span class="code-property">type</span> = <span class="code-string">"http"</span>
<span class="code-property">local_port</span> = <span class="code-number">8080</span>
<span class="code-property">custom_domains</span> = <span class="code-string">"app.example.com"</span></code></pre>
                    </div>
                  </div>
                </div>
                <div class="floating-icons">
                  <div class="floating-icon icon-1">
                    <n-icon :size="24"><ServerIcon /></n-icon>
                  </div>
                  <div class="floating-icon icon-2">
                    <n-icon :size="24"><ShieldIcon /></n-icon>
                  </div>
                  <div class="floating-icon icon-3">
                    <n-icon :size="24"><ZapIcon /></n-icon>
                  </div>
                  <div class="floating-icon icon-4">
                    <n-icon :size="24"><GlobeIcon /></n-icon>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="scroll-indicator" @click="scrollToFeatures">
          <div class="mouse">
            <div class="wheel"></div>
          </div>
          <span>向下滚动</span>
          <div class="scroll-arrow">
            <n-icon :size="20"><ChevronDownIcon /></n-icon>
          </div>
        </div>
      </section>

      <section class="features" id="features-section" ref="featuresSection">
        <div class="container">
          <div class="section-header" v-scroll-animation>
            <span class="section-tag">核心功能</span>
            <h2 class="section-title">为什么选择我们</h2>
            <p class="section-description">
              我们提供简单易用、安全可靠的内网穿透服务，满足您的各种需求
            </p>
          </div>
          <n-grid
            :cols="featureGridCols"
            responsive="screen"
            :x-gap="isMobile ? 16 : 24"
            :y-gap="isMobile ? 16 : 24"
          >
            <n-grid-item
              v-for="(feature, index) in features"
              :key="feature.title"
            >
              <div
                class="feature-card-3d"
                v-scroll-animation
                :style="{ animationDelay: `${index * 0.1}s` }"
                @mousemove="handleCardMouseMove($event, index)"
                @mouseleave="handleCardMouseLeave(index)"
                :ref="
                  (el) => {
                    if (el) featureCards[index] = el
                  }
                "
              >
                <div class="feature-card-inner">
                  <div class="feature-card-content">
                    <div class="feature-icon-wrapper">
                      <div class="feature-icon-bg"></div>
                      <n-icon :size="isMobile ? 28 : 36" class="feature-icon">
                        <component :is="feature.icon" />
                      </n-icon>
                    </div>
                    <h3 class="feature-title">{{ feature.title }}</h3>
                    <p class="feature-description">{{ feature.description }}</p>
                  </div>
                  <div class="feature-card-shine"></div>
                </div>
              </div>
            </n-grid-item>
          </n-grid>
        </div>
      </section>

      <section class="stats-section">
        <div class="container">
          <div class="stats-grid">
            <div
              class="stats-card"
              v-for="(stat, index) in statsData"
              :key="index"
              v-scroll-animation
              :style="{ animationDelay: `${index * 0.15}s` }"
            >
              <div class="stats-icon">
                <n-icon :size="32"><component :is="stat.icon" /></n-icon>
              </div>
              <div class="stats-content">
                <div class="stats-number">{{ stat.value }}</div>
                <div class="stats-label">{{ stat.label }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="use-cases" ref="useCasesSection">
        <div class="container">
          <div class="section-header" v-scroll-animation>
            <span class="section-tag">应用场景</span>
            <h2 class="section-title">适用场景</h2>
            <p class="section-description">
              {{ packageData.title }} 可以应用于多种场景，满足您的不同需求
            </p>
          </div>
          <div class="use-cases-grid">
            <div
              v-for="(useCase, index) in useCases"
              :key="index"
              class="use-case-card"
              v-scroll-animation
              :style="{ animationDelay: `${index * 0.1}s` }"
            >
              <div class="use-case-icon" :class="useCase.type">
                <n-icon :size="32"><component :is="useCase.icon" /></n-icon>
              </div>
              <h3 class="use-case-title">{{ useCase.title }}</h3>
              <p class="use-case-description">{{ useCase.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <section class="quick-start" ref="quickStartSection">
        <div class="container">
          <div class="section-header" v-scroll-animation>
            <span class="section-tag">快速上手</span>
            <h2 class="section-title">快速开始</h2>
            <p class="section-description">
              只需几个简单步骤，即可开始使用 {{ packageData.title }} 服务
            </p>
          </div>
          <div class="steps-container">
            <div class="steps-line"></div>
            <div
              v-for="(step, index) in quickStartSteps"
              :key="index"
              class="step-item"
              v-scroll-animation
              :style="{ animationDelay: `${index * 0.2}s` }"
            >
              <div class="step-number-wrapper">
                <div class="step-number">{{ index + 1 }}</div>
              </div>
              <div class="step-card">
                <div class="step-icon">
                  <n-icon :size="32"><component :is="step.icon" /></n-icon>
                </div>
                <h3 class="step-title">{{ step.title }}</h3>
                <p class="step-description">{{ step.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="faq" ref="faqSection">
        <div class="container">
          <div class="section-header" v-scroll-animation>
            <span class="section-tag">帮助中心</span>
            <h2 class="section-title">常见问题</h2>
            <p class="section-description">了解更多关于我们服务的信息</p>
          </div>
          <div class="faq-grid" v-scroll-animation>
            <div
              v-for="(item, index) in faqItems"
              :key="index"
              class="faq-item"
              :class="{ 'faq-item-active': activeFaq === index }"
              @click="activeFaq = activeFaq === index ? -1 : index"
            >
              <div class="faq-question">
                <span>{{ item.question }}</span>
                <n-icon :size="20" class="faq-arrow">
                  <ChevronDownIcon />
                </n-icon>
              </div>
              <div class="faq-answer">
                <p>{{ item.answer }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="cta-section">
        <div class="container">
          <div class="cta-content" v-scroll-animation>
            <div class="cta-bg"></div>
            <h2 class="cta-title">准备好开始了吗？</h2>
            <p class="cta-description">
              立即注册，开始使用
              {{ packageData.title }} 服务，享受高速稳定的内网穿透体验
            </p>
            <n-button
              type="primary"
              size="large"
              @click="handleLogin"
              class="cta-button"
            >
              <template #icon>
                <n-icon><RocketIcon /></n-icon>
              </template>
              立即开始使用
            </n-button>
          </div>
        </div>
      </section>

      <footer class="footer">
        <div class="container">
          <div class="footer-content">
            <div class="footer-brand">
              <n-gradient-text
                type="primary"
                :size="isMobile ? 20 : 28"
                class="footer-logo"
              >
                {{ packageData.title }}
              </n-gradient-text>
              <p class="footer-tagline">专业的内网穿透服务提供商</p>
            </div>
            <div class="footer-links">
              <a :href="packageData.github" target="_blank" class="footer-link">
                <n-icon :size="20"><GithubIcon /></n-icon>
                <span>GitHub</span>
              </a>
              <a :href="packageData.ycly" target="_blank" class="footer-link">
                <n-icon :size="20"><GlobeIcon /></n-icon>
                <span>官网</span>
              </a>
            </div>
          </div>
          <div class="footer-bottom">
            <p class="copyright">
              © {{ new Date().getFullYear() }} {{ packageData.title }}. All
              rights reserved.
            </p>
            <p class="powered-by">
              Powered by
              <a :href="packageData.ycly" target="_blank">云创联跃IT</a>
            </p>
          </div>
        </div>
      </footer>
    </div>

    <La />
  </n-config-provider>
</template>

<script setup lang="ts">
import packageData from '../../package.json'
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import {
  ZapIcon,
  ShieldIcon,
  SettingsIcon,
  ServerIcon,
  DatabaseIcon,
  GithubIcon,
  UserIcon,
  DownloadIcon,
  PlayIcon,
  RocketIcon,
  GlobeIcon,
  ArrowDownIcon,
  ChevronDownIcon,
  UsersIcon,
  Globe2Icon,
  ActivityIcon,
  HomeIcon,
  CodeIcon,
  Gamepad2Icon,
  LinkIcon,
} from 'lucide-vue-next'
import router from '@/router'
import La from '@/components/La.vue'
import { userApi } from '@/net'

const windowWidth = ref(window.innerWidth)
const isMobile = computed(() => windowWidth.value < 768)
const isTablet = computed(
  () => windowWidth.value >= 768 && windowWidth.value < 1024,
)

const featureGridCols = computed(() => {
  if (isMobile.value) return 1
  if (isTablet.value) return 2
  return 3
})

const handleResize = () => {
  windowWidth.value = window.innerWidth
}

const particlesContainer = ref<HTMLElement | null>(null)
const typingText = ref<HTMLElement | null>(null)
const featureCards = ref<any[]>([])
const activeFaq = ref(-1)

const features = [
  {
    icon: ZapIcon,
    title: '极速性能',
    description:
      '基于高效的网络库实现，支持高并发连接，保证数据传输的稳定性和速度。',
  },
  {
    icon: ShieldIcon,
    title: '安全加密',
    description:
      '支持 TLS 加密传输，保护您的数据安全，防止中间人攻击和数据泄露。',
  },
  {
    icon: SettingsIcon,
    title: '简单配置',
    description: '提供简洁的配置界面，轻松配置和管理您的内网穿透服务。',
  },
  {
    icon: ServerIcon,
    title: '多协议支持',
    description: '支持 TCP、UDP、HTTP、HTTPS 等多种协议，满足不同场景需求。',
  },
  {
    icon: DatabaseIcon,
    title: '多平台兼容',
    description: '支持 Windows、Linux、macOS 等多种操作系统，跨平台无缝使用。',
  },
  {
    icon: ActivityIcon,
    title: '实时监控',
    description: '提供详细的流量统计和连接状态监控，随时了解服务运行情况。',
  },
]

const heroStats = ref({
  users: 0,
  nodes: 0,
  proxies: 0,
})

const statsData = ref([
  { icon: UsersIcon, value: '0', label: '活跃用户' },
  { icon: Globe2Icon, value: '0', label: '服务节点' },
  { icon: LinkIcon, value: '0', label: '运行隧道' },
  { icon: DatabaseIcon, value: '0', label: '日传输量' },
])

const useCases = [
  {
    icon: HomeIcon,
    type: 'primary',
    title: '远程办公',
    description: '随时随地安全访问公司内网资源，实现高效远程办公和团队协作。',
  },
  {
    icon: CodeIcon,
    type: 'success',
    title: '开发测试',
    description: '将本地开发环境暴露到公网，方便团队协作测试和产品演示。',
  },
  {
    icon: ServerIcon,
    type: 'warning',
    title: '智能家居',
    description: '在外网时远程控制和监控家中的智能设备，提升生活便利性。',
  },
  {
    icon: Gamepad2Icon,
    type: 'error',
    title: '游戏联机',
    description: '轻松搭建游戏服务器，与朋友一起享受联机游戏乐趣。',
  },
]

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

const faqItems = [
  {
    question: 'FRP 是什么？',
    answer:
      'FRP（Fast Reverse Proxy）是一个可用于内网穿透的高性能反向代理应用，支持 TCP、UDP、HTTP、HTTPS 等多种协议。通过在具有公网 IP 的节点上部署 frps 服务端，可以轻松地将内网服务穿透到公网。',
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
    answer: `我们的服务支持 TLS 加密传输，可以有效保护您的数据安全。同时，我们还提供了多种安全配置选项，如认证、访问控制等，进一步增强服务的安全性。`,
  },
]

const handleLogin = () => {
  router.push('/login')
}

const scrollToFeatures = () => {
  const featuresSection = document.getElementById('features-section')
  if (featuresSection) {
    featuresSection.scrollIntoView({ behavior: 'smooth' })
  }
}

const handleCardMouseMove = (e: MouseEvent, index: number) => {
  const card = featureCards.value[index]
  if (!card) return

  const rect = card.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const centerX = rect.width / 2
  const centerY = rect.height / 2
  const rotateX = (y - centerY) / 10
  const rotateY = (centerX - x) / 10

  const inner = card.querySelector('.feature-card-inner') as HTMLElement
  if (inner) {
    inner.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
  }

  const shine = card.querySelector('.feature-card-shine') as HTMLElement
  if (shine) {
    shine.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.3), transparent 50%)`
  }
}

const handleCardMouseLeave = (index: number) => {
  const card = featureCards.value[index]
  if (!card) return

  const inner = card.querySelector('.feature-card-inner') as HTMLElement
  if (inner) {
    inner.style.transform =
      'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)'
  }
}

const createParticles = () => {
  if (!particlesContainer.value) return

  const particleCount = isMobile.value ? 30 : 60

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div')
    particle.className = 'particle'
    particle.style.cssText = `
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      width: ${Math.random() * 4 + 2}px;
      height: ${Math.random() * 4 + 2}px;
      animation-delay: ${Math.random() * 5}s;
      animation-duration: ${Math.random() * 10 + 10}s;
    `
    particlesContainer.value.appendChild(particle)
  }
}

const typingEffect = () => {
  if (!typingText.value) return

  const text = '快速可靠的内网穿透解决方案'
  let index = 0

  const type = () => {
    if (index < text.length) {
      typingText.value!.textContent += text.charAt(index)
      index++
      setTimeout(type, 100)
    }
  }

  setTimeout(type, 500)
}

const vScrollAnimation = {
  mounted(el: HTMLElement) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in')
          }
        })
      },
      { threshold: 0.1 },
    )
    observer.observe(el)
  },
}

const fetchStats = async () => {
  try {
    const res = await userApi.getHomeStats()
    if (res.code === 0 && res.data) {
      const data = res.data
      const users = data.totalUsers || 0
      const nodes = data.totalNodes || 0
      const proxies = data.activeProxies || 0

      heroStats.value = {
        users,
        nodes,
        proxies,
      }

      statsData.value = [
        { icon: UsersIcon, value: formatNumber(users), label: '活跃用户' },
        { icon: Globe2Icon, value: formatNumber(nodes), label: '服务节点' },
        { icon: LinkIcon, value: formatNumber(proxies), label: '运行隧道' },
        {
          icon: DatabaseIcon,
          value: formatTrafficMB(data.totalTraffic || 0),
          label: '总流量',
        },
      ]
    }
  } catch (err) {
    console.error('获取统计数据失败:', err)
  }
}

const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万+'
  }
  return num.toString()
}

const formatTrafficMB = (mb: number): string => {
  if (mb >= 1024 * 1024 * 1024) {
    return (mb / (1024 * 1024 * 1024)).toFixed(2) + ' PB'
  }
  if (mb >= 1024 * 1024) {
    return (mb / (1024 * 1024)).toFixed(2) + ' TB'
  }
  if (mb >= 1024) {
    return (mb / 1024).toFixed(2) + ' GB'
  }
  return mb.toFixed(2) + ' MB'
}

onMounted(() => {
  window.addEventListener('resize', handleResize)

  nextTick(() => {
    createParticles()
    typingEffect()
  })

  fetchStats()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="scss" scoped>
@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.8;
  }
}

@keyframes particleFloat {
  0%,
  100% {
    transform: translateY(0) translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) translateX(100px);
    opacity: 0;
  }
}

@keyframes gradientMove {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scrollDown {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  50% {
    transform: translateY(8px);
    opacity: 0.5;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(6px);
  }
}

@keyframes glowPulse {
  0%,
  100% {
    box-shadow: 0 0 20px rgba(14, 165, 233, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(14, 165, 233, 0.6);
  }
}

.landing-page {
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
  color: var(--n-text-color);
  background: var(--n-color);
  overflow-x: hidden;
  position: relative;
}

.particles-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;

  .particle {
    position: absolute;
    background: linear-gradient(135deg, #0ea5e9, #06b6d4);
    border-radius: 50%;
    animation: particleFloat linear infinite;
    opacity: 0.6;
  }
}

.floating-shapes {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;

  .shape {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    opacity: 0.15;
    animation: float 15s ease-in-out infinite;
  }

  .shape-1 {
    width: 400px;
    height: 400px;
    background: linear-gradient(135deg, #0ea5e9, #06b6d4);
    top: -100px;
    right: -100px;
    animation-delay: 0s;
  }

  .shape-2 {
    width: 300px;
    height: 300px;
    background: linear-gradient(135deg, #0284c7, #0891b2);
    bottom: 20%;
    left: -50px;
    animation-delay: -5s;
  }

  .shape-3 {
    width: 250px;
    height: 250px;
    background: linear-gradient(135deg, #14b8a6, #0ea5e9);
    top: 40%;
    right: 10%;
    animation-delay: -10s;
  }

  .shape-4 {
    width: 200px;
    height: 200px;
    background: linear-gradient(135deg, #06b6d4, #0891b2);
    bottom: 10%;
    right: 30%;
    animation-delay: -7s;
  }

  .shape-5 {
    width: 150px;
    height: 150px;
    background: linear-gradient(135deg, #0ea5e9, #14b8a6);
    top: 60%;
    left: 20%;
    animation-delay: -3s;
  }
}

.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  position: relative;

  .hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.1) 0%,
      transparent 30%,
      transparent 70%,
      rgba(0, 0, 0, 0.1) 100%
    );
    pointer-events: none;
  }

  .container {
    position: relative;
    z-index: 1;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 60px;
  }

  .hero-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: center;

    @media (max-width: 1024px) {
      grid-template-columns: 1fr;
      text-align: center;
    }
  }

  .hero-text {
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: linear-gradient(
        135deg,
        rgba(14, 165, 233, 0.1),
        rgba(6, 182, 212, 0.1)
      );
      border: 1px solid rgba(14, 165, 233, 0.2);
      border-radius: 100px;
      font-size: 14px;
      color: #0ea5e9;
      margin-bottom: 24px;
      animation: slideUp 0.6s ease-out;
    }

    .hero-title {
      font-size: clamp(36px, 6vw, 64px);
      font-weight: 800;
      line-height: 1.1;
      margin-bottom: 24px;
      animation: slideUp 0.6s ease-out 0.1s backwards;

      .title-line {
        display: block;
        background: linear-gradient(
          135deg,
          #0ea5e9 0%,
          #06b6d4 50%,
          #14b8a6 100%
        );
        background-size: 200% 200%;
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: gradientMove 5s ease infinite;
      }

      .cursor {
        display: inline-block;
        animation: blink 1s step-end infinite;
        -webkit-text-fill-color: #0ea5e9;
      }
    }

    .hero-description {
      font-size: clamp(16px, 2vw, 20px);
      line-height: 1.7;
      color: var(--n-text-color-2);
      margin-bottom: 32px;
      animation: slideUp 0.6s ease-out 0.2s backwards;
    }

    .hero-actions {
      margin-bottom: 48px;
      animation: slideUp 0.6s ease-out 0.3s backwards;

      .hero-btn-primary {
        background: linear-gradient(135deg, #0ea5e9, #06b6d4);
        border: none;
        padding: 12px 32px;
        font-weight: 600;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 40px rgba(14, 165, 233, 0.4);
        }
      }

      .hero-btn-secondary {
        background: transparent;
        border: 2px solid var(--n-border-color);
        padding: 12px 32px;
        font-weight: 600;
        transition: all 0.3s ease;

        &:hover {
          border-color: #0ea5e9;
          color: #0ea5e9;
        }
      }
    }

    .hero-stats {
      display: flex;
      align-items: center;
      gap: 32px;
      animation: slideUp 0.6s ease-out 0.4s backwards;

      @media (max-width: 768px) {
        justify-content: center;
        gap: 24px;
      }

      .stat-item {
        text-align: center;

        .stat-number {
          font-size: clamp(24px, 3vw, 36px);
          font-weight: 800;
          background: linear-gradient(135deg, #0ea5e9, #06b6d4);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .stat-label {
          font-size: 14px;
          color: var(--n-text-color-3);
          margin-top: 4px;
        }
      }

      .stat-divider {
        width: 1px;
        height: 40px;
        background: var(--n-border-color);
      }
    }
  }

  .hero-visual {
    position: relative;
    animation: slideUp 0.6s ease-out 0.3s backwards;

    @media (max-width: 1024px) {
      display: none;
    }

    .hero-image-wrapper {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .glow-ring {
      position: absolute;
      width: 400px;
      height: 400px;
      border-radius: 50%;
      border: 2px solid rgba(14, 165, 233, 0.3);
      animation: glowPulse 3s ease-in-out infinite;

      &::before {
        content: '';
        position: absolute;
        inset: -20px;
        border-radius: 50%;
        border: 1px solid rgba(14, 165, 233, 0.1);
      }
    }

    .hero-image-container {
      position: relative;
      z-index: 1;
    }

    .code-window {
      background: rgba(15, 23, 42, 0.95);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.1);
      min-width: 360px;

      .code-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        background: rgba(30, 41, 59, 0.8);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);

        .code-dots {
          display: flex;
          gap: 6px;

          .dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;

            &.red {
              background: #ef4444;
            }
            &.yellow {
              background: #f59e0b;
            }
            &.green {
              background: #10b981;
            }
          }
        }

        .code-title {
          color: rgba(255, 255, 255, 0.6);
          font-size: 13px;
          font-family: monospace;
        }
      }

      .code-content {
        padding: 20px;
        font-family: 'Fira Code', monospace;
        font-size: 13px;
        line-height: 1.6;

        pre {
          margin: 0;
          color: rgba(255, 255, 255, 0.9);
        }

        .code-keyword {
          color: #c084fc;
        }
        .code-property {
          color: #60a5fa;
        }
        .code-string {
          color: #34d399;
        }
        .code-number {
          color: #fbbf24;
        }
      }
    }

    .floating-icons {
      position: absolute;
      inset: 0;
      pointer-events: none;

      .floating-icon {
        position: absolute;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        animation: float 6s ease-in-out infinite;
        color: #0ea5e9;

        &.icon-1 {
          top: -20px;
          left: -20px;
          animation-delay: 0s;
        }
        &.icon-2 {
          top: -20px;
          right: -20px;
          animation-delay: -1.5s;
        }
        &.icon-3 {
          bottom: -20px;
          left: -20px;
          animation-delay: -3s;
        }
        &.icon-4 {
          bottom: -20px;
          right: -20px;
          animation-delay: -4.5s;
        }
      }
    }
  }

  .scroll-indicator {
    position: absolute;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: var(--n-text-color-3);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      color: #0ea5e9;

      .mouse {
        border-color: #0ea5e9;

        .wheel {
          background: #0ea5e9;
        }
      }

      .scroll-arrow {
        color: #0ea5e9;
        transform: translateY(4px);
      }
    }

    .mouse {
      width: 24px;
      height: 40px;
      border: 2px solid var(--n-text-color-3);
      border-radius: 12px;
      position: relative;
      transition: all 0.3s ease;

      .wheel {
        width: 4px;
        height: 8px;
        background: var(--n-text-color-3);
        border-radius: 2px;
        position: absolute;
        top: 8px;
        left: 50%;
        transform: translateX(-50%);
        animation: scrollDown 2s ease-in-out infinite;
      }
    }

    .scroll-arrow {
      animation: bounce 1.5s ease-in-out infinite;
      transition: all 0.3s ease;
    }
  }
}

.section-header {
  text-align: center;
  margin-bottom: 60px;

  .section-tag {
    display: inline-block;
    padding: 6px 16px;
    background: linear-gradient(
      135deg,
      rgba(14, 165, 233, 0.1),
      rgba(6, 182, 212, 0.1)
    );
    border: 1px solid rgba(14, 165, 233, 0.2);
    border-radius: 100px;
    font-size: 13px;
    color: #0ea5e9;
    margin-bottom: 16px;
    font-weight: 500;
  }

  .section-title {
    font-size: clamp(28px, 4vw, 42px);
    font-weight: 800;
    margin-bottom: 16px;
    background: linear-gradient(
      135deg,
      var(--n-text-color) 0%,
      var(--n-text-color-2) 100%
    );
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .section-description {
    font-size: clamp(14px, 2vw, 18px);
    color: var(--n-text-color-3);
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
  }
}

.features {
  padding: 100px 0;
  position: relative;
  z-index: 1;

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 40px;
  }

  .feature-card-3d {
    perspective: 1000px;
    height: 100%;

    .feature-card-inner {
      position: relative;
      background: var(--n-color-modal);
      border-radius: 20px;
      padding: 32px;
      transition: all 0.3s ease;
      border: 1px solid var(--n-border-color);
      overflow: hidden;
      height: 100%;
      transform-style: preserve-3d;

      &:hover {
        border-color: rgba(14, 165, 233, 0.3);
      }
    }

    .feature-card-content {
      position: relative;
      z-index: 1;
    }

    .feature-icon-wrapper {
      position: relative;
      width: 72px;
      height: 72px;
      margin-bottom: 24px;

      .feature-icon-bg {
        position: absolute;
        inset: 0;
        background: linear-gradient(
          135deg,
          rgba(14, 165, 233, 0.1),
          rgba(6, 182, 212, 0.1)
        );
        border-radius: 16px;
        transition: all 0.3s ease;
      }

      .feature-icon {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #0ea5e9;
        transition: all 0.3s ease;
      }
    }

    &:hover .feature-icon-wrapper {
      .feature-icon-bg {
        background: linear-gradient(
          135deg,
          rgba(14, 165, 233, 0.2),
          rgba(6, 182, 212, 0.2)
        );
        transform: scale(1.1);
      }

      .feature-icon {
        color: #0284c7;
        transform: translate(-50%, -50%) scale(1.1);
      }
    }

    .feature-title {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 12px;
      color: var(--n-text-color);
    }

    .feature-description {
      font-size: 15px;
      line-height: 1.6;
      color: var(--n-text-color-3);
    }

    .feature-card-shine {
      position: absolute;
      inset: 0;
      pointer-events: none;
      border-radius: 20px;
    }
  }
}

.stats-section {
  padding: 80px 0;
  background: linear-gradient(
    135deg,
    rgba(14, 165, 233, 0.05),
    rgba(6, 182, 212, 0.05)
  );
  position: relative;
  z-index: 1;

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 40px;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;

    @media (max-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .stats-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 24px;
    background: var(--n-color-modal);
    border-radius: 16px;
    border: 1px solid var(--n-border-color);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    }

    .stats-icon {
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(
        135deg,
        rgba(14, 165, 233, 0.1),
        rgba(6, 182, 212, 0.1)
      );
      border-radius: 12px;
      color: #0ea5e9;
    }

    .stats-content {
      .stats-number {
        font-size: 24px;
        font-weight: 800;
        color: var(--n-text-color);
      }

      .stats-label {
        font-size: 14px;
        color: var(--n-text-color-3);
      }
    }
  }
}

.use-cases {
  padding: 100px 0;
  position: relative;
  z-index: 1;

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 40px;
  }

  .use-cases-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;

    @media (max-width: 1024px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }
  }

  .use-case-card {
    padding: 32px;
    background: var(--n-color-modal);
    border-radius: 20px;
    border: 1px solid var(--n-border-color);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    }

    .use-case-icon {
      width: 64px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 16px;
      margin-bottom: 20px;

      &.primary {
        background: linear-gradient(
          135deg,
          rgba(14, 165, 233, 0.1),
          rgba(14, 165, 233, 0.2)
        );
        color: #0ea5e9;
      }

      &.success {
        background: linear-gradient(
          135deg,
          rgba(16, 185, 129, 0.1),
          rgba(16, 185, 129, 0.2)
        );
        color: #10b981;
      }

      &.warning {
        background: linear-gradient(
          135deg,
          rgba(245, 158, 11, 0.1),
          rgba(245, 158, 11, 0.2)
        );
        color: #f59e0b;
      }

      &.error {
        background: linear-gradient(
          135deg,
          rgba(239, 68, 68, 0.1),
          rgba(239, 68, 68, 0.2)
        );
        color: #ef4444;
      }
    }

    .use-case-title {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 12px;
      color: var(--n-text-color);
    }

    .use-case-description {
      font-size: 14px;
      line-height: 1.6;
      color: var(--n-text-color-3);
    }
  }
}

.quick-start {
  padding: 100px 0;
  background: linear-gradient(180deg, transparent, rgba(14, 165, 233, 0.03));
  position: relative;
  z-index: 1;

  .container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 40px;
  }

  .steps-container {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 32px;

    @media (min-width: 768px) {
      flex-direction: row;
      gap: 0;
    }

    .steps-line {
      display: none;

      @media (min-width: 768px) {
        display: block;
        position: absolute;
        top: 28px;
        left: calc(12.5% + 28px);
        right: calc(12.5% + 28px);
        height: 2px;
        background: linear-gradient(90deg, #0ea5e9, #06b6d4, #14b8a6);
        z-index: 0;
      }
    }
  }

  .step-item {
    position: relative;
    flex: 1;
    text-align: center;

    .step-number-wrapper {
      position: relative;
      z-index: 1;
      margin-bottom: 20px;
      display: flex;
      justify-content: center;

      .step-number {
        width: 56px;
        height: 56px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #0ea5e9, #06b6d4);
        color: white;
        font-size: 20px;
        font-weight: 800;
        border-radius: 50%;
        box-shadow: 0 4px 20px rgba(14, 165, 233, 0.3);
        border: 3px solid var(--n-color);
      }
    }

    .step-card {
      padding: 24px;
      background: var(--n-color-modal);
      border-radius: 16px;
      border: 1px solid var(--n-border-color);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      }

      .step-icon {
        width: 48px;
        height: 48px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(
          135deg,
          rgba(14, 165, 233, 0.1),
          rgba(6, 182, 212, 0.1)
        );
        border-radius: 12px;
        color: #0ea5e9;
        margin-bottom: 16px;
      }

      .step-title {
        font-size: 16px;
        font-weight: 700;
        margin-bottom: 8px;
        color: var(--n-text-color);
      }

      .step-description {
        font-size: 13px;
        color: var(--n-text-color-3);
      }
    }
  }
}

.faq {
  padding: 100px 0;
  position: relative;
  z-index: 1;

  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 40px;
  }

  .faq-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .faq-item {
    background: var(--n-color-modal);
    border-radius: 16px;
    border: 1px solid var(--n-border-color);
    overflow: hidden;
    transition: all 0.3s ease;

    &:hover {
      border-color: rgba(14, 165, 233, 0.3);
    }

    &.faq-item-active {
      .faq-question {
        color: #0ea5e9;
      }

      .faq-arrow {
        transform: rotate(180deg);
      }

      .faq-answer {
        max-height: 200px;
        padding: 0 20px 20px;
      }
    }

    .faq-question {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px;
      cursor: pointer;
      font-weight: 600;
      color: var(--n-text-color);
      transition: color 0.3s ease;

      .faq-arrow {
        transition: transform 0.3s ease;
        color: var(--n-text-color-3);
      }
    }

    .faq-answer {
      max-height: 0;
      overflow: hidden;
      transition: all 0.3s ease;
      padding: 0 20px;

      p {
        font-size: 14px;
        line-height: 1.7;
        color: var(--n-text-color-3);
      }
    }
  }
}

.cta-section {
  padding: 100px 0;
  position: relative;
  z-index: 1;

  .container {
    max-width: 900px;
    margin: 0 auto;
    padding: 0 40px;
  }

  .cta-content {
    position: relative;
    padding: 60px;
    border-radius: 24px;
    text-align: center;
    overflow: hidden;

    .cta-bg {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, #0ea5e9, #06b6d4, #14b8a6);
      opacity: 0.9;
    }

    .cta-title {
      position: relative;
      font-size: clamp(28px, 4vw, 40px);
      font-weight: 800;
      color: white;
      margin-bottom: 16px;
    }

    .cta-description {
      position: relative;
      font-size: clamp(14px, 2vw, 18px);
      color: rgba(255, 255, 255, 0.9);
      margin-bottom: 32px;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
    }

    .cta-button {
      position: relative;
      background: white;
      color: #0ea5e9;
      border: none;
      font-weight: 600;
      padding: 16px 40px;
      font-size: 16px;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      }
    }
  }
}

.footer {
  padding: 60px 0 30px;
  border-top: 1px solid var(--n-border-color);
  position: relative;
  z-index: 1;

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 40px;
  }

  .footer-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;

    @media (max-width: 640px) {
      flex-direction: column;
      gap: 24px;
      text-align: center;
    }
  }

  .footer-brand {
    .footer-logo {
      font-weight: 800;
    }

    .footer-tagline {
      font-size: 14px;
      color: var(--n-text-color-3);
      margin-top: 8px;
    }
  }

  .footer-links {
    display: flex;
    gap: 24px;

    .footer-link {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--n-text-color-2);
      text-decoration: none;
      font-size: 14px;
      transition: color 0.3s ease;

      &:hover {
        color: #0ea5e9;
      }
    }
  }

  .footer-bottom {
    text-align: center;
    padding-bottom: 30px;
    border-top: 1px solid var(--n-border-color);

    .copyright {
      font-size: 13px;
      color: var(--n-text-color-3);
      margin-bottom: 8px;
    }

    .powered-by {
      font-size: 12px;
      color: var(--n-text-color-3);

      a {
        color: #0ea5e9;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
}

.animate-in {
  animation: slideUp 0.6s ease-out forwards;
}

[v-scroll-animation] {
  opacity: 0;
  transform: translateY(40px);
  transition: all 0.6s ease-out;
}
</style>
