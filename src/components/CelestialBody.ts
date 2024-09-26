import {
    Color,
    Group,
    Mesh,
    MeshStandardMaterial,
    SphereGeometry,
    TextureLoader,
} from "three";
import Orbit from "./Orbit";

import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import { UnixToJulianDate } from "../utils/OrbitalCalculations";
import SolarSystem from "./SolarSystem";

export default class CelestialBody {
    public name: string;
    public radius: number;
    public trueAnomaly: number;
    public satellites: CelestialBody[] = [];
    public mesh: Mesh | null = null;
    public group: Group;
    public meanMotion: number; // rad per day
    public meanAnomaly: number;
    protected textureUrl: string;
    protected orbit: Orbit | null = null;
    protected textureLoader: TextureLoader;
    protected label: CSS2DObject | null = null;
    protected icon: CSS2DObject | null = null;
    protected system: SolarSystem;
    protected color: Color;
    protected htmlElements: HTMLDivElement[] = new Array<HTMLDivElement>(2);

    constructor(
        system: SolarSystem,
        name: string,
        radius: number,
        color: string,
        textureUrl: string,
        textureLoader: TextureLoader
    ) {
        this.group = new Group();

        this.system = system;
        this.name = name;
        this.radius = radius;
        this.textureUrl = textureUrl;
        this.textureLoader = textureLoader;

        this.meanMotion = 0;
        this.meanAnomaly = 0;
        this.trueAnomaly = 0;

        this.color = new Color(color);
    }

    public init(date: Date) {
        const tex = this.textureLoader.load(this.textureUrl);
        const geo = new SphereGeometry(this.radius);
        const mat = new MeshStandardMaterial({ map: tex });
        this.mesh = new Mesh(geo, mat);
        this.mesh.layers.enableAll();
        this.mesh.name = this.name;

        this.group.add(this.mesh);
        this.createLabel();
        this.createIcon();
        if (this.orbit) this.orbit.setFromDate(date);
    }

    public setOrbit(orbit: Orbit) {
        this.orbit = orbit;
        this.orbit.visualize();
        this.group.add(this.orbit.orbitLine);
    }

    public updatePosition(
        date: Date,
        deltaTime: number,
        daysPerSec: number
    ): void {
        if (this.mesh && this.orbit) {
            const currentDate = UnixToJulianDate(date);

            this.meanAnomaly =
                this.meanAnomaly + this.meanMotion * deltaTime * daysPerSec;
            this.meanAnomaly = this.meanAnomaly % (Math.PI * 2);

            this.orbit.setEpoch(currentDate);
            this.orbit.fromMeanAnomaly(this.meanAnomaly);
        }
    }

    public updateRender(distFromCam: number): void {
        if (distFromCam < this.radius * 100) {
            console.log(`close to ${this.name}`);
            this.hideAdditionalInfo();
        } else {
            this.showAdditionalInfo();
        }
    }

    protected hideAdditionalInfo(): void {
        // hide orbit, label, icon
        if (this.orbit) this.orbit.hide();
        if (this.label) this.label.visible = false;
        if (this.icon) this.icon.visible = false;
    }

    protected showAdditionalInfo(): void {
        if (this.orbit) this.orbit.show();
        if (this.label) this.label.visible = true;
        if (this.icon) this.icon.visible = true;
    }

    protected createLabel(): void {
        this.htmlElements[0] = document.createElement("div");
        this.htmlElements[0].className = "planet-label";
        this.htmlElements[0].textContent = this.name;
        this.htmlElements[0].style.setProperty(
            "--color",
            `${this.color.getStyle()}`
        );

        this.label = new CSS2DObject(this.htmlElements[0]);
        this.label.position.set(0, 0, 0);
        this.label.layers.set(0);
        this.mesh!.add(this.label);

        // this.htmlElements[0].addEventListener("mouseover", () => {
        //     this.orbit?.hovered();
        //     this.infoHover();
        // });

        // this.htmlElements[0].addEventListener("mouseleave", () => {
        //     this.orbit?.unhovered();
        //     this.infoUnhover();
        // });

        // this.htmlElements[0].addEventListener("pointerdown", () => {
        //     this.system.moveToBody(this);
        // });
    }

    protected createIcon(): void {
        this.htmlElements[1] = document.createElement("div");
        this.htmlElements[1].className = "planet-icon";

        this.htmlElements[1].style.setProperty(
            "--color",
            `${this.color.getStyle()}`
        );

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

    protected infoHover(): void {
        this.htmlElements.map((elem) => {
            elem.classList.add("hovered");
        });
    }

    protected infoUnhover(): void {
        this.htmlElements.map((elem) => {
            elem.classList.remove("hovered");
        });
    }
}
