import { Component, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild('inputImageCanvas') inputImageCanvas;
  @ViewChild('greyscaleImageCanvas') greyscaleImageCanvas;
  @ViewChild('horizontalPassEdgeImageCanvas') horizontalPassEdgeImageCanvas;
  @ViewChild('verticalPassEdgeImageCanvas') verticalPassEdgeImageCanvas;
  @ViewChild('magnitudeImageCanvas') magnitudeImageCanvas;
  canvasMaxHeight = 300;
  canvasMaxWidth = 500;
  inputImageData: ImageData;
  greyscaleImageData: ImageData;

  fileSelectionHandler(e): void {
    if (e.target.files && e.target.files.length > 0) {
      this.loadInputImageInCanvas(e.target.files[0]);
    }
  }

  convertToGrayScaleClickHandler(): void {
    if (this.inputImageData) {
      this.convertToGreyscale(this.inputImageData);
    }
  }

  detectEdgesClickHandler(): void {
    if (this.greyscaleImageData) {
      this.detectEdges(this.greyscaleImageData);
    }
  }

  private loadInputImageInCanvas(file: File): void {
    const canvas = this.inputImageCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvasRatio = this.canvasMaxWidth / this.canvasMaxHeight;
        const imageRatio = img.width / img.height;
        let imageWidth: number, imageHeight: number;
        if (imageRatio < canvasRatio) {
          imageHeight = this.canvasMaxHeight;
          imageWidth = imageHeight * imageRatio;
        } else {
          imageWidth = this.canvasMaxWidth;
          imageHeight = imageWidth / imageRatio;
        }
        canvas.height = imageHeight;
        canvas.width = imageWidth;
        ctx.drawImage(img, 0, 0, img.width, img.height,
          0, 0, imageWidth, imageHeight);
        this.inputImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      };
      img.src = event.target['result'];
    };
    reader.readAsDataURL(file);
  }

  private convertToGreyscale(imageData: ImageData): void {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = avg; // red
      data[i + 1] = avg; // green
      data[i + 2] = avg; // blue
    }
    const canvas = this.greyscaleImageCanvas.nativeElement;
    canvas.height = imageData.height;
    canvas.width = imageData.width;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);
    this.greyscaleImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  }

  private detectEdges(imageData: ImageData): void {
    const data = imageData.data;
    const pixelMatrix: number[][] = [];
    for (let i = 0; i < imageData.height; i++) {
      const pixelRow: number[] = [];
      for (let j = 0; j < imageData.width; j++) {
        pixelRow.push(data[(i * imageData.width * 4) + (j * 4)]);
      }
      pixelMatrix.push(pixelRow);
    }
    const horizontalPassFilter: number[][] = [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1]
    ];
    // const filter: number[][] = [
    //   [3, 0, -3],
    //   [10, 0, -10],
    //   [3, 0, -3]
    // ];
    const horizontalPassFilteredPixelMatrix = this.applyFilter(pixelMatrix, horizontalPassFilter);
    for (let i = 0; i < imageData.height; i++) {
      for (let j = 0; j < imageData.width; j++) {
        const index = (i * imageData.width * 4) + (j * 4);
        const value = horizontalPassFilteredPixelMatrix[i][j];
        data[index] = value; // red
        data[index + 1] = value; // green
        data[index + 2] = value; // blue
      }
    }
    const horizontalCanvas = this.horizontalPassEdgeImageCanvas.nativeElement;
    horizontalCanvas.height = imageData.height;
    horizontalCanvas.width = imageData.width;
    const horizontalCtx = horizontalCanvas.getContext('2d');
    horizontalCtx.putImageData(imageData, 0, 0);

    const verticalPassFilter: number[][] = [
      [-1, -2, -1],
      [0, 0, 0],
      [1, 2, 1]
    ];
    const verticalPassFilteredPixelMatrix = this.applyFilter(pixelMatrix, verticalPassFilter);
    for (let i = 0; i < imageData.height; i++) {
      for (let j = 0; j < imageData.width; j++) {
        const index = (i * imageData.width * 4) + (j * 4);
        const value = verticalPassFilteredPixelMatrix[i][j];
        data[index] = value; // red
        data[index + 1] = value; // green
        data[index + 2] = value; // blue
      }
    }
    const verticalCanvas = this.verticalPassEdgeImageCanvas.nativeElement;
    verticalCanvas.height = imageData.height;
    verticalCanvas.width = imageData.width;
    const verticalCtx = verticalCanvas.getContext('2d');
    verticalCtx.putImageData(imageData, 0, 0);

    const magnitudeMatrix = this.calculateMagnitudeMatrix(horizontalPassFilteredPixelMatrix, verticalPassFilteredPixelMatrix);
    for (let i = 0; i < imageData.height; i++) {
      for (let j = 0; j < imageData.width; j++) {
        const index = (i * imageData.width * 4) + (j * 4);
        const value = magnitudeMatrix[i][j];
        data[index] = value; // red
        data[index + 1] = value; // green
        data[index + 2] = value; // blue
      }
    }
    const magnitudeCanvas = this.magnitudeImageCanvas.nativeElement;
    magnitudeCanvas.height = imageData.height;
    magnitudeCanvas.width = imageData.width;
    const magnitudeCtx = magnitudeCanvas.getContext('2d');
    magnitudeCtx.putImageData(imageData, 0, 0);
  }

  private applyFilter(pixelMatrix: number[][], filter: number[][]): number[][] {
    const filteredPixelMatrix = JSON.parse(JSON.stringify(pixelMatrix));
    for (let i = 1; i < (pixelMatrix.length - 1); i++) {
      for (let j = 1; j < (pixelMatrix[i].length - 1); j++) {
        const filteredValue: number =
          filter[0][0] * pixelMatrix[i - 1][j - 1]
          + filter[1][0] * pixelMatrix[i][j - 1]
          + filter[2][0] * pixelMatrix[i + 1][j - 1]
          + filter[0][2] * pixelMatrix[i - 1][j + 1]
          + filter[1][2] * pixelMatrix[i][j + 1]
          + filter[2][2] * pixelMatrix[i + 1][j + 1];
        filteredPixelMatrix[i][j] = filteredValue;
      }
    }
    return filteredPixelMatrix;
  }

  private calculateMagnitudeMatrix(matrix1: number[][], matrix2: number[][]): number[][] {
    const resultMatrix: number[][] = JSON.parse(JSON.stringify(matrix1));
    for (let i = 0; i < matrix1.length; i++) {
      for (let j = 0; j < matrix1[0].length; j++) {
        resultMatrix[i][j] = Math.sqrt((matrix1[i][j] * matrix1[i][j]) + (matrix2[i][j] * matrix2[i][j]));
      }
    }
    return resultMatrix;
  }
}
