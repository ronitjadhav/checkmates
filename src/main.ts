import { createApp } from 'vue'
import { registerSW } from 'virtual:pwa-register'
import App from './App.vue'
import './style.css'

// The update check runs when the page loads, so a new version reloads the page once, within seconds of opening it.
// A game in progress comes back from localStorage.
registerSW({ immediate: true })
createApp(App).mount('#app')
