import * as THREE from "three";

export function addLights(scene: THREE.Scene) {
  const lightAmbient = new THREE.AmbientLight(0xffffff, 3);
  scene.add(lightAmbient);

  const pointLight = new THREE.SpotLight(0xffffff, 6);
  pointLight.position.set(0, 8, 10);
  pointLight.target.position.set(0, 0, 0);
  pointLight.castShadow = true;
  pointLight.shadow.mapSize.width = 1024;
  pointLight.shadow.mapSize.height = 1024;
  pointLight.shadow.bias = -0.0005;
  pointLight.shadow.radius = 10;
  pointLight.shadow.blurSamples = 50;

  scene.add(pointLight);

  const helper = new THREE.SpotLightHelper(pointLight);
  scene.add(helper);

  /* const nightPointLight = new THREE.PointLight(0xffffff, 1, 100, 1);
  nightPointLight.power = 10;
  nightPointLight.shadow.radius = 2;
  nightPointLight.position.set(0, 8, 10);
  nightPointLight.castShadow = true;
  nightPointLight.shadow.mapSize.width = 1024*2;
  nightPointLight.shadow.mapSize.height = 1024*2;
  nightPointLight.shadow.bias = -0.0005;
  scene.add(nightPointLight);

  const helper = new THREE.PointLightHelper(nightPointLight);
  scene.add(helper); */

  /* const lightPoint2 = lightPoint.clone();
  lightPoint2.intensity = 1 - shadowIntensity;
  lightPoint2.castShadow = false;
  // scene.add(lightPoint2);

  const mapSize = 1024; // Default 512
  const cameraNear = 0.5; // Default 0.5
  const cameraFar = 500; // Default 500
  lightPoint.shadow.mapSize.width = mapSize;
  lightPoint.shadow.mapSize.height = mapSize;
  lightPoint.shadow.camera.near = cameraNear;
  lightPoint.shadow.camera.far = cameraFar; */
}
