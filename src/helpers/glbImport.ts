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
            // Cast o to Mesh
            
            const mesh = o as THREE.Mesh;
            const material = mesh.material as THREE.MeshStandardMaterial;
            
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            // (o.material as THREE.MeshStandardMaterial).color.convertSRGBToLinear();
            /* if (o.material.name.startsWith("IMG")) {
              (o.material as THREE.MeshStandardMaterial).color.addScalar(0);
            } */

            if (
              !material.name.startsWith("IMG") &&
              !material.name.startsWith("ALPHA")
            ) {
              mesh.material = new THREE.MeshPhongMaterial({
                color: material.color,
                side: THREE.DoubleSide,
                envMap: cubeMap,
                combine: THREE.MixOperation,
                reflectivity: Math.abs(material.roughness - 1),
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
