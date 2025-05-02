self.onurlchanged = () => {};
self.WIDGETS = [];

let layout; // used in switch.html widget

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

/** @param {HTMLInputElement} node */
function onSearchBarChanged(node) {
  node.parentElement.dispatchEvent(new Event("change"));
}

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
   * @returns {string[]}
   */
  get(key) {
    return this.instance.searchParams.getAll(key);
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

  /**
   * Add a new parameter into array, then push the change.
   * @param {string} key
   * @param {string|null} value
   * @returns {void}
   */
  append(key, value) {
    this.instance.searchParams.append(key, value);
    this.update();
  },

  /**
   * Removes the parameter, then push the change.
   * @param {string} key
   * @param {string|null} value
   * @returns {void}
   */
  remove(key, value) {
    this.instance.searchParams.delete(key, value);
    this.update();
  },
};

/**
 * Simple utility for getting and setting cookies.
 */
class Cookies {
  /**
   * Get the value of a cookie by name.
   * @param {string} name - The name of the cookie.
   * @returns {string|null} The cookie value, or null if not found.
   */
  static get(name) {
    const match = document.cookie.match(
      new RegExp(
        "(?:^|; )" + name.replace(/([.*+?^${}()|[\]\\])/g, "\\$1") + "=([^;]*)",
      ),
    );
    return match ? decodeURIComponent(match[1]) : null;
  }

  /**
   * Set a cookie.
   * @param {string} name - The name of the cookie.
   * @param {string} value - The value to set.
   * @param {Object} [options] - Optional settings.
   * @param {number} [options.days] - Days until expiration.
   * @param {string} [options.path='/'] - Cookie path.
   * @param {string} [options.domain] - Cookie domain.
   * @param {boolean} [options.secure] - Secure flag.
   * @param {string} [options.sameSite] - SameSite attribute.
   */
  static set(name, value, options = {}) {
    let str = `${name}=${encodeURIComponent(value)}`;
    if (options.days) {
      const d = new Date();
      d.setTime(d.getTime() + options.days * 864e5);
      str += `; Expires=${d.toUTCString()}`;
    }
    str += `; Path=${options.path || "/"}`;
    if (options.domain) str += `; Domain=${options.domain}`;
    if (options.secure) str += "; Secure";
    if (options.sameSite) str += `; SameSite=${options.sameSite}`;
    document.cookie = str;
  }
}

function propagadeEvent(node, event) {
  node.parentElement.dispatchEvent(new Event(event));
}

/** @param {HTMLButtonElement} node */
function toggleField(node) {
  /** @type {HTMLElement} */
  const hint = node.nextElementSibling;

  if (hint.dataset.visible == "true") {
    hint.style.setProperty("display", "none");
    hint.dataset.visible = "false";
  } else {
    hint.style.removeProperty("display");
    hint.dataset.visible = "true";
  }
}
