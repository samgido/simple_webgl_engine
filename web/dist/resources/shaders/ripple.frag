#version 300 es

/*
Ripple effect
*/

#define M_PI 3.1415926535897932384626433832795f
#define TWO_PI M_PI*2.0

precision highp float;

in vec2 v_texcoord;

uniform vec2 canvas_size;
uniform sampler2D u_texture;

uniform int int_uniform_0; 
uniform float float_uniform_0; 
uniform float float_uniform_1; 

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
	float length = 0.2;

	vec2 uv = gl_FragCoord.xy / canvas_size;
	uv -= 0.5f;

	float angle = atan2(uv.y, uv.x);

	if(uv.y < 0.0f)
	  angle = TWO_PI + angle;

	float radius = sqrt(dot(uv, uv)) * float(int_uniform_0);

	int current_ripple = int(floor(radius / length));

	float radius_in_ripple = radius - (length * float(current_ripple));

	float sample_radius = min(radius_in_ripple, length - radius_in_ripple) + float_uniform_0;

	vec2 sample_uv = vec2(cos(angle), sin(angle)) * sample_radius;

	outColor = texture(u_texture, sample_uv * 2.0f + 0.5);
}
