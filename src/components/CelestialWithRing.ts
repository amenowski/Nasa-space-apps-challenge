import {
    DoubleSide,
    Mesh,
    MeshStandardMaterial,
    SphereGeometry,
    TextureLoader,
    Vector3,
} from "three";
import CelestialObject from "./CelestialObject";
import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import {
    UnixToJulianDate,
    calculateMeanAnomaly,
    calculateEccentricFromMean,
    calculateTrueFromEccentric,
} from "../utils/OrbitalCalculations";
import { PlanetRingGeometry } from "../utils/PlanetRingGeometry";

export default class CelestialWithRing extends CelestialObject {
    private ring: Mesh | null = null;
    private ringStart: number = 0;
    private ringEnd: number = 0;
    private ringTextureUrl: string;

    constructor(
        name: string,
        radius: number,
        ringStart: number,
        ringEnd: number,
        textureUrl: string,
        ringTexture: string,
        textureLoader: TextureLoader
    ) {
        super(name, radius, textureUrl, textureLoader);
        this.ringTextureUrl = ringTexture;
        this.ringStart = ringStart;
        this.ringEnd = ringEnd;
    }

    public init(date: Date) {
        const div = document.createElement("div");
        div.className = "planet-label";
        div.textContent = this.name;

        const tex = this.textureLoader.load(this.textureUrl);
        const geo = new SphereGeometry(this.radius);
        const mat = new MeshStandardMaterial({
            map: tex,
        });

        this.mesh = new Mesh(geo, mat);
        this.mesh.layers.enableAll();

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

        this.createRing();
    }
    private createRing(): void {
        const tex = this.textureLoader.load(this.ringTextureUrl);

        const geo = new PlanetRingGeometry(this.ringStart, this.ringEnd);
        const mat = new MeshStandardMaterial({
            map: tex,
            transparent: true,
            side: DoubleSide,
            opacity: 0.87,
        });
        this.ring = new Mesh(geo, mat);

        this.ring.rotation.x = Math.PI / 2;
        this.ring.rotation.y = 0.471239;

        if (this.mesh) {
            this.mesh.add(this.ring);
        }
    }
}
