// deno-lint-ignore no-unused-vars
class WidgetSearchbar {
  /** @type {HTMLInputElement} */
  node;
  /** @type {HTMLElement} */
  dropdown;
  /** @type {HTMLTemplateElement} */
  template;

  /** @param {HTMLInputElement} node */
  constructor(node) {
    this.node = node;
    this.dropdown = node.parentElement.querySelector(".w-dropdown");
    this.template = node.parentElement.querySelector("#js-searchbar-default");

    if (this.template != null) {
      const children = [];
      for (const child of this.template.content.children) {
        children.push(child.cloneNode(true));
      }
      this.dropdown.replaceChildren(...children);
    }
  }
}
