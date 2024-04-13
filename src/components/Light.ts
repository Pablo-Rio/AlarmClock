import * as THREE from "three";
import {
  currentTimePercentageOfDay,
  timeToPercentageOfDay,
} from "../helpers/timeConversion";
import { hemiLuminousIrradiances, millisecondsInADay } from "../helpers/value";

export default class Light {
  static targetPosition = new THREE.Vector3(-1.75, 5, 4);
  static localStorageApiKeyName = "sunHours";

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
    this.targetHelper.position.copy(Light.targetPosition);
    this.scene.add(this.targetHelper);

    this.configLights();

    this.fetchData().then(({ sunrise, sunset }) => {
      this.time = setTimeout(() => {
        this.lightsLoop(
          timeToPercentageOfDay(sunrise),
          timeToPercentageOfDay(sunset),
        );
      }, 500);
    });

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

    this.sun.intensity = Math.max(0, this.sun.position.y - 5) * 900;
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

  async fetchData(): Promise<{
    sunrise: string;
    sunset: string;
  }> {
    const sunHours = localStorage.getItem(Light.localStorageApiKeyName);
    let sunrise: string, sunset: string, date: string;
    if (sunHours) {
      ({ sunrise, sunset, date } = JSON.parse(sunHours));
      if (date === new Date().toISOString().split("T")[0].toString()) {
        return Promise.resolve({ sunrise, sunset });
      }
    }

    ({ sunrise, sunset } = await this.fetchApiSunriseSunset());
    date = new Date().toISOString().split("T")[0];
    localStorage.setItem(
      Lights.localStorageApiKeyName,
      JSON.stringify({ sunrise, sunset, date }),
    );
    return Promise.resolve({ sunrise, sunset });
  }

  async fetchApiSunriseSunset(
    today: Date = new Date(),
  ): Promise<{ sunrise: string; sunset: string }> {
    const latitude = 45.85;
    const longitude = 1.25;
    const timezone = "Europe/Paris";
    const params = new URLSearchParams({
      lat: latitude.toString(),
      lng: longitude.toString(),
      date: today.toISOString().split("T")[0],
      tzid: timezone,
    });
    const url = `https://api.sunrise-sunset.org/json?${params}`;

    const data = await fetch(url)
      .then((res) => res.json())
      .then((data) => {
        return {
          sunrise: data.results.sunrise,
          sunset: data.results.sunset,
        };
      })
      .catch((err) => {
        console.error(err);
        return {
          sunrise: "7:15:24 AM",
          sunset: "8:36:56 PM",
        };
      });

    return data;
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
