import { createApp } from 'vue'
import App from './App.vue'
// 导入 jsbip39 库（必须在 App 之前导入，确保全局变量可用）
import './jsbip39/index.js'

createApp(App).mount('#app')
