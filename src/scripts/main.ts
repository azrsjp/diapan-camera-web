import { Constants } from './constants';
import { Utility } from './utility';
import { VideoLayer } from './video-layer';

const video = <HTMLVideoElement>document.getElementById('video');
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
