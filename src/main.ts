//Ignore compiler errors
//Allowed by the flags provided to esbuild
import vertexShaderSource from './shaders/shader.vert'; //--loader:.vert=text flag 
import fragmentShaderSource from './shaders/shader.frag'; //--loader:.frag=text flag 

import { RenderManager } from './render_manager';

class App {
  renderManager: RenderManager;
  image: HTMLImageElement;

  selectedIntUniformIndex: number = 0;
  selectedFloatUniformIndex: number = 0;

  constructor() {
    this.renderManager = new RenderManager(vertexShaderSource, fragmentShaderSource);
    this.image = new Image();
    this.image.src = "http://localhost:3000/resources/textures/watrer.jpg";

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
          this.renderManager.incrementUniform('float', this.selectedFloatUniformIndex, floatIncrement);
          break;
        case 'ArrowDown':
          this.renderManager.incrementUniform('float', this.selectedFloatUniformIndex, -1 * floatIncrement);
          break;
      }
    });
  }
}

new App();
