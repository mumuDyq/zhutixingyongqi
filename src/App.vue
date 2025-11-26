<script setup lang="ts">
// 使用路由视图，不需要直接导入组件
// import { useRoute } from 'vue-router'

// const route = useRoute()
</script>

<template>
  <main class="app-main">
    <router-view></router-view>
  </main>
</template>

<style scoped>
.app-main {
  min-height: calc(100vh - 120px);
  padding: 20px;
}
</style>
