import * as dayjs from 'dayjs';

import { Utility } from './utility';
import { VideoLayer } from './video-layer';
import { Capturer } from './capturer';
import { DiapanLayer } from 'diapan-layer';

const video = <HTMLVideoElement>document.getElementById('video');
const diapanCanvas = <HTMLCanvasElement>document.getElementById('diapan');
const shutterButton = <HTMLButtonElement>document.getElementById('shutter');
const whiteButton = <HTMLButtonElement>document.getElementById('white');
const blackButton = <HTMLButtonElement>document.getElementById('black');

const capturer = new Capturer();
const videoLayer = new VideoLayer(video);
const diapanLayer = new DiapanLayer(diapanCanvas);

const adjust = () => {
  videoLayer
    .requestUserMedia(Utility.getExpectedPhotoHeight(), Utility.getExpectedPhotoWidth())
    .then(() => {
      adjustViews();
    })
    .catch((err) => {
      console.log('cant use camera', err);
    });
};

// window.addEventListener('orientationchange', );
window.onorientationchange = window.onresize = () => {
  adjust();
};

shutterButton.addEventListener('click', () => {
  videoLayer.videoToCanvas(capturer.getCanvas());
  diapanLayer
    .renderToCanvas(capturer.getCanvas())
    .then(() => capturer.saveAsImage())
    .then((image: HTMLImageElement) => {
      const anchor = document.createElement('a');
      anchor.href = image.src;
      const time = dayjs().format('YYYYMMDD-HHmmss');
      anchor.download = `daipan-${time}.png`;
      anchor.target = '_blank';
      anchor.click();
    });
});

whiteButton.addEventListener('click', () => {
  diapanLayer.toggleWhiteDiapan();
});

blackButton.addEventListener('click', () => {
  diapanLayer.toggleBlackDiapan();
});

const adjustViews = () => {
  const [trueVideoWidth, trueVideoHegiht] = [
    videoLayer.getVideoWitdh(),
    videoLayer.getVideoHeight(),
  ];
  const [windowWidth, windowHeight] = Utility.getWindowSize();
  const [videoWidth, videoHeight] = Utility.aspectFit(
    Utility.getExpectedPhotoWidth(),
    Utility.getExpectedPhotoHeight(),
    windowWidth,
    windowHeight
  );

  // Resize Video
  video.style.width = videoWidth + 'px';
  video.style.height = videoHeight + 'px';
  video.style.top = Math.floor((windowHeight - videoHeight) * 0.5) + 'px';
  video.style.left = Math.floor((windowWidth - videoWidth) * 0.5) + 'px';

  const [canvasContentWidth, canvasContentHeight] = Utility.aspectFit(
    videoWidth,
    videoHeight,
    trueVideoWidth,
    trueVideoHegiht
  );

  // Resize Capture Canvas
  const captureCanvas = capturer.getCanvas();
  captureCanvas.setAttribute('width', canvasContentWidth.toString());
  captureCanvas.setAttribute('height', canvasContentHeight.toString());
  captureCanvas.style.width = videoWidth + 'px';
  captureCanvas.style.height = videoHeight + 'px';
  captureCanvas.style.top = Math.floor((windowHeight - videoHeight) * 0.5) + 'px';
  captureCanvas.style.left = Math.floor((windowWidth - videoWidth) * 0.5) + 'px';

  // Resize Diapan Canvas
  diapanCanvas.setAttribute('width', videoWidth.toString());
  diapanCanvas.setAttribute('height', videoHeight.toString());
  diapanCanvas.style.width = videoWidth + 'px';
  diapanCanvas.style.height = videoHeight + 'px';
  diapanCanvas.style.top = Math.floor((windowHeight - videoHeight) * 0.5) + 'px';
  diapanCanvas.style.left = Math.floor((windowWidth - videoWidth) * 0.5) + 'px';
  diapanLayer.adjustLayer();
};

const update = () => {
  diapanLayer.update();
  requestAnimationFrame(update);
};

window.onload = () => {
  Promise.all([
    videoLayer.requestUserMedia(Utility.getExpectedPhotoHeight(), Utility.getExpectedPhotoWidth()),
    diapanLayer.loadModels(),
  ])
    .then(() => {
      console.log('camera initialized');
      adjustViews();
      update();
    })
    .catch((err) => {
      console.log('cant use camera', err);
    });
};
