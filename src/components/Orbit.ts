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
        apoapsis: number
    ) {
        // const curve = new EllipseCurve(
        //     x,
        //     y,
        //     perigee,
        //     apogee,
        //     0,
        //     Math.PI * 2,
        //     true
        // );
        // this.orbitLine = new Line(
        //     new BufferGeometry().setFromPoints(curve.getSpacedPoints(100)),
        //     new LineBasicMaterial({ color: 0xfefefe })
        // );
        // this.orbitLine.rotation.x = -Math.PI / 2;
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
