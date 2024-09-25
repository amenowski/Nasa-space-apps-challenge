import Sun from "./Sun";
import Orbit from "./Orbit";
import CelestialBody from "./CelestialBody";
import CelestialWithRing from "./CelestialWithRing";
import { Group, Raycaster, TextureLoader, Vector2, Vector3 } from "three";
import { SolarPlanetData, CelestialWithRingData } from "../core/Types";
import { UI } from "../core/UI";
import { SETTINGS } from "../core/Settings";
import Camera from "../core/Camera";
import TWEEN, { Tween } from "@tweenjs/tween.js";

type UniverseObject = CelestialBody | CelestialWithRing | Sun;

class SolarSystem {
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
    constructor() {
        this.group = new Group();
        // create sun
        this.centralBody = new Sun(
            "Sun",
            19891e10,
            696340 / SETTINGS.SUN_SCALE,
            "./src/assets/textures/sun.jpg",
            1
        );

        this.centralBody.init();
        this.group.add(this.centralBody.mesh);

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
                        objectData.name,
                        objectData.radius / SETTINGS.SIZE_SCALE,
                        objectData.ringStart / SETTINGS.SIZE_SCALE,
                        objectData.ringEnd / SETTINGS.SIZE_SCALE,
                        objectData.textureUrl,
                        objectData.ringTexture,
                        this.textureLoader
                    );
                } else {
                    celestialObject = new CelestialBody(
                        object.name,
                        object.radius / SETTINGS.SIZE_SCALE,
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
                    celestialObject
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

    public shootRay(mouseCoords: Vector2, camera: Camera): void {
        if (this.zoomTween?.isPlaying()) return;
        this.raycaster.far = camera.getCamera().far;
        this.raycaster.setFromCamera(mouseCoords, camera.getCamera());

        const intersections = this.raycaster.intersectObjects(
            this.group.children,
            true
        );

        for (let intersection of intersections) {
            const object = intersection.object;

            let cameraTarget = new Vector3(0, 0, 0);
            let startPosition = new Vector3(0, 0, 0);
            let endPosition = new Vector3(0, 0, 0);

            if (object.parent) {
                let celestialBody;
                if (object.name == "Sun") celestialBody = this.centralBody;
                else
                    celestialBody = this.celestialBodies.get(
                        object.parent.name
                    );

                if (!celestialBody || this.selectedObject == celestialBody)
                    continue;

                this.selectedObject = celestialBody;

                const p = celestialBody.mesh!.position;
                const cam = camera.getCamera();
                const direction = new Vector3();
                cam.getWorldDirection(direction);
                cameraTarget = camera.controls.target.clone();
                startPosition = cam.position.clone();
                endPosition = new Vector3()
                    .copy(p)
                    .sub(
                        direction.multiplyScalar(
                            this.selectedObject.radius * 20
                        )
                    );

                camera.controls.target = cameraTarget.clone();
                camera.controls.enabled = false;

                this.selectAnimation(
                    camera,
                    startPosition,
                    endPosition,
                    cameraTarget
                );
                break;
            }
        }
    }

    private selectAnimation(
        camera: Camera,
        startPosition: Vector3,
        endPosition: Vector3,
        cameraTarget: Vector3
    ): void {
        const cam = camera.getCamera();
        const p = this.selectedObject.mesh!.position;

        this.zoomTween = new Tween(startPosition)
            .to(endPosition, 2000)
            .easing(TWEEN.Easing.Cubic.InOut)
            .onUpdate(() => {
                cam.position.copy(startPosition);
            })
            .onComplete(() => {
                camera.controls.enabled = true;
                camera.controls.target = this.selectedObject.mesh!.position;
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
                camera.controls.target.copy(cameraTarget);
            })
            .start()
            .chain(this.zoomTween);
    }
}

export default SolarSystem;
