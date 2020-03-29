import { Constants } from './constants';
import { Utility } from './utility';
import { VideoLayer } from './video-layer';
import { Capturer } from './capturer';

const video = <HTMLVideoElement>document.getElementById('video');
const capturer = new Capturer();
const videoLayer = new VideoLayer(video);

const adjustViews = () => {
  const [trueVideoWidth, trueVideoHegiht] = [
    videoLayer.getVideoWitdh(),
    videoLayer.getVideoHeight(),
  ];
  const [windowWidth, windowHeight] = Utility.getWindowSize();
  const [videoWidth, videoHeight] = Utility.aspectFit(
    Constants.kExpectedPhotoWidth,
    Constants.kExpectedPhotoHeight,
    windowWidth,
    windowHeight
  );

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
  const captureCanvas = capturer.getCanvas();
  captureCanvas.setAttribute('width', canvasContentWidth.toString());
  captureCanvas.setAttribute('height', canvasContentHeight.toString());
  captureCanvas.style.width = videoWidth + 'px';
  captureCanvas.style.height = videoHeight + 'px';
  captureCanvas.style.top = Math.floor((windowHeight - videoHeight) * 0.5) + 'px';
  captureCanvas.style.left = Math.floor((windowWidth - videoWidth) * 0.5) + 'px';
};

window.onload = () => {
  videoLayer
    .requestUserMedia()
    .then(() => {
      console.log('camera initialized');
      adjustViews();
    })
    .catch((err) => {
      console.log('cant use camera', err);
    });
};
