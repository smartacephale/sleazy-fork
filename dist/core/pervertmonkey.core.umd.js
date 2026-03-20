(function(global2, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports, require("vite-plugin-monkey/dist/client")) : typeof define === "function" && define.amd ? define(["exports", "vite-plugin-monkey/dist/client"], factory) : (global2 = typeof globalThis !== "undefined" ? globalThis : global2 || self, factory((global2.pervertmonkey = global2.pervertmonkey || {}, global2.pervertmonkey.core = {}), global2.window));
})(this, (function(exports2, client) {
  "use strict";var __defProp = Object.defineProperty;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);

  var _i2, _n2, _t, _e2, _s2, _l2, _o2, _d, _p2, _g, _C_instances, r_fn, R_fn, b_fn, u_fn, m_fn, a_fn, P_fn, E_fn, S_fn, O_fn, k_fn, x_fn, h_fn, f_fn, T_fn, A_fn, y_fn, w_fn, c_fn, C_fn, _a2, _i3, _n3, _t2, _e3, _s3, _l3, _b;
  const _DataFilterFn = class _DataFilterFn {
    constructor(handle, deps = [], name, $preDefine) {
      this.handle = handle;
      this.deps = deps;
      this.name = name;
      this.$preDefine = $preDefine;
      this.name = _DataFilterFn.setPrefix(name);
    }
    static setPrefix(name) {
      return `${_DataFilterFn.prefix}${name}`;
    }
    static from(options, name) {
      if (typeof options === "function") {
        const deps = [name];
        return new _DataFilterFn(options, deps, name);
      }
      return new _DataFilterFn(
        options.handle,
        options.deps,
        name,
        options.$preDefine
      );
    }
    renderFn(state) {
      const name = this.name;
      return () => {
        var _a3;
        const preDefined = (_a3 = this.$preDefine) == null ? void 0 : _a3.call(this, state);
        return (a2) => {
          const condition = this.handle(a2, state, preDefined);
          return { condition, name };
        };
      };
    }
  };
  __publicField(_DataFilterFn, "prefix", "filter-");
  let DataFilterFn = _DataFilterFn;
  function chunks(arr, size) {
    return Array.from(
      { length: Math.ceil(arr.length / size) },
      (_2, i) => arr.slice(i * size, i * size + size)
    );
  }
  function* irange(start = 1, step = 1) {
    for (let i = start; ; i += step) {
      yield i;
    }
  }
  function range(size, start = 1, step = 1) {
    return irange(start, step).take(size).toArray();
  }
  function wait(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }
  function copyAttributes(target, source) {
    for (const attr of source.attributes) {
      if (attr.nodeValue) {
        target.setAttribute(attr.nodeName, attr.nodeValue);
      }
    }
  }
  function replaceElementTag(e, tagName) {
    var _a3;
    const newTagElement = document.createElement(tagName);
    copyAttributes(newTagElement, e);
    newTagElement.innerHTML = e.innerHTML;
    (_a3 = e.parentNode) == null ? void 0 : _a3.replaceChild(newTagElement, e);
    return newTagElement;
  }
  function removeClassesAndDataAttributes(element, keyword) {
    Array.from(element.classList).forEach((className) => {
      if (className.includes(keyword)) {
        element.classList.remove(className);
      }
    });
    Array.from(element.attributes).forEach((attr) => {
      if (attr.name.startsWith("data-") && attr.name.includes(keyword)) {
        element.removeAttribute(attr.name);
      }
    });
  }
  function areElementsAlike(a2, b2, options) {
    if (!a2 || !b2) return false;
    if (options.id && a2.id !== b2.id) return false;
    if (options.className) {
      const ca2 = a2.className;
      const cb = b2.className;
      if (!(ca2.length > cb.length ? ca2.includes(cb) : cb.includes(ca2))) {
        return false;
      }
    }
    return true;
  }
  function exterminateVideo(video) {
    video.removeAttribute("src");
    video.load();
    video.remove();
  }
  function downloader(options) {
    var _a3, _b2;
    const btn = parseHtml(options.buttonHtml);
    if (options.append) (_a3 = document.querySelector(options.append)) == null ? void 0 : _a3.append(btn);
    if (options.after) (_b2 = document.querySelector(options.after)) == null ? void 0 : _b2.after(btn);
    btn == null ? void 0 : btn.addEventListener("click", (e) => {
      var _a4;
      e.preventDefault();
      (_a4 = options.doBefore) == null ? void 0 : _a4.call(options);
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
  function waitForElementToAppear(parent, selector, callback) {
    const observer = new MutationObserver((_mutations) => {
      const e = parent.querySelector(selector);
      if (e) {
        observer.disconnect();
        callback(e);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return observer;
  }
  function waitForElementToDisappear(observable2, callback) {
    const observer = new MutationObserver((_mutations) => {
      if (!observable2.isConnected) {
        observer.disconnect();
        callback();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return observer;
  }
  function watchElementChildrenCount(element, callback) {
    let count = element.children.length;
    const observer = new MutationObserver((mutationList, observer2) => {
      for (const mutation of mutationList) {
        if (mutation.type === "childList") {
          if (count !== element.children.length) {
            count = element.children.length;
            callback(observer2, count);
          }
        }
      }
    });
    observer.observe(element, { childList: true });
    return observer;
  }
  function watchDomChangesWithThrottle(element, callback, throttle = 1e3, times = Infinity, options = { childList: true, subtree: true, attributes: true }) {
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
      if (lastMutationTime && now - lastMutationTime < throttle) {
        timeout && clearTimeout(timeout);
      }
      timeout = window.setTimeout(callback, throttle);
      lastMutationTime = now;
    });
    observer.observe(element, options);
    return observer;
  }
  function memoize(fn2) {
    const cache = /* @__PURE__ */ new Map();
    const memoizedFunction = ((...args) => {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = fn2(...args);
      cache.set(key, result);
      return result;
    });
    return memoizedFunction;
  }
  function objectToFormData(obj) {
    const formData = new FormData();
    Object.entries(obj).forEach(([k2, v2]) => {
      formData.append(k2, v2);
    });
    return formData;
  }
  class RegexFilter {
    constructor(str, flags = "gi") {
      __publicField(this, "regexes");
      this.regexes = memoize(this.compileSearchRegex)(str, flags);
    }
    // 'dog,bog,f:girl' or r:dog|bog... => [r/dog/i, r/bog/i, r/(^|\ )girl($|\ )/i]
    compileSearchRegex(str, flags) {
      try {
        if (str.startsWith("r:")) return [new RegExp(str.slice(2), flags)];
        const regexes = splitWith(str).map(
          (s) => s.replace(/f:(\w+)/g, (_2, w2) => `(^|\\ |,)${w2}($|\\ |,)`)
          // full word
        ).map((_2) => new RegExp(_2, flags));
        return regexes;
      } catch (_2) {
        return [];
      }
    }
    hasEvery(str) {
      return this.regexes.every((r) => r.test(str));
    }
    hasNone(str) {
      return this.regexes.every((r) => !r.test(str));
    }
  }
  function splitWith(s, c = ",") {
    return s.split(c).map((s2) => s2.trim()).filter(Boolean);
  }
  function sanitizeStr(s) {
    return (s == null ? void 0 : s.replace(/\n|\t/g, " ").replace(/ {2,}/g, " ").trim()) || "";
  }
  function querySelectorOrSelf(element, selector) {
    var _a3;
    if ((_a3 = element.matches) == null ? void 0 : _a3.call(element, selector)) {
      return element;
    }
    return element.querySelector(selector);
  }
  function querySelectorLast(root = document, selector) {
    const nodes = root.querySelectorAll(selector);
    if (nodes.length < 1) {
      return querySelectorOrSelf(root, selector) || void 0;
    }
    return nodes[nodes.length - 1];
  }
  function querySelectorLastNumber(selector, e = document) {
    var _a3;
    const text = querySelectorText(e, selector);
    return Number(((_a3 = text.match(/\d+/g)) == null ? void 0 : _a3.pop()) || 0);
  }
  function querySelectorText(e, selector) {
    var _a3;
    if (typeof selector !== "string") return "";
    const text = ((_a3 = querySelectorOrSelf(e, selector)) == null ? void 0 : _a3.innerText) || "";
    return sanitizeStr(text);
  }
  function getCommonParents(elements) {
    return Map.groupBy(elements, (e) => e.parentElement).keys().filter((e) => e !== null).toArray();
  }
  function findNextSibling(e) {
    if (e.nextElementSibling) return e.nextElementSibling;
    if (e.parentElement) return findNextSibling(e.parentElement);
    return null;
  }
  function parseHtml(html) {
    const parsed = new DOMParser().parseFromString(html, "text/html").body;
    if (parsed.children.length > 1) return parsed;
    return parsed.firstElementChild;
  }
  class OnHover {
    constructor(container, targetSelector, onOver) {
      __publicField(this, "target");
      __publicField(this, "onOverCallback");
      this.container = container;
      this.targetSelector = targetSelector;
      this.onOver = onOver;
      this.container.addEventListener("pointerover", (e) => this.handleHover(e));
    }
    handleLeave() {
      var _a3;
      (_a3 = this.onOverCallback) == null ? void 0 : _a3.call(this);
      this.onOverCallback = void 0;
      this.target = void 0;
    }
    handleHover(e) {
      var _a3;
      const newTarget = e.target.closest(this.targetSelector);
      if (!newTarget || this.target === newTarget) return;
      (_a3 = this.target) == null ? void 0 : _a3.dispatchEvent(new PointerEvent("pointerleave"));
      this.target = newTarget;
      this.onOverCallback = this.onOver(this.target);
      this.target.addEventListener("pointerleave", () => this.handleLeave(), { once: true });
    }
    static create(...args) {
      return new OnHover(...args);
    }
  }
  class Tick {
    constructor(delay, startImmediate = true) {
      __publicField(this, "tick");
      __publicField(this, "callbackFinal");
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
      var _a3;
      if (this.tick !== void 0) {
        clearInterval(this.tick);
        this.tick = void 0;
        (_a3 = this.callbackFinal) == null ? void 0 : _a3.call(this);
        this.callbackFinal = void 0;
      }
    }
  }
  const MOBILE_UA = {
    "User-Agent": [
      "Mozilla/5.0 (Linux; Android 10; K)",
      "AppleWebKit/537.36 (KHTML, like Gecko)",
      "Chrome/114.0.0.0 Mobile Safari/537.36"
    ].join(" ")
  };
  async function fetchWith(input, options) {
    const requestInit = options.init || {};
    if (options.mobile) {
      Object.assign(requestInit, { headers: new Headers(MOBILE_UA) });
    }
    const r = await fetch(input, requestInit).then((r2) => r2);
    if (options.type === "json") return await r.json();
    if (options.type === "html") return parseHtml(await r.text());
    return await r.text();
  }
  const fetchJson = (input) => fetchWith(input, { type: "json" });
  const fetchHtml = (input) => fetchWith(input, { type: "html" });
  const fetchText = (input) => fetchWith(input, { type: "text" });
  function circularShift(n, c = 6, s = 1) {
    return (n + s) % c || c;
  }
  class LazyImgLoader {
    constructor(shouldDelazify, attributeName = "data-lazy-orangutan") {
      __publicField(this, "lazyImgObserver");
      this.attributeName = attributeName;
      this.lazyImgObserver = new Observer((target) => {
        if (shouldDelazify(target)) {
          this.unlazify(target);
        }
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
  }
  class Observer {
    constructor(callback) {
      __publicField(this, "timeout");
      __publicField(this, "observer");
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
      for (const entry of entries) {
        if (entry.isIntersecting) {
          this.callback(entry.target);
        }
      }
    }
    dispose() {
      if (this.timeout) clearTimeout(this.timeout);
      this.observer.disconnect();
    }
    static observeWhile(target, callback, throttleTime) {
      const observer = new Observer(async (target2) => {
        const condition = await callback();
        if (condition) {
          observer.throttle(target2, throttleTime);
        } else {
          observer.dispose();
        }
      });
      observer.observe(target);
      return observer;
    }
  }
  function formatTimeToHHMMSS(timeStr) {
    var _a3, _b2, _c2;
    const pad = (num) => num.toString().padStart(2, "0");
    const h = ((_a3 = timeStr.match(/(\d+)\s*h/)) == null ? void 0 : _a3[1]) || "0";
    const m = ((_b2 = timeStr.match(/(\d+)\s*mi?n?/)) == null ? void 0 : _b2[1]) || "0";
    const s = ((_c2 = timeStr.match(/(\d+)\s*se?c?/)) == null ? void 0 : _c2[1]) || "0";
    return `${pad(+h)}:${pad(+m)}:${pad(+s)}`;
  }
  function timeToSeconds(timeStr) {
    const normalized = /[a-zA-Z]/.test(timeStr) ? formatTimeToHHMMSS(timeStr) : timeStr;
    return normalized.split(":").reverse().reduce((total, unit, index) => total + parseInt(unit, 10) * 60 ** index, 0);
  }
  function parseUrl(s) {
    return new URL(typeof s === "string" ? s : s.href);
  }
  function parseIntegerOr(n, or2) {
    const num = Number(n);
    return Number.isSafeInteger(num) ? num : or2;
  }
  function parseNumericAbbreviation(str) {
    var _a3;
    const multipliers = { k: 1e3, m: 1e6 };
    const match = str.trim().match(/([\d., ]+)(\w)?/);
    if (!match) return 0;
    const s1 = match[1].replace(/,/g, ".").replace(/[ ]/g, "");
    const s2 = s1.split(".").filter(Boolean).length < 3 ? s1 : s1.replace(".", "");
    const num = parseFloat(s2);
    const suffix = (_a3 = match[2]) == null ? void 0 : _a3.toLowerCase();
    if (suffix && suffix in multipliers) {
      return num * multipliers[suffix];
    }
    return num;
  }
  function parseDataParams(str) {
    const paramsStr = decodeURI(str.trim()).split(";");
    return paramsStr.reduce(
      (acc, s) => {
        const parsed = s.match(/([+\w]+):([\w\- ]+)?/);
        if (parsed) {
          const [, key, value] = parsed;
          if (value) {
            key.split("+").forEach((p) => {
              acc[p] = value;
            });
          }
        }
        return acc;
      },
      {}
    );
  }
  function parseCssUrl(s) {
    return s.replace(/url\("|"\).*/g, "");
  }
  function runIdleJob(iterator2, job) {
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
          const { value, done } = iterator2.next();
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
  function createTextFilter(filterName, dataPropName, positive) {
    const filterNameValue = `${filterName}Words`;
    return {
      handle(e, state, searchFilter) {
        if (!Object.hasOwn(state, filterName) || !state[filterName]) return false;
        return !(searchFilter == null ? void 0 : searchFilter(e[dataPropName]));
      },
      $preDefine: (state) => {
        const r = new RegexFilter(state[filterNameValue]);
        if (positive) return (s) => r.hasEvery(s);
        return (s) => r.hasNone(s);
      },
      deps: [filterNameValue]
    };
  }
  const filterDuration = {
    handle(e, state, notInRange) {
      if (!state.filterDuration) return false;
      return !!(notInRange == null ? void 0 : notInRange(e.duration));
    },
    $preDefine: (state) => {
      const from = state.filterDurationFrom;
      const to2 = state.filterDurationTo;
      function notInRange(d) {
        return d < from || d > to2;
      }
      return notInRange;
    },
    deps: ["filterDurationFrom", "filterDurationTo"]
  };
  const defaultDataFilterFns = {
    filterDuration,
    filterExclude: createTextFilter("filterExclude", "title", false),
    filterInclude: createTextFilter("filterInclude", "title", true),
    filterUploaderExclude: createTextFilter("filterUploaderExclude", "uploader", false),
    filterUploaderInclude: createTextFilter("filterUploaderInclude", "uploader", true),
    filterHD: (e, state) => state.filterHD && !e.hd,
    filterNonHD: (e, state) => state.filterNonHD && e.hd,
    filterPrivate: (e, state) => state.filterPrivate && e.private,
    filterPublic: (e, state) => state.filterPublic && !e.private
  };
  class DataFilter {
    constructor(rules) {
      __publicField(this, "filters", /* @__PURE__ */ new Map());
      __publicField(this, "filterDepsMapping", {});
      __publicField(this, "customDataFilterFns", {});
      this.rules = rules;
      this.registerFilters(rules.customDataFilterFns);
      this.createCssFilters();
    }
    static isFiltered(e) {
      return e.className.includes(DataFilterFn.prefix);
    }
    createCssFilters(wrapper) {
      this.filters.forEach((_2, name) => {
        const className = DataFilterFn.setPrefix(name);
        const cssRule = `.${className} { display: none !important; }`;
        client.GM_addStyle(wrapper ? wrapper(cssRule) : cssRule);
      });
    }
    registerFilters(customFilters) {
      customFilters.forEach((o) => {
        const isStr = typeof o === "string";
        const k2 = isStr ? o : Object.keys(o)[0];
        this.customDataFilterFns[k2] = isStr ? defaultDataFilterFns[o] : o[k2];
        this.registerFilter(k2);
      });
    }
    registerFilter(customSelectorName) {
      const dataFilterFn = DataFilterFn.from(
        this.customDataFilterFns[customSelectorName],
        customSelectorName
      );
      dataFilterFn.deps.push(customSelectorName);
      dataFilterFn.deps.forEach((name) => {
        Object.assign(this.filterDepsMapping, { [name]: customSelectorName });
      });
      this.filters.set(customSelectorName, dataFilterFn.renderFn(this.rules.store.state));
    }
    selectFilters(filters) {
      const selectedFilters = Object.keys(filters).filter((k2) => k2 in this.filterDepsMapping).map((k2) => this.filterDepsMapping[k2]).map((k2) => this.filters.get(k2));
      return selectedFilters;
    }
  }
  class DataManager {
    constructor(rules, containerHomogenity) {
      __publicField(this, "data", /* @__PURE__ */ new Map());
      __publicField(this, "lazyImgLoader", new LazyImgLoader(
        (target) => !DataFilter.isFiltered(target)
      ));
      __publicField(this, "dataFilter");
      this.rules = rules;
      this.containerHomogenity = containerHomogenity;
      this.dataFilter = new DataFilter(this.rules);
    }
    async applyFilters(filters = {}, offset = 0) {
      const filtersToApply = this.dataFilter.selectFilters(filters);
      if (filtersToApply.length === 0) return;
      const iterator2 = this.data.values().drop(offset);
      const updates = [];
      await runIdleJob(iterator2, (v2) => {
        for (const f2 of filtersToApply) {
          const { name, condition } = f2()(v2);
          updates.push({ e: v2.element, name, condition });
        }
      });
      const parents = Map.groupBy(updates, (u) => u.e.parentElement);
      for (const [parent, mutations] of parents) {
        const f2 = () => {
          mutations.forEach((u) => {
            u.e.classList.toggle(u.name, u.condition);
          });
        };
        parent ? await this.optimize(parent, f2) : f2();
      }
    }
    async filterAll(offset) {
      const keys = Array.from(this.dataFilter.filters.keys());
      const filters = Object.fromEntries(
        keys.map((k2) => [k2, this.rules.store.state[k2]])
      );
      await this.applyFilters(filters, offset);
    }
    async parseData(html, container, removeDuplicates = false, shouldLazify = true) {
      const thumbs = this.rules.thumbsParser.getThumbs(html);
      const dataOffset = this.data.size;
      const fragment = document.createDocumentFragment();
      const parent = container || this.rules.container;
      const homogenity = !!this.containerHomogenity;
      for (const thumbElement of thumbs) {
        const url = this.rules.thumbDataParser.getUrl(thumbElement);
        const isNotHomogenic = homogenity && !areElementsAlike(
          parent,
          thumbElement.parentElement,
          this.containerHomogenity
        );
        if (!url || this.data.has(url) || parent !== container && (parent == null ? void 0 : parent.contains(thumbElement)) || isNotHomogenic) {
          if (removeDuplicates) thumbElement.remove();
          continue;
        }
        const data = this.rules.thumbDataParser.getThumbData(thumbElement);
        this.data.set(url, { element: thumbElement, ...data });
        if (shouldLazify) {
          const { img, imgSrc } = this.rules.thumbImgParser.getImgData(thumbElement);
          this.lazyImgLoader.lazify(img, imgSrc);
        }
        fragment.append(thumbElement);
      }
      await this.filterAll(dataOffset);
      if (!parent) return;
      await this.optimize(parent, () => parent == null ? void 0 : parent.appendChild(fragment));
    }
    async optimize(container, mutation) {
      if (this.rules.containMutationEnabled) {
        await containMutation(container, mutation);
      } else {
        mutation();
      }
    }
    async sortBy(key, direction = true) {
      if (this.data.size < 2) return;
      const ds2 = this.data.values().toArray().filter((e) => e.element.parentElement !== null);
      const byContainers = Map.groupBy(ds2, (e) => e.element.parentElement);
      const dir = direction ? -1 : 1;
      for (const [container, items] of byContainers) {
        items.sort((a2, b2) => (a2[key] - b2[key]) * dir);
        const children = items.map((e) => e.element);
        await this.optimize(container, () => container.replaceChildren(...children));
      }
    }
  }
  var extendStatics = function(d, b2) {
    extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b3) {
      d2.__proto__ = b3;
    } || function(d2, b3) {
      for (var p in b3) if (Object.prototype.hasOwnProperty.call(b3, p)) d2[p] = b3[p];
    };
    return extendStatics(d, b2);
  };
  function __extends(d, b2) {
    if (typeof b2 !== "function" && b2 !== null)
      throw new TypeError("Class extends value " + String(b2) + " is not a constructor or null");
    extendStatics(d, b2);
    function __() {
      this.constructor = d;
    }
    d.prototype = b2 === null ? Object.create(b2) : (__.prototype = b2.prototype, new __());
  }
  function __awaiter(thisArg, _arguments, P2, generator) {
    function adopt(value) {
      return value instanceof P2 ? value : new P2(function(resolve) {
        resolve(value);
      });
    }
    return new (P2 || (P2 = Promise))(function(resolve, reject) {
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
    var _2 = { label: 0, sent: function() {
      if (t[0] & 1) throw t[1];
      return t[1];
    }, trys: [], ops: [] }, f2, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() {
      return this;
    }), g;
    function verb(n) {
      return function(v2) {
        return step([n, v2]);
      };
    }
    function step(op2) {
      if (f2) throw new TypeError("Generator is already executing.");
      while (g && (g = 0, op2[0] && (_2 = 0)), _2) try {
        if (f2 = 1, y && (t = op2[0] & 2 ? y["return"] : op2[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op2[1])).done) return t;
        if (y = 0, t) op2 = [op2[0] & 2, t.value];
        switch (op2[0]) {
          case 0:
          case 1:
            t = op2;
            break;
          case 4:
            _2.label++;
            return { value: op2[1], done: false };
          case 5:
            _2.label++;
            y = op2[1];
            op2 = [0];
            continue;
          case 7:
            op2 = _2.ops.pop();
            _2.trys.pop();
            continue;
          default:
            if (!(t = _2.trys, t = t.length > 0 && t[t.length - 1]) && (op2[0] === 6 || op2[0] === 2)) {
              _2 = 0;
              continue;
            }
            if (op2[0] === 3 && (!t || op2[1] > t[0] && op2[1] < t[3])) {
              _2.label = op2[1];
              break;
            }
            if (op2[0] === 6 && _2.label < t[1]) {
              _2.label = t[1];
              t = op2;
              break;
            }
            if (t && _2.label < t[2]) {
              _2.label = t[2];
              _2.ops.push(op2);
              break;
            }
            if (t[2]) _2.ops.pop();
            _2.trys.pop();
            continue;
        }
        op2 = body.call(thisArg, _2);
      } catch (e) {
        op2 = [6, e];
        y = 0;
      } finally {
        f2 = t = 0;
      }
      if (op2[0] & 5) throw op2[1];
      return { value: op2[0] ? op2[1] : void 0, done: true };
    }
  }
  function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
      next: function() {
        if (o && i >= o.length) o = void 0;
        return { value: o && o[i++], done: !o };
      }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
  }
  function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar2 = [], e;
    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar2.push(r.value);
    } catch (error) {
      e = { error };
    } finally {
      try {
        if (r && !r.done && (m = i["return"])) m.call(i);
      } finally {
        if (e) throw e.error;
      }
    }
    return ar2;
  }
  function __spreadArray(to2, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar2; i < l; i++) {
      if (ar2 || !(i in from)) {
        if (!ar2) ar2 = Array.prototype.slice.call(from, 0, i);
        ar2[i] = from[i];
      }
    }
    return to2.concat(ar2 || Array.prototype.slice.call(from));
  }
  function __await(v2) {
    return this instanceof __await ? (this.v = v2, this) : new __await(v2);
  }
  function __asyncGenerator(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q2 = [];
    return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function() {
      return this;
    }, i;
    function awaitReturn(f2) {
      return function(v2) {
        return Promise.resolve(v2).then(f2, reject);
      };
    }
    function verb(n, f2) {
      if (g[n]) {
        i[n] = function(v2) {
          return new Promise(function(a2, b2) {
            q2.push([n, v2, a2, b2]) > 1 || resume(n, v2);
          });
        };
        if (f2) i[n] = f2(i[n]);
      }
    }
    function resume(n, v2) {
      try {
        step(g[n](v2));
      } catch (e) {
        settle(q2[0][3], e);
      }
    }
    function step(r) {
      r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q2[0][2], r);
    }
    function fulfill(value) {
      resume("next", value);
    }
    function reject(value) {
      resume("throw", value);
    }
    function settle(f2, v2) {
      if (f2(v2), q2.shift(), q2.length) resume(q2[0][0], q2[0][1]);
    }
  }
  function __asyncValues(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
      return this;
    }, i);
    function verb(n) {
      i[n] = o[n] && function(v2) {
        return new Promise(function(resolve, reject) {
          v2 = o[n](v2), settle(resolve, reject, v2.done, v2.value);
        });
      };
    }
    function settle(resolve, reject, d, v2) {
      Promise.resolve(v2).then(function(v3) {
        resolve({ value: v3, done: d });
      }, reject);
    }
  }
  typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
  };
  function isFunction(value) {
    return typeof value === "function";
  }
  function createErrorClass(createImpl) {
    var _super = function(instance) {
      Error.call(instance);
      instance.stack = new Error().stack;
    };
    var ctorFunc = createImpl(_super);
    ctorFunc.prototype = Object.create(Error.prototype);
    ctorFunc.prototype.constructor = ctorFunc;
    return ctorFunc;
  }
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
  function arrRemove(arr, item) {
    if (arr) {
      var index = arr.indexOf(item);
      0 <= index && arr.splice(index, 1);
    }
  }
  var Subscription = (function() {
    function Subscription2(initialTeardown) {
      this.initialTeardown = initialTeardown;
      this.closed = false;
      this._parentage = null;
      this._finalizers = null;
    }
    Subscription2.prototype.unsubscribe = function() {
      var e_1, _a3, e_2, _b2;
      var errors;
      if (!this.closed) {
        this.closed = true;
        var _parentage = this._parentage;
        if (_parentage) {
          this._parentage = null;
          if (Array.isArray(_parentage)) {
            try {
              for (var _parentage_1 = __values(_parentage), _parentage_1_1 = _parentage_1.next(); !_parentage_1_1.done; _parentage_1_1 = _parentage_1.next()) {
                var parent_1 = _parentage_1_1.value;
                parent_1.remove(this);
              }
            } catch (e_1_1) {
              e_1 = { error: e_1_1 };
            } finally {
              try {
                if (_parentage_1_1 && !_parentage_1_1.done && (_a3 = _parentage_1.return)) _a3.call(_parentage_1);
              } finally {
                if (e_1) throw e_1.error;
              }
            }
          } else {
            _parentage.remove(this);
          }
        }
        var initialFinalizer = this.initialTeardown;
        if (isFunction(initialFinalizer)) {
          try {
            initialFinalizer();
          } catch (e) {
            errors = e instanceof UnsubscriptionError ? e.errors : [e];
          }
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
                if (err instanceof UnsubscriptionError) {
                  errors = __spreadArray(__spreadArray([], __read(errors)), __read(err.errors));
                } else {
                  errors.push(err);
                }
              }
            }
          } catch (e_2_1) {
            e_2 = { error: e_2_1 };
          } finally {
            try {
              if (_finalizers_1_1 && !_finalizers_1_1.done && (_b2 = _finalizers_1.return)) _b2.call(_finalizers_1);
            } finally {
              if (e_2) throw e_2.error;
            }
          }
        }
        if (errors) {
          throw new UnsubscriptionError(errors);
        }
      }
    };
    Subscription2.prototype.add = function(teardown) {
      var _a3;
      if (teardown && teardown !== this) {
        if (this.closed) {
          execFinalizer(teardown);
        } else {
          if (teardown instanceof Subscription2) {
            if (teardown.closed || teardown._hasParent(this)) {
              return;
            }
            teardown._addParent(this);
          }
          (this._finalizers = (_a3 = this._finalizers) !== null && _a3 !== void 0 ? _a3 : []).push(teardown);
        }
      }
    };
    Subscription2.prototype._hasParent = function(parent) {
      var _parentage = this._parentage;
      return _parentage === parent || Array.isArray(_parentage) && _parentage.includes(parent);
    };
    Subscription2.prototype._addParent = function(parent) {
      var _parentage = this._parentage;
      this._parentage = Array.isArray(_parentage) ? (_parentage.push(parent), _parentage) : _parentage ? [_parentage, parent] : parent;
    };
    Subscription2.prototype._removeParent = function(parent) {
      var _parentage = this._parentage;
      if (_parentage === parent) {
        this._parentage = null;
      } else if (Array.isArray(_parentage)) {
        arrRemove(_parentage, parent);
      }
    };
    Subscription2.prototype.remove = function(teardown) {
      var _finalizers = this._finalizers;
      _finalizers && arrRemove(_finalizers, teardown);
      if (teardown instanceof Subscription2) {
        teardown._removeParent(this);
      }
    };
    Subscription2.EMPTY = (function() {
      var empty = new Subscription2();
      empty.closed = true;
      return empty;
    })();
    return Subscription2;
  })();
  var EMPTY_SUBSCRIPTION = Subscription.EMPTY;
  function isSubscription(value) {
    return value instanceof Subscription || value && "closed" in value && isFunction(value.remove) && isFunction(value.add) && isFunction(value.unsubscribe);
  }
  function execFinalizer(finalizer) {
    if (isFunction(finalizer)) {
      finalizer();
    } else {
      finalizer.unsubscribe();
    }
  }
  var config = {
    Promise: void 0
  };
  var timeoutProvider = {
    setTimeout: function(handler, timeout) {
      var args = [];
      for (var _i4 = 2; _i4 < arguments.length; _i4++) {
        args[_i4 - 2] = arguments[_i4];
      }
      return setTimeout.apply(void 0, __spreadArray([handler, timeout], __read(args)));
    },
    clearTimeout: function(handle) {
      return clearTimeout(handle);
    },
    delegate: void 0
  };
  function reportUnhandledError(err) {
    timeoutProvider.setTimeout(function() {
      {
        throw err;
      }
    });
  }
  function noop() {
  }
  function errorContext(cb) {
    {
      cb();
    }
  }
  var Subscriber = (function(_super) {
    __extends(Subscriber2, _super);
    function Subscriber2(destination) {
      var _this = _super.call(this) || this;
      _this.isStopped = false;
      if (destination) {
        _this.destination = destination;
        if (isSubscription(destination)) {
          destination.add(_this);
        }
      } else {
        _this.destination = EMPTY_OBSERVER;
      }
      return _this;
    }
    Subscriber2.create = function(next, error, complete) {
      return new SafeSubscriber(next, error, complete);
    };
    Subscriber2.prototype.next = function(value) {
      if (this.isStopped) ;
      else {
        this._next(value);
      }
    };
    Subscriber2.prototype.error = function(err) {
      if (this.isStopped) ;
      else {
        this.isStopped = true;
        this._error(err);
      }
    };
    Subscriber2.prototype.complete = function() {
      if (this.isStopped) ;
      else {
        this.isStopped = true;
        this._complete();
      }
    };
    Subscriber2.prototype.unsubscribe = function() {
      if (!this.closed) {
        this.isStopped = true;
        _super.prototype.unsubscribe.call(this);
        this.destination = null;
      }
    };
    Subscriber2.prototype._next = function(value) {
      this.destination.next(value);
    };
    Subscriber2.prototype._error = function(err) {
      try {
        this.destination.error(err);
      } finally {
        this.unsubscribe();
      }
    };
    Subscriber2.prototype._complete = function() {
      try {
        this.destination.complete();
      } finally {
        this.unsubscribe();
      }
    };
    return Subscriber2;
  })(Subscription);
  var ConsumerObserver = (function() {
    function ConsumerObserver2(partialObserver) {
      this.partialObserver = partialObserver;
    }
    ConsumerObserver2.prototype.next = function(value) {
      var partialObserver = this.partialObserver;
      if (partialObserver.next) {
        try {
          partialObserver.next(value);
        } catch (error) {
          handleUnhandledError(error);
        }
      }
    };
    ConsumerObserver2.prototype.error = function(err) {
      var partialObserver = this.partialObserver;
      if (partialObserver.error) {
        try {
          partialObserver.error(err);
        } catch (error) {
          handleUnhandledError(error);
        }
      } else {
        handleUnhandledError(err);
      }
    };
    ConsumerObserver2.prototype.complete = function() {
      var partialObserver = this.partialObserver;
      if (partialObserver.complete) {
        try {
          partialObserver.complete();
        } catch (error) {
          handleUnhandledError(error);
        }
      }
    };
    return ConsumerObserver2;
  })();
  var SafeSubscriber = (function(_super) {
    __extends(SafeSubscriber2, _super);
    function SafeSubscriber2(observerOrNext, error, complete) {
      var _this = _super.call(this) || this;
      var partialObserver;
      if (isFunction(observerOrNext) || !observerOrNext) {
        partialObserver = {
          next: observerOrNext !== null && observerOrNext !== void 0 ? observerOrNext : void 0,
          error: error !== null && error !== void 0 ? error : void 0,
          complete: complete !== null && complete !== void 0 ? complete : void 0
        };
      } else {
        {
          partialObserver = observerOrNext;
        }
      }
      _this.destination = new ConsumerObserver(partialObserver);
      return _this;
    }
    return SafeSubscriber2;
  })(Subscriber);
  function handleUnhandledError(error) {
    {
      reportUnhandledError(error);
    }
  }
  function defaultErrorHandler(err) {
    throw err;
  }
  var EMPTY_OBSERVER = {
    closed: true,
    next: noop,
    error: defaultErrorHandler,
    complete: noop
  };
  var observable = (function() {
    return typeof Symbol === "function" && Symbol.observable || "@@observable";
  })();
  function identity(x2) {
    return x2;
  }
  function pipeFromArray(fns) {
    if (fns.length === 0) {
      return identity;
    }
    if (fns.length === 1) {
      return fns[0];
    }
    return function piped(input) {
      return fns.reduce(function(prev, fn2) {
        return fn2(prev);
      }, input);
    };
  }
  var Observable = (function() {
    function Observable2(subscribe) {
      if (subscribe) {
        this._subscribe = subscribe;
      }
    }
    Observable2.prototype.lift = function(operator) {
      var observable2 = new Observable2();
      observable2.source = this;
      observable2.operator = operator;
      return observable2;
    };
    Observable2.prototype.subscribe = function(observerOrNext, error, complete) {
      var _this = this;
      var subscriber = isSubscriber(observerOrNext) ? observerOrNext : new SafeSubscriber(observerOrNext, error, complete);
      errorContext(function() {
        var _a3 = _this, operator = _a3.operator, source = _a3.source;
        subscriber.add(operator ? operator.call(subscriber, source) : source ? _this._subscribe(subscriber) : _this._trySubscribe(subscriber));
      });
      return subscriber;
    };
    Observable2.prototype._trySubscribe = function(sink) {
      try {
        return this._subscribe(sink);
      } catch (err) {
        sink.error(err);
      }
    };
    Observable2.prototype.forEach = function(next, promiseCtor) {
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
    Observable2.prototype._subscribe = function(subscriber) {
      var _a3;
      return (_a3 = this.source) === null || _a3 === void 0 ? void 0 : _a3.subscribe(subscriber);
    };
    Observable2.prototype[observable] = function() {
      return this;
    };
    Observable2.prototype.pipe = function() {
      var operations = [];
      for (var _i4 = 0; _i4 < arguments.length; _i4++) {
        operations[_i4] = arguments[_i4];
      }
      return pipeFromArray(operations)(this);
    };
    Observable2.prototype.toPromise = function(promiseCtor) {
      var _this = this;
      promiseCtor = getPromiseCtor(promiseCtor);
      return new promiseCtor(function(resolve, reject) {
        var value;
        _this.subscribe(function(x2) {
          return value = x2;
        }, function(err) {
          return reject(err);
        }, function() {
          return resolve(value);
        });
      });
    };
    Observable2.create = function(subscribe) {
      return new Observable2(subscribe);
    };
    return Observable2;
  })();
  function getPromiseCtor(promiseCtor) {
    var _a3;
    return (_a3 = promiseCtor !== null && promiseCtor !== void 0 ? promiseCtor : config.Promise) !== null && _a3 !== void 0 ? _a3 : Promise;
  }
  function isObserver(value) {
    return value && isFunction(value.next) && isFunction(value.error) && isFunction(value.complete);
  }
  function isSubscriber(value) {
    return value && value instanceof Subscriber || isObserver(value) && isSubscription(value);
  }
  function hasLift(source) {
    return isFunction(source === null || source === void 0 ? void 0 : source.lift);
  }
  function operate(init) {
    return function(source) {
      if (hasLift(source)) {
        return source.lift(function(liftedSource) {
          try {
            return init(liftedSource, this);
          } catch (err) {
            this.error(err);
          }
        });
      }
      throw new TypeError("Unable to lift unknown Observable type");
    };
  }
  function createOperatorSubscriber(destination, onNext, onComplete, onError, onFinalize) {
    return new OperatorSubscriber(destination, onNext, onComplete, onError, onFinalize);
  }
  var OperatorSubscriber = (function(_super) {
    __extends(OperatorSubscriber2, _super);
    function OperatorSubscriber2(destination, onNext, onComplete, onError, onFinalize, shouldUnsubscribe) {
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
        } catch (err2) {
          destination.error(err2);
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
    OperatorSubscriber2.prototype.unsubscribe = function() {
      var _a3;
      if (!this.shouldUnsubscribe || this.shouldUnsubscribe()) {
        var closed_1 = this.closed;
        _super.prototype.unsubscribe.call(this);
        !closed_1 && ((_a3 = this.onFinalize) === null || _a3 === void 0 ? void 0 : _a3.call(this));
      }
    };
    return OperatorSubscriber2;
  })(Subscriber);
  var ObjectUnsubscribedError = createErrorClass(function(_super) {
    return function ObjectUnsubscribedErrorImpl() {
      _super(this);
      this.name = "ObjectUnsubscribedError";
      this.message = "object unsubscribed";
    };
  });
  var Subject = (function(_super) {
    __extends(Subject2, _super);
    function Subject2() {
      var _this = _super.call(this) || this;
      _this.closed = false;
      _this.currentObservers = null;
      _this.observers = [];
      _this.isStopped = false;
      _this.hasError = false;
      _this.thrownError = null;
      return _this;
    }
    Subject2.prototype.lift = function(operator) {
      var subject = new AnonymousSubject(this, this);
      subject.operator = operator;
      return subject;
    };
    Subject2.prototype._throwIfClosed = function() {
      if (this.closed) {
        throw new ObjectUnsubscribedError();
      }
    };
    Subject2.prototype.next = function(value) {
      var _this = this;
      errorContext(function() {
        var e_1, _a3;
        _this._throwIfClosed();
        if (!_this.isStopped) {
          if (!_this.currentObservers) {
            _this.currentObservers = Array.from(_this.observers);
          }
          try {
            for (var _b2 = __values(_this.currentObservers), _c2 = _b2.next(); !_c2.done; _c2 = _b2.next()) {
              var observer = _c2.value;
              observer.next(value);
            }
          } catch (e_1_1) {
            e_1 = { error: e_1_1 };
          } finally {
            try {
              if (_c2 && !_c2.done && (_a3 = _b2.return)) _a3.call(_b2);
            } finally {
              if (e_1) throw e_1.error;
            }
          }
        }
      });
    };
    Subject2.prototype.error = function(err) {
      var _this = this;
      errorContext(function() {
        _this._throwIfClosed();
        if (!_this.isStopped) {
          _this.hasError = _this.isStopped = true;
          _this.thrownError = err;
          var observers = _this.observers;
          while (observers.length) {
            observers.shift().error(err);
          }
        }
      });
    };
    Subject2.prototype.complete = function() {
      var _this = this;
      errorContext(function() {
        _this._throwIfClosed();
        if (!_this.isStopped) {
          _this.isStopped = true;
          var observers = _this.observers;
          while (observers.length) {
            observers.shift().complete();
          }
        }
      });
    };
    Subject2.prototype.unsubscribe = function() {
      this.isStopped = this.closed = true;
      this.observers = this.currentObservers = null;
    };
    Object.defineProperty(Subject2.prototype, "observed", {
      get: function() {
        var _a3;
        return ((_a3 = this.observers) === null || _a3 === void 0 ? void 0 : _a3.length) > 0;
      },
      enumerable: false,
      configurable: true
    });
    Subject2.prototype._trySubscribe = function(subscriber) {
      this._throwIfClosed();
      return _super.prototype._trySubscribe.call(this, subscriber);
    };
    Subject2.prototype._subscribe = function(subscriber) {
      this._throwIfClosed();
      this._checkFinalizedStatuses(subscriber);
      return this._innerSubscribe(subscriber);
    };
    Subject2.prototype._innerSubscribe = function(subscriber) {
      var _this = this;
      var _a3 = this, hasError = _a3.hasError, isStopped = _a3.isStopped, observers = _a3.observers;
      if (hasError || isStopped) {
        return EMPTY_SUBSCRIPTION;
      }
      this.currentObservers = null;
      observers.push(subscriber);
      return new Subscription(function() {
        _this.currentObservers = null;
        arrRemove(observers, subscriber);
      });
    };
    Subject2.prototype._checkFinalizedStatuses = function(subscriber) {
      var _a3 = this, hasError = _a3.hasError, thrownError = _a3.thrownError, isStopped = _a3.isStopped;
      if (hasError) {
        subscriber.error(thrownError);
      } else if (isStopped) {
        subscriber.complete();
      }
    };
    Subject2.prototype.asObservable = function() {
      var observable2 = new Observable();
      observable2.source = this;
      return observable2;
    };
    Subject2.create = function(destination, source) {
      return new AnonymousSubject(destination, source);
    };
    return Subject2;
  })(Observable);
  var AnonymousSubject = (function(_super) {
    __extends(AnonymousSubject2, _super);
    function AnonymousSubject2(destination, source) {
      var _this = _super.call(this) || this;
      _this.destination = destination;
      _this.source = source;
      return _this;
    }
    AnonymousSubject2.prototype.next = function(value) {
      var _a3, _b2;
      (_b2 = (_a3 = this.destination) === null || _a3 === void 0 ? void 0 : _a3.next) === null || _b2 === void 0 ? void 0 : _b2.call(_a3, value);
    };
    AnonymousSubject2.prototype.error = function(err) {
      var _a3, _b2;
      (_b2 = (_a3 = this.destination) === null || _a3 === void 0 ? void 0 : _a3.error) === null || _b2 === void 0 ? void 0 : _b2.call(_a3, err);
    };
    AnonymousSubject2.prototype.complete = function() {
      var _a3, _b2;
      (_b2 = (_a3 = this.destination) === null || _a3 === void 0 ? void 0 : _a3.complete) === null || _b2 === void 0 ? void 0 : _b2.call(_a3);
    };
    AnonymousSubject2.prototype._subscribe = function(subscriber) {
      var _a3, _b2;
      return (_b2 = (_a3 = this.source) === null || _a3 === void 0 ? void 0 : _a3.subscribe(subscriber)) !== null && _b2 !== void 0 ? _b2 : EMPTY_SUBSCRIPTION;
    };
    return AnonymousSubject2;
  })(Subject);
  var dateTimestampProvider = {
    now: function() {
      return (dateTimestampProvider.delegate || Date).now();
    },
    delegate: void 0
  };
  var ReplaySubject = (function(_super) {
    __extends(ReplaySubject2, _super);
    function ReplaySubject2(_bufferSize, _windowTime, _timestampProvider) {
      if (_bufferSize === void 0) {
        _bufferSize = Infinity;
      }
      if (_windowTime === void 0) {
        _windowTime = Infinity;
      }
      if (_timestampProvider === void 0) {
        _timestampProvider = dateTimestampProvider;
      }
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
    ReplaySubject2.prototype.next = function(value) {
      var _a3 = this, isStopped = _a3.isStopped, _buffer = _a3._buffer, _infiniteTimeWindow = _a3._infiniteTimeWindow, _timestampProvider = _a3._timestampProvider, _windowTime = _a3._windowTime;
      if (!isStopped) {
        _buffer.push(value);
        !_infiniteTimeWindow && _buffer.push(_timestampProvider.now() + _windowTime);
      }
      this._trimBuffer();
      _super.prototype.next.call(this, value);
    };
    ReplaySubject2.prototype._subscribe = function(subscriber) {
      this._throwIfClosed();
      this._trimBuffer();
      var subscription = this._innerSubscribe(subscriber);
      var _a3 = this, _infiniteTimeWindow = _a3._infiniteTimeWindow, _buffer = _a3._buffer;
      var copy = _buffer.slice();
      for (var i = 0; i < copy.length && !subscriber.closed; i += _infiniteTimeWindow ? 1 : 2) {
        subscriber.next(copy[i]);
      }
      this._checkFinalizedStatuses(subscriber);
      return subscription;
    };
    ReplaySubject2.prototype._trimBuffer = function() {
      var _a3 = this, _bufferSize = _a3._bufferSize, _timestampProvider = _a3._timestampProvider, _buffer = _a3._buffer, _infiniteTimeWindow = _a3._infiniteTimeWindow;
      var adjustedBufferSize = (_infiniteTimeWindow ? 1 : 2) * _bufferSize;
      _bufferSize < Infinity && adjustedBufferSize < _buffer.length && _buffer.splice(0, _buffer.length - adjustedBufferSize);
      if (!_infiniteTimeWindow) {
        var now = _timestampProvider.now();
        var last = 0;
        for (var i = 1; i < _buffer.length && _buffer[i] <= now; i += 2) {
          last = i;
        }
        last && _buffer.splice(0, last + 1);
      }
    };
    return ReplaySubject2;
  })(Subject);
  var isArrayLike = (function(x2) {
    return x2 && typeof x2.length === "number" && typeof x2 !== "function";
  });
  function isPromise(value) {
    return isFunction(value === null || value === void 0 ? void 0 : value.then);
  }
  function isInteropObservable(input) {
    return isFunction(input[observable]);
  }
  function isAsyncIterable(obj) {
    return Symbol.asyncIterator && isFunction(obj === null || obj === void 0 ? void 0 : obj[Symbol.asyncIterator]);
  }
  function createInvalidObservableTypeError(input) {
    return new TypeError("You provided " + (input !== null && typeof input === "object" ? "an invalid object" : "'" + input + "'") + " where a stream was expected. You can provide an Observable, Promise, ReadableStream, Array, AsyncIterable, or Iterable.");
  }
  function getSymbolIterator() {
    if (typeof Symbol !== "function" || !Symbol.iterator) {
      return "@@iterator";
    }
    return Symbol.iterator;
  }
  var iterator = getSymbolIterator();
  function isIterable(input) {
    return isFunction(input === null || input === void 0 ? void 0 : input[iterator]);
  }
  function readableStreamLikeToAsyncGenerator(readableStream) {
    return __asyncGenerator(this, arguments, function readableStreamLikeToAsyncGenerator_1() {
      var reader, _a3, value, done;
      return __generator(this, function(_b2) {
        switch (_b2.label) {
          case 0:
            reader = readableStream.getReader();
            _b2.label = 1;
          case 1:
            _b2.trys.push([1, , 9, 10]);
            _b2.label = 2;
          case 2:
            return [4, __await(reader.read())];
          case 3:
            _a3 = _b2.sent(), value = _a3.value, done = _a3.done;
            if (!done) return [3, 5];
            return [4, __await(void 0)];
          case 4:
            return [2, _b2.sent()];
          case 5:
            return [4, __await(value)];
          case 6:
            return [4, _b2.sent()];
          case 7:
            _b2.sent();
            return [3, 2];
          case 8:
            return [3, 10];
          case 9:
            reader.releaseLock();
            return [7];
          case 10:
            return [2];
        }
      });
    });
  }
  function isReadableStreamLike(obj) {
    return isFunction(obj === null || obj === void 0 ? void 0 : obj.getReader);
  }
  function innerFrom(input) {
    if (input instanceof Observable) {
      return input;
    }
    if (input != null) {
      if (isInteropObservable(input)) {
        return fromInteropObservable(input);
      }
      if (isArrayLike(input)) {
        return fromArrayLike(input);
      }
      if (isPromise(input)) {
        return fromPromise(input);
      }
      if (isAsyncIterable(input)) {
        return fromAsyncIterable(input);
      }
      if (isIterable(input)) {
        return fromIterable(input);
      }
      if (isReadableStreamLike(input)) {
        return fromReadableStreamLike(input);
      }
    }
    throw createInvalidObservableTypeError(input);
  }
  function fromInteropObservable(obj) {
    return new Observable(function(subscriber) {
      var obs = obj[observable]();
      if (isFunction(obs.subscribe)) {
        return obs.subscribe(subscriber);
      }
      throw new TypeError("Provided object does not correctly implement Symbol.observable");
    });
  }
  function fromArrayLike(array) {
    return new Observable(function(subscriber) {
      for (var i = 0; i < array.length && !subscriber.closed; i++) {
        subscriber.next(array[i]);
      }
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
      var e_1, _a3;
      try {
        for (var iterable_1 = __values(iterable), iterable_1_1 = iterable_1.next(); !iterable_1_1.done; iterable_1_1 = iterable_1.next()) {
          var value = iterable_1_1.value;
          subscriber.next(value);
          if (subscriber.closed) {
            return;
          }
        }
      } catch (e_1_1) {
        e_1 = { error: e_1_1 };
      } finally {
        try {
          if (iterable_1_1 && !iterable_1_1.done && (_a3 = iterable_1.return)) _a3.call(iterable_1);
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
    var e_2, _a3;
    return __awaiter(this, void 0, void 0, function() {
      var value, e_2_1;
      return __generator(this, function(_b2) {
        switch (_b2.label) {
          case 0:
            _b2.trys.push([0, 5, 6, 11]);
            asyncIterable_1 = __asyncValues(asyncIterable);
            _b2.label = 1;
          case 1:
            return [4, asyncIterable_1.next()];
          case 2:
            if (!(asyncIterable_1_1 = _b2.sent(), !asyncIterable_1_1.done)) return [3, 4];
            value = asyncIterable_1_1.value;
            subscriber.next(value);
            if (subscriber.closed) {
              return [2];
            }
            _b2.label = 3;
          case 3:
            return [3, 1];
          case 4:
            return [3, 11];
          case 5:
            e_2_1 = _b2.sent();
            e_2 = { error: e_2_1 };
            return [3, 11];
          case 6:
            _b2.trys.push([6, , 9, 10]);
            if (!(asyncIterable_1_1 && !asyncIterable_1_1.done && (_a3 = asyncIterable_1.return))) return [3, 8];
            return [4, _a3.call(asyncIterable_1)];
          case 7:
            _b2.sent();
            _b2.label = 8;
          case 8:
            return [3, 10];
          case 9:
            if (e_2) throw e_2.error;
            return [7];
          case 10:
            return [7];
          case 11:
            subscriber.complete();
            return [2];
        }
      });
    });
  }
  function map(project, thisArg) {
    return operate(function(source, subscriber) {
      var index = 0;
      source.subscribe(createOperatorSubscriber(subscriber, function(value) {
        subscriber.next(project.call(thisArg, value, index++));
      }));
    });
  }
  function scanInternals(accumulator, seed, hasSeed, emitOnNext, emitBeforeComplete) {
    return function(source, subscriber) {
      var hasState = hasSeed;
      var state = seed;
      var index = 0;
      source.subscribe(createOperatorSubscriber(subscriber, function(value) {
        var i = index++;
        state = hasState ? accumulator(state, value, i) : (hasState = true, value);
        subscriber.next(state);
      }, emitBeforeComplete));
    };
  }
  function scan(accumulator, seed) {
    return operate(scanInternals(accumulator, seed, arguments.length >= 2, true));
  }
  function share(options) {
    if (options === void 0) {
      options = {};
    }
    var _a3 = options.connector, connector = _a3 === void 0 ? function() {
      return new Subject();
    } : _a3, _b2 = options.resetOnError, resetOnError = _b2 === void 0 ? true : _b2, _c2 = options.resetOnComplete, resetOnComplete = _c2 === void 0 ? true : _c2, _d2 = options.resetOnRefCountZero, resetOnRefCountZero = _d2 === void 0 ? true : _d2;
    return function(wrapperSource) {
      var connection;
      var resetConnection;
      var subject;
      var refCount = 0;
      var hasCompleted = false;
      var hasErrored = false;
      var cancelReset = function() {
        resetConnection === null || resetConnection === void 0 ? void 0 : resetConnection.unsubscribe();
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
        conn === null || conn === void 0 ? void 0 : conn.unsubscribe();
      };
      return operate(function(source, subscriber) {
        refCount++;
        if (!hasErrored && !hasCompleted) {
          cancelReset();
        }
        var dest = subject = subject !== null && subject !== void 0 ? subject : connector();
        subscriber.add(function() {
          refCount--;
          if (refCount === 0 && !hasErrored && !hasCompleted) {
            resetConnection = handleReset(resetAndUnsubscribe, resetOnRefCountZero);
          }
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
  function handleReset(reset, on2) {
    var args = [];
    for (var _i4 = 2; _i4 < arguments.length; _i4++) {
      args[_i4 - 2] = arguments[_i4];
    }
    if (on2 === true) {
      reset();
      return;
    }
    if (on2 === false) {
      return;
    }
    var onSubscriber = new SafeSubscriber({
      next: function() {
        onSubscriber.unsubscribe();
        reset();
      }
    });
    return innerFrom(on2.apply(void 0, __spreadArray([], __read(args)))).subscribe(onSubscriber);
  }
  function shareReplay(configOrBufferSize, windowTime, scheduler) {
    var bufferSize;
    var refCount = false;
    {
      bufferSize = configOrBufferSize;
    }
    return share({
      connector: function() {
        return new ReplaySubject(bufferSize, windowTime, scheduler);
      },
      resetOnError: true,
      resetOnComplete: false,
      resetOnRefCountZero: refCount
    });
  }
  function takeUntil(notifier) {
    return operate(function(source, subscriber) {
      innerFrom(notifier).subscribe(createOperatorSubscriber(subscriber, function() {
        return subscriber.complete();
      }, noop));
      !subscriber.closed && source.subscribe(subscriber);
    });
  }
  class InfiniteScroller {
    constructor(options) {
      __publicField(this, "paginationOffset", 1);
      __publicField(this, "rules");
      __publicField(this, "observer");
      __publicField(this, "paginationGenerator");
      __publicField(this, "subject", new Subject());
      __publicField(this, "generatorConsumer", async () => {
        if (!this.rules.store.state.infiniteScrollEnabled) return true;
        const { value, done } = await this.paginationGenerator.next();
        if (done) return false;
        const { url, offset } = value;
        await this.doScroll(url, offset);
        return true;
      });
      this.rules = options.rules;
      this.paginationOffset = this.rules.paginationStrategy.getPaginationOffset();
      Object.assign(this, options);
      if (this.rules.getPaginationData) {
        this.getPaginationData = this.rules.getPaginationData;
      }
      this.paginationGenerator = this.rules.customGenerator || InfiniteScroller.generatorForPaginationStrategy(this.rules.paginationStrategy);
      this.setObserver(this.rules.observable);
      this.setAutoScroll();
    }
    dispose() {
      if (this.observer) this.observer.dispose();
    }
    setObserver(observable2) {
      if (this.observer) this.observer.dispose();
      this.observer = Observer.observeWhile(
        observable2,
        this.generatorConsumer,
        this.rules.store.state.delay
      );
      return this;
    }
    setAutoScroll() {
      const autoScrollWrapper = async () => {
        if (this.rules.store.state.autoScroll) {
          await wait(this.rules.store.state.delay);
          const res = await this.generatorConsumer();
          if (!res) return;
          await autoScrollWrapper();
        }
      };
      autoScrollWrapper();
      this.rules.store.stateSubject.subscribe((type) => {
        if (type == null ? void 0 : type.autoScroll) {
          autoScrollWrapper();
        }
      });
    }
    async getPaginationData(url) {
      return await fetchHtml(url);
    }
    async doScroll(url, offset) {
      const page = await this.getPaginationData(url);
      this.paginationOffset = Math.max(this.paginationOffset, offset);
      this.subject.next({ type: "scroll", scroller: this, page });
      if (this.rules.store.state.writeHistory) {
        history.replaceState({}, "", url);
      }
    }
    static async *generatorForPaginationStrategy(pstrategy) {
      const _offset = pstrategy.getPaginationOffset();
      const end = pstrategy.getPaginationLast();
      const urlGenerator = pstrategy.getPaginationUrlGenerator();
      for (let offset = _offset; offset <= end; offset++) {
        const url = await urlGenerator(offset);
        yield { url, offset };
      }
    }
    static create(rules) {
      rules.store.state.$paginationLast = rules.paginationStrategy.getPaginationLast();
      const infiniteScroller = new InfiniteScroller({ rules });
      rules.store.state.$paginationOffset = infiniteScroller.paginationOffset;
      infiniteScroller.subject.subscribe((x2) => {
        if (x2.type === "scroll") {
          rules.store.state.$paginationOffset = x2.scroller.paginationOffset;
          const prevScrollPos = document.documentElement.scrollTop;
          rules.dataManager.parseData(x2.page).then(() => {
            window.scrollTo(0, prevScrollPos);
          });
        }
      });
      return infiniteScroller;
    }
  }
  class PaginationStrategy {
    constructor(options) {
      __publicField(this, "doc", document);
      __publicField(this, "url");
      __publicField(this, "paginationSelector", ".pagination");
      __publicField(this, "searchParamSelector", "page");
      __publicField(this, "pathnameSelector", /\/(\d+)\/?$/);
      __publicField(this, "dataparamSelector", "[data-parameters *= from]");
      __publicField(this, "overwritePaginationLast");
      __publicField(this, "offsetMin", 1);
      if (options) {
        Object.entries(options).forEach(([k2, v2]) => {
          Object.assign(this, { [k2]: v2 });
        });
      }
      this.url = parseUrl((options == null ? void 0 : options.url) || this.doc.URL);
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
      return (_2) => this.url.href;
    }
  }
  __publicField(PaginationStrategy, "_pathnameSelector", /\/(page\/)?\d+\/?$/);
  class PaginationStrategyDataParams extends PaginationStrategy {
    getPaginationLast() {
      var _a3;
      const links = (_a3 = this.getPaginationElement()) == null ? void 0 : _a3.querySelectorAll(this.dataparamSelector);
      const pages = Array.from(links || [], (l) => {
        var _a4;
        const p = l.getAttribute("data-parameters");
        const v2 = ((_a4 = p == null ? void 0 : p.match(/from\w*:(\d+)/)) == null ? void 0 : _a4[1]) || this.offsetMin.toString();
        return parseInt(v2);
      });
      const lastPage = Math.max(...pages, this.offsetMin);
      if (this.overwritePaginationLast) return this.overwritePaginationLast(lastPage);
      return lastPage;
    }
    getPaginationOffset() {
      var _a3, _b2;
      const link = (_a3 = this.getPaginationElement()) == null ? void 0 : _a3.querySelector(
        ".prev[data-parameters *= from], .prev [data-parameters *= from]"
      );
      if (!link) return this.offsetMin;
      const p = link.getAttribute("data-parameters");
      const v2 = ((_b2 = p == null ? void 0 : p.match(/from\w*:(\d+)/)) == null ? void 0 : _b2[1]) || this.offsetMin.toString();
      return parseInt(v2);
    }
    getPaginationUrlGenerator() {
      var _a3;
      const url = new URL(this.url.href);
      const parametersElement = (_a3 = this.getPaginationElement()) == null ? void 0 : _a3.querySelector(
        "a[data-block-id][data-parameters]"
      );
      const block_id = (parametersElement == null ? void 0 : parametersElement.getAttribute("data-block-id")) || "";
      const parameters = parseDataParams(
        (parametersElement == null ? void 0 : parametersElement.getAttribute("data-parameters")) || ""
      );
      const attrs = {
        block_id,
        function: "get_block",
        mode: "async",
        ...parameters
      };
      Object.keys(attrs).forEach((k2) => {
        url.searchParams.set(k2, attrs[k2]);
      });
      const paginationUrlGenerator = (n) => {
        Object.keys(attrs).forEach((k2) => {
          k2.includes("from") && url.searchParams.set(k2, n.toString());
        });
        url.searchParams.set("_", Date.now().toString());
        return url.href;
      };
      return paginationUrlGenerator;
    }
    static testLinks(doc = document) {
      const dataParamLinks = Array.from(
        doc.querySelectorAll("[data-parameters *= from]")
      );
      return dataParamLinks.length > 0;
    }
  }
  var Pe$1 = Object.defineProperty;
  var a = (e, t) => Pe$1(e, "name", { value: t, configurable: true });
  var P = class {
    constructor(t, r, n, c, l, f2) {
      __publicField(this, "type", 3);
      __publicField(this, "name", "");
      __publicField(this, "prefix", "");
      __publicField(this, "value", "");
      __publicField(this, "suffix", "");
      __publicField(this, "modifier", 3);
      this.type = t, this.name = r, this.prefix = n, this.value = c, this.suffix = l, this.modifier = f2;
    }
    hasCustomName() {
      return this.name !== "" && typeof this.name != "number";
    }
  };
  a(P, "Part");
  var Re$1 = /[$_\p{ID_Start}]/u, Ee$1 = /[$_\u200C\u200D\p{ID_Continue}]/u, v = ".*";
  function Oe(e, t) {
    return (t ? /^[\x00-\xFF]*$/ : /^[\x00-\x7F]*$/).test(e);
  }
  a(Oe, "isASCII");
  function D(e, t = false) {
    let r = [], n = 0;
    for (; n < e.length; ) {
      let c = e[n], l = a(function(f2) {
        if (!t) throw new TypeError(f2);
        r.push({ type: "INVALID_CHAR", index: n, value: e[n++] });
      }, "ErrorOrInvalid");
      if (c === "*") {
        r.push({ type: "ASTERISK", index: n, value: e[n++] });
        continue;
      }
      if (c === "+" || c === "?") {
        r.push({ type: "OTHER_MODIFIER", index: n, value: e[n++] });
        continue;
      }
      if (c === "\\") {
        r.push({ type: "ESCAPED_CHAR", index: n++, value: e[n++] });
        continue;
      }
      if (c === "{") {
        r.push({ type: "OPEN", index: n, value: e[n++] });
        continue;
      }
      if (c === "}") {
        r.push({ type: "CLOSE", index: n, value: e[n++] });
        continue;
      }
      if (c === ":") {
        let f2 = "", s = n + 1;
        for (; s < e.length; ) {
          let i = e.substr(s, 1);
          if (s === n + 1 && Re$1.test(i) || s !== n + 1 && Ee$1.test(i)) {
            f2 += e[s++];
            continue;
          }
          break;
        }
        if (!f2) {
          l(`Missing parameter name at ${n}`);
          continue;
        }
        r.push({ type: "NAME", index: n, value: f2 }), n = s;
        continue;
      }
      if (c === "(") {
        let f2 = 1, s = "", i = n + 1, o = false;
        if (e[i] === "?") {
          l(`Pattern cannot start with "?" at ${i}`);
          continue;
        }
        for (; i < e.length; ) {
          if (!Oe(e[i], false)) {
            l(`Invalid character '${e[i]}' at ${i}.`), o = true;
            break;
          }
          if (e[i] === "\\") {
            s += e[i++] + e[i++];
            continue;
          }
          if (e[i] === ")") {
            if (f2--, f2 === 0) {
              i++;
              break;
            }
          } else if (e[i] === "(" && (f2++, e[i + 1] !== "?")) {
            l(`Capturing groups are not allowed at ${i}`), o = true;
            break;
          }
          s += e[i++];
        }
        if (o) continue;
        if (f2) {
          l(`Unbalanced pattern at ${n}`);
          continue;
        }
        if (!s) {
          l(`Missing pattern at ${n}`);
          continue;
        }
        r.push({ type: "REGEX", index: n, value: s }), n = i;
        continue;
      }
      r.push({ type: "CHAR", index: n, value: e[n++] });
    }
    return r.push({ type: "END", index: n, value: "" }), r;
  }
  a(D, "lexer");
  function F(e, t = {}) {
    let r = D(e);
    t.delimiter ?? (t.delimiter = "/#?"), t.prefixes ?? (t.prefixes = "./");
    let n = `[^${x(t.delimiter)}]+?`, c = [], l = 0, f2 = 0, i = /* @__PURE__ */ new Set(), o = a((u) => {
      if (f2 < r.length && r[f2].type === u) return r[f2++].value;
    }, "tryConsume"), h = a(() => o("OTHER_MODIFIER") ?? o("ASTERISK"), "tryConsumeModifier"), p = a((u) => {
      let d = o(u);
      if (d !== void 0) return d;
      let { type: g, index: y } = r[f2];
      throw new TypeError(`Unexpected ${g} at ${y}, expected ${u}`);
    }, "mustConsume"), A = a(() => {
      let u = "", d;
      for (; d = o("CHAR") ?? o("ESCAPED_CHAR"); ) u += d;
      return u;
    }, "consumeText"), xe2 = a((u) => u, "DefaultEncodePart"), N = t.encodePart || xe2, H2 = "", $2 = a((u) => {
      H2 += u;
    }, "appendToPendingFixedValue"), M2 = a(() => {
      H2.length && (c.push(new P(3, "", "", N(H2), "", 3)), H2 = "");
    }, "maybeAddPartFromPendingFixedValue"), X2 = a((u, d, g, y, Z2) => {
      let m = 3;
      switch (Z2) {
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
        $2(u);
        return;
      }
      if (M2(), !d && !g) {
        if (!u) return;
        c.push(new P(3, "", "", N(u), "", m));
        return;
      }
      let S;
      g ? g === "*" ? S = v : S = g : S = n;
      let k2 = 2;
      S === n ? (k2 = 1, S = "") : S === v && (k2 = 0, S = "");
      let E;
      if (d ? E = d : g && (E = l++), i.has(E)) throw new TypeError(`Duplicate name '${E}'.`);
      i.add(E), c.push(new P(k2, E, N(u), S, N(y), m));
    }, "addPart");
    for (; f2 < r.length; ) {
      let u = o("CHAR"), d = o("NAME"), g = o("REGEX");
      if (!d && !g && (g = o("ASTERISK")), d || g) {
        let m = u ?? "";
        t.prefixes.indexOf(m) === -1 && ($2(m), m = ""), M2();
        let S = h();
        X2(m, d, g, "", S);
        continue;
      }
      let y = u ?? o("ESCAPED_CHAR");
      if (y) {
        $2(y);
        continue;
      }
      if (o("OPEN")) {
        let m = A(), S = o("NAME"), k2 = o("REGEX");
        !S && !k2 && (k2 = o("ASTERISK"));
        let E = A();
        p("CLOSE");
        let be2 = h();
        X2(m, S, k2, E, be2);
        continue;
      }
      M2(), p("END");
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
      case 0:
        return "*";
      case 1:
        return "?";
      case 2:
        return "+";
      case 3:
        return "";
    }
  }
  a(T, "modifierToString");
  function W$1(e, t, r = {}) {
    r.delimiter ?? (r.delimiter = "/#?"), r.prefixes ?? (r.prefixes = "./"), r.sensitive ?? (r.sensitive = false), r.strict ?? (r.strict = false), r.end ?? (r.end = true), r.start ?? (r.start = true), r.endsWith = "";
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
    let f2 = false;
    if (e.length) {
      let s = e[e.length - 1];
      s.type === 3 && s.modifier === 3 && (f2 = r.delimiter.indexOf(s) > -1);
    }
    return f2 || (n += `(?=${l}|${c})`), new RegExp(n, B$1(r));
  }
  a(W$1, "partsToRegexp");
  var b = { delimiter: "", prefixes: "", sensitive: true, strict: true }, J$1 = { delimiter: ".", prefixes: "", sensitive: true, strict: true }, Q$1 = { delimiter: "/", prefixes: "/", sensitive: true, strict: true };
  function ee$1(e, t) {
    return e.length ? e[0] === "/" ? true : !t || e.length < 2 ? false : (e[0] == "\\" || e[0] == "{") && e[1] == "/" : false;
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
    return !e || e.length < 2 ? false : e[0] === "[" || (e[0] === "\\" || e[0] === "{") && e[1] === "[";
  }
  a(_, "treatAsIPv6Hostname");
  var re$1 = ["ftp", "file", "http", "https", "ws", "wss"];
  function U(e) {
    if (!e) return true;
    for (let t of re$1) if (e.test(t)) return true;
    return false;
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
      case "http":
        return "80";
      case "wws":
      case "https":
        return "443";
      case "ftp":
        return "21";
      default:
        return "";
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
  var C$1 = (_a2 = class {
    constructor(t) {
      __privateAdd(this, _C_instances);
      __privateAdd(this, _i2);
      __privateAdd(this, _n2, []);
      __privateAdd(this, _t, {});
      __privateAdd(this, _e2, 0);
      __privateAdd(this, _s2, 1);
      __privateAdd(this, _l2, 0);
      __privateAdd(this, _o2, 0);
      __privateAdd(this, _d, 0);
      __privateAdd(this, _p2, 0);
      __privateAdd(this, _g, false);
      __privateSet(this, _i2, t);
    }
    get result() {
      return __privateGet(this, _t);
    }
    parse() {
      for (__privateSet(this, _n2, D(__privateGet(this, _i2), true)); __privateGet(this, _e2) < __privateGet(this, _n2).length; __privateSet(this, _e2, __privateGet(this, _e2) + __privateGet(this, _s2))) {
        if (__privateSet(this, _s2, 1), __privateGet(this, _n2)[__privateGet(this, _e2)].type === "END") {
          if (__privateGet(this, _o2) === 0) {
            __privateMethod(this, _C_instances, b_fn).call(this), __privateMethod(this, _C_instances, f_fn).call(this) ? __privateMethod(this, _C_instances, r_fn).call(this, 9, 1) : __privateMethod(this, _C_instances, h_fn).call(this) ? __privateMethod(this, _C_instances, r_fn).call(this, 8, 1) : __privateMethod(this, _C_instances, r_fn).call(this, 7, 0);
            continue;
          } else if (__privateGet(this, _o2) === 2) {
            __privateMethod(this, _C_instances, u_fn).call(this, 5);
            continue;
          }
          __privateMethod(this, _C_instances, r_fn).call(this, 10, 0);
          break;
        }
        if (__privateGet(this, _d) > 0) if (__privateMethod(this, _C_instances, A_fn).call(this)) __privateSet(this, _d, __privateGet(this, _d) - 1);
        else continue;
        if (__privateMethod(this, _C_instances, T_fn).call(this)) {
          __privateSet(this, _d, __privateGet(this, _d) + 1);
          continue;
        }
        switch (__privateGet(this, _o2)) {
          case 0:
            __privateMethod(this, _C_instances, P_fn).call(this) && __privateMethod(this, _C_instances, u_fn).call(this, 1);
            break;
          case 1:
            if (__privateMethod(this, _C_instances, P_fn).call(this)) {
              __privateMethod(this, _C_instances, C_fn).call(this);
              let t = 7, r = 1;
              __privateMethod(this, _C_instances, E_fn).call(this) ? (t = 2, r = 3) : __privateGet(this, _g) && (t = 2), __privateMethod(this, _C_instances, r_fn).call(this, t, r);
            }
            break;
          case 2:
            __privateMethod(this, _C_instances, S_fn).call(this) ? __privateMethod(this, _C_instances, u_fn).call(this, 3) : (__privateMethod(this, _C_instances, x_fn).call(this) || __privateMethod(this, _C_instances, h_fn).call(this) || __privateMethod(this, _C_instances, f_fn).call(this)) && __privateMethod(this, _C_instances, u_fn).call(this, 5);
            break;
          case 3:
            __privateMethod(this, _C_instances, O_fn).call(this) ? __privateMethod(this, _C_instances, r_fn).call(this, 4, 1) : __privateMethod(this, _C_instances, S_fn).call(this) && __privateMethod(this, _C_instances, r_fn).call(this, 5, 1);
            break;
          case 4:
            __privateMethod(this, _C_instances, S_fn).call(this) && __privateMethod(this, _C_instances, r_fn).call(this, 5, 1);
            break;
          case 5:
            __privateMethod(this, _C_instances, y_fn).call(this) ? __privateSet(this, _p2, __privateGet(this, _p2) + 1) : __privateMethod(this, _C_instances, w_fn).call(this) && __privateSet(this, _p2, __privateGet(this, _p2) - 1), __privateMethod(this, _C_instances, k_fn).call(this) && !__privateGet(this, _p2) ? __privateMethod(this, _C_instances, r_fn).call(this, 6, 1) : __privateMethod(this, _C_instances, x_fn).call(this) ? __privateMethod(this, _C_instances, r_fn).call(this, 7, 0) : __privateMethod(this, _C_instances, h_fn).call(this) ? __privateMethod(this, _C_instances, r_fn).call(this, 8, 1) : __privateMethod(this, _C_instances, f_fn).call(this) && __privateMethod(this, _C_instances, r_fn).call(this, 9, 1);
            break;
          case 6:
            __privateMethod(this, _C_instances, x_fn).call(this) ? __privateMethod(this, _C_instances, r_fn).call(this, 7, 0) : __privateMethod(this, _C_instances, h_fn).call(this) ? __privateMethod(this, _C_instances, r_fn).call(this, 8, 1) : __privateMethod(this, _C_instances, f_fn).call(this) && __privateMethod(this, _C_instances, r_fn).call(this, 9, 1);
            break;
          case 7:
            __privateMethod(this, _C_instances, h_fn).call(this) ? __privateMethod(this, _C_instances, r_fn).call(this, 8, 1) : __privateMethod(this, _C_instances, f_fn).call(this) && __privateMethod(this, _C_instances, r_fn).call(this, 9, 1);
            break;
          case 8:
            __privateMethod(this, _C_instances, f_fn).call(this) && __privateMethod(this, _C_instances, r_fn).call(this, 9, 1);
            break;
        }
      }
      __privateGet(this, _t).hostname !== void 0 && __privateGet(this, _t).port === void 0 && (__privateGet(this, _t).port = "");
    }
  }, _i2 = new WeakMap(), _n2 = new WeakMap(), _t = new WeakMap(), _e2 = new WeakMap(), _s2 = new WeakMap(), _l2 = new WeakMap(), _o2 = new WeakMap(), _d = new WeakMap(), _p2 = new WeakMap(), _g = new WeakMap(), _C_instances = new WeakSet(), r_fn = function(t, r) {
    var _a3, _b2, _c2;
    switch (__privateGet(this, _o2)) {
      case 0:
        break;
      case 1:
        __privateGet(this, _t).protocol = __privateMethod(this, _C_instances, c_fn).call(this);
        break;
      case 2:
        break;
      case 3:
        __privateGet(this, _t).username = __privateMethod(this, _C_instances, c_fn).call(this);
        break;
      case 4:
        __privateGet(this, _t).password = __privateMethod(this, _C_instances, c_fn).call(this);
        break;
      case 5:
        __privateGet(this, _t).hostname = __privateMethod(this, _C_instances, c_fn).call(this);
        break;
      case 6:
        __privateGet(this, _t).port = __privateMethod(this, _C_instances, c_fn).call(this);
        break;
      case 7:
        __privateGet(this, _t).pathname = __privateMethod(this, _C_instances, c_fn).call(this);
        break;
      case 8:
        __privateGet(this, _t).search = __privateMethod(this, _C_instances, c_fn).call(this);
        break;
      case 9:
        __privateGet(this, _t).hash = __privateMethod(this, _C_instances, c_fn).call(this);
        break;
    }
    __privateGet(this, _o2) !== 0 && t !== 10 && ([1, 2, 3, 4].includes(__privateGet(this, _o2)) && [6, 7, 8, 9].includes(t) && ((_a3 = __privateGet(this, _t)).hostname ?? (_a3.hostname = "")), [1, 2, 3, 4, 5, 6].includes(__privateGet(this, _o2)) && [8, 9].includes(t) && ((_b2 = __privateGet(this, _t)).pathname ?? (_b2.pathname = __privateGet(this, _g) ? "/" : "")), [1, 2, 3, 4, 5, 6, 7].includes(__privateGet(this, _o2)) && t === 9 && ((_c2 = __privateGet(this, _t)).search ?? (_c2.search = ""))), __privateMethod(this, _C_instances, R_fn).call(this, t, r);
  }, R_fn = function(t, r) {
    __privateSet(this, _o2, t), __privateSet(this, _l2, __privateGet(this, _e2) + r), __privateSet(this, _e2, __privateGet(this, _e2) + r), __privateSet(this, _s2, 0);
  }, b_fn = function() {
    __privateSet(this, _e2, __privateGet(this, _l2)), __privateSet(this, _s2, 0);
  }, u_fn = function(t) {
    __privateMethod(this, _C_instances, b_fn).call(this), __privateSet(this, _o2, t);
  }, m_fn = function(t) {
    return t < 0 && (t = __privateGet(this, _n2).length - t), t < __privateGet(this, _n2).length ? __privateGet(this, _n2)[t] : __privateGet(this, _n2)[__privateGet(this, _n2).length - 1];
  }, a_fn = function(t, r) {
    let n = __privateMethod(this, _C_instances, m_fn).call(this, t);
    return n.value === r && (n.type === "CHAR" || n.type === "ESCAPED_CHAR" || n.type === "INVALID_CHAR");
  }, P_fn = function() {
    return __privateMethod(this, _C_instances, a_fn).call(this, __privateGet(this, _e2), ":");
  }, E_fn = function() {
    return __privateMethod(this, _C_instances, a_fn).call(this, __privateGet(this, _e2) + 1, "/") && __privateMethod(this, _C_instances, a_fn).call(this, __privateGet(this, _e2) + 2, "/");
  }, S_fn = function() {
    return __privateMethod(this, _C_instances, a_fn).call(this, __privateGet(this, _e2), "@");
  }, O_fn = function() {
    return __privateMethod(this, _C_instances, a_fn).call(this, __privateGet(this, _e2), ":");
  }, k_fn = function() {
    return __privateMethod(this, _C_instances, a_fn).call(this, __privateGet(this, _e2), ":");
  }, x_fn = function() {
    return __privateMethod(this, _C_instances, a_fn).call(this, __privateGet(this, _e2), "/");
  }, h_fn = function() {
    if (__privateMethod(this, _C_instances, a_fn).call(this, __privateGet(this, _e2), "?")) return true;
    if (__privateGet(this, _n2)[__privateGet(this, _e2)].value !== "?") return false;
    let t = __privateMethod(this, _C_instances, m_fn).call(this, __privateGet(this, _e2) - 1);
    return t.type !== "NAME" && t.type !== "REGEX" && t.type !== "CLOSE" && t.type !== "ASTERISK";
  }, f_fn = function() {
    return __privateMethod(this, _C_instances, a_fn).call(this, __privateGet(this, _e2), "#");
  }, T_fn = function() {
    return __privateGet(this, _n2)[__privateGet(this, _e2)].type == "OPEN";
  }, A_fn = function() {
    return __privateGet(this, _n2)[__privateGet(this, _e2)].type == "CLOSE";
  }, y_fn = function() {
    return __privateMethod(this, _C_instances, a_fn).call(this, __privateGet(this, _e2), "[");
  }, w_fn = function() {
    return __privateMethod(this, _C_instances, a_fn).call(this, __privateGet(this, _e2), "]");
  }, c_fn = function() {
    let t = __privateGet(this, _n2)[__privateGet(this, _e2)], r = __privateMethod(this, _C_instances, m_fn).call(this, __privateGet(this, _l2)).index;
    return __privateGet(this, _i2).substring(r, t.index);
  }, C_fn = function() {
    let t = {};
    Object.assign(t, b), t.encodePart = w;
    let r = q$1(__privateMethod(this, _C_instances, c_fn).call(this), void 0, t);
    __privateSet(this, _g, U(r));
  }, _a2);
  a(C$1, "Parser");
  var V = ["protocol", "username", "password", "hostname", "port", "pathname", "search", "hash"], O = "*";
  function Se$1(e, t) {
    if (typeof e != "string") throw new TypeError("parameter 1 is not of type 'string'.");
    let r = new URL(e, t);
    return { protocol: r.protocol.substring(0, r.protocol.length - 1), username: r.username, password: r.password, hostname: r.hostname, port: r.port, pathname: r.pathname, search: r.search !== "" ? r.search.substring(1, r.search.length) : void 0, hash: r.hash !== "" ? r.hash.substring(1, r.hash.length) : void 0 };
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
    t.delimiter ?? (t.delimiter = "/#?"), t.prefixes ?? (t.prefixes = "./"), t.sensitive ?? (t.sensitive = false), t.strict ?? (t.strict = false), t.end ?? (t.end = true), t.start ?? (t.start = true), t.endsWith = "";
    let r = ".*", n = `[^${Te$1(t.delimiter)}]+?`, c = /[$_\u200C\u200D\p{ID_Continue}]/u, l = "";
    for (let f2 = 0; f2 < e.length; ++f2) {
      let s = e[f2];
      if (s.type === 3) {
        if (s.modifier === 3) {
          l += I$1(s.value);
          continue;
        }
        l += `{${I$1(s.value)}}${T(s.modifier)}`;
        continue;
      }
      let i = s.hasCustomName(), o = !!s.suffix.length || !!s.prefix.length && (s.prefix.length !== 1 || !t.prefixes.includes(s.prefix)), h = f2 > 0 ? e[f2 - 1] : null, p = f2 < e.length - 1 ? e[f2 + 1] : null;
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
  var Y = (_b = class {
    constructor(t = {}, r, n) {
      __privateAdd(this, _i3);
      __privateAdd(this, _n3, {});
      __privateAdd(this, _t2, {});
      __privateAdd(this, _e3, {});
      __privateAdd(this, _s3, {});
      __privateAdd(this, _l3, false);
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
        typeof n > "u" && (n = { ignoreCase: false });
        let l = { ignoreCase: n.ignoreCase === true }, f2 = { pathname: O, protocol: O, username: O, password: O, hostname: O, port: O, search: O, hash: O };
        __privateSet(this, _i3, L$1(f2, t, true)), z(__privateGet(this, _i3).protocol) === __privateGet(this, _i3).port && (__privateGet(this, _i3).port = "");
        let s;
        for (s of V) {
          if (!(s in __privateGet(this, _i3))) continue;
          let i = {}, o = __privateGet(this, _i3)[s];
          switch (__privateGet(this, _t2)[s] = [], s) {
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
              U(__privateGet(this, _n3).protocol) ? (Object.assign(i, Q$1, l), i.encodePart = de$1) : (Object.assign(i, b, l), i.encodePart = pe$1);
              break;
            case "search":
              Object.assign(i, b, l), i.encodePart = ge$1;
              break;
            case "hash":
              Object.assign(i, b, l), i.encodePart = me$1;
              break;
          }
          try {
            __privateGet(this, _s3)[s] = F(o, i), __privateGet(this, _n3)[s] = W$1(__privateGet(this, _s3)[s], __privateGet(this, _t2)[s], i), __privateGet(this, _e3)[s] = Ae$1(__privateGet(this, _s3)[s], i), __privateSet(this, _l3, __privateGet(this, _l3) || __privateGet(this, _s3)[s].some((h) => h.type === 2));
          } catch {
            throw new TypeError(`invalid ${s} pattern '${__privateGet(this, _i3)[s]}'.`);
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
      let n = { pathname: "", protocol: "", username: "", password: "", hostname: "", port: "", search: "", hash: "" };
      if (typeof t != "string" && r) throw new TypeError("parameter 1 is not of type 'string'.");
      if (typeof t > "u") return false;
      try {
        typeof t == "object" ? n = L$1(n, t, false) : n = L$1(n, Se$1(t, r), false);
      } catch {
        return false;
      }
      let c;
      for (c of V) if (!__privateGet(this, _n3)[c].exec(n[c])) return false;
      return true;
    }
    exec(t = {}, r) {
      let n = { pathname: "", protocol: "", username: "", password: "", hostname: "", port: "", search: "", hash: "" };
      if (typeof t != "string" && r) throw new TypeError("parameter 1 is not of type 'string'.");
      if (typeof t > "u") return;
      try {
        typeof t == "object" ? n = L$1(n, t, false) : n = L$1(n, Se$1(t, r), false);
      } catch {
        return null;
      }
      let c = {};
      r ? c.inputs = [t, r] : c.inputs = [t];
      let l;
      for (l of V) {
        let f2 = __privateGet(this, _n3)[l].exec(n[l]);
        if (!f2) return null;
        let s = {};
        for (let [i, o] of __privateGet(this, _t2)[l].entries()) if (typeof o == "string" || typeof o == "number") {
          let h = f2[i + 1];
          s[o] = h;
        }
        c[l] = { input: n[l] ?? "", groups: s };
      }
      return c;
    }
    static compareComponent(t, r, n) {
      let c = a((i, o) => {
        for (let h of ["type", "modifier", "prefix", "value", "suffix"]) {
          if (i[h] < o[h]) return -1;
          if (i[h] === o[h]) continue;
          return 1;
        }
        return 0;
      }, "comparePart"), l = new P(3, "", "", "", "", 3), f2 = new P(0, "", "", "", "", 3), s = a((i, o) => {
        let h = 0;
        for (; h < Math.min(i.length, o.length); ++h) {
          let p = c(i[h], o[h]);
          if (p) return p;
        }
        return i.length === o.length ? 0 : c(i[h] ?? l, o[h] ?? l);
      }, "comparePartList");
      return !__privateGet(r, _e3)[t] && !__privateGet(n, _e3)[t] ? 0 : __privateGet(r, _e3)[t] && !__privateGet(n, _e3)[t] ? s(__privateGet(r, _s3)[t], [f2]) : !__privateGet(r, _e3)[t] && __privateGet(n, _e3)[t] ? s([f2], __privateGet(n, _s3)[t]) : s(__privateGet(r, _s3)[t], __privateGet(n, _s3)[t]);
    }
    get protocol() {
      return __privateGet(this, _e3).protocol;
    }
    get username() {
      return __privateGet(this, _e3).username;
    }
    get password() {
      return __privateGet(this, _e3).password;
    }
    get hostname() {
      return __privateGet(this, _e3).hostname;
    }
    get port() {
      return __privateGet(this, _e3).port;
    }
    get pathname() {
      return __privateGet(this, _e3).pathname;
    }
    get search() {
      return __privateGet(this, _e3).search;
    }
    get hash() {
      return __privateGet(this, _e3).hash;
    }
    get hasRegExpGroups() {
      return __privateGet(this, _l3);
    }
  }, _i3 = new WeakMap(), _n3 = new WeakMap(), _t2 = new WeakMap(), _e3 = new WeakMap(), _s3 = new WeakMap(), _l3 = new WeakMap(), _b);
  a(Y, "URLPattern");
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
    const pageLinks = [...doc.querySelectorAll("a[href]")].map((a2) => a2.href).filter((h) => URL.canParse(h));
    return pageLinks.filter((h) => {
      return urlPattern.test(new URL(h, host));
    });
  }
  function upgradePathname(curr, links, pathnamePaginationSelector = /\/(page\/)?\d+\/?$/) {
    if (pathnamePaginationSelector.test(curr.pathname) || links.length < 1) return curr;
    const linksDepaginated = links.map(
      (l) => depaginatePathname(l, pathnamePaginationSelector)
    );
    if (linksDepaginated.some((l) => l.pathname === curr.pathname)) return curr;
    const last = linksDepaginated.at(-1);
    if (last.pathname !== curr.pathname) curr.pathname = last.pathname;
    return curr;
  }
  class PaginationStrategyPathnameParams extends PaginationStrategy {
    constructor() {
      super(...arguments);
      __publicField(this, "extractPage", (a2) => {
        var _a3;
        const href = typeof a2 === "string" ? a2 : a2.href;
        const { pathname } = new URL(href, this.doc.baseURI || this.url.origin);
        return parseInt(
          ((_a3 = pathname.match(this.pathnameSelector)) == null ? void 0 : _a3.pop()) || this.offsetMin.toString()
        );
      });
    }
    static checkLink(link, pathnameSelector = PaginationStrategy._pathnameSelector) {
      return pathnameSelector.test(link.pathname);
    }
    static testLinks(links, options) {
      const result = links.some(
        (h) => PaginationStrategyPathnameParams.checkLink(h, options.pathnameSelector)
      );
      if (result) {
        const pathnamesMatched = links.filter(
          (h) => PaginationStrategyPathnameParams.checkLink(h, options.pathnameSelector)
        );
        options.url = upgradePathname(
          parseUrl(options.url),
          pathnamesMatched
        );
      }
      return result;
    }
    getPaginationLast() {
      const links = getPaginationLinks(
        this.getPaginationElement() || document,
        this.url.href,
        this.pathnameSelector
      );
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
      const pathnameSelectorPlaceholder = this.pathnameSelector.toString().replace(/[/|\\|$|?|(|)]+/g, "/");
      if (!this.pathnameSelector.test(url.pathname)) {
        url.pathname = url.pathname.concat(pathnameSelectorPlaceholder.replace(/d\+/, this.offsetMin.toString())).replace(/\/{2,}/g, "/");
      }
      const paginationUrlGenerator = (offset) => {
        url.pathname = url.pathname.replace(
          this.pathnameSelector,
          pathnameSelectorPlaceholder.replace(/d\+/, offset.toString())
        );
        return url.href;
      };
      return paginationUrlGenerator;
    }
  }
  class PaginationStrategySearchParams extends PaginationStrategy {
    constructor() {
      super(...arguments);
      __publicField(this, "extractPage", (a2) => {
        const href = typeof a2 === "string" ? a2 : a2.href;
        const p = new URL(href).searchParams.get(this.searchParamSelector);
        return parseInt(p) || this.offsetMin;
      });
    }
    getPaginationLast() {
      const links = getPaginationLinks(
        this.getPaginationElement() || document,
        this.url.href
      ).filter(
        (h) => PaginationStrategySearchParams.checkLink(new URL(h), this.searchParamSelector)
      );
      const pages = links.map(this.extractPage);
      const lastPage = Math.max(...pages, this.offsetMin);
      if (this.overwritePaginationLast) return this.overwritePaginationLast(lastPage);
      return lastPage;
    }
    getPaginationOffset() {
      var _a3;
      if (this.doc === document) {
        return this.extractPage(this.url);
      }
      const link = (_a3 = this.getPaginationElement()) == null ? void 0 : _a3.querySelector(
        `a.active[href *= "${this.searchParamSelector}="]`
      );
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
      return links.some(
        (h) => PaginationStrategySearchParams.checkLink(h, searchParamSelector)
      );
    }
  }
  function getPaginationStrategy(options) {
    const _paginationStrategy = new PaginationStrategy(options);
    const pagination = _paginationStrategy.getPaginationElement();
    Object.assign(options, { ..._paginationStrategy });
    const { url, searchParamSelector } = options;
    if (!pagination) {
      return _paginationStrategy;
    }
    if (typeof options.getPaginationUrlGenerator === "function") {
      return new PaginationStrategy(options);
    }
    const pageLinks = getPaginationLinks(pagination, url).map((l) => new URL(l));
    const selectStrategy = () => {
      if (PaginationStrategyDataParams.testLinks(pagination)) {
        return PaginationStrategyDataParams;
      }
      if (PaginationStrategySearchParams.testLinks(pageLinks, searchParamSelector)) {
        return PaginationStrategySearchParams;
      }
      if (PaginationStrategyPathnameParams.testLinks(pageLinks, options)) {
        return PaginationStrategyPathnameParams;
      }
      console.error("Found No Strategy");
      return PaginationStrategy;
    };
    const PaginationStrategyConstructor = selectStrategy();
    const paginationStrategy = new PaginationStrategyConstructor(options);
    return paginationStrategy;
  }
  class ThumbDataParser {
    constructor(strategy = "manual", selectors = {}, callback) {
      __publicField(this, "thumbDataSelectors", []);
      __publicField(this, "defaultThumbDataSelectors", [
        { name: "title", type: "string", selector: "[class *= title],[title]" },
        {
          name: "uploader",
          type: "string",
          selector: "[class *= uploader], [class *= user], [class *= name]"
        },
        { name: "duration", type: "duration", selector: "[class *= duration]" }
        // { name: 'views', type: 'float', selector: '[class *= view]' },
      ]);
      this.strategy = strategy;
      this.selectors = selectors;
      this.callback = callback;
      this.preprocessCustomThumbDataSelectors();
    }
    autoParseText(thumb) {
      var _a3;
      let title = sanitizeStr(thumb.innerText);
      const durationStr = ((_a3 = title.match(/(\d+:\d+:?\d+?)|\d+m/)) == null ? void 0 : _a3[0]) || "";
      const duration = timeToSeconds(durationStr);
      title = title.replaceAll(durationStr, "");
      return { title, duration };
    }
    getUrl(thumb) {
      return querySelectorOrSelf(thumb, "a[href]").href;
    }
    preprocessCustomThumbDataSelectors() {
      if (!this.selectors) return;
      Object.entries(this.selectors).forEach(([key, value]) => {
        if (typeof value === "string") {
          const defaultSelector = this.defaultThumbDataSelectors.find((e) => e.name === key);
          if (!defaultSelector) {
            this.thumbDataSelectors.push({ name: key, selector: value, type: "string" });
          } else {
            defaultSelector.selector = value;
            this.thumbDataSelectors.push(defaultSelector);
          }
        } else {
          this.thumbDataSelectors.push({ name: key, ...value });
        }
      });
    }
    getThumbDataWith(thumb, { type, selector }) {
      var _a3;
      if (type === "boolean") {
        return !!querySelectorOrSelf(thumb, selector);
      }
      if (type === "string") {
        return sanitizeStr(((_a3 = querySelectorLast(thumb, selector)) == null ? void 0 : _a3.innerText) || "");
      }
      if (type === "duration") {
        return timeToSeconds(querySelectorText(thumb, selector));
      }
      if (type === "float") {
        const value = querySelectorText(thumb, selector);
        return parseNumericAbbreviation(value);
      }
      return Number.parseInt(querySelectorText(thumb, selector));
    }
    static create(o = {}) {
      return new ThumbDataParser(o.strategy, o.selectors, o.callback);
    }
    getThumbData(thumb) {
      var _a3;
      if (this.strategy === "auto-text") {
        return this.autoParseText(thumb);
      }
      if (this.strategy === "auto-select") {
        this.thumbDataSelectors.push(...this.defaultThumbDataSelectors);
      }
      const thumbData = Object.fromEntries(
        this.thumbDataSelectors.map((s) => [s.name, this.getThumbDataWith(thumb, s)])
      );
      (_a3 = this.callback) == null ? void 0 : _a3.call(this, thumb, thumbData);
      return thumbData;
    }
  }
  class ThumbImgParser {
    constructor() {
      __publicField(this, "selector");
      __publicField(this, "remove");
      __publicField(this, "strategy", "default");
    }
    static create(options = {}) {
      return Object.assign(new ThumbImgParser(), options);
    }
    removeAttrs(img) {
      if (!this.remove) return;
      if (this.remove === "auto") {
        removeClassesAndDataAttributes(img, "lazy");
      } else {
        if (this.remove.startsWith(".")) {
          img.classList.remove(this.remove.slice(1));
        } else {
          img.removeAttribute(this.remove);
        }
      }
    }
    getImgSrc(img) {
      const possibleAttrs = this.selector ? [this.selector].flat() : ["data-src", "src"];
      for (const attr of possibleAttrs) {
        const imgSrc = img.getAttribute(attr);
        if (imgSrc) {
          return imgSrc;
        }
      }
      return "";
    }
    getImgData(thumb) {
      if (this.strategy === "default" && !this.selector) return {};
      const img = thumb.querySelector("img");
      if (!img) return {};
      const imgSrc = typeof this.selector === "function" ? this.selector(img) : this.getImgSrc(img);
      this.removeAttrs(img);
      if (img.src.includes("data:image")) {
        img.src = "";
      }
      if (img.complete && img.naturalWidth > 0) {
        return {};
      }
      return { img, imgSrc };
    }
  }
  class ThumbsParser {
    constructor() {
      __publicField(this, "selector", ".thumb");
      __publicField(this, "strategy", "default");
      __publicField(this, "transform");
    }
    static create(options = {}) {
      return Object.assign(new ThumbsParser(), options);
    }
    getThumbs(container) {
      if (!container) return [];
      if (this.strategy === "auto") {
        if (typeof this.selector !== "string") return [];
        return [...(container == null ? void 0 : container.children) || []];
      }
      const thumbs = Array.from(container.querySelectorAll(this.selector));
      if (typeof this.transform === "function") {
        thumbs.forEach(this.transform);
      }
      return thumbs;
    }
  }
  var _i = {};
  // @__NO_SIDE_EFFECTS__
  function oe(t) {
    const e = /* @__PURE__ */ Object.create(null);
    for (const n of t.split(",")) e[n] = 1;
    return (n) => n in e;
  }
  const B = _i.NODE_ENV !== "production" ? Object.freeze({}) : {}, Te = _i.NODE_ENV !== "production" ? Object.freeze([]) : [], ot = () => {
  }, vi = () => false, dn = (t) => t.charCodeAt(0) === 111 && t.charCodeAt(1) === 110 && // uppercase letter
  (t.charCodeAt(2) > 122 || t.charCodeAt(2) < 97), In = (t) => t.startsWith("onUpdate:"), X = Object.assign, Jo = (t, e) => {
    const n = t.indexOf(e);
    n > -1 && t.splice(n, 1);
  }, Hs = Object.prototype.hasOwnProperty, I = (t, e) => Hs.call(t, e), C = Array.isArray, _e = (t) => fn(t) === "[object Map]", Zn = (t) => fn(t) === "[object Set]", Nr = (t) => fn(t) === "[object Date]", M = (t) => typeof t == "function", J = (t) => typeof t == "string", Jt = (t) => typeof t == "symbol", L = (t) => t !== null && typeof t == "object", Yo = (t) => (L(t) || M(t)) && M(t.then) && M(t.catch), xi = Object.prototype.toString, fn = (t) => xi.call(t), Xo = (t) => fn(t).slice(8, -1), Qn = (t) => fn(t) === "[object Object]", Zo = (t) => J(t) && t !== "NaN" && t[0] !== "-" && "" + parseInt(t, 10) === t, Qe = /* @__PURE__ */ oe(
    // the leading comma is intentional so empty string "" is also included
    ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
  ), Bs = /* @__PURE__ */ oe(
    "bind,cloak,else-if,else,for,html,if,model,on,once,pre,show,slot,text,memo"
  ), to = (t) => {
    const e = /* @__PURE__ */ Object.create(null);
    return ((n) => e[n] || (e[n] = t(n)));
  }, Ks = /-\w/g, at = to(
    (t) => t.replace(Ks, (e) => e.slice(1).toUpperCase())
  ), Ws = /\B([A-Z])/g, kt = to(
    (t) => t.replace(Ws, "-$1").toLowerCase()
  ), Ee = to((t) => t.charAt(0).toUpperCase() + t.slice(1)), ge = to(
    (t) => t ? `on${Ee(t)}` : ""
  ), pe = (t, e) => !Object.is(t, e), Ve = (t, ...e) => {
    for (let n = 0; n < t.length; n++)
      t[n](...e);
  }, Pn = (t, e, n, o = false) => {
    Object.defineProperty(t, e, {
      configurable: true,
      enumerable: false,
      writable: o,
      value: n
    });
  }, Qo = (t) => {
    const e = parseFloat(t);
    return isNaN(e) ? t : e;
  }, Or = (t) => {
    const e = J(t) ? Number(t) : NaN;
    return isNaN(e) ? t : e;
  };
  let Sr;
  const hn = () => Sr || (Sr = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
  function tr(t) {
    if (C(t)) {
      const e = {};
      for (let n = 0; n < t.length; n++) {
        const o = t[n], r = J(o) ? Ys(o) : tr(o);
        if (r)
          for (const i in r)
            e[i] = r[i];
      }
      return e;
    } else if (J(t) || L(t))
      return t;
  }
  const qs = /;(?![^(]*\))/g, Gs = /:([^]+)/, Js = /\/\*[^]*?\*\//g;
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
    if (J(t))
      e = t;
    else if (C(t))
      for (let n = 0; n < t.length; n++) {
        const o = er(t[n]);
        o && (e += o + " ");
      }
    else if (L(t))
      for (const n in t)
        t[n] && (e += n + " ");
    return e.trim();
  }
  const Xs = "html,body,base,head,link,meta,style,title,address,article,aside,footer,header,hgroup,h1,h2,h3,h4,h5,h6,nav,section,div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,ruby,s,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,embed,object,param,source,canvas,script,noscript,del,ins,caption,col,colgroup,table,thead,tbody,td,th,tr,button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,output,progress,select,textarea,details,dialog,menu,summary,template,blockquote,iframe,tfoot", Zs = "svg,animate,animateMotion,animateTransform,circle,clipPath,color-profile,defs,desc,discard,ellipse,feBlend,feColorMatrix,feComponentTransfer,feComposite,feConvolveMatrix,feDiffuseLighting,feDisplacementMap,feDistantLight,feDropShadow,feFlood,feFuncA,feFuncB,feFuncG,feFuncR,feGaussianBlur,feImage,feMerge,feMergeNode,feMorphology,feOffset,fePointLight,feSpecularLighting,feSpotLight,feTile,feTurbulence,filter,foreignObject,g,hatch,hatchpath,image,line,linearGradient,marker,mask,mesh,meshgradient,meshpatch,meshrow,metadata,mpath,path,pattern,polygon,polyline,radialGradient,rect,set,solidcolor,stop,switch,symbol,text,textPath,title,tspan,unknown,use,view", Qs = "annotation,annotation-xml,maction,maligngroup,malignmark,math,menclose,merror,mfenced,mfrac,mfraction,mglyph,mi,mlabeledtr,mlongdiv,mmultiscripts,mn,mo,mover,mpadded,mphantom,mprescripts,mroot,mrow,ms,mscarries,mscarry,msgroup,msline,mspace,msqrt,msrow,mstack,mstyle,msub,msubsup,msup,mtable,mtd,mtext,mtr,munder,munderover,none,semantics", ta = /* @__PURE__ */ oe(Xs), ea = /* @__PURE__ */ oe(Zs), na = /* @__PURE__ */ oe(Qs), oa = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", ra = /* @__PURE__ */ oe(oa);
  function wi(t) {
    return !!t || t === "";
  }
  function ia(t, e) {
    if (t.length !== e.length) return false;
    let n = true;
    for (let o = 0; n && o < t.length; o++)
      n = eo(t[o], e[o]);
    return n;
  }
  function eo(t, e) {
    if (t === e) return true;
    let n = Nr(t), o = Nr(e);
    if (n || o)
      return n && o ? t.getTime() === e.getTime() : false;
    if (n = Jt(t), o = Jt(e), n || o)
      return t === e;
    if (n = C(t), o = C(e), n || o)
      return n && o ? ia(t, e) : false;
    if (n = L(t), o = L(e), n || o) {
      if (!n || !o)
        return false;
      const r = Object.keys(t).length, i = Object.keys(e).length;
      if (r !== i)
        return false;
      for (const s in t) {
        const a2 = t.hasOwnProperty(s), u = e.hasOwnProperty(s);
        if (a2 && !u || !a2 && u || !eo(t[s], e[s]))
          return false;
      }
    }
    return String(t) === String(e);
  }
  function Ei(t, e) {
    return t.findIndex((n) => eo(n, e));
  }
  const ki = (t) => !!(t && t.__v_isRef === true), Le = (t) => J(t) ? t : t == null ? "" : C(t) || L(t) && (t.toString === xi || !M(t.toString)) ? ki(t) ? Le(t.value) : JSON.stringify(t, Ni, 2) : String(t), Ni = (t, e) => ki(e) ? Ni(t, e.value) : _e(e) ? {
    [`Map(${e.size})`]: [...e.entries()].reduce(
      (n, [o, r], i) => (n[bo(o, i) + " =>"] = r, n),
      {}
    )
  } : Zn(e) ? {
    [`Set(${e.size})`]: [...e.values()].map((n) => bo(n))
  } : Jt(e) ? bo(e) : L(e) && !C(e) && !Qn(e) ? String(e) : e, bo = (t, e = "") => {
    var n;
    return (
      // Symbol.description in es2019+ so we need to cast here to pass
      // the lib: es2016 check
      Jt(t) ? `Symbol(${(n = t.description) != null ? n : e})` : t
    );
  };
  var q = {};
  function $t(t, ...e) {
    console.warn(`[Vue warn] ${t}`, ...e);
  }
  let xt;
  class sa {
    constructor(e = false) {
      this.detached = e, this._active = true, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = false, this.parent = xt, !e && xt && (this.index = (xt.scopes || (xt.scopes = [])).push(
        this
      ) - 1);
    }
    get active() {
      return this._active;
    }
    pause() {
      if (this._active) {
        this._isPaused = true;
        let e, n;
        if (this.scopes)
          for (e = 0, n = this.scopes.length; e < n; e++)
            this.scopes[e].pause();
        for (e = 0, n = this.effects.length; e < n; e++)
          this.effects[e].pause();
      }
    }
    /**
     * Resumes the effect scope, including all child scopes and effects.
     */
    resume() {
      if (this._active && this._isPaused) {
        this._isPaused = false;
        let e, n;
        if (this.scopes)
          for (e = 0, n = this.scopes.length; e < n; e++)
            this.scopes[e].resume();
        for (e = 0, n = this.effects.length; e < n; e++)
          this.effects[e].resume();
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
        this._active = false;
        let n, o;
        for (n = 0, o = this.effects.length; n < o; n++)
          this.effects[n].stop();
        for (this.effects.length = 0, n = 0, o = this.cleanups.length; n < o; n++)
          this.cleanups[n]();
        if (this.cleanups.length = 0, this.scopes) {
          for (n = 0, o = this.scopes.length; n < o; n++)
            this.scopes[n].stop(true);
          this.scopes.length = 0;
        }
        if (!this.detached && this.parent && !e) {
          const r = this.parent.scopes.pop();
          r && r !== this && (this.parent.scopes[this.index] = r, r.index = this.index);
        }
        this.parent = void 0;
      }
    }
  }
  function aa() {
    return xt;
  }
  let H;
  const go = /* @__PURE__ */ new WeakSet();
  class Oi {
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
      if (!(this.flags & 1))
        return this.fn();
      this.flags |= 2, Cr(this), Di(this);
      const e = H, n = jt;
      H = this, jt = true;
      try {
        return this.fn();
      } finally {
        q.NODE_ENV !== "production" && H !== this && $t(
          "Active effect was not restored correctly - this is likely a Vue internal bug."
        ), zi(this), H = e, jt = n, this.flags &= -3;
      }
    }
    stop() {
      if (this.flags & 1) {
        for (let e = this.deps; e; e = e.nextDep)
          rr(e);
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
  }
  let Si = 0, tn, en;
  function Ci(t, e = false) {
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
    if (--Si > 0)
      return;
    if (en) {
      let e = en;
      for (en = void 0; e; ) {
        const n = e.next;
        e.next = void 0, e.flags &= -9, e = n;
      }
    }
    let t;
    for (; tn; ) {
      let e = tn;
      for (tn = void 0; e; ) {
        const n = e.next;
        if (e.next = void 0, e.flags &= -9, e.flags & 1)
          try {
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
    for (let e = t.deps; e; e = e.nextDep)
      e.version = -1, e.prevActiveLink = e.dep.activeLink, e.dep.activeLink = e;
  }
  function zi(t) {
    let e, n = t.depsTail, o = n;
    for (; o; ) {
      const r = o.prevDep;
      o.version === -1 ? (o === n && (n = r), rr(o), ua(o)) : e = o, o.dep.activeLink = o.prevActiveLink, o.prevActiveLink = void 0, o = r;
    }
    t.deps = e, t.depsTail = n;
  }
  function Oo(t) {
    for (let e = t.deps; e; e = e.nextDep)
      if (e.dep.version !== e.version || e.dep.computed && (Vi(e.dep.computed) || e.dep.version !== e.version))
        return true;
    return !!t._dirty;
  }
  function Vi(t) {
    if (t.flags & 4 && !(t.flags & 16) || (t.flags &= -17, t.globalVersion === sn) || (t.globalVersion = sn, !t.isSSR && t.flags & 128 && (!t.deps && !t._dirty || !Oo(t))))
      return;
    t.flags |= 2;
    const e = t.dep, n = H, o = jt;
    H = t, jt = true;
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
  function rr(t, e = false) {
    const { dep: n, prevSub: o, nextSub: r } = t;
    if (o && (o.nextSub = r, t.prevSub = void 0), r && (r.prevSub = o, t.nextSub = void 0), q.NODE_ENV !== "production" && n.subsHead === t && (n.subsHead = r), n.subs === t && (n.subs = o, !o && n.computed)) {
      n.computed.flags &= -5;
      for (let i = n.computed.deps; i; i = i.nextDep)
        rr(i, true);
    }
    !e && !--n.sc && n.map && n.map.delete(n.key);
  }
  function ua(t) {
    const { prevDep: e, nextDep: n } = t;
    e && (e.nextDep = n, t.prevDep = void 0), n && (n.prevDep = e, t.nextDep = void 0);
  }
  let jt = true;
  const Mi = [];
  function At() {
    Mi.push(jt), jt = false;
  }
  function It() {
    const t = Mi.pop();
    jt = t === void 0 ? true : t;
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
  let sn = 0;
  class la {
    constructor(e, n) {
      this.sub = e, this.dep = n, this.version = n.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
    }
  }
  class ir {
    // TODO isolatedDeclarations "__v_skip"
    constructor(e) {
      this.computed = e, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = true, q.NODE_ENV !== "production" && (this.subsHead = void 0);
    }
    track(e) {
      if (!H || !jt || H === this.computed)
        return;
      let n = this.activeLink;
      if (n === void 0 || n.sub !== H)
        n = this.activeLink = new la(H, this), H.deps ? (n.prevDep = H.depsTail, H.depsTail.nextDep = n, H.depsTail = n) : H.deps = H.depsTail = n, Ti(n);
      else if (n.version === -1 && (n.version = this.version, n.nextDep)) {
        const o = n.nextDep;
        o.prevDep = n.prevDep, n.prevDep && (n.prevDep.nextDep = o), n.prevDep = H.depsTail, n.nextDep = void 0, H.depsTail.nextDep = n, H.depsTail = n, H.deps === n && (H.deps = o);
      }
      return q.NODE_ENV !== "production" && H.onTrack && H.onTrack(
        X(
          {
            effect: H
          },
          e
        )
      ), n;
    }
    trigger(e) {
      this.version++, sn++, this.notify(e);
    }
    notify(e) {
      nr();
      try {
        if (q.NODE_ENV !== "production")
          for (let n = this.subsHead; n; n = n.nextSub)
            n.sub.onTrigger && !(n.sub.flags & 8) && n.sub.onTrigger(
              X(
                {
                  effect: n.sub
                },
                e
              )
            );
        for (let n = this.subs; n; n = n.prevSub)
          n.sub.notify() && n.sub.dep.notify();
      } finally {
        or();
      }
    }
  }
  function Ti(t) {
    if (t.dep.sc++, t.sub.flags & 4) {
      const e = t.dep.computed;
      if (e && !t.dep.subs) {
        e.flags |= 20;
        for (let o = e.deps; o; o = o.nextDep)
          Ti(o);
      }
      const n = t.dep.subs;
      n !== t && (t.prevSub = n, n && (n.nextSub = t)), q.NODE_ENV !== "production" && t.dep.subsHead === void 0 && (t.dep.subsHead = t), t.dep.subs = t;
    }
  }
  const So = /* @__PURE__ */ new WeakMap(), ve = /* @__PURE__ */ Symbol(
    q.NODE_ENV !== "production" ? "Object iterate" : ""
  ), Co = /* @__PURE__ */ Symbol(
    q.NODE_ENV !== "production" ? "Map keys iterate" : ""
  ), an = /* @__PURE__ */ Symbol(
    q.NODE_ENV !== "production" ? "Array iterate" : ""
  );
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
    const a2 = (u) => {
      u && (q.NODE_ENV !== "production" ? u.trigger({
        target: t,
        type: e,
        key: n,
        newValue: o,
        oldValue: r,
        oldTarget: i
      }) : u.trigger());
    };
    if (nr(), e === "clear")
      s.forEach(a2);
    else {
      const u = C(t), h = u && Zo(n);
      if (u && n === "length") {
        const d = Number(o);
        s.forEach((c, g) => {
          (g === "length" || g === an || !Jt(g) && g >= d) && a2(c);
        });
      } else
        switch ((n !== void 0 || s.has(void 0)) && a2(s.get(n)), h && a2(s.get(an)), e) {
          case "add":
            u ? h && a2(s.get("length")) : (a2(s.get(ve)), _e(t) && a2(s.get(Co)));
            break;
          case "delete":
            u || (a2(s.get(ve)), _e(t) && a2(s.get(Co)));
            break;
          case "set":
            _e(t) && a2(s.get(ve));
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
  const ca = {
    __proto__: null,
    [Symbol.iterator]() {
      return mo(this, Symbol.iterator, (t) => ue(this, t));
    },
    concat(...t) {
      return Se(this).concat(
        ...t.map((e) => C(e) ? Se(e) : e)
      );
    },
    entries() {
      return mo(this, "entries", (t) => (t[1] = ue(this, t[1]), t));
    },
    every(t, e) {
      return Zt(this, "every", t, e, void 0, arguments);
    },
    filter(t, e) {
      return Zt(
        this,
        "filter",
        t,
        e,
        (n) => n.map((o) => ue(this, o)),
        arguments
      );
    },
    find(t, e) {
      return Zt(
        this,
        "find",
        t,
        e,
        (n) => ue(this, n),
        arguments
      );
    },
    findIndex(t, e) {
      return Zt(this, "findIndex", t, e, void 0, arguments);
    },
    findLast(t, e) {
      return Zt(
        this,
        "findLast",
        t,
        e,
        (n) => ue(this, n),
        arguments
      );
    },
    findLastIndex(t, e) {
      return Zt(this, "findLastIndex", t, e, void 0, arguments);
    },
    // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
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
    // keys() iterator only reads `length`, no optimization required
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
    // slice could use ARRAY_ITERATE but also seems to beg for range tracking
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
  const pa = Array.prototype;
  function Zt(t, e, n, o, r, i) {
    const s = no(t), a2 = s !== t && !gt(t), u = s[e];
    if (u !== pa[e]) {
      const c = u.apply(t, i);
      return a2 ? Rt(c) : c;
    }
    let h = n;
    s !== t && (a2 ? h = function(c, g) {
      return n.call(this, ue(t, c), g, t);
    } : n.length > 2 && (h = function(c, g) {
      return n.call(this, c, g, t);
    }));
    const d = u.call(s, h, o);
    return a2 && r ? r(d) : d;
  }
  function Dr(t, e, n, o) {
    const r = no(t);
    let i = n;
    return r !== t && (gt(t) ? n.length > 3 && (i = function(s, a2, u) {
      return n.call(this, s, a2, u, t);
    }) : i = function(s, a2, u) {
      return n.call(this, s, ue(t, a2), u, t);
    }), r[e](i, ...o);
  }
  function yo(t, e, n) {
    const o = $(t);
    nt(o, "iterate", an);
    const r = o[e](...n);
    return (r === -1 || r === false) && Rn(n[0]) ? (n[0] = $(n[0]), o[e](...n)) : r;
  }
  function Ge(t, e, n = []) {
    At(), nr();
    const o = $(t)[e].apply(t, n);
    return or(), It(), o;
  }
  const da = /* @__PURE__ */ oe("__proto__,__v_isRef,__isVue"), ji = new Set(
    /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((t) => t !== "arguments" && t !== "caller").map((t) => Symbol[t]).filter(Jt)
  );
  function fa(t) {
    Jt(t) || (t = String(t));
    const e = $(this);
    return nt(e, "has", t), e.hasOwnProperty(t);
  }
  class $i {
    constructor(e = false, n = false) {
      this._isReadonly = e, this._isShallow = n;
    }
    get(e, n, o) {
      if (n === "__v_skip") return e.__v_skip;
      const r = this._isReadonly, i = this._isShallow;
      if (n === "__v_isReactive")
        return !r;
      if (n === "__v_isReadonly")
        return r;
      if (n === "__v_isShallow")
        return i;
      if (n === "__v_raw")
        return o === (r ? i ? Li : Fi : i ? Ri : Pi).get(e) || // receiver is not the reactive proxy, but has the same prototype
        // this means the receiver is a user proxy of the reactive proxy
        Object.getPrototypeOf(e) === Object.getPrototypeOf(o) ? e : void 0;
      const s = C(e);
      if (!r) {
        let u;
        if (s && (u = ca[n]))
          return u;
        if (n === "hasOwnProperty")
          return fa;
      }
      const a2 = Reflect.get(
        e,
        n,
        // if this is a proxy wrapping a ref, return methods using the raw ref
        // as receiver so that we don't have to call `toRaw` on the ref in all
        // its class methods
        et(e) ? e : o
      );
      if ((Jt(n) ? ji.has(n) : da(n)) || (r || nt(e, "get", n), i))
        return a2;
      if (et(a2)) {
        const u = s && Zo(n) ? a2 : a2.value;
        return r && L(u) ? zo(u) : u;
      }
      return L(a2) ? r ? zo(a2) : bn(a2) : a2;
    }
  }
  class Ai extends $i {
    constructor(e = false) {
      super(false, e);
    }
    set(e, n, o, r) {
      let i = e[n];
      const s = C(e) && Zo(n);
      if (!this._isShallow) {
        const h = Pt(i);
        if (!gt(o) && !Pt(o) && (i = $(i), o = $(o)), !s && et(i) && !et(o))
          return h ? (q.NODE_ENV !== "production" && $t(
            `Set operation on key "${String(n)}" failed: target is readonly.`,
            e[n]
          ), true) : (i.value = o, true);
      }
      const a2 = s ? Number(n) < e.length : I(e, n), u = Reflect.set(
        e,
        n,
        o,
        et(e) ? e : r
      );
      return e === $(r) && (a2 ? pe(o, i) && Wt(e, "set", n, o, i) : Wt(e, "add", n, o)), u;
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
      return nt(
        e,
        "iterate",
        C(e) ? "length" : ve
      ), Reflect.ownKeys(e);
    }
  }
  class Ii extends $i {
    constructor(e = false) {
      super(true, e);
    }
    set(e, n) {
      return q.NODE_ENV !== "production" && $t(
        `Set operation on key "${String(n)}" failed: target is readonly.`,
        e
      ), true;
    }
    deleteProperty(e, n) {
      return q.NODE_ENV !== "production" && $t(
        `Delete operation on key "${String(n)}" failed: target is readonly.`,
        e
      ), true;
    }
  }
  const ha = /* @__PURE__ */ new Ai(), ba = /* @__PURE__ */ new Ii(), ga = /* @__PURE__ */ new Ai(true), ma = /* @__PURE__ */ new Ii(true), Do = (t) => t, En = (t) => Reflect.getPrototypeOf(t);
  function ya(t, e, n) {
    return function(...o) {
      const r = this.__v_raw, i = $(r), s = _e(i), a2 = t === "entries" || t === Symbol.iterator && s, u = t === "keys" && s, h = r[t](...o), d = n ? Do : e ? Pe : Rt;
      return !e && nt(
        i,
        "iterate",
        u ? Co : ve
      ), {
        // iterator protocol
        next() {
          const { value: c, done: g } = h.next();
          return g ? { value: c, done: g } : {
            value: a2 ? [d(c[0]), d(c[1])] : d(c),
            done: g
          };
        },
        // iterable protocol
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
        $t(
          `${Ee(t)} operation ${n}failed: target is readonly.`,
          $(this)
        );
      }
      return t === "delete" ? false : t === "clear" ? void 0 : this;
    };
  }
  function _a(t, e) {
    const n = {
      get(r) {
        const i = this.__v_raw, s = $(i), a2 = $(r);
        t || (pe(r, a2) && nt(s, "get", r), nt(s, "get", a2));
        const { has: u } = En(s), h = e ? Do : t ? Pe : Rt;
        if (u.call(s, r))
          return h(i.get(r));
        if (u.call(s, a2))
          return h(i.get(a2));
        i !== s && i.get(r);
      },
      get size() {
        const r = this.__v_raw;
        return !t && nt($(r), "iterate", ve), r.size;
      },
      has(r) {
        const i = this.__v_raw, s = $(i), a2 = $(r);
        return t || (pe(r, a2) && nt(s, "has", r), nt(s, "has", a2)), r === a2 ? i.has(r) : i.has(r) || i.has(a2);
      },
      forEach(r, i) {
        const s = this, a2 = s.__v_raw, u = $(a2), h = e ? Do : t ? Pe : Rt;
        return !t && nt(u, "iterate", ve), a2.forEach((d, c) => r.call(i, h(d), h(c), s));
      }
    };
    return X(
      n,
      t ? {
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
          const s = $(this), { has: a2, get: u } = En(s);
          let h = a2.call(s, r);
          h ? q.NODE_ENV !== "production" && zr(s, a2, r) : (r = $(r), h = a2.call(s, r));
          const d = u.call(s, r);
          return s.set(r, i), h ? pe(i, d) && Wt(s, "set", r, i, d) : Wt(s, "add", r, i), this;
        },
        delete(r) {
          const i = $(this), { has: s, get: a2 } = En(i);
          let u = s.call(i, r);
          u ? q.NODE_ENV !== "production" && zr(i, s, r) : (r = $(r), u = s.call(i, r));
          const h = a2 ? a2.call(i, r) : void 0, d = i.delete(r);
          return u && Wt(i, "delete", r, void 0, h), d;
        },
        clear() {
          const r = $(this), i = r.size !== 0, s = q.NODE_ENV !== "production" ? _e(r) ? new Map(r) : new Set(r) : void 0, a2 = r.clear();
          return i && Wt(
            r,
            "clear",
            void 0,
            void 0,
            s
          ), a2;
        }
      }
    ), [
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
    return (o, r, i) => r === "__v_isReactive" ? !t : r === "__v_isReadonly" ? t : r === "__v_raw" ? o : Reflect.get(
      I(n, r) && r in o ? n : o,
      r,
      i
    );
  }
  const va = {
    get: /* @__PURE__ */ oo(false, false)
  }, xa = {
    get: /* @__PURE__ */ oo(false, true)
  }, wa = {
    get: /* @__PURE__ */ oo(true, false)
  }, Ea = {
    get: /* @__PURE__ */ oo(true, true)
  };
  function zr(t, e, n) {
    const o = $(n);
    if (o !== n && e.call(t, o)) {
      const r = Xo(t);
      $t(
        `Reactive ${r} contains both the raw and reactive versions of the same object${r === "Map" ? " as keys" : ""}, which can lead to inconsistencies. Avoid differentiating between the raw and reactive versions of an object and only use the reactive version if possible.`
      );
    }
  }
  const Pi = /* @__PURE__ */ new WeakMap(), Ri = /* @__PURE__ */ new WeakMap(), Fi = /* @__PURE__ */ new WeakMap(), Li = /* @__PURE__ */ new WeakMap();
  function ka(t) {
    switch (t) {
      case "Object":
      case "Array":
        return 1;
      case "Map":
      case "Set":
      case "WeakMap":
      case "WeakSet":
        return 2;
      default:
        return 0;
    }
  }
  function Na(t) {
    return t.__v_skip || !Object.isExtensible(t) ? 0 : ka(Xo(t));
  }
  function bn(t) {
    return Pt(t) ? t : ro(
      t,
      false,
      ha,
      va,
      Pi
    );
  }
  function Oa(t) {
    return ro(
      t,
      false,
      ga,
      xa,
      Ri
    );
  }
  function zo(t) {
    return ro(
      t,
      true,
      ba,
      wa,
      Fi
    );
  }
  function Gt(t) {
    return ro(
      t,
      true,
      ma,
      Ea,
      Li
    );
  }
  function ro(t, e, n, o, r) {
    if (!L(t))
      return q.NODE_ENV !== "production" && $t(
        `value cannot be made ${e ? "readonly" : "reactive"}: ${String(
          t
        )}`
      ), t;
    if (t.__v_raw && !(e && t.__v_isReactive))
      return t;
    const i = Na(t);
    if (i === 0)
      return t;
    const s = r.get(t);
    if (s)
      return s;
    const a2 = new Proxy(
      t,
      i === 2 ? o : n
    );
    return r.set(t, a2), a2;
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
    return t ? !!t.__v_raw : false;
  }
  function $(t) {
    const e = t && t.__v_raw;
    return e ? $(e) : t;
  }
  function Sa(t) {
    return !I(t, "__v_skip") && Object.isExtensible(t) && Pn(t, "__v_skip", true), t;
  }
  const Rt = (t) => L(t) ? bn(t) : t, Pe = (t) => L(t) ? zo(t) : t;
  function et(t) {
    return t ? t.__v_isRef === true : false;
  }
  function Ce(t) {
    return Ca(t, false);
  }
  function Ca(t, e) {
    return et(t) ? t : new Da(t, e);
  }
  class Da {
    constructor(e, n) {
      this.dep = new ir(), this.__v_isRef = true, this.__v_isShallow = false, this._rawValue = n ? e : $(e), this._value = n ? e : Rt(e), this.__v_isShallow = n;
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
  }
  function Fn(t) {
    return et(t) ? t.value : t;
  }
  const za = {
    get: (t, e, n) => e === "__v_raw" ? t : Fn(Reflect.get(t, e, n)),
    set: (t, e, n, o) => {
      const r = t[e];
      return et(r) && !et(n) ? (r.value = n, true) : Reflect.set(t, e, n, o);
    }
  };
  function Ui(t) {
    return de(t) ? t : new Proxy(t, za);
  }
  class Va {
    constructor(e, n, o) {
      this.fn = e, this.setter = n, this._value = void 0, this.dep = new ir(this), this.__v_isRef = true, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = sn - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !n, this.isSSR = o;
    }
    /**
     * @internal
     */
    notify() {
      if (this.flags |= 16, !(this.flags & 8) && // avoid infinite self recursion
      H !== this)
        return Ci(this, true), true;
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
  }
  function Ma(t, e, n = false) {
    let o, r;
    return M(t) ? o = t : (o = t.get, r = t.set), new Va(o, r, n);
  }
  const Nn = {}, Ln = /* @__PURE__ */ new WeakMap();
  let me;
  function Ta(t, e = false, n = me) {
    if (n) {
      let o = Ln.get(n);
      o || Ln.set(n, o = []), o.push(t);
    } else q.NODE_ENV !== "production" && !e && $t(
      "onWatcherCleanup() was called when there was no active watcher to associate with."
    );
  }
  function ja(t, e, n = B) {
    const { immediate: o, deep: r, once: i, scheduler: s, augmentJob: a2, call: u } = n, h = (z2) => {
      (n.onWarn || $t)(
        "Invalid watch source: ",
        z2,
        "A watch source can only be a getter/effect function, a ref, a reactive object, or an array of these types."
      );
    }, d = (z2) => r ? z2 : gt(z2) || r === false || r === 0 ? ee(z2, 1) : ee(z2);
    let c, g, x2, T2, S = false, it = false;
    if (et(t) ? (g = () => t.value, S = gt(t)) : de(t) ? (g = () => d(t), S = true) : C(t) ? (it = true, S = t.some((z2) => de(z2) || gt(z2)), g = () => t.map((z2) => {
      if (et(z2))
        return z2.value;
      if (de(z2))
        return d(z2);
      if (M(z2))
        return u ? u(z2, 2) : z2();
      q.NODE_ENV !== "production" && h(z2);
    })) : M(t) ? e ? g = u ? () => u(t, 2) : t : g = () => {
      if (x2) {
        At();
        try {
          x2();
        } finally {
          It();
        }
      }
      const z2 = me;
      me = c;
      try {
        return u ? u(t, 3, [T2]) : t(T2);
      } finally {
        me = z2;
      }
    } : (g = ot, q.NODE_ENV !== "production" && h(t)), e && r) {
      const z2 = g, st = r === true ? 1 / 0 : r;
      g = () => ee(z2(), st);
    }
    const Y2 = aa(), U2 = () => {
      c.stop(), Y2 && Y2.active && Jo(Y2.effects, c);
    };
    if (i && e) {
      const z2 = e;
      e = (...st) => {
        z2(...st), U2();
      };
    }
    let F2 = it ? new Array(t.length).fill(Nn) : Nn;
    const wt = (z2) => {
      if (!(!(c.flags & 1) || !c.dirty && !z2))
        if (e) {
          const st = c.run();
          if (r || S || (it ? st.some((Dt, lt) => pe(Dt, F2[lt])) : pe(st, F2))) {
            x2 && x2();
            const Dt = me;
            me = c;
            try {
              const lt = [
                st,
                // pass undefined as the old value when it's changed for the first time
                F2 === Nn ? void 0 : it && F2[0] === Nn ? [] : F2,
                T2
              ];
              F2 = st, u ? u(e, 3, lt) : (
                // @ts-expect-error
                e(...lt)
              );
            } finally {
              me = Dt;
            }
          }
        } else
          c.run();
    };
    return a2 && a2(wt), c = new Oi(g), c.scheduler = s ? () => s(wt, false) : wt, T2 = (z2) => Ta(z2, false, c), x2 = c.onStop = () => {
      const z2 = Ln.get(c);
      if (z2) {
        if (u)
          u(z2, 4);
        else
          for (const st of z2) st();
        Ln.delete(c);
      }
    }, q.NODE_ENV !== "production" && (c.onTrack = n.onTrack, c.onTrigger = n.onTrigger), e ? o ? wt(true) : F2 = c.run() : s ? s(wt.bind(null, true), true) : c.run(), U2.pause = c.pause.bind(c), U2.resume = c.resume.bind(c), U2.stop = U2, U2;
  }
  function ee(t, e = 1 / 0, n) {
    if (e <= 0 || !L(t) || t.__v_skip || (n = n || /* @__PURE__ */ new Map(), (n.get(t) || 0) >= e))
      return t;
    if (n.set(t, e), e--, et(t))
      ee(t.value, e, n);
    else if (C(t))
      for (let o = 0; o < t.length; o++)
        ee(t[o], e, n);
    else if (Zn(t) || _e(t))
      t.forEach((o) => {
        ee(o, e, n);
      });
    else if (Qn(t)) {
      for (const o in t)
        ee(t[o], e, n);
      for (const o of Object.getOwnPropertySymbols(t))
        Object.prototype.propertyIsEnumerable.call(t, o) && ee(t[o], e, n);
    }
    return t;
  }
  var f = {};
  const xe = [];
  function Cn(t) {
    xe.push(t);
  }
  function Dn() {
    xe.pop();
  }
  let _o = false;
  function k(t, ...e) {
    if (_o) return;
    _o = true, At();
    const n = xe.length ? xe[xe.length - 1].component : null, o = n && n.appContext.config.warnHandler, r = $a();
    if (o)
      Ue(
        o,
        n,
        11,
        [
          // eslint-disable-next-line no-restricted-syntax
          t + e.map((i) => {
            var s, a2;
            return (a2 = (s = i.toString) == null ? void 0 : s.call(i)) != null ? a2 : JSON.stringify(i);
          }).join(""),
          n && n.proxy,
          r.map(
            ({ vnode: i }) => `at <${vn(n, i.type)}>`
          ).join(`
`),
          r
        ]
      );
    else {
      const i = [`[Vue warn]: ${t}`, ...e];
      r.length && i.push(`
`, ...Aa(r)), console.warn(...i);
    }
    It(), _o = false;
  }
  function $a() {
    let t = xe[xe.length - 1];
    if (!t)
      return [];
    const e = [];
    for (; t; ) {
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
    const n = e > 0 ? `... (${e} recursive calls)` : "", o = t.component ? t.component.parent == null : false, r = ` at <${vn(
      t.component,
      t.type,
      o
    )}`, i = ">" + n;
    return t.props ? [r, ...Pa(t.props), i] : [r + i];
  }
  function Pa(t) {
    const e = [], n = Object.keys(t);
    return n.slice(0, 3).forEach((o) => {
      e.push(...Hi(o, t[o]));
    }), n.length > 3 && e.push(" ..."), e;
  }
  function Hi(t, e, n) {
    return J(e) ? (e = JSON.stringify(e), n ? e : [`${t}=${e}`]) : typeof e == "number" || typeof e == "boolean" || e == null ? n ? e : [`${t}=${e}`] : et(e) ? (e = Hi(t, $(e.value), true), n ? e : [`${t}=Ref<`, e, ">"]) : M(e) ? [`${t}=fn${e.name ? `<${e.name}>` : ""}`] : (e = $(e), n ? e : [`${t}=`, e]);
  }
  const sr = {
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
      for (let i = 0; i < t.length; i++)
        r.push(Yt(t[i], e, n, o));
      return r;
    } else f.NODE_ENV !== "production" && k(
      `Invalid value type passed to callWithAsyncErrorHandling(): ${typeof t}`
    );
  }
  function gn(t, e, n, o = true) {
    const r = e ? e.vnode : null, { errorHandler: i, throwUnhandledErrorInProduction: s } = e && e.appContext.config || B;
    if (e) {
      let a2 = e.parent;
      const u = e.proxy, h = f.NODE_ENV !== "production" ? sr[n] : `https://vuejs.org/error-reference/#runtime-${n}`;
      for (; a2; ) {
        const d = a2.ec;
        if (d) {
          for (let c = 0; c < d.length; c++)
            if (d[c](t, u, h) === false)
              return;
        }
        a2 = a2.parent;
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
  function Ra(t, e, n, o = true, r = false) {
    if (f.NODE_ENV !== "production") {
      const i = sr[e];
      if (n && Cn(n), k(`Unhandled error${i ? ` during execution of ${i}` : ""}`), n && Dn(), o)
        throw t;
      console.error(t);
    } else {
      if (r)
        throw t;
      console.error(t);
    }
  }
  const bt = [];
  let Kt = -1;
  const je = [];
  let le = null, Me = 0;
  const Bi = /* @__PURE__ */ Promise.resolve();
  let Un = null;
  const Fa = 100;
  function Ki(t) {
    const e = Un || Bi;
    return t ? e.then(this ? t.bind(this) : t) : e;
  }
  function La(t) {
    let e = Kt + 1, n = bt.length;
    for (; e < n; ) {
      const o = e + n >>> 1, r = bt[o], i = un(r);
      i < t || i === t && r.flags & 2 ? e = o + 1 : n = o;
    }
    return e;
  }
  function io(t) {
    if (!(t.flags & 1)) {
      const e = un(t), n = bt[bt.length - 1];
      !n || // fast path when the job id is larger than the tail
      !(t.flags & 2) && e >= un(n) ? bt.push(t) : bt.splice(La(e), 0, t), t.flags |= 1, Wi();
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
        if (t && o.id !== t.uid || f.NODE_ENV !== "production" && ar(e, o))
          continue;
        bt.splice(n, 1), n--, o.flags & 4 && (o.flags &= -2), o(), o.flags & 4 || (o.flags &= -2);
      }
    }
  }
  function Gi(t) {
    if (je.length) {
      const e = [...new Set(je)].sort(
        (n, o) => un(n) - un(o)
      );
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
  const un = (t) => t.id == null ? t.flags & 2 ? -1 : 1 / 0 : t.id;
  function Ji(t) {
    f.NODE_ENV !== "production" && (t = t || /* @__PURE__ */ new Map());
    const e = f.NODE_ENV !== "production" ? (n) => ar(t, n) : ot;
    try {
      for (Kt = 0; Kt < bt.length; Kt++) {
        const n = bt[Kt];
        if (n && !(n.flags & 8)) {
          if (f.NODE_ENV !== "production" && e(n))
            continue;
          n.flags & 4 && (n.flags &= -2), Ue(
            n,
            n.i,
            n.i ? 15 : 14
          ), n.flags & 4 || (n.flags &= -2);
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
      return gn(
        `Maximum recursive updates exceeded${r ? ` in component <${r}>` : ""}. This means you have a reactive effect that is mutating its own dependencies and thus recursively triggering itself. Possible sources include component template, render function, updated hook or watcher source function.`,
        null,
        10
      ), true;
    }
    return t.set(e, n + 1), false;
  }
  let Tt = false;
  const zn = /* @__PURE__ */ new Map();
  f.NODE_ENV !== "production" && (hn().__VUE_HMR_RUNTIME__ = {
    createRecord: vo(Yi),
    rerender: vo(Ba),
    reload: vo(Ka)
  });
  const ke = /* @__PURE__ */ new Map();
  function Ua(t) {
    const e = t.type.__hmrId;
    let n = ke.get(e);
    n || (Yi(e, t.type), n = ke.get(e)), n.instances.add(t);
  }
  function Ha(t) {
    ke.get(t.type.__hmrId).instances.delete(t);
  }
  function Yi(t, e) {
    return ke.has(t) ? false : (ke.set(t, {
      initialDef: Hn(e),
      instances: /* @__PURE__ */ new Set()
    }), true);
  }
  function Hn(t) {
    return Ts(t) ? t.__vccOpts : t;
  }
  function Ba(t, e) {
    const n = ke.get(t);
    n && (n.initialDef.render = e, [...n.instances].forEach((o) => {
      e && (o.render = e, Hn(o.type).render = e), o.renderCache = [], Tt = true, o.job.flags & 8 || o.update(), Tt = false;
    }));
  }
  function Ka(t, e) {
    const n = ke.get(t);
    if (!n) return;
    e = Hn(e), Mr(n.initialDef, e);
    const o = [...n.instances];
    for (let r = 0; r < o.length; r++) {
      const i = o[r], s = Hn(i.type);
      let a2 = zn.get(s);
      a2 || (s !== n.initialDef && Mr(s, e), zn.set(s, a2 = /* @__PURE__ */ new Set())), a2.add(i), i.appContext.propsCache.delete(i.type), i.appContext.emitsCache.delete(i.type), i.appContext.optionsCache.delete(i.type), i.ceReload ? (a2.add(i), i.ceReload(e.styles), a2.delete(i)) : i.parent ? io(() => {
        i.job.flags & 8 || (Tt = true, i.parent.update(), Tt = false, a2.delete(i));
      }) : i.appContext.reload ? i.appContext.reload() : typeof window < "u" ? window.location.reload() : console.warn(
        "[HMR] Root or manually mounted instance modified. Full reload required."
      ), i.root.ce && i !== i.root && i.root.ce._removeChildStyle(s);
    }
    qi(() => {
      zn.clear();
    });
  }
  function Mr(t, e) {
    X(t, e);
    for (const n in t)
      n !== "__file" && !(n in e) && delete t[n];
  }
  function vo(t) {
    return (e, n) => {
      try {
        return t(e, n);
      } catch (o) {
        console.error(o), console.warn(
          "[HMR] Something went wrong during Vue component hot-reload. Full reload required."
        );
      }
    };
  }
  let qt, Xe = [], Vo = false;
  function mn(t, ...e) {
    qt ? qt.emit(t, ...e) : Vo || Xe.push({ event: t, args: e });
  }
  function Xi(t, e) {
    var n, o;
    qt = t, qt ? (qt.enabled = true, Xe.forEach(({ event: r, args: i }) => qt.emit(r, ...i)), Xe = []) : (
      /* handle late devtools injection - only do this if we are in an actual */
      /* browser environment to avoid the timer handle stalling test runner exit */
      /* (#4815) */
      typeof window < "u" && // some envs mock window but not fully
      window.HTMLElement && // also exclude jsdom
      // eslint-disable-next-line no-restricted-syntax
      !((o = (n = window.navigator) == null ? void 0 : n.userAgent) != null && o.includes("jsdom")) ? ((e.__VUE_DEVTOOLS_HOOK_REPLAY__ = e.__VUE_DEVTOOLS_HOOK_REPLAY__ || []).push((i) => {
        Xi(i, e);
      }), setTimeout(() => {
        qt || (e.__VUE_DEVTOOLS_HOOK_REPLAY__ = null, Vo = true, Xe = []);
      }, 3e3)) : (Vo = true, Xe = [])
    );
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
  const Ga = /* @__PURE__ */ ur(
    "component:added"
    /* COMPONENT_ADDED */
  ), Zi = /* @__PURE__ */ ur(
    "component:updated"
    /* COMPONENT_UPDATED */
  ), Ja = /* @__PURE__ */ ur(
    "component:removed"
    /* COMPONENT_REMOVED */
  ), Ya = (t) => {
    qt && typeof qt.cleanupBuffer == "function" && // remove the component if it wasn't buffered
    !qt.cleanupBuffer(t) && Ja(t);
  };
  // @__NO_SIDE_EFFECTS__
  function ur(t) {
    return (e) => {
      mn(
        t,
        e.appContext.app,
        e.uid,
        e.parent ? e.parent.uid : void 0,
        e
      );
    };
  }
  const Xa = /* @__PURE__ */ Qi(
    "perf:start"
    /* PERFORMANCE_START */
  ), Za = /* @__PURE__ */ Qi(
    "perf:end"
    /* PERFORMANCE_END */
  );
  function Qi(t) {
    return (e, n, o) => {
      mn(t, e.appContext.app, e.uid, e, n, o);
    };
  }
  function Qa(t, e, n) {
    mn(
      "component:emit",
      t.appContext.app,
      t,
      e,
      n
    );
  }
  let dt = null, ts = null;
  function Bn(t) {
    const e = dt;
    return dt = t, ts = t && t.type.__scopeId || null, e;
  }
  function tu(t, e = dt, n) {
    if (!e || t._n)
      return t;
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
    return o._n = true, o._c = true, o._d = true, o;
  }
  function es(t) {
    Bs(t) && k("Do not use built-in directive ids as custom directive id: " + t);
  }
  function Re(t, e) {
    if (dt === null)
      return f.NODE_ENV !== "production" && k("withDirectives can only be used inside render functions."), t;
    const n = uo(dt), o = t.dirs || (t.dirs = []);
    for (let r = 0; r < e.length; r++) {
      let [i, s, a2, u = B] = e[r];
      i && (M(i) && (i = {
        mounted: i,
        updated: i
      }), i.deep && ee(s), o.push({
        dir: i,
        instance: n,
        value: s,
        oldValue: void 0,
        arg: a2,
        modifiers: u
      }));
    }
    return t;
  }
  function he(t, e, n, o) {
    const r = t.dirs, i = e && e.dirs;
    for (let s = 0; s < r.length; s++) {
      const a2 = r[s];
      i && (a2.oldValue = i[s].value);
      let u = a2.dir[o];
      u && (At(), Yt(u, n, 8, [
        t.el,
        a2,
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
  function Vn(t, e, n = false) {
    const o = zs();
    if (o || Ae) {
      let r = Ae ? Ae._context.provides : o ? o.parent == null || o.ce ? o.vnode.appContext && o.vnode.appContext.provides : o.parent.provides : void 0;
      if (r && t in r)
        return r[t];
      if (arguments.length > 1)
        return n && M(e) ? e.call(o && o.proxy) : e;
      f.NODE_ENV !== "production" && k(`injection "${String(t)}" not found.`);
    } else f.NODE_ENV !== "production" && k("inject() can only be used inside setup() or functional components.");
  }
  const nu = /* @__PURE__ */ Symbol.for("v-scx"), ou = () => {
    {
      const t = Vn(nu);
      return t || f.NODE_ENV !== "production" && k(
        "Server rendering context not provided. Make sure to only call useSSRContext() conditionally in the server build."
      ), t;
    }
  };
  function $e(t, e, n) {
    return f.NODE_ENV !== "production" && !M(e) && k(
      "`watch(fn, options?)` signature has been moved to a separate API. Use `watchEffect(fn, options?)` instead. `watch` now only supports `watch(source, cb, options?) signature."
    ), ns(t, e, n);
  }
  function ns(t, e, n = B) {
    const { immediate: o, deep: r, flush: i, once: s } = n;
    f.NODE_ENV !== "production" && !e && (o !== void 0 && k(
      'watch() "immediate" option is only respected when using the watch(source, callback, options?) signature.'
    ), r !== void 0 && k(
      'watch() "deep" option is only respected when using the watch(source, callback, options?) signature.'
    ), s !== void 0 && k(
      'watch() "once" option is only respected when using the watch(source, callback, options?) signature.'
    ));
    const a2 = X({}, n);
    f.NODE_ENV !== "production" && (a2.onWarn = k);
    const u = e && o || !e && i !== "post";
    let h;
    if (cn) {
      if (i === "sync") {
        const x2 = ou();
        h = x2.__watcherHandles || (x2.__watcherHandles = []);
      } else if (!u) {
        const x2 = () => {
        };
        return x2.stop = ot, x2.resume = ot, x2.pause = ot, x2;
      }
    }
    const d = tt;
    a2.call = (x2, T2, S) => Yt(x2, d, T2, S);
    let c = false;
    i === "post" ? a2.scheduler = (x2) => {
      Et(x2, d && d.suspense);
    } : i !== "sync" && (c = true, a2.scheduler = (x2, T2) => {
      T2 ? x2() : io(x2);
    }), a2.augmentJob = (x2) => {
      e && (x2.flags |= 4), c && (x2.flags |= 2, d && (x2.id = d.uid, x2.i = d));
    };
    const g = ja(t, e, a2);
    return cn && (h ? h.push(g) : u && g()), g;
  }
  function ru(t, e, n) {
    const o = this.proxy, r = J(t) ? t.includes(".") ? os(o, t) : () => o[t] : t.bind(o, o);
    let i;
    M(e) ? i = e : (i = e.handler, n = e);
    const s = _n(this), a2 = ns(r, i.bind(o), n);
    return s(), a2;
  }
  function os(t, e) {
    const n = e.split(".");
    return () => {
      let o = t;
      for (let r = 0; r < n.length && o; r++)
        o = o[n[r]];
      return o;
    };
  }
  const iu = /* @__PURE__ */ Symbol("_vte"), su = (t) => t.__isTeleport, au = /* @__PURE__ */ Symbol("_leaveCb");
  function lr(t, e) {
    t.shapeFlag & 6 && t.component ? (t.transition = e, lr(t.component.subTree, e)) : t.shapeFlag & 128 ? (t.ssContent.transition = e.clone(t.ssContent), t.ssFallback.transition = e.clone(t.ssFallback)) : t.transition = e;
  }
  // @__NO_SIDE_EFFECTS__
  function Ct(t, e) {
    return M(t) ? (
      // #8236: extend call and options.name access are considered side-effects
      // by Rollup, so we have to wrap it in a pure-annotated IIFE.
      X({ name: t.name }, e, { setup: t })
    ) : t;
  }
  function rs(t) {
    t.ids = [t.ids[0] + t.ids[2]++ + "-", 0, 0];
  }
  const Tr = /* @__PURE__ */ new WeakSet(), Kn = /* @__PURE__ */ new WeakMap();
  function nn(t, e, n, o, r = false) {
    if (C(t)) {
      t.forEach(
        (S, it) => nn(
          S,
          e && (C(e) ? e[it] : e),
          n,
          o,
          r
        )
      );
      return;
    }
    if (on(o) && !r) {
      o.shapeFlag & 512 && o.type.__asyncResolved && o.component.subTree.component && nn(t, e, n, o.component.subTree);
      return;
    }
    const i = o.shapeFlag & 4 ? uo(o.component) : o.el, s = r ? null : i, { i: a2, r: u } = t;
    if (f.NODE_ENV !== "production" && !a2) {
      k(
        "Missing ref owner context. ref cannot be used on hoisted vnodes. A vnode with ref must be created inside the render function."
      );
      return;
    }
    const h = e && e.r, d = a2.refs === B ? a2.refs = {} : a2.refs, c = a2.setupState, g = $(c), x2 = c === B ? vi : (S) => f.NODE_ENV !== "production" && (I(g, S) && !et(g[S]) && k(
      `Template ref "${S}" used on a non-ref value. It will not work in the production build.`
    ), Tr.has(g[S])) ? false : I(g, S), T2 = (S) => f.NODE_ENV === "production" || !Tr.has(S);
    if (h != null && h !== u) {
      if (jr(e), J(h))
        d[h] = null, x2(h) && (c[h] = null);
      else if (et(h)) {
        T2(h) && (h.value = null);
        const S = e;
        S.k && (d[S.k] = null);
      }
    }
    if (M(u))
      Ue(u, a2, 12, [s, d]);
    else {
      const S = J(u), it = et(u);
      if (S || it) {
        const Y2 = () => {
          if (t.f) {
            const U2 = S ? x2(u) ? c[u] : d[u] : T2(u) || !t.k ? u.value : d[t.k];
            if (r)
              C(U2) && Jo(U2, i);
            else if (C(U2))
              U2.includes(i) || U2.push(i);
            else if (S)
              d[u] = [i], x2(u) && (c[u] = d[u]);
            else {
              const F2 = [i];
              T2(u) && (u.value = F2), t.k && (d[t.k] = F2);
            }
          } else S ? (d[u] = s, x2(u) && (c[u] = s)) : it ? (T2(u) && (u.value = s), t.k && (d[t.k] = s)) : f.NODE_ENV !== "production" && k("Invalid template ref type:", u, `(${typeof u})`);
        };
        if (s) {
          const U2 = () => {
            Y2(), Kn.delete(t);
          };
          U2.id = -1, Kn.set(t, U2), Et(U2, n);
        } else
          jr(t), Y2();
      } else f.NODE_ENV !== "production" && k("Invalid template ref type:", u, `(${typeof u})`);
    }
  }
  function jr(t) {
    const e = Kn.get(t);
    e && (e.flags |= 8, Kn.delete(t));
  }
  hn().requestIdleCallback;
  hn().cancelIdleCallback;
  const on = (t) => !!t.type.__asyncLoader, cr = (t) => t.type.__isKeepAlive;
  function uu(t, e) {
    is(t, "a", e);
  }
  function lu(t, e) {
    is(t, "da", e);
  }
  function is(t, e, n = tt) {
    const o = t.__wdc || (t.__wdc = () => {
      let r = n;
      for (; r; ) {
        if (r.isDeactivated)
          return;
        r = r.parent;
      }
      return t();
    });
    if (so(e, o, n), n) {
      let r = n.parent;
      for (; r && r.parent; )
        cr(r.parent.vnode) && cu(o, e, n, r), r = r.parent;
    }
  }
  function cu(t, e, n, o) {
    const r = so(
      e,
      t,
      o,
      true
      /* prepend */
    );
    ss(() => {
      Jo(o[e], r);
    }, n);
  }
  function so(t, e, n = tt, o = false) {
    if (n) {
      const r = n[t] || (n[t] = []), i = e.__weh || (e.__weh = (...s) => {
        At();
        const a2 = _n(n), u = Yt(e, n, t, s);
        return a2(), It(), u;
      });
      return o ? r.unshift(i) : r.push(i), i;
    } else if (f.NODE_ENV !== "production") {
      const r = ge(sr[t].replace(/ hook$/, ""));
      k(
        `${r} is called when there is no active component instance to be associated with. Lifecycle injection APIs can only be used during execution of setup(). If you are using async setup(), make sure to register lifecycle hooks before the first await statement.`
      );
    }
  }
  const re = (t) => (e, n = tt) => {
    (!cn || t === "sp") && so(t, (...o) => e(...o), n);
  }, pu = re("bm"), du = re("m"), fu = re(
    "bu"
  ), hu = re("u"), bu = re(
    "bum"
  ), ss = re("um"), gu = re(
    "sp"
  ), mu = re("rtg"), yu = re("rtc");
  function _u(t, e = tt) {
    so("ec", t, e);
  }
  const vu = "components", as = /* @__PURE__ */ Symbol.for("v-ndc");
  function us(t) {
    return J(t) ? xu(vu, t, false) || t : t || as;
  }
  function xu(t, e, n = true, o = false) {
    const r = dt || tt;
    if (r) {
      const i = r.type;
      {
        const a2 = mr(
          i,
          false
        );
        if (a2 && (a2 === e || a2 === at(e) || a2 === Ee(at(e))))
          return i;
      }
      const s = (
        // local registration
        // check instance[type] first which is resolved for options API
        $r(r[t] || i[t], e) || // global registration
        $r(r.appContext[t], e)
      );
      return !s && o ? i : (f.NODE_ENV !== "production" && n && !s && k(`Failed to resolve ${t.slice(0, -1)}: ${e}
If this is a native custom element, make sure to exclude it from component resolution via compilerOptions.isCustomElement.`), s);
    } else f.NODE_ENV !== "production" && k(
      `resolve${Ee(t.slice(0, -1))} can only be used in render() or setup().`
    );
  }
  function $r(t, e) {
    return t && (t[e] || t[at(e)] || t[Ee(at(e))]);
  }
  function pr(t, e, n, o) {
    let r;
    const i = n, s = C(t);
    if (s || J(t)) {
      const a2 = s && de(t);
      let u = false, h = false;
      a2 && (u = !gt(t), h = Pt(t), t = no(t)), r = new Array(t.length);
      for (let d = 0, c = t.length; d < c; d++)
        r[d] = e(
          u ? h ? Pe(Rt(t[d])) : Rt(t[d]) : t[d],
          d,
          void 0,
          i
        );
    } else if (typeof t == "number") {
      f.NODE_ENV !== "production" && !Number.isInteger(t) && k(`The v-for range expect an integer value but got ${t}.`), r = new Array(t);
      for (let a2 = 0; a2 < t; a2++)
        r[a2] = e(a2 + 1, a2, void 0, i);
    } else if (L(t))
      if (t[Symbol.iterator])
        r = Array.from(
          t,
          (a2, u) => e(a2, u, void 0, i)
        );
      else {
        const a2 = Object.keys(t);
        r = new Array(a2.length);
        for (let u = 0, h = a2.length; u < h; u++) {
          const d = a2[u];
          r[u] = e(t[d], d, u, i);
        }
      }
    else
      r = [];
    return r;
  }
  const Mo = (t) => t ? Vs(t) ? uo(t) : Mo(t.parent) : null, we = (
    // Move PURE marker to new line to workaround compiler discarding it
    // due to type annotation
    /* @__PURE__ */ X(/* @__PURE__ */ Object.create(null), {
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
    })
  ), dr = (t) => t === "_" || t === "$", xo = (t, e) => t !== B && !t.__isScriptSetup && I(t, e), ls = {
    get({ _: t }, e) {
      if (e === "__v_skip")
        return true;
      const { ctx: n, setupState: o, data: r, props: i, accessCache: s, type: a2, appContext: u } = t;
      if (f.NODE_ENV !== "production" && e === "__isVue")
        return true;
      if (e[0] !== "$") {
        const g = s[e];
        if (g !== void 0)
          switch (g) {
            case 1:
              return o[e];
            case 2:
              return r[e];
            case 4:
              return n[e];
            case 3:
              return i[e];
          }
        else {
          if (xo(o, e))
            return s[e] = 1, o[e];
          if (r !== B && I(r, e))
            return s[e] = 2, r[e];
          if (I(i, e))
            return s[e] = 3, i[e];
          if (n !== B && I(n, e))
            return s[e] = 4, n[e];
          To && (s[e] = 0);
        }
      }
      const h = we[e];
      let d, c;
      if (h)
        return e === "$attrs" ? (nt(t.attrs, "get", ""), f.NODE_ENV !== "production" && qn()) : f.NODE_ENV !== "production" && e === "$slots" && nt(t, "get", e), h(t);
      if (
        // css module (injected by vue-loader)
        (d = a2.__cssModules) && (d = d[e])
      )
        return d;
      if (n !== B && I(n, e))
        return s[e] = 4, n[e];
      if (
        // global properties
        c = u.config.globalProperties, I(c, e)
      )
        return c[e];
      f.NODE_ENV !== "production" && dt && (!J(e) || // #1091 avoid internal isRef/isVNode checks on component instance leading
      // to infinite warning loop
      e.indexOf("__v") !== 0) && (r !== B && dr(e[0]) && I(r, e) ? k(
        `Property ${JSON.stringify(
          e
        )} must be accessed via $data because it starts with a reserved character ("$" or "_") and is not proxied on the render context.`
      ) : t === dt && k(
        `Property ${JSON.stringify(e)} was accessed during render but is not defined on instance.`
      ));
    },
    set({ _: t }, e, n) {
      const { data: o, setupState: r, ctx: i } = t;
      return xo(r, e) ? (r[e] = n, true) : f.NODE_ENV !== "production" && r.__isScriptSetup && I(r, e) ? (k(`Cannot mutate <script setup> binding "${e}" from Options API.`), false) : o !== B && I(o, e) ? (o[e] = n, true) : I(t.props, e) ? (f.NODE_ENV !== "production" && k(`Attempting to mutate prop "${e}". Props are readonly.`), false) : e[0] === "$" && e.slice(1) in t ? (f.NODE_ENV !== "production" && k(
        `Attempting to mutate public property "${e}". Properties starting with $ are reserved and readonly.`
      ), false) : (f.NODE_ENV !== "production" && e in t.appContext.config.globalProperties ? Object.defineProperty(i, e, {
        enumerable: true,
        configurable: true,
        value: n
      }) : i[e] = n, true);
    },
    has({
      _: { data: t, setupState: e, accessCache: n, ctx: o, appContext: r, props: i, type: s }
    }, a2) {
      let u;
      return !!(n[a2] || t !== B && a2[0] !== "$" && I(t, a2) || xo(e, a2) || I(i, a2) || I(o, a2) || I(we, a2) || I(r.config.globalProperties, a2) || (u = s.__cssModules) && u[a2]);
    },
    defineProperty(t, e, n) {
      return n.get != null ? t._.accessCache[e] = 0 : I(n, "value") && this.set(t, e, n.value, null), Reflect.defineProperty(t, e, n);
    }
  };
  f.NODE_ENV !== "production" && (ls.ownKeys = (t) => (k(
    "Avoid app logic that relies on enumerating keys on a component instance. The keys will be empty in production mode to avoid performance overhead."
  ), Reflect.ownKeys(t)));
  function wu(t) {
    const e = {};
    return Object.defineProperty(e, "_", {
      configurable: true,
      enumerable: false,
      get: () => t
    }), Object.keys(we).forEach((n) => {
      Object.defineProperty(e, n, {
        configurable: true,
        enumerable: false,
        get: () => we[n](t),
        // intercepted by the proxy so no need for implementation,
        // but needed to prevent set errors
        set: ot
      });
    }), e;
  }
  function Eu(t) {
    const {
      ctx: e,
      propsOptions: [n]
    } = t;
    n && Object.keys(n).forEach((o) => {
      Object.defineProperty(e, o, {
        enumerable: true,
        configurable: true,
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
          k(
            `setup() return property ${JSON.stringify(
              o
            )} should not start with "$" or "_" which are reserved prefixes for Vue internals.`
          );
          return;
        }
        Object.defineProperty(e, o, {
          enumerable: true,
          configurable: true,
          get: () => n[o],
          set: ot
        });
      }
    });
  }
  function Ar(t) {
    return C(t) ? t.reduce(
      (e, n) => (e[n] = null, e),
      {}
    ) : t;
  }
  function Nu() {
    const t = /* @__PURE__ */ Object.create(null);
    return (e, n) => {
      t[n] ? k(`${e} property "${n}" is already defined in ${t[n]}.`) : t[n] = e;
    };
  }
  let To = true;
  function Ou(t) {
    const e = ps(t), n = t.proxy, o = t.ctx;
    To = false, e.beforeCreate && Ir(e.beforeCreate, t, "bc");
    const {
      // state
      data: r,
      computed: i,
      methods: s,
      watch: a2,
      provide: u,
      inject: h,
      // lifecycle
      created: d,
      beforeMount: c,
      mounted: g,
      beforeUpdate: x2,
      updated: T2,
      activated: S,
      deactivated: it,
      beforeDestroy: Y2,
      beforeUnmount: U2,
      destroyed: F2,
      unmounted: wt,
      render: z2,
      renderTracked: st,
      renderTriggered: Dt,
      errorCaptured: lt,
      serverPrefetch: mt,
      // public API
      expose: Xt,
      inheritAttrs: ie2,
      // assets
      components: Vt,
      directives: xn,
      filters: vr
    } = e, se2 = f.NODE_ENV !== "production" ? Nu() : null;
    if (f.NODE_ENV !== "production") {
      const [P2] = t.propsOptions;
      if (P2)
        for (const A in P2)
          se2("Props", A);
    }
    if (h && Su(h, o, se2), s)
      for (const P2 in s) {
        const A = s[P2];
        M(A) ? (f.NODE_ENV !== "production" ? Object.defineProperty(o, P2, {
          value: A.bind(n),
          configurable: true,
          enumerable: true,
          writable: true
        }) : o[P2] = A.bind(n), f.NODE_ENV !== "production" && se2("Methods", P2)) : f.NODE_ENV !== "production" && k(
          `Method "${P2}" has type "${typeof A}" in the component definition. Did you reference the function correctly?`
        );
      }
    if (r) {
      f.NODE_ENV !== "production" && !M(r) && k(
        "The data option must be a function. Plain object usage is no longer supported."
      );
      const P2 = r.call(n, n);
      if (f.NODE_ENV !== "production" && Yo(P2) && k(
        "data() returned a Promise - note data() cannot be async; If you intend to perform data fetching before component renders, use async setup() + <Suspense>."
      ), !L(P2))
        f.NODE_ENV !== "production" && k("data() should return an object.");
      else if (t.data = bn(P2), f.NODE_ENV !== "production")
        for (const A in P2)
          se2("Data", A), dr(A[0]) || Object.defineProperty(o, A, {
            configurable: true,
            enumerable: true,
            get: () => P2[A],
            set: ot
          });
    }
    if (To = true, i)
      for (const P2 in i) {
        const A = i[P2], Ft = M(A) ? A.bind(n, n) : M(A.get) ? A.get.bind(n, n) : ot;
        f.NODE_ENV !== "production" && Ft === ot && k(`Computed property "${P2}" has no getter.`);
        const po = !M(A) && M(A.set) ? A.set.bind(n) : f.NODE_ENV !== "production" ? () => {
          k(
            `Write operation failed: computed property "${P2}" is readonly.`
          );
        } : ot, Be = St({
          get: Ft,
          set: po
        });
        Object.defineProperty(o, P2, {
          enumerable: true,
          configurable: true,
          get: () => Be.value,
          set: (Oe2) => Be.value = Oe2
        }), f.NODE_ENV !== "production" && se2("Computed", P2);
      }
    if (a2)
      for (const P2 in a2)
        cs(a2[P2], o, n, P2);
    if (u) {
      const P2 = M(u) ? u.call(n) : u;
      Reflect.ownKeys(P2).forEach((A) => {
        eu(A, P2[A]);
      });
    }
    d && Ir(d, t, "c");
    function yt(P2, A) {
      C(A) ? A.forEach((Ft) => P2(Ft.bind(n))) : A && P2(A.bind(n));
    }
    if (yt(pu, c), yt(du, g), yt(fu, x2), yt(hu, T2), yt(uu, S), yt(lu, it), yt(_u, lt), yt(yu, st), yt(mu, Dt), yt(bu, U2), yt(ss, wt), yt(gu, mt), C(Xt))
      if (Xt.length) {
        const P2 = t.exposed || (t.exposed = {});
        Xt.forEach((A) => {
          Object.defineProperty(P2, A, {
            get: () => n[A],
            set: (Ft) => n[A] = Ft,
            enumerable: true
          });
        });
      } else t.exposed || (t.exposed = {});
    z2 && t.render === ot && (t.render = z2), ie2 != null && (t.inheritAttrs = ie2), Vt && (t.components = Vt), xn && (t.directives = xn), mt && rs(t);
  }
  function Su(t, e, n = ot) {
    C(t) && (t = jo(t));
    for (const o in t) {
      const r = t[o];
      let i;
      L(r) ? "default" in r ? i = Vn(
        r.from || o,
        r.default,
        true
      ) : i = Vn(r.from || o) : i = Vn(r), et(i) ? Object.defineProperty(e, o, {
        enumerable: true,
        configurable: true,
        get: () => i.value,
        set: (s) => i.value = s
      }) : e[o] = i, f.NODE_ENV !== "production" && n("Inject", o);
    }
  }
  function Ir(t, e, n) {
    Yt(
      C(t) ? t.map((o) => o.bind(e.proxy)) : t.bind(e.proxy),
      e,
      n
    );
  }
  function cs(t, e, n, o) {
    let r = o.includes(".") ? os(n, o) : () => n[o];
    if (J(t)) {
      const i = e[t];
      M(i) ? $e(r, i) : f.NODE_ENV !== "production" && k(`Invalid watch handler specified by key "${t}"`, i);
    } else if (M(t))
      $e(r, t.bind(n));
    else if (L(t))
      if (C(t))
        t.forEach((i) => cs(i, e, n, o));
      else {
        const i = M(t.handler) ? t.handler.bind(n) : e[t.handler];
        M(i) ? $e(r, i, t) : f.NODE_ENV !== "production" && k(`Invalid watch handler specified by key "${t.handler}"`, i);
      }
    else f.NODE_ENV !== "production" && k(`Invalid watch option: "${o}"`, t);
  }
  function ps(t) {
    const e = t.type, { mixins: n, extends: o } = e, {
      mixins: r,
      optionsCache: i,
      config: { optionMergeStrategies: s }
    } = t.appContext, a2 = i.get(e);
    let u;
    return a2 ? u = a2 : !r.length && !n && !o ? u = e : (u = {}, r.length && r.forEach(
      (h) => Wn(u, h, s, true)
    ), Wn(u, e, s)), L(e) && i.set(e, u), u;
  }
  function Wn(t, e, n, o = false) {
    const { mixins: r, extends: i } = e;
    i && Wn(t, i, n, true), r && r.forEach(
      (s) => Wn(t, s, n, true)
    );
    for (const s in e)
      if (o && s === "expose")
        f.NODE_ENV !== "production" && k(
          '"expose" option is ignored when declared in mixins or extends. It should only be declared in the base component itself.'
        );
      else {
        const a2 = Cu[s] || n && n[s];
        t[s] = a2 ? a2(t[s], e[s]) : e[s];
      }
    return t;
  }
  const Cu = {
    data: Pr,
    props: Rr,
    emits: Rr,
    // objects
    methods: Ze,
    computed: Ze,
    // lifecycle
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
    // assets
    components: Ze,
    directives: Ze,
    // watch
    watch: zu,
    // provide / inject
    provide: Pr,
    inject: Du
  };
  function Pr(t, e) {
    return e ? t ? function() {
      return X(
        M(t) ? t.call(this, this) : t,
        M(e) ? e.call(this, this) : e
      );
    } : e : t;
  }
  function Du(t, e) {
    return Ze(jo(t), jo(e));
  }
  function jo(t) {
    if (C(t)) {
      const e = {};
      for (let n = 0; n < t.length; n++)
        e[t[n]] = t[n];
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
    return t ? C(t) && C(e) ? [.../* @__PURE__ */ new Set([...t, ...e])] : X(
      /* @__PURE__ */ Object.create(null),
      Ar(t),
      Ar(e ?? {})
    ) : e;
  }
  function zu(t, e) {
    if (!t) return e;
    if (!e) return t;
    const n = X(/* @__PURE__ */ Object.create(null), t);
    for (const o in e)
      n[o] = ht(t[o], e[o]);
    return n;
  }
  function ds() {
    return {
      app: null,
      config: {
        isNativeTag: vi,
        performance: false,
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
  let Vu = 0;
  function Mu(t, e) {
    return function(o, r = null) {
      M(o) || (o = X({}, o)), r != null && !L(r) && (f.NODE_ENV !== "production" && k("root props passed to app.mount() must be an object."), r = null);
      const i = ds(), s = /* @__PURE__ */ new WeakSet(), a2 = [];
      let u = false;
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
          f.NODE_ENV !== "production" && k(
            "app.config cannot be replaced. Modify individual options instead."
          );
        },
        use(d, ...c) {
          return s.has(d) ? f.NODE_ENV !== "production" && k("Plugin has already been applied to target app.") : d && M(d.install) ? (s.add(d), d.install(h, ...c)) : M(d) ? (s.add(d), d(h, ...c)) : f.NODE_ENV !== "production" && k(
            'A plugin must either be a function or an object with an "install" function.'
          ), h;
        },
        mixin(d) {
          return i.mixins.includes(d) ? f.NODE_ENV !== "production" && k(
            "Mixin has already been applied to target app" + (d.name ? `: ${d.name}` : "")
          ) : i.mixins.push(d), h;
        },
        component(d, c) {
          return f.NODE_ENV !== "production" && Ro(d, i.config), c ? (f.NODE_ENV !== "production" && i.components[d] && k(`Component "${d}" has already been registered in target app.`), i.components[d] = c, h) : i.components[d];
        },
        directive(d, c) {
          return f.NODE_ENV !== "production" && es(d), c ? (f.NODE_ENV !== "production" && i.directives[d] && k(`Directive "${d}" has already been registered in target app.`), i.directives[d] = c, h) : i.directives[d];
        },
        mount(d, c, g) {
          if (u)
            f.NODE_ENV !== "production" && k(
              "App has already been mounted.\nIf you want to remount the same app, move your app creation logic into a factory function and create fresh app instances for each mount - e.g. `const createMyApp = () => createApp(App)`"
            );
          else {
            f.NODE_ENV !== "production" && d.__vue_app__ && k(
              "There is already an app instance mounted on the host container.\n If you want to mount another app on the same host container, you need to unmount the previous app by calling `app.unmount()` first."
            );
            const x2 = h._ceVNode || rt(o, r);
            return x2.appContext = i, g === true ? g = "svg" : g === false && (g = void 0), f.NODE_ENV !== "production" && (i.reload = () => {
              const T2 = fe(x2);
              T2.el = null, t(T2, d, g);
            }), t(x2, d, g), u = true, h._container = d, d.__vue_app__ = h, f.NODE_ENV !== "production" && (h._instance = x2.component, Wa(h, Yr)), uo(x2.component);
          }
        },
        onUnmount(d) {
          f.NODE_ENV !== "production" && typeof d != "function" && k(
            `Expected function as first argument to app.onUnmount(), but got ${typeof d}`
          ), a2.push(d);
        },
        unmount() {
          u ? (Yt(
            a2,
            h._instance,
            16
          ), t(null, h._container), f.NODE_ENV !== "production" && (h._instance = null, qa(h)), delete h._container.__vue_app__) : f.NODE_ENV !== "production" && k("Cannot unmount an app that is not mounted.");
        },
        provide(d, c) {
          return f.NODE_ENV !== "production" && d in i.provides && (I(i.provides, d) ? k(
            `App already provides property with key "${String(d)}". It will be overwritten with the new value.`
          ) : k(
            `App already provides property with key "${String(d)}" inherited from its parent element. It will be overwritten with the new value.`
          )), i.provides[d] = c, h;
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
  let Ae = null;
  const Tu = (t, e) => e === "modelValue" || e === "model-value" ? t.modelModifiers : t[`${e}Modifiers`] || t[`${at(e)}Modifiers`] || t[`${kt(e)}Modifiers`];
  function ju(t, e, ...n) {
    if (t.isUnmounted) return;
    const o = t.vnode.props || B;
    if (f.NODE_ENV !== "production") {
      const {
        emitsOptions: d,
        propsOptions: [c]
      } = t;
      if (d)
        if (!(e in d))
          (!c || !(ge(at(e)) in c)) && k(
            `Component emitted event "${e}" but it is neither declared in the emits option nor as an "${ge(at(e))}" prop.`
          );
        else {
          const g = d[e];
          M(g) && (g(...n) || k(
            `Invalid event arguments: event validation failed for event "${e}".`
          ));
        }
    }
    let r = n;
    const i = e.startsWith("update:"), s = i && Tu(o, e.slice(7));
    if (s && (s.trim && (r = n.map((d) => J(d) ? d.trim() : d)), s.number && (r = n.map(Qo))), f.NODE_ENV !== "production" && Qa(t, e, r), f.NODE_ENV !== "production") {
      const d = e.toLowerCase();
      d !== e && o[ge(d)] && k(
        `Event "${d}" is emitted in component ${vn(
          t,
          t.type
        )} but the handler is registered for "${e}". Note that HTML attributes are case-insensitive and you cannot use v-on to listen to camelCase events when using in-DOM templates. You should probably use "${kt(
          e
        )}" instead of "${e}".`
      );
    }
    let a2, u = o[a2 = ge(e)] || // also try camelCase event handler (#2249)
    o[a2 = ge(at(e))];
    !u && i && (u = o[a2 = ge(kt(e))]), u && Yt(
      u,
      t,
      6,
      r
    );
    const h = o[a2 + "Once"];
    if (h) {
      if (!t.emitted)
        t.emitted = {};
      else if (t.emitted[a2])
        return;
      t.emitted[a2] = true, Yt(
        h,
        t,
        6,
        r
      );
    }
  }
  const $u = /* @__PURE__ */ new WeakMap();
  function fs(t, e, n = false) {
    const o = n ? $u : e.emitsCache, r = o.get(t);
    if (r !== void 0)
      return r;
    const i = t.emits;
    let s = {}, a2 = false;
    if (!M(t)) {
      const u = (h) => {
        const d = fs(h, e, true);
        d && (a2 = true, X(s, d));
      };
      !n && e.mixins.length && e.mixins.forEach(u), t.extends && u(t.extends), t.mixins && t.mixins.forEach(u);
    }
    return !i && !a2 ? (L(t) && o.set(t, null), null) : (C(i) ? i.forEach((u) => s[u] = null) : X(s, i), L(t) && o.set(t, s), s);
  }
  function ao(t, e) {
    return !t || !dn(e) ? false : (e = e.slice(2).replace(/Once$/, ""), I(t, e[0].toLowerCase() + e.slice(1)) || I(t, kt(e)) || I(t, e));
  }
  let $o = false;
  function qn() {
    $o = true;
  }
  function Fr(t) {
    const {
      type: e,
      vnode: n,
      proxy: o,
      withProxy: r,
      propsOptions: [i],
      slots: s,
      attrs: a2,
      emit: u,
      render: h,
      renderCache: d,
      props: c,
      data: g,
      setupState: x2,
      ctx: T2,
      inheritAttrs: S
    } = t, it = Bn(t);
    let Y2, U2;
    f.NODE_ENV !== "production" && ($o = false);
    try {
      if (n.shapeFlag & 4) {
        const z2 = r || o, st = f.NODE_ENV !== "production" && x2.__isScriptSetup ? new Proxy(z2, {
          get(Dt, lt, mt) {
            return k(
              `Property '${String(
                lt
              )}' was accessed via 'this'. Avoid using 'this' in templates.`
            ), Reflect.get(Dt, lt, mt);
          }
        }) : z2;
        Y2 = Mt(
          h.call(
            st,
            z2,
            d,
            f.NODE_ENV !== "production" ? Gt(c) : c,
            x2,
            g,
            T2
          )
        ), U2 = a2;
      } else {
        const z2 = e;
        f.NODE_ENV !== "production" && a2 === c && qn(), Y2 = Mt(
          z2.length > 1 ? z2(
            f.NODE_ENV !== "production" ? Gt(c) : c,
            f.NODE_ENV !== "production" ? {
              get attrs() {
                return qn(), Gt(a2);
              },
              slots: s,
              emit: u
            } : { attrs: a2, slots: s, emit: u }
          ) : z2(
            f.NODE_ENV !== "production" ? Gt(c) : c,
            null
          )
        ), U2 = e.props ? a2 : Au(a2);
      }
    } catch (z2) {
      rn.length = 0, gn(z2, t, 1), Y2 = rt(Ot);
    }
    let F2 = Y2, wt;
    if (f.NODE_ENV !== "production" && Y2.patchFlag > 0 && Y2.patchFlag & 2048 && ([F2, wt] = hs(Y2)), U2 && S !== false) {
      const z2 = Object.keys(U2), { shapeFlag: st } = F2;
      if (z2.length) {
        if (st & 7)
          i && z2.some(In) && (U2 = Iu(
            U2,
            i
          )), F2 = fe(F2, U2, false, true);
        else if (f.NODE_ENV !== "production" && !$o && F2.type !== Ot) {
          const Dt = Object.keys(a2), lt = [], mt = [];
          for (let Xt = 0, ie2 = Dt.length; Xt < ie2; Xt++) {
            const Vt = Dt[Xt];
            dn(Vt) ? In(Vt) || lt.push(Vt[2].toLowerCase() + Vt.slice(3)) : mt.push(Vt);
          }
          mt.length && k(
            `Extraneous non-props attributes (${mt.join(", ")}) were passed to component but could not be automatically inherited because component renders fragment or text or teleport root nodes.`
          ), lt.length && k(
            `Extraneous non-emits event listeners (${lt.join(", ")}) were passed to component but could not be automatically inherited because component renders fragment or text root nodes. If the listener is intended to be a component custom event listener only, declare it using the "emits" option.`
          );
        }
      }
    }
    return n.dirs && (f.NODE_ENV !== "production" && !Lr(F2) && k(
      "Runtime directive used on component with non-element root node. The directives will not function as intended."
    ), F2 = fe(F2, null, false, true), F2.dirs = F2.dirs ? F2.dirs.concat(n.dirs) : n.dirs), n.transition && (f.NODE_ENV !== "production" && !Lr(F2) && k(
      "Component inside <Transition> renders non-element root node that cannot be animated."
    ), lr(F2, n.transition)), f.NODE_ENV !== "production" && wt ? wt(F2) : Y2 = F2, Bn(it), Y2;
  }
  const hs = (t) => {
    const e = t.children, n = t.dynamicChildren, o = fr(e, false);
    if (o) {
      if (f.NODE_ENV !== "production" && o.patchFlag > 0 && o.patchFlag & 2048)
        return hs(o);
    } else return [t, void 0];
    const r = e.indexOf(o), i = n ? n.indexOf(o) : -1, s = (a2) => {
      e[r] = a2, n && (i > -1 ? n[i] = a2 : a2.patchFlag > 0 && (t.dynamicChildren = [...n, a2]));
    };
    return [Mt(o), s];
  };
  function fr(t, e = true) {
    let n;
    for (let o = 0; o < t.length; o++) {
      const r = t[o];
      if (Fe(r)) {
        if (r.type !== Ot || r.children === "v-if") {
          if (n)
            return;
          if (n = r, f.NODE_ENV !== "production" && e && n.patchFlag > 0 && n.patchFlag & 2048)
            return fr(n.children);
        }
      } else
        return;
    }
    return n;
  }
  const Au = (t) => {
    let e;
    for (const n in t)
      (n === "class" || n === "style" || dn(n)) && ((e || (e = {}))[n] = t[n]);
    return e;
  }, Iu = (t, e) => {
    const n = {};
    for (const o in t)
      (!In(o) || !(o.slice(9) in e)) && (n[o] = t[o]);
    return n;
  }, Lr = (t) => t.shapeFlag & 7 || t.type === Ot;
  function Pu(t, e, n) {
    const { props: o, children: r, component: i } = t, { props: s, children: a2, patchFlag: u } = e, h = i.emitsOptions;
    if (f.NODE_ENV !== "production" && (r || a2) && Tt || e.dirs || e.transition)
      return true;
    if (n && u >= 0) {
      if (u & 1024)
        return true;
      if (u & 16)
        return o ? Ur(o, s, h) : !!s;
      if (u & 8) {
        const d = e.dynamicProps;
        for (let c = 0; c < d.length; c++) {
          const g = d[c];
          if (s[g] !== o[g] && !ao(h, g))
            return true;
        }
      }
    } else
      return (r || a2) && (!a2 || !a2.$stable) ? true : o === s ? false : o ? s ? Ur(o, s, h) : true : !!s;
    return false;
  }
  function Ur(t, e, n) {
    const o = Object.keys(e);
    if (o.length !== Object.keys(t).length)
      return true;
    for (let r = 0; r < o.length; r++) {
      const i = o[r];
      if (e[i] !== t[i] && !ao(n, i))
        return true;
    }
    return false;
  }
  function Ru({ vnode: t, parent: e }, n) {
    for (; e; ) {
      const o = e.subTree;
      if (o.suspense && o.suspense.activeBranch === t && (o.el = t.el), o === t)
        (t = e.vnode).el = n, e = e.parent;
      else
        break;
    }
  }
  const bs = {}, gs = () => Object.create(bs), ms = (t) => Object.getPrototypeOf(t) === bs;
  function Fu(t, e, n, o = false) {
    const r = {}, i = gs();
    t.propsDefaults = /* @__PURE__ */ Object.create(null), ys(t, e, r, i);
    for (const s in t.propsOptions[0])
      s in r || (r[s] = void 0);
    f.NODE_ENV !== "production" && vs(e || {}, r, t), n ? t.props = o ? r : Oa(r) : t.type.props ? t.props = r : t.props = i, t.attrs = i;
  }
  function Lu(t) {
    for (; t; ) {
      if (t.type.__hmrId) return true;
      t = t.parent;
    }
  }
  function Uu(t, e, n, o) {
    const {
      props: r,
      attrs: i,
      vnode: { patchFlag: s }
    } = t, a2 = $(r), [u] = t.propsOptions;
    let h = false;
    if (
      // always force full diff in dev
      // - #1942 if hmr is enabled with sfc component
      // - vite#872 non-sfc component used by sfc component
      !(f.NODE_ENV !== "production" && Lu(t)) && (o || s > 0) && !(s & 16)
    ) {
      if (s & 8) {
        const d = t.vnode.dynamicProps;
        for (let c = 0; c < d.length; c++) {
          let g = d[c];
          if (ao(t.emitsOptions, g))
            continue;
          const x2 = e[g];
          if (u)
            if (I(i, g))
              x2 !== i[g] && (i[g] = x2, h = true);
            else {
              const T2 = at(g);
              r[T2] = Ao(
                u,
                a2,
                T2,
                x2,
                t,
                false
              );
            }
          else
            x2 !== i[g] && (i[g] = x2, h = true);
        }
      }
    } else {
      ys(t, e, r, i) && (h = true);
      let d;
      for (const c in a2)
        (!e || // for camelCase
        !I(e, c) && // it's possible the original props was passed in as kebab-case
        // and converted to camelCase (#955)
        ((d = kt(c)) === c || !I(e, d))) && (u ? n && // for camelCase
        (n[c] !== void 0 || // for kebab-case
        n[d] !== void 0) && (r[c] = Ao(
          u,
          a2,
          c,
          void 0,
          t,
          true
        )) : delete r[c]);
      if (i !== a2)
        for (const c in i)
          (!e || !I(e, c)) && (delete i[c], h = true);
    }
    h && Wt(t.attrs, "set", ""), f.NODE_ENV !== "production" && vs(e || {}, r, t);
  }
  function ys(t, e, n, o) {
    const [r, i] = t.propsOptions;
    let s = false, a2;
    if (e)
      for (let u in e) {
        if (Qe(u))
          continue;
        const h = e[u];
        let d;
        r && I(r, d = at(u)) ? !i || !i.includes(d) ? n[d] = h : (a2 || (a2 = {}))[d] = h : ao(t.emitsOptions, u) || (!(u in o) || h !== o[u]) && (o[u] = h, s = true);
      }
    if (i) {
      const u = $(n), h = a2 || B;
      for (let d = 0; d < i.length; d++) {
        const c = i[d];
        n[c] = Ao(
          r,
          u,
          c,
          h[c],
          t,
          !I(h, c)
        );
      }
    }
    return s;
  }
  function Ao(t, e, n, o, r, i) {
    const s = t[n];
    if (s != null) {
      const a2 = I(s, "default");
      if (a2 && o === void 0) {
        const u = s.default;
        if (s.type !== Function && !s.skipFactory && M(u)) {
          const { propsDefaults: h } = r;
          if (n in h)
            o = h[n];
          else {
            const d = _n(r);
            o = h[n] = u.call(
              null,
              e
            ), d();
          }
        } else
          o = u;
        r.ce && r.ce._setProp(n, o);
      }
      s[
        0
        /* shouldCast */
      ] && (i && !a2 ? o = false : s[
        1
        /* shouldCastTrue */
      ] && (o === "" || o === kt(n)) && (o = true));
    }
    return o;
  }
  const Hu = /* @__PURE__ */ new WeakMap();
  function _s(t, e, n = false) {
    const o = n ? Hu : e.propsCache, r = o.get(t);
    if (r)
      return r;
    const i = t.props, s = {}, a2 = [];
    let u = false;
    if (!M(t)) {
      const d = (c) => {
        u = true;
        const [g, x2] = _s(c, e, true);
        X(s, g), x2 && a2.push(...x2);
      };
      !n && e.mixins.length && e.mixins.forEach(d), t.extends && d(t.extends), t.mixins && t.mixins.forEach(d);
    }
    if (!i && !u)
      return L(t) && o.set(t, Te), Te;
    if (C(i))
      for (let d = 0; d < i.length; d++) {
        f.NODE_ENV !== "production" && !J(i[d]) && k("props must be strings when using array syntax.", i[d]);
        const c = at(i[d]);
        Hr(c) && (s[c] = B);
      }
    else if (i) {
      f.NODE_ENV !== "production" && !L(i) && k("invalid props options", i);
      for (const d in i) {
        const c = at(d);
        if (Hr(c)) {
          const g = i[d], x2 = s[c] = C(g) || M(g) ? { type: g } : X({}, g), T2 = x2.type;
          let S = false, it = true;
          if (C(T2))
            for (let Y2 = 0; Y2 < T2.length; ++Y2) {
              const U2 = T2[Y2], F2 = M(U2) && U2.name;
              if (F2 === "Boolean") {
                S = true;
                break;
              } else F2 === "String" && (it = false);
            }
          else
            S = M(T2) && T2.name === "Boolean";
          x2[
            0
            /* shouldCast */
          ] = S, x2[
            1
            /* shouldCastTrue */
          ] = it, (S || I(x2, "default")) && a2.push(c);
        }
      }
    }
    const h = [s, a2];
    return L(t) && o.set(t, h), h;
  }
  function Hr(t) {
    return t[0] !== "$" && !Qe(t) ? true : (f.NODE_ENV !== "production" && k(`Invalid prop name: "${t}" is a reserved property.`), false);
  }
  function Bu(t) {
    return t === null ? "null" : typeof t == "function" ? t.name || "" : typeof t == "object" && t.constructor && t.constructor.name || "";
  }
  function vs(t, e, n) {
    const o = $(e), r = n.propsOptions[0], i = Object.keys(t).map((s) => at(s));
    for (const s in r) {
      let a2 = r[s];
      a2 != null && Ku(
        s,
        o[s],
        a2,
        f.NODE_ENV !== "production" ? Gt(o) : o,
        !i.includes(s)
      );
    }
  }
  function Ku(t, e, n, o, r) {
    const { type: i, required: s, validator: a2, skipCheck: u } = n;
    if (s && r) {
      k('Missing required prop: "' + t + '"');
      return;
    }
    if (!(e == null && !s)) {
      if (i != null && i !== true && !u) {
        let h = false;
        const d = C(i) ? i : [i], c = [];
        for (let g = 0; g < d.length && !h; g++) {
          const { valid: x2, expectedType: T2 } = qu(e, d[g]);
          c.push(T2 || ""), h = x2;
        }
        if (!h) {
          k(Gu(t, e, c));
          return;
        }
      }
      a2 && !a2(e, o) && k('Invalid prop: custom validator check failed for prop "' + t + '".');
    }
  }
  const Wu = /* @__PURE__ */ oe(
    "String,Number,Boolean,Function,Symbol,BigInt"
  );
  function qu(t, e) {
    let n;
    const o = Bu(e);
    if (o === "null")
      n = t === null;
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
    if (n.length === 0)
      return `Prop type [] for prop "${t}" won't match anything. Did you mean to use type Array instead?`;
    let o = `Invalid prop: type check failed for prop "${t}". Expected ${n.map(Ee).join(" | ")}`;
    const r = n[0], i = Xo(e), s = Br(e, r), a2 = Br(e, i);
    return n.length === 1 && Kr(r) && !Ju(r, i) && (o += ` with value ${s}`), o += `, got ${i} `, Kr(i) && (o += `with value ${a2}.`), o;
  }
  function Br(t, e) {
    return e === "String" ? `"${t}"` : e === "Number" ? `${Number(t)}` : `${t}`;
  }
  function Kr(t) {
    return ["string", "number", "boolean"].some((n) => t.toLowerCase() === n);
  }
  function Ju(...t) {
    return t.some((e) => e.toLowerCase() === "boolean");
  }
  const hr = (t) => t === "_" || t === "_ctx" || t === "$stable", br = (t) => C(t) ? t.map(Mt) : [Mt(t)], Yu = (t, e, n) => {
    if (e._n)
      return e;
    const o = tu((...r) => (f.NODE_ENV !== "production" && tt && !(n === null && dt) && !(n && n.root !== tt.root) && k(
      `Slot "${t}" invoked outside of the render function: this will not track dependencies used in the slot. Invoke the slot function inside the render function instead.`
    ), br(e(...r))), n);
    return o._c = false, o;
  }, xs = (t, e, n) => {
    const o = t._ctx;
    for (const r in t) {
      if (hr(r)) continue;
      const i = t[r];
      if (M(i))
        e[r] = Yu(r, i, o);
      else if (i != null) {
        f.NODE_ENV !== "production" && k(
          `Non-function value encountered for slot "${r}". Prefer function slots for better performance.`
        );
        const s = br(i);
        e[r] = () => s;
      }
    }
  }, ws = (t, e) => {
    f.NODE_ENV !== "production" && !cr(t.vnode) && k(
      "Non-function value encountered for default slot. Prefer function slots for better performance."
    );
    const n = br(e);
    t.slots.default = () => n;
  }, Io = (t, e, n) => {
    for (const o in e)
      (n || !hr(o)) && (t[o] = e[o]);
  }, Xu = (t, e, n) => {
    const o = t.slots = gs();
    if (t.vnode.shapeFlag & 32) {
      const r = e._;
      r ? (Io(o, e, n), n && Pn(o, "_", r, true)) : xs(e, o);
    } else e && ws(t, e);
  }, Zu = (t, e, n) => {
    const { vnode: o, slots: r } = t;
    let i = true, s = B;
    if (o.shapeFlag & 32) {
      const a2 = e._;
      a2 ? f.NODE_ENV !== "production" && Tt ? (Io(r, e, n), Wt(t, "set", "$slots")) : n && a2 === 1 ? i = false : Io(r, e, n) : (i = !e.$stable, xs(e, r)), s = e;
    } else e && (ws(t, e), s = { default: 1 });
    if (i)
      for (const a2 in r)
        !hr(a2) && s[a2] == null && delete r[a2];
  };
  let Je, te;
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
    return Je !== void 0 || (typeof window < "u" && window.performance ? (Je = true, te = window.performance) : Je = false), Je;
  }
  function Qu() {
    const t = [];
    if (f.NODE_ENV !== "production" && t.length) {
      const e = t.length > 1;
      console.warn(
        `Feature flag${e ? "s" : ""} ${t.join(", ")} ${e ? "are" : "is"} not explicitly defined. You are running the esm-bundler build of Vue, which expects these compile-time feature flags to be globally injected via the bundler config in order to get better tree-shaking in the production bundle.

For more details, see https://link.vuejs.org/feature-flags.`
      );
    }
  }
  const Et = rl;
  function tl(t) {
    return el(t);
  }
  function el(t, e) {
    Qu();
    const n = hn();
    n.__VUE__ = true, f.NODE_ENV !== "production" && Xi(n.__VUE_DEVTOOLS_GLOBAL_HOOK__, n);
    const {
      insert: o,
      remove: r,
      patchProp: i,
      createElement: s,
      createText: a2,
      createComment: u,
      setText: h,
      setElementText: d,
      parentNode: c,
      nextSibling: g,
      setScopeId: x2 = ot,
      insertStaticContent: T2
    } = t, S = (l, p, b2, v2 = null, y = null, m = null, N = void 0, w2 = null, E = f.NODE_ENV !== "production" && Tt ? false : !!p.dynamicChildren) => {
      if (l === p)
        return;
      l && !Ye(l, p) && (v2 = wn(l), ae2(l, y, m, true), l = null), p.patchFlag === -2 && (E = false, p.dynamicChildren = null);
      const { type: _2, ref: V2, shapeFlag: O2 } = p;
      switch (_2) {
        case yn:
          it(l, p, b2, v2);
          break;
        case Ot:
          Y2(l, p, b2, v2);
          break;
        case Tn:
          l == null ? U2(p, b2, v2, N) : f.NODE_ENV !== "production" && F2(l, p, b2, N);
          break;
        case pt:
          xn(
            l,
            p,
            b2,
            v2,
            y,
            m,
            N,
            w2,
            E
          );
          break;
        default:
          O2 & 1 ? st(
            l,
            p,
            b2,
            v2,
            y,
            m,
            N,
            w2,
            E
          ) : O2 & 6 ? vr(
            l,
            p,
            b2,
            v2,
            y,
            m,
            N,
            w2,
            E
          ) : O2 & 64 || O2 & 128 ? _2.process(
            l,
            p,
            b2,
            v2,
            y,
            m,
            N,
            w2,
            E,
            We
          ) : f.NODE_ENV !== "production" && k("Invalid VNode type:", _2, `(${typeof _2})`);
      }
      V2 != null && y ? nn(V2, l && l.ref, m, p || l, !p) : V2 == null && l && l.ref != null && nn(l.ref, null, m, l, true);
    }, it = (l, p, b2, v2) => {
      if (l == null)
        o(
          p.el = a2(p.children),
          b2,
          v2
        );
      else {
        const y = p.el = l.el;
        if (p.children !== l.children)
          if (f.NODE_ENV !== "production" && Tt && p.patchFlag === -1 && "__elIndex" in l) {
            const m = b2.childNodes, N = a2(p.children), w2 = m[p.__elIndex = l.__elIndex];
            o(N, b2, w2), r(w2);
          } else
            h(y, p.children);
      }
    }, Y2 = (l, p, b2, v2) => {
      l == null ? o(
        p.el = u(p.children || ""),
        b2,
        v2
      ) : p.el = l.el;
    }, U2 = (l, p, b2, v2) => {
      [l.el, l.anchor] = T2(
        l.children,
        p,
        b2,
        v2,
        l.el,
        l.anchor
      );
    }, F2 = (l, p, b2, v2) => {
      if (p.children !== l.children) {
        const y = g(l.anchor);
        z2(l), [p.el, p.anchor] = T2(
          p.children,
          b2,
          y,
          v2
        );
      } else
        p.el = l.el, p.anchor = l.anchor;
    }, wt = ({ el: l, anchor: p }, b2, v2) => {
      let y;
      for (; l && l !== p; )
        y = g(l), o(l, b2, v2), l = y;
      o(p, b2, v2);
    }, z2 = ({ el: l, anchor: p }) => {
      let b2;
      for (; l && l !== p; )
        b2 = g(l), r(l), l = b2;
      r(p);
    }, st = (l, p, b2, v2, y, m, N, w2, E) => {
      if (p.type === "svg" ? N = "svg" : p.type === "math" && (N = "mathml"), l == null)
        Dt(
          p,
          b2,
          v2,
          y,
          m,
          N,
          w2,
          E
        );
      else {
        const _2 = l.el && l.el._isVueCE ? l.el : null;
        try {
          _2 && _2._beginPatch(), Xt(
            l,
            p,
            y,
            m,
            N,
            w2,
            E
          );
        } finally {
          _2 && _2._endPatch();
        }
      }
    }, Dt = (l, p, b2, v2, y, m, N, w2) => {
      let E, _2;
      const { props: V2, shapeFlag: O2, transition: D2, dirs: j2 } = l;
      if (E = l.el = s(
        l.type,
        m,
        V2 && V2.is,
        V2
      ), O2 & 8 ? d(E, l.children) : O2 & 16 && mt(
        l.children,
        E,
        null,
        v2,
        y,
        wo(l, m),
        N,
        w2
      ), j2 && he(l, null, v2, "created"), lt(E, l, l.scopeId, N, v2), V2) {
        for (const G2 in V2)
          G2 !== "value" && !Qe(G2) && i(E, G2, null, V2[G2], m, v2);
        "value" in V2 && i(E, "value", null, V2.value, m), (_2 = V2.onVnodeBeforeMount) && Bt(_2, v2, l);
      }
      f.NODE_ENV !== "production" && (Pn(E, "__vnode", l, true), Pn(E, "__vueParentComponent", v2, true)), j2 && he(l, null, v2, "beforeMount");
      const R2 = nl(y, D2);
      R2 && D2.beforeEnter(E), o(E, p, b2), ((_2 = V2 && V2.onVnodeMounted) || R2 || j2) && Et(() => {
        _2 && Bt(_2, v2, l), R2 && D2.enter(E), j2 && he(l, null, v2, "mounted");
      }, y);
    }, lt = (l, p, b2, v2, y) => {
      if (b2 && x2(l, b2), v2)
        for (let m = 0; m < v2.length; m++)
          x2(l, v2[m]);
      if (y) {
        let m = y.subTree;
        if (f.NODE_ENV !== "production" && m.patchFlag > 0 && m.patchFlag & 2048 && (m = fr(m.children) || m), p === m || Ns(m.type) && (m.ssContent === p || m.ssFallback === p)) {
          const N = y.vnode;
          lt(
            l,
            N,
            N.scopeId,
            N.slotScopeIds,
            y.parent
          );
        }
      }
    }, mt = (l, p, b2, v2, y, m, N, w2, E = 0) => {
      for (let _2 = E; _2 < l.length; _2++) {
        const V2 = l[_2] = w2 ? ce(l[_2]) : Mt(l[_2]);
        S(
          null,
          V2,
          p,
          b2,
          v2,
          y,
          m,
          N,
          w2
        );
      }
    }, Xt = (l, p, b2, v2, y, m, N) => {
      const w2 = p.el = l.el;
      f.NODE_ENV !== "production" && (w2.__vnode = p);
      let { patchFlag: E, dynamicChildren: _2, dirs: V2 } = p;
      E |= l.patchFlag & 16;
      const O2 = l.props || B, D2 = p.props || B;
      let j2;
      if (b2 && be(b2, false), (j2 = D2.onVnodeBeforeUpdate) && Bt(j2, b2, p, l), V2 && he(p, l, b2, "beforeUpdate"), b2 && be(b2, true), f.NODE_ENV !== "production" && Tt && (E = 0, N = false, _2 = null), (O2.innerHTML && D2.innerHTML == null || O2.textContent && D2.textContent == null) && d(w2, ""), _2 ? (ie2(
        l.dynamicChildren,
        _2,
        w2,
        b2,
        v2,
        wo(p, y),
        m
      ), f.NODE_ENV !== "production" && Mn(l, p)) : N || Ft(
        l,
        p,
        w2,
        null,
        b2,
        v2,
        wo(p, y),
        m,
        false
      ), E > 0) {
        if (E & 16)
          Vt(w2, O2, D2, b2, y);
        else if (E & 2 && O2.class !== D2.class && i(w2, "class", null, D2.class, y), E & 4 && i(w2, "style", O2.style, D2.style, y), E & 8) {
          const R2 = p.dynamicProps;
          for (let G2 = 0; G2 < R2.length; G2++) {
            const K2 = R2[G2], _t3 = O2[K2], vt = D2[K2];
            (vt !== _t3 || K2 === "value") && i(w2, K2, _t3, vt, y, b2);
          }
        }
        E & 1 && l.children !== p.children && d(w2, p.children);
      } else !N && _2 == null && Vt(w2, O2, D2, b2, y);
      ((j2 = D2.onVnodeUpdated) || V2) && Et(() => {
        j2 && Bt(j2, b2, p, l), V2 && he(p, l, b2, "updated");
      }, v2);
    }, ie2 = (l, p, b2, v2, y, m, N) => {
      for (let w2 = 0; w2 < p.length; w2++) {
        const E = l[w2], _2 = p[w2], V2 = (
          // oldVNode may be an errored async setup() component inside Suspense
          // which will not have a mounted element
          E.el && // - In the case of a Fragment, we need to provide the actual parent
          // of the Fragment itself so it can move its children.
          (E.type === pt || // - In the case of different nodes, there is going to be a replacement
          // which also requires the correct parent container
          !Ye(E, _2) || // - In the case of a component, it could contain anything.
          E.shapeFlag & 198) ? c(E.el) : (
            // In other cases, the parent container is not actually used so we
            // just pass the block element here to avoid a DOM parentNode call.
            b2
          )
        );
        S(
          E,
          _2,
          V2,
          null,
          v2,
          y,
          m,
          N,
          true
        );
      }
    }, Vt = (l, p, b2, v2, y) => {
      if (p !== b2) {
        if (p !== B)
          for (const m in p)
            !Qe(m) && !(m in b2) && i(
              l,
              m,
              p[m],
              null,
              y,
              v2
            );
        for (const m in b2) {
          if (Qe(m)) continue;
          const N = b2[m], w2 = p[m];
          N !== w2 && m !== "value" && i(l, m, w2, N, y, v2);
        }
        "value" in b2 && i(l, "value", p.value, b2.value, y);
      }
    }, xn = (l, p, b2, v2, y, m, N, w2, E) => {
      const _2 = p.el = l ? l.el : a2(""), V2 = p.anchor = l ? l.anchor : a2("");
      let { patchFlag: O2, dynamicChildren: D2, slotScopeIds: j2 } = p;
      f.NODE_ENV !== "production" && // #5523 dev root fragment may inherit directives
      (Tt || O2 & 2048) && (O2 = 0, E = false, D2 = null), j2 && (w2 = w2 ? w2.concat(j2) : j2), l == null ? (o(_2, b2, v2), o(V2, b2, v2), mt(
        // #10007
        // such fragment like `<></>` will be compiled into
        // a fragment which doesn't have a children.
        // In this case fallback to an empty array
        p.children || [],
        b2,
        V2,
        y,
        m,
        N,
        w2,
        E
      )) : O2 > 0 && O2 & 64 && D2 && // #2715 the previous fragment could've been a BAILed one as a result
      // of renderSlot() with no valid children
      l.dynamicChildren && l.dynamicChildren.length === D2.length ? (ie2(
        l.dynamicChildren,
        D2,
        b2,
        y,
        m,
        N,
        w2
      ), f.NODE_ENV !== "production" ? Mn(l, p) : (
        // #2080 if the stable fragment has a key, it's a <template v-for> that may
        //  get moved around. Make sure all root level vnodes inherit el.
        // #2134 or if it's a component root, it may also get moved around
        // as the component is being moved.
        (p.key != null || y && p === y.subTree) && Mn(
          l,
          p,
          true
          /* shallow */
        )
      )) : Ft(
        l,
        p,
        b2,
        V2,
        y,
        m,
        N,
        w2,
        E
      );
    }, vr = (l, p, b2, v2, y, m, N, w2, E) => {
      p.slotScopeIds = w2, l == null ? p.shapeFlag & 512 ? y.ctx.activate(
        p,
        b2,
        v2,
        N,
        E
      ) : se2(
        p,
        b2,
        v2,
        y,
        m,
        N,
        E
      ) : yt(l, p, E);
    }, se2 = (l, p, b2, v2, y, m, N) => {
      const w2 = l.component = dl(
        l,
        v2,
        y
      );
      if (f.NODE_ENV !== "production" && w2.type.__hmrId && Ua(w2), f.NODE_ENV !== "production" && (Cn(l), De(w2, "mount")), cr(l) && (w2.ctx.renderer = We), f.NODE_ENV !== "production" && De(w2, "init"), hl(w2, false, N), f.NODE_ENV !== "production" && ze(w2, "init"), f.NODE_ENV !== "production" && Tt && (l.el = null), w2.asyncDep) {
        if (y && y.registerDep(w2, P2, N), !l.el) {
          const E = w2.subTree = rt(Ot);
          Y2(null, E, p, b2), l.placeholder = E.el;
        }
      } else
        P2(
          w2,
          l,
          p,
          b2,
          y,
          m,
          N
        );
      f.NODE_ENV !== "production" && (Dn(), ze(w2, "mount"));
    }, yt = (l, p, b2) => {
      const v2 = p.component = l.component;
      if (Pu(l, p, b2))
        if (v2.asyncDep && !v2.asyncResolved) {
          f.NODE_ENV !== "production" && Cn(p), A(v2, p, b2), f.NODE_ENV !== "production" && Dn();
          return;
        } else
          v2.next = p, v2.update();
      else
        p.el = l.el, v2.vnode = p;
    }, P2 = (l, p, b2, v2, y, m, N) => {
      const w2 = () => {
        if (l.isMounted) {
          let { next: O2, bu: D2, u: j2, parent: R2, vnode: G2 } = l;
          {
            const Ut = Es(l);
            if (Ut) {
              O2 && (O2.el = G2.el, A(l, O2, N)), Ut.asyncDep.then(() => {
                l.isUnmounted || w2();
              });
              return;
            }
          }
          let K2 = O2, _t3;
          f.NODE_ENV !== "production" && Cn(O2 || l.vnode), be(l, false), O2 ? (O2.el = G2.el, A(l, O2, N)) : O2 = G2, D2 && Ve(D2), (_t3 = O2.props && O2.props.onVnodeBeforeUpdate) && Bt(_t3, R2, O2, G2), be(l, true), f.NODE_ENV !== "production" && De(l, "render");
          const vt = Fr(l);
          f.NODE_ENV !== "production" && ze(l, "render");
          const Lt = l.subTree;
          l.subTree = vt, f.NODE_ENV !== "production" && De(l, "patch"), S(
            Lt,
            vt,
            // parent may have changed if it's in a teleport
            c(Lt.el),
            // anchor may have changed if it's in a fragment
            wn(Lt),
            l,
            y,
            m
          ), f.NODE_ENV !== "production" && ze(l, "patch"), O2.el = vt.el, K2 === null && Ru(l, vt.el), j2 && Et(j2, y), (_t3 = O2.props && O2.props.onVnodeUpdated) && Et(
            () => Bt(_t3, R2, O2, G2),
            y
          ), f.NODE_ENV !== "production" && Zi(l), f.NODE_ENV !== "production" && Dn();
        } else {
          let O2;
          const { el: D2, props: j2 } = p, { bm: R2, m: G2, parent: K2, root: _t3, type: vt } = l, Lt = on(p);
          be(l, false), R2 && Ve(R2), !Lt && (O2 = j2 && j2.onVnodeBeforeMount) && Bt(O2, K2, p), be(l, true);
          {
            _t3.ce && // @ts-expect-error _def is private
            _t3.ce._def.shadowRoot !== false && _t3.ce._injectChildStyle(vt), f.NODE_ENV !== "production" && De(l, "render");
            const Ut = l.subTree = Fr(l);
            f.NODE_ENV !== "production" && ze(l, "render"), f.NODE_ENV !== "production" && De(l, "patch"), S(
              null,
              Ut,
              b2,
              v2,
              l,
              y,
              m
            ), f.NODE_ENV !== "production" && ze(l, "patch"), p.el = Ut.el;
          }
          if (G2 && Et(G2, y), !Lt && (O2 = j2 && j2.onVnodeMounted)) {
            const Ut = p;
            Et(
              () => Bt(O2, K2, Ut),
              y
            );
          }
          (p.shapeFlag & 256 || K2 && on(K2.vnode) && K2.vnode.shapeFlag & 256) && l.a && Et(l.a, y), l.isMounted = true, f.NODE_ENV !== "production" && Ga(l), p = b2 = v2 = null;
        }
      };
      l.scope.on();
      const E = l.effect = new Oi(w2);
      l.scope.off();
      const _2 = l.update = E.run.bind(E), V2 = l.job = E.runIfDirty.bind(E);
      V2.i = l, V2.id = l.uid, E.scheduler = () => io(V2), be(l, true), f.NODE_ENV !== "production" && (E.onTrack = l.rtc ? (O2) => Ve(l.rtc, O2) : void 0, E.onTrigger = l.rtg ? (O2) => Ve(l.rtg, O2) : void 0), _2();
    }, A = (l, p, b2) => {
      p.component = l;
      const v2 = l.vnode.props;
      l.vnode = p, l.next = null, Uu(l, p.props, v2, b2), Zu(l, p.children, b2), At(), Vr(l), It();
    }, Ft = (l, p, b2, v2, y, m, N, w2, E = false) => {
      const _2 = l && l.children, V2 = l ? l.shapeFlag : 0, O2 = p.children, { patchFlag: D2, shapeFlag: j2 } = p;
      if (D2 > 0) {
        if (D2 & 128) {
          Be(
            _2,
            O2,
            b2,
            v2,
            y,
            m,
            N,
            w2,
            E
          );
          return;
        } else if (D2 & 256) {
          po(
            _2,
            O2,
            b2,
            v2,
            y,
            m,
            N,
            w2,
            E
          );
          return;
        }
      }
      j2 & 8 ? (V2 & 16 && Ke(_2, y, m), O2 !== _2 && d(b2, O2)) : V2 & 16 ? j2 & 16 ? Be(
        _2,
        O2,
        b2,
        v2,
        y,
        m,
        N,
        w2,
        E
      ) : Ke(_2, y, m, true) : (V2 & 8 && d(b2, ""), j2 & 16 && mt(
        O2,
        b2,
        v2,
        y,
        m,
        N,
        w2,
        E
      ));
    }, po = (l, p, b2, v2, y, m, N, w2, E) => {
      l = l || Te, p = p || Te;
      const _2 = l.length, V2 = p.length, O2 = Math.min(_2, V2);
      let D2;
      for (D2 = 0; D2 < O2; D2++) {
        const j2 = p[D2] = E ? ce(p[D2]) : Mt(p[D2]);
        S(
          l[D2],
          j2,
          b2,
          null,
          y,
          m,
          N,
          w2,
          E
        );
      }
      _2 > V2 ? Ke(
        l,
        y,
        m,
        true,
        false,
        O2
      ) : mt(
        p,
        b2,
        v2,
        y,
        m,
        N,
        w2,
        E,
        O2
      );
    }, Be = (l, p, b2, v2, y, m, N, w2, E) => {
      let _2 = 0;
      const V2 = p.length;
      let O2 = l.length - 1, D2 = V2 - 1;
      for (; _2 <= O2 && _2 <= D2; ) {
        const j2 = l[_2], R2 = p[_2] = E ? ce(p[_2]) : Mt(p[_2]);
        if (Ye(j2, R2))
          S(
            j2,
            R2,
            b2,
            null,
            y,
            m,
            N,
            w2,
            E
          );
        else
          break;
        _2++;
      }
      for (; _2 <= O2 && _2 <= D2; ) {
        const j2 = l[O2], R2 = p[D2] = E ? ce(p[D2]) : Mt(p[D2]);
        if (Ye(j2, R2))
          S(
            j2,
            R2,
            b2,
            null,
            y,
            m,
            N,
            w2,
            E
          );
        else
          break;
        O2--, D2--;
      }
      if (_2 > O2) {
        if (_2 <= D2) {
          const j2 = D2 + 1, R2 = j2 < V2 ? p[j2].el : v2;
          for (; _2 <= D2; )
            S(
              null,
              p[_2] = E ? ce(p[_2]) : Mt(p[_2]),
              b2,
              R2,
              y,
              m,
              N,
              w2,
              E
            ), _2++;
        }
      } else if (_2 > D2)
        for (; _2 <= O2; )
          ae2(l[_2], y, m, true), _2++;
      else {
        const j2 = _2, R2 = _2, G2 = /* @__PURE__ */ new Map();
        for (_2 = R2; _2 <= D2; _2++) {
          const ft = p[_2] = E ? ce(p[_2]) : Mt(p[_2]);
          ft.key != null && (f.NODE_ENV !== "production" && G2.has(ft.key) && k(
            "Duplicate keys found during update:",
            JSON.stringify(ft.key),
            "Make sure keys are unique."
          ), G2.set(ft.key, _2));
        }
        let K2, _t3 = 0;
        const vt = D2 - R2 + 1;
        let Lt = false, Ut = 0;
        const qe = new Array(vt);
        for (_2 = 0; _2 < vt; _2++) qe[_2] = 0;
        for (_2 = j2; _2 <= O2; _2++) {
          const ft = l[_2];
          if (_t3 >= vt) {
            ae2(ft, y, m, true);
            continue;
          }
          let Ht;
          if (ft.key != null)
            Ht = G2.get(ft.key);
          else
            for (K2 = R2; K2 <= D2; K2++)
              if (qe[K2 - R2] === 0 && Ye(ft, p[K2])) {
                Ht = K2;
                break;
              }
          Ht === void 0 ? ae2(ft, y, m, true) : (qe[Ht - R2] = _2 + 1, Ht >= Ut ? Ut = Ht : Lt = true, S(
            ft,
            p[Ht],
            b2,
            null,
            y,
            m,
            N,
            w2,
            E
          ), _t3++);
        }
        const wr = Lt ? ol(qe) : Te;
        for (K2 = wr.length - 1, _2 = vt - 1; _2 >= 0; _2--) {
          const ft = R2 + _2, Ht = p[ft], Er = p[ft + 1], kr = ft + 1 < V2 ? (
            // #13559, #14173 fallback to el placeholder for unresolved async component
            Er.el || ks(Er)
          ) : v2;
          qe[_2] === 0 ? S(
            null,
            Ht,
            b2,
            kr,
            y,
            m,
            N,
            w2,
            E
          ) : Lt && (K2 < 0 || _2 !== wr[K2] ? Oe2(Ht, b2, kr, 2) : K2--);
        }
      }
    }, Oe2 = (l, p, b2, v2, y = null) => {
      const { el: m, type: N, transition: w2, children: E, shapeFlag: _2 } = l;
      if (_2 & 6) {
        Oe2(l.component.subTree, p, b2, v2);
        return;
      }
      if (_2 & 128) {
        l.suspense.move(p, b2, v2);
        return;
      }
      if (_2 & 64) {
        N.move(l, p, b2, We);
        return;
      }
      if (N === pt) {
        o(m, p, b2);
        for (let O2 = 0; O2 < E.length; O2++)
          Oe2(E[O2], p, b2, v2);
        o(l.anchor, p, b2);
        return;
      }
      if (N === Tn) {
        wt(l, p, b2);
        return;
      }
      if (v2 !== 2 && _2 & 1 && w2)
        if (v2 === 0)
          w2.beforeEnter(m), o(m, p, b2), Et(() => w2.enter(m), y);
        else {
          const { leave: O2, delayLeave: D2, afterLeave: j2 } = w2, R2 = () => {
            l.ctx.isUnmounted ? r(m) : o(m, p, b2);
          }, G2 = () => {
            m._isLeaving && m[au](
              true
              /* cancelled */
            ), O2(m, () => {
              R2(), j2 && j2();
            });
          };
          D2 ? D2(m, R2, G2) : G2();
        }
      else
        o(m, p, b2);
    }, ae2 = (l, p, b2, v2 = false, y = false) => {
      const {
        type: m,
        props: N,
        ref: w2,
        children: E,
        dynamicChildren: _2,
        shapeFlag: V2,
        patchFlag: O2,
        dirs: D2,
        cacheIndex: j2
      } = l;
      if (O2 === -2 && (y = false), w2 != null && (At(), nn(w2, null, b2, l, true), It()), j2 != null && (p.renderCache[j2] = void 0), V2 & 256) {
        p.ctx.deactivate(l);
        return;
      }
      const R2 = V2 & 1 && D2, G2 = !on(l);
      let K2;
      if (G2 && (K2 = N && N.onVnodeBeforeUnmount) && Bt(K2, p, l), V2 & 6)
        Us(l.component, b2, v2);
      else {
        if (V2 & 128) {
          l.suspense.unmount(b2, v2);
          return;
        }
        R2 && he(l, null, p, "beforeUnmount"), V2 & 64 ? l.type.remove(
          l,
          p,
          b2,
          We,
          v2
        ) : _2 && // #5154
        // when v-once is used inside a block, setBlockTracking(-1) marks the
        // parent block with hasOnce: true
        // so that it doesn't take the fast path during unmount - otherwise
        // components nested in v-once are never unmounted.
        !_2.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
        (m !== pt || O2 > 0 && O2 & 64) ? Ke(
          _2,
          p,
          b2,
          false,
          true
        ) : (m === pt && O2 & 384 || !y && V2 & 16) && Ke(E, p, b2), v2 && fo(l);
      }
      (G2 && (K2 = N && N.onVnodeUnmounted) || R2) && Et(() => {
        K2 && Bt(K2, p, l), R2 && he(l, null, p, "unmounted");
      }, b2);
    }, fo = (l) => {
      const { type: p, el: b2, anchor: v2, transition: y } = l;
      if (p === pt) {
        f.NODE_ENV !== "production" && l.patchFlag > 0 && l.patchFlag & 2048 && y && !y.persisted ? l.children.forEach((N) => {
          N.type === Ot ? r(N.el) : fo(N);
        }) : Ls(b2, v2);
        return;
      }
      if (p === Tn) {
        z2(l);
        return;
      }
      const m = () => {
        r(b2), y && !y.persisted && y.afterLeave && y.afterLeave();
      };
      if (l.shapeFlag & 1 && y && !y.persisted) {
        const { leave: N, delayLeave: w2 } = y, E = () => N(b2, m);
        w2 ? w2(l.el, m, E) : E();
      } else
        m();
    }, Ls = (l, p) => {
      let b2;
      for (; l !== p; )
        b2 = g(l), r(l), l = b2;
      r(p);
    }, Us = (l, p, b2) => {
      f.NODE_ENV !== "production" && l.type.__hmrId && Ha(l);
      const { bum: v2, scope: y, job: m, subTree: N, um: w2, m: E, a: _2 } = l;
      Wr(E), Wr(_2), v2 && Ve(v2), y.stop(), m && (m.flags |= 8, ae2(N, l, p, b2)), w2 && Et(w2, p), Et(() => {
        l.isUnmounted = true;
      }, p), f.NODE_ENV !== "production" && Ya(l);
    }, Ke = (l, p, b2, v2 = false, y = false, m = 0) => {
      for (let N = m; N < l.length; N++)
        ae2(l[N], p, b2, v2, y);
    }, wn = (l) => {
      if (l.shapeFlag & 6)
        return wn(l.component.subTree);
      if (l.shapeFlag & 128)
        return l.suspense.next();
      const p = g(l.anchor || l.el), b2 = p && p[iu];
      return b2 ? g(b2) : p;
    };
    let ho = false;
    const xr = (l, p, b2) => {
      let v2;
      l == null ? p._vnode && (ae2(p._vnode, null, null, true), v2 = p._vnode.component) : S(
        p._vnode || null,
        l,
        p,
        null,
        null,
        null,
        b2
      ), p._vnode = l, ho || (ho = true, Vr(v2), Gi(), ho = false);
    }, We = {
      p: S,
      um: ae2,
      m: Oe2,
      r: fo,
      mt: se2,
      mc: mt,
      pc: Ft,
      pbc: ie2,
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
  function Mn(t, e, n = false) {
    const o = t.children, r = e.children;
    if (C(o) && C(r))
      for (let i = 0; i < o.length; i++) {
        const s = o[i];
        let a2 = r[i];
        a2.shapeFlag & 1 && !a2.dynamicChildren && ((a2.patchFlag <= 0 || a2.patchFlag === 32) && (a2 = r[i] = ce(r[i]), a2.el = s.el), !n && a2.patchFlag !== -2 && Mn(s, a2)), a2.type === yn && (a2.patchFlag !== -1 ? a2.el = s.el : a2.__elIndex = i + // take fragment start anchor into account
        (t.type === pt ? 1 : 0)), a2.type === Ot && !a2.el && (a2.el = s.el), f.NODE_ENV !== "production" && a2.el && (a2.el.__vnode = a2);
      }
  }
  function ol(t) {
    const e = t.slice(), n = [0];
    let o, r, i, s, a2;
    const u = t.length;
    for (o = 0; o < u; o++) {
      const h = t[o];
      if (h !== 0) {
        if (r = n[n.length - 1], t[r] < h) {
          e[o] = r, n.push(o);
          continue;
        }
        for (i = 0, s = n.length - 1; i < s; )
          a2 = i + s >> 1, t[n[a2]] < h ? i = a2 + 1 : s = a2;
        h < t[n[i]] && (i > 0 && (e[o] = n[i - 1]), n[i] = o);
      }
    }
    for (i = n.length, s = n[i - 1]; i-- > 0; )
      n[i] = s, s = e[s];
    return n;
  }
  function Es(t) {
    const e = t.subTree.component;
    if (e)
      return e.asyncDep && !e.asyncResolved ? e : Es(e);
  }
  function Wr(t) {
    if (t)
      for (let e = 0; e < t.length; e++)
        t[e].flags |= 8;
  }
  function ks(t) {
    if (t.placeholder)
      return t.placeholder;
    const e = t.component;
    return e ? ks(e.subTree) : null;
  }
  const Ns = (t) => t.__isSuspense;
  function rl(t, e) {
    e && e.pendingBranch ? C(t) ? e.effects.push(...t) : e.effects.push(t) : qi(t);
  }
  const pt = /* @__PURE__ */ Symbol.for("v-fgt"), yn = /* @__PURE__ */ Symbol.for("v-txt"), Ot = /* @__PURE__ */ Symbol.for("v-cmt"), Tn = /* @__PURE__ */ Symbol.for("v-stc"), rn = [];
  let Nt = null;
  function W(t = false) {
    rn.push(Nt = t ? null : []);
  }
  function il() {
    rn.pop(), Nt = rn[rn.length - 1] || null;
  }
  let ln = 1;
  function Jn(t, e = false) {
    ln += t, t < 0 && Nt && e && (Nt.hasOnce = true);
  }
  function Os(t) {
    return t.dynamicChildren = ln > 0 ? Nt || Te : null, il(), ln > 0 && Nt && Nt.push(t), t;
  }
  function Z(t, e, n, o, r, i) {
    return Os(
      Q(
        t,
        e,
        n,
        o,
        r,
        i,
        true
      )
    );
  }
  function He(t, e, n, o, r) {
    return Os(
      rt(
        t,
        e,
        n,
        o,
        r,
        true
      )
    );
  }
  function Fe(t) {
    return t ? t.__v_isVNode === true : false;
  }
  function Ye(t, e) {
    if (f.NODE_ENV !== "production" && e.shapeFlag & 6 && t.component) {
      const n = zn.get(e.type);
      if (n && n.has(t.component))
        return t.shapeFlag &= -257, e.shapeFlag &= -513, false;
    }
    return t.type === e.type && t.key === e.key;
  }
  const sl = (...t) => Cs(
    ...t
  ), Ss = ({ key: t }) => t ?? null, jn = ({
    ref: t,
    ref_key: e,
    ref_for: n
  }) => (typeof t == "number" && (t = "" + t), t != null ? J(t) || et(t) || M(t) ? { i: dt, r: t, k: e, f: !!n } : t : null);
  function Q(t, e = null, n = null, o = 0, r = null, i = t === pt ? 0 : 1, s = false, a2 = false) {
    const u = {
      __v_isVNode: true,
      __v_skip: true,
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
    return a2 ? (gr(u, n), i & 128 && t.normalize(u)) : n && (u.shapeFlag |= J(n) ? 8 : 16), f.NODE_ENV !== "production" && u.key !== u.key && k("VNode created with invalid key (NaN). VNode type:", u.type), ln > 0 && // avoid a block node from tracking itself
    !s && // has current parent block
    Nt && // presence of a patch flag indicates this node needs patching on updates.
    // component nodes also should always be patched, because even if the
    // component doesn't need to update, it needs to persist the instance on to
    // the next vnode so that it can be properly unmounted later.
    (u.patchFlag > 0 || i & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
    // vnode should not be considered dynamic due to handler caching.
    u.patchFlag !== 32 && Nt.push(u), u;
  }
  const rt = f.NODE_ENV !== "production" ? sl : Cs;
  function Cs(t, e = null, n = null, o = 0, r = null, i = false) {
    if ((!t || t === as) && (f.NODE_ENV !== "production" && !t && k(`Invalid vnode type when creating vnode: ${t}.`), t = Ot), Fe(t)) {
      const a2 = fe(
        t,
        e,
        true
        /* mergeRef: true */
      );
      return n && gr(a2, n), ln > 0 && !i && Nt && (a2.shapeFlag & 6 ? Nt[Nt.indexOf(t)] = a2 : Nt.push(a2)), a2.patchFlag = -2, a2;
    }
    if (Ts(t) && (t = t.__vccOpts), e) {
      e = al(e);
      let { class: a2, style: u } = e;
      a2 && !J(a2) && (e.class = er(a2)), L(u) && (Rn(u) && !C(u) && (u = X({}, u)), e.style = tr(u));
    }
    const s = J(t) ? 1 : Ns(t) ? 128 : su(t) ? 64 : L(t) ? 4 : M(t) ? 2 : 0;
    return f.NODE_ENV !== "production" && s & 4 && Rn(t) && (t = $(t), k(
      "Vue received a Component that was made a reactive object. This can lead to unnecessary performance overhead and should be avoided by marking the component with `markRaw` or using `shallowRef` instead of `ref`.",
      `
Component that was made reactive: `,
      t
    )), Q(
      t,
      e,
      n,
      o,
      r,
      s,
      i,
      true
    );
  }
  function al(t) {
    return t ? Rn(t) || ms(t) ? X({}, t) : t : null;
  }
  function fe(t, e, n = false, o = false) {
    const { props: r, ref: i, patchFlag: s, children: a2, transition: u } = t, h = e ? ll(r || {}, e) : r, d = {
      __v_isVNode: true,
      __v_skip: true,
      type: t.type,
      props: h,
      key: h && Ss(h),
      ref: e && e.ref ? (
        // #2078 in the case of <component :is="vnode" ref="extra"/>
        // if the vnode itself already has a ref, cloneVNode will need to merge
        // the refs so the single vnode can be set on multiple refs
        n && i ? C(i) ? i.concat(jn(e)) : [i, jn(e)] : jn(e)
      ) : i,
      scopeId: t.scopeId,
      slotScopeIds: t.slotScopeIds,
      children: f.NODE_ENV !== "production" && s === -1 && C(a2) ? a2.map(Ds) : a2,
      target: t.target,
      targetStart: t.targetStart,
      targetAnchor: t.targetAnchor,
      staticCount: t.staticCount,
      shapeFlag: t.shapeFlag,
      // if the vnode is cloned with extra props, we can no longer assume its
      // existing patch flag to be reliable and need to add the FULL_PROPS flag.
      // note: preserve flag for fragments since they use the flag for children
      // fast paths only.
      patchFlag: e && t.type !== pt ? s === -1 ? 16 : s | 16 : s,
      dynamicProps: t.dynamicProps,
      dynamicChildren: t.dynamicChildren,
      appContext: t.appContext,
      dirs: t.dirs,
      transition: u,
      // These should technically only be non-null on mounted VNodes. However,
      // they *should* be copied for kept-alive vnodes. So we just always copy
      // them since them being non-null during a mount doesn't affect the logic as
      // they will simply be overwritten.
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
    return u && o && lr(
      d,
      u.clone(d)
    ), d;
  }
  function Ds(t) {
    const e = fe(t);
    return C(t.children) && (e.children = t.children.map(Ds)), e;
  }
  function ul(t = " ", e = 0) {
    return rt(yn, null, t, e);
  }
  function Ne(t = "", e = false) {
    return e ? (W(), He(Ot, null, t)) : rt(Ot, null, t);
  }
  function Mt(t) {
    return t == null || typeof t == "boolean" ? rt(Ot) : C(t) ? rt(
      pt,
      null,
      // #3666, avoid reference pollution when reusing vnode
      t.slice()
    ) : Fe(t) ? ce(t) : rt(yn, null, String(t));
  }
  function ce(t) {
    return t.el === null && t.patchFlag !== -1 || t.memo ? t : fe(t);
  }
  function gr(t, e) {
    let n = 0;
    const { shapeFlag: o } = t;
    if (e == null)
      e = null;
    else if (C(e))
      n = 16;
    else if (typeof e == "object")
      if (o & 65) {
        const r = e.default;
        r && (r._c && (r._d = false), gr(t, r()), r._c && (r._d = true));
        return;
      } else {
        n = 32;
        const r = e._;
        !r && !ms(e) ? e._ctx = dt : r === 3 && dt && (dt.slots._ === 1 ? e._ = 1 : (e._ = 2, t.patchFlag |= 1024));
      }
    else M(e) ? (e = { default: e, _ctx: dt }, n = 32) : (e = String(e), o & 64 ? (n = 16, e = [ul(e)]) : n = 8);
    t.children = e, t.shapeFlag |= n;
  }
  function ll(...t) {
    const e = {};
    for (let n = 0; n < t.length; n++) {
      const o = t[n];
      for (const r in o)
        if (r === "class")
          e.class !== o.class && (e.class = er([e.class, o.class]));
        else if (r === "style")
          e.style = tr([e.style, o.style]);
        else if (dn(r)) {
          const i = e[r], s = o[r];
          s && i !== s && !(C(i) && i.includes(s)) && (e[r] = i ? [].concat(i, s) : s);
        } else r !== "" && (e[r] = o[r]);
    }
    return e;
  }
  function Bt(t, e, n, o = null) {
    Yt(t, e, 7, [
      n,
      o
    ]);
  }
  const cl = ds();
  let pl = 0;
  function dl(t, e, n) {
    const o = t.type, r = (e ? e.appContext : t.appContext) || cl, i = {
      uid: pl++,
      vnode: t,
      type: o,
      parent: e,
      appContext: r,
      root: null,
      // to be immediately set
      next: null,
      subTree: null,
      // will be set synchronously right after creation
      effect: null,
      update: null,
      // will be set synchronously right after creation
      job: null,
      scope: new sa(
        true
        /* detached */
      ),
      render: null,
      proxy: null,
      exposed: null,
      exposeProxy: null,
      withProxy: null,
      provides: e ? e.provides : Object.create(r.provides),
      ids: e ? e.ids : ["", 0, 0],
      accessCache: null,
      renderCache: [],
      // local resolved assets
      components: null,
      directives: null,
      // resolved props and emits options
      propsOptions: _s(o, r),
      emitsOptions: fs(o, r),
      // emit
      emit: null,
      // to be set immediately
      emitted: null,
      // props default value
      propsDefaults: B,
      // inheritAttrs
      inheritAttrs: o.inheritAttrs,
      // state
      ctx: B,
      data: B,
      props: B,
      attrs: B,
      slots: B,
      refs: B,
      setupState: B,
      setupContext: null,
      // suspense related
      suspense: n,
      suspenseId: n ? n.pendingId : 0,
      asyncDep: null,
      asyncResolved: false,
      // lifecycle hooks
      // not using enums here because it results in computed properties
      isMounted: false,
      isUnmounted: false,
      isDeactivated: false,
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
  let tt = null;
  const zs = () => tt || dt;
  let Yn, Po;
  {
    const t = hn(), e = (n, o) => {
      let r;
      return (r = t[n]) || (r = t[n] = []), r.push(o), (i) => {
        r.length > 1 ? r.forEach((s) => s(i)) : r[0](i);
      };
    };
    Yn = e(
      "__VUE_INSTANCE_SETTERS__",
      (n) => tt = n
    ), Po = e(
      "__VUE_SSR_SETTERS__",
      (n) => cn = n
    );
  }
  const _n = (t) => {
    const e = tt;
    return Yn(t), t.scope.on(), () => {
      t.scope.off(), Yn(e);
    };
  }, qr = () => {
    tt && tt.scope.off(), Yn(null);
  }, fl = /* @__PURE__ */ oe("slot,component");
  function Ro(t, { isNativeTag: e }) {
    (fl(t) || e(t)) && k(
      "Do not use built-in or reserved HTML elements as component id: " + t
    );
  }
  function Vs(t) {
    return t.vnode.shapeFlag & 4;
  }
  let cn = false;
  function hl(t, e = false, n = false) {
    e && Po(e);
    const { props: o, children: r } = t.vnode, i = Vs(t);
    Fu(t, o, i, e), Xu(t, r, n || e);
    const s = i ? bl(t, e) : void 0;
    return e && Po(false), s;
  }
  function bl(t, e) {
    const n = t.type;
    if (f.NODE_ENV !== "production") {
      if (n.name && Ro(n.name, t.appContext.config), n.components) {
        const r = Object.keys(n.components);
        for (let i = 0; i < r.length; i++)
          Ro(r[i], t.appContext.config);
      }
      if (n.directives) {
        const r = Object.keys(n.directives);
        for (let i = 0; i < r.length; i++)
          es(r[i]);
      }
      n.compilerOptions && gl() && k(
        '"compilerOptions" is only supported when using a build of Vue that includes the runtime compiler. Since you are using a runtime-only build, the options should be passed via your build tool config instead.'
      );
    }
    t.accessCache = /* @__PURE__ */ Object.create(null), t.proxy = new Proxy(t.ctx, ls), f.NODE_ENV !== "production" && Eu(t);
    const { setup: o } = n;
    if (o) {
      At();
      const r = t.setupContext = o.length > 1 ? yl(t) : null, i = _n(t), s = Ue(
        o,
        t,
        0,
        [
          f.NODE_ENV !== "production" ? Gt(t.props) : t.props,
          r
        ]
      ), a2 = Yo(s);
      if (It(), i(), (a2 || t.sp) && !on(t) && rs(t), a2) {
        if (s.then(qr, qr), e)
          return s.then((u) => {
            Gr(t, u, e);
          }).catch((u) => {
            gn(u, t, 0);
          });
        if (t.asyncDep = s, f.NODE_ENV !== "production" && !t.suspense) {
          const u = vn(t, n);
          k(
            `Component <${u}>: setup function returned a promise, but no <Suspense> boundary was found in the parent component tree. A component with async setup() must be nested in a <Suspense> in order to be rendered.`
          );
        }
      } else
        Gr(t, s, e);
    } else
      Ms(t, e);
  }
  function Gr(t, e, n) {
    M(e) ? t.type.__ssrInlineRender ? t.ssrRender = e : t.render = e : L(e) ? (f.NODE_ENV !== "production" && Fe(e) && k(
      "setup() should not return VNodes directly - return a render function instead."
    ), f.NODE_ENV !== "production" && (t.devtoolsRawSetupState = e), t.setupState = Ui(e), f.NODE_ENV !== "production" && ku(t)) : f.NODE_ENV !== "production" && e !== void 0 && k(
      `setup() should return an object. Received: ${e === null ? "null" : typeof e}`
    ), Ms(t, n);
  }
  const gl = () => true;
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
    f.NODE_ENV !== "production" && !o.render && t.render === ot && !e && (o.template ? k(
      'Component provided template option but runtime compilation is not supported in this build of Vue. Configure your bundler to alias "vue" to "vue/dist/vue.esm-bundler.js".'
    ) : k("Component is missing template or render function: ", o));
  }
  const Jr = f.NODE_ENV !== "production" ? {
    get(t, e) {
      return qn(), nt(t, "get", ""), t[e];
    },
    set() {
      return k("setupContext.attrs is readonly."), false;
    },
    deleteProperty() {
      return k("setupContext.attrs is readonly."), false;
    }
  } : {
    get(t, e) {
      return nt(t, "get", ""), t[e];
    }
  };
  function ml(t) {
    return new Proxy(t.slots, {
      get(e, n) {
        return nt(t, "get", "$slots"), e[n];
      }
    });
  }
  function yl(t) {
    const e = (n) => {
      if (f.NODE_ENV !== "production" && (t.exposed && k("expose() should be called only once per setup()."), n != null)) {
        let o = typeof n;
        o === "object" && (C(n) ? o = "array" : et(n) && (o = "ref")), o !== "object" && k(
          `expose() should be passed a plain object, received ${o}.`
        );
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
    } else
      return {
        attrs: new Proxy(t.attrs, Jr),
        slots: t.slots,
        emit: t.emit,
        expose: e
      };
  }
  function uo(t) {
    return t.exposed ? t.exposeProxy || (t.exposeProxy = new Proxy(Ui(Sa(t.exposed)), {
      get(e, n) {
        if (n in e)
          return e[n];
        if (n in we)
          return we[n](t);
      },
      has(e, n) {
        return n in e || n in we;
      }
    })) : t.proxy;
  }
  const _l = /(?:^|[-_])\w/g, vl = (t) => t.replace(_l, (e) => e.toUpperCase()).replace(/[-_]/g, "");
  function mr(t, e = true) {
    return M(t) ? t.displayName || t.name : t.name || e && t.__name;
  }
  function vn(t, e, n = false) {
    let o = mr(e);
    if (!o && e.__file) {
      const r = e.__file.match(/([^/\\]+)\.\w+$/);
      r && (o = r[1]);
    }
    if (!o && t) {
      const r = (i) => {
        for (const s in i)
          if (i[s] === e)
            return s;
      };
      o = r(t.components) || t.parent && r(
        t.parent.type.components
      ) || r(t.appContext.components);
    }
    return o ? vl(o) : n ? "App" : "Anonymous";
  }
  function Ts(t) {
    return M(t) && "__vccOpts" in t;
  }
  const St = (t, e) => {
    const n = Ma(t, e, cn);
    if (f.NODE_ENV !== "production") {
      const o = zs();
      o && o.appContext.config.warnRecursiveComputed && (n._warnRecursive = true);
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
    if (f.NODE_ENV === "production" || typeof window > "u")
      return;
    const t = { style: "color:#3ba776" }, e = { style: "color:#1677ff" }, n = { style: "color:#f5222d" }, o = { style: "color:#eb2f96" }, r = {
      __vue_custom_formatter: true,
      header(c) {
        if (!L(c))
          return null;
        if (c.__isVue)
          return ["div", t, "VueInstance"];
        if (et(c)) {
          At();
          const g = c.value;
          return It(), [
            "div",
            {},
            ["span", t, d(c)],
            "<",
            a2(g),
            ">"
          ];
        } else {
          if (de(c))
            return [
              "div",
              {},
              ["span", t, gt(c) ? "ShallowReactive" : "Reactive"],
              "<",
              a2(c),
              `>${Pt(c) ? " (readonly)" : ""}`
            ];
          if (Pt(c))
            return [
              "div",
              {},
              ["span", t, gt(c) ? "ShallowReadonly" : "Readonly"],
              "<",
              a2(c),
              ">"
            ];
        }
        return null;
      },
      hasBody(c) {
        return c && c.__isVue;
      },
      body(c) {
        if (c && c.__isVue)
          return [
            "div",
            {},
            ...i(c.$)
          ];
      }
    };
    function i(c) {
      const g = [];
      c.type.props && c.props && g.push(s("props", $(c.props))), c.setupState !== B && g.push(s("setup", c.setupState)), c.data !== B && g.push(s("data", $(c.data)));
      const x2 = u(c, "computed");
      x2 && g.push(s("computed", x2));
      const T2 = u(c, "inject");
      return T2 && g.push(s("injected", T2)), g.push([
        "div",
        {},
        [
          "span",
          {
            style: o.style + ";opacity:0.66"
          },
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
          {
            style: "color:#476582"
          },
          c
        ],
        [
          "div",
          {
            style: "padding-left:1.25em"
          },
          ...Object.keys(g).map((x2) => [
            "div",
            {},
            ["span", o, x2 + ": "],
            a2(g[x2], false)
          ])
        ]
      ] : ["span", {}];
    }
    function a2(c, g = true) {
      return typeof c == "number" ? ["span", e, c] : typeof c == "string" ? ["span", n, JSON.stringify(c)] : typeof c == "boolean" ? ["span", o, c] : L(c) ? ["object", { object: g ? $(c) : c }] : ["span", n, String(c)];
    }
    function u(c, g) {
      const x2 = c.type;
      if (M(x2))
        return;
      const T2 = {};
      for (const S in c.ctx)
        h(x2, S, g) && (T2[S] = c.ctx[S]);
      return T2;
    }
    function h(c, g, x2) {
      const T2 = c[x2];
      if (C(T2) && T2.includes(g) || L(T2) && g in T2 || c.extends && h(c.extends, g, x2) || c.mixins && c.mixins.some((S) => h(S, g, x2)))
        return true;
    }
    function d(c) {
      return gt(c) ? "ShallowRef" : c.effect ? "ComputedRef" : "Ref";
    }
    window.devtoolsFormatters ? window.devtoolsFormatters.push(r) : window.devtoolsFormatters = [r];
  }
  const Yr = "3.5.26", zt = f.NODE_ENV !== "production" ? k : ot;
  var ct = {};
  let Fo;
  const Xr = typeof window < "u" && window.trustedTypes;
  if (Xr)
    try {
      Fo = /* @__PURE__ */ Xr.createPolicy("vue", {
        createHTML: (t) => t
      });
    } catch (t) {
      ct.NODE_ENV !== "production" && zt(`Error creating trusted types policy: ${t}`);
    }
  const js = Fo ? (t) => Fo.createHTML(t) : (t) => t, El = "http://www.w3.org/2000/svg", kl = "http://www.w3.org/1998/Math/MathML", Qt = typeof document < "u" ? document : null, Zr = Qt && /* @__PURE__ */ Qt.createElement("template"), Nl = {
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
    // __UNSAFE__
    // Reason: innerHTML.
    // Static content here can only come from compiled templates.
    // As long as the user only uses trusted templates, this is safe.
    insertStaticContent(t, e, n, o, r, i) {
      const s = n ? n.previousSibling : e.lastChild;
      if (r && (r === i || r.nextSibling))
        for (; e.insertBefore(r.cloneNode(true), n), !(r === i || !(r = r.nextSibling)); )
          ;
      else {
        Zr.innerHTML = js(
          o === "svg" ? `<svg>${t}</svg>` : o === "mathml" ? `<math>${t}</math>` : t
        );
        const a2 = Zr.content;
        if (o === "svg" || o === "mathml") {
          const u = a2.firstChild;
          for (; u.firstChild; )
            a2.appendChild(u.firstChild);
          a2.removeChild(u);
        }
        e.insertBefore(a2, n);
      }
      return [
        // first
        s ? s.nextSibling : e.firstChild,
        // last
        n ? n.previousSibling : e.lastChild
      ];
    }
  }, Ol = /* @__PURE__ */ Symbol("_vtc");
  function Sl(t, e, n) {
    const o = t[Ol];
    o && (e = (e ? [e, ...o] : [...o]).join(" ")), e == null ? t.removeAttribute("class") : n ? t.setAttribute("class", e) : t.className = e;
  }
  const Qr = /* @__PURE__ */ Symbol("_vod"), Cl = /* @__PURE__ */ Symbol("_vsh"), Dl = /* @__PURE__ */ Symbol(ct.NODE_ENV !== "production" ? "CSS_VAR_TEXT" : ""), zl = /(?:^|;)\s*display\s*:/;
  function Vl(t, e, n) {
    const o = t.style, r = J(n);
    let i = false;
    if (n && !r) {
      if (e)
        if (J(e))
          for (const s of e.split(";")) {
            const a2 = s.slice(0, s.indexOf(":")).trim();
            n[a2] == null && $n(o, a2, "");
          }
        else
          for (const s in e)
            n[s] == null && $n(o, s, "");
      for (const s in n)
        s === "display" && (i = true), $n(o, s, n[s]);
    } else if (r) {
      if (e !== n) {
        const s = o[Dl];
        s && (n += ";" + s), o.cssText = n, i = zl.test(n);
      }
    } else e && t.removeAttribute("style");
    Qr in t && (t[Qr] = i ? o.display : "", t[Cl] && (o.display = "none"));
  }
  const Ml = /[^\\];\s*$/, ti = /\s*!important$/;
  function $n(t, e, n) {
    if (C(n))
      n.forEach((o) => $n(t, e, o));
    else if (n == null && (n = ""), ct.NODE_ENV !== "production" && Ml.test(n) && zt(
      `Unexpected semicolon at the end of '${e}' style value: '${n}'`
    ), e.startsWith("--"))
      t.setProperty(e, n);
    else {
      const o = Tl(t, e);
      ti.test(n) ? t.setProperty(
        kt(o),
        n.replace(ti, ""),
        "important"
      ) : t[o] = n;
    }
  }
  const ei = ["Webkit", "Moz", "ms"], Eo = {};
  function Tl(t, e) {
    const n = Eo[e];
    if (n)
      return n;
    let o = at(e);
    if (o !== "filter" && o in t)
      return Eo[e] = o;
    o = Ee(o);
    for (let r = 0; r < ei.length; r++) {
      const i = ei[r] + o;
      if (i in t)
        return Eo[e] = i;
    }
    return e;
  }
  const ni = "http://www.w3.org/1999/xlink";
  function oi(t, e, n, o, r, i = ra(e)) {
    o && e.startsWith("xlink:") ? n == null ? t.removeAttributeNS(ni, e.slice(6, e.length)) : t.setAttributeNS(ni, e, n) : n == null || i && !wi(n) ? t.removeAttribute(e) : t.setAttribute(
      e,
      i ? "" : Jt(n) ? String(n) : n
    );
  }
  function ri(t, e, n, o, r) {
    if (e === "innerHTML" || e === "textContent") {
      n != null && (t[e] = e === "innerHTML" ? js(n) : n);
      return;
    }
    const i = t.tagName;
    if (e === "value" && i !== "PROGRESS" && // custom elements may use _value internally
    !i.includes("-")) {
      const a2 = i === "OPTION" ? t.getAttribute("value") || "" : t.value, u = n == null ? (
        // #11647: value should be set as empty string for null and undefined,
        // but <input type="checkbox"> should be set as 'on'.
        t.type === "checkbox" ? "on" : ""
      ) : String(n);
      (a2 !== u || !("_value" in t)) && (t.value = u), n == null && t.removeAttribute(e), t._value = n;
      return;
    }
    let s = false;
    if (n === "" || n == null) {
      const a2 = typeof t[e];
      a2 === "boolean" ? n = wi(n) : n == null && a2 === "string" ? (n = "", s = true) : a2 === "number" && (n = 0, s = true);
    }
    try {
      t[e] = n;
    } catch (a2) {
      ct.NODE_ENV !== "production" && !s && zt(
        `Failed setting prop "${e}" on <${i.toLowerCase()}>: value ${n} is invalid.`,
        a2
      );
    }
    s && t.removeAttribute(r || e);
  }
  function ye(t, e, n, o) {
    t.addEventListener(e, n, o);
  }
  function jl(t, e, n, o) {
    t.removeEventListener(e, n, o);
  }
  const ii = /* @__PURE__ */ Symbol("_vei");
  function $l(t, e, n, o, r = null) {
    const i = t[ii] || (t[ii] = {}), s = i[e];
    if (o && s)
      s.value = ct.NODE_ENV !== "production" ? ai(o, e) : o;
    else {
      const [a2, u] = Al(e);
      if (o) {
        const h = i[e] = Rl(
          ct.NODE_ENV !== "production" ? ai(o, e) : o,
          r
        );
        ye(t, a2, h, u);
      } else s && (jl(t, a2, s, u), i[e] = void 0);
    }
  }
  const si = /(?:Once|Passive|Capture)$/;
  function Al(t) {
    let e;
    if (si.test(t)) {
      e = {};
      let o;
      for (; o = t.match(si); )
        t = t.slice(0, t.length - o[0].length), e[o[0].toLowerCase()] = true;
    }
    return [t[2] === ":" ? t.slice(3) : kt(t.slice(2)), e];
  }
  let ko = 0;
  const Il = /* @__PURE__ */ Promise.resolve(), Pl = () => ko || (Il.then(() => ko = 0), ko = Date.now());
  function Rl(t, e) {
    const n = (o) => {
      if (!o._vts)
        o._vts = Date.now();
      else if (o._vts <= n.attached)
        return;
      Yt(
        Fl(o, n.value),
        e,
        5,
        [o]
      );
    };
    return n.value = t, n.attached = Pl(), n;
  }
  function ai(t, e) {
    return M(t) || C(t) ? t : (zt(
      `Wrong type passed as event handler to ${e} - did you forget @ or : in front of your prop?
Expected function or array of functions, received type ${typeof t}.`
    ), ot);
  }
  function Fl(t, e) {
    if (C(e)) {
      const n = t.stopImmediatePropagation;
      return t.stopImmediatePropagation = () => {
        n.call(t), t._stopped = true;
      }, e.map(
        (o) => (r) => !r._stopped && o && o(r)
      );
    } else
      return e;
  }
  const ui = (t) => t.charCodeAt(0) === 111 && t.charCodeAt(1) === 110 && // lowercase letter
  t.charCodeAt(2) > 96 && t.charCodeAt(2) < 123, Ll = (t, e, n, o, r, i) => {
    const s = r === "svg";
    e === "class" ? Sl(t, o, s) : e === "style" ? Vl(t, n, o) : dn(e) ? In(e) || $l(t, e, n, o, i) : (e[0] === "." ? (e = e.slice(1), true) : e[0] === "^" ? (e = e.slice(1), false) : Ul(t, e, o, s)) ? (ri(t, e, o), !t.tagName.includes("-") && (e === "value" || e === "checked" || e === "selected") && oi(t, e, o, s, i, e !== "value")) : (
      /* #11081 force set props for possible async custom element */
      t._isVueCE && (/[A-Z]/.test(e) || !J(o)) ? ri(t, at(e), o, i, e) : (e === "true-value" ? t._trueValue = o : e === "false-value" && (t._falseValue = o), oi(t, e, o, s))
    );
  };
  function Ul(t, e, n, o) {
    if (o)
      return !!(e === "innerHTML" || e === "textContent" || e in t && ui(e) && M(n));
    if (e === "spellcheck" || e === "draggable" || e === "translate" || e === "autocorrect" || e === "sandbox" && t.tagName === "IFRAME" || e === "form" || e === "list" && t.tagName === "INPUT" || e === "type" && t.tagName === "TEXTAREA")
      return false;
    if (e === "width" || e === "height") {
      const r = t.tagName;
      if (r === "IMG" || r === "VIDEO" || r === "CANVAS" || r === "SOURCE")
        return false;
    }
    return ui(e) && J(n) ? false : e in t;
  }
  const li = {};
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
  const Bl = typeof HTMLElement < "u" ? HTMLElement : class {
  };
  class yr extends Bl {
    constructor(e, n = {}, o = Lo) {
      super(), this._def = e, this._props = n, this._createApp = o, this._isVueCE = true, this._instance = null, this._app = null, this._nonce = this._def.nonce, this._connected = false, this._resolved = false, this._patching = false, this._dirty = false, this._numberProps = null, this._styleChildren = /* @__PURE__ */ new WeakSet(), this._ob = null, this.shadowRoot && o !== Lo ? this._root = this.shadowRoot : (ct.NODE_ENV !== "production" && this.shadowRoot && zt(
        "Custom element has pre-rendered declarative shadow root but is not defined as hydratable. Use `defineSSRCustomElement`."
      ), e.shadowRoot !== false ? (this.attachShadow(
        X({}, e.shadowRootOptions, {
          mode: "open"
        })
      ), this._root = this.shadowRoot) : this._root = this);
    }
    connectedCallback() {
      if (!this.isConnected) return;
      !this.shadowRoot && !this._resolved && this._parseSlots(), this._connected = true;
      let e = this;
      for (; e = e && (e.parentNode || e.host); )
        if (e instanceof yr) {
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
      e && this._app && Object.setPrototypeOf(
        this._app._context.provides,
        e._instance.provides
      );
    }
    disconnectedCallback() {
      this._connected = false, Ki(() => {
        this._connected || (this._ob && (this._ob.disconnect(), this._ob = null), this._app && this._app.unmount(), this._instance && (this._instance.ce = void 0), this._app = this._instance = null, this._teleportTargets && (this._teleportTargets.clear(), this._teleportTargets = void 0));
      });
    }
    _processMutations(e) {
      for (const n of e)
        this._setAttr(n.attributeName);
    }
    /**
     * resolve inner component definition (handle possible async component)
     */
    _resolveDef() {
      if (this._pendingResolve)
        return;
      for (let o = 0; o < this.attributes.length; o++)
        this._setAttr(this.attributes[o].name);
      this._ob = new MutationObserver(this._processMutations.bind(this)), this._ob.observe(this, { attributes: true });
      const e = (o, r = false) => {
        this._resolved = true, this._pendingResolve = void 0;
        const { props: i, styles: s } = o;
        let a2;
        if (i && !C(i))
          for (const u in i) {
            const h = i[u];
            (h === Number || h && h.type === Number) && (u in this._props && (this._props[u] = Or(this._props[u])), (a2 || (a2 = /* @__PURE__ */ Object.create(null)))[at(u)] = true);
          }
        this._numberProps = a2, this._resolveProps(o), this.shadowRoot ? this._applyStyles(s) : ct.NODE_ENV !== "production" && s && zt(
          "Custom element style injection is not supported when using shadowRoot: false"
        ), this._mount(o);
      }, n = this._def.__asyncLoader;
      n ? this._pendingResolve = n().then((o) => {
        o.configureApp = this._def.configureApp, e(this._def = o, true);
      }) : e(this._def);
    }
    _mount(e) {
      ct.NODE_ENV !== "production" && !e.name && (e.name = "VueElement"), this._app = this._createApp(e), this._inheritParentContext(), e.configureApp && e.configureApp(this._app), this._app._ceVNode = this._createVNode(), this._app.mount(this._root);
      const n = this._instance && this._instance.exposed;
      if (n)
        for (const o in n)
          I(this, o) ? ct.NODE_ENV !== "production" && zt(`Exposed property "${o}" already exists on custom element.`) : Object.defineProperty(this, o, {
            // unwrap ref to be consistent with public instance behavior
            get: () => Fn(n[o])
          });
    }
    _resolveProps(e) {
      const { props: n } = e, o = C(n) ? n : Object.keys(n || {});
      for (const r of Object.keys(this))
        r[0] !== "_" && o.includes(r) && this._setProp(r, this[r]);
      for (const r of o.map(at))
        Object.defineProperty(this, r, {
          get() {
            return this._getProp(r);
          },
          set(i) {
            this._setProp(r, i, true, !this._patching);
          }
        });
    }
    _setAttr(e) {
      if (e.startsWith("data-v-")) return;
      const n = this.hasAttribute(e);
      let o = n ? this.getAttribute(e) : li;
      const r = at(e);
      n && this._numberProps && this._numberProps[r] && (o = Or(o)), this._setProp(r, o, false, true);
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
    _setProp(e, n, o = true, r = false) {
      if (n !== this._props[e] && (this._dirty = true, n === li ? delete this._props[e] : (this._props[e] = n, e === "key" && this._app && (this._app._ceVNode.key = n)), r && this._instance && this._update(), o)) {
        const i = this._ob;
        i && (this._processMutations(i.takeRecords()), i.disconnect()), n === true ? this.setAttribute(kt(e), "") : typeof n == "string" || typeof n == "number" ? this.setAttribute(kt(e), n + "") : n || this.removeAttribute(kt(e)), i && i.observe(this, { attributes: true });
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
        this._instance = o, o.ce = this, o.isCE = true, ct.NODE_ENV !== "production" && (o.ceReload = (i) => {
          this._styles && (this._styles.forEach((s) => this._root.removeChild(s)), this._styles.length = 0), this._applyStyles(i), this._instance = null, this._update();
        });
        const r = (i, s) => {
          this.dispatchEvent(
            new CustomEvent(
              i,
              Qn(s[0]) ? X({ detail: s }, s[0]) : { detail: s }
            )
          );
        };
        o.emit = (i, ...s) => {
          r(i, s), kt(i) !== i && r(kt(i), s);
        }, this._setParent();
      }), n;
    }
    _applyStyles(e, n) {
      if (!e) return;
      if (n) {
        if (n === this._def || this._styleChildren.has(n))
          return;
        this._styleChildren.add(n);
      }
      const o = this._nonce;
      for (let r = e.length - 1; r >= 0; r--) {
        const i = document.createElement("style");
        if (o && i.setAttribute("nonce", o), i.textContent = e[r], this.shadowRoot.prepend(i), ct.NODE_ENV !== "production")
          if (n) {
            if (n.__hmrId) {
              this._childStyles || (this._childStyles = /* @__PURE__ */ new Map());
              let s = this._childStyles.get(n.__hmrId);
              s || this._childStyles.set(n.__hmrId, s = []), s.push(i);
            }
          } else
            (this._styles || (this._styles = [])).push(i);
      }
    }
    /**
     * Only called when shadowRoot is false
     */
    _parseSlots() {
      const e = this._slots = {};
      let n;
      for (; n = this.firstChild; ) {
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
        const r = e[o], i = r.getAttribute("name") || "default", s = this._slots[i], a2 = r.parentNode;
        if (s)
          for (const u of s) {
            if (n && u.nodeType === 1) {
              const h = n + "-s", d = document.createTreeWalker(u, 1);
              u.setAttribute(h, "");
              let c;
              for (; c = d.nextNode(); )
                c.setAttribute(h, "");
            }
            a2.insertBefore(u, r);
          }
        else
          for (; r.firstChild; ) a2.insertBefore(r.firstChild, r);
        a2.removeChild(r);
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
        for (let i = 0; i < r.length; i++)
          n.add(r[i]);
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
      this._patching = true, this._dirty = false;
    }
    /**
     * @internal
     */
    _endPatch() {
      this._patching = false, this._dirty && this._instance && this._update();
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
  }
  const Xn = (t) => {
    const e = t.props["onUpdate:modelValue"] || false;
    return C(e) ? (n) => Ve(e, n) : e;
  };
  function Kl(t) {
    t.target.composing = true;
  }
  function ci(t) {
    const e = t.target;
    e.composing && (e.composing = false, e.dispatchEvent(new Event("input")));
  }
  const Ie = /* @__PURE__ */ Symbol("_assign");
  function pi(t, e, n) {
    return e && (t = t.trim()), n && (t = Qo(t)), t;
  }
  const pn = {
    created(t, { modifiers: { lazy: e, trim: n, number: o } }, r) {
      t[Ie] = Xn(r);
      const i = o || r.props && r.props.type === "number";
      ye(t, e ? "change" : "input", (s) => {
        s.target.composing || t[Ie](pi(t.value, n, i));
      }), (n || i) && ye(t, "change", () => {
        t.value = pi(t.value, n, i);
      }), e || (ye(t, "compositionstart", Kl), ye(t, "compositionend", ci), ye(t, "change", ci));
    },
    // set value on mounted so it's after min/max for type="range"
    mounted(t, { value: e }) {
      t.value = e ?? "";
    },
    beforeUpdate(t, { value: e, oldValue: n, modifiers: { lazy: o, trim: r, number: i } }, s) {
      if (t[Ie] = Xn(s), t.composing) return;
      const a2 = (i || t.type === "number") && !/^0\d/.test(t.value) ? Qo(t.value) : t.value, u = e ?? "";
      a2 !== u && (document.activeElement === t && t.type !== "range" && (o && e === n || r && t.value.trim() === u) || (t.value = u));
    }
  }, Wl = {
    // #4096 array checkboxes need to be deep traversed
    deep: true,
    created(t, e, n) {
      t[Ie] = Xn(n), ye(t, "change", () => {
        const o = t._modelValue, r = ql(t), i = t.checked, s = t[Ie];
        if (C(o)) {
          const a2 = Ei(o, r), u = a2 !== -1;
          if (i && !u)
            s(o.concat(r));
          else if (!i && u) {
            const h = [...o];
            h.splice(a2, 1), s(h);
          }
        } else if (Zn(o)) {
          const a2 = new Set(o);
          i ? a2.add(r) : a2.delete(r), s(a2);
        } else
          s($s(t, i));
      });
    },
    // set initial checked on mount to wait for true-value/false-value
    mounted: di,
    beforeUpdate(t, e, n) {
      t[Ie] = Xn(n), di(t, e, n);
    }
  };
  function di(t, { value: e, oldValue: n }, o) {
    t._modelValue = e;
    let r;
    if (C(e))
      r = Ei(e, o.props.value) > -1;
    else if (Zn(e))
      r = e.has(o.props.value);
    else {
      if (e === n) return;
      r = eo(e, $s(t, true));
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
  const Gl = /* @__PURE__ */ X({ patchProp: Ll }, Nl);
  let fi;
  function As() {
    return fi || (fi = tl(Gl));
  }
  const Jl = ((...t) => {
    As().render(...t);
  }), Lo = ((...t) => {
    const e = As().createApp(...t);
    ct.NODE_ENV !== "production" && (Xl(e), Zl(e));
    const { mount: n } = e;
    return e.mount = (o) => {
      const r = Ql(o);
      if (!r) return;
      const i = e._component;
      !M(i) && !i.render && !i.template && (i.template = r.innerHTML), r.nodeType === 1 && (r.textContent = "");
      const s = n(r, false, Yl(r));
      return r instanceof Element && (r.removeAttribute("v-cloak"), r.setAttribute("data-v-app", "")), s;
    }, e;
  });
  function Yl(t) {
    if (t instanceof SVGElement)
      return "svg";
    if (typeof MathMLElement == "function" && t instanceof MathMLElement)
      return "mathml";
  }
  function Xl(t) {
    Object.defineProperty(t.config, "isNativeTag", {
      value: (e) => ta(e) || ea(e) || na(e),
      writable: false
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
          zt(
            "The `isCustomElement` config option is deprecated. Use `compilerOptions.isCustomElement` instead."
          );
        }
      });
      const n = t.config.compilerOptions, o = 'The `compilerOptions` config option is only respected when using a build of Vue.js that includes the runtime compiler (aka "full build"). Since you are using the runtime-only build, `compilerOptions` must be passed to `@vue/compiler-dom` in the build setup instead.\n- For vue-loader: pass it via vue-loader\'s `compilerOptions` loader option.\n- For vue-cli: see https://cli.vuejs.org/guide/webpack.html#modifying-options-of-a-loader\n- For vite: pass it via @vitejs/plugin-vue options. See https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue#example-for-passing-options-to-vuecompiler-sfc';
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
      return ct.NODE_ENV !== "production" && !e && zt(
        `Failed to mount app: mount target selector "${t}" returned null.`
      ), e;
    }
    return ct.NODE_ENV !== "production" && window.ShadowRoot && t instanceof window.ShadowRoot && t.mode === "closed" && zt(
      'mounting on a ShadowRoot with `{mode: "closed"}` may lead to unpredictable bugs'
    ), t;
  }
  var tc = {};
  function ec() {
    wl();
  }
  tc.NODE_ENV !== "production" && ec();
  const nc = {
    key: 0,
    class: "uno-7liy0l"
  }, oc = /* @__PURE__ */ Ct({
    __name: "badge",
    props: {
      state: { type: null },
      group: { type: Object }
    },
    setup(t) {
      var _a3, _b2;
      const e = t, n = St(() => e.group.content[0]);
      function o(s) {
        return St(() => new Function("state", `${s}`)(e.state));
      }
      const r = o(((_a3 = n.value) == null ? void 0 : _a3.vif) || ""), i = o(((_b2 = n.value) == null ? void 0 : _b2.text) || "");
      return (s, a2) => Fn(r) ? (W(), Z("span", nc, Le(Fn(i)), 1)) : Ne("", true);
    }
  }), rc = '*,:before,:after{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }::backdrop{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:var(--un-default-border-color, #e5e7eb)}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,[type=button],[type=reset],[type=submit]{-webkit-appearance:button;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}.uno-7liy0l{border-width:2px!important;--un-border-opacity:1 !important;border-color:rgb(63 63 70 / var(--un-border-opacity))!important;--un-bg-opacity:1 !important;background-color:rgb(0 0 0 / var(--un-bg-opacity))!important;padding:4px!important;font-size:12px!important;line-height:16px!important;--un-text-opacity:1 !important;color:rgb(255 255 255 / var(--un-text-opacity))!important;font-weight:600!important;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace!important}[data-theme=dark] .uno-7liy0l{--un-border-opacity:1 !important;border-color:rgb(63 63 70 / var(--un-border-opacity))!important;--un-bg-opacity:1 !important;background-color:rgb(55 65 81 / var(--un-bg-opacity))!important;--un-text-opacity:1 !important;color:rgb(203 213 225 / var(--un-text-opacity))!important}.fixed{position:fixed!important}.bottom-0{bottom:0!important}.left-0{left:0!important}.right-0{right:0!important}.top-0{top:0!important}', ut = (t, e) => {
    const n = t.__vccOpts || t;
    for (const [o, r] of e)
      n[o] = r;
    return n;
  }, ic = /* @__PURE__ */ ut(oc, [["styles", [rc]]]), sc = {}, ac = {
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24"
  };
  function uc(t, e) {
    return W(), Z("svg", ac, [...e[0] || (e[0] = [
      Q("path", {
        fill: "none",
        stroke: "currentColor",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        "stroke-width": "2",
        d: "M5 12h14"
      }, null, -1)
    ])]);
  }
  const lc = /* @__PURE__ */ ut(sc, [["render", uc]]), cc = {}, pc = {
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24"
  };
  function dc(t, e) {
    return W(), Z("svg", pc, [...e[0] || (e[0] = [
      Q("g", {
        fill: "none",
        stroke: "currentColor",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        "stroke-width": "2"
      }, [
        Q("circle", {
          cx: "12",
          cy: "12",
          r: "4"
        }),
        Q("path", { d: "M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" })
      ], -1)
    ])]);
  }
  const fc = /* @__PURE__ */ ut(cc, [["render", dc]]), hc = { class: "uno-r5eg4i" }, bc = { class: "uno-bzl8yv" }, gc = { class: "uno-sol10l" }, mc = { class: "uno-0qwcsd" }, yc = /* @__PURE__ */ Ct({
    __name: "header",
    props: {
      state: { type: null },
      scheme: { type: Array },
      title: { type: String }
    },
    setup(t) {
      const e = t, n = St(() => e.scheme.find((o) => o.title === "Badge"));
      return (o, r) => (W(), Z("div", hc, [
        Q("div", bc, [
          n.value ? (W(), He(ic, {
            key: 0,
            state: e.state,
            group: n.value
          }, null, 8, ["state", "group"])) : Ne("", true),
          Q("span", gc, Le(t.title), 1)
        ]),
        Q("div", mc, [
          rt(fc, {
            class: "uno-nm789l",
            onClick: r[0] || (r[0] = (i) => e.state.darkmode = !e.state.darkmode)
          }),
          rt(lc, {
            class: "uno-nm789l",
            onClick: r[1] || (r[1] = (i) => e.state.collapsed = !e.state.collapsed)
          })
        ])
      ]));
    }
  }), _c = '*,:before,:after{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }::backdrop{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:var(--un-default-border-color, #e5e7eb)}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,[type=button],[type=reset],[type=submit]{-webkit-appearance:button;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}.uno-0qwcsd{display:flex!important;gap:8px!important}.uno-bzl8yv{display:flex!important;align-items:center!important;gap:8px!important}.uno-r5eg4i{display:flex!important;-webkit-user-select:none!important;user-select:none!important;align-items:center!important;justify-content:space-between!important;border-bottom-width:2px!important;--un-border-opacity:1 !important;border-color:rgb(0 0 0 / var(--un-border-opacity))!important;--un-bg-opacity:1 !important;background-color:rgb(255 255 255 / var(--un-bg-opacity))!important;padding:8px!important;font-size:18px!important;line-height:28px!important;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke!important;transition-timing-function:cubic-bezier(.4,0,.2,1)!important;transition-duration:.15s!important}.uno-nm789l{cursor:pointer!important;font-size:18px!important;line-height:28px!important;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke!important;transition-timing-function:cubic-bezier(.4,0,.2,1)!important;transition-duration:.15s!important}[data-theme=dark] .uno-r5eg4i{--un-border-opacity:1 !important;border-color:rgb(55 65 81 / var(--un-border-opacity))!important;--un-bg-opacity:1 !important;background-color:rgb(39 39 42 / var(--un-bg-opacity))!important;--un-text-opacity:1 !important;color:rgb(212 212 216 / var(--un-text-opacity))!important}.uno-r5eg4i:hover{--un-bg-opacity:1 !important;background-color:rgb(229 231 235 / var(--un-bg-opacity))!important}[data-theme=dark] .uno-r5eg4i:hover{--un-bg-opacity:1 !important;background-color:rgb(75 85 99 / var(--un-bg-opacity))!important}.uno-sol10l{font-size:16px!important;line-height:24px!important;font-weight:500!important;letter-spacing:.1em!important;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace!important}.uno-nm789l:hover{--un-text-opacity:1 !important;color:rgb(107 114 128 / var(--un-text-opacity))!important}.fixed{position:fixed!important}.bottom-0{bottom:0!important}.left-0{left:0!important}.right-0{right:0!important}.top-0{top:0!important}', vc = /* @__PURE__ */ ut(yc, [["styles", [_c]]]), xc = {}, wc = {
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24"
  };
  function Ec(t, e) {
    return W(), Z("svg", wc, [...e[0] || (e[0] = [
      Q("path", {
        fill: "none",
        stroke: "currentColor",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: "2",
        d: "m6 9l6 6l6-6"
      }, null, -1)
    ])]);
  }
  const kc = /* @__PURE__ */ ut(xc, [["render", Ec]]), Nc = {}, Oc = {
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24"
  };
  function Sc(t, e) {
    return W(), Z("svg", Oc, [...e[0] || (e[0] = [
      Q("path", {
        fill: "none",
        stroke: "currentColor",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: "2",
        d: "m18 15l-6-6l-6 6"
      }, null, -1)
    ])]);
  }
  const Cc = /* @__PURE__ */ ut(Nc, [["render", Sc]]), Dc = /* @__PURE__ */ Ct({
    __name: "chevron",
    props: {
      collapsed: { type: Boolean }
    },
    setup(t) {
      const e = t, n = St(() => e.collapsed ? kc : Cc);
      return (o, r) => (W(), He(us(n.value), { class: "uno-iyw1ix text---muted-foreground" }));
    }
  }), zc = '*,:before,:after{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }::backdrop{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:var(--un-default-border-color, #e5e7eb)}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,[type=button],[type=reset],[type=submit]{-webkit-appearance:button;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}.uno-iyw1ix{font-size:14px!important;line-height:20px!important}.fixed{position:fixed!important}.bottom-0{bottom:0!important}.left-0{left:0!important}.right-0{right:0!important}.top-0{top:0!important}', Vc = /* @__PURE__ */ ut(Dc, [["styles", [zc]]]), Mc = { class: "uno-e7a42m" }, Tc = /* @__PURE__ */ Ct({
    __name: "button",
    props: {
      state: { type: null },
      element: { type: Object }
    },
    setup(t) {
      const e = t;
      return (n, o) => (W(), Z("div", Mc, [
        Q("button", {
          type: "button",
          onClick: o[0] || (o[0] = //@ts-ignore
          (...r) => e.element.callback && e.element.callback(...r)),
          class: "uno-ylxvnf"
        }, Le(e.element.name), 1)
      ]));
    }
  }), jc = '*,:before,:after{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }::backdrop{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:var(--un-default-border-color, #e5e7eb)}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,[type=button],[type=reset],[type=submit]{-webkit-appearance:button;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}.uno-e7a42m{grid-column:1/-1!important}.uno-ylxvnf{box-sizing:border-box!important;width:100%!important;cursor:pointer!important;border-width:2px!important;--un-border-opacity:1 !important;border-color:rgb(0 0 0 / var(--un-border-opacity))!important;--un-bg-opacity:1 !important;background-color:rgb(255 255 255 / var(--un-bg-opacity))!important;padding:2px!important;font-size:14px!important;line-height:20px!important;font-weight:500!important;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace!important}[data-theme=dark] .uno-ylxvnf{--un-border-opacity:1 !important;border-color:rgb(39 39 42 / var(--un-border-opacity))!important;--un-bg-opacity:1 !important;background-color:rgb(75 85 99 / var(--un-bg-opacity))!important;--un-text-opacity:1 !important;color:rgb(212 212 216 / var(--un-text-opacity))!important}.uno-ylxvnf:hover{--un-bg-opacity:1 !important;background-color:rgb(0 0 0 / var(--un-bg-opacity))!important;--un-text-opacity:1 !important;color:rgb(255 255 255 / var(--un-text-opacity))!important}[data-theme=dark] .uno-ylxvnf:hover{--un-bg-opacity:1 !important;background-color:rgb(107 114 128 / var(--un-bg-opacity))!important}.fixed{position:fixed!important}.bottom-0{bottom:0!important}.left-0{left:0!important}.right-0{right:0!important}.top-0{top:0!important}', $c = /* @__PURE__ */ ut(Tc, [["styles", [jc]]]), Ac = {}, Ic = {
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24"
  };
  function Pc(t, e) {
    return W(), Z("svg", Ic, [...e[0] || (e[0] = [
      Q("path", {
        fill: "none",
        stroke: "currentColor",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: "2",
        d: "M20 6L9 17l-5-5"
      }, null, -1)
    ])]);
  }
  const Rc = /* @__PURE__ */ ut(Ac, [["render", Pc]]), Fc = { class: "uno-g3pt2q" }, Lc = { class: "uno-7ar3e0" }, Uc = /* @__PURE__ */ Ct({
    __name: "input-checkbox",
    props: {
      state: { type: null },
      element: { type: Object }
    },
    setup(t) {
      const e = t, n = St(() => e.element.name);
      return (o, r) => (W(), Z("label", Fc, [
        Re(Q("input", {
          type: "checkbox",
          "onUpdate:modelValue": r[0] || (r[0] = (i) => e.state[n.value] = i),
          class: "peer sr-only"
        }, null, 512), [
          [Wl, e.state[n.value]]
        ]),
        Q("span", Lc, [
          e.state[n.value] ? (W(), He(Rc, {
            key: 0,
            class: "uno-44ork4"
          })) : Ne("", true)
        ])
      ]));
    }
  }), Hc = '*,:before,:after{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }::backdrop{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:var(--un-default-border-color, #e5e7eb)}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,[type=button],[type=reset],[type=submit]{-webkit-appearance:button;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}.uno-g3pt2q{position:relative!important;display:inline-flex!important;cursor:pointer!important;align-items:center!important}.uno-7ar3e0{box-sizing:border-box!important;height:20px!important;width:20px!important;display:flex!important;align-items:center!important;justify-content:center!important;border-width:2px!important;--un-border-opacity:1 !important;border-color:rgb(0 0 0 / var(--un-border-opacity))!important;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke!important;transition-timing-function:cubic-bezier(.4,0,.2,1)!important;transition-duration:.15s!important}.peer:checked~.uno-44ork4{display:block!important}.peer:checked~.uno-7ar3e0{--un-bg-opacity:1 !important;background-color:rgb(0 0 0 / var(--un-bg-opacity))!important}[data-theme=dark] .peer:checked~.uno-7ar3e0{--un-bg-opacity:1 !important;background-color:rgb(55 65 81 / var(--un-bg-opacity))!important}.uno-44ork4{stroke-width:2px!important;font-size:14px!important;line-height:20px!important;--un-text-opacity:1 !important;color:rgb(0 0 0 / var(--un-text-opacity))!important}.sr-only{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border-width:0!important}.fixed{position:fixed!important}.bottom-0{bottom:0!important}.left-0{left:0!important}.right-0{right:0!important}.top-0{top:0!important}', Bc = /* @__PURE__ */ ut(Uc, [["styles", [Hc]]]), Kc = ["placeholder", "min", "max", "step"], Wc = /* @__PURE__ */ Ct({
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
      }, null, 8, Kc)), [
        [pn, e.state[n.value]]
      ]);
    }
  }), qc = '*,:before,:after{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }::backdrop{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:var(--un-default-border-color, #e5e7eb)}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,[type=button],[type=reset],[type=submit]{-webkit-appearance:button;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}.uno-dzm8ko{box-sizing:border-box!important;width:100%!important;border-width:2px!important;--un-border-opacity:1 !important;border-color:rgb(0 0 0 / var(--un-border-opacity))!important;padding:4px!important;font-size:14px!important;line-height:20px!important;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke!important;transition-timing-function:cubic-bezier(.4,0,.2,1)!important;transition-duration:.15s!important}[data-theme=dark] .uno-dzm8ko{--un-bg-opacity:1 !important;background-color:rgb(63 63 70 / var(--un-bg-opacity))!important;--un-text-opacity:1 !important;color:rgb(212 212 216 / var(--un-text-opacity))!important}[data-theme=dark] .uno-dzm8ko:hover{--un-bg-opacity:1 !important;background-color:rgb(82 82 91 / var(--un-bg-opacity))!important}.uno-dzm8ko:focus{--un-bg-opacity:1 !important;background-color:rgb(254 252 232 / var(--un-bg-opacity))!important;outline:2px solid transparent!important;outline-offset:2px!important}[data-theme=dark] .uno-dzm8ko:focus{--un-bg-opacity:1 !important;background-color:rgb(63 63 70 / var(--un-bg-opacity))!important;--un-outline-color-opacity:1 !important;outline-color:rgb(75 85 99 / var(--un-outline-color-opacity))!important}.fixed{position:fixed!important}.bottom-0{bottom:0!important}.left-0{left:0!important}.right-0{right:0!important}.top-0{top:0!important}', Gc = /* @__PURE__ */ ut(Wc, [["styles", [qc]]]), Jc = { class: "uno-c9kunu" }, Yc = /* @__PURE__ */ Ct({
    __name: "input-range",
    props: {
      state: { type: null },
      element: { type: Object }
    },
    setup(t) {
      const e = t, n = St(() => e.element.name);
      return (o, r) => (W(), Z("div", Jc, [
        Re(Q("input", {
          type: "range",
          min: "0",
          max: "100",
          "onUpdate:modelValue": r[0] || (r[0] = (i) => e.state[n.value] = i),
          style: { width: "calc(100% - 30px)" },
          oninput: "this.nextElementSibling.value = this.value"
        }, null, 512), [
          [pn, e.state[n.value]]
        ]),
        Re(Q("input", {
          type: "number",
          "onUpdate:modelValue": r[1] || (r[1] = (i) => e.state[n.value] = i),
          class: "uno-56kyll",
          oninput: "this.previousElementSibling.value = this.value"
        }, null, 512), [
          [pn, e.state[n.value]]
        ])
      ]));
    }
  }), Xc = "input[type=range][data-v-c9c01bf9]{-webkit-appearance:none;appearance:none;height:5px;background:#000;cursor:pointer}input[type=range][data-v-c9c01bf9]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:12px;height:12px;background:#000;border:2px solid black;cursor:pointer}input[type=range][data-v-c9c01bf9]::-moz-range-thumb{width:13px;height:13px;background:#000;border:none;border-radius:0;cursor:pointer}input[type=number][data-v-c9c01bf9]::-webkit-inner-spin-button{-webkit-appearance:none}", Zc = '*,:before,:after{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }::backdrop{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:var(--un-default-border-color, #e5e7eb)}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,[type=button],[type=reset],[type=submit]{-webkit-appearance:button;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}.uno-56kyll{box-sizing:border-box!important;width:80px!important;border-width:2px!important;--un-border-opacity:1 !important;border-color:rgb(0 0 0 / var(--un-border-opacity))!important;--un-bg-opacity:1 !important;background-color:rgb(255 255 255 / var(--un-bg-opacity))!important;padding:4px!important;text-align:center!important;font-size:14px!important;line-height:20px!important;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke!important;transition-timing-function:cubic-bezier(.4,0,.2,1)!important;transition-duration:.15s!important}.uno-c9kunu{display:flex!important;align-items:center!important;gap:4px!important}[data-theme=dark] .uno-56kyll{--un-bg-opacity:1 !important;background-color:rgb(63 63 70 / var(--un-bg-opacity))!important;--un-text-opacity:1 !important;color:rgb(212 212 216 / var(--un-text-opacity))!important}[data-theme=dark] .uno-56kyll:hover{--un-bg-opacity:1 !important;background-color:rgb(82 82 91 / var(--un-bg-opacity))!important}.uno-56kyll:focus{--un-bg-opacity:1 !important;background-color:rgb(254 252 232 / var(--un-bg-opacity))!important;outline:2px solid transparent!important;outline-offset:2px!important}[data-theme=dark] .uno-56kyll:focus{--un-bg-opacity:1 !important;background-color:rgb(63 63 70 / var(--un-bg-opacity))!important;--un-outline-color-opacity:1 !important;outline-color:rgb(75 85 99 / var(--un-outline-color-opacity))!important}.fixed{position:fixed!important}.bottom-0{bottom:0!important}.left-0{left:0!important}.right-0{right:0!important}.top-0{top:0!important}.border{border-width:1px!important}', Qc = /* @__PURE__ */ ut(Yc, [["styles", [Xc, Zc]], ["__scopeId", "data-v-c9c01bf9"]]), tp = ["placeholder"], ep = /* @__PURE__ */ Ct({
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
      }, null, 8, tp)), [
        [pn, e.state[n.value]]
      ]);
    }
  }), np = '*,:before,:after{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }::backdrop{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:var(--un-default-border-color, #e5e7eb)}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,[type=button],[type=reset],[type=submit]{-webkit-appearance:button;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}.uno-dqkii9{box-sizing:border-box!important;width:100%!important;border-width:2px!important;--un-border-opacity:1 !important;border-color:rgb(0 0 0 / var(--un-border-opacity))!important;--un-bg-opacity:1 !important;background-color:rgb(255 255 255 / var(--un-bg-opacity))!important;padding:4px!important;font-size:14px!important;line-height:20px!important;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace!important;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke!important;transition-timing-function:cubic-bezier(.4,0,.2,1)!important;transition-duration:.15s!important}[data-theme=dark] .uno-dqkii9{--un-bg-opacity:1 !important;background-color:rgb(63 63 70 / var(--un-bg-opacity))!important;--un-text-opacity:1 !important;color:rgb(212 212 216 / var(--un-text-opacity))!important}.uno-dqkii9:hover{--un-bg-opacity:1 !important;background-color:rgb(243 244 246 / var(--un-bg-opacity))!important}[data-theme=dark] .uno-dqkii9:hover{--un-bg-opacity:1 !important;background-color:rgb(82 82 91 / var(--un-bg-opacity))!important}.uno-dqkii9:focus{--un-bg-opacity:1 !important;background-color:rgb(254 252 232 / var(--un-bg-opacity))!important;outline:2px solid transparent!important;outline-offset:2px!important}[data-theme=dark] .uno-dqkii9:focus{--un-bg-opacity:1 !important;background-color:rgb(63 63 70 / var(--un-bg-opacity))!important;--un-outline-color-opacity:1 !important;outline-color:rgb(75 85 99 / var(--un-outline-color-opacity))!important}.fixed{position:fixed!important}.bottom-0{bottom:0!important}.left-0{left:0!important}.right-0{right:0!important}.top-0{top:0!important}', op = /* @__PURE__ */ ut(ep, [["styles", [np]]]), rp = { class: "uno-qryapb" }, ip = {
    key: 0,
    class: "uno-bqvokc"
  }, sp = ["onUpdate:modelValue", "onInput", "onKeydown", "onBlur"], ap = /* @__PURE__ */ Ct({
    __name: "input-time",
    props: {
      state: { type: null },
      element: { type: Object }
    },
    setup(t) {
      const e = t, n = {
        h: { max: 99, value: Ce("00"), inputRef: Ce() },
        m: { max: 59, value: Ce("00"), inputRef: Ce() },
        s: { max: 59, value: Ce("00"), inputRef: Ce() }
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
      $e(
        () => e.state[e.element.name],
        (u) => {
          typeof u == "number" && u !== r.value && (r.value = u);
        },
        { immediate: true }
      );
      const i = (u, h) => {
        let c = u.target.value.replace(/\D/g, "");
        c.length > 2 && (c = c.slice(-2)), parseInt(c) > n[h].max && (c = n[h].max.toString()), n[h].value.value = c, e.state[e.element.name] = r.value;
      }, s = (u) => {
        n[u].value.value = o(n[u].value.value || 0);
      }, a2 = (u, h) => {
        u.key === "Backspace" && (u.preventDefault(), n[h].value.value = "00");
      };
      return (u, h) => (W(), Z("div", rp, [
        (W(), Z(pt, null, pr(n, (d, c, g) => (W(), Z(pt, { key: c }, [
          g > 0 ? (W(), Z("span", ip, ":")) : Ne("", true),
          Re(Q("input", {
            ref_for: true,
            ref: (x2) => d.inputRef.value = x2,
            "onUpdate:modelValue": (x2) => d.value.value = x2,
            type: "text",
            placeholder: "00",
            class: "uno-z921r7",
            onInput: (x2) => i(x2, c),
            onKeydown: (x2) => a2(x2, c),
            onBlur: (x2) => s(c)
          }, null, 40, sp), [
            [pn, d.value.value]
          ])
        ], 64))), 64))
      ]));
    }
  }), up = '*,:before,:after{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }::backdrop{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:var(--un-default-border-color, #e5e7eb)}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,[type=button],[type=reset],[type=submit]{-webkit-appearance:button;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}.uno-bqvokc{margin-left:2px!important;margin-right:2px!important;-webkit-user-select:none!important;user-select:none!important;--un-text-opacity:1 !important;color:rgb(148 163 184 / var(--un-text-opacity))!important;font-weight:700!important}.uno-qryapb{box-sizing:border-box!important;width:136px!important;display:flex!important;justify-content:center!important;border-width:2px!important;--un-border-opacity:1 !important;border-color:rgb(0 0 0 / var(--un-border-opacity))!important;--un-bg-opacity:1 !important;background-color:rgb(255 255 255 / var(--un-bg-opacity))!important;padding:2px!important;font-size:14px!important;line-height:20px!important;transition-property:all!important;transition-timing-function:cubic-bezier(.4,0,.2,1)!important;transition-duration:.15s!important}.uno-z921r7{width:28px!important;text-align:center!important}.uno-qryapb:focus-within{--un-border-opacity:1 !important;border-color:rgb(107 114 128 / var(--un-border-opacity))!important;--un-ring-width:1px !important;--un-ring-offset-shadow:var(--un-ring-inset) 0 0 0 var(--un-ring-offset-width) var(--un-ring-offset-color) !important;--un-ring-shadow:var(--un-ring-inset) 0 0 0 calc(var(--un-ring-width) + var(--un-ring-offset-width)) var(--un-ring-color) !important;box-shadow:var(--un-ring-offset-shadow),var(--un-ring-shadow),var(--un-shadow)!important}[data-theme=dark] .uno-qryapb{--un-bg-opacity:1 !important;background-color:rgb(55 65 81 / var(--un-bg-opacity))!important}[data-theme=dark] .uno-z921r7{background-color:transparent!important;--un-text-opacity:1 !important;color:rgb(203 213 225 / var(--un-text-opacity))!important}.uno-z921r7:focus{background-color:transparent!important;outline:2px solid transparent!important;outline-offset:2px!important}.fixed{position:fixed!important}.bottom-0{bottom:0!important}.left-0{left:0!important}.right-0{right:0!important}.top-0{top:0!important}', lp = /* @__PURE__ */ ut(ap, [["styles", [up]]]), cp = { class: "uno-4jm9gl" }, pp = /* @__PURE__ */ Ct({
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
      return (r, i) => (W(), Z(pt, null, [
        Q("label", cp, Le(e.element.label), 1),
        (W(), He(us(o.value), {
          element: e.element,
          state: e.state
        }, null, 8, ["element", "state"]))
      ], 64));
    }
  }), dp = '*,:before,:after{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }::backdrop{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:var(--un-default-border-color, #e5e7eb)}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,[type=button],[type=reset],[type=submit]{-webkit-appearance:button;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}.uno-4jm9gl{justify-self:start!important;text-align:left!important;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace!important}.fixed{position:fixed!important}.bottom-0{bottom:0!important}.left-0{left:0!important}.right-0{right:0!important}.top-0{top:0!important}', fp = /* @__PURE__ */ ut(pp, [["styles", [dp]]]), hp = { class: "uno-cz9i6p" }, bp = { class: "uno-hx8m6u text-mono" }, gp = { class: "uno-3o9hie" }, mp = /* @__PURE__ */ Ct({
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
      return (r, i) => (W(), Z("div", hp, [
        Q("div", {
          onClick: n,
          class: "uno-ux4grt"
        }, [
          rt(Vc, {
            collapsed: !o.value
          }, null, 8, ["collapsed"]),
          Q("span", bp, Le(e.group.title), 1)
        ]),
        o.value ? Ne("", true) : (W(true), Z(pt, { key: 0 }, pr(e.group.content, (s) => (W(), Z("div", gp, [
          rt(fp, {
            state: e.state,
            element: s
          }, null, 8, ["state", "element"])
        ]))), 256))
      ]));
    }
  }), yp = '*,:before,:after{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }::backdrop{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:var(--un-default-border-color, #e5e7eb)}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,[type=button],[type=reset],[type=submit]{-webkit-appearance:button;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}.uno-3o9hie{display:grid!important;grid-template-columns:88px 1fr!important;align-items:center!important;gap:8px!important;padding:8px!important;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace!important}.uno-cz9i6p{margin-bottom:8px!important;border-width:2px!important;--un-border-opacity:1 !important;border-color:rgb(0 0 0 / var(--un-border-opacity))!important;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke!important;transition-timing-function:cubic-bezier(.4,0,.2,1)!important;transition-duration:.15s!important}.uno-cz9i6p:last-child{margin-bottom:0!important}.uno-ux4grt{display:flex!important;cursor:pointer!important;align-items:center!important;gap:4px!important;border-bottom-width:2px!important;--un-border-opacity:1 !important;border-color:rgb(0 0 0 / var(--un-border-opacity))!important;--un-bg-opacity:1 !important;background-color:rgb(249 250 251 / var(--un-bg-opacity))!important;padding:4px!important;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace!important;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke!important;transition-timing-function:cubic-bezier(.4,0,.2,1)!important;transition-duration:.15s!important}[data-theme=dark] .uno-3o9hie,[data-theme=dark] .uno-cz9i6p,[data-theme=dark] .uno-ux4grt{--un-border-opacity:1 !important;border-color:rgb(55 65 81 / var(--un-border-opacity))!important;--un-bg-opacity:1 !important;background-color:rgb(39 39 42 / var(--un-bg-opacity))!important;--un-text-opacity:1 !important;color:rgb(212 212 216 / var(--un-text-opacity))!important}[data-theme=dark] .uno-cz9i6p:hover{--un-bg-opacity:1 !important;background-color:rgb(75 85 99 / var(--un-bg-opacity))!important}.uno-ux4grt:hover{--un-bg-opacity:1 !important;background-color:rgb(229 231 235 / var(--un-bg-opacity))!important}[data-theme=dark] .uno-ux4grt:hover{--un-bg-opacity:1 !important;background-color:rgb(75 85 99 / var(--un-bg-opacity))!important}.uno-cz9i6p>*{font-size:14px!important;line-height:20px!important;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace!important}.uno-hx8m6u{font-size:14px!important;line-height:20px!important;font-weight:500!important}.fixed{position:fixed!important}.bottom-0{bottom:0!important}.left-0{left:0!important}.right-0{right:0!important}.top-0{top:0!important}', _p = /* @__PURE__ */ ut(mp, [["styles", [yp]]]), vp = ["data-theme"], xp = { class: "uno-ap5vao" }, wp = {
    key: 0,
    class: "uno-fsiqeh"
  }, Ep = /* @__PURE__ */ Ct({
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
      }, [
        Q("div", xp, [
          rt(vc, {
            state: e.state,
            scheme: e.scheme,
            title: t.title
          }, null, 8, ["state", "scheme", "title"]),
          e.state.collapsed ? Ne("", true) : (W(), Z("div", wp, [
            (W(true), Z(pt, null, pr(n.value, (i) => (W(), He(_p, {
              state: e.state,
              group: i
            }, null, 8, ["state", "group"]))), 256))
          ]))
        ])
      ], 8, vp)) : Ne("", true);
    }
  }), kp = '*,:before,:after{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }::backdrop{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:var(--un-default-border-color, #e5e7eb)}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,[type=button],[type=reset],[type=submit]{-webkit-appearance:button;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}.uno-ap5vao{margin:8px!important;width:340px!important;max-height:472px!important;display:flex!important;flex-direction:column!important;border-width:2px!important;--un-border-opacity:1 !important;border-color:rgb(0 0 0 / var(--un-border-opacity))!important;font-size:14px!important;line-height:20px!important;--un-text-opacity:1 !important;color:rgb(0 0 0 / var(--un-text-opacity))!important;--un-shadow:4px 4px 0px 0px var(--un-shadow-color, rgba(0, 0, 0, 1)) !important;box-shadow:var(--un-ring-offset-shadow),var(--un-ring-shadow),var(--un-shadow)!important}.uno-fsiqeh{flex:1 1 0%!important;overflow-y:auto!important;--un-bg-opacity:1 !important;background-color:rgb(255 255 255 / var(--un-bg-opacity))!important;padding:8px!important}[data-theme=dark] .uno-ap5vao{--un-border-opacity:1 !important;border-color:rgb(55 65 81 / var(--un-border-opacity))!important}[data-theme=dark] .uno-fsiqeh{--un-border-opacity:1 !important;border-color:rgb(55 65 81 / var(--un-border-opacity))!important;--un-bg-opacity:1 !important;background-color:rgb(39 39 42 / var(--un-bg-opacity))!important}.fixed{position:fixed!important}.bottom-0{bottom:0!important}.left-0{left:0!important}.right-0{right:0!important}.top-0{top:0!important}.z-9999999{z-index:9999999!important}', On = /* @__PURE__ */ ut(Ep, [["styles", [kp]]]);
  var Uo = function(t, e) {
    return Uo = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(n, o) {
      n.__proto__ = o;
    } || function(n, o) {
      for (var r in o) Object.prototype.hasOwnProperty.call(o, r) && (n[r] = o[r]);
    }, Uo(t, e);
  };
  function lo(t, e) {
    if (typeof e != "function" && e !== null)
      throw new TypeError("Class extends value " + String(e) + " is not a constructor or null");
    Uo(t, e);
    function n() {
      this.constructor = t;
    }
    t.prototype = e === null ? Object.create(e) : (n.prototype = e.prototype, new n());
  }
  function Ho(t) {
    var e = typeof Symbol == "function" && Symbol.iterator, n = e && t[e], o = 0;
    if (n) return n.call(t);
    if (t && typeof t.length == "number") return {
      next: function() {
        return t && o >= t.length && (t = void 0), { value: t && t[o++], done: !t };
      }
    };
    throw new TypeError(e ? "Object is not iterable." : "Symbol.iterator is not defined.");
  }
  function Bo(t, e) {
    var n = typeof Symbol == "function" && t[Symbol.iterator];
    if (!n) return t;
    var o = n.call(t), r, i = [], s;
    try {
      for (; (e === void 0 || e-- > 0) && !(r = o.next()).done; ) i.push(r.value);
    } catch (a2) {
      s = { error: a2 };
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
    if (arguments.length === 2) for (var o = 0, r = e.length, i; o < r; o++)
      (i || !(o in e)) && (i || (i = Array.prototype.slice.call(e, 0, o)), i[o] = e[o]);
    return t.concat(i || Array.prototype.slice.call(e));
  }
  function ne(t) {
    return typeof t == "function";
  }
  function Is(t) {
    var e = function(o) {
      Error.call(o), o.stack = new Error().stack;
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
      this.initialTeardown = e, this.closed = false, this._parentage = null, this._finalizers = null;
    }
    return t.prototype.unsubscribe = function() {
      var e, n, o, r, i;
      if (!this.closed) {
        this.closed = true;
        var s = this._parentage;
        if (s)
          if (this._parentage = null, Array.isArray(s))
            try {
              for (var a2 = Ho(s), u = a2.next(); !u.done; u = a2.next()) {
                var h = u.value;
                h.remove(this);
              }
            } catch (S) {
              e = { error: S };
            } finally {
              try {
                u && !u.done && (n = a2.return) && n.call(a2);
              } finally {
                if (e) throw e.error;
              }
            }
          else
            s.remove(this);
        var d = this.initialTeardown;
        if (ne(d))
          try {
            d();
          } catch (S) {
            i = S instanceof No ? S.errors : [S];
          }
        var c = this._finalizers;
        if (c) {
          this._finalizers = null;
          try {
            for (var g = Ho(c), x2 = g.next(); !x2.done; x2 = g.next()) {
              var T2 = x2.value;
              try {
                hi(T2);
              } catch (S) {
                i = i ?? [], S instanceof No ? i = Ko(Ko([], Bo(i)), Bo(S.errors)) : i.push(S);
              }
            }
          } catch (S) {
            o = { error: S };
          } finally {
            try {
              x2 && !x2.done && (r = g.return) && r.call(g);
            } finally {
              if (o) throw o.error;
            }
          }
        }
        if (i)
          throw new No(i);
      }
    }, t.prototype.add = function(e) {
      var n;
      if (e && e !== this)
        if (this.closed)
          hi(e);
        else {
          if (e instanceof t) {
            if (e.closed || e._hasParent(this))
              return;
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
      return e.closed = true, e;
    })(), t;
  })(), Ps = co.EMPTY;
  function Rs(t) {
    return t instanceof co || t && "closed" in t && ne(t.remove) && ne(t.add) && ne(t.unsubscribe);
  }
  function hi(t) {
    ne(t) ? t() : t.unsubscribe();
  }
  var Np = {
    Promise: void 0
  }, Op = {
    setTimeout: function(t, e) {
      for (var n = [], o = 2; o < arguments.length; o++)
        n[o - 2] = arguments[o];
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
  function bi() {
  }
  function An(t) {
    t();
  }
  var Fs = (function(t) {
    lo(e, t);
    function e(n) {
      var o = t.call(this) || this;
      return o.isStopped = false, n ? (o.destination = n, Rs(n) && n.add(o)) : o.destination = zp, o;
    }
    return e.create = function(n, o, r) {
      return new qo(n, o, r);
    }, e.prototype.next = function(n) {
      this.isStopped || this._next(n);
    }, e.prototype.error = function(n) {
      this.isStopped || (this.isStopped = true, this._error(n));
    }, e.prototype.complete = function() {
      this.isStopped || (this.isStopped = true, this._complete());
    }, e.prototype.unsubscribe = function() {
      this.closed || (this.isStopped = true, t.prototype.unsubscribe.call(this), this.destination = null);
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
  })(co), Cp = (function() {
    function t(e) {
      this.partialObserver = e;
    }
    return t.prototype.next = function(e) {
      var n = this.partialObserver;
      if (n.next)
        try {
          n.next(e);
        } catch (o) {
          Sn(o);
        }
    }, t.prototype.error = function(e) {
      var n = this.partialObserver;
      if (n.error)
        try {
          n.error(e);
        } catch (o) {
          Sn(o);
        }
      else
        Sn(e);
    }, t.prototype.complete = function() {
      var e = this.partialObserver;
      if (e.complete)
        try {
          e.complete();
        } catch (n) {
          Sn(n);
        }
    }, t;
  })(), qo = (function(t) {
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
    closed: true,
    next: bi,
    error: Dp,
    complete: bi
  }, Vp = (function() {
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
        var s = r, a2 = s.operator, u = s.source;
        i.add(a2 ? a2.call(i, u) : u ? r._subscribe(i) : r._trySubscribe(i));
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
          next: function(a2) {
            try {
              e(a2);
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
      for (var e = [], n = 0; n < arguments.length; n++)
        e[n] = arguments[n];
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
  }), Go = (function(t) {
    lo(e, t);
    function e() {
      var n = t.call(this) || this;
      return n.closed = false, n.currentObservers = null, n.observers = [], n.isStopped = false, n.hasError = false, n.thrownError = null, n;
    }
    return e.prototype.lift = function(n) {
      var o = new yi(this, this);
      return o.operator = n, o;
    }, e.prototype._throwIfClosed = function() {
      if (this.closed)
        throw new Ap();
    }, e.prototype.next = function(n) {
      var o = this;
      An(function() {
        var r, i;
        if (o._throwIfClosed(), !o.isStopped) {
          o.currentObservers || (o.currentObservers = Array.from(o.observers));
          try {
            for (var s = Ho(o.currentObservers), a2 = s.next(); !a2.done; a2 = s.next()) {
              var u = a2.value;
              u.next(n);
            }
          } catch (h) {
            r = { error: h };
          } finally {
            try {
              a2 && !a2.done && (i = s.return) && i.call(s);
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
          o.hasError = o.isStopped = true, o.thrownError = n;
          for (var r = o.observers; r.length; )
            r.shift().error(n);
        }
      });
    }, e.prototype.complete = function() {
      var n = this;
      An(function() {
        if (n._throwIfClosed(), !n.isStopped) {
          n.isStopped = true;
          for (var o = n.observers; o.length; )
            o.shift().complete();
        }
      });
    }, e.prototype.unsubscribe = function() {
      this.isStopped = this.closed = true, this.observers = this.currentObservers = null;
    }, Object.defineProperty(e.prototype, "observed", {
      get: function() {
        var n;
        return ((n = this.observers) === null || n === void 0 ? void 0 : n.length) > 0;
      },
      enumerable: false,
      configurable: true
    }), e.prototype._trySubscribe = function(n) {
      return this._throwIfClosed(), t.prototype._trySubscribe.call(this, n);
    }, e.prototype._subscribe = function(n) {
      return this._throwIfClosed(), this._checkFinalizedStatuses(n), this._innerSubscribe(n);
    }, e.prototype._innerSubscribe = function(n) {
      var o = this, r = this, i = r.hasError, s = r.isStopped, a2 = r.observers;
      return i || s ? Ps : (this.currentObservers = null, a2.push(n), new co(function() {
        o.currentObservers = null, Wo(a2, n);
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
  })(gi), yi = (function(t) {
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
    const n = new Set(Object.getOwnPropertyNames(t)), o = new Set(Object.getOwnPropertyNames(e)), r = n.difference(o).values().toArray(), i = o.difference(n).values().toArray();
    return { d1: r, d2: i };
  }
  function Pp(t, e) {
    return ((n) => Number.isNaN(n) ? e : n)(parseInt(t));
  }
  const Rp = {
    enabled: true,
    collapsed: false,
    darkmode: true
  }, Fp = "state_acephale";
  class Lp {
    constructor(e, n = Fp) {
      __publicField(this, "state");
      __publicField(this, "watchStopHandler");
      __publicField(this, "setFromLocalStorage", () => {
        const e = localStorage.getItem(this.key);
        if (e !== null) {
          const n = JSON.parse(e);
          Object.assign(this.state, n);
        }
      });
      this.key = n, this.key = n, this.state = bn(e), this.sync(), this.watchStopHandler = this.watchPersistence();
    }
    dispose() {
      this.watchStopHandler(), window.removeEventListener("focus", this.setFromLocalStorage), document.removeEventListener("visibilitychange", this.setFromLocalStorage);
    }
    sync() {
      this.setFromLocalStorage(), window.addEventListener("focus", this.setFromLocalStorage), document.addEventListener("visibilitychange", this.setFromLocalStorage);
    }
    watchPersistence() {
      return $e(
        this.state,
        () => {
          this.saveToLocalStorage();
        },
        { immediate: false, deep: true }
      );
    }
    get persistentOnly() {
      const e = Object.keys(this.state).filter(
        (o) => !o.startsWith("$")
      );
      return Object.assign(
        {},
        ...e.map((o) => ({ [o]: this.state[o] }))
      );
    }
    saveToLocalStorage() {
      localStorage.setItem(this.key, JSON.stringify(this.persistentOnly));
    }
  }
  class Up {
    constructor(e) {
      __publicField(this, "state");
      __publicField(this, "stateSubject", new Go());
      __publicField(this, "eventSubject", new Go());
      const n = Object.assign({}, Rp, e);
      this.state = new Lp({}).state, this.parseState(n);
    }
    add(e, n, o, r) {
      return this.state[e] = e in this.state ? this.state[e] : n, $e(
        () => this.state[e],
        (i, s) => {
          r !== false && typeof n == "number" && (this.state[e] = Pp(i, s));
          const a2 = typeof o == "string" ? o : e;
          this.stateSubject.next({ [a2]: this.state[a2] });
        },
        { deep: true }
      ), this;
    }
    parseState(e) {
      Object.entries(e).forEach(([n, o]) => {
        typeof o == "object" ? this.add(n, o.value, o.watch) : this.add(n, o);
      });
    }
  }
  class Hp {
    constructor(e, n) {
      __publicField(this, "name");
      __publicField(this, "value");
      __publicField(this, "watch");
      __publicField(this, "step");
      __publicField(this, "min");
      __publicField(this, "max");
      __publicField(this, "vif");
      __publicField(this, "text");
      __publicField(this, "type", "div");
      __publicField(this, "label");
      __publicField(this, "placeholder");
      __publicField(this, "id");
      const { d2: o } = Ip(this, e);
      Object.assign(this, e), this.parseModel(o), this.parseType(n), this.parseLabel(), this.id = this.name || window.crypto.randomUUID();
    }
    parseType(e) {
      if (this.type === "div")
        if (this.value !== void 0) {
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
  }
  class _r {
    constructor(e, n = new Up({})) {
      __publicField(this, "parsedScheme");
      this.scheme = e, this.store = n, this.parsedScheme = this.parseScheme();
    }
    static parse(...e) {
      const { parsedScheme: n, store: o } = new _r(...e);
      return { scheme: n, store: o };
    }
    parseSchemeElement(e) {
      this.parseStatePropsFromModel(e), this.parseStatePropsFromExpressions(e.text), this.parseStatePropsFromExpressions(e.vif);
    }
    parseStatePropsFromModel(e) {
      const { name: n, value: o } = e;
      n === void 0 || o === void 0 || typeof o == "function" || (this.store.add(n, o), e.value = this.store.state[n]);
    }
    parseStatePropsFromExpressions(e) {
      var _a3;
      e && ((_a3 = e.match(/state\.\$?\w+/g)) == null ? void 0 : _a3.forEach((n) => {
        const o = n.replace("state.", "");
        this.store.add(o, "", void 0, false);
      }));
    }
    parseScheme() {
      const n = this.scheme.map(
        (o, r) => {
          const i = {
            content: [],
            collapsed: false,
            title: "",
            id: `section ${r}`
          };
          if (o.content) {
            const s = {
              ...i,
              ...o
            };
            return s.title.length > 0 && (s.id = s.title), this.store.add(s.id, s.collapsed), s;
          } else
            return this.store.add(i.id, i.collapsed), i;
        }
      ).map(
        (o) => {
          const { content: r, ...i } = o;
          return { content: r.map(
            (a2) => new Hp(a2, this.store.eventSubject)
          ), ...i };
        }
      );
      return n.forEach((o) => {
        o.content.forEach((r) => {
          this.parseSchemeElement(r);
        });
      }), n;
    }
  }
  class Kp {
    constructor(e, n, o = "Config") {
      __publicField(this, "element");
      const r = _r.parse(e, n);
      this.element = this.createCustomElement(), Object.assign(this.element, {
        state: n.state,
        scheme: r.scheme,
        title: o
      }), document.body.appendChild(this.element);
    }
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
      }), i = Lo({
        render() {
          return xl(On, r);
        }
      });
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
        remove: {
          value: () => {
            i.unmount(), Element.prototype.remove.call(e);
          }
        }
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
    dispose() {
      this.element.remove();
    }
  }
  function Wp(t, e = []) {
    return t.filter((r) => !(typeof r == "string" && t.find((i) => typeof i != "string" && i.title === r))).map((r) => {
      if (typeof r == "string")
        return e.find((s) => s.title === r);
      const i = e.find(
        (s) => s.title === r.title
      );
      if (Array.isArray(r.content) && i) {
        const s = { ...i };
        return s.content = [
          ...s.content,
          ...r.content
        ], s;
      }
      return r;
    });
  }
  const DefaultScheme = [
    {
      title: "Title Filter",
      collapsed: true,
      content: [
        { filterExclude: false, label: "exclude" },
        {
          filterExcludeWords: "",
          label: "keywords",
          watch: "filterExclude",
          placeholder: "word, f:full_word, r:RegEx..."
        },
        { filterInclude: false, label: "include" },
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
        { filterUploaderExclude: false, label: "exclude" },
        {
          filterUploaderExcludeWords: "",
          label: "keywords",
          watch: "filterUploaderExclude",
          placeholder: "word, f:full_word, r:RegEx..."
        },
        { filterUploaderInclude: false, label: "include" },
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
        { filterDuration: false, label: "enable" },
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
      content: [
        {
          "sort by views": () => {
          }
        },
        {
          "sort by duration": () => {
          }
        }
      ]
    },
    {
      title: "Sort By Duration",
      collapsed: true,
      content: [
        {
          "sort by duration": () => {
          }
        }
      ]
    },
    {
      title: "Sort By Views",
      collapsed: true,
      content: [
        {
          "sort by views": () => {
          }
        }
      ]
    },
    {
      title: "Privacy Filter",
      collapsed: true,
      content: [
        { filterPrivate: false, label: "private" },
        { filterPublic: false, label: "public" },
        { "check access 🔓": () => {
        } }
      ]
    },
    {
      title: "HD Filter",
      content: [
        { filterHD: false, label: "hd" },
        { filterNonHD: false, label: "non-hd" }
      ]
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
        {
          reset: () => {
            localStorage.removeItem("state_acephale");
          }
        }
      ]
    },
    {
      title: "Badge",
      content: [
        {
          text: "return `${state.$paginationOffset}/${state.$paginationLast}`",
          vif: "return state.$paginationLast > 1"
        }
      ]
    }
  ];
  const StoreStateDefault = {
    enabled: true,
    collapsed: false,
    darkmode: true,
    $paginationLast: 1,
    $paginationOffset: 1
  };
  class JabronioGuiController {
    constructor(store, dataManager) {
      __publicField(this, "destroy$", new Subject());
      __publicField(this, "directionalEventObservable$");
      __publicField(this, "eventsMap", {
        "sort by duration": (direction) => this.dataManager.sortBy("duration", direction),
        "sort by views": (direction) => this.dataManager.sortBy("views", direction)
      });
      this.store = store;
      this.dataManager = dataManager;
      this.directionalEventObservable$ = this.directionalEvent();
      this.setupStoreListeners();
    }
    dispose() {
      this.destroy$.next();
      this.destroy$.complete();
    }
    directionalEvent() {
      return this.store.eventSubject.pipe(
        scan(
          (acc, value) => ({
            type: value,
            direction: acc.type === value ? !acc.direction : true
          }),
          { type: void 0, direction: true }
        ),
        map(({ type, direction }) => ({
          type,
          direction
        })),
        shareReplay(1),
        takeUntil(this.destroy$)
      );
    }
    setupStoreListeners() {
      var _a3;
      (_a3 = this.directionalEventObservable$) == null ? void 0 : _a3.subscribe((e) => {
        var _a4, _b2;
        (_b2 = (_a4 = this.eventsMap)[e.type]) == null ? void 0 : _b2.call(_a4, e.direction);
      });
      this.store.stateSubject.pipe(takeUntil(this.destroy$)).subscribe((a2) => {
        this.dataManager.applyFilters(a2);
      });
    }
  }
  function getSelectorFnsFromScheme(xs2) {
    const keys = xs2.flatMap((s) => {
      const schemeBlock = DefaultScheme.find((e) => e.title === s);
      if (!schemeBlock) return [];
      return schemeBlock.content.flatMap((c) => Object.keys(c));
    });
    return keys.filter((k2) => k2 in defaultDataFilterFns);
  }
  class Rules {
    constructor(options) {
      __publicField(this, "thumbs", {});
      __publicField(this, "thumbsParser");
      __publicField(this, "thumb", {});
      __publicField(this, "thumbDataParser");
      __publicField(this, "thumbImg", {});
      __publicField(this, "thumbImgParser");
      __publicField(this, "containerSelector", ".container");
      __publicField(this, "containerSelectorLast");
      __publicField(this, "intersectionObservableSelector");
      __publicField(this, "paginationStrategyOptions", {});
      __publicField(this, "paginationStrategy");
      __publicField(this, "dataManager");
      __publicField(this, "containerHomogenity");
      __publicField(this, "customDataFilterFns", []);
      __publicField(this, "animatePreview");
      __publicField(this, "storeOptions");
      __publicField(this, "schemeOptions", []);
      __publicField(this, "store");
      __publicField(this, "gui");
      __publicField(this, "inputController");
      __publicField(this, "customGenerator");
      __publicField(this, "infiniteScroller");
      __publicField(this, "getPaginationData");
      __publicField(this, "gropeStrategy", "all-in-one");
      __publicField(this, "containMutationEnabled", true);
      __publicField(this, "mutationObservers", []);
      __publicField(this, "resetOnPaginationOrContainerDeath", true);
      __publicField(this, "onResetCallback");
      if (this.isEmbedded) throw Error("Embedded is not supported");
      Object.assign(this, options);
      this.thumbsParser = ThumbsParser.create(this.thumbs);
      this.thumbDataParser = ThumbDataParser.create(this.thumb);
      this.thumbImgParser = ThumbImgParser.create(this.thumbImg);
      this.paginationStrategy = getPaginationStrategy(this.paginationStrategyOptions);
      this.store = this.createStore();
      this.gui = this.createGui();
      this.hookDataFilterFns();
      this.dataManager = new DataManager(this, this.containerHomogenity);
      this.inputController = new JabronioGuiController(this.store, this.dataManager);
      this.reset();
    }
    get container() {
      if (typeof this.containerSelectorLast === "string") {
        return querySelectorLast(document.body, this.containerSelectorLast);
      }
      if (typeof this.containerSelector === "string") {
        return querySelectorOrSelf(document.body, this.containerSelector);
      }
      return this.containerSelector();
    }
    get intersectionObservable() {
      if (!this.intersectionObservableSelector) return void 0;
      return document.querySelector(this.intersectionObservableSelector);
    }
    get observable() {
      return this.intersectionObservable || this.paginationStrategy.getPaginationElement();
    }
    hookDataFilterFns() {
      const defaultFilterFns = getSelectorFnsFromScheme(
        this.schemeOptions.filter((s) => typeof s === "string")
      );
      this.customDataFilterFns.push(...defaultFilterFns);
    }
    createStore() {
      const config2 = { ...StoreStateDefault, ...this.storeOptions };
      this.store = new Up(config2);
      return this.store;
    }
    createGui() {
      const scheme = Wp(
        this.schemeOptions,
        DefaultScheme
      );
      this.gui = new Kp(scheme, this.store, "PervertMonkey");
      return this.gui;
    }
    resetInfiniteScroller() {
      var _a3;
      (_a3 = this.infiniteScroller) == null ? void 0 : _a3.dispose();
      if (!this.paginationStrategy.hasPagination) return;
      this.infiniteScroller = InfiniteScroller.create(this);
    }
    gropeInit() {
      var _a3;
      if (!this.gropeStrategy) return;
      if (this.gropeStrategy === "all-in-one") {
        (_a3 = this.dataManager) == null ? void 0 : _a3.parseData(this.container, this.container);
      }
      if (this.gropeStrategy === "all-in-all") {
        getCommonParents(this.thumbsParser.getThumbs(document.body)).forEach((c) => {
          this.dataManager.parseData(c, c, true);
        });
      }
    }
    get isEmbedded() {
      return window.self !== window.top;
    }
    resetOn() {
      if (!this.resetOnPaginationOrContainerDeath) return;
      const observables = [
        this.container,
        this.intersectionObservable || this.paginationStrategy.getPaginationElement()
      ].filter(Boolean);
      if (observables.length === 0) return;
      observables.forEach((o) => {
        const observer = waitForElementToDisappear(o, () => {
          this.reset();
        });
        this.mutationObservers.push(observer);
      });
    }
    reset() {
      var _a3, _b2;
      this.mutationObservers.forEach((o) => {
        o.disconnect();
      });
      this.mutationObservers = [];
      this.paginationStrategy = getPaginationStrategy(this.paginationStrategyOptions);
      this.dataManager = new DataManager(this, this.containerHomogenity);
      this.inputController.dispose();
      this.inputController = new JabronioGuiController(this.store, this.dataManager);
      this.resetInfiniteScroller();
      this.container && ((_a3 = this.animatePreview) == null ? void 0 : _a3.call(this, this.container));
      this.gropeInit();
      (_b2 = this.onResetCallback) == null ? void 0 : _b2.call(this);
      this.resetOn();
    }
  }
  exports2.DataFilter = DataFilter;
  exports2.DataManager = DataManager;
  exports2.InfiniteScroller = InfiniteScroller;
  exports2.LazyImgLoader = LazyImgLoader;
  exports2.MOBILE_UA = MOBILE_UA;
  exports2.Observer = Observer;
  exports2.OnHover = OnHover;
  exports2.PaginationStrategy = PaginationStrategy;
  exports2.PaginationStrategyDataParams = PaginationStrategyDataParams;
  exports2.PaginationStrategyPathnameParams = PaginationStrategyPathnameParams;
  exports2.PaginationStrategySearchParams = PaginationStrategySearchParams;
  exports2.RegexFilter = RegexFilter;
  exports2.Rules = Rules;
  exports2.ThumbDataParser = ThumbDataParser;
  exports2.ThumbImgParser = ThumbImgParser;
  exports2.ThumbsParser = ThumbsParser;
  exports2.Tick = Tick;
  exports2.areElementsAlike = areElementsAlike;
  exports2.chunks = chunks;
  exports2.circularShift = circularShift;
  exports2.containMutation = containMutation;
  exports2.copyAttributes = copyAttributes;
  exports2.downloader = downloader;
  exports2.exterminateVideo = exterminateVideo;
  exports2.fetchHtml = fetchHtml;
  exports2.fetchJson = fetchJson;
  exports2.fetchText = fetchText;
  exports2.fetchWith = fetchWith;
  exports2.findNextSibling = findNextSibling;
  exports2.formatTimeToHHMMSS = formatTimeToHHMMSS;
  exports2.getCommonParents = getCommonParents;
  exports2.getPaginationStrategy = getPaginationStrategy;
  exports2.instantiateTemplate = instantiateTemplate;
  exports2.irange = irange;
  exports2.memoize = memoize;
  exports2.objectToFormData = objectToFormData;
  exports2.parseCssUrl = parseCssUrl;
  exports2.parseDataParams = parseDataParams;
  exports2.parseHtml = parseHtml;
  exports2.parseIntegerOr = parseIntegerOr;
  exports2.parseNumericAbbreviation = parseNumericAbbreviation;
  exports2.parseUrl = parseUrl;
  exports2.querySelectorLast = querySelectorLast;
  exports2.querySelectorLastNumber = querySelectorLastNumber;
  exports2.querySelectorOrSelf = querySelectorOrSelf;
  exports2.querySelectorText = querySelectorText;
  exports2.range = range;
  exports2.removeClassesAndDataAttributes = removeClassesAndDataAttributes;
  exports2.replaceElementTag = replaceElementTag;
  exports2.runIdleJob = runIdleJob;
  exports2.sanitizeStr = sanitizeStr;
  exports2.splitWith = splitWith;
  exports2.timeToSeconds = timeToSeconds;
  exports2.wait = wait;
  exports2.waitForElementToAppear = waitForElementToAppear;
  exports2.waitForElementToDisappear = waitForElementToDisappear;
  exports2.watchDomChangesWithThrottle = watchDomChangesWithThrottle;
  exports2.watchElementChildrenCount = watchElementChildrenCount;
  Object.defineProperty(exports2, Symbol.toStringTag, { value: "Module" });
}));
//# sourceMappingURL=pervertmonkey.core.umd.js.map
