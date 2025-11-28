<template>
  <div class="enhanced-ziwei-scene">
    <div ref="container" class="three-scene"></div>
    <div class="controls">
      <button @click="toggleAnimation">{{ isAnimating ? '停止动画' : '开始动画' }}</button>
      <button @click="loadModel">加载模型</button>
      <button @click="resetCamera">重置相机</button>
    </div>
    <div class="info">
      <p>使用增强版紫微斗数场景类，支持模型加载和更多功能</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as THREE from 'three';
import { EnhancedZiWeiSceneBase } from '../utils/EnhancedZiWeiSceneBase';

const container = ref<HTMLDivElement>();
let ziWeiScene: EnhancedZiWeiSceneBase | null = null;
const isAnimating = ref(false);

// 初始化Three.js场景
const init = () => {
  if (!container.value) return;

  // 创建增强版紫微斗数场景管理器
  ziWeiScene = new EnhancedZiWeiSceneBase(container.value);
  ziWeiScene.initZiWeiScene();

  // 调整相机位置
  const camera = ziWeiScene.getCamera();
  camera.position.set(0, 20, 40);
  camera.lookAt(0, 0, 0);

  // 添加自定义动画 - 旋转紫微斗数盘
  ziWeiScene.addAnimationCallback(() => {
    const ziWeiChart = ziWeiScene?.getZiWeiChart();
    if (ziWeiChart) {
      ziWeiChart.rotation.y += 0.001;
    }

    const taiji = ziWeiScene?.getTaiji();
    if (taiji) {
      taiji.rotation.y += 0.005;
    }
  });
};

// 切换动画状态
const toggleAnimation = () => {
  if (!ziWeiScene) return;

  if (isAnimating.value) {
    ziWeiScene.stopAnimation();
  } else {
    ziWeiScene.startZiWeiAnimation();
  }

  isAnimating.value = !isAnimating.value;
};

// 加载模型
const loadModel = async () => {
  if (!ziWeiScene) return;

  try {
    // 示例：加载一个GLTF模型到紫微斗数场景中
    // 注意：实际使用时需要提供有效的模型URL
    const model = await ziWeiScene.loadModelToZiWeiChart(
      'gltf',
      'path/to/your/model.gltf',
      new THREE.Vector3(0, 5, 0),
      new THREE.Euler(0, 0, 0),
      new THREE.Vector3(1, 1, 1)
    );

    console.log('模型加载成功:', model);
  } catch (error) {
    console.error('模型加载失败:', error);
  }
};

// 重置相机位置
const resetCamera = () => {
  if (!ziWeiScene) return;

  const camera = ziWeiScene.getCamera();
  camera.position.set(0, 20, 40);
  camera.lookAt(0, 0, 0);

  // 获取控制器
  const controls = ziWeiScene.controls;
  if (controls) {
    controls.target.set(0, 0, 0);
    controls.update();
  }
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
.enhanced-ziwei-scene {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.three-scene {
  flex: 1;
  width: 100%;
  overflow: hidden;
}

.controls {
  display: flex;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  gap: 10px;
}

.controls button {
  padding: 8px 16px;
  background-color: #1a237e;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.controls button:hover {
  background-color: #283593;
}

.info {
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.3);
  color: white;
  font-size: 14px;
}
</style>
