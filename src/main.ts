import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import modalMutex from './utils/modalMutex'

const app = createApp(App)

app.use(createPinia())
app.use(router)
;(window as Window).$modalMutex = modalMutex

app.mount('#app')

console.log(`🚀 LingYunFRP Panel Frontend started successfully!`)
