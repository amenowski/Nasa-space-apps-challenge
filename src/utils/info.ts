import CelestialBody from "../components/CelestialBody";
import { AdditionalInfo } from "../core/Types";

type infoRespond = {
    description: string;
    type: string;
};

export async function loadInfo(object: CelestialBody): Promise<infoRespond> {
    let description = "";
    let type = "";
    if (object.type == "Planet") {
        const respond: infoRespond = await loadPlanetInfo(object.name);
        description = respond.description;
        type = respond.type;
    } else if (object.type == "PHA") {
        const respond: infoRespond = await loadPHAinfo(object.name);
        description = respond.description;
        type = respond.type;
    } else if (object.type == "NEO") {
        const respond: infoRespond = await loadNEOinfo(object.name);
        description = respond.description;
        type = respond.type;
    }

    if (description == "") {
        const respond: infoRespond = await loadCometinfo(object.name);
        description = respond.description;
        type = respond.type;
    }

    return { description, type };
}

async function loadPlanetInfo(name: string): Promise<infoRespond> {
    let description = "";
    let type = "Planet";
    const data = await fetch("./src/assets/data/planets_info.json");
    const json: AdditionalInfo[] = await data.json();

    for (let info of json) {
        if (info.name == name) {
            description = info.description;
            break;
        }
    }
    return { description, type };
}

async function loadPHAinfo(name: string): Promise<infoRespond> {
    let description = "";
    let type = "Asteroid (PHA)";
    const data = await fetch("./src/assets/data/pha_info.json");
    const json: AdditionalInfo[] = await data.json();

    const patterns = name.split("(").map((item) => item.trim());

    const regExp = new RegExp(patterns.join("|").replace(/[{()}]/g, ""), "gi");

    for (let info of json) {
        if (regExp.test(info.name)) {
            description = info.description;
            break;
        }
    }
    return { description, type };
}

async function loadNEOinfo(name: string): Promise<infoRespond> {
    let description = "";
    let type = "Asteroid (NEO)";
    const data = await fetch("./src/assets/data/neo_info.json");
    const json: AdditionalInfo[] = await data.json();

    const patterns = name.split("(").map((item) => item.trim());
    const regExp = new RegExp(patterns.join("|").replace(/[{()}]/g, ""), "gi");

    for (let info of json) {
        if (regExp.test(info.name)) {
            description = info.description;
            break;
        }
    }
    return { description, type };
}

async function loadCometinfo(name: string): Promise<infoRespond> {
    let description = "";
    let type = "Asteroid (NEO)";
    const data = await fetch("./src/assets/data/comets_info.json");
    const json: AdditionalInfo[] = await data.json();

    const patterns = name.split("(").map((item) => item.trim());
    const regExp = new RegExp(patterns.join("|").replace(/[{()}]/g, ""), "gi");

    for (let info of json) {
        if (regExp.test(info.name)) {
            description = info.description;
            break;
        }
    }
    return { description, type };
}
