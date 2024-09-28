import { SETTINGS } from "../core/Settings";

type SlideStage = {
    breakpoint: number;
    value: number;
    label: string;
};

export default class TimeSlider {
    private container: HTMLDivElement | null = null;
    private drag: HTMLDivElement | null = null;
    private speedDisplay: HTMLParagraphElement | null = null;
    private mouseDown: boolean = false;
    private sliderStages: SlideStage[] = [];
    private currentStage: SlideStage;
    constructor() {
        this.container = document.querySelector<HTMLDivElement>(
            ".time-slider .slider"
        );

        this.drag = document.querySelector<HTMLDivElement>(
            ".time-slider .slider .drag"
        );

        this.speedDisplay = document.querySelector<HTMLParagraphElement>(
            ".time-slider .simulation-speed"
        );

        this.sliderStages = [
            { breakpoint: 0, value: 1, label: "real-time" },
            { breakpoint: 10, value: 60 * 60, label: "1 hour/s" },
            { breakpoint: 20, value: 60 * 60 * 2, label: "2 hour/s" },
            { breakpoint: 30, value: 60 * 60 * 3, label: "3 hours/s" },
            { breakpoint: 40, value: 60 * 60 * 5, label: "5 hours/s" },
            { breakpoint: 50, value: 60 * 60 * 12, label: "12 hours/s" },
            { breakpoint: 60, value: 60 * 60 * 24, label: "1 day/s" },
            { breakpoint: 70, value: 60 * 60 * 24 * 2, label: "2 day/s" },
            { breakpoint: 80, value: 60 * 60 * 24 * 7, label: "1 week/s" },
            { breakpoint: 85, value: 60 * 60 * 24 * 14, label: "2 week/s" },
            { breakpoint: 90, value: 60 * 60 * 24 * 30, label: "1 month/s" },
            {
                breakpoint: 93,
                value: 60 * 60 * 24 * 30 * 2,
                label: "2 month/s",
            },
            {
                breakpoint: 96,
                value: 60 * 60 * 24 * 30 * 6,
                label: "6 month/s",
            },
            {
                breakpoint: 99,
                value: 60 * 60 * 24 * 30 * 12,
                label: "1 year/s",
            },
        ];

        this.currentStage = this.sliderStages[0];
        SETTINGS.simulationSpeed = this.currentStage.value;
    }

    public reset(): void {
        this.currentStage = this.sliderStages[0];
        SETTINGS.simulationSpeed = this.currentStage.value;

        if (this.speedDisplay) this.speedDisplay.style.opacity = "0";
        this.drag?.style.setProperty("--offset", `0px`);
    }

    public setEventListeners(): void {
        if (this.drag && this.container) {
            this.drag.addEventListener("mousedown", () => {
                this.mouseDown = true;
            });
            window.addEventListener("mouseup", () => {
                this.mouseDown = false;

                if (this.currentStage.breakpoint == 0) {
                    this.drag?.style.setProperty("--offset", `${0}px`);
                }
            });
            // this.drag.addEventListener("mouseleave", () => {
            //     this.mouseDown = false;
            // });

            window.addEventListener("mousemove", (e) => {
                const containerRect = this.container!.getBoundingClientRect();
                const dragRect = this.drag!.getBoundingClientRect();
                if (!this.mouseDown) return;
                const mid = containerRect.width / 2;
                const { x } = containerRect;
                let offset = e.clientX - x - mid;
                const limitRange = mid - dragRect.width / 2;

                if (offset > limitRange) offset = limitRange;
                if (offset < -limitRange) offset = -limitRange;
                this.drag?.style.setProperty("--offset", `${offset}px`);

                // console.log((offset / limitRange) * 100);

                const progress = (offset / limitRange) * 100;

                let i = this.sliderStages.length - 1;

                while (i >= 0) {
                    if (this.sliderStages[i].breakpoint < Math.abs(progress)) {
                        this.currentStage = this.sliderStages[i];
                        if (!this.speedDisplay) break;

                        if (this.currentStage.breakpoint == 0) {
                            SETTINGS.simulationSpeed = this.currentStage.value;
                            this.speedDisplay.style.opacity = "0";
                            break;
                        }
                        this.speedDisplay.style.opacity = "1";
                        SETTINGS.simulationSpeed =
                            this.currentStage.value * Math.sign(progress);

                        this.speedDisplay.innerText =
                            Math.sign(progress) > 0
                                ? this.currentStage.label
                                : "-" + this.currentStage.label;

                        break;
                    }

                    i--;
                }
            });
        }
    }
}
