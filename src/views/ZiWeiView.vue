<script setup lang="ts">
import { ref } from 'vue'
import ZiWeiThreeScene from '../components/ZiWeiThreeScene.vue'

// 紫微斗数相关数据
// const activeTab = ref('paipan')

// 切换标签页
// const switchTab = (tab: string) => {
//   activeTab.value = tab
// }
</script>

<template>
  <div class="ziwei">
    <h1>紫微斗数 - 三维展示</h1>
    <div class="scene-container">
      <ZiWeiThreeScene />
    </div>
  </div>
</template>

<style scoped>
.ziwei {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  height: 100vh;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.scene-container {
  flex: 1;
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}
</style>
