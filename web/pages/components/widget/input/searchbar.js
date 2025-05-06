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
      this.tree.input.value = decodeURIComponent(value[0] || "");
    });
  }
}
