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
  const searchParams = new URLSearchParams(self.location.search);
  searchParams.set("search", encodeURIComponent(node.value));
  self.location.search = searchParams.toString();
}
