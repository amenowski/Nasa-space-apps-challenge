import { Line, EllipseCurve, BufferGeometry, LineBasicMaterial } from "three";
import CelestialObject from "./CelestialObject";

class Orbit {
    public semiMajorAxis: number;
    public eccentricity: number;
    public inclination: number;
    public periapsis: number;
    public apoapsis: number;
    public centralBody: CelestialObject;

    private orbitLine: Line;

    constructor(
        semiMajorAxis: number,
        eccentricity: number,
        periapsis: number,
        apoapsis: number,
        inclination: number,
        centralBody: CelestialObject
    ) {
        this.centralBody = centralBody;
        this.semiMajorAxis = semiMajorAxis;
        this.eccentricity = eccentricity;
        this.inclination = inclination;
        this.periapsis = periapsis;
        this.apoapsis = apoapsis;

        const curve = new EllipseCurve(
            this.centralBody.position.x,
            this.centralBody.position.y,
            periapsis,
            apoapsis,
            0,
            Math.PI * 2
        );

        this.orbitLine = new Line(
            new BufferGeometry().setFromPoints(curve.getSpacedPoints(100)),
            new LineBasicMaterial({ color: 0xfefefe })
        );

        this.orbitLine.rotation.x = -Math.PI / 2;

        this.centralBody.group.add(this.orbitLine);
    }

    public calculatePosition(): number {
        return 0;
    }

    public calculateAngularVelocity(): void {}

    public getObject(): Line {
        return this.orbitLine;
    }
}

export default Orbit;
