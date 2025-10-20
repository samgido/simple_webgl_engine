#version 300 es

/*
Mandebrot set with zooming
*/

precision highp float;

in vec2 v_texcoord;

uniform vec2 canvas_size;

uniform float float_uniform_0;
uniform int int_uniform_0;

out vec4 outColor;

const int NUM_ZOOM_CENTERS = 3;

const vec2 zoom_centers[NUM_ZOOM_CENTERS] = vec2[NUM_ZOOM_CENTERS](
	vec2(-0.761577, -0.08472907899),
	vec2(-0.10715093446959, -0.91210639325904),
	vec2(0.25100997358377, 0.000063)
);

float mandelbrot(int max_iter, vec2 c) {
	vec2 z = c;
	float stability_value = 1.0;

	for (int i = 0; i < max_iter; i += 1) {
		if (dot(z, z) > 4.0) {
			stability_value = float(i) / float(max_iter);
			return stability_value;
		}

		float tempx = z.x*z.x - z.y*z.y + c.x;
		z.y = 2.0*z.x * z.y + c.y;
		z.x = tempx;
	}

	return stability_value;
}

void main() {
	vec2 selected_zoom_center = zoom_centers[int(mod(float(int_uniform_0), float(NUM_ZOOM_CENTERS)))];

	vec2 uv = gl_FragCoord.xy / canvas_size;
	uv -= 0.5;

	float aspect = canvas_size.x / canvas_size.y;

	float zoom = 1.0 / exp2(float_uniform_0 + 0.1);
	if (zoom == 0.0) { zoom = 0.01; }

	vec2 c;
	c.x = uv.x * aspect * zoom + selected_zoom_center.x;
	c.y = uv.y * zoom + selected_zoom_center.y;

	int max_iter = 500;
	float i = 1.0 - mandelbrot(max_iter, c);

	outColor = vec4(i, i, i, 1.0);
}
