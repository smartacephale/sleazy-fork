// ==UserScript==
// @name         XVideos PervertMonkey
// @namespace    pervertmonkey
// @version      4.2.0
// @author       violent-orangutan
// @description  Infinite scroll [optional], Filter by Title, Uploader and Duration. Sort by Duration and Views.
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=xvideos.com
// @homepage     https://github.com/smartacephale/sleazy-fork#readme
// @homepageURL  https://sleazyfork.org/en/users/1253342-smartacephale
// @source       https://github.com/smartacephale/sleazy-fork
// @supportURL   https://github.com/smartacephale/sleazy-fork/issues
// @match        https://*.xvideos.com/*
// @match        https://*.xvideos.red/*
// @require      https://cdn.jsdelivr.net/npm/pervert-monkey@1.0.29/dist/core/pervertmonkey.core.umd.js
// @grant        GM_addStyle
// @grant        unsafeWindow
// @run-at       document-idle
// ==/UserScript==

var ___core = window.pervertmonkey.core || pervertmonkey.core;
var ___utils = ___core;


(function(___core, ___utils) {
	"use strict";
	var _unsafeWindow = (() => typeof unsafeWindow != "undefined" ? unsafeWindow : void 0)();
	function createQualityFilter(qualities) {
		const keys = Object.keys(qualities);
		const entries = Object.entries(qualities);
		function shouldFilter(el, state) {
			return !entries.some((e) => state[e[0]] && el.quality === e[1]);
		}
		return {
			qualityFilter: {
				handle(el, state) {
					if (!keys.some((q) => !!state[q])) return false;
					return shouldFilter(el, state);
				},
				deps: keys
			},
			qualityFilterScheme: [{
				title: "Quality Filter",
				content: keys.map((k) => ({
					[k]: false,
					label: k.substring(7)
				}))
			}]
		};
	}
	function createTextFilter(filterName, dataPropName, positive) {
		const filterNameValue = `${filterName}Words`;
		return {
			handle(e, state, searchFilter) {
				if (!Object.hasOwn(state, filterName) || !state[filterName]) return false;
				return !searchFilter?.(e[dataPropName]);
			},
			$preDefine: (state) => {
				const r = new ___utils.RegexFilter(state[filterNameValue]);
				if (positive) return (s) => r.hasEvery(s);
				return (s) => r.hasNone(s);
			},
			deps: [filterNameValue]
		};
	}
	createTextFilter("filterExclude", "title", false), createTextFilter("filterInclude", "title", true), createTextFilter("filterUploaderExclude", "uploader", false), createTextFilter("filterUploaderInclude", "uploader", true);
	var xv = _unsafeWindow.xv;
	var { qualityFilter, qualityFilterScheme } = createQualityFilter({
		qualityLow: "",
		quality360: "360p",
		quality720: "720p",
		quality1080: "1080p",
		quality1440: "1440p",
		quality4k: "4k"
	});
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
