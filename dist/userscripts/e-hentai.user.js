// ==UserScript==
// @name         E-Hentai PervertMonkey
// @namespace    pervertmonkey
// @version      1.0.20
// @author       violent-orangutan
// @description  Infinite scroll [optional], Filter by Title
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=e-hentai.org
// @homepage     https://github.com/smartacephale/sleazy-fork#readme
// @homepageURL  https://sleazyfork.org/en/users/1253342-smartacephale
// @source       https://github.com/smartacephale/sleazy-fork
// @supportURL   https://github.com/smartacephale/sleazy-fork/issues
// @match        https://*.e-hentai.org/*
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
		thumbs: { selector: ".gl1t" },
		thumb: { selectors: { title: ".glname" } },
		thumbImg: { selector: "data-lazy-load" },
		containerSelectorLast: ".itg.gld",
		paginationStrategyOptions: createPaginationStrategyOptions(),
		schemeOptions: [
			"Title Filter",
			"Badge",
			"Advanced"
		]
	});
	function createPaginationStrategyOptions() {
		let nextLink;
		function getNextLink(doc = document) {
			return [...doc.querySelectorAll("a#dnext[href]")].pop()?.href;
		}
		function getPaginationUrlGenerator() {
			const paginationUrlGenerator = async (_) => {
				if (!nextLink) {
					nextLink = getNextLink();
					return nextLink;
				}
				nextLink = getNextLink(await (0, ___utils.fetchHtml)(nextLink));
				return nextLink;
			};
			return paginationUrlGenerator;
		}
		const totalTitles = Number.parseInt(getNextLink()?.match(/\d+$/)?.[0] || "0");
		return {
			paginationSelector: ".searchnav + div + .searchnav",
			overwritePaginationLast: () => totalTitles,
			getPaginationUrlGenerator
		};
	}
	function setThumbnailMode() {
		if (!(/f_search/.test(location.search) || /^\/tag\//.test(location.pathname))) return;
		const selectInputT = document.querySelector("option[value=t]");
		if (selectInputT) {
			const select = selectInputT.parentElement;
			if (select.value === "t") return;
			select.value = "t";
			select.dispatchEvent(new Event("change"));
		}
	}
	setThumbnailMode();
})(___core, ___utils);
