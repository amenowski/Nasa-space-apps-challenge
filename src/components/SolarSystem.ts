import { Group, TextureLoader } from "three";
import CelestialObject from "./CelestialObject";
import Sun from "./Sun";
import { SolarPlanetData } from "../core/Types";
import Orbit from "./Orbit";
import { UI } from "../core/UI";
import { SETTINGS } from "../core/Settings";

class SolarSystem {
    public group: Group;
    private centralBody: Sun;
    private celestialBodies: Map<string, CelestialObject>;
    private currentDate: Date;
    private ui: UI;
    private textureLoader: TextureLoader;
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
    }

    public addCelestialBody(body: CelestialObject) {
        // add to the arrray
        this.celestialBodies.set(body.name, body);
    }

    public async init(): Promise<void> {
        // read SolarPlanet json and create planets with their orbit
        const data = await fetch("./src/assets/data/SolarPlanets.json");
        const json: SolarPlanetData[] = await data.json();

        for (let object of json) {
            if (object.type == "Planet") {
                const celestialObject = new CelestialObject(
                    object.name,
                    object.radius / SETTINGS.SIZE_SCALE,
                    object.textureUrl,
                    this.textureLoader
                );

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
