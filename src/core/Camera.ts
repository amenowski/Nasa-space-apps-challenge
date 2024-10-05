import { PerspectiveCamera, Scene, Vector3 } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Renderer from "./Renderer";
import { SETTINGS } from "./Settings";
import TWEEN, { Tween } from "@tweenjs/tween.js";

export default class Camera {
    public controls: OrbitControls;
    private defaultPosition: Vector3;
    private camera: PerspectiveCamera;
    private aspect: number;
    private positionAnim: Tween | null = null;
    private targetAnim: Tween | null = null;

    constructor(scene: Scene, renderer: Renderer) {
        this.camera = new PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            0.001,
            SETTINGS.CAMERA_RENDER_DISTANCE
        );

        this.controls = new OrbitControls(
            this.camera,
            renderer.getRendererDom()
        );
        this.controls.enableDamping = true;
        this.controls.enablePan = false;
        // this.controls.autoRotate = true;

        this.aspect = window.innerWidth / window.innerHeight;
        this.camera.aspect = this.aspect;
        this.camera.layers.enableAll();

        this.defaultPosition = new Vector3(
            0,
            276314.90723615506,
            276314.9072361552
        );
        this.camera.position.copy(this.defaultPosition);

        this.controls.maxDistance = SETTINGS.CAMERA_MAX_DISTANCE;

        // this.controls.keys = {LEFT: 'ArrowLeft', RIGHT: "ArrowRight", UP: 'ArrowUp', BOTTOM: 'ArrowDown' }


        // this.controls.listenToKeyEvents(window)

        scene.add(this.camera);
    }

    public moveToDefaultPosition(): void {
        const startPos = this.camera.position.clone();
        const currentTarget = this.controls.target.clone();

        // make also tween for camera target
        this.targetAnim = new Tween(currentTarget)
            .to(new Vector3(0, 0, 0), 800)
            .easing(TWEEN.Easing.Cubic.InOut)
            .onUpdate(() => {
                this.controls.target = currentTarget.clone();
            });

        this.positionAnim = new Tween(startPos)
            .to(this.defaultPosition, 1000)
            .easing(TWEEN.Easing.Cubic.In)
            .onUpdate(() => {
                this.camera.position.copy(startPos);
            })

            .start()
            .chain(this.targetAnim);
    }

    public init(): void {
        this.camera.updateProjectionMatrix();
    }

    public update(): void {
        this.positionAnim?.update();
        this.targetAnim?.update();
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
