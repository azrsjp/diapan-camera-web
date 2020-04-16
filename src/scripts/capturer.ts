export class Capturer {
  private canvas: HTMLCanvasElement = null;
  private images: { img: HTMLImageElement; url: string }[] = [];

  constructor() {
    this.canvas = document.createElement('canvas');
  }

  getCanvas = () => {
    return this.canvas;
  };

  saveAsImage = () => {
    return new Promise((resolve, reject) => {
      this.canvas.toBlob((blob) => {
        this.clearCanvas();

        const img = document.createElement('img');
        const url = URL.createObjectURL(blob);
        this.images.push({ img, url });

        img.onload = () => {
          resolve(img);
        };
        img.src = url;
      });
    });
  };

  clear = () => {
    this.images.forEach((element) => {
      URL.revokeObjectURL(element.url);
    });
    this.images = [];
  };

  private clearCanvas() {
    const ctx = this.canvas.getContext('2d');
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
