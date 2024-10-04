import { Clock } from "three";
import SolarSystem from "./components/SolarSystem";
import Camera from "./core/Camera";
import { EventListeners } from "./core/EventListeners";
import MainScene from "./core/MainScene";
import Renderer from "./core/Renderer";

const mainScene = new MainScene();
const renderer = new Renderer();
const camera = new Camera(mainScene.getScene(), renderer);
const clock = new Clock();

const solarSystem = new SolarSystem(
    mainScene.getScene(),
    renderer.getRenderer(),
    camera
);
new EventListeners(renderer, camera, solarSystem);

mainScene.init();

solarSystem.init().then(() => {
    mainScene.addGroup(solarSystem.group);

    clock.start();
    animation();
});

function animation() {
    solarSystem.update(clock.getDelta());

    renderer.render(mainScene.getScene(), camera.getCamera());

    solarSystem.renderSun();

    camera.update();
    requestAnimationFrame(animation);
}
