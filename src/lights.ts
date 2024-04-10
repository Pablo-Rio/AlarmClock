import * as THREE from "three";
import { MILLISECONDS_IN_A_DAY } from "./helpers/value";
import {
  currentTimePercentageOfDay,
  timeToMilliseconds,
  timeToPercentageOfDay,
} from "./helpers/timeConversions";

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

  const sunrise = timeToPercentageOfDay("7:15:24 AM");
  const sunset = timeToPercentageOfDay("8:36:56 PM");
  console.log("SUNRISE", sunrise);
  console.log("SUNSET", sunset);

  const sunTime = Math.abs(sunrise - sunset);
  console.log(sunTime);

  setInterval(() => {
    lightsLoop(sunrise, sunset);
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

function lightsLoop(sunrise: number, sunset: number) {
  const sunTime = Math.abs(sunrise - sunset);
  const speed = Math.PI / sunTime;

  const currentTime = currentTimePercentageOfDay();

  pointLight.position.y = Math.sin((currentTime - sunrise) * speed) * 7 + 5;
  pointLight.position.x = Math.cos((currentTime - sunrise) * speed) * 6;
  pointLight.position.z = Math.sin((currentTime - sunrise) * speed) * 2 + 10;

  pointLight.intensity = Math.max(0, pointLight.position.y - 5) * 500;

  helper.update();
}

/**
 * Rappel des paramètres des fonctions sin et cos :
 *
 *    f(x) = A * sin(B * x + C) + D
 *
 * A : Amplitude
 * B : Fréquence (Durée de la période = 2 * PI / B)
 * C : Décalage horizontal
 * D : Décalage vertical
 */
