import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import * as process from "process";
window.process = process;

const pinia = createPinia()
const app = createApp(App)
app.use(pinia)
app.mount('#app')
