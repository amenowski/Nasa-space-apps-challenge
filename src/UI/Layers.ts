export default class Layers {
  _parentElement: HTMLDivElement | null = document.querySelector(".layer");
  _openLayerBtn: HTMLElement | null =
    document.querySelector(".layer-btn--open");
  _closeLayersBtn: HTMLElement | null =
    document.querySelector(".layer-btn--close");

  setEventListeners(): void {
    this._openLayerBtn?.addEventListener("click", () => {
      this._parentElement?.classList.toggle("visible");
    });

    this._closeLayersBtn?.addEventListener("click", () => {
      this._parentElement?.classList.toggle("visible");
    });
  }
}
