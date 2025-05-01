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

{
  const select = document.getElementById("js-id-switch-layout");
  WIDGETS.filter((item) => item.node.id === select.id).forEach((node) => {
    const cookie = Cookies.get("prefered-layout");
    if (cookie == null) {
      return;
    }

    const index = node.findIndexOfValue(cookie);
    if (index === -1) {
      return;
    }
    node.set(index);
  });
}

{
  for (const param of ["category", "version"]) {
    const items = url.get(param);
    for (const item of items) {
      for (const container of document.querySelectorAll(
        `[data-param="${param}"]`,
      )) {
        if (container.dataset.item === item) {
          toggleFilter(
            container.querySelector("button"),
            "toggleInclude",
            false,
          );
        }
      }
    }
  }
}

{
  const search = document.getElementById("search");
  search.value = decodeURIComponent(url.get("search")[0] || "");
}

/** @param {HTMLDivElement} node */
function applySorting(node) {
  url.overwrite("sort", node.querySelector("select")?.value);
}

/** @param {HTMLDivElement} node */
function applySearch(node) {
  url.overwrite("page", "1");
  url.overwrite("search", node.querySelector("input")?.value || null);
}

/** @param {HTMLDivElement} node */
function applyLayout(node) {
  const selected = node.dataset.name;
  Cookies.set("prefered-layout", selected, { sameSite: "Strict" });
  document.getElementById("js-apply-layout").dataset.layout = selected;

  if (selected == "grid") {
    const browser = document.getElementById("browser");
    htmx.trigger(browser, "url-changed");
  }
}

self.onurlchanged = () => {
  const browser = document.getElementById("browser");
  htmx.process(browser);
  htmx.trigger(browser, "url-changed");
};
