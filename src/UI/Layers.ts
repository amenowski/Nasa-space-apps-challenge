import SolarSystem from "../components/SolarSystem";

export default class Layers {
    private parentElement: HTMLDivElement | null = null;
    private openLayerBtn: HTMLElement | null = null;
    private closeLayersBtn: HTMLElement | null = null;
    private system: SolarSystem;

    //checkboxes

    constructor(system: SolarSystem) {
        this.parentElement = document.querySelector(".layer");

        if (this.parentElement) {
            this.openLayerBtn = document.querySelector(".layer-btn--open");
            this.closeLayersBtn = document.querySelector(".layer-btn--close");
        }

        this.system = system;
    }

    setEventListeners(): void {
        this.openLayerBtn?.addEventListener("click", () => {
            this.parentElement?.classList.toggle("visible");
        });

        this.closeLayersBtn?.addEventListener("click", () => {
            this.parentElement?.classList.toggle("visible");
        });

        this.setListenersForCheckboxes();
    }

    setListenersForCheckboxes(): void {
        if (!this.parentElement) return;

        const planetCB =
            this.parentElement.querySelector<HTMLInputElement>("#planets");

        const satellitesCB =
            this.parentElement.querySelector<HTMLInputElement>("#satellites");

        const neoCB =
            this.parentElement.querySelector<HTMLInputElement>("#NEO");

        const phaCB =
            this.parentElement.querySelector<HTMLInputElement>("#PHA");

        planetCB!.addEventListener("change", () => {
            planetCB?.checked
                ? this.system.showObjectsOfType("Planet")
                : this.system.hideObjectsOfType("Planet");
        });

        satellitesCB!.addEventListener("change", () => {
            satellitesCB?.checked
                ? this.system.showObjectsOfType("Satellite")
                : this.system.hideObjectsOfType("Satellite");
        });

        neoCB!.addEventListener("change", () => {
            neoCB?.checked
                ? this.system.showObjectsOfType("NEO")
                : this.system.hideObjectsOfType("NEO");
        });

        phaCB!.addEventListener("change", () => {
            phaCB?.checked
                ? this.system.showObjectsOfType("PHA")
                : this.system.hideObjectsOfType("PHA");
        });
    }
}
