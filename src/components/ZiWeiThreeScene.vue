<template>
  <div ref="container" class="three-scene">
    <button class="star-names-toggle" @click="toggleStarNames">
      {{ showStarNames ? '隐藏星耀名称' : '显示星耀名称' }}
    </button>
  </div>
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

// 星耀名称显示状态
const showStarNames = ref(false);

// 切换星耀名称显示状态
const toggleStarNames = () => {
  showStarNames.value = !showStarNames.value;
  if (ziWeiScene) {
    ziWeiScene.setStarNamesVisibility(showStarNames.value);
  }
};

// 监听命盘旋转状态，自动切换星耀名称显示
let lastRotation = { x: 0, y: 0 };
let isRotating = false;
let rotationTimeout: number | null = null;

const checkRotation = () => {
  if (!ziWeiScene || !ziWeiScene.controls) return;
  
  const controls = ziWeiScene.controls;
  const currentRotation = {
    x: controls.getAzimuthalAngle(),
    y: controls.getPolarAngle()
  };
  
  // 计算旋转变化量
  const deltaX = Math.abs(currentRotation.x - lastRotation.x);
  const deltaY = Math.abs(currentRotation.y - lastRotation.y);
  
  // 检查是否在旋转或移动
  const currentlyRotating = deltaX > 0.001 || deltaY > 0.001;
  
  // 如果状态改变，更新星耀名称显示
  if (currentlyRotating !== isRotating) {
    isRotating = currentlyRotating;
    
    // 如果正在旋转，立即隐藏名称
    if (isRotating) {
      showStarNames.value = false;
      ziWeiScene.setStarNamesVisibility(false);
      
      // 清除之前的延迟显示
      if (rotationTimeout) {
        clearTimeout(rotationTimeout);
        rotationTimeout = null;
      }
    } else {
      // 如果停止旋转，延迟500ms后显示名称
      rotationTimeout = setTimeout(() => {
        showStarNames.value = true;
        ziWeiScene.setStarNamesVisibility(true);
        rotationTimeout = null;
      }, 500) as unknown as number;
    }
  }
  
  lastRotation = { ...currentRotation };
};

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
  
  // 父母宫星耀 - 添加9个星耀
  ziWeiScene.addStarToPalace('父母', '左辅', 0x88ff88, new THREE.Vector3(-0.8, 0, 0));
  ziWeiScene.addStarToPalace('父母', '右弼', 0xff8888, new THREE.Vector3(0.8, 0, 0));
  ziWeiScene.addStarToPalace('父母', '文昌', 0x8888ff, new THREE.Vector3(0, 0, -0.8));
  ziWeiScene.addStarToPalace('父母', '文曲', 0xffff88, new THREE.Vector3(-0.4, 0, 0.4));
  ziWeiScene.addStarToPalace('父母', '天魁', 0xff88ff, new THREE.Vector3(0.4, 0, 0.4));
  ziWeiScene.addStarToPalace('父母', '天钺', 0x88ffff, new THREE.Vector3(-0.4, 0, -0.4));
  ziWeiScene.addStarToPalace('父母', '禄存', 0xffcc00, new THREE.Vector3(0.4, 0, -0.4));
  ziWeiScene.addStarToPalace('父母', '火星', 0xff0000, new THREE.Vector3(0, 0, 0.8));
  ziWeiScene.addStarToPalace('父母', '铃星', 0x9900ff, new THREE.Vector3(0, 0, 0));
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
  
  // 添加旋转检查回调
  ziWeiScene.addAnimationCallback(checkRotation);
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
  
  // 清理旋转检测定时器
  if (rotationTimeout) {
    clearTimeout(rotationTimeout);
    rotationTimeout = null;
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

.star-names-toggle {
  position: absolute;
  bottom: 20px;
  right: 20px;
  padding: 8px 16px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  z-index: 100;
  transition: all 0.3s ease;
}

.star-names-toggle:hover {
  background-color: rgba(0, 0, 0, 0.8);
  border-color: rgba(255, 255, 255, 0.5);
}
</style>
