import { Vector3 } from "three";

export function UnixToJulianDate(d: Date) {
    var year = d.getFullYear();
    var month = d.getMonth() + 1;
    var day = d.getDate();
    var a = Math.floor((14 - month) / 12);
    var y = Math.floor(year + 4800 - a);
    var m = month + 12 * a - 3;
    var JDN =
        day +
        Math.floor((153 * m + 2) / 5) +
        365 * y +
        Math.floor(y / 4) -
        Math.floor(y / 100) +
        Math.floor(y / 400) -
        32045;
    return JDN;

    return timestamp / 86400000 + 2440587.5;
}

export function calculateMeanAnomaly(jd: number): number {
    const TAU = Math.PI * 2;
    let period = 1; // in years;
    const n = TAU / (period * 365); // deg per day;
    let meanAnomaly = 6.2398516 + n * (jd - 2451545);
    meanAnomaly = meanAnomaly % TAU;
    // if (meanAnomaly > Math.PI) meanAnomaly -= TAU;

    return meanAnomaly;
}

export function calculateEccentricFromMean(
    meanAnomaly: number,
    eccentricity: number
): number {
    let eccentricAnomaly = meanAnomaly;

    while (true) {
        let delta =
            eccentricAnomaly -
            eccentricity * Math.sin(eccentricAnomaly) -
            meanAnomaly;

        if (Math.abs(delta) < 1e-6) break;

        eccentricAnomaly =
            eccentricAnomaly -
            delta / (1 - eccentricity * Math.cos(eccentricAnomaly));
    }

    return eccentricAnomaly;
}

export function calculateTrueFromEccentric(
    eccentricAnomaly: number,
    eccentricity: number
): number {
    return (
        2 *
        Math.atan(
            Math.sqrt((1 + eccentricity) / (1 - eccentricity)) *
                Math.tan(eccentricAnomaly / 2)
        )
    );
}

export function computePlanetPosition(jd: number): Vector3 {
    const toRad = Math.PI / 180;
    const T = (jd - 2451545.0) / 36525;
    let semiMajorAxis = 1.00000261; // in au
    let eccentricity = 0.01671123 * T; // in rad;
    let inclination = -0.00001531; // in deg
    let meanLongtitude = 100.46457166 * T; // in deg
    let longOfPeri = 102.93768193 * T; // in deg
    let ascendingNode = 0.0; // in deg

    let argOfPeri = longOfPeri - ascendingNode;
    let meanAnomaly = meanLongtitude - longOfPeri;
    //todo: there will be computations for jupiter, satrun, uranus, neptune

    while (meanAnomaly > 180) meanAnomaly -= 360;

    // console.log(meanAnomaly * toRad);

    let eccentricAnomaly =
        meanAnomaly + 57.29578 * eccentricity * Math.sin(meanAnomaly * toRad);
    let dE = 1;
    let n = 0;

    while (Math.abs(dE) > 1e-7 && n < 10) {
        dE = solveKepler(meanAnomaly, eccentricity, eccentricAnomaly);
        eccentricAnomaly += dE;
        n++;
    }

    //eccentric to true

    const trueAnomaly =
        2 *
        Math.atan(
            Math.sqrt((1 + eccentricity) / (1 - eccentricity)) *
                Math.tan(eccentricAnomaly / 2)
        );

    console.log(trueAnomaly);

    const xp =
        semiMajorAxis * (Math.cos(eccentricAnomaly * toRad) - eccentricity);
    const yp =
        semiMajorAxis *
        Math.sqrt(1 - eccentricity * eccentricity) *
        Math.sin(eccentricAnomaly * toRad);

    semiMajorAxis *= toRad;
    eccentricity *= toRad;
    inclination *= toRad;
    meanLongtitude *= toRad;
    argOfPeri *= toRad;
    ascendingNode *= toRad;

    const xecl =
        (Math.cos(argOfPeri) * Math.cos(ascendingNode) -
            Math.sin(argOfPeri) *
                Math.sin(ascendingNode) *
                Math.cos(inclination)) *
            xp +
        (-Math.sin(argOfPeri) * Math.cos(ascendingNode) -
            Math.cos(argOfPeri) *
                Math.sin(ascendingNode) *
                Math.cos(inclination)) *
            yp;
    const yecl =
        (Math.cos(argOfPeri) * Math.sin(ascendingNode) +
            Math.sin(argOfPeri) *
                Math.cos(ascendingNode) *
                Math.cos(inclination)) *
            xp +
        (-Math.sin(argOfPeri) * Math.sin(ascendingNode) +
            Math.cos(argOfPeri) *
                Math.cos(ascendingNode) *
                Math.cos(inclination)) *
            yp;
    const zecl =
        Math.sin(argOfPeri) * Math.sin(inclination) * xp +
        Math.cos(argOfPeri) * Math.sin(inclination) * yp;

    const eps = 23.43928 * toRad;

    const x = xecl;
    const y = Math.cos(eps) * yecl - Math.sin(eps) * zecl;
    const z = Math.sin(eps) * yecl + Math.cos(eps) * zecl;

    return new Vector3(x, z, y);
}

function solveKepler(M: number, e: number, E: number): number {
    const toRad = Math.PI / 180;

    const dM = M - (E - (e / toRad) * Math.sin(E * toRad));
    const dE = dM / (1 - e * Math.cos(E * toRad));

    return dE;
}
