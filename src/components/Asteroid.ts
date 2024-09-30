import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import {
    Mesh,
    MeshStandardMaterial,
    SphereGeometry,
    TextureLoader,
} from "three";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import CelestialBody from "./CelestialBody";
import SolarSystem from "./SolarSystem";
import axios, { AxiosResponse } from "axios";
import * as cheerio from "cheerio";

export default class Asteroid extends CelestialBody {
    public modelExist: boolean;
    private modelUrl: string;
    private modelLoaded: boolean;

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
        this.modelExist = false;
        this.modelLoaded = false;
        this.modelUrl = "";
    }

    public async init(date: Date): Promise<void> {
        const geo = new SphereGeometry(this.radius);
        const mat = new MeshStandardMaterial({ color: 0xfafafa });
        this.mesh = new Mesh(geo, mat);
        this.mesh.layers.set(4);
        this.group.layers.set(4);
        this.mesh.name = this.name;
        this.mesh.rotation.z = -this.obliquity * 0.0174532925;

        if (this.orbit) this.mesh.position.copy(this.orbit.setFromDate(date));
        this.group.add(this.mesh);
        this.createLabel();
        this.createIcon();
    }

    public loadModel(): void {
        if (this.modelLoaded) return;

        if (!this.modelExist) {
            const name = this.name.split(" ").join("-");
            axios
                .get(`/model/asteroids/${name}`)
                .then((data) => {
                    this.modelExist = true;
                    this.getModelData(data);
                })
                .catch(() => {
                    this.modelExist = false;
                    this.setRandom3dModel();
                });
            return;
        }

        const loader = new OBJLoader();
        loader.load(`/model/${this.modelUrl}`, (obj) => {
            for (let children of obj.children) {
                if (children.type == "Mesh") {
                    //@ts-expect-error
                    this.mesh!.geometry.dispose();
                    //@ts-expect-error
                    this.mesh!.geometry = children.geometry;
                    this.modelLoaded = true;
                }
            }
        });
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

    private getModelData(data: AxiosResponse<any, any>): void {
        if (!this.modelExist) return;

        const $ = cheerio.load(data.data);
        const models = $("#ast-down .downloads-wrap ul li");

        const modelUrl: string | undefined = models
            .first()
            .children("a")
            .last()
            .attr()!["href"];

        this.modelUrl = modelUrl.split("/").slice(3).join("/");
        this.loadModel();
    }

    private setRandom3dModel(): void {
        this.modelExist = true;
        // 4 3 7 9
        const randomNumber = Math.floor(Math.random() * 3);

        this.modelUrl = `./src/assets/models/asteroid_model_${randomNumber}.obj`;

        const loader = new OBJLoader();
        loader.load(this.modelUrl, (obj) => {
            for (let children of obj.children) {
                if (children.type == "Mesh") {
                    //@ts-expect-error
                    this.mesh!.geometry.dispose();
                    //@ts-expect-error
                    this.mesh!.geometry = children.geometry;
                    this.modelLoaded = true;
                }
            }
        });
    }
}
