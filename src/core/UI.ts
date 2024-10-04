import CelestialBody from "../components/CelestialBody";
import SolarSystem from "../components/SolarSystem";

import Credits from "../UI/Credits";

import AdditionalInfo from "../UI/AdditionalInfo";

import OrbitInfo from "../UI/OrbitInfo";
import SearchBar from "../UI/SearchBar";
import TimeSlider from "../UI/TimeSlider";
import { getMonthShortName } from "../utils/DateConverter";

export class UI {
    private date: HTMLDivElement | null = null;
    private clock: HTMLDivElement | null = null;
    private liveBtn: HTMLDivElement | null = null;
    private moveToDefaultBtn: HTMLDivElement | null = null;
    private searchBar: SearchBar;
    private timeSlider: TimeSlider;
    private orbitInfo: OrbitInfo;
    private solarSystem: SolarSystem;
    private additionalInfo: AdditionalInfo;
    private credits: Credits;

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

        this.moveToDefaultBtn = document.querySelector(".UI .move-to-default");

        this.timeSlider = new TimeSlider();
        this.searchBar = new SearchBar(solarSystem);
        this.orbitInfo = new OrbitInfo();
        this.additionalInfo = new AdditionalInfo();
        this.credits = new Credits();

        this.setEventListeners();
        this.solarSystem = solarSystem;
    }

    public showResetPosition(): void {
        if (this.moveToDefaultBtn) this.moveToDefaultBtn.classList.add("show");
    }

    public hideResetPosition(): void {
        if (this.moveToDefaultBtn)
            this.moveToDefaultBtn.classList.remove("show");
    }

    public noLive(): void {
        if (this.liveBtn) {
            this.liveBtn.classList.add("no-live");
        }
    }

    public showAdditionalInfo(description: string): void {
        this.additionalInfo.show(description);
    }

    public hideAdditionalInfo(): void {
        this.additionalInfo.hide();
    }

    public hideInfoButton(): void {
        this.additionalInfo.hideAll();
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

    public displayResult(results: string[]): void {
        this.searchBar.displaySearchResult(results);
    }

    public showOrbitInfo(object: CelestialBody): void {
        this.orbitInfo.displayInfo(object);
        this.orbitInfo.showContainer();
    }

    public hideOrbitInfo(): void {
        this.orbitInfo.hideContainer();
    }

    private setEventListeners(): void {
        this.timeSlider.setEventListeners();
        this.searchBar.setEventListeners();
        this.orbitInfo.setEventListeners();
        this.additionalInfo.setEventListeners();
        this.credits.setEventListeners();

        if (this.liveBtn)
            this.liveBtn.addEventListener("click", () => {
                this.solarSystem.setLiveDate();
                this.live();
                this.timeSlider.reset();
            });

        if (this.moveToDefaultBtn)
            this.moveToDefaultBtn.addEventListener("click", () => {
                this.solarSystem.resetCamPosition();
            });
    }

    public hideSearchBar(): void {
        this.searchBar.clearResult();
    }

    private live(): void {
        if (this.liveBtn) {
            this.liveBtn.classList.remove("no-live");
        }
    }
}
