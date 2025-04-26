class SelectWidget {
  /** @type {HTMLDivElement} */
  node;
  /** @type {Object.<string, HTMLElement>} */
  tree;

  constructor(node) {
    this.node = node;
    this.tree = {
      "<template>": node.querySelector("template"),
      "<select>": node.querySelector("select"),
      "<footer>": node.querySelector("footer"),
      "<button>": node.querySelector(".js-button"),
      selected: node.querySelector(".js-selected"),
    };
  }

  load() {
    this.tree["<select>"].value = this.tree["<select>"].children[0].value;
    this.node.dataset.index = "0";
    this.tree["selected"].innerHTML =
      this.tree["<select>"].children[0].innerText;

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

    this.node.style.setProperty("min-width", `${widestOption + 16 * 3}px`);
    this.tree["<button>"].addEventListener("click", () => {
      this.open();
    });

    self.WIDGETS = [...(self.WIDGETS || []), this];
  }

  open() {
    this.node.classList.add("--open");
    this.node.blur();
    this.tree["<footer>"].children[Number(this.node.dataset.index)].focus();
  }

  close() {
    this.node.classList.remove("--open");
  }
}
