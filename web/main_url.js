class URLQuery {
  static instance = new URL(window.location.href);
  static defaults = {
    sort: "trending",
    page: "1",
  };

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
   * @returns {string[]}
   */
  static get(key) {
    return this.instance.searchParams.getAll(key);
  }

  /**
   * Set or remove a search parameter, then push the change.
   * @param {string} key
   * @param {string|null} value
   * @returns {void}
   */
  static overwrite(key, value) {
    console.debug(`URL.overwrite(${key}, ${value})`);
    if (value == null || value == this.defaults[key]) {
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
   * Removes the parameter, then push the change.
   * @param {string} key
   * @param {string|null} value
   * @returns {void}
   */
  static remove(key, value) {
    this.instance.searchParams.delete(key, value);
    this.update();
  }

  /**
   * @param {string} key
   * @param {string} value
   */
  static onsync(key, value) {
    let encoded = encodeURIComponent(value);
    if (encoded === "") {
      encoded = null;
    }

    switch (key) {
      case "sort":
      case "search":
        this.overwrite(key, encoded);
    }
  }

  /**
   * @param {string} key
   * @param {(string|null)=>{}} callback
   */
  static syncTo(key, callback) {
    switch (key) {
      case "sort":
      case "search":
        callback(this.get(key));
    }
  }
}
