export interface orbitElements {
    semiMajor: number;
    eccentricity: number;
    inclination: number;
    longOfPeri: number;
    ascendingNode: number;
}

export interface orbitData {
    semiMajor: number;
    eccentricity: number;
    inclination: number;
    longOfPeri: number;
    ascendingNode: number;
    meanAnomaly: number;
    period: number;
    dataFrom: string;
    changesPerCentury: orbitElements;
}

export interface SolarPlanetData {
    type: string;
    name: string;
    textureUrl: string;
    radius: number;
    color: string;
    orbit: orbitData;
    obliquity: number;
    sidRotPerSec: number;
}

export interface SatellitesData extends SolarPlanetData {
    centerBody: string;
}

export interface CelestialWithRingData extends SolarPlanetData {
    ringStart: number;
    ringEnd: number;
    ringTexture: string;
}

export interface OrbitElement {
    units: string | null;
    label: string;
    sigma: string;
    value: string;
    name: string;
    title: string;
}

export interface Orbit {
    equinox: string;
    n_dop_obs_used: number;
    cov_epoch: string;
    producer: string;
    n_del_obs_used: number;
    pe_used: string;
    last_obs: string;
    data_arc: string;
    comment: string | null;
    sb_used: string;
    not_valid_before: string | null;
    moid_jup: string;
    orbit_id: string;
    t_jup: string;
    elements: OrbitElement[];
    epoch: string;
    two_body: string | null;
    not_valid_after: string | null;
    model_pars: any[];
    source: string;
    rms: string;
    soln_date: string;
    n_obs_used: number;
    moid: string;
    condition_code: string;
    first_obs: string;
}

export interface ObjectOrbitClass {
    name: string;
    code: string;
}

export interface ObjectData {
    neo: boolean;
    spkid: string;
    orbit_id: string;
    orbit_class: ObjectOrbitClass;
    pha: boolean;
    prefix: string | null;
    shortname: string;
    kind: string;
    des: string;
    fullname: string;
}

export interface Signature {
    version: string;
    source: string;
}

export interface CloseApproachData {
    v_rel: string;
    sigma_t: string;
    cd: string;
    dist_min: string;
    orbit_ref: string;
    dist_max: string;
    body: string;
    dist: string;
    v_inf: string;
}

export interface PhysicalParameter {
    title: string;
    name: string;
    units: string | null;
    ref: string;
    value: string;
    sigma: string | null;
    desc: string;
    notes: string | null;
}

export interface SDBD_RESPONSE {
    orbit: Orbit;
    object: ObjectData;
    signature: Signature;
    ca_data: CloseApproachData[];
    phys_par: PhysicalParameter[];
}
