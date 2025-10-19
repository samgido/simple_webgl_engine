	#version 300 es

	precision highp float;

	in vec2 v_texcoord;

	uniform float float_uniform_0;

	uniform vec2 canvas_size;

	out vec4 outColor;

	void main() {
		vec2 uv = gl_FragCoord.xy / canvas_size;
		uv -= 0.5;

		uv *= 10.0 * (float_uniform_0 / 3.0);
		uv.x -= 1.5;

		vec2 z = vec2(0.0);

		bool in_mandel = true;

		int max_iter = 700;
		int iter;
		for (iter = 0; iter < max_iter; iter += 1) {
			float tx = z.x;
			float ty = z.y;

			z.x = tx*tx - ty*ty;
			z.y = 2.0*tx*ty;

			z.x += uv.x;
			z.y += uv.y;

			if (z.x * z.x + z.y*z.y > 6.0) {
				in_mandel = false;
				break;
			}
		}

		if (in_mandel) {
			outColor = vec4(0.0, 0.0, 0.0, 1.0);
		} else {
			outColor = vec4(50.0 * (float(iter) / float(max_iter)), 0.0, 0.0 ,1.0);
		}
	}
