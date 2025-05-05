<template>
  <n-config-provider>
    <div class="landing-page">

      <!-- 英雄区域 -->
      <section class="hero">
        <div class="container">
          <div class="hero-content">
            <div class="hero-text">
              <h1 class="hero-title">
                快速可靠的内网穿透解决方案
              </h1>
              <p class="hero-description">
                LingYunFRP 是一个专注于内网穿透的高性能的反向代理应用，支持 TCP、UDP、HTTP、HTTPS 等多种协议，让您轻松实现内网服务的外网访问。
              </p>
              <div class="hero-actions">
                <n-space>
                  <n-button type="primary" size="large" @click="handleLogin">立即登录</n-button>
                  <n-button size="large" @click="scrollToFeatures">了解更多</n-button>
                </n-space>
              </div>
            </div>
            <div class="hero-image">
              <img src="/favicon.ico" alt="LingYunFRP 示意图" />
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
          <n-grid cols="3" responsive="screen" :x-gap="24" :y-gap="24">
            <n-grid-item v-for="feature in features" :key="feature.title">
              <n-card class="feature-card">
                <div class="feature-icon">
                  <n-icon size="36" :depth="3">
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
              LingYunFRP 可以应用于多种场景，满足您的不同需求
            </p>
          </div>
          <n-timeline>
            <n-timeline-item v-for="(useCase, index) in useCases" :key="index" :type="useCase.type" :title="useCase.title">
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

      <!-- 价格方案 -->
      <section class="pricing">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">价格方案</h2>
            <p class="section-description">
              选择最适合您需求的方案，开始使用我们的服务
            </p>
          </div>
          <n-grid cols="3" responsive="screen" :x-gap="24">
            <n-grid-item v-for="plan in pricingPlans" :key="plan.title">
              <n-card class="pricing-card" :bordered="false" :class="{ 'pricing-card-highlighted': plan.highlighted }">
                <div class="pricing-header">
                  <h3 class="pricing-title">{{ plan.title }}</h3>
                  <div class="pricing-price">
                    <span class="price-currency">¥</span>
                    <span class="price-amount">{{ plan.price }}</span>
                    <span class="price-period">/月</span>
                  </div>
                  <p class="pricing-description">{{ plan.description }}</p>
                </div>
                <n-divider />
                <ul class="pricing-features">
                  <li v-for="(feature, index) in plan.features" :key="index">
                    <n-icon color="#36ad6a" class="feature-check">
                      <CheckIcon />
                    </n-icon>
                    {{ feature }}
                  </li>
                </ul>
                <div class="pricing-action">
                  <n-button block :type="plan.highlighted ? 'primary' : 'default'" @click="handleLogin" :strong="plan.highlighted">
                    {{ plan.buttonText }}
                  </n-button>
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
            <p class="section-description">
              了解更多关于我们服务的信息
            </p>
          </div>
          <n-collapse>
            <n-collapse-item v-for="(item, index) in faqItems" :key="index" :title="item.question" :name="index">
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
                立即注册，开始使用我们的 LingYunFRP 服务，享受高速稳定的内网穿透体验。
              </p>
            </div>
            <div class="contact-action">
              <n-button type="primary" @click="handleLogin" size="large">立即登录</n-button>
            </div>
          </div>
        </div>
      </section>

      <!-- 页脚 -->
      <footer class="footer">
        <div class="container">
          <div class="footer-content">
            <div class="footer-logo">
              <n-gradient-text type="primary" :size="24">LingYunFRP</n-gradient-text>
              <p class="footer-description">
                专业的内网穿透服务提供商
              </p>
            </div>
            <div class="footer-links">
            </div>
          </div>
          <div class="footer-bottom">
            <div class="footer-copyright">
              © {{ new Date().getFullYear() }} LingYunFRP 服务. 保留所有权利.<br />
              Powered By  <a class="section-description" href="https://www.lybyte.cn/" target="_blank">LingYuByte Network</a>
            </div>
            <div class="footer-social">
              <a href="https://github.com/LingYuByte-Network/" class="social-link">
                <n-icon><GithubIcon /></n-icon>
              </a>
              <a href="https://www.lybyte.cn/" class="social-link">
                <n-icon><BoxIcon /></n-icon>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  </n-config-provider>
</template>

<script setup lang="ts">
// import { ref } from 'vue';
import {
  ZapIcon,
  ShieldIcon,
  SettingsIcon,
  MonitorIcon,
  ServerIcon,
  DatabaseIcon,
  CheckIcon,
  GithubIcon,
  BoxIcon,
} from 'lucide-vue-next';
import router from "@/router";

// 主题设置
// const isDarkTheme = ref(false);

// const toggleTheme = () => {
//   isDarkTheme.value = !isDarkTheme.value;
// };

// 特性数据
const features = [
  {
    icon: ZapIcon,
    title: '高性能',
    description: '基于高效的网络库实现，支持高并发连接，保证数据传输的稳定性和速度。'
  },
  {
    icon: ShieldIcon,
    title: '安全可靠',
    description: '支持 TLS 加密传输，保护您的数据安全，防止中间人攻击和数据泄露。'
  },
  {
    icon: SettingsIcon,
    title: '简单易用',
    description: '提供简洁的 Web 管理界面，轻松配置和管理您的内网穿透服务。'
  },
  {
    icon: MonitorIcon,
    title: '实时监控',
    description: '提供详细的流量统计和连接状态监控，让您随时了解服务运行情况。'
  },
  {
    icon: ServerIcon,
    title: '多协议支持',
    description: '支持 TCP、UDP、HTTP、HTTPS 等多种协议，满足不同场景的需求。'
  },
  {
    icon: DatabaseIcon,
    title: '多平台兼容',
    description: '支持 Windows、Linux、macOS 等多种操作系统，无需担心平台兼容问题。'
  }
];

// 使用场景
const useCases = [
  {
    type: 'success',
    title: '远程办公',
    description: '通过 LingYunFRP 服务，您可以在任何地方安全地访问公司内网资源，实现远程办公和协作。',
  },
  {
    type: 'info',
    title: '开发测试',
    description: '将本地开发环境暴露到公网，方便团队协作测试和演示，加速开发流程。',
  },
  {
    type: 'warning',
    title: '智能家居',
    description: '通过 LingYunFRP 服务，您可以在外出时远程控制和监控家中的智能设备，提升生活便利性。',
  },
  {
    type: 'error',
    title: '游戏联机',
    description: '使用 LingYunFRP 服务，您可以轻松搭建游戏服务器，与朋友一起享受游戏乐趣。',
  }
];
//!TODO by API
// 价格方案
const pricingPlans = [
  {
    title: '基础版',
    price: '0',
    description: '适合个人用户和小型项目',
    features: [
      '2个隧道',
      '12Mbps带宽',
      '99.9%可用性保证',
    ],
    buttonText: '立即登录',
  },
  {
    title: 'VIP版',
    price: '10',
    description: '适合中小型企业和团队',
    features: [
      '10个隧道',
      '24Mbps带宽',
      '99.95%可用性保证',
    ],
    buttonText: '立即登录',
    highlighted: true
  },
  {
    title: 'SVIP版',
    price: '20',
    description: '适合大型企业和高要求场景',
    features: [
      '20个限隧道',
      '36Mbps带宽',
      '99.99%可用性保证',
    ],
    buttonText: '立即登录',
    highlighted: false
  }
];

// 常见问题
const faqItems = [
  {
    question: 'FRP 是什么？',
    answer: 'FRP（Fast Reverse Proxy）是一个可用于内网穿透的高性能的反向代理应用，支持 TCP、UDP、HTTP、HTTPS 等多种协议。通过在具有公网 IP 的节点上部署 frps 服务端，可以轻松地将内网服务穿透到公网，使得外网用户可以访问内网资源。'
  },
  {
    question: '如何开始使用 LingYunFRP 服务？',
    answer: '注册账号后，您可以在控制面板中创建隧道，选择协议类型和端口，然后下载客户端配置文件，按照指引在您的设备上运行客户端即可完成配置。'
  },
  {
    question: 'LingYunFRP 服务支持哪些操作系统？',
    answer: 'LingYunFRP 客户端支持 Windows、Linux、macOS 等主流操作系统，您可以根据自己的需求选择合适的版本。'
  },
  {
    question: '使用 LingYunFRP 服务是否安全？',
    answer: '我们的 LingYunFRP 服务支持 TLS 加密传输，可以有效保护您的数据安全。同时，我们还提供了多种安全配置选项，如认证、访问控制等，进一步增强服务的安全性。'
  },
  {
    question: '如何获取技术支持？',
    answer: '您可以通过控制面板中的"支持"页面提交工单，或者发送邮件至 <EMAIL> 获取技术支持。专业版和企业版用户可以获得优先响应。'
  }
];

const handleLogin = () => {
  router.push('/login');
};
const scrollToFeatures = () => {
  const featuresSection = document.getElementById('features-section');
  if (featuresSection) {
    featuresSection.scrollIntoView({ behavior: 'smooth' });
  }
};
</script>

<style scoped src="@/assets/styles/home-view.scss" lang="scss"></style>