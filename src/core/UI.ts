import SolarSystem from "../components/SolarSystem";
import TimeSlider from "../UI/TimeSlider";
import { getMonthShortName } from "../utils/DateConverter";

export class UI {
    private date: HTMLDivElement | null = null;
    private clock: HTMLDivElement | null = null;
    private liveBtn: HTMLDivElement | null = null;
    private timeSlider: TimeSlider;
    private solarSystem: SolarSystem;
    constructor(solarSystem: SolarSystem) {
        this.clock = document.querySelector<HTMLDivElement>(
            ".UI .time-slider .info .clock"
        );
        this.date = document.querySelector<HTMLDivElement>(
            ".UI .time-slider .info .date"
        );
        this.liveBtn = document.querySelector(
            ".UI .time-slider .info .live-btn"
        );
        this.timeSlider = new TimeSlider();

        this.setEventListeners();
        this.solarSystem = solarSystem;
    }

    public noLive(): void {
        if (this.liveBtn) {
            this.liveBtn.classList.add("no-live");
        }
    }

    public updateTimelineInfo(date: Date): void {
        let hours: string | number = date.getHours();
        let minutes: string | number = date.getMinutes();
        let seconds: string | number = date.getSeconds();
        if (hours < 10) hours = "0" + hours;
        if (minutes < 10) minutes = "0" + minutes;
        if (seconds < 10) seconds = "0" + seconds;

        // console.log(`${hours}:${minutes}:${seconds}`);
        if (this.clock) this.clock.innerText = `${hours}:${minutes}:${seconds}`;

        let day = date.getDate();
        let month = getMonthShortName(date.getMonth());
        let year = date.getFullYear();

        if (this.date) this.date.innerText = `${day} ${month}, ${year}`;
    }

    private setEventListeners(): void {
        this.timeSlider.setEventListeners();

        if (this.liveBtn)
            this.liveBtn.addEventListener("click", () => {
                this.solarSystem.setLiveDate();
                this.live();
                this.timeSlider.reset();
            });
    }

    private live(): void {
        if (this.liveBtn) {
            this.liveBtn.classList.remove("no-live");
        }
    }
}
