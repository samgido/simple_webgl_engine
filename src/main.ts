//Ignore compiler errors
//Allowed by the flags provided to esbuild
import vertexShaderSource from './resources/shaders/shader.vert'; //--loader:.vert=text flag 
import fragmentShaderSource from './resources/shaders/shader.frag'; //--loader:.frag=text flag 

import { Uniform } from './webgl_utils'
import { TWO_PI } from './util';
import { RenderManager } from './renderer_manager';

class App {
  renderManager: RenderManager;
  image: HTMLImageElement;

  numSegmentsUniform: Uniform;
  segmentOffsetUniform: Uniform;

  constructor() {
    this.renderManager = new RenderManager(vertexShaderSource, fragmentShaderSource);
    this.image = new Image();
    this.image.src = "http://localhost:3000/src/resources/textures/watrer.jpg";

    this.numSegmentsUniform = this.renderManager.renderer.createUniform("num_segments", 'int', 3);
    this.segmentOffsetUniform = this.renderManager.renderer.createUniform("segment_offset", 'float', 0.0);

    this.initializeHandlers();
  }

  initializeHandlers() {
    this.image.addEventListener('load', () => {
      this.renderManager.loadImageIntoTexture(this.image);
    });

    document.addEventListener('keydown', (event) => {
      //Segment offset
      const offsetIncrement = 0.075;
      const currentOffset = this.segmentOffsetUniform.get() as number;

      const actions: Record<string, [Uniform, () => any]> = {
        'w': [this.segmentOffsetUniform, () => (currentOffset + offsetIncrement) % TWO_PI],
        's': [this.segmentOffsetUniform, () => {
          const newOffset = currentOffset - offsetIncrement;
          return newOffset < 0 ? TWO_PI - (newOffset % TWO_PI) : newOffset;
        }]
      };

      if (event.key in actions) {
        const [uniform, getNewValue] = actions[event.key as keyof typeof actions];
        uniform.set(getNewValue());
      }

      this.renderManager.renderer.drawScene();
    });
  }
}

new App();
