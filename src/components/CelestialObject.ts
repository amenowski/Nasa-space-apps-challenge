import {
    Group,
    Mesh,
    MeshBasicMaterial,
    SphereGeometry,
    TextureLoader,
    Vector3,
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
    public speed: number;
    public mesh: Mesh | null = null;
    public group: Group;
    private textureUrl: string;
    private orbit: Orbit | null = null;

    constructor(
        name: string,
        radius: number,
        textureUrl: string,
        speed: number
    ) {
        this.name = name;
        this.radius = radius;
        this.textureUrl = textureUrl;
        this.speed = speed;

        this.trueAnomaly = 0;
        this.group = new Group();
    }

    public init() {
        const tex = new TextureLoader().load(this.textureUrl);
        const geo = new SphereGeometry(this.radius);
        const mat = new MeshBasicMaterial({ map: tex });

        this.mesh = new Mesh(geo, mat);
        this.group.add(this.mesh);

        if (this.orbit) {
            const jd1 = UnixToJulianDate(new Date("2024-01-01"));
            const jd = UnixToJulianDate(new Date());
            // console.log();

            const meanAnomaly = calculateMeanAnomaly(jd);
            const eccentricAnomaly = calculateEccentricFromMean(
                meanAnomaly,
                this.orbit.eccentricity
            );
            this.trueAnomaly = calculateTrueFromEccentric(
                eccentricAnomaly,
                this.orbit.eccentricity
            );
            if (this.trueAnomaly < 0) this.trueAnomaly += Math.PI * 2;
            // console.log(meanAnomaly, eccentricAnomaly, this.trueAnomaly);
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
