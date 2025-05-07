class AccountWidget {
  /** @type {HTMLButtonElement} */
  node;

  constructor(node) {
    this.node = node;
    ClosableWidgets.push(this);
  }

  close() {
    document
      .getElementById("profile-dropdown")
      .style.removeProperty("visibility");
  }
}

/** @param {HTMLDivElement} node */
function gotoSearchPage(node) {
  const uri = new URL(self.location.origin);
  uri.searchParams.set("search", node.querySelector("input")?.value);

  self.location.href = encodeURI(
    [self.location.origin, "/browse?" + uri.searchParams.toString()].join("/"),
  );
}

/** @param {HTMLButtonElement} node */
function toggleDropdown() {
  const dropdown = document.getElementById("profile-dropdown");
  dropdown.style.setProperty("visibility", "visible");
}
