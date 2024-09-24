import { PerspectiveCamera, Scene } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Renderer from "./Renderer";

export default class Camera {
    public controls: OrbitControls;
    private camera: PerspectiveCamera;
    private aspect: number;

    constructor(scene: Scene, renderer: Renderer) {
        this.camera = new PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            0.1,
            10000
        );

        this.controls = new OrbitControls(
            this.camera,
            renderer.getRendererDom()
        );

        this.aspect = window.innerWidth / window.innerHeight;
        this.camera.aspect = this.aspect;
        // this.camera.position.z = 600;
        // this.camera.position.y = 200;
        // this.camera.position.x = -500;
        // this.camera.lookAt(0, 0, 0);
        this.camera.layers.enableAll();

        this.camera.position.z = 50;
        this.camera.position.y = 50;

        scene.add(this.camera);
    }

    public init() {
        this.camera.updateProjectionMatrix();
    }

    public update(): void {
        this.controls.update();
    }

    public onResize(): void {
        this.aspect = window.innerWidth / window.innerHeight;
        this.camera.aspect = this.aspect;
        this.camera.updateProjectionMatrix();
    }

    public getCamera(): PerspectiveCamera {
        return this.camera;
    }
}
