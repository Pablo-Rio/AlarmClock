import * as THREE from "three";
import {
  currentTimePercentageOfDay,
  timeToPercentageOfDay,
} from "./helpers/timeConversions";
import { MILLISECONDS_IN_A_DAY } from "./helpers/value";

let sun, sunHelper, moon, moonHelper;

export function addLights(scene: THREE.Scene) {
  const mapSize = 1024 * 2;
  
  const lightAmbient = new THREE.AmbientLight(0xffffff, 0);
  scene.add(lightAmbient);

  sun = new THREE.SpotLight(0xffffff, 2000);
  sun.target.position.set(-1.75, 5, 4);
  sun.castShadow = true;
  sun.shadow.mapSize.width = mapSize;
  sun.shadow.mapSize.height = mapSize;
  sun.shadow.bias = -0.0005;
  sun.shadow.radius = 3;
  sun.shadow.blurSamples = 50;
  scene.add(sun);

  sunHelper = new THREE.SpotLightHelper(sun);
  scene.add(sunHelper);

  moon = new THREE.SpotLight(0xa6c8ff, 800);
  moon.position.set(0, 8, 10);
  moon.target.position.set(-1.75, 5, 4);
  moon.castShadow = true;
  moon.shadow.mapSize.width = mapSize;
  moon.shadow.mapSize.height = mapSize;
  moon.shadow.bias = -0.0005;
  moon.shadow.radius = 3;
  scene.add(moon);

  moonHelper = new THREE.SpotLightHelper(moon);
  scene.add(moonHelper);

  const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x080820, 0);
  scene.add(hemisphereLight);

  const axesHelper = new THREE.AxesHelper(5);
  axesHelper.position.set(-1.75, 5, 4);
  scene.add(axesHelper);

  const sunrise = timeToPercentageOfDay("7:15:24 AM");
  const sunset = timeToPercentageOfDay("8:36:56 PM");
  console.log("SUNRISE", sunrise);
  console.log("SUNSET", sunset);

  setInterval(() => {
    lightsLoop(sunrise, sunset);
    // instantaneousMovements();
  }, 500);
}

function lightsLoop(sunrise: number, sunset: number) {
  const sunTime = Math.abs(sunrise - sunset);
  const speed = Math.PI / sunTime;

  const currentTime = currentTimePercentageOfDay();

  const xSun = (currentTime - sunrise) * speed;
  const xMoon = (currentTime - sunrise) * speed + Math.PI;

  sun.position.y = Math.sin(xSun) * 7 + 5;
  sun.position.x = Math.cos(xSun) * 6;
  sun.position.z = Math.sin(xSun) * 2 + 10;

  sun.intensity = Math.max(0, sun.position.y - 5) * 500;
  if (sun.intensity === 0) sun.visible = false;

  sunHelper.update();

  moon.position.y = Math.sin(xMoon) * 7 + 5;
  moon.position.x = Math.cos(xMoon) * 6;
  moon.position.z =
    Math.sin((currentTime - sunset) * speed * 1.3 + Math.PI) * 3 + 12;

  moon.intensity = Math.max(0, moon.position.y - 5) * 500;
  if (moon.intensity === 0) moon.visible = false;

  moonHelper.update();
}

function instantaneousMovements() {
  const period = MILLISECONDS_IN_A_DAY;
  const speed = ((2 * Math.PI) / period) * 10000;

  moon.position.y = Math.sin(Date.now() * speed + Math.PI) * 7 + 5;
  moon.position.x = Math.cos(Date.now() * speed + Math.PI) * 6;
  moon.position.z = Math.sin(Date.now() * (speed * 1.3) + Math.PI) * 3 + 12;

  moon.intensity = Math.max(0, moon.position.y - 5) * 500;

  moonHelper.update();

  sun.position.y = Math.sin(Date.now() * speed) * 7 + 5;
  sun.position.x = Math.cos(Date.now() * speed) * 6;
  sun.position.z = Math.sin(Date.now() * speed) * 2 + 10;

  sun.intensity = Math.max(0, sun.position.y - 5) * 500;

  sunHelper.update();
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
