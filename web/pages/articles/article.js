import { marked } from "/static/marked.esm.js";

// https://stackoverflow.com/a/34064434
// Vulnerable af but idc
function htmlDecode(input) {
	var doc = new DOMParser().parseFromString(input, "text/html");
	return doc.documentElement.textContent;
}

const node = document.getElementById("markdown-content");
const decoded = htmlDecode(node.innerHTML.trim());

const container = node.parentElement;
container.innerHTML = marked.parse(decoded);
container.classList.remove("on-loading");
