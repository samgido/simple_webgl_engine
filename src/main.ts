function createShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string
) {
  const shader = gl.createShader(type);
  if (shader == null) {
    throw new Error("GL shader was null.");
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (success) {
    return shader
  }

  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

function createProgram(
  gl: WebGL2RenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader,
) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement | null): boolean {
  if (!canvas) {
    return false;
  }

  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;

  const needResize = canvas.width !== displayWidth || canvas.height !== displayHeight;

  if (needResize) {
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }

  return needResize;
}

function main() {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement | null;
  if (canvas == null) throw new Error("Couldn't find canvas element.");

  const gl = canvas.getContext("webgl2");
  if (gl == null) throw new Error("Couldn't get webgl2 context from canvas.");

  const vertexShaderSource = `#version 300 es
    
  // an attribute is an input (in) to a vertex shader.
  // It will receive data from a buffer
  in vec4 a_position;
    
  // all shaders have a main function
  void main() {
    
    // gl_Position is a special variable a vertex shader
    // is responsible for setting
    gl_Position = a_position;
  }
  `;

  const fragmentShaderSource = `#version 300 es
    
  // fragment shaders don't have a default precision so we need
  // to pick one. highp is a good default. It means "high precision"
  precision highp float;
    
  // we need to declare an output for the fragment shader
  out vec4 outColor;
    
  void main() {
    // Just set the output to a constant reddish-purple
    outColor = vec4(1, 0, 0.5, 1);
  }
  `;

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  if (vertexShader == undefined) {
    throw new Error("Vertex shader is undefined.");
  }

  if (fragmentShader == undefined) {
    throw new Error("Fragment shader is undefined.");
  }

  var program = createProgram(gl, vertexShader, fragmentShader);

  if (program == undefined) {
    throw new Error("WebGL2 program is undefined.");
  }

  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");

  const positionBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  const positions = [
    0, 0,
    0, 0.5,
    0.7, 0
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

  resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement | null);

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