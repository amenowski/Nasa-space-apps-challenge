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
    AsteroidData,
} from "../core/Types";
import { UI } from "../core/UI";
import { SETTINGS } from "../core/Settings";
import Camera from "../core/Camera";
import TWEEN, { Tween } from "@tweenjs/tween.js";
import Satellite from "./Satellite";

import Asteroid from "./Asteroid";

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
    private asteroids: Map<string, AsteroidData>;
    private phas: Map<string, AsteroidData>;

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
        this.asteroids = new Map<string, AsteroidData>();
        this.phas = new Map<string, AsteroidData>();
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
        await this.loadAsteroidsData();
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
                celestialBody.updateRing();
            }
        }

        this.followPlanet();
    }

    public searchForObjects(input: string): void {
        const regExp = new RegExp(`${input}`, "gi");
        let matches: string[] = [];

        for (let [key, _] of this.asteroids) {
            if (regExp.test(key)) {
                matches.push(key);
            }
        }

        this.ui.displayResult(matches);
    }

    public async loadAsteroid(asteroidName: string): Promise<void> {
        let matches: AsteroidData[] = [];

        for (let [key, ad] of this.asteroids) {
            if (asteroidName == key) {
                matches.push(ad);
            }
        }

        const asteroidData = matches[0];

        if (!asteroidData) return;

        const asteroid = new Asteroid(
            this,
            asteroidData.full_name,
            asteroidData.diameter / 2,
            0,
            asteroidData.rot_per / 3600,
            "#ffffff",
            "./src/assets/textures/moon.jpg",
            this.textureLoader
        );

        let longOfPeri = asteroidData.om + asteroidData.w;
        // period /= 365.25;
        const orbit = new Orbit(
            asteroidData.ma * (Math.PI / 180),
            asteroidData.a,
            asteroidData.e,
            longOfPeri,
            asteroidData.i,
            asteroidData.om,
            asteroidData.per_y,
            asteroidData.epoch,
            asteroid,
            "#ffffff"
        );
        asteroid.setOrbit(orbit);
        this.celestialBodies.set(asteroid.name, asteroid);
        asteroid.init(this.currentDate);
        this.group.add(asteroid.group);

        this.moveToBody(asteroid);
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
        if (object instanceof Asteroid) {
            object.loadModel();
        }
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

    public resize(): void {
        this.centralBody.resize();
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

    private async loadAsteroidsData(): Promise<void> {
        let data = await fetch("./src/assets/data/PHA.json");
        let json: AsteroidData[] = await data.json();

        for (let ad of json) {
            if (!ad.diameter) continue;

            this.asteroids.set(ad.full_name, ad);
            this.phas.set(ad.full_name, ad);
        }

        data = await fetch("./src/assets/data/NEO.json");
        json = await data.json();

        for (let ad of json) {
            if (!ad.diameter) continue;
            this.asteroids.set(ad.full_name, ad);
        }
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
