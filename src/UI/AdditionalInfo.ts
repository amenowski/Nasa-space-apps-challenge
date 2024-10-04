export default class AdditionalInfo {
    private mainContainer: HTMLParagraphElement | null = null;
    private info: HTMLParagraphElement | null = null;
    private hideButton: HTMLDivElement | null = null;
    private showButton: HTMLDivElement | null = null;

    constructor() {
        this.mainContainer = document.querySelector(".additional-info");

        if (this.mainContainer) {
            // console.log(this.mainContainer);
            this.info = this.mainContainer.querySelector(".info p");
            this.hideButton = this.mainContainer.querySelector(
                ".info .header .hide-btn"
            );
            this.showButton = this.mainContainer.querySelector(".btn");
        }
    }

    public setEventListeners(): void {
        if (!this.mainContainer) return;

        this.hideButton!.addEventListener("click", () => {
            this.mainContainer!.classList.remove("extended");
        });
        this.showButton!.addEventListener("click", () => {
            this.mainContainer!.classList.add("extended");
        });
    }

    show(description: string): void {
        if (!this.mainContainer) return;

        this.info!.innerText = description;
        this.mainContainer?.classList.remove("hidden");
    }

    hide(): void {
        if (!this.mainContainer) return;

        this.info!.innerText = "";

        this.mainContainer.classList.remove("extended");
    }

    hideAll(): void {
        this.mainContainer?.classList.add("hidden");
    }
}
