import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { configureApiClient } from './api/client'
import { useAuthStore } from './stores/auth'

const app = createApp(App)

// Pinia before the router: the router guard uses the auth store
app.use(createPinia())

const auth = useAuthStore()
configureApiClient({
  getToken: () => auth.token,
  // Expired or invalid session: log out and go back to the login page
  onUnauthorized: () => {
    auth.logout()
    void router.push('/login')
  },
})

app.use(router)
app.mount('#app')
