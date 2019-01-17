# Image Edge Detection

This is a simple implementation of the Sobel Operator for Image Edge Detection

## Demo

[Click here](https://codewarrior404.github.io/image-edge-detection/) for demo. 

## How to use

* Click the `Select Image` button and select an image.
  
* The image will first be converted to Greyscale.
 
* Then we run the Sobel operator along the horizontal axis to detect the Horizontal edges.
  
* This is followed by a vertical pass to detect the Vertical edges.
  
* Now, both the Horizontal and Vertical passes are combined to provide the final result.
![Final Result Screenshot](https://github.com/CodeWarrior404/image-edge-detection/raw/master/readme-assets/final-screenshot.png)

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4300/`. The app will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## GitHub Pages Deployment

Run `ng buildForGitHubPages`. The build artifacts will be stored in the `docs/` directory. Create a copy of `docs/index.html` and name it `docs/404.html`
