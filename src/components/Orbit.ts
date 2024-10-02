import {
    Line,
    BufferGeometry,
    LineBasicMaterial,
    Vector3,
    Color,
    BufferAttribute,
} from "three";
import CelestialObject from "./CelestialBody";
import {
    calculateEccentricFromMean,
    calculateMeanAnomaly,
    calculateTrueFromEccentric,
} from "../utils/OrbitalCalculations";
import { orbitElements } from "../core/Types";
import { SETTINGS } from "../core/Settings";
import { UnixToJulianDate } from "../utils/DateConverter";

class Orbit {
    public semiMajorAxis: number; // in AU
    public meanAnomaly: number;
    public eccentricity: number;
    public inclination: number;
    public longOfPeri: number;
    public ascendingNode: number;
    public argPeri: number;
    public dataFrom: number;
    public epoch: number;
    public period: number; // in years
    public changesPerCentury: orbitElements | null;
    public currentOrbitElements: orbitElements;
    public celestialObject: CelestialObject;

    public orbitLine: Line;

    private centuriesPast: number;
    private color: Color;
    private layer: number;

    private unhoveredMaterial: LineBasicMaterial;
    private hoveredMaterial: LineBasicMaterial;

    constructor(
        meanAnomaly: number,
        semiMajorAxis: number,
        eccentricity: number,
        longOfPeri: number,
        inclination: number,
        ascentingNode: number,
        period: number,
        dataFrom: Date | number,
        celestialObject: CelestialObject,
        color: string,
        changesPerCentury: orbitElements | null = null,
        layer: number
    ) {
        this.meanAnomaly = meanAnomaly;
        this.celestialObject = celestialObject;
        this.semiMajorAxis = semiMajorAxis;
        this.eccentricity = eccentricity;
        this.inclination = inclination * 0.0174532925; // convert to RAD
        this.longOfPeri = longOfPeri * 0.0174532925; // convert to RAD
        this.ascendingNode = ascentingNode * 0.0174532925; // convert to RAD
        this.argPeri = 0;
        this.layer = layer;

        if (typeof dataFrom == "number") {
            this.dataFrom = dataFrom;
        } else {
            this.dataFrom = UnixToJulianDate(dataFrom);
        }
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

        if (this.changesPerCentury) {
            this.changesPerCentury.inclination *= 0.0174532925;
            this.changesPerCentury.longOfPeri *= 0.0174532925;
            this.changesPerCentury.ascendingNode *= 0.0174532925;
        }

        this.centuriesPast = 0;
        this.color = new Color(color);

        this.unhoveredMaterial = new LineBasicMaterial({
            color: this.color,
            opacity: 0.4,
            transparent: true,
        });

        this.hoveredMaterial = new LineBasicMaterial({
            color: this.color,
            opacity: 1,
            transparent: true,
            linewidth: 10,
        });
    }

    public setEpoch(epoch: number) {
        this.epoch = epoch;

        if (!this.changesPerCentury) return;

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

    public visualize(origin: Vector3 | null = null): void {
        const points: Vector3[] = [];

        let i = 0;
        while (i <= 6.28 + 0.2) {
            points.push(this.calculatePosition(i));

            i += 0.00285;
        }

        const geo = new BufferGeometry().setFromPoints(points);

        this.orbitLine = new Line(geo, this.unhoveredMaterial);
        this.orbitLine.layers.set(this.layer);
        if (origin) this.orbitLine.position.copy(origin);
    }

    public setAsteroidMaterial(): void {
        this.unhoveredMaterial = new LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.5,
        });
        this.hoveredMaterial = new LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 1,
        });

        this.orbitLine.material = this.unhoveredMaterial;
    }

    public trace(): void {
        if (!this.orbitLine) return;

        let startAngle = this.celestialObject.trueAnomaly;

        let angle = startAngle;
        const TAU = Math.PI * 2;
        let offset = 0;
        const step = 0.01745329252;
        const colors: number[] = [];
        let points: Vector3[] = [];
        let opacity: number = 0;
        while (offset < TAU + step) {
            points.push(this.calculatePosition(angle));
            opacity = 1 - offset / TAU - 0.1;
            if (opacity < 0) opacity = 0;
            colors.push(this.color.r, this.color.g, this.color.b, opacity);
            angle = angle - step;
            if (angle < 0) angle += TAU;
            offset += step;
        }

        const colorAttribute = new Float32Array(colors);
        const geo = new BufferGeometry().setFromPoints(points);
        1;

        geo.setAttribute("color", new BufferAttribute(colorAttribute, 4));

        this.orbitLine.geometry.dispose();
        this.orbitLine.geometry = geo;
    }

    public hovered(): void {
        this.orbitLine.material = this.hoveredMaterial;
    }

    public unhovered(): void {
        this.orbitLine.material = this.unhoveredMaterial;
    }

    public calculatePosition(
        uA: number,
        origin: Vector3 | null = null
    ): Vector3 {
        const e = this.currentOrbitElements.eccentricity;
        const a = this.currentOrbitElements.semiMajor;
        const aN = this.currentOrbitElements.ascendingNode;
        const i = this.currentOrbitElements.inclination;
        const pA = this.currentOrbitElements.longOfPeri - aN;
        this.argPeri = pA;

        const scale = 149597870.7 / SETTINGS.DISTANCE_SCALE;
        const theta = uA;
        const sLR = a * (1 - Math.pow(e, 2));
        // const sLR = a * Math.pow(1 - e, 2);
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

        if (origin) pos.add(origin);

        return pos;
    }

    public hide(): void {
        this.orbitLine.visible = false;
    }

    public show(): void {
        this.orbitLine.visible = true;
    }

    public getObject(): Line {
        return this.orbitLine;
    }

    public setFromDate(date: Date, origin: Vector3 | null = null): Vector3 {
        const currentDate = UnixToJulianDate(date);

        this.celestialObject.meanAnomaly = calculateMeanAnomaly(
            this.meanAnomaly,
            this.dataFrom,
            currentDate,
            this.period
        );

        this.setEpoch(currentDate);

        const eccentricAnomaly = calculateEccentricFromMean(
            this.celestialObject.meanAnomaly,
            this.currentOrbitElements.eccentricity
        );
        this.celestialObject.trueAnomaly = calculateTrueFromEccentric(
            eccentricAnomaly,
            this.currentOrbitElements.eccentricity
        );

        if (this.celestialObject.trueAnomaly < 0)
            this.celestialObject.trueAnomaly += Math.PI * 2;

        this.celestialObject.meanMotion = (Math.PI * 2) / (this.period * 365);

        return origin
            ? this.calculatePosition(this.celestialObject.trueAnomaly, origin)
            : this.calculatePosition(this.celestialObject.trueAnomaly);
    }

    public fromMeanAnomaly(
        meanAnomaly: number,
        origin: Vector3 | null = null
    ): Vector3 {
        const eccentricAnomaly = calculateEccentricFromMean(
            meanAnomaly,
            this.currentOrbitElements.eccentricity
        );
        this.celestialObject.trueAnomaly = calculateTrueFromEccentric(
            eccentricAnomaly,
            this.currentOrbitElements.eccentricity
        );

        if (this.celestialObject.trueAnomaly < 0)
            this.celestialObject.trueAnomaly += Math.PI * 2;

        return this.calculatePosition(this.celestialObject.trueAnomaly, origin);
    }
}

export default Orbit;
