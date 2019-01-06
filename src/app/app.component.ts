import { Component, ViewChild } from '@angular/core';
import { ImageService } from './services/image.service';

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
    if (this.inputImageData) {
      this.detectEdges(this.inputImageData);
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
    const greyscaleImageData: ImageData = ImageService.convertToGreyscale(imageData);
    ImageService.paintImageDateOnCanvas(greyscaleImageData, this.greyscaleImageCanvas.nativeElement);
  }

  private detectEdges(imageData: ImageData): void {
    const horizontalPassFilter: number[][] = [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1]
    ];
    const verticalPassFilter: number[][] = [
      [-1, -2, -1],
      [0, 0, 0],
      [1, 2, 1]
    ];

    const horizontalPassImageData: ImageData = ImageService.applyFilterToImageData(imageData, horizontalPassFilter);
    ImageService.paintImageDateOnCanvas(horizontalPassImageData, this.horizontalPassEdgeImageCanvas.nativeElement);

    const verticalPassImageData: ImageData = ImageService.applyFilterToImageData(imageData, verticalPassFilter);
    ImageService.paintImageDateOnCanvas(verticalPassImageData, this.verticalPassEdgeImageCanvas.nativeElement);

    const multiplePassImageData: ImageData = ImageService.applyFiltersToImageData(imageData, horizontalPassFilter, verticalPassFilter);
    ImageService.paintImageDateOnCanvas(multiplePassImageData, this.magnitudeImageCanvas.nativeElement);
  }

}
