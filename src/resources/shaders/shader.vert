#version 300 es

in vec4 a_position;
in vec2 a_tex_coord;

// varying to pass to frag
out vec2 v_texcoord;

void main() {
  gl_Position = a_position;
  v_texcoord = a_tex_coord;
}
