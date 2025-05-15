{
	const browser = document.getElementById("browser");
	browser.setAttribute("hx-get", "/htmx/browse_packs");
}

onurlchanged = () => {
	const browser = document.getElementById("browser");
	htmx.process(browser);
	htmx.trigger(browser, "url-changed");
};

{
	const select = document.getElementById("js-id-switch-layout");
	SwitchWidgets.filter((item) => item.node.id === select.id).forEach((node) => {
		const cookie = Cookies.get("prefered-layout");
		if (cookie == null) return;

		const index = node.findIndexOfValue(cookie);
		if (index === -1) return;
		node.set(index);
	});
}

/** @param {HTMLElement} node  */
function applyLayout(node) {
	const selected = node.dataset.name;
	Cookies.set("prefered-layout", selected, { path: "/" });
	document.getElementById("js-apply-layout").dataset.layout = selected;

	if (selected == "grid") {
		const browser = document.getElementById("browser");
		htmx.trigger(browser, "url-changed");
	}
}

{
	for (const param of ["category", "version"]) {
		const items = URLQuery.get(param);
		for (const item of items) {
			for (const container of document.querySelectorAll(`[data-param="${param}"]`)) {
				if (container.dataset.item === item) {
					toggleFilter(container.querySelector("button"), "toggleInclude", false);
				}
			}
		}
	}
}

/** @param {HTMLButtonElement} node */
function showFilters() {
	document.body.classList.add("block-scroll");
	document.querySelector(".l-with-sidebar")?.querySelector("aside")?.style?.setProperty("display", "flex");
	scrollTo(0, 0);
}

/** @param {HTMLButtonElement} node */
function hideFilters() {
	document.body.classList.remove("block-scroll");
	document.querySelector(".l-with-sidebar")?.querySelector("aside")?.style?.removeProperty("display");
}
