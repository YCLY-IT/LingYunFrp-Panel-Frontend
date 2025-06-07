import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import packageData from '../package.json'

router.beforeEach((to, _from, next) => {
  // 设置文档标题
  document.title = to.meta.title ?
      `${to.meta.title} - ${packageData.title2}` : // 自定义标题格式
      `${packageData.title2}` // 默认标题
  next()
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.mount('#app')
