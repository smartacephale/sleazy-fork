// ==UserScript==
// @name         CamGirlFinder PervertMonkey
// @namespace    pervertmonkey
// @version      1.6.0
// @author       violent-orangutan
// @description  Adds model links for CamWhores, webcamrecordings, recu.me, camvideos, privat-zapisi
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=camgirlfinder.net
// @homepage     https://github.com/smartacephale/sleazy-fork
// @homepageURL  https://github.com/smartacephale/sleazy-fork
// @source       github:smartacephale/sleazy-fork
// @supportURL   https://github.com/smartacephale/sleazy-fork/issues
// @match        https://camgirlfinder.net/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  const websites = [
    { name: "camwhores.tv", url: (u) => `https://camwhores.tv/search/${u}/` },
    {
      name: "webcamrecordings.com",
      url: (u) => `https://www.webcamrecordings.com/modelSearch/${u}/page/1/`
    },
    { name: "camvideos.me", url: (u) => `https://camvideos.me/search/${u}` },
    { name: "recu.me", url: (u) => `https://recu.me/performer/${u}` },
    {
      name: "privat-zapisi.info",
      url: (u) => `https://www.privat-zapisi.info/search/${u}/`
    }
  ];
  function createLinks(name) {
    return websites.map(
      (w) => `
      <a rel="nofollow" href="${w.url(name)}">
      <img class="platform-icon" title="${w.name}" src="https://www.google.com/s2/favicons?sz=64&domain=${w.name}"></a>`
    ).join(" ");
  }
  function addRedirectButton() {
    if (!document.body.querySelector(".model-name")?.innerText.trim()) return;
    document.querySelectorAll(".result:not(.fucked)").forEach((e) => {
      const name = e.querySelector(".model-name")?.innerText.trim();
      if (name?.length === 0) return;
      e.querySelector("p:last-child").innerHTML += createLinks(name);
      e.classList.add("fucked");
    });
  }
  let timeout;
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(() => {
      clearTimeout(timeout);
      timeout = setTimeout(addRedirectButton, 300);
    });
  });
  observer.observe(document.body, {
    attributes: true,
    childList: true,
    subtree: true
  });
  addRedirectButton();

})();