import * as THREE from 'three';

/**
 * 模型管理器接口，定义了模型管理的基本方法
 */
export interface IModelManager {
  loadModel(url: string): Promise<THREE.Object3D>;
  addModelToScene(model: THREE.Object3D, position?: THREE.Vector3, rotation?: THREE.Euler): void;
  removeModelFromScene(model: THREE.Object3D): void;
  disposeModel(model: THREE.Object3D): void;
}


