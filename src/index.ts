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

await solarSystem.init();

mainScene.addGroup(solarSystem.group);

// solarSystem.loadAsteroid("apophis");
// solarSystem.loadAsteroid("icarus");
// solarSystem.loadAsteroid("Geographos");
// solarSystem.loadAsteroid("159504 (2000 WO67)", false);
solarSystem.loadAsteroid("1P/Halley", false);

function animation() {
    solarSystem.update(clock.getDelta());

    renderer.render(mainScene.getScene(), camera.getCamera());

    solarSystem.renderSun();

    camera.update();
    requestAnimationFrame(animation);
}

clock.start();
animation();
