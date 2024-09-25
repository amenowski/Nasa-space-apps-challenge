import {
    Group,
    Mesh,
    MeshStandardMaterial,
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
import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";

export default class CelestialBody {
    public name: string;
    public radius: number;
    public trueAnomaly: number;
    public satellites: CelestialBody[] = [];
    public mesh: Mesh | null = null;
    public group: Group;
    protected meanAnomaly: number;
    protected meanMotion: number; // rad per day
    protected textureUrl: string;
    protected orbit: Orbit | null = null;
    protected textureLoader: TextureLoader;
    protected label: CSS2DObject | null = null;

    constructor(
        name: string,
        radius: number,
        textureUrl: string,
        textureLoader: TextureLoader
    ) {
        this.name = name;
        this.radius = radius;
        this.textureUrl = textureUrl;

        this.trueAnomaly = 0;
        this.group = new Group();
        this.meanMotion = 0;
        this.meanAnomaly = 0;
        this.textureLoader = textureLoader;
    }

    public init(date: Date) {
        const div = document.createElement("div");
        div.className = "planet-label";
        div.textContent = this.name;

        const tex = this.textureLoader.load(this.textureUrl);
        const geo = new SphereGeometry(this.radius);
        const mat = new MeshStandardMaterial({ map: tex });
        this.mesh = new Mesh(geo, mat);
        this.mesh.layers.enableAll();
        this.group.name = this.name;

        this.group.add(this.mesh);
        this.label = new CSS2DObject(div);
        this.label.position.set(0, this.radius, 0);
        this.label.layers.set(0);

        this.mesh.add(this.label);

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
            this.mesh.position.copy(
                this.orbit.calculatePosition(this.trueAnomaly)
            );

            this.meanMotion = (Math.PI * 2) / (this.orbit.period * 365);
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
