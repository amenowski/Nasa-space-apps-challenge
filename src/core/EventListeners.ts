import Camera from "./camera";
import Renderer from "./Renderer";

export class EventListeners {
    constructor(renderer: Renderer, camera: Camera) {
        window.addEventListener("resize", () =>
            this.onResize(renderer, camera)
        );
    }

    private onResize(renderer: Renderer, camera: Camera) {
        camera.onResize();
        renderer.onResize();
    }
}
