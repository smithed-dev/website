self.onurlchanged = () => {};

self.addEventListener(
  "click",
  /** @param {MouseEvent} event */
  (event) => {
    for (const widget of self.WIDGETS) {
      if (!widget.node.contains(event.target)) {
        widget.close();
      }
    }
  },
);

/**
 * Simple URL manager for syncing history state and updating
 * elements that inherit the current search params.
 */
const url = {
  /** @type {URL} */
  instance: new URL(self.location.href),

  /**
   * Push the current URL to the history stack and update all
   * elements with `[data-inherit-url]` to include the current
   * search params.
   * @returns {void}
   */
  update() {
    history.pushState(null, "", this.instance.toString());

    document.querySelectorAll("[data-inherit-url]").forEach((node) => {
      const targetAttr = node.dataset.inheritUrl;
      if (!targetAttr) return;

      const original = node.getAttribute(targetAttr) || self.location.href;
      const base = original.split("?")[0];

      node.setAttribute(
        targetAttr,
        `${base}?${this.instance.searchParams.toString()}`,
      );
    });

    // hook for any listeners
    if (typeof self.onurlchanged === "function") {
      self.onurlchanged();
    }
  },

  /**
   * Get a single search parameter from the managed URL.
   * @param {string} key
   * @returns {string|null}
   */
  get(key) {
    return this.instance.searchParams.get(key);
  },

  /**
   * Set or remove a search parameter, then push the change.
   * @param {string} key
   * @param {string|null} value
   * @returns {void}
   */
  overwrite(key, value) {
    if (value == null) {
      this.instance.searchParams.delete(key);
    } else {
      this.instance.searchParams.set(key, value);
    }
    this.update();
  },
};
