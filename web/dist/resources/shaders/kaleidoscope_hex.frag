#version 300 es

/*
INCOMPLETE: Kaleidoscope effect tiled in hexagons
*/

#define M_PI 3.1415926535897932384626433832795
#define TWO_PI M_PI*2.0

precision highp float;

in vec2 v_texcoord;

uniform vec2 canvas_size;
uniform sampler2D u_texture;

uniform float float_uniform_0;
uniform int int_uniform_0;

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

vec2 cubeToAxial(vec3 cube) {
	return cube.xy;
}

vec3 axialToCube(vec2 axial) {
	float x = axial.x;
	float y = axial.y;

	float z = -x -y;

	return vec3(axial.xy, z);
}

vec3 cubeRound(vec3 cube) {
	float q = round(cube.x);
	float r = round(cube.y);
	float s = round(cube.z);

	float q_diff = abs(q - cube.x);
	float r_diff = abs(r - cube.y);
	float s_diff = abs(s - cube.z);

	if (q_diff > r_diff && q_diff > s_diff) {
		q = -1.0 * r - s;
	} else if (r_diff > s_diff) {
		r = -1.0 * q - s;
	} else {
		s = -1.0 * q - r;
	}

	return vec3(q, r, s);
}

vec2 axialRound(vec2 axial) {
	return cubeToAxial(cubeRound(axialToCube(axial)));
}

vec2 pixelToHex(vec2 p) {
	float x = p.x / hex_size;
	float y = p.y / hex_size;

	float q = (sqrt(3.0)/3.0 * x - 1.0/3.0 * y);
	float r = (2.0/3.0 * y);

	return axialRound(vec2(q, r));
}

vec2 hexToPixel(vec2 h) {float hx = sqrt(3.0) * h.x + sqrt(3.0)/2.0 * h.y;
	float hy = 3.0 / 2.0 * h.y;

	return vec2(hx, hy) * hex_size;
}

vec3 pixelToCube(vec2 p) {
	float q = (p.x * 2.0 / 3.0) * hex_size;
	float r = (-p.x / 3.0 + p.y * sqrt(3.0) / 3.0) / hex_size;

	return vec3(q, -q - r, r);
}

vec3 hex_round(vec3 cube) {
	vec3 rounded_cube = round(cube);

	float x_diff = abs(rounded_cube.x - cube.x);
	float y_diff = abs(rounded_cube.y - cube.y);
	float z_diff = abs(rounded_cube.z - cube.z);

	if (x_diff > y_diff && x_diff > z_diff) {
        rounded_cube.x = -rounded_cube.y - rounded_cube.z;
    } else if (y_diff > z_diff) {
        rounded_cube.y = -rounded_cube.x - rounded_cube.z;
    } else {
        rounded_cube.z = -rounded_cube.x - rounded_cube.y;
    }

    return rounded_cube;
}

vec2 cube_to_pixel(vec3 cube) {
	float q = cube.x;
	float r = cube.y;

	vec2 center;
	center.x = hex_size * 1.5 * q;
	center.y = hex_size * sqrt(3.0) * (r + 0.5 * q);

	return center;
}

vec2 get_hex_id(vec2 p) {
	vec3 cube_f = pixelToCube(p);

	vec3 cube_i = hex_round(cube_f);

	return cube_i.xz;
}

vec2 get_hex_center(vec2 p) {
	vec3 cube_i = hex_round(pixelToCube(p));

	return cube_to_pixel(cube_i);
}

void main() {
    vec2 uv = gl_FragCoord.xy / canvas_size;
    uv -= 0.5f;

    // float uy = uv.y * -1.0/(hex_size * sqrt(3.0));
    // float ux = uv.x * 1.0/(hex_size * sqrt(3.0));

    // float temp = floor(ux + sqrt(3.0) * uy + 1.0);
    // float q = floor((floor(2.0*ux+1.0) + temp) / 3.0);
    // float r = floor((temp + floor(-1.0 * ux + sqrt(3.0) * uy + 1.0)) / 3.0);

	// float x = (sqrt(3.0) * q + sqrt(3.0)/2.0 * r);
	// float y = (3.0 / 2.0 * r);

	// x *= hex_size;
	// y *= hex_size;

	// float sample_x = ux - x;
	// float sample_y = uy - y;

	// vec2 hex = hex_size * mat2(sqrt(3.0), sqrt(3.0)/2.0, 0.0, 3.0/2.0) * vec2(q, r);

	// outColor = texture(u_texture, vec2(sample_x, sample_y) + 0.5);

	vec2 hex_id = get_hex_id(uv);

	vec2 hex_c = get_hex_center(uv);

	vec2 sample_uv = uv - hex_c;

	outColor = vec4(length(sample_uv), 0.0, 0.0, 1.0);
}
