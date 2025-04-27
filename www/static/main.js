
class SelectWidget {
  /** @type {HTMLDivElement} */
  node;
  /** @type {Object.<string, HTMLElement>} */
  tree;
  /** @type {boolean} */
  toggled;

  constructor(node) {
    this.node = node;
    this.tree = {
      "<template>": node.querySelector("template"),
      "<select>": node.querySelector("select"),
      "<footer>": node.querySelector("footer"),
      "<button>": node.querySelector(".js-button"),
      selected: node.querySelector(".js-selected"),
    };

    this.node.addEventListener("change", () => {
      self.THIS_URL.searchParams.set("sort", this.tree["<select>"].value);
      reloadParams();
    });
  }

  load() {
    /** @type {HTMLButtonElement} */
    const template = this.tree["<template>"].content.querySelector("button");

    let widestOption = 0;
    let i = 0;
    for (const option of this.tree["<select>"].children) {
      /** @type {HTMLButtonElement} */
      const item = template.cloneNode(true);

      if (this.tree["<select>"].value === option.value) {
        item
          .querySelector(".js-indicator-unchecked")
          .style.setProperty("display", "none");
      } else {
        item
          .querySelector(".js-indicator-checked")
          .style.setProperty("display", "none");
      }

      item.querySelector(".js-item").innerHTML = option.innerText;
      item.dataset.index = i;
      item.dataset.value = option.value;

      this.tree["<footer>"].append(item);
      if (item.clientWidth > widestOption) {
        widestOption = item.clientWidth;
      }

      item.addEventListener("click", () => {
        const index = item.dataset.index;
        this.tree["<select>"].value =
          this.tree["<select>"].children[Number(index)].value;
        this.node.dispatchEvent(new Event("change"));
        this.node.dataset.index = index;

        item.parentElement.parentElement
          .querySelectorAll(".js-indicator-checked")
          .forEach((indicator) =>
            indicator.style.setProperty("display", "none"),
          );
        item.parentElement.parentElement
          .querySelectorAll(".js-indicator-unchecked")
          .forEach((indicator) => indicator.style.removeProperty("display"));

        item
          .querySelector(".js-indicator-unchecked")
          .style.setProperty("display", "none");
        item
          .querySelector(".js-indicator-checked")
          .style.removeProperty("display");

        this.tree["selected"].innerHTML =
          this.tree["<select>"].children[Number(index)].innerText;

        this.close();
      });
      i++;
    }

    this.node.style.setProperty("min-width", `${widestOption + 16 * 5}px`);
    this.tree["<button>"].addEventListener("click", () => {
      if (this.toggled) {
        this.close();
      } else {
        this.open();
      }
    });

    const sort = self.THIS_URL.searchParams.get("sort");
    let index = 0;
    if (sort != null) {
      for (const option of this.tree["<select>"].children) {
        if (option.value === sort) {
          break;
        }
        index++;
      }
    }
    this.tree["<select>"].value = this.tree["<select>"].children[index].value;
    this.node.dataset.index = String(index);
    this.tree["selected"].innerHTML =
      this.tree["<select>"].children[index].innerText;

    self.WIDGETS = [...(self.WIDGETS || []), this];
  }

  open() {
    this.node.classList.add("--open");
    this.node.blur();
    this.tree["<footer>"].children[Number(this.node.dataset.index)].focus();
    this.toggled = true;
  }

  close() {
    this.node.classList.remove("--open");
    this.toggled = false;
  }
}
self.THIS_URL = new URL(self.location);

function reloadParams() {
  history.pushState(null, "", self.THIS_URL);
  const node = document.getElementById("browse_packs");
  node.setAttribute(
    "hx-get",
    node.getAttribute("hx-get").split("?")[0] +
      "?" +
      self.THIS_URL.searchParams.toString(),
  );
  htmx.process(node);
  htmx.trigger(node, "reload", {});
}

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

/** @param {HTMLInputElement} node  */
function onSearchBarChanged(node) {
  const value = encodeURIComponent(node.value);
  if (value === "") {
    self.THIS_URL.searchParams.delete("search");
  } else {
    self.THIS_URL.searchParams.set("search", value);
  }
  reloadParams();
}

/**
 * @param {HTMLButtonElement} node
 * @param {string} toggled - The class name of the toggled filter
 * @param {string} opposing - The class name of the opposing filter
 * @param {string} mode - The mode, which is 'exclude' or 'include'
 */
function _toggleFilter(node, toggled, opposing, mode) {
  node.blur();
  const container = node.parentElement;
  const id = `js-filter-${container.dataset.param}-${container.dataset.item}`;

  if (container.classList.contains(toggled)) {
    container.classList.remove(toggled);
    document.getElementById(id)?.remove();
    return;
  }

  if (container.classList.contains(opposing)) {
    container.classList.remove(opposing);
    document.getElementById(id)?.remove();
  }

  container.classList.add(toggled);
}

/** @param {HTMLButtonElement} node  */
function toggleFilterInclude(node) {
  _toggleFilter(node, "type-selected", "type-filtered", "include");
}

/** @param {HTMLButtonElement} node  */
function toggleFilterExclude(node) {
  _toggleFilter(node, "type-filtered", "type-selected", "exclude");
}
