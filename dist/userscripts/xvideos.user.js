// ==UserScript==
// @name         XVideos PervertMonkey
// @namespace    pervertmonkey
// @version      4.1.0
// @author       violent-orangutan
// @description  Infinite scroll [optional], Filter by Title, Uploader and Duration. Sort by Duration and Views.
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=xvideos.com
// @homepage     https://github.com/smartacephale/sleazy-fork#readme
// @homepageURL  https://sleazyfork.org/en/users/1253342-smartacephale
// @source       https://github.com/smartacephale/sleazy-fork
// @supportURL   https://github.com/smartacephale/sleazy-fork/issues
// @match        https://*.xvideos.com/*
// @require      https://cdn.jsdelivr.net/npm/pervert-monkey@1.0.27/dist/core/pervertmonkey.core.umd.js
// @grant        GM_addStyle
// @grant        unsafeWindow
// @run-at       document-idle
// ==/UserScript==

var ___core = window.pervertmonkey.core || pervertmonkey.core;
var ___utils = ___core;


(function(___core, ___utils) {
	"use strict";
	var xv = (() => typeof unsafeWindow != "undefined" ? unsafeWindow : void 0)().xv;
	new ___core.Rules({
		paginationStrategyOptions: {
			paginationSelector: "#main .pagination:last-child",
			searchParamSelector: "p"
		},
		containerSelector: "*:has(>div.thumb-block[id^=video_]:not(.thumb-ad))",
		thumbs: { selector: "div.thumb-block[id^=video_]:not(.thumb-ad)" },
		thumb: {
			selectors: {
				title: "[class*=title]",
				uploader: "[class*=name]",
				duration: "[class*=duration]",
				views: {
					selector: ".metadata a ~ span",
					type: "float"
				},
				quality: {
					selector: ".video-hd-mark",
					type: "string"
				}
			},
			callback: (thumb) => {
				setTimeout(() => {
					const id = parseInt(thumb.getAttribute("data-id"));
					xv.thumbs.prepareVideo(id);
				}, 200);
			}
		},
		customDataFilterFns: [{ qualityFilter: {
			handle(el, state) {
				if (!(state.qualityLow || state.quality360 || state.quality720 || state.quality1080 || state.quality1440 || state.quality4k)) return false;
				return !(state.qualityLow && el.quality === "" || state.quality360 && el.quality === "360p" || state.quality720 && el.quality === "720p" || state.quality1080 && el.quality === "1080p" || state.quality1440 && el.quality === "1440p" || state.quality4k && el.quality === "4k");
			},
			deps: [
				"qualityLow",
				"quality360",
				"quality720",
				"quality1080",
				"quality1440",
				"quality4k"
			]
		} }],
		schemeOptions: [
			"Title Filter",
			"Uploader Filter",
			"Duration Filter",
			{
				title: "Quality Filter",
				content: [
					{
						qualityLow: false,
						label: "Low"
					},
					{
						quality360: false,
						label: "360p"
					},
					{
						quality720: false,
						label: "720p"
					},
					{
						quality1080: false,
						label: "1080p"
					},
					{
						quality1440: false,
						label: "1440p"
					},
					{
						quality4k: false,
						label: "4k"
					}
				]
			},
			"Sort By",
			"Badge",
			"Advanced"
		],
		animatePreview
	});
	function animatePreview(container) {
		function createPreviewElement(src, mount) {
			const elem = (0, ___utils.parseHtml)(`
    <div class="videopv" style="display: none;">
        <video autoplay="autoplay" playsinline="playsinline" muted="muted"></video>
    </div>`);
			mount.after(elem);
			const video = elem.querySelector("video");
			video.src = src;
			video.addEventListener("loadeddata", () => {
				mount.style.opacity = "0";
				elem.style.display = "block";
				elem.style.background = "#000";
			}, false);
			return () => {
				(0, ___utils.exterminateVideo)(video);
				elem.remove();
				mount.style.opacity = "1";
			};
		}
		function getVideoURL(src) {
			return src.replace(/\w+\.\w+$/, () => "preview.mp4");
		}
		___utils.OnHover.create(container, "div.thumb-block[id^=video_]:not(.thumb-ad)", (target) => {
			const img = target.querySelector("img");
			return createPreviewElement(getVideoURL(img.src), img);
		});
	}
})(___core, ___utils);
