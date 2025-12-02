<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// 检测设备类型
const isMobile = ref(false)
const isTablet = ref(false)

// 响应式布局检测
const checkDeviceType = () => {
  const width = window.innerWidth
  const wasMobile = isMobile.value
  const wasTablet = isTablet.value
  
  isMobile.value = width <= 768
  isTablet.value = width > 768 && width <= 1024
  
  // 如果设备类型发生变化，触发全局事件
  if (wasMobile !== isMobile.value || wasTablet !== isTablet.value) {
    window.dispatchEvent(new CustomEvent('deviceTypeChanged', {
      detail: { isMobile: isMobile.value, isTablet: isTablet.value }
    }))
  }
}

// 监听窗口大小变化
const handleResize = () => {
  checkDeviceType()
}

onMounted(() => {
  checkDeviceType()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="app-container" :class="{ 'mobile': isMobile, 'tablet': isTablet }">
    <main class="app-main">
      <router-view></router-view>
    </main>
  </div>
</template>

<style>
/* 不使用scoped，确保样式全局生效 */
.app-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin: 0;
  padding: 0;
  position: fixed;
  top: 0;
  left: 0;
}

.app-main {
  flex: 1;
  width: 100%;
  height: 100%;
  padding: 0;
  overflow: hidden;
  margin: 0;
  position: relative;
}

/* 移动端适配 */
.app-container.mobile .app-main {
  padding: 5px;
}

/* 平板适配 */
.app-container.tablet .app-main {
  padding: 10px;
}
</style>
