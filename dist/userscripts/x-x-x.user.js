// ==UserScript==
// @name         x-x-x.video PervertMonkey
// @namespace    pervertmonkey
// @version      1.0.0
// @author       violent-orangutan
// @description  Infinite scroll [optional], Filter by Title and Duration, Sort by Duration
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=x-x-x.video
// @homepage     https://github.com/smartacephale/sleazy-fork#readme
// @homepageURL  https://sleazyfork.org/en/users/1253342-smartacephale
// @source       https://github.com/smartacephale/sleazy-fork
// @supportURL   https://github.com/smartacephale/sleazy-fork/issues
// @match        https://x-x-x.video/*
// @match        https://x-x-x.tube/*
// @match        https://*.extreme.adult/*
// @require      https://cdn.jsdelivr.net/npm/pervert-monkey@1.0.28/dist/core/pervertmonkey.core.umd.js
// @grant        GM_addStyle
// @grant        unsafeWindow
// @run-at       document-idle
// ==/UserScript==

var ___core = window.pervertmonkey.core || pervertmonkey.core;
var ___utils = ___core;


(function(___core, ___utils) {
	"use strict";
	new ___core.Rules({
		containerSelector: ".thumbs-videos,.thumb-holder,.thumbs",
		thumbs: { selector: ".item.thumb" },
		thumb: { strategy: "auto-text" },
		thumbImg: { selector: "data-original" },
		schemeOptions: [
			"Title Filter",
			"Duration Filter",
			"Sort By Duration",
			"Badge",
			"Advanced"
		],
		animatePreview
	});
	function animatePreview(container) {
		function createPreviewElement(src, mount) {
			const { width, height } = mount.getBoundingClientRect();
			const video = (0, ___utils.parseHtml)(`
        <video autoplay loop style="position: absolute; left: 0px; top: 0px; width: ${width}px; height: ${height}px;" muted="muted" src="${src}"></video>`);
			mount.after(video);
			return () => (0, ___utils.exterminateVideo)(video);
		}
		___utils.OnHover.create(container, ".item.thumb", (target) => {
			const img = target.querySelector("img");
			const dataPreview = img?.getAttribute("data-preview");
			return createPreviewElement(dataPreview, img);
		});
	}
})(___core, ___utils);
