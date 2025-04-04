import {createRouter, createWebHistory} from 'vue-router'
import { unauthorized} from "@/net/base.js";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/components/Login.vue'),
      meta: {
        title: '登录',
      }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/components/Register.vue'),
      meta: {
        title: '注册',
      }
    },
      {
          path: '/forget',
          name: 'ResetPassword',
          component: () => import('@/components/ResetPassword.vue'),
          meta: {
              title: '重置密码',
          }
      },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/Dashboard.vue'),
      redirect: '/dashboard/home',
      meta: {
        requiresAuth: true,
      },
      children: [
        {
          path: 'home',
          name: 'dashboardIndex',
          component: () => import('../views/Dashboard/index.vue'),
          meta: {
            title: '首页',
          }
        },
        {
          path: 'proxy/create',
          name: 'create-tunnel',
          component: () => import('../views/Dashboard/proxies/CreateTunnel.vue'),
          meta: {
            title: '创建隧道',
          }
        },
          {
              path: 'proxy/list',
              name: 'proxy-list',
              component: () => import('../views/Dashboard/proxies/ManagerTunnel.vue'),
              meta: {
                  title: '隧道列表',
              }
          },
        {
            path: 'user/profile',
            name: 'user-profile',
            component: () => import('../views/Dashboard/UserProfile.vue'),
            meta: {
                title: '用户信息',
            }
        },
      ]
    }
  ],
})

router.beforeEach((to, from, next) => {
  // 需要登录的路由校验
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (unauthorized()) {
      next({
        name: 'login',
        query: { redirect: to.fullPath } // 携带跳转路径参数
      })
    } else {
      next()
    }
  }
  // 已登录用户禁止访问登录/注册页
  else if ((to.name === 'login' || to.name === 'register' || to.name === 'ResetPassword') && !unauthorized()) {
    next({ name: 'dashboard' })
  }
  // 其他情况直接放行
  else if (to.matched.length === 0) {
    next("/dashboard")
  }else {
    next()
  }
})
router.beforeEach((to, from, next) => {
  // 设置文档标题
  document.title = to.meta.title ?
      `${to.meta.title} - 凌云FRP` : // 自定义标题格式
      '凌云FRP' // 默认标题
  next()
})

export default router
