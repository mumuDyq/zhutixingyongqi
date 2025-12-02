import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ModelManagerFactory } from './ModelManager.ts';

/**
 * 模型管理器接口，定义了模型管理的基本方法
 */
interface IModelManager {
  loadModel(url: string): Promise<THREE.Object3D>;
  addModelToScene(model: THREE.Object3D, position?: THREE.Vector3, rotation?: THREE.Euler): void;
  removeModelFromScene(model: THREE.Object3D): void;
  disposeModel(model: THREE.Object3D): void;
}

/**
 * 增强版Three.js场景基础类，提供更丰富的场景管理功能
 */
export class EnhancedThreeSceneBase {
  protected container: HTMLElement;
  public scene: THREE.Scene | null = null;
  public camera: THREE.PerspectiveCamera | null = null;
  public renderer: THREE.WebGLRenderer | null = null;
  public controls: OrbitControls | null = null;
  public animationId: number | null = null;
  protected isInitialized = false;

  // 模型管理器
  protected modelManagers: Map<string, IModelManager> = new Map();

  // 场景对象集合，便于管理
  protected sceneObjects: Map<string, THREE.Object3D> = new Map();

  // 动画回调集合
  protected animationCallbacks: Array<() => void> = [];
  
  // 清理回调集合
  protected cleanupCallbacks: Array<() => void> = [];

  constructor(container: HTMLElement) {
    this.container = container;
  }
  
  /**
   * 添加清理回调函数
   * @param callback 清理回调函数
   */
  public addCleanupCallback(callback: () => void): void {
    this.cleanupCallbacks.push(callback);
  }
  
  /**
   * 移除清理回调函数
   * @param callback 要移除的清理回调函数
   * @returns 是否成功移除
   */
  public removeCleanupCallback(callback: () => void): boolean {
    const index = this.cleanupCallbacks.indexOf(callback);
    if (index !== -1) {
      this.cleanupCallbacks.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * 初始化基础场景
   */
  public initBaseScene(backgroundColor = 0x000814): void {
    // 创建场景
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(backgroundColor);

    // 创建相机
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      1000
    );
    // 设置相机位置，使命盘最大化适配页面
    // 根据容器宽高比调整相机位置，确保命盘适配到页面最大
    const aspectRatio = this.container.clientWidth / this.container.clientHeight;
    // 根据视场角和命盘大小计算最佳距离，使命盘尽可能大
    const fov = this.camera.fov * (Math.PI / 180); // 将视场角转换为弧度
    const chartRadius = 8; // 命盘半径
    // 使用三角函数计算最佳距离，考虑倾斜角度，减小距离使画面更近
    const distance = chartRadius / Math.tan(fov / 2) / Math.cos(Math.PI / 4) * 0.65; // 45度倾斜角，距离缩小35%
    
    // 设置相机位置，使命盘正面朝向屏幕外并有一定倾斜角度
    // 调整Y轴和Z轴比例，使命盘倾斜角度更合适
    this.camera.position.set(0, distance * 0.7, distance * 0.5); // 增加Y轴比例，使视角更倾斜
    this.camera.lookAt(0, 0, 0); // 相机看向原点

    // 创建渲染器
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.container.appendChild(this.renderer.domElement);

    // 添加控制器
    if (this.camera && this.renderer) {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      
      // 设置初始视角为倾斜视角
      this.controls.target.set(0, 0, 0);
      this.controls.minPolarAngle = Math.PI / 6; // 最小极角（30度），防止视角过于倾斜
      this.controls.maxPolarAngle = Math.PI / 2.2; // 最大极角，防止相机穿过地面
      this.controls.update();
    }

    // 添加基础光源
    this.addBasicLights();

    // 初始化模型管理器
    this.initModelManagers();

    // 监听窗口大小变化
    window.addEventListener('resize', this.onWindowResize.bind(this));

    this.isInitialized = true;
  }

  /**
   * 初始化模型管理器
   */
  protected initModelManagers(): void {
    if (!this.scene) return;

    // 创建不同类型的模型管理器
    const gltfManager = ModelManagerFactory.createModelManager('gltf', this.scene);
    const objManager = ModelManagerFactory.createModelManager('obj', this.scene);
    const baseManager = ModelManagerFactory.createModelManager('base', this.scene);

    this.modelManagers.set('gltf', gltfManager);
    this.modelManagers.set('obj', objManager);
    this.modelManagers.set('base', baseManager);
  }

  /**
   * 获取指定类型的模型管理器
   */
  public getModelManager(type: 'gltf' | 'obj' | 'base'): IModelManager | undefined {
    return this.modelManagers.get(type);
  }

  /**
   * 添加场景对象
   */
  public addSceneObject(id: string, object: THREE.Object3D): void {
    if (!this.scene) return;

    this.sceneObjects.set(id, object);
    this.scene.add(object);
  }

  /**
   * 移除场景对象
   */
  public removeSceneObject(id: string): boolean {
    if (!this.scene) return false;

    const object = this.sceneObjects.get(id);
    if (object) {
      this.scene.remove(object);
      this.sceneObjects.delete(id);
      return true;
    }
    return false;
  }

  /**
   * 获取场景对象
   */
  public getSceneObject(id: string): THREE.Object3D | undefined {
    return this.sceneObjects.get(id);
  }

  /**
   * 添加动画回调
   */
  public addAnimationCallback(callback: () => void): void {
    this.animationCallbacks.push(callback);
  }

  /**
   * 移除动画回调
   */
  public removeAnimationCallback(callback: () => void): boolean {
    const index = this.animationCallbacks.indexOf(callback);
    if (index > -1) {
      this.animationCallbacks.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * 添加基础光源
   */
  protected addBasicLights(): void {
    if (!this.scene) return;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.position.set(10, 10, 10);
    this.scene.add(directionalLight);
  }

  /**
   * 处理窗口大小变化
   */
  protected onWindowResize(): void {
    if (!this.camera || !this.renderer) return;

    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    
    // 根据容器宽高比调整相机位置，确保命盘适配到页面最大
    const aspectRatio = this.container.clientWidth / this.container.clientHeight;
    // 根据视场角和命盘大小计算最佳距离，使命盘尽可能大
    const fov = this.camera.fov * (Math.PI / 180); // 将视场角转换为弧度
    const chartRadius = 8; // 命盘半径
    // 使用三角函数计算最佳距离，考虑倾斜角度，减小距离使画面更近
    const distance = chartRadius / Math.tan(fov / 2) / Math.cos(Math.PI / 4) * 0.65; // 45度倾斜角，距离缩小35%
    
    // 调整Y轴和Z轴比例，使命盘倾斜角度更合适
    this.camera.position.set(0, distance * 0.7, distance * 0.5); // 增加Y轴比例，使视角更倾斜
    this.camera.lookAt(0, 0, 0); // 相机看向原点
    
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    
    // 更新控制器
    if (this.controls) {
      this.controls.update();
    }
  }

  /**
   * 开始动画循环
   */
  public startAnimation(): void {
    if (!this.scene || !this.camera || !this.renderer || !this.controls) {
      console.error('Scene components are not initialized properly');
      return;
    }

    const animate = () => {
      this.animationId = requestAnimationFrame(animate);

      // 执行所有动画回调
      this.animationCallbacks.forEach(callback => callback());

      this.controls!.update();
      this.renderer!.render(this.scene!, this.camera!);
    };
    animate();
  }

  /**
   * 停止动画循环
   */
  public stopAnimation(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * 清理资源
   */
  public dispose(): void {
    // 停止动画
    this.stopAnimation();
    
    // 执行所有清理回调
    this.cleanupCallbacks.forEach(callback => callback());
    this.cleanupCallbacks = [];

    // 清理所有模型管理器
    this.modelManagers.forEach(manager => {
      if ('disposeAllModels' in manager) {
        (manager as any).disposeAllModels();
      }
    });

    // 移除所有场景对象
    this.sceneObjects.forEach((object, id) => {
      this.removeSceneObject(id);
    });

    // 移除事件监听
    window.removeEventListener('resize', this.onWindowResize.bind(this));

    // 清理渲染器
    if (this.container && this.renderer && this.renderer.domElement) {
      this.container.removeChild(this.renderer.domElement);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }

    this.isInitialized = false;
  }

  /**
   * 获取场景对象
   */
  public getScene(): THREE.Scene {
    if (!this.scene) {
      throw new Error('Scene is not initialized. Call initBaseScene() first.');
    }
    return this.scene;
  }

  /**
   * 获取相机对象
   */
  public getCamera(): THREE.PerspectiveCamera {
    if (!this.camera) {
      throw new Error('Camera is not initialized. Call initBaseScene() first.');
    }
    return this.camera;
  }
}
