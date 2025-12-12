<template>
  <div ref="container" class="three-scene">
    <button class="star-names-toggle" @click="toggleStarNames">
      {{ showStarNames ? '隐藏星耀名称' : '显示星耀名称' }}
    </button>
    
    <!-- 三方四正控制面板 -->
    <div class="three-sides-panel" v-if="showThreeSidesPanel">
      <div class="panel-header">
        <h3>三方四正</h3>
        <button class="close-btn" @click="showThreeSidesPanel = false">×</button>
      </div>
      <div class="panel-content">
        <div class="palace-grid">
          <div class="palace-item" 
               v-for="palace in palaceNames" 
               :key="palace" 
               :class="{ 'selected': selectedPalace === palace }"
               @click="selectPalace(palace)">
            {{ palace }}
          </div>
        </div>
        <div class="palace-info" v-if="selectedPalace">
          <div class="selected-info">
            <span class="label">当前选中:</span>
            <span class="value">{{ selectedPalace }}</span>
          </div>
          <div class="related-palaces" v-if="relatedPalaces.length > 0">
            <div class="palace-relation" 
                 v-for="(palace, index) in relatedPalaces" 
                 :key="index"
                 :data-type="getPalaceRelationType(palace.relation)">
              <span class="relation-type">{{ palace.relation }}:</span>
              <span class="palace-name">{{ palace.name }}</span>
            </div>
          </div>
          
          <!-- 添加图例 -->
          <div class="legend">
            <div class="legend-item">
              <div class="legend-color main"></div>
              <span>本宫</span>
            </div>
            <div class="legend-item">
              <div class="legend-color opposite"></div>
              <span>对宫</span>
            </div>
            <div class="legend-item">
              <div class="legend-color triad"></div>
              <span>三合宫</span>
            </div>
          </div>
        </div>
        <div class="action-buttons">
          <button class="show-btn" @click="showThreeSidesAndFourDirections" :disabled="!selectedPalace">
            显示三方四正
          </button>
          <button class="clear-btn" @click="clearThreeSidesAndFourDirections">
            清除显示
          </button>
        </div>
        <div class="instructions">
          <p>提示：点击上方宫位或直接点击命盘上的宫位进行选择</p>
        </div>
      </div>
    </div>
    
    <!-- 打开三方四正面板的按钮 -->
    <button class="three-sides-toggle" @click="showThreeSidesPanel = true">
      三方四正
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

// 三方四正相关状态
const showThreeSidesPanel = ref(false);
const selectedPalace = ref('');
const relatedPalaces = ref<Array<{name: string, relation: string}>>([]);

// 宫位名称数组
const palaceNames = [
  '命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄',
  '迁移', '交友', '官禄', '田宅', '福德', '父母'
];

// 宫位索引映射 - 按照顺时针顺序排列
const palaceIndexMap: { [key: string]: number } = {
  '命宫': 0,
  '兄弟': 1,
  '夫妻': 2,
  '子女': 3,
  '财帛': 4,
  '疾厄': 5,
  '迁移': 6,
  '交友': 7,
  '官禄': 8,
  '田宅': 9,
  '福德': 10,
  '父母': 11
};

// 通过宫位名称选择宫位
const selectPalace = (palaceName: string) => {
  selectedPalace.value = palaceName;
  
  // 计算三方四正关系
  calculateRelatedPalaces(palaceName);
  
  // 高亮选中的宫位
  highlightSelectedPalace(palaceName);
  
  // 如果三方四正面板打开，自动显示三方四正
  if (showThreeSidesPanel.value) {
    ziWeiScene?.showThreeSidesAndFourDirections(palaceName, true);
  }
};

// 获取宫位关系类型
const getPalaceRelationType = (relation: string): string => {
  if (relation === '对宫') {
    return 'opposite';
  } else if (relation === '三合宫') {
    return 'triad';
  }
  return '';
};

// 计算三方四正关系
const calculateRelatedPalaces = (palaceName: string) => {
  if (!palaceName) {
    relatedPalaces.value = [];
    return;
  }
  
  // 获取宫位索引
  const palaceIndex = palaceIndexMap[palaceName];
  if (palaceIndex === undefined) {
    relatedPalaces.value = [];
    return;
  }
  
  // 清空之前的关系
  relatedPalaces.value = [];
  
  // 计算三方四正的宫位索引
  // 对宫（相隔6个宫位，即180度对角）
  const oppositeIndex = (palaceIndex + 6) % 12;
  
  // 三合宫（相隔4个宫位，形成120度角）
  const firstTriadIndex = (palaceIndex + 4) % 12;
  const secondTriadIndex = (palaceIndex + 8) % 12;
  
  // 添加对宫关系
  relatedPalaces.value.push({
    name: palaceNames[oppositeIndex],
    relation: '对宫'
  });
  
  // 添加三合宫关系
  relatedPalaces.value.push({
    name: palaceNames[firstTriadIndex],
    relation: '三合宫'
  });
  
  relatedPalaces.value.push({
    name: palaceNames[secondTriadIndex],
    relation: '三合宫'
  });
};

// 鼠标点击事件处理
const handleMouseClick = (event: MouseEvent) => {
  if (!ziWeiScene || !ziWeiScene.camera || !ziWeiScene.scene || !ziWeiScene.renderer) return;
  
  // 获取鼠标位置
  const rect = ziWeiScene.renderer.domElement.getBoundingClientRect();
  const mouse = new THREE.Vector2();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  
  // 创建射线
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, ziWeiScene.camera);
  
  // 获取所有宫位对象
  const palaceObjects: THREE.Object3D[] = [];
  ziWeiScene.palaces.forEach(palace => {
    palaceObjects.push(palace);
  });
  
  // 检测射线与宫位的交点
  const intersects = raycaster.intersectObjects(palaceObjects, true);
  
  if (intersects.length > 0) {
    // 找到被点击的宫位对象
    let clickedPalace: THREE.Object3D | null = null;
    let palaceName = '';
    
    // 从交点对象向上查找宫位组
    for (const intersect of intersects) {
      let obj = intersect.object;
      while (obj && !obj.name.startsWith('palace_')) {
        obj = obj.parent;
      }
      
      if (obj && obj.name.startsWith('palace_')) {
        clickedPalace = obj;
        palaceName = obj.name.substring(7); // 去掉"palace_"前缀
        break;
      }
    }
    
    if (clickedPalace && palaceName) {
      // 使用新的选择方法
      selectPalace(palaceName);
    }
  }
};

// 高亮选中的宫位
const highlightSelectedPalace = (palaceName: string) => {
  if (!ziWeiScene) return;
  
  // 先清除所有宫位的高亮
  ziWeiScene.palaces.forEach(palace => {
    palace.traverse((child) => {
      if (child instanceof THREE.Mesh && child.userData.selectedMaterial) {
        // 恢复原始材质
        child.material = child.userData.originalMaterial || child.material;
        delete child.userData.selectedMaterial;
      }
    });
  });
  
  // 高亮新选中的宫位
  const palaceObj = ziWeiScene.palaces.get(palaceName);
  if (palaceObj) {
    palaceObj.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry instanceof THREE.ShapeGeometry) {
        // 保存原始材质
        const originalMaterial = child.material as THREE.MeshStandardMaterial;
        child.userData.originalMaterial = originalMaterial;
        
        // 创建选中高亮材质
        const selectedMaterial = new THREE.MeshStandardMaterial({
          color: new THREE.Color(0xFFD700), // 金色
          emissive: new THREE.Color(0xFFD700),
          emissiveIntensity: 0.3,
          metalness: originalMaterial.metalness,
          roughness: originalMaterial.roughness,
          transparent: true,
          opacity: 0.9
        });
        
        // 应用高亮材质
        child.material = selectedMaterial;
        child.userData.selectedMaterial = selectedMaterial;
      }
    });
  }
};

// 显示三方四正关系
const showThreeSidesAndFourDirections = () => {
  if (!ziWeiScene || !selectedPalace.value) return;
  
  ziWeiScene.showThreeSidesAndFourDirections(selectedPalace.value, true);
};

// 清除三方四正显示
const clearThreeSidesAndFourDirections = () => {
  if (!ziWeiScene) return;
  
  ziWeiScene.clearThreeSidesAndFourDirections();
  
  // 清除宫位选中高亮
  ziWeiScene.palaces.forEach(palace => {
    palace.traverse((child) => {
      if (child instanceof THREE.Mesh && child.userData.selectedMaterial) {
        // 恢复原始材质
        child.material = child.userData.originalMaterial || child.material;
        delete child.userData.selectedMaterial;
        delete child.userData.originalMaterial;
      }
    });
  });
  
  // 清空选中的宫位和相关宫位信息
  selectedPalace.value = '';
  relatedPalaces.value = [];
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
  
  // 添加鼠标点击事件监听器
  ziWeiScene.renderer.domElement.addEventListener('click', handleMouseClick);
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

/* 三方四正控制面板样式 */
.three-sides-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 300px;
  background-color: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: rgba(26, 14, 46, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.panel-content {
  padding: 16px;
}

/* 宫位网格布局 */
.palace-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.palace-item {
  padding: 8px 4px;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.palace-item:hover {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}

.palace-item.selected {
  background-color: rgba(255, 215, 0, 0.2);
  border-color: rgba(255, 215, 0, 0.8);
  color: #FFD700;
  font-weight: bold;
  box-shadow: 0 0 8px rgba(255, 215, 0, 0.3);
}

/* 宫位信息展示 */
.palace-info {
  margin-bottom: 16px;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.selected-info {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.selected-info .label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-right: 8px;
}

.selected-info .value {
  font-size: 16px;
  color: #FFD700;
  font-weight: bold;
}

.related-palaces {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.palace-relation {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.relation-type {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  width: 60px;
  flex-shrink: 0;
  font-weight: bold;
}

.palace-name {
  font-size: 14px;
  padding: 4px 10px;
  border-radius: 4px;
  margin-left: 8px;
  font-weight: 500;
  flex-grow: 1;
}

/* 根据关系类型设置不同的颜色 */
.palace-relation[data-type="main"] .palace-name {
  background-color: rgba(255, 215, 0, 0.3);
  border: 1px solid rgba(255, 215, 0, 0.6);
  color: #FFD700;
  box-shadow: 0 0 5px rgba(255, 215, 0, 0.3);
}

.palace-relation[data-type="opposite"] .palace-name {
  background-color: rgba(0, 255, 0, 0.2);
  border: 1px solid rgba(0, 255, 0, 0.5);
  color: #00FF00;
}

.palace-relation[data-type="triad"] .palace-name {
  background-color: rgba(0, 153, 255, 0.2);
  border: 1px solid rgba(0, 153, 255, 0.5);
  color: #0099FF;
}

/* 添加图例 */
.legend {
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  justify-content: space-around;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 6px;
}

.legend-color.main {
  background-color: #FFD700;
  box-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
}

.legend-color.opposite {
  background-color: #00FF00;
}

.legend-color.triad {
  background-color: #0099FF;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.show-btn, .clear-btn {
  flex: 1;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.show-btn {
  background-color: rgba(26, 14, 46, 0.8);
  color: white;
}

.show-btn:hover:not(:disabled) {
  background-color: rgba(26, 14, 46, 1);
  border-color: rgba(255, 255, 255, 0.5);
}

.show-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.clear-btn {
  background-color: rgba(139, 0, 0, 0.7);
  color: white;
}

.clear-btn:hover {
  background-color: rgba(139, 0, 0, 0.9);
  border-color: rgba(255, 255, 255, 0.5);
}

/* 三方四正切换按钮 */
.three-sides-toggle {
  position: absolute;
  bottom: 70px;
  right: 20px;
  padding: 8px 16px;
  background-color: rgba(26, 14, 46, 0.7);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  z-index: 100;
  transition: all 0.3s ease;
}

.three-sides-toggle:hover {
  background-color: rgba(26, 14, 46, 0.9);
  border-color: rgba(255, 255, 255, 0.5);
}

.instructions {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.instructions p {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-style: italic;
  text-align: center;
}
</style>
