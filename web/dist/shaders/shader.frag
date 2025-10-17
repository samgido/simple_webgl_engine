#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;

in vec2 v_texcoord;

uniform vec2 canvas_size;
uniform sampler2D u_texture;

uniform int int_uniform_0;
uniform float float_uniform_0;

out vec4 outColor;

void main() {
  outColor = texture(u_texture, vec2(v_texcoord.x + float_uniform_0, v_texcoord.y + float(int_uniform_0)/2.0));
}
