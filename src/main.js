/** @type {URLSearchParams} */
self.QueryParams = new URLSearchParams(self.location.search);

function reloadParams() {
  self.location.search = self.QueryParams.toString();
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
    self.QueryParams.set("search", value);
  reloadParams();
}
