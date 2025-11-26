<script setup lang="ts">
import { ref } from 'vue'

// 紫微斗数相关数据
// const activeTab = ref('paipan')

// 切换标签页
// const switchTab = (tab: string) => {
//   activeTab.value = tab
// }
</script>

<template>
  <div class="ziwei">
    <canvas id="mingpan"></canvas>
  </div>
</template>

<style scoped>
.ziwei {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}
</style>
