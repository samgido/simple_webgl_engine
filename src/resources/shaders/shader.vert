#version 300 es

in vec4 shape_data;

// varying to pass to frag
out vec2 v_texcoord;

void main() {
  gl_Position = vec4(shape_data.xy, 0.0f, 1.0f);
  v_texcoord = shape_data.zw;
}
