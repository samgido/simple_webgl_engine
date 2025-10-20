//Ignore compiler errors
//Allowed by the flags provided to esbuild
import vertexShaderSource from './shaders/shader.vert'; //--loader:.vert=text flag 
import fragmentShaderSource from './shaders/shader.frag'; //--loader:.frag=text flag 

import { fetchText } from './util';
import { RenderManager } from './render_manager';

interface ResourcesInfo {
  fragmentShaderFilesInfo: FileInfo[]
  textureFilesInfo: FileInfo[]
}

interface FileInfo {
  fileName: string
}

/*
  Set to the name of the resource currently being worked on
  to avoid having to use the shader select box each time 
  the page is reloaded

  These should be blank when merged to main
*/
const WORKING_SHADER_NAME = ""
const WORKING_TEXTURE_NAME = ""

const DEFAULT_SHADER_NAME = "default"

class App {
  renderManager: RenderManager;
  image: HTMLImageElement;

  selectedIntUniformIndex: number = 0;
  selectedFloatUniformIndex: number = 0;

  floatUniformAutoIncrementSpeed: number = 1.0;
  lastFrameTime: number = 0;

  resourcesInfo: ResourcesInfo;

  shaderSelect: HTMLSelectElement;
  textureSelect: HTMLSelectElement;
  autoIncrementCheckbox: HTMLInputElement;
  autoIncrementSpeedInput: HTMLInputElement;

  constructor() {
    this.shaderSelect = document.getElementById("select_shader") as HTMLSelectElement;
    this.textureSelect = document.getElementById("select_texture") as HTMLSelectElement;
    this.autoIncrementCheckbox = document.getElementById("checkbox_auto_increment") as HTMLInputElement;
    this.autoIncrementSpeedInput = document.getElementById("input_auto_increment_speed") as HTMLInputElement;

    this.getAvailableResources();

    this.renderManager = new RenderManager(vertexShaderSource, fragmentShaderSource);
    this.image = new Image();

    this.initializeHandlers();
    this.tick(this.lastFrameTime);
  }

  async getAvailableResources() {
    const response = await fetch("/resource_info");

    if (!response.ok) 
      console.log(`Error fetching resources info: ${response.status}`);

    response.json().then((resourcesInfo) => {
      this.resourcesInfo = resourcesInfo as ResourcesInfo;

      this.resourcesInfo.fragmentShaderFilesInfo.forEach((shaderInfo, i) => {
        const opt = new Option();
        opt.text = shaderInfo.fileName;
        this.shaderSelect.add(opt);

        if (shaderInfo.fileName == WORKING_SHADER_NAME) {
          this.shaderSelect.selectedIndex = i + 1; // +1 because the default shader is always first
          this.downloadShaderAndUse(shaderInfo.fileName);
        }
      });

      this.resourcesInfo.textureFilesInfo.forEach((textureInfo, i) => {
        const opt = new Option();
        opt.text = textureInfo.fileName;
        this.textureSelect.add(opt);

        if (i == 0 || textureInfo.fileName == WORKING_TEXTURE_NAME) {
          this.textureSelect.selectedIndex = i;
          this.image.src = `/resources/textures/${textureInfo.fileName}`;
        }
      });
    });
  }

  initializeHandlers() {
    this.floatUniformAutoIncrementSpeed = this.autoIncrementSpeedInput.valueAsNumber;

    this.image.addEventListener('load', () => {
      console.log("image loaded");
      this.renderManager.loadImageIntoTexture(this.image);
    });

    document.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'ArrowUp':
          this.renderManager.incrementUniform('float', this.selectedFloatUniformIndex, this.floatUniformAutoIncrementSpeed);
          break;
        case 'ArrowDown':
          this.renderManager.incrementUniform('float', this.selectedFloatUniformIndex, -1 * this.floatUniformAutoIncrementSpeed);
          break;
        case 'ArrowLeft':
          this.renderManager.incrementUniform('int', this.selectedIntUniformIndex, -1);
          break;
        case 'ArrowRight':
          this.renderManager.incrementUniform('int', this.selectedIntUniformIndex, 1);
          break;
      }
    });

    this.shaderSelect.addEventListener('change', async (event) => {
      if (!event.target)
        return;

      const shaderName = (event.target as HTMLOptionElement).value;
      console.log(`Selected ${shaderName}`);

      this.downloadShaderAndUse(shaderName);
    });

    this.textureSelect.addEventListener('change', (event) => {
      if (event.target == null)
        return;

      const textureName = (event.target as HTMLOptionElement).value;

      this.image.src = `/resources/textures/${textureName}`;
    });

    this.autoIncrementSpeedInput.addEventListener('change', 
      () => this.floatUniformAutoIncrementSpeed = this.autoIncrementSpeedInput.valueAsNumber
    );
  }

  async downloadShaderAndUse(shaderName: string) {
    if (shaderName == DEFAULT_SHADER_NAME) {
      this.handleShaderChanged(fragmentShaderSource);
    } else {
      const newShaderSource = await fetchText(`/resources/shaders/${shaderName}`);
      if (newShaderSource != null) {
        this.handleShaderChanged(newShaderSource);
      }
    }
  }

  handleShaderChanged(shaderSource: string) {
    this.renderManager.createShaderProgram(vertexShaderSource, shaderSource);
    this.renderManager.loadImageIntoTexture(this.image);
  }

  tick(time: number) {
    const deltaTime = (time - this.lastFrameTime) / 1000;
    this.lastFrameTime = time;

    if (this.autoIncrementCheckbox.checked) 
      this.renderManager.incrementUniform('float', this.selectedFloatUniformIndex, this.floatUniformAutoIncrementSpeed * deltaTime);

    requestAnimationFrame((t) => this.tick(t));
  }
}

new App();
