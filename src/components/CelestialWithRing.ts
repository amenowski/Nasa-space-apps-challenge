import {
    DoubleSide,
    Mesh,
    MeshStandardMaterial,
    SphereGeometry,
    TextureLoader,
} from "three";
import CelestialObject from "./CelestialBody";
import { PlanetRingGeometry } from "../utils/PlanetRingGeometry";
import SolarSystem from "./SolarSystem";

export default class CelestialWithRing extends CelestialObject {
    private ring: Mesh | null = null;
    private ringStart: number = 0;
    private ringEnd: number = 0;
    private ringTextureUrl: string;

    constructor(
        system: SolarSystem,
        name: string,
        radius: number,
        ringStart: number,
        ringEnd: number,
        textureUrl: string,
        ringTexture: string,
        textureLoader: TextureLoader
    ) {
        super(system, name, radius, textureUrl, textureLoader);
        this.ringTextureUrl = ringTexture;
        this.ringStart = ringStart;
        this.ringEnd = ringEnd;
    }

    public init(date: Date) {
        const tex = this.textureLoader.load(this.textureUrl);
        const geo = new SphereGeometry(this.radius);
        const mat = new MeshStandardMaterial({
            map: tex,
        });

        this.mesh = new Mesh(geo, mat);
        this.mesh.layers.enableAll();
        this.mesh.name = this.name;

        this.group.add(this.mesh);

        this.createRing();
        this.createLabel();
        if (this.orbit) {
            this.orbit.setFromDate(date);
        }
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
