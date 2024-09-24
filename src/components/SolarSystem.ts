import Sun from "./Sun";
import Orbit from "./Orbit";
import CelestialObject from "./CelestialObject";
import CelestialWithRing from "./CelestialWithRing";
import { Group, Raycaster, TextureLoader, Vector2, Vector3 } from "three";
import { SolarPlanetData, CelestialWithRingData } from "../core/Types";
import { UI } from "../core/UI";
import { SETTINGS } from "../core/Settings";
import Camera from "../core/Camera";

class SolarSystem {
    public group: Group;
    private centralBody: Sun;
    private celestialBodies: Map<string, CelestialObject | CelestialWithRing>;
    private currentDate: Date;
    private ui: UI;
    private textureLoader: TextureLoader;
    private raycaster: Raycaster;
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

        this.celestialBodies = new Map<string, CelestialObject>();
        this.currentDate = new Date();
        this.ui = new UI();
        this.textureLoader = new TextureLoader();
        this.raycaster = new Raycaster();
    }

    public shootRay(mouseCoords: Vector2, camera: Camera): void {
        this.raycaster.setFromCamera(mouseCoords, camera.getCamera());

        const intersections = this.raycaster.intersectObjects(
            this.group.children,
            true
        );

        for (let intersection of intersections) {
            const selectedObject = intersection.object;

            if (selectedObject.name == "Sun") {
                camera.controls.target = new Vector3(0, 0, 0);
                break;
            }
            if (selectedObject.parent) {
                const celestialBody = this.celestialBodies.get(
                    selectedObject.parent.name
                );

                if (!celestialBody) continue;

                // console.log(celestialBody);

                if (celestialBody.mesh) {
                    camera.controls.target = celestialBody.mesh.position;
                    console.log(camera.controls.getDistance());
                }

                break;
            }
        }
    }

    public async init(): Promise<void> {
        // read SolarPlanet json and create planets with their orbit
        const data = await fetch("./src/assets/data/SolarPlanets.json");
        const json: CelestialWithRingData[] | SolarPlanetData[] =
            await data.json();
        let celestialObject: CelestialObject | CelestialWithRing | null = null;

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
                    celestialObject = new CelestialObject(
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

        this.ui.setDate(this.currentDate);

        for (let [_, celestialBody] of this.celestialBodies) {
            celestialBody.updatePosition(
                this.currentDate,
                deltaTime,
                SETTINGS.simulationSpeed / 86400
            );
        }
    }
}

export default SolarSystem;
