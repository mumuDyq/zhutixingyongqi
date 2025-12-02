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

  // 根据设备类型调整相机位置和倾斜角度
  const camera = ziWeiScene.camera;
  if (camera) {
    if (props.isMobile) {
      // 移动端设置更倾斜的视角，增强立体感
      const distance = 50;
      camera.position.set(0, distance * 0.7, distance * 0.5); // 增加Y轴比例，使视角更倾斜
      camera.lookAt(0, 0, 0);
    } else if (props.isTablet) {
      // 平板适中倾斜角度
      const distance = 40;
      camera.position.set(0, distance * 0.65, distance * 0.55); // 适中的倾斜角度
      camera.lookAt(0, 0, 0);
    } else {
      // 桌面端设置最佳倾斜视角
      const distance = 15;
      camera.position.set(0, distance * 0.6, distance * 0.6); // 45度倾斜角
      camera.lookAt(0, 0, 0);
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
      // 移动端设置更倾斜的视角，增强立体感
      const distance = 50;
      camera.position.set(0, distance * 0.7, distance * 0.5); // 增加Y轴比例，使视角更倾斜
      camera.lookAt(0, 0, 0);
      // 移动端可能需要调整渲染器像素比，提高性能
      if (renderer) {
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      }
    } else if (props.isTablet) {
      // 平板适中倾斜角度
      const distance = 40;
      camera.position.set(0, distance * 0.65, distance * 0.55); // 适中的倾斜角度
      camera.lookAt(0, 0, 0);
      if (renderer) {
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      }
    } else {
      // 桌面端设置最佳倾斜视角
      const distance = 15;
      camera.position.set(0, distance * 0.6, distance * 0.6); // 45度倾斜角
      camera.lookAt(0, 0, 0);
      if (renderer) {
        renderer.setPixelRatio(window.devicePixelRatio);
      }
    }
  }

  // 调整控制器参数，优化倾斜视角下的交互体验
  if (controls) {
    // 设置更合适的极角范围，使命盘在倾斜视角下有更好的展示效果
    controls.minPolarAngle = Math.PI / 6; // 最小极角（30度）
    controls.maxPolarAngle = Math.PI / 2.2; // 最大极角，防止相机穿过地面
    
    if (props.isMobile) {
      // 移动端可能需要更灵敏的触摸控制
      controls.rotateSpeed = 0.5;
      controls.zoomSpeed = 0.8;
    } else {
      // 桌面端设置更平滑的控制
      controls.rotateSpeed = 0.3;
      controls.zoomSpeed = 0.5;
    }
    
    controls.update();
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
  const handleDeviceTypeChange = (event: Event) => {
    const customEvent = event as CustomEvent<{ isMobile: boolean, isTablet: boolean }>;
    const { isMobile, isTablet } = customEvent.detail
    // 使用这些变量进行某些操作
    if (isMobile || isTablet) {
      // 执行某些特定逻辑
    }
    // 强制触发场景调整
    setTimeout(() => {
      handleResize && handleResize()
    }, 100)
  }

  window.addEventListener('deviceTypeChanged', handleDeviceTypeChange as EventListener)

  // 保存清理函数
  ziWeiScene?.addCleanupCallback(() => {
    window.removeEventListener('deviceTypeChanged', handleDeviceTypeChange as EventListener)
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
