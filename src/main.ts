import { resizeCanvasToDisplaySize, createShader, createProgram } from './util';

// allowed by the flags provided to esbuild, ignore err
import vertexShaderSource from './shaders/shader.vert'; // --loader:.vert=text flag 
import fragmentShaderSource from './shaders/shader.frag'; // --loader:.frag=text flag 

function main() {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement | null;
  if (canvas == null) throw new Error("Couldn't find canvas element.");

  const gl = canvas.getContext("webgl2");
  if (gl == null) throw new Error("Couldn't get webgl2 context from canvas.");

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  if (vertexShader == undefined) throw new Error("Vertex shader is undefined.");
  if (fragmentShader == undefined) throw new Error("Fragment shader is undefined.");

  var program = createProgram(gl, vertexShader, fragmentShader);

  if (program == undefined) throw new Error("WebGL2 program is undefined.");

  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
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

  resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement | null)

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(program);
  gl.bindVertexArray(vao)

  const primitiveType = gl.TRIANGLES;
  const offset = 0;
  const count = 3;
  gl.drawArrays(primitiveType, offset, count);
}

main();