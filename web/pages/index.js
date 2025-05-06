"use strict";

const TIMER = 5 * 1000;
const SCROLL_DELAY = 200;

const CarouselContainer = {
  left: document.getElementById("js-carousel-1"),
  right: document.getElementById("js-carousel-2"),
  interval: 0,

  /** @param {HTMLElement} carousel  */
  _scroll(carousel) {
    const i = Number(carousel.dataset.i);
    carousel.dataset.i = String(i + 1);
    this._hideProgress(carousel);

    const offset = 4 - Math.abs((i % 8) - 4);
    carousel.style.setProperty("--offset", `${offset}`);
    carousel.dataset.offset = String(offset);
    this._showProgress(carousel);
  },

  /** @param {HTMLElement} carousel  */
  _hideProgress(carousel) {
    carousel.children[Number(carousel.dataset.offset)]
      .querySelector(".o-loading-bar")
      .classList.remove("on-playing");
  },

  /** @param {HTMLElement} carousel  */
  _showProgress(carousel) {
    carousel.children[Number(carousel.dataset.offset)]
      .querySelector(".o-loading-bar")
      .classList.add("on-playing");
  },

  pause() {
    globalThis.clearInterval(this.interval);
    this._hideProgress(this.left);
    this._hideProgress(this.right);
  },

  play() {
    this.interval = globalThis.setInterval(() => {
      this._scroll(this.left);
      globalThis.setTimeout(() => this._scroll(this.right), SCROLL_DELAY);
    }, TIMER);

    this._showProgress(this.left);
    this._showProgress(this.right);
  },
};

CarouselContainer.play();
