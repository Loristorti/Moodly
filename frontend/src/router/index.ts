import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { Role } from '@/types/api'
import LoginView from '@/views/LoginView.vue'

declare module 'vue-router' {
  interface RouteMeta {
    /** Route reachable without being logged in */
    public?: boolean
    /** Role required to open the route */
    role?: Role
  }
}

/** Home page of each role, used after login. */
export function homeFor(role: Role): string {
  return role === 'MANAGER' ? '/dashboard' : '/mood'
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'login', component: LoginView, meta: { public: true } },
    {
      path: '/mood',
      name: 'mood',
      component: () => import('@/views/MoodView.vue'),
      meta: { role: 'EMPLOYEE' },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { role: 'MANAGER' },
    },
    {
      // Any logged-in user, whatever the role
      path: '/donnees',
      name: 'privacy',
      component: () => import('@/views/PrivacyView.vue'),
    },
    { path: '/:pathMatch(.*)*', redirect: '/login' },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.public) {
    // Already logged in: no need to see the login page again
    return auth.user ? homeFor(auth.user.role) : true
  }
  if (!auth.user) {
    return '/login'
  }
  if (to.meta.role && to.meta.role !== auth.user.role) {
    return homeFor(auth.user.role)
  }
  return true
})

export default router
