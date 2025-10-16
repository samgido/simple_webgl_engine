import { createWebGL2Renderer, Renderer, Uniform } from "./webgl_utils";

const INT_CHANNEL_COUNT = 5;
const FLOAT_CHANNEL_COUNT = 5;

export class RenderManager {
	renderer: Renderer;
	texture: WebGLTexture;

	uniformIntChannels: Uniform[] = [];
	uniformFloatChannels: Uniform[] = [];

	constructor(initialVertSource: string, initialFragSource: string) {
		this.renderer = createWebGL2Renderer("canvas", [initialVertSource, initialFragSource]);
		this.texture = this.renderer.createTemporaryTexture();

		//Format: clip.u, clip.v, tex.u, tex.v
		const shapeData = [
			-0.5, -0.5, 0., 0.,
			-0.5, 0.5, 0., 1.,
			0.5, 0.5, 1., 1.,

			-0.5, -0.5, 0., 0.,
			0.5, -0.5, 1., 0.,
			0.5, 0.5, 1., 1.
		];
		this.renderer.loadShapeDataBuffer(shapeData);

		//Initialize channels
		/*
			The following for-loops will add uniform elements to the respective array,
			as long as the currently loaded shader program expects them.
			e.g. if the shader declares only one int uniform, the 
			int channel array will have one element and the 
			float channel array will have no elements
		*/
		for (let i = 0; i < INT_CHANNEL_COUNT; i++) {
			const uniform = this.renderer.createUniform(`int_channel_${i}`, 'int', 0);

			if (uniform)
				this.uniformIntChannels = this.uniformIntChannels.concat(
					uniform
				);
		}

		for (let i = 0; i < FLOAT_CHANNEL_COUNT; i++) {
			const uniform = this.renderer.createUniform(`float_channel_${i}`, 'float', 0);

			if (uniform)
				this.uniformFloatChannels = this.uniformFloatChannels.concat(
					uniform
				);
		}

		this.uniformIntChannels[0].set(3); //Temporary

		this.renderer.drawScene();
	}

	incrementChannel(channelType: 'int' | 'float', channelIdx: number, increment: number) {
		try {
			let uniform: Uniform;
			switch (channelType) {
				case "int":
					uniform = this.uniformIntChannels[channelIdx];
				case "float":
					uniform = this.uniformFloatChannels[channelIdx];
			}

			const v = uniform.get() as number;
			uniform.set(v + increment);

			this.renderer.drawScene();
		} catch {
			console.log(`Channel increment failure.\n\ttype:${channelType}, channelNumber:${channelIdx}`);
		}
	}

	loadImageIntoTexture(image: HTMLImageElement) {
		this.renderer.loadImageIntoTexture(this.texture, image);
		this.renderer.drawScene();
	}
}
