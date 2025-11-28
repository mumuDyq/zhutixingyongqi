import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * Three.js 场景基础类，提供通用的场景初始化和管理功能
 */
export class ThreeSceneBase {
  protected container: HTMLElement;
  public scene: THREE.Scene | null = null;
  public camera: THREE.PerspectiveCamera | null = null;
  public renderer: THREE.WebGLRenderer | null = null;
  public controls: OrbitControls | null = null;
  public animationId: number | null = null;
  protected isInitialized = false;

  constructor(container: HTMLElement) {
    this.container = container;
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
    this.camera.position.z = 30;

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
    }

    // 添加基础光源
    this.addBasicLights();

    // 监听窗口大小变化
    window.addEventListener('resize', this.onWindowResize.bind(this));

    this.isInitialized = true;
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
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }

  /**
   * 开始动画循环
   */
  public startAnimation(animateCallback: () => void): void {
    if (!this.scene || !this.camera || !this.renderer || !this.controls) {
      console.error('Scene components are not initialized properly');
      return;
    }
    
    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      animateCallback();
      this.controls!.update();
      this.renderer!.render(this.scene!, this.camera!);
    };
    animate();
  }

  /**
   * 清理资源
   */
  public dispose(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    window.removeEventListener('resize', this.onWindowResize.bind(this));
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
