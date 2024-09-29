import Sun from "./Sun";
import Orbit from "./Orbit";
import CelestialBody from "./CelestialBody";
import CelestialWithRing from "./CelestialWithRing";
import {
    Group,
    Raycaster,
    Scene,
    TextureLoader,
    Vector2,
    Vector3,
    WebGLRenderer,
} from "three";
import {
    SolarPlanetData,
    CelestialWithRingData,
    SatellitesData,
    SDBD_RESPONSE,
} from "../core/Types";
import { UI } from "../core/UI";
import { SETTINGS } from "../core/Settings";
import Camera from "../core/Camera";
import TWEEN, { Tween } from "@tweenjs/tween.js";
import Satellite from "./Satellite";

import Asteroid from "./Asteroid";
import axios from "axios";

type UniverseObject = CelestialBody | CelestialWithRing;

export default class SolarSystem {
    public group: Group;
    private centralBody: Sun;
    private celestialBodies: Map<string, CelestialBody | CelestialWithRing>;
    private satellites: Map<string, Satellite>;
    private currentDate: Date;
    private ui: UI;
    private textureLoader: TextureLoader;
    private raycaster: Raycaster;
    private targetTween: Tween | null = null;
    private zoomTween: Tween | null = null;
    private selectedObject: UniverseObject | null = null;
    private camera: Camera;
    private isLive: boolean;
    private resetCam: boolean = true;

    constructor(scene: Scene, renderer: WebGLRenderer, camera: Camera) {
        this.camera = camera;
        this.group = new Group();
        this.group.layers.set(0);
        // create sun
        this.centralBody = new Sun(
            scene,
            renderer,
            camera.getCamera(),
            "Sun",
            696340 / SETTINGS.SUN_SCALE,
            "./src/assets/textures/sun.jpg"
        );

        this.centralBody.init();
        scene.add(this.centralBody.mesh);

        this.celestialBodies = new Map<string, CelestialBody>();
        this.satellites = new Map<string, Satellite>();
        this.currentDate = new Date();
        this.ui = new UI(this);
        this.textureLoader = new TextureLoader();
        this.raycaster = new Raycaster();
        this.selectedObject = null;

        this.ui.updateTimelineInfo(this.currentDate);

        this.isLive = true;
    }

    public async init(): Promise<void> {
        await this.initPlanets();
        await this.initSatellites();
    }

    public update(deltaTime: number): void {
        this.currentDate = new Date(
            this.currentDate.getTime() +
                1000 * SETTINGS.simulationSpeed * deltaTime
        );

        if (this.targetTween) this.targetTween.update();
        if (this.zoomTween) this.zoomTween.update();

        this.ui.updateTimelineInfo(this.currentDate);

        if (this.isLive && SETTINGS.simulationSpeed != 1) {
            this.isLive = false;
            this.ui.noLive();
        }

        for (let [_, celestialBody] of this.celestialBodies) {
            celestialBody.updatePosition(
                this.currentDate,
                deltaTime,
                SETTINGS.simulationSpeed / 86400
            );

            if (celestialBody instanceof CelestialWithRing) {
                // console.log("simea");
                celestialBody.updateRing();
            }
        }

        this.followPlanet();
    }

    public async fetchAsteroidData(asteroidName: string): Promise<void> {
        const data = await axios.get(
            `/api/sbdb.api?sstr=${asteroidName}&r-notes=true&ca-data=true&phys-par=true&full-prec=true`
        );
        const res: SDBD_RESPONSE = data.data;

        let radius: number = 0;
        let rotPeriod: number = 0;
        for (const psyP of res.phys_par) {
            if (psyP.name == "diameter") radius = parseFloat(psyP.value) / 2;
            if (psyP.name == "rot_per")
                rotPeriod = parseFloat(psyP.value) / 3600;
        }

        const asteroid = new Asteroid(
            this,
            res.object.shortname,
            radius,
            0,
            rotPeriod,
            "#ff0000",
            "./src/assets/textures/moon.jpg",
            this.textureLoader
        );

        let ma: number = 0;
        let sA: number = 0;
        let e: number = 0;
        let longOfPeri: number = 0;
        let aP: number = 0;
        let i: number = 0;
        let aN: number = 0;
        let period: number = 0;
        let epoch: number = parseFloat(res.orbit.epoch);

        for (const orbitElem of res.orbit.elements) {
            if (orbitElem.name == "ma")
                ma = parseFloat(orbitElem.value) * (Math.PI / 180);
            if (orbitElem.name == "a") sA = parseFloat(orbitElem.value);
            if (orbitElem.name == "e") e = parseFloat(orbitElem.value);
            if (orbitElem.name == "w") aP = parseFloat(orbitElem.value);
            if (orbitElem.name == "i") i = parseFloat(orbitElem.value);
            if (orbitElem.name == "om") aN = parseFloat(orbitElem.value);
            if (orbitElem.name == "per") period = parseFloat(orbitElem.value);
        }

        longOfPeri = aN + aP;
        period /= 365.25;

        const orbit = new Orbit(
            ma,
            sA,
            e,
            longOfPeri,
            i,
            aN,
            period,
            epoch,
            asteroid,
            "#ff0000"
        );

        asteroid.setOrbit(orbit);

        this.celestialBodies.set(asteroid.name, asteroid);
        asteroid.init(this.currentDate);
        this.group.add(asteroid.group);
    }

    public shootRay(mouseCoords: Vector2): void {
        if (this.zoomTween?.isPlaying()) return;
        this.raycaster.far = this.camera.getCamera().far;
        this.raycaster.setFromCamera(mouseCoords, this.camera.getCamera());

        const intersections = this.raycaster.intersectObjects(
            this.group.children,
            true
        );

        for (let intersection of intersections) {
            const object = intersection.object;

            const celestialBody = this.celestialBodies.get(object.name);

            if (!celestialBody || this.selectedObject == celestialBody)
                continue;

            this.moveToBody(celestialBody);

            break;
        }
    }

    public getDistancesToObjects(): void {
        const cam = this.camera.getCamera();
        let dist: number = 0;
        for (let [_, body] of this.celestialBodies) {
            dist = cam.position.distanceTo(body.mesh!.position);

            body.updateRender(dist, body == this.selectedObject);
        }

        if (this.selectedObject)
            SETTINGS.DISTANCE_TO_OBJECT = this.camera.controls.getDistance();
    }

    public moveToBody(object: UniverseObject): void {
        this.selectedObject = object;

        const p = this.selectedObject.mesh!.position;
        const cam = this.camera.getCamera();
        const direction = new Vector3();
        cam.getWorldDirection(direction);
        let cameraTarget = this.camera.controls.target.clone();
        let startPosition = cam.position.clone();
        let endPosition = new Vector3()
            .copy(p)
            .sub(
                direction.multiplyScalar(
                    this.selectedObject.radius * SETTINGS.ZOOM_TO_OBJECT
                )
            );

        this.camera.controls.target = cameraTarget.clone();
        this.camera.controls.enabled = false;
        this.resetCam = false;

        this.selectAnimation(startPosition, endPosition, cameraTarget);
    }

    public resize(): void {
        this.centralBody.resize();
    }

    public setLiveDate(): void {
        this.currentDate = new Date();
        this.isLive = true;

        for (let [_, celestialBody] of this.celestialBodies) {
            celestialBody.setLivePosition(this.currentDate);
        }
    }

    public resetCamPosition(): void {
        this.resetCam = true;
        this.camera.moveToDefaultPosition();
        this.ui.hideResetPosition();
        this.selectedObject = null;
    }

    public renderSun(): void {
        this.centralBody.render();
    }

    private async initPlanets(): Promise<void> {
        const data = await fetch("./src/assets/data/SolarPlanets.json");
        const json: CelestialWithRingData[] | SolarPlanetData[] =
            await data.json();
        let celestialObject: CelestialBody | CelestialWithRing | null = null;

        for (let object of json) {
            if (object.type == "Planet") {
                if (object.name == "Saturn") {
                    const objectData = object as CelestialWithRingData;
                    celestialObject = new CelestialWithRing(
                        this,
                        objectData.name,
                        objectData.radius / SETTINGS.SIZE_SCALE,
                        objectData.obliquity,
                        objectData.sidRotPerSec,
                        objectData.color,
                        objectData.ringStart / SETTINGS.SIZE_SCALE,
                        objectData.ringEnd / SETTINGS.SIZE_SCALE,
                        objectData.textureUrl,
                        objectData.ringTexture,
                        this.textureLoader
                    );
                } else {
                    celestialObject = new CelestialBody(
                        this,
                        object.name,
                        object.radius / SETTINGS.SIZE_SCALE,
                        object.obliquity,
                        object.sidRotPerSec,
                        object.color,
                        object.textureUrl,
                        this.textureLoader
                    );
                }

                this.celestialBodies.set(object.name, celestialObject);

                const orbitData = object.orbit;

                const orbit = new Orbit(
                    orbitData.meanAnomaly,
                    orbitData.semiMajor,
                    orbitData.eccentricity,
                    orbitData.longOfPeri,
                    orbitData.inclination,
                    orbitData.ascendingNode,
                    orbitData.period,
                    new Date(orbitData.dataFrom),
                    celestialObject,
                    object.color,
                    orbitData.changesPerCentury
                );

                celestialObject.setOrbit(orbit);
            }
        }

        for (let [_, object] of this.celestialBodies) {
            object.init(this.currentDate);
            this.group.add(object.group);
        }
    }

    private async initSatellites(): Promise<void> {
        const data = await fetch("./src/assets/data/CommonSatellites.json");
        const json: SatellitesData[] = await data.json();

        for (let object of json) {
            if (!this.celestialBodies.has(object.centerBody)) continue;
            const satellite = new Satellite(
                this,
                object.name,
                object.radius / SETTINGS.SIZE_SCALE,
                object.obliquity,
                object.sidRotPerSec,
                object.color,
                object.textureUrl,
                this.textureLoader,
                this.celestialBodies.get(object.centerBody)!
            );

            this.satellites.set(satellite.name, satellite);

            const orbitData = object.orbit;

            const orbit = new Orbit(
                orbitData.meanAnomaly,
                orbitData.semiMajor / 149597870.7,
                orbitData.eccentricity,
                orbitData.longOfPeri,
                orbitData.inclination,
                orbitData.ascendingNode,
                orbitData.period,
                new Date(orbitData.dataFrom),
                satellite,
                object.color,
                null
            );

            satellite.setOrbit(orbit);
        }

        for (let [_, satellite] of this.satellites)
            satellite.init(this.currentDate);
    }

    private followPlanet(): void {
        if (
            !this.selectedObject ||
            this.zoomTween?.isPlaying() ||
            this.targetTween?.isPlaying() ||
            this.resetCam
        )
            return;

        let direction = new Vector3();
        const cam = this.camera.getCamera();
        cam.getWorldDirection(direction);

        let endPosition = new Vector3()
            .copy(this.selectedObject.mesh!.position)
            .sub(direction.multiplyScalar(SETTINGS.DISTANCE_TO_OBJECT));
        cam.position.copy(endPosition);
    }

    private selectAnimation(
        startPosition: Vector3,
        endPosition: Vector3,
        cameraTarget: Vector3
    ): void {
        if (!this.selectedObject) return;

        const cam = this.camera.getCamera();
        const p = this.selectedObject.mesh!.position;

        this.zoomTween = new Tween(startPosition)
            .to(endPosition, 2000)
            .easing(TWEEN.Easing.Cubic.InOut)
            .onUpdate(() => {
                cam.position.copy(startPosition);
            })
            .onComplete(() => {
                if (!this.selectedObject) return;
                this.camera.controls.enabled = true;
                this.camera.controls.target =
                    this.selectedObject.mesh!.position;

                this.ui.showResetPosition();
                this.selectedObject.showSatellites();
            });

        this.targetTween = new Tween(cameraTarget)
            .to(
                {
                    x: p.x,
                    y: p.y,
                    z: p.z,
                },
                500
            )
            .easing(TWEEN.Easing.Exponential.In)
            .onUpdate(() => {
                this.camera.controls.target.copy(cameraTarget);
            })
            .start()
            .chain(this.zoomTween);
    }
}
