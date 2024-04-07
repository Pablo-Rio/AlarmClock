import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { getCookieBoolean, setCookie } from "./helpers/cookie";
import Time from "./Time";
import { loadModel } from "./glbImport";

export default class App {
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private time: Time;

  private lightAmbient!: THREE.AmbientLight;
  private lightPoint!: THREE.PointLight;

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
    const cookieName = "debug";

    const fpsButton = document.getElementById("fps");
    if (!fpsButton) throw new Error("FPS button not found");
    // Récupère le cookie stats_debug
    let statsDebug = getCookieBoolean(cookieName);
    if (statsDebug === null) {
      setCookie(cookieName, "false");
      statsDebug = false;
    }
    const displayStatsWithCookie = (bool: boolean) => {
      if (bool) {
        this.stats.dom.style.display = "block";
        setCookie(cookieName, "true");
      } else {
        this.stats.dom.style.display = "none";
        setCookie(cookieName, "false");
      }
    };
    displayStatsWithCookie(statsDebug);

    fpsButton.addEventListener("click", () => {
      statsDebug = !statsDebug;
      displayStatsWithCookie(statsDebug);
    });
  }

  async initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 5;

    const canvas = document.getElementById("webgl");
    if (!canvas) throw new Error("Canvas not found");
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: canvas,
    });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0xffff00, 1);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.lightAmbient = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(this.lightAmbient);

    // Add a point light to add shadows
    const shadowIntensity = 0.25;

    this.lightPoint = new THREE.PointLight(0xffffff);
    this.lightPoint.position.set(-0.5, 0.5, 4);
    this.lightPoint.castShadow = true;
    this.lightPoint.intensity = shadowIntensity;
    // this.scene.add(this.lightPoint);

    const lightPoint2 = this.lightPoint.clone();
    lightPoint2.intensity = 1 - shadowIntensity;
    lightPoint2.castShadow = false;
    // this.scene.add(lightPoint2);

    const mapSize = 1024; // Default 512
    const cameraNear = 0.5; // Default 0.5
    const cameraFar = 500; // Default 500
    this.lightPoint.shadow.mapSize.width = mapSize;
    this.lightPoint.shadow.mapSize.height = mapSize;
    this.lightPoint.shadow.camera.near = cameraNear;
    this.lightPoint.shadow.camera.far = cameraFar;

    // import glb
    const model = await loadModel("models/reveil.glb");
    this.scene.add(model);

    const pointHeure =
      model.getObjectByName("pointHeure") ?? new THREE.Object3D();

    this.textureCanvas = new THREE.CanvasTexture(
      this.time.getContext()?.canvas as HTMLCanvasElement
    );
    this.plane = new THREE.Mesh(
      new THREE.PlaneGeometry(0.7, 0.35),
      new THREE.MeshBasicMaterial({
        map: this.textureCanvas,
        alphaMap: this.textureCanvas,
      })
    );
    this.plane.position.copy(pointHeure.position);
    this.plane.rotation.copy(pointHeure.rotation);
    this.scene.add(this.plane);

    // Ambient light
    const lightAmbient = new THREE.AmbientLight(0xffffff, 0.1);
    this.scene.add(lightAmbient);

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
            `<img src='${src}' width='${domElement.width}' height='${domElement.height}'>`
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
