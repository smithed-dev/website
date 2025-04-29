/** @param {HTMLDivElement} node */
function gotoSearchPage(node) {
  const uri = new URL(self.location.origin);
  uri.searchParams.set("search", node.querySelector("input")?.value);

  self.location.href = encodeURI(
    [self.location.origin, "/browse?" + uri.searchParams.toString()].join("/"),
  );
}
