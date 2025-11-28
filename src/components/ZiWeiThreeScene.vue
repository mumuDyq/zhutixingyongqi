<template>
  <div ref="container" class="three-scene"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { EnhancedZiWeiSceneBase } from '../utils/EnhancedZiWeiSceneBase';

const container = ref<HTMLDivElement>();
let ziWeiScene: EnhancedZiWeiSceneBase | null = null;

// 初始化Three.js场景
const init = () => {
  if (!container.value) return;

  // 创建紫微斗数场景管理器
  ziWeiScene = new EnhancedZiWeiSceneBase(container.value);
  ziWeiScene.initZiWeiScene();

  // 调整相机位置
  const camera = ziWeiScene.getCamera();
  camera.position.z = 30;

  // 开始动画循环
  ziWeiScene.startZiWeiAnimation();
};

// 清理资源
const cleanup = () => {
  if (ziWeiScene) {
    ziWeiScene.dispose();
    ziWeiScene = null;
  }
};

onMounted(() => {
  init();
});

onBeforeUnmount(() => {
  cleanup();
});
</script>

<style scoped>
.three-scene {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
