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

const url = {
  instance: new URL(self.location),

  update() {
    history.pushState(null, "", this.instance);
    document.querySelectorAll("[data-inherit-url]").forEach((node) => {
      const attr = node.getAttribute("data-inherit-url");
      const value = node.getAttribute(attr) || self.location;
      if (value == null || attr == null) {
        return;
      }
      node.setAttribute(
        attr,
        value.split("?")[0] + "?" + this.instance.searchParams.toString(),
      );
    });

    self.onurlchanged();
  },

  get(key) {
    return this.instance.searchParams.get(key);
  },

  overwrite(key, value) {
    if (value == null) {
      this.instance.searchParams.delete(key);
    } else {
      this.instance.searchParams.set(key, value);
    }
    return this.update();
  },
};
// deno-lint-ignore-file no-unused-vars
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
  toggle(button, conflicting, tag) {
    const container = document.getElementById("js-filters");
    const id = this.node.id.replace("filter", "tag");

    conflicting.classList.remove("is-selected");
    container.querySelector(`#${id}`)?.remove();

    if (button.classList.contains("is-selected")) {
      button.classList.remove("is-selected");
    } else {
      button.classList.add("is-selected");

      const clone = container
        ?.querySelector("template")
        ?.content?.children[0].cloneNode(true);
      const copy = button.cloneNode(true);
      copy.querySelector("em")?.remove();

      clone.querySelector(".js-label").innerHTML = copy.innerText;
      clone.classList.add(tag);
      clone.id = id;
      clone.addEventListener("click", () => {
        this.toggle(button, conflicting, tag);
      });

      copy?.remove();
      container.append(clone);
    }
  }

  toggleInclude() {
    this.toggle(this.buttonInclude, this.node, "type-include");
  }

  toggleExclude() {
    this.toggle(this.node, this.buttonInclude, "type-exclude");
  }

  reset() {
    this.node.classList.remove("is-selected");
    this.node.querySelector(".is-selected")?.classList.remove("is-selected");
  }
}

/** @param {HTMLButtonElement} node  */
function toggleFilter(button, fn) {
  for (const widget of self.WIDGETS) {
    if (widget.node.id === button.parentElement.id) {
      widget[fn]();
    }
  }
  button.blur();
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
