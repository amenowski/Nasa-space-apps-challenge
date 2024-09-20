import { Group } from "three";
import config from "../config";
import CelestialObject from "./CelestialObject";
import Sun from "./Sun";
import { SolarPlanetData } from "../core/Types";
import Orbit from "./Orbit";

class SolarSystem {
    public group: Group;
    private centralBody: Sun;
    private celestialBodies: Map<string, CelestialObject>;
    constructor() {
        this.group = new Group();
        // create sun
        this.centralBody = new Sun(
            "Sun",
            19891e10,
            69634 / config.SIZE_SCALE,
            "./src/assets/textures/sun.jpg",
            1
        );

        this.centralBody.init();
        this.group.add(this.centralBody.mesh);

        this.celestialBodies = new Map<string, CelestialObject>();
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
                    object.radius / config.SIZE_SCALE,
                    object.textureUrl
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
            object.init();
            this.group.add(object.group);
        }
    }

    public update(): void {
        for (let [_, celestialBody] of this.celestialBodies) {
            celestialBody.updatePosition();
        }
    }
}

export default SolarSystem;
