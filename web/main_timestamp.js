/** @param {HTMLElement} node  */
function processTimestamp(node) {
  node.innerHTML = getRelativeDate(new Date(Number(node.dataset.timestamp)));
}

const MINUTE = 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

/**
 * https://stackoverflow.com/a/7641822
 * @param {Date} date
 * @returns {string}
 */
function getRelativeDate(date) {
  let diff = (new Date().getTime() - date.getTime()) / 1_000;
  let day_diff = Math.floor(diff / 86_400);

  if (isNaN(day_diff) || day_diff < 0) return;

  return (
    (day_diff == 0 &&
      ((diff < MINUTE && "just now") ||
        (diff < MINUTE * 2 && "1 minute ago") ||
        (diff < HOUR && Math.floor(diff / MINUTE) + " minutes ago") ||
        (diff < HOUR * 2 && "1 hour ago") ||
        (diff < DAY && Math.floor(diff / HOUR) + " hours ago"))) ||
    (day_diff == 1 && "Yesterday") ||
    (day_diff < 7 && day_diff + " days ago") ||
    (day_diff < 31 && Math.ceil(day_diff / 7) + " weeks ago") ||
    Math.ceil(day_diff / 31) + " months ago"
  );
}
