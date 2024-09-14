import { PerspectiveCamera, Scene } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Renderer from "./Renderer";

export default class Camera {
    private camera: PerspectiveCamera;
    private controls: OrbitControls;
    private aspect: number;

    constructor(scene: Scene, renderer: Renderer) {
        this.camera = new PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            3000
        );

        this.controls = new OrbitControls(
            this.camera,
            renderer.getDomElement()
        );

        this.aspect = window.innerWidth / window.innerHeight;
        this.camera.aspect = this.aspect;
        this.camera.position.z = 100;

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
