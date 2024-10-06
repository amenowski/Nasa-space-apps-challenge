import { TextureLoader } from "three";
import Asteroid from "./Asteroid";
import SolarSystem from "./SolarSystem";
import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import { SETTINGS } from "../core/Settings";

export default class Comet extends Asteroid{

    constructor( system: SolarSystem,
        name: string,
        radius: number,
        obliquity: number,
        sidRotPerSec: number,
        color: string,
        textureUrl: string,
        textureLoader: TextureLoader,
        isPha: "Y" | "N",
        layer: number) {
            super(system, name, radius, obliquity, sidRotPerSec, color, textureUrl, textureLoader, isPha, layer);
            

    }

    protected createIcon(): void {
        this.htmlElements[1] = document.createElement("div");
        this.htmlElements[1].className = "asteroid-icon";

        const icon = document.createElement("img");
        icon.src = "/comet-icon.svg";
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
}