import { Group } from "three";
import config from "../config";
import CelestialObject from "./CelestialObject";
import Sun from "./Sun";

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
            696340 / config.SIZE_SCALE,
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

    public init(): void {
        //init all planets
        this.centralBody.init();
        for (let [_, celestialBody] of this.celestialBodies) {
            celestialBody.init();
            if (celestialBody.mesh != null) {
                console.log("added");
                this.group.add(celestialBody.mesh);
            }
        }
    }
}

export default SolarSystem;
