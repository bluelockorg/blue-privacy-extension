window.browser = (function () {
  return window.msBrowser || window.browser || window.chrome;
})();

let disableSearchEngine = document.querySelector("#disable-searchEngine");

let passLength = document.getElementById("length");
let passLengthSlider = document.getElementById("lengthSlider");
let passLower = document.getElementById("lowercase");
let passUpper = document.getElementById("uppercase");
let passNum = document.getElementById("number");
let passSym = document.getElementById("symbol");

let passwordComponent = document.getElementById("password");
let password;

browser.storage.sync.get(
  [
    "disableSearchEngine",
    "passLength",
    "passLower",
    "passUpper",
    "passNum",
    "passSym",
    "theme",
  ],
  (result) => {
    if (result.theme) document.body.classList.add(result.theme);
    disableSearchEngine.checked = !result.disableSearchEngine;
    passLength.value = result.passLength ? result.passLength : 16;
    passLengthSlider.value = passLength.value;
    passLower.checked = result.passLower ? !result.passLower : true;
    passUpper.checked = result.passUpper ? !result.passUpper : true;
    passNum.checked = result.passNum ? !result.passNum : true;
    passSym.checked = result.passSym ? !result.passSym : true;

    password = makePass(
      passLower.checked,
      passUpper.checked,
      passNum.checked,
      passSym.checked,
      passLength.value
    );
    passwordComponent.innerText = password;
  }
);

version.textContent = browser.runtime.getManifest().version;

disableSearchEngine.addEventListener("change", (event) => {
  browser.storage.sync.set({ disableSearchEngine: !event.target.checked });
});

document.querySelector("#more-options").addEventListener("click", () => {
  browser.runtime.openOptionsPage();
});

var passGenModal = document.getElementById("passGenModal");
var passGenBtn = document.getElementById("password-generator");

passGenBtn.onclick = function () {
  passGenModal.classList.add("open");
  document.getElementById("main").style.display = "none";
  document.body.style.height = "360px";
};

closeModal.onclick = function () {
  passGenModal.classList.remove("open");
  document.getElementById("main").style.display = "block";
  document.body.style.height = "240px";
};

var copyPassBtn = document.getElementById("copyPass");
var regenPassBtn = document.getElementById("regenPass");

copyPassBtn.onclick = function () {
  copyTextToClipboard(password);
};

regenPassBtn.onclick = function () {
  password = makePass(
    passLower.checked,
    passUpper.checked,
    passNum.checked,
    passSym.checked,
    passLength.value
  );
  passwordComponent.innerText = password;
};

function copyTextToClipboard(text) {
  var copyFrom = document.createElement("textarea");
  copyFrom.textContent = text;
  document.body.appendChild(copyFrom);
  copyFrom.select();
  document.execCommand("copy");
  copyFrom.blur();
  document.body.removeChild(copyFrom);
  showToast("passcopytoast");
}

function makePass(lower, upper, num, sym, length) {
  let main = "";
  let finalPass = "";

  const passKeys = {
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    number: "0123456789",
    symbol: "!@#$%^&*",
  };

  let allFalse = false;
  if (!lower && !upper && !num && !sym) allFalse = true;

  const passOptions = {
    lowercase: allFalse ? true : lower,
    uppercase: allFalse ? true : upper,
    number: allFalse ? true : num,
    symbol: allFalse ? true : sym,
  };

  for (i = 0; i < Object.keys(passOptions).length; i++) {
    main += Object.values(passOptions)[i]
      ? passKeys[Object.keys(passOptions)[i]]
      : "";
  }

  if (main != "" && length > 0) {
    for (i = 0; i < length; i++) {
      finalPass += main[Math.floor(Math.random() * main.length)];
    }
  }

  return finalPass;
}

function showToast(id) {
  var x = document.getElementById(id);
  x.classList.add("show");
  setTimeout(function () {
    x.classList.remove("show");
  }, 3000);
}

passLength.addEventListener("change", (event) => {
  passLengthSlider.value = event.target.value;
  password = makePass(
    passLower.checked,
    passUpper.checked,
    passNum.checked,
    passSym.checked,
    passLength.value
  );
  passwordComponent.innerText = password;
  browser.storage.sync.set({ passLength: event.target.value });
});

passLengthSlider.addEventListener("change", (event) => {
  passLength.value = event.target.value;
  password = makePass(
    passLower.checked,
    passUpper.checked,
    passNum.checked,
    passSym.checked,
    passLength.value
  );
  passwordComponent.innerText = password;
  browser.storage.sync.set({ passLength: event.target.value });
});

passLower.addEventListener("change", (event) => {
  password = makePass(
    passLower.checked,
    passUpper.checked,
    passNum.checked,
    passSym.checked,
    passLength.value
  );
  passwordComponent.innerText = password;
  browser.storage.sync.set({ passLower: !event.target.checked });
});

passUpper.addEventListener("change", (event) => {
  password = makePass(
    passLower.checked,
    passUpper.checked,
    passNum.checked,
    passSym.checked,
    passLength.value
  );
  passwordComponent.innerText = password;
  browser.storage.sync.set({ passUpper: !event.target.checked });
});

passNum.addEventListener("change", (event) => {
  password = makePass(
    passLower.checked,
    passUpper.checked,
    passNum.checked,
    passSym.checked,
    passLength.value
  );
  passwordComponent.innerText = password;
  browser.storage.sync.set({ passNum: !event.target.checked });
});

passSym.addEventListener("change", (event) => {
  password = makePass(
    passLower.checked,
    passUpper.checked,
    passNum.checked,
    passSym.checked,
    passLength.value
  );
  passwordComponent.innerText = password;
  browser.storage.sync.set({ passSym: !event.target.checked });
});
