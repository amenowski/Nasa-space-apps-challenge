import { ArrowHelper, Vector3 } from "three";
import SolarSystem from "./components/SolarSystem";
import Camera from "./core/Camera";
import { EventListeners } from "./core/EventListeners";
import MainScene from "./core/MainScene";
import Renderer from "./core/Renderer";

const mainScene = new MainScene();
const renderer = new Renderer();
const camera = new Camera(mainScene.getScene(), renderer);
new EventListeners(renderer, camera);

const solarSystem = new SolarSystem();

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

drawHelpers();

function animation() {
    camera.update();
    // solarSystem.update();
    renderer.render(mainScene.getScene(), camera.getCamera());
    requestAnimationFrame(animation);
}

animation();

// const date = new Date("2024-01-06");

// let jd = UnixToJulianDate(Date.now());
// let jd2 = UnixToJulianDate(date.getTime());

// // only for earth
// const mean = calculateMeanAnomaly(jd);
// const eccentric = calculateEccentricFromMean(mean, 0.01671123);
// const trueA = calculateTrueFromEccentric(eccentric, 0.01671123);
// console.log(mean, eccentric, trueA);
// let date = new Date("2024-01-01");
// for (let i = 1; i <= 12; ++i) {
//     const toDeg = 180 / Math.PI;
//     date.setMonth(i);
//     console.log(`------- ${date.getMonth()} -------`);
//     let jd = UnixToJulianDate(date.getTime());
//     let mean = calculateMeanAnomaly(jd);
//     let eccentric = calculateEccentricFromMean(mean, 0.01671123);
//     let trueA = calculateTrueFromEccentric(eccentric, 0.01671123);
//     if (eccentric < 0) eccentric += Math.PI * 2;
//     if (trueA < 0) trueA += Math.PI * 2;
//     console.log(`eccentric = ${eccentric * toDeg} | true = ${trueA * toDeg}`);
// }
