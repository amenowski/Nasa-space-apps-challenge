export function calculateMeanAnomaly(
    m0: number,
    jd0: number,
    jd: number,
    period: number
): number {
    const TAU = Math.PI * 2;
    const n = TAU / (period * 365); // rad per day;
    let meanAnomaly = m0 + n * (jd - jd0);
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
