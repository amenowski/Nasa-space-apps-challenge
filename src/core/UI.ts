import TimeSlider from "../UI/TimeSlider";

export class UI {
    private date: HTMLDivElement | null = null;
    private timeSlider: TimeSlider;
    constructor() {
        this.date = document.querySelector<HTMLDivElement>(".UI .timestamp");

        this.timeSlider = new TimeSlider();

        this.setEventListeners();
    }

    private setEventListeners(): void {
        this.timeSlider.setEventListeners();
    }

    public setDate(date: Date): void {
        if (this.date) {
            this.date.innerHTML = date.toString();
        }
    }
}
