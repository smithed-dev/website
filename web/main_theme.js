function applyGlobalTheme(value) {
	for (const item of document.body.classList.values()) {
		document.body.classList.remove(item);
	}

	document.body.classList.add(`theme-${value}`);
	Cookies.set("prefered-theme", value, { path: "/", days: 30 });
}
