import { createRouter, createWebHistory } from 'vue-router'
import ZiWeiView from '@/views/ZiWeiView.vue'
import NotFoundView from '@/views/NotFoundView.vue'

const routes = [
  {
    path: '/',
    name: 'ziwei',
    component: ZiWeiView
  },
  // 404页面
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 这里可以添加权限验证等逻辑
  next()
})

export default router;
