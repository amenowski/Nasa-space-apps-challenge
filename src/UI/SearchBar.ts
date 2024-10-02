import SolarSystem from "../components/SolarSystem";

export default class SearchBar {
    private searchBarContainer: HTMLDivElement | null = null;
    private resultContainer: HTMLDivElement | null = null;
    private input: HTMLInputElement | null = null;
    private system: SolarSystem;

    constructor(system: SolarSystem) {
        this.system = system;
        this.searchBarContainer = document.querySelector(".search-bar");

        if (this.searchBarContainer) {
            this.input = this.searchBarContainer.querySelector("input");
            this.resultContainer =
                this.searchBarContainer.querySelector(".result");
        }
    }

    public setEventListeners(): void {
        if (this.input) {
            this.input.addEventListener("input", () => {
                if (!this.input) return;
                this.system.searchForObjects(this.input.value);
            });
            this.input.addEventListener("focus", () => {
                if (!this.input) return;
                this.system.searchForObjects(this.input.value);
            });

            this.input.addEventListener("blur", () => {
                if (!this.input) return;
                this.clearResult();
            });
        }
    }

    public displaySearchResult(results: string[]): void {
        // results = results.slice(0, 10);
        if (!this.resultContainer) return;
        this.clearResult();

        if (this.input!.value == "") {
            results = this.system.famousObjectsNames;
        }
        for (let result of results) {
            let p = document.createElement("p");
            p.innerText = result;

            p.addEventListener("click", () => {
                this.system.loadAsteroid(result);
                this.input!.value = "";
                this.clearResult();
            });

            this.resultContainer.appendChild(p);
        }
    }

    private clearResult(): void {
        while (this.resultContainer!.firstChild) {
            this.resultContainer!.removeChild(this.resultContainer!.lastChild!);
        }
    }
}
