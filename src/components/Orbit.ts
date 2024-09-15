import { Line, BufferGeometry, LineBasicMaterial, Vector3 } from "three";
import CelestialObject from "./CelestialObject";
import config from "../config";

class Orbit {
    public semiMajorAxis: number; // in AU
    public eccentricity: number; // in RAD
    public inclination: number; // deg
    public periapsis: number; // deg
    public ascendingNode: number; // deg
    // public apoapsis: number;
    public centralBody: CelestialObject;

    public orbitLine: Line;

    constructor(
        semiMajorAxis: number,
        eccentricity: number,
        periapsis: number,
        // apoapsis: number,
        inclination: number,
        ascentingNode: number,
        centralBody: CelestialObject
    ) {
        this.centralBody = centralBody;
        this.semiMajorAxis = semiMajorAxis;
        this.eccentricity = eccentricity;
        this.inclination = inclination * 0.01745329; // convert to RAD
        this.periapsis = periapsis * 0.01745329; // convert to RAD
        this.ascendingNode = ascentingNode * 0.01745329; // convert to RAD
        // this.apoapsis = apoapsis;

        this.orbitLine = new Line();
    }

    public visualize(): void {
        const material = new LineBasicMaterial({ color: 0xffffff });
        const points: Vector3[] = [];

        let i = 0;
        while (i <= 6.28) {
            points.push(this.calculatePosition(i));

            i += 0.0785;
        }

        console.log(points);

        const geo = new BufferGeometry().setFromPoints(points);

        this.orbitLine = new Line(geo, material);
    }

    public calculatePosition(uA: number): Vector3 {
        const theta = uA;
        const sLR = this.semiMajorAxis * ((1 - this.eccentricity) ^ 2);
        const r = sLR / (1 + this.eccentricity * Math.cos(theta));
        const pos = new Vector3(0, 0, 0);

        pos.x =
            r *
            (Math.cos(this.periapsis + theta) * Math.cos(this.ascendingNode) -
                Math.cos(this.inclination) *
                    Math.sin(this.periapsis + theta) *
                    Math.sin(this.ascendingNode));

        pos.z =
            r *
            (Math.cos(this.periapsis + theta) * Math.sin(this.ascendingNode) +
                Math.cos(this.inclination) *
                    Math.sin(this.periapsis + theta) *
                    Math.cos(this.ascendingNode));

        pos.y =
            r * (Math.sin(this.periapsis + theta) * Math.sin(this.inclination));

        // convert them to km and scale down to simulation ratio
        pos.x *= 149597870.7 / config.DISTANCE_SCALE;
        pos.y *= 149597870.7 / config.DISTANCE_SCALE;
        pos.z *= 149597870.7 / config.DISTANCE_SCALE;

        return pos;
    }

    public getObject(): Line {
        return this.orbitLine;
    }
}

export default Orbit;
