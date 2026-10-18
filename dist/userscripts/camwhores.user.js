// ==UserScript==
// @name         CamWhores PervertMonkey
// @namespace    pervertmonkey
// @version      3.0.24
// @author       violent-orangutan
// @description  Infinite scroll [optional]. Filter by Title, Duration and Private/Public. Sort by Duration and Views. Mass friend request button. Download button
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=camwhores.tv
// @homepage     https://github.com/smartacephale/sleazy-fork#readme
// @homepageURL  https://sleazyfork.org/en/users/1253342-smartacephale
// @source       https://github.com/smartacephale/sleazy-fork
// @supportURL   https://github.com/smartacephale/sleazy-fork/issues
// @match        https://*.camwhores.tv/*
// @match        https://*.camwhores.*/*
// @exclude      https://*.camwhores.tv/*mode=async*
// @require      https://cdn.jsdelivr.net/npm/pervert-monkey@1.0.27/dist/core/pervertmonkey.core.umd.js
// @grant        GM_addStyle
// @grant        unsafeWindow
// @run-at       document-idle
// ==/UserScript==

var ___core = window.pervertmonkey.core || pervertmonkey.core;
var ___utils = ___core;


(function(___core, ___utils) {
	"use strict";
	var LSKDB = class {
		constructor(prefix = "lsm-", lockKey = "lsmngr-lock") {
			this.prefix = prefix;
			this.lockKey = lockKey;
		}
		prefixedKey(key) {
			return `${this.prefix}${key}`;
		}
		getAllKeys() {
			const res = [];
			for (const key in localStorage) if (key.startsWith(this.prefix)) res.push(key.slice(this.prefix.length));
			return res;
		}
		getKeys(n = 12, remove = true) {
			const res = [];
			for (const key in localStorage) {
				if (res.length >= n) break;
				if (key.startsWith(this.prefix)) res.push(key.slice(this.prefix.length));
			}
			if (remove) res.forEach((k) => this.removeKey(k));
			return res;
		}
		hasKey(key) {
			return localStorage.getItem(this.prefixedKey(key)) !== null;
		}
		removeKey(key) {
			localStorage.removeItem(this.prefixedKey(key));
		}
		setKey(key) {
			localStorage.setItem(this.prefixedKey(key), "");
		}
		isLocked() {
			const lock = parseInt(localStorage.getItem(this.lockKey));
			return !(!lock || Date.now() - lock > 300 * 1e3);
		}
		lock(value) {
			if (value) localStorage.setItem(this.lockKey, JSON.stringify(Date.now()));
			else localStorage.removeItem(this.lockKey);
		}
	};
	var _GM_addStyle = (() => typeof GM_addStyle != "undefined" ? GM_addStyle : void 0)();
	var $ = (() => typeof unsafeWindow != "undefined" ? unsafeWindow : void 0)().$;
	_GM_addStyle(`
.item.private .thumb, .item .thumb.private { opacity: 1 !important; }
.haveNoAccess { background: linear-gradient(to bottom, #b50000 0%, #2c2c2c 100%) red !important; }
.haveAccess { background: linear-gradient(to bottom, #4e9299 0%, #2c2c2c 100%) green !important; }
.friend-button { background: radial-gradient(#5ccbf4, #e1ccb1) !important; }
`);
	var IS_MEMBER_PAGE = /^(\/members\/\d+\/|\/my\/)$/.test(location.pathname);
	var IS_MESSAGES = /^\/my\/messages\//.test(location.pathname);
	var IS_COMMUNITY_LIST = /\/members\/$/.test(location.pathname);
	var IS_VIDEO_PAGE = /^(\/videos)?\/\d+\//.test(location.pathname);
	var IS_LOGGED_IN = document.cookie.includes("kt_member");
	var rules = new ___core.Rules({
		containerSelector: "[id*=\"playlist\"]:has(> .item .title),[id*=\"videos\"]:has(> .item .title),form:has(>.item .title)",
		paginationStrategyOptions: {
			paginationSelector: ".pagination:not([id *= member])",
			overwritePaginationLast: IS_MEMBER_PAGE ? () => 1 : (x) => x === 9 ? 9999 : x
		},
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
		thumbImg: { selector: "data-original" },
		gropeStrategy: "all-in-all",
		schemeOptions: [
			"Title Filter",
			"Duration Filter",
			"Privacy Filter",
			"Sort By",
			"Badge",
			{
				title: "Advanced",
				content: [{
					autoRequestAccess: false,
					label: "auto send friend request on check access"
				}]
			}
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
	var createDownloadButton = () => (0, ___utils.downloader)({
		append: ".tabs-menu > ul",
		buttonHtml: "<li><a href=\"#tab_comments\" class=\"toggle-button\" style=\"text-decoration: none;\">download 📼</a></li>",
		doBefore: () => $(".fp-ui").click()
	});
	var DEFAULT_FRIEND_REQUEST_FORMDATA = (0, ___utils.objectToFormData)({
		message: "",
		action: "add_to_friends_complete",
		function: "get_block",
		block_id: "member_profile_view_view_profile",
		format: "json",
		mode: "async"
	});
	var lskdb = new LSKDB();
	async function friendRequest(id) {
		const url = Number.isInteger(id) ? `${location.origin}/members/${id}/` : id;
		await fetch(url, {
			body: DEFAULT_FRIEND_REQUEST_FORMDATA,
			method: "post"
		});
	}
	function getMemberLinks(e) {
		return Array.from(e?.querySelectorAll(".item > a") || [], (l) => l.href).filter((l) => /\/members\/\d+\/$/.test(l));
	}
	async function getMemberFriends(id) {
		const url = new URL(IS_COMMUNITY_LIST ? "/members/" : `/members/${id}/friends/`, location.origin);
		const paginationStrategy = (0, ___core.getPaginationStrategy)({
			doc: await (0, ___utils.fetchHtml)(url.href),
			url,
			overwritePaginationLast: (x) => x === 9 ? 999 : x
		});
		const gen = ___core.InfiniteScroller.generatorForPaginationStrategy(paginationStrategy);
		for (const url in gen) getMemberLinks(await (0, ___utils.fetchHtml)(url)).forEach((a) => {
			const id = a.match(/\d+/)?.[0];
			lskdb.setKey(id);
		});
		await processFriendship();
	}
	var processFriendshipStarted = false;
	async function processFriendship(batchSize = 1, interval = 5e3) {
		if (lskdb.isLocked()) return;
		const friendlist = lskdb.getKeys(batchSize);
		if (friendlist?.length < 1) return;
		if (!processFriendshipStarted) {
			processFriendshipStarted = true;
			console.log("processFriendshipStarted");
		}
		lskdb.lock(true);
		const urls = friendlist.map((id) => `${location.origin}/members/${id}/`);
		for (const url of urls) {
			await (0, ___utils.wait)(interval);
			await friendRequest(url);
		}
		lskdb.lock(false);
		await processFriendship();
	}
	function createPrivateVideoFriendButton() {
		if (!document.querySelector(".no-player")) return;
		const member = document.querySelector(".no-player a")?.href;
		const button = (0, ___utils.parseHtml)("<button class=\"friend-button\"><span>Friend Request</span></button>");
		document.querySelector(".no-player .message")?.append(button);
		button.addEventListener("click", () => friendRequest(member), { once: true });
	}
	function createFriendButton() {
		const button = (0, ___utils.parseHtml)("<a href=\"#friend_everyone\" class=\"button friend-button\"><span>Friend Everyone</span></a>");
		document.querySelector(".main-container-user > .headline, .headline")?.append(button);
		const memberid = location.pathname.match(/\d+/)?.[0];
		button.addEventListener("click", () => {
			button.style.background = "radial-gradient(#ff6114, #5babc4)";
			button.innerText = "processing requests";
			getMemberFriends(memberid).then(() => {
				button.style.background = "radial-gradient(blue, lightgreen)";
				button.innerText = "friend requests sent";
			});
		}, { once: true });
	}
	async function requestAccess() {
		checkPrivateVidsAccess();
		setTimeout(processFriendship, 5e3);
	}
	async function checkPrivateVidsAccess() {
		const checkAccess = async (item) => {
			const videoURL = item.firstElementChild.href;
			const doc = await (0, ___utils.fetchHtml)(videoURL);
			if (!doc.querySelector(".player")) return;
			const haveAccess = !doc.querySelector(".no-player");
			if (!haveAccess && rules.store.state.autoRequestAccess) {
				const uid = doc.querySelector(".message a")?.href.match(/\d+/)?.at(-1);
				lskdb.setKey(uid);
			}
			item.classList.add(haveAccess ? "haveAccess" : "haveNoAccess");
		};
		const thumbs = document.querySelectorAll(".item.private:not(.haveAccess,.haveNoAccess)");
		for (const thumb of thumbs) await checkAccess(thumb);
	}
	function getUserInfo(e) {
		return {
			uploadedCount: (0, ___utils.querySelectorLastNumber)("#list_videos_uploaded_videos strong", e),
			friendsCount: (0, ___utils.querySelectorLastNumber)("#list_members_friends .headline", e)
		};
	}
	async function acceptFriendRequest(id) {
		const url = new URL(`/my/messages/${id}/`, location.origin);
		const memberUrl = new URL(`/members/${id}/`, location.origin);
		await fetch(url, {
			headers: {
				Accept: "*/*",
				"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
			},
			body: `action=confirm_add_to_friends&message_from_user_id=${id}&function=get_block&block_id=list_messages_my_conversation_messages&confirm=Confirm&format=json&mode=async`,
			method: "POST"
		});
		await (0, ___utils.fetchHtml)(memberUrl).then((doc) => console.log("userInfo", memberUrl.href, getUserInfo(doc)));
	}
	async function clearMessages() {
		const pages = ___core.InfiniteScroller.generatorForPaginationStrategy((0, ___core.getPaginationStrategy)({ overwritePaginationLast: (x) => x === 9 ? 999 : x }));
		for await (const p of pages) {
			const doc = await (0, ___utils.fetchHtml)(p.url);
			const messages = Array.from(doc.querySelectorAll("#list_members_my_conversations_items .item > a") || []).map((a) => a.href);
			for (const m of messages) await checkMessageHistory(m);
		}
		async function deleteMessage(url, id) {
			const deleteURL = `${url}?mode=async&format=json&function=get_block&block_id=list_messages_my_conversation_messages&action=delete_conversation&conversation_user_id=${id}`;
			await fetch(deleteURL);
		}
		async function getConversation(url) {
			const doc = await (0, ___utils.fetchHtml)(url);
			const hasFriendRequest = !!doc.querySelector("input[value=confirm_add_to_friends]");
			const originalText = (0, ___utils.querySelectorText)(doc, ".original-text");
			return {
				id: url.match(/\d+/)?.[0],
				hasFriendRequest,
				originalText,
				messages: (0, ___utils.querySelectorText)(doc, ".list-messages")
			};
		}
		async function checkMessageHistory(url) {
			const { originalText, hasFriendRequest, id, messages } = await getConversation(url);
			if (!(originalText || hasFriendRequest)) await deleteMessage(url, id);
			else {
				console.log({
					originalText,
					url,
					messages
				});
				if (hasFriendRequest) await acceptFriendRequest(id);
			}
		}
	}
	var FRIEND_REQUEST_INTERVAL = 5e3;
	if (IS_LOGGED_IN) {
		setTimeout(processFriendship, FRIEND_REQUEST_INTERVAL);
		if (IS_MEMBER_PAGE || IS_COMMUNITY_LIST) createFriendButton();
	}
	if (IS_VIDEO_PAGE) {
		createDownloadButton();
		createPrivateVideoFriendButton();
	}
	if (IS_MESSAGES) {
		const button = (0, ___utils.parseHtml)("<button>clear messages</button>");
		document.querySelector(".headline")?.append(button);
		button.addEventListener("click", clearMessages);
	}
	rules.store.eventSubject.subscribe((event) => {
		if (event.includes("check access")) requestAccess();
	});
})(___core, ___utils);
