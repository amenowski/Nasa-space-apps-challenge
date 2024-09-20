export class UI {
    private date: HTMLDivElement | null = null;
    constructor() {
        this.date = document.querySelector<HTMLDivElement>(".UI .timestamp");
    }

    public setDate(date: Date) {
        if (this.date) {
            this.date.innerHTML = date.toString();
        }
    }
}
