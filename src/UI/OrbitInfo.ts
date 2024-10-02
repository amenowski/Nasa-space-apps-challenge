import CelestialBody from "../components/CelestialBody";

export default class OrbitInfo {
    private mainContainer: HTMLDivElement | null = null;
    private elementsContainer: HTMLDivElement | null = null;
    private objectName: HTMLParagraphElement | null = null;
    private moreInfoBtn: HTMLDivElement | null = null;
    private units: Map<string, HTMLParagraphElement> = new Map();
    private numbers: Map<string, HTMLParagraphElement> = new Map();

    constructor() {
        this.mainContainer = document.querySelector(".UI .object-info");

        if (!this.mainContainer) return;

        this.elementsContainer = document.querySelector(
            ".UI .orbital-elements"
        );
        this.moreInfoBtn = this.mainContainer.querySelector(".main-info");

        this.objectName = this.mainContainer.querySelector(
            ".main-info .object-name"
        );

        this.getAllElements();
    }

    public setEventListeners(): void {
        if (this.moreInfoBtn)
            this.moreInfoBtn.addEventListener("click", () => {
                this.mainContainer!.classList.toggle("extended");
            });
    }

    public displayInfo(object: CelestialBody): void {
        const orbitData = object.getOrbit();

        this.numbers.get("semiMajor")!.innerText =
            typeof orbitData.semiMajorAxis == "string"
                ? parseFloat(orbitData.semiMajorAxis).toPrecision(8)
                : orbitData.semiMajorAxis.toPrecision(8);

        this.units.get("semiMajor")!.innerText = "au";

        this.numbers.get("eccentricity")!.innerText =
            orbitData.eccentricity.toPrecision(8);

        this.numbers.get("inclination")!.innerText = (
            orbitData.inclination *
            (180 / Math.PI)
        ).toPrecision(8);
        this.units.get("inclination")!.innerText = "deg";

        this.numbers.get("longAn")!.innerText = (
            orbitData.ascendingNode *
            (180 / Math.PI)
        ).toPrecision(8);
        this.units.get("longAn")!.innerText = "deg";

        this.numbers.get("argPeri")!.innerText = (
            orbitData.argPeri *
            (180 / Math.PI)
        ).toPrecision(8);
        this.units.get("argPeri")!.innerText = "deg";

        this.numbers.get("period")!.innerText = orbitData.period.toPrecision(8);
        this.units.get("period")!.innerText = "y";

        if (this.objectName) this.objectName.innerText = object.name;
    }

    public showContainer(): void {
        this.mainContainer?.classList.add("visible");
    }

    public hideContainer(): void {
        this.mainContainer?.classList.remove("visible");
    }

    private getAllElements(): void {
        if (!this.elementsContainer) return;

        const elements = this.elementsContainer.querySelectorAll("li");

        elements.forEach((elem) => {
            const numberField =
                elem.querySelector<HTMLParagraphElement>(".number");
            if (numberField) this.numbers.set(elem.className, numberField);
            const unit = elem.querySelector<HTMLParagraphElement>(".unit");
            if (unit) this.units.set(elem.className, unit);
        });
    }
}
