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

  // Attribute locations
  const position_attribute_location = gl.getAttribLocation(program, "a_position");
  const tex_coord_attribute_location = gl.getAttribLocation(program, "a_tex_coord");

  // Uniform locations
  const color_a_uniform_location = gl.getUniformLocation(program, "color_a");
  const num_segments_uniform_location = gl.getUniformLocation(program, "num_segments");
  const canvas_size_uniform_location = gl.getUniformLocation(program, "canvas_size");

  const position_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer);

  const positions = [
    -0.5, -0.5,
    -0.5, 0.5,
    0.5, 0.5,

    -0.5, -0.5,
    0.5, -0.5,
    0.5, 0.5
  ]
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  gl.enableVertexAttribArray(position_attribute_location);

  const size = 2;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const attrib_offset = 0;
  gl.vertexAttribPointer(
    position_attribute_location, size, type, normalize, stride, attrib_offset
  )

  // how to do multiple attributes 
  // create buffer for texture 
  const tex_coord_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, tex_coord_buffer);

  const texPositions = [
    0., 1.,
    0., 0.,
    1., 0.,

    0., 1.,
    1., 1.,
    1., 0.,
  ]

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texPositions), gl.STATIC_DRAW);

  gl.enableVertexAttribArray(tex_coord_attribute_location);
  gl.vertexAttribPointer(
    tex_coord_attribute_location, 2, gl.FLOAT, false, 0, 0
  );

  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + 0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

  const image = new Image();
  // image.src = "data:image/jpeg;base64,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"; // This line needs to change
  image.src = "http://localhost:3000/src/resources/textures/watrer.jpg"; // This line needs to change
  image.addEventListener("load", function () {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    drawScene();
  });

  // Uniform variables
  var canvas_size = [0, 0];
  var color_a = 0.5;
  var num_segments = 3;

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
  });

  drawScene();

  function drawScene() {
    if (util.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement | null)) {
      canvas_size[0] = gl.canvas.width;
      canvas_size[1] = gl.canvas.height;
    }

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program);
    gl.bindVertexArray(vao)

    gl.uniform1f(color_a_uniform_location, color_a);
    gl.uniform1i(num_segments_uniform_location, num_segments);
    gl.uniform2fv(canvas_size_uniform_location, new Float32Array(canvas_size));

    const primitive_type = gl.TRIANGLES;
    const offset = 0;
    const count = 6;
    gl.drawArrays(primitive_type, offset, count);
  }
}

main();
