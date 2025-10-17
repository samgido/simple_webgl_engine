#version 300 es

// // fragment shaders don't have a default precision so we need
// // to pick one. highp is a good default. It means "high precision"
// precision highp float;

// in vec2 v_texcoord;

// uniform vec2 canvas_size;
// uniform sampler2D u_texture;

// out vec4 outColor;

// void main() {
//   outColor = texture(u_texture, v_texcoord);
// }

#define M_PI 3.1415926535897932384626433832795f
#define TWO_PI M_PI*2.0f

// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;

in vec2 v_texcoord;

uniform vec2 canvas_size;

uniform int int_uniform_0; 
uniform float float_uniform_0; 

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

void main() {
  // 'name' the arbitrary uniforms for readability
  int num_segments = int_uniform_0;
  float segment_offset = float_uniform_0;

  vec2 uv = gl_FragCoord.xy / canvas_size;
  uv -= 0.5f;

  float angle = atan2(uv.y, uv.x);

  if(uv.y < 0.0f)
    angle = TWO_PI + angle;

  float radius = sqrt(dot(uv, uv));

  float segment_angle = TWO_PI / float(num_segments);
  int current_segment = int(floor(angle / segment_angle));

  float angle_in_segment = angle - segment_angle * float(current_segment);

  float sample_angle = mod(min(angle_in_segment, segment_angle - angle_in_segment) + segment_offset, TWO_PI);

  vec2 sample_uv = vec2(cos(sample_angle), sin(sample_angle)) * radius;

  // Convert from whatever space sample_uv is in, to [0, 1]
  // outColor = texture(u_texture, sample_uv * 2.0f + 0.5f);

  outColor = texture(u_texture, v_texcoord);
}
