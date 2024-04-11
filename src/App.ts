import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Time from "./Time";
import { loadModel } from "./glbImport";
import { Lights } from "./lights";
import { createCubeMap } from "./component/cubeMap";

export default class App {
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private time: Time;

  private lights!: Lights;

  private controls!: OrbitControls;
  private stats!: any;

  private plane!: THREE.Mesh;

  private textureCanvas!: THREE.CanvasTexture;

  constructor(time: Time) {
    THREE.Cache.enabled = true;

    this.time = time;
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

    let statsDebug = localStorage.getItem(itemName);
    if (statsDebug === null) {
      localStorage.setItem(itemName, "false");
    }
    const displayStatsWithLS = (bool: string | null) => {
      if (statsDebug === "true") {
        this.stats.dom.style.display = "block";
        localStorage.setItem(itemName, "true");
      } else {
        this.stats.dom.style.display = "none";
        localStorage.setItem(itemName, "false");
      }
    };
    displayStatsWithLS(statsDebug);

    fpsButton.addEventListener("click", () => {
      statsDebug === "true" ? (statsDebug = "false") : (statsDebug = "true");
      displayStatsWithLS(statsDebug);
      this.lights.debug(statsDebug === "true");
    });
  }

  async initScene() {
    this.scene = new THREE.Scene();
    this.lights = new Lights(this.scene);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    this.camera.position.set(3.5, 3.2, 1.5);
    this.camera.lookAt(0, 1, 0);

    const canvas = document.getElementById("webgl");
    if (!canvas) throw new Error("Canvas not found");
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: canvas,
    });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.setPixelRatio(window.devicePixelRatio * 0.95);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    this.renderer.toneMapping = THREE.ReinhardToneMapping;
    this.renderer.toneMappingExposure = 1;

    const cubeMap = await createCubeMap(this.scene, "./background/");

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

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
    this.animate();
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
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(() => {
      this.animate();
    });

    this.textureCanvas.needsUpdate = true;

    if (this.stats) this.stats.update();

    if (this.controls) this.controls.update();

    this.renderer.render(this.scene, this.camera);
  }
}
