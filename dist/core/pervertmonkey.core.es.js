import { GM_addStyle } from "vite-plugin-monkey/dist/client";
//#region src/core/data-handler/data-filter-fn.ts
var DataFilterFn = class DataFilterFn {
	handle;
	deps;
	name;
	$preDefine;
	static prefix = "filter-";
	static setPrefix(name) {
		return `${DataFilterFn.prefix}${name}`;
	}
	constructor(handle, deps = [], name, $preDefine) {
		this.handle = handle;
		this.deps = deps;
		this.name = name;
		this.$preDefine = $preDefine;
		this.name = DataFilterFn.setPrefix(name);
	}
	static from(options, name) {
		if (typeof options === "function") return new DataFilterFn(options, [name], name);
		return new DataFilterFn(options.handle, options.deps, name, options.$preDefine);
	}
	renderFn(state) {
		const name = this.name;
		return () => {
			const preDefined = this.$preDefine?.(state);
			return (a) => {
				return {
					condition: this.handle(a, state, preDefined),
					name
				};
			};
		};
	}
};
//#endregion
//#region src/utils/arrays/index.ts
function chunks(arr, size) {
	return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size));
}
function* irange(start = 1, step = 1) {
	for (let i = start;; i += step) yield i;
}
function range(size, start = 1, step = 1) {
	return irange(start, step).take(size).toArray();
}
//#endregion
//#region src/utils/async/index.ts
function wait(milliseconds) {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
//#endregion
//#region src/utils/dom/attributes.ts
function copyAttributes(target, source) {
	for (const attr of source.attributes) if (attr.nodeValue) target.setAttribute(attr.nodeName, attr.nodeValue);
}
function replaceElementTag(e, tagName) {
	const newTagElement = document.createElement(tagName);
	copyAttributes(newTagElement, e);
	newTagElement.innerHTML = e.innerHTML;
	e.parentNode?.replaceChild(newTagElement, e);
	return newTagElement;
}
function removeClassesAndDataAttributes(element, keyword) {
	Array.from(element.classList).forEach((className) => {
		if (className.includes(keyword)) element.classList.remove(className);
	});
	Array.from(element.attributes).forEach((attr) => {
		if (attr.name.startsWith("data-") && attr.name.includes(keyword)) element.removeAttribute(attr.name);
	});
}
function areElementsAlike(a, b, options) {
	if (!a || !b) return false;
	if (options.id && a.id !== b.id) return false;
	if (options.className) {
		const ca = a.className;
		const cb = b.className;
		if (!(ca.length > cb.length ? ca.includes(cb) : cb.includes(ca))) return false;
	}
	return true;
}
//#endregion
//#region src/utils/dom/miscellaneous.ts
function exterminateVideo(video) {
	video.removeAttribute("src");
	video.load();
	video.remove();
}
function downloader(options) {
	const btn = parseHtml(options.buttonHtml);
	if (options.append) document.querySelector(options.append)?.append(btn);
	if (options.after) document.querySelector(options.after)?.after(btn);
	btn?.addEventListener("click", (e) => {
		e.preventDefault();
		options.doBefore?.();
		waitForElementToAppear(document.body, "video", (video) => {
			window.location.href = video.getAttribute("src");
		});
	});
}
function instantiateTemplate(sourceSelector, attributeUpdates, contentUpdates) {
	const source = document.querySelector(sourceSelector);
	const wrapper = document.createElement("div");
	const clone = source.cloneNode(true);
	wrapper.append(clone);
	Object.entries(attributeUpdates).forEach(([attrName, attrValue]) => {
		wrapper.querySelectorAll(`[${attrName}]`).forEach((element) => {
			element.setAttribute(attrName, attrValue);
		});
	});
	Object.entries(contentUpdates).forEach(([childSelector, textValue]) => {
		wrapper.querySelectorAll(childSelector).forEach((element) => {
			element.innerText = textValue;
		});
	});
	return wrapper.innerHTML;
}
//#endregion
//#region src/utils/dom/observers.ts
function waitForElementToAppear(parent, selector, callback) {
	const observer = new MutationObserver((_mutations) => {
		const e = parent.querySelector(selector);
		if (e) {
			observer.disconnect();
			callback(e);
		}
	});
	observer.observe(document.body, {
		childList: true,
		subtree: true
	});
	return observer;
}
function waitForElementToDisappear(observable, callback) {
	const observer = new MutationObserver((_mutations) => {
		if (!observable.isConnected) {
			observer.disconnect();
			callback();
		}
	});
	observer.observe(document.body, {
		childList: true,
		subtree: true
	});
	return observer;
}
function watchElementChildrenCount(element, callback) {
	let count = element.children.length;
	const observer = new MutationObserver((mutationList, observer) => {
		for (const mutation of mutationList) if (mutation.type === "childList") {
			if (count !== element.children.length) {
				count = element.children.length;
				callback(observer, count);
			}
		}
	});
	observer.observe(element, { childList: true });
	return observer;
}
function watchDomChangesWithThrottle(element, callback, throttle = 1e3, times = Infinity, options = {
	childList: true,
	subtree: true,
	attributes: true
}) {
	let lastMutationTime;
	let timeout;
	let times_ = times;
	const observer = new MutationObserver((_mutationList, _observer) => {
		if (times_ !== Infinity && times_ < 1) {
			observer.disconnect();
			return;
		}
		times_--;
		const now = Date.now();
		if (lastMutationTime && now - lastMutationTime < throttle) timeout && clearTimeout(timeout);
		timeout = window.setTimeout(callback, throttle);
		lastMutationTime = now;
	});
	observer.observe(element, options);
	return observer;
}
//#endregion
//#region src/utils/objects/memoize.ts
function memoize(fn) {
	const cache = /* @__PURE__ */ new Map();
	const memoizedFunction = ((...args) => {
		const key = JSON.stringify(args);
		return cache.getOrInsertComputed(key, () => fn(...args));
	});
	return memoizedFunction;
}
//#endregion
//#region src/utils/objects/index.ts
function objectToFormData(obj) {
	const formData = new FormData();
	Object.entries(obj).forEach(([k, v]) => {
		formData.append(k, v);
	});
	return formData;
}
//#endregion
//#region src/utils/strings/regexes.ts
var RegexFilter = class {
	regexes;
	constructor(str, flags = "gi") {
		this.regexes = memoize(this.compileSearchRegex)(str, flags);
	}
	compileSearchRegex(str, flags) {
		try {
			if (str.startsWith("r:")) return [new RegExp(str.slice(2), flags)];
			return splitWith(str).map((s) => s.replace(/f:(\w+)/g, (_, w) => `(^|\\ |,)${w}($|\\ |,)`)).map((_) => new RegExp(_, flags));
		} catch (_) {
			return [];
		}
	}
	hasEvery(str) {
		return this.regexes.every((r) => r.test(str));
	}
	hasNone(str) {
		return this.regexes.every((r) => !r.test(str));
	}
};
//#endregion
//#region src/utils/strings/index.ts
function splitWith(s, c = ",") {
	return s.split(c).map((s) => s.trim()).filter(Boolean);
}
function sanitizeStr(s) {
	return s?.replace(/\n|\t/g, " ").replace(/ {2,}/g, " ").trim() || "";
}
//#endregion
//#region src/utils/dom/selectors.ts
function querySelectorOrSelf(element, selector) {
	if (element.matches?.(selector)) return element;
	return element.querySelector(selector);
}
function querySelectorLast(root = document, selector) {
	const nodes = root.querySelectorAll(selector);
	if (nodes.length < 1) return querySelectorOrSelf(root, selector) || void 0;
	return nodes[nodes.length - 1];
}
function querySelectorLastNumber(selector, e = document) {
	const text = querySelectorText(e, selector);
	return Number(text.match(/\d+/g)?.pop() || 0);
}
function querySelectorText(e, selector) {
	if (typeof selector !== "string") return "";
	return sanitizeStr(querySelectorOrSelf(e, selector)?.innerText || "");
}
function getCommonParents(elements) {
	return Map.groupBy(elements, (e) => e.parentElement).keys().filter((e) => e !== null).toArray();
}
function findNextSibling(e) {
	if (e.nextElementSibling) return e.nextElementSibling;
	if (e.parentElement) return findNextSibling(e.parentElement);
	return null;
}
//#endregion
//#region src/utils/dom/index.ts
function parseHtml(html) {
	const parsed = new DOMParser().parseFromString(html, "text/html").body;
	if (parsed.children.length > 1) return parsed;
	return parsed.firstElementChild;
}
//#endregion
//#region src/utils/events/on-hover.ts
var OnHover = class OnHover {
	container;
	targetSelector;
	onOver;
	handleLeave() {
		this.onOverCallback?.();
		this.onOverCallback = void 0;
		this.target = void 0;
	}
	handleHover(e) {
		const newTarget = e.target.closest(this.targetSelector);
		if (!newTarget || this.target === newTarget) return;
		this.target?.dispatchEvent(new PointerEvent("pointerleave"));
		this.target = newTarget;
		this.onOverCallback = this.onOver(this.target);
		this.target.addEventListener("pointerleave", () => this.handleLeave(), { once: true });
	}
	target;
	onOverCallback;
	constructor(container, targetSelector, onOver) {
		this.container = container;
		this.targetSelector = targetSelector;
		this.onOver = onOver;
		this.container.addEventListener("pointerover", (e) => this.handleHover(e));
	}
	static create(...args) {
		return new OnHover(...args);
	}
};
//#endregion
//#region src/utils/events/tick.ts
var Tick = class {
	delay;
	startImmediate;
	tick;
	callbackFinal;
	constructor(delay, startImmediate = true) {
		this.delay = delay;
		this.startImmediate = startImmediate;
	}
	start(callback, callbackFinal) {
		this.stop();
		this.callbackFinal = callbackFinal;
		if (this.startImmediate) callback();
		this.tick = window.setInterval(callback, this.delay);
	}
	stop() {
		if (this.tick !== void 0) {
			clearInterval(this.tick);
			this.tick = void 0;
			this.callbackFinal?.();
			this.callbackFinal = void 0;
		}
	}
};
//#endregion
//#region src/utils/fetch/index.ts
var MOBILE_UA = { "User-Agent": [
	"Mozilla/5.0 (Linux; Android 10; K)",
	"AppleWebKit/537.36 (KHTML, like Gecko)",
	"Chrome/114.0.0.0 Mobile Safari/537.36"
].join(" ") };
async function fetchWith(input, options) {
	const requestInit = options.init || {};
	if (options.mobile) Object.assign(requestInit, { headers: new Headers(MOBILE_UA) });
	const r = await fetch(input, requestInit).then((r) => r);
	if (options.type === "json") return await r.json();
	if (options.type === "html") return parseHtml(await r.text());
	return await r.text();
}
var fetchJson = (input) => fetchWith(input, { type: "json" });
var fetchHtml = (input) => fetchWith(input, { type: "html" });
var fetchText = (input) => fetchWith(input, { type: "text" });
//#endregion
//#region src/utils/math/index.ts
function circularShift(n, c = 6, s = 1) {
	return (n + s) % c || c;
}
//#endregion
//#region src/utils/observers/lazy-image-loader.ts
var LazyImgLoader = class {
	attributeName;
	lazyImgObserver;
	constructor(shouldDelazify, attributeName = "data-lazy-orangutan") {
		this.attributeName = attributeName;
		this.lazyImgObserver = new Observer((target) => {
			if (shouldDelazify(target)) this.unlazify(target);
		});
	}
	lazify(img, imgSrc) {
		if (!img || !imgSrc) return;
		img.setAttribute(this.attributeName, imgSrc);
		img.src = "";
		this.lazyImgObserver.observe(img);
	}
	unlazify(target) {
		this.lazyImgObserver.unobserve(target);
		target.src = target.getAttribute(this.attributeName);
		target.removeAttribute(this.attributeName);
	}
};
//#endregion
//#region src/utils/observers/index.ts
var Observer = class Observer {
	callback;
	timeout;
	observer;
	constructor(callback) {
		this.callback = callback;
		this.observer = new IntersectionObserver(this.handleIntersection.bind(this));
	}
	observe(target) {
		this.observer.observe(target);
	}
	unobserve(target) {
		this.observer.unobserve(target);
	}
	throttle(target, throttleTime) {
		this.unobserve(target);
		this.timeout = window.setTimeout(() => this.observer.observe(target), throttleTime);
	}
	handleIntersection(entries) {
		for (const entry of entries) if (entry.isIntersecting) this.callback(entry.target);
	}
	dispose() {
		if (this.timeout) clearTimeout(this.timeout);
		this.observer.disconnect();
	}
	static observeWhile(target, callback, throttleTime) {
		const observer = new Observer(async (target) => {
			if (await callback()) observer.throttle(target, throttleTime);
			else observer.dispose();
		});
		observer.observe(target);
		return observer;
	}
};
//#endregion
//#region src/utils/parsers/time-parser.ts
/**
* Converts a duration string (e.g., "1h 22min 3sec") to HH:MM:SS format.
* @param timeStr - The duration string to format.
* @returns A string in the format HH:MM:SS.
*/
function formatTimeToHHMMSS(timeStr) {
	const pad = (num) => num.toString().padStart(2, "0");
	const h = timeStr.match(/(\d+)\s*h/)?.[1] || "0";
	const m = timeStr.match(/(\d+)\s*mi?n?/)?.[1] || "0";
	const s = timeStr.match(/(\d+)\s*se?c?/)?.[1] || "0";
	return `${pad(+h)}:${pad(+m)}:${pad(+s)}`;
}
/**
* Converts a time string (HH:MM:SS or duration format) to total seconds.
* @param timeStr - The time string to convert.
* @returns The total number of seconds.
*/
function timeToSeconds(timeStr) {
	return (/[a-zA-Z]/.test(timeStr) ? formatTimeToHHMMSS(timeStr) : timeStr).split(":").reverse().reduce((total, unit, index) => total + parseInt(unit, 10) * 60 ** index, 0);
}
//#endregion
//#region src/utils/parsers/index.ts
function parseUrl(s) {
	return new URL(typeof s === "string" ? s : s.href);
}
function parseIntegerOr(n, or) {
	const num = Number(n);
	return Number.isSafeInteger(num) ? num : or;
}
function parseNumericAbbreviation(str) {
	const multipliers = {
		k: 1e3,
		m: 1e6
	};
	const match = str.trim().match(/([\d., ]+)(\w)?/);
	if (!match) return 0;
	const s1 = match[1].replace(/,/g, ".").replace(/[ ]/g, "");
	const s2 = s1.split(".").filter(Boolean).length < 3 ? s1 : s1.replace(".", "");
	const num = parseFloat(s2);
	const suffix = match[2]?.toLowerCase();
	if (suffix && suffix in multipliers) return num * multipliers[suffix];
	return num;
}
function parseDataParams(str) {
	return decodeURI(str.trim()).split(";").reduce((acc, s) => {
		const parsed = s.match(/([+\w]+):([\w\- ]+)?/);
		if (parsed) {
			const [, key, value] = parsed;
			if (value) key.split("+").forEach((p) => {
				acc[p] = value;
			});
		}
		return acc;
	}, {});
}
function parseCssUrl(s) {
	return s.replace(/url\("|"\).*/g, "");
}
//#endregion
//#region src/utils/performance/index.ts
function runIdleJob(iterator, job) {
	return new Promise((resolve) => {
		const scheduler = window.requestIdleCallback || ((cb) => {
			return setTimeout(() => {
				cb({
					didTimeout: true,
					timeRemaining: () => 50
				});
			}, 1);
		});
		function runBatch(deadline) {
			while (deadline.timeRemaining() > 0) {
				const { value, done } = iterator.next();
				if (done) {
					resolve(true);
					return;
				}
				job(value);
			}
			scheduler(runBatch);
		}
		scheduler(runBatch);
	});
}
async function containMutation(container, mutation) {
	const originalContain = container.style.contain;
	container.style.contain = "content";
	try {
		mutation();
		await new Promise((resolve) => {
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					resolve();
				});
			});
		});
	} finally {
		container.style.contain = originalContain;
	}
}
//#endregion
//#region src/core/data-handler/data-filter-fn-defaults.ts
function createTextFilter(filterName, dataPropName, positive) {
	const filterNameValue = `${filterName}Words`;
	return {
		handle(e, state, searchFilter) {
			if (!Object.hasOwn(state, filterName) || !state[filterName]) return false;
			return !searchFilter?.(e[dataPropName]);
		},
		$preDefine: (state) => {
			const r = new RegexFilter(state[filterNameValue]);
			if (positive) return (s) => r.hasEvery(s);
			return (s) => r.hasNone(s);
		},
		deps: [filterNameValue]
	};
}
var defaultDataFilterFns = {
	filterDuration: {
		handle(e, state, notInRange) {
			if (!state.filterDuration) return false;
			return !!notInRange?.(e.duration);
		},
		$preDefine: (state) => {
			const from = state.filterDurationFrom;
			const to = state.filterDurationTo;
			function notInRange(d) {
				return d < from || d > to;
			}
			return notInRange;
		},
		deps: ["filterDurationFrom", "filterDurationTo"]
	},
	filterExclude: createTextFilter("filterExclude", "title", false),
	filterInclude: createTextFilter("filterInclude", "title", true),
	filterUploaderExclude: createTextFilter("filterUploaderExclude", "uploader", false),
	filterUploaderInclude: createTextFilter("filterUploaderInclude", "uploader", true),
	filterHD: (e, state) => state.filterHD && !e.hd,
	filterNonHD: (e, state) => state.filterNonHD && e.hd,
	filterPrivate: (e, state) => state.filterPrivate && e.private,
	filterPublic: (e, state) => state.filterPublic && !e.private
};
//#endregion
//#region src/core/data-handler/data-filter.ts
var DataFilter = class {
	rules;
	filters = /* @__PURE__ */ new Map();
	filterDepsMapping = {};
	constructor(rules) {
		this.rules = rules;
		this.registerFilters(rules.customDataFilterFns);
		this.createCssFilters();
	}
	static isFiltered(e) {
		return e.className.includes(DataFilterFn.prefix);
	}
	createCssFilters() {
		this.filters.forEach((_, name) => {
			GM_addStyle(`@layer userscriptOverride { .${DataFilterFn.setPrefix(name)} { display: none !important; } }`);
		});
	}
	customDataFilterFns = {};
	registerFilters(customFilters) {
		customFilters.forEach((o) => {
			const isStr = typeof o === "string";
			const k = isStr ? o : Object.keys(o)[0];
			this.customDataFilterFns[k] = isStr ? defaultDataFilterFns[o] : o[k];
			this.registerFilter(k);
		});
	}
	registerFilter(customSelectorName) {
		const dataFilterFn = DataFilterFn.from(this.customDataFilterFns[customSelectorName], customSelectorName);
		dataFilterFn.deps.push(customSelectorName);
		dataFilterFn.deps.forEach((name) => {
			Object.assign(this.filterDepsMapping, { [name]: customSelectorName });
		});
		this.filters.set(customSelectorName, dataFilterFn.renderFn(this.rules.store.state));
	}
	selectFilters(filters) {
		return Object.keys(filters).filter((k) => k in this.filterDepsMapping).map((k) => this.filterDepsMapping[k]).map((k) => this.filters.get(k));
	}
};
//#endregion
//#region src/core/data-handler/data-manager.ts
var DataManager = class DataManager {
	rules;
	removeDuplicates;
	containerHomogenity;
	data = /* @__PURE__ */ new Map();
	lazyImgLoader = new LazyImgLoader((target) => !DataFilter.isFiltered(target));
	dataFilter;
	static create(rules, o = {}) {
		return new DataManager(rules, o.removeDuplicates, o.containerHomogenity);
	}
	constructor(rules, removeDuplicates = false, containerHomogenity) {
		this.rules = rules;
		this.removeDuplicates = removeDuplicates;
		this.containerHomogenity = containerHomogenity;
		this.dataFilter = new DataFilter(this.rules);
	}
	async applyFilters(filters = {}, offset = 0) {
		const filtersToApply = this.dataFilter.selectFilters(filters);
		if (filtersToApply.length === 0) return;
		const iterator = this.data.values().drop(offset);
		const updates = [];
		await runIdleJob(iterator, (v) => {
			for (const f of filtersToApply) {
				const { name, condition } = f()(v);
				updates.push({
					e: v.element,
					name,
					condition
				});
			}
		});
		const parents = Map.groupBy(updates, (u) => u.e.parentElement);
		for (const [parent, mutations] of parents) {
			const f = () => {
				mutations.forEach((u) => {
					u.e.classList.toggle(u.name, u.condition);
				});
			};
			parent ? await this.optimize(parent, f) : f();
		}
	}
	async filterAll(offset) {
		const keys = Array.from(this.dataFilter.filters.keys());
		const filters = Object.fromEntries(keys.map((k) => [k, this.rules.store.state[k]]));
		await this.applyFilters(filters, offset);
	}
	async parseData(html, container, removeDuplicates = this.removeDuplicates, shouldLazify = true) {
		const thumbs = this.rules.thumbsParser.getThumbs(html);
		const dataOffset = this.data.size;
		const fragment = document.createDocumentFragment();
		const parent = container || this.rules.container;
		const homogenity = !!this.containerHomogenity;
		for (const thumbElement of thumbs) {
			const url = this.rules.thumbDataParser.getUrl(thumbElement);
			const isNotHomogenic = homogenity && !areElementsAlike(parent, thumbElement.parentElement, this.containerHomogenity);
			if (!url || this.data.has(url) || parent !== container && parent?.contains(thumbElement) || isNotHomogenic) {
				if (removeDuplicates) thumbElement.remove();
				continue;
			}
			const data = this.rules.thumbDataParser.getThumbData(thumbElement);
			this.data.set(url, {
				element: thumbElement,
				...data
			});
			if (shouldLazify) {
				const { img, imgSrc } = this.rules.thumbImgParser.getImgData(thumbElement);
				this.lazyImgLoader.lazify(img, imgSrc);
			}
			fragment.append(thumbElement);
		}
		await this.filterAll(dataOffset);
		if (!parent) return;
		await this.optimize(parent, () => parent?.appendChild(fragment));
	}
	async optimize(container, mutation) {
		if (this.rules.containMutationEnabled) await containMutation(container, mutation);
		else mutation();
	}
	async sortBy(key, direction = true) {
		if (this.data.size < 2) return;
		const ds = this.data.values().toArray().filter((e) => e.element.parentElement !== null);
		const byContainers = Map.groupBy(ds, (e) => e.element.parentElement);
		const dir = direction ? -1 : 1;
		for (const [container, items] of byContainers) {
			items.sort((a, b) => (a[key] - b[key]) * dir);
			const children = items.map((e) => e.element);
			await this.optimize(container, () => container.replaceChildren(...children));
		}
	}
};
//#endregion
//#region node_modules/tslib/tslib.es6.mjs
/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
var extendStatics = function(d, b) {
	extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d, b) {
		d.__proto__ = b;
	} || function(d, b) {
		for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
	};
	return extendStatics(d, b);
};
function __extends(d, b) {
	if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
	extendStatics(d, b);
	function __() {
		this.constructor = d;
	}
	d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
function __awaiter(thisArg, _arguments, P, generator) {
	function adopt(value) {
		return value instanceof P ? value : new P(function(resolve) {
			resolve(value);
		});
	}
	return new (P || (P = Promise))(function(resolve, reject) {
		function fulfilled(value) {
			try {
				step(generator.next(value));
			} catch (e) {
				reject(e);
			}
		}
		function rejected(value) {
			try {
				step(generator["throw"](value));
			} catch (e) {
				reject(e);
			}
		}
		function step(result) {
			result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
		}
		step((generator = generator.apply(thisArg, _arguments || [])).next());
	});
}
function __generator(thisArg, body) {
	var _ = {
		label: 0,
		sent: function() {
			if (t[0] & 1) throw t[1];
			return t[1];
		},
		trys: [],
		ops: []
	}, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
	return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() {
		return this;
	}), g;
	function verb(n) {
		return function(v) {
			return step([n, v]);
		};
	}
	function step(op) {
		if (f) throw new TypeError("Generator is already executing.");
		while (g && (g = 0, op[0] && (_ = 0)), _) try {
			if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
			if (y = 0, t) op = [op[0] & 2, t.value];
			switch (op[0]) {
				case 0:
				case 1:
					t = op;
					break;
				case 4:
					_.label++;
					return {
						value: op[1],
						done: false
					};
				case 5:
					_.label++;
					y = op[1];
					op = [0];
					continue;
				case 7:
					op = _.ops.pop();
					_.trys.pop();
					continue;
				default:
					if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
						_ = 0;
						continue;
					}
					if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
						_.label = op[1];
						break;
					}
					if (op[0] === 6 && _.label < t[1]) {
						_.label = t[1];
						t = op;
						break;
					}
					if (t && _.label < t[2]) {
						_.label = t[2];
						_.ops.push(op);
						break;
					}
					if (t[2]) _.ops.pop();
					_.trys.pop();
					continue;
			}
			op = body.call(thisArg, _);
		} catch (e) {
			op = [6, e];
			y = 0;
		} finally {
			f = t = 0;
		}
		if (op[0] & 5) throw op[1];
		return {
			value: op[0] ? op[1] : void 0,
			done: true
		};
	}
}
function __values(o) {
	var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
	if (m) return m.call(o);
	if (o && typeof o.length === "number") return { next: function() {
		if (o && i >= o.length) o = void 0;
		return {
			value: o && o[i++],
			done: !o
		};
	} };
	throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function __read(o, n) {
	var m = typeof Symbol === "function" && o[Symbol.iterator];
	if (!m) return o;
	var i = m.call(o), r, ar = [], e;
	try {
		while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
	} catch (error) {
		e = { error };
	} finally {
		try {
			if (r && !r.done && (m = i["return"])) m.call(i);
		} finally {
			if (e) throw e.error;
		}
	}
	return ar;
}
function __spreadArray(to, from, pack) {
	if (pack || arguments.length === 2) {
		for (var i = 0, l = from.length, ar; i < l; i++) if (ar || !(i in from)) {
			if (!ar) ar = Array.prototype.slice.call(from, 0, i);
			ar[i] = from[i];
		}
	}
	return to.concat(ar || Array.prototype.slice.call(from));
}
function __await(v) {
	return this instanceof __await ? (this.v = v, this) : new __await(v);
}
function __asyncGenerator(thisArg, _arguments, generator) {
	if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
	var g = generator.apply(thisArg, _arguments || []), i, q = [];
	return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function() {
		return this;
	}, i;
	function awaitReturn(f) {
		return function(v) {
			return Promise.resolve(v).then(f, reject);
		};
	}
	function verb(n, f) {
		if (g[n]) {
			i[n] = function(v) {
				return new Promise(function(a, b) {
					q.push([
						n,
						v,
						a,
						b
					]) > 1 || resume(n, v);
				});
			};
			if (f) i[n] = f(i[n]);
		}
	}
	function resume(n, v) {
		try {
			step(g[n](v));
		} catch (e) {
			settle(q[0][3], e);
		}
	}
	function step(r) {
		r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
	}
	function fulfill(value) {
		resume("next", value);
	}
	function reject(value) {
		resume("throw", value);
	}
	function settle(f, v) {
		if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]);
	}
}
function __asyncValues(o) {
	if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
	var m = o[Symbol.asyncIterator], i;
	return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
		return this;
	}, i);
	function verb(n) {
		i[n] = o[n] && function(v) {
			return new Promise(function(resolve, reject) {
				v = o[n](v), settle(resolve, reject, v.done, v.value);
			});
		};
	}
	function settle(resolve, reject, d, v) {
		Promise.resolve(v).then(function(v) {
			resolve({
				value: v,
				done: d
			});
		}, reject);
	}
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/util/isFunction.js
function isFunction(value) {
	return typeof value === "function";
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/util/createErrorClass.js
function createErrorClass(createImpl) {
	var _super = function(instance) {
		Error.call(instance);
		instance.stack = (/* @__PURE__ */ new Error()).stack;
	};
	var ctorFunc = createImpl(_super);
	ctorFunc.prototype = Object.create(Error.prototype);
	ctorFunc.prototype.constructor = ctorFunc;
	return ctorFunc;
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/util/UnsubscriptionError.js
var UnsubscriptionError = createErrorClass(function(_super) {
	return function UnsubscriptionErrorImpl(errors) {
		_super(this);
		this.message = errors ? errors.length + " errors occurred during unsubscription:\n" + errors.map(function(err, i) {
			return i + 1 + ") " + err.toString();
		}).join("\n  ") : "";
		this.name = "UnsubscriptionError";
		this.errors = errors;
	};
});
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/util/arrRemove.js
function arrRemove(arr, item) {
	if (arr) {
		var index = arr.indexOf(item);
		0 <= index && arr.splice(index, 1);
	}
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/Subscription.js
var Subscription = function() {
	function Subscription(initialTeardown) {
		this.initialTeardown = initialTeardown;
		this.closed = false;
		this._parentage = null;
		this._finalizers = null;
	}
	Subscription.prototype.unsubscribe = function() {
		var e_1, _a, e_2, _b;
		var errors;
		if (!this.closed) {
			this.closed = true;
			var _parentage = this._parentage;
			if (_parentage) {
				this._parentage = null;
				if (Array.isArray(_parentage)) try {
					for (var _parentage_1 = __values(_parentage), _parentage_1_1 = _parentage_1.next(); !_parentage_1_1.done; _parentage_1_1 = _parentage_1.next()) _parentage_1_1.value.remove(this);
				} catch (e_1_1) {
					e_1 = { error: e_1_1 };
				} finally {
					try {
						if (_parentage_1_1 && !_parentage_1_1.done && (_a = _parentage_1.return)) _a.call(_parentage_1);
					} finally {
						if (e_1) throw e_1.error;
					}
				}
				else _parentage.remove(this);
			}
			var initialFinalizer = this.initialTeardown;
			if (isFunction(initialFinalizer)) try {
				initialFinalizer();
			} catch (e) {
				errors = e instanceof UnsubscriptionError ? e.errors : [e];
			}
			var _finalizers = this._finalizers;
			if (_finalizers) {
				this._finalizers = null;
				try {
					for (var _finalizers_1 = __values(_finalizers), _finalizers_1_1 = _finalizers_1.next(); !_finalizers_1_1.done; _finalizers_1_1 = _finalizers_1.next()) {
						var finalizer = _finalizers_1_1.value;
						try {
							execFinalizer(finalizer);
						} catch (err) {
							errors = errors !== null && errors !== void 0 ? errors : [];
							if (err instanceof UnsubscriptionError) errors = __spreadArray(__spreadArray([], __read(errors)), __read(err.errors));
							else errors.push(err);
						}
					}
				} catch (e_2_1) {
					e_2 = { error: e_2_1 };
				} finally {
					try {
						if (_finalizers_1_1 && !_finalizers_1_1.done && (_b = _finalizers_1.return)) _b.call(_finalizers_1);
					} finally {
						if (e_2) throw e_2.error;
					}
				}
			}
			if (errors) throw new UnsubscriptionError(errors);
		}
	};
	Subscription.prototype.add = function(teardown) {
		var _a;
		if (teardown && teardown !== this) if (this.closed) execFinalizer(teardown);
		else {
			if (teardown instanceof Subscription) {
				if (teardown.closed || teardown._hasParent(this)) return;
				teardown._addParent(this);
			}
			(this._finalizers = (_a = this._finalizers) !== null && _a !== void 0 ? _a : []).push(teardown);
		}
	};
	Subscription.prototype._hasParent = function(parent) {
		var _parentage = this._parentage;
		return _parentage === parent || Array.isArray(_parentage) && _parentage.includes(parent);
	};
	Subscription.prototype._addParent = function(parent) {
		var _parentage = this._parentage;
		this._parentage = Array.isArray(_parentage) ? (_parentage.push(parent), _parentage) : _parentage ? [_parentage, parent] : parent;
	};
	Subscription.prototype._removeParent = function(parent) {
		var _parentage = this._parentage;
		if (_parentage === parent) this._parentage = null;
		else if (Array.isArray(_parentage)) arrRemove(_parentage, parent);
	};
	Subscription.prototype.remove = function(teardown) {
		var _finalizers = this._finalizers;
		_finalizers && arrRemove(_finalizers, teardown);
		if (teardown instanceof Subscription) teardown._removeParent(this);
	};
	Subscription.EMPTY = (function() {
		var empty = new Subscription();
		empty.closed = true;
		return empty;
	})();
	return Subscription;
}();
var EMPTY_SUBSCRIPTION = Subscription.EMPTY;
function isSubscription(value) {
	return value instanceof Subscription || value && "closed" in value && isFunction(value.remove) && isFunction(value.add) && isFunction(value.unsubscribe);
}
function execFinalizer(finalizer) {
	if (isFunction(finalizer)) finalizer();
	else finalizer.unsubscribe();
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/config.js
var config = {
	onUnhandledError: null,
	onStoppedNotification: null,
	Promise: void 0,
	useDeprecatedSynchronousErrorHandling: false,
	useDeprecatedNextContext: false
};
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/scheduler/timeoutProvider.js
var timeoutProvider = {
	setTimeout: function(handler, timeout) {
		var args = [];
		for (var _i = 2; _i < arguments.length; _i++) args[_i - 2] = arguments[_i];
		var delegate = timeoutProvider.delegate;
		if (delegate === null || delegate === void 0 ? void 0 : delegate.setTimeout) return delegate.setTimeout.apply(delegate, __spreadArray([handler, timeout], __read(args)));
		return setTimeout.apply(void 0, __spreadArray([handler, timeout], __read(args)));
	},
	clearTimeout: function(handle) {
		var delegate = timeoutProvider.delegate;
		return ((delegate === null || delegate === void 0 ? void 0 : delegate.clearTimeout) || clearTimeout)(handle);
	},
	delegate: void 0
};
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/util/reportUnhandledError.js
function reportUnhandledError(err) {
	timeoutProvider.setTimeout(function() {
		var onUnhandledError = config.onUnhandledError;
		if (onUnhandledError) onUnhandledError(err);
		else throw err;
	});
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/util/noop.js
function noop() {}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/NotificationFactories.js
var COMPLETE_NOTIFICATION = (function() {
	return createNotification("C", void 0, void 0);
})();
function errorNotification(error) {
	return createNotification("E", void 0, error);
}
function nextNotification(value) {
	return createNotification("N", value, void 0);
}
function createNotification(kind, value, error) {
	return {
		kind,
		value,
		error
	};
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/util/errorContext.js
var context = null;
function errorContext(cb) {
	if (config.useDeprecatedSynchronousErrorHandling) {
		var isRoot = !context;
		if (isRoot) context = {
			errorThrown: false,
			error: null
		};
		cb();
		if (isRoot) {
			var _a = context, errorThrown = _a.errorThrown, error = _a.error;
			context = null;
			if (errorThrown) throw error;
		}
	} else cb();
}
function captureError(err) {
	if (config.useDeprecatedSynchronousErrorHandling && context) {
		context.errorThrown = true;
		context.error = err;
	}
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/Subscriber.js
var Subscriber = function(_super) {
	__extends(Subscriber, _super);
	function Subscriber(destination) {
		var _this = _super.call(this) || this;
		_this.isStopped = false;
		if (destination) {
			_this.destination = destination;
			if (isSubscription(destination)) destination.add(_this);
		} else _this.destination = EMPTY_OBSERVER;
		return _this;
	}
	Subscriber.create = function(next, error, complete) {
		return new SafeSubscriber(next, error, complete);
	};
	Subscriber.prototype.next = function(value) {
		if (this.isStopped) handleStoppedNotification(nextNotification(value), this);
		else this._next(value);
	};
	Subscriber.prototype.error = function(err) {
		if (this.isStopped) handleStoppedNotification(errorNotification(err), this);
		else {
			this.isStopped = true;
			this._error(err);
		}
	};
	Subscriber.prototype.complete = function() {
		if (this.isStopped) handleStoppedNotification(COMPLETE_NOTIFICATION, this);
		else {
			this.isStopped = true;
			this._complete();
		}
	};
	Subscriber.prototype.unsubscribe = function() {
		if (!this.closed) {
			this.isStopped = true;
			_super.prototype.unsubscribe.call(this);
			this.destination = null;
		}
	};
	Subscriber.prototype._next = function(value) {
		this.destination.next(value);
	};
	Subscriber.prototype._error = function(err) {
		try {
			this.destination.error(err);
		} finally {
			this.unsubscribe();
		}
	};
	Subscriber.prototype._complete = function() {
		try {
			this.destination.complete();
		} finally {
			this.unsubscribe();
		}
	};
	return Subscriber;
}(Subscription);
var _bind = Function.prototype.bind;
function bind(fn, thisArg) {
	return _bind.call(fn, thisArg);
}
var ConsumerObserver = function() {
	function ConsumerObserver(partialObserver) {
		this.partialObserver = partialObserver;
	}
	ConsumerObserver.prototype.next = function(value) {
		var partialObserver = this.partialObserver;
		if (partialObserver.next) try {
			partialObserver.next(value);
		} catch (error) {
			handleUnhandledError(error);
		}
	};
	ConsumerObserver.prototype.error = function(err) {
		var partialObserver = this.partialObserver;
		if (partialObserver.error) try {
			partialObserver.error(err);
		} catch (error) {
			handleUnhandledError(error);
		}
		else handleUnhandledError(err);
	};
	ConsumerObserver.prototype.complete = function() {
		var partialObserver = this.partialObserver;
		if (partialObserver.complete) try {
			partialObserver.complete();
		} catch (error) {
			handleUnhandledError(error);
		}
	};
	return ConsumerObserver;
}();
var SafeSubscriber = function(_super) {
	__extends(SafeSubscriber, _super);
	function SafeSubscriber(observerOrNext, error, complete) {
		var _this = _super.call(this) || this;
		var partialObserver;
		if (isFunction(observerOrNext) || !observerOrNext) partialObserver = {
			next: observerOrNext !== null && observerOrNext !== void 0 ? observerOrNext : void 0,
			error: error !== null && error !== void 0 ? error : void 0,
			complete: complete !== null && complete !== void 0 ? complete : void 0
		};
		else {
			var context_1;
			if (_this && config.useDeprecatedNextContext) {
				context_1 = Object.create(observerOrNext);
				context_1.unsubscribe = function() {
					return _this.unsubscribe();
				};
				partialObserver = {
					next: observerOrNext.next && bind(observerOrNext.next, context_1),
					error: observerOrNext.error && bind(observerOrNext.error, context_1),
					complete: observerOrNext.complete && bind(observerOrNext.complete, context_1)
				};
			} else partialObserver = observerOrNext;
		}
		_this.destination = new ConsumerObserver(partialObserver);
		return _this;
	}
	return SafeSubscriber;
}(Subscriber);
function handleUnhandledError(error) {
	if (config.useDeprecatedSynchronousErrorHandling) captureError(error);
	else reportUnhandledError(error);
}
function defaultErrorHandler(err) {
	throw err;
}
function handleStoppedNotification(notification, subscriber) {
	var onStoppedNotification = config.onStoppedNotification;
	onStoppedNotification && timeoutProvider.setTimeout(function() {
		return onStoppedNotification(notification, subscriber);
	});
}
var EMPTY_OBSERVER = {
	closed: true,
	next: noop,
	error: defaultErrorHandler,
	complete: noop
};
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/symbol/observable.js
var observable = (function() {
	return typeof Symbol === "function" && Symbol.observable || "@@observable";
})();
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/util/identity.js
function identity(x) {
	return x;
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/util/pipe.js
function pipeFromArray(fns) {
	if (fns.length === 0) return identity;
	if (fns.length === 1) return fns[0];
	return function piped(input) {
		return fns.reduce(function(prev, fn) {
			return fn(prev);
		}, input);
	};
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/Observable.js
var Observable = function() {
	function Observable(subscribe) {
		if (subscribe) this._subscribe = subscribe;
	}
	Observable.prototype.lift = function(operator) {
		var observable = new Observable();
		observable.source = this;
		observable.operator = operator;
		return observable;
	};
	Observable.prototype.subscribe = function(observerOrNext, error, complete) {
		var _this = this;
		var subscriber = isSubscriber(observerOrNext) ? observerOrNext : new SafeSubscriber(observerOrNext, error, complete);
		errorContext(function() {
			var _a = _this, operator = _a.operator, source = _a.source;
			subscriber.add(operator ? operator.call(subscriber, source) : source ? _this._subscribe(subscriber) : _this._trySubscribe(subscriber));
		});
		return subscriber;
	};
	Observable.prototype._trySubscribe = function(sink) {
		try {
			return this._subscribe(sink);
		} catch (err) {
			sink.error(err);
		}
	};
	Observable.prototype.forEach = function(next, promiseCtor) {
		var _this = this;
		promiseCtor = getPromiseCtor(promiseCtor);
		return new promiseCtor(function(resolve, reject) {
			var subscriber = new SafeSubscriber({
				next: function(value) {
					try {
						next(value);
					} catch (err) {
						reject(err);
						subscriber.unsubscribe();
					}
				},
				error: reject,
				complete: resolve
			});
			_this.subscribe(subscriber);
		});
	};
	Observable.prototype._subscribe = function(subscriber) {
		var _a;
		return (_a = this.source) === null || _a === void 0 ? void 0 : _a.subscribe(subscriber);
	};
	Observable.prototype[observable] = function() {
		return this;
	};
	Observable.prototype.pipe = function() {
		var operations = [];
		for (var _i = 0; _i < arguments.length; _i++) operations[_i] = arguments[_i];
		return pipeFromArray(operations)(this);
	};
	Observable.prototype.toPromise = function(promiseCtor) {
		var _this = this;
		promiseCtor = getPromiseCtor(promiseCtor);
		return new promiseCtor(function(resolve, reject) {
			var value;
			_this.subscribe(function(x) {
				return value = x;
			}, function(err) {
				return reject(err);
			}, function() {
				return resolve(value);
			});
		});
	};
	Observable.create = function(subscribe) {
		return new Observable(subscribe);
	};
	return Observable;
}();
function getPromiseCtor(promiseCtor) {
	var _a;
	return (_a = promiseCtor !== null && promiseCtor !== void 0 ? promiseCtor : config.Promise) !== null && _a !== void 0 ? _a : Promise;
}
function isObserver(value) {
	return value && isFunction(value.next) && isFunction(value.error) && isFunction(value.complete);
}
function isSubscriber(value) {
	return value && value instanceof Subscriber || isObserver(value) && isSubscription(value);
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/util/lift.js
function hasLift(source) {
	return isFunction(source === null || source === void 0 ? void 0 : source.lift);
}
function operate(init) {
	return function(source) {
		if (hasLift(source)) return source.lift(function(liftedSource) {
			try {
				return init(liftedSource, this);
			} catch (err) {
				this.error(err);
			}
		});
		throw new TypeError("Unable to lift unknown Observable type");
	};
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js
function createOperatorSubscriber(destination, onNext, onComplete, onError, onFinalize) {
	return new OperatorSubscriber(destination, onNext, onComplete, onError, onFinalize);
}
var OperatorSubscriber = function(_super) {
	__extends(OperatorSubscriber, _super);
	function OperatorSubscriber(destination, onNext, onComplete, onError, onFinalize, shouldUnsubscribe) {
		var _this = _super.call(this, destination) || this;
		_this.onFinalize = onFinalize;
		_this.shouldUnsubscribe = shouldUnsubscribe;
		_this._next = onNext ? function(value) {
			try {
				onNext(value);
			} catch (err) {
				destination.error(err);
			}
		} : _super.prototype._next;
		_this._error = onError ? function(err) {
			try {
				onError(err);
			} catch (err) {
				destination.error(err);
			} finally {
				this.unsubscribe();
			}
		} : _super.prototype._error;
		_this._complete = onComplete ? function() {
			try {
				onComplete();
			} catch (err) {
				destination.error(err);
			} finally {
				this.unsubscribe();
			}
		} : _super.prototype._complete;
		return _this;
	}
	OperatorSubscriber.prototype.unsubscribe = function() {
		var _a;
		if (!this.shouldUnsubscribe || this.shouldUnsubscribe()) {
			var closed_1 = this.closed;
			_super.prototype.unsubscribe.call(this);
			!closed_1 && ((_a = this.onFinalize) === null || _a === void 0 || _a.call(this));
		}
	};
	return OperatorSubscriber;
}(Subscriber);
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/util/ObjectUnsubscribedError.js
var ObjectUnsubscribedError = createErrorClass(function(_super) {
	return function ObjectUnsubscribedErrorImpl() {
		_super(this);
		this.name = "ObjectUnsubscribedError";
		this.message = "object unsubscribed";
	};
});
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/Subject.js
var Subject = function(_super) {
	__extends(Subject, _super);
	function Subject() {
		var _this = _super.call(this) || this;
		_this.closed = false;
		_this.currentObservers = null;
		_this.observers = [];
		_this.isStopped = false;
		_this.hasError = false;
		_this.thrownError = null;
		return _this;
	}
	Subject.prototype.lift = function(operator) {
		var subject = new AnonymousSubject(this, this);
		subject.operator = operator;
		return subject;
	};
	Subject.prototype._throwIfClosed = function() {
		if (this.closed) throw new ObjectUnsubscribedError();
	};
	Subject.prototype.next = function(value) {
		var _this = this;
		errorContext(function() {
			var e_1, _a;
			_this._throwIfClosed();
			if (!_this.isStopped) {
				if (!_this.currentObservers) _this.currentObservers = Array.from(_this.observers);
				try {
					for (var _b = __values(_this.currentObservers), _c = _b.next(); !_c.done; _c = _b.next()) _c.value.next(value);
				} catch (e_1_1) {
					e_1 = { error: e_1_1 };
				} finally {
					try {
						if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
					} finally {
						if (e_1) throw e_1.error;
					}
				}
			}
		});
	};
	Subject.prototype.error = function(err) {
		var _this = this;
		errorContext(function() {
			_this._throwIfClosed();
			if (!_this.isStopped) {
				_this.hasError = _this.isStopped = true;
				_this.thrownError = err;
				var observers = _this.observers;
				while (observers.length) observers.shift().error(err);
			}
		});
	};
	Subject.prototype.complete = function() {
		var _this = this;
		errorContext(function() {
			_this._throwIfClosed();
			if (!_this.isStopped) {
				_this.isStopped = true;
				var observers = _this.observers;
				while (observers.length) observers.shift().complete();
			}
		});
	};
	Subject.prototype.unsubscribe = function() {
		this.isStopped = this.closed = true;
		this.observers = this.currentObservers = null;
	};
	Object.defineProperty(Subject.prototype, "observed", {
		get: function() {
			var _a;
			return ((_a = this.observers) === null || _a === void 0 ? void 0 : _a.length) > 0;
		},
		enumerable: false,
		configurable: true
	});
	Subject.prototype._trySubscribe = function(subscriber) {
		this._throwIfClosed();
		return _super.prototype._trySubscribe.call(this, subscriber);
	};
	Subject.prototype._subscribe = function(subscriber) {
		this._throwIfClosed();
		this._checkFinalizedStatuses(subscriber);
		return this._innerSubscribe(subscriber);
	};
	Subject.prototype._innerSubscribe = function(subscriber) {
		var _this = this;
		var _a = this, hasError = _a.hasError, isStopped = _a.isStopped, observers = _a.observers;
		if (hasError || isStopped) return EMPTY_SUBSCRIPTION;
		this.currentObservers = null;
		observers.push(subscriber);
		return new Subscription(function() {
			_this.currentObservers = null;
			arrRemove(observers, subscriber);
		});
	};
	Subject.prototype._checkFinalizedStatuses = function(subscriber) {
		var _a = this, hasError = _a.hasError, thrownError = _a.thrownError, isStopped = _a.isStopped;
		if (hasError) subscriber.error(thrownError);
		else if (isStopped) subscriber.complete();
	};
	Subject.prototype.asObservable = function() {
		var observable = new Observable();
		observable.source = this;
		return observable;
	};
	Subject.create = function(destination, source) {
		return new AnonymousSubject(destination, source);
	};
	return Subject;
}(Observable);
var AnonymousSubject = function(_super) {
	__extends(AnonymousSubject, _super);
	function AnonymousSubject(destination, source) {
		var _this = _super.call(this) || this;
		_this.destination = destination;
		_this.source = source;
		return _this;
	}
	AnonymousSubject.prototype.next = function(value) {
		var _a, _b;
		(_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.next) === null || _b === void 0 || _b.call(_a, value);
	};
	AnonymousSubject.prototype.error = function(err) {
		var _a, _b;
		(_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.error) === null || _b === void 0 || _b.call(_a, err);
	};
	AnonymousSubject.prototype.complete = function() {
		var _a, _b;
		(_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.complete) === null || _b === void 0 || _b.call(_a);
	};
	AnonymousSubject.prototype._subscribe = function(subscriber) {
		var _a, _b;
		return (_b = (_a = this.source) === null || _a === void 0 ? void 0 : _a.subscribe(subscriber)) !== null && _b !== void 0 ? _b : EMPTY_SUBSCRIPTION;
	};
	return AnonymousSubject;
}(Subject);
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/scheduler/dateTimestampProvider.js
var dateTimestampProvider = {
	now: function() {
		return (dateTimestampProvider.delegate || Date).now();
	},
	delegate: void 0
};
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/ReplaySubject.js
var ReplaySubject = function(_super) {
	__extends(ReplaySubject, _super);
	function ReplaySubject(_bufferSize, _windowTime, _timestampProvider) {
		if (_bufferSize === void 0) _bufferSize = Infinity;
		if (_windowTime === void 0) _windowTime = Infinity;
		if (_timestampProvider === void 0) _timestampProvider = dateTimestampProvider;
		var _this = _super.call(this) || this;
		_this._bufferSize = _bufferSize;
		_this._windowTime = _windowTime;
		_this._timestampProvider = _timestampProvider;
		_this._buffer = [];
		_this._infiniteTimeWindow = true;
		_this._infiniteTimeWindow = _windowTime === Infinity;
		_this._bufferSize = Math.max(1, _bufferSize);
		_this._windowTime = Math.max(1, _windowTime);
		return _this;
	}
	ReplaySubject.prototype.next = function(value) {
		var _a = this, isStopped = _a.isStopped, _buffer = _a._buffer, _infiniteTimeWindow = _a._infiniteTimeWindow, _timestampProvider = _a._timestampProvider, _windowTime = _a._windowTime;
		if (!isStopped) {
			_buffer.push(value);
			!_infiniteTimeWindow && _buffer.push(_timestampProvider.now() + _windowTime);
		}
		this._trimBuffer();
		_super.prototype.next.call(this, value);
	};
	ReplaySubject.prototype._subscribe = function(subscriber) {
		this._throwIfClosed();
		this._trimBuffer();
		var subscription = this._innerSubscribe(subscriber);
		var _a = this, _infiniteTimeWindow = _a._infiniteTimeWindow;
		var copy = _a._buffer.slice();
		for (var i = 0; i < copy.length && !subscriber.closed; i += _infiniteTimeWindow ? 1 : 2) subscriber.next(copy[i]);
		this._checkFinalizedStatuses(subscriber);
		return subscription;
	};
	ReplaySubject.prototype._trimBuffer = function() {
		var _a = this, _bufferSize = _a._bufferSize, _timestampProvider = _a._timestampProvider, _buffer = _a._buffer, _infiniteTimeWindow = _a._infiniteTimeWindow;
		var adjustedBufferSize = (_infiniteTimeWindow ? 1 : 2) * _bufferSize;
		_bufferSize < Infinity && adjustedBufferSize < _buffer.length && _buffer.splice(0, _buffer.length - adjustedBufferSize);
		if (!_infiniteTimeWindow) {
			var now = _timestampProvider.now();
			var last = 0;
			for (var i = 1; i < _buffer.length && _buffer[i] <= now; i += 2) last = i;
			last && _buffer.splice(0, last + 1);
		}
	};
	return ReplaySubject;
}(Subject);
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/util/isArrayLike.js
var isArrayLike = (function(x) {
	return x && typeof x.length === "number" && typeof x !== "function";
});
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/util/isPromise.js
function isPromise(value) {
	return isFunction(value === null || value === void 0 ? void 0 : value.then);
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/util/isInteropObservable.js
function isInteropObservable(input) {
	return isFunction(input[observable]);
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/util/isAsyncIterable.js
function isAsyncIterable(obj) {
	return Symbol.asyncIterator && isFunction(obj === null || obj === void 0 ? void 0 : obj[Symbol.asyncIterator]);
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/util/throwUnobservableError.js
function createInvalidObservableTypeError(input) {
	return /* @__PURE__ */ new TypeError("You provided " + (input !== null && typeof input === "object" ? "an invalid object" : "'" + input + "'") + " where a stream was expected. You can provide an Observable, Promise, ReadableStream, Array, AsyncIterable, or Iterable.");
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/symbol/iterator.js
function getSymbolIterator() {
	if (typeof Symbol !== "function" || !Symbol.iterator) return "@@iterator";
	return Symbol.iterator;
}
var iterator = getSymbolIterator();
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/util/isIterable.js
function isIterable(input) {
	return isFunction(input === null || input === void 0 ? void 0 : input[iterator]);
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/util/isReadableStreamLike.js
function readableStreamLikeToAsyncGenerator(readableStream) {
	return __asyncGenerator(this, arguments, function readableStreamLikeToAsyncGenerator_1() {
		var reader, _a, value, done;
		return __generator(this, function(_b) {
			switch (_b.label) {
				case 0:
					reader = readableStream.getReader();
					_b.label = 1;
				case 1:
					_b.trys.push([
						1,
						,
						9,
						10
					]);
					_b.label = 2;
				case 2: return [4, __await(reader.read())];
				case 3:
					_a = _b.sent(), value = _a.value, done = _a.done;
					if (!done) return [3, 5];
					return [4, __await(void 0)];
				case 4: return [2, _b.sent()];
				case 5: return [4, __await(value)];
				case 6: return [4, _b.sent()];
				case 7:
					_b.sent();
					return [3, 2];
				case 8: return [3, 10];
				case 9:
					reader.releaseLock();
					return [7];
				case 10: return [2];
			}
		});
	});
}
function isReadableStreamLike(obj) {
	return isFunction(obj === null || obj === void 0 ? void 0 : obj.getReader);
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/observable/innerFrom.js
function innerFrom(input) {
	if (input instanceof Observable) return input;
	if (input != null) {
		if (isInteropObservable(input)) return fromInteropObservable(input);
		if (isArrayLike(input)) return fromArrayLike(input);
		if (isPromise(input)) return fromPromise(input);
		if (isAsyncIterable(input)) return fromAsyncIterable(input);
		if (isIterable(input)) return fromIterable(input);
		if (isReadableStreamLike(input)) return fromReadableStreamLike(input);
	}
	throw createInvalidObservableTypeError(input);
}
function fromInteropObservable(obj) {
	return new Observable(function(subscriber) {
		var obs = obj[observable]();
		if (isFunction(obs.subscribe)) return obs.subscribe(subscriber);
		throw new TypeError("Provided object does not correctly implement Symbol.observable");
	});
}
function fromArrayLike(array) {
	return new Observable(function(subscriber) {
		for (var i = 0; i < array.length && !subscriber.closed; i++) subscriber.next(array[i]);
		subscriber.complete();
	});
}
function fromPromise(promise) {
	return new Observable(function(subscriber) {
		promise.then(function(value) {
			if (!subscriber.closed) {
				subscriber.next(value);
				subscriber.complete();
			}
		}, function(err) {
			return subscriber.error(err);
		}).then(null, reportUnhandledError);
	});
}
function fromIterable(iterable) {
	return new Observable(function(subscriber) {
		var e_1, _a;
		try {
			for (var iterable_1 = __values(iterable), iterable_1_1 = iterable_1.next(); !iterable_1_1.done; iterable_1_1 = iterable_1.next()) {
				var value = iterable_1_1.value;
				subscriber.next(value);
				if (subscriber.closed) return;
			}
		} catch (e_1_1) {
			e_1 = { error: e_1_1 };
		} finally {
			try {
				if (iterable_1_1 && !iterable_1_1.done && (_a = iterable_1.return)) _a.call(iterable_1);
			} finally {
				if (e_1) throw e_1.error;
			}
		}
		subscriber.complete();
	});
}
function fromAsyncIterable(asyncIterable) {
	return new Observable(function(subscriber) {
		process(asyncIterable, subscriber).catch(function(err) {
			return subscriber.error(err);
		});
	});
}
function fromReadableStreamLike(readableStream) {
	return fromAsyncIterable(readableStreamLikeToAsyncGenerator(readableStream));
}
function process(asyncIterable, subscriber) {
	var asyncIterable_1, asyncIterable_1_1;
	var e_2, _a;
	return __awaiter(this, void 0, void 0, function() {
		var value, e_2_1;
		return __generator(this, function(_b) {
			switch (_b.label) {
				case 0:
					_b.trys.push([
						0,
						5,
						6,
						11
					]);
					asyncIterable_1 = __asyncValues(asyncIterable);
					_b.label = 1;
				case 1: return [4, asyncIterable_1.next()];
				case 2:
					if (!(asyncIterable_1_1 = _b.sent(), !asyncIterable_1_1.done)) return [3, 4];
					value = asyncIterable_1_1.value;
					subscriber.next(value);
					if (subscriber.closed) return [2];
					_b.label = 3;
				case 3: return [3, 1];
				case 4: return [3, 11];
				case 5:
					e_2_1 = _b.sent();
					e_2 = { error: e_2_1 };
					return [3, 11];
				case 6:
					_b.trys.push([
						6,
						,
						9,
						10
					]);
					if (!(asyncIterable_1_1 && !asyncIterable_1_1.done && (_a = asyncIterable_1.return))) return [3, 8];
					return [4, _a.call(asyncIterable_1)];
				case 7:
					_b.sent();
					_b.label = 8;
				case 8: return [3, 10];
				case 9:
					if (e_2) throw e_2.error;
					return [7];
				case 10: return [7];
				case 11:
					subscriber.complete();
					return [2];
			}
		});
	});
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/operators/map.js
function map(project, thisArg) {
	return operate(function(source, subscriber) {
		var index = 0;
		source.subscribe(createOperatorSubscriber(subscriber, function(value) {
			subscriber.next(project.call(thisArg, value, index++));
		}));
	});
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/operators/scanInternals.js
function scanInternals(accumulator, seed, hasSeed, emitOnNext, emitBeforeComplete) {
	return function(source, subscriber) {
		var hasState = hasSeed;
		var state = seed;
		var index = 0;
		source.subscribe(createOperatorSubscriber(subscriber, function(value) {
			var i = index++;
			state = hasState ? accumulator(state, value, i) : (hasState = true, value);
			emitOnNext && subscriber.next(state);
		}, emitBeforeComplete && (function() {
			hasState && subscriber.next(state);
			subscriber.complete();
		})));
	};
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/operators/scan.js
function scan(accumulator, seed) {
	return operate(scanInternals(accumulator, seed, arguments.length >= 2, true));
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/operators/share.js
function share(options) {
	if (options === void 0) options = {};
	var _a = options.connector, connector = _a === void 0 ? function() {
		return new Subject();
	} : _a, _b = options.resetOnError, resetOnError = _b === void 0 ? true : _b, _c = options.resetOnComplete, resetOnComplete = _c === void 0 ? true : _c, _d = options.resetOnRefCountZero, resetOnRefCountZero = _d === void 0 ? true : _d;
	return function(wrapperSource) {
		var connection;
		var resetConnection;
		var subject;
		var refCount = 0;
		var hasCompleted = false;
		var hasErrored = false;
		var cancelReset = function() {
			resetConnection === null || resetConnection === void 0 || resetConnection.unsubscribe();
			resetConnection = void 0;
		};
		var reset = function() {
			cancelReset();
			connection = subject = void 0;
			hasCompleted = hasErrored = false;
		};
		var resetAndUnsubscribe = function() {
			var conn = connection;
			reset();
			conn === null || conn === void 0 || conn.unsubscribe();
		};
		return operate(function(source, subscriber) {
			refCount++;
			if (!hasErrored && !hasCompleted) cancelReset();
			var dest = subject = subject !== null && subject !== void 0 ? subject : connector();
			subscriber.add(function() {
				refCount--;
				if (refCount === 0 && !hasErrored && !hasCompleted) resetConnection = handleReset(resetAndUnsubscribe, resetOnRefCountZero);
			});
			dest.subscribe(subscriber);
			if (!connection && refCount > 0) {
				connection = new SafeSubscriber({
					next: function(value) {
						return dest.next(value);
					},
					error: function(err) {
						hasErrored = true;
						cancelReset();
						resetConnection = handleReset(reset, resetOnError, err);
						dest.error(err);
					},
					complete: function() {
						hasCompleted = true;
						cancelReset();
						resetConnection = handleReset(reset, resetOnComplete);
						dest.complete();
					}
				});
				innerFrom(source).subscribe(connection);
			}
		})(wrapperSource);
	};
}
function handleReset(reset, on) {
	var args = [];
	for (var _i = 2; _i < arguments.length; _i++) args[_i - 2] = arguments[_i];
	if (on === true) {
		reset();
		return;
	}
	if (on === false) return;
	var onSubscriber = new SafeSubscriber({ next: function() {
		onSubscriber.unsubscribe();
		reset();
	} });
	return innerFrom(on.apply(void 0, __spreadArray([], __read(args)))).subscribe(onSubscriber);
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/operators/shareReplay.js
function shareReplay(configOrBufferSize, windowTime, scheduler) {
	var _a, _b, _c;
	var bufferSize;
	var refCount = false;
	if (configOrBufferSize && typeof configOrBufferSize === "object") _a = configOrBufferSize.bufferSize, bufferSize = _a === void 0 ? Infinity : _a, _b = configOrBufferSize.windowTime, windowTime = _b === void 0 ? Infinity : _b, _c = configOrBufferSize.refCount, refCount = _c === void 0 ? false : _c, scheduler = configOrBufferSize.scheduler;
	else bufferSize = configOrBufferSize !== null && configOrBufferSize !== void 0 ? configOrBufferSize : Infinity;
	return share({
		connector: function() {
			return new ReplaySubject(bufferSize, windowTime, scheduler);
		},
		resetOnError: true,
		resetOnComplete: false,
		resetOnRefCountZero: refCount
	});
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/operators/takeUntil.js
function takeUntil(notifier) {
	return operate(function(source, subscriber) {
		innerFrom(notifier).subscribe(createOperatorSubscriber(subscriber, function() {
			return subscriber.complete();
		}, noop));
		!subscriber.closed && source.subscribe(subscriber);
	});
}
//#endregion
//#region src/core/infinite-scroll/index.ts
var InfiniteScroller = class InfiniteScroller {
	paginationOffset = 1;
	rules;
	observer;
	paginationGenerator;
	constructor(options) {
		this.rules = options.rules;
		this.paginationOffset = this.rules.paginationStrategy.getPaginationOffset();
		Object.assign(this, options);
		if (this.rules.getPaginationData) this.getPaginationData = this.rules.getPaginationData;
		this.paginationGenerator = this.rules.customGenerator || InfiniteScroller.generatorForPaginationStrategy(this.rules.paginationStrategy);
		this.setObserver(this.rules.observable);
		this.setAutoScroll();
	}
	dispose() {
		if (this.observer) this.observer.dispose();
	}
	setObserver(observable) {
		if (this.observer) this.observer.dispose();
		this.observer = Observer.observeWhile(observable, this.generatorConsumer, this.rules.store.state.delay);
		return this;
	}
	subject = new Subject();
	setAutoScroll() {
		const autoScrollWrapper = async () => {
			if (this.rules.store.state.autoScroll) {
				await wait(this.rules.store.state.delay);
				if (!await this.generatorConsumer()) return;
				await autoScrollWrapper();
			}
		};
		autoScrollWrapper();
		this.rules.store.stateSubject.subscribe((type) => {
			if (type?.autoScroll) autoScrollWrapper();
		});
	}
	generatorConsumer = async () => {
		if (!this.rules.store.state.infiniteScrollEnabled) return true;
		const { value, done } = await this.paginationGenerator.next();
		if (done) return false;
		const { url, offset } = value;
		await this.doScroll(url, offset);
		return true;
	};
	async getPaginationData(url) {
		return await fetchHtml(url);
	}
	async doScroll(url, offset) {
		const page = await this.getPaginationData(url);
		this.paginationOffset = Math.max(this.paginationOffset, offset);
		this.subject.next({
			type: "scroll",
			scroller: this,
			page
		});
		if (this.rules.store.state.writeHistory) history.replaceState({}, "", url);
	}
	static async *generatorForPaginationStrategy(pstrategy) {
		const _offset = pstrategy.getPaginationOffset();
		const end = pstrategy.getPaginationLast();
		const urlGenerator = pstrategy.getPaginationUrlGenerator();
		for (let offset = _offset; offset <= end; offset++) yield {
			url: await urlGenerator(offset),
			offset
		};
	}
	static create(rules) {
		rules.store.state.$paginationLast = rules.paginationStrategy.getPaginationLast();
		const infiniteScroller = new InfiniteScroller({ rules });
		rules.store.state.$paginationOffset = infiniteScroller.paginationOffset;
		infiniteScroller.subject.subscribe((x) => {
			if (x.type === "scroll") {
				rules.store.state.$paginationOffset = x.scroller.paginationOffset;
				const prevScrollPos = document.documentElement.scrollTop;
				rules.dataManager.parseData(x.page).then(() => {
					window.scrollTo(0, prevScrollPos);
				});
			}
		});
		return infiniteScroller;
	}
};
//#endregion
//#region src/core/parsers/pagination-parser/pagination-strategies/PaginationStrategy.ts
var PaginationStrategy = class {
	doc = document;
	url;
	paginationSelector = ".pagination";
	searchParamSelector = "page";
	static _pathnameSelector = /\/(page\/)?\d+\/?$/;
	pathnameSelector = /\/(\d+)\/?$/;
	dataparamSelector = "[data-parameters *= from]";
	overwritePaginationLast;
	offsetMin = 1;
	constructor(options) {
		if (options) Object.entries(options).forEach(([k, v]) => {
			Object.assign(this, { [k]: v });
		});
		this.url = parseUrl(options?.url || this.doc.URL);
	}
	getPaginationElement() {
		return this.doc.querySelector(this.paginationSelector);
	}
	get hasPagination() {
		return !!this.getPaginationElement();
	}
	getPaginationOffset() {
		return this.offsetMin;
	}
	getPaginationLast() {
		if (this.overwritePaginationLast) return this.overwritePaginationLast(1);
		return 1;
	}
	getPaginationUrlGenerator() {
		return (_) => this.url.href;
	}
};
//#endregion
//#region src/core/parsers/pagination-parser/pagination-strategies/PaginationStrategyDataParams.ts
var PaginationStrategyDataParams = class extends PaginationStrategy {
	getPaginationLast() {
		const links = this.getPaginationElement()?.querySelectorAll(this.dataparamSelector);
		const pages = Array.from(links || [], (l) => {
			const v = l.getAttribute("data-parameters")?.match(/from\w*:(\d+)/)?.[1] || this.offsetMin.toString();
			return parseInt(v);
		});
		const lastPage = Math.max(...pages, this.offsetMin);
		if (this.overwritePaginationLast) return this.overwritePaginationLast(lastPage);
		return lastPage;
	}
	getPaginationOffset() {
		const link = this.getPaginationElement()?.querySelector(".prev[data-parameters *= from], .prev [data-parameters *= from]");
		if (!link) return this.offsetMin;
		const v = link.getAttribute("data-parameters")?.match(/from\w*:(\d+)/)?.[1] || this.offsetMin.toString();
		return parseInt(v);
	}
	getPaginationUrlGenerator() {
		const url = new URL(this.url.href);
		const parametersElement = this.getPaginationElement()?.querySelector("a[data-block-id][data-parameters]");
		const attrs = {
			block_id: parametersElement?.getAttribute("data-block-id") || "",
			function: "get_block",
			mode: "async",
			...parseDataParams(parametersElement?.getAttribute("data-parameters") || "")
		};
		Object.keys(attrs).forEach((k) => {
			url.searchParams.set(k, attrs[k]);
		});
		const paginationUrlGenerator = (n) => {
			Object.keys(attrs).forEach((k) => {
				k.includes("from") && url.searchParams.set(k, n.toString());
			});
			url.searchParams.set("_", Date.now().toString());
			return url.href;
		};
		return paginationUrlGenerator;
	}
	static testLinks(doc = document) {
		return Array.from(doc.querySelectorAll("[data-parameters *= from]")).length > 0;
	}
};
//#endregion
//#region node_modules/urlpattern-polyfill/dist/urlpattern.js
var Pe$1 = Object.defineProperty;
var a = (e, t) => Pe$1(e, "name", {
	value: t,
	configurable: !0
});
var P = class {
	type = 3;
	name = "";
	prefix = "";
	value = "";
	suffix = "";
	modifier = 3;
	constructor(t, r, n, c, l, f) {
		this.type = t, this.name = r, this.prefix = n, this.value = c, this.suffix = l, this.modifier = f;
	}
	hasCustomName() {
		return this.name !== "" && typeof this.name != "number";
	}
};
a(P, "Part");
var Re$1 = /[$_\p{ID_Start}]/u;
var Ee$1 = /[$_\u200C\u200D\p{ID_Continue}]/u;
var v = ".*";
function Oe(e, t) {
	return (t ? /^[\x00-\xFF]*$/ : /^[\x00-\x7F]*$/).test(e);
}
a(Oe, "isASCII");
function D(e, t = !1) {
	let r = [], n = 0;
	for (; n < e.length;) {
		let c = e[n], l = a(function(f) {
			if (!t) throw new TypeError(f);
			r.push({
				type: "INVALID_CHAR",
				index: n,
				value: e[n++]
			});
		}, "ErrorOrInvalid");
		if (c === "*") {
			r.push({
				type: "ASTERISK",
				index: n,
				value: e[n++]
			});
			continue;
		}
		if (c === "+" || c === "?") {
			r.push({
				type: "OTHER_MODIFIER",
				index: n,
				value: e[n++]
			});
			continue;
		}
		if (c === "\\") {
			r.push({
				type: "ESCAPED_CHAR",
				index: n++,
				value: e[n++]
			});
			continue;
		}
		if (c === "{") {
			r.push({
				type: "OPEN",
				index: n,
				value: e[n++]
			});
			continue;
		}
		if (c === "}") {
			r.push({
				type: "CLOSE",
				index: n,
				value: e[n++]
			});
			continue;
		}
		if (c === ":") {
			let f = "", s = n + 1;
			for (; s < e.length;) {
				let i = e.substr(s, 1);
				if (s === n + 1 && Re$1.test(i) || s !== n + 1 && Ee$1.test(i)) {
					f += e[s++];
					continue;
				}
				break;
			}
			if (!f) {
				l(`Missing parameter name at ${n}`);
				continue;
			}
			r.push({
				type: "NAME",
				index: n,
				value: f
			}), n = s;
			continue;
		}
		if (c === "(") {
			let f = 1, s = "", i = n + 1, o = !1;
			if (e[i] === "?") {
				l(`Pattern cannot start with "?" at ${i}`);
				continue;
			}
			for (; i < e.length;) {
				if (!Oe(e[i], !1)) {
					l(`Invalid character '${e[i]}' at ${i}.`), o = !0;
					break;
				}
				if (e[i] === "\\") {
					s += e[i++] + e[i++];
					continue;
				}
				if (e[i] === ")") {
					if (f--, f === 0) {
						i++;
						break;
					}
				} else if (e[i] === "(" && (f++, e[i + 1] !== "?")) {
					l(`Capturing groups are not allowed at ${i}`), o = !0;
					break;
				}
				s += e[i++];
			}
			if (o) continue;
			if (f) {
				l(`Unbalanced pattern at ${n}`);
				continue;
			}
			if (!s) {
				l(`Missing pattern at ${n}`);
				continue;
			}
			r.push({
				type: "REGEX",
				index: n,
				value: s
			}), n = i;
			continue;
		}
		r.push({
			type: "CHAR",
			index: n,
			value: e[n++]
		});
	}
	return r.push({
		type: "END",
		index: n,
		value: ""
	}), r;
}
a(D, "lexer");
function F(e, t = {}) {
	let r = D(e);
	t.delimiter ??= "/#?", t.prefixes ??= "./";
	let n = `[^${x(t.delimiter)}]+?`, c = [], l = 0, f = 0, i = /* @__PURE__ */ new Set(), o = a((u) => {
		if (f < r.length && r[f].type === u) return r[f++].value;
	}, "tryConsume"), h = a(() => o("OTHER_MODIFIER") ?? o("ASTERISK"), "tryConsumeModifier"), p = a((u) => {
		let d = o(u);
		if (d !== void 0) return d;
		let { type: g, index: y } = r[f];
		throw new TypeError(`Unexpected ${g} at ${y}, expected ${u}`);
	}, "mustConsume"), A = a(() => {
		let u = "", d;
		for (; d = o("CHAR") ?? o("ESCAPED_CHAR");) u += d;
		return u;
	}, "consumeText"), xe = a((u) => u, "DefaultEncodePart"), N = t.encodePart || xe, H = "", $ = a((u) => {
		H += u;
	}, "appendToPendingFixedValue"), M = a(() => {
		H.length && (c.push(new P(3, "", "", N(H), "", 3)), H = "");
	}, "maybeAddPartFromPendingFixedValue"), X = a((u, d, g, y, Z) => {
		let m = 3;
		switch (Z) {
			case "?":
				m = 1;
				break;
			case "*":
				m = 0;
				break;
			case "+":
				m = 2;
				break;
		}
		if (!d && !g && m === 3) {
			$(u);
			return;
		}
		if (M(), !d && !g) {
			if (!u) return;
			c.push(new P(3, "", "", N(u), "", m));
			return;
		}
		let S;
		g ? g === "*" ? S = v : S = g : S = n;
		let k = 2;
		S === n ? (k = 1, S = "") : S === v && (k = 0, S = "");
		let E;
		if (d ? E = d : g && (E = l++), i.has(E)) throw new TypeError(`Duplicate name '${E}'.`);
		i.add(E), c.push(new P(k, E, N(u), S, N(y), m));
	}, "addPart");
	for (; f < r.length;) {
		let u = o("CHAR"), d = o("NAME"), g = o("REGEX");
		if (!d && !g && (g = o("ASTERISK")), d || g) {
			let m = u ?? "";
			t.prefixes.indexOf(m) === -1 && ($(m), m = ""), M();
			let S = h();
			X(m, d, g, "", S);
			continue;
		}
		let y = u ?? o("ESCAPED_CHAR");
		if (y) {
			$(y);
			continue;
		}
		if (o("OPEN")) {
			let m = A(), S = o("NAME"), k = o("REGEX");
			!S && !k && (k = o("ASTERISK"));
			let E = A();
			p("CLOSE");
			let be = h();
			X(m, S, k, E, be);
			continue;
		}
		M(), p("END");
	}
	return c;
}
a(F, "parse");
function x(e) {
	return e.replace(/([.+*?^${}()[\]|/\\])/g, "\\$1");
}
a(x, "escapeString");
function B$1(e) {
	return e && e.ignoreCase ? "ui" : "u";
}
a(B$1, "flags");
function q$1(e, t, r) {
	return W$1(F(e, r), t, r);
}
a(q$1, "stringToRegexp");
function T(e) {
	switch (e) {
		case 0: return "*";
		case 1: return "?";
		case 2: return "+";
		case 3: return "";
	}
}
a(T, "modifierToString");
function W$1(e, t, r = {}) {
	r.delimiter ??= "/#?", r.prefixes ??= "./", r.sensitive ??= !1, r.strict ??= !1, r.end ??= !0, r.start ??= !0, r.endsWith = "";
	let n = r.start ? "^" : "";
	for (let s of e) {
		if (s.type === 3) {
			s.modifier === 3 ? n += x(s.value) : n += `(?:${x(s.value)})${T(s.modifier)}`;
			continue;
		}
		t && t.push(s.name);
		let i = `[^${x(r.delimiter)}]+?`, o = s.value;
		if (s.type === 1 ? o = i : s.type === 0 && (o = v), !s.prefix.length && !s.suffix.length) {
			s.modifier === 3 || s.modifier === 1 ? n += `(${o})${T(s.modifier)}` : n += `((?:${o})${T(s.modifier)})`;
			continue;
		}
		if (s.modifier === 3 || s.modifier === 1) {
			n += `(?:${x(s.prefix)}(${o})${x(s.suffix)})`, n += T(s.modifier);
			continue;
		}
		n += `(?:${x(s.prefix)}`, n += `((?:${o})(?:`, n += x(s.suffix), n += x(s.prefix), n += `(?:${o}))*)${x(s.suffix)})`, s.modifier === 0 && (n += "?");
	}
	let c = `[${x(r.endsWith)}]|$`, l = `[${x(r.delimiter)}]`;
	if (r.end) return r.strict || (n += `${l}?`), r.endsWith.length ? n += `(?=${c})` : n += "$", new RegExp(n, B$1(r));
	r.strict || (n += `(?:${l}(?=${c}))?`);
	let f = !1;
	if (e.length) {
		let s = e[e.length - 1];
		s.type === 3 && s.modifier === 3 && (f = r.delimiter.indexOf(s) > -1);
	}
	return f || (n += `(?=${l}|${c})`), new RegExp(n, B$1(r));
}
a(W$1, "partsToRegexp");
var b = {
	delimiter: "",
	prefixes: "",
	sensitive: !0,
	strict: !0
};
var J$1 = {
	delimiter: ".",
	prefixes: "",
	sensitive: !0,
	strict: !0
};
var Q$1 = {
	delimiter: "/",
	prefixes: "/",
	sensitive: !0,
	strict: !0
};
function ee$1(e, t) {
	return e.length ? e[0] === "/" ? !0 : !t || e.length < 2 ? !1 : (e[0] == "\\" || e[0] == "{") && e[1] == "/" : !1;
}
a(ee$1, "isAbsolutePathname");
function te$1(e, t) {
	return e.startsWith(t) ? e.substring(t.length, e.length) : e;
}
a(te$1, "maybeStripPrefix");
function ke$1(e, t) {
	return e.endsWith(t) ? e.substr(0, e.length - t.length) : e;
}
a(ke$1, "maybeStripSuffix");
function _(e) {
	return !e || e.length < 2 ? !1 : e[0] === "[" || (e[0] === "\\" || e[0] === "{") && e[1] === "[";
}
a(_, "treatAsIPv6Hostname");
var re$1 = [
	"ftp",
	"file",
	"http",
	"https",
	"ws",
	"wss"
];
function U(e) {
	if (!e) return !0;
	for (let t of re$1) if (e.test(t)) return !0;
	return !1;
}
a(U, "isSpecialScheme");
function ne$1(e, t) {
	if (e = te$1(e, "#"), t || e === "") return e;
	let r = new URL("https://example.com");
	return r.hash = e, r.hash ? r.hash.substring(1, r.hash.length) : "";
}
a(ne$1, "canonicalizeHash");
function se(e, t) {
	if (e = te$1(e, "?"), t || e === "") return e;
	let r = new URL("https://example.com");
	return r.search = e, r.search ? r.search.substring(1, r.search.length) : "";
}
a(se, "canonicalizeSearch");
function ie(e, t) {
	return t || e === "" ? e : _(e) ? K(e) : j(e);
}
a(ie, "canonicalizeHostname");
function ae(e, t) {
	if (t || e === "") return e;
	let r = new URL("https://example.com");
	return r.password = e, r.password;
}
a(ae, "canonicalizePassword");
function oe$1(e, t) {
	if (t || e === "") return e;
	let r = new URL("https://example.com");
	return r.username = e, r.username;
}
a(oe$1, "canonicalizeUsername");
function ce$1(e, t, r) {
	if (r || e === "") return e;
	if (t && !re$1.includes(t)) return new URL(`${t}:${e}`).pathname;
	let n = e[0] == "/";
	return e = new URL(n ? e : "/-" + e, "https://example.com").pathname, n || (e = e.substring(2, e.length)), e;
}
a(ce$1, "canonicalizePathname");
function le$1(e, t, r) {
	return z(t) === e && (e = ""), r || e === "" ? e : G(e);
}
a(le$1, "canonicalizePort");
function fe$1(e, t) {
	return e = ke$1(e, ":"), t || e === "" ? e : w(e);
}
a(fe$1, "canonicalizeProtocol");
function z(e) {
	switch (e) {
		case "ws":
		case "http": return "80";
		case "wws":
		case "https": return "443";
		case "ftp": return "21";
		default: return "";
	}
}
a(z, "defaultPortForProtocol");
function w(e) {
	if (e === "") return e;
	if (/^[-+.A-Za-z0-9]*$/.test(e)) return e.toLowerCase();
	throw new TypeError(`Invalid protocol '${e}'.`);
}
a(w, "protocolEncodeCallback");
function he$1(e) {
	if (e === "") return e;
	let t = new URL("https://example.com");
	return t.username = e, t.username;
}
a(he$1, "usernameEncodeCallback");
function ue$1(e) {
	if (e === "") return e;
	let t = new URL("https://example.com");
	return t.password = e, t.password;
}
a(ue$1, "passwordEncodeCallback");
function j(e) {
	if (e === "") return e;
	if (/[\t\n\r #%/:<>?@[\]^\\|]/g.test(e)) throw new TypeError(`Invalid hostname '${e}'`);
	let t = new URL("https://example.com");
	return t.hostname = e, t.hostname;
}
a(j, "hostnameEncodeCallback");
function K(e) {
	if (e === "") return e;
	if (/[^0-9a-fA-F[\]:]/g.test(e)) throw new TypeError(`Invalid IPv6 hostname '${e}'`);
	return e.toLowerCase();
}
a(K, "ipv6HostnameEncodeCallback");
function G(e) {
	if (e === "" || /^[0-9]*$/.test(e) && parseInt(e) <= 65535) return e;
	throw new TypeError(`Invalid port '${e}'.`);
}
a(G, "portEncodeCallback");
function de$1(e) {
	if (e === "") return e;
	let t = new URL("https://example.com");
	return t.pathname = e[0] !== "/" ? "/-" + e : e, e[0] !== "/" ? t.pathname.substring(2, t.pathname.length) : t.pathname;
}
a(de$1, "standardURLPathnameEncodeCallback");
function pe$1(e) {
	return e === "" ? e : new URL(`data:${e}`).pathname;
}
a(pe$1, "pathURLPathnameEncodeCallback");
function ge$1(e) {
	if (e === "") return e;
	let t = new URL("https://example.com");
	return t.search = e, t.search.substring(1, t.search.length);
}
a(ge$1, "searchEncodeCallback");
function me$1(e) {
	if (e === "") return e;
	let t = new URL("https://example.com");
	return t.hash = e, t.hash.substring(1, t.hash.length);
}
a(me$1, "hashEncodeCallback");
var C$1 = class {
	#i;
	#n = [];
	#t = {};
	#e = 0;
	#s = 1;
	#l = 0;
	#o = 0;
	#d = 0;
	#p = 0;
	#g = !1;
	constructor(t) {
		this.#i = t;
	}
	get result() {
		return this.#t;
	}
	parse() {
		for (this.#n = D(this.#i, !0); this.#e < this.#n.length; this.#e += this.#s) {
			if (this.#s = 1, this.#n[this.#e].type === "END") {
				if (this.#o === 0) {
					this.#b(), this.#f() ? this.#r(9, 1) : this.#h() ? this.#r(8, 1) : this.#r(7, 0);
					continue;
				} else if (this.#o === 2) {
					this.#u(5);
					continue;
				}
				this.#r(10, 0);
				break;
			}
			if (this.#d > 0) if (this.#A()) this.#d -= 1;
			else continue;
			if (this.#T()) {
				this.#d += 1;
				continue;
			}
			switch (this.#o) {
				case 0:
					this.#P() && this.#u(1);
					break;
				case 1:
					if (this.#P()) {
						this.#C();
						let t = 7, r = 1;
						this.#E() ? (t = 2, r = 3) : this.#g && (t = 2), this.#r(t, r);
					}
					break;
				case 2:
					this.#S() ? this.#u(3) : (this.#x() || this.#h() || this.#f()) && this.#u(5);
					break;
				case 3:
					this.#O() ? this.#r(4, 1) : this.#S() && this.#r(5, 1);
					break;
				case 4:
					this.#S() && this.#r(5, 1);
					break;
				case 5:
					this.#y() ? this.#p += 1 : this.#w() && (this.#p -= 1), this.#k() && !this.#p ? this.#r(6, 1) : this.#x() ? this.#r(7, 0) : this.#h() ? this.#r(8, 1) : this.#f() && this.#r(9, 1);
					break;
				case 6:
					this.#x() ? this.#r(7, 0) : this.#h() ? this.#r(8, 1) : this.#f() && this.#r(9, 1);
					break;
				case 7:
					this.#h() ? this.#r(8, 1) : this.#f() && this.#r(9, 1);
					break;
				case 8:
					this.#f() && this.#r(9, 1);
					break;
				case 9: break;
				case 10: break;
			}
		}
		this.#t.hostname !== void 0 && this.#t.port === void 0 && (this.#t.port = "");
	}
	#r(t, r) {
		switch (this.#o) {
			case 0: break;
			case 1:
				this.#t.protocol = this.#c();
				break;
			case 2: break;
			case 3:
				this.#t.username = this.#c();
				break;
			case 4:
				this.#t.password = this.#c();
				break;
			case 5:
				this.#t.hostname = this.#c();
				break;
			case 6:
				this.#t.port = this.#c();
				break;
			case 7:
				this.#t.pathname = this.#c();
				break;
			case 8:
				this.#t.search = this.#c();
				break;
			case 9:
				this.#t.hash = this.#c();
				break;
			case 10: break;
		}
		this.#o !== 0 && t !== 10 && ([
			1,
			2,
			3,
			4
		].includes(this.#o) && [
			6,
			7,
			8,
			9
		].includes(t) && (this.#t.hostname ??= ""), [
			1,
			2,
			3,
			4,
			5,
			6
		].includes(this.#o) && [8, 9].includes(t) && (this.#t.pathname ??= this.#g ? "/" : ""), [
			1,
			2,
			3,
			4,
			5,
			6,
			7
		].includes(this.#o) && t === 9 && (this.#t.search ??= "")), this.#R(t, r);
	}
	#R(t, r) {
		this.#o = t, this.#l = this.#e + r, this.#e += r, this.#s = 0;
	}
	#b() {
		this.#e = this.#l, this.#s = 0;
	}
	#u(t) {
		this.#b(), this.#o = t;
	}
	#m(t) {
		return t < 0 && (t = this.#n.length - t), t < this.#n.length ? this.#n[t] : this.#n[this.#n.length - 1];
	}
	#a(t, r) {
		let n = this.#m(t);
		return n.value === r && (n.type === "CHAR" || n.type === "ESCAPED_CHAR" || n.type === "INVALID_CHAR");
	}
	#P() {
		return this.#a(this.#e, ":");
	}
	#E() {
		return this.#a(this.#e + 1, "/") && this.#a(this.#e + 2, "/");
	}
	#S() {
		return this.#a(this.#e, "@");
	}
	#O() {
		return this.#a(this.#e, ":");
	}
	#k() {
		return this.#a(this.#e, ":");
	}
	#x() {
		return this.#a(this.#e, "/");
	}
	#h() {
		if (this.#a(this.#e, "?")) return !0;
		if (this.#n[this.#e].value !== "?") return !1;
		let t = this.#m(this.#e - 1);
		return t.type !== "NAME" && t.type !== "REGEX" && t.type !== "CLOSE" && t.type !== "ASTERISK";
	}
	#f() {
		return this.#a(this.#e, "#");
	}
	#T() {
		return this.#n[this.#e].type == "OPEN";
	}
	#A() {
		return this.#n[this.#e].type == "CLOSE";
	}
	#y() {
		return this.#a(this.#e, "[");
	}
	#w() {
		return this.#a(this.#e, "]");
	}
	#c() {
		let t = this.#n[this.#e], r = this.#m(this.#l).index;
		return this.#i.substring(r, t.index);
	}
	#C() {
		let t = {};
		Object.assign(t, b), t.encodePart = w;
		let r = q$1(this.#c(), void 0, t);
		this.#g = U(r);
	}
};
a(C$1, "Parser");
var V = [
	"protocol",
	"username",
	"password",
	"hostname",
	"port",
	"pathname",
	"search",
	"hash"
];
var O = "*";
function Se$1(e, t) {
	if (typeof e != "string") throw new TypeError("parameter 1 is not of type 'string'.");
	let r = new URL(e, t);
	return {
		protocol: r.protocol.substring(0, r.protocol.length - 1),
		username: r.username,
		password: r.password,
		hostname: r.hostname,
		port: r.port,
		pathname: r.pathname,
		search: r.search !== "" ? r.search.substring(1, r.search.length) : void 0,
		hash: r.hash !== "" ? r.hash.substring(1, r.hash.length) : void 0
	};
}
a(Se$1, "extractValues");
function R(e, t) {
	return t ? I$1(e) : e;
}
a(R, "processBaseURLString");
function L$1(e, t, r) {
	let n;
	if (typeof t.baseURL == "string") try {
		n = new URL(t.baseURL), t.protocol === void 0 && (e.protocol = R(n.protocol.substring(0, n.protocol.length - 1), r)), !r && t.protocol === void 0 && t.hostname === void 0 && t.port === void 0 && t.username === void 0 && (e.username = R(n.username, r)), !r && t.protocol === void 0 && t.hostname === void 0 && t.port === void 0 && t.username === void 0 && t.password === void 0 && (e.password = R(n.password, r)), t.protocol === void 0 && t.hostname === void 0 && (e.hostname = R(n.hostname, r)), t.protocol === void 0 && t.hostname === void 0 && t.port === void 0 && (e.port = R(n.port, r)), t.protocol === void 0 && t.hostname === void 0 && t.port === void 0 && t.pathname === void 0 && (e.pathname = R(n.pathname, r)), t.protocol === void 0 && t.hostname === void 0 && t.port === void 0 && t.pathname === void 0 && t.search === void 0 && (e.search = R(n.search.substring(1, n.search.length), r)), t.protocol === void 0 && t.hostname === void 0 && t.port === void 0 && t.pathname === void 0 && t.search === void 0 && t.hash === void 0 && (e.hash = R(n.hash.substring(1, n.hash.length), r));
	} catch {
		throw new TypeError(`invalid baseURL '${t.baseURL}'.`);
	}
	if (typeof t.protocol == "string" && (e.protocol = fe$1(t.protocol, r)), typeof t.username == "string" && (e.username = oe$1(t.username, r)), typeof t.password == "string" && (e.password = ae(t.password, r)), typeof t.hostname == "string" && (e.hostname = ie(t.hostname, r)), typeof t.port == "string" && (e.port = le$1(t.port, e.protocol, r)), typeof t.pathname == "string") {
		if (e.pathname = t.pathname, n && !ee$1(e.pathname, r)) {
			let c = n.pathname.lastIndexOf("/");
			c >= 0 && (e.pathname = R(n.pathname.substring(0, c + 1), r) + e.pathname);
		}
		e.pathname = ce$1(e.pathname, e.protocol, r);
	}
	return typeof t.search == "string" && (e.search = se(t.search, r)), typeof t.hash == "string" && (e.hash = ne$1(t.hash, r)), e;
}
a(L$1, "applyInit");
function I$1(e) {
	return e.replace(/([+*?:{}()\\])/g, "\\$1");
}
a(I$1, "escapePatternString");
function Te$1(e) {
	return e.replace(/([.+*?^${}()[\]|/\\])/g, "\\$1");
}
a(Te$1, "escapeRegexpString");
function Ae$1(e, t) {
	t.delimiter ??= "/#?", t.prefixes ??= "./", t.sensitive ??= !1, t.strict ??= !1, t.end ??= !0, t.start ??= !0, t.endsWith = "";
	let r = ".*", n = `[^${Te$1(t.delimiter)}]+?`, c = /[$_\u200C\u200D\p{ID_Continue}]/u, l = "";
	for (let f = 0; f < e.length; ++f) {
		let s = e[f];
		if (s.type === 3) {
			if (s.modifier === 3) {
				l += I$1(s.value);
				continue;
			}
			l += `{${I$1(s.value)}}${T(s.modifier)}`;
			continue;
		}
		let i = s.hasCustomName(), o = !!s.suffix.length || !!s.prefix.length && (s.prefix.length !== 1 || !t.prefixes.includes(s.prefix)), h = f > 0 ? e[f - 1] : null, p = f < e.length - 1 ? e[f + 1] : null;
		if (!o && i && s.type === 1 && s.modifier === 3 && p && !p.prefix.length && !p.suffix.length) if (p.type === 3) {
			let A = p.value.length > 0 ? p.value[0] : "";
			o = c.test(A);
		} else o = !p.hasCustomName();
		if (!o && !s.prefix.length && h && h.type === 3) {
			let A = h.value[h.value.length - 1];
			o = t.prefixes.includes(A);
		}
		o && (l += "{"), l += I$1(s.prefix), i && (l += `:${s.name}`), s.type === 2 ? l += `(${s.value})` : s.type === 1 ? i || (l += `(${n})`) : s.type === 0 && (!i && (!h || h.type === 3 || h.modifier !== 3 || o || s.prefix !== "") ? l += "*" : l += `(${r})`), s.type === 1 && i && s.suffix.length && c.test(s.suffix[0]) && (l += "\\"), l += I$1(s.suffix), o && (l += "}"), s.modifier !== 3 && (l += T(s.modifier));
	}
	return l;
}
a(Ae$1, "partsToPattern");
var Y = class {
	#i;
	#n = {};
	#t = {};
	#e = {};
	#s = {};
	#l = !1;
	constructor(t = {}, r, n) {
		try {
			let c;
			if (typeof r == "string" ? c = r : n = r, typeof t == "string") {
				let i = new C$1(t);
				if (i.parse(), t = i.result, c === void 0 && typeof t.protocol != "string") throw new TypeError("A base URL must be provided for a relative constructor string.");
				t.baseURL = c;
			} else {
				if (!t || typeof t != "object") throw new TypeError("parameter 1 is not of type 'string' and cannot convert to dictionary.");
				if (c) throw new TypeError("parameter 1 is not of type 'string'.");
			}
			typeof n > "u" && (n = { ignoreCase: !1 });
			let l = { ignoreCase: n.ignoreCase === !0 }, f = {
				pathname: O,
				protocol: O,
				username: O,
				password: O,
				hostname: O,
				port: O,
				search: O,
				hash: O
			};
			this.#i = L$1(f, t, !0), z(this.#i.protocol) === this.#i.port && (this.#i.port = "");
			let s;
			for (s of V) {
				if (!(s in this.#i)) continue;
				let i = {}, o = this.#i[s];
				switch (this.#t[s] = [], s) {
					case "protocol":
						Object.assign(i, b), i.encodePart = w;
						break;
					case "username":
						Object.assign(i, b), i.encodePart = he$1;
						break;
					case "password":
						Object.assign(i, b), i.encodePart = ue$1;
						break;
					case "hostname":
						Object.assign(i, J$1), _(o) ? i.encodePart = K : i.encodePart = j;
						break;
					case "port":
						Object.assign(i, b), i.encodePart = G;
						break;
					case "pathname":
						U(this.#n.protocol) ? (Object.assign(i, Q$1, l), i.encodePart = de$1) : (Object.assign(i, b, l), i.encodePart = pe$1);
						break;
					case "search":
						Object.assign(i, b, l), i.encodePart = ge$1;
						break;
					case "hash":
						Object.assign(i, b, l), i.encodePart = me$1;
						break;
				}
				try {
					this.#s[s] = F(o, i), this.#n[s] = W$1(this.#s[s], this.#t[s], i), this.#e[s] = Ae$1(this.#s[s], i), this.#l = this.#l || this.#s[s].some((h) => h.type === 2);
				} catch {
					throw new TypeError(`invalid ${s} pattern '${this.#i[s]}'.`);
				}
			}
		} catch (c) {
			throw new TypeError(`Failed to construct 'URLPattern': ${c.message}`);
		}
	}
	get [Symbol.toStringTag]() {
		return "URLPattern";
	}
	test(t = {}, r) {
		let n = {
			pathname: "",
			protocol: "",
			username: "",
			password: "",
			hostname: "",
			port: "",
			search: "",
			hash: ""
		};
		if (typeof t != "string" && r) throw new TypeError("parameter 1 is not of type 'string'.");
		if (typeof t > "u") return !1;
		try {
			typeof t == "object" ? n = L$1(n, t, !1) : n = L$1(n, Se$1(t, r), !1);
		} catch {
			return !1;
		}
		let c;
		for (c of V) if (!this.#n[c].exec(n[c])) return !1;
		return !0;
	}
	exec(t = {}, r) {
		let n = {
			pathname: "",
			protocol: "",
			username: "",
			password: "",
			hostname: "",
			port: "",
			search: "",
			hash: ""
		};
		if (typeof t != "string" && r) throw new TypeError("parameter 1 is not of type 'string'.");
		if (typeof t > "u") return;
		try {
			typeof t == "object" ? n = L$1(n, t, !1) : n = L$1(n, Se$1(t, r), !1);
		} catch {
			return null;
		}
		let c = {};
		r ? c.inputs = [t, r] : c.inputs = [t];
		let l;
		for (l of V) {
			let f = this.#n[l].exec(n[l]);
			if (!f) return null;
			let s = {};
			for (let [i, o] of this.#t[l].entries()) if (typeof o == "string" || typeof o == "number") s[o] = f[i + 1];
			c[l] = {
				input: n[l] ?? "",
				groups: s
			};
		}
		return c;
	}
	static compareComponent(t, r, n) {
		let c = a((i, o) => {
			for (let h of [
				"type",
				"modifier",
				"prefix",
				"value",
				"suffix"
			]) {
				if (i[h] < o[h]) return -1;
				if (i[h] === o[h]) continue;
				return 1;
			}
			return 0;
		}, "comparePart"), l = new P(3, "", "", "", "", 3), f = new P(0, "", "", "", "", 3), s = a((i, o) => {
			let h = 0;
			for (; h < Math.min(i.length, o.length); ++h) {
				let p = c(i[h], o[h]);
				if (p) return p;
			}
			return i.length === o.length ? 0 : c(i[h] ?? l, o[h] ?? l);
		}, "comparePartList");
		return !r.#e[t] && !n.#e[t] ? 0 : r.#e[t] && !n.#e[t] ? s(r.#s[t], [f]) : !r.#e[t] && n.#e[t] ? s([f], n.#s[t]) : s(r.#s[t], n.#s[t]);
	}
	get protocol() {
		return this.#e.protocol;
	}
	get username() {
		return this.#e.username;
	}
	get password() {
		return this.#e.password;
	}
	get hostname() {
		return this.#e.hostname;
	}
	get port() {
		return this.#e.port;
	}
	get pathname() {
		return this.#e.pathname;
	}
	get search() {
		return this.#e.search;
	}
	get hash() {
		return this.#e.hash;
	}
	get hasRegExpGroups() {
		return this.#l;
	}
};
a(Y, "URLPattern");
//#endregion
//#region src/core/parsers/pagination-parser/pagination-utils/index.ts
function depaginatePathname(url, pathnamePaginationSelector = /\/(page\/)?\d+\/?$/) {
	const newUrl = new URL(url.toString());
	newUrl.pathname = newUrl.pathname.replace(pathnamePaginationSelector, "/");
	return newUrl;
}
function getPaginationLinks(doc = document, url = location.href, pathnamePaginationSelector = /\/(page\/)?\d+\/?$/) {
	const baseUrl = depaginatePathname(parseUrl(url), pathnamePaginationSelector);
	const pathnameStrict = doc instanceof Document;
	const host = doc.baseURI || baseUrl.origin;
	const urlPattern = new Y({
		pathname: pathnameStrict ? `${baseUrl.pathname}*` : "*",
		hostname: baseUrl.hostname
	});
	return [...doc.querySelectorAll("a[href]")].map((a) => a.href).filter((h) => URL.canParse(h)).filter((h) => {
		return urlPattern.test(new URL(h, host));
	});
}
/**
* Nonsens
* WTF IS THIS? JFC...
* @description
* curr: website.com, links: [webiste.com/new/23] => wegsite.com/new
*/
function upgradePathname(curr, links, pathnamePaginationSelector = /\/(page\/)?\d+\/?$/) {
	if (pathnamePaginationSelector.test(curr.pathname) || links.length < 1) return curr;
	const linksDepaginated = links.map((l) => depaginatePathname(l, pathnamePaginationSelector));
	if (linksDepaginated.some((l) => l.pathname === curr.pathname)) return curr;
	const last = linksDepaginated.at(-1);
	if (last.pathname !== curr.pathname) curr.pathname = last.pathname;
	return curr;
}
//#endregion
//#region src/core/parsers/pagination-parser/pagination-strategies/PaginationStrategyPathnameParams.ts
var PaginationStrategyPathnameParams = class PaginationStrategyPathnameParams extends PaginationStrategy {
	extractPage = (a) => {
		const href = typeof a === "string" ? a : a.href;
		const { pathname } = new URL(href, this.doc.baseURI || this.url.origin);
		return parseInt(pathname.match(this.pathnameSelector)?.filter(Boolean)?.pop() || this.offsetMin.toString());
	};
	static checkLink(link, pathnameSelector = PaginationStrategy._pathnameSelector) {
		return pathnameSelector.test(link.pathname);
	}
	static testLinks(links, options) {
		const result = links.some((h) => PaginationStrategyPathnameParams.checkLink(h, options.pathnameSelector));
		if (result) {
			const pathnamesMatched = links.filter((h) => PaginationStrategyPathnameParams.checkLink(h, options.pathnameSelector));
			options.url = upgradePathname(parseUrl(options.url), pathnamesMatched);
		}
		return result;
	}
	getPaginationLast() {
		const links = getPaginationLinks(this.getPaginationElement() || document, this.url.href, this.pathnameSelector);
		const pages = Array.from(links, this.extractPage);
		const lastPage = Math.max(...pages, this.offsetMin);
		if (this.overwritePaginationLast) return this.overwritePaginationLast(lastPage);
		return lastPage;
	}
	getPaginationOffset() {
		return this.extractPage(this.url.href);
	}
	getPaginationUrlGenerator(url_ = this.url) {
		const url = new URL(url_.href);
		const pathnameSelectorPlaceholder = this.pathnameSelector.toString().replace(/\\{1,}/g, "").replace(/[$?()]+/g, "").replace(/\/{1,}/g, "/");
		if (!this.pathnameSelector.test(url.pathname)) url.pathname = url.pathname.concat(pathnameSelectorPlaceholder.replace(/d\+/, this.offsetMin.toString())).replace(/\/{1,}/g, "/");
		const paginationUrlGenerator = (offset) => {
			url.pathname = url.pathname.replace(this.pathnameSelector, pathnameSelectorPlaceholder.replace(/d\+/, offset.toString()));
			return url.href;
		};
		return paginationUrlGenerator;
	}
};
//#endregion
//#region src/core/parsers/pagination-parser/pagination-strategies/PaginationStrategySearchParams.ts
var PaginationStrategySearchParams = class PaginationStrategySearchParams extends PaginationStrategy {
	extractPage = (a) => {
		const href = typeof a === "string" ? a : a.href;
		const p = new URL(href).searchParams.get(this.searchParamSelector);
		return parseInt(p) || this.offsetMin;
	};
	getPaginationLast() {
		const pages = getPaginationLinks(this.getPaginationElement() || document, this.url.href).filter((h) => PaginationStrategySearchParams.checkLink(new URL(h), this.searchParamSelector)).map(this.extractPage);
		const lastPage = Math.max(...pages, this.offsetMin);
		if (this.overwritePaginationLast) return this.overwritePaginationLast(lastPage);
		return lastPage;
	}
	getPaginationOffset() {
		if (this.doc === document) return this.extractPage(this.url);
		const link = this.getPaginationElement()?.querySelector(`a.active[href *= "${this.searchParamSelector}="]`);
		return this.extractPage(link);
	}
	getPaginationUrlGenerator() {
		const url = new URL(this.url.href);
		const paginationUrlGenerator = (offset) => {
			url.searchParams.set(this.searchParamSelector, offset.toString());
			return url.href;
		};
		return paginationUrlGenerator;
	}
	static checkLink(link, searchParamSelector) {
		const searchParamSelectors = ["page", "p"];
		if (searchParamSelector) searchParamSelectors.push(searchParamSelector);
		return searchParamSelectors.some((p) => link.searchParams.get(p) !== null);
	}
	static testLinks(links, searchParamSelector) {
		return links.some((h) => PaginationStrategySearchParams.checkLink(h, searchParamSelector));
	}
};
//#endregion
//#region src/core/parsers/pagination-parser/index.ts
function getPaginationStrategy(options) {
	const _paginationStrategy = new PaginationStrategy(options);
	const pagination = _paginationStrategy.getPaginationElement();
	Object.assign(options, { ..._paginationStrategy });
	const { url, searchParamSelector } = options;
	if (!pagination) return _paginationStrategy;
	if (typeof options.getPaginationUrlGenerator === "function") return new PaginationStrategy(options);
	const pageLinks = getPaginationLinks(pagination, url).map((l) => new URL(l));
	const selectStrategy = () => {
		if (PaginationStrategyDataParams.testLinks(pagination)) return PaginationStrategyDataParams;
		if (PaginationStrategySearchParams.testLinks(pageLinks, searchParamSelector)) return PaginationStrategySearchParams;
		if (PaginationStrategyPathnameParams.testLinks(pageLinks, options)) return PaginationStrategyPathnameParams;
		console.error("Found No Strategy");
		return PaginationStrategy;
	};
	return new (selectStrategy())(options);
}
//#endregion
//#region src/core/parsers/thumb-data-parser.ts
var ThumbDataParser = class ThumbDataParser {
	strategy;
	selectors;
	callback;
	getUrlSelector;
	autoParseText(thumb) {
		let title = sanitizeStr(thumb.innerText);
		const durationStr = title.match(/(\d+:\d+:?\d+?)|\d+m/)?.[0] || "";
		const duration = timeToSeconds(durationStr);
		title = title.replaceAll(durationStr, "");
		return {
			title,
			duration
		};
	}
	getUrl(thumb) {
		return querySelectorOrSelf(thumb, this.getUrlSelector).href;
	}
	preprocessCustomThumbDataSelectors() {
		if (!this.selectors) return;
		Object.entries(this.selectors).forEach(([key, value]) => {
			if (typeof value === "string") {
				const defaultSelector = this.defaultThumbDataSelectors.find((e) => e.name === key);
				if (!defaultSelector) this.thumbDataSelectors.push({
					name: key,
					selector: value,
					type: "string"
				});
				else {
					defaultSelector.selector = value;
					this.thumbDataSelectors.push(defaultSelector);
				}
			} else this.thumbDataSelectors.push({
				name: key,
				...value
			});
		});
	}
	thumbDataSelectors = [];
	defaultThumbDataSelectors = [
		{
			name: "title",
			type: "string",
			selector: "[class *= title],[title]"
		},
		{
			name: "uploader",
			type: "string",
			selector: "[class *= uploader], [class *= user], [class *= name]"
		},
		{
			name: "duration",
			type: "duration",
			selector: "[class *= duration]"
		}
	];
	getThumbDataWith(thumb, { type, selector }) {
		if (type === "boolean") return !!querySelectorOrSelf(thumb, selector);
		if (type === "string") return sanitizeStr(querySelectorLast(thumb, selector)?.innerText || "");
		if (type === "duration") return timeToSeconds(querySelectorText(thumb, selector));
		if (type === "float") return parseNumericAbbreviation(querySelectorText(thumb, selector));
		return Number.parseInt(querySelectorText(thumb, selector));
	}
	constructor(strategy = "manual", selectors = {}, callback, getUrlSelector = "a[href]") {
		this.strategy = strategy;
		this.selectors = selectors;
		this.callback = callback;
		this.getUrlSelector = getUrlSelector;
		this.preprocessCustomThumbDataSelectors();
	}
	static create(o = {}) {
		return new ThumbDataParser(o.strategy, o.selectors, o.callback, o.getUrlSelector);
	}
	getThumbData(thumb) {
		if (this.strategy === "auto-text") return this.autoParseText(thumb);
		if (this.strategy === "auto-select") this.thumbDataSelectors.push(...this.defaultThumbDataSelectors);
		const thumbData = Object.fromEntries(this.thumbDataSelectors.map((s) => [s.name, this.getThumbDataWith(thumb, s)]));
		this.callback?.(thumb, thumbData);
		return thumbData;
	}
};
//#endregion
//#region src/core/parsers/thumb-img-parser.ts
var ThumbImgParser = class ThumbImgParser {
	selector;
	remove;
	strategy = "default";
	static create(options = {}) {
		return Object.assign(new ThumbImgParser(), options);
	}
	removeAttrs(img) {
		if (!this.remove) return;
		if (this.remove === "auto") removeClassesAndDataAttributes(img, "lazy");
		else if (this.remove.startsWith(".")) img.classList.remove(this.remove.slice(1));
		else img.removeAttribute(this.remove);
	}
	getImgSrc(img) {
		const possibleAttrs = this.selector ? [this.selector].flat() : ["data-src", "src"];
		for (const attr of possibleAttrs) {
			const imgSrc = img.getAttribute(attr);
			if (imgSrc) return imgSrc;
		}
		return "";
	}
	getImgData(thumb) {
		if (this.strategy === "default" && !this.selector) return {};
		const img = thumb.querySelector("img");
		if (!img) return {};
		const imgSrc = typeof this.selector === "function" ? this.selector(img) : this.getImgSrc(img);
		this.removeAttrs(img);
		if (img.src.includes("data:image")) img.src = "";
		if (img.complete && img.naturalWidth > 0) return {};
		return {
			img,
			imgSrc
		};
	}
};
//#endregion
//#region src/core/parsers/thumbs-parser.ts
var ThumbsParser = class ThumbsParser {
	selector = ".thumb";
	strategy = "default";
	transform;
	static create(options = {}) {
		return Object.assign(new ThumbsParser(), options);
	}
	getThumbs(container) {
		if (!container) return [];
		if (this.strategy === "auto") {
			if (typeof this.selector !== "string") return [];
			return [...container?.children || []];
		}
		const thumbs = Array.from(container.querySelectorAll(this.selector));
		if (typeof this.transform === "function") thumbs.forEach(this.transform);
		return thumbs;
	}
};
//#endregion
//#region node_modules/jabroni-outfit/dist/jabroni-outfit.es.js
var _i = {};
// @__NO_SIDE_EFFECTS__
function oe(t) {
	const e = /* @__PURE__ */ Object.create(null);
	for (const n of t.split(",")) e[n] = 1;
	return (n) => n in e;
}
var B = _i.NODE_ENV !== "production" ? Object.freeze({}) : {};
var Te = _i.NODE_ENV !== "production" ? Object.freeze([]) : [];
var ot = () => {};
var vi = () => !1;
var dn = (t) => t.charCodeAt(0) === 111 && t.charCodeAt(1) === 110 && (t.charCodeAt(2) > 122 || t.charCodeAt(2) < 97);
var In = (t) => t.startsWith("onUpdate:");
var X = Object.assign;
var Jo = (t, e) => {
	const n = t.indexOf(e);
	n > -1 && t.splice(n, 1);
};
var Hs = Object.prototype.hasOwnProperty;
var I = (t, e) => Hs.call(t, e);
var C = Array.isArray;
var _e = (t) => fn(t) === "[object Map]";
var Zn = (t) => fn(t) === "[object Set]";
var Nr = (t) => fn(t) === "[object Date]";
var M = (t) => typeof t == "function";
var J = (t) => typeof t == "string";
var Jt = (t) => typeof t == "symbol";
var L = (t) => t !== null && typeof t == "object";
var Yo = (t) => (L(t) || M(t)) && M(t.then) && M(t.catch);
var xi = Object.prototype.toString;
var fn = (t) => xi.call(t);
var Xo = (t) => fn(t).slice(8, -1);
var Qn = (t) => fn(t) === "[object Object]";
var Zo = (t) => J(t) && t !== "NaN" && t[0] !== "-" && "" + parseInt(t, 10) === t;
var Qe = /* @__PURE__ */ oe(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted");
var Bs = /* @__PURE__ */ oe("bind,cloak,else-if,else,for,html,if,model,on,once,pre,show,slot,text,memo");
var to = (t) => {
	const e = /* @__PURE__ */ Object.create(null);
	return ((n) => e[n] || (e[n] = t(n)));
};
var Ks = /-\w/g;
var at = to((t) => t.replace(Ks, (e) => e.slice(1).toUpperCase()));
var Ws = /\B([A-Z])/g;
var kt = to((t) => t.replace(Ws, "-$1").toLowerCase());
var Ee = to((t) => t.charAt(0).toUpperCase() + t.slice(1));
var ge = to((t) => t ? `on${Ee(t)}` : "");
var pe = (t, e) => !Object.is(t, e);
var Ve = (t, ...e) => {
	for (let n = 0; n < t.length; n++) t[n](...e);
};
var Pn = (t, e, n, o = !1) => {
	Object.defineProperty(t, e, {
		configurable: !0,
		enumerable: !1,
		writable: o,
		value: n
	});
};
var Qo = (t) => {
	const e = parseFloat(t);
	return isNaN(e) ? t : e;
};
var Or = (t) => {
	const e = J(t) ? Number(t) : NaN;
	return isNaN(e) ? t : e;
};
var Sr;
var hn = () => Sr || (Sr = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function tr(t) {
	if (C(t)) {
		const e = {};
		for (let n = 0; n < t.length; n++) {
			const o = t[n], r = J(o) ? Ys(o) : tr(o);
			if (r) for (const i in r) e[i] = r[i];
		}
		return e;
	} else if (J(t) || L(t)) return t;
}
var qs = /;(?![^(]*\))/g;
var Gs = /:([^]+)/;
var Js = /\/\*[^]*?\*\//g;
function Ys(t) {
	const e = {};
	return t.replace(Js, "").split(qs).forEach((n) => {
		if (n) {
			const o = n.split(Gs);
			o.length > 1 && (e[o[0].trim()] = o[1].trim());
		}
	}), e;
}
function er(t) {
	let e = "";
	if (J(t)) e = t;
	else if (C(t)) for (let n = 0; n < t.length; n++) {
		const o = er(t[n]);
		o && (e += o + " ");
	}
	else if (L(t)) for (const n in t) t[n] && (e += n + " ");
	return e.trim();
}
var Xs = "html,body,base,head,link,meta,style,title,address,article,aside,footer,header,hgroup,h1,h2,h3,h4,h5,h6,nav,section,div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,ruby,s,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,embed,object,param,source,canvas,script,noscript,del,ins,caption,col,colgroup,table,thead,tbody,td,th,tr,button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,output,progress,select,textarea,details,dialog,menu,summary,template,blockquote,iframe,tfoot";
var Zs = "svg,animate,animateMotion,animateTransform,circle,clipPath,color-profile,defs,desc,discard,ellipse,feBlend,feColorMatrix,feComponentTransfer,feComposite,feConvolveMatrix,feDiffuseLighting,feDisplacementMap,feDistantLight,feDropShadow,feFlood,feFuncA,feFuncB,feFuncG,feFuncR,feGaussianBlur,feImage,feMerge,feMergeNode,feMorphology,feOffset,fePointLight,feSpecularLighting,feSpotLight,feTile,feTurbulence,filter,foreignObject,g,hatch,hatchpath,image,line,linearGradient,marker,mask,mesh,meshgradient,meshpatch,meshrow,metadata,mpath,path,pattern,polygon,polyline,radialGradient,rect,set,solidcolor,stop,switch,symbol,text,textPath,title,tspan,unknown,use,view";
var Qs = "annotation,annotation-xml,maction,maligngroup,malignmark,math,menclose,merror,mfenced,mfrac,mfraction,mglyph,mi,mlabeledtr,mlongdiv,mmultiscripts,mn,mo,mover,mpadded,mphantom,mprescripts,mroot,mrow,ms,mscarries,mscarry,msgroup,msline,mspace,msqrt,msrow,mstack,mstyle,msub,msubsup,msup,mtable,mtd,mtext,mtr,munder,munderover,none,semantics";
var ta = /* @__PURE__ */ oe(Xs);
var ea = /* @__PURE__ */ oe(Zs);
var na = /* @__PURE__ */ oe(Qs);
var ra = /* @__PURE__ */ oe("itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly");
function wi(t) {
	return !!t || t === "";
}
function ia(t, e) {
	if (t.length !== e.length) return !1;
	let n = !0;
	for (let o = 0; n && o < t.length; o++) n = eo(t[o], e[o]);
	return n;
}
function eo(t, e) {
	if (t === e) return !0;
	let n = Nr(t), o = Nr(e);
	if (n || o) return n && o ? t.getTime() === e.getTime() : !1;
	if (n = Jt(t), o = Jt(e), n || o) return t === e;
	if (n = C(t), o = C(e), n || o) return n && o ? ia(t, e) : !1;
	if (n = L(t), o = L(e), n || o) {
		if (!n || !o) return !1;
		if (Object.keys(t).length !== Object.keys(e).length) return !1;
		for (const s in t) {
			const a = t.hasOwnProperty(s), u = e.hasOwnProperty(s);
			if (a && !u || !a && u || !eo(t[s], e[s])) return !1;
		}
	}
	return String(t) === String(e);
}
function Ei(t, e) {
	return t.findIndex((n) => eo(n, e));
}
var ki = (t) => !!(t && t.__v_isRef === !0);
var Le = (t) => J(t) ? t : t == null ? "" : C(t) || L(t) && (t.toString === xi || !M(t.toString)) ? ki(t) ? Le(t.value) : JSON.stringify(t, Ni, 2) : String(t);
var Ni = (t, e) => ki(e) ? Ni(t, e.value) : _e(e) ? { [`Map(${e.size})`]: [...e.entries()].reduce((n, [o, r], i) => (n[bo(o, i) + " =>"] = r, n), {}) } : Zn(e) ? { [`Set(${e.size})`]: [...e.values()].map((n) => bo(n)) } : Jt(e) ? bo(e) : L(e) && !C(e) && !Qn(e) ? String(e) : e;
var bo = (t, e = "") => {
	var n;
	return Jt(t) ? `Symbol(${(n = t.description) != null ? n : e})` : t;
};
var q = {};
function $t(t, ...e) {
	console.warn(`[Vue warn] ${t}`, ...e);
}
var xt;
var sa = class {
	constructor(e = !1) {
		this.detached = e, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this.parent = xt, !e && xt && (this.index = (xt.scopes || (xt.scopes = [])).push(this) - 1);
	}
	get active() {
		return this._active;
	}
	pause() {
		if (this._active) {
			this._isPaused = !0;
			let e, n;
			if (this.scopes) for (e = 0, n = this.scopes.length; e < n; e++) this.scopes[e].pause();
			for (e = 0, n = this.effects.length; e < n; e++) this.effects[e].pause();
		}
	}
	/**
	* Resumes the effect scope, including all child scopes and effects.
	*/
	resume() {
		if (this._active && this._isPaused) {
			this._isPaused = !1;
			let e, n;
			if (this.scopes) for (e = 0, n = this.scopes.length; e < n; e++) this.scopes[e].resume();
			for (e = 0, n = this.effects.length; e < n; e++) this.effects[e].resume();
		}
	}
	run(e) {
		if (this._active) {
			const n = xt;
			try {
				return xt = this, e();
			} finally {
				xt = n;
			}
		} else q.NODE_ENV !== "production" && $t("cannot run an inactive effect scope.");
	}
	/**
	* This should only be called on non-detached scopes
	* @internal
	*/
	on() {
		++this._on === 1 && (this.prevScope = xt, xt = this);
	}
	/**
	* This should only be called on non-detached scopes
	* @internal
	*/
	off() {
		this._on > 0 && --this._on === 0 && (xt = this.prevScope, this.prevScope = void 0);
	}
	stop(e) {
		if (this._active) {
			this._active = !1;
			let n, o;
			for (n = 0, o = this.effects.length; n < o; n++) this.effects[n].stop();
			for (this.effects.length = 0, n = 0, o = this.cleanups.length; n < o; n++) this.cleanups[n]();
			if (this.cleanups.length = 0, this.scopes) {
				for (n = 0, o = this.scopes.length; n < o; n++) this.scopes[n].stop(!0);
				this.scopes.length = 0;
			}
			if (!this.detached && this.parent && !e) {
				const r = this.parent.scopes.pop();
				r && r !== this && (this.parent.scopes[this.index] = r, r.index = this.index);
			}
			this.parent = void 0;
		}
	}
};
function aa() {
	return xt;
}
var H;
var go = /* @__PURE__ */ new WeakSet();
var Oi = class {
	constructor(e) {
		this.fn = e, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, xt && xt.active && xt.effects.push(this);
	}
	pause() {
		this.flags |= 64;
	}
	resume() {
		this.flags & 64 && (this.flags &= -65, go.has(this) && (go.delete(this), this.trigger()));
	}
	/**
	* @internal
	*/
	notify() {
		this.flags & 2 && !(this.flags & 32) || this.flags & 8 || Ci(this);
	}
	run() {
		if (!(this.flags & 1)) return this.fn();
		this.flags |= 2, Cr(this), Di(this);
		const e = H, n = jt;
		H = this, jt = !0;
		try {
			return this.fn();
		} finally {
			q.NODE_ENV !== "production" && H !== this && $t("Active effect was not restored correctly - this is likely a Vue internal bug."), zi(this), H = e, jt = n, this.flags &= -3;
		}
	}
	stop() {
		if (this.flags & 1) {
			for (let e = this.deps; e; e = e.nextDep) rr(e);
			this.deps = this.depsTail = void 0, Cr(this), this.onStop && this.onStop(), this.flags &= -2;
		}
	}
	trigger() {
		this.flags & 64 ? go.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
	}
	/**
	* @internal
	*/
	runIfDirty() {
		Oo(this) && this.run();
	}
	get dirty() {
		return Oo(this);
	}
};
var Si = 0;
var tn;
var en;
function Ci(t, e = !1) {
	if (t.flags |= 8, e) {
		t.next = en, en = t;
		return;
	}
	t.next = tn, tn = t;
}
function nr() {
	Si++;
}
function or() {
	if (--Si > 0) return;
	if (en) {
		let e = en;
		for (en = void 0; e;) {
			const n = e.next;
			e.next = void 0, e.flags &= -9, e = n;
		}
	}
	let t;
	for (; tn;) {
		let e = tn;
		for (tn = void 0; e;) {
			const n = e.next;
			if (e.next = void 0, e.flags &= -9, e.flags & 1) try {
				e.trigger();
			} catch (o) {
				t || (t = o);
			}
			e = n;
		}
	}
	if (t) throw t;
}
function Di(t) {
	for (let e = t.deps; e; e = e.nextDep) e.version = -1, e.prevActiveLink = e.dep.activeLink, e.dep.activeLink = e;
}
function zi(t) {
	let e, n = t.depsTail, o = n;
	for (; o;) {
		const r = o.prevDep;
		o.version === -1 ? (o === n && (n = r), rr(o), ua(o)) : e = o, o.dep.activeLink = o.prevActiveLink, o.prevActiveLink = void 0, o = r;
	}
	t.deps = e, t.depsTail = n;
}
function Oo(t) {
	for (let e = t.deps; e; e = e.nextDep) if (e.dep.version !== e.version || e.dep.computed && (Vi(e.dep.computed) || e.dep.version !== e.version)) return !0;
	return !!t._dirty;
}
function Vi(t) {
	if (t.flags & 4 && !(t.flags & 16) || (t.flags &= -17, t.globalVersion === sn) || (t.globalVersion = sn, !t.isSSR && t.flags & 128 && (!t.deps && !t._dirty || !Oo(t)))) return;
	t.flags |= 2;
	const e = t.dep, n = H, o = jt;
	H = t, jt = !0;
	try {
		Di(t);
		const r = t.fn(t._value);
		(e.version === 0 || pe(r, t._value)) && (t.flags |= 128, t._value = r, e.version++);
	} catch (r) {
		throw e.version++, r;
	} finally {
		H = n, jt = o, zi(t), t.flags &= -3;
	}
}
function rr(t, e = !1) {
	const { dep: n, prevSub: o, nextSub: r } = t;
	if (o && (o.nextSub = r, t.prevSub = void 0), r && (r.prevSub = o, t.nextSub = void 0), q.NODE_ENV !== "production" && n.subsHead === t && (n.subsHead = r), n.subs === t && (n.subs = o, !o && n.computed)) {
		n.computed.flags &= -5;
		for (let i = n.computed.deps; i; i = i.nextDep) rr(i, !0);
	}
	!e && !--n.sc && n.map && n.map.delete(n.key);
}
function ua(t) {
	const { prevDep: e, nextDep: n } = t;
	e && (e.nextDep = n, t.prevDep = void 0), n && (n.prevDep = e, t.nextDep = void 0);
}
var jt = !0;
var Mi = [];
function At() {
	Mi.push(jt), jt = !1;
}
function It() {
	const t = Mi.pop();
	jt = t === void 0 ? !0 : t;
}
function Cr(t) {
	const { cleanup: e } = t;
	if (t.cleanup = void 0, e) {
		const n = H;
		H = void 0;
		try {
			e();
		} finally {
			H = n;
		}
	}
}
var sn = 0;
var la = class {
	constructor(e, n) {
		this.sub = e, this.dep = n, this.version = n.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
	}
};
var ir = class {
	constructor(e) {
		this.computed = e, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0, q.NODE_ENV !== "production" && (this.subsHead = void 0);
	}
	track(e) {
		if (!H || !jt || H === this.computed) return;
		let n = this.activeLink;
		if (n === void 0 || n.sub !== H) n = this.activeLink = new la(H, this), H.deps ? (n.prevDep = H.depsTail, H.depsTail.nextDep = n, H.depsTail = n) : H.deps = H.depsTail = n, Ti(n);
		else if (n.version === -1 && (n.version = this.version, n.nextDep)) {
			const o = n.nextDep;
			o.prevDep = n.prevDep, n.prevDep && (n.prevDep.nextDep = o), n.prevDep = H.depsTail, n.nextDep = void 0, H.depsTail.nextDep = n, H.depsTail = n, H.deps === n && (H.deps = o);
		}
		return q.NODE_ENV !== "production" && H.onTrack && H.onTrack(X({ effect: H }, e)), n;
	}
	trigger(e) {
		this.version++, sn++, this.notify(e);
	}
	notify(e) {
		nr();
		try {
			if (q.NODE_ENV !== "production") for (let n = this.subsHead; n; n = n.nextSub) n.sub.onTrigger && !(n.sub.flags & 8) && n.sub.onTrigger(X({ effect: n.sub }, e));
			for (let n = this.subs; n; n = n.prevSub) n.sub.notify() && n.sub.dep.notify();
		} finally {
			or();
		}
	}
};
function Ti(t) {
	if (t.dep.sc++, t.sub.flags & 4) {
		const e = t.dep.computed;
		if (e && !t.dep.subs) {
			e.flags |= 20;
			for (let o = e.deps; o; o = o.nextDep) Ti(o);
		}
		const n = t.dep.subs;
		n !== t && (t.prevSub = n, n && (n.nextSub = t)), q.NODE_ENV !== "production" && t.dep.subsHead === void 0 && (t.dep.subsHead = t), t.dep.subs = t;
	}
}
var So = /* @__PURE__ */ new WeakMap();
var ve = /* @__PURE__ */ Symbol(q.NODE_ENV !== "production" ? "Object iterate" : "");
var Co = /* @__PURE__ */ Symbol(q.NODE_ENV !== "production" ? "Map keys iterate" : "");
var an = /* @__PURE__ */ Symbol(q.NODE_ENV !== "production" ? "Array iterate" : "");
function nt(t, e, n) {
	if (jt && H) {
		let o = So.get(t);
		o || So.set(t, o = /* @__PURE__ */ new Map());
		let r = o.get(n);
		r || (o.set(n, r = new ir()), r.map = o, r.key = n), q.NODE_ENV !== "production" ? r.track({
			target: t,
			type: e,
			key: n
		}) : r.track();
	}
}
function Wt(t, e, n, o, r, i) {
	const s = So.get(t);
	if (!s) {
		sn++;
		return;
	}
	const a = (u) => {
		u && (q.NODE_ENV !== "production" ? u.trigger({
			target: t,
			type: e,
			key: n,
			newValue: o,
			oldValue: r,
			oldTarget: i
		}) : u.trigger());
	};
	if (nr(), e === "clear") s.forEach(a);
	else {
		const u = C(t), h = u && Zo(n);
		if (u && n === "length") {
			const d = Number(o);
			s.forEach((c, g) => {
				(g === "length" || g === an || !Jt(g) && g >= d) && a(c);
			});
		} else switch ((n !== void 0 || s.has(void 0)) && a(s.get(n)), h && a(s.get(an)), e) {
			case "add":
				u ? h && a(s.get("length")) : (a(s.get(ve)), _e(t) && a(s.get(Co)));
				break;
			case "delete":
				u || (a(s.get(ve)), _e(t) && a(s.get(Co)));
				break;
			case "set":
				_e(t) && a(s.get(ve));
				break;
		}
	}
	or();
}
function Se(t) {
	const e = $(t);
	return e === t ? e : (nt(e, "iterate", an), gt(t) ? e : e.map(Rt));
}
function no(t) {
	return nt(t = $(t), "iterate", an), t;
}
function ue(t, e) {
	return Pt(t) ? de(t) ? Pe(Rt(e)) : Pe(e) : Rt(e);
}
var ca = {
	__proto__: null,
	[Symbol.iterator]() {
		return mo(this, Symbol.iterator, (t) => ue(this, t));
	},
	concat(...t) {
		return Se(this).concat(...t.map((e) => C(e) ? Se(e) : e));
	},
	entries() {
		return mo(this, "entries", (t) => (t[1] = ue(this, t[1]), t));
	},
	every(t, e) {
		return Zt(this, "every", t, e, void 0, arguments);
	},
	filter(t, e) {
		return Zt(this, "filter", t, e, (n) => n.map((o) => ue(this, o)), arguments);
	},
	find(t, e) {
		return Zt(this, "find", t, e, (n) => ue(this, n), arguments);
	},
	findIndex(t, e) {
		return Zt(this, "findIndex", t, e, void 0, arguments);
	},
	findLast(t, e) {
		return Zt(this, "findLast", t, e, (n) => ue(this, n), arguments);
	},
	findLastIndex(t, e) {
		return Zt(this, "findLastIndex", t, e, void 0, arguments);
	},
	forEach(t, e) {
		return Zt(this, "forEach", t, e, void 0, arguments);
	},
	includes(...t) {
		return yo(this, "includes", t);
	},
	indexOf(...t) {
		return yo(this, "indexOf", t);
	},
	join(t) {
		return Se(this).join(t);
	},
	lastIndexOf(...t) {
		return yo(this, "lastIndexOf", t);
	},
	map(t, e) {
		return Zt(this, "map", t, e, void 0, arguments);
	},
	pop() {
		return Ge(this, "pop");
	},
	push(...t) {
		return Ge(this, "push", t);
	},
	reduce(t, ...e) {
		return Dr(this, "reduce", t, e);
	},
	reduceRight(t, ...e) {
		return Dr(this, "reduceRight", t, e);
	},
	shift() {
		return Ge(this, "shift");
	},
	some(t, e) {
		return Zt(this, "some", t, e, void 0, arguments);
	},
	splice(...t) {
		return Ge(this, "splice", t);
	},
	toReversed() {
		return Se(this).toReversed();
	},
	toSorted(t) {
		return Se(this).toSorted(t);
	},
	toSpliced(...t) {
		return Se(this).toSpliced(...t);
	},
	unshift(...t) {
		return Ge(this, "unshift", t);
	},
	values() {
		return mo(this, "values", (t) => ue(this, t));
	}
};
function mo(t, e, n) {
	const o = no(t), r = o[e]();
	return o !== t && !gt(t) && (r._next = r.next, r.next = () => {
		const i = r._next();
		return i.done || (i.value = n(i.value)), i;
	}), r;
}
var pa = Array.prototype;
function Zt(t, e, n, o, r, i) {
	const s = no(t), a = s !== t && !gt(t), u = s[e];
	if (u !== pa[e]) {
		const c = u.apply(t, i);
		return a ? Rt(c) : c;
	}
	let h = n;
	s !== t && (a ? h = function(c, g) {
		return n.call(this, ue(t, c), g, t);
	} : n.length > 2 && (h = function(c, g) {
		return n.call(this, c, g, t);
	}));
	const d = u.call(s, h, o);
	return a && r ? r(d) : d;
}
function Dr(t, e, n, o) {
	const r = no(t);
	let i = n;
	return r !== t && (gt(t) ? n.length > 3 && (i = function(s, a, u) {
		return n.call(this, s, a, u, t);
	}) : i = function(s, a, u) {
		return n.call(this, s, ue(t, a), u, t);
	}), r[e](i, ...o);
}
function yo(t, e, n) {
	const o = $(t);
	nt(o, "iterate", an);
	const r = o[e](...n);
	return (r === -1 || r === !1) && Rn(n[0]) ? (n[0] = $(n[0]), o[e](...n)) : r;
}
function Ge(t, e, n = []) {
	At(), nr();
	const o = $(t)[e].apply(t, n);
	return or(), It(), o;
}
var da = /* @__PURE__ */ oe("__proto__,__v_isRef,__isVue");
var ji = new Set(/* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((t) => t !== "arguments" && t !== "caller").map((t) => Symbol[t]).filter(Jt));
function fa(t) {
	Jt(t) || (t = String(t));
	const e = $(this);
	return nt(e, "has", t), e.hasOwnProperty(t);
}
var $i = class {
	constructor(e = !1, n = !1) {
		this._isReadonly = e, this._isShallow = n;
	}
	get(e, n, o) {
		if (n === "__v_skip") return e.__v_skip;
		const r = this._isReadonly, i = this._isShallow;
		if (n === "__v_isReactive") return !r;
		if (n === "__v_isReadonly") return r;
		if (n === "__v_isShallow") return i;
		if (n === "__v_raw") return o === (r ? i ? Li : Fi : i ? Ri : Pi).get(e) || Object.getPrototypeOf(e) === Object.getPrototypeOf(o) ? e : void 0;
		const s = C(e);
		if (!r) {
			let u;
			if (s && (u = ca[n])) return u;
			if (n === "hasOwnProperty") return fa;
		}
		const a = Reflect.get(e, n, et(e) ? e : o);
		if ((Jt(n) ? ji.has(n) : da(n)) || (r || nt(e, "get", n), i)) return a;
		if (et(a)) {
			const u = s && Zo(n) ? a : a.value;
			return r && L(u) ? zo(u) : u;
		}
		return L(a) ? r ? zo(a) : bn(a) : a;
	}
};
var Ai = class extends $i {
	constructor(e = !1) {
		super(!1, e);
	}
	set(e, n, o, r) {
		let i = e[n];
		const s = C(e) && Zo(n);
		if (!this._isShallow) {
			const h = Pt(i);
			if (!gt(o) && !Pt(o) && (i = $(i), o = $(o)), !s && et(i) && !et(o)) return h ? (q.NODE_ENV !== "production" && $t(`Set operation on key "${String(n)}" failed: target is readonly.`, e[n]), !0) : (i.value = o, !0);
		}
		const a = s ? Number(n) < e.length : I(e, n), u = Reflect.set(e, n, o, et(e) ? e : r);
		return e === $(r) && (a ? pe(o, i) && Wt(e, "set", n, o, i) : Wt(e, "add", n, o)), u;
	}
	deleteProperty(e, n) {
		const o = I(e, n), r = e[n], i = Reflect.deleteProperty(e, n);
		return i && o && Wt(e, "delete", n, void 0, r), i;
	}
	has(e, n) {
		const o = Reflect.has(e, n);
		return (!Jt(n) || !ji.has(n)) && nt(e, "has", n), o;
	}
	ownKeys(e) {
		return nt(e, "iterate", C(e) ? "length" : ve), Reflect.ownKeys(e);
	}
};
var Ii = class extends $i {
	constructor(e = !1) {
		super(!0, e);
	}
	set(e, n) {
		return q.NODE_ENV !== "production" && $t(`Set operation on key "${String(n)}" failed: target is readonly.`, e), !0;
	}
	deleteProperty(e, n) {
		return q.NODE_ENV !== "production" && $t(`Delete operation on key "${String(n)}" failed: target is readonly.`, e), !0;
	}
};
var ha = /* @__PURE__ */ new Ai();
var ba = /* @__PURE__ */ new Ii();
var ga = /* @__PURE__ */ new Ai(!0);
var ma = /* @__PURE__ */ new Ii(!0);
var Do = (t) => t;
var En = (t) => Reflect.getPrototypeOf(t);
function ya(t, e, n) {
	return function(...o) {
		const r = this.__v_raw, i = $(r), s = _e(i), a = t === "entries" || t === Symbol.iterator && s, u = t === "keys" && s, h = r[t](...o), d = n ? Do : e ? Pe : Rt;
		return !e && nt(i, "iterate", u ? Co : ve), {
			next() {
				const { value: c, done: g } = h.next();
				return g ? {
					value: c,
					done: g
				} : {
					value: a ? [d(c[0]), d(c[1])] : d(c),
					done: g
				};
			},
			[Symbol.iterator]() {
				return this;
			}
		};
	};
}
function kn(t) {
	return function(...e) {
		if (q.NODE_ENV !== "production") {
			const n = e[0] ? `on key "${e[0]}" ` : "";
			$t(`${Ee(t)} operation ${n}failed: target is readonly.`, $(this));
		}
		return t === "delete" ? !1 : t === "clear" ? void 0 : this;
	};
}
function _a(t, e) {
	const n = {
		get(r) {
			const i = this.__v_raw, s = $(i), a = $(r);
			t || (pe(r, a) && nt(s, "get", r), nt(s, "get", a));
			const { has: u } = En(s), h = e ? Do : t ? Pe : Rt;
			if (u.call(s, r)) return h(i.get(r));
			if (u.call(s, a)) return h(i.get(a));
			i !== s && i.get(r);
		},
		get size() {
			const r = this.__v_raw;
			return !t && nt($(r), "iterate", ve), r.size;
		},
		has(r) {
			const i = this.__v_raw, s = $(i), a = $(r);
			return t || (pe(r, a) && nt(s, "has", r), nt(s, "has", a)), r === a ? i.has(r) : i.has(r) || i.has(a);
		},
		forEach(r, i) {
			const s = this, a = s.__v_raw, u = $(a), h = e ? Do : t ? Pe : Rt;
			return !t && nt(u, "iterate", ve), a.forEach((d, c) => r.call(i, h(d), h(c), s));
		}
	};
	return X(n, t ? {
		add: kn("add"),
		set: kn("set"),
		delete: kn("delete"),
		clear: kn("clear")
	} : {
		add(r) {
			!e && !gt(r) && !Pt(r) && (r = $(r));
			const i = $(this);
			return En(i).has.call(i, r) || (i.add(r), Wt(i, "add", r, r)), this;
		},
		set(r, i) {
			!e && !gt(i) && !Pt(i) && (i = $(i));
			const s = $(this), { has: a, get: u } = En(s);
			let h = a.call(s, r);
			h ? q.NODE_ENV !== "production" && zr(s, a, r) : (r = $(r), h = a.call(s, r));
			const d = u.call(s, r);
			return s.set(r, i), h ? pe(i, d) && Wt(s, "set", r, i, d) : Wt(s, "add", r, i), this;
		},
		delete(r) {
			const i = $(this), { has: s, get: a } = En(i);
			let u = s.call(i, r);
			u ? q.NODE_ENV !== "production" && zr(i, s, r) : (r = $(r), u = s.call(i, r));
			const h = a ? a.call(i, r) : void 0, d = i.delete(r);
			return u && Wt(i, "delete", r, void 0, h), d;
		},
		clear() {
			const r = $(this), i = r.size !== 0, s = q.NODE_ENV !== "production" ? _e(r) ? new Map(r) : new Set(r) : void 0, a = r.clear();
			return i && Wt(r, "clear", void 0, void 0, s), a;
		}
	}), [
		"keys",
		"values",
		"entries",
		Symbol.iterator
	].forEach((r) => {
		n[r] = ya(r, t, e);
	}), n;
}
function oo(t, e) {
	const n = _a(t, e);
	return (o, r, i) => r === "__v_isReactive" ? !t : r === "__v_isReadonly" ? t : r === "__v_raw" ? o : Reflect.get(I(n, r) && r in o ? n : o, r, i);
}
var va = { get: /* @__PURE__ */ oo(!1, !1) };
var xa = { get: /* @__PURE__ */ oo(!1, !0) };
var wa = { get: /* @__PURE__ */ oo(!0, !1) };
var Ea = { get: /* @__PURE__ */ oo(!0, !0) };
function zr(t, e, n) {
	const o = $(n);
	if (o !== n && e.call(t, o)) {
		const r = Xo(t);
		$t(`Reactive ${r} contains both the raw and reactive versions of the same object${r === "Map" ? " as keys" : ""}, which can lead to inconsistencies. Avoid differentiating between the raw and reactive versions of an object and only use the reactive version if possible.`);
	}
}
var Pi = /* @__PURE__ */ new WeakMap();
var Ri = /* @__PURE__ */ new WeakMap();
var Fi = /* @__PURE__ */ new WeakMap();
var Li = /* @__PURE__ */ new WeakMap();
function ka(t) {
	switch (t) {
		case "Object":
		case "Array": return 1;
		case "Map":
		case "Set":
		case "WeakMap":
		case "WeakSet": return 2;
		default: return 0;
	}
}
function Na(t) {
	return t.__v_skip || !Object.isExtensible(t) ? 0 : ka(Xo(t));
}
function bn(t) {
	return Pt(t) ? t : ro(t, !1, ha, va, Pi);
}
function Oa(t) {
	return ro(t, !1, ga, xa, Ri);
}
function zo(t) {
	return ro(t, !0, ba, wa, Fi);
}
function Gt(t) {
	return ro(t, !0, ma, Ea, Li);
}
function ro(t, e, n, o, r) {
	if (!L(t)) return q.NODE_ENV !== "production" && $t(`value cannot be made ${e ? "readonly" : "reactive"}: ${String(t)}`), t;
	if (t.__v_raw && !(e && t.__v_isReactive)) return t;
	const i = Na(t);
	if (i === 0) return t;
	const s = r.get(t);
	if (s) return s;
	const a = new Proxy(t, i === 2 ? o : n);
	return r.set(t, a), a;
}
function de(t) {
	return Pt(t) ? de(t.__v_raw) : !!(t && t.__v_isReactive);
}
function Pt(t) {
	return !!(t && t.__v_isReadonly);
}
function gt(t) {
	return !!(t && t.__v_isShallow);
}
function Rn(t) {
	return t ? !!t.__v_raw : !1;
}
function $(t) {
	const e = t && t.__v_raw;
	return e ? $(e) : t;
}
function Sa(t) {
	return !I(t, "__v_skip") && Object.isExtensible(t) && Pn(t, "__v_skip", !0), t;
}
var Rt = (t) => L(t) ? bn(t) : t;
var Pe = (t) => L(t) ? zo(t) : t;
function et(t) {
	return t ? t.__v_isRef === !0 : !1;
}
function Ce(t) {
	return Ca(t, !1);
}
function Ca(t, e) {
	return et(t) ? t : new Da(t, e);
}
var Da = class {
	constructor(e, n) {
		this.dep = new ir(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = n ? e : $(e), this._value = n ? e : Rt(e), this.__v_isShallow = n;
	}
	get value() {
		return q.NODE_ENV !== "production" ? this.dep.track({
			target: this,
			type: "get",
			key: "value"
		}) : this.dep.track(), this._value;
	}
	set value(e) {
		const n = this._rawValue, o = this.__v_isShallow || gt(e) || Pt(e);
		e = o ? e : $(e), pe(e, n) && (this._rawValue = e, this._value = o ? e : Rt(e), q.NODE_ENV !== "production" ? this.dep.trigger({
			target: this,
			type: "set",
			key: "value",
			newValue: e,
			oldValue: n
		}) : this.dep.trigger());
	}
};
function Fn(t) {
	return et(t) ? t.value : t;
}
var za = {
	get: (t, e, n) => e === "__v_raw" ? t : Fn(Reflect.get(t, e, n)),
	set: (t, e, n, o) => {
		const r = t[e];
		return et(r) && !et(n) ? (r.value = n, !0) : Reflect.set(t, e, n, o);
	}
};
function Ui(t) {
	return de(t) ? t : new Proxy(t, za);
}
var Va = class {
	constructor(e, n, o) {
		this.fn = e, this.setter = n, this._value = void 0, this.dep = new ir(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = sn - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !n, this.isSSR = o;
	}
	/**
	* @internal
	*/
	notify() {
		if (this.flags |= 16, !(this.flags & 8) && H !== this) return Ci(this, !0), !0;
	}
	get value() {
		const e = q.NODE_ENV !== "production" ? this.dep.track({
			target: this,
			type: "get",
			key: "value"
		}) : this.dep.track();
		return Vi(this), e && (e.version = this.dep.version), this._value;
	}
	set value(e) {
		this.setter ? this.setter(e) : q.NODE_ENV !== "production" && $t("Write operation failed: computed value is readonly");
	}
};
function Ma(t, e, n = !1) {
	let o, r;
	return M(t) ? o = t : (o = t.get, r = t.set), new Va(o, r, n);
}
var Nn = {};
var Ln = /* @__PURE__ */ new WeakMap();
var me;
function Ta(t, e = !1, n = me) {
	if (n) {
		let o = Ln.get(n);
		o || Ln.set(n, o = []), o.push(t);
	} else q.NODE_ENV !== "production" && !e && $t("onWatcherCleanup() was called when there was no active watcher to associate with.");
}
function ja(t, e, n = B) {
	const { immediate: o, deep: r, once: i, scheduler: s, augmentJob: a, call: u } = n, h = (z) => {
		(n.onWarn || $t)("Invalid watch source: ", z, "A watch source can only be a getter/effect function, a ref, a reactive object, or an array of these types.");
	}, d = (z) => r ? z : gt(z) || r === !1 || r === 0 ? ee(z, 1) : ee(z);
	let c, g, x, T, S = !1, it = !1;
	if (et(t) ? (g = () => t.value, S = gt(t)) : de(t) ? (g = () => d(t), S = !0) : C(t) ? (it = !0, S = t.some((z) => de(z) || gt(z)), g = () => t.map((z) => {
		if (et(z)) return z.value;
		if (de(z)) return d(z);
		if (M(z)) return u ? u(z, 2) : z();
		q.NODE_ENV !== "production" && h(z);
	})) : M(t) ? e ? g = u ? () => u(t, 2) : t : g = () => {
		if (x) {
			At();
			try {
				x();
			} finally {
				It();
			}
		}
		const z = me;
		me = c;
		try {
			return u ? u(t, 3, [T]) : t(T);
		} finally {
			me = z;
		}
	} : (g = ot, q.NODE_ENV !== "production" && h(t)), e && r) {
		const z = g, st = r === !0 ? Infinity : r;
		g = () => ee(z(), st);
	}
	const Y = aa(), U = () => {
		c.stop(), Y && Y.active && Jo(Y.effects, c);
	};
	if (i && e) {
		const z = e;
		e = (...st) => {
			z(...st), U();
		};
	}
	let F = it ? new Array(t.length).fill(Nn) : Nn;
	const wt = (z) => {
		if (!(!(c.flags & 1) || !c.dirty && !z)) if (e) {
			const st = c.run();
			if (r || S || (it ? st.some((Dt, lt) => pe(Dt, F[lt])) : pe(st, F))) {
				x && x();
				const Dt = me;
				me = c;
				try {
					const lt = [
						st,
						F === Nn ? void 0 : it && F[0] === Nn ? [] : F,
						T
					];
					F = st, u ? u(e, 3, lt) : e(...lt);
				} finally {
					me = Dt;
				}
			}
		} else c.run();
	};
	return a && a(wt), c = new Oi(g), c.scheduler = s ? () => s(wt, !1) : wt, T = (z) => Ta(z, !1, c), x = c.onStop = () => {
		const z = Ln.get(c);
		if (z) {
			if (u) u(z, 4);
			else for (const st of z) st();
			Ln.delete(c);
		}
	}, q.NODE_ENV !== "production" && (c.onTrack = n.onTrack, c.onTrigger = n.onTrigger), e ? o ? wt(!0) : F = c.run() : s ? s(wt.bind(null, !0), !0) : c.run(), U.pause = c.pause.bind(c), U.resume = c.resume.bind(c), U.stop = U, U;
}
function ee(t, e = Infinity, n) {
	if (e <= 0 || !L(t) || t.__v_skip || (n = n || /* @__PURE__ */ new Map(), (n.get(t) || 0) >= e)) return t;
	if (n.set(t, e), e--, et(t)) ee(t.value, e, n);
	else if (C(t)) for (let o = 0; o < t.length; o++) ee(t[o], e, n);
	else if (Zn(t) || _e(t)) t.forEach((o) => {
		ee(o, e, n);
	});
	else if (Qn(t)) {
		for (const o in t) ee(t[o], e, n);
		for (const o of Object.getOwnPropertySymbols(t)) Object.prototype.propertyIsEnumerable.call(t, o) && ee(t[o], e, n);
	}
	return t;
}
var f = {};
var xe = [];
function Cn(t) {
	xe.push(t);
}
function Dn() {
	xe.pop();
}
var _o = !1;
function k(t, ...e) {
	if (_o) return;
	_o = !0, At();
	const n = xe.length ? xe[xe.length - 1].component : null, o = n && n.appContext.config.warnHandler, r = $a();
	if (o) Ue(o, n, 11, [
		t + e.map((i) => {
			var s, a;
			return (a = (s = i.toString) == null ? void 0 : s.call(i)) != null ? a : JSON.stringify(i);
		}).join(""),
		n && n.proxy,
		r.map(({ vnode: i }) => `at <${vn(n, i.type)}>`).join(`
`),
		r
	]);
	else {
		const i = [`[Vue warn]: ${t}`, ...e];
		r.length && i.push(`
`, ...Aa(r)), console.warn(...i);
	}
	It(), _o = !1;
}
function $a() {
	let t = xe[xe.length - 1];
	if (!t) return [];
	const e = [];
	for (; t;) {
		const n = e[0];
		n && n.vnode === t ? n.recurseCount++ : e.push({
			vnode: t,
			recurseCount: 0
		});
		const o = t.component && t.component.parent;
		t = o && o.vnode;
	}
	return e;
}
function Aa(t) {
	const e = [];
	return t.forEach((n, o) => {
		e.push(...o === 0 ? [] : [`
`], ...Ia(n));
	}), e;
}
function Ia({ vnode: t, recurseCount: e }) {
	const n = e > 0 ? `... (${e} recursive calls)` : "", o = t.component ? t.component.parent == null : !1, r = ` at <${vn(t.component, t.type, o)}`, i = ">" + n;
	return t.props ? [
		r,
		...Pa(t.props),
		i
	] : [r + i];
}
function Pa(t) {
	const e = [], n = Object.keys(t);
	return n.slice(0, 3).forEach((o) => {
		e.push(...Hi(o, t[o]));
	}), n.length > 3 && e.push(" ..."), e;
}
function Hi(t, e, n) {
	return J(e) ? (e = JSON.stringify(e), n ? e : [`${t}=${e}`]) : typeof e == "number" || typeof e == "boolean" || e == null ? n ? e : [`${t}=${e}`] : et(e) ? (e = Hi(t, $(e.value), !0), n ? e : [
		`${t}=Ref<`,
		e,
		">"
	]) : M(e) ? [`${t}=fn${e.name ? `<${e.name}>` : ""}`] : (e = $(e), n ? e : [`${t}=`, e]);
}
var sr = {
	sp: "serverPrefetch hook",
	bc: "beforeCreate hook",
	c: "created hook",
	bm: "beforeMount hook",
	m: "mounted hook",
	bu: "beforeUpdate hook",
	u: "updated",
	bum: "beforeUnmount hook",
	um: "unmounted hook",
	a: "activated hook",
	da: "deactivated hook",
	ec: "errorCaptured hook",
	rtc: "renderTracked hook",
	rtg: "renderTriggered hook",
	0: "setup function",
	1: "render function",
	2: "watcher getter",
	3: "watcher callback",
	4: "watcher cleanup function",
	5: "native event handler",
	6: "component event handler",
	7: "vnode hook",
	8: "directive hook",
	9: "transition hook",
	10: "app errorHandler",
	11: "app warnHandler",
	12: "ref function",
	13: "async component loader",
	14: "scheduler flush",
	15: "component update",
	16: "app unmount cleanup function"
};
function Ue(t, e, n, o) {
	try {
		return o ? t(...o) : t();
	} catch (r) {
		gn(r, e, n);
	}
}
function Yt(t, e, n, o) {
	if (M(t)) {
		const r = Ue(t, e, n, o);
		return r && Yo(r) && r.catch((i) => {
			gn(i, e, n);
		}), r;
	}
	if (C(t)) {
		const r = [];
		for (let i = 0; i < t.length; i++) r.push(Yt(t[i], e, n, o));
		return r;
	} else f.NODE_ENV !== "production" && k(`Invalid value type passed to callWithAsyncErrorHandling(): ${typeof t}`);
}
function gn(t, e, n, o = !0) {
	const r = e ? e.vnode : null, { errorHandler: i, throwUnhandledErrorInProduction: s } = e && e.appContext.config || B;
	if (e) {
		let a = e.parent;
		const u = e.proxy, h = f.NODE_ENV !== "production" ? sr[n] : `https://vuejs.org/error-reference/#runtime-${n}`;
		for (; a;) {
			const d = a.ec;
			if (d) {
				for (let c = 0; c < d.length; c++) if (d[c](t, u, h) === !1) return;
			}
			a = a.parent;
		}
		if (i) {
			At(), Ue(i, null, 10, [
				t,
				u,
				h
			]), It();
			return;
		}
	}
	Ra(t, n, r, o, s);
}
function Ra(t, e, n, o = !0, r = !1) {
	if (f.NODE_ENV !== "production") {
		const i = sr[e];
		if (n && Cn(n), k(`Unhandled error${i ? ` during execution of ${i}` : ""}`), n && Dn(), o) throw t;
		console.error(t);
	} else {
		if (r) throw t;
		console.error(t);
	}
}
var bt = [];
var Kt = -1;
var je = [];
var le = null;
var Me = 0;
var Bi = /* @__PURE__ */ Promise.resolve();
var Un = null;
var Fa = 100;
function Ki(t) {
	const e = Un || Bi;
	return t ? e.then(this ? t.bind(this) : t) : e;
}
function La(t) {
	let e = Kt + 1, n = bt.length;
	for (; e < n;) {
		const o = e + n >>> 1, r = bt[o], i = un(r);
		i < t || i === t && r.flags & 2 ? e = o + 1 : n = o;
	}
	return e;
}
function io(t) {
	if (!(t.flags & 1)) {
		const e = un(t), n = bt[bt.length - 1];
		!n || !(t.flags & 2) && e >= un(n) ? bt.push(t) : bt.splice(La(e), 0, t), t.flags |= 1, Wi();
	}
}
function Wi() {
	Un || (Un = Bi.then(Ji));
}
function qi(t) {
	C(t) ? je.push(...t) : le && t.id === -1 ? le.splice(Me + 1, 0, t) : t.flags & 1 || (je.push(t), t.flags |= 1), Wi();
}
function Vr(t, e, n = Kt + 1) {
	for (f.NODE_ENV !== "production" && (e = e || /* @__PURE__ */ new Map()); n < bt.length; n++) {
		const o = bt[n];
		if (o && o.flags & 2) {
			if (t && o.id !== t.uid || f.NODE_ENV !== "production" && ar(e, o)) continue;
			bt.splice(n, 1), n--, o.flags & 4 && (o.flags &= -2), o(), o.flags & 4 || (o.flags &= -2);
		}
	}
}
function Gi(t) {
	if (je.length) {
		const e = [...new Set(je)].sort((n, o) => un(n) - un(o));
		if (je.length = 0, le) {
			le.push(...e);
			return;
		}
		for (le = e, f.NODE_ENV !== "production" && (t = t || /* @__PURE__ */ new Map()), Me = 0; Me < le.length; Me++) {
			const n = le[Me];
			f.NODE_ENV !== "production" && ar(t, n) || (n.flags & 4 && (n.flags &= -2), n.flags & 8 || n(), n.flags &= -2);
		}
		le = null, Me = 0;
	}
}
var un = (t) => t.id == null ? t.flags & 2 ? -1 : Infinity : t.id;
function Ji(t) {
	f.NODE_ENV !== "production" && (t = t || /* @__PURE__ */ new Map());
	const e = f.NODE_ENV !== "production" ? (n) => ar(t, n) : ot;
	try {
		for (Kt = 0; Kt < bt.length; Kt++) {
			const n = bt[Kt];
			if (n && !(n.flags & 8)) {
				if (f.NODE_ENV !== "production" && e(n)) continue;
				n.flags & 4 && (n.flags &= -2), Ue(n, n.i, n.i ? 15 : 14), n.flags & 4 || (n.flags &= -2);
			}
		}
	} finally {
		for (; Kt < bt.length; Kt++) {
			const n = bt[Kt];
			n && (n.flags &= -2);
		}
		Kt = -1, bt.length = 0, Gi(t), Un = null, (bt.length || je.length) && Ji(t);
	}
}
function ar(t, e) {
	const n = t.get(e) || 0;
	if (n > Fa) {
		const o = e.i, r = o && mr(o.type);
		return gn(`Maximum recursive updates exceeded${r ? ` in component <${r}>` : ""}. This means you have a reactive effect that is mutating its own dependencies and thus recursively triggering itself. Possible sources include component template, render function, updated hook or watcher source function.`, null, 10), !0;
	}
	return t.set(e, n + 1), !1;
}
var Tt = !1;
var zn = /* @__PURE__ */ new Map();
f.NODE_ENV !== "production" && (hn().__VUE_HMR_RUNTIME__ = {
	createRecord: vo(Yi),
	rerender: vo(Ba),
	reload: vo(Ka)
});
var ke = /* @__PURE__ */ new Map();
function Ua(t) {
	const e = t.type.__hmrId;
	let n = ke.get(e);
	n || (Yi(e, t.type), n = ke.get(e)), n.instances.add(t);
}
function Ha(t) {
	ke.get(t.type.__hmrId).instances.delete(t);
}
function Yi(t, e) {
	return ke.has(t) ? !1 : (ke.set(t, {
		initialDef: Hn(e),
		instances: /* @__PURE__ */ new Set()
	}), !0);
}
function Hn(t) {
	return Ts(t) ? t.__vccOpts : t;
}
function Ba(t, e) {
	const n = ke.get(t);
	n && (n.initialDef.render = e, [...n.instances].forEach((o) => {
		e && (o.render = e, Hn(o.type).render = e), o.renderCache = [], Tt = !0, o.job.flags & 8 || o.update(), Tt = !1;
	}));
}
function Ka(t, e) {
	const n = ke.get(t);
	if (!n) return;
	e = Hn(e), Mr(n.initialDef, e);
	const o = [...n.instances];
	for (let r = 0; r < o.length; r++) {
		const i = o[r], s = Hn(i.type);
		let a = zn.get(s);
		a || (s !== n.initialDef && Mr(s, e), zn.set(s, a = /* @__PURE__ */ new Set())), a.add(i), i.appContext.propsCache.delete(i.type), i.appContext.emitsCache.delete(i.type), i.appContext.optionsCache.delete(i.type), i.ceReload ? (a.add(i), i.ceReload(e.styles), a.delete(i)) : i.parent ? io(() => {
			i.job.flags & 8 || (Tt = !0, i.parent.update(), Tt = !1, a.delete(i));
		}) : i.appContext.reload ? i.appContext.reload() : typeof window < "u" ? window.location.reload() : console.warn("[HMR] Root or manually mounted instance modified. Full reload required."), i.root.ce && i !== i.root && i.root.ce._removeChildStyle(s);
	}
	qi(() => {
		zn.clear();
	});
}
function Mr(t, e) {
	X(t, e);
	for (const n in t) n !== "__file" && !(n in e) && delete t[n];
}
function vo(t) {
	return (e, n) => {
		try {
			return t(e, n);
		} catch (o) {
			console.error(o), console.warn("[HMR] Something went wrong during Vue component hot-reload. Full reload required.");
		}
	};
}
var qt;
var Xe = [];
var Vo = !1;
function mn(t, ...e) {
	qt ? qt.emit(t, ...e) : Vo || Xe.push({
		event: t,
		args: e
	});
}
function Xi(t, e) {
	var n, o;
	qt = t, qt ? (qt.enabled = !0, Xe.forEach(({ event: r, args: i }) => qt.emit(r, ...i)), Xe = []) : typeof window < "u" && window.HTMLElement && !((o = (n = window.navigator) == null ? void 0 : n.userAgent) != null && o.includes("jsdom")) ? ((e.__VUE_DEVTOOLS_HOOK_REPLAY__ = e.__VUE_DEVTOOLS_HOOK_REPLAY__ || []).push((i) => {
		Xi(i, e);
	}), setTimeout(() => {
		qt || (e.__VUE_DEVTOOLS_HOOK_REPLAY__ = null, Vo = !0, Xe = []);
	}, 3e3)) : (Vo = !0, Xe = []);
}
function Wa(t, e) {
	mn("app:init", t, e, {
		Fragment: pt,
		Text: yn,
		Comment: Ot,
		Static: Tn
	});
}
function qa(t) {
	mn("app:unmount", t);
}
var Ga = /* @__PURE__ */ ur("component:added");
var Zi = /* @__PURE__ */ ur("component:updated");
var Ja = /* @__PURE__ */ ur("component:removed");
var Ya = (t) => {
	qt && typeof qt.cleanupBuffer == "function" && !qt.cleanupBuffer(t) && Ja(t);
};
// @__NO_SIDE_EFFECTS__
function ur(t) {
	return (e) => {
		mn(t, e.appContext.app, e.uid, e.parent ? e.parent.uid : void 0, e);
	};
}
var Xa = /* @__PURE__ */ Qi("perf:start");
var Za = /* @__PURE__ */ Qi("perf:end");
function Qi(t) {
	return (e, n, o) => {
		mn(t, e.appContext.app, e.uid, e, n, o);
	};
}
function Qa(t, e, n) {
	mn("component:emit", t.appContext.app, t, e, n);
}
var dt = null;
var ts = null;
function Bn(t) {
	const e = dt;
	return dt = t, ts = t && t.type.__scopeId || null, e;
}
function tu(t, e = dt, n) {
	if (!e || t._n) return t;
	const o = (...r) => {
		o._d && Jn(-1);
		const i = Bn(e);
		let s;
		try {
			s = t(...r);
		} finally {
			Bn(i), o._d && Jn(1);
		}
		return f.NODE_ENV !== "production" && Zi(e), s;
	};
	return o._n = !0, o._c = !0, o._d = !0, o;
}
function es(t) {
	Bs(t) && k("Do not use built-in directive ids as custom directive id: " + t);
}
function Re(t, e) {
	if (dt === null) return f.NODE_ENV !== "production" && k("withDirectives can only be used inside render functions."), t;
	const n = uo(dt), o = t.dirs || (t.dirs = []);
	for (let r = 0; r < e.length; r++) {
		let [i, s, a, u = B] = e[r];
		i && (M(i) && (i = {
			mounted: i,
			updated: i
		}), i.deep && ee(s), o.push({
			dir: i,
			instance: n,
			value: s,
			oldValue: void 0,
			arg: a,
			modifiers: u
		}));
	}
	return t;
}
function he(t, e, n, o) {
	const r = t.dirs, i = e && e.dirs;
	for (let s = 0; s < r.length; s++) {
		const a = r[s];
		i && (a.oldValue = i[s].value);
		let u = a.dir[o];
		u && (At(), Yt(u, n, 8, [
			t.el,
			a,
			t,
			e
		]), It());
	}
}
function eu(t, e) {
	if (f.NODE_ENV !== "production" && (!tt || tt.isMounted) && k("provide() can only be used inside setup()."), tt) {
		let n = tt.provides;
		const o = tt.parent && tt.parent.provides;
		o === n && (n = tt.provides = Object.create(o)), n[t] = e;
	}
}
function Vn(t, e, n = !1) {
	const o = zs();
	if (o || Ae) {
		let r = Ae ? Ae._context.provides : o ? o.parent == null || o.ce ? o.vnode.appContext && o.vnode.appContext.provides : o.parent.provides : void 0;
		if (r && t in r) return r[t];
		if (arguments.length > 1) return n && M(e) ? e.call(o && o.proxy) : e;
		f.NODE_ENV !== "production" && k(`injection "${String(t)}" not found.`);
	} else f.NODE_ENV !== "production" && k("inject() can only be used inside setup() or functional components.");
}
var nu = /* @__PURE__ */ Symbol.for("v-scx");
var ou = () => {
	{
		const t = Vn(nu);
		return t || f.NODE_ENV !== "production" && k("Server rendering context not provided. Make sure to only call useSSRContext() conditionally in the server build."), t;
	}
};
function $e(t, e, n) {
	return f.NODE_ENV !== "production" && !M(e) && k("`watch(fn, options?)` signature has been moved to a separate API. Use `watchEffect(fn, options?)` instead. `watch` now only supports `watch(source, cb, options?) signature."), ns(t, e, n);
}
function ns(t, e, n = B) {
	const { immediate: o, deep: r, flush: i, once: s } = n;
	f.NODE_ENV !== "production" && !e && (o !== void 0 && k("watch() \"immediate\" option is only respected when using the watch(source, callback, options?) signature."), r !== void 0 && k("watch() \"deep\" option is only respected when using the watch(source, callback, options?) signature."), s !== void 0 && k("watch() \"once\" option is only respected when using the watch(source, callback, options?) signature."));
	const a = X({}, n);
	f.NODE_ENV !== "production" && (a.onWarn = k);
	const u = e && o || !e && i !== "post";
	let h;
	if (cn) {
		if (i === "sync") {
			const x = ou();
			h = x.__watcherHandles || (x.__watcherHandles = []);
		} else if (!u) {
			const x = () => {};
			return x.stop = ot, x.resume = ot, x.pause = ot, x;
		}
	}
	const d = tt;
	a.call = (x, T, S) => Yt(x, d, T, S);
	let c = !1;
	i === "post" ? a.scheduler = (x) => {
		Et(x, d && d.suspense);
	} : i !== "sync" && (c = !0, a.scheduler = (x, T) => {
		T ? x() : io(x);
	}), a.augmentJob = (x) => {
		e && (x.flags |= 4), c && (x.flags |= 2, d && (x.id = d.uid, x.i = d));
	};
	const g = ja(t, e, a);
	return cn && (h ? h.push(g) : u && g()), g;
}
function ru(t, e, n) {
	const o = this.proxy, r = J(t) ? t.includes(".") ? os(o, t) : () => o[t] : t.bind(o, o);
	let i;
	M(e) ? i = e : (i = e.handler, n = e);
	const s = _n(this), a = ns(r, i.bind(o), n);
	return s(), a;
}
function os(t, e) {
	const n = e.split(".");
	return () => {
		let o = t;
		for (let r = 0; r < n.length && o; r++) o = o[n[r]];
		return o;
	};
}
var iu = /* @__PURE__ */ Symbol("_vte");
var su = (t) => t.__isTeleport;
var au = /* @__PURE__ */ Symbol("_leaveCb");
function lr(t, e) {
	t.shapeFlag & 6 && t.component ? (t.transition = e, lr(t.component.subTree, e)) : t.shapeFlag & 128 ? (t.ssContent.transition = e.clone(t.ssContent), t.ssFallback.transition = e.clone(t.ssFallback)) : t.transition = e;
}
// @__NO_SIDE_EFFECTS__
function Ct(t, e) {
	return M(t) ? X({ name: t.name }, e, { setup: t }) : t;
}
function rs(t) {
	t.ids = [
		t.ids[0] + t.ids[2]++ + "-",
		0,
		0
	];
}
var Tr = /* @__PURE__ */ new WeakSet();
var Kn = /* @__PURE__ */ new WeakMap();
function nn(t, e, n, o, r = !1) {
	if (C(t)) {
		t.forEach((S, it) => nn(S, e && (C(e) ? e[it] : e), n, o, r));
		return;
	}
	if (on(o) && !r) {
		o.shapeFlag & 512 && o.type.__asyncResolved && o.component.subTree.component && nn(t, e, n, o.component.subTree);
		return;
	}
	const i = o.shapeFlag & 4 ? uo(o.component) : o.el, s = r ? null : i, { i: a, r: u } = t;
	if (f.NODE_ENV !== "production" && !a) {
		k("Missing ref owner context. ref cannot be used on hoisted vnodes. A vnode with ref must be created inside the render function.");
		return;
	}
	const h = e && e.r, d = a.refs === B ? a.refs = {} : a.refs, c = a.setupState, g = $(c), x = c === B ? vi : (S) => f.NODE_ENV !== "production" && (I(g, S) && !et(g[S]) && k(`Template ref "${S}" used on a non-ref value. It will not work in the production build.`), Tr.has(g[S])) ? !1 : I(g, S), T = (S) => f.NODE_ENV === "production" || !Tr.has(S);
	if (h != null && h !== u) {
		if (jr(e), J(h)) d[h] = null, x(h) && (c[h] = null);
		else if (et(h)) {
			T(h) && (h.value = null);
			const S = e;
			S.k && (d[S.k] = null);
		}
	}
	if (M(u)) Ue(u, a, 12, [s, d]);
	else {
		const S = J(u), it = et(u);
		if (S || it) {
			const Y = () => {
				if (t.f) {
					const U = S ? x(u) ? c[u] : d[u] : T(u) || !t.k ? u.value : d[t.k];
					if (r) C(U) && Jo(U, i);
					else if (C(U)) U.includes(i) || U.push(i);
					else if (S) d[u] = [i], x(u) && (c[u] = d[u]);
					else {
						const F = [i];
						T(u) && (u.value = F), t.k && (d[t.k] = F);
					}
				} else S ? (d[u] = s, x(u) && (c[u] = s)) : it ? (T(u) && (u.value = s), t.k && (d[t.k] = s)) : f.NODE_ENV !== "production" && k("Invalid template ref type:", u, `(${typeof u})`);
			};
			if (s) {
				const U = () => {
					Y(), Kn.delete(t);
				};
				U.id = -1, Kn.set(t, U), Et(U, n);
			} else jr(t), Y();
		} else f.NODE_ENV !== "production" && k("Invalid template ref type:", u, `(${typeof u})`);
	}
}
function jr(t) {
	const e = Kn.get(t);
	e && (e.flags |= 8, Kn.delete(t));
}
hn().requestIdleCallback;
hn().cancelIdleCallback;
var on = (t) => !!t.type.__asyncLoader;
var cr = (t) => t.type.__isKeepAlive;
function uu(t, e) {
	is(t, "a", e);
}
function lu(t, e) {
	is(t, "da", e);
}
function is(t, e, n = tt) {
	const o = t.__wdc || (t.__wdc = () => {
		let r = n;
		for (; r;) {
			if (r.isDeactivated) return;
			r = r.parent;
		}
		return t();
	});
	if (so(e, o, n), n) {
		let r = n.parent;
		for (; r && r.parent;) cr(r.parent.vnode) && cu(o, e, n, r), r = r.parent;
	}
}
function cu(t, e, n, o) {
	const r = so(e, t, o, !0);
	ss(() => {
		Jo(o[e], r);
	}, n);
}
function so(t, e, n = tt, o = !1) {
	if (n) {
		const r = n[t] || (n[t] = []), i = e.__weh || (e.__weh = (...s) => {
			At();
			const a = _n(n), u = Yt(e, n, t, s);
			return a(), It(), u;
		});
		return o ? r.unshift(i) : r.push(i), i;
	} else if (f.NODE_ENV !== "production") k(`${ge(sr[t].replace(/ hook$/, ""))} is called when there is no active component instance to be associated with. Lifecycle injection APIs can only be used during execution of setup(). If you are using async setup(), make sure to register lifecycle hooks before the first await statement.`);
}
var re = (t) => (e, n = tt) => {
	(!cn || t === "sp") && so(t, (...o) => e(...o), n);
};
var pu = re("bm");
var du = re("m");
var fu = re("bu");
var hu = re("u");
var bu = re("bum");
var ss = re("um");
var gu = re("sp");
var mu = re("rtg");
var yu = re("rtc");
function _u(t, e = tt) {
	so("ec", t, e);
}
var vu = "components";
var as = /* @__PURE__ */ Symbol.for("v-ndc");
function us(t) {
	return J(t) ? xu(vu, t, !1) || t : t || as;
}
function xu(t, e, n = !0, o = !1) {
	const r = dt || tt;
	if (r) {
		const i = r.type;
		{
			const a = mr(i, !1);
			if (a && (a === e || a === at(e) || a === Ee(at(e)))) return i;
		}
		const s = $r(r[t] || i[t], e) || $r(r.appContext[t], e);
		return !s && o ? i : (f.NODE_ENV !== "production" && n && !s && k(`Failed to resolve ${t.slice(0, -1)}: ${e}
If this is a native custom element, make sure to exclude it from component resolution via compilerOptions.isCustomElement.`), s);
	} else f.NODE_ENV !== "production" && k(`resolve${Ee(t.slice(0, -1))} can only be used in render() or setup().`);
}
function $r(t, e) {
	return t && (t[e] || t[at(e)] || t[Ee(at(e))]);
}
function pr(t, e, n, o) {
	let r;
	const i = n, s = C(t);
	if (s || J(t)) {
		const a = s && de(t);
		let u = !1, h = !1;
		a && (u = !gt(t), h = Pt(t), t = no(t)), r = new Array(t.length);
		for (let d = 0, c = t.length; d < c; d++) r[d] = e(u ? h ? Pe(Rt(t[d])) : Rt(t[d]) : t[d], d, void 0, i);
	} else if (typeof t == "number") {
		f.NODE_ENV !== "production" && !Number.isInteger(t) && k(`The v-for range expect an integer value but got ${t}.`), r = new Array(t);
		for (let a = 0; a < t; a++) r[a] = e(a + 1, a, void 0, i);
	} else if (L(t)) if (t[Symbol.iterator]) r = Array.from(t, (a, u) => e(a, u, void 0, i));
	else {
		const a = Object.keys(t);
		r = new Array(a.length);
		for (let u = 0, h = a.length; u < h; u++) {
			const d = a[u];
			r[u] = e(t[d], d, u, i);
		}
	}
	else r = [];
	return r;
}
var Mo = (t) => t ? Vs(t) ? uo(t) : Mo(t.parent) : null;
var we = /* @__PURE__ */ X(/* @__PURE__ */ Object.create(null), {
	$: (t) => t,
	$el: (t) => t.vnode.el,
	$data: (t) => t.data,
	$props: (t) => f.NODE_ENV !== "production" ? Gt(t.props) : t.props,
	$attrs: (t) => f.NODE_ENV !== "production" ? Gt(t.attrs) : t.attrs,
	$slots: (t) => f.NODE_ENV !== "production" ? Gt(t.slots) : t.slots,
	$refs: (t) => f.NODE_ENV !== "production" ? Gt(t.refs) : t.refs,
	$parent: (t) => Mo(t.parent),
	$root: (t) => Mo(t.root),
	$host: (t) => t.ce,
	$emit: (t) => t.emit,
	$options: (t) => ps(t),
	$forceUpdate: (t) => t.f || (t.f = () => {
		io(t.update);
	}),
	$nextTick: (t) => t.n || (t.n = Ki.bind(t.proxy)),
	$watch: (t) => ru.bind(t)
});
var dr = (t) => t === "_" || t === "$";
var xo = (t, e) => t !== B && !t.__isScriptSetup && I(t, e);
var ls = {
	get({ _: t }, e) {
		if (e === "__v_skip") return !0;
		const { ctx: n, setupState: o, data: r, props: i, accessCache: s, type: a, appContext: u } = t;
		if (f.NODE_ENV !== "production" && e === "__isVue") return !0;
		if (e[0] !== "$") {
			const g = s[e];
			if (g !== void 0) switch (g) {
				case 1: return o[e];
				case 2: return r[e];
				case 4: return n[e];
				case 3: return i[e];
			}
			else {
				if (xo(o, e)) return s[e] = 1, o[e];
				if (r !== B && I(r, e)) return s[e] = 2, r[e];
				if (I(i, e)) return s[e] = 3, i[e];
				if (n !== B && I(n, e)) return s[e] = 4, n[e];
				To && (s[e] = 0);
			}
		}
		const h = we[e];
		let d, c;
		if (h) return e === "$attrs" ? (nt(t.attrs, "get", ""), f.NODE_ENV !== "production" && qn()) : f.NODE_ENV !== "production" && e === "$slots" && nt(t, "get", e), h(t);
		if ((d = a.__cssModules) && (d = d[e])) return d;
		if (n !== B && I(n, e)) return s[e] = 4, n[e];
		if (c = u.config.globalProperties, I(c, e)) return c[e];
		f.NODE_ENV !== "production" && dt && (!J(e) || e.indexOf("__v") !== 0) && (r !== B && dr(e[0]) && I(r, e) ? k(`Property ${JSON.stringify(e)} must be accessed via $data because it starts with a reserved character ("$" or "_") and is not proxied on the render context.`) : t === dt && k(`Property ${JSON.stringify(e)} was accessed during render but is not defined on instance.`));
	},
	set({ _: t }, e, n) {
		const { data: o, setupState: r, ctx: i } = t;
		return xo(r, e) ? (r[e] = n, !0) : f.NODE_ENV !== "production" && r.__isScriptSetup && I(r, e) ? (k(`Cannot mutate <script setup> binding "${e}" from Options API.`), !1) : o !== B && I(o, e) ? (o[e] = n, !0) : I(t.props, e) ? (f.NODE_ENV !== "production" && k(`Attempting to mutate prop "${e}". Props are readonly.`), !1) : e[0] === "$" && e.slice(1) in t ? (f.NODE_ENV !== "production" && k(`Attempting to mutate public property "${e}". Properties starting with $ are reserved and readonly.`), !1) : (f.NODE_ENV !== "production" && e in t.appContext.config.globalProperties ? Object.defineProperty(i, e, {
			enumerable: !0,
			configurable: !0,
			value: n
		}) : i[e] = n, !0);
	},
	has({ _: { data: t, setupState: e, accessCache: n, ctx: o, appContext: r, props: i, type: s } }, a) {
		let u;
		return !!(n[a] || t !== B && a[0] !== "$" && I(t, a) || xo(e, a) || I(i, a) || I(o, a) || I(we, a) || I(r.config.globalProperties, a) || (u = s.__cssModules) && u[a]);
	},
	defineProperty(t, e, n) {
		return n.get != null ? t._.accessCache[e] = 0 : I(n, "value") && this.set(t, e, n.value, null), Reflect.defineProperty(t, e, n);
	}
};
f.NODE_ENV !== "production" && (ls.ownKeys = (t) => (k("Avoid app logic that relies on enumerating keys on a component instance. The keys will be empty in production mode to avoid performance overhead."), Reflect.ownKeys(t)));
function wu(t) {
	const e = {};
	return Object.defineProperty(e, "_", {
		configurable: !0,
		enumerable: !1,
		get: () => t
	}), Object.keys(we).forEach((n) => {
		Object.defineProperty(e, n, {
			configurable: !0,
			enumerable: !1,
			get: () => we[n](t),
			set: ot
		});
	}), e;
}
function Eu(t) {
	const { ctx: e, propsOptions: [n] } = t;
	n && Object.keys(n).forEach((o) => {
		Object.defineProperty(e, o, {
			enumerable: !0,
			configurable: !0,
			get: () => t.props[o],
			set: ot
		});
	});
}
function ku(t) {
	const { ctx: e, setupState: n } = t;
	Object.keys($(n)).forEach((o) => {
		if (!n.__isScriptSetup) {
			if (dr(o[0])) {
				k(`setup() return property ${JSON.stringify(o)} should not start with "$" or "_" which are reserved prefixes for Vue internals.`);
				return;
			}
			Object.defineProperty(e, o, {
				enumerable: !0,
				configurable: !0,
				get: () => n[o],
				set: ot
			});
		}
	});
}
function Ar(t) {
	return C(t) ? t.reduce((e, n) => (e[n] = null, e), {}) : t;
}
function Nu() {
	const t = /* @__PURE__ */ Object.create(null);
	return (e, n) => {
		t[n] ? k(`${e} property "${n}" is already defined in ${t[n]}.`) : t[n] = e;
	};
}
var To = !0;
function Ou(t) {
	const e = ps(t), n = t.proxy, o = t.ctx;
	To = !1, e.beforeCreate && Ir(e.beforeCreate, t, "bc");
	const { data: r, computed: i, methods: s, watch: a, provide: u, inject: h, created: d, beforeMount: c, mounted: g, beforeUpdate: x, updated: T, activated: S, deactivated: it, beforeDestroy: Y, beforeUnmount: U, destroyed: F, unmounted: wt, render: z, renderTracked: st, renderTriggered: Dt, errorCaptured: lt, serverPrefetch: mt, expose: Xt, inheritAttrs: ie, components: Vt, directives: xn, filters: vr } = e, se = f.NODE_ENV !== "production" ? Nu() : null;
	if (f.NODE_ENV !== "production") {
		const [P] = t.propsOptions;
		if (P) for (const A in P) se("Props", A);
	}
	if (h && Su(h, o, se), s) for (const P in s) {
		const A = s[P];
		M(A) ? (f.NODE_ENV !== "production" ? Object.defineProperty(o, P, {
			value: A.bind(n),
			configurable: !0,
			enumerable: !0,
			writable: !0
		}) : o[P] = A.bind(n), f.NODE_ENV !== "production" && se("Methods", P)) : f.NODE_ENV !== "production" && k(`Method "${P}" has type "${typeof A}" in the component definition. Did you reference the function correctly?`);
	}
	if (r) {
		f.NODE_ENV !== "production" && !M(r) && k("The data option must be a function. Plain object usage is no longer supported.");
		const P = r.call(n, n);
		if (f.NODE_ENV !== "production" && Yo(P) && k("data() returned a Promise - note data() cannot be async; If you intend to perform data fetching before component renders, use async setup() + <Suspense>."), !L(P)) f.NODE_ENV !== "production" && k("data() should return an object.");
		else if (t.data = bn(P), f.NODE_ENV !== "production") for (const A in P) se("Data", A), dr(A[0]) || Object.defineProperty(o, A, {
			configurable: !0,
			enumerable: !0,
			get: () => P[A],
			set: ot
		});
	}
	if (To = !0, i) for (const P in i) {
		const A = i[P], Ft = M(A) ? A.bind(n, n) : M(A.get) ? A.get.bind(n, n) : ot;
		f.NODE_ENV !== "production" && Ft === ot && k(`Computed property "${P}" has no getter.`);
		const Be = St({
			get: Ft,
			set: !M(A) && M(A.set) ? A.set.bind(n) : f.NODE_ENV !== "production" ? () => {
				k(`Write operation failed: computed property "${P}" is readonly.`);
			} : ot
		});
		Object.defineProperty(o, P, {
			enumerable: !0,
			configurable: !0,
			get: () => Be.value,
			set: (Oe) => Be.value = Oe
		}), f.NODE_ENV !== "production" && se("Computed", P);
	}
	if (a) for (const P in a) cs(a[P], o, n, P);
	if (u) {
		const P = M(u) ? u.call(n) : u;
		Reflect.ownKeys(P).forEach((A) => {
			eu(A, P[A]);
		});
	}
	d && Ir(d, t, "c");
	function yt(P, A) {
		C(A) ? A.forEach((Ft) => P(Ft.bind(n))) : A && P(A.bind(n));
	}
	if (yt(pu, c), yt(du, g), yt(fu, x), yt(hu, T), yt(uu, S), yt(lu, it), yt(_u, lt), yt(yu, st), yt(mu, Dt), yt(bu, U), yt(ss, wt), yt(gu, mt), C(Xt)) if (Xt.length) {
		const P = t.exposed || (t.exposed = {});
		Xt.forEach((A) => {
			Object.defineProperty(P, A, {
				get: () => n[A],
				set: (Ft) => n[A] = Ft,
				enumerable: !0
			});
		});
	} else t.exposed || (t.exposed = {});
	z && t.render === ot && (t.render = z), ie != null && (t.inheritAttrs = ie), Vt && (t.components = Vt), xn && (t.directives = xn), mt && rs(t);
}
function Su(t, e, n = ot) {
	C(t) && (t = jo(t));
	for (const o in t) {
		const r = t[o];
		let i;
		L(r) ? "default" in r ? i = Vn(r.from || o, r.default, !0) : i = Vn(r.from || o) : i = Vn(r), et(i) ? Object.defineProperty(e, o, {
			enumerable: !0,
			configurable: !0,
			get: () => i.value,
			set: (s) => i.value = s
		}) : e[o] = i, f.NODE_ENV !== "production" && n("Inject", o);
	}
}
function Ir(t, e, n) {
	Yt(C(t) ? t.map((o) => o.bind(e.proxy)) : t.bind(e.proxy), e, n);
}
function cs(t, e, n, o) {
	let r = o.includes(".") ? os(n, o) : () => n[o];
	if (J(t)) {
		const i = e[t];
		M(i) ? $e(r, i) : f.NODE_ENV !== "production" && k(`Invalid watch handler specified by key "${t}"`, i);
	} else if (M(t)) $e(r, t.bind(n));
	else if (L(t)) if (C(t)) t.forEach((i) => cs(i, e, n, o));
	else {
		const i = M(t.handler) ? t.handler.bind(n) : e[t.handler];
		M(i) ? $e(r, i, t) : f.NODE_ENV !== "production" && k(`Invalid watch handler specified by key "${t.handler}"`, i);
	}
	else f.NODE_ENV !== "production" && k(`Invalid watch option: "${o}"`, t);
}
function ps(t) {
	const e = t.type, { mixins: n, extends: o } = e, { mixins: r, optionsCache: i, config: { optionMergeStrategies: s } } = t.appContext, a = i.get(e);
	let u;
	return a ? u = a : !r.length && !n && !o ? u = e : (u = {}, r.length && r.forEach((h) => Wn(u, h, s, !0)), Wn(u, e, s)), L(e) && i.set(e, u), u;
}
function Wn(t, e, n, o = !1) {
	const { mixins: r, extends: i } = e;
	i && Wn(t, i, n, !0), r && r.forEach((s) => Wn(t, s, n, !0));
	for (const s in e) if (o && s === "expose") f.NODE_ENV !== "production" && k("\"expose\" option is ignored when declared in mixins or extends. It should only be declared in the base component itself.");
	else {
		const a = Cu[s] || n && n[s];
		t[s] = a ? a(t[s], e[s]) : e[s];
	}
	return t;
}
var Cu = {
	data: Pr,
	props: Rr,
	emits: Rr,
	methods: Ze,
	computed: Ze,
	beforeCreate: ht,
	created: ht,
	beforeMount: ht,
	mounted: ht,
	beforeUpdate: ht,
	updated: ht,
	beforeDestroy: ht,
	beforeUnmount: ht,
	destroyed: ht,
	unmounted: ht,
	activated: ht,
	deactivated: ht,
	errorCaptured: ht,
	serverPrefetch: ht,
	components: Ze,
	directives: Ze,
	watch: zu,
	provide: Pr,
	inject: Du
};
function Pr(t, e) {
	return e ? t ? function() {
		return X(M(t) ? t.call(this, this) : t, M(e) ? e.call(this, this) : e);
	} : e : t;
}
function Du(t, e) {
	return Ze(jo(t), jo(e));
}
function jo(t) {
	if (C(t)) {
		const e = {};
		for (let n = 0; n < t.length; n++) e[t[n]] = t[n];
		return e;
	}
	return t;
}
function ht(t, e) {
	return t ? [...new Set([].concat(t, e))] : e;
}
function Ze(t, e) {
	return t ? X(/* @__PURE__ */ Object.create(null), t, e) : e;
}
function Rr(t, e) {
	return t ? C(t) && C(e) ? [.../* @__PURE__ */ new Set([...t, ...e])] : X(/* @__PURE__ */ Object.create(null), Ar(t), Ar(e ?? {})) : e;
}
function zu(t, e) {
	if (!t) return e;
	if (!e) return t;
	const n = X(/* @__PURE__ */ Object.create(null), t);
	for (const o in e) n[o] = ht(t[o], e[o]);
	return n;
}
function ds() {
	return {
		app: null,
		config: {
			isNativeTag: vi,
			performance: !1,
			globalProperties: {},
			optionMergeStrategies: {},
			errorHandler: void 0,
			warnHandler: void 0,
			compilerOptions: {}
		},
		mixins: [],
		components: {},
		directives: {},
		provides: /* @__PURE__ */ Object.create(null),
		optionsCache: /* @__PURE__ */ new WeakMap(),
		propsCache: /* @__PURE__ */ new WeakMap(),
		emitsCache: /* @__PURE__ */ new WeakMap()
	};
}
var Vu = 0;
function Mu(t, e) {
	return function(o, r = null) {
		M(o) || (o = X({}, o)), r != null && !L(r) && (f.NODE_ENV !== "production" && k("root props passed to app.mount() must be an object."), r = null);
		const i = ds(), s = /* @__PURE__ */ new WeakSet(), a = [];
		let u = !1;
		const h = i.app = {
			_uid: Vu++,
			_component: o,
			_props: r,
			_container: null,
			_context: i,
			_instance: null,
			version: Yr,
			get config() {
				return i.config;
			},
			set config(d) {
				f.NODE_ENV !== "production" && k("app.config cannot be replaced. Modify individual options instead.");
			},
			use(d, ...c) {
				return s.has(d) ? f.NODE_ENV !== "production" && k("Plugin has already been applied to target app.") : d && M(d.install) ? (s.add(d), d.install(h, ...c)) : M(d) ? (s.add(d), d(h, ...c)) : f.NODE_ENV !== "production" && k("A plugin must either be a function or an object with an \"install\" function."), h;
			},
			mixin(d) {
				return i.mixins.includes(d) ? f.NODE_ENV !== "production" && k("Mixin has already been applied to target app" + (d.name ? `: ${d.name}` : "")) : i.mixins.push(d), h;
			},
			component(d, c) {
				return f.NODE_ENV !== "production" && Ro(d, i.config), c ? (f.NODE_ENV !== "production" && i.components[d] && k(`Component "${d}" has already been registered in target app.`), i.components[d] = c, h) : i.components[d];
			},
			directive(d, c) {
				return f.NODE_ENV !== "production" && es(d), c ? (f.NODE_ENV !== "production" && i.directives[d] && k(`Directive "${d}" has already been registered in target app.`), i.directives[d] = c, h) : i.directives[d];
			},
			mount(d, c, g) {
				if (u) f.NODE_ENV !== "production" && k("App has already been mounted.\nIf you want to remount the same app, move your app creation logic into a factory function and create fresh app instances for each mount - e.g. `const createMyApp = () => createApp(App)`");
				else {
					f.NODE_ENV !== "production" && d.__vue_app__ && k("There is already an app instance mounted on the host container.\n If you want to mount another app on the same host container, you need to unmount the previous app by calling `app.unmount()` first.");
					const x = h._ceVNode || rt(o, r);
					return x.appContext = i, g === !0 ? g = "svg" : g === !1 && (g = void 0), f.NODE_ENV !== "production" && (i.reload = () => {
						const T = fe(x);
						T.el = null, t(T, d, g);
					}), t(x, d, g), u = !0, h._container = d, d.__vue_app__ = h, f.NODE_ENV !== "production" && (h._instance = x.component, Wa(h, Yr)), uo(x.component);
				}
			},
			onUnmount(d) {
				f.NODE_ENV !== "production" && typeof d != "function" && k(`Expected function as first argument to app.onUnmount(), but got ${typeof d}`), a.push(d);
			},
			unmount() {
				u ? (Yt(a, h._instance, 16), t(null, h._container), f.NODE_ENV !== "production" && (h._instance = null, qa(h)), delete h._container.__vue_app__) : f.NODE_ENV !== "production" && k("Cannot unmount an app that is not mounted.");
			},
			provide(d, c) {
				return f.NODE_ENV !== "production" && d in i.provides && (I(i.provides, d) ? k(`App already provides property with key "${String(d)}". It will be overwritten with the new value.`) : k(`App already provides property with key "${String(d)}" inherited from its parent element. It will be overwritten with the new value.`)), i.provides[d] = c, h;
			},
			runWithContext(d) {
				const c = Ae;
				Ae = h;
				try {
					return d();
				} finally {
					Ae = c;
				}
			}
		};
		return h;
	};
}
var Ae = null;
var Tu = (t, e) => e === "modelValue" || e === "model-value" ? t.modelModifiers : t[`${e}Modifiers`] || t[`${at(e)}Modifiers`] || t[`${kt(e)}Modifiers`];
function ju(t, e, ...n) {
	if (t.isUnmounted) return;
	const o = t.vnode.props || B;
	if (f.NODE_ENV !== "production") {
		const { emitsOptions: d, propsOptions: [c] } = t;
		if (d) if (!(e in d)) (!c || !(ge(at(e)) in c)) && k(`Component emitted event "${e}" but it is neither declared in the emits option nor as an "${ge(at(e))}" prop.`);
		else {
			const g = d[e];
			M(g) && (g(...n) || k(`Invalid event arguments: event validation failed for event "${e}".`));
		}
	}
	let r = n;
	const i = e.startsWith("update:"), s = i && Tu(o, e.slice(7));
	if (s && (s.trim && (r = n.map((d) => J(d) ? d.trim() : d)), s.number && (r = n.map(Qo))), f.NODE_ENV !== "production" && Qa(t, e, r), f.NODE_ENV !== "production") {
		const d = e.toLowerCase();
		d !== e && o[ge(d)] && k(`Event "${d}" is emitted in component ${vn(t, t.type)} but the handler is registered for "${e}". Note that HTML attributes are case-insensitive and you cannot use v-on to listen to camelCase events when using in-DOM templates. You should probably use "${kt(e)}" instead of "${e}".`);
	}
	let a, u = o[a = ge(e)] || o[a = ge(at(e))];
	!u && i && (u = o[a = ge(kt(e))]), u && Yt(u, t, 6, r);
	const h = o[a + "Once"];
	if (h) {
		if (!t.emitted) t.emitted = {};
		else if (t.emitted[a]) return;
		t.emitted[a] = !0, Yt(h, t, 6, r);
	}
}
var $u = /* @__PURE__ */ new WeakMap();
function fs(t, e, n = !1) {
	const o = n ? $u : e.emitsCache, r = o.get(t);
	if (r !== void 0) return r;
	const i = t.emits;
	let s = {}, a = !1;
	if (!M(t)) {
		const u = (h) => {
			const d = fs(h, e, !0);
			d && (a = !0, X(s, d));
		};
		!n && e.mixins.length && e.mixins.forEach(u), t.extends && u(t.extends), t.mixins && t.mixins.forEach(u);
	}
	return !i && !a ? (L(t) && o.set(t, null), null) : (C(i) ? i.forEach((u) => s[u] = null) : X(s, i), L(t) && o.set(t, s), s);
}
function ao(t, e) {
	return !t || !dn(e) ? !1 : (e = e.slice(2).replace(/Once$/, ""), I(t, e[0].toLowerCase() + e.slice(1)) || I(t, kt(e)) || I(t, e));
}
var $o = !1;
function qn() {
	$o = !0;
}
function Fr(t) {
	const { type: e, vnode: n, proxy: o, withProxy: r, propsOptions: [i], slots: s, attrs: a, emit: u, render: h, renderCache: d, props: c, data: g, setupState: x, ctx: T, inheritAttrs: S } = t, it = Bn(t);
	let Y, U;
	f.NODE_ENV !== "production" && ($o = !1);
	try {
		if (n.shapeFlag & 4) {
			const z = r || o, st = f.NODE_ENV !== "production" && x.__isScriptSetup ? new Proxy(z, { get(Dt, lt, mt) {
				return k(`Property '${String(lt)}' was accessed via 'this'. Avoid using 'this' in templates.`), Reflect.get(Dt, lt, mt);
			} }) : z;
			Y = Mt(h.call(st, z, d, f.NODE_ENV !== "production" ? Gt(c) : c, x, g, T)), U = a;
		} else {
			const z = e;
			f.NODE_ENV !== "production" && a === c && qn(), Y = Mt(z.length > 1 ? z(f.NODE_ENV !== "production" ? Gt(c) : c, f.NODE_ENV !== "production" ? {
				get attrs() {
					return qn(), Gt(a);
				},
				slots: s,
				emit: u
			} : {
				attrs: a,
				slots: s,
				emit: u
			}) : z(f.NODE_ENV !== "production" ? Gt(c) : c, null)), U = e.props ? a : Au(a);
		}
	} catch (z) {
		rn.length = 0, gn(z, t, 1), Y = rt(Ot);
	}
	let F = Y, wt;
	if (f.NODE_ENV !== "production" && Y.patchFlag > 0 && Y.patchFlag & 2048 && ([F, wt] = hs(Y)), U && S !== !1) {
		const z = Object.keys(U), { shapeFlag: st } = F;
		if (z.length) {
			if (st & 7) i && z.some(In) && (U = Iu(U, i)), F = fe(F, U, !1, !0);
			else if (f.NODE_ENV !== "production" && !$o && F.type !== Ot) {
				const Dt = Object.keys(a), lt = [], mt = [];
				for (let Xt = 0, ie = Dt.length; Xt < ie; Xt++) {
					const Vt = Dt[Xt];
					dn(Vt) ? In(Vt) || lt.push(Vt[2].toLowerCase() + Vt.slice(3)) : mt.push(Vt);
				}
				mt.length && k(`Extraneous non-props attributes (${mt.join(", ")}) were passed to component but could not be automatically inherited because component renders fragment or text or teleport root nodes.`), lt.length && k(`Extraneous non-emits event listeners (${lt.join(", ")}) were passed to component but could not be automatically inherited because component renders fragment or text root nodes. If the listener is intended to be a component custom event listener only, declare it using the "emits" option.`);
			}
		}
	}
	return n.dirs && (f.NODE_ENV !== "production" && !Lr(F) && k("Runtime directive used on component with non-element root node. The directives will not function as intended."), F = fe(F, null, !1, !0), F.dirs = F.dirs ? F.dirs.concat(n.dirs) : n.dirs), n.transition && (f.NODE_ENV !== "production" && !Lr(F) && k("Component inside <Transition> renders non-element root node that cannot be animated."), lr(F, n.transition)), f.NODE_ENV !== "production" && wt ? wt(F) : Y = F, Bn(it), Y;
}
var hs = (t) => {
	const e = t.children, n = t.dynamicChildren, o = fr(e, !1);
	if (o) {
		if (f.NODE_ENV !== "production" && o.patchFlag > 0 && o.patchFlag & 2048) return hs(o);
	} else return [t, void 0];
	const r = e.indexOf(o), i = n ? n.indexOf(o) : -1, s = (a) => {
		e[r] = a, n && (i > -1 ? n[i] = a : a.patchFlag > 0 && (t.dynamicChildren = [...n, a]));
	};
	return [Mt(o), s];
};
function fr(t, e = !0) {
	let n;
	for (let o = 0; o < t.length; o++) {
		const r = t[o];
		if (Fe(r)) {
			if (r.type !== Ot || r.children === "v-if") {
				if (n) return;
				if (n = r, f.NODE_ENV !== "production" && e && n.patchFlag > 0 && n.patchFlag & 2048) return fr(n.children);
			}
		} else return;
	}
	return n;
}
var Au = (t) => {
	let e;
	for (const n in t) (n === "class" || n === "style" || dn(n)) && ((e || (e = {}))[n] = t[n]);
	return e;
};
var Iu = (t, e) => {
	const n = {};
	for (const o in t) (!In(o) || !(o.slice(9) in e)) && (n[o] = t[o]);
	return n;
};
var Lr = (t) => t.shapeFlag & 7 || t.type === Ot;
function Pu(t, e, n) {
	const { props: o, children: r, component: i } = t, { props: s, children: a, patchFlag: u } = e, h = i.emitsOptions;
	if (f.NODE_ENV !== "production" && (r || a) && Tt || e.dirs || e.transition) return !0;
	if (n && u >= 0) {
		if (u & 1024) return !0;
		if (u & 16) return o ? Ur(o, s, h) : !!s;
		if (u & 8) {
			const d = e.dynamicProps;
			for (let c = 0; c < d.length; c++) {
				const g = d[c];
				if (s[g] !== o[g] && !ao(h, g)) return !0;
			}
		}
	} else return (r || a) && (!a || !a.$stable) ? !0 : o === s ? !1 : o ? s ? Ur(o, s, h) : !0 : !!s;
	return !1;
}
function Ur(t, e, n) {
	const o = Object.keys(e);
	if (o.length !== Object.keys(t).length) return !0;
	for (let r = 0; r < o.length; r++) {
		const i = o[r];
		if (e[i] !== t[i] && !ao(n, i)) return !0;
	}
	return !1;
}
function Ru({ vnode: t, parent: e }, n) {
	for (; e;) {
		const o = e.subTree;
		if (o.suspense && o.suspense.activeBranch === t && (o.el = t.el), o === t) (t = e.vnode).el = n, e = e.parent;
		else break;
	}
}
var bs = {};
var gs = () => Object.create(bs);
var ms = (t) => Object.getPrototypeOf(t) === bs;
function Fu(t, e, n, o = !1) {
	const r = {}, i = gs();
	t.propsDefaults = /* @__PURE__ */ Object.create(null), ys(t, e, r, i);
	for (const s in t.propsOptions[0]) s in r || (r[s] = void 0);
	f.NODE_ENV !== "production" && vs(e || {}, r, t), n ? t.props = o ? r : Oa(r) : t.type.props ? t.props = r : t.props = i, t.attrs = i;
}
function Lu(t) {
	for (; t;) {
		if (t.type.__hmrId) return !0;
		t = t.parent;
	}
}
function Uu(t, e, n, o) {
	const { props: r, attrs: i, vnode: { patchFlag: s } } = t, a = $(r), [u] = t.propsOptions;
	let h = !1;
	if (!(f.NODE_ENV !== "production" && Lu(t)) && (o || s > 0) && !(s & 16)) {
		if (s & 8) {
			const d = t.vnode.dynamicProps;
			for (let c = 0; c < d.length; c++) {
				let g = d[c];
				if (ao(t.emitsOptions, g)) continue;
				const x = e[g];
				if (u) if (I(i, g)) x !== i[g] && (i[g] = x, h = !0);
				else {
					const T = at(g);
					r[T] = Ao(u, a, T, x, t, !1);
				}
				else x !== i[g] && (i[g] = x, h = !0);
			}
		}
	} else {
		ys(t, e, r, i) && (h = !0);
		let d;
		for (const c in a) (!e || !I(e, c) && ((d = kt(c)) === c || !I(e, d))) && (u ? n && (n[c] !== void 0 || n[d] !== void 0) && (r[c] = Ao(u, a, c, void 0, t, !0)) : delete r[c]);
		if (i !== a) for (const c in i) (!e || !I(e, c)) && (delete i[c], h = !0);
	}
	h && Wt(t.attrs, "set", ""), f.NODE_ENV !== "production" && vs(e || {}, r, t);
}
function ys(t, e, n, o) {
	const [r, i] = t.propsOptions;
	let s = !1, a;
	if (e) for (let u in e) {
		if (Qe(u)) continue;
		const h = e[u];
		let d;
		r && I(r, d = at(u)) ? !i || !i.includes(d) ? n[d] = h : (a || (a = {}))[d] = h : ao(t.emitsOptions, u) || (!(u in o) || h !== o[u]) && (o[u] = h, s = !0);
	}
	if (i) {
		const u = $(n), h = a || B;
		for (let d = 0; d < i.length; d++) {
			const c = i[d];
			n[c] = Ao(r, u, c, h[c], t, !I(h, c));
		}
	}
	return s;
}
function Ao(t, e, n, o, r, i) {
	const s = t[n];
	if (s != null) {
		const a = I(s, "default");
		if (a && o === void 0) {
			const u = s.default;
			if (s.type !== Function && !s.skipFactory && M(u)) {
				const { propsDefaults: h } = r;
				if (n in h) o = h[n];
				else {
					const d = _n(r);
					o = h[n] = u.call(null, e), d();
				}
			} else o = u;
			r.ce && r.ce._setProp(n, o);
		}
		s[0] && (i && !a ? o = !1 : s[1] && (o === "" || o === kt(n)) && (o = !0));
	}
	return o;
}
var Hu = /* @__PURE__ */ new WeakMap();
function _s(t, e, n = !1) {
	const o = n ? Hu : e.propsCache, r = o.get(t);
	if (r) return r;
	const i = t.props, s = {}, a = [];
	let u = !1;
	if (!M(t)) {
		const d = (c) => {
			u = !0;
			const [g, x] = _s(c, e, !0);
			X(s, g), x && a.push(...x);
		};
		!n && e.mixins.length && e.mixins.forEach(d), t.extends && d(t.extends), t.mixins && t.mixins.forEach(d);
	}
	if (!i && !u) return L(t) && o.set(t, Te), Te;
	if (C(i)) for (let d = 0; d < i.length; d++) {
		f.NODE_ENV !== "production" && !J(i[d]) && k("props must be strings when using array syntax.", i[d]);
		const c = at(i[d]);
		Hr(c) && (s[c] = B);
	}
	else if (i) {
		f.NODE_ENV !== "production" && !L(i) && k("invalid props options", i);
		for (const d in i) {
			const c = at(d);
			if (Hr(c)) {
				const g = i[d], x = s[c] = C(g) || M(g) ? { type: g } : X({}, g), T = x.type;
				let S = !1, it = !0;
				if (C(T)) for (let Y = 0; Y < T.length; ++Y) {
					const U = T[Y], F = M(U) && U.name;
					if (F === "Boolean") {
						S = !0;
						break;
					} else F === "String" && (it = !1);
				}
				else S = M(T) && T.name === "Boolean";
				x[0] = S, x[1] = it, (S || I(x, "default")) && a.push(c);
			}
		}
	}
	const h = [s, a];
	return L(t) && o.set(t, h), h;
}
function Hr(t) {
	return t[0] !== "$" && !Qe(t) ? !0 : (f.NODE_ENV !== "production" && k(`Invalid prop name: "${t}" is a reserved property.`), !1);
}
function Bu(t) {
	return t === null ? "null" : typeof t == "function" ? t.name || "" : typeof t == "object" && t.constructor && t.constructor.name || "";
}
function vs(t, e, n) {
	const o = $(e), r = n.propsOptions[0], i = Object.keys(t).map((s) => at(s));
	for (const s in r) {
		let a = r[s];
		a != null && Ku(s, o[s], a, f.NODE_ENV !== "production" ? Gt(o) : o, !i.includes(s));
	}
}
function Ku(t, e, n, o, r) {
	const { type: i, required: s, validator: a, skipCheck: u } = n;
	if (s && r) {
		k("Missing required prop: \"" + t + "\"");
		return;
	}
	if (!(e == null && !s)) {
		if (i != null && i !== !0 && !u) {
			let h = !1;
			const d = C(i) ? i : [i], c = [];
			for (let g = 0; g < d.length && !h; g++) {
				const { valid: x, expectedType: T } = qu(e, d[g]);
				c.push(T || ""), h = x;
			}
			if (!h) {
				k(Gu(t, e, c));
				return;
			}
		}
		a && !a(e, o) && k("Invalid prop: custom validator check failed for prop \"" + t + "\".");
	}
}
var Wu = /* @__PURE__ */ oe("String,Number,Boolean,Function,Symbol,BigInt");
function qu(t, e) {
	let n;
	const o = Bu(e);
	if (o === "null") n = t === null;
	else if (Wu(o)) {
		const r = typeof t;
		n = r === o.toLowerCase(), !n && r === "object" && (n = t instanceof e);
	} else o === "Object" ? n = L(t) : o === "Array" ? n = C(t) : n = t instanceof e;
	return {
		valid: n,
		expectedType: o
	};
}
function Gu(t, e, n) {
	if (n.length === 0) return `Prop type [] for prop "${t}" won't match anything. Did you mean to use type Array instead?`;
	let o = `Invalid prop: type check failed for prop "${t}". Expected ${n.map(Ee).join(" | ")}`;
	const r = n[0], i = Xo(e), s = Br(e, r), a = Br(e, i);
	return n.length === 1 && Kr(r) && !Ju(r, i) && (o += ` with value ${s}`), o += `, got ${i} `, Kr(i) && (o += `with value ${a}.`), o;
}
function Br(t, e) {
	return e === "String" ? `"${t}"` : e === "Number" ? `${Number(t)}` : `${t}`;
}
function Kr(t) {
	return [
		"string",
		"number",
		"boolean"
	].some((n) => t.toLowerCase() === n);
}
function Ju(...t) {
	return t.some((e) => e.toLowerCase() === "boolean");
}
var hr = (t) => t === "_" || t === "_ctx" || t === "$stable";
var br = (t) => C(t) ? t.map(Mt) : [Mt(t)];
var Yu = (t, e, n) => {
	if (e._n) return e;
	const o = tu((...r) => (f.NODE_ENV !== "production" && tt && !(n === null && dt) && !(n && n.root !== tt.root) && k(`Slot "${t}" invoked outside of the render function: this will not track dependencies used in the slot. Invoke the slot function inside the render function instead.`), br(e(...r))), n);
	return o._c = !1, o;
};
var xs = (t, e, n) => {
	const o = t._ctx;
	for (const r in t) {
		if (hr(r)) continue;
		const i = t[r];
		if (M(i)) e[r] = Yu(r, i, o);
		else if (i != null) {
			f.NODE_ENV !== "production" && k(`Non-function value encountered for slot "${r}". Prefer function slots for better performance.`);
			const s = br(i);
			e[r] = () => s;
		}
	}
};
var ws = (t, e) => {
	f.NODE_ENV !== "production" && !cr(t.vnode) && k("Non-function value encountered for default slot. Prefer function slots for better performance.");
	const n = br(e);
	t.slots.default = () => n;
};
var Io = (t, e, n) => {
	for (const o in e) (n || !hr(o)) && (t[o] = e[o]);
};
var Xu = (t, e, n) => {
	const o = t.slots = gs();
	if (t.vnode.shapeFlag & 32) {
		const r = e._;
		r ? (Io(o, e, n), n && Pn(o, "_", r, !0)) : xs(e, o);
	} else e && ws(t, e);
};
var Zu = (t, e, n) => {
	const { vnode: o, slots: r } = t;
	let i = !0, s = B;
	if (o.shapeFlag & 32) {
		const a = e._;
		a ? f.NODE_ENV !== "production" && Tt ? (Io(r, e, n), Wt(t, "set", "$slots")) : n && a === 1 ? i = !1 : Io(r, e, n) : (i = !e.$stable, xs(e, r)), s = e;
	} else e && (ws(t, e), s = { default: 1 });
	if (i) for (const a in r) !hr(a) && s[a] == null && delete r[a];
};
var Je;
var te;
function De(t, e) {
	t.appContext.config.performance && Gn() && te.mark(`vue-${e}-${t.uid}`), f.NODE_ENV !== "production" && Xa(t, e, Gn() ? te.now() : Date.now());
}
function ze(t, e) {
	if (t.appContext.config.performance && Gn()) {
		const n = `vue-${e}-${t.uid}`, o = n + ":end", r = `<${vn(t, t.type)}> ${e}`;
		te.mark(o), te.measure(r, n, o), te.clearMeasures(r), te.clearMarks(n), te.clearMarks(o);
	}
	f.NODE_ENV !== "production" && Za(t, e, Gn() ? te.now() : Date.now());
}
function Gn() {
	return Je !== void 0 || (typeof window < "u" && window.performance ? (Je = !0, te = window.performance) : Je = !1), Je;
}
function Qu() {
	const t = [];
	if (f.NODE_ENV !== "production" && t.length) {
		const e = t.length > 1;
		console.warn(`Feature flag${e ? "s" : ""} ${t.join(", ")} ${e ? "are" : "is"} not explicitly defined. You are running the esm-bundler build of Vue, which expects these compile-time feature flags to be globally injected via the bundler config in order to get better tree-shaking in the production bundle.

For more details, see https://link.vuejs.org/feature-flags.`);
	}
}
var Et = rl;
function tl(t) {
	return el(t);
}
function el(t, e) {
	Qu();
	const n = hn();
	n.__VUE__ = !0, f.NODE_ENV !== "production" && Xi(n.__VUE_DEVTOOLS_GLOBAL_HOOK__, n);
	const { insert: o, remove: r, patchProp: i, createElement: s, createText: a, createComment: u, setText: h, setElementText: d, parentNode: c, nextSibling: g, setScopeId: x = ot, insertStaticContent: T } = t, S = (l, p, b, v = null, y = null, m = null, N = void 0, w = null, E = f.NODE_ENV !== "production" && Tt ? !1 : !!p.dynamicChildren) => {
		if (l === p) return;
		l && !Ye(l, p) && (v = wn(l), ae(l, y, m, !0), l = null), p.patchFlag === -2 && (E = !1, p.dynamicChildren = null);
		const { type: _, ref: V, shapeFlag: O } = p;
		switch (_) {
			case yn:
				it(l, p, b, v);
				break;
			case Ot:
				Y(l, p, b, v);
				break;
			case Tn:
				l == null ? U(p, b, v, N) : f.NODE_ENV !== "production" && F(l, p, b, N);
				break;
			case pt:
				xn(l, p, b, v, y, m, N, w, E);
				break;
			default: O & 1 ? st(l, p, b, v, y, m, N, w, E) : O & 6 ? vr(l, p, b, v, y, m, N, w, E) : O & 64 || O & 128 ? _.process(l, p, b, v, y, m, N, w, E, We) : f.NODE_ENV !== "production" && k("Invalid VNode type:", _, `(${typeof _})`);
		}
		V != null && y ? nn(V, l && l.ref, m, p || l, !p) : V == null && l && l.ref != null && nn(l.ref, null, m, l, !0);
	}, it = (l, p, b, v) => {
		if (l == null) o(p.el = a(p.children), b, v);
		else {
			const y = p.el = l.el;
			if (p.children !== l.children) if (f.NODE_ENV !== "production" && Tt && p.patchFlag === -1 && "__elIndex" in l) {
				const m = b.childNodes, N = a(p.children), w = m[p.__elIndex = l.__elIndex];
				o(N, b, w), r(w);
			} else h(y, p.children);
		}
	}, Y = (l, p, b, v) => {
		l == null ? o(p.el = u(p.children || ""), b, v) : p.el = l.el;
	}, U = (l, p, b, v) => {
		[l.el, l.anchor] = T(l.children, p, b, v, l.el, l.anchor);
	}, F = (l, p, b, v) => {
		if (p.children !== l.children) {
			const y = g(l.anchor);
			z(l), [p.el, p.anchor] = T(p.children, b, y, v);
		} else p.el = l.el, p.anchor = l.anchor;
	}, wt = ({ el: l, anchor: p }, b, v) => {
		let y;
		for (; l && l !== p;) y = g(l), o(l, b, v), l = y;
		o(p, b, v);
	}, z = ({ el: l, anchor: p }) => {
		let b;
		for (; l && l !== p;) b = g(l), r(l), l = b;
		r(p);
	}, st = (l, p, b, v, y, m, N, w, E) => {
		if (p.type === "svg" ? N = "svg" : p.type === "math" && (N = "mathml"), l == null) Dt(p, b, v, y, m, N, w, E);
		else {
			const _ = l.el && l.el._isVueCE ? l.el : null;
			try {
				_ && _._beginPatch(), Xt(l, p, y, m, N, w, E);
			} finally {
				_ && _._endPatch();
			}
		}
	}, Dt = (l, p, b, v, y, m, N, w) => {
		let E, _;
		const { props: V, shapeFlag: O, transition: D, dirs: j } = l;
		if (E = l.el = s(l.type, m, V && V.is, V), O & 8 ? d(E, l.children) : O & 16 && mt(l.children, E, null, v, y, wo(l, m), N, w), j && he(l, null, v, "created"), lt(E, l, l.scopeId, N, v), V) {
			for (const G in V) G !== "value" && !Qe(G) && i(E, G, null, V[G], m, v);
			"value" in V && i(E, "value", null, V.value, m), (_ = V.onVnodeBeforeMount) && Bt(_, v, l);
		}
		f.NODE_ENV !== "production" && (Pn(E, "__vnode", l, !0), Pn(E, "__vueParentComponent", v, !0)), j && he(l, null, v, "beforeMount");
		const R = nl(y, D);
		R && D.beforeEnter(E), o(E, p, b), ((_ = V && V.onVnodeMounted) || R || j) && Et(() => {
			_ && Bt(_, v, l), R && D.enter(E), j && he(l, null, v, "mounted");
		}, y);
	}, lt = (l, p, b, v, y) => {
		if (b && x(l, b), v) for (let m = 0; m < v.length; m++) x(l, v[m]);
		if (y) {
			let m = y.subTree;
			if (f.NODE_ENV !== "production" && m.patchFlag > 0 && m.patchFlag & 2048 && (m = fr(m.children) || m), p === m || Ns(m.type) && (m.ssContent === p || m.ssFallback === p)) {
				const N = y.vnode;
				lt(l, N, N.scopeId, N.slotScopeIds, y.parent);
			}
		}
	}, mt = (l, p, b, v, y, m, N, w, E = 0) => {
		for (let _ = E; _ < l.length; _++) {
			const V = l[_] = w ? ce(l[_]) : Mt(l[_]);
			S(null, V, p, b, v, y, m, N, w);
		}
	}, Xt = (l, p, b, v, y, m, N) => {
		const w = p.el = l.el;
		f.NODE_ENV !== "production" && (w.__vnode = p);
		let { patchFlag: E, dynamicChildren: _, dirs: V } = p;
		E |= l.patchFlag & 16;
		const O = l.props || B, D = p.props || B;
		let j;
		if (b && be(b, !1), (j = D.onVnodeBeforeUpdate) && Bt(j, b, p, l), V && he(p, l, b, "beforeUpdate"), b && be(b, !0), f.NODE_ENV !== "production" && Tt && (E = 0, N = !1, _ = null), (O.innerHTML && D.innerHTML == null || O.textContent && D.textContent == null) && d(w, ""), _ ? (ie(l.dynamicChildren, _, w, b, v, wo(p, y), m), f.NODE_ENV !== "production" && Mn(l, p)) : N || Ft(l, p, w, null, b, v, wo(p, y), m, !1), E > 0) {
			if (E & 16) Vt(w, O, D, b, y);
			else if (E & 2 && O.class !== D.class && i(w, "class", null, D.class, y), E & 4 && i(w, "style", O.style, D.style, y), E & 8) {
				const R = p.dynamicProps;
				for (let G = 0; G < R.length; G++) {
					const K = R[G], _t = O[K], vt = D[K];
					(vt !== _t || K === "value") && i(w, K, _t, vt, y, b);
				}
			}
			E & 1 && l.children !== p.children && d(w, p.children);
		} else !N && _ == null && Vt(w, O, D, b, y);
		((j = D.onVnodeUpdated) || V) && Et(() => {
			j && Bt(j, b, p, l), V && he(p, l, b, "updated");
		}, v);
	}, ie = (l, p, b, v, y, m, N) => {
		for (let w = 0; w < p.length; w++) {
			const E = l[w], _ = p[w], V = E.el && (E.type === pt || !Ye(E, _) || E.shapeFlag & 198) ? c(E.el) : b;
			S(E, _, V, null, v, y, m, N, !0);
		}
	}, Vt = (l, p, b, v, y) => {
		if (p !== b) {
			if (p !== B) for (const m in p) !Qe(m) && !(m in b) && i(l, m, p[m], null, y, v);
			for (const m in b) {
				if (Qe(m)) continue;
				const N = b[m], w = p[m];
				N !== w && m !== "value" && i(l, m, w, N, y, v);
			}
			"value" in b && i(l, "value", p.value, b.value, y);
		}
	}, xn = (l, p, b, v, y, m, N, w, E) => {
		const _ = p.el = l ? l.el : a(""), V = p.anchor = l ? l.anchor : a("");
		let { patchFlag: O, dynamicChildren: D, slotScopeIds: j } = p;
		f.NODE_ENV !== "production" && (Tt || O & 2048) && (O = 0, E = !1, D = null), j && (w = w ? w.concat(j) : j), l == null ? (o(_, b, v), o(V, b, v), mt(p.children || [], b, V, y, m, N, w, E)) : O > 0 && O & 64 && D && l.dynamicChildren && l.dynamicChildren.length === D.length ? (ie(l.dynamicChildren, D, b, y, m, N, w), f.NODE_ENV !== "production" ? Mn(l, p) : (p.key != null || y && p === y.subTree) && Mn(l, p, !0)) : Ft(l, p, b, V, y, m, N, w, E);
	}, vr = (l, p, b, v, y, m, N, w, E) => {
		p.slotScopeIds = w, l == null ? p.shapeFlag & 512 ? y.ctx.activate(p, b, v, N, E) : se(p, b, v, y, m, N, E) : yt(l, p, E);
	}, se = (l, p, b, v, y, m, N) => {
		const w = l.component = dl(l, v, y);
		if (f.NODE_ENV !== "production" && w.type.__hmrId && Ua(w), f.NODE_ENV !== "production" && (Cn(l), De(w, "mount")), cr(l) && (w.ctx.renderer = We), f.NODE_ENV !== "production" && De(w, "init"), hl(w, !1, N), f.NODE_ENV !== "production" && ze(w, "init"), f.NODE_ENV !== "production" && Tt && (l.el = null), w.asyncDep) {
			if (y && y.registerDep(w, P, N), !l.el) {
				const E = w.subTree = rt(Ot);
				Y(null, E, p, b), l.placeholder = E.el;
			}
		} else P(w, l, p, b, y, m, N);
		f.NODE_ENV !== "production" && (Dn(), ze(w, "mount"));
	}, yt = (l, p, b) => {
		const v = p.component = l.component;
		if (Pu(l, p, b)) if (v.asyncDep && !v.asyncResolved) {
			f.NODE_ENV !== "production" && Cn(p), A(v, p, b), f.NODE_ENV !== "production" && Dn();
			return;
		} else v.next = p, v.update();
		else p.el = l.el, v.vnode = p;
	}, P = (l, p, b, v, y, m, N) => {
		const w = () => {
			if (l.isMounted) {
				let { next: O, bu: D, u: j, parent: R, vnode: G } = l;
				{
					const Ut = Es(l);
					if (Ut) {
						O && (O.el = G.el, A(l, O, N)), Ut.asyncDep.then(() => {
							l.isUnmounted || w();
						});
						return;
					}
				}
				let K = O, _t;
				f.NODE_ENV !== "production" && Cn(O || l.vnode), be(l, !1), O ? (O.el = G.el, A(l, O, N)) : O = G, D && Ve(D), (_t = O.props && O.props.onVnodeBeforeUpdate) && Bt(_t, R, O, G), be(l, !0), f.NODE_ENV !== "production" && De(l, "render");
				const vt = Fr(l);
				f.NODE_ENV !== "production" && ze(l, "render");
				const Lt = l.subTree;
				l.subTree = vt, f.NODE_ENV !== "production" && De(l, "patch"), S(Lt, vt, c(Lt.el), wn(Lt), l, y, m), f.NODE_ENV !== "production" && ze(l, "patch"), O.el = vt.el, K === null && Ru(l, vt.el), j && Et(j, y), (_t = O.props && O.props.onVnodeUpdated) && Et(() => Bt(_t, R, O, G), y), f.NODE_ENV !== "production" && Zi(l), f.NODE_ENV !== "production" && Dn();
			} else {
				let O;
				const { el: D, props: j } = p, { bm: R, m: G, parent: K, root: _t, type: vt } = l, Lt = on(p);
				be(l, !1), R && Ve(R), !Lt && (O = j && j.onVnodeBeforeMount) && Bt(O, K, p), be(l, !0);
				{
					_t.ce && _t.ce._def.shadowRoot !== !1 && _t.ce._injectChildStyle(vt), f.NODE_ENV !== "production" && De(l, "render");
					const Ut = l.subTree = Fr(l);
					f.NODE_ENV !== "production" && ze(l, "render"), f.NODE_ENV !== "production" && De(l, "patch"), S(null, Ut, b, v, l, y, m), f.NODE_ENV !== "production" && ze(l, "patch"), p.el = Ut.el;
				}
				if (G && Et(G, y), !Lt && (O = j && j.onVnodeMounted)) {
					const Ut = p;
					Et(() => Bt(O, K, Ut), y);
				}
				(p.shapeFlag & 256 || K && on(K.vnode) && K.vnode.shapeFlag & 256) && l.a && Et(l.a, y), l.isMounted = !0, f.NODE_ENV !== "production" && Ga(l), p = b = v = null;
			}
		};
		l.scope.on();
		const E = l.effect = new Oi(w);
		l.scope.off();
		const _ = l.update = E.run.bind(E), V = l.job = E.runIfDirty.bind(E);
		V.i = l, V.id = l.uid, E.scheduler = () => io(V), be(l, !0), f.NODE_ENV !== "production" && (E.onTrack = l.rtc ? (O) => Ve(l.rtc, O) : void 0, E.onTrigger = l.rtg ? (O) => Ve(l.rtg, O) : void 0), _();
	}, A = (l, p, b) => {
		p.component = l;
		const v = l.vnode.props;
		l.vnode = p, l.next = null, Uu(l, p.props, v, b), Zu(l, p.children, b), At(), Vr(l), It();
	}, Ft = (l, p, b, v, y, m, N, w, E = !1) => {
		const _ = l && l.children, V = l ? l.shapeFlag : 0, O = p.children, { patchFlag: D, shapeFlag: j } = p;
		if (D > 0) {
			if (D & 128) {
				Be(_, O, b, v, y, m, N, w, E);
				return;
			} else if (D & 256) {
				po(_, O, b, v, y, m, N, w, E);
				return;
			}
		}
		j & 8 ? (V & 16 && Ke(_, y, m), O !== _ && d(b, O)) : V & 16 ? j & 16 ? Be(_, O, b, v, y, m, N, w, E) : Ke(_, y, m, !0) : (V & 8 && d(b, ""), j & 16 && mt(O, b, v, y, m, N, w, E));
	}, po = (l, p, b, v, y, m, N, w, E) => {
		l = l || Te, p = p || Te;
		const _ = l.length, V = p.length, O = Math.min(_, V);
		let D;
		for (D = 0; D < O; D++) {
			const j = p[D] = E ? ce(p[D]) : Mt(p[D]);
			S(l[D], j, b, null, y, m, N, w, E);
		}
		_ > V ? Ke(l, y, m, !0, !1, O) : mt(p, b, v, y, m, N, w, E, O);
	}, Be = (l, p, b, v, y, m, N, w, E) => {
		let _ = 0;
		const V = p.length;
		let O = l.length - 1, D = V - 1;
		for (; _ <= O && _ <= D;) {
			const j = l[_], R = p[_] = E ? ce(p[_]) : Mt(p[_]);
			if (Ye(j, R)) S(j, R, b, null, y, m, N, w, E);
			else break;
			_++;
		}
		for (; _ <= O && _ <= D;) {
			const j = l[O], R = p[D] = E ? ce(p[D]) : Mt(p[D]);
			if (Ye(j, R)) S(j, R, b, null, y, m, N, w, E);
			else break;
			O--, D--;
		}
		if (_ > O) {
			if (_ <= D) {
				const j = D + 1, R = j < V ? p[j].el : v;
				for (; _ <= D;) S(null, p[_] = E ? ce(p[_]) : Mt(p[_]), b, R, y, m, N, w, E), _++;
			}
		} else if (_ > D) for (; _ <= O;) ae(l[_], y, m, !0), _++;
		else {
			const j = _, R = _, G = /* @__PURE__ */ new Map();
			for (_ = R; _ <= D; _++) {
				const ft = p[_] = E ? ce(p[_]) : Mt(p[_]);
				ft.key != null && (f.NODE_ENV !== "production" && G.has(ft.key) && k("Duplicate keys found during update:", JSON.stringify(ft.key), "Make sure keys are unique."), G.set(ft.key, _));
			}
			let K, _t = 0;
			const vt = D - R + 1;
			let Lt = !1, Ut = 0;
			const qe = new Array(vt);
			for (_ = 0; _ < vt; _++) qe[_] = 0;
			for (_ = j; _ <= O; _++) {
				const ft = l[_];
				if (_t >= vt) {
					ae(ft, y, m, !0);
					continue;
				}
				let Ht;
				if (ft.key != null) Ht = G.get(ft.key);
				else for (K = R; K <= D; K++) if (qe[K - R] === 0 && Ye(ft, p[K])) {
					Ht = K;
					break;
				}
				Ht === void 0 ? ae(ft, y, m, !0) : (qe[Ht - R] = _ + 1, Ht >= Ut ? Ut = Ht : Lt = !0, S(ft, p[Ht], b, null, y, m, N, w, E), _t++);
			}
			const wr = Lt ? ol(qe) : Te;
			for (K = wr.length - 1, _ = vt - 1; _ >= 0; _--) {
				const ft = R + _, Ht = p[ft], Er = p[ft + 1], kr = ft + 1 < V ? Er.el || ks(Er) : v;
				qe[_] === 0 ? S(null, Ht, b, kr, y, m, N, w, E) : Lt && (K < 0 || _ !== wr[K] ? Oe(Ht, b, kr, 2) : K--);
			}
		}
	}, Oe = (l, p, b, v, y = null) => {
		const { el: m, type: N, transition: w, children: E, shapeFlag: _ } = l;
		if (_ & 6) {
			Oe(l.component.subTree, p, b, v);
			return;
		}
		if (_ & 128) {
			l.suspense.move(p, b, v);
			return;
		}
		if (_ & 64) {
			N.move(l, p, b, We);
			return;
		}
		if (N === pt) {
			o(m, p, b);
			for (let O = 0; O < E.length; O++) Oe(E[O], p, b, v);
			o(l.anchor, p, b);
			return;
		}
		if (N === Tn) {
			wt(l, p, b);
			return;
		}
		if (v !== 2 && _ & 1 && w) if (v === 0) w.beforeEnter(m), o(m, p, b), Et(() => w.enter(m), y);
		else {
			const { leave: O, delayLeave: D, afterLeave: j } = w, R = () => {
				l.ctx.isUnmounted ? r(m) : o(m, p, b);
			}, G = () => {
				m._isLeaving && m[au](!0), O(m, () => {
					R(), j && j();
				});
			};
			D ? D(m, R, G) : G();
		}
		else o(m, p, b);
	}, ae = (l, p, b, v = !1, y = !1) => {
		const { type: m, props: N, ref: w, children: E, dynamicChildren: _, shapeFlag: V, patchFlag: O, dirs: D, cacheIndex: j } = l;
		if (O === -2 && (y = !1), w != null && (At(), nn(w, null, b, l, !0), It()), j != null && (p.renderCache[j] = void 0), V & 256) {
			p.ctx.deactivate(l);
			return;
		}
		const R = V & 1 && D, G = !on(l);
		let K;
		if (G && (K = N && N.onVnodeBeforeUnmount) && Bt(K, p, l), V & 6) Us(l.component, b, v);
		else {
			if (V & 128) {
				l.suspense.unmount(b, v);
				return;
			}
			R && he(l, null, p, "beforeUnmount"), V & 64 ? l.type.remove(l, p, b, We, v) : _ && !_.hasOnce && (m !== pt || O > 0 && O & 64) ? Ke(_, p, b, !1, !0) : (m === pt && O & 384 || !y && V & 16) && Ke(E, p, b), v && fo(l);
		}
		(G && (K = N && N.onVnodeUnmounted) || R) && Et(() => {
			K && Bt(K, p, l), R && he(l, null, p, "unmounted");
		}, b);
	}, fo = (l) => {
		const { type: p, el: b, anchor: v, transition: y } = l;
		if (p === pt) {
			f.NODE_ENV !== "production" && l.patchFlag > 0 && l.patchFlag & 2048 && y && !y.persisted ? l.children.forEach((N) => {
				N.type === Ot ? r(N.el) : fo(N);
			}) : Ls(b, v);
			return;
		}
		if (p === Tn) {
			z(l);
			return;
		}
		const m = () => {
			r(b), y && !y.persisted && y.afterLeave && y.afterLeave();
		};
		if (l.shapeFlag & 1 && y && !y.persisted) {
			const { leave: N, delayLeave: w } = y, E = () => N(b, m);
			w ? w(l.el, m, E) : E();
		} else m();
	}, Ls = (l, p) => {
		let b;
		for (; l !== p;) b = g(l), r(l), l = b;
		r(p);
	}, Us = (l, p, b) => {
		f.NODE_ENV !== "production" && l.type.__hmrId && Ha(l);
		const { bum: v, scope: y, job: m, subTree: N, um: w, m: E, a: _ } = l;
		Wr(E), Wr(_), v && Ve(v), y.stop(), m && (m.flags |= 8, ae(N, l, p, b)), w && Et(w, p), Et(() => {
			l.isUnmounted = !0;
		}, p), f.NODE_ENV !== "production" && Ya(l);
	}, Ke = (l, p, b, v = !1, y = !1, m = 0) => {
		for (let N = m; N < l.length; N++) ae(l[N], p, b, v, y);
	}, wn = (l) => {
		if (l.shapeFlag & 6) return wn(l.component.subTree);
		if (l.shapeFlag & 128) return l.suspense.next();
		const p = g(l.anchor || l.el), b = p && p[iu];
		return b ? g(b) : p;
	};
	let ho = !1;
	const xr = (l, p, b) => {
		let v;
		l == null ? p._vnode && (ae(p._vnode, null, null, !0), v = p._vnode.component) : S(p._vnode || null, l, p, null, null, null, b), p._vnode = l, ho || (ho = !0, Vr(v), Gi(), ho = !1);
	}, We = {
		p: S,
		um: ae,
		m: Oe,
		r: fo,
		mt: se,
		mc: mt,
		pc: Ft,
		pbc: ie,
		n: wn,
		o: t
	};
	return {
		render: xr,
		hydrate: void 0,
		createApp: Mu(xr)
	};
}
function wo({ type: t, props: e }, n) {
	return n === "svg" && t === "foreignObject" || n === "mathml" && t === "annotation-xml" && e && e.encoding && e.encoding.includes("html") ? void 0 : n;
}
function be({ effect: t, job: e }, n) {
	n ? (t.flags |= 32, e.flags |= 4) : (t.flags &= -33, e.flags &= -5);
}
function nl(t, e) {
	return (!t || t && !t.pendingBranch) && e && !e.persisted;
}
function Mn(t, e, n = !1) {
	const o = t.children, r = e.children;
	if (C(o) && C(r)) for (let i = 0; i < o.length; i++) {
		const s = o[i];
		let a = r[i];
		a.shapeFlag & 1 && !a.dynamicChildren && ((a.patchFlag <= 0 || a.patchFlag === 32) && (a = r[i] = ce(r[i]), a.el = s.el), !n && a.patchFlag !== -2 && Mn(s, a)), a.type === yn && (a.patchFlag !== -1 ? a.el = s.el : a.__elIndex = i + (t.type === pt ? 1 : 0)), a.type === Ot && !a.el && (a.el = s.el), f.NODE_ENV !== "production" && a.el && (a.el.__vnode = a);
	}
}
function ol(t) {
	const e = t.slice(), n = [0];
	let o, r, i, s, a;
	const u = t.length;
	for (o = 0; o < u; o++) {
		const h = t[o];
		if (h !== 0) {
			if (r = n[n.length - 1], t[r] < h) {
				e[o] = r, n.push(o);
				continue;
			}
			for (i = 0, s = n.length - 1; i < s;) a = i + s >> 1, t[n[a]] < h ? i = a + 1 : s = a;
			h < t[n[i]] && (i > 0 && (e[o] = n[i - 1]), n[i] = o);
		}
	}
	for (i = n.length, s = n[i - 1]; i-- > 0;) n[i] = s, s = e[s];
	return n;
}
function Es(t) {
	const e = t.subTree.component;
	if (e) return e.asyncDep && !e.asyncResolved ? e : Es(e);
}
function Wr(t) {
	if (t) for (let e = 0; e < t.length; e++) t[e].flags |= 8;
}
function ks(t) {
	if (t.placeholder) return t.placeholder;
	const e = t.component;
	return e ? ks(e.subTree) : null;
}
var Ns = (t) => t.__isSuspense;
function rl(t, e) {
	e && e.pendingBranch ? C(t) ? e.effects.push(...t) : e.effects.push(t) : qi(t);
}
var pt = /* @__PURE__ */ Symbol.for("v-fgt");
var yn = /* @__PURE__ */ Symbol.for("v-txt");
var Ot = /* @__PURE__ */ Symbol.for("v-cmt");
var Tn = /* @__PURE__ */ Symbol.for("v-stc");
var rn = [];
var Nt = null;
function W(t = !1) {
	rn.push(Nt = t ? null : []);
}
function il() {
	rn.pop(), Nt = rn[rn.length - 1] || null;
}
var ln = 1;
function Jn(t, e = !1) {
	ln += t, t < 0 && Nt && e && (Nt.hasOnce = !0);
}
function Os(t) {
	return t.dynamicChildren = ln > 0 ? Nt || Te : null, il(), ln > 0 && Nt && Nt.push(t), t;
}
function Z(t, e, n, o, r, i) {
	return Os(Q(t, e, n, o, r, i, !0));
}
function He(t, e, n, o, r) {
	return Os(rt(t, e, n, o, r, !0));
}
function Fe(t) {
	return t ? t.__v_isVNode === !0 : !1;
}
function Ye(t, e) {
	if (f.NODE_ENV !== "production" && e.shapeFlag & 6 && t.component) {
		const n = zn.get(e.type);
		if (n && n.has(t.component)) return t.shapeFlag &= -257, e.shapeFlag &= -513, !1;
	}
	return t.type === e.type && t.key === e.key;
}
var sl = (...t) => Cs(...t);
var Ss = ({ key: t }) => t ?? null;
var jn = ({ ref: t, ref_key: e, ref_for: n }) => (typeof t == "number" && (t = "" + t), t != null ? J(t) || et(t) || M(t) ? {
	i: dt,
	r: t,
	k: e,
	f: !!n
} : t : null);
function Q(t, e = null, n = null, o = 0, r = null, i = t === pt ? 0 : 1, s = !1, a = !1) {
	const u = {
		__v_isVNode: !0,
		__v_skip: !0,
		type: t,
		props: e,
		key: e && Ss(e),
		ref: e && jn(e),
		scopeId: ts,
		slotScopeIds: null,
		children: n,
		component: null,
		suspense: null,
		ssContent: null,
		ssFallback: null,
		dirs: null,
		transition: null,
		el: null,
		anchor: null,
		target: null,
		targetStart: null,
		targetAnchor: null,
		staticCount: 0,
		shapeFlag: i,
		patchFlag: o,
		dynamicProps: r,
		dynamicChildren: null,
		appContext: null,
		ctx: dt
	};
	return a ? (gr(u, n), i & 128 && t.normalize(u)) : n && (u.shapeFlag |= J(n) ? 8 : 16), f.NODE_ENV !== "production" && u.key !== u.key && k("VNode created with invalid key (NaN). VNode type:", u.type), ln > 0 && !s && Nt && (u.patchFlag > 0 || i & 6) && u.patchFlag !== 32 && Nt.push(u), u;
}
var rt = f.NODE_ENV !== "production" ? sl : Cs;
function Cs(t, e = null, n = null, o = 0, r = null, i = !1) {
	if ((!t || t === as) && (f.NODE_ENV !== "production" && !t && k(`Invalid vnode type when creating vnode: ${t}.`), t = Ot), Fe(t)) {
		const a = fe(t, e, !0);
		return n && gr(a, n), ln > 0 && !i && Nt && (a.shapeFlag & 6 ? Nt[Nt.indexOf(t)] = a : Nt.push(a)), a.patchFlag = -2, a;
	}
	if (Ts(t) && (t = t.__vccOpts), e) {
		e = al(e);
		let { class: a, style: u } = e;
		a && !J(a) && (e.class = er(a)), L(u) && (Rn(u) && !C(u) && (u = X({}, u)), e.style = tr(u));
	}
	const s = J(t) ? 1 : Ns(t) ? 128 : su(t) ? 64 : L(t) ? 4 : M(t) ? 2 : 0;
	return f.NODE_ENV !== "production" && s & 4 && Rn(t) && (t = $(t), k("Vue received a Component that was made a reactive object. This can lead to unnecessary performance overhead and should be avoided by marking the component with `markRaw` or using `shallowRef` instead of `ref`.", `
Component that was made reactive: `, t)), Q(t, e, n, o, r, s, i, !0);
}
function al(t) {
	return t ? Rn(t) || ms(t) ? X({}, t) : t : null;
}
function fe(t, e, n = !1, o = !1) {
	const { props: r, ref: i, patchFlag: s, children: a, transition: u } = t, h = e ? ll(r || {}, e) : r, d = {
		__v_isVNode: !0,
		__v_skip: !0,
		type: t.type,
		props: h,
		key: h && Ss(h),
		ref: e && e.ref ? n && i ? C(i) ? i.concat(jn(e)) : [i, jn(e)] : jn(e) : i,
		scopeId: t.scopeId,
		slotScopeIds: t.slotScopeIds,
		children: f.NODE_ENV !== "production" && s === -1 && C(a) ? a.map(Ds) : a,
		target: t.target,
		targetStart: t.targetStart,
		targetAnchor: t.targetAnchor,
		staticCount: t.staticCount,
		shapeFlag: t.shapeFlag,
		patchFlag: e && t.type !== pt ? s === -1 ? 16 : s | 16 : s,
		dynamicProps: t.dynamicProps,
		dynamicChildren: t.dynamicChildren,
		appContext: t.appContext,
		dirs: t.dirs,
		transition: u,
		component: t.component,
		suspense: t.suspense,
		ssContent: t.ssContent && fe(t.ssContent),
		ssFallback: t.ssFallback && fe(t.ssFallback),
		placeholder: t.placeholder,
		el: t.el,
		anchor: t.anchor,
		ctx: t.ctx,
		ce: t.ce
	};
	return u && o && lr(d, u.clone(d)), d;
}
function Ds(t) {
	const e = fe(t);
	return C(t.children) && (e.children = t.children.map(Ds)), e;
}
function ul(t = " ", e = 0) {
	return rt(yn, null, t, e);
}
function Ne(t = "", e = !1) {
	return e ? (W(), He(Ot, null, t)) : rt(Ot, null, t);
}
function Mt(t) {
	return t == null || typeof t == "boolean" ? rt(Ot) : C(t) ? rt(pt, null, t.slice()) : Fe(t) ? ce(t) : rt(yn, null, String(t));
}
function ce(t) {
	return t.el === null && t.patchFlag !== -1 || t.memo ? t : fe(t);
}
function gr(t, e) {
	let n = 0;
	const { shapeFlag: o } = t;
	if (e == null) e = null;
	else if (C(e)) n = 16;
	else if (typeof e == "object") if (o & 65) {
		const r = e.default;
		r && (r._c && (r._d = !1), gr(t, r()), r._c && (r._d = !0));
		return;
	} else {
		n = 32;
		const r = e._;
		!r && !ms(e) ? e._ctx = dt : r === 3 && dt && (dt.slots._ === 1 ? e._ = 1 : (e._ = 2, t.patchFlag |= 1024));
	}
	else M(e) ? (e = {
		default: e,
		_ctx: dt
	}, n = 32) : (e = String(e), o & 64 ? (n = 16, e = [ul(e)]) : n = 8);
	t.children = e, t.shapeFlag |= n;
}
function ll(...t) {
	const e = {};
	for (let n = 0; n < t.length; n++) {
		const o = t[n];
		for (const r in o) if (r === "class") e.class !== o.class && (e.class = er([e.class, o.class]));
		else if (r === "style") e.style = tr([e.style, o.style]);
		else if (dn(r)) {
			const i = e[r], s = o[r];
			s && i !== s && !(C(i) && i.includes(s)) && (e[r] = i ? [].concat(i, s) : s);
		} else r !== "" && (e[r] = o[r]);
	}
	return e;
}
function Bt(t, e, n, o = null) {
	Yt(t, e, 7, [n, o]);
}
var cl = ds();
var pl = 0;
function dl(t, e, n) {
	const o = t.type, r = (e ? e.appContext : t.appContext) || cl, i = {
		uid: pl++,
		vnode: t,
		type: o,
		parent: e,
		appContext: r,
		root: null,
		next: null,
		subTree: null,
		effect: null,
		update: null,
		job: null,
		scope: new sa(!0),
		render: null,
		proxy: null,
		exposed: null,
		exposeProxy: null,
		withProxy: null,
		provides: e ? e.provides : Object.create(r.provides),
		ids: e ? e.ids : [
			"",
			0,
			0
		],
		accessCache: null,
		renderCache: [],
		components: null,
		directives: null,
		propsOptions: _s(o, r),
		emitsOptions: fs(o, r),
		emit: null,
		emitted: null,
		propsDefaults: B,
		inheritAttrs: o.inheritAttrs,
		ctx: B,
		data: B,
		props: B,
		attrs: B,
		slots: B,
		refs: B,
		setupState: B,
		setupContext: null,
		suspense: n,
		suspenseId: n ? n.pendingId : 0,
		asyncDep: null,
		asyncResolved: !1,
		isMounted: !1,
		isUnmounted: !1,
		isDeactivated: !1,
		bc: null,
		c: null,
		bm: null,
		m: null,
		bu: null,
		u: null,
		um: null,
		bum: null,
		da: null,
		a: null,
		rtg: null,
		rtc: null,
		ec: null,
		sp: null
	};
	return f.NODE_ENV !== "production" ? i.ctx = wu(i) : i.ctx = { _: i }, i.root = e ? e.root : i, i.emit = ju.bind(null, i), t.ce && t.ce(i), i;
}
var tt = null;
var zs = () => tt || dt;
var Yn;
var Po;
{
	const t = hn(), e = (n, o) => {
		let r;
		return (r = t[n]) || (r = t[n] = []), r.push(o), (i) => {
			r.length > 1 ? r.forEach((s) => s(i)) : r[0](i);
		};
	};
	Yn = e("__VUE_INSTANCE_SETTERS__", (n) => tt = n), Po = e("__VUE_SSR_SETTERS__", (n) => cn = n);
}
var _n = (t) => {
	const e = tt;
	return Yn(t), t.scope.on(), () => {
		t.scope.off(), Yn(e);
	};
};
var qr = () => {
	tt && tt.scope.off(), Yn(null);
};
var fl = /* @__PURE__ */ oe("slot,component");
function Ro(t, { isNativeTag: e }) {
	(fl(t) || e(t)) && k("Do not use built-in or reserved HTML elements as component id: " + t);
}
function Vs(t) {
	return t.vnode.shapeFlag & 4;
}
var cn = !1;
function hl(t, e = !1, n = !1) {
	e && Po(e);
	const { props: o, children: r } = t.vnode, i = Vs(t);
	Fu(t, o, i, e), Xu(t, r, n || e);
	const s = i ? bl(t, e) : void 0;
	return e && Po(!1), s;
}
function bl(t, e) {
	const n = t.type;
	if (f.NODE_ENV !== "production") {
		if (n.name && Ro(n.name, t.appContext.config), n.components) {
			const r = Object.keys(n.components);
			for (let i = 0; i < r.length; i++) Ro(r[i], t.appContext.config);
		}
		if (n.directives) {
			const r = Object.keys(n.directives);
			for (let i = 0; i < r.length; i++) es(r[i]);
		}
		n.compilerOptions && gl() && k("\"compilerOptions\" is only supported when using a build of Vue that includes the runtime compiler. Since you are using a runtime-only build, the options should be passed via your build tool config instead.");
	}
	t.accessCache = /* @__PURE__ */ Object.create(null), t.proxy = new Proxy(t.ctx, ls), f.NODE_ENV !== "production" && Eu(t);
	const { setup: o } = n;
	if (o) {
		At();
		const r = t.setupContext = o.length > 1 ? yl(t) : null, i = _n(t), s = Ue(o, t, 0, [f.NODE_ENV !== "production" ? Gt(t.props) : t.props, r]), a = Yo(s);
		if (It(), i(), (a || t.sp) && !on(t) && rs(t), a) {
			if (s.then(qr, qr), e) return s.then((u) => {
				Gr(t, u, e);
			}).catch((u) => {
				gn(u, t, 0);
			});
			if (t.asyncDep = s, f.NODE_ENV !== "production" && !t.suspense) k(`Component <${vn(t, n)}>: setup function returned a promise, but no <Suspense> boundary was found in the parent component tree. A component with async setup() must be nested in a <Suspense> in order to be rendered.`);
		} else Gr(t, s, e);
	} else Ms(t, e);
}
function Gr(t, e, n) {
	M(e) ? t.type.__ssrInlineRender ? t.ssrRender = e : t.render = e : L(e) ? (f.NODE_ENV !== "production" && Fe(e) && k("setup() should not return VNodes directly - return a render function instead."), f.NODE_ENV !== "production" && (t.devtoolsRawSetupState = e), t.setupState = Ui(e), f.NODE_ENV !== "production" && ku(t)) : f.NODE_ENV !== "production" && e !== void 0 && k(`setup() should return an object. Received: ${e === null ? "null" : typeof e}`), Ms(t, n);
}
var gl = () => !0;
function Ms(t, e, n) {
	const o = t.type;
	t.render || (t.render = o.render || ot);
	{
		const r = _n(t);
		At();
		try {
			Ou(t);
		} finally {
			It(), r();
		}
	}
	f.NODE_ENV !== "production" && !o.render && t.render === ot && !e && (o.template ? k("Component provided template option but runtime compilation is not supported in this build of Vue. Configure your bundler to alias \"vue\" to \"vue/dist/vue.esm-bundler.js\".") : k("Component is missing template or render function: ", o));
}
var Jr = f.NODE_ENV !== "production" ? {
	get(t, e) {
		return qn(), nt(t, "get", ""), t[e];
	},
	set() {
		return k("setupContext.attrs is readonly."), !1;
	},
	deleteProperty() {
		return k("setupContext.attrs is readonly."), !1;
	}
} : { get(t, e) {
	return nt(t, "get", ""), t[e];
} };
function ml(t) {
	return new Proxy(t.slots, { get(e, n) {
		return nt(t, "get", "$slots"), e[n];
	} });
}
function yl(t) {
	const e = (n) => {
		if (f.NODE_ENV !== "production" && (t.exposed && k("expose() should be called only once per setup()."), n != null)) {
			let o = typeof n;
			o === "object" && (C(n) ? o = "array" : et(n) && (o = "ref")), o !== "object" && k(`expose() should be passed a plain object, received ${o}.`);
		}
		t.exposed = n || {};
	};
	if (f.NODE_ENV !== "production") {
		let n, o;
		return Object.freeze({
			get attrs() {
				return n || (n = new Proxy(t.attrs, Jr));
			},
			get slots() {
				return o || (o = ml(t));
			},
			get emit() {
				return (r, ...i) => t.emit(r, ...i);
			},
			expose: e
		});
	} else return {
		attrs: new Proxy(t.attrs, Jr),
		slots: t.slots,
		emit: t.emit,
		expose: e
	};
}
function uo(t) {
	return t.exposed ? t.exposeProxy || (t.exposeProxy = new Proxy(Ui(Sa(t.exposed)), {
		get(e, n) {
			if (n in e) return e[n];
			if (n in we) return we[n](t);
		},
		has(e, n) {
			return n in e || n in we;
		}
	})) : t.proxy;
}
var _l = /(?:^|[-_])\w/g;
var vl = (t) => t.replace(_l, (e) => e.toUpperCase()).replace(/[-_]/g, "");
function mr(t, e = !0) {
	return M(t) ? t.displayName || t.name : t.name || e && t.__name;
}
function vn(t, e, n = !1) {
	let o = mr(e);
	if (!o && e.__file) {
		const r = e.__file.match(/([^/\\]+)\.\w+$/);
		r && (o = r[1]);
	}
	if (!o && t) {
		const r = (i) => {
			for (const s in i) if (i[s] === e) return s;
		};
		o = r(t.components) || t.parent && r(t.parent.type.components) || r(t.appContext.components);
	}
	return o ? vl(o) : n ? "App" : "Anonymous";
}
function Ts(t) {
	return M(t) && "__vccOpts" in t;
}
var St = (t, e) => {
	const n = Ma(t, e, cn);
	if (f.NODE_ENV !== "production") {
		const o = zs();
		o && o.appContext.config.warnRecursiveComputed && (n._warnRecursive = !0);
	}
	return n;
};
function xl(t, e, n) {
	try {
		Jn(-1);
		const o = arguments.length;
		return o === 2 ? L(e) && !C(e) ? Fe(e) ? rt(t, null, [e]) : rt(t, e) : rt(t, null, e) : (o > 3 ? n = Array.prototype.slice.call(arguments, 2) : o === 3 && Fe(n) && (n = [n]), rt(t, e, n));
	} finally {
		Jn(1);
	}
}
function wl() {
	if (f.NODE_ENV === "production" || typeof window > "u") return;
	const t = { style: "color:#3ba776" }, e = { style: "color:#1677ff" }, n = { style: "color:#f5222d" }, o = { style: "color:#eb2f96" }, r = {
		__vue_custom_formatter: !0,
		header(c) {
			if (!L(c)) return null;
			if (c.__isVue) return [
				"div",
				t,
				"VueInstance"
			];
			if (et(c)) {
				At();
				const g = c.value;
				return It(), [
					"div",
					{},
					[
						"span",
						t,
						d(c)
					],
					"<",
					a(g),
					">"
				];
			} else {
				if (de(c)) return [
					"div",
					{},
					[
						"span",
						t,
						gt(c) ? "ShallowReactive" : "Reactive"
					],
					"<",
					a(c),
					`>${Pt(c) ? " (readonly)" : ""}`
				];
				if (Pt(c)) return [
					"div",
					{},
					[
						"span",
						t,
						gt(c) ? "ShallowReadonly" : "Readonly"
					],
					"<",
					a(c),
					">"
				];
			}
			return null;
		},
		hasBody(c) {
			return c && c.__isVue;
		},
		body(c) {
			if (c && c.__isVue) return [
				"div",
				{},
				...i(c.$)
			];
		}
	};
	function i(c) {
		const g = [];
		c.type.props && c.props && g.push(s("props", $(c.props))), c.setupState !== B && g.push(s("setup", c.setupState)), c.data !== B && g.push(s("data", $(c.data)));
		const x = u(c, "computed");
		x && g.push(s("computed", x));
		const T = u(c, "inject");
		return T && g.push(s("injected", T)), g.push([
			"div",
			{},
			[
				"span",
				{ style: o.style + ";opacity:0.66" },
				"$ (internal): "
			],
			["object", { object: c }]
		]), g;
	}
	function s(c, g) {
		return g = X({}, g), Object.keys(g).length ? [
			"div",
			{ style: "line-height:1.25em;margin-bottom:0.6em" },
			[
				"div",
				{ style: "color:#476582" },
				c
			],
			[
				"div",
				{ style: "padding-left:1.25em" },
				...Object.keys(g).map((x) => [
					"div",
					{},
					[
						"span",
						o,
						x + ": "
					],
					a(g[x], !1)
				])
			]
		] : ["span", {}];
	}
	function a(c, g = !0) {
		return typeof c == "number" ? [
			"span",
			e,
			c
		] : typeof c == "string" ? [
			"span",
			n,
			JSON.stringify(c)
		] : typeof c == "boolean" ? [
			"span",
			o,
			c
		] : L(c) ? ["object", { object: g ? $(c) : c }] : [
			"span",
			n,
			String(c)
		];
	}
	function u(c, g) {
		const x = c.type;
		if (M(x)) return;
		const T = {};
		for (const S in c.ctx) h(x, S, g) && (T[S] = c.ctx[S]);
		return T;
	}
	function h(c, g, x) {
		const T = c[x];
		if (C(T) && T.includes(g) || L(T) && g in T || c.extends && h(c.extends, g, x) || c.mixins && c.mixins.some((S) => h(S, g, x))) return !0;
	}
	function d(c) {
		return gt(c) ? "ShallowRef" : c.effect ? "ComputedRef" : "Ref";
	}
	window.devtoolsFormatters ? window.devtoolsFormatters.push(r) : window.devtoolsFormatters = [r];
}
var Yr = "3.5.26";
var zt = f.NODE_ENV !== "production" ? k : ot;
var ct = {};
var Fo;
var Xr = typeof window < "u" && window.trustedTypes;
if (Xr) try {
	Fo = /* @__PURE__ */ Xr.createPolicy("vue", { createHTML: (t) => t });
} catch (t) {
	ct.NODE_ENV !== "production" && zt(`Error creating trusted types policy: ${t}`);
}
var js = Fo ? (t) => Fo.createHTML(t) : (t) => t;
var El = "http://www.w3.org/2000/svg";
var kl = "http://www.w3.org/1998/Math/MathML";
var Qt = typeof document < "u" ? document : null;
var Zr = Qt && /* @__PURE__ */ Qt.createElement("template");
var Nl = {
	insert: (t, e, n) => {
		e.insertBefore(t, n || null);
	},
	remove: (t) => {
		const e = t.parentNode;
		e && e.removeChild(t);
	},
	createElement: (t, e, n, o) => {
		const r = e === "svg" ? Qt.createElementNS(El, t) : e === "mathml" ? Qt.createElementNS(kl, t) : n ? Qt.createElement(t, { is: n }) : Qt.createElement(t);
		return t === "select" && o && o.multiple != null && r.setAttribute("multiple", o.multiple), r;
	},
	createText: (t) => Qt.createTextNode(t),
	createComment: (t) => Qt.createComment(t),
	setText: (t, e) => {
		t.nodeValue = e;
	},
	setElementText: (t, e) => {
		t.textContent = e;
	},
	parentNode: (t) => t.parentNode,
	nextSibling: (t) => t.nextSibling,
	querySelector: (t) => Qt.querySelector(t),
	setScopeId(t, e) {
		t.setAttribute(e, "");
	},
	insertStaticContent(t, e, n, o, r, i) {
		const s = n ? n.previousSibling : e.lastChild;
		if (r && (r === i || r.nextSibling)) for (; e.insertBefore(r.cloneNode(!0), n), !(r === i || !(r = r.nextSibling)););
		else {
			Zr.innerHTML = js(o === "svg" ? `<svg>${t}</svg>` : o === "mathml" ? `<math>${t}</math>` : t);
			const a = Zr.content;
			if (o === "svg" || o === "mathml") {
				const u = a.firstChild;
				for (; u.firstChild;) a.appendChild(u.firstChild);
				a.removeChild(u);
			}
			e.insertBefore(a, n);
		}
		return [s ? s.nextSibling : e.firstChild, n ? n.previousSibling : e.lastChild];
	}
};
var Ol = /* @__PURE__ */ Symbol("_vtc");
function Sl(t, e, n) {
	const o = t[Ol];
	o && (e = (e ? [e, ...o] : [...o]).join(" ")), e == null ? t.removeAttribute("class") : n ? t.setAttribute("class", e) : t.className = e;
}
var Qr = /* @__PURE__ */ Symbol("_vod");
var Cl = /* @__PURE__ */ Symbol("_vsh");
var Dl = /* @__PURE__ */ Symbol(ct.NODE_ENV !== "production" ? "CSS_VAR_TEXT" : "");
var zl = /(?:^|;)\s*display\s*:/;
function Vl(t, e, n) {
	const o = t.style, r = J(n);
	let i = !1;
	if (n && !r) {
		if (e) if (J(e)) for (const s of e.split(";")) {
			const a = s.slice(0, s.indexOf(":")).trim();
			n[a] ?? $n(o, a, "");
		}
		else for (const s in e) n[s] ?? $n(o, s, "");
		for (const s in n) s === "display" && (i = !0), $n(o, s, n[s]);
	} else if (r) {
		if (e !== n) {
			const s = o[Dl];
			s && (n += ";" + s), o.cssText = n, i = zl.test(n);
		}
	} else e && t.removeAttribute("style");
	Qr in t && (t[Qr] = i ? o.display : "", t[Cl] && (o.display = "none"));
}
var Ml = /[^\\];\s*$/;
var ti = /\s*!important$/;
function $n(t, e, n) {
	if (C(n)) n.forEach((o) => $n(t, e, o));
	else if (n ??= "", ct.NODE_ENV !== "production" && Ml.test(n) && zt(`Unexpected semicolon at the end of '${e}' style value: '${n}'`), e.startsWith("--")) t.setProperty(e, n);
	else {
		const o = Tl(t, e);
		ti.test(n) ? t.setProperty(kt(o), n.replace(ti, ""), "important") : t[o] = n;
	}
}
var ei = [
	"Webkit",
	"Moz",
	"ms"
];
var Eo = {};
function Tl(t, e) {
	const n = Eo[e];
	if (n) return n;
	let o = at(e);
	if (o !== "filter" && o in t) return Eo[e] = o;
	o = Ee(o);
	for (let r = 0; r < ei.length; r++) {
		const i = ei[r] + o;
		if (i in t) return Eo[e] = i;
	}
	return e;
}
var ni = "http://www.w3.org/1999/xlink";
function oi(t, e, n, o, r, i = ra(e)) {
	o && e.startsWith("xlink:") ? n == null ? t.removeAttributeNS(ni, e.slice(6, e.length)) : t.setAttributeNS(ni, e, n) : n == null || i && !wi(n) ? t.removeAttribute(e) : t.setAttribute(e, i ? "" : Jt(n) ? String(n) : n);
}
function ri(t, e, n, o, r) {
	if (e === "innerHTML" || e === "textContent") {
		n != null && (t[e] = e === "innerHTML" ? js(n) : n);
		return;
	}
	const i = t.tagName;
	if (e === "value" && i !== "PROGRESS" && !i.includes("-")) {
		const a = i === "OPTION" ? t.getAttribute("value") || "" : t.value, u = n == null ? t.type === "checkbox" ? "on" : "" : String(n);
		(a !== u || !("_value" in t)) && (t.value = u), n ?? t.removeAttribute(e), t._value = n;
		return;
	}
	let s = !1;
	if (n === "" || n == null) {
		const a = typeof t[e];
		a === "boolean" ? n = wi(n) : n == null && a === "string" ? (n = "", s = !0) : a === "number" && (n = 0, s = !0);
	}
	try {
		t[e] = n;
	} catch (a) {
		ct.NODE_ENV !== "production" && !s && zt(`Failed setting prop "${e}" on <${i.toLowerCase()}>: value ${n} is invalid.`, a);
	}
	s && t.removeAttribute(r || e);
}
function ye(t, e, n, o) {
	t.addEventListener(e, n, o);
}
function jl(t, e, n, o) {
	t.removeEventListener(e, n, o);
}
var ii = /* @__PURE__ */ Symbol("_vei");
function $l(t, e, n, o, r = null) {
	const i = t[ii] || (t[ii] = {}), s = i[e];
	if (o && s) s.value = ct.NODE_ENV !== "production" ? ai(o, e) : o;
	else {
		const [a, u] = Al(e);
		if (o) ye(t, a, i[e] = Rl(ct.NODE_ENV !== "production" ? ai(o, e) : o, r), u);
		else s && (jl(t, a, s, u), i[e] = void 0);
	}
}
var si = /(?:Once|Passive|Capture)$/;
function Al(t) {
	let e;
	if (si.test(t)) {
		e = {};
		let o;
		for (; o = t.match(si);) t = t.slice(0, t.length - o[0].length), e[o[0].toLowerCase()] = !0;
	}
	return [t[2] === ":" ? t.slice(3) : kt(t.slice(2)), e];
}
var ko = 0;
var Il = /* @__PURE__ */ Promise.resolve();
var Pl = () => ko || (Il.then(() => ko = 0), ko = Date.now());
function Rl(t, e) {
	const n = (o) => {
		if (!o._vts) o._vts = Date.now();
		else if (o._vts <= n.attached) return;
		Yt(Fl(o, n.value), e, 5, [o]);
	};
	return n.value = t, n.attached = Pl(), n;
}
function ai(t, e) {
	return M(t) || C(t) ? t : (zt(`Wrong type passed as event handler to ${e} - did you forget @ or : in front of your prop?
Expected function or array of functions, received type ${typeof t}.`), ot);
}
function Fl(t, e) {
	if (C(e)) {
		const n = t.stopImmediatePropagation;
		return t.stopImmediatePropagation = () => {
			n.call(t), t._stopped = !0;
		}, e.map((o) => (r) => !r._stopped && o && o(r));
	} else return e;
}
var ui = (t) => t.charCodeAt(0) === 111 && t.charCodeAt(1) === 110 && t.charCodeAt(2) > 96 && t.charCodeAt(2) < 123;
var Ll = (t, e, n, o, r, i) => {
	const s = r === "svg";
	e === "class" ? Sl(t, o, s) : e === "style" ? Vl(t, n, o) : dn(e) ? In(e) || $l(t, e, n, o, i) : (e[0] === "." ? (e = e.slice(1), !0) : e[0] === "^" ? (e = e.slice(1), !1) : Ul(t, e, o, s)) ? (ri(t, e, o), !t.tagName.includes("-") && (e === "value" || e === "checked" || e === "selected") && oi(t, e, o, s, i, e !== "value")) : t._isVueCE && (/[A-Z]/.test(e) || !J(o)) ? ri(t, at(e), o, i, e) : (e === "true-value" ? t._trueValue = o : e === "false-value" && (t._falseValue = o), oi(t, e, o, s));
};
function Ul(t, e, n, o) {
	if (o) return !!(e === "innerHTML" || e === "textContent" || e in t && ui(e) && M(n));
	if (e === "spellcheck" || e === "draggable" || e === "translate" || e === "autocorrect" || e === "sandbox" && t.tagName === "IFRAME" || e === "form" || e === "list" && t.tagName === "INPUT" || e === "type" && t.tagName === "TEXTAREA") return !1;
	if (e === "width" || e === "height") {
		const r = t.tagName;
		if (r === "IMG" || r === "VIDEO" || r === "CANVAS" || r === "SOURCE") return !1;
	}
	return ui(e) && J(n) ? !1 : e in t;
}
var li = {};
// @__NO_SIDE_EFFECTS__
function Hl(t, e, n) {
	let o = /* @__PURE__ */ Ct(t, e);
	Qn(o) && (o = X({}, o, e));
	class r extends yr {
		constructor(s) {
			super(o, s, n);
		}
	}
	return r.def = o, r;
}
var Bl = typeof HTMLElement < "u" ? HTMLElement : class {};
var yr = class yr extends Bl {
	constructor(e, n = {}, o = Lo) {
		super(), this._def = e, this._props = n, this._createApp = o, this._isVueCE = !0, this._instance = null, this._app = null, this._nonce = this._def.nonce, this._connected = !1, this._resolved = !1, this._patching = !1, this._dirty = !1, this._numberProps = null, this._styleChildren = /* @__PURE__ */ new WeakSet(), this._ob = null, this.shadowRoot && o !== Lo ? this._root = this.shadowRoot : (ct.NODE_ENV !== "production" && this.shadowRoot && zt("Custom element has pre-rendered declarative shadow root but is not defined as hydratable. Use `defineSSRCustomElement`."), e.shadowRoot !== !1 ? (this.attachShadow(X({}, e.shadowRootOptions, { mode: "open" })), this._root = this.shadowRoot) : this._root = this);
	}
	connectedCallback() {
		if (!this.isConnected) return;
		!this.shadowRoot && !this._resolved && this._parseSlots(), this._connected = !0;
		let e = this;
		for (; e = e && (e.parentNode || e.host);) if (e instanceof yr) {
			this._parent = e;
			break;
		}
		this._instance || (this._resolved ? this._mount(this._def) : e && e._pendingResolve ? this._pendingResolve = e._pendingResolve.then(() => {
			this._pendingResolve = void 0, this._resolveDef();
		}) : this._resolveDef());
	}
	_setParent(e = this._parent) {
		e && (this._instance.parent = e._instance, this._inheritParentContext(e));
	}
	_inheritParentContext(e = this._parent) {
		e && this._app && Object.setPrototypeOf(this._app._context.provides, e._instance.provides);
	}
	disconnectedCallback() {
		this._connected = !1, Ki(() => {
			this._connected || (this._ob && (this._ob.disconnect(), this._ob = null), this._app && this._app.unmount(), this._instance && (this._instance.ce = void 0), this._app = this._instance = null, this._teleportTargets && (this._teleportTargets.clear(), this._teleportTargets = void 0));
		});
	}
	_processMutations(e) {
		for (const n of e) this._setAttr(n.attributeName);
	}
	/**
	* resolve inner component definition (handle possible async component)
	*/
	_resolveDef() {
		if (this._pendingResolve) return;
		for (let o = 0; o < this.attributes.length; o++) this._setAttr(this.attributes[o].name);
		this._ob = new MutationObserver(this._processMutations.bind(this)), this._ob.observe(this, { attributes: !0 });
		const e = (o, r = !1) => {
			this._resolved = !0, this._pendingResolve = void 0;
			const { props: i, styles: s } = o;
			let a;
			if (i && !C(i)) for (const u in i) {
				const h = i[u];
				(h === Number || h && h.type === Number) && (u in this._props && (this._props[u] = Or(this._props[u])), (a || (a = /* @__PURE__ */ Object.create(null)))[at(u)] = !0);
			}
			this._numberProps = a, this._resolveProps(o), this.shadowRoot ? this._applyStyles(s) : ct.NODE_ENV !== "production" && s && zt("Custom element style injection is not supported when using shadowRoot: false"), this._mount(o);
		}, n = this._def.__asyncLoader;
		n ? this._pendingResolve = n().then((o) => {
			o.configureApp = this._def.configureApp, e(this._def = o, !0);
		}) : e(this._def);
	}
	_mount(e) {
		ct.NODE_ENV !== "production" && !e.name && (e.name = "VueElement"), this._app = this._createApp(e), this._inheritParentContext(), e.configureApp && e.configureApp(this._app), this._app._ceVNode = this._createVNode(), this._app.mount(this._root);
		const n = this._instance && this._instance.exposed;
		if (n) for (const o in n) I(this, o) ? ct.NODE_ENV !== "production" && zt(`Exposed property "${o}" already exists on custom element.`) : Object.defineProperty(this, o, { get: () => Fn(n[o]) });
	}
	_resolveProps(e) {
		const { props: n } = e, o = C(n) ? n : Object.keys(n || {});
		for (const r of Object.keys(this)) r[0] !== "_" && o.includes(r) && this._setProp(r, this[r]);
		for (const r of o.map(at)) Object.defineProperty(this, r, {
			get() {
				return this._getProp(r);
			},
			set(i) {
				this._setProp(r, i, !0, !this._patching);
			}
		});
	}
	_setAttr(e) {
		if (e.startsWith("data-v-")) return;
		const n = this.hasAttribute(e);
		let o = n ? this.getAttribute(e) : li;
		const r = at(e);
		n && this._numberProps && this._numberProps[r] && (o = Or(o)), this._setProp(r, o, !1, !0);
	}
	/**
	* @internal
	*/
	_getProp(e) {
		return this._props[e];
	}
	/**
	* @internal
	*/
	_setProp(e, n, o = !0, r = !1) {
		if (n !== this._props[e] && (this._dirty = !0, n === li ? delete this._props[e] : (this._props[e] = n, e === "key" && this._app && (this._app._ceVNode.key = n)), r && this._instance && this._update(), o)) {
			const i = this._ob;
			i && (this._processMutations(i.takeRecords()), i.disconnect()), n === !0 ? this.setAttribute(kt(e), "") : typeof n == "string" || typeof n == "number" ? this.setAttribute(kt(e), n + "") : n || this.removeAttribute(kt(e)), i && i.observe(this, { attributes: !0 });
		}
	}
	_update() {
		const e = this._createVNode();
		this._app && (e.appContext = this._app._context), Jl(e, this._root);
	}
	_createVNode() {
		const e = {};
		this.shadowRoot || (e.onVnodeMounted = e.onVnodeUpdated = this._renderSlots.bind(this));
		const n = rt(this._def, X(e, this._props));
		return this._instance || (n.ce = (o) => {
			this._instance = o, o.ce = this, o.isCE = !0, ct.NODE_ENV !== "production" && (o.ceReload = (i) => {
				this._styles && (this._styles.forEach((s) => this._root.removeChild(s)), this._styles.length = 0), this._applyStyles(i), this._instance = null, this._update();
			});
			const r = (i, s) => {
				this.dispatchEvent(new CustomEvent(i, Qn(s[0]) ? X({ detail: s }, s[0]) : { detail: s }));
			};
			o.emit = (i, ...s) => {
				r(i, s), kt(i) !== i && r(kt(i), s);
			}, this._setParent();
		}), n;
	}
	_applyStyles(e, n) {
		if (!e) return;
		if (n) {
			if (n === this._def || this._styleChildren.has(n)) return;
			this._styleChildren.add(n);
		}
		const o = this._nonce;
		for (let r = e.length - 1; r >= 0; r--) {
			const i = document.createElement("style");
			if (o && i.setAttribute("nonce", o), i.textContent = e[r], this.shadowRoot.prepend(i), ct.NODE_ENV !== "production") if (n) {
				if (n.__hmrId) {
					this._childStyles || (this._childStyles = /* @__PURE__ */ new Map());
					let s = this._childStyles.get(n.__hmrId);
					s || this._childStyles.set(n.__hmrId, s = []), s.push(i);
				}
			} else (this._styles || (this._styles = [])).push(i);
		}
	}
	/**
	* Only called when shadowRoot is false
	*/
	_parseSlots() {
		const e = this._slots = {};
		let n;
		for (; n = this.firstChild;) {
			const o = n.nodeType === 1 && n.getAttribute("slot") || "default";
			(e[o] || (e[o] = [])).push(n), this.removeChild(n);
		}
	}
	/**
	* Only called when shadowRoot is false
	*/
	_renderSlots() {
		const e = this._getSlots(), n = this._instance.type.__scopeId;
		for (let o = 0; o < e.length; o++) {
			const r = e[o], i = r.getAttribute("name") || "default", s = this._slots[i], a = r.parentNode;
			if (s) for (const u of s) {
				if (n && u.nodeType === 1) {
					const h = n + "-s", d = document.createTreeWalker(u, 1);
					u.setAttribute(h, "");
					let c;
					for (; c = d.nextNode();) c.setAttribute(h, "");
				}
				a.insertBefore(u, r);
			}
			else for (; r.firstChild;) a.insertBefore(r.firstChild, r);
			a.removeChild(r);
		}
	}
	/**
	* @internal
	*/
	_getSlots() {
		const e = [this];
		this._teleportTargets && e.push(...this._teleportTargets);
		const n = /* @__PURE__ */ new Set();
		for (const o of e) {
			const r = o.querySelectorAll("slot");
			for (let i = 0; i < r.length; i++) n.add(r[i]);
		}
		return Array.from(n);
	}
	/**
	* @internal
	*/
	_injectChildStyle(e) {
		this._applyStyles(e.styles, e);
	}
	/**
	* @internal
	*/
	_beginPatch() {
		this._patching = !0, this._dirty = !1;
	}
	/**
	* @internal
	*/
	_endPatch() {
		this._patching = !1, this._dirty && this._instance && this._update();
	}
	/**
	* @internal
	*/
	_removeChildStyle(e) {
		if (ct.NODE_ENV !== "production" && (this._styleChildren.delete(e), this._childStyles && e.__hmrId)) {
			const n = this._childStyles.get(e.__hmrId);
			n && (n.forEach((o) => this._root.removeChild(o)), n.length = 0);
		}
	}
};
var Xn = (t) => {
	const e = t.props["onUpdate:modelValue"] || !1;
	return C(e) ? (n) => Ve(e, n) : e;
};
function Kl(t) {
	t.target.composing = !0;
}
function ci(t) {
	const e = t.target;
	e.composing && (e.composing = !1, e.dispatchEvent(new Event("input")));
}
var Ie = /* @__PURE__ */ Symbol("_assign");
function pi(t, e, n) {
	return e && (t = t.trim()), n && (t = Qo(t)), t;
}
var pn = {
	created(t, { modifiers: { lazy: e, trim: n, number: o } }, r) {
		t[Ie] = Xn(r);
		const i = o || r.props && r.props.type === "number";
		ye(t, e ? "change" : "input", (s) => {
			s.target.composing || t[Ie](pi(t.value, n, i));
		}), (n || i) && ye(t, "change", () => {
			t.value = pi(t.value, n, i);
		}), e || (ye(t, "compositionstart", Kl), ye(t, "compositionend", ci), ye(t, "change", ci));
	},
	mounted(t, { value: e }) {
		t.value = e ?? "";
	},
	beforeUpdate(t, { value: e, oldValue: n, modifiers: { lazy: o, trim: r, number: i } }, s) {
		if (t[Ie] = Xn(s), t.composing) return;
		const a = (i || t.type === "number") && !/^0\d/.test(t.value) ? Qo(t.value) : t.value, u = e ?? "";
		a !== u && (document.activeElement === t && t.type !== "range" && (o && e === n || r && t.value.trim() === u) || (t.value = u));
	}
};
var Wl = {
	deep: !0,
	created(t, e, n) {
		t[Ie] = Xn(n), ye(t, "change", () => {
			const o = t._modelValue, r = ql(t), i = t.checked, s = t[Ie];
			if (C(o)) {
				const a = Ei(o, r), u = a !== -1;
				if (i && !u) s(o.concat(r));
				else if (!i && u) {
					const h = [...o];
					h.splice(a, 1), s(h);
				}
			} else if (Zn(o)) {
				const a = new Set(o);
				i ? a.add(r) : a.delete(r), s(a);
			} else s($s(t, i));
		});
	},
	mounted: di,
	beforeUpdate(t, e, n) {
		t[Ie] = Xn(n), di(t, e, n);
	}
};
function di(t, { value: e, oldValue: n }, o) {
	t._modelValue = e;
	let r;
	if (C(e)) r = Ei(e, o.props.value) > -1;
	else if (Zn(e)) r = e.has(o.props.value);
	else {
		if (e === n) return;
		r = eo(e, $s(t, !0));
	}
	t.checked !== r && (t.checked = r);
}
function ql(t) {
	return "_value" in t ? t._value : t.value;
}
function $s(t, e) {
	const n = e ? "_trueValue" : "_falseValue";
	return n in t ? t[n] : e;
}
var Gl = /* @__PURE__ */ X({ patchProp: Ll }, Nl);
var fi;
function As() {
	return fi || (fi = tl(Gl));
}
var Jl = ((...t) => {
	As().render(...t);
});
var Lo = ((...t) => {
	const e = As().createApp(...t);
	ct.NODE_ENV !== "production" && (Xl(e), Zl(e));
	const { mount: n } = e;
	return e.mount = (o) => {
		const r = Ql(o);
		if (!r) return;
		const i = e._component;
		!M(i) && !i.render && !i.template && (i.template = r.innerHTML), r.nodeType === 1 && (r.textContent = "");
		const s = n(r, !1, Yl(r));
		return r instanceof Element && (r.removeAttribute("v-cloak"), r.setAttribute("data-v-app", "")), s;
	}, e;
});
function Yl(t) {
	if (t instanceof SVGElement) return "svg";
	if (typeof MathMLElement == "function" && t instanceof MathMLElement) return "mathml";
}
function Xl(t) {
	Object.defineProperty(t.config, "isNativeTag", {
		value: (e) => ta(e) || ea(e) || na(e),
		writable: !1
	});
}
function Zl(t) {
	{
		const e = t.config.isCustomElement;
		Object.defineProperty(t.config, "isCustomElement", {
			get() {
				return e;
			},
			set() {
				zt("The `isCustomElement` config option is deprecated. Use `compilerOptions.isCustomElement` instead.");
			}
		});
		const n = t.config.compilerOptions, o = "The `compilerOptions` config option is only respected when using a build of Vue.js that includes the runtime compiler (aka \"full build\"). Since you are using the runtime-only build, `compilerOptions` must be passed to `@vue/compiler-dom` in the build setup instead.\n- For vue-loader: pass it via vue-loader's `compilerOptions` loader option.\n- For vue-cli: see https://cli.vuejs.org/guide/webpack.html#modifying-options-of-a-loader\n- For vite: pass it via @vitejs/plugin-vue options. See https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue#example-for-passing-options-to-vuecompiler-sfc";
		Object.defineProperty(t.config, "compilerOptions", {
			get() {
				return zt(o), n;
			},
			set() {
				zt(o);
			}
		});
	}
}
function Ql(t) {
	if (J(t)) {
		const e = document.querySelector(t);
		return ct.NODE_ENV !== "production" && !e && zt(`Failed to mount app: mount target selector "${t}" returned null.`), e;
	}
	return ct.NODE_ENV !== "production" && window.ShadowRoot && t instanceof window.ShadowRoot && t.mode === "closed" && zt("mounting on a ShadowRoot with `{mode: \"closed\"}` may lead to unpredictable bugs"), t;
}
var tc = {};
function ec() {
	wl();
}
tc.NODE_ENV !== "production" && ec();
var nc = {
	key: 0,
	class: "uno-7liy0l"
};
var oc = /* @__PURE__ */ Ct({
	__name: "badge",
	props: {
		state: { type: null },
		group: { type: Object }
	},
	setup(t) {
		const e = t, n = St(() => e.group.content[0]);
		function o(s) {
			return St(() => new Function("state", `${s}`)(e.state));
		}
		const r = o(n.value?.vif || ""), i = o(n.value?.text || "");
		return (s, a) => Fn(r) ? (W(), Z("span", nc, Le(Fn(i)), 1)) : Ne("", !0);
	}
});
var rc = "*,:before,:after{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }::backdrop{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:var(--un-default-border-color, #e5e7eb)}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\",Segoe UI Symbol,\"Noto Color Emoji\";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,[type=button],[type=reset],[type=submit]{-webkit-appearance:button;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}.uno-7liy0l{border-width:2px!important;--un-border-opacity:1 !important;border-color:rgb(63 63 70 / var(--un-border-opacity))!important;--un-bg-opacity:1 !important;background-color:rgb(0 0 0 / var(--un-bg-opacity))!important;padding:4px!important;font-size:12px!important;line-height:16px!important;--un-text-opacity:1 !important;color:rgb(255 255 255 / var(--un-text-opacity))!important;font-weight:600!important;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace!important}[data-theme=dark] .uno-7liy0l{--un-border-opacity:1 !important;border-color:rgb(63 63 70 / var(--un-border-opacity))!important;--un-bg-opacity:1 !important;background-color:rgb(55 65 81 / var(--un-bg-opacity))!important;--un-text-opacity:1 !important;color:rgb(203 213 225 / var(--un-text-opacity))!important}.fixed{position:fixed!important}.bottom-0{bottom:0!important}.left-0{left:0!important}.right-0{right:0!important}.top-0{top:0!important}";
var ut = (t, e) => {
	const n = t.__vccOpts || t;
	for (const [o, r] of e) n[o] = r;
	return n;
};
var ic = /* @__PURE__ */ ut(oc, [["styles", [rc]]]);
var sc = {};
var ac = {
	xmlns: "http://www.w3.org/2000/svg",
	width: "24",
	height: "24",
	viewBox: "0 0 24 24"
};
function uc(t, e) {
	return W(), Z("svg", ac, [...e[0] || (e[0] = [Q("path", {
		fill: "none",
		stroke: "currentColor",
		"stroke-linecap": "round",
		"stroke-linejoin": "round",
		"stroke-width": "2",
		d: "M5 12h14"
	}, null, -1)])]);
}
var lc = /* @__PURE__ */ ut(sc, [["render", uc]]);
var cc = {};
var pc = {
	xmlns: "http://www.w3.org/2000/svg",
	width: "24",
	height: "24",
	viewBox: "0 0 24 24"
};
function dc(t, e) {
	return W(), Z("svg", pc, [...e[0] || (e[0] = [Q("g", {
		fill: "none",
		stroke: "currentColor",
		"stroke-linecap": "round",
		"stroke-linejoin": "round",
		"stroke-width": "2"
	}, [Q("circle", {
		cx: "12",
		cy: "12",
		r: "4"
	}), Q("path", { d: "M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" })], -1)])]);
}
var fc = /* @__PURE__ */ ut(cc, [["render", dc]]);
var hc = { class: "uno-r5eg4i" };
var bc = { class: "uno-bzl8yv" };
var gc = { class: "uno-sol10l" };
var mc = { class: "uno-0qwcsd" };
var vc = /* @__PURE__ */ ut(/* @__PURE__ */ Ct({
	__name: "header",
	props: {
		state: { type: null },
		scheme: { type: Array },
		title: { type: String }
	},
	setup(t) {
		const e = t, n = St(() => e.scheme.find((o) => o.title === "Badge"));
		return (o, r) => (W(), Z("div", hc, [Q("div", bc, [n.value ? (W(), He(ic, {
			key: 0,
			state: e.state,
			group: n.value
		}, null, 8, ["state", "group"])) : Ne("", !0), Q("span", gc, Le(t.title), 1)]), Q("div", mc, [rt(fc, {
			class: "uno-nm789l",
			onClick: r[0] || (r[0] = (i) => e.state.darkmode = !e.state.darkmode)
		}), rt(lc, {
			class: "uno-nm789l",
			onClick: r[1] || (r[1] = (i) => e.state.collapsed = !e.state.collapsed)
		})])]));
	}
}), [["styles", ["*,:before,:after{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }::backdrop{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:var(--un-default-border-color, #e5e7eb)}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\",Segoe UI Symbol,\"Noto Color Emoji\";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,[type=button],[type=reset],[type=submit]{-webkit-appearance:button;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}.uno-0qwcsd{display:flex!important;gap:8px!important}.uno-bzl8yv{display:flex!important;align-items:center!important;gap:8px!important}.uno-r5eg4i{display:flex!important;-webkit-user-select:none!important;user-select:none!important;align-items:center!important;justify-content:space-between!important;border-bottom-width:2px!important;--un-border-opacity:1 !important;border-color:rgb(0 0 0 / var(--un-border-opacity))!important;--un-bg-opacity:1 !important;background-color:rgb(255 255 255 / var(--un-bg-opacity))!important;padding:8px!important;font-size:18px!important;line-height:28px!important;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke!important;transition-timing-function:cubic-bezier(.4,0,.2,1)!important;transition-duration:.15s!important}.uno-nm789l{cursor:pointer!important;font-size:18px!important;line-height:28px!important;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke!important;transition-timing-function:cubic-bezier(.4,0,.2,1)!important;transition-duration:.15s!important}[data-theme=dark] .uno-r5eg4i{--un-border-opacity:1 !important;border-color:rgb(55 65 81 / var(--un-border-opacity))!important;--un-bg-opacity:1 !important;background-color:rgb(39 39 42 / var(--un-bg-opacity))!important;--un-text-opacity:1 !important;color:rgb(212 212 216 / var(--un-text-opacity))!important}.uno-r5eg4i:hover{--un-bg-opacity:1 !important;background-color:rgb(229 231 235 / var(--un-bg-opacity))!important}[data-theme=dark] .uno-r5eg4i:hover{--un-bg-opacity:1 !important;background-color:rgb(75 85 99 / var(--un-bg-opacity))!important}.uno-sol10l{font-size:16px!important;line-height:24px!important;font-weight:500!important;letter-spacing:.1em!important;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace!important}.uno-nm789l:hover{--un-text-opacity:1 !important;color:rgb(107 114 128 / var(--un-text-opacity))!important}.fixed{position:fixed!important}.bottom-0{bottom:0!important}.left-0{left:0!important}.right-0{right:0!important}.top-0{top:0!important}"]]]);
var xc = {};
var wc = {
	xmlns: "http://www.w3.org/2000/svg",
	width: "24",
	height: "24",
	viewBox: "0 0 24 24"
};
function Ec(t, e) {
	return W(), Z("svg", wc, [...e[0] || (e[0] = [Q("path", {
		fill: "none",
		stroke: "currentColor",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		strokeWidth: "2",
		d: "m6 9l6 6l6-6"
	}, null, -1)])]);
}
var kc = /* @__PURE__ */ ut(xc, [["render", Ec]]);
var Nc = {};
var Oc = {
	xmlns: "http://www.w3.org/2000/svg",
	width: "24",
	height: "24",
	viewBox: "0 0 24 24"
};
function Sc(t, e) {
	return W(), Z("svg", Oc, [...e[0] || (e[0] = [Q("path", {
		fill: "none",
		stroke: "currentColor",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		strokeWidth: "2",
		d: "m18 15l-6-6l-6 6"
	}, null, -1)])]);
}
var Cc = /* @__PURE__ */ ut(Nc, [["render", Sc]]);
var Vc = /* @__PURE__ */ ut(/* @__PURE__ */ Ct({
	__name: "chevron",
	props: { collapsed: { type: Boolean } },
	setup(t) {
		const e = t, n = St(() => e.collapsed ? kc : Cc);
		return (o, r) => (W(), He(us(n.value), { class: "uno-iyw1ix text---muted-foreground" }));
	}
}), [["styles", ["*,:before,:after{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }::backdrop{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:var(--un-default-border-color, #e5e7eb)}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\",Segoe UI Symbol,\"Noto Color Emoji\";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,[type=button],[type=reset],[type=submit]{-webkit-appearance:button;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}.uno-iyw1ix{font-size:14px!important;line-height:20px!important}.fixed{position:fixed!important}.bottom-0{bottom:0!important}.left-0{left:0!important}.right-0{right:0!important}.top-0{top:0!important}"]]]);
var Mc = { class: "uno-e7a42m" };
var $c = /* @__PURE__ */ ut(/* @__PURE__ */ Ct({
	__name: "button",
	props: {
		state: { type: null },
		element: { type: Object }
	},
	setup(t) {
		const e = t;
		return (n, o) => (W(), Z("div", Mc, [Q("button", {
			type: "button",
			onClick: o[0] || (o[0] = (...r) => e.element.callback && e.element.callback(...r)),
			class: "uno-ylxvnf"
		}, Le(e.element.name), 1)]));
	}
}), [["styles", ["*,:before,:after{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }::backdrop{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:var(--un-default-border-color, #e5e7eb)}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\",Segoe UI Symbol,\"Noto Color Emoji\";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,[type=button],[type=reset],[type=submit]{-webkit-appearance:button;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}.uno-e7a42m{grid-column:1/-1!important}.uno-ylxvnf{box-sizing:border-box!important;width:100%!important;cursor:pointer!important;border-width:2px!important;--un-border-opacity:1 !important;border-color:rgb(0 0 0 / var(--un-border-opacity))!important;--un-bg-opacity:1 !important;background-color:rgb(255 255 255 / var(--un-bg-opacity))!important;padding:2px!important;font-size:14px!important;line-height:20px!important;font-weight:500!important;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace!important}[data-theme=dark] .uno-ylxvnf{--un-border-opacity:1 !important;border-color:rgb(39 39 42 / var(--un-border-opacity))!important;--un-bg-opacity:1 !important;background-color:rgb(75 85 99 / var(--un-bg-opacity))!important;--un-text-opacity:1 !important;color:rgb(212 212 216 / var(--un-text-opacity))!important}.uno-ylxvnf:hover{--un-bg-opacity:1 !important;background-color:rgb(0 0 0 / var(--un-bg-opacity))!important;--un-text-opacity:1 !important;color:rgb(255 255 255 / var(--un-text-opacity))!important}[data-theme=dark] .uno-ylxvnf:hover{--un-bg-opacity:1 !important;background-color:rgb(107 114 128 / var(--un-bg-opacity))!important}.fixed{position:fixed!important}.bottom-0{bottom:0!important}.left-0{left:0!important}.right-0{right:0!important}.top-0{top:0!important}"]]]);
var Ac = {};
var Ic = {
	xmlns: "http://www.w3.org/2000/svg",
	width: "24",
	height: "24",
	viewBox: "0 0 24 24"
};
function Pc(t, e) {
	return W(), Z("svg", Ic, [...e[0] || (e[0] = [Q("path", {
		fill: "none",
		stroke: "currentColor",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		strokeWidth: "2",
		d: "M20 6L9 17l-5-5"
	}, null, -1)])]);
}
var Rc = /* @__PURE__ */ ut(Ac, [["render", Pc]]);
var Fc = { class: "uno-g3pt2q" };
var Lc = { class: "uno-7ar3e0" };
var Bc = /* @__PURE__ */ ut(/* @__PURE__ */ Ct({
	__name: "input-checkbox",
	props: {
		state: { type: null },
		element: { type: Object }
	},
	setup(t) {
		const e = t, n = St(() => e.element.name);
		return (o, r) => (W(), Z("label", Fc, [Re(Q("input", {
			type: "checkbox",
			"onUpdate:modelValue": r[0] || (r[0] = (i) => e.state[n.value] = i),
			class: "peer sr-only"
		}, null, 512), [[Wl, e.state[n.value]]]), Q("span", Lc, [e.state[n.value] ? (W(), He(Rc, {
			key: 0,
			class: "uno-44ork4"
		})) : Ne("", !0)])]));
	}
}), [["styles", ["*,:before,:after{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }::backdrop{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:var(--un-default-border-color, #e5e7eb)}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\",Segoe UI Symbol,\"Noto Color Emoji\";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,[type=button],[type=reset],[type=submit]{-webkit-appearance:button;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}.uno-g3pt2q{position:relative!important;display:inline-flex!important;cursor:pointer!important;align-items:center!important}.uno-7ar3e0{box-sizing:border-box!important;height:20px!important;width:20px!important;display:flex!important;align-items:center!important;justify-content:center!important;border-width:2px!important;--un-border-opacity:1 !important;border-color:rgb(0 0 0 / var(--un-border-opacity))!important;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke!important;transition-timing-function:cubic-bezier(.4,0,.2,1)!important;transition-duration:.15s!important}.peer:checked~.uno-44ork4{display:block!important}.peer:checked~.uno-7ar3e0{--un-bg-opacity:1 !important;background-color:rgb(0 0 0 / var(--un-bg-opacity))!important}[data-theme=dark] .peer:checked~.uno-7ar3e0{--un-bg-opacity:1 !important;background-color:rgb(55 65 81 / var(--un-bg-opacity))!important}.uno-44ork4{stroke-width:2px!important;font-size:14px!important;line-height:20px!important;--un-text-opacity:1 !important;color:rgb(0 0 0 / var(--un-text-opacity))!important}.sr-only{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border-width:0!important}.fixed{position:fixed!important}.bottom-0{bottom:0!important}.left-0{left:0!important}.right-0{right:0!important}.top-0{top:0!important}"]]]);
var Kc = [
	"placeholder",
	"min",
	"max",
	"step"
];
var Gc = /* @__PURE__ */ ut(/* @__PURE__ */ Ct({
	__name: "input-number",
	props: {
		state: { type: null },
		element: { type: Object }
	},
	setup(t) {
		const e = t, n = St(() => e.element.name);
		return (o, r) => Re((W(), Z("input", {
			type: "number",
			"onUpdate:modelValue": r[0] || (r[0] = (i) => e.state[n.value] = i),
			class: "uno-dzm8ko",
			placeholder: e.element.placeholder || "",
			min: e.element.min || "",
			max: e.element.max || "",
			step: e.element.step || ""
		}, null, 8, Kc)), [[pn, e.state[n.value]]]);
	}
}), [["styles", ["*,:before,:after{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }::backdrop{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:var(--un-default-border-color, #e5e7eb)}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\",Segoe UI Symbol,\"Noto Color Emoji\";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,[type=button],[type=reset],[type=submit]{-webkit-appearance:button;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}.uno-dzm8ko{box-sizing:border-box!important;width:100%!important;border-width:2px!important;--un-border-opacity:1 !important;border-color:rgb(0 0 0 / var(--un-border-opacity))!important;padding:4px!important;font-size:14px!important;line-height:20px!important;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke!important;transition-timing-function:cubic-bezier(.4,0,.2,1)!important;transition-duration:.15s!important}[data-theme=dark] .uno-dzm8ko{--un-bg-opacity:1 !important;background-color:rgb(63 63 70 / var(--un-bg-opacity))!important;--un-text-opacity:1 !important;color:rgb(212 212 216 / var(--un-text-opacity))!important}[data-theme=dark] .uno-dzm8ko:hover{--un-bg-opacity:1 !important;background-color:rgb(82 82 91 / var(--un-bg-opacity))!important}.uno-dzm8ko:focus{--un-bg-opacity:1 !important;background-color:rgb(254 252 232 / var(--un-bg-opacity))!important;outline:2px solid transparent!important;outline-offset:2px!important}[data-theme=dark] .uno-dzm8ko:focus{--un-bg-opacity:1 !important;background-color:rgb(63 63 70 / var(--un-bg-opacity))!important;--un-outline-color-opacity:1 !important;outline-color:rgb(75 85 99 / var(--un-outline-color-opacity))!important}.fixed{position:fixed!important}.bottom-0{bottom:0!important}.left-0{left:0!important}.right-0{right:0!important}.top-0{top:0!important}"]]]);
var Jc = { class: "uno-c9kunu" };
var Qc = /* @__PURE__ */ ut(/* @__PURE__ */ Ct({
	__name: "input-range",
	props: {
		state: { type: null },
		element: { type: Object }
	},
	setup(t) {
		const e = t, n = St(() => e.element.name);
		return (o, r) => (W(), Z("div", Jc, [Re(Q("input", {
			type: "range",
			min: "0",
			max: "100",
			"onUpdate:modelValue": r[0] || (r[0] = (i) => e.state[n.value] = i),
			style: { width: "calc(100% - 30px)" },
			oninput: "this.nextElementSibling.value = this.value"
		}, null, 512), [[pn, e.state[n.value]]]), Re(Q("input", {
			type: "number",
			"onUpdate:modelValue": r[1] || (r[1] = (i) => e.state[n.value] = i),
			class: "uno-56kyll",
			oninput: "this.previousElementSibling.value = this.value"
		}, null, 512), [[pn, e.state[n.value]]])]));
	}
}), [["styles", ["input[type=range][data-v-c9c01bf9]{-webkit-appearance:none;appearance:none;height:5px;background:#000;cursor:pointer}input[type=range][data-v-c9c01bf9]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:12px;height:12px;background:#000;border:2px solid black;cursor:pointer}input[type=range][data-v-c9c01bf9]::-moz-range-thumb{width:13px;height:13px;background:#000;border:none;border-radius:0;cursor:pointer}input[type=number][data-v-c9c01bf9]::-webkit-inner-spin-button{-webkit-appearance:none}", "*,:before,:after{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }::backdrop{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:var(--un-default-border-color, #e5e7eb)}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\",Segoe UI Symbol,\"Noto Color Emoji\";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,[type=button],[type=reset],[type=submit]{-webkit-appearance:button;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}.uno-56kyll{box-sizing:border-box!important;width:80px!important;border-width:2px!important;--un-border-opacity:1 !important;border-color:rgb(0 0 0 / var(--un-border-opacity))!important;--un-bg-opacity:1 !important;background-color:rgb(255 255 255 / var(--un-bg-opacity))!important;padding:4px!important;text-align:center!important;font-size:14px!important;line-height:20px!important;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke!important;transition-timing-function:cubic-bezier(.4,0,.2,1)!important;transition-duration:.15s!important}.uno-c9kunu{display:flex!important;align-items:center!important;gap:4px!important}[data-theme=dark] .uno-56kyll{--un-bg-opacity:1 !important;background-color:rgb(63 63 70 / var(--un-bg-opacity))!important;--un-text-opacity:1 !important;color:rgb(212 212 216 / var(--un-text-opacity))!important}[data-theme=dark] .uno-56kyll:hover{--un-bg-opacity:1 !important;background-color:rgb(82 82 91 / var(--un-bg-opacity))!important}.uno-56kyll:focus{--un-bg-opacity:1 !important;background-color:rgb(254 252 232 / var(--un-bg-opacity))!important;outline:2px solid transparent!important;outline-offset:2px!important}[data-theme=dark] .uno-56kyll:focus{--un-bg-opacity:1 !important;background-color:rgb(63 63 70 / var(--un-bg-opacity))!important;--un-outline-color-opacity:1 !important;outline-color:rgb(75 85 99 / var(--un-outline-color-opacity))!important}.fixed{position:fixed!important}.bottom-0{bottom:0!important}.left-0{left:0!important}.right-0{right:0!important}.top-0{top:0!important}.border{border-width:1px!important}"]], ["__scopeId", "data-v-c9c01bf9"]]);
var tp = ["placeholder"];
var op = /* @__PURE__ */ ut(/* @__PURE__ */ Ct({
	__name: "input-text",
	props: {
		state: { type: null },
		element: { type: Object }
	},
	setup(t) {
		const e = t, n = St(() => e.element.name);
		return (o, r) => Re((W(), Z("input", {
			type: "text",
			"onUpdate:modelValue": r[0] || (r[0] = (i) => e.state[n.value] = i),
			class: "uno-dqkii9",
			placeholder: e.element.placeholder || ""
		}, null, 8, tp)), [[pn, e.state[n.value]]]);
	}
}), [["styles", ["*,:before,:after{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }::backdrop{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:var(--un-default-border-color, #e5e7eb)}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\",Segoe UI Symbol,\"Noto Color Emoji\";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,[type=button],[type=reset],[type=submit]{-webkit-appearance:button;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}.uno-dqkii9{box-sizing:border-box!important;width:100%!important;border-width:2px!important;--un-border-opacity:1 !important;border-color:rgb(0 0 0 / var(--un-border-opacity))!important;--un-bg-opacity:1 !important;background-color:rgb(255 255 255 / var(--un-bg-opacity))!important;padding:4px!important;font-size:14px!important;line-height:20px!important;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace!important;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke!important;transition-timing-function:cubic-bezier(.4,0,.2,1)!important;transition-duration:.15s!important}[data-theme=dark] .uno-dqkii9{--un-bg-opacity:1 !important;background-color:rgb(63 63 70 / var(--un-bg-opacity))!important;--un-text-opacity:1 !important;color:rgb(212 212 216 / var(--un-text-opacity))!important}.uno-dqkii9:hover{--un-bg-opacity:1 !important;background-color:rgb(243 244 246 / var(--un-bg-opacity))!important}[data-theme=dark] .uno-dqkii9:hover{--un-bg-opacity:1 !important;background-color:rgb(82 82 91 / var(--un-bg-opacity))!important}.uno-dqkii9:focus{--un-bg-opacity:1 !important;background-color:rgb(254 252 232 / var(--un-bg-opacity))!important;outline:2px solid transparent!important;outline-offset:2px!important}[data-theme=dark] .uno-dqkii9:focus{--un-bg-opacity:1 !important;background-color:rgb(63 63 70 / var(--un-bg-opacity))!important;--un-outline-color-opacity:1 !important;outline-color:rgb(75 85 99 / var(--un-outline-color-opacity))!important}.fixed{position:fixed!important}.bottom-0{bottom:0!important}.left-0{left:0!important}.right-0{right:0!important}.top-0{top:0!important}"]]]);
var rp = { class: "uno-qryapb" };
var ip = {
	key: 0,
	class: "uno-bqvokc"
};
var sp = [
	"onUpdate:modelValue",
	"onInput",
	"onKeydown",
	"onBlur"
];
var lp = /* @__PURE__ */ ut(/* @__PURE__ */ Ct({
	__name: "input-time",
	props: {
		state: { type: null },
		element: { type: Object }
	},
	setup(t) {
		const e = t, n = {
			h: {
				max: 99,
				value: Ce("00"),
				inputRef: Ce()
			},
			m: {
				max: 59,
				value: Ce("00"),
				inputRef: Ce()
			},
			s: {
				max: 59,
				value: Ce("00"),
				inputRef: Ce()
			}
		}, o = (u) => String(u).padStart(2, "0"), r = St({
			get: () => {
				const u = parseInt(n.h.value.value) || 0, h = parseInt(n.m.value.value) || 0, d = parseInt(n.s.value.value) || 0;
				return u * 3600 + h * 60 + d;
			},
			set: (u) => {
				const h = Math.floor(u / 3600), d = Math.floor(u % 3600 / 60), c = u % 60;
				n.h.value.value = o(h), n.m.value.value = o(d), n.s.value.value = o(c);
			}
		});
		$e(() => e.state[e.element.name], (u) => {
			typeof u == "number" && u !== r.value && (r.value = u);
		}, { immediate: !0 });
		const i = (u, h) => {
			let c = u.target.value.replace(/\D/g, "");
			c.length > 2 && (c = c.slice(-2)), parseInt(c) > n[h].max && (c = n[h].max.toString()), n[h].value.value = c, e.state[e.element.name] = r.value;
		}, s = (u) => {
			n[u].value.value = o(n[u].value.value || 0);
		}, a = (u, h) => {
			u.key === "Backspace" && (u.preventDefault(), n[h].value.value = "00");
		};
		return (u, h) => (W(), Z("div", rp, [(W(), Z(pt, null, pr(n, (d, c, g) => (W(), Z(pt, { key: c }, [g > 0 ? (W(), Z("span", ip, ":")) : Ne("", !0), Re(Q("input", {
			ref_for: !0,
			ref: (x) => d.inputRef.value = x,
			"onUpdate:modelValue": (x) => d.value.value = x,
			type: "text",
			placeholder: "00",
			class: "uno-z921r7",
			onInput: (x) => i(x, c),
			onKeydown: (x) => a(x, c),
			onBlur: (x) => s(c)
		}, null, 40, sp), [[pn, d.value.value]])], 64))), 64))]));
	}
}), [["styles", ["*,:before,:after{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }::backdrop{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:var(--un-default-border-color, #e5e7eb)}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\",Segoe UI Symbol,\"Noto Color Emoji\";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,[type=button],[type=reset],[type=submit]{-webkit-appearance:button;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}.uno-bqvokc{margin-left:2px!important;margin-right:2px!important;-webkit-user-select:none!important;user-select:none!important;--un-text-opacity:1 !important;color:rgb(148 163 184 / var(--un-text-opacity))!important;font-weight:700!important}.uno-qryapb{box-sizing:border-box!important;width:136px!important;display:flex!important;justify-content:center!important;border-width:2px!important;--un-border-opacity:1 !important;border-color:rgb(0 0 0 / var(--un-border-opacity))!important;--un-bg-opacity:1 !important;background-color:rgb(255 255 255 / var(--un-bg-opacity))!important;padding:2px!important;font-size:14px!important;line-height:20px!important;transition-property:all!important;transition-timing-function:cubic-bezier(.4,0,.2,1)!important;transition-duration:.15s!important}.uno-z921r7{width:28px!important;text-align:center!important}.uno-qryapb:focus-within{--un-border-opacity:1 !important;border-color:rgb(107 114 128 / var(--un-border-opacity))!important;--un-ring-width:1px !important;--un-ring-offset-shadow:var(--un-ring-inset) 0 0 0 var(--un-ring-offset-width) var(--un-ring-offset-color) !important;--un-ring-shadow:var(--un-ring-inset) 0 0 0 calc(var(--un-ring-width) + var(--un-ring-offset-width)) var(--un-ring-color) !important;box-shadow:var(--un-ring-offset-shadow),var(--un-ring-shadow),var(--un-shadow)!important}[data-theme=dark] .uno-qryapb{--un-bg-opacity:1 !important;background-color:rgb(55 65 81 / var(--un-bg-opacity))!important}[data-theme=dark] .uno-z921r7{background-color:transparent!important;--un-text-opacity:1 !important;color:rgb(203 213 225 / var(--un-text-opacity))!important}.uno-z921r7:focus{background-color:transparent!important;outline:2px solid transparent!important;outline-offset:2px!important}.fixed{position:fixed!important}.bottom-0{bottom:0!important}.left-0{left:0!important}.right-0{right:0!important}.top-0{top:0!important}"]]]);
var cp = { class: "uno-4jm9gl" };
var fp = /* @__PURE__ */ ut(/* @__PURE__ */ Ct({
	__name: "section-element",
	props: {
		state: { type: null },
		element: { type: Object }
	},
	setup(t) {
		const e = t, n = {
			text: op,
			number: Gc,
			time: lp,
			checkbox: Bc,
			button: $c,
			range: Qc
		}, o = St(() => n[e.element.type]);
		return (r, i) => (W(), Z(pt, null, [Q("label", cp, Le(e.element.label), 1), (W(), He(us(o.value), {
			element: e.element,
			state: e.state
		}, null, 8, ["element", "state"]))], 64));
	}
}), [["styles", ["*,:before,:after{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }::backdrop{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:var(--un-default-border-color, #e5e7eb)}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\",Segoe UI Symbol,\"Noto Color Emoji\";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,[type=button],[type=reset],[type=submit]{-webkit-appearance:button;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}.uno-4jm9gl{justify-self:start!important;text-align:left!important;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace!important}.fixed{position:fixed!important}.bottom-0{bottom:0!important}.left-0{left:0!important}.right-0{right:0!important}.top-0{top:0!important}"]]]);
var hp = { class: "uno-cz9i6p" };
var bp = { class: "uno-hx8m6u text-mono" };
var gp = { class: "uno-3o9hie" };
var _p = /* @__PURE__ */ ut(/* @__PURE__ */ Ct({
	__name: "section",
	props: {
		state: { type: null },
		group: { type: Object }
	},
	setup(t) {
		const e = t;
		function n() {
			e.state[e.group.id] = !e.state[e.group.id];
		}
		const o = St(() => !!e.state[e.group.id]);
		return (r, i) => (W(), Z("div", hp, [Q("div", {
			onClick: n,
			class: "uno-ux4grt"
		}, [rt(Vc, { collapsed: !o.value }, null, 8, ["collapsed"]), Q("span", bp, Le(e.group.title), 1)]), o.value ? Ne("", !0) : (W(!0), Z(pt, { key: 0 }, pr(e.group.content, (s) => (W(), Z("div", gp, [rt(fp, {
			state: e.state,
			element: s
		}, null, 8, ["state", "element"])]))), 256))]));
	}
}), [["styles", ["*,:before,:after{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }::backdrop{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:var(--un-default-border-color, #e5e7eb)}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\",Segoe UI Symbol,\"Noto Color Emoji\";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,[type=button],[type=reset],[type=submit]{-webkit-appearance:button;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}.uno-3o9hie{display:grid!important;grid-template-columns:88px 1fr!important;align-items:center!important;gap:8px!important;padding:8px!important;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace!important}.uno-cz9i6p{margin-bottom:8px!important;border-width:2px!important;--un-border-opacity:1 !important;border-color:rgb(0 0 0 / var(--un-border-opacity))!important;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke!important;transition-timing-function:cubic-bezier(.4,0,.2,1)!important;transition-duration:.15s!important}.uno-cz9i6p:last-child{margin-bottom:0!important}.uno-ux4grt{display:flex!important;cursor:pointer!important;align-items:center!important;gap:4px!important;border-bottom-width:2px!important;--un-border-opacity:1 !important;border-color:rgb(0 0 0 / var(--un-border-opacity))!important;--un-bg-opacity:1 !important;background-color:rgb(249 250 251 / var(--un-bg-opacity))!important;padding:4px!important;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace!important;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke!important;transition-timing-function:cubic-bezier(.4,0,.2,1)!important;transition-duration:.15s!important}[data-theme=dark] .uno-3o9hie,[data-theme=dark] .uno-cz9i6p,[data-theme=dark] .uno-ux4grt{--un-border-opacity:1 !important;border-color:rgb(55 65 81 / var(--un-border-opacity))!important;--un-bg-opacity:1 !important;background-color:rgb(39 39 42 / var(--un-bg-opacity))!important;--un-text-opacity:1 !important;color:rgb(212 212 216 / var(--un-text-opacity))!important}[data-theme=dark] .uno-cz9i6p:hover{--un-bg-opacity:1 !important;background-color:rgb(75 85 99 / var(--un-bg-opacity))!important}.uno-ux4grt:hover{--un-bg-opacity:1 !important;background-color:rgb(229 231 235 / var(--un-bg-opacity))!important}[data-theme=dark] .uno-ux4grt:hover{--un-bg-opacity:1 !important;background-color:rgb(75 85 99 / var(--un-bg-opacity))!important}.uno-cz9i6p>*{font-size:14px!important;line-height:20px!important;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace!important}.uno-hx8m6u{font-size:14px!important;line-height:20px!important;font-weight:500!important}.fixed{position:fixed!important}.bottom-0{bottom:0!important}.left-0{left:0!important}.right-0{right:0!important}.top-0{top:0!important}"]]]);
var vp = ["data-theme"];
var xp = { class: "uno-ap5vao" };
var wp = {
	key: 0,
	class: "uno-fsiqeh"
};
var On = /* @__PURE__ */ ut(/* @__PURE__ */ Ct({
	__name: "app",
	props: {
		state: { type: null },
		scheme: { type: Array },
		title: { type: String }
	},
	setup(t) {
		const e = t, n = St(() => e.scheme.filter((o) => o.title !== "Badge"));
		return (o, r) => e.state.enabled ? (W(), Z("div", {
			key: 0,
			id: "jabroni-app",
			"data-theme": e.state.darkmode ? "dark" : "bright",
			class: "fixed right-0 bottom-0 z-9999999"
		}, [Q("div", xp, [rt(vc, {
			state: e.state,
			scheme: e.scheme,
			title: t.title
		}, null, 8, [
			"state",
			"scheme",
			"title"
		]), e.state.collapsed ? Ne("", !0) : (W(), Z("div", wp, [(W(!0), Z(pt, null, pr(n.value, (i) => (W(), He(_p, {
			state: e.state,
			group: i
		}, null, 8, ["state", "group"]))), 256))]))])], 8, vp)) : Ne("", !0);
	}
}), [["styles", ["*,:before,:after{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }::backdrop{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:var(--un-default-border-color, #e5e7eb)}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\",Segoe UI Symbol,\"Noto Color Emoji\";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,[type=button],[type=reset],[type=submit]{-webkit-appearance:button;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}.uno-ap5vao{margin:8px!important;width:340px!important;max-height:472px!important;display:flex!important;flex-direction:column!important;border-width:2px!important;--un-border-opacity:1 !important;border-color:rgb(0 0 0 / var(--un-border-opacity))!important;font-size:14px!important;line-height:20px!important;--un-text-opacity:1 !important;color:rgb(0 0 0 / var(--un-text-opacity))!important;--un-shadow:4px 4px 0px 0px var(--un-shadow-color, rgba(0, 0, 0, 1)) !important;box-shadow:var(--un-ring-offset-shadow),var(--un-ring-shadow),var(--un-shadow)!important}.uno-fsiqeh{flex:1 1 0%!important;overflow-y:auto!important;--un-bg-opacity:1 !important;background-color:rgb(255 255 255 / var(--un-bg-opacity))!important;padding:8px!important}[data-theme=dark] .uno-ap5vao{--un-border-opacity:1 !important;border-color:rgb(55 65 81 / var(--un-border-opacity))!important}[data-theme=dark] .uno-fsiqeh{--un-border-opacity:1 !important;border-color:rgb(55 65 81 / var(--un-border-opacity))!important;--un-bg-opacity:1 !important;background-color:rgb(39 39 42 / var(--un-bg-opacity))!important}.fixed{position:fixed!important}.bottom-0{bottom:0!important}.left-0{left:0!important}.right-0{right:0!important}.top-0{top:0!important}.z-9999999{z-index:9999999!important}"]]]);
var Uo = function(t, e) {
	return Uo = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(n, o) {
		n.__proto__ = o;
	} || function(n, o) {
		for (var r in o) Object.prototype.hasOwnProperty.call(o, r) && (n[r] = o[r]);
	}, Uo(t, e);
};
function lo(t, e) {
	if (typeof e != "function" && e !== null) throw new TypeError("Class extends value " + String(e) + " is not a constructor or null");
	Uo(t, e);
	function n() {
		this.constructor = t;
	}
	t.prototype = e === null ? Object.create(e) : (n.prototype = e.prototype, new n());
}
function Ho(t) {
	var e = typeof Symbol == "function" && Symbol.iterator, n = e && t[e], o = 0;
	if (n) return n.call(t);
	if (t && typeof t.length == "number") return { next: function() {
		return t && o >= t.length && (t = void 0), {
			value: t && t[o++],
			done: !t
		};
	} };
	throw new TypeError(e ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function Bo(t, e) {
	var n = typeof Symbol == "function" && t[Symbol.iterator];
	if (!n) return t;
	var o = n.call(t), r, i = [], s;
	try {
		for (; (e === void 0 || e-- > 0) && !(r = o.next()).done;) i.push(r.value);
	} catch (a) {
		s = { error: a };
	} finally {
		try {
			r && !r.done && (n = o.return) && n.call(o);
		} finally {
			if (s) throw s.error;
		}
	}
	return i;
}
function Ko(t, e, n) {
	if (n || arguments.length === 2) for (var o = 0, r = e.length, i; o < r; o++) (i || !(o in e)) && (i || (i = Array.prototype.slice.call(e, 0, o)), i[o] = e[o]);
	return t.concat(i || Array.prototype.slice.call(e));
}
function ne(t) {
	return typeof t == "function";
}
function Is(t) {
	var e = function(o) {
		Error.call(o), o.stack = (/* @__PURE__ */ new Error()).stack;
	}, n = t(e);
	return n.prototype = Object.create(Error.prototype), n.prototype.constructor = n, n;
}
var No = Is(function(t) {
	return function(n) {
		t(this), this.message = n ? n.length + ` errors occurred during unsubscription:
` + n.map(function(o, r) {
			return r + 1 + ") " + o.toString();
		}).join(`
  `) : "", this.name = "UnsubscriptionError", this.errors = n;
	};
});
function Wo(t, e) {
	if (t) {
		var n = t.indexOf(e);
		0 <= n && t.splice(n, 1);
	}
}
var co = (function() {
	function t(e) {
		this.initialTeardown = e, this.closed = !1, this._parentage = null, this._finalizers = null;
	}
	return t.prototype.unsubscribe = function() {
		var e, n, o, r, i;
		if (!this.closed) {
			this.closed = !0;
			var s = this._parentage;
			if (s) if (this._parentage = null, Array.isArray(s)) try {
				for (var a = Ho(s), u = a.next(); !u.done; u = a.next()) u.value.remove(this);
			} catch (S) {
				e = { error: S };
			} finally {
				try {
					u && !u.done && (n = a.return) && n.call(a);
				} finally {
					if (e) throw e.error;
				}
			}
			else s.remove(this);
			var d = this.initialTeardown;
			if (ne(d)) try {
				d();
			} catch (S) {
				i = S instanceof No ? S.errors : [S];
			}
			var c = this._finalizers;
			if (c) {
				this._finalizers = null;
				try {
					for (var g = Ho(c), x = g.next(); !x.done; x = g.next()) {
						var T = x.value;
						try {
							hi(T);
						} catch (S) {
							i = i ?? [], S instanceof No ? i = Ko(Ko([], Bo(i)), Bo(S.errors)) : i.push(S);
						}
					}
				} catch (S) {
					o = { error: S };
				} finally {
					try {
						x && !x.done && (r = g.return) && r.call(g);
					} finally {
						if (o) throw o.error;
					}
				}
			}
			if (i) throw new No(i);
		}
	}, t.prototype.add = function(e) {
		var n;
		if (e && e !== this) if (this.closed) hi(e);
		else {
			if (e instanceof t) {
				if (e.closed || e._hasParent(this)) return;
				e._addParent(this);
			}
			(this._finalizers = (n = this._finalizers) !== null && n !== void 0 ? n : []).push(e);
		}
	}, t.prototype._hasParent = function(e) {
		var n = this._parentage;
		return n === e || Array.isArray(n) && n.includes(e);
	}, t.prototype._addParent = function(e) {
		var n = this._parentage;
		this._parentage = Array.isArray(n) ? (n.push(e), n) : n ? [n, e] : e;
	}, t.prototype._removeParent = function(e) {
		var n = this._parentage;
		n === e ? this._parentage = null : Array.isArray(n) && Wo(n, e);
	}, t.prototype.remove = function(e) {
		var n = this._finalizers;
		n && Wo(n, e), e instanceof t && e._removeParent(this);
	}, t.EMPTY = (function() {
		var e = new t();
		return e.closed = !0, e;
	})(), t;
})();
var Ps = co.EMPTY;
function Rs(t) {
	return t instanceof co || t && "closed" in t && ne(t.remove) && ne(t.add) && ne(t.unsubscribe);
}
function hi(t) {
	ne(t) ? t() : t.unsubscribe();
}
var Np = { Promise: void 0 };
var Op = {
	setTimeout: function(t, e) {
		for (var n = [], o = 2; o < arguments.length; o++) n[o - 2] = arguments[o];
		return setTimeout.apply(void 0, Ko([t, e], Bo(n)));
	},
	clearTimeout: function(t) {
		return clearTimeout(t);
	},
	delegate: void 0
};
function Sp(t) {
	Op.setTimeout(function() {
		throw t;
	});
}
function bi() {}
function An(t) {
	t();
}
var Fs = (function(t) {
	lo(e, t);
	function e(n) {
		var o = t.call(this) || this;
		return o.isStopped = !1, n ? (o.destination = n, Rs(n) && n.add(o)) : o.destination = zp, o;
	}
	return e.create = function(n, o, r) {
		return new qo(n, o, r);
	}, e.prototype.next = function(n) {
		this.isStopped || this._next(n);
	}, e.prototype.error = function(n) {
		this.isStopped || (this.isStopped = !0, this._error(n));
	}, e.prototype.complete = function() {
		this.isStopped || (this.isStopped = !0, this._complete());
	}, e.prototype.unsubscribe = function() {
		this.closed || (this.isStopped = !0, t.prototype.unsubscribe.call(this), this.destination = null);
	}, e.prototype._next = function(n) {
		this.destination.next(n);
	}, e.prototype._error = function(n) {
		try {
			this.destination.error(n);
		} finally {
			this.unsubscribe();
		}
	}, e.prototype._complete = function() {
		try {
			this.destination.complete();
		} finally {
			this.unsubscribe();
		}
	}, e;
})(co);
var Cp = (function() {
	function t(e) {
		this.partialObserver = e;
	}
	return t.prototype.next = function(e) {
		var n = this.partialObserver;
		if (n.next) try {
			n.next(e);
		} catch (o) {
			Sn(o);
		}
	}, t.prototype.error = function(e) {
		var n = this.partialObserver;
		if (n.error) try {
			n.error(e);
		} catch (o) {
			Sn(o);
		}
		else Sn(e);
	}, t.prototype.complete = function() {
		var e = this.partialObserver;
		if (e.complete) try {
			e.complete();
		} catch (n) {
			Sn(n);
		}
	}, t;
})();
var qo = (function(t) {
	lo(e, t);
	function e(n, o, r) {
		var i = t.call(this) || this, s;
		return ne(n) || !n ? s = {
			next: n ?? void 0,
			error: o ?? void 0,
			complete: r ?? void 0
		} : s = n, i.destination = new Cp(s), i;
	}
	return e;
})(Fs);
function Sn(t) {
	Sp(t);
}
function Dp(t) {
	throw t;
}
var zp = {
	closed: !0,
	next: bi,
	error: Dp,
	complete: bi
};
var Vp = (function() {
	return typeof Symbol == "function" && Symbol.observable || "@@observable";
})();
function Mp(t) {
	return t;
}
function Tp(t) {
	return t.length === 0 ? Mp : t.length === 1 ? t[0] : function(n) {
		return t.reduce(function(o, r) {
			return r(o);
		}, n);
	};
}
var gi = (function() {
	function t(e) {
		e && (this._subscribe = e);
	}
	return t.prototype.lift = function(e) {
		var n = new t();
		return n.source = this, n.operator = e, n;
	}, t.prototype.subscribe = function(e, n, o) {
		var r = this, i = $p(e) ? e : new qo(e, n, o);
		return An(function() {
			var s = r, a = s.operator, u = s.source;
			i.add(a ? a.call(i, u) : u ? r._subscribe(i) : r._trySubscribe(i));
		}), i;
	}, t.prototype._trySubscribe = function(e) {
		try {
			return this._subscribe(e);
		} catch (n) {
			e.error(n);
		}
	}, t.prototype.forEach = function(e, n) {
		var o = this;
		return n = mi(n), new n(function(r, i) {
			var s = new qo({
				next: function(a) {
					try {
						e(a);
					} catch (u) {
						i(u), s.unsubscribe();
					}
				},
				error: i,
				complete: r
			});
			o.subscribe(s);
		});
	}, t.prototype._subscribe = function(e) {
		var n;
		return (n = this.source) === null || n === void 0 ? void 0 : n.subscribe(e);
	}, t.prototype[Vp] = function() {
		return this;
	}, t.prototype.pipe = function() {
		for (var e = [], n = 0; n < arguments.length; n++) e[n] = arguments[n];
		return Tp(e)(this);
	}, t.prototype.toPromise = function(e) {
		var n = this;
		return e = mi(e), new e(function(o, r) {
			var i;
			n.subscribe(function(s) {
				return i = s;
			}, function(s) {
				return r(s);
			}, function() {
				return o(i);
			});
		});
	}, t.create = function(e) {
		return new t(e);
	}, t;
})();
function mi(t) {
	var e;
	return (e = t ?? Np.Promise) !== null && e !== void 0 ? e : Promise;
}
function jp(t) {
	return t && ne(t.next) && ne(t.error) && ne(t.complete);
}
function $p(t) {
	return t && t instanceof Fs || jp(t) && Rs(t);
}
var Ap = Is(function(t) {
	return function() {
		t(this), this.name = "ObjectUnsubscribedError", this.message = "object unsubscribed";
	};
});
var Go = (function(t) {
	lo(e, t);
	function e() {
		var n = t.call(this) || this;
		return n.closed = !1, n.currentObservers = null, n.observers = [], n.isStopped = !1, n.hasError = !1, n.thrownError = null, n;
	}
	return e.prototype.lift = function(n) {
		var o = new yi(this, this);
		return o.operator = n, o;
	}, e.prototype._throwIfClosed = function() {
		if (this.closed) throw new Ap();
	}, e.prototype.next = function(n) {
		var o = this;
		An(function() {
			var r, i;
			if (o._throwIfClosed(), !o.isStopped) {
				o.currentObservers || (o.currentObservers = Array.from(o.observers));
				try {
					for (var s = Ho(o.currentObservers), a = s.next(); !a.done; a = s.next()) a.value.next(n);
				} catch (h) {
					r = { error: h };
				} finally {
					try {
						a && !a.done && (i = s.return) && i.call(s);
					} finally {
						if (r) throw r.error;
					}
				}
			}
		});
	}, e.prototype.error = function(n) {
		var o = this;
		An(function() {
			if (o._throwIfClosed(), !o.isStopped) {
				o.hasError = o.isStopped = !0, o.thrownError = n;
				for (var r = o.observers; r.length;) r.shift().error(n);
			}
		});
	}, e.prototype.complete = function() {
		var n = this;
		An(function() {
			if (n._throwIfClosed(), !n.isStopped) {
				n.isStopped = !0;
				for (var o = n.observers; o.length;) o.shift().complete();
			}
		});
	}, e.prototype.unsubscribe = function() {
		this.isStopped = this.closed = !0, this.observers = this.currentObservers = null;
	}, Object.defineProperty(e.prototype, "observed", {
		get: function() {
			var n;
			return ((n = this.observers) === null || n === void 0 ? void 0 : n.length) > 0;
		},
		enumerable: !1,
		configurable: !0
	}), e.prototype._trySubscribe = function(n) {
		return this._throwIfClosed(), t.prototype._trySubscribe.call(this, n);
	}, e.prototype._subscribe = function(n) {
		return this._throwIfClosed(), this._checkFinalizedStatuses(n), this._innerSubscribe(n);
	}, e.prototype._innerSubscribe = function(n) {
		var o = this, r = this, i = r.hasError, s = r.isStopped, a = r.observers;
		return i || s ? Ps : (this.currentObservers = null, a.push(n), new co(function() {
			o.currentObservers = null, Wo(a, n);
		}));
	}, e.prototype._checkFinalizedStatuses = function(n) {
		var o = this, r = o.hasError, i = o.thrownError, s = o.isStopped;
		r ? n.error(i) : s && n.complete();
	}, e.prototype.asObservable = function() {
		var n = new gi();
		return n.source = this, n;
	}, e.create = function(n, o) {
		return new yi(n, o);
	}, e;
})(gi);
var yi = (function(t) {
	lo(e, t);
	function e(n, o) {
		var r = t.call(this) || this;
		return r.destination = n, r.source = o, r;
	}
	return e.prototype.next = function(n) {
		var o, r;
		(r = (o = this.destination) === null || o === void 0 ? void 0 : o.next) === null || r === void 0 || r.call(o, n);
	}, e.prototype.error = function(n) {
		var o, r;
		(r = (o = this.destination) === null || o === void 0 ? void 0 : o.error) === null || r === void 0 || r.call(o, n);
	}, e.prototype.complete = function() {
		var n, o;
		(o = (n = this.destination) === null || n === void 0 ? void 0 : n.complete) === null || o === void 0 || o.call(n);
	}, e.prototype._subscribe = function(n) {
		var o, r;
		return (r = (o = this.source) === null || o === void 0 ? void 0 : o.subscribe(n)) !== null && r !== void 0 ? r : Ps;
	}, e;
})(Go);
function Ip(t, e) {
	const n = new Set(Object.getOwnPropertyNames(t)), o = new Set(Object.getOwnPropertyNames(e));
	return {
		d1: n.difference(o).values().toArray(),
		d2: o.difference(n).values().toArray()
	};
}
function Pp(t, e) {
	return ((n) => Number.isNaN(n) ? e : n)(parseInt(t));
}
var Rp = {
	enabled: !0,
	collapsed: !1,
	darkmode: !0
};
var Fp = "state_acephale";
var Lp = class {
	constructor(e, n = Fp) {
		this.key = n, this.key = n, this.state = bn(e), this.sync(), this.watchStopHandler = this.watchPersistence();
	}
	state;
	watchStopHandler;
	dispose() {
		this.watchStopHandler(), window.removeEventListener("focus", this.setFromLocalStorage), document.removeEventListener("visibilitychange", this.setFromLocalStorage);
	}
	sync() {
		this.setFromLocalStorage(), window.addEventListener("focus", this.setFromLocalStorage), document.addEventListener("visibilitychange", this.setFromLocalStorage);
	}
	watchPersistence() {
		return $e(this.state, () => {
			this.saveToLocalStorage();
		}, {
			immediate: !1,
			deep: !0
		});
	}
	get persistentOnly() {
		const e = Object.keys(this.state).filter((o) => !o.startsWith("$"));
		return Object.assign({}, ...e.map((o) => ({ [o]: this.state[o] })));
	}
	saveToLocalStorage() {
		localStorage.setItem(this.key, JSON.stringify(this.persistentOnly));
	}
	setFromLocalStorage = () => {
		const e = localStorage.getItem(this.key);
		if (e !== null) {
			const n = JSON.parse(e);
			Object.assign(this.state, n);
		}
	};
};
var Up = class {
	state;
	stateSubject = new Go();
	eventSubject = new Go();
	constructor(e) {
		const n = Object.assign({}, Rp, e);
		this.state = new Lp({}).state, this.parseState(n);
	}
	add(e, n, o, r) {
		return this.state[e] = e in this.state ? this.state[e] : n, $e(() => this.state[e], (i, s) => {
			r !== !1 && typeof n == "number" && (this.state[e] = Pp(i, s));
			const a = typeof o == "string" ? o : e;
			this.stateSubject.next({ [a]: this.state[a] });
		}, { deep: !0 }), this;
	}
	parseState(e) {
		Object.entries(e).forEach(([n, o]) => {
			typeof o == "object" ? this.add(n, o.value, o.watch) : this.add(n, o);
		});
	}
};
var Hp = class {
	name;
	value;
	watch;
	step;
	min;
	max;
	vif;
	text;
	type = "div";
	label;
	placeholder;
	id;
	constructor(e, n) {
		const { d2: o } = Ip(this, e);
		Object.assign(this, e), this.parseModel(o), this.parseType(n), this.parseLabel(), this.id = this.name || window.crypto.randomUUID();
	}
	parseType(e) {
		if (this.type === "div") if (this.value !== void 0) {
			let n = typeof this.value;
			if (n === "time") return;
			n === "function" ? (n = "button", this.parseButton(e)) : n === "string" ? n = "text" : n === "number" ? (n = "number", this.parseNumber()) : n === "boolean" && (n = "checkbox"), this.type = n;
		} else this.text && (this.type = "span");
	}
	parseNumber() {
		this.min || this.max || this.step || (this.min = "0", this.step = "10");
	}
	parseLabel() {
		this.label !== void 0 || this.type === "button" || (this.label = this.name);
	}
	parseButton(e) {
		if (typeof this.value == "function") {
			this.type = "button";
			const n = this.value;
			this.value = () => {
				e.next(this.name), n();
			};
		} else this.type === "button" && (this.value = () => {
			e.next(this.name);
		});
	}
	parseModel(e) {
		if (this.name && this.value) return;
		const n = e[0];
		n && (this.name = n, this.value = this[n], delete this[n]);
	}
	get isInput() {
		return /checkbox|text|number/.test(this.type);
	}
	get htmlTag() {
		return this.isInput ? "input" : this.type;
	}
	get inputType() {
		return this.isInput ? this.type : "";
	}
	get callback() {
		return this.htmlTag === "button" ? this.value : void 0;
	}
};
var _r = class _r {
	constructor(e, n = new Up({})) {
		this.scheme = e, this.store = n, this.parsedScheme = this.parseScheme();
	}
	parsedScheme;
	static parse(...e) {
		const { parsedScheme: n, store: o } = new _r(...e);
		return {
			scheme: n,
			store: o
		};
	}
	parseSchemeElement(e) {
		this.parseStatePropsFromModel(e), this.parseStatePropsFromExpressions(e.text), this.parseStatePropsFromExpressions(e.vif);
	}
	parseStatePropsFromModel(e) {
		const { name: n, value: o } = e;
		n === void 0 || o === void 0 || typeof o == "function" || (this.store.add(n, o), e.value = this.store.state[n]);
	}
	parseStatePropsFromExpressions(e) {
		e && e.match(/state\.\$?\w+/g)?.forEach((n) => {
			const o = n.replace("state.", "");
			this.store.add(o, "", void 0, !1);
		});
	}
	parseScheme() {
		const n = this.scheme.map((o, r) => {
			const i = {
				content: [],
				collapsed: !1,
				title: "",
				id: `section ${r}`
			};
			if (o.content) {
				const s = {
					...i,
					...o
				};
				return s.title.length > 0 && (s.id = s.title), this.store.add(s.id, s.collapsed), s;
			} else return this.store.add(i.id, i.collapsed), i;
		}).map((o) => {
			const { content: r, ...i } = o;
			return {
				content: r.map((a) => new Hp(a, this.store.eventSubject)),
				...i
			};
		});
		return n.forEach((o) => {
			o.content.forEach((r) => {
				this.parseSchemeElement(r);
			});
		}), n;
	}
};
var Kp = class {
	createCustomElementFallback() {
		const e = document.createElement("div"), n = e.attachShadow({ mode: "open" }), o = document.createElement("div");
		if (n.appendChild(o), On.styles) {
			const s = document.createElement("style");
			s.textContent = On.styles.join(`
`), n.appendChild(s);
		}
		const r = bn({
			state: void 0,
			scheme: void 0,
			title: void 0
		}), i = Lo({ render() {
			return xl(On, r);
		} });
		return i.mount(o), Object.defineProperties(e, {
			state: {
				get: () => r.state,
				set: (s) => {
					r.state = s;
				}
			},
			scheme: {
				get: () => r.scheme,
				set: (s) => {
					r.scheme = s;
				}
			},
			title: {
				get: () => r.title,
				set: (s) => {
					r.title = s;
				}
			},
			remove: { value: () => {
				i.unmount(), Element.prototype.remove.call(e);
			} }
		}), e;
	}
	createCustomElement() {
		const e = "jabronio-widget";
		try {
			const n = /* @__PURE__ */ Hl(On);
			return customElements.get(e) || customElements.define(e, n), new n();
		} catch {
			return this.createCustomElementFallback();
		}
	}
	element;
	dispose() {
		this.element.remove();
	}
	constructor(e, n, o = "Config") {
		const r = _r.parse(e, n);
		this.element = this.createCustomElement(), Object.assign(this.element, {
			state: n.state,
			scheme: r.scheme,
			title: o
		}), document.body.appendChild(this.element);
	}
};
function Wp(t, e = []) {
	return t.filter((r) => !(typeof r == "string" && t.find((i) => typeof i != "string" && i.title === r))).map((r) => {
		if (typeof r == "string") return e.find((s) => s.title === r);
		const i = e.find((s) => s.title === r.title);
		if (Array.isArray(r.content) && i) {
			const s = { ...i };
			return s.content = [...s.content, ...r.content], s;
		}
		return r;
	});
}
//#endregion
//#region src/core/jabroni-config/default-scheme.ts
var DefaultScheme = [
	{
		title: "Title Filter",
		collapsed: true,
		content: [
			{
				filterExclude: false,
				label: "exclude"
			},
			{
				filterExcludeWords: "",
				label: "keywords",
				watch: "filterExclude",
				placeholder: "word, f:full_word, r:RegEx..."
			},
			{
				filterInclude: false,
				label: "include"
			},
			{
				filterIncludeWords: "",
				label: "keywords",
				watch: "filterInclude",
				placeholder: "word, f:full_word, r:RegEx..."
			}
		]
	},
	{
		title: "Uploader Filter",
		collapsed: true,
		content: [
			{
				filterUploaderExclude: false,
				label: "exclude"
			},
			{
				filterUploaderExcludeWords: "",
				label: "keywords",
				watch: "filterUploaderExclude",
				placeholder: "word, f:full_word, r:RegEx..."
			},
			{
				filterUploaderInclude: false,
				label: "include"
			},
			{
				filterUploaderIncludeWords: "",
				label: "keywords",
				watch: "filterUploaderInclude",
				placeholder: "word, f:full_word, r:RegEx..."
			}
		]
	},
	{
		title: "Duration Filter",
		collapsed: true,
		content: [
			{
				filterDuration: false,
				label: "enable"
			},
			{
				filterDurationFrom: 0,
				watch: "filterDuration",
				label: "from",
				type: "time"
			},
			{
				filterDurationTo: 600,
				watch: "filterDuration",
				label: "to",
				type: "time"
			}
		]
	},
	{
		title: "Sort By",
		collapsed: true,
		content: [{ "sort by views": () => {} }, { "sort by duration": () => {} }]
	},
	{
		title: "Sort By Duration",
		collapsed: true,
		content: [{ "sort by duration": () => {} }]
	},
	{
		title: "Sort By Views",
		collapsed: true,
		content: [{ "sort by views": () => {} }]
	},
	{
		title: "Privacy Filter",
		collapsed: true,
		content: [
			{
				filterPrivate: false,
				label: "private"
			},
			{
				filterPublic: false,
				label: "public"
			},
			{ "check access 🔓": () => {} }
		]
	},
	{
		title: "HD Filter",
		content: [{
			filterHD: false,
			label: "hd"
		}, {
			filterNonHD: false,
			label: "non-hd"
		}]
	},
	{
		title: "Advanced",
		collapsed: true,
		content: [
			{
				infiniteScrollEnabled: true,
				label: "infinite scroll"
			},
			{
				autoScroll: false,
				label: "auto scroll"
			},
			{
				delay: 250,
				label: "scroll delay"
			},
			{
				writeHistory: false,
				label: "write history"
			},
			{ reset: () => {
				localStorage.removeItem("state_acephale");
			} }
		]
	},
	{
		title: "Badge",
		content: [{
			text: "return `${state.$paginationOffset}/${state.$paginationLast}`",
			vif: "return state.$paginationLast > 1"
		}]
	}
];
//#endregion
//#region src/core/jabroni-config/default-store.ts
var StoreStateDefault = {
	enabled: true,
	collapsed: false,
	darkmode: true,
	$paginationLast: 1,
	$paginationOffset: 1
};
//#endregion
//#region src/core/jabroni-config/jabroni-gui-controller.ts
var JabronioGuiController = class {
	store;
	dataManager;
	constructor(store, dataManager) {
		this.store = store;
		this.dataManager = dataManager;
		this.directionalEventObservable$ = this.directionalEvent();
		this.setupStoreListeners();
	}
	destroy$ = new Subject();
	dispose() {
		this.destroy$.next();
		this.destroy$.complete();
	}
	directionalEventObservable$;
	directionalEvent() {
		return this.store.eventSubject.pipe(scan((acc, value) => ({
			type: value,
			direction: acc.type === value ? !acc.direction : true
		}), {
			type: void 0,
			direction: true
		}), map(({ type, direction }) => ({
			type,
			direction
		})), shareReplay(1), takeUntil(this.destroy$));
	}
	eventsMap = {
		"sort by duration": (direction) => this.dataManager.sortBy("duration", direction),
		"sort by views": (direction) => this.dataManager.sortBy("views", direction)
	};
	setupStoreListeners() {
		this.directionalEventObservable$?.subscribe((e) => {
			this.eventsMap[e.type]?.(e.direction);
		});
		this.store.stateSubject.pipe(takeUntil(this.destroy$)).subscribe((a) => {
			this.dataManager.applyFilters(a);
		});
	}
};
//#endregion
//#region src/core/jabroni-config/scheme-selectors-mapping.ts
function getSelectorFnsFromScheme(xs) {
	return xs.flatMap((s) => {
		const schemeBlock = DefaultScheme.find((e) => e.title === s);
		if (!schemeBlock) return [];
		return schemeBlock.content.flatMap((c) => Object.keys(c));
	}).filter((k) => k in defaultDataFilterFns);
}
//#endregion
//#region src/core/rules/index.ts
var Rules = class {
	thumbs = {};
	thumbsParser;
	thumb = {};
	thumbDataParser;
	thumbImg = {};
	thumbImgParser;
	containerSelector = ".container";
	containerSelectorLast;
	get container() {
		if (typeof this.containerSelectorLast === "string") return querySelectorLast(document.body, this.containerSelectorLast);
		if (typeof this.containerSelector === "string") return querySelectorOrSelf(document.body, this.containerSelector);
		return this.containerSelector();
	}
	intersectionObservableSelector;
	get intersectionObservable() {
		if (!this.intersectionObservableSelector) return void 0;
		return document.querySelector(this.intersectionObservableSelector);
	}
	get observable() {
		return this.intersectionObservable || this.paginationStrategy.getPaginationElement();
	}
	paginationStrategyOptions = {};
	paginationStrategy;
	dataManager;
	dataManagerOptions = {};
	customDataFilterFns = [];
	hookDataFilterFns() {
		const defaultFilterFns = getSelectorFnsFromScheme(this.schemeOptions.filter((s) => typeof s === "string"));
		this.customDataFilterFns.push(...defaultFilterFns);
	}
	animatePreview;
	storeOptions;
	schemeOptions = [];
	store;
	gui;
	inputController;
	createStore() {
		const config = {
			...StoreStateDefault,
			...this.storeOptions
		};
		this.store = new Up(config);
		return this.store;
	}
	createGui() {
		const scheme = Wp(this.schemeOptions, DefaultScheme);
		this.gui = new Kp(scheme, this.store, "PervertMonkey");
		return this.gui;
	}
	customGenerator;
	infiniteScroller;
	getPaginationData;
	resetInfiniteScroller() {
		this.infiniteScroller?.dispose();
		if (!this.paginationStrategy.hasPagination) return;
		this.infiniteScroller = InfiniteScroller.create(this);
	}
	gropeStrategy = "all-in-one";
	gropeInit() {
		if (!this.gropeStrategy) return;
		if (this.gropeStrategy === "all-in-one") this.dataManager?.parseData(this.container, this.container);
		if (this.gropeStrategy === "all-in-all") getCommonParents(this.thumbsParser.getThumbs(document.body)).forEach((c) => {
			this.dataManager.parseData(c, c, true);
		});
	}
	get isEmbedded() {
		return window.self !== window.top;
	}
	containMutationEnabled = true;
	mutationObservers = [];
	resetOnPaginationOrContainerDeath = true;
	resetOn() {
		if (!this.resetOnPaginationOrContainerDeath) return;
		const observables = [this.container, this.intersectionObservable || this.paginationStrategy.getPaginationElement()].filter(Boolean);
		if (observables.length === 0) return;
		observables.forEach((o) => {
			const observer = waitForElementToDisappear(o, () => {
				this.reset();
			});
			this.mutationObservers.push(observer);
		});
	}
	onResetCallback;
	reset() {
		this.mutationObservers.forEach((o) => {
			o.disconnect();
		});
		this.mutationObservers = [];
		this.paginationStrategy = getPaginationStrategy(this.paginationStrategyOptions);
		this.dataManager = DataManager.create(this, this.dataManagerOptions);
		this.inputController.dispose();
		this.inputController = new JabronioGuiController(this.store, this.dataManager);
		this.resetInfiniteScroller();
		this.container && this.animatePreview?.(this.container);
		this.gropeInit();
		this.onResetCallback?.();
		this.resetOn();
	}
	constructor(options) {
		if (this.isEmbedded) throw Error("Embedded is not supported");
		Object.assign(this, options);
		this.thumbsParser = ThumbsParser.create(this.thumbs);
		this.thumbDataParser = ThumbDataParser.create(this.thumb);
		this.thumbImgParser = ThumbImgParser.create(this.thumbImg);
		this.paginationStrategy = getPaginationStrategy(this.paginationStrategyOptions);
		this.store = this.createStore();
		this.gui = this.createGui();
		this.hookDataFilterFns();
		this.dataManager = DataManager.create(this, this.dataManagerOptions);
		this.inputController = new JabronioGuiController(this.store, this.dataManager);
		this.reset();
	}
};
//#endregion
export { DataFilter, DataManager, InfiniteScroller, LazyImgLoader, MOBILE_UA, Observer, OnHover, PaginationStrategy, PaginationStrategyDataParams, PaginationStrategyPathnameParams, PaginationStrategySearchParams, RegexFilter, Rules, ThumbDataParser, ThumbImgParser, ThumbsParser, Tick, areElementsAlike, chunks, circularShift, containMutation, copyAttributes, downloader, exterminateVideo, fetchHtml, fetchJson, fetchText, fetchWith, findNextSibling, formatTimeToHHMMSS, getCommonParents, getPaginationStrategy, instantiateTemplate, irange, memoize, objectToFormData, parseCssUrl, parseDataParams, parseHtml, parseIntegerOr, parseNumericAbbreviation, parseUrl, querySelectorLast, querySelectorLastNumber, querySelectorOrSelf, querySelectorText, range, removeClassesAndDataAttributes, replaceElementTag, runIdleJob, sanitizeStr, splitWith, timeToSeconds, wait, waitForElementToAppear, waitForElementToDisappear, watchDomChangesWithThrottle, watchElementChildrenCount };

//# sourceMappingURL=pervertmonkey.core.es.js.map