// ==UserScript==
// @name         Xhamster PervertMonkey
// @namespace    pervertmonkey
// @version      5.1.1
// @author       violent-orangutan
// @description  Infinite scroll [optional], Filter by Title, Duration and Watched/Unwatched. Sort by Duration and Views
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=xhamster.com
// @homepage     https://github.com/smartacephale/sleazy-fork#readme
// @homepageURL  https://sleazyfork.org/en/users/1253342-smartacephale
// @source       https://github.com/smartacephale/sleazy-fork
// @supportURL   https://github.com/smartacephale/sleazy-fork/issues
// @match        https://*.xhamster.com/*
// @match        https://*.xhamster.*/*
// @exclude      https://*.xhamster.com/embed*
// @require      https://cdn.jsdelivr.net/npm/pervert-monkey@1.0.28/dist/core/pervertmonkey.core.umd.js
// @grant        GM_addElement
// @grant        GM_addStyle
// @grant        unsafeWindow
// @run-at       document-idle
// ==/UserScript==

var ___core = window.pervertmonkey.core || pervertmonkey.core;
var ___utils = ___core;


(function(___core, ___utils) {
	"use strict";
	var _GM_addElement = (() => typeof GM_addElement != "undefined" ? GM_addElement : void 0)();
	var _unsafeWindow = (() => typeof unsafeWindow != "undefined" ? unsafeWindow : void 0)();
	var IS_PLAYLIST = /^\/my\/favorites\/videos\/\w+/.test(location.pathname);
	function createThumb(data) {
		return (0, ___utils.instantiateTemplate)("[data-video-type=\"video\"].video-thumb", {
			href: data.pageURL,
			"data-previewvideo": data.trailerURL,
			"data-previewvideo-fallback": data.trailerFallbackUrl,
			"data-sprite": data.spriteURL,
			title: data.title,
			"data-video-id": data.id,
			srcset: data.thumbURL,
			src: data.imageURL
		}, {
			".video-thumb-views": data.views,
			"[title]": data.title,
			"[data-role=\"video-duration\"] div": data.duration
		});
	}
	var getPaginationData = !IS_PLAYLIST ? void 0 : async (url) => {
		const thumbsHtml = (await fetch(url, { headers: { "x-csrf-token": "1" } }).then((r) => r.json())).list.map((e) => createThumb(e));
		const wrapper = document.createElement("div");
		wrapper.append(...thumbsHtml);
		return wrapper;
	};
	function createPlaylistPaginationStrategy() {
		const collectionId = location.pathname.split("/my/favorites/videos/")[1].split("-")[0];
		const data = _unsafeWindow.initials;
		const paginationLast = data.favoritesVideoPaging.maxPages;
		const paginationOffset = data.favoritesVideoPaging.active;
		return {
			paginationSelector: "nav[class *= \"pagination\"]",
			getPaginationLast: () => paginationLast,
			getPaginationOffset: () => paginationOffset,
			getPaginationUrlGenerator: () => (offset) => {
				return `https://xhamster.com/api/front/favorite/get-playlist?id=${collectionId}&page=${offset}`;
			}
		};
	}
	var paginationStrategyOptions = IS_PLAYLIST ? createPlaylistPaginationStrategy() : { paginationSelector: ".prev-next-list, .test-pager" };
	var initialsCache = new Map();
	function getInitials(document) {
		const url = document.sourceURL;
		return initialsCache.getOrInsertComputed(url, () => {
			initialsCache.clear();
			const initialsScript = Array.from(document.scripts).find((s) => s.id === "initials-script")?.innerHTML;
			if (!initialsScript?.length) return {};
			return (0, ___utils.findProperty)(JSON.parse(initialsScript.substring(16, initialsScript.length - 1)), "videoThumbProps");
		});
	}
	new ___core.Rules({
		paginationStrategyOptions,
		getPaginationData,
		containerSelectorLast: ".thumb-list",
		thumbs: {
			selector: "[data-video-type=\"video\"].video-thumb",
			transform: (t, document) => {
				try {
					if (!t.querySelector("[class*=placeholderSkeleton]") || !document) return;
					const tid = Number.parseInt(t.getAttribute("data-video-id") || "");
					const data = getInitials(document).find((i) => i.id === tid);
					if (data) t.innerHTML = createThumb(data).innerHTML;
				} catch (_) {}
			}
		},
		thumb: { selectors: {
			title: ".video-thumb-info__name,.video-thumb-info>a",
			duration: ".thumb-image-container__duration",
			watched: {
				selector: "[data-role=\"video-watched",
				type: "boolean"
			},
			views: {
				selector: ".video-thumb-views",
				type: "float"
			}
		} },
		thumbImg: {
			strategy: "auto",
			remove: "[loading]"
		},
		gropeStrategy: "all-in-all",
		customDataFilterFns: [{ filterWatched: (e, state) => !!(state.filterWatched && e.watched) }, { filterUnwatched: (e, state) => !!(state.filterUnwatched && !e.watched) }],
		schemeOptions: [
			"Title Filter",
			{
				title: "Filter Watched",
				content: [{
					filterWatched: false,
					label: "watched"
				}, {
					filterUnwatched: false,
					label: "unwatched"
				}]
			},
			"Sort By",
			"Duration Filter",
			"Badge",
			"Advanced"
		],
		animatePreview
	});
	function animatePreview() {
		function createPreviewVideoElement(src, mount) {
			const video = _GM_addElement("video", {
				playsInline: true,
				autoplay: true,
				loop: true,
				class: "thumb-image-container__video",
				src
			});
			video.addEventListener("loadeddata", () => {
				mount.before(video);
			}, false);
			return () => (0, ___utils.exterminateVideo)(video);
		}
		___utils.OnHover.create(document.body, ".video-thumb", (e) => {
			const container = e.querySelector(".thumb-image-container__image");
			const videoSrc = e.querySelector("[data-previewvideo]")?.getAttribute("data-previewvideo");
			return createPreviewVideoElement(videoSrc, container);
		});
	}
})(___core, ___utils);
