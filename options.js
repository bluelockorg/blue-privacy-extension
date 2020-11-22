window.browser = window.browser || window.chrome;

const privateSearchEngine = [
  { link: "https://duckduckgo.com", q: "/?q=" },
  { link: "https://startpage.com", q: "/search/?q=" },
  { link: "https://www.qwant.com", q: "/?q=" },
  { link: "https://www.mojeek.com", q: "/search?q=" },
  { link: "https://metager.org", q: "/meta/meta.ger3?eingabe=" },
  { link: "https://swisscows.com", q: "/web?query=" },
  { link: "https://search.privacytools.io/searx", q: "/?q=" },
  { link: "https://spot.ecloud.global", q: "/?q=" },
  { link: "https://search.disroot.org", q: "/?q=" },
];

var searchEngineInstances = [];

for (i = 0; i < privateSearchEngine.length - 1; i++) {
  searchEngineInstances.push(privateSearchEngine[i].link);
}

let searchEngineInstance = document.querySelector("#searchEngine-instances");

let disableSearchEngine = document.querySelector("#disable-searchEngine");

browser.storage.sync.get(
  ["searchEngineInstance", "disableSearchEngine", "theme"],
  (result) => {
    searchEngineInstance.value = result.searchEngineInstance || "none";
    disableSearchEngine.checked = !result.disableSearchEngine;
  }
);

disableSearchEngine.addEventListener("change", (event) => {
  browser.storage.sync.set({ disableSearchEngine: !event.target.checked });
});

searchEngineInstance.addEventListener("change", (event) => {
  browser.storage.sync.set({
    searchEngineInstance: searchEngineInstance.selectedOptions[0].value,
  });
});
