// ignore compiler errors
// allowed by the flags provided to esbuild
import vertexShaderSource from './resources/shaders/shader.vert'; // --loader:.vert=text flag 
import fragmentShaderSource from './resources/shaders/shader.frag'; // --loader:.frag=text flag 

import * as util from './util';
import * as webglUtil from './webgl_utils'

function main() {
  const canvas = document.querySelector("#canvas") as HTMLCanvasElement | null;
  if (!canvas) throw new Error("Could not find canvas element in document");

  const gl = webglUtil.getWebGL2Context(canvas);
  const program = webglUtil.createWebGLProgramFromSource(gl, [vertexShaderSource, fragmentShaderSource]);

  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  const texcoordAttributeLocation = gl.getAttribLocation(program, "a_tex_coord");
  const colorAUniformLocation = gl.getUniformLocation(program, "color_a");

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  const positions = [
    -0.5, -0.5,
    0.5, -0.5,
    0.0, 0.5
  ]
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  gl.enableVertexAttribArray(positionAttributeLocation);

  const size = 2;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const attrib_offset = 0;
  gl.vertexAttribPointer(
    positionAttributeLocation, size, type, normalize, stride, attrib_offset
  )

  // how to do multiple attributes 
  // create buffer for texture 
  const texcoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);

  const texPositions = [
    0.0, 0.0,
    1.0, 0.0,
    0.5, 1.0
  ]
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texPositions), gl.STATIC_DRAW);

  gl.enableVertexAttribArray(texcoordAttributeLocation);
  gl.vertexAttribPointer(
    texcoordAttributeLocation, 2, gl.FLOAT, false, 0, 0
  );

  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + 0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

  const image = new Image();
  image.src = "http://localhost:3000/src/resources/textures/wall.jpg"; // This line needs to change
  image.addEventListener("load", function () {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    drawScene();
  });

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
  })

  drawScene();

  function drawScene() {
    util.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement | null)

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program);
    gl.bindVertexArray(vao)

    gl.uniform1f(colorAUniformLocation, color_a);

    const primitiveType = gl.TRIANGLES;
    const offset = 0;
    const count = 3;
    gl.drawArrays(primitiveType, offset, count);
  }
}

main();
