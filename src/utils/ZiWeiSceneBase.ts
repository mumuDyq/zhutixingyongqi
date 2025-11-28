import { EnhancedThreeSceneBase } from './EnhancedThreeSceneBase';
import * as THREE from 'three';

/**
 * 紫微斗数场景基类，继承自EnhancedThreeSceneBase，提供紫微斗数相关的通用功能
 */
export class ZiWeiSceneBase extends EnhancedThreeSceneBase {
  public stars: THREE.Points | null = null;

  constructor(container: HTMLElement) {
    super(container);
  }

  /**
   * 初始化紫微斗数场景
   */
  public initZiWeiScene(): void {
    // 初始化基础场景
    this.initBaseScene(0x000814);

    // 创建星空背景
    this.createStarField();

    // 创建紫微斗数盘
    this.createZiWeiChart();
  }

  /**
   * 创建星空背景
   */
  public createStarField(): void {
    if (!this.scene) {
      console.error('Scene is not initialized');
      return;
    }
    
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.5,
      transparent: true,
      opacity: 0.8
    });

    const starsVertices = [];
    for (let i = 0; i < 10000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(starsVertices), 3));
    this.stars = new THREE.Points(starsGeometry, starsMaterial);
    this.scene.add(this.stars);
  }

  /**
   * 创建紫微斗数盘
   */
  public createZiWeiChart(): void {
    if (!this.scene) {
      console.error('Scene is not initialized');
      return;
    }
    
    // 创建底盘
    const plateGeometry = new THREE.CylinderGeometry(15, 15, 0.5, 32);
    const plateMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1a237e,
      metalness: 0.5,
      roughness: 0.5
    });
    const plate = new THREE.Mesh(plateGeometry, plateMaterial);
    plate.rotation.x = Math.PI / 2;
    this.scene.add(plate);

    // 创建十二宫格
    const palaces = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    const angleStep = (Math.PI * 2) / palaces.length;

    for (let i = 0; i < palaces.length; i++) {
      const angle = i * angleStep;
      const x = Math.cos(angle) * 12;
      const z = Math.sin(angle) * 12;

      // 创建宫格立方体
      const boxGeometry = new THREE.BoxGeometry(2, 0.5, 2);
      const boxMaterial = new THREE.MeshStandardMaterial({ 
        color: new THREE.Color().setHSL(i / palaces.length, 0.7, 0.5),
        emissive: new THREE.Color().setHSL(i / palaces.length, 0.7, 0.3),
        emissiveIntensity: 0.2
      });
      const box = new THREE.Mesh(boxGeometry, boxMaterial);
      box.position.set(x, 1, z);
      box.lookAt(0, 0, 0);
      box.rotateY(Math.PI / 2);
      this.scene.add(box);

      // 创建文字标签（使用简单的几何体代替真实文字）
      const textGeometry = new THREE.SphereGeometry(0.5, 16, 16);
      const textMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 0.5
      });
      const textMesh = new THREE.Mesh(textGeometry, textMaterial);
      textMesh.position.set(x, 2, z);
      this.scene.add(textMesh);
    }

    // 创建中心太极
    this.createTaiji();
  }

  /**
   * 创建中心太极
   */
  public createTaiji(): void {
    if (!this.scene) {
      console.error('Scene is not initialized');
      return;
    }
    
    const taijiGroup = new THREE.Group();

    // 阴
    const yinGeometry = new THREE.SphereGeometry(2, 32, 16, Math.PI / 2, Math.PI);
    const yinMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x000000,
      metalness: 0.3,
      roughness: 0.4
    });
    const yin = new THREE.Mesh(yinGeometry, yinMaterial);
    taijiGroup.add(yin);

    // 阳
    const yangGeometry = new THREE.SphereGeometry(2, 32, 16, -Math.PI / 2, Math.PI);
    const yangMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffff,
      metalness: 0.3,
      roughness: 0.4
    });
    const yang = new THREE.Mesh(yangGeometry, yangMaterial);
    taijiGroup.add(yang);

    taijiGroup.position.y = 0.5;
    this.scene.add(taijiGroup);
  }

  /**
   * 开始动画循环，包含星空旋转
   */
  public startZiWeiAnimation(customAnimation?: () => void): void {
    if (!this.isInitialized) {
      console.error('Scene is not initialized. Call initZiWeiScene() first.');
      return;
    }
    
    // 添加星空旋转动画
    this.addAnimationCallback(() => {
      if (this.stars) {
        this.stars.rotation.y += 0.0005;
      }
    });
    
    // 如果有自定义动画，添加到动画回调中
    if (customAnimation) {
      this.addAnimationCallback(customAnimation);
    }
    
    // 开始动画循环
    this.startAnimation();
  }
}
