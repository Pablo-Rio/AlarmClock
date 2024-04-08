import * as THREE from "three";

export function createCubeMap(scene: THREE.Scene, path: string) {
  return new Promise((resolve) => {
    const xpositive = path + "0004.png"; // left
    const xnegative = path + "0002.png"; // right
    const ypositive = path + "0005.png"; // top
    const ynegative = path + "0006.png"; // bottom
    const zpositive = path + "0003.png"; // back
    const znegative = path + "0001.png"; // front
    const cubeTextureLoader = new THREE.CubeTextureLoader();
    scene.background = cubeTextureLoader.load([
      xpositive,
      xnegative,
      ypositive,
      ynegative,
      zpositive,
      znegative,
    ]);
    resolve(scene.background);
  });
}
