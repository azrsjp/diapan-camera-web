export namespace Constants {
  // 写真のサイズ(理想値)
  export const kExpectedPhotoWidth = 1600;
  export const kExpectedPhotoHeight = 2400;

  export const kMedias = {
    locate: false,
    audio: false,
    video: {
      width: { ideal: kExpectedPhotoWidth },
      height: { ideal: kExpectedPhotoHeight },
      facingMode: 'environment',
    },
  };
}
