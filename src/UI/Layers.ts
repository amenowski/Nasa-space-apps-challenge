import SolarSystem from "../components/SolarSystem";

export default class Layers {
    private parentElement: HTMLDivElement | null = null;
    private openLayerBtn: HTMLElement | null = null;
    private closeLayersBtn: HTMLElement | null = null;
    private system: SolarSystem;

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

        if(phaCB)
            phaCB.checked = false

        const orbitCB =
            this.parentElement.querySelector<HTMLInputElement>("#orbits");

        const labelCB =
            this.parentElement.querySelector<HTMLInputElement>("#labels");

        const iconCB =
            this.parentElement.querySelector<HTMLInputElement>("#icons");

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

        orbitCB!.addEventListener("change", () => {
            orbitCB?.checked
                ? this.system.showOrbit()
                : this.system.hideOrbit();
        });

        labelCB!.addEventListener("change", () => {
            labelCB?.checked
                ? this.system.showLabel()
                : this.system.hideLabel();
        });

        iconCB!.addEventListener("change", () => {
            iconCB?.checked ? this.system.showIcon() : this.system.hideIcon();
        });
    }
}
