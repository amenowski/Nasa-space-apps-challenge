import Sun from "./Sun";
import Orbit from "./Orbit";
import CelestialBody from "./CelestialBody";
import CelestialWithRing from "./CelestialWithRing";
import {
    CubeTextureLoader,
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
import { loadInfo } from "../utils/info";
import PHA from "./PHA";
import Comet from "./Comet";

type UniverseObject = CelestialBody | CelestialWithRing;

export default class SolarSystem {
    public group: Group;
    public famousObjectsNames: string[] = [
        "433 Eros (A898 PA)",
        "2062 Aten (1976 AA)",
        "1862 Apollo (1932 HA)",
        // "99942 Apophis (2004 MN4)",
        "2P/Encke",
        "96189 Pygmalion (1991 NT3)",
        "101955 Bennu (1999 RQ36)",
    ];
    private centralBody: Sun;
    private celestialBodies: Map<string, CelestialBody | CelestialWithRing>;
    private phaBodies: Map<string, PHA>;
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
    private comests: Map<string, AsteroidData>;
    private phas: Map<string, AsteroidData>;
    private renderedPHA: number;
    private renderPHA: boolean;
    private closePHA: PHA | null = null;
    private latestClosePha: PHA | null = null;

    constructor(scene: Scene, renderer: WebGLRenderer, camera: Camera) {
        this.textureLoader = new TextureLoader();
        this.camera = camera;
        this.renderPHA = true;
        this.group = new Group();
        this.group.layers.set(0);
        this.renderedPHA  = 0;
        // create sun
        this.centralBody = new Sun(
            scene,
            renderer,
            camera.getCamera(),
            "Sun",
            696340 / SETTINGS.SUN_SCALE,
            "/assets/textures/sun.jpg"
        );

        this.createSkybox(scene);

        this.centralBody.init();
        scene.add(this.centralBody.mesh);

        this.celestialBodies = new Map<string, CelestialBody>();
        this.satellites = new Map<string, Satellite>();
        this.asteroids = new Map<string, AsteroidData>();
        this.comests = new Map<string, AsteroidData>();
        this.phas = new Map<string, AsteroidData>();
        this.phaBodies = new Map<string, PHA>()
        this.currentDate = new Date();
        this.ui = new UI(this);
        this.raycaster = new Raycaster();
        this.selectedObject = null;
        this.closePHA = null;

        this.ui.updateTimelineInfo(this.currentDate);

        this.isLive = true;
    }

    public async init(): Promise<void> {
        await this.initPlanets();
        await this.initSatellites();
        await this.loadAsteroidsData();
        await this.loadPHA();
        this.loadFamousObjects();
        // this.hideObjectsOfType("PHA")
    }

    public update(deltaTime: number): void {
        this.renderedPHA = 0;
        
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

        for(let [_, phaBody] of this.phaBodies) {
            phaBody.updatePosition(this.currentDate, deltaTime, SETTINGS.simulationSpeed / 86400)
        }

        const earthPos = this.celestialBodies.get("Earth")!.mesh!.position
        if(this.renderPHA) {
                    for(let [_, pha] of this.phaBodies) {
                        if(pha.calcDistanceToEarth(earthPos)) {

                            if(!this.closePHA) {
                                if(pha != this.latestClosePha) {
                                    let dist = pha.mesh!.position.distanceTo(earthPos) / 149597870.7
                                    dist *= SETTINGS.DISTANCE_SCALE
                                    if(dist < SETTINGS.WARNING_THRESHOLD) {
                                        this.closePHA = pha;
                                        this.ui.showWarning(this.closePHA.name)
                                        this.latestClosePha = pha;
                                    }
                                }
                            }
                            pha.show();
                            this.renderedPHA++;
                        }
                    }
        }
 
        this.followPlanet();
    }

    public hideWarning(): void {
        this.closePHA = null;

    }

    public searchForObjects(input: string): void {
        input = input.replace(/[{()}]/g, "");
        const regExp = new RegExp(`${input}`, "gi");
        let matches: string[] = [];

        for (let [key, _] of this.asteroids) {
            if (regExp.test(key)) {
                matches.push(key);
            }
        }

        this.ui.displayResult(matches);
    }

    public async loadAsteroid(
        asteroidName: string,
        move: boolean = true
    ): Promise<void> {
        if (this.celestialBodies.has(asteroidName)) {
            this.moveToBody(this.celestialBodies.get(asteroidName)!);
            return;
        }

        let matches: AsteroidData[] = [];

        for (let [key, ad] of this.asteroids) {
            if (asteroidName == key) {
                matches.push(ad);
            }
        }

        const asteroidData = matches[0];

        if (!asteroidData) return;

        let object;

        if(this.comests.has(asteroidData.full_name)) {
            object = new Comet(
                this,
                asteroidData.full_name,
                asteroidData.diameter / 2,
                0,
                asteroidData.rot_per / 3600,
                SETTINGS.ORBIT_COLOR,
                "",
                this.textureLoader,
                asteroidData.pha,
                SETTINGS.PLANET_LAYER
            );
        } else {
            object = new Asteroid(
                this,
                asteroidData.full_name,
                asteroidData.diameter / 2,
                0,
                asteroidData.rot_per / 3600,
                SETTINGS.ORBIT_COLOR,
                "",
                this.textureLoader,
                asteroidData.pha,
                SETTINGS.PLANET_LAYER
            );
        }

        let longOfPeri = asteroidData.om + asteroidData.w;
        let eccentricity = asteroidData.e;

        if (typeof eccentricity == "string")
            eccentricity = parseFloat(eccentricity);

        const orbit = new Orbit(
            asteroidData.ma * (Math.PI / 180),
            asteroidData.a,
            eccentricity,
            longOfPeri,
            asteroidData.i,
            asteroidData.om,
            asteroidData.per_y,
            asteroidData.epoch,
            object,
            SETTINGS.ORBIT_COLOR,
            null,
            SETTINGS.ORBIT_LAYER
        );
        object.setOrbit(orbit);
        this.celestialBodies.set(object.name, object);
        object.init(this.currentDate);
        this.group.add(object.group);

        if (move) this.moveToBody(object);
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
        let zoom = SETTINGS.ZOOM_TO_OBJECT;
        this.ui.hideAdditionalInfo();
        loadInfo(object).then((res) => {
            if (res.description == "") {
                this.ui.hideInfoButton();
                return;
            }

            this.ui.showAdditionalInfo(res.description);
        });

        if (object instanceof Asteroid) {
            object.loadModel();
            if (object.zoom > SETTINGS.ZOOM_TO_OBJECT) zoom = object.zoom;
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
            .sub(direction.multiplyScalar(this.selectedObject.radius * zoom));

        this.camera.controls.target = cameraTarget.clone();
        this.camera.controls.enabled = false;
        this.resetCam = false;

        this.ui.showOrbitInfo(this.selectedObject);

        this.selectAnimation(startPosition, endPosition, cameraTarget);
    }

    public setLiveDate(): void {
        this.currentDate = new Date();
        this.isLive = true;
        this.selectedObject = null;
        this.closePHA = null;
        this.latestClosePha = null;
        for (let [_, celestialBody] of this.celestialBodies) {
            celestialBody.setLivePosition(this.currentDate);
        }

        for (let [_, phaBody] of this.phaBodies) {
            phaBody.setLivePosition(this.currentDate);
        }
    }

    public resetCamPosition(): void {
        this.resetCam = true;
      
        this.camera.moveToDefaultPosition();
        this.ui.hideResetPosition();
        this.ui.hideOrbitInfo();
        this.ui.hideInfoButton();
    }

    public renderSun(): void {
        this.centralBody.render();
    }

    public resize(): void {
        this.centralBody.resize();
    }

    public hideSearchBar(): void {
        this.ui.hideSearchBar();
    }

    public showObjectsOfType(type: string): void {
        if (type == "Satellite") {
            for (let [_, object] of this.celestialBodies) {
                object.showSatellites();
            }
            return;
        }

        if(type=="PHA") {
            this.renderPHA =true;
            for(let [_, pha] of this.phaBodies) {
                pha.show();
            }
        }
        
        for (let [_, object] of this.celestialBodies) {
            if (object.type == type) object.show();
        }

        if(!this.selectedObject) return;
        
        const dist = this.camera
        .getCamera()
        .position.distanceTo(this.selectedObject!.mesh!.position);
        
        this.selectedObject?.updateRender(dist, true);
    }
    
    public hideObjectsOfType(type: string): void {
        if (type == "Satellite") {
            for (let [_, object] of this.celestialBodies) {
                object.hideSatellites();
            }
            return;
        }
        
        if(type=="PHA") {
            this.renderPHA =false;
            for(let [_, pha] of this.phaBodies) {
                pha.hide();
            }

            return;
        }

        for (let [_, object] of this.celestialBodies) {
            if (object.type == type) object.hide();
        }
    }

    public resetClosePHA(): void {
        this.closePHA = null;
        this.renderPHA = true;

        console.log(this.closePHA)
    }

    public showOrbit(): void {
        this.camera.getCamera().layers.enable(SETTINGS.ORBIT_LAYER);
    }

    public hideOrbit(): void {
        this.camera.getCamera().layers.disable(SETTINGS.ORBIT_LAYER);
    }

    public showLabel(): void {
        this.camera.getCamera().layers.enable(SETTINGS.LABEL_LAYER);
    }

    public hideLabel(): void {
        this.camera.getCamera().layers.disable(SETTINGS.LABEL_LAYER);
    }

    public showIcon(): void {
        this.camera.getCamera().layers.enable(SETTINGS.ICON_LAYER);
    }

    public hideIcon(): void {
        this.camera.getCamera().layers.disable(SETTINGS.ICON_LAYER);
    }

    private async loadPHA(): Promise<void> {
        for(let [_, data] of this.phas) {
            let pha = new PHA(this, data.full_name, data.diameter / 2, 0, data.rot_per / 3600, SETTINGS.ORBIT_COLOR, "", this.textureLoader)
            let longOfPeri = data.om + data.w;
            let eccentricity = data.e;

            if (typeof eccentricity == "string")
                eccentricity = parseFloat(eccentricity);

            const orbit = new Orbit(
                data.ma * (Math.PI / 180),
                data.a,
                eccentricity,
                longOfPeri,
                data.i,
                data.om,
                data.per_y,
                data.epoch,
                pha,
                SETTINGS.ORBIT_COLOR,
                null,
                SETTINGS.ORBIT_LAYER
            );

            pha.setOrbit(orbit);
            this.phaBodies.set(pha.name, pha)
            pha.init(this.currentDate)
            this.group.add(pha.group)
        }
    }

    private async initPlanets(): Promise<void> {
        const data = await fetch("/assets/data/SolarPlanets.json");
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
                        this.textureLoader,
                        SETTINGS.PLANET_LAYER
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
                        this.textureLoader,
                        SETTINGS.PLANET_LAYER
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
                    orbitData.changesPerCentury,
                    SETTINGS.ORBIT_LAYER
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
        const data = await fetch("/assets/data/CommonSatellites.json");
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
                this.celestialBodies.get(object.centerBody)!,
                SETTINGS.PLANET_LAYER
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
                null,
                SETTINGS.ORBIT_LAYER
            );

            satellite.setOrbit(orbit);
        }

        for (let [_, satellite] of this.satellites)
            satellite.init(this.currentDate);
    }

    private async loadAsteroidsData(): Promise<void> {
        let data = await fetch("/assets/data/PHA.json");
        let json: AsteroidData[] = await data.json();

        for (let ad of json) {
            if (!ad.diameter) continue;

            this.asteroids.set(ad.full_name, ad);
            this.phas.set(ad.full_name, ad);
        }

        data = await fetch("/assets/data/NEO.json");
        json = await data.json();

        for (let ad of json) {
            if (!ad.diameter) continue;
            this.asteroids.set(ad.full_name, ad);
        }

        data = await fetch("/assets/data/NEOc.json");
        json = await data.json();

        for (let ad of json) {
            if (!ad.diameter) continue;
            this.asteroids.set(ad.full_name, ad);
            this.comests.set(ad.full_name, ad);
        }
    }

    private async loadFamousObjects(): Promise<void> {
        for (let name of this.famousObjectsNames) {
            await this.loadAsteroid(name, false);
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
                this.selectedObject.showSatellitesInfo();
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

    private createSkybox(scene: Scene): void {
        const loader = new CubeTextureLoader();
        const texture = loader.load([
            "/assets/textures/skybox/skybox_px.png",
            "/assets/textures/skybox/skybox_nx.png",
            "/assets/textures/skybox/skybox_py.png",
            "/assets/textures/skybox/skybox_ny.png",
            "/assets/textures/skybox/skybox_pz.png",
            "/assets/textures/skybox/skybox_nz.png",
        ]);

        scene.background = texture;
    }
}
