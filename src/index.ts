import { ArrowHelper, Clock, Vector3 } from "three";
import SolarSystem from "./components/SolarSystem";
import Camera from "./core/Camera";
import { EventListeners } from "./core/EventListeners";
import MainScene from "./core/MainScene";
import Renderer from "./core/Renderer";

const mainScene = new MainScene();
const renderer = new Renderer();
const camera = new Camera(mainScene.getScene(), renderer);
const clock = new Clock();

const solarSystem = new SolarSystem(camera);
new EventListeners(renderer, camera, solarSystem);

mainScene.init();

solarSystem.init();

mainScene.addGroup(solarSystem.group);

function drawHelpers() {
    const origin = new Vector3(0, 0, 0);
    const arrowHelperX = new ArrowHelper(
        new Vector3(1, 0, 0),
        origin,
        200,
        0xff0000
    );
    const arrowHelperY = new ArrowHelper(
        new Vector3(0, 1, 0),
        origin,
        200,
        0x00ff00
    );
    const arrowHelperZ = new ArrowHelper(
        new Vector3(0, 0, 1),
        origin,
        200,
        0x0000ff
    );

    mainScene.getScene().add(arrowHelperX);
    mainScene.getScene().add(arrowHelperY);
    mainScene.getScene().add(arrowHelperZ);
}

// drawHelpers();

function animation() {
    camera.update();
    solarSystem.update(clock.getDelta());
    renderer.render(mainScene.getScene(), camera.getCamera());
    requestAnimationFrame(animation);
}

clock.start();
animation();
