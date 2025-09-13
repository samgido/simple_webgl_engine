//Ignore compiler errors
//Allowed by the flags provided to esbuild
import vertexShaderSource from './resources/shaders/shader.vert'; //--loader:.vert=text flag 
import fragmentShaderSource from './resources/shaders/shader.frag'; //--loader:.frag=text flag 

import { createWebGL2Renderer, Uniform } from './webgl_utils'
import { TWO_PI } from './util';

function main() {
  const renderer = createWebGL2Renderer("canvas", [vertexShaderSource, fragmentShaderSource]);

  //Format: clip.u, clip.v, tex.u, tex.v
  const shapeData = [
    -0.5, -0.5, 0., 0.,
    -0.5, 0.5, 0., 1.,
    0.5, 0.5, 1., 1.,

    -0.5, -0.5, 0., 0.,
    0.5, -0.5, 1., 0.,
    0.5, 0.5, 1., 1.
  ];
  renderer.loadShapeDataBuffer(shapeData);

  //Uniforms
  const numSegmentsUniform = renderer.createUniform("num_segments", 'int', 6);
  const segmentOffsetUniform = renderer.createUniform("segment_offset", 'float', 0.0);

  //Load image from server as texture
  //Create temporary texture to render while source is downloading
  const texture = renderer.createTemporaryTexture();

  const image = new Image();

  //Async handle texture download
  image.src = "http://localhost:3000/src/resources/textures/watrer.jpg"; //Change
  image.addEventListener("load", function () {
    renderer.loadImageIntoTexture(texture, image);
    renderer.drawScene();
  });

  renderer.drawScene();

  document.addEventListener('keydown', (event) => {
    //Segment offset
    const offsetIncrement = 0.075;
    const currentOffset = segmentOffsetUniform.get() as number;

    const actions: Record<string, [Uniform, () => any]> = {
      'w': [segmentOffsetUniform, () => (currentOffset + offsetIncrement) % TWO_PI],
      's': [segmentOffsetUniform, () => {
        const newOffset = currentOffset - offsetIncrement;
        return newOffset < 0 ? TWO_PI - (newOffset % TWO_PI) : newOffset;
      }]
    };

    if (event.key in actions) {
      const [uniform, getNewValue] = actions[event.key as keyof typeof actions];
      uniform.set(getNewValue());
    }

    renderer.drawScene();
  });
}

main();
