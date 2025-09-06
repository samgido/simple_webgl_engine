//Ignore compiler errors
//Allowed by the flags provided to esbuild
import vertexShaderSource from './resources/shaders/shader.vert'; //--loader:.vert=text flag 
import fragmentShaderSource from './resources/shaders/shader.frag'; //--loader:.frag=text flag 

import { initSetupFunctions } from './webgl_utils'

function main() {
  const webglUtils = initSetupFunctions("canvas", [vertexShaderSource, fragmentShaderSource]);

  //Format: clip.u, clip.v, tex.u, tex.v
  const shapeData = [
    -0.5, -0.5, 0., 0.,
    -0.5, 0.5, 0., 1.,
    0.5, 0.5, 1., 1.,

    -0.5, -0.5, 0., 0.,
    0.5, -0.5, 1., 0.,
    0.5, 0.5, 1., 1.
  ];
  webglUtils.loadShapeDataBuffer(shapeData);

  //Load image from server as texture
  //Create temporary texture to render while source is downloading
  const texture = webglUtils.createTemporaryTexture();

  const image = new Image();

  //Async handle texture download
  image.src = "http://localhost:3000/src/resources/textures/wall.jpg"; //Change
  image.addEventListener("load", function () {
    webglUtils.loadImageIntoTexture(texture, image);
    webglUtils.drawScene();
  });

  webglUtils.drawScene();
}

main();
