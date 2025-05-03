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

let interval;

/** @param {HTMLElement} node  */
function pauseCarousell(node) {
  clearInterval(interval);
  node.querySelectorAll(".on-playing").forEach((element) => {
    element.classList.remove("on-playing");
  });
}

/** @param {HTMLElement} node  */
function continueCarousell(node) {
  interval = this.setInterval(() => {
    scrollCarousell(carousells[0]);
    this.setTimeout(() => {
      scrollCarousell(carousells[1]);
    }, 200);
  }, TIMER * 1000);

  carousells[0].children[Number(carousells[0].dataset.offset)]
    .querySelector(".o-loading-bar")
    .classList.add("on-playing");
  carousells[1].children[Number(carousells[1].dataset.offset)]
    .querySelector(".o-loading-bar")
    .classList.add("on-playing");
}
continueCarousell(null);
