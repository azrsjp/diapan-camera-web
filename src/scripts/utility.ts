import { Constants } from './constants';

export namespace Utility {
  export const getWindowSize = () => {
    return [window.innerWidth, window.innerHeight];
  };

  export const getExpectedPhotoWidth = () => {
    return Utility.isPortrait() ? Constants.kExpectedPhotoWidth : Constants.kExpectedPhotoHeight;
  };

  export const getExpectedPhotoHeight = () => {
    return Utility.isPortrait() ? Constants.kExpectedPhotoHeight : Constants.kExpectedPhotoWidth;
  };

  export const isPortrait = () => {
    return window.innerHeight / window.innerWidth >= 1.0;
  };

  export const mround = (value: number, multiple: number) => {
    return Math.floor(value / multiple) * multiple;
  };

  export const aspectFit = (
    inputWidth: number,
    inputHeight: number,
    boundWidth: number,
    boundHeight: number
  ) => {
    const mW = boundWidth / inputWidth;
    const mH = boundHeight / inputHeight;

    if (mH < mW) {
      boundWidth = (boundHeight / inputHeight) * inputWidth;
    } else if (mW < mH) {
      boundHeight = (boundWidth / inputWidth) * inputHeight;
    }
    return [boundWidth, boundHeight];
  };

  export const aspectFill = (
    inputWidth: number,
    inputHeight: number,
    boundWidth: number,
    boundHeight: number
  ) => {
    let mW = boundWidth / inputWidth;
    let mH = boundHeight / inputHeight;

    if (mH > mW) {
      boundWidth = (boundHeight / inputHeight) * inputWidth;
    } else if (mW > mH) {
      boundHeight = (boundWidth / inputWidth) * inputHeight;
    }
    return [boundWidth, boundHeight];
  };
}
