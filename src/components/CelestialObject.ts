import { Mesh, Vector3 } from "three";
import Orbit from "./Orbit";

class CelestialObject {
    public name: string;
    public radius: number;
    public position: Vector3;
    public satellites: CelestialObject[] = [];
    public speed: number;
    public mesh: Mesh;
    private textureUrl: string;
    private orbits: Orbit | null = null;

    constructor(name: string, radius: number, textureUrl: string) {
        this.name = name;
        this.radius = radius;
        this.textureUrl = textureUrl;
    }

    public init() {}

    public addOrbit(orbit: Orbit) {}

    public updatePosition(): void {}
}

export default CelestialObject;
