import { Component, ViewChild } from '@angular/core';
import { ImageService } from './services/image.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('inputImageCanvas') inputImageCanvas;
  @ViewChild('greyscaleImageCanvas') greyscaleImageCanvas;
  @ViewChild('horizontalPassEdgeImageCanvas') horizontalPassEdgeImageCanvas;
  @ViewChild('verticalPassEdgeImageCanvas') verticalPassEdgeImageCanvas;
  @ViewChild('magnitudeImageCanvas') magnitudeImageCanvas;
  canvasMaxHeight = 300;
  canvasMaxWidth = 500;
  selectedFile: File;
  inputImageData: ImageData;
  greyscaleImageData: ImageData;
  horizontalPassImageData: ImageData;
  verticalPassImageData: ImageData;
  magnitudeImageData: ImageData;

  fileSelectionHandler(e): void {
    if (e.target.files && e.target.files.length > 0) {
      this.selectedFile = e.target.files[0];
      setTimeout(() => this.loadInputImageInCanvas(this.selectedFile));
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
        this.convertToGreyscale(this.inputImageData);
      };
      img.src = event.target['result'];
    };
    reader.readAsDataURL(file);
  }

  private convertToGreyscale(imageData: ImageData): void {
    this.greyscaleImageData = ImageService.convertToGreyscale(imageData);
    setTimeout(() => {
      ImageService.paintImageDateOnCanvas(this.greyscaleImageData, this.greyscaleImageCanvas.nativeElement);
      this.detectEdges(this.greyscaleImageData);
    });
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

    this.horizontalPassImageData = ImageService.applyFilterToImageData(imageData, horizontalPassFilter);
    setTimeout(() => {
      ImageService.paintImageDateOnCanvas(this.horizontalPassImageData, this.horizontalPassEdgeImageCanvas.nativeElement);
    });

    this.verticalPassImageData = ImageService.applyFilterToImageData(imageData, verticalPassFilter);
    setTimeout(() => {
      ImageService.paintImageDateOnCanvas(this.verticalPassImageData, this.verticalPassEdgeImageCanvas.nativeElement);
    });

    this.magnitudeImageData = ImageService.applyFiltersToImageData(imageData, horizontalPassFilter, verticalPassFilter);
    setTimeout(() => {
      ImageService.paintImageDateOnCanvas(this.magnitudeImageData, this.magnitudeImageCanvas.nativeElement);
    });
  }

}
