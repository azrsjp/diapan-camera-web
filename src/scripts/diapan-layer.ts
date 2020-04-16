import * as THREE from 'three';
import { MMDLoader } from 'three/examples/jsm/loaders/MMDLoader';
import { ObjectControls } from 'object-controls';

const kWhiteDiapanPath = './assets/models/だいあぱんver.1.01.pmx';
const kBlackDiapanPath = './assets/models/ブラックだいあぱんver.1.01.pmx';

export class DiapanLayer {
  private canvas: HTMLCanvasElement = null;

  private camera: THREE.OrthographicCamera = null;
  private scene: THREE.Scene = null;
  private renderer: THREE.WebGLRenderer = null;

  private whiteDiapanMesh: THREE.SkinnedMesh = null;
  private blackDiapanMesh: THREE.SkinnedMesh = null;

  private objectControls: ObjectControls = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
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

  addWhiteDiapan = () => {
    if (this.whiteDiapanMesh != null) {
      this.objectControls.register(this.whiteDiapanMesh);
      this.whiteDiapanMesh.geometry.center();
      this.scene.add(this.whiteDiapanMesh);
    }
  };

  addBlackDiapan = () => {
    if (this.blackDiapanMesh != null) {
      this.objectControls.register(this.blackDiapanMesh);
      this.blackDiapanMesh.geometry.center();
      this.scene.add(this.blackDiapanMesh);
    }
  };

  adjustLayer() {
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;

    const width = 25;
    const height = width * (canvasHeight / canvasWidth);

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(canvasWidth, canvasHeight);
    this.camera = new THREE.OrthographicCamera(
      -width * 0.5,
      width * 0.5,
      height * 0.5,
      -height * 0.5
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
}
