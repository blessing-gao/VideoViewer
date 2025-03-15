// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import VideoView from '../views/VideoView.vue'

const router = createRouter({
  history: createWebHistory("/"),
  routes: [
    {
      path: '/',
      name: 'home',
      component: VideoView
    },
    {
      path: '/video',
      name: 'home',
      component: VideoView
    }
  ]
})

export default router
