export function createShader(
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

export function createProgram(
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

export function getWebGL2Context(canvas: HTMLCanvasElement) {
  if (canvas == null) throw new Error("Couldn't find canvas element.");

  const gl = canvas.getContext("webgl2");
  if (gl == null) throw new Error("Couldn't get webgl2 context from canvas.");

  return gl;
}

export function createWebGLProgramFromSource(
  gl: WebGL2RenderingContext,
  source: [string, string],
): WebGLProgram {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, source[0]);
  if (vertexShader == undefined) throw new Error("Vertex shader is undefined.");

  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, source[1]);
  if (fragmentShader == undefined) throw new Error("Fragment shader is undefined.");

  var program = createProgram(gl, vertexShader, fragmentShader);
  if (program == undefined) throw new Error("WebGL2 program is undefined.");

  return program;
}
