//Ignore compiler errors
//Allowed by the flags provided to esbuild
import vertexShaderSource from './resources/shaders/shader.vert'; //--loader:.vert=text flag 
import fragmentShaderSource from './resources/shaders/shader.frag'; //--loader:.frag=text flag 

import { createWebGL2Renderer } from './webgl_utils'

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
  const numSegmentsUniform = renderer.createUniform("num_segments", 'int', 3);

  //Load image from server as texture
  //Create temporary texture to render while source is downloading
  const texture = renderer.createTemporaryTexture();

  const image = new Image();

  //Async handle texture download
  image.src = "http://localhost:3000/src/resources/textures/wall.jpg"; //Change
  image.addEventListener("load", function () {
    renderer.loadImageIntoTexture(texture, image);
    renderer.drawScene();
  });

  renderer.drawScene();
}

main();
