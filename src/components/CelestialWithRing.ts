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
        obliquity: number,
        sidRotPerSec: number,
        color: string,
        ringStart: number,
        ringEnd: number,
        textureUrl: string,
        ringTexture: string,
        textureLoader: TextureLoader,
        layer: number
    ) {
        super(
            system,
            name,
            radius,
            obliquity,
            sidRotPerSec,
            color,
            textureUrl,
            textureLoader,
            layer
        );
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
        // this.mesh.layers.enableAll();
        this.mesh.layers.set(0);
        this.mesh.name = this.name;
        this.mesh.rotation.z = -this.obliquity * 0.0174532925;

        this.group.add(this.mesh);
        this.group.layers.set(0);

        this.createRing();
        this.createLabel();
        this.createIcon();
        if (this.orbit) {
            this.orbit.setFromDate(date);
        }
    }

    public updateRing(): void {
        this.ring!.position.copy(this.mesh!.position.clone());
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
        this.ring.layers.set(0);

        if (this.mesh) {
            this.group.add(this.ring);
            // this.mesh.add(this.ring);
            this.ring.rotation.x = -Math.PI / 2 - 0.471239;
            // this.ring.rotation.y = -this.mesh.rotation.y;
            this.ring.position.copy(this.mesh.position.clone());
        }
    }
}
