import {
    BoxGeometry,
    MeshBasicMaterial,
    Mesh,
    SphereGeometry,
    Group,
} from "three";
import CelestialObject from "./components/CelestialObject";
import Orbit from "./components/Orbit";
import SolarSystem from "./components/SolarSystem";
import config from "./config";
import Camera from "./core/camera";
import { EventListeners } from "./core/eventListeners";
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

console.log(149e6 / config.DISTANCE_SCALE);

const earthOrbit = new Orbit(
    149.598e6 / config.SIZE_SCALE,
    0.0167,
    147.095e6 / config.SIZE_SCALE,
    152.1e6 / config.SIZE_SCALE,
    0.00005,
    earth
);

mainScene.init();
earth.addOrbit(earthOrbit);
solarSystem.addCelestialBody(earth);
solarSystem.init();

mainScene.addGroup(solarSystem.group);

console.log(solarSystem.group);

function animation() {
    camera.update();
    renderer.render(mainScene.getScene(), camera.getCamera());
    requestAnimationFrame(animation);
}

animation();
