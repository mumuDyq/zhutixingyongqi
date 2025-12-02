<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import ZiWeiThreeScene from '../components/ZiWeiThreeScene.vue'

// 设备类型检测
const isMobile = ref(false)
const isTablet = ref(false)

// 检测设备类型
const checkDeviceType = () => {
  const width = window.innerWidth
  isMobile.value = width <= 768
  isTablet.value = width > 768 && width <= 1024
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

// 紫微斗数相关数据
// const activeTab = ref('paipan')

// 切换标签页
// const switchTab = (tab: string) => {
//   activeTab.value = tab
// }
</script>

<template>
  <div class="ziwei" :class="{ 'mobile': isMobile, 'tablet': isTablet }">
    <div class="scene-container">
      <ZiWeiThreeScene :is-mobile="isMobile" :is-tablet="isTablet" />
    </div>
  </div>
</template>

<style scoped>
.ziwei {
  padding: 0;
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

h1 {
  margin: 0;
  color: #333;
  font-size: 2rem;
}

.scene-container {
  flex: 1;
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 0;
  overflow: hidden;
  position: relative;
  margin: 0;
  padding: 0;
}

.controls {
  display: flex;
  gap: 10px;
}

.mobile-controls {
  display: flex;
  justify-content: center;
  margin-top: 15px;
  gap: 15px;
}

/* 移动端适配 */
.ziwei.mobile {
  padding: 10px;
}

.ziwei.mobile .header {
  flex-direction: column;
  gap: 10px;
}

.ziwei.mobile h1 {
  font-size: 1.5rem;
}

.ziwei.mobile .scene-container {
  min-height: 60vh;
}

/* 平板适配 */
.ziwei.tablet {
  padding: 15px;
}

.ziwei.tablet h1 {
  font-size: 1.8rem;
}

.ziwei.tablet .scene-container {
  min-height: 70vh;
}
</style>
