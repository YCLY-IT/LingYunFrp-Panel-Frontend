import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { MotionPlugin } from 'motion-v'
import App from './App.vue'
import router from './router'
import modalMutex from './utils/modalMutex'
import './assets/styles/index.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(MotionPlugin)
;(window as Window).$modalMutex = modalMutex

app.mount('#app')

console.log(`🚀 LingYunFRP Panel Frontend started successfully!`)
