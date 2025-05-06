class URLQuery {
  static instance = new URL(window.location.href);

  /**
   * Push the current URL to the history stack and update all
   * elements with `[data-inherit-url]` to include the current
   * search params.
   * @returns {void}
   */
  static update() {
    history.pushState(null, "", this.instance.toString());

    document.querySelectorAll("[data-inherit-url]").forEach((node) => {
      // `data-inherit-url="href"` means copy into the `href` attribute, etc.
      const targetAttr = node.dataset.inheritUrl;
      if (!targetAttr) return;

      // original value (without params) or fallback to full current location
      const original = node.getAttribute(targetAttr) || self.location.href;
      const base = original.split("?")[0];

      node.setAttribute(
        targetAttr,
        `${base}?${this.instance.searchParams.toString()}`,
      );
    });

    // hook for any listeners
    if (typeof onurlchanged === "function") {
      onurlchanged();
    }
  }

  /**
   * Get a single search parameter from the managed URL.
   * @param {string} key
   * @returns {string|null}
   */
  static get(key) {
    return this.instance.searchParams.get(key);
  }

  /**
   * Set or remove a search parameter, then push the change.
   * @param {string} key
   * @param {string|null} value
   * @returns {void}
   */
  static overwrite(key, value) {
    if (value == null) {
      this.instance.searchParams.delete(key);
    } else {
      this.instance.searchParams.set(key, value);
    }
    this.update();
  }

  /**
   * Add a new parameter into array, then push the change.
   * @param {string} key
   * @param {string|null} value
   * @returns {void}
   */
  static append(key, value) {
    this.instance.searchParams.append(key, value);
    this.update();
  }

  /**
   * @param {string} key
   * @param {string} value
   */
  static onsync(key, value) {
    switch (key) {
      case "sort":
        this.overwrite("sort", value);
    }
  }

  /**
   * @param {string} key
   * @param {(string|null)=>{}} callback
   */
  static syncTo(key, callback) {
    switch (key) {
      case "sort":
        callback(this.get("sort"));
    }
  }
}
