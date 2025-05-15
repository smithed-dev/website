/** @param {HTMLElement} node  */
function applyTheme(node) {
	applyGlobalTheme(node.value);
}

{
	const value = Cookies.get("prefered-theme");
	if (value) {
		document.getElementById(`theme-${value}`).checked = true;
	}
}
