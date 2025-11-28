import * as THREE from 'three';

/**
 * 模型管理器接口，定义了模型管理的基本方法
 */
export class IModelManager {
  loadModel(url) {
    throw new Error('Method not implemented.');
  }
  addModelToScene(model, position, rotation) {
    throw new Error('Method not implemented.');
  }
  removeModelFromScene(model) {
    throw new Error('Method not implemented.');
  }
  disposeModel(model) {
    throw new Error('Method not implemented.');
  }
}