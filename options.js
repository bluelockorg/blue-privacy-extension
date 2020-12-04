window.browser = (function () {
  return window.msBrowser || window.browser || window.chrome;
})();

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
  { link: "https://www.searchencrypt.com", q: "/search/?q=" },
  { link: "https://gibiru.com", q: "/results.html?q=" },
  { link: "https://www.yippy.com", q: "/search?query=" },
];

let searchEngineInstances;
let disableSearchEngine = document.querySelector("#disable-searchEngine");

browser.storage.sync.get(
  ["searchEngineInstances", "disableSearchEngine", "theme"],
  (result) => {
    disableSearchEngine.checked = !result.disableSearchEngine;
    makeList(
      privateSearchEngine,
      result.searchEngineInstances || [
        { link: "https://duckduckgo.com", q: "/?q=" },
        { link: "https://startpage.com", q: "/search/?q=" },
      ]
    );
    $("input").on("click", function () {
      var checkboxes = document.getElementsByClassName("searchEngine");
      var selected = [];
      for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
          selected.push(
            privateSearchEngine.find((obj) => obj.link == checkboxes[i].value)
          );
        }
      }
      browser.storage.sync.set({
        searchEngineInstances: selected,
      });
    });
  }
);

function makeList(list, selected) {
  var section = document.createElement("section");
  for (var k = 0; k < list.length; k++) {
    obj = list[k];
    var span = document.createElement("div");
    var input = document.createElement("input");
    input.name = `searchEngine${k}`;
    input.id = `searchEngine${k}`;
    input.type = "checkbox";
    input.className = "searchEngine";
    input.value = `${obj.link}`;
    for (var l = 0; l < selected.length; l++) {
      if (selected[l].link == list[k].link) input.checked = "checked";
    }
    var label = document.createElement("label");
    label.htmlFor = `searchEngine${k}`;
    label.innerText = obj.link;
    span.appendChild(input);
    span.appendChild(label);
    section.appendChild(span);
  }
  document.querySelector(".searchEngineInstances").appendChild(section);
}

disableSearchEngine.addEventListener("change", (event) => {
  browser.storage.sync.set({ disableSearchEngine: !event.target.checked });
});
