self.onurlchanged = () => {};

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

const url = {
  instance: new URL(self.location),

  update() {
    history.pushState(null, "", this.instance);
    document.querySelectorAll("[data-inherit-url]").forEach((node) => {
      const attr = node.getAttribute("data-inherit-url");
      const value = node.getAttribute(attr) || self.location;
      if (value == null || attr == null) {
        return;
      }
      node.setAttribute(
        attr,
        value.split("?")[0] + "?" + this.instance.searchParams.toString(),
      );
    });

    self.onurlchanged();
  },

  get(key) {
    return this.instance.searchParams.get(key);
  },

  overwrite(key, value) {
    if (value == null) {
      this.instance.searchParams.delete(key);
    } else {
      this.instance.searchParams.set(key, value);
    }
    return this.update();
  },
};
