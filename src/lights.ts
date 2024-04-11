import * as THREE from "three";
import {
  currentTimePercentageOfDay,
  timeToPercentageOfDay,
} from "./helpers/timeConversions";
import { hemiLuminousIrradiances, millisecondsInADay } from "./helpers/value";

export class Lights {
  static targetPosition = new THREE.Vector3(-1.75, 5, 4);

  private sun: THREE.SpotLight;
  private moon: THREE.SpotLight;

  private sunHemisphere: THREE.HemisphereLight;
  private moonHemisphere: THREE.HemisphereLight;

  private sunHelper: THREE.SpotLightHelper;
  private moonHelper: THREE.SpotLightHelper;
  private targetHelper: THREE.AxesHelper;

  private time: number;

  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    this.sun = new THREE.SpotLight(0xffffff, 2000);
    this.moon = new THREE.SpotLight(0xa6c8ff, 800);

    this.sunHelper = new THREE.SpotLightHelper(this.sun);
    this.moonHelper = new THREE.SpotLightHelper(this.moon);

    this.sunHemisphere = new THREE.HemisphereLight(0xffffff, 0x080820, 0);
    this.moonHemisphere = new THREE.HemisphereLight(
      0xa6c8ff,
      0x080820,
      hemiLuminousIrradiances["Moonless Night"],
    );
    this.targetHelper = new THREE.AxesHelper(5);
    this.targetHelper.position.copy(Lights.targetPosition);
    this.scene.add(this.targetHelper);

    const sunrise = timeToPercentageOfDay("7:15:24 AM");
    const sunset = timeToPercentageOfDay("8:36:56 PM");
    console.log("SUNRISE", sunrise);
    console.log("SUNSET", sunset);

    this.configLights();
    this.time = setTimeout(() => {
      this.lightsLoop(sunrise, sunset);
    }, 500);
    this.debug(false);
  }

  configLights() {
    const mapSize = 1024 * 2;

    const setProperties = (light: THREE.SpotLight) => {
      light.position.set(0, -50, 0);
      light.target.position.set(-1.75, 5, 4);
      light.castShadow = true;
      light.shadow.mapSize.width = mapSize;
      light.shadow.mapSize.height = mapSize;
      light.shadow.bias = -0.0005;
      light.shadow.radius = 3;
      light.shadow.blurSamples = 50;
      this.scene.add(light);
    };

    setProperties(this.sun);
    setProperties(this.moon);

    this.scene.add(this.sunHelper);
    this.scene.add(this.moonHelper);

    this.scene.add(this.sunHemisphere);
    this.scene.add(this.moonHemisphere);
  }

  lightsLoop(sunrise: number, sunset: number) {
    const sunTime = Math.abs(sunrise - sunset);
    const speed = Math.PI / sunTime;

    const currentTime = currentTimePercentageOfDay();

    const xSun = (currentTime - sunrise) * speed;
    const xMoon = (currentTime - sunrise) * speed + Math.PI;

    this.sun.position.y = Math.sin(xSun) * 7 + 5;
    this.sun.position.x = Math.cos(xSun) * 6;
    this.sun.position.z = Math.sin(xSun) * 2 + 10;

    this.sun.intensity = Math.max(0, this.sun.position.y - 5) * 500;
    if (this.sun.intensity === 0) this.sun.visible = false;

    this.sunHelper.update();

    this.moon.position.y = Math.sin(xMoon) * 7 + 5;
    this.moon.position.x = Math.cos(xMoon) * 6;
    this.moon.position.z =
      Math.sin((currentTime - sunset) * speed * 1.3 + Math.PI) * 3 + 12;

    this.moon.intensity = Math.max(0, this.moon.position.y - 5) * 100;
    if (this.moon.intensity === 0) this.moon.visible = false;

    this.moonHelper.update();

    this.sunHemisphere.intensity = Math.max(
      0,
      Math.sin(xSun) * hemiLuminousIrradiances["Living Room"],
    );
  }

  /*
  instantaneousMovements() {
    const period = millisecondsInADay;
    const speed = ((2 * Math.PI) / period) * 10000;

    moon.position.y = Math.sin(Date.now() * speed + Math.PI) * 7 + 5;
    moon.position.x = Math.cos(Date.now() * speed + Math.PI) * 6;
    moon.position.z = Math.sin(Date.now() * (speed * 1.3) + Math.PI) * 3 + 12;

    moon.intensity = Math.max(0, moon.position.y - 5) * 100;

    moonHelper.update();

    sun.position.y = Math.sin(Date.now() * speed) * 7 + 5;
    sun.position.x = Math.cos(Date.now() * speed) * 6;
    sun.position.z = Math.sin(Date.now() * speed) * 2 + 10;

    sun.intensity = Math.max(0, sun.position.y - 5) * 500;

    sunHelper.update();

    sunHemisphere.intensity = Math.max(
      0,
      Math.sin(Date.now() * speed) * hemiLuminousIrradiances["Living Room"],
    );
  }*/

  debug(isDebugging: boolean) {
    this.sunHelper.visible = isDebugging;
    this.moonHelper.visible = isDebugging;
    this.targetHelper.visible = isDebugging;
  }
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
