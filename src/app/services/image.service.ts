import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor() { }

  static convertToGreyscale(imageData: ImageData): ImageData {
    const imageDataClone: ImageData = new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height
    );
    const data = imageDataClone.data;
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = avg; // red
      data[i + 1] = avg; // green
      data[i + 2] = avg; // blue
    }
    return imageDataClone;
  }

  static paintImageDateOnCanvas(imageData: ImageData, canvas: HTMLCanvasElement): void {
    canvas.height = imageData.height;
    canvas.width = imageData.width;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);
  }

  static applyFilterToImageData(imageData: ImageData, filter: number[][]): ImageData {
    const imageDataClone: ImageData = new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height
    );
    const pixelMatrix = ImageService.convertImageDataTo2DPixelMatrix(imageDataClone);
    const filteredPixelMatrix = JSON.parse(JSON.stringify(pixelMatrix));
    for (let i = 1; i < (pixelMatrix.length - 1); i++) {
      for (let j = 1; j < (pixelMatrix[i].length - 1); j++) {
        filteredPixelMatrix[i][j] =
          Math.abs(filter[0][0] * pixelMatrix[i - 1][j - 1]
            + filter[1][0] * pixelMatrix[i][j - 1]
            + filter[2][0] * pixelMatrix[i + 1][j - 1]
            + filter[0][2] * pixelMatrix[i - 1][j + 1]
            + filter[1][2] * pixelMatrix[i][j + 1]
            + filter[2][2] * pixelMatrix[i + 1][j + 1]);
      }
    }
    ImageService.translate2DPixelMatrixToImageData(filteredPixelMatrix, imageDataClone);
    return imageDataClone;
  }

  static applyFiltersToImageData(imageData: ImageData,
                                 horizontalFilter: number[][],
                                 verticalFilter: number[][]): ImageData {
    const imageDataClone: ImageData = new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height
    );
    const horizontalPassPixelMatrix = ImageService.convertImageDataTo2DPixelMatrix(
      ImageService.applyFilterToImageData(imageDataClone, horizontalFilter));
    const verticalPassPixelMatrix = ImageService.convertImageDataTo2DPixelMatrix(
      ImageService.applyFilterToImageData(imageDataClone, verticalFilter));

    const resultMatrix: number[][] = JSON.parse(JSON.stringify(horizontalPassPixelMatrix));
    for (let i = 0; i < horizontalPassPixelMatrix.length; i++) {
      for (let j = 0; j < horizontalPassPixelMatrix[0].length; j++) {
        resultMatrix[i][j] = Math.sqrt(
          (horizontalPassPixelMatrix[i][j] * horizontalPassPixelMatrix[i][j])
          + (verticalPassPixelMatrix[i][j] * verticalPassPixelMatrix[i][j])
        );
      }
    }
    ImageService.translate2DPixelMatrixToImageData(resultMatrix, imageDataClone);
    return imageDataClone;
  }

  private static convertImageDataTo2DPixelMatrix(imageData: ImageData): number[][] {
    const data = imageData.data;
    const pixelMatrix: number[][] = [];
    for (let i = 0; i < imageData.height; i++) {
      const pixelRow: number[] = [];
      for (let j = 0; j < imageData.width; j++) {
        pixelRow.push(data[(i * imageData.width * 4) + (j * 4)]);
      }
      pixelMatrix.push(pixelRow);
    }
    return pixelMatrix;
  }

  private static translate2DPixelMatrixToImageData(pixelMatrix: number[][], imageData: ImageData): void {
    const data = imageData.data;
    for (let i = 0; i < imageData.height; i++) {
      for (let j = 0; j < imageData.width; j++) {
        const index = (i * imageData.width * 4) + (j * 4);
        const value = pixelMatrix[i][j];
        data[index] = value; // red
        data[index + 1] = value; // green
        data[index + 2] = value; // blue
      }
    }
  }
}
