import CelestialObject from "./CelestialObject";
import Sun from "./Sun";

class SolarSystem {
    private centralBody: Sun; // it's will be sun
    private celestialBodies: CelestialObject[] = [];
    constructor() {
        // create sun
        this.centralBody = new Sun(
            "Sun",
            19891e10,
            696340,
            "./src/textures/sun.jpg",
            1
        );
    }

    public addCelestialBody() {
        // add to the arrray
    }

    public init(): void {
        //init all planets
        this.centralBody.init();
        for (let celestialbody of this.celestialBodies) {
            celestialbody.init();
        }
    }
}

export default SolarSystem;
