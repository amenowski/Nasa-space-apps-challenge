import CelestialObject from "./components/CelestialObject";
import Orbit from "./components/Orbit";
import SolarSystem from "./components/SolarSystem";
import config from "./config";
import Camera from "./core/Camera";
import { EventListeners } from "./core/EventListeners";
import MainScene from "./core/MainScene";
import Renderer from "./core/Renderer";

const mainScene = new MainScene();
const renderer = new Renderer();
const camera = new Camera(mainScene.getScene(), renderer);
new EventListeners(renderer, camera);

const solarSystem = new SolarSystem();

const earth = new CelestialObject(
    "Earth",
    6371 / config.SIZE_SCALE,
    "./src/assets/textures/earth.jpg",
    29.78,
    149e6 / config.DISTANCE_SCALE
);

const earthOrbit = new Orbit(
    1.00000261,
    0.01671123,
    102.93768193,
    -0.00001531,
    0.0,
    earth
);

mainScene.init();
earth.setOrbit(earthOrbit);
solarSystem.addCelestialBody(earth);

// after addintion
solarSystem.init();

mainScene.addGroup(solarSystem.group);

console.log(solarSystem.group);

function animation() {
    camera.update();
    renderer.render(mainScene.getScene(), camera.getCamera());
    requestAnimationFrame(animation);
}

animation();
