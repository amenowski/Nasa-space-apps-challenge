import { Line, BufferGeometry, LineBasicMaterial, Vector3 } from "three";
import CelestialObject from "./CelestialBody";
import {
    calculateEccentricFromMean,
    calculateMeanAnomaly,
    calculateTrueFromEccentric,
    UnixToJulianDate,
} from "../utils/OrbitalCalculations";
import { orbitElements } from "../core/Types";
import { SETTINGS } from "../core/Settings";

class Orbit {
    public semiMajorAxis: number; // in AU
    public meanAnomaly: number;
    public eccentricity: number;
    public inclination: number;
    public longOfPeri: number;
    public ascendingNode: number;
    public dataFrom: number;
    public epoch: number;
    public period: number; // in years
    public changesPerCentury: orbitElements;
    public currentOrbitElements: orbitElements;
    public celestialBody: CelestialObject;

    public orbitLine: Line;

    private centuriesPast: number;

    constructor(
        meanAnomaly: number,
        semiMajorAxis: number,
        eccentricity: number,
        longOfPeri: number,
        inclination: number,
        ascentingNode: number,
        period: number,
        dataFrom: Date,
        changesPerCentury: orbitElements,
        celestialBody: CelestialObject
    ) {
        this.meanAnomaly = meanAnomaly;
        this.celestialBody = celestialBody;
        this.semiMajorAxis = semiMajorAxis;
        this.eccentricity = eccentricity;
        this.inclination = inclination * 0.0174532925; // convert to RAD
        this.longOfPeri = longOfPeri * 0.0174532925; // convert to RAD
        this.ascendingNode = ascentingNode * 0.0174532925; // convert to RAD

        this.dataFrom = UnixToJulianDate(dataFrom);
        this.epoch = this.dataFrom;

        this.changesPerCentury = changesPerCentury;
        this.orbitLine = new Line();
        this.period = period;

        this.currentOrbitElements = {
            semiMajor: this.semiMajorAxis,
            ascendingNode: this.ascendingNode,
            eccentricity: this.eccentricity,
            inclination: this.inclination,
            longOfPeri: this.longOfPeri,
        };

        this.changesPerCentury.inclination *= 0.0174532925;
        this.changesPerCentury.longOfPeri *= 0.0174532925;
        this.changesPerCentury.ascendingNode *= 0.0174532925;

        this.centuriesPast = 0;
    }

    public setEpoch(epoch: number) {
        this.epoch = epoch;

        const T = (this.epoch - this.dataFrom) / 36525;
        // console.log(T);
        if (this.centuriesPast != T) {
            this.centuriesPast = T;
            this.currentOrbitElements.eccentricity =
                this.eccentricity + this.changesPerCentury.eccentricity * T;
            this.currentOrbitElements.semiMajor =
                this.semiMajorAxis + this.changesPerCentury.semiMajor * T;
            this.currentOrbitElements.longOfPeri =
                this.longOfPeri + this.changesPerCentury.longOfPeri * T;
            this.currentOrbitElements.ascendingNode =
                this.ascendingNode + this.changesPerCentury.ascendingNode * T;
            this.currentOrbitElements.inclination =
                this.inclination + this.changesPerCentury.inclination * T;
        }
    }

    public visualize(): void {
        const material = new LineBasicMaterial({
            color: 0xffffff,
            opacity: 0.5,
            transparent: true,
        });
        const points: Vector3[] = [];

        let i = 0;
        while (i <= 6.28 + 0.2) {
            points.push(this.calculatePosition(i));

            i += 0.00285;
        }

        const geo = new BufferGeometry().setFromPoints(points);

        this.orbitLine = new Line(geo, material);
    }

    public hovered(): void {
        this.orbitLine.material = new LineBasicMaterial({
            color: 0xff0000,
            opacity: 1,
            transparent: true,
            linewidth: 10,
        });
    }

    public unhovered(): void {
        this.orbitLine.material = new LineBasicMaterial({
            color: 0xffffff,
            opacity: 0.5,
            transparent: true,
        });
    }

    public calculatePosition(uA: number): Vector3 {
        const e = this.currentOrbitElements.eccentricity;
        const a = this.currentOrbitElements.semiMajor;
        const aN = this.currentOrbitElements.ascendingNode;
        const i = this.currentOrbitElements.inclination;
        const pA = this.currentOrbitElements.longOfPeri - aN;

        const scale = 149597870.7 / SETTINGS.DISTANCE_SCALE;
        const theta = uA;
        const sLR = a * Math.pow(1 - e, 2);
        const r = sLR / (1 + e * Math.cos(theta));
        const pos = new Vector3(0, 0, 0);

        pos.x =
            r *
            (Math.cos(pA + theta) * Math.cos(aN) -
                Math.cos(i) * Math.sin(pA + theta) * Math.sin(aN));

        pos.z =
            -r *
            (Math.cos(pA + theta) * Math.sin(aN) +
                Math.cos(i) * Math.sin(pA + theta) * Math.cos(aN));

        pos.y = r * (Math.sin(pA + theta) * Math.sin(i));

        // convert them to km and scale down to simulation
        pos.multiplyScalar(scale);

        return pos;
    }

    public getObject(): Line {
        return this.orbitLine;
    }

    public setFromDate(date: Date): void {
        const currentDate = UnixToJulianDate(date);

        this.celestialBody.meanAnomaly = calculateMeanAnomaly(
            this.meanAnomaly,
            this.dataFrom,
            currentDate,
            this.period
        );

        this.setEpoch(currentDate);

        const eccentricAnomaly = calculateEccentricFromMean(
            this.celestialBody.meanAnomaly,
            this.currentOrbitElements.eccentricity
        );
        this.celestialBody.trueAnomaly = calculateTrueFromEccentric(
            eccentricAnomaly,
            this.currentOrbitElements.eccentricity
        );

        if (this.celestialBody.trueAnomaly < 0)
            this.celestialBody.trueAnomaly += Math.PI * 2;
        this.celestialBody.mesh!.position.copy(
            this.calculatePosition(this.celestialBody.trueAnomaly)
        );

        this.celestialBody.meanMotion = (Math.PI * 2) / (this.period * 365);
    }

    public fromMeanAnomaly(meanAnomaly: number): void {
        const eccentricAnomaly = calculateEccentricFromMean(
            meanAnomaly,
            this.currentOrbitElements.eccentricity
        );
        this.celestialBody.trueAnomaly = calculateTrueFromEccentric(
            eccentricAnomaly,
            this.currentOrbitElements.eccentricity
        );

        if (this.celestialBody.trueAnomaly < 0)
            this.celestialBody.trueAnomaly += Math.PI * 2;
        this.celestialBody.mesh!.position.copy(
            this.calculatePosition(this.celestialBody.trueAnomaly)
        );
    }
}

export default Orbit;
