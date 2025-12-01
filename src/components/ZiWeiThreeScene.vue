<template>
  <div ref="container" class="three-scene"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { EnhancedZiWeiSceneBase } from '../utils/EnhancedZiWeiSceneBase';
import * as THREE from 'three';

// 接收设备类型参数
const props = defineProps({
  isMobile: {
    type: Boolean,
    default: false
  },
  isTablet: {
    type: Boolean,
    default: false
  }
});

const container = ref<HTMLDivElement>();
let ziWeiScene: EnhancedZiWeiSceneBase | null = null;

// 定义窗口大小变化处理函数
let handleResize: (() => void) | null = null;

// 添加示例星耀
const addSampleStars = () => {
  if (!ziWeiScene) return;
  
  // 命宫星耀
  ziWeiScene.addStarToPalace('命宫', '紫微', 0xff0000, new THREE.Vector3(-0.8, 0, 0));
  ziWeiScene.addStarToPalace('命宫', '天机', 0x00ff00, new THREE.Vector3(0.8, 0, 0));
  ziWeiScene.addStarToPalace('命宫', '太阳', 0xffff00, new THREE.Vector3(0, 0, -0.8));
  
  // 财帛宫星耀
  ziWeiScene.addStarToPalace('财帛', '武曲', 0x0000ff, new THREE.Vector3(-0.8, 0, 0));
  ziWeiScene.addStarToPalace('财帛', '贪狼', 0xff00ff, new THREE.Vector3(0.8, 0, 0));
  ziWeiScene.addStarToPalace('财帛', '天相', 0x00ffff, new THREE.Vector3(0, 0, -0.8));
  
  // 官禄宫星耀
  ziWeiScene.addStarToPalace('官禄', '廉贞', 0xff8800, new THREE.Vector3(-0.8, 0, 0));
  ziWeiScene.addStarToPalace('官禄', '破军', 0x8800ff, new THREE.Vector3(0.8, 0, 0));
  ziWeiScene.addStarToPalace('官禄', '七杀', 0xff0088, new THREE.Vector3(0, 0, -0.8));
  
  // 夫妻宫星耀
  ziWeiScene.addStarToPalace('夫妻', '天府', 0x00ff88, new THREE.Vector3(-0.8, 0, 0));
  ziWeiScene.addStarToPalace('夫妻', '太阴', 0x8888ff, new THREE.Vector3(0.8, 0, 0));
  ziWeiScene.addStarToPalace('夫妻', '巨门', 0xffff88, new THREE.Vector3(0, 0, -0.8));
};

// 初始化Three.js场景
const init = () => {
  if (!container.value) return;

  // 创建紫微斗数场景管理器
  ziWeiScene = new EnhancedZiWeiSceneBase(container.value);
  ziWeiScene.initZiWeiScene();

  // 根据设备类型调整相机位置
  const camera = ziWeiScene.camera;
  if (camera) {
    if (props.isMobile) {
      camera.position.z = 50; // 移动端拉远一点，以便看到更多内容
    } else if (props.isTablet) {
      camera.position.z = 40; // 平板适中距离
    } else {
      camera.position.z = 30; // 桌面端默认距离
    }
  }
  
  // 确保渲染器占满整个窗口
  const renderer = ziWeiScene.renderer;
  if (renderer) {
    // 使用窗口尺寸而不是容器尺寸，确保全屏显示
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
  }
  
  // 监听容器大小变化
  handleResize = () => {
    if (!container.value || !ziWeiScene) return;
    const camera = ziWeiScene.camera;
    const renderer = ziWeiScene.renderer;
    
    if (camera && renderer) {
      // 使用窗口尺寸而不是容器尺寸，确保全屏显示
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
  };
  
  // 添加窗口大小变化监听
  window.addEventListener('resize', handleResize);
  
  // 保存清理函数
  ziWeiScene.addCleanupCallback(() => {
    if (handleResize) {
      window.removeEventListener('resize', handleResize);
    }
  });

  // 添加示例星耀
  addSampleStars();
  
  // 开始动画循环
  ziWeiScene.startZiWeiAnimation();
};

// 根据设备类型调整场景
const adjustSceneForDevice = () => {
  if (!ziWeiScene) return;

  const camera = ziWeiScene.camera;
  const renderer = ziWeiScene.renderer;
  const controls = ziWeiScene.controls;
  
  if (camera) {
    if (props.isMobile) {
      camera.position.z = 50;
      // 移动端可能需要调整渲染器像素比，提高性能
      if (renderer) {
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      }
    } else if (props.isTablet) {
      camera.position.z = 40;
      if (renderer) {
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      }
    } else {
      camera.position.z = 30;
      if (renderer) {
        renderer.setPixelRatio(window.devicePixelRatio);
      }
    }
  }

  // 调整控制器灵敏度，移动端可能需要更灵敏的触摸控制
  if (controls && props.isMobile) {
    controls.rotateSpeed = 0.5;
    controls.zoomSpeed = 0.8;
  }
};

// 监听设备类型变化
watch([() => props.isMobile, () => props.isTablet], () => {
  adjustSceneForDevice();
});

// 清理资源
const cleanup = () => {
  if (ziWeiScene) {
    ziWeiScene.dispose();
    ziWeiScene = null;
  }
  
  // 确保移除所有事件监听
  if (handleResize) {
    window.removeEventListener('resize', handleResize);
    handleResize = null;
  }
};

onMounted(() => {
  init();
  
  // 监听设备类型变化事件
  const handleDeviceTypeChange = (event: any) => {
    const { isMobile, isTablet } = event.detail
    // 强制触发场景调整
    setTimeout(() => {
      handleResize && handleResize()
    }, 100)
  }
  
  window.addEventListener('deviceTypeChanged', handleDeviceTypeChange)
  
  // 保存清理函数
  ziWeiScene?.addCleanupCallback(() => {
    window.removeEventListener('deviceTypeChanged', handleDeviceTypeChange)
  })
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
  position: fixed;
  top: 0;
  left: 0;
  display: block;
  margin: 0;
  padding: 0;
}
</style>
