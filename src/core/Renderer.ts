import { PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js";

export default class Renderer {
    private renderer: WebGLRenderer;
    private cssRenderer: CSS2DRenderer;
    constructor() {
        this.renderer = new WebGLRenderer({ antialias: true });
        this.cssRenderer = new CSS2DRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.cssRenderer.setSize(window.innerWidth, window.innerHeight);

        document.body.appendChild(this.cssRenderer.domElement);
        document.body.appendChild(this.renderer.domElement);

        this.cssRenderer.domElement.style.position = "absolute";
        this.cssRenderer.domElement.style.top = "0px";
    }

    public render(scene: Scene, camera: PerspectiveCamera) {
        this.renderer.render(scene, camera);
        this.cssRenderer.render(scene, camera);
    }

    public getRendererDom(): HTMLElement {
        return this.cssRenderer.domElement;
    }

    public onResize() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.cssRenderer.setSize(window.innerWidth, window.innerHeight);
    }
}
