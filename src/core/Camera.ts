import { PerspectiveCamera, Scene, Vector3 } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Renderer from "./Renderer";
import { SETTINGS } from "./Settings";

export default class Camera {
    public controls: OrbitControls;
    private camera: PerspectiveCamera;
    private aspect: number;

    constructor(scene: Scene, renderer: Renderer) {
        this.camera = new PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            0.1,
            SETTINGS.CAMERA_RENDER_DISTANCE
        );

        this.controls = new OrbitControls(
            this.camera,
            renderer.getRendererDom()
        );
        this.controls.enableDamping = true;
        this.controls.enablePan = false;

        this.aspect = window.innerWidth / window.innerHeight;
        this.camera.aspect = this.aspect;
        // this.camera.position.z = 600;
        // this.camera.position.y = 200;
        // this.camera.position.x = -500;
        // this.camera.lookAt(0, 0, 0);
        this.camera.layers.enableAll();

        this.defaultPosition();

        this.controls.maxDistance = SETTINGS.CAMERA_MAX_DISTANCE;

        scene.add(this.camera);
    }

    public defaultPosition(): void {
        this.camera.position.copy(
            new Vector3(0, 276314.90723615506, 276314.9072361552)
        );
    }

    public init(): void {
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
