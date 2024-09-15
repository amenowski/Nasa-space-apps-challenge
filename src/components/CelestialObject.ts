import {
    Group,
    Mesh,
    MeshBasicMaterial,
    SphereGeometry,
    Vector3,
    TextureLoader,
} from "three";
import Orbit from "./Orbit";

class CelestialObject {
    public name: string;
    public radius: number;
    public position: Vector3;
    public satellites: CelestialObject[] = [];
    public speed: number;
    public distanceFromSun: number;
    public mesh: Mesh | null = null;
    public group: Group;
    private textureUrl: string;
    private orbit: Orbit | null = null;

    constructor(
        name: string,
        radius: number,
        textureUrl: string,
        speed: number,
        distanceFromSun: number
    ) {
        this.name = name;
        this.radius = radius;
        this.textureUrl = textureUrl;
        this.speed = speed;
        this.distanceFromSun = distanceFromSun;

        this.position = new Vector3(radius, 0, 0);
        this.group = new Group();
    }

    public init() {
        const tex = new TextureLoader().load(this.textureUrl);
        const geo = new SphereGeometry(this.radius);
        const mat = new MeshBasicMaterial({ map: tex });

        this.mesh = new Mesh(geo, mat);
        this.group.add(this.mesh);

        this.mesh.position.copy(this.position);
        // this.group.position.set(this.distanceFromSun, 0, 0);
    }

    public setOrbit(orbit: Orbit) {
        this.orbit = orbit;
        this.orbit.visualize();
        this.group.add(this.orbit.orbitLine);
        const orbitGeo = this.orbit.orbitLine.geometry;

        this.position.copy(
            new Vector3().fromBufferAttribute(orbitGeo.attributes.position, 0)
        );

        console.log(this.orbit.orbitLine);
    }

    public updatePosition(): void {}
}

export default CelestialObject;
