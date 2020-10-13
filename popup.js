let disableSearchEngine = document.querySelector("#disable-searchEngine");

window.browser = window.browser || window.chrome;

browser.storage.sync.get(["disableSearchEngine", "theme"], (result) => {
  if (result.theme) document.body.classList.add(result.theme);
  disableSearchEngine.checked = !result.disableSearchEngine;
});

version.textContent = browser.runtime.getManifest().version;

disableSearchEngine.addEventListener("change", (event) => {
  browser.storage.sync.set({ disableSearchEngine: !event.target.checked });
});

document.querySelector("#more-options").addEventListener("click", () => {
  browser.runtime.openOptionsPage();
});
