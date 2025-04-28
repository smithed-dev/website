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
  htmx.trigger(node, "manual-reload", {});
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
  const tagsContainer = document.getElementById("js-filters");
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

  if (mode === "exclude") {
    return; // Not yet supported by the API
  }

  /** @type {HTMLButtonElement} */
  const template = tagsContainer
    .querySelector("template")
    .content.querySelector("button")
    .cloneNode(true);
  template.querySelector(".js-label").innerHTML = node.innerText;
  template.id = id;
  template.dataset.name = container.dataset.item;
  template.addEventListener("click", () => {
    _toggleFilter(node, "type-selected", "type-filtered", "include");
  });

  tagsContainer.append(template);
  let param = [self.THIS_URL.searchParams.get(container.dataset.param)];
  if (param[0] == null) {
    param = [];
  } else {
    param = [...decodeURIComponent(param).split(",")];
  }
  self.THIS_URL.searchParams.set(
    container.dataset.param,
    [...param, container.dataset.item].filter((a) => a).join(","),
  );
  reloadParams();
}

/** @param {HTMLButtonElement} node  */
function toggleFilterInclude(node) {
  _toggleFilter(node, "type-selected", "type-filtered", "include");
}

/** @param {HTMLButtonElement} node  */
function toggleFilterExclude(node) {
  _toggleFilter(node, "type-filtered", "type-selected", "exclude");
}
