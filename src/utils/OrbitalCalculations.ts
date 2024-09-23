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
}

export function calculateMeanAnomaly(
    m0: number,
    jd: number,
    period: number
): number {
    const TAU = Math.PI * 2;
    const n = TAU / (period * 365); // rad per day;
    let meanAnomaly = m0 + n * (jd - 2451545);
    meanAnomaly = meanAnomaly % TAU;
    // if (meanAnomaly > Math.PI) meanAnomaly -= TAU;
    return meanAnomaly;
}

export function calculateEccentricFromMean(
    meanAnomaly: number,
    eccentricity: number
): number {
    let eccentricAnomaly = meanAnomaly;
    let n = 0;
    while (true || n < 20) {
        let delta =
            eccentricAnomaly -
            eccentricity * Math.sin(eccentricAnomaly) -
            meanAnomaly;

        if (Math.abs(delta) < 1e-6) break;

        eccentricAnomaly =
            eccentricAnomaly -
            delta / (1 - eccentricity * Math.cos(eccentricAnomaly));
        n++;
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
