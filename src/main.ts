// ignore compiler errors
// allowed by the flags provided to esbuild
import vertexShaderSource from './shaders/shader.vert'; // --loader:.vert=text flag 
import fragmentShaderSource from './shaders/shader.frag'; // --loader:.frag=text flag 

import * as util from './util';
import * as webglUtil from './webgl_utils'

function main() {
  const canvas = document.querySelector("#canvas") as HTMLCanvasElement | null;
  if (!canvas) throw new Error("Could not find canvas element in document");

  const gl = webglUtil.getWebGL2Context(canvas);
  const program = webglUtil.createWebGLProgramFromSource(gl, [vertexShaderSource, fragmentShaderSource]);

  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
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
