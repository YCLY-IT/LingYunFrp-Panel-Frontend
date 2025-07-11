import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import {
  create,
  NMessageProvider,
  NDialogProvider,
  NLoadingBarProvider,
} from 'naive-ui'

const naive = create({
  components: [NMessageProvider, NDialogProvider, NLoadingBarProvider],
})
const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(naive)
app.mount('#app')
