import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";

// https://stackoverflow.com/a/34064434
// Vulnerable af but idc
function htmlDecode(input) {
	var doc = new DOMParser().parseFromString(input, "text/html");
	return doc.documentElement.textContent;
}

const node = document.getElementById("markdown-content");
const decoded = htmlDecode(node.innerHTML.trim());

console.debug(decoded);
node.innerHTML = marked.parse(decoded);
node.classList.remove("on-loading");
