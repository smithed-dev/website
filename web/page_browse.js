{
  const browser = document.getElementById("browser");
  browser.setAttribute("hx-get", "/htmx/browse_packs");
}

{
  const select = document.getElementById("js-id-select-sort");
  WIDGETS.filter((item) => item.node.id === select.id).forEach((node) => {
    const index = node.findIndexOfValue(url.get("sort")[0]);
    if (index === -1) {
      return;
    }
    node.set(index);
  });
}

/** @param {HTMLDivElement} node */
function applySorting(node) {
  url.overwrite("sort", node.querySelector("select")?.value);
}

/** @param {HTMLDivElement} node */
function applySearch(node) {
  url.overwrite("search", node.querySelector("input")?.value || null);
}

self.onurlchanged = () => {
  const browser = document.getElementById("browser");
  htmx.process(browser);
  htmx.trigger(browser, "url-changed");
};
