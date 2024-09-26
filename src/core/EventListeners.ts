import { Vector2 } from "three";
import SolarSystem from "../components/SolarSystem";
import Camera from "./Camera";
import Renderer from "./Renderer";

export class EventListeners {
    private renderer: Renderer;
    private camera: Camera;
    private solarSystem: SolarSystem;

    constructor(renderer: Renderer, camera: Camera, solarSystem: SolarSystem) {
        this.renderer = renderer;
        this.camera = camera;
        this.solarSystem = solarSystem;

        window.addEventListener("resize", () => this.onResize());

        window.addEventListener("mousedown", (e) => {
            const x =
                (e.clientX / this.renderer.getRendererDom().clientWidth) * 2 -
                1;
            const y = -(
                (e.clientY / this.renderer.getRendererDom().clientHeight) * 2 -
                1
            );
            this.solarSystem.shootRay(new Vector2(x, y));
        });

        this.camera.controls.addEventListener("change", () => {
            this.solarSystem.getDistancesToObjects();
        });
    }

    private onResize() {
        this.camera.onResize();
        this.renderer.onResize();
    }
}
