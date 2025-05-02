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
class SelectWidget {
  /** @type {HTMLDivElement} */
  node;
  /** @type {Object.<string, HTMLElement>} */
  tree;
  /** @type {boolean} */
  toggled = false;

  constructor(node) {
    this.node = node;
    this.tree = {
      template: node.querySelector("template"),
      select: node.querySelector("select"),
      footer: node.querySelector("footer"),
      button: node.querySelector(".js-button"),
      selected: node.querySelector(".js-selected"),
    };

    // whenever the native <select> changes, mirror into our widget
    this.tree.select.addEventListener("change", () => {
      const idx = Array.prototype.indexOf.call(
        this.tree.select.children,
        this.tree.select.selectedOptions[0],
      );
      this.set(idx);
    });
  }

  /**
   * Build the list of buttons in the footer, attach click handlers
   */
  load() {
    const btnTemplate = /** @type {HTMLButtonElement} */ (
      this.tree.template.content.querySelector("button")
    );

    // clear any existing items
    this.tree.footer.innerHTML = "";

    Array.from(this.tree.select.children).forEach((option, idx) => {
      const item = /** @type {HTMLButtonElement} */ (
        btnTemplate.cloneNode(true)
      );

      item.querySelector(".js-item").innerHTML = option.innerText;
      item.dataset.index = String(idx);
      item.dataset.value = option.value;

      item.addEventListener("click", () => {
        this.set(idx);
        // propagate events
        this.tree.select.dispatchEvent(new Event("change"));
        this.node.dispatchEvent(new Event("change"));
        this.close();
      });

      this.tree.footer.append(item);
    });

    // wire up the toggle button
    this.tree.button.addEventListener("click", () => {
      this.toggled ? this.close() : this.open();
    });

    // pick initial (first) item
    this.set(0);
    // register globally if you still need it
    self.WIDGETS = [...(self.WIDGETS || []), this];
  }

  /**
   * Centralized selector: updates the <select>, the footer buttons,
   * the visible label, and the data-index on the root node.
   *
   * @param {number} index
   */
  set(index) {
    const options = this.tree.select.children;
    if (index < 0 || index >= options.length) return;

    // update the native select
    this.tree.select.value = options[index].value;
    this.node.dataset.index = String(index);

    // update footer button indicators
    this.tree.footer.querySelectorAll("button").forEach((btn, btnIdx) => {
      const checked = btnIdx === index;
      btn
        .querySelector(".js-indicator-checked")
        .style.setProperty("display", checked ? "" : "none");
      btn
        .querySelector(".js-indicator-unchecked")
        .style.setProperty("display", checked ? "none" : "");
    });

    // update the label
    this.tree.selected.innerHTML = options[index].innerText;
  }

  /**
   * @param {string} name
   * @returns {number}
   * */
  findIndexOfValue(value) {
    for (let i = 0; i < this.tree.select.children.length; i++) {
      if (this.tree.select.children[i].value == value) {
        return i;
      }
    }
    return -1;
  }

  open() {
    this.node.classList.add("--open");
    // focus the currently selected item
    const idx = Number(this.node.dataset.index);
    this.tree.footer.children[idx]?.focus();
    this.toggled = true;
  }

  close() {
    this.node.classList.remove("--open");
    this.toggled = false;
  }
}
// deno-lint-ignore-file no-unused-vars

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
class SwitchWidget {
  /** @type {HTMLDivElement} */
  node;
  /** @type {number} */
  length;

  constructor(node) {
    this.node = node;
    this.length = node.firstElementChild.children.length;

    self.WIDGETS = [...(self.WIDGETS || []), this];
  }

  load() {
    this.node.addEventListener("click", () => {
      let i = Number(this.node.dataset.selected) + 1;
      if (i >= this.length) {
        i = 0;
      }
      this.set(i);
    });
  }

  findIndexOfValue(value) {
    for (let i = 0; i < this.node.firstElementChild.children.length; i++) {
      if (this.node.firstElementChild.children[i].dataset.name == value) {
        return i;
      }
    }

    return -1;
  }

  set(i) {
    this.node.style.setProperty("--offset", `${i}`);
    this.node.dataset.selected = `${i}`;
    this.node.dataset.name =
      this.node.firstElementChild.children[i].dataset.name;

    this.node.dispatchEvent(new Event("change"));
  }

  close() {}
}
class LoginWidget {
  /** @type {HTMLButtonElement} */
  node;

  constructor(node) {
    this.node = node;
    self.WIDGETS = [...(self.WIDGETS || []), this];
  }

  close() {
    document
      .getElementById("profile-dropdown")
      .style.removeProperty("visibility");
  }
}

/** @param {HTMLDivElement} node */
function gotoSearchPage(node) {
  const uri = new URL(self.location.origin);
  uri.searchParams.set("search", node.querySelector("input")?.value);

  self.location.href = encodeURI(
    [self.location.origin, "/browse?" + uri.searchParams.toString()].join("/"),
  );
}

/** @param {HTMLButtonElement} node */
function toggleDropdown(node) {
  const dropdown = document.getElementById("profile-dropdown");
  dropdown.style.setProperty("visibility", "visible");
}
