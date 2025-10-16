import { createWebGL2Renderer, Renderer } from "./webgl_utils";

export class RenderManager {
	renderer: Renderer;
	texture: WebGLTexture;

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

		this.renderer.drawScene();
	}

	loadImageIntoTexture(image: HTMLImageElement) {
		this.renderer.loadImageIntoTexture(this.texture, image);
		this.renderer.drawScene();
	}
}
