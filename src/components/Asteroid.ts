import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import {
    Box3,
    Mesh,
    MeshStandardMaterial,
    SphereGeometry,
    TextureLoader,
    Vector3,
} from "three";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import CelestialBody from "./CelestialBody";
import SolarSystem from "./SolarSystem";
import axios, { AxiosResponse } from "axios";
import * as cheerio from "cheerio";
import Orbit from "./Orbit";
import { UnixToJulianDate } from "../utils/DateConverter";
import { SETTINGS } from "../core/Settings";
import { AsteroidType } from "../core/Types";

export default class Asteroid extends CelestialBody {
    public modelExist: boolean;
    public zoom: number = SETTINGS.ZOOM_TO_OBJECT;
    public type: AsteroidType;

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
        textureLoader: TextureLoader,
        isPha: "Y" | "N",
        layer: number
    ) {
        super(
            system,
            name,
            radius,
            obliquity,
            sidRotPerSec,
            color,
            textureUrl,
            textureLoader,
            layer
        );
        this.modelExist = false;
        this.modelLoaded = false;
        this.modelUrl = "";
        this.type = "NEO";

        if (isPha == "Y") this.type = "PHA";
    }

    public async init(date: Date): Promise<void> {
        const geo = new SphereGeometry(this.radius);
        const mat = new MeshStandardMaterial({ color: 0xfafafa });
        this.mesh = new Mesh(geo, mat);
        this.mesh.layers.set(this.layer);
        this.mesh.name = this.name;
        this.mesh.rotation.z = -this.obliquity * 0.0174532925;

        if (this.orbit) {
            this.mesh.position.copy(this.orbit.setFromDate(date));

            this.group.add(this.orbit.orbitLine);
        }
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

                    const box = new Box3().setFromObject(this.mesh!);
                    const size = new Vector3();

                    box.getSize(size);
                    this.zoom = size.z;

                    this.system.moveToBody(this);
                }
            }
        });
    }

    public updatePosition(
        date: Date,
        deltaTime: number,
        daysPerSec: number
    ): void {
        this.rotateObject(date);
        if (this.orbit) {
            const currentDate = UnixToJulianDate(date);

            this.meanAnomaly =
                this.meanAnomaly + this.meanMotion * deltaTime * daysPerSec;
            this.meanAnomaly = this.meanAnomaly % (Math.PI * 2);
            this.orbit.setEpoch(currentDate);
            this.mesh!.position.copy(
                this.orbit.fromMeanAnomaly(this.meanAnomaly)
            );
            this.orbit.trace();
            for (let [_, satellite] of this.satellites)
                satellite.updatePosition(date, deltaTime, daysPerSec);
        }
    }

    public updateRender(distFromCam: number, isFocused: boolean): void {
        if (this.hidden) return;

        let zoom = Math.max(this.radius, this.zoom);

        if (distFromCam < zoom * 100) {
            this.hideAdditionalInfo();
        } else {
            this.showAdditionalInfo();

            if (isFocused) {
                for (let [_, satellite] of this.satellites) {
                    satellite.showAdditionalInfo();
                }
            } else {
                for (let [_, satellite] of this.satellites) {
                    satellite.hideAdditionalInfo();
                }
            }
        }
    }

    public setLivePosition(date: Date) {
        if (this.mesh && this.orbit) {
            this.orbit.setFromDate(date);

            for (let [_, satellite] of this.satellites)
                satellite.setLivePosition(date);
        }
    }

    public setOrbit(orbit: Orbit): void {
        // trace orbit
        this.orbit = orbit;
        this.orbit.setAsteroidMaterial();
        this.orbit.visualize();

        this.group.add(this.orbit!.orbitLine);
    }

    protected createIcon(): void {
        this.htmlElements[1] = document.createElement("div");
        this.htmlElements[1].className = "asteroid-icon";

        const icon = document.createElement("img");
        icon.src = "/asteroid-mine.svg";
        this.htmlElements[1].appendChild(icon);

        this.icon = new CSS2DObject(this.htmlElements[1]);
        this.icon.position.set(0, 0, 0);
        this.icon.layers.set(SETTINGS.ICON_LAYER);
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

        this.modelUrl = `/assets/models/asteroid_model_${randomNumber}.obj`;

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
