/*
 * the /browse page
 */

/**
 * @param {HTMLButtonElement} node
 * @param {string} toggled - The class name of the toggled filter
 * @param {string} opposing - The class name of the opposing filter
 * @param {string} mode - The mode, which is 'exclude' or 'include'
 */
function _toggleFilter(node, toggled, opposing, mode) {
  node.blur();
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

  /** @type {HTMLButtonElement} */
  const template = document
    .getElementById(`js-${mode}-tag`)
    .content.querySelector("button")
    .cloneNode(true);
  template.prepend(
    document.getElementById(`icon-${container.dataset.param}`).cloneNode(true),
  );
  template.querySelector("span").innerHTML = container.innerText;
  template.id = id;
  template.dataset.param = container.dataset.param;
  template.dataset.item = container.dataset.item;

  const filtersContainer = document.getElementById("js-filters");
  filtersContainer.appendChild(template);
}

/** @param {HTMLButtonElement} node  */
function toggleFilterInclude(node) {
  _toggleFilter(node, "type-selected", "type-filtered", "include");
}

/** @param {HTMLButtonElement} node  */
function toggleFilterExclude(node) {
  _toggleFilter(node, "type-filtered", "type-selected", "exclude");
}

/** @param {HTMLButtonElement} node  */
function removeFilter(node) {
  const button = document.querySelector(
    `.w-filter[data-param="${node.dataset.param}"][data-item="${node.dataset.item}"]`,
  );

  button.classList.remove("type-selected");
  button.classList.remove("type-filtered");
  node.remove();
}

/** @type {SelectWidget[]} */
const SELECT_WIDGETS = [];

class SelectWidget {
  /** @type {HTMLDivElement} */
  node;
  /** @type {HTMLTemplateElement} */
  templateNode;
  /** @type {HTMLSelectElement} */
  selectNode;
  /** @type {HTMLElement} */
  footerNode;
  /** @type {HTMLSpanElement} */
  selectedNode;
  /** @type {number} */
  index;

  /** @param {HTMLDivElement} */
  constructor(node) {
    this.node = node;

    this.templateNode = node.querySelector("template");
    if (this.templateNode == null) {
      console.error("<.w-select> can't query the <template> node");
      return;
    }

    this.selectNode = node.querySelector("select");
    if (this.selectNode == null) {
      console.error("<.w-select> can't query the <select> node");
      return;
    }

    this.footerNode = node.querySelector(".js-options");
    if (this.footerNode == null) {
      console.error("<.w-select> can't query the <.js-options> node");
      return;
    }

    this.selectedNode = node.querySelector(".js-selected");
    if (this.selectedNode == null) {
      console.error("<.w-select> can't query the <.js-selected> node");
      return;
    }
  }

  /** Synchronizes the hidden <select> element with the custom one */
  sync() {
    /** @type {HTMLElement} */
    const templateItem = this.templateNode.content.querySelector("button");
    let maxWidth = 0;

    for (let i = 0; i < this.selectNode.children.length; i++) {
      const child = this.selectNode.children[i];

      /** @type {HTMLElement} */
      const item = templateItem.cloneNode(true);
      item.querySelector("span").innerHTML = child.innerText;
      item.dataset.id = child.id;

      if (i == 0) {
        this.selectedNode.innerHTML = child.innerText;
        this.selectOption(item, i);
      }

      this.footerNode.appendChild(item);
      item.addEventListener("click", (_) => this.choose(i));
      if (item.clientWidth > maxWidth) {
        maxWidth = item.clientWidth;
      }
    }

    this.node.style.setProperty("min-width", `${maxWidth + 48}px`);
  }

  toggle() {
    if (this.node.classList.contains("is-open")) {
      this.close();
      return;
    } else {
      this.open();
    }
  }

  close() {
    this.node.classList.remove("is-open");
    this.footerNode.style.setProperty("visibility", "hidden");
  }

  open() {
    // if (self.mobileCheck()) {
    //   if ("showPicker" in HTMLSelectElement.prototype) {
    //     this.selectNode.showPicker();
    //   } else {
    //     const event = new MouseEvent("mousedown", {
    //       bubbles: true,
    //       cancelable: true,
    //       view: self,
    //     });
    //     this.selectNode.dispatchEvent(event);
    //   }
    //   return;
    // }
    this.node.classList.add("is-open");
    this.footerNode.style.removeProperty("visibility");
  }

  /** @param {number} index */
  choose(index) {
    const chosen = this.footerNode.children[index];
    this.deselectOption(this.footerNode.children[this.index]);
    this.selectOption(chosen, index);
    this.selectedNode.innerHTML = chosen.innerText;
    this.close();
  }

  /**
   * @param {HTMLButtonElement} option
   * @param {number} index
   */
  selectOption(option, index) {
    option.querySelector(".js-unchecked").style.setProperty("display", "none");
    option.querySelector(".js-checked").style.removeProperty("display");
    this.index = index;
    this.node.dataset.selected = this.selectNode.children[index].value;
  }

  /** @param {HTMLButtonElement} option  */
  deselectOption(option) {
    option.querySelector(".js-checked").style.setProperty("display", "none");
    option.querySelector(".js-unchecked").style.removeProperty("display");
  }

  onWindowResized() {
    const viewportHeight = Math.max(
      document.documentElement.clientHeight || 0,
      self.innerHeight || 0,
    );
    const height = 32 * this.footerNode.children.length + 4;

    if (!this.node.classList.contains("is-reversed")) {
      const diff =
        viewportHeight -
        (this.node.getBoundingClientRect().bottom + height) -
        16;

      if (diff < 0) {
        this.footerNode.style.setProperty(
          "height",
          `${Math.round(height + diff)}px`,
        );
      }

      if (this.footerNode.getBoundingClientRect().height < 128) {
        this.node.classList.add("is-reversed");
        this.footerNode.style.removeProperty("height");
      }
    }
  }

  /** @param {HTMLSelectElement} node */
  set(node) {
    this.selectedNode.innerHTML = node.children[node.selectedIndex].innerText;

    const chosen = this.footerNode.children[node.selectedIndex];
    this.deselectOption(this.footerNode.children[this.index]);
    this.selectOption(chosen, node.selectedIndex);
  }
}

/** @param {HTMLDivElement} node  */
function loadSelectWidget(node) {
  const widget = new SelectWidget(node);
  widget.sync();
  node.dataset.index = SELECT_WIDGETS.length;
  SELECT_WIDGETS.push(widget);
}

/** @param {number} index  */
function toggleSelectWidget(index) {
  if (index == null) {
    console.error("<.w-select> doesn't have a valid index");
    return;
  }

  SELECT_WIDGETS[index].toggle();
}

/** @param {HTMLSelectElement} node  */
function changeSelectWidget(node) {
  SELECT_WIDGETS[node.parentElement.dataset.index].set(node);
}

/** @param {HTMLButtonElement} node  */
function toggleVersionsFilter(node) {
  if (node.classList.contains("type-include")) {
    node.classList.remove("type-include");
    node.classList.add("type-inactive");
    document.querySelectorAll(".js-not-stable").forEach(
      /** @param {HTMLElement} element  */
      (element) => {
        element.style.removeProperty("display");
      },
    );
  } else {
    node.classList.add("type-include");
    node.classList.remove("type-inactive");
    document.querySelectorAll(".js-not-stable").forEach(
      /** @param {HTMLElement} element  */
      (element) => {
        element.style.setProperty("display", "none");
      },
    );
  }
  node.blur();
}

function documentLoaded() {
  self.addEventListener(
    "click",
    /** @param {MouseEvent} event */
    (event) => {
      for (const widget of SELECT_WIDGETS) {
        if (!widget.node.contains(event.target)) {
          widget.close();
        }
      }
    },
  );

  const whenSelectWidgetsResized = (_) => {
    for (const widget of SELECT_WIDGETS) {
      widget.onWindowResized();
    }
  };
  self.addEventListener("resize", whenSelectWidgetsResized);
  self.addEventListener("scroll", whenSelectWidgetsResized);
  whenSelectWidgetsResized();

  const carousellLeft = document.getElementById("js-carousell-1");
  const carousellRight = document.getElementById("js-carousell-2");
  const scrollArr = [0, 1, 2, 1];
  const interval = 2;

  function scrollCarousell(node) {
    let i = Number(node.dataset.i);
    if (i >= scrollArr.length) {
      i = 0;
    }
    const currentScroll = scrollArr[i];

    node.dataset.i = String(i + 1);
    // node.style.setProperty(
    //   "transform",
    //   `translateY(${-26.5 * currentScroll}rem)`,
    // );
    node.style.setProperty("--offset", `${-26.5 * currentScroll}rem`);
  }

  if (carousellLeft != null && carousellRight != null) {
    self.setInterval(() => {
      scrollCarousell(carousellLeft);
    }, interval * 1000);
    self.setInterval(
      () => {
        scrollCarousell(carousellRight);
      },
      interval * 1000 + 100,
    );
  }
}
