import * as THREE from 'three';

enum Gesture {
  None,
  Turn,
  ScalePanRotate,
}

enum GestureState {
  UnderThrethold,
  Activated,
}

const kScalingDistanceThrethold = 0.17;
const kRotateThrethold = 20;
const kScaleMin = new THREE.Vector3(0.7, 0.7, 0.7).length();
const kScaleMax = new THREE.Vector3(5, 5, 5).length();

export class ObjectControls {
  private domElement: HTMLElement = null;
  private scene: THREE.Scene = null;
  private camera: THREE.OrthographicCamera = null;
  private objects: THREE.Object3D[] = [];
  private activeObject: THREE.Object3D = null;
  private raycaster: THREE.Raycaster = new THREE.Raycaster();

  private gesture: Gesture = Gesture.None;
  private movePrev = new THREE.Vector2();
  private moveCurr = new THREE.Vector2();
  private panOrigin = new THREE.Vector3();
  private touchPanStart = new THREE.Vector2();
  private touchPanEnd = new THREE.Vector2();
  private scaleLengthOrigin = 0;
  private touchScalingDistanceStart = 0;
  private touchScalingDistanceEnd = 0;
  private scaleState: GestureState = GestureState.UnderThrethold;
  private rotationOrigin = new THREE.Vector3();
  private touchRotationStart = 0;
  private touchRotationEnd = 0;
  private rotationState: GestureState = GestureState.UnderThrethold;

  private touchStartListener = (event: TouchEvent) => {
    this.touchStart(event);
  };
  private touchMoveListener = (event: TouchEvent) => {
    this.touchMove(event);
  };
  private touchEndListener = (event: TouchEvent) => {
    this.touchEnd(event);
  };

  constructor() {}

  setup(domElement: HTMLElement, scene: THREE.Scene, camera: THREE.OrthographicCamera) {
    this.dispose();
    this.domElement = domElement;
    this.scene = scene;
    this.camera = camera;

    if (this.domElement != null) {
      this.domElement.addEventListener('touchstart', this.touchStartListener);
      this.domElement.addEventListener('touchmove', this.touchMoveListener);
      this.domElement.addEventListener('touchend', this.touchEndListener);
    }
  }

  dispose() {
    if (this.domElement != null) {
      this.domElement.removeEventListener('touchstart', this.touchStartListener);
      this.domElement.removeEventListener('touchmove', this.touchMoveListener);
      this.domElement.removeEventListener('touchend', this.touchEndListener);
    }

    this.domElement = null;
    this.scene = null;
    this.camera = null;
  }

  register(object: THREE.Object3D) {
    if (this.objects.indexOf(object) !== -1) {
      return;
    }
    this.objects.push(object);
  }

  private touchStart(event: TouchEvent) {
    event.preventDefault();

    // 操作対象の選択
    if (this.activeObject === null) {
      const pickedObject = this.pickObject(event);
      if (pickedObject === null) {
        return;
      }
      this.activeObject = pickedObject;
      this.setOpacity(this.activeObject, 0.6);
    }

    switch (event.targetTouches.length) {
      case 1:
        this.gesture = Gesture.Turn;
        this.startTurn(event);
        break;
      default:
        this.gesture = Gesture.ScalePanRotate;
        this.startScaling(event);
        this.startPan(event);
        this.startRotate(event);
        break;
    }
  }

  private touchMove(event: TouchEvent) {
    event.preventDefault();
    event.stopPropagation();

    switch (event.targetTouches.length) {
      case 1:
        this.gesture = Gesture.Turn;
        this.updateTurn(event);
        break;
      default:
        this.gesture = Gesture.ScalePanRotate;
        this.updateScaling(event);
        this.updatePan(event);
        this.updateRotate(event);
        break;
    }
  }

  private touchEnd(event: TouchEvent) {
    switch (event.targetTouches.length) {
      case 0:
        this.gesture = Gesture.None;
        this.scaleState = GestureState.UnderThrethold;
        this.rotationState = GestureState.UnderThrethold;
        this.setOpacity(this.activeObject, 1.0);
        this.activeObject = null;
        break;
      case 1:
        this.gesture = Gesture.Turn;
        this.scaleState = GestureState.UnderThrethold;
        this.rotationState = GestureState.UnderThrethold;
        this.startTurn(event);
        break;
      default:
        this.gesture = Gesture.ScalePanRotate;
        this.startScaling(event);
        this.startPan(event);
        this.startRotate(event);
        break;
    }
  }

  private startTurn = (event: TouchEvent) => {
    this.moveCurr.copy(this.getNormalizedPoint(event, 0));
    this.movePrev.copy(this.moveCurr);
  };

  private updateTurn = (event: TouchEvent) => {
    this.movePrev.copy(this.moveCurr);
    this.moveCurr.copy(this.getNormalizedPoint(event, 0));

    const angleX = (this.moveCurr.x - this.movePrev.x) * 180;
    const angleY = -(this.moveCurr.y - this.movePrev.y) * 180;
    if (this.activeObject) {
      this.activeObject.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), (Math.PI / 180) * angleX);
      this.activeObject.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), (Math.PI / 180) * angleY);
    }
  };

  private startScaling = (event: TouchEvent) => {
    const p0 = this.getNormalizedPoint(event, 0);
    const p1 = this.getNormalizedPoint(event, 1);
    const dx = p0.x - p1.x;
    const dy = p0.y - p1.y;
    this.scaleLengthOrigin = this.activeObject.scale.length();
    this.touchScalingDistanceEnd = this.touchScalingDistanceStart = Math.sqrt(dx * dx + dy * dy);
  };

  private updateScaling = (event: TouchEvent) => {
    const p0 = this.getNormalizedPoint(event, 0);
    const p1 = this.getNormalizedPoint(event, 1);
    const dx = p0.x - p1.x;
    const dy = p0.y - p1.y;
    this.touchScalingDistanceEnd = Math.sqrt(dx * dx + dy * dy);
    const distance = this.touchScalingDistanceEnd - this.touchScalingDistanceStart;

    switch (this.scaleState) {
      case GestureState.UnderThrethold:
        if (Math.abs(distance) >= kScalingDistanceThrethold) {
          this.scaleLengthOrigin = this.activeObject.scale.length();
          this.touchScalingDistanceEnd = this.touchScalingDistanceStart = Math.sqrt(
            dx * dx + dy * dy
          );
          this.scaleState = GestureState.Activated;
        }
        break;
      case GestureState.Activated:
        const length = Math.max(
          Math.min(this.scaleLengthOrigin + distance * 3, kScaleMax),
          kScaleMin
        );
        this.activeObject.scale.setLength(length);
        break;
    }
  };

  private startPan = (event: TouchEvent) => {
    const p0 = this.getNormalizedPoint(event, 0);
    const p1 = this.getNormalizedPoint(event, 1);
    const x = (p0.x + p1.x) * 0.5;
    const y = (p0.y + p1.y) * 0.5;
    this.panOrigin.copy(this.activeObject.position);
    this.touchPanStart.copy(new THREE.Vector2(x, y));
    this.touchPanEnd.copy(this.touchPanStart);
  };

  private updatePan = (event: TouchEvent) => {
    const p0 = this.getNormalizedPoint(event, 0);
    const p1 = this.getNormalizedPoint(event, 1);
    const x = (p0.x + p1.x) * 0.5;
    const y = (p0.y + p1.y) * 0.5;
    this.touchPanEnd.copy(new THREE.Vector2(x, y));
    this.activeObject.position.set(
      this.panOrigin.x +
        (this.touchPanEnd.x - this.touchPanStart.x) * (this.camera.right - this.camera.left) * 0.5,
      this.panOrigin.y +
        (this.touchPanEnd.y - this.touchPanStart.y) * (this.camera.top - this.camera.bottom) * 0.5,
      this.panOrigin.z
    );
  };

  private startRotate = (event: TouchEvent) => {
    const p0 = this.getNormalizedPoint(event, 0);
    const p1 = this.getNormalizedPoint(event, 1);
    const x = p0.x - p1.x;
    const y = p0.y - p1.y;
    this.rotationOrigin.copy(this.activeObject.rotation.toVector3());
    this.touchRotationStart = this.touchRotationEnd = Math.atan2(y, x) * (180 / Math.PI);
  };

  private updateRotate = (event: TouchEvent) => {
    const p0 = this.getNormalizedPoint(event, 0);
    const p1 = this.getNormalizedPoint(event, 1);
    const rx = p0.x - p1.x;
    const ry = p0.y - p1.y;
    this.touchRotationEnd = Math.atan2(ry, rx) * (180 / Math.PI);
    const rotated = this.touchRotationEnd - this.touchRotationStart;

    switch (this.rotationState) {
      case GestureState.UnderThrethold:
        if (Math.abs(rotated) >= kRotateThrethold) {
          this.rotationOrigin.copy(this.activeObject.rotation.toVector3());
          this.touchRotationEnd = this.touchRotationStart = Math.atan2(ry, rx) * (180 / Math.PI);
          this.rotationState = GestureState.Activated;
        }
        break;
      case GestureState.Activated:
        this.activeObject.rotation.setFromVector3(this.rotationOrigin);
        this.activeObject.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), (Math.PI / 180) * rotated);
        break;
    }
  };

  private pickObject = (event: TouchEvent): THREE.Object3D => {
    if (event.targetTouches.length <= 0) {
      return null;
    }
    const rect = (event.target as Element).getBoundingClientRect();

    for (let i = 0; i < event.targetTouches.length; ++i) {
      const point = this.getNormalizedPoint(event, i);

      this.raycaster.setFromCamera(point, this.camera);
      const intersects = this.raycaster.intersectObjects(this.scene.children);
      for (let j = 0; j < intersects.length; ++j) {
        if (this.objects.indexOf(intersects[j].object) !== -1) {
          return intersects[j].object;
        }
      }
    }
    return null;
  };

  private getNormalizedPoint = (touchEvent: TouchEvent, index: number) => {
    const targetRect = (touchEvent.target as Element).getBoundingClientRect();
    const pageX = touchEvent.targetTouches[index].pageX;
    const pageY = touchEvent.targetTouches[index].pageY;

    const offsetX = pageX - targetRect.left;
    const offsetY = pageY - targetRect.top;
    const normalizedX = (offsetX / targetRect.width) * 2 - 1;
    const normalizedY = -1 * (offsetY / targetRect.height) * 2 + 1;

    return new THREE.Vector2(normalizedX, normalizedY);
  };

  private setOpacity(mesh: THREE.Object3D, opacity: number) {
    if (mesh instanceof THREE.Mesh) {
      if (mesh.material instanceof Array) {
        mesh.material.forEach((element) => {
          element.opacity = opacity;
        });
      }
    }
  }
}
