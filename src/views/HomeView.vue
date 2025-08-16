<template>
  <n-config-provider>
    <div class="landing-page">
      <!-- 英雄区域 -->
      <section class="hero">
        <div class="container">
          <div class="hero-content">
            <div class="hero-text">
              <h1 class="hero-title">快速可靠的内网穿透解决方案</h1>
              <p class="hero-description">
                {{ packageData.title }}
                是一个专注于内网穿透的高性能的反向代理应用，支持
                TCP、UDP、HTTP、HTTPS 多种协议，让您轻松实现内网服务的外网访问。
              </p>
              <div class="hero-actions">
                <n-space :vertical="isMobile" :size="isMobile ? 12 : 16">
                  <n-button
                    type="primary"
                    :size="isMobile ? 'medium' : 'large'"
                    block
                    @click="handleLogin"
                    >立即登录</n-button
                  >
                  <n-button
                    :size="isMobile ? 'medium' : 'large'"
                    block
                    @click="scrollToFeatures"
                    >了解更多</n-button
                  >
                </n-space>
              </div>
            </div>
            <div class="hero-image">
              <img src="/favicon.ico" alt="示意图" />
            </div>
          </div>
        </div>
      </section>

      <!-- 特性区域 -->
      <section class="features" id="features-section">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">为什么选择我们的 FRP 服务</h2>
            <p class="section-description">
              我们提供简单易用、安全可靠的内网穿透服务，满足您的各种需求
            </p>
          </div>
          <n-grid
            :cols="quickStartGridCols"
            responsive="screen"
            :x-gap="isMobile ? 16 : 24"
            :y-gap="isMobile ? 16 : 24"
          >
            <n-grid-item v-for="feature in features" :key="feature.title">
              <n-card class="feature-card">
                <div class="feature-icon">
                  <n-icon :size="isMobile ? 28 : 36" :depth="3">
                    <component :is="feature.icon" />
                  </n-icon>
                </div>
                <h3 class="feature-title">{{ feature.title }}</h3>
                <p class="feature-description">{{ feature.description }}</p>
              </n-card>
            </n-grid-item>
          </n-grid>
        </div>
      </section>

      <!-- 使用场景 -->
      <section class="use-cases">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">适用场景</h2>
            <p class="section-description">
              {{ packageData.title }} 可以应用于多种场景，满足您的不同需求
            </p>
          </div>
          <n-timeline>
            <n-timeline-item
              v-for="(useCase, index) in useCases"
              :key="index"
              :type="useCase.type"
              :title="useCase.title"
            >
              <n-card>
                <div class="use-case-content">
                  <div class="use-case-text">
                    <p>{{ useCase.description }}</p>
                  </div>
                </div>
              </n-card>
            </n-timeline-item>
          </n-timeline>
        </div>
      </section>

      <!-- 服务优势 -->
      <section class="advantages">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">服务优势</h2>
            <p class="section-description">
              选择 {{ packageData.title }}，享受专业的内网穿透服务体验
            </p>
          </div>
          <n-grid
            :cols="gridCols"
            responsive="screen"
            :x-gap="isMobile ? 16 : 24"
            :y-gap="isMobile ? 16 : 24"
          >
          </n-grid>
        </div>
      </section>

      <!-- 快速开始 -->
      <section class="quick-start">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">快速开始</h2>
            <p class="section-description">
              只需几个简单步骤，即可开始使用 {{ packageData.title }} 服务
            </p>
          </div>
          <n-grid
            :cols="gridCols"
            responsive="screen"
            :x-gap="isMobile ? 16 : 24"
            :y-gap="isMobile ? 16 : 24"
          >
            <n-grid-item v-for="(step, index) in quickStartSteps" :key="index">
              <n-card
                class="step-card"
                :class="{ 'step-card-active': index === 0 - 1 }"
                :style="{ animationDelay: `${index * 0.2}s` }"
              >
                <template #header>
                  <div class="step-header">
                    <div class="step-number">{{ index + 1 }}</div>
                    <div class="step-icon">
                      <n-icon :size="isMobile ? 32 : 40" :depth="3">
                        <component :is="step.icon" />
                      </n-icon>
                    </div>
                  </div>
                </template>
                <div class="step-content">
                  <h3 class="step-title">{{ step.title }}</h3>
                  <p class="step-description">{{ step.description }}</p>
                </div>
                <div
                  class="step-arrow"
                  v-if="index < quickStartSteps.length - 1"
                >
                  <n-icon :size="isMobile ? 20 : 2">
                    <ArrowRightIcon />
                  </n-icon>
                </div>
              </n-card>
            </n-grid-item>
          </n-grid>
        </div>
      </section>

      <!-- 常见问题 -->
      <section class="faq">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">常见问题</h2>
            <p class="section-description">了解更多关于我们服务的信息</p>
          </div>
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
        </div>
      </section>

      <!-- 联系我们 -->
      <section class="contact">
        <div class="container">
          <div class="contact-content">
            <div class="contact-text">
              <h2 class="section-title">准备好开始了吗？</h2>
              <p class="section-description">
                立即注册，开始使用我们的
                {{ packageData.title }} 服务，享受高速稳定的内网穿透体验。
              </p>
            </div>
            <div class="contact-action">
              <n-button
                type="primary"
                @click="handleLogin"
                :size="isMobile ? 'medium' : 'large'"
                :block="isMobile"
                >立即登录</n-button
              >
            </div>
          </div>
        </div>
      </section>

      <!-- 页脚 -->
      <footer class="footer">
        <div class="container">
          <div class="footer-content">
            <div class="footer-logo">
              <n-gradient-text type="primary" :size="isMobile ? 20 : 24">{{
                packageData.title
              }}</n-gradient-text>
              <p class="footer-description">专业的内网穿透服务提供商</p>
            </div>
            <div class="footer-links"></div>
          </div>
          <div class="footer-bottom">
            <div class="footer-copyright">
              © {{ new Date().getFullYear() }} {{ packageData.title }} 服务.
              保留所有权利.<br />
              Powered By
              <a
                class="section-description"
                :href="packageData.ycly"
                target="_blank"
                >云创联跃IT</a
              >
            </div>
            <div class="footer-social">
              <a :href="packageData.github" class="social-link">
                <n-icon :size="isMobile ? 20 : 25"><GithubIcon /></n-icon>
              </a>
              <a :href="packageData.ycly" class="social-link">
                <n-icon :size="isMobile ? 20 : 25"><CloudIcon /></n-icon>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>

    <!-- 统计组件 - 固定定位在底部中间 -->
    <La />
  </n-config-provider>
</template>

<script setup lang="ts">
import packageData from '../../package.json'
import { BING_BG_URL } from '@/constants/bing'
import { ref, computed, onMounted, onUnmounted } from 'vue'
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

// 响应式断点检测
const windowWidth = ref(window.innerWidth)

const isMobile = computed(() => windowWidth.value < 768)
const isTablet = computed(
  () => windowWidth.value >= 768 && windowWidth.value < 1024,
)

// 网格列数响应式配置
const gridCols = computed(() => {
  if (isMobile.value) return 1
  if (isTablet.value) return 2
  return 4
})

// 快速开始网格列数响应式配置
const quickStartGridCols = computed(() => {
  if (isMobile.value) return 1
  if (isTablet.value) return 2
  return 3
})

// 窗口大小监听
const handleResize = () => {
  windowWidth.value = window.innerWidth
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

const handleLogin = () => {
  router.push('/login')
}

const scrollToFeatures = () => {
  const featuresSection = document.getElementById('features-section')
  if (featuresSection) {
    featuresSection.scrollIntoView({ behavior: 'smooth' })
  }
}

onMounted(() => {
  const bgUrl = BING_BG_URL
  const loginEl = document.querySelector('.hero') as HTMLElement
  if (loginEl) {
    loginEl.style.backgroundImage = `url('${bgUrl}')`
    loginEl.style.backgroundSize = 'cover'
    loginEl.style.backgroundPosition = 'center'
  }
})
</script>

<style lang="scss" scoped>
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.landing-page {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
    Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  color: var(--n-text-color);
  background-color: var(--n-color);

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  // 英雄区域样式
  .hero {
    padding: 125px 0;
    background-size: cover;
    background-position: center;
    background-attachment: fixed;

    .hero-content {
      display: flex;
      align-items: center;
      gap: 40px;

      .hero-text {
        flex: 1;

        .hero-title {
          font-size: clamp(28px, 5vw, 48px);
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 24px;
          color: var(--n-text-color);
        }

        .hero-description {
          font-size: clamp(16px, 2.5vw, 18px);
          line-height: 1.6;
          margin-bottom: 32px;
          color: var(--n-text-color-3);
        }

        .hero-actions {
          margin-top: 32px;
        }
      }

      .hero-image {
        flex: 1;
        display: flex;
        justify-content: center;

        img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
      }
    }
  }

  // 特性区域样式
  .features {
    padding: 40px 0;
    background-color: var(--n-color-modal);

    .section-header {
      text-align: center;
      margin-bottom: 40px;

      .section-title {
        font-size: clamp(24px, 4vw, 36px);
        font-weight: 700;
        margin-bottom: 16px;
        color: var(--n-text-color);
      }

      .section-description {
        font-size: clamp(14px, 2vw, 18px);
        color: var(--n-text-color-3);
        max-width: 700px;
        margin: 0 auto;
        line-height: 1.6;
      }
    }

    .feature-card {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 24px 16px;
      transition: transform 0.3s ease;

      &:hover {
        transform: translateY(-5px);
      }

      .feature-icon {
        margin-bottom: 20px;
        color: var(--n-primary-color);
      }

      .feature-title {
        font-size: clamp(16px, 2.5vw, 20px);
        font-weight: 600;
        margin-bottom: 12px;
        color: var(--n-text-color);
      }

      .feature-description {
        color: var(--n-text-color-3);
        line-height: 1.6;
        font-size: clamp(13px, 2vw, 15px);
      }
    }
  }

  // 使用场景样式
  .use-cases {
    padding: 40px 0;

    .use-case-content {
      display: flex;
      align-items: center;
      gap: 24px;

      .use-case-text {
        flex: 1;
      }
    }
  }

  // 快速开始样式
  .quick-start {
    padding: 60px 0;
    background-color: var(--n-color-modal);
    margin-top: 40px;

    .step-card {
      position: relative;
      text-align: center;
      transition: all 0.3s ease;
      animation: fadeInUp 0.6s ease forwards;
      opacity: 0;
      transform: translateY(30px);
      height: 100%;

      .step-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        padding-top: 20px;
      }

      &:hover {
        transform: translateY(-8px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);

        .step-icon {
          transform: scale(1.1);
        }
      }

      &.step-card-active {
        border: 1px solid var(--n-primary-color);

        .step-number {
          background: var(--n-primary-color);
          color: white;
        }

        .step-icon {
          color: var(--n-primary-color);
        }

        .step-title {
          color: var(--n-primary-color);
        }
      }

      .step-number {
        width: 32px;
        height: 32px;
        background: var(--n-color-modal);
        color: var(--n-text-color);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 14px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        margin-bottom: 12px;
      }

      .step-icon {
        margin-bottom: 16px;
        color: var(--n-primary-color);
        transition: all 0.3s ease;
      }

      .step-content {
        padding: 8px 0;

        .step-title {
          font-size: clamp(16px, 2.5vw, 18px);
          font-weight: 600;
          margin-bottom: 12px;
          color: var(--n-text-color);
          transition: color 0.3s ease;
        }

        .step-description {
          color: var(--n-text-color-3);
          line-height: 1.6;
          font-size: clamp(13px, 2vw, 14px);
          transition: color 0.3s ease;
        }
      }

      .step-arrow {
        position: absolute;
        right: -25px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--n-primary-color);
        z-index: 1;

        @media (max-width: 767px) {
          display: none;
        }
      }

      @media (max-width: 767px) {
        .step-number {
          width: 28px;
          height: 28px;
          font-size: 12px;
        }

        .step-content {
          padding: 4px 0;

          .step-title {
            font-size: 16px;
            margin-bottom: 8px;
          }

          .step-description {
            font-size: 13px;
          }
        }
      }
    }
  }

  // 服务优势样式
  .advantages {
    padding: 40px 0;
    background-color: var(--n-color-modal);

    .advantage-card {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 24px 16px;
      transition: transform 0.3s ease;

      &:hover {
        transform: translateY(-5px);
      }

      .advantage-icon {
        margin-bottom: 20px;
        color: var(--n-primary-color);
      }

      .advantage-title {
        font-size: clamp(16px, 2.5vw, 20px);
        font-weight: 600;
        margin-bottom: 12px;
        color: var(--n-text-color);
      }

      .advantage-description {
        color: var(--n-text-color-3);
        line-height: 1.6;
        font-size: clamp(13px, 2vw, 15px);
      }
    }
  }

  // FAQ 样式
  .faq {
    padding: 40px 0;
  }

  // 联系我们样式
  .contact {
    padding: 40px 0;
    background-color: var(--n-color-modal);

    .contact-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 40px;

      .contact-text {
        flex: 1;
      }
    }
  }

  // 页脚样式
  .footer {
    padding: 40px 0 20px;
    background-color: var(--n-color);
    border-top: 1px solid var(--n-border-color);

    .footer-content {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;

      .footer-logo {
        max-width: 300px;

        .footer-description {
          margin-top: 16px;
          color: var(--n-text-color-3);
          font-size: clamp(13px, 2vw, 15px);
        }
      }
    }

    .footer-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 20px;
      border-top: 1px solid var(--n-border-color);
      flex-wrap: wrap;
      gap: 16px;

      .footer-copyright {
        color: var(--n-text-color-3);
        font-size: clamp(12px, 2vw, 14px);
        line-height: 1.5;
      }

      .footer-social {
        display: flex;
        gap: 16px;

        .social-link {
          color: var(--n-text-color-3);
          transition: color 0.2s ease;
          text-decoration: none;

          &:hover {
            color: var(--n-primary-color);
          }
        }
      }
    }
  }

  // 响应式样式
  @media (max-width: 767px) {
    .container {
      padding: 0 16px;
    }

    .hero {
      padding: 60px 0;
      background-attachment: scroll;

      .hero-content {
        flex-direction: column;
        text-align: center;
        gap: 30px;

        .hero-image {
          order: -1;
          margin-bottom: 20px;

          img {
            max-width: 200px;
          }
        }
      }
    }

    .features,
    .use-cases,
    .advantages,
    .quick-start,
    .faq,
    .contact {
      padding: 40px 0;
    }

    .quick-start {
      .quick-start-grid {
        flex-direction: column;
        gap: 16px;
      }

      .step-card {
        min-width: auto;
        max-width: 100%;
        padding: 24px 20px;
      }
    }

    .section-header {
      margin-bottom: 30px;
    }

    .feature-card,
    .advantage-card {
      padding: 20px 16px;
    }

    .contact-content {
      flex-direction: column;
      text-align: center;
      gap: 24px;
    }

    .footer-content {
      flex-direction: column;
      gap: 20px;
      text-align: center;
    }

    .footer-bottom {
      flex-direction: column;
      text-align: center;
      gap: 12px;

      .footer-social {
        order: 1;
        margin: 8px 0;
        min-width: 100%;
        max-width: 100%;
      }
    }
  }

  @media (min-width: 768px) and (max-width: 1023px) {
    .hero-title {
      font-size: 40px;
    }

    .section-title {
      font-size: 32px;
    }

    .hero-content {
      gap: 30px;
    }

    .features,
    .use-cases,
    .advantages,
    .quick-start,
    .faq,
    .contact {
      padding: 50px 0;
    }

    .quick-start {
      .quick-start-grid {
        gap: 16px;
      }

      .step-card {
        min-width: 180px;
        max-width: 240px;
        padding: 28px 20px;
      }
    }
  }

  // 链接样式
  a {
    text-decoration: none;
    color: #3498db;
    transition: all 0.3s ease;
    position: relative;

    &:hover {
      color: #2980b9;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
    }

    &:active {
      color: #1c6ea4;
    }

    &:after {
      content: '';
      position: absolute;
      width: 0;
      height: 2px;
      bottom: -2px;
      left: 0;
      background-color: #3498db;
      transition: width 0.3s ease;
    }

    &:hover::after {
      width: 100%;
    }
  }

  // 动画关键帧
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}
</style>
