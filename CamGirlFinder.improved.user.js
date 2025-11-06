// ==UserScript==
// @name         CamGirlFinder helpful model links
// @namespace    ViolentMonkey
// @version      1.5
// @license      MIT
// @description  Adds CamWhores/webcamrecordings/recu.me and etc links
// @author       smartacephale
// @match        https://camgirlfinder.net/*
// @resource     https://camwhores.tv/favicon.ico
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://camgirlfinder.net/
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(() => {
  'use strict';

  const websites = [
    { name: 'camwhores.tv', url: u => `https://camwhores.tv/search/${u}/` },
    { name: 'webcamrecordings.com', url: u => `https://www.webcamrecordings.com/modelSearch/${u}/page/1/` },
    { name: 'camvideos.me', url: u => `https://camvideos.me/search/${u}` },
    { name: 'recu.me', url: u => `https://recu.me/performer/${u}` },
    { name: 'privat-zapisi.info', url: u => `https://www.privat-zapisi.info/search/${u}/` },
  ];

  function createLinks(name) {
    return websites.map(w => `
      <a rel="nofollow" href="${w.url(name)}">
      <img class="platform-icon" title="${w.name}" src="https://www.google.com/s2/favicons?sz=64&domain=${w.name}"></a>`)
      .join(' ');
  }

  function addRedirectButton() {
    if (!document.body.querySelector('.model-name').innerText.trim()) return;

    document.querySelectorAll('.result:not(.fucked)').forEach((e) => {
      const name = e.querySelector('.model-name').innerText.trim();
      if (name.length === 0) return;
      e.querySelector('p:last-child').innerHTML += createLinks(name);
      e.classList.add('fucked');
    });
  }

  let timeout;

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      clearTimeout(timeout);
      timeout = setTimeout(addRedirectButton, 300);
    });
  });

  observer.observe(document.body, {
    attributes: true,
    childList: true,
    subtree: true,
  });

  addRedirectButton();
})();
