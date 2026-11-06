// ==UserScript==
// @name         JavDatabase PervertMonkey
// @namespace    pervertmonkey
// @version      1.0.0
// @author       violent-orangutan
// @description  Adds search movie links
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=javdatabase.com
// @homepage     https://github.com/smartacephale/sleazy-fork#readme
// @homepageURL  https://sleazyfork.org/en/users/1253342-smartacephale
// @source       https://github.com/smartacephale/sleazy-fork
// @supportURL   https://github.com/smartacephale/sleazy-fork/issues
// @match        https://www.javdatabase.com/*
// @require      https://cdn.jsdelivr.net/npm/pervert-monkey@1.0.28/dist/core/pervertmonkey.core.umd.js
// @grant        none
// @run-at       document-idle
// ==/UserScript==

var ___core = window.pervertmonkey.core || pervertmonkey.core;
var ___utils = ___core;


(function() {
	"use strict";
	var websites = [{
		name: "missav.ws",
		url: (u) => `https://missav.ws/en/search/${u}`
	}, {
		name: "javhdporn.net",
		url: (u) => `https://www.javhdporn.net/search/${u}/`
	}];
	function createLinks(name) {
		return `<div style='display: flex;' >${websites.map((w) => `
      <a target="_blank" style='padding: 2px;' href="${w.url(name)}">
        <img class='wp-postratings-item' src="https://www.google.com/s2/favicons?sz=64&domain=${w.name}">
      </a>`).join(" ")}</div>`;
	}
	document.querySelectorAll(".card").forEach((e) => {
		const title = e.querySelector(".cut-text")?.innerText.trim() || "";
		console.log({ title });
		if (title?.length === 0) return;
		e.innerHTML += createLinks(title);
	});
})();
