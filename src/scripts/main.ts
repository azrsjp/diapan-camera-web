import { Constants } from './constants';
import { Utility } from './utility';

const video = <HTMLVideoElement>document.getElementById('video');

const adjustViews = () => {
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
  navigator.mediaDevices
    .getUserMedia(Constants.kMedias)
    .then((stream) => {
      return new Promise((resolve, reject) => {
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          resolve();
        };
        video.onerror = (error) => {
          reject(error);
        };
      });
    })
    .then(() => {
      console.log('camera initialized');
      adjustViews();
    })
    .catch((err) => {
      console.log('cant use camera', err);
    });
};
