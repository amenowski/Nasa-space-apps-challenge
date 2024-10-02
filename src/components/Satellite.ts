import {
    Mesh,
    MeshStandardMaterial,
    SphereGeometry,
    TextureLoader,
} from "three";
import CelestialBody from "./CelestialBody";
import SolarSystem from "./SolarSystem";
import Orbit from "./Orbit";

export default class Satellite extends CelestialBody {
    private centerBody: CelestialBody;

    constructor(
        system: SolarSystem,
        name: string,
        radius: number,
        obliquity: number,
        sidRotPerSec: number,
        color: string,
        textureUrl: string,
        textureLoader: TextureLoader,
        centerBody: CelestialBody,
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

        this.centerBody = centerBody;
        this.type = "Satellite";
    }

    public init(date: Date): void {
        this.mesh = new Mesh();

        const tex = this.textureLoader.load(this.textureUrl);
        const geo = new SphereGeometry(this.radius);
        const mat = new MeshStandardMaterial({ map: tex });
        this.mesh = new Mesh(geo, mat);
        this.mesh.layers.set(2);

        this.mesh.name = this.name;
        this.mesh.rotation.z = -this.obliquity * 0.0174532925;

        this.group.add(this.mesh);
        this.createLabel();
        this.createIcon();
        if (this.orbit)
            this.mesh.position.copy(
                this.orbit.setFromDate(date, this.centerBody.mesh!.position)
            );

        this.hideAdditionalInfo();
        this.centerBody.addSatellite(this);
    }

    public setOrbit(orbit: Orbit): void {
        this.orbit = orbit;
        if (this.centerBody.mesh)
            this.orbit.visualize(this.centerBody.mesh.position);

        this.group.add(this.orbit.orbitLine);
    }

    public updatePosition(
        date: Date,
        deltaTime: number,
        daysPerSec: number
    ): void {
        this.rotateObject(date);
        if (this.orbit) {
            this.meanAnomaly =
                this.meanAnomaly + this.meanMotion * deltaTime * daysPerSec;
            this.meanAnomaly = this.meanAnomaly % (Math.PI * 2);

            this.mesh!.position.copy(
                this.orbit.fromMeanAnomaly(
                    this.meanAnomaly,
                    this.centerBody.mesh!.position
                )
            );
            this.orbit!.orbitLine.position.copy(this.centerBody.mesh!.position);
        }
    }

    public hideAdditionalInfo(): void {
        if (this.label) this.label.visible = false;
        if (this.icon) this.icon.visible = false;
        if (this.orbit?.orbitLine) this.orbit.orbitLine.visible = false;
    }

    public showAdditionalInfo(): void {
        // if (this.type == "Satellite") console.log("show");
        if (this.hidden) return;

        if (this.label) this.label.visible = true;
        if (this.icon) this.icon.visible = true;
        if (this.orbit?.orbitLine) this.orbit.orbitLine.visible = true;
    }
}
