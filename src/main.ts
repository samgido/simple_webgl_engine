//Ignore compiler errors
//Allowed by the flags provided to esbuild
import vertexShaderSource from './resources/shaders/shader.vert'; //--loader:.vert=text flag 
import fragmentShaderSource from './resources/shaders/shader.frag'; //--loader:.frag=text flag 

import { RenderManager } from './renderer_manager';

class App {
  renderManager: RenderManager;
  image: HTMLImageElement;

  selectedIntChannel: number = 0;
  selectedFloatChannel: number = 0;

  constructor() {
    this.renderManager = new RenderManager(vertexShaderSource, fragmentShaderSource);
    this.image = new Image();
    this.image.src = "http://localhost:3000/src/resources/textures/watrer.jpg";

    this.initializeHandlers();
  }

  initializeHandlers() {
    this.image.addEventListener('load', () => {
      this.renderManager.loadImageIntoTexture(this.image);
    });

    const floatIncrement = 0.075;
    document.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'ArrowUp':
          this.renderManager.incrementChannel('float', this.selectedFloatChannel, floatIncrement);
          break;
        case 'ArrowDown':
          this.renderManager.incrementChannel('float', this.selectedFloatChannel, -1 * floatIncrement);
          break;
      }
    });
  }
}

new App();
