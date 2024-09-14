import { PerspectiveCamera, Scene, WebGLRenderer } from "three";

export default class Renderer {
    private renderer: WebGLRenderer;
    constructor() {
        this.renderer = new WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
    }

    public render(scene: Scene, camera: PerspectiveCamera) {
        this.renderer.render(scene, camera);
    }

    public getDomElement(): HTMLCanvasElement {
        return this.renderer.domElement;
    }

    public onResize() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
