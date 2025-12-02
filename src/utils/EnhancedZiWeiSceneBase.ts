import { EnhancedThreeSceneBase } from './EnhancedThreeSceneBase';
import * as THREE from 'three';

// 定义宫位位置类型
interface PalacePosition {
  x: number;
  z: number;
  name: string;
}

/**
 * 增强版紫微斗数场景基类，继承自EnhancedThreeSceneBase，提供更丰富的紫微斗数相关功能
 */
export class EnhancedZiWeiSceneBase extends EnhancedThreeSceneBase {
  public stars: THREE.Points | null = null;

  // 紫微斗数相关对象
  protected ziWeiChart: THREE.Group | null = null;
  protected palaces: Map<string, THREE.Object3D> = new Map();
  protected taiji: THREE.Group | null = null;

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
    
    // 添加星耀动态缩放功能
    this.addStarScalingCallback();
  }
  
  /**
   * 添加星耀动态缩放功能
   */
  private addStarScalingCallback(): void {
    // 添加动画回调，用于动态调整星耀大小
    this.addAnimationCallback(() => {
      if (!this.camera || !this.ziWeiChart) return;
      
      // 遍历所有星耀组
      this.ziWeiChart.traverse((child) => {
        if (child instanceof THREE.Group && child.name.startsWith('star_')) {
          // 计算星耀与相机的距离
          const distance = this.camera!.position.distanceTo(child.position);
          
          // 根据距离动态调整缩放比例，距离越远缩放越大
          // 使用对数函数使缩放更加平滑
          const scale = 1 + Math.log(Math.max(distance / 5, 1)) * 0.5;
          
          // 限制最大缩放比例，防止星耀过大
          const maxScale = 2.5;
          const finalScale = Math.min(scale, maxScale);
          
          // 应用缩放
          child.scale.set(finalScale, finalScale, finalScale);
        }
      });
    });
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

    // 创建紫微斗数盘组
    this.ziWeiChart = new THREE.Group();
    this.ziWeiChart.name = 'ziWeiChart';

    // 创建多层底盘，增加层次感
    this.createBasePlate();

    // 创建十二宫格
    this.createPalaces();

    // 添加装饰元素
    this.addDecorativeElements();

    // 添加到场景
    this.scene.add(this.ziWeiChart);
  }

  /**
   * 创建平面底盘
   */
  protected createBasePlate(): void {
    if (!this.ziWeiChart) return;

    // 主底盘 - 使用4x4正方形平面
    const plateSize = 16; // 正方形边长
    const plateGeometry = new THREE.PlaneGeometry(plateSize, plateSize);
    const plateMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a0e2e,
      metalness: 0.5,
      roughness: 0.5
    });
    const plate = new THREE.Mesh(plateGeometry, plateMaterial);
    plate.rotation.x = -Math.PI / 2;
    this.ziWeiChart.add(plate);

    // 添加网格线，增强视觉效果
    const gridMaterial = new THREE.LineBasicMaterial({
      color: 0xDAA520, // 金色
      transparent: true,
      opacity: 0.3
    });

    // 横线
    for (let i = -6; i <= 6; i += 4) {
      const points = [];
      points.push(new THREE.Vector3(-6, 0.01, i));
      points.push(new THREE.Vector3(6, 0.01, i));
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(lineGeometry, gridMaterial);
      this.ziWeiChart.add(line);
    }

    // 竖线
    for (let i = -6; i <= 6; i += 4) {
      const points = [];
      points.push(new THREE.Vector3(i, 0.01, -6));
      points.push(new THREE.Vector3(i, 0.01, 6));
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(lineGeometry, gridMaterial);
      this.ziWeiChart.add(line);
    }

    // 外边框 - 使用线条而不是立体边框
    const borderMaterial = new THREE.LineBasicMaterial({
      color: 0xDAA520, // 金色
      linewidth: 3
    });

    // 上边框
    const topBorderPoints = [
      new THREE.Vector3(-plateSize / 2, 0.01, plateSize / 2),
      new THREE.Vector3(plateSize / 2, 0.01, plateSize / 2)
    ];
    const topBorderGeometry = new THREE.BufferGeometry().setFromPoints(topBorderPoints);
    const topBorder = new THREE.Line(topBorderGeometry, borderMaterial);
    this.ziWeiChart.add(topBorder);

    // 下边框
    const bottomBorderPoints = [
      new THREE.Vector3(-plateSize / 2, 0.01, -plateSize / 2),
      new THREE.Vector3(plateSize / 2, 0.01, -plateSize / 2)
    ];
    const bottomBorderGeometry = new THREE.BufferGeometry().setFromPoints(bottomBorderPoints);
    const bottomBorder = new THREE.Line(bottomBorderGeometry, borderMaterial);
    this.ziWeiChart.add(bottomBorder);

    // 左边框
    const leftBorderPoints = [
      new THREE.Vector3(-plateSize / 2, 0.01, -plateSize / 2),
      new THREE.Vector3(-plateSize / 2, 0.01, plateSize / 2)
    ];
    const leftBorderGeometry = new THREE.BufferGeometry().setFromPoints(leftBorderPoints);
    const leftBorder = new THREE.Line(leftBorderGeometry, borderMaterial);
    this.ziWeiChart.add(leftBorder);

    // 右边框
    const rightBorderPoints = [
      new THREE.Vector3(plateSize / 2, 0.01, -plateSize / 2),
      new THREE.Vector3(plateSize / 2, 0.01, plateSize / 2)
    ];
    const rightBorderGeometry = new THREE.BufferGeometry().setFromPoints(rightBorderPoints);
    const rightBorder = new THREE.Line(rightBorderGeometry, borderMaterial);
    this.ziWeiChart.add(rightBorder);
  }

  /**
   * 添加装饰元素
   */
  protected addDecorativeElements(): void {
    if (!this.ziWeiChart) return;

    // 添加装饰性小星点 - 围绕正方形底盘边缘
    const positions = [
      // 上边缘
      ...Array.from({ length: 16 }, (_, i) => ({
        x: -8 + i * 1,
        z: 8.5,
        y: 0.1
      })),
      // 右边缘
      ...Array.from({ length: 16 }, (_, i) => ({
        x: 8.5,
        z: 8 - i * 1,
        y: 0.1
      })),
      // 下边缘
      ...Array.from({ length: 16 }, (_, i) => ({
        x: 8 - i * 1,
        z: -8.5,
        y: 0.1
      })),
      // 左边缘
      ...Array.from({ length: 16 }, (_, i) => ({
        x: -8.5,
        z: -8 + i * 1,
        y: 0.1
      }))
    ];

    for (const pos of positions) {
      const starGeometry = new THREE.SphereGeometry(0.05 + Math.random() * 0.05, 8, 8);
      const starMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(Math.random() * 0.1 + 0.55, 0.7, 0.8),
        emissive: new THREE.Color().setHSL(Math.random() * 0.1 + 0.55, 0.7, 0.4),
        emissiveIntensity: 0.5
      });
      const star = new THREE.Mesh(starGeometry, starMaterial);
      star.position.set(pos.x, pos.y, pos.z);
      this.ziWeiChart.add(star);
    }

    // 添加八卦符号装饰 - 放置在底盘四角和边缘中点
    const baguaSymbols = [
      { symbol: '☰', x: -8, z: 8 },
      { symbol: '☱', x: 8, z: 8 },
      { symbol: '☲', x: 8, z: -8 },
      { symbol: '☳', x: -8, z: -8 },
      { symbol: '☴', x: 0, z: 8 },
      { symbol: '☵', x: 8, z: 0 },
      { symbol: '☶', x: 0, z: -8 },
      { symbol: '☷', x: -8, z: 0 }
    ];

    for (const item of baguaSymbols) {
      // 创建八卦符号纹理
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const context = canvas.getContext('2d')!;
      context.fillStyle = 'rgba(0, 0, 0, 0)';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.font = 'bold 80px Arial';
      context.fillStyle = '#d4af37'; // 金色
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(item.symbol, canvas.width / 2, canvas.height / 2);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(1.5, 1.5, 1);
      sprite.position.set(item.x, 0.2, item.z);
      this.ziWeiChart.add(sprite);
    }
  }

  /**
   * 创建十二宫格 - 按照文墨天机布局
   */
  protected createPalaces(): void {
    if (!this.ziWeiChart) return;

    // 紫微斗数十二宫位名称（使用更完整的名称）
    const palaceNames = [
      '命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄',
      '迁移', '交友', '官禄', '田宅', '福德', '父母'
    ];

    const palaceNames2 = [
      '命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄',
      '迁移', '交友', '官禄', '田宅', '福德', '父母'
    ];

    // 传统紫微斗数命盘布局 - 参考文墨天机软件的宫位排列顺序
    // 命盘呈方形，十二宫位按照传统命盘排列
    const gridPositions: PalacePosition[] = [
      // 上方三宫（从左到右）
      { x: -6, z: 6, name: '父母' },
      { x: -2, z: 6, name: '福德' },
      { x: 2, z: 6, name: '田宅' },

      // 右侧三宫（从上到下）
      { x: 6, z: 6, name: '官禄' },
      { x: 6, z: 2, name: '交友' },
      { x: 6, z: -2, name: '迁移' },

      // 下方三宫（从右到左）
      { x: 6, z: -6, name: '疾厄' },
      { x: 2, z: -6, name: '财帛' },
      { x: -2, z: -6, name: '子女' },

      // 左侧三宫（从下到上）
      { x: -6, z: -6, name: '夫妻' },
      { x: -6, z: -2, name: '兄弟' },
      { x: -6, z: 2, name: '命宫' }
    ];

    // 创建连接线，表示宫位之间的关系
    this.createPalaceConnections();

    for (let i = 0; i < gridPositions.length; i++) {
      const position = gridPositions[i];
      if (!position) {
        console.error(`Invalid palace position at index ${i}`);
        continue;
      }

      const x = position.x;
      const z = position.z;

      // 使用位置中定义的名称
      const palaceName = position.name;

      // 创建宫格组
      const palaceGroup = new THREE.Group();

      // 创建更大的矩形宫位底座
      const palaceWidth = 3.8; // 增大宫位宽度
      const palaceDepth = 3.8; // 增大宫位深度
      const palaceHeight = 0.05; // 减小宫位高度，使其刚好能清晰显示宫位名称

      // 创建平面的圆角矩形底座
      const roundedRectShape = new THREE.Shape();
      const width = palaceWidth;
      const height = palaceDepth;
      const radius = 0.3; // 圆角半径

      roundedRectShape.moveTo(-width / 2 + radius, -height / 2);
      roundedRectShape.lineTo(width / 2 - radius, -height / 2);
      roundedRectShape.quadraticCurveTo(width / 2, -height / 2, width / 2, -height / 2 + radius);
      roundedRectShape.lineTo(width / 2, height / 2 - radius);
      roundedRectShape.quadraticCurveTo(width / 2, height / 2, width / 2 - radius, height / 2);
      roundedRectShape.lineTo(-width / 2 + radius, height / 2);
      roundedRectShape.quadraticCurveTo(-width / 2, height / 2, -width / 2, height / 2 - radius);
      roundedRectShape.lineTo(-width / 2, -height / 2 + radius);
      roundedRectShape.quadraticCurveTo(-width / 2, -height / 2, -width / 2 + radius, -height / 2);

      // 创建平面几何体，不进行拉伸
      const palaceGeometry = new THREE.ShapeGeometry(roundedRectShape);

      // 根据宫位创建不同颜色，使用传统紫微斗数配色
      let palaceColor;
      switch (palaceNames[i]) {
        case '命宫':
        case '财帛':
        case '官禄':
          palaceColor = new THREE.Color(0x8B0000); // 暗红色
          break;
        case '夫妻':
        case '子女':
        case '迁移':
          palaceColor = new THREE.Color(0x00008B); // 暗蓝色
          break;
        case '兄弟':
        case '疾厄':
        case '交友':
          palaceColor = new THREE.Color(0x006400); // 暗绿色
          break;
        case '田宅':
        case '福德':
        case '父母':
        default:
          palaceColor = new THREE.Color(0x4B0082); // 暗紫色
          break;
      }

      const palaceMaterial = new THREE.MeshStandardMaterial({
        color: palaceColor,
        metalness: 0.3,
        roughness: 0.4,
        transparent: true,
        opacity: 0.8
      });

      const palace = new THREE.Mesh(palaceGeometry, palaceMaterial);
      palace.rotation.x = -Math.PI / 2;
      palace.position.y = 0.01; // 完全贴合底盘
      palaceGroup.add(palace);

      // 添加平面边框
      const borderShape = new THREE.Shape();
      const borderWidth = palaceWidth + 0.2;
      const borderHeight = palaceDepth + 0.2;
      const borderRadius = 0.3;

      borderShape.moveTo(-borderWidth / 2 + borderRadius, -borderHeight / 2);
      borderShape.lineTo(borderWidth / 2 - borderRadius, -borderHeight / 2);
      borderShape.quadraticCurveTo(borderWidth / 2, -borderHeight / 2, borderWidth / 2, -borderHeight / 2 + borderRadius);
      borderShape.lineTo(borderWidth / 2, borderHeight / 2 - borderRadius);
      borderShape.quadraticCurveTo(borderWidth / 2, borderHeight / 2, borderWidth / 2 - borderRadius, borderHeight / 2);
      borderShape.lineTo(-borderWidth / 2 + borderRadius, borderHeight / 2);
      borderShape.quadraticCurveTo(-borderWidth / 2, borderHeight / 2, -borderWidth / 2, borderHeight / 2 - borderRadius);
      borderShape.lineTo(-borderWidth / 2, -borderHeight / 2 + borderRadius);
      borderShape.quadraticCurveTo(-borderWidth / 2, -borderHeight / 2, -borderWidth / 2 + borderRadius, -borderHeight / 2);

      // 创建平面边框几何体
      const borderGeometry = new THREE.ShapeGeometry(borderShape);

      const borderMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xDAA520), // 金色
        emissive: new THREE.Color(0xDAA520),
        emissiveIntensity: 0.3,
        metalness: 0.7,
        roughness: 0.2
      });

      const border = new THREE.Mesh(borderGeometry, borderMaterial);
      border.rotation.x = -Math.PI / 2;
      border.position.y = 0.02; // 稍微高于宫位，但仍然是平面的
      palaceGroup.add(border);

      // 设置宫格位置
      palaceGroup.position.set(x, 0, z); // 完全贴合底盘
      palaceGroup.name = `palace_${palaceName}`;

      this.ziWeiChart.add(palaceGroup);

      // 存储到映射中
      this.palaces.set(palaceName, palaceGroup);

      // 创建文字标签 - 使用传统书法风格
      const labelCanvas = document.createElement('canvas');
      labelCanvas.width = 512; // 增大画布尺寸
      labelCanvas.height = 256;
      const labelContext = labelCanvas.getContext('2d')!;

      // 创建渐变背景 - 使用传统中国风配色
      const gradient = labelContext.createLinearGradient(0, 0, 0, labelCanvas.height);
      gradient.addColorStop(0, 'rgba(139, 0, 0, 0.8)'); // 暗红色
      gradient.addColorStop(1, 'rgba(75, 0, 130, 0.8)'); // 暗紫色
      labelContext.fillStyle = gradient;
      labelContext.fillRect(0, 0, labelCanvas.width, labelCanvas.height);

      // 添加边框
      labelContext.strokeStyle = '#DAA520'; // 金色边框
      labelContext.lineWidth = 8; // 增大边框宽度
      labelContext.strokeRect(0, 0, labelCanvas.width, labelCanvas.height);

      // 添加文字 - 使用书法风格
      labelContext.font = 'bold 72px "KaiTi", "楷体", serif'; // 增大字体
      labelContext.fillStyle = '#FFD700'; // 金色文字
      labelContext.textAlign = 'center';
      labelContext.textBaseline = 'middle';
      labelContext.shadowColor = 'rgba(0, 0, 0, 0.7)';
      labelContext.shadowBlur = 6; // 增大阴影
      labelContext.shadowOffsetX = 3;
      labelContext.shadowOffsetY = 3;

      // 使用位置中定义的宫位名称
      labelContext.fillText(palaceName, labelCanvas.width / 2, labelCanvas.height / 2);

      // 创建纹理和精灵
      const labelTexture = new THREE.CanvasTexture(labelCanvas);
      const labelSpriteMaterial = new THREE.SpriteMaterial({
        map: labelTexture,
        transparent: true
      });
      const labelSprite = new THREE.Sprite(labelSpriteMaterial);
      labelSprite.scale.set(3, 1.5, 1); // 调整标签尺寸，确保远处的宫位名称也能清晰可见

      // 设置标签位置 - 向上移动，确保完整显示
      labelSprite.position.set(x, 0.25, z); // 调整标签位置
      labelSprite.name = `label_${palaceName}`;

      this.ziWeiChart.add(labelSprite);

      // 创建星耀容器（用于放置星耀）
      const starsContainer = new THREE.Group();
      // 将星耀容器放在宫位上方更高位置
      starsContainer.position.set(x, palaceHeight + 1.5, z); // 提高星耀位置
      starsContainer.name = `stars_${palaceNames[i]}`;
      this.ziWeiChart.add(starsContainer);
    }
  }

  /**
   * 创建宫位之间的连接线
   */
  protected createPalaceConnections(): void {
    if (!this.ziWeiChart) return;

    // 创建连接线材质
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xDAA520, // 金色
      transparent: true,
      opacity: 0.5
    });

    // 定义宫位之间的连接关系 - 适应传统紫微斗数布局
    const connections = [
      // 横向连接
      { from: { x: 6, z: 6 }, to: { x: 2, z: 6 } }, // 命宫 -> 兄弟
      { from: { x: 2, z: 6 }, to: { x: -2, z: 6 } }, // 兄弟 -> 夫妻
      { from: { x: -2, z: 6 }, to: { x: -6, z: 6 } }, // 夫妻 -> 子女

      { from: { x: 6, z: 2 }, to: { x: 2, z: 2 } }, // 财帛 -> 疾厄

      { from: { x: -6, z: 2 }, to: { x: -2, z: 2 } }, // 迁移 -> 疾厄

      { from: { x: 6, z: -2 }, to: { x: -2, z: -2 } }, // 交友 -> 官禄
      { from: { x: -2, z: -2 }, to: { x: -6, z: -2 } }, // 官禄 -> 田宅

      { from: { x: 6, z: -6 }, to: { x: 2, z: -6 } }, // 福德 -> 父母

      // 纵向连接
      { from: { x: 6, z: 6 }, to: { x: 6, z: 2 } }, // 命宫 -> 财帛
      { from: { x: 6, z: 2 }, to: { x: 6, z: -2 } }, // 财帛 -> 交友
      { from: { x: 6, z: -2 }, to: { x: 6, z: -6 } }, // 交友 -> 福德

      { from: { x: 2, z: 6 }, to: { x: 2, z: 2 } }, // 兄弟 -> 疾厄
      { from: { x: 2, z: -6 }, to: { x: 2, z: 6 } }, // 父母 -> 兄弟

      { from: { x: -2, z: 6 }, to: { x: -2, z: 2 } }, // 夫妻 -> 迁移
      { from: { x: -2, z: 2 }, to: { x: -2, z: -2 } }, // 迁移 -> 官禄

      { from: { x: -6, z: 6 }, to: { x: -6, z: 2 } }, // 子女 -> 迁移
      { from: { x: -6, z: -2 }, to: { x: -6, z: 6 } }, // 田宅 -> 子女

      // 对角连接
      { from: { x: 6, z: 6 }, to: { x: -2, z: 2 } }, // 命宫 -> 迁移
      { from: { x: 2, z: 6 }, to: { x: -6, z: 2 } }, // 兄弟 -> 迁移
      { from: { x: -2, z: 6 }, to: { x: -6, z: -2 } }, // 夫妻 -> 田宅
      { from: { x: 6, z: 2 }, to: { x: -2, z: -2 } }, // 财帛 -> 官禄
      { from: { x: 6, z: -2 }, to: { x: 2, z: -6 } }, // 交友 -> 父母
      { from: { x: -2, z: -2 }, to: { x: 2, z: -6 } } // 官禄 -> 父母
    ];

    // 创建连接线
    for (const conn of connections) {
      const points = [];
      points.push(new THREE.Vector3(conn.from.x, 0.01, conn.from.z)); // 调整高度，使其与平面宫位匹配
      points.push(new THREE.Vector3(conn.to.x, 0.01, conn.to.z));

      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(lineGeometry, lineMaterial);
      this.ziWeiChart.add(line);
    }
  }

  /**
   * 创建中心太极
   */
  protected createTaiji(): void {
    if (!this.ziWeiChart) return;

    this.taiji = new THREE.Group();
    this.taiji.name = 'taiji';

    // 创建太极底座
    const baseGeometry = new THREE.CylinderGeometry(2.5, 2.5, 0.1, 64);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a0e2e,
      metalness: 0.5,
      roughness: 0.3
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.rotation.x = Math.PI / 2;
    base.position.y = -0.05;
    this.taiji.add(base);

    // 创建太极球体
    const taijiRadius = 2;
    const taijiGeometry = new THREE.SphereGeometry(taijiRadius, 64, 32);

    // 使用顶点颜色创建太极图案
    const colors = [];
    const positions = taijiGeometry.attributes.position;

    const positionAttribute = positions as THREE.BufferAttribute;
    for (let i = 0; i < positionAttribute.count; i++) {
      const x = positionAttribute.getX(i);
      const y = positionAttribute.getY(i);
      const z = positionAttribute.getZ(i);

      // 计算点在球面上的角度
      const angle = Math.atan2(z, x);

      // 根据角度设置颜色（左半边黑色，右半边白色）
      if (angle > 0) {
        colors.push(0, 0, 0); // 黑色
      } else {
        colors.push(1, 1, 1); // 白色
      }
    }

    // 添加颜色属性
    taijiGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const taijiMaterial = new THREE.MeshStandardMaterial({
      vertexColors: true,
      metalness: 0.4,
      roughness: 0.3
    });

    const taijiSphere = new THREE.Mesh(taijiGeometry, taijiMaterial);
    taijiSphere.position.y = taijiRadius;
    this.taiji.add(taijiSphere);

    // 添加阴阳鱼眼
    // 阴鱼眼（白色）
    const yinEyeGeometry = new THREE.SphereGeometry(0.4, 32, 16);
    const yinEyeMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.3,
      metalness: 0.5,
      roughness: 0.2
    });
    const yinEye = new THREE.Mesh(yinEyeGeometry, yinEyeMaterial);
    yinEye.position.set(taijiRadius / 2, taijiRadius, 0);
    this.taiji.add(yinEye);

    // 阳鱼眼（黑色）
    const yangEyeGeometry = new THREE.SphereGeometry(0.4, 32, 16);
    const yangEyeMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      emissive: 0x000000,
      emissiveIntensity: 0.1,
      metalness: 0.5,
      roughness: 0.2
    });
    const yangEye = new THREE.Mesh(yangEyeGeometry, yangEyeMaterial);
    yangEye.position.set(-taijiRadius / 2, taijiRadius, 0);
    this.taiji.add(yangEye);

    // 添加发光效果
    const glowGeometry = new THREE.SphereGeometry(taijiRadius * 1.1, 32, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x8855ff,
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.y = taijiRadius;
    this.taiji.add(glow);

    // 添加旋转动画
    this.addAnimationCallback(() => {
      if (this.taiji) {
        this.taiji.rotation.y += 0.005;
      }
    });

    this.taiji.position.y = 0.2;
    this.ziWeiChart.add(this.taiji);
  }

  /**
   * 获取指定名称的宫格对象
   */
  public getPalace(name: string): THREE.Object3D | undefined {
    return this.palaces.get(name);
  }

  /**
   * 获取紫微斗数盘
   */
  public getZiWeiChart(): THREE.Group | null {
    return this.ziWeiChart;
  }

  /**
   * 获取太极对象
   */
  public getTaiji(): THREE.Group | null {
    return this.taiji;
  }

  /**
   * 在指定宫位添加星耀
   * @param palaceName 宫位名称
   * @param starName 星耀名称
   * @param starColor 星耀颜色
   * @param position 星耀在宫位内的相对位置
   */
  public addStarToPalace(
    palaceName: string,
    starName: string,
    starColor: number = 0xffffff,
    position: THREE.Vector3 = new THREE.Vector3(0, 0, 0)
  ): void {
    if (!this.ziWeiChart) {
      console.error('紫微斗数盘未初始化');
      return;
    }

    // 获取星耀容器
    const starsContainer = this.ziWeiChart.getObjectByName(`stars_${palaceName}`) as THREE.Group;
    if (!starsContainer) {
      console.error(`找不到宫位 ${palaceName} 的星耀容器`);
      return;
    }
    
    // 获取当前宫位已有的星耀数量，用于有序排列
    const existingStars = starsContainer.children.filter(child => child.name.startsWith('star_'));
    const starIndex = existingStars.length;

    // 根据星耀索引计算从上到下依次排列的位置
    const spacing = 0.6; // 增加星耀之间的垂直间距，使排列更明显
    
    // 计算相对于宫位中心的偏移
    const offsetX = 0; // 水平居中
    const offsetZ = (starIndex - 2.5) * spacing; // 从上到下排列，中心为0
    
    // 设置位置
    position.x = offsetX;
    position.z = offsetZ;
    

    

    


    // 将星耀名称直接写在星耀球体上
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d')!;
    
    // 不绘制背景，只保留文字
    
    // 绘制星耀名称 - 增大字体尺寸
    context.font = 'bold 80px "KaiTi", "楷体", serif'; // 增大字体到80px
    context.fillStyle = '#ffffff';
    context.strokeStyle = '#000000'; // 添加黑色描边
    context.lineWidth = 4; // 增加描边宽度
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.shadowColor = 'rgba(0, 0, 0, 1)'; // 增强阴影
    context.shadowBlur = 8; // 增加阴影模糊度
    
    // 先描边再填充，确保文字清晰可见
    context.strokeText(starName, 128, 128);
    context.fillText(starName, 128, 128);
    
    // 创建带有文字的纹理
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    // 创建星耀精灵 - 使用精灵代替球体，使文字始终面向屏幕
    
    // 使用带有文字的纹理创建星耀材质 - 只显示文字部分
    const starMaterial = new THREE.SpriteMaterial({
      map: texture,
      color: 0xffffff, // 使用白色作为基础颜色，确保文字颜色正确显示
      transparent: true,
      alphaTest: 0.01 // 降低透明度测试阈值，使文字边缘更加平滑
    });
    const star = new THREE.Sprite(starMaterial);
    
    // 设置精灵大小 - 增大以适应更大的文字
    star.scale.set(1.2, 1.2, 1); // 增大精灵的宽度和高度
    
    // 创建一个小球代表星耀
    const starSphereGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const starSphereMaterial = new THREE.MeshStandardMaterial({
      color: starColor, // 使用星耀的颜色
      emissive: starColor, // 添加发光效果
      emissiveIntensity: 0.6,
      metalness: 0.7,
      roughness: 0.3
    });
    const starSphere = new THREE.Mesh(starSphereGeometry, starSphereMaterial);
    
    // 限制星耀位置在宫位范围内
    const boundedPosition = position.clone();
    // 限制X和Z坐标在宫位范围内
    boundedPosition.x = Math.max(-1.5, Math.min(1.5, boundedPosition.x));
    boundedPosition.z = Math.max(-1.5, Math.min(1.5, boundedPosition.z));
    // 设置Y坐标为0，因为容器已经在正确的高度
    boundedPosition.y = 0;
    star.position.copy(boundedPosition);
    starSphere.position.copy(boundedPosition);
    starSphere.position.y -= 0.4; // 保持小球在文字下方

    // 创建星耀组
    const starGroup = new THREE.Group();
    starGroup.add(star);
    starGroup.add(starSphere); // 将小球添加到星耀组中
    starGroup.name = `star_${starName}`;

    // 添加到容器
    starsContainer.add(starGroup);
  }

  /**
   * 清除指定宫位的所有星耀
   * @param palaceName 宫位名称
   */
  public clearStarsInPalace(palaceName: string): void {
    if (!this.ziWeiChart) return;

    const starsContainer = this.ziWeiChart.getObjectByName(`stars_${palaceName}`) as THREE.Group;
    if (!starsContainer) return;

    // 移除所有子对象
    while (starsContainer.children.length > 0) {
      const child = starsContainer.children[0];
      while (starsContainer.children.length > 0) {
      const child = starsContainer.children[0];
      if (child) {
        starsContainer.remove(child);
        
        // 释放几何体和材质资源
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (child.material instanceof THREE.Material) {
            child.material.dispose();
          }
        }
      }
    }

      // 释放几何体和材质资源
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (child.material instanceof THREE.Material) {
          child.material.dispose();
        }
      }
    }
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
      
      // 确保所有星耀始终面向屏幕
      if (this.ziWeiChart) {
        this.ziWeiChart.traverse((child) => {
          if (child instanceof THREE.Group && child.name.startsWith('stars_')) {
            child.traverse((star) => {
              if (star instanceof THREE.Sprite) {
                // 精灵会自动面向摄像机，不需要额外处理
              }
            });
          }
        });
      }
    });

    // 如果有自定义动画，添加到动画回调中
    if (customAnimation) {
      this.addAnimationCallback(customAnimation);
    }

    // 开始动画循环
    this.startAnimation();
  }

  /**
   * 加载外部模型到紫微斗数场景
   */
  public async loadModelToZiWeiChart(
    modelType: 'gltf' | 'obj' | 'base',
    modelUrl: string,
    position?: THREE.Vector3,
    rotation?: THREE.Euler,
    scale?: THREE.Vector3
  ): Promise<THREE.Object3D> {
    const modelManager = this.getModelManager(modelType);
    if (!modelManager) {
      throw new Error(`无法获取 ${modelType} 类型的模型管理器`);
    }

    try {
      const model = await modelManager.loadModel(modelUrl);

      // 设置位置、旋转和缩放
      if (position) {
        model.position.copy(position);
      }

      if (rotation) {
        model.rotation.copy(rotation);
      }

      if (scale) {
        model.scale.copy(scale);
      }

      // 添加到紫微斗数盘
      if (this.ziWeiChart) {
        this.ziWeiChart.add(model);
      } else {
        this.getScene().add(model);
      }

      return model;
    } catch (error) {
      console.error(`加载模型失败: ${modelUrl}`, error);
      throw error;
    }
  }

  /**
   * 清理资源
   */
  public dispose(): void {
    // 清理紫微斗数相关对象
    this.palaces.clear();
    this.ziWeiChart = null;
    this.taiji = null;

    // 调用父类清理方法
    super.dispose();
  }
}
