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
