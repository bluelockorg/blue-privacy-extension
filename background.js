window.browser = window.browser || window.chrome;

const googleSearchRegex = /https?:\/\/(((www|search)\.)?(google\.).*(\/search)|search\.(google\.).*)/;
const yahooSearchRegex = /https?:\/\/(((www|search)\.)?(yahoo\.).*(\/search)|search\.(yahoo\.).*)/;
const bingSearchRegex = /https?:\/\/(((www|search)\.)?(bing\.).*(\/search)|search\.(bing\.).*)/;
const yandexSearchRegex = /https?:\/\/(((www|search)\.)?(yandex\.).*(\/search)|search\.(yandex\.).*)/;
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
let disableSearchEngine;
let exceptions;

browser.storage.sync.get(
  ["searchEngineInstances", "disableSearchEngine", "theme", "exceptions"],
  (result) => {
    searchEngineInstances = result.searchEngineInstances;
    disableSearchEngine = result.disableSearchEngine;
    exceptions = result.exceptions
      ? result.exceptions.map((e) => {
          return new RegExp(e);
        })
      : [];
  }
);

browser.storage.onChanged.addListener((changes) => {
  if ("searchEngineInstances" in changes) {
    searchEngineInstances = changes.searchEngineInstances.newValue;
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
  seInstance =
    getRandomInstance(searchEngineInstances) ||
    getRandomInstance(privateSearchEngine);
  search = "";
  if (url.href.match(googleSearchRegex) || url.href.match(bingSearchRegex)) {
    url.search
      .slice(1)
      .split("&")
      .forEach(function (input) {
        if (input.startsWith("q=")) search = input.substring(2);
      });
  } else if (url.href.match(yahooSearchRegex)) {
    url.search
      .slice(1)
      .split("&")
      .forEach(function (input) {
        if (input.startsWith("p=")) search = input.substring(2);
      });
  } else if (url.href.match(yandexSearchRegex)) {
    url.search
      .slice(1)
      .split("&")
      .forEach(function (input) {
        if (input.startsWith("text=")) search = input.substring(5);
      });
  }

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
    if (
      url.href.match(googleSearchRegex) ||
      url.href.match(yahooSearchRegex) ||
      url.href.match(bingSearchRegex) ||
      url.href.match(yandexSearchRegex)
    ) {
      console.log("abc");
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
