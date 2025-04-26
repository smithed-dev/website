const TIMER = 2;
const carousells = [
  document.getElementById("js-carousell-1"),
  document.getElementById("js-carousell-2"),
];

/** @param {HTMLElement} node  */
function scrollCarousell(node) {
  const i = Number(node.dataset.i);
  node.dataset.i = String(i + 1);
  node.style.setProperty("--offset", `${4 - Math.abs((i % 8) - 4)}`);
}

this.setInterval(() => {
  scrollCarousell(carousells[0]);
  this.setTimeout(() => {
    scrollCarousell(carousells[1]);
  }, 200);
}, TIMER * 1000);
