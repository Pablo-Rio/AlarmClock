import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";

export function loadModel(modelPath: string): Promise<THREE.Object3D> {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(modelPath, function (gltf) {
      const model = gltf.scene;
      model.traverse((o) => {
        if ((o as THREE.Mesh).isMesh) {
          o = o as THREE.Mesh;
          o.castShadow = true;
          o.receiveShadow = true;
        }
      });

      resolve(model);
    }, undefined, reject);
  });
}
