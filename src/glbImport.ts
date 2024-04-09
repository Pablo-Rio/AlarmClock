import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";

export function loadModel(modelPath: string, cubeMap: THREE.CubeTexture): Promise<THREE.Object3D> {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(
      modelPath,
      function (gltf) {
        const model = gltf.scene;
        model.traverse((o) => {
          if ((o as THREE.Mesh).isMesh) {
            o.castShadow = true;
            o.receiveShadow = true;
            o.material.needsUpdate = true;
            // (o.material as THREE.MeshStandardMaterial).color.convertSRGBToLinear();
            /* if (o.material.name.startsWith("IMG")) {
              (o.material as THREE.MeshStandardMaterial).color.addScalar(0);
            } */

            if (
              !o.material.name.startsWith("IMG") &&
              !o.material.name.startsWith("ALPHA")
            ) {
              o.material = new THREE.MeshPhongMaterial({
                color: o.material.color,
                envMap: cubeMap,
                combine: THREE.MixOperation,
                reflectivity: Math.abs(o.material.roughness - 1),
              });
            }
          }
        });

        resolve(model);
      },
      undefined,
      reject,
    );
  });
}
