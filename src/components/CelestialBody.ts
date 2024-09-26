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

    protected createLabel(): void {
        const div = document.createElement("div");
        div.className = "planet-label";
        div.textContent = this.name;
        div.style.setProperty("--color", `${this.color.getStyle()}`);

        this.label = new CSS2DObject(div);
        this.label.position.set(0, this.radius, 0);
        this.label.layers.set(0);
        this.mesh!.add(this.label);

        div.addEventListener("mouseover", () => {
            this.orbit?.hovered();
        });

        div.addEventListener("mouseleave", () => {
            this.orbit?.unhovered();
        });

        div.addEventListener("click", () => {
            this.system.moveToBody(this);
        });
    }

    protected createIcon(): void {
        const div = document.createElement("div");
        div.className = "planet-icon";

        div.style.setProperty("--color", `${this.color.getStyle()}`);

        this.icon = new CSS2DObject(div);
        this.icon.position.set(0, 0, 0);
        this.icon.layers.set(0);
        this.mesh!.add(this.icon);

        div.addEventListener("mouseover", () => {
            this.orbit?.hovered();
        });

        div.addEventListener("mouseleave", () => {
            this.orbit?.unhovered();
        });

        div.addEventListener("click", () => {
            this.system.moveToBody(this);
        });
    }

    protected moveCamera(): void {}
}
