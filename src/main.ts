// ignore compiler errors
// allowed by the flags provided to esbuild
import vertexShaderSource from './resources/shaders/shader.vert'; // --loader:.vert=text flag 
import fragmentShaderSource from './resources/shaders/shader.frag'; // --loader:.frag=text flag 

import * as webglUtil from './webgl_utils'

function main() {
  const canvas = document.querySelector("#canvas") as HTMLCanvasElement | null;
  if (!canvas) throw new Error("Could not find canvas element in document");

  const gl = webglUtil.getWebGL2Context(canvas);
  const program = webglUtil.createWebGLProgramFromSource(gl, [vertexShaderSource, fragmentShaderSource]);
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  //Uniforms
  const segmentUniformLocaiton = gl.getUniformLocation(program, "num_segments"); //int
  const canvasSizeUniformLocation = gl.getUniformLocation(program, "canvas_size") //vec2

  const shapeData = [
    -0.5, -0.5,   0.0, 0.0,
    0.5, -0.5,    1.0, 0.0,
    0.0, 0.5,     0.5, 1.0
  ]

  webglUtil.loadShapeDataBuffer(shapeData, gl, program);
  const texture = webglUtil.createTempTexture(gl);

  //Async Image Loading
  const image = new Image();
  image.src = "http://localhost:3000/src/resources/textures/wall.jpg"; //Change
  image.addEventListener("load", function () {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    webglUtil.drawScene(gl, program, vao);
  })
  
  webglUtil.drawScene(gl, program, vao);

  /* Key Input
  var color_a = 0.5;
  document.addEventListener("keydown", (event) => {
    switch (event.key) {
      case "w":
        color_a = Math.min(color_a + 0.1, 1.0);
        break;
      case "s":
        color_a = Math.max(color_a - 0.1, 0.0);
        break;
    }
    drawScene();
  })*/
}

main();
