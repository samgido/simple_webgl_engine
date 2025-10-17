//Ignore compiler errors
//Allowed by the flags provided to esbuild
import vertexShaderSource from './shaders/shader.vert'; //--loader:.vert=text flag 
import fragmentShaderSource from './shaders/shader.frag'; //--loader:.frag=text flag 

import { RenderManager } from './render_manager';
import { fetchText } from './util';

interface ShaderInfo {
  name: string
}

class App {
  renderManager: RenderManager;
  image: HTMLImageElement;

  selectedIntUniformIndex: number = 0;
  selectedFloatUniformIndex: number = 0;

  availableShadersInfo: ShaderInfo[] = [];
  cachedShaders: Map<string, string> = new Map();
  shaderSelect: HTMLSelectElement;

  constructor() {
    this.cachedShaders.set("default", fragmentShaderSource);

    this.shaderSelect = document.getElementById("select_shader") as HTMLSelectElement;

    this.getAvailableShaders();

    this.renderManager = new RenderManager(vertexShaderSource, fragmentShaderSource);
    this.image = new Image();
    this.image.src = "http://localhost:3000/resources/textures/watrer.jpg";

    this.initializeHandlers();
  }

  async getAvailableShaders() {
    const shaderInfoString = await fetchText(new URL("http://localhost:3000/shaders/info.json"));
    console.log(shaderInfoString);
    if (shaderInfoString == null) {
      console.log("Failed to get shader info");
      return;
    }

    this.availableShadersInfo = JSON.parse(shaderInfoString);

    for (const shader of this.availableShadersInfo) {
      const opt = new Option();
      opt.text = shader.name;
      this.shaderSelect.add(opt);
    }
  }

  initializeHandlers() {
    this.image.addEventListener('load', () => {
      console.log("image loaded");
      this.renderManager.loadImageIntoTexture(this.image);
    });

    const floatIncrement = 0.075;
    document.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'ArrowUp':
          this.renderManager.incrementArbitraryUniform('float', this.selectedFloatUniformIndex, floatIncrement);
          break;
        case 'ArrowDown':
          this.renderManager.incrementArbitraryUniform('float', this.selectedFloatUniformIndex, -1 * floatIncrement);
          break;
        case 'ArrowLeft':
          this.renderManager.incrementArbitraryUniform('int', this.selectedIntUniformIndex, -1);
          break;
        case 'ArrowRight':
          this.renderManager.incrementArbitraryUniform('int', this.selectedIntUniformIndex, 1);
          break;
      }
    });

    this.shaderSelect.addEventListener('change', async (event) => {
      if (event.target == null)
        return;

      const shaderName = (event.target as HTMLOptionElement).value;
      console.log(`Selected ${shaderName}`);

      if (shaderName == "default") {
        this.handleShaderChanged(fragmentShaderSource);
      } else {
        const newShaderSource = await fetchText(new URL(`http://localhost:3000/shaders/${shaderName}`));
        if (newShaderSource != null) {
          this.handleShaderChanged(newShaderSource);
        }
      }
    });
  }

  handleShaderChanged(shaderSource: string) {
    this.renderManager.createShaderProgram(vertexShaderSource, shaderSource);
    this.renderManager.loadImageIntoTexture(this.image);
  }
}

new App();
