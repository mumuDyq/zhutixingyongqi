import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// 直接定义接口，避免导入问题
interface IModelManager {
  loadModel(url: string): Promise<THREE.Object3D>;
  addModelToScene(model: THREE.Object3D, position?: THREE.Vector3, rotation?: THREE.Euler): void;
  removeModelFromScene(model: THREE.Object3D): void;
  disposeModel(model: THREE.Object3D): void;
}

/**
 * 基础模型管理器，提供模型加载和管理的基本功能
 */
export class BaseModelManager implements IModelManager {
  protected scene: THREE.Scene;
  protected loadingManager: THREE.LoadingManager;
  protected loadedModels: Map<string, THREE.Object3D> = new Map();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.loadingManager = new THREE.LoadingManager();

    // 设置加载管理器的事件处理
    this.loadingManager.onLoad = () => {
      console.log('所有模型加载完成');
    };

    this.loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      console.log(`加载进度: ${url} - ${itemsLoaded}/${itemsTotal}`);
    };

    this.loadingManager.onError = (url) => {
      console.error(`模型加载错误: ${url}`);
    };
  }

  /**
   * 加载模型
   * @param url 模型URL
   * @returns 加载的模型对象
   */
  async loadModel(url: string): Promise<THREE.Object3D> {
    // 检查模型是否已经加载
    if (this.loadedModels.has(url)) {
      return this.loadedModels.get(url)!.clone();
    }

    // 基础实现，子类应该重写此方法
    return new Promise((resolve, reject) => {
      console.warn('BaseModelManager.loadModel: 子类应该重写此方法');
      reject(new Error('子类应该重写此方法'));
    });
  }

  /**
   * 将模型添加到场景中
   * @param model 模型对象
   * @param position 位置
   * @param rotation 旋转
   */
  addModelToScene(
    model: THREE.Object3D, 
    position?: THREE.Vector3, 
    rotation?: THREE.Euler
  ): void {
    if (position) {
      model.position.copy(position);
    }

    if (rotation) {
      model.rotation.copy(rotation);
    }

    this.scene.add(model);
  }

  /**
   * 从场景中移除模型
   * @param model 模型对象
   */
  removeModelFromScene(model: THREE.Object3D): void {
    this.scene.remove(model);
  }

  /**
   * 释放模型资源
   * @param model 模型对象
   */
  disposeModel(model: THREE.Object3D): void {
    // 递归释放模型及其子对象
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.geometry) {
          child.geometry.dispose();
        }

        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(material => material.dispose());
          } else {
            child.material.dispose();
          }
        }
      }
    });
  }

  /**
   * 释放所有已加载的模型
   */
  disposeAllModels(): void {
    this.loadedModels.forEach(model => {
      this.disposeModel(model);
    });
    this.loadedModels.clear();
  }
}

/**
 * GLTF模型管理器，专门用于加载GLTF格式的模型
 */
export class GLTFModelManager extends BaseModelManager {
  private gltfLoader: any; // 使用any类型，因为GLTFLoader的导入可能根据项目配置而变化

  constructor(scene: THREE.Scene) {
    super(scene);

    // 动态导入GLTFLoader
    import('three/examples/jsm/loaders/GLTFLoader.js').then(({ GLTFLoader }) => {
      this.gltfLoader = new GLTFLoader(this.loadingManager);
    }).catch(error => {
      console.error('无法加载GLTFLoader:', error);
    });
  }

  async loadModel(url: string): Promise<THREE.Object3D> {
    // 检查模型是否已经加载
    if (this.loadedModels.has(url)) {
      return this.loadedModels.get(url)!.clone();
    }

    return new Promise((resolve, reject) => {
      if (!this.gltfLoader) {
        reject(new Error('GLTFLoader未初始化'));
        return;
      }

      this.gltfLoader.load(
        url,
        (gltf: any) => {
          const model = gltf.scene;
          this.loadedModels.set(url, model);
          resolve(model.clone());
        },
        undefined,
        (error: any) => {
          reject(error);
        }
      );
    });
  }
}

/**
 * OBJ模型管理器，专门用于加载OBJ格式的模型
 */
export class OBJModelManager extends BaseModelManager {
  private objLoader: any; // 使用any类型，因为OBJLoader的导入可能根据项目配置而变化
  private mtlLoader: any; // MTL材质加载器

  constructor(scene: THREE.Scene) {
    super(scene);

    // 动态导入OBJLoader和MTLLoader
    Promise.all([
      import('three/examples/jsm/loaders/OBJLoader.js'),
      import('three/examples/jsm/loaders/MTLLoader.js')
    ]).then(([{ OBJLoader }, { MTLLoader }]) => {
      this.objLoader = new OBJLoader(this.loadingManager);
      this.mtlLoader = new MTLLoader(this.loadingManager);
    }).catch(error => {
      console.error('无法加载OBJLoader或MTLLoader:', error);
    });
  }

  async loadModel(url: string, mtlUrl?: string): Promise<THREE.Object3D> {
    // 检查模型是否已经加载
    const cacheKey = mtlUrl ? `${url}:${mtlUrl}` : url;
    if (this.loadedModels.has(cacheKey)) {
      return this.loadedModels.get(cacheKey)!.clone();
    }

    return new Promise((resolve, reject) => {
      if (!this.objLoader) {
        reject(new Error('OBJLoader未初始化'));
        return;
      }

      // 如果提供了MTL材质文件，先加载材质
      if (mtlUrl && this.mtlLoader) {
        this.mtlLoader.load(
          mtlUrl,
          (materials: any) => {
            materials.preload();
            this.objLoader.setMaterials(materials);

            this.objLoader.load(
              url,
              (object: THREE.Object3D) => {
                this.loadedModels.set(cacheKey, object);
                resolve(object.clone());
              },
              undefined,
              (error: any) => {
                reject(error);
              }
            );
          },
          undefined,
          (error: any) => {
            reject(error);
          }
        );
      } else {
        // 只加载OBJ模型
        this.objLoader.load(
          url,
          (object: THREE.Object3D) => {
            this.loadedModels.set(cacheKey, object);
            resolve(object.clone());
          },
          undefined,
          (error: any) => {
            reject(error);
          }
        );
      }
    });
  }
}

/**
 * 模型工厂，用于创建不同类型的模型管理器
 */
export class ModelManagerFactory {
  /**
   * 创建模型管理器
   * @param type 模型类型
   * @param scene 场景对象
   * @returns 对应类型的模型管理器
   */
  static createModelManager(type: 'gltf' | 'obj' | 'base', scene: THREE.Scene): IModelManager {
    switch (type) {
      case 'gltf':
        return new GLTFModelManager(scene);
      case 'obj':
        return new OBJModelManager(scene);
      case 'base':
      default:
        return new BaseModelManager(scene);
    }
  }
}
