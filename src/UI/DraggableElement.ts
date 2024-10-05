export default class DraggableElement {
    _element: HTMLElement | null;
    _isDragging: boolean = false;
    _offsetX: number = 0;
    _offsetY: number = 0;

    constructor(selector: string) {
        this._element = document.querySelector(selector);
    }

    setEventListeners(): void {
        if (this._element) {
            this._element.addEventListener(
                "mousedown",
                this.onMouseDown.bind(this)
            );
            document.addEventListener("mouseup", this.onMouseUp.bind(this));
            document.addEventListener("mousemove", this.onMouseMove.bind(this));
        }
    }

    onMouseDown(event: MouseEvent): void {
        if (!this._element) return;
        this._isDragging = true;
        this._offsetX =
            event.clientX - this._element.getBoundingClientRect().left;
        this._offsetY =
            event.clientY - this._element.getBoundingClientRect().top;
        this._element.classList.add("dragging");
    }

    onMouseUp(): void {
        if (this._element) {
            this._isDragging = false;
            this._element.classList.remove("dragging");
        }
    }

    onMouseMove(event: MouseEvent): void {
        if (this._isDragging && this._element) {
            const x = event.clientX - this._offsetX;
            const y = event.clientY - this._offsetY;

            requestAnimationFrame(() => {
                if (this._element) {
                    this._element.style.transform = `translate(${x}px, ${y}px)`;
                    this._element.style.transition = "transform 0.1s linear";
                }
            });
        }
    }
}
