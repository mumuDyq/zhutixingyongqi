<template>
  <div ref="container" class="three-scene"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as THREE from 'three';
import { EnhancedThreeSceneBase } from '../utils/EnhancedThreeSceneBase';

const container = ref<HTMLDivElement>();
let sceneManager: EnhancedThreeSceneBase | null = null;
let cube: THREE.Mesh;

// 初始化Three.js场景
const init = () => {
  if (!container.value) return;
  
  // 创建场景管理器
  sceneManager = new EnhancedThreeSceneBase(container.value);
  sceneManager.initBaseScene(0x000000);
  
  // 调整相机位置
  const camera = sceneManager.getCamera();
  camera.position.z = 5;
  
  // 获取场景
  const scene = sceneManager.getScene();
  
  // 添加一个立方体作为示例
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
  
  // 添加场景对象到管理器
  sceneManager.addSceneObject('testCube', cube);

  // 添加动画回调
  sceneManager.addAnimationCallback(() => {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
  });

  // 开始动画循环
  sceneManager.startAnimation();
};

// 清理资源
const cleanup = () => {
  if (sceneManager) {
    sceneManager.dispose();
    sceneManager = null;
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
