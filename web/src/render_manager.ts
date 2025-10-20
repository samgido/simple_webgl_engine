import { createWebGL2Renderer, Renderer, Uniform } from "./webgl_utils";

const INT_UNIFORM_COUNT = 5;
const FLOAT_UNIFORM_COUNT = 5;

export class RenderManager {
	renderer: Renderer;
	texture: WebGLTexture;

	shapeData: number[];

	intUniforms: Uniform[] = [];
	floatUniforms: Uniform[] = [];

	constructor(initialVertSource: string, initialFragSource: string) {
		//Format: clip.u, clip.v, tex.u, tex.v
		this.shapeData = [
			-0.8, -0.8, 0., 0.,
			-0.8, 0.8, 0., 1.,
			0.8, 0.8, 1., 1.,

			-0.8, -0.8, 0., 0.,
			0.8, -0.8, 1., 0.,
			0.8, 0.8, 1., 1.
		];

		this.createShaderProgram(initialVertSource, initialFragSource);
	}

	createShaderProgram(vertexSource: string, fragmentSource: string) {
		if (this.renderer) 
			this.renderer.deleteProgramAndShaders();
		this.renderer = createWebGL2Renderer("canvas", [vertexSource, fragmentSource]);

		this.renderer.loadShapeDataBuffer(this.shapeData);
		if (!this.texture)
			this.texture = this.renderer.createTemporaryTexture();

		this.renderer.setUniform('u_texture', 'int', 0);

		//Initialize arbitrary uniforms
		/*
			The following for-loops add uniform elements to the respective array,
			as long as the currently loaded shader program expects them.
			e.g. if the shader declares only one int uniform, the 
			intUniforms array will have one element and the 
			floatUniforms array will have no elements
		*/
		this.intUniforms = [];
		this.floatUniforms = [];
		for (let i = 0; i < INT_UNIFORM_COUNT; i++) {
			const uniform = this.renderer.createUniform(`int_uniform_${i}`, 'int', 0);

			if (uniform)
				this.intUniforms = this.intUniforms.concat(
					uniform
				);
		}

		for (let i = 0; i < FLOAT_UNIFORM_COUNT; i++) {
			const uniform = this.renderer.createUniform(`float_uniform_${i}`, 'float', 0);

			if (uniform)
				this.floatUniforms = this.floatUniforms.concat(
					uniform
				);
		}

		try { this.intUniforms[0].set(3); } catch {} //Temporary

		this.renderer.drawScene();
	}

	incrementUniform(uniformType: 'int' | 'float', uniformIdx: number, increment: number) {
		try {
			let uniform: Uniform;
			switch (uniformType) {
				case "int":
					uniform = this.intUniforms[uniformIdx];
					break;
				case "float":
					uniform = this.floatUniforms[uniformIdx];
					break;
			}

			const v = uniform.get() as number;
			uniform.set(v + increment);

			this.renderer.drawScene();
		} catch {
			console.log(`Uniform increment failure.\n\ttype:${uniformType}, uniformNumber:${uniformIdx}`);
		}
	}

	loadImageIntoTexture(image: HTMLImageElement) {
		this.renderer.loadImageIntoTexture(this.texture, image);
		this.renderer.drawScene();
	}
}
