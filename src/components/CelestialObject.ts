import {
    Group,
    Mesh,
    MeshBasicMaterial,
    SphereGeometry,
    TextureLoader,
} from "three";
import Orbit from "./Orbit";
import {
    calculateEccentricFromMean,
    calculateMeanAnomaly,
    calculateTrueFromEccentric,
    UnixToJulianDate,
} from "../utils/OrbitalCalculations";

class CelestialObject {
    public name: string;
    public radius: number;
    public trueAnomaly: number;
    public satellites: CelestialObject[] = [];
    public mesh: Mesh | null = null;
    public group: Group;
    private textureUrl: string;
    private orbit: Orbit | null = null;

    constructor(name: string, radius: number, textureUrl: string) {
        this.name = name;
        this.radius = radius;
        this.textureUrl = textureUrl;

        this.trueAnomaly = 0;
        this.group = new Group();
    }

    public init() {
        const tex = new TextureLoader().load(this.textureUrl);
        const geo = new SphereGeometry(this.radius);
        const mat = new MeshBasicMaterial({ map: tex });
        const toDeg = 180 / Math.PI;
        this.mesh = new Mesh(geo, mat);
        this.group.add(this.mesh);

        if (this.orbit) {
            const jd = UnixToJulianDate(new Date("2000-01-01"));
            const currentDate = UnixToJulianDate(new Date());

            const meanAnomaly = calculateMeanAnomaly(
                this.orbit.meanAnomaly,
                jd,
                this.orbit.period
            );

            console.log(meanAnomaly * toDeg);

            // console.log(meanAnomaly * toDeg);
            this.orbit.setEpoch(jd);

            const eccentricAnomaly = calculateEccentricFromMean(
                meanAnomaly,
                this.orbit.currentOrbitElements.eccentricity
            );
            this.trueAnomaly = calculateTrueFromEccentric(
                eccentricAnomaly,
                this.orbit.currentOrbitElements.eccentricity
            );

            if (this.trueAnomaly < 0) this.trueAnomaly += Math.PI * 2;
            console.log(`${this.name} = ${this.trueAnomaly}`);

            this.mesh.position.copy(
                this.orbit.calculatePosition(this.trueAnomaly)
            );
        }
    }

    public setOrbit(orbit: Orbit) {
        this.orbit = orbit;
        this.orbit.visualize();
        this.group.add(this.orbit.orbitLine);
    }

    public updatePosition(): void {
        this.trueAnomaly += 0.002;

        if (this.mesh && this.orbit) {
            this.mesh.position.copy(
                this.orbit.calculatePosition(this.trueAnomaly)
            );
        }
    }
}

export default CelestialObject;
