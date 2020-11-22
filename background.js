window.browser = window.browser || window.chrome;

const googleSearchRegex = /https?:\/\/(((www)\.)?(google\.).*(\/search)|search\.(google\.).*)/;
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

let searchEngineInstance;
let disableSearchEngine;
let exceptions;

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

  let seInstance = privateSearchEngine.find(
    (i) => i.link == searchEngineInstance
  );
  seInstance = seInstance || getRandomInstance(privateSearchEngine);
  search = "";
  url.search
    .slice(1)
    .split("&")
    .forEach(function (input) {
      if (input.startsWith("q=")) search = input.substring(2);
    });
  return `${seInstance.link}${seInstance.q}${search}`;
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
    if (url.href.match(googleSearchRegex)) {
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
