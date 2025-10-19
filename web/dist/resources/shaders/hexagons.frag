#version 300 es

#define M_PI 3.1415926535897932384626433832795
#define TWO_PI M_PI*2.0

precision highp float;

in vec2 v_texcoord;

uniform vec2 canvas_size;
uniform sampler2D u_texture;

out vec4 outColor;

float atan2(float y, float x) { // search atan2 for details
  if(x == 0.0f && y == 0.0f) {
    return 0.0f;
  } else if(x == 0.0f && y > 0.0f) {
    return M_PI / 2.0f;
  } else if(x == 0.0f && y < 0.0f) {
    return -1.0f * M_PI / 2.0f;
  } else if(x < 0.0f && y < 0.0f) {
    return atan(y / x) - M_PI;
  } else if(x < 0.0f && y >= 0.0f) {
    return atan(y / x) + M_PI;
  } else
    return atan(y / x);
}

const float hex_size = 0.05;

void main() {
  vec2 uv = gl_FragCoord.xy / canvas_size;
  uv -= 0.5f;

  uv.x *= 1.0/(hex_size * sqrt(3.0));
  uv.y *= -1.0/(hex_size * sqrt(3.0));

  float temp = floor(uv.x + sqrt(3.0) * uv.y + 1.0);
  float q = floor((floor(2.0*uv.x+1.0) + temp) / 3.0);
  float r = floor((temp + floor(-1.0 * uv.x + sqrt(3.0) * uv.y + 1.0)) / 3.0);

  // float angle = atan2(uv.y, uv.x);

  // if(uv.y < 0.0f)
  //   angle = TWO_PI + angle;

  // float radius = sqrt(dot(uv, uv));

  outColor = vec4((q+5.0) / 10.0, (r+5.0) / 10.0, 0.0, 1.0);
}
