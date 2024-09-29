import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import {
    Group,
    Mesh,
    MeshStandardMaterial,
    SphereGeometry,
    TextureLoader,
} from "three";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import CelestialBody from "./CelestialBody";
import SolarSystem from "./SolarSystem";
import axios from "axios";
import * as cheerio from "cheerio";

export default class Asteroid extends CelestialBody {
    constructor(
        system: SolarSystem,
        name: string,
        radius: number,
        obliquity: number,
        sidRotPerSec: number,
        color: string,
        textureUrl: string,
        textureLoader: TextureLoader
    ) {
        super(
            system,
            name,
            radius,
            obliquity,
            sidRotPerSec,
            color,
            textureUrl,
            textureLoader
        );
    }

    public async init(date: Date): Promise<void> {
        const tex = this.textureLoader.load(this.textureUrl);
        const geo = new SphereGeometry(this.radius);
        const mat = new MeshStandardMaterial({ color: 0x000000 });
        this.mesh = new Mesh(geo, mat);
        this.mesh.layers.set(4);
        this.group.layers.set(4);
        this.mesh.name = this.name;
        this.mesh.rotation.z = -this.obliquity * 0.0174532925;

        if (this.orbit) this.mesh.position.copy(this.orbit.setFromDate(date));

        const name = this.name.split(" ").join("-");
        const data = await axios.get(`/model/asteroids/${name}`);

        const $ = cheerio.load(data.data);
        const models = $("#ast-down .downloads-wrap ul li");

        const modelUrl: string | undefined = models
            .first()
            .children("a")
            .last()
            .attr()!["href"];

        const loader = new OBJLoader();

        if (modelUrl) {
            const objFileUrl = modelUrl.split("/").slice(3).join("/");

            const modelData = await axios.get(`/model/${objFileUrl}`);
            loader.load(`/model/${objFileUrl}`, (obj) => {
                // this.group.add(obj);
                // console.log(obj);
                console.log(this.mesh);
                // console.log(obj);

                for (let children of obj.children) {
                    if (children.type == "Mesh") {
                        //@ts-expect-error
                        this.mesh!.geometry.dispose();
                        //@ts-expect-error
                        this.mesh!.geometry = children.geometry;
                    }
                }
            });
            // console.log(modelData.data);
        }
        this.group.add(this.mesh);
        this.createLabel();
        this.createIcon();
    }

    protected createIcon(): void {
        this.htmlElements[1] = document.createElement("div");
        this.htmlElements[1].className = "asteroid-icon";

        const icon = document.createElement("img");
        icon.src = "/asteroid-mine.svg";
        this.htmlElements[1].appendChild(icon);

        this.icon = new CSS2DObject(this.htmlElements[1]);
        this.icon.position.set(0, 0, 0);
        this.icon.layers.set(0);
        this.mesh!.add(this.icon);

        this.htmlElements[1].addEventListener("mouseover", () => {
            this.orbit?.hovered();
            this.infoHover();
        });

        this.htmlElements[1].addEventListener("mouseleave", () => {
            this.orbit?.unhovered();
            this.infoUnhover();
        });

        this.htmlElements[1].addEventListener("pointerdown", () => {
            this.system.moveToBody(this);
        });
    }
}
