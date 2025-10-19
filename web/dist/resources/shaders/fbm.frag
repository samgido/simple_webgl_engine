#version 300 es

precision highp float;

in vec2 v_texcoord;

uniform vec2 canvas_size;
uniform sampler2D u_texture;

uniform float float_uniform_0;

out vec4 outColor;

const mat2 m = mat2(0.8, 0.6, -0.6, 0.8);

float colormap_red(float x) {
    if (x < 0.0) {
        return 54.0 / 255.0;
    } else if (x < 20049.0 / 82979.0) {
        return (829.79 * x + 54.51) / 255.0;
    } else {
        return 1.0;
    }
}

float colormap_green(float x) {
    if (x < 20049.0 / 82979.0) {
        return 0.0;
    } else if (x < 327013.0 / 810990.0) {
        return (8546482679670.0 / 10875673217.0 * x - 2064961390770.0 / 10875673217.0) / 255.0;
    } else if (x <= 1.0) {
        return (103806720.0 / 483977.0 * x + 19607415.0 / 483977.0) / 255.0;
    } else {
        return 1.0;
    }
}

float colormap_blue(float x) {
    if (x < 0.0) {
        return 54.0 / 255.0;
    } else if (x < 7249.0 / 82979.0) {
        return (829.79 * x + 54.51) / 255.0;
    } else if (x < 20049.0 / 82979.0) {
        return 127.0 / 255.0;
    } else if (x < 327013.0 / 810990.0) {
        return (792.02249341361393720147485376583 * x - 64.364790735602331034989206222672) / 255.0;
    } else {
        return 1.0;
    }
}

float rand(vec2 n) {
	return fract(sin(dot(n, vec2(12.989, 4.42))) * 482983.5403);
}

float noise(vec2 p) {
	vec2 ip = floor(p);
	vec2 fp = fract(p);

	fp = fp * fp *(3.0 - 2.0*fp);

	float res = mix(
		mix(rand(ip), rand(ip + vec2(1.0, 0.0)), fp.x),
		mix(rand(ip + vec2(0.0, 1.0)), rand(ip + vec2(1.0, 1.0)), fp.y),
		fp.y
		);

	return res * res;
}

float fbm(vec2 p) {
	float f = 0.0;

	f += 0.5 * noise(p + float_uniform_0); p = m*p*2.02;
	f += 0.33012 * noise(p); p = m*p*2.01;
	f += 0.25 * noise(p); p = m*p*2.03;
	f += 0.125 * noise(p); p = m*p*2.01;
	f += 0.06412 * noise(p + sin(float_uniform_0)); 

	return f / 0.92188;
}

float fbm_patt(vec2 p) {
	return fbm(p + fbm(p + fbm(p)));
}

vec4 colormap(float x) {
	return vec4(colormap_red(x), colormap_green(x), colormap_blue(x), 1.0);
}

void main() {
	vec2 uv = gl_FragCoord.xy / canvas_size;
	float shade = fbm_patt(uv);

	outColor = vec4(colormap(shade).rgb, shade);
}
