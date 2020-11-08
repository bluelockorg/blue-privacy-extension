const notPrivateSearchEngine = [
  "google.com",
  "google.co.jp",
  "www.google.com",
  "www.google.co.jp",
];
const privateSearchEngine = [
  { link: "https://duckduckgo.com", q: "/" },
  { link: "https://startpage.com", q: "/search/" },
  { link: "https://www.qwant.com", q: "/" },
  { link: "https://www.mojeek.com", q: "/search" },
];

let searchEngineInstance = {};
let disableSearchEngine;
let exceptions;

window.browser = window.browser || window.chrome;

browser.storage.sync.get(
  ["searchEngineInstance", "disableSearchEngine", "theme", "exceptions"],
  (result) => {
    searchEngineInstance = result.searchEngineInstance;
    disableSearchEngine = result.disableSearchEngine;
    exceptions = result.exceptions
      ? result.exceptions.map((e) => {
          return new RegExp(e);
        })
      : [];
  }
);

browser.storage.onChanged.addListener((changes) => {
  if ("searchEngineInstance" in changes) {
    searchEngineInstance = changes.searchEngineInstance.newValue;
  }

  if ("disableSearchEngine" in changes) {
    disableSearchEngine = changes.disableSearchEngine.newValue;
  }

  if ("exceptions" in changes) {
    exceptions = changes.exceptions.newValue.map((e) => {
      return new RegExp(e);
    });
  }
});

function getRandomInstance(instanceList) {
  return instanceList[~~(instanceList.length * Math.random())];
}

function isException(url, initiator) {
  return (
    exceptions.some((regex) => regex.test(url.href)) ||
    (initiator && exceptions.some((regex) => regex.test(initiator.href)))
  );
}

function redirectSearchEngine(url, initiator) {
  if (disableSearchEngine || isException(url, initiator)) {
    return null;
  }
  if (url.pathname.includes("/home")) {
    return null;
  }
  if (url.pathname.includes("search")) {
    searchEngine =
      searchEngineInstance || getRandomInstance(privateSearchEngine);
    search = "";
    url.search
      .slice(1)
      .split("&")
      .forEach(function (input) {
        if (input.startsWith("q=")) search = input;
      });
    console.log("search: ", search);
    return `${searchEngine.link}${searchEngine.q}?${search}`;
  }
}

browser.webRequest.onBeforeRequest.addListener(
  (details) => {
    const url = new URL(details.url);
    let initiator;
    if (details.originUrl) {
      initiator = new URL(details.originUrl);
    } else if (details.initiator) {
      initiator = new URL(details.initiator);
    }
    let redirect;
    if (notPrivateSearchEngine.includes(url.host)) {
      redirect = {
        redirectUrl: redirectSearchEngine(url, initiator),
      };
    }
    if (redirect && redirect.redirectUrl) {
      console.info(
        "Redirecting",
        `"${url.href}"`,
        "=>",
        `"${redirect.redirectUrl}"`
      );
      console.info("Details", details);
    }
    return redirect;
  },
  {
    urls: ["<all_urls>"],
  },
  ["blocking"]
);
