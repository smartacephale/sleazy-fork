// ==UserScript==
// @name         3Hentai PervertMonkey
// @namespace    pervertmonkey
// @version      1.0.20
// @author       violent-orangutan
// @description  Infinite scroll [optional], Filter by Title, thumb preview
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=3hentai.net
// @homepage     https://github.com/smartacephale/sleazy-fork#readme
// @homepageURL  https://sleazyfork.org/en/users/1253342-smartacephale
// @source       https://github.com/smartacephale/sleazy-fork
// @supportURL   https://github.com/smartacephale/sleazy-fork/issues
// @match        https://*.3hentai.net/*
// @require      https://cdn.jsdelivr.net/npm/pervert-monkey@1.0.27/dist/core/pervertmonkey.core.umd.js
// @grant        GM_addStyle
// @grant        unsafeWindow
// @run-at       document-idle
// ==/UserScript==

var ___core = window.pervertmonkey.core || pervertmonkey.core;
var ___utils = ___core;


(function(___core, ___utils) {
	"use strict";
	new ___core.Rules({
		containerSelectorLast: ".listing-container",
		thumbs: { selector: ".doujin-col" },
		thumb: { selectors: { title: ".title" } },
		thumbImg: { strategy: "auto" },
		gropeStrategy: "all-in-all",
		schemeOptions: [
			"Title Filter",
			"Badge",
			"Advanced"
		],
		animatePreview
	});
	function animatePreview() {
		const tick = new ___utils.Tick(500, false);
		const end = 9999;
		function rotate(src) {
			return src.replace(/(\d+)(?=t\.jpg$)/, (_, n) => `${(0, ___utils.circularShift)(parseInt(n), end)}`);
		}
		___utils.OnHover.create(document.body, ".doujin-col", (e) => {
			const img = e.querySelector("img");
			const origin = img.src;
			img.src = img.src.replace(/\w+\.\w+$/, "1t.jpg");
			img.onerror = (_) => tick.stop();
			tick.start(() => {
				img.src = rotate(img.src);
			}, () => {
				img.src = origin;
			});
			return () => tick.stop();
		});
	}
})(___core, ___utils);
