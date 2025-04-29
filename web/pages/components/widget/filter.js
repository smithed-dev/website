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
      console.log(clone);

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
