import * as util from './util';

const UNIFORM_TYPES = {
  FLOAT: 'float',
  INT: 'int',
  VEC2: 'vec2'
} as const;

export type UniformType = typeof UNIFORM_TYPES[keyof typeof UNIFORM_TYPES];

export type Uniform = {
  get: () => any,
  set: (v: any) => void
}

export type Renderer = {
  gl: WebGL2RenderingContext; program: WebGLProgram; canvas: HTMLCanvasElement; vao: WebGLVertexArrayObject;
  loadShapeDataBuffer: (data: number[]) => WebGLBuffer;
  createTemporaryTexture: () => WebGLTexture;
  loadImageIntoTexture: (texture: WebGLTexture, image: HTMLImageElement) => void;
  drawScene: () => void;
  createUniform: (name: string, type: UniformType, initialValue?: any) => Uniform | null;
  setUniform: (uniformName: string, type: UniformType, value: any) => void;
  getUniform: (uniformName: string) => any;
  deleteProgramAndShaders: () => void;
}

export function createWebGL2Renderer(canvasElementId: string, shaderSource: [string, string]): Renderer {
  const canvas = util.getCanvasElement(canvasElementId);
  const gl = getWebGL2Context(canvas);
  const program = createWebGLProgramFromSource(gl, shaderSource);
  if (program == undefined) {
    throw new Error("Initial program was undefined");
  }

  const vao = createVAO(gl);

  gl.useProgram(program);

  //Create canvas size uniform 
  //drawScene needs to see it and it shouldn't be modified by main
  const canvasSizeLocation = gl.getUniformLocation(program, "canvas_size");
  const setCanvasSizeUniform = (width: number, height: number) => 
    gl.uniform2fv(canvasSizeLocation, new Float32Array([width, height]));

  setCanvasSizeUniform(gl.canvas.width, gl.canvas.height); 

  return {
    //Getters
    gl: gl,
    program: program,
    canvas: canvas,
    vao: vao,

    //Loads Shape Data into Buffer
    loadShapeDataBuffer: (data: number[]) => {
      gl.bindVertexArray(vao);
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
    createTemporaryTexture: () => {
      const texture = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + 0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

      return texture;
    },

    //Loads image into a given texture
    loadImageIntoTexture: (texture: WebGLTexture, image: HTMLImageElement) => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.generateMipmap(gl.TEXTURE_2D);
    },

    //Draws the scene
    drawScene: () => {
      if (util.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement | null)) 
        setCanvasSizeUniform(gl.canvas.width, gl.canvas.height);

      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      gl.useProgram(program);
      gl.bindVertexArray(vao);

      const primitiveType = gl.TRIANGLES;
      const offset = 0;
      const count = 6; //Hard code for now
      gl.drawArrays(primitiveType, offset, count);
    },

    //Create uniform
    createUniform: (name: string, type: UniformType, initialValue?: any): Uniform | null => {
      const location = gl.getUniformLocation(program, name);

      if (location == null) {
        console.log(`Warning; location ${name} was not found in shader program`);
        return null;
      }

      const setUniform = (type: UniformType, v: any) => {
        gl.useProgram(program);

        switch (type) {
          case 'float':
            gl.uniform1f(location, v as number);
            break;
          case 'int':
            gl.uniform1i(location, v as number);
            break;
          case 'vec2':
            gl.uniform2fv(location, new Float32Array(v));
            break;
        }
      };
      
      if (initialValue) setUniform(type, initialValue);
      else setUniform(type, 0);

      return {
        get: () => gl.getUniform(program, location),
        set: (v: any) => setUniform(type, v),
      };
    },
    setUniform: (uniformName: string, type: UniformType, value: any) => {
      const l = gl.getUniformLocation(program, uniformName);
      if (l == null) 
        return;

      switch (type) {
        case 'float':
          gl.uniform1f(l, value);
          break;
        case 'int':
          gl.uniform1i(l, value);
          break;
        case 'vec2':
          gl.uniform2fv(l, value);
          break;
      }
    },
    getUniform: (uniformName: string) => {
      const l = gl.getUniformLocation(program, uniformName);
      if (l == null)
        return null;

      return gl.getUniform(program, l);
    },
    deleteProgramAndShaders() {
      gl.useProgram(null);
      gl.deleteProgram(program);
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
function createWebGLProgramFromSource(gl: WebGL2RenderingContext, source: [string, string],): WebGLProgram | undefined {
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
  if (vertexShader == undefined) {
    console.log("Could not create vertex shader");
    return undefined;
  }

  const fragmentShader = createShader(gl.FRAGMENT_SHADER, source[1]);
  if (fragmentShader == undefined) {
    console.log("Could not create fragment shader");
    return undefined;
  }

  var program = createProgram(gl, vertexShader, fragmentShader);
  if (program == undefined) {
    console.log("Shader program compilation failed");
    return undefined;
  }

  return program;
}

function createVAO(gl: WebGL2RenderingContext) {
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  return vao;
}
