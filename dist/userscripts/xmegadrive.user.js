// ==UserScript==
// @name         xmegadrive PervertMonkey
// @namespace    pervertmonkey
// @version      1.0.0
// @author       violent-orangutan
// @description  Infinite scroll [optional]. Filter by Title and Duration. Sort by Duration and Views.
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=xmegadrive.com
// @homepage     https://github.com/smartacephale/sleazy-fork#readme
// @homepageURL  https://sleazyfork.org/en/users/1253342-smartacephale
// @source       https://github.com/smartacephale/sleazy-fork
// @supportURL   https://github.com/smartacephale/sleazy-fork/issues
// @match        https://*.xmegadrive.com/*
// @exclude      https://*.xmegadrive.com/*mode=async*
// @require      https://cdn.jsdelivr.net/npm/pervert-monkey@1.0.27/dist/core/pervertmonkey.core.umd.js
// @grant        GM_addStyle
// @grant        unsafeWindow
// @run-at       document-idle
// ==/UserScript==

var ___core = window.pervertmonkey.core || pervertmonkey.core;
var ___utils = ___core;


(function(___core, ___utils) {
	"use strict";
	var $ = (() => typeof unsafeWindow != "undefined" ? unsafeWindow : void 0)().$;
	new ___core.Rules({
		containerSelector: "[id*=\"playlist\"]:has(> .item .title),[id*=\"videos\"]:has(> .item .title),form:has(>.item .title)",
		paginationStrategyOptions: { paginationSelector: ".pagination:not([id *= member])" },
		thumbs: { selector: ".list-videos .item, .playlist .item, .list-playlists > div > .item, .item:has(.title)" },
		thumb: {
			strategy: "auto-select",
			selectors: {
				private: {
					type: "boolean",
					selector: "[class*=private]"
				},
				views: {
					selector: ".views",
					type: "float"
				}
			}
		},
		dataManagerOptions: { removeDuplicates: true },
		thumbImg: { selector: "data-original" },
		gropeStrategy: "all-in-all",
		schemeOptions: [
			"Title Filter",
			"Duration Filter",
			"Sort By",
			"Badge",
			"Advanced"
		],
		animatePreview
	});
	function animatePreview(container) {
		const tick = new ___utils.Tick(500);
		function killjquery(n = 10) {
			if (n > 0) {
				n--;
				$("img[data-cnt]").off();
				setTimeout(() => killjquery(n), 250);
			}
		}
		killjquery();
		function rotateImg(src, count) {
			return src.replace(/(\d)(?=\.jpg$)/, (_, n) => `${(0, ___utils.circularShift)(parseInt(n), count)}`);
		}
		___utils.OnHover.create(container, ".list-videos .item, .playlist .item, .list-playlists > div > .item, .item:has(.title)", (e) => {
			const img = e.querySelector("img");
			const origin = img.src;
			const count = parseInt(img.getAttribute("data-cnt")) || 5;
			tick.start(() => {
				img.src = rotateImg(img.src, count);
			}, () => {
				img.src = origin;
			});
			return () => tick.stop();
		});
	}
})(___core, ___utils);
