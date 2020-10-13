const notPrivateSearchEngine = ["google.com", "www.google.com"];
const privateSearchEngine = [
  "https://duckduckgo.com",
  "https://startpage.com",
  "https://www.qwant.com",
];

let searchEngineInstance;
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

function isFirefox() {
  return typeof InstallTrigger !== "undefined";
}

function redirectSearchEngine(url, initiator) {
  if (disableSearchEngine || isException(url, initiator)) {
    return null;
  }
  if (url.pathname.includes("/home")) {
    return null;
  }
  if (
    isFirefox() &&
    initiator &&
    (initiator.origin === searchEngineInstance ||
      searchEngineInstance.includes(initiator.origin) ||
      notPrivateSearchEngine.includes(initiator.host))
  ) {
    browser.storage.sync.set({
      redirectBypassFlag: true,
    });
    return null;
  }
  console.log("abcd" + url);
  if (url.pathname.includes("search")) {
    return `${
      searchEngineInstance || getRandomInstance(privateSearchEngine)
    }${`/search/`}${url.search}`;
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
