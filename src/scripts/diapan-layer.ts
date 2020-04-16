import * as THREE from 'three';
import { MMDLoader } from 'three/examples/jsm/loaders/MMDLoader';
import { ObjectControls } from 'object-controls';
import { Utility } from './utility';

const kWhiteDiapanPath = './assets/models/だいあぱんver.1.01.pmx';
const kBlackDiapanPath = './assets/models/ブラックだいあぱんver.1.01.pmx';

const kShortSideLength = 25; // 実は適当な値

export class DiapanLayer {
  private canvas: HTMLCanvasElement = null;

  private camera: THREE.OrthographicCamera = null;
  private scene: THREE.Scene = null;
  private renderer: THREE.WebGLRenderer = null;

  private whiteDiapanMesh: THREE.SkinnedMesh = null;
  private blackDiapanMesh: THREE.SkinnedMesh = null;

  private objectControls: ObjectControls = null;

  private prevViewWidth = 0;
  private prevViewHeight = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    [this.prevViewWidth, this.prevViewHeight] = this.calcViewSize(
      canvas.width,
      canvas.height,
      kShortSideLength
    );
    this.setup();
  }

  loadModels = () => {
    return Promise.all([
      this.loadMMD(kWhiteDiapanPath).then((mesh) => {
        this.whiteDiapanMesh = mesh;
      }),
      this.loadMMD(kBlackDiapanPath).then((mesh) => {
        this.blackDiapanMesh = mesh;
      }),
    ]);
  };

  toggleWhiteDiapan = () => {
    this.toggleObject(this.whiteDiapanMesh);
  };

  toggleBlackDiapan = () => {
    this.toggleObject(this.blackDiapanMesh);
  };

  adjustLayer() {
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;

    const [currentViewWidth, currentViewHeight] = this.calcViewSize(
      canvasWidth,
      canvasHeight,
      kShortSideLength
    );

    [this.whiteDiapanMesh, this.blackDiapanMesh].forEach((object) => {
      this.relocation(
        object,
        currentViewWidth,
        currentViewHeight,
        this.prevViewWidth,
        this.prevViewHeight
      );
    });

    this.prevViewWidth = currentViewWidth;
    this.prevViewHeight = currentViewWidth;

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(canvasWidth, canvasHeight);
    this.camera = new THREE.OrthographicCamera(
      -currentViewWidth * 0.5,
      currentViewWidth * 0.5,
      currentViewHeight * 0.5,
      -currentViewHeight * 0.5
    );
    this.camera.position.set(0, 0, 100);
    this.objectControls.setup(this.canvas, this.scene, this.camera);
  }

  update = () => {
    if (this.renderer != null) {
      this.renderer.clear();
      this.renderer.render(this.scene, this.camera);
    }
  };

  renderToCanvas = (canvas: HTMLCanvasElement) => {
    return new Promise((resolve, reject) => {
      this.canvas.toBlob((blob) => {
        const img = document.createElement('img');
        const url = URL.createObjectURL(blob);
        img.onload = () => {
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
          resolve();
        };
        img.onerror = (error) => {
          reject(error);
        };
        img.src = url;
      });
    });
  };

  private setup = () => {
    this.scene = new THREE.Scene();
    this.scene.add(new THREE.AmbientLight(0xeeeeee));
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    this.objectControls = new ObjectControls();
    this.adjustLayer();
  };

  private loadMMD = (path: string): Promise<THREE.SkinnedMesh> => {
    console.log(`loadMMD: ${path}`);

    return new Promise((resolve, reject) => {
      const loader = new MMDLoader();
      loader.load(
        path,
        (mesh) => {
          console.log(`OnSuccess load mmd: ${path}`);
          resolve(mesh);
        },
        (xhr) => {
          console.log(`OnProgress load mmd: ${xhr}`);
        },
        (error) => {
          console.log(`OnError load mmd ${error}`);
          reject(error);
        }
      );
    });
  };

  private calcViewSize = (canvasWidth: number, canvasHeight: number, shortSideLength: number) => {
    return Utility.isPortrait()
      ? [shortSideLength, shortSideLength * (canvasHeight / canvasWidth)]
      : [shortSideLength * (canvasWidth / canvasHeight), shortSideLength];
  };

  private relocation = (
    object: THREE.SkinnedMesh,
    currentViewWidth: number,
    currentViewHeight: number,
    prevViewWidth: number,
    prevViewHeight: number
  ) => {
    if (object === null) {
      return;
    }
    const x = object.position.x * (currentViewWidth / prevViewWidth);
    const y = object.position.y * (currentViewHeight / prevViewHeight);
    object.position.set(x, y, 0);
  };

  private toggleObject = (object: THREE.SkinnedMesh) => {
    if (object === null) {
      return;
    }
    if (object.parent === this.scene) {
      this.scene.remove(object);
    } else {
      this.objectControls.register(object);
      this.resetObjectTransform(object);
      this.scene.add(object);
    }
  };

  private resetObjectTransform = (object: THREE.SkinnedMesh) => {
    if (object === null) {
      return;
    }
    object.geometry.center();
    object.scale.set(1, 1, 1);
    object.position.set(0, 0, 0);
    object.rotation.set(0, 0, 0);
  };
}
