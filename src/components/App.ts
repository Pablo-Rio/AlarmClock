import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import Light from "./Light";
import Time from "./Time";
import { createCubeMap } from "../helpers/cubeMap";
import { loadModel } from "../helpers/glbImport";
import { getLocalStorageItem } from "../helpers/localStorage";
import { isMobile } from "../helpers/isMobile";

export default class App {
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private time: Time;

  private targetRotationY!: number;
  private targetRotationZ!: number;

  private lights!: Light;

  private controls!: OrbitControls;
  private stats!: any;

  private plane!: THREE.Mesh;

  private textureCanvas!: THREE.CanvasTexture;

  private static readonly SMOOTH_FACTOR = 0.02;

  constructor() {
    THREE.Cache.enabled = true;

    this.time = new Time();

    this.scene = new THREE.Scene();
    this.lights = new Light(this.scene, this.time);
    this.initScene();
    this.initStats();
    this.initListeners();
  }

  initStats() {
    this.stats = new (Stats as any)();
    document.body.appendChild(this.stats.dom);

    const itemName = "stats_debug";

    const fpsButton = document.getElementById("fps");
    if (!fpsButton) throw new Error("FPS button not found");

    let statsDebug = getLocalStorageItem(itemName);

    const displayStatsWithLS = (isDebugging: boolean) => {
      localStorage.setItem(itemName, isDebugging ? "1" : "0");
      statsDebug = !isDebugging;
      this.stats.dom.style.display = isDebugging ? "block" : "none";
      this.lights.debug(isDebugging);
    };
    displayStatsWithLS(statsDebug);

    fpsButton.addEventListener("click", () => displayStatsWithLS(statsDebug));
  }

  async initScene() {
    this.camera = new THREE.PerspectiveCamera(
      35,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    this.camera.position.set(5, 0, 0);
    if (isMobile()) this.camera.position.set(8, 0, 0);
    this.camera.zoom = 1.1;
    this.camera.updateProjectionMatrix();

    const groupCamera = new THREE.Group();
    groupCamera.position.set(-3, 2.6, 0);
    groupCamera.rotation.set(0, -0.36, 0);

    this.targetRotationY = groupCamera.rotation.y;
    this.targetRotationZ = groupCamera.rotation.z;

    document.addEventListener("mousemove", (event) => {
      this.targetRotationY = -event.clientX / window.innerWidth / 2 - 0.1;
      this.targetRotationZ = event.clientY / window.innerHeight / 1.5 - 0.3;
    });

    this.scene.add(groupCamera);
    groupCamera.add(this.camera);

    const canvas = document.getElementById("webgl");
    if (!canvas) throw new Error("Canvas not found");
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: canvas,
    });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    this.renderer.toneMapping = THREE.ReinhardToneMapping;
    this.renderer.toneMappingExposure = 1;

    const cubeMap = await createCubeMap(this.scene, "./resources/cubeMap/");

    // import glb
    const model = await loadModel("models/reveil.glb", cubeMap);
    this.scene.add(model);

    const pointHeure =
      model.getObjectByName("pointHeure") ?? new THREE.Object3D();

    this.textureCanvas = new THREE.CanvasTexture(
      this.time.getContext()?.canvas as HTMLCanvasElement,
    );
    this.plane = new THREE.Mesh(
      new THREE.PlaneGeometry(0.7, 0.35),
      new THREE.MeshBasicMaterial({
        map: this.textureCanvas,
        alphaMap: this.textureCanvas,
      }),
    );
    this.plane.position.copy(pointHeure.position);
    this.plane.rotation.copy(pointHeure.rotation);
    this.scene.add(this.plane);

    // Init animation
    this.animate(groupCamera);
  }

  initListeners() {
    window.addEventListener("resize", this.onWindowResize.bind(this), false);

    window.addEventListener("keydown", (event) => {
      const { key } = event;

      switch (key) {
        case "e":
          const win = window.open("", "Canvas Image");
          const { domElement } = this.renderer;
          // Makse sure scene is rendered.
          this.renderer.render(this.scene, this.camera);
          const src = domElement.toDataURL();
          if (!win) return;
          win.document.write(
            `<img src='${src}' width='${domElement.width}' height='${domElement.height}'>`,
          );
          break;

        default:
          break;
      }
    });
  }

  onWindowResize() {
    let size = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    this.camera.aspect = size.width / size.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(size.width, size.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
  }

  animate(groupCamera: THREE.Group) {
    requestAnimationFrame(() => {
      this.animate(groupCamera);
    });

    this.textureCanvas.needsUpdate = true;

    groupCamera.rotation.y = THREE.MathUtils.lerp(
      groupCamera.rotation.y,
      this.targetRotationY,
      App.SMOOTH_FACTOR,
    );
    groupCamera.rotation.z = THREE.MathUtils.lerp(
      groupCamera.rotation.z,
      this.targetRotationZ,
      App.SMOOTH_FACTOR,
    );

    this.camera.lookAt(groupCamera.position);

    if (this.stats) this.stats.update();

    if (this.controls) this.controls.update();

    this.renderer.render(this.scene, this.camera);
  }
}
