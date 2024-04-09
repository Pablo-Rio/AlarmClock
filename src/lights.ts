import * as THREE from "three";

const MILLISECONDS_IN_A_DAY = 86400000;

let pointLight, helper;

export function addLights(scene: THREE.Scene) {
  const lightAmbient = new THREE.AmbientLight(0xffffff, 0);
  scene.add(lightAmbient);

  pointLight = new THREE.SpotLight(0xffffff, 2000);
  pointLight.position.set(0, 8, 10);
  pointLight.target.position.set(-1.75, 5, 4);
  pointLight.castShadow = true;
  pointLight.shadow.mapSize.width = 1024;
  pointLight.shadow.mapSize.height = 1024;
  pointLight.shadow.bias = -0.0005;
  pointLight.shadow.radius = 3;
  pointLight.shadow.blurSamples = 50;
  scene.add(pointLight);

  helper = new THREE.SpotLightHelper(pointLight);
  scene.add(helper);

  const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x080820, 20);
  scene.add(hemisphereLight);

  const axeHelper = new THREE.AxesHelper(5);
  axeHelper.position.set(-1.75, 5, 4);
  scene.add(axeHelper);

  setInterval(() => {
    lightsLoop();
  }, 100);

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

function lightsLoop() {
  const period = MILLISECONDS_IN_A_DAY;
  const speed = 2 * Math.PI / period;

  pointLight.position.y = Math.sin(Date.now() * speed) * 7 + 5;
  pointLight.position.x = Math.cos(Date.now() * -speed) * 6;
  pointLight.position.z = Math.sin(Date.now() * speed) * 2 + 10;

  pointLight.intensity = Math.max(0, pointLight.position.y - 5) * 500;

  helper.update();
}


