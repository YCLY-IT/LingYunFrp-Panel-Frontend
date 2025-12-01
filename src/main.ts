import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

console.log(`🚀 LingYunFRP Panel Frontend started successfully!`)
console.log('球球有缘人拯救一下吧qwq')

console.log('部分借鉴于其他的项目(说白了其实我也没有什么好的idea)')
