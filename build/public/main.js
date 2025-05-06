
// from: ./web/main_closable.js
class IClosableWidget {
  /** @type {HTMLElement} */
  node;

  close() {}
}

/** @type {IClosableWidget[]} */
const ClosableWidgets = [];

self.addEventListener(
  "click",
  /** @param {MouseEvent} event */
  (event) => {
    for (const widget of ClosableWidgets) {
      if (!widget.node.contains(event.target)) {
        widget.close();
      }
    }
  },
);
// from: ./web/main_cookies.js
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
// from: ./web/main_url.js
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
    console.debug(`URL.overwrite(${key}, ${value})`);
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
// from: ./web/pages/components/widget/button/filter.js
const NOT_SUPPORTED_FILTERS = [
  // "category", supported now
  "no_category",
  // "version", supported now
  "no_version",
  "no_badge",
  "badge",
];

class FilterWidget {
  /** @type {HTMLDivElement} */
  node;
  /** @type {HTMLButtonElement} */
  buttonInclude;
  /** @type {HTMLButtonElement} */
  buttonExclude;

  constructor(node) {
    this.node = node;
    this.buttonInclude = node.querySelector(".type-include");
    this.buttonExclude = node.querySelector(".type-exclude");
    self.WIDGETS = [...(self.WIDGETS || []), this];
  }

  close() {}

  /** @param {HTMLButtonElement} button  */
  /** @param {HTMLButtonElement} conflicting  */
  /** @param {string} tag  */
  toggle(button, conflicting, tag, fromUser) {
    const container = document.getElementById("js-filters");
    const id = this.node.id.replace("filter", "tag");

    let param = this.node.dataset.param;
    if (tag === "type-exclude") {
      param = "no_" + param;
    }

    conflicting.classList.remove("on-selected");
    const element = container.querySelector(`#${id}`);
    if (element != null) {
      if (fromUser) {
        url.remove(param, this.node.dataset.item);
      }
      element.remove();
    }

    if (button.classList.contains("on-selected")) {
      button.classList.remove("on-selected");
    } else {
      button.classList.add("on-selected");

      /** @type {HTMLElement} */
      const clone = container
        ?.querySelector("template")
        ?.content?.children[0].cloneNode(true);

      clone.querySelector(".js-label").innerHTML = this.node.dataset.item;
      clone.classList.add(tag);
      clone.id = id;
      clone.addEventListener("click", () => {
        this.toggle(button, conflicting, tag, true);
      });

      if (NOT_SUPPORTED_FILTERS.includes(param)) {
        clone.classList.add("type-unsupported");
        const icon = document
          .getElementById("js-unsupported-icon")
          ?.content?.children[0]?.cloneNode(true);
        clone.prepend(icon);
        clone.title =
          "(IGNORED) This filter is currently NOT supported by the API";
      } else if (fromUser) {
        url.overwrite("page", "1");
        url.append(param, this.node.dataset.item);
      }

      container.append(clone);
    }
  }

  toggleInclude(fromUser) {
    this.toggle(this.buttonInclude, this.node, "type-include", fromUser);
  }

  toggleExclude(fromUser) {
    this.toggle(this.node, this.buttonInclude, "type-exclude", fromUser);
  }

  reset() {
    this.node.classList.remove("on-selected");
    this.node.querySelector(".on-selected")?.classList.remove("on-selected");
  }
}

/** @param {HTMLButtonElement} node  */
function toggleFilter(button, fn, fromUser) {
  for (const widget of self.WIDGETS) {
    if (widget.node.id === button.parentElement.id) {
      widget[fn](fromUser);
    }
  }
  button.blur();
}
// from: ./web/pages/components/widget/input/searchbar.js
class SearchbarWidget {
  syncWith = URLQuery;

  /** @type {HTMLElement} */
  node;
  /** @type {Object.<string, HTMLElement>} */
  tree;

  /** @param {HTMLElement} node  */
  constructor(node) {
    this.node = node;
    this.tree = {
      input: node.querySelector("input"),
    };

    this.tree.input.addEventListener("change", () => {
      this.syncWith.onsync(this.node.dataset.id, this.tree.input.value);

      this.node.dispatchEvent(new Event("change"));
    });

    this.syncWith.syncTo(this.node.dataset.id, (value) => {
      this.tree.input.value = decodeURIComponent(value || "");
    });
  }
}
// from: ./web/pages/components/widget/select/select.js
class SelectWidget extends IClosableWidget {
  syncWith = URLQuery;

  /** @type {HTMLElement} */
  node;
  /** @type {Object.<string, HTMLElement>} */
  tree;

  /** @param {HTMLElement} node  */
  constructor(node) {
    super();

    this.node = node;
    this.tree = {
      footer: node.querySelector("footer"),
      button: node.querySelector(".js-button"),
      selected: node.querySelector(".js-button")?.querySelector("span"),
    };
    this._load();

    this.tree.button.addEventListener("click", () => {
      if (this.toggled) {
        this.close();
      } else {
        this.open();
      }
    });

    for (let i = 0; i < this.tree.footer.children.length; i++) {
      const child = this.tree.footer.children[i];
      child.addEventListener("click", () => {
        this.deselect(Number(this.node.dataset.index));
        this.select(i);
        this.close();

        this.syncWith.onsync(this.node.dataset.id, this.node.dataset.value);
      });
    }

    this.syncWith.syncTo(this.node.dataset.id, (value) => {
      this.select(this.find(value));
    });
    ClosableWidgets.push(this);
  }

  _load() {
    this.select(0);
  }

  open() {
    this.node.classList.add("--open");
    this.node.blur();
    this.tree.footer.children[Number(this.node.dataset.index)].focus();
    this.toggled = true;
  }

  close() {
    this.node.classList.remove("--open");
    this.toggled = false;
  }

  /** @param {number} index  */
  deselect(index) {
    const child = this.tree.footer.children[index];
    child.querySelector(".js-checked").style.setProperty("display", "none");
    child.querySelector(".js-unchecked").style.removeProperty("display");
  }

  /** @param {number} index  */
  select(index) {
    const child = this.tree.footer.children[index];
    this.tree.selected.innerHTML = child.querySelector("span").innerHTML.trim();

    child.querySelector(".js-unchecked").style.setProperty("display", "none");
    child.querySelector(".js-checked").style.removeProperty("display");
    this.node.dataset.index = String(index);
    this.node.dataset.value = child.dataset.value;
  }

  /**
   * @param {string} value
   * @returns {number}
   */
  find(value) {
    for (let i = 0; i < this.tree.footer.children.length; i++) {
      const child = this.tree.footer.children[i];
      if (child.dataset.value === value) {
        return i;
      }
    }

    return 0;
  }
}
// from: ./web/pages/components/widget/switch.js
class SwitchWidget {
  /** @type {HTMLDivElement} */
  node;
  /** @type {number} */
  length;

  /**
   * @param {HTMLDivElement} node
   */
  constructor(node) {
    this.node = node;
    this.length = node.firstElementChild.children.length;

    this.node.addEventListener("click", () => {
      let i = Number(this.node.dataset.selected) + 1;
      if (i >= this.length) {
        i = 0;
      }
      this.set(i);
    });

    SwitchWidgets.push(this);
  }

  /**
   * @param {string} value
   */
  findIndexOfValue(value) {
    for (let i = 0; i < this.node.firstElementChild.children.length; i++) {
      if (this.node.firstElementChild.children[i].dataset.name == value) {
        return i;
      }
    }

    return -1;
  }

  /**
   * @param {number} i
   */
  set(i) {
    this.node.style.setProperty("--offset", `${i}`);
    this.node.dataset.selected = `${i}`;
    this.node.dataset.name =
      this.node.firstElementChild.children[i].dataset.name;

    this.node.dispatchEvent(new Event("change"));
  }
}

/** @type {SwitchWidget[]} */
const SwitchWidgets = [];
