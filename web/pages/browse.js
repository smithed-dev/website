{
  const browser = document.getElementById("browser");
  browser.setAttribute("hx-get", "/htmx/browse_packs");
}

onurlchanged = () => {
  const browser = document.getElementById("browser");
  htmx.process(browser);
  htmx.trigger(browser, "url-changed");
};
