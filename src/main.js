import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import axios from 'axios'

const app = createApp(App)

axios.defaults.baseURL = 'http://10.240.37.173:8792'
app.use(router)
app.use(ElementPlus)
app.mount('#app')
