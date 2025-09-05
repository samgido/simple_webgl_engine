import * as util from './util';

export function initSetupFunctions(canvasID: string, shaderSource: [string, string]) {
  const canvas = util.getCanvasElement(canvasID);
  const gl = getWebGL2Context(canvas);
  const program = createWebGLProgramFromSource(gl, shaderSource);

  return {
    //Getters
    context: gl,
    program: program,

    //Loads Shape Data into Buffer
    loadShapeDataBuffer: function (data: number[]) {
      const shapeDataAttributeLocation = gl.getAttribLocation(program, "shape_data"); //vec4

      //VAO Param Consts
      const size = 4;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const attrib_offset = 0;

      //Shape
      const shapeDataBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, shapeDataBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(shapeDataAttributeLocation);
      gl.vertexAttribPointer(shapeDataAttributeLocation, size, type, normalize, stride, attrib_offset);

      return shapeDataBuffer;
    },

    //Creates and loads a temporary, solid color texture
    createTemporaryTexture: function () {
      const texture = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + 0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

      return texture;
    },

    //Loads image into a given texture
    loadImageIntoTexture: function (texture: WebGLTexture, image: HTMLImageElement) {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.generateMipmap(gl.TEXTURE_2D);
    },

    //Draws the scene
    drawScene: function (vao: WebGLVertexArrayObject) {
      util.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement | null)

      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      gl.useProgram(program);
      gl.bindVertexArray(vao);

      const primitiveType = gl.TRIANGLES;
      const offset = 0;
      const count = 6; //Hard code for now
      gl.drawArrays(primitiveType, offset, count);
    }
  }
}

//GL Util Functions
//Creates GL Program
function createProgram(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) return program;

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

//Gets GL Context
export function getWebGL2Context(canvas: HTMLCanvasElement) {
  if (canvas == null) throw new Error("Couldn't find canvas element.");

  const gl = canvas.getContext("webgl2");
  if (gl == null) throw new Error("Couldn't get webgl2 context from canvas.");

  return gl;
}

//Creates GL Program
function createWebGLProgramFromSource(gl: WebGL2RenderingContext, source: [string, string],): WebGLProgram {
  const createShader = function (type: number, source: string) {
    const shader = gl.createShader(type);
    if (shader == null) throw new Error("GL shader was null");

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) return shader;

    console.log("Shader compilation failed");
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
  }

  const vertexShader = createShader(gl.VERTEX_SHADER, source[0]);
  if (vertexShader == undefined) throw new Error("Vertex shader is undefined.");

  const fragmentShader = createShader(gl.FRAGMENT_SHADER, source[1]);
  if (fragmentShader == undefined) throw new Error("Fragment shader is undefined.");

  var program = createProgram(gl, vertexShader, fragmentShader);
  if (program == undefined) throw new Error("WebGL2 program is undefined.");

  return program;
}
