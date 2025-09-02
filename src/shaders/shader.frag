#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;

uniform float color_a;

out vec4 outColor;

void main() {
  outColor = vec4(color_a, 0.22f, 0.49f, 1.0f);
}
