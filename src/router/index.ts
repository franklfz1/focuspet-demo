import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'

// 路由元信息类型
declare module 'vue-router' {
  interface RouteMeta {
    public?: boolean
    requiresAuth?: boolean
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { public: true }
  },
  {
    path: '/adopt',
    name: 'Adopt',
    component: () => import('../views/AdoptView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/focus',
    name: 'Focus',
    component: () => import('../views/FocusView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/verify',
    name: 'Verify',
    component: () => import('../views/VerifyView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/entertainment',
    name: 'Entertainment',
    component: () => import('../views/EntertainmentView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/entertainment/content',
    name: 'EntertainmentContent',
    component: () => import('../views/EntertainmentContent.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/rewards',
    name: 'Rewards',
    component: () => import('../views/RewardsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/parent',
    name: 'Parent',
    component: () => import('../views/ParentView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫：未登录跳转登录页，已登录未领养跳转领养页
router.beforeEach((to, from, next) => {
  const isPublic = to.meta.public
  const currentUser = localStorage.getItem('fp_currentUser')
  const isLoggedIn = !!currentUser

  if (!isPublic && !isLoggedIn) {
    next('/login')
    return
  }

  // 已登录但未领养怪兽，且不在领养页/登录页，则跳转领养页
  // 按用户检查领养状态（每个账号独立）
  if (isLoggedIn && !isPublic && to.name !== 'Adopt') {
    const petType = localStorage.getItem(`fp_petType_${currentUser}`)
    if (!petType) {
      next('/adopt')
      return
    }
  }

  // 已登录已领养，访问登录页则跳转首页
  if (isLoggedIn && to.name === 'Login') {
    const petType = localStorage.getItem(`fp_petType_${currentUser}`)
    if (petType) {
      next('/home')
      return
    }
    // 已登录但未领养，访问登录页则跳转领养页
    next('/adopt')
    return
  }

  // 已登录已领养，访问领养页则跳转首页（每个账号只领养一次）
  if (isLoggedIn && to.name === 'Adopt') {
    const petType = localStorage.getItem(`fp_petType_${currentUser}`)
    if (petType) {
      next('/home')
      return
    }
  }

  next()
})

export default router
