import SolarSystem from "../components/SolarSystem";

export default class Warning {
    private mainContainer: HTMLDivElement | null = null;
    private system: SolarSystem;

    constructor(system: SolarSystem) {
        this.mainContainer = document.querySelector(".UI");
        this.detectClickOutside();
        this.system = system;
    }

    showWarning(name: string): void {
        const warningElement = this.createWarningElement(name);
        this.mainContainer!.appendChild(warningElement);

        // setTimeout(() => {    
            // this.removeWarning(warningElement)
            // this.system.resetClosePHA()
        // }, 3000);
    }

    createWarningElement(name: string): HTMLDivElement {
        const warningHTML = this.generateWarningMarkup(name);
        const warningContainer = document.createElement("div");
        warningContainer.classList.add("warning-container");

        warningContainer.innerHTML = warningHTML;

        const closeButton = warningContainer.querySelector(
            ".warning-btn--close"
        );
        if (closeButton) {
            closeButton.addEventListener("click", (event) => {
                event.stopPropagation();
                this.removeWarning(warningContainer);
            });
        }

        return warningContainer;
    }

    generateWarningMarkup(name: string): string {
        return `
            <header class="warning-header">
                <h2 class="warning-heading">Warning!</h2>
                <button class="btn warning-btn--close">X</button>
            </header>
            <main class="warning-main">
                <p class="warning-text">
                    The ${name} is getting closer to The Earth
                </p>
            </main>
        `;
    }

    removeWarning(warningElement: HTMLDivElement): void {
        if (this.mainContainer && warningElement) {
            this.mainContainer.removeChild(warningElement);
        }
    }
    detectClickOutside(): void {
        document.addEventListener("mousedown", (event) => {
            const target = event.target as HTMLElement;
            const warningContainers =
                document.querySelectorAll(".warning-container");
            if (
                warningContainers.length > 0 &&
                !target.closest(".warning-container")
            ) {

                console.log("siema")
                warningContainers.forEach((container) =>
                    this.removeWarning(container as HTMLDivElement)
                );
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                const warningContainers =
                    document.querySelectorAll(".warning-container");
                if (warningContainers.length > 0) {
                    warningContainers.forEach((container) =>
                        this.removeWarning(container as HTMLDivElement)
                    );
                }
            }
        });
    }
}
