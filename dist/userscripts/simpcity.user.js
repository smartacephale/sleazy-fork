// ==UserScript==
// @name         Simpcity PervertMonkey
// @namespace    pervertmonkey
// @version      1.0.3
// @author       violent-orangutan
// @description  Infinite scroll [optional], Filter by Title and Uploader, Sort by Views
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=simpcity.cr
// @homepage     https://github.com/smartacephale/sleazy-fork#readme
// @homepageURL  https://sleazyfork.org/en/users/1253342-smartacephale
// @source       https://github.com/smartacephale/sleazy-fork
// @supportURL   https://github.com/smartacephale/sleazy-fork/issues
// @match        https://simpcity.cr/threads/*
// @match        https://simpcity.cr/watched/threads*
// @match        https://simpcity.cr/forums/*
// @match        https://simpcity.cr/account/bookmarks*
// @match        https://simpcity.cr/tags/*
// @require      https://cdn.jsdelivr.net/npm/pervert-monkey@1.0.26/dist/core/pervertmonkey.core.umd.js
// @grant        GM_addStyle
// @grant        unsafeWindow
// @run-at       document-end
// ==/UserScript==

var ___core = window.pervertmonkey.core || pervertmonkey.core;
var ___utils = ___core;


(function(___core) {
	"use strict";
	var IS_WATCHED_THREADS = /^\/watched\/threads/.test(location.pathname);
	var IS_FORUM_PAGE = /^\/forums\//.test(location.pathname);
	var IS_BOOKMARKS_PAGE = /^\/account\/bookmarks/.test(location.pathname);
	var IS_TAGS_PAGE = /^\/tags\//.test(location.pathname);
	new ___core.Rules(IS_BOOKMARKS_PAGE || IS_TAGS_PAGE ? {
		containerSelector: "ol.block-body, ol.listPlain",
		paginationStrategyOptions: {
			paginationSelector: ".block-outer--after .pageNav",
			pathnameSelector: /\/page-(\d+)\/?$/
		},
		thumbs: { selector: "li.block-row" },
		thumb: {
			selectors: {
				title: ".contentRow-title a",
				uploader: ".contentRow-minor .username"
			},
			getUrlSelector: ".contentRow-title a"
		},
		schemeOptions: [
			"Title Filter",
			"Uploader Filter",
			"Badge",
			"Advanced"
		]
	} : IS_WATCHED_THREADS || IS_FORUM_PAGE ? {
		containerSelectorLast: ".structItemContainer-group, .structItemContainer",
		paginationStrategyOptions: {
			paginationSelector: ".block-outer--after .pageNav",
			pathnameSelector: /\/page-(\d+)\/?$/
		},
		thumbs: { selector: ".structItem.structItem--thread" },
		thumb: { selectors: {
			title: ".structItem-title a",
			uploader: ".structItem-parts .username",
			views: {
				selector: ".structItem-cell--meta dl:nth-of-type(2) dd",
				type: "float"
			},
			replies: {
				selector: ".structItem-cell--meta dl:nth-of-type(1) dd",
				type: "float"
			}
		} },
		gropeStrategy: "all-in-all",
		schemeOptions: [
			"Title Filter",
			"Uploader Filter",
			"Sort By Views",
			"Badge",
			"Advanced"
		]
	} : {
		containerSelector: ".js-replyNewMessageContainer",
		paginationStrategyOptions: {
			paginationSelector: ".block-container + * .pageNav",
			pathnameSelector: /\/page-(\d+)\/?$/
		},
		thumbs: { selector: "article.message" },
		thumb: {
			strategy: "auto-text",
			getUrlSelector: "a[href*=threads]"
		},
		gropeStrategy: "all-in-all",
		schemeOptions: [
			"Title Filter",
			"Badge",
			"Advanced"
		]
	});
})(___core);
