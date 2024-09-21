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
    private meanAnomaly: number;
    private meanMotion: number; // rad per day
    private textureUrl: string;
    private orbit: Orbit | null = null;

    constructor(name: string, radius: number, textureUrl: string) {
        this.name = name;
        this.radius = radius;
        this.textureUrl = textureUrl;

        this.trueAnomaly = 0;
        this.group = new Group();
        this.meanMotion = 0;
        this.meanAnomaly = 0;
    }

    public init(date: Date) {
        const tex = new TextureLoader().load(this.textureUrl);
        const geo = new SphereGeometry(this.radius);
        const mat = new MeshBasicMaterial({ map: tex });
        this.mesh = new Mesh(geo, mat);
        this.group.add(this.mesh);

        if (this.orbit) {
            const currentDate = UnixToJulianDate(date);

            this.meanAnomaly = calculateMeanAnomaly(
                this.orbit.meanAnomaly,
                currentDate,
                this.orbit.period
            );

            this.orbit.setEpoch(currentDate);

            const eccentricAnomaly = calculateEccentricFromMean(
                this.meanAnomaly,
                this.orbit.currentOrbitElements.eccentricity
            );
            this.trueAnomaly = calculateTrueFromEccentric(
                eccentricAnomaly,
                this.orbit.currentOrbitElements.eccentricity
            );

            if (this.trueAnomaly < 0) this.trueAnomaly += Math.PI * 2;
            // console.log(`${this.name} = ${eccentricAnomaly} |
            //      ${this.orbit.currentOrbitElements.eccentricity} | ${this.trueAnomaly}`);

            this.mesh.position.copy(
                this.orbit.calculatePosition(this.trueAnomaly)
            );

            this.meanMotion = (Math.PI * 2) / (this.orbit.period * 365);

            console.log(`${this.name} = ${this.meanMotion}`);
        }
    }

    public setOrbit(orbit: Orbit) {
        this.orbit = orbit;
        this.orbit.visualize();
        this.group.add(this.orbit.orbitLine);
    }

    public updatePosition(
        date: Date,
        deltaTime: number,
        daysPerSec: number
    ): void {
        if (this.mesh && this.orbit) {
            const currentDate = UnixToJulianDate(date);

            this.meanAnomaly =
                this.meanAnomaly + this.meanMotion * deltaTime * daysPerSec;
            this.meanAnomaly = this.meanAnomaly % (Math.PI * 2);

            this.orbit.setEpoch(currentDate);

            const eccentricAnomaly = calculateEccentricFromMean(
                this.meanAnomaly,
                this.orbit.currentOrbitElements.eccentricity
            );
            this.trueAnomaly = calculateTrueFromEccentric(
                eccentricAnomaly,
                this.orbit.currentOrbitElements.eccentricity
            );

            if (this.trueAnomaly < 0) this.trueAnomaly += Math.PI * 2;
            // console.log(`${this.name} = ${eccentricAnomaly} |
            //      ${this.orbit.currentOrbitElements.eccentricity} | ${this.trueAnomaly}`);

            this.mesh.position.copy(
                this.orbit.calculatePosition(this.trueAnomaly)
            );
        }
    }
}

export default CelestialObject;
