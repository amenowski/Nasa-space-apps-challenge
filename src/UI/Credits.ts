export default class Credits {
  _parentElement: HTMLDivElement | null =
    document.querySelector(".credits-container");
  _openCreditsBtn: HTMLElement | null =
    document.querySelector(".credits-btn--open");
  _closeCreditsBtn: HTMLElement | null = document.querySelector(
    ".credits-btn--close"
  );

  setEventListeners(): void {
    this._openCreditsBtn?.addEventListener("click", () => {
      this._parentElement?.classList.add("visible");
    });

    this._closeCreditsBtn?.addEventListener("click", () => {
      this._parentElement?.classList.remove("visible");
    });
  }
}
