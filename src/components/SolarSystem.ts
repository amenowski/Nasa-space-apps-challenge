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
import { SolarPlanetData, CelestialWithRingData } from "../core/Types";
import { UI } from "../core/UI";
import { SETTINGS } from "../core/Settings";
import Camera from "../core/Camera";
import TWEEN, { Tween } from "@tweenjs/tween.js";

type UniverseObject = CelestialBody | CelestialWithRing | Sun;

export default class SolarSystem {
    public group: Group;
    private centralBody: Sun;
    private celestialBodies: Map<string, CelestialBody | CelestialWithRing>;
    private currentDate: Date;
    private ui: UI;
    private textureLoader: TextureLoader;
    private raycaster: Raycaster;
    private targetTween: Tween | null = null;
    private zoomTween: Tween | null = null;
    private selectedObject: UniverseObject;
    private camera: Camera;

    constructor(scene: Scene, renderer: WebGLRenderer, camera: Camera) {
        this.camera = camera;
        this.group = new Group();
        // create sun
        this.centralBody = new Sun(
            scene,
            renderer,
            camera.getCamera(),
            "Sun",
            19891e10,
            696340 / SETTINGS.SUN_SCALE,
            "./src/assets/textures/sun.jpg"
        );

        this.centralBody.init();
        scene.add(this.centralBody.mesh);

        this.celestialBodies = new Map<string, CelestialBody>();
        this.currentDate = new Date();
        this.ui = new UI();
        this.textureLoader = new TextureLoader();
        this.raycaster = new Raycaster();
        this.selectedObject = this.centralBody;
    }

    public async init(): Promise<void> {
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
                    orbitData.changesPerCentury,
                    celestialObject,
                    object.color
                );

                celestialObject.setOrbit(orbit);
            }
        }

        for (let [_, object] of this.celestialBodies) {
            object.init(this.currentDate);
            this.group.add(object.group);
        }
    }

    public update(deltaTime: number): void {
        this.currentDate = new Date(
            this.currentDate.getTime() +
                1000 * SETTINGS.simulationSpeed * deltaTime
        );

        if (this.targetTween) this.targetTween.update();
        if (this.zoomTween) this.zoomTween.update();

        this.ui.setDate(this.currentDate);

        for (let [_, celestialBody] of this.celestialBodies) {
            celestialBody.updatePosition(
                this.currentDate,
                deltaTime,
                SETTINGS.simulationSpeed / 86400
            );
        }
    }

    public renderSun(): void {
        this.centralBody.render();
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

            body.updateRender(dist);
        }
    }

    public moveToBody(object: UniverseObject): void {
        this.selectedObject = object;

        const p = object.mesh!.position;
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

        this.selectAnimation(startPosition, endPosition, cameraTarget);
    }

    public resize(): void {
        this.centralBody.resize();
    }

    private selectAnimation(
        startPosition: Vector3,
        endPosition: Vector3,
        cameraTarget: Vector3
    ): void {
        const cam = this.camera.getCamera();
        const p = this.selectedObject.mesh!.position;

        this.zoomTween = new Tween(startPosition)
            .to(endPosition, 2000)
            .easing(TWEEN.Easing.Cubic.InOut)
            .onUpdate(() => {
                cam.position.copy(startPosition);
            })
            .onComplete(() => {
                this.camera.controls.enabled = true;
                this.camera.controls.target =
                    this.selectedObject.mesh!.position;
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
            .easing(TWEEN.Easing.Cubic.InOut)
            .onUpdate(() => {
                this.camera.controls.target.copy(cameraTarget);
            })
            .start()
            .chain(this.zoomTween);
    }
}
