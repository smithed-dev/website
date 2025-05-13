import { marked } from "/static/marked.esm.js";

// https://stackoverflow.com/a/34064434
// Vulnerable af but idc
function htmlDecode(input) {
	var doc = new DOMParser().parseFromString(input, "text/html");
	return doc.documentElement.textContent;
}

const decoded = htmlDecode(markdown_content.innerHTML.trim());

const container = markdown_content.parentElement;
container.innerHTML = marked.parse(decoded);
container.classList.remove("on-loading");
