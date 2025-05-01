const TIMER = 5;
const carousells = [
  document.getElementById("js-carousell-1"),
  document.getElementById("js-carousell-2"),
];

/** @param {HTMLElement} node  */
function scrollCarousell(node) {
  const i = Number(node.dataset.i);
  node.dataset.i = String(i + 1);
  node.children[Number(node.dataset.offset)]
    .querySelector(".o-loading-bar")
    .classList.remove("on-playing");
  const offset = 4 - Math.abs((i % 8) - 4);
  node.style.setProperty("--offset", `${offset}`);
  node.dataset.offset = String(offset);
  node.children[Number(node.dataset.offset)]
    .querySelector(".o-loading-bar")
    .classList.add("on-playing");
}

this.setInterval(() => {
  scrollCarousell(carousells[0]);
  this.setTimeout(() => {
    scrollCarousell(carousells[1]);
  }, 200);
}, TIMER * 1000);

carousells[0];
