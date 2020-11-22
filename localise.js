window.browser = window.browser || window.chrome;

var translate = document.getElementsByTagName("i18n");

for (var i = 0; i < translate.length; i++) {
  var msg = translate[i].innerText;
  translate[i].innerText = chrome.i18n.getMessage(msg);
}
