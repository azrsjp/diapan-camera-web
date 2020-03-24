import { Constants } from './constants';

const video = <HTMLVideoElement>document.getElementById('video');

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
    })
    .catch((err) => {
      console.log('cant use camera', err);
    });
};
