// ==UserScript==
// @name         Eporner PervertMonkey
// @namespace    pervertmonkey
// @version      2.2.1
// @author       violent-orangutan
// @description  Infinite scroll [optional], Filter by Title, Uploader, Duration and HD, Sort by Views and Duration
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=eporner.com
// @homepage     https://github.com/smartacephale/sleazy-fork#readme
// @homepageURL  https://sleazyfork.org/en/users/1253342-smartacephale
// @source       https://github.com/smartacephale/sleazy-fork
// @supportURL   https://sleazyfork.org/en/scripts/552559-eporner-pervertmonkey/feedback
// @match        https://*.eporner.com/*
// @match        https://*.eporner.*/*
// @require      https://cdn.jsdelivr.net/npm/pervert-monkey@1.0.30/dist/core/pervertmonkey.core.umd.js
// @grant        GM_addStyle
// @grant        unsafeWindow
// @run-at       document-idle
// ==/UserScript==

var ___core = window.pervertmonkey.core || pervertmonkey.core;
var ___utils = ___core;


(function(___core, ___utils) {
	"use strict";
	var _unsafeWindow = (() => typeof unsafeWindow != "undefined" ? unsafeWindow : void 0)();
	var containerSelectorLast = "div:has(div[id^=vf][data-id])";
	var paginationSelector = ".numlist2";
	var intersectionObservableSelector = !!(0, ___utils.querySelectorLast)(document.body, containerSelectorLast)?.querySelector(paginationSelector) ? "footer" : paginationSelector;
	var { qualityFilter, qualityFilterScheme } = (0, ___core.createQualityFilter)({
		quality360: 360,
		quality480: 480,
		quality720: 720,
		quality1080: 1080,
		quality2k: 2,
		quality4k: 4
	});
	new ___core.Rules({
		intersectionObservableSelector,
		paginationStrategyOptions: {
			paginationSelector,
			pathnameSelector: /\/(\d+)(?=\/|$)/,
			overwritePaginationLast: (n, _) => n === 9 ? 9999 : n
		},
		thumbs: { selector: "div[id^=vf][data-id]" },
		thumb: { selectors: {
			title: "a[href*=video-]",
			uploader: "[title=\"Uploader\"]",
			duration: "[title=\"Duration\"]",
			views: {
				selector: "[title=\"Views\"]",
				type: "float"
			},
			quality: {
				selector: "[title=\"Quality\"]",
				type: "number"
			}
		} },
		thumbImg: {
			strategy: "auto",
			remove: "auto"
		},
		containerSelectorLast,
		customDataFilterFns: [{ qualityFilter }],
		schemeOptions: [
			"Title Filter",
			"Uploader Filter",
			"Duration Filter",
			...qualityFilterScheme,
			"Sort By",
			"Badge",
			"Advanced"
		],
		gropeStrategy: "all-in-all",
		animatePreview
	});
	function animatePreview(doc) {
		___utils.OnHover.create(doc, "div[id^=vf][data-id]", (e) => {
			const thumb = e.closest("[data-id]");
			_unsafeWindow.EP.thumbs.preview.start(thumb);
		});
	}
})(___core, ___utils);
