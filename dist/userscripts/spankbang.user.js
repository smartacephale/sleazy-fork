// ==UserScript==
// @name         SpankBang.com PervertMonkey
// @namespace    pervertmonkey
// @version      4.2.0
// @author       violent-orangutan
// @description  Infinite scroll [optional]. Filter by Title and Duration. Sort by Duration and Views
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=spankbang.com
// @homepage     https://github.com/smartacephale/sleazy-fork#readme
// @homepageURL  https://sleazyfork.org/en/users/1253342-smartacephale
// @source       https://github.com/smartacephale/sleazy-fork
// @supportURL   https://github.com/smartacephale/sleazy-fork/issues
// @match        https://*.spankbang.com/*
// @match        https://*.spankbang.*/*
// @require      https://cdn.jsdelivr.net/npm/pervert-monkey@1.0.29/dist/core/pervertmonkey.core.umd.js
// @grant        GM_addStyle
// @grant        unsafeWindow
// @run-at       document-idle
// ==/UserScript==

var ___core = window.pervertmonkey.core || pervertmonkey.core;
var ___utils = ___core;


(function(___core, ___utils) {
	"use strict";
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
	var { qualityFilter, qualityFilterScheme } = createQualityFilter({
		"qualityLow": "",
		"qualityHD": "HD",
		"quality4k": "4K"
	});
	new ___core.Rules({
		containerSelector: ".main-container .js-media-list, .main_content_container .video-list",
		paginationStrategyOptions: { paginationSelector: ".paginate-bar, .pagination" },
		thumbs: { selector: ".video-item:not(.clear-fix), .js-video-item" },
		thumb: { selectors: {
			title: "[title]",
			duration: "[data-testid=\"video-item-length\"]",
			views: {
				selector: "[data-testid=\"views\"]",
				type: "float"
			},
			quality: {
				selector: "[data-testid=\"video-item-resolution\"]",
				type: "string"
			}
		} },
		thumbImg: { strategy: "auto" },
		gropeStrategy: "all-in-all",
		customDataFilterFns: [{ qualityFilter }],
		schemeOptions: [
			"Title Filter",
			"Duration Filter",
			...qualityFilterScheme,
			"Sort By",
			"Badge",
			"Advanced"
		]
	});
})(___core, ___utils);
